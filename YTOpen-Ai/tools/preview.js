import { createRequire } from 'module'
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer');
import fs from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import util from 'util';
import http from 'http';
import https from 'https';

// 将 exec 转换为返回 Promise 的函数，方便使用 async/await
const execAsync = util.promisify(exec);

/**
 * 提取并渲染各类代码块和图片链接
 * @param {string} text - 包含代码块和图片链接的文本
 * @param {Object} options - 渲染配置选项
 * @returns {Promise<Array>} - 返回渲染结果数组
 */
async function extractAndRender(text, options = {}) {
  const {
    outputDir = './output', // 输出目录
    timeout = 70000, // Puppeteer 操作超时时间
    imageTimeout = 20000, // 图片下载超时时间
    additionalScripts = [], // 额外的脚本链接
    additionalStyles = [], // 额外的样式链接
    backendLanguages = ['python', 'java', 'c++', 'c', 'ruby', 'go', 'javascript', 'typescript'], // 后端语言列表
    frontendLanguages = ['html', 'css', 'svg', 'canvas', 'mermaid'], // 前端语言列表
    puppeteerUserDataDir = path.join(process.cwd(), 'puppeteer_user_data') // 指定 Puppeteer 的用户数据目录
  } = options;

  if (typeof text !== 'string') {
    throw new Error('输入必须是字符串');
  }

  // 提取所有图片链接
  const imageLinks = extractImageLinks(text);

  // 提取所有代码块
  const codeBlocks = extractCodeBlocks(text);

  if (!imageLinks.length && !codeBlocks.length) {
    console.warn('不存在图片链接和代码块');
    return [];
  }

  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 确保 Puppeteer 的用户数据目录存在
  if (!fs.existsSync(puppeteerUserDataDir)) {
    fs.mkdirSync(puppeteerUserDataDir, { recursive: true });
  }

  const results = [];
  let browser = null;

  try {
    // 启动 Puppeteer 浏览器实例，指定 userDataDir 以避免权限问题
    browser = await launchPuppeteer(puppeteerUserDataDir);

    // 处理图片链接
    for (const [index, link] of imageLinks.entries()) {
      try {
        const imageExt = path.extname(new URL(link).pathname).split('?')[0] || '.png'; // 获取图片扩展名，默认.png
        const imageName = `image_${Date.now()}_${index}${imageExt}`;
        const imagePath = path.join(outputDir, imageName);

        await downloadImageWithTimeout(link, imagePath, imageTimeout);

        results.push({
          index: `image_${index}`,
          type: 'image',
          url: link,
          outputPath: imagePath,
          metadata: {}
        });
      } catch (error) {
        console.warn(`下载图片失败或超时: ${link}，错误: ${error.message}`);
        // 超时或下载失败时不添加到结果中
        continue;
      }
    }

    // 处理代码块
    for (const [index, block] of codeBlocks.entries()) {
      const { language } = block;

      // 优先检查是否为前端语言
      if (frontendLanguages.includes(language)) {
        // 处理前端语言代码块
        const result = await renderFrontendCodeBlock(browser, block, {
          outputPath: path.join(outputDir, `render_${index}.png`),
          timeout,
          additionalScripts,
          additionalStyles
        });

        if (result) {
          results.push({
            index,
            type: 'code',
            language: block.language,
            outputPath: result.outputPath,
            metadata: result.metadata
          });
        }
        continue;
      }

      // 检查是否为后端语言
      if (backendLanguages.includes(language)) {
        // 处理后端语言代码块
        const execResult = await executeBackendCode(block.language, block.code);
        if (execResult) {
          // 生成模拟终端输出的 HTML 内容
          const terminalContent = generateTerminalContent(execResult.output, execResult.error);
          const outputPath = path.join(outputDir, `render_${index}.png`);
          const metadata = { execution: execResult };

          // 渲染终端内容
          const renderResult = await renderHtmlContent(browser, terminalContent, {
            outputPath,
            timeout,
            additionalScripts,
            additionalStyles
          });

          if (renderResult) {
            results.push({
              index,
              type: 'code',
              language: block.language,
              outputPath: renderResult.outputPath,
              metadata: renderResult.metadata
            });
          }
        }
        continue; // 处理完后端语言后跳过后续渲染步骤
      }

      // 对于不支持的语言，跳过渲染
      console.warn(`跳过不支持的语言: ${language}，索引: ${index}`);
      continue;
    }

    return results;

  } catch (error) {
    console.error('渲染过程中出错:', error);
    throw error;
  } finally {
    // 确保浏览器实例被正确关闭，避免资源泄漏
    if (browser) {
      try {
        // 关闭所有打开的页面
        const pages = await browser.pages();
        await Promise.all(pages.map(page => page.close().catch(err => {
          console.error('关闭页面时出错:', err);
        })));

        // 关闭浏览器
        await browser.close();
      } catch (closeError) {
        // 如果关闭浏览器时遇到权限错误，记录警告但不抛出异常
        if (closeError.code === 'EPERM' || closeError.code === 'EACCES') {
          console.warn('关闭浏览器时遇到权限错误，可能无法删除部分临时文件。');
        } else {
          console.error('关闭浏览器时出错:', closeError);
        }
      }
    }
  }
}

