import { TotalTokens } from '../YTOpen-Ai/tools/CalculateToken.js';
import { NXModelResponse } from "../utils/providers/ChooseModels.js";
import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import crypto from 'crypto';
import cors from '@koa/cors';
import { PassThrough } from 'stream';

const app = new Koa();
const router = new Router();

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

// 模型映射表
const MODEL_MAP = {
  // 国内模型
  'doubao': 'doubao-nx',
  'minimax': 'minimax-nx',
  'qwen-2-72b': 'qwen-2-72b-nx', 
  'hunyuan-lite': 'hunyuan-lite-nx',
  'glm-4-flash': 'glm-4-flash-nx',
  'spark-max': 'spark-max-nx',
  'qwen-2.5-72b-instruct': 'qwen-2.5-72b-instruct-nx',
  'ERNIE-Speed-128k': 'ERNIE-Speed-128k-nx',
  
  // 开源模型
  'deepseek-reasoner': 'deepseek-reasoner-nx',
  'deepseek-v3': 'deepseek-v2.5-nx',
  'llama-3.1-405b': 'llama-3.1-405b-nx',
  'llama-3.3-70b': 'llama-3.3-70b-nx',
  'yi-lightning': 'yi-lightning-nx',
  'gemini-1.5-flash-vision': 'gemini-1.5-flash-vision-nx',
  'gemini-1.5-pro': 'gemini-1.5-pro-nx',
  'gemini-pro': 'gemini-pro-nx',
  'gemini-2.0-flash-exp': 'gemini-2.0-flash-exp-nx',
  'gpt-4-vision': 'gpt-4o-vision-nx',
  'gpt-4o': 'gpt-4o-nx',
  'gpt-3.5-turbo-16k': 'gpt-3.5-turbo-nx',
  'claude-3.5-sonnet-20241022': 'claude-3.5-sonnet-20241022-nx',
  'claude-3.5-sonnet': 'claude-3.5-sonnet-nx',
  'claude-3.5-haiku': 'claude-3.5-haiku-nx',
  'claude-3.5-sonnet-poe': 'claude-3.5-sonnet-poe-nx',
  'grok-v2': 'grok-v2-nx',
  'step-2': 'step-2-nx',
  'mita': 'mita-nx', 
  'kimi-pro': 'kimi-pro-nx',
  'o1-mini': 'o1-mini-nx',
  'o1-preview': 'o1-preview-nx',
  'qwen-qwq-32b-preview': 'qwen-qwq-32b-preview-nx',
  'net-gpt-4o-mini': 'net-gpt-4o-mini-nx'
};

/**
 * 获取模型响应
 * @param {string} model - 模型名称
 * @param {Array} history - 对话历史
 * @returns {Promise} 模型响应结果
 */
async function getModelResponse(model, history) {
  try {
    const modelName = MODEL_MAP[model];
    if (!modelName) {
      throw new Error('不支持的模型类型');
    }
    return await NXModelResponse(history, modelName);
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
          model: MODEL_MAP[model] || MODEL_MAP['gpt-4o-mini'],
          choices: [{
            index: 0,
            delta: { content: chunk },
            finish_reason: null
          }]
        };
        stream.write(`data: ${JSON.stringify(data)}\n\n`);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 发送结束标记
      const finalData = {
        id: `chatcmpl-${crypto.randomBytes(12).toString('hex')}`,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: MODEL_MAP[model] || MODEL_MAP['gpt-4o-mini'],
        choices: [{
          index: 0,
          delta: {},
          finish_reason: 'stop'
        }]
      };
      stream.write(`data: ${JSON.stringify(finalData)}\n\n`);
      stream.write('data: [DONE]\n\n');
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

// 注册路由
app.use(router.routes()).use(router.allowedMethods());

// 启动服务器
const PORT = process.env.PORT || 7799;
app.listen(PORT, () => {
  console.log(`服务器已启动,监听端口 ${PORT}`);
});