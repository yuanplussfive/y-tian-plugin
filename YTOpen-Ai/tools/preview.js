import puppeteers from 'puppeteer';

/**
 * 提取并渲染各类代码块
 * @param {string} text - 包含代码块的文本
 * @param {Object} options - 渲染配置选项
 * @returns {Promise<Array>} - 返回渲染结果数组
 */
async function extractAndRender(text, options = {}) {
  const {
    outputDir = './output',
    viewport = { width: 1200, height: 800, deviceScaleFactor: 2 },
    timeout = 70000,
    additionalScripts = [],
    additionalStyles = []
  } = options;

  if (typeof text !== 'string') {
    throw new Error('输出必须是字符串');
  }

  // 提取所有代码块
  const codeBlocks = extractCodeBlocks(text);
  if (!codeBlocks.length) {
    console.warn('不存在代码块');
    return [];
  }

  const results = [];
  let browser = null;

  try {
    browser = await puppeteers.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    for (const [index, block] of codeBlocks.entries()) {
      const result = await renderCodeBlock(browser, block, {
        outputPath: `${outputDir}/render_${index}.png`,
        viewport,
        timeout,
        additionalScripts,
        additionalStyles
      });

      if (result) {
        results.push({
          index,
          language: block.language,
          outputPath: result.outputPath,
          metadata: result.metadata
        });
      }
    }

    return results;

  } catch (error) {
    console.error('failed:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close().catch(console.error);
    }
  }
}

/**
 * 提取代码块
 * @param {string} text - 源文本
 * @returns {Array<Object>} - 代码块数组
 */
function extractCodeBlocks(text) {
  const regex = /```(\w*)\n?([\s\S]*?)```/g;
  const matches = Array.from(text.matchAll(regex));

  return matches.map(match => ({
    language: match[1]?.toLowerCase() || 'text',
    code: match[2]?.trim() || ''
  })).filter(({ code }) => code.length > 0);
}

/**
 * 渲染单个代码块
 * @param {Browser} browser - Puppeteer浏览器实例
 * @param {Object} block - 代码块对象
 * @param {Object} options - 渲染选项
 * @returns {Promise<Object>} - 渲染结果
 */
async function renderCodeBlock(browser, block, options) {
  const { language, code } = block;
  const {
    outputPath,
    viewport,
    timeout,
    additionalScripts,
    additionalStyles
  } = options;

  // 根据语言类型生成适当的HTML内容
  const content = generateContent(language, code);
  if (!content) return null;

  const page = await browser.newPage();
  await page.setDefaultTimeout(timeout);
  await page.setViewport(viewport);

  try {
    const fullHTML = `
     <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${additionalStyles.map(style => `<link rel="stylesheet" href="${style}">`).join('\n')}
    ${additionalScripts.map(script => `<script src="${script}"></script>`).join('\n')}
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      html, body {
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      
      body {
        background: white;
      }
      
      canvas, svg {
        max-width: 100%;
        height: auto;
        display: block;
      }
    </style>
  </head>
  <body>
    ${content}
  </body>
</html>
    `;

    await page.setContent(fullHTML, {
      waitUntil: ['networkidle0', 'domcontentloaded']
    });

    // 等待所有资源加载完成
    await Promise.all([
      page.evaluate(() => document.fonts.ready),
      page.evaluate(() => new Promise(resolve => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', resolve);
        }
      }))
    ]);

    // 处理特定类型的渲染
    const metadata = await handleSpecialRendering(page, language, code);

    await page.screenshot({
      path: outputPath,
      fullPage: true,
      type: 'png'
    });

    return {
      outputPath,
      metadata
    };

  } catch (error) {
    console.error(`Error rendering ${language} block:`, error);
    return null;
  } finally {
    await page.close().catch(console.error);
  }
}

/**
 * 根据语言类型生成适当的HTML内容
 * @param {string} language - 语言类型
 * @param {string} code - 代码内容
 * @returns {string} - HTML内容
 */
function generateContent(language, code) {
  switch (language.toLowerCase()) {
    case 'html':
      return code;
    case 'svg':
      return code.startsWith('<svg') ? code : `<svg>${code}</svg>`;
    case 'canvas':
    case 'javascript':
      return `
        <canvas id="canvas"></canvas>
        <script>
          try {
            ${code}
          } catch (error) {
            console.error('Canvas/JS execution error:', error);
          }
        </script>
      `;
    case 'css':
      return `
        <style>${code}</style>
        <div id="css-container"></div>
      `;
    case 'mermaid':
      return `
        <div class="mermaid">
          ${code}
        </div>
        <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
        <script>mermaid.initialize({startOnLoad: true});</script>
      `;
    default:
      return `<pre><code>${escapeHtml(code)}</code></pre>`;
  }
}

/**
 * 处理特殊类型的渲染
 * @param {Page} page - Puppeteer页面实例
 * @param {string} language - 语言类型
 * @param {string} code - 代码内容
 * @returns {Promise<Object>} - 元数据
 */
async function handleSpecialRendering(page, language, code) {
  const metadata = {};

  switch (language.toLowerCase()) {
    case 'canvas':
    case 'javascript':
      metadata.console = await page.evaluate(() => {
        return new Promise(resolve => {
          const logs = [];
          const originalConsole = { ...console };

          ['log', 'info', 'warn', 'error'].forEach(method => {
            console[method] = (...args) => {
              logs.push({ type: method, content: args });
              originalConsole[method](...args);
            };
          });

          // 给代码执行和可能的异步操作留出时间
          setTimeout(() => resolve(logs), 1000);
        });
      });
      break;

    case 'mermaid':
      // 等待Mermaid图表渲染完成
      await page.waitForSelector('.mermaid svg');
      break;
  }

  return metadata;
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
    "'": '&#39;'
  };
  return str.replace(/[&<>"']/g, s => entityMap[s]);
}

export { extractAndRender, extractCodeBlocks };