/**
 * 启动 Puppeteer 浏览器实例，指定 userDataDir 以避免权限问题
 * 优先使用 "new" 模式，如果不支持则回退到 true 模式
 * @param {string} userDataDir - Puppeteer 用户数据目录
 * @returns {Promise<Browser>} - Puppeteer 浏览器实例
 */
async function launchPuppeteer(userDataDir) {
  const nodeVersion = process.version.slice(1).split('.')[0];

  try {
    // 尝试使用 "new" headless 模式
    const browser = await puppeteer.launch({
      headless: parseInt(nodeVersion) >= 16 ? "new" : true,
      userDataDir, // 指定用户数据目录
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    return browser;
  } catch (error) {
    console.warn(`无法使用 "new" headless 模式，原因: ${error.message}，将回退到传统 headless 模式`);
    // 回退到传统 headless 模式
    try {
      const browser = await puppeteer.launch({
        headless: true,
        userDataDir, // 指定用户数据目录
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      return browser;
    } catch (fallbackError) {
      console.error('无法启动 Puppeteer 浏览器实例:', fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * 提取 Markdown 中的图片链接，格式如 ![数字](链接)
 * @param {string} text - 源文本
 * @returns {Array<string>} - 图片链接数组
 */
function extractImageLinks(text) {
  const regex = /!\[(\d+)\]\((https?:\/\/[^\s)]+)\)/g;
  const matches = Array.from(text.matchAll(regex));
  return matches.map(match => match[2]).filter(url => url.length > 0);
}

/**
 * 下载图片并保存到指定路径，设置超时时间
 * @param {string} url - 图片URL
 * @param {string} dest - 本地保存路径
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {Promise<void>}
 */
function downloadImageWithTimeout(url, dest, timeout) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        fs.unlink(dest, () => { }); // 删除无效的文件
        return reject(new Error(`下载失败，状态码: ${response.statusCode}`));
      }

      response.pipe(file);
    });

    // 设置超时
    const timer = setTimeout(() => {
      request.abort();
      fs.unlink(dest, () => { }); // 删除未完成的文件
      reject(new Error('下载超时'));
    }, timeout);

    file.on('finish', () => {
      clearTimeout(timer);
      file.close(resolve);
    });

    request.on('error', (err) => {
      clearTimeout(timer);
      fs.unlink(dest, () => { }); // 删除有错误的文件
      reject(err);
    });

    file.on('error', (err) => {
      clearTimeout(timer);
      fs.unlink(dest, () => { }); // 删除有错误的文件
      reject(err);
    });
  });
}

/**
 * 提取代码块
 * @param {string} text - 源文本
 * @returns {Array<Object>} - 代码块数组
 */
function extractCodeBlocks(text) {
  const regex = /```(\w*)\n?([\s\S]*?)```/g; // 匹配 ```语言\n代码 ```
  const matches = Array.from(text.matchAll(regex));

  return matches.map(match => ({
    language: match[1]?.toLowerCase() || 'text', // 提取语言类型，默认为 'text'
    code: match[2]?.trim() || '' // 提取代码内容，去除首尾空白
  })).filter(({ code }) => code.length > 0); // 过滤掉空代码块
}

/**
 * 渲染前端语言代码块
 * @param {Browser} browser - Puppeteer浏览器实例
 * @param {Object} block - 代码块对象
 * @param {Object} options - 渲染选项
 * @returns {Promise<Object>} - 渲染结果
 */
async function renderFrontendCodeBlock(browser, block, options) {
  const { language, code } = block;
  const {
    outputPath,
    timeout,
    additionalScripts,
    additionalStyles
  } = options;

  const page = await browser.newPage();
  await page.setDefaultTimeout(timeout);

  try {
    // 根据语言类型生成适当的内容
    let content = '';
    switch (language.toLowerCase()) {
      case 'html':
        content = code;
        break;
      case 'svg':
        content = code.startsWith('<svg') ? code : `<svg>${code}</svg>`;
        break;
      case 'canvas':
        content = `
          <canvas id="canvas" style="width: 100%; height: 100%;"></canvas>
          <script>
            try {
              ${code}
            } catch (error) {
              const errorDiv = document.createElement('div');
              errorDiv.style.color = '#f44747';
              errorDiv.textContent = 'Canvas/JS 执行错误: ' + error;
              document.body.appendChild(errorDiv);
              console.error('Canvas/JS 执行错误:', error);
            }
          </script>
        `;
        break;
      case 'css':
        content = `
          <style>
            ${code}
          </style>
          <div id="css-content">
            <p>这是 CSS 代码块的渲染结果。</p>
          </div>
        `;
        break;
        case 'mermaid':
          content = `
            <div class="mermaid-wrapper">
              <div class="mermaid">
                ${code}
              </div>
              <div id="mermaid-error" style="display:none; color:#f44747; margin-top:10px;"></div>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
            <script>
              (function() {
                const config = {
                  startOnLoad: true,
                  theme: 'default',
                  securityLevel: 'loose',
                  flowchart: {
                    useMaxWidth: true,
                    htmlLabels: true,
                    curve: 'basis'
                  },
                  timeline: {
                    noteFontSize: '14px',
                    noteAlign: 'left'
                  },
                  er: {
                    useMaxWidth: true
                  },
                  sequence: {
                    useMaxWidth: true,
                    showSequenceNumbers: false
                  },
                  gantt: {
                    fontSize: 14
                  }
                };
        
                try {
                  // 检测 Mermaid 版本并应用相应配置
                  if (mermaid.version) {
                    const version = mermaid.version.split('.');
                    const majorVersion = parseInt(version[0]);
                    const minorVersion = parseInt(version[1]);
        
                    // 针对不同版本调整配置
                    if (majorVersion >= 9) {
                      config.timeline = {
                        enabled: true,
                        noteFontSize: '14px'
                      };
                    }
                  }
        
                  mermaid.initialize(config);
        
                  // 添加自定义错误处理
                  mermaid.parseError = (err, hash) => {
                    const errorDiv = document.getElementById('mermaid-error');
                    if (errorDiv) {
                      // 优化错误信息显示
                      let errorMessage = '图表渲染失败: ';
                      if (err.str) {
                        errorMessage += err.str;
                      } else if (err.message) {
                        errorMessage += err.message;
                      } else {
                        errorMessage += '未知错误';
                      }
                      
                      // 添加常见问题提示
                      errorMessage += '<br><small>请检查：<br>1. 语法是否正确<br>2. 节点ID是否唯一<br>3. 箭头方向是否正确</small>';
                      
                      errorDiv.innerHTML = errorMessage;
                      errorDiv.style.display = 'block';
                    }
                    console.error('Mermaid 解析错误:', err);
                  };
        
                  // 自动重试机制
                  let retryCount = 0;
                  const maxRetries = 3;
                  
                  function tryRender() {
                    try {
                      mermaid.contentLoaded();
                    } catch (error) {
                      if (retryCount < maxRetries) {
                        retryCount++;
                        setTimeout(tryRender, 500); // 延迟500ms后重试
                      } else {
                        mermaid.parseError(error);
                      }
                    }
                  }
        
                  // 确保 DOM 完全加载后再渲染
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', tryRender);
                  } else {
                    tryRender();
                  }
        
                } catch (error) {
                  const errorDiv = document.getElementById('mermaid-error');
                  if (errorDiv) {
                    errorDiv.textContent = '初始化失败: ' + error.message;
                    errorDiv.style.display = 'block';
                  }
                  console.error('Mermaid 初始化错误:', error);
                }
              })();
            </script>
            <style>
              .mermaid-wrapper {
                width: 100%;
                overflow-x: auto;
              }
              .mermaid {
                display: flex;
                justify-content: center;
              }
              #mermaid-error {
                padding: 10px;
                border-radius: 4px;
                background-color: #fde7e9;
                border: 1px solid #ffa7a7;
              }
            </style>
          `;
          break;
      default:
        content = `<pre><code>${escapeHtml(code)}</code></pre>`;
    }

    // 设置页面内容，直接渲染内容，不使用额外的 HTML 模板
    await page.setContent(content, {
      waitUntil: ['networkidle0', 'domcontentloaded']
    });

    // 等待所有字体和脚本加载完成
    await page.evaluate(() => document.fonts.ready);

    // 特殊处理，比如等待 mermaid 渲染完成
    await handleSpecialFrontendRendering(page, language, code);

    // 计算内容的实际尺寸
    const { width, height } = await page.evaluate(() => {
      const body = document.body;
      const rect = body.getBoundingClientRect();
      return { width: Math.ceil(rect.width), height: Math.ceil(rect.height) };
    });

    // 设置视口大小与内容匹配，并增加 deviceScaleFactor 以提高渲染精度
    await page.setViewport({
      width: width || 1200, // 如果宽度为0，则使用默认值
      height: height || 800, // 如果高度为0，则使用默认值
      deviceScaleFactor: 3 // 提高设备像素比，增强图片清晰度
    });

    // 等待视口调整后的渲染
    await page.waitForTimeout(500); // 等待0.5秒

    // 使用更高级的方法检查页面是否为空白
    const isPageBlank = await page.evaluate(() => {
      const body = document.body;
      // 检查是否有可见的文本内容
      const hasText = body.innerText.trim().length > 0;
      // 检查是否有可见的非空元素
      const hasElements = Array.from(body.querySelectorAll('*')).some(el => {
        const style = window.getComputedStyle(el);
        return el.offsetParent !== null && style.visibility !== 'hidden' && style.display !== 'none' && el.clientHeight > 0 && el.clientWidth > 0;
      });
      return !hasText && !hasElements;
    });

    if (isPageBlank) {
      console.warn(`渲染结果为空白页面，跳过: ${outputPath}`);
      return null;
    }

    // 获取内容的边界以精确截图
    const boundingBox = await page.evaluate(() => {
      const body = document.body;
      const rect = body.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      };
    });

    // 截图保存为 PNG，使用 clip 精确截取内容区域
    await page.screenshot({
      path: outputPath,
      clip: {
        x: Math.max(boundingBox.x, 0),
        y: Math.max(boundingBox.y, 0),
        width: boundingBox.width,
        height: boundingBox.height
      },
      type: 'png',
      omitBackground: false // 保留背景
    });

    return {
      outputPath,
      metadata: {}
    };

  } catch (error) {
    console.error(`渲染 ${language} 代码块时出错:`, error);
    return null;
  } finally {
    // 关闭页面，确保资源被释放
    try {
      await page.close();
    } catch (closeError) {
      console.error('关闭页面时出错:', closeError);
    }
  }
}

