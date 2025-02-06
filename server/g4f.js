import { TotalTokens } from '../YTOpen-Ai/tools/CalculateToken.js';
import {
  NXModelResponse,
  getAllModelsWithProviders
} from "../utils/providers/ChooseModels.js";
import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import crypto from 'crypto';
import cors from '@koa/cors';
import { PassThrough } from 'stream';
import fs from 'fs/promises';
import serve from 'koa-static';
import path from 'path';
import { fileURLToPath } from 'url';

const app = new Koa();
const router = new Router();

// 修改这部分代码的位置和内容
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 首先配置静态文件服务 (确保在所有路由之前)
app.use(serve(path.join(__dirname, 'public')));

// 配置中间件解析JSON请求体
app.use(bodyParser());

// 配置CORS中间件
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 5,
  credentials: true,
  keepHeadersOnError: true
}));

// OpenAI API相关配置
const DEFAULT_API_KEY = 'sk-123456';
const OPENAI_API_BASE = 'https://api.yuan123.icu';

/**
 * 获取模型响应
 * @param {string} model - 模型名称
 * @param {Array} history - 对话历史
 * @returns {Promise} 模型响应结果
 */
async function getModelResponse(model, history) {
  try {
    return await NXModelResponse(history, model);
  } catch (error) {
    console.error('获取模型响应失败:', error);
    return null;
  }
}

/**
 * API密钥验证中间件
 */
async function validateApiKey(ctx, next) {
  const apiKey = ctx.get('authorization')?.replace('Bearer ', '') || DEFAULT_API_KEY;
  if (!apiKey.startsWith('sk-')) {
    ctx.status = 401;
    ctx.body = {
      error: '无效的API密钥',
      message: '请确保API密钥格式正确且以sk-开头'
    };
    return;
  }
  ctx.state.apiKey = apiKey;
  await next();
}

router.get('/models', validateApiKey, async (ctx) => {
  try {
    ctx.type = 'html';
    const htmlContent = await fs.readFile(path.join(__dirname, 'public', 'models.html'), 'utf8');
    ctx.body = htmlContent;
  } catch (error) {
    console.error('Error reading models.html:', error);
    ctx.status = 500;
    ctx.body = '服务器错误';
  }
});

router.get('/v1/models', validateApiKey, async (ctx) => {
  try {
    const models = getAllModelsWithProviders();
    console.log(models)
    ctx.body = models;
  } catch (error) {
    console.error("Koa 路由: 获取模型列表失败:", error); // 更详细的错误信息
    ctx.status = 500;
    ctx.body = {
      error: error.message,
      stack: error.stack // 添加堆栈跟踪信息
    };
  }
});

// 聊天完成接口
router.post('/v1/chat/completions', validateApiKey, async (ctx) => {
  try {
    const { messages, model = 'gpt-4o-mini', stream = false } = ctx.request.body;

    // 流式响应设置
    if (stream) {
      ctx.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      ctx.status = 200;
      const response = await getModelResponse(model, messages);
      if (!response) {
        throw new Error('获取模型响应失败');
      }

      const content = response;
      const chunks = content.match(/.{1,20}/g) || [content];

      const stream = new PassThrough();
      ctx.body = stream;

      // 流式响应处理
      for (const chunk of chunks) {
        const data = {
          id: `chatcmpl-${crypto.randomBytes(12).toString('hex')}`,
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model: model || 'gpt-4o-mini',
          choices: [{
            index: 0,
            delta: { content: chunk },
            finish_reason: null
          }]
        };
        stream.write(`data: ${JSON.stringify(data)}\
\
`);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 发送结束标记
      const finalData = {
        id: `chatcmpl-${crypto.randomBytes(12).toString('hex')}`,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: model || 'gpt-4o-mini',
        choices: [{
          index: 0,
          delta: {},
          finish_reason: 'stop'
        }]
      };
      stream.write(`data: ${JSON.stringify(finalData)}\
\
`);
      stream.write('data: [DONE]\
\
');
      stream.end();

    } else {
      const response = await getModelResponse(model, messages);
      if (!response) {
        throw new Error('获取模型响应失败');
      }

      const { prompt_tokens, completion_tokens, total_tokens } = await TotalTokens(response, messages);

      // 普通响应
      ctx.body = {
        id: `chatcmpl-${crypto.randomBytes(12).toString('hex')}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: response
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens,
          completion_tokens,
          total_tokens
        }
      };
    }
  } catch (error) {
    console.error('处理请求失败:', error);
    ctx.status = 500;
    ctx.body = {
      error: error.message,
      message: '服务器内部错误'
    };
  }
});

// 修改配置文件相关的路由
router.get('/v1/config', validateApiKey, async (ctx) => {
  try {
    const config = await fs.readFile(path.resolve(__dirname, '../config/message.yaml'), 'utf8'); // 使用绝对路径
    ctx.body = { config };
  } catch (error) {
    console.error('读取配置文件失败:', error); // 添加错误日志
    ctx.status = 500;
    ctx.body = { error: error.message }; // 返回更详细的错误信息
  }
});

router.post('/v1/config', validateApiKey, async (ctx) => {
  try {
    const { config } = ctx.request.body;
    await fs.writeFile(path.resolve(__dirname, '../config/message.yaml'), config, 'utf8'); // 使用绝对路径
    ctx.body = { message: '配置更新成功' };
  } catch (error) {
    console.error('写入配置文件失败:', error); // 添加错误日志
    ctx.status = 500;
    ctx.body = { error: '更新配置文件失败', message: error.message }; // 返回更详细的错误信息
  }
});

// 创建一个新的路由来处理根路径
router.get('/', async (ctx) => {
  try {
    ctx.type = 'html';
    const htmlContent = await fs.readFile(path.join(__dirname, 'public', 'config.html'), 'utf8');
    ctx.body = htmlContent;
  } catch (error) {
    console.error('读取HTML文件失败:', error);
    ctx.status = 500;
    ctx.body = '服务器错误';
  }
});

// 确保文件存在
async function ensurePublicFiles() {
  const publicDir = path.join(__dirname, 'public');
  const cssDir = path.join(publicDir, 'css');
  const jsDir = path.join(publicDir, 'js');

  // 创建必要的目录
  await fs.mkdir(publicDir, { recursive: true });
  await fs.mkdir(cssDir, { recursive: true });
  await fs.mkdir(jsDir, { recursive: true });

  // 创建 HTML 文件
  const htmlContent = `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>配置管理</title>
    <link rel="stylesheet" href="/css/style.css">
    <script src="https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js"></script>
</head>
<body>
    <div class="container">
        <header>
            <h1>配置管理</h1>
            <p class="subtitle">在这里管理您的系统配置</p>
        </header>

        <main>
            <div class="actions">
                <button id="saveBtn" class="btn primary">保存配置</button>
                <button id="refreshBtn" class="btn secondary">刷新</button>
                <span id="message" class="message"></span>
            </div>
            <div id="editor" class="editor-container"></div>
        </main>
    </div>
    <script src="/js/config.js"></script>
</body>
</html>`;

  // 创建 CSS 文件
  const cssContent = `
:root {
    --primary-color: #2563eb;
    --bg-color: #111827;
    --surface-color: #1f2937;
    --text-color: #ffffff;
    --text-secondary: #9ca3af;
}

body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background-color: var(--bg-color);
    color: var(--text-color);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

header {
    margin-bottom: 2rem;
}

h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 600;
}

.subtitle {
    color: var(--text-secondary);
    margin-top: 0.5rem;
}

.actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    align-items: center;
}

.btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn.primary {
    background-color: var(--primary-color);
    color: white;
}

.btn.primary:hover {
    background-color: #1d4ed8;
}

.btn.secondary {
    background-color: #4b5563;
    color: white;
}

.btn.secondary:hover {
    background-color: #374151;
}

.editor-container {
    height: 600px;
    border: 1px solid #374151;
    border-radius: 0.5rem;
    overflow: hidden;
}

.message {
    padding: 0.5rem;
    color: #10b981;
    font-size: 0.875rem;
}

.message.error {
    color: #ef4444;
}`;

  // 创建 JavaScript 文件
  const jsContent = `
let editor;

require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: '',
        language: 'yaml',
        theme: 'vs-dark',
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
    });

    fetchConfig();
});

async function fetchConfig() {
    try {
        const response = await fetch('/v1/config', {
            headers: {
                'Authorization': \`Bearer \${localStorage.getItem('apiKey') || 'sk-123456'}\`
            }
        });
        const data = await response.json();
        editor.setValue(data.config || '');
        showMessage('配置已加载');
    } catch (error) {
        showMessage('获取配置失败', true);
    }
}

async function saveConfig() {
    try {
        const config = editor.getValue();
        const response = await fetch('/v1/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': \`Bearer \${localStorage.getItem('apiKey') || 'sk-123456'}\`
            },
            body: JSON.stringify({ config })
        });
        const data = await response.json();
        showMessage(data.message || '保存成功');
    } catch (error) {
        showMessage('保存失败', true);
    }
}

function showMessage(text, isError = false) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = \`message \${isError ? 'error' : ''}\`;
    setTimeout(() => {
        messageEl.textContent = '';
    }, 3000);
}

document.getElementById('saveBtn').addEventListener('click', saveConfig);
document.getElementById('refreshBtn').addEventListener('click', fetchConfig);`;

  // 写入文件
  await fs.writeFile(path.join(publicDir, 'config.html'), htmlContent);
  await fs.writeFile(path.join(cssDir, 'style.css'), cssContent);
  await fs.writeFile(path.join(jsDir, 'config.js'), jsContent);
}

// 在启动服务器之前确保文件存在
await ensurePublicFiles();

// 注册路由
app.use(router.routes()).use(router.allowedMethods());

// 启动服务器
const PORT = process.env.PORT || 7799;
app.listen(PORT, () => {
  console.log(`服务器已启动,监听端口 ${PORT}`);
});