/**
 * 渲染自定义HTML内容（用于后端语言执行结果）
 * @param {Browser} browser - Puppeteer浏览器实例
 * @param {string} htmlContent - 自定义HTML内容
 * @param {Object} options - 渲染选项
 * @returns {Promise<Object>} - 渲染结果
 */
async function renderHtmlContent(browser, htmlContent, options) {
  const {
    outputPath,
    timeout,
    additionalScripts,
    additionalStyles
  } = options;

  const page = await browser.newPage();
  await page.setDefaultTimeout(timeout);

  try {
    // 设置页面内容，包含必要的样式和脚本
    const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${additionalStyles.map(style => `<link rel="stylesheet" href="${style}">`).join('\n')}
          ${additionalScripts.map(script => `<script src="${script}"></script>`).join('\n')}
          <style>
            /* 重置默认边距 */
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              overflow: hidden; /* 隐藏滚动条，确保内容适应 */
              background: #1e1e1e;
              color: #d4d4d4;
              font-family: 'Fira Code', monospace;
              display: flex;
              justify-content: center;
              align-items: center;
              flex-direction: column;
              box-sizing: border-box;
            }

            .terminal-container {
              width: 100%;
              height: 100%;
              max-width: none;
              margin: 0;  /* 移除容器的边距 */
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }

            .terminal {
              background: #1e1e1e;
              color: #d4d4d4;
              padding: 20px;
              border-radius: 5px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
              white-space: pre-wrap;
              font-size: 14px;
              line-height: 1.5;
              max-width: 100%;
              overflow: auto;
            }

            .terminal .output {
              color: #d4d4d4;
            }

            .terminal .error {
              color: #f44747;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="terminal-container">
            <div class="terminal">
              ${htmlContent}
            </div>
          </div>
        </body>
      </html>
    `;

    // 设置页面内容
    await page.setContent(fullHTML, {
      waitUntil: ['networkidle0', 'domcontentloaded']
    });

    // 等待所有字体加载完成
    await page.evaluate(() => document.fonts.ready);

    // 等待页面完全加载
    await page.waitForTimeout(500); // 等待0.5秒确保所有渲染完成

    // 计算内容的实际尺寸
    const { width, height } = await page.evaluate(() => {
      const body = document.body;
      const rect = body.getBoundingClientRect();
      return { width: Math.ceil(rect.width), height: Math.ceil(rect.height) };
    });

    // 设置视口大小与内容匹配，并增加 deviceScaleFactor 以提高渲染精度
    await page.setViewport({
      width: width || 1200, // 如果宽度为0，则使用默认值
      height: height || 800, // 如果高度为0，则使用默认值
      deviceScaleFactor: 3 // 提高设备像素比，增强图片清晰度
    });

    // 等待视口调整后的渲染
    await page.waitForTimeout(500); // 等待0.5秒

    // 使用更高级的方法检查页面是否为空白
    const isPageBlank = await page.evaluate(() => {
      const body = document.body;
      // 检查是否有可见的文本内容
      const hasText = body.innerText.trim().length > 0;
      // 检查是否有可见的非空元素
      const hasElements = Array.from(body.querySelectorAll('*')).some(el => {
        const style = window.getComputedStyle(el);
        return el.offsetParent !== null && style.visibility !== 'hidden' && style.display !== 'none' && el.clientHeight > 0 && el.clientWidth > 0;
      });
      return !hasText && !hasElements;
    });

    if (isPageBlank) {
      console.warn(`渲染结果为空白页面，跳过: ${outputPath}`);
      return null;
    }

    // 获取内容的边界以精确截图
    const boundingBox = await page.evaluate(() => {
      const body = document.body;
      const rect = body.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      };
    });

    // 截图保存为 PNG，使用 clip 精确截取内容区域
    await page.screenshot({
      path: outputPath,
      clip: {
        x: Math.max(boundingBox.x, 0),
        y: Math.max(boundingBox.y, 0),
        width: boundingBox.width,
        height: boundingBox.height
      },
      type: 'png',
      omitBackground: false // 保留背景
    });

    return {
      outputPath,
      metadata: {}
    };

  } catch (error) {
    console.error(`渲染自定义HTML内容时出错:`, error);
    return null;
  } finally {
    // 关闭页面，确保资源被释放
    try {
      await page.close();
    } catch (closeError) {
      console.error('关闭页面时出错:', closeError);
    }
  }
}

/**
 * 处理特殊类型的前端渲染
 * @param {Page} page - Puppeteer页面实例
 * @param {string} language - 语言类型
 * @param {string} code - 代码内容
 * @returns {Promise<Object>} - 元数据
 */
async function handleSpecialFrontendRendering(page, language, code) {
  const metadata = {};

  switch (language.toLowerCase()) {
    case 'mermaid':
      // 等待Mermaid图表渲染完成
      await page.waitForSelector('.mermaid svg', { timeout: 5000 }).catch(() => {
        console.warn('Mermaid 图表未能成功渲染。');
      });
      break;
    // 可以在这里添加其他特殊处理，如 Canvas 渲染完成后等待特定元素
  }

  return metadata;
}

/**
 * 执行后端语言代码并返回执行结果
 * @param {string} language - 语言类型
 * @param {string} code - 代码内容
 * @returns {Promise<Object|null>} - 执行结果或 null
 */
async function executeBackendCode(language, code) {
  // 临时文件路径，使用 process.cwd() 代替 __dirname，避免路径问题
  const tempDir = path.join(process.cwd(), 'temp_code_exec');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // 根据语言选择文件扩展名和执行命令
  let fileExtension, execCommand, compileCommand, runCommand;

  switch (language.toLowerCase()) {
    case 'javascript':
      fileExtension = 'js';
      execCommand = 'node';
      break;
    case 'typescript':
      fileExtension = 'ts';
      execCommand = 'node';
      compileCommand = 'tsc'; // 使用全局安装的 tsc 命令
      break;
    case 'python':
      fileExtension = 'py';
      execCommand = 'python3';
      break;
    case 'java':
      fileExtension = 'java';
      execCommand = 'java';
      compileCommand = 'javac';
      break;
    case 'c++':
      fileExtension = 'cpp';
      execCommand = path.join(tempDir, 'temp_executable');
      compileCommand = 'g++';
      break;
    case 'c':
      fileExtension = 'c';
      execCommand = path.join(tempDir, 'temp_executable');
      compileCommand = 'gcc';
      break;
    case 'ruby':
      fileExtension = 'rb';
      execCommand = 'ruby';
      break;
    case 'go':
      fileExtension = 'go';
      execCommand = 'go run';
      break;
    default:
      console.warn(`不支持的后端语言: ${language}`);
      return null;
  }

  const fileName = `temp_code.${fileExtension}`;
  const filePath = path.join(tempDir, fileName);

  try {
    // 对代码进行安全校验和消毒
    const sanitizedCode = sanitizeCode(language, code);
    if (!sanitizedCode) {
      throw new Error('代码未通过安全校验');
    }

    // 写入临时代码文件
    fs.writeFileSync(filePath, sanitizedCode, 'utf-8');

    // 如果需要编译，先编译
    if (compileCommand) {
      if (language.toLowerCase() === 'java') {
        // 编译 Java 代码
        console.log(`正在编译 Java 代码: ${fileName}`);
        await execAsync(`${compileCommand} ${fileName}`, { cwd: tempDir, timeout: 10000 });
        // Java 执行需要指定类名
        const classNameMatch = sanitizedCode.match(/class\s+(\w+)/);
        if (!classNameMatch) {
          throw new Error('Java 代码中必须包含类名');
        }
        const className = classNameMatch[1];
        runCommand = `${execCommand} ${className}`;
      } else if (language.toLowerCase() === 'c' || language.toLowerCase() === 'c++') {
        // 编译 C/C++ 代码
        console.log(`正在编译 ${language} 代码: ${fileName}`);
        await execAsync(`${compileCommand} ${fileName} -o temp_executable`, { cwd: tempDir, timeout: 10000 });
        runCommand = execCommand; // './temp_executable'
      } else if (language.toLowerCase() === 'typescript') {
        // 编译 TypeScript 代码
        console.log(`正在编译 TypeScript 代码: ${fileName}`);
        await execAsync(`${compileCommand} ${fileName}`, { cwd: tempDir, timeout: 10000 });
        // 执行编译后的 JavaScript 代码
        const jsFile = fileName.replace('.ts', '.js');
        runCommand = `${execCommand} ${jsFile}`;
      }
    } else {
      // 直接执行脚本语言
      runCommand = `${execCommand} ${fileName}`;
    }

    // 使用 spawn 代替 exec 以更好地控制子进程
    const spawnOptions = {
      cwd: tempDir,
      timeout: 10000, // 10秒超时
      maxBuffer: 1024 * 1024, // 最大缓冲区1MB
      shell: true,
      env: {}, // 清空环境变量，避免泄露
      stdio: ['ignore', 'pipe', 'pipe']
    };

    console.log(`正在执行命令: ${runCommand}`);

    // 启动子进程
    const child = spawn(runCommand, [], spawnOptions);

    let stdout = '';
    let stderr = '';

    // 捕获标准输出
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    // 捕获标准错误
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // 等待子进程结束
    const exitCode = await new Promise((resolve, reject) => {
      child.on('close', resolve);
      child.on('error', reject);
    });

    console.log(`命令执行完成，退出代码: ${exitCode}`);

    if (exitCode !== 0) {
      return {
        output: stdout,
        error: stderr || `进程以代码 ${exitCode} 退出`
      };
    }

    return {
      output: stdout,
      error: stderr
    };

  } catch (error) {
    console.error(`执行 ${language} 代码时出错:`, error);
    return {
      output: '',
      error: error.message
    };
  } finally {
    // 清理临时文件
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      // 清理编译生成的文件
      if (compileCommand) {
        if (language.toLowerCase() === 'java') {
          const classFile = path.join(tempDir, `${fileName.replace('.java', '')}.class`);
          if (fs.existsSync(classFile)) {
            fs.unlinkSync(classFile);
          }
        } else if (language.toLowerCase() === 'c' || language.toLowerCase() === 'c++') {
          const execPath = path.join(tempDir, 'temp_executable');
          if (fs.existsSync(execPath)) {
            fs.unlinkSync(execPath);
          }
        } else if (language.toLowerCase() === 'typescript') {
          const jsFile = path.join(tempDir, fileName.replace('.ts', '.js'));
          if (fs.existsSync(jsFile)) {
            fs.unlinkSync(jsFile);
          }
        }
      }
    } catch (cleanupError) {
      console.error('清理临时文件时出错:', cleanupError);
    }
  }
}

/**
 * 对代码进行安全校验和消毒
 * @param {string} language - 语言类型
 * @param {string} code - 代码内容
 * @returns {string|null} - 消毒后的代码或 null
 */
function sanitizeCode(language, code) {
  // 禁止某些关键字
  const forbiddenKeywords = [
    'require',
    'import',
    'fs',
    'child_process',
    'process',
    'exec',
    'spawn',
    'eval',
    'document',
    'window'
  ];

  const lowerCode = code.toLowerCase();
  for (const keyword of forbiddenKeywords) {
    if (lowerCode.includes(keyword)) {
      console.warn(`代码包含禁止使用的关键字: ${keyword}`);
      return null;
    }
  }

  // 针对不同语言可以添加更多的消毒规则
  // 例如，对于 JavaScript/TypeScript，可以进一步检查是否存在不安全的代码模式

  return code;
}

/**
 * 生成模拟终端输出的HTML内容（VSCode 终端风格）
 * @param {string} output - 执行输出
 * @param {string} error - 执行错误
 * @returns {string} - 模拟终端的HTML内容
 */
function generateTerminalContent(output, error) {
  let content = '';

  if (output) {
    const escapedOutput = escapeHtml(output);
    content += `<div class="output">${escapedOutput}</div>`;
  }

  if (error) {
    const escapedError = escapeHtml(error);
    content += `<div class="error">${escapedError}</div>`;
  }

  return content || '<div class="output">无输出</div>';
}

/**
 * HTML转义
 * @param {string} str - 需要转义的字符串
 * @returns {string} - 转义后的字符串
 */
function escapeHtml(str) {
  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;'
  };
  return str.replace(/[&<>"'`]/g, s => entityMap[s]);
}

export { extractAndRender, extractCodeBlocks };