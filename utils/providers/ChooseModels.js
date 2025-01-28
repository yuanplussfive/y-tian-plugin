import { blackboxAi } from "../providers/ChatModels/blackbox/blackbox.js";
import { airforce } from "../providers/ChatModels/airforce/airforce.js";
import { nexra } from "../providers/ChatModels/nexra/nexra.js";
import { FreeSearch } from "../providers/ChatModels/YT/FreeSearch.js";
import { airoom } from "../providers/ChatModels/airoom/airoom.js";
import { mhystical } from "../providers/ChatModels/mhystical/mhystical.js";
import { e2b } from "../providers/ChatModels/e2b/e2b.js";
import { chatru } from "../providers/ChatModels/chatru/chatru.js";
import { zaiwen } from "../providers/ChatModels/zaiwen/zaiwen.js";

// 重试机制的配置参数
const RETRY_CONFIG = {
  maxRetries: 3,           // 每个提供商最大重试次数
  retryDelay: 1000,       // 重试间隔时间(毫秒)
  maxTotalAttempts: 9,   // 所有提供商总共最大尝试次数
};

// 存储服务商的成功/失败统计和权重配置
const providerStats = {
  blackbox: { success: 0, failure: 0, weight: 85 },
  airforce: { success: 0, failure: 0, weight: 60 },
  nexra: { success: 0, failure: 0, weight: 70 },
  YT: { success: 0, failure: 0, weight: 50 },
  airoom: { success: 10, failure: 0, weight: 20 },
  mhystical: { success: 0, failure: 0, weight: 40 },
  e2b: { success: 0, failure: 0, weight: 100 },
  chatru: { success: 0, failure: 0, weight: 90 },
  zaiwen: { success: 0, failure: 0, weight: 90 }
};

// 定义模型与提供商的映射关系
const modelProviderMap = {
  'doubao': ['zaiwen'],
  'minimax': ['zaiwen'],
  'qwen': ['zaiwen'],
  'step2': ['zaiwen'],
  'mita': ['zaiwen'],
  'kimi': ['zaiwen'],
  'deepseek-reasoner': ['zaiwen'],
  'claude_3_igloo': ['zaiwen'],
  'claude-3.5-sonnet-20241022': ['e2b'],
  'claude-3.5-sonnet': ['blackbox', 'chatru', 'airoom'],
  'claude-3.5-haiku': ['e2b', 'airoom'],
  'deepseek': ['zaiwen'],
  'gemini-pro': ['chatru', 'blackbox'],
  'gpt-4o': ['blackbox', 'airforce', 'nexra'],
  'gpt-4o-mini': ['nexra'],
  'gpt-3.5-turbo-16k': ['mhystical'],
  'net-gpt-4o-mini': ['YT'],
  'llama-3.1-405b': ['blackbox'],
  'qwen-qwq-32b-preview': ['e2b'],
  'gemini-1.5-pro': ['e2b'],
  'o1-preview': ['e2b', 'chatru'],
  'gemini-1.5-flash-vision': ['chatru'],
  'gpt-4o-vision': ['chatru'],
  'o1-mini': ['e2b'],
  'yi-lightning': ['zaiwen'],
  'hunyuan-lite': ['zaiwen'],
  'glm-4-flash': ['zaiwen'],
  'deepseek2.5': ['zaiwen'],
  'spark-max': ['zaiwen'],
  'qwen2572binstruct': ['zaiwen'],
  'ERNIE-Speed-128k': ['zaiwen'],
  'grok': ['zaiwen'],
  'llama3370b': ['zaiwen'],
  'gemini_2_falsh': ['zaiwen']
};

// 模型名称标准化映射
const modelNameNormalization = {
  'doubao-nx': 'doubao',
  'minimax-nx': 'minimax',
  'qwen-2-72b-nx': 'qwen',
  'step-2-nx': 'step2',
  'mita-nx': 'mita',
  'kimi-pro-nx': 'kimi',
  'deepseek-reasoner-nx': 'deepseek-reasoner',
  'gemini-1.5-flash-vision-nx': 'gemini-1.5-flash-vision',
  'gpt-4o-vision-nx': 'gpt-4o-vision',
  'o1-mini-nx': 'o1-mini',
  'o1-preview-nx': 'o1-preview',
  'gemini-1.5-pro-nx': 'gemini-1.5-pro',
  'qwen-qwq-32b-preview-nx': 'qwen-qwq-32b-preview',
  'claude-3.5-sonnet-20241022-nx': 'claude-3.5-sonnet-20241022',
  'claude-3-5-sonnet-0620-nx': 'claude-3.5-sonnet',
  'claude-3.5-sonnet@0620-nx': 'claude-3.5-sonnet',
  'claude-3-5-sonnet-nx': 'claude-3.5-sonnet',
  'claude-3.5-sonnet-nx': 'claude-3.5-sonnet',
  'claude-3.5-haiku-nx': 'claude-3.5-haiku',
  'gpt-4o-nx': 'gpt-4o',
  'gpt-3.5-turbo-nx': 'gpt-3.5-turbo-16k',
  'gemini-pro-nx': 'gemini-pro',
  'deepseek-v2.5-nx': 'deepseek2.5',
  'llama-3.1-405b-nx': 'llama-3.1-405b',
  'net-gpt-4o-mini-nx': 'net-gpt-4o-mini',
  'yi-lightning-nx': 'yi-lightning',
  'hunyuan-lite-nx': 'hunyuan-lite',
  'glm-4-flash-nx': 'glm-4-flash',
  'deepseek-v3-nx': 'deepseek2.5',
  'spark-max-nx': 'spark-max',
  'qwen-2.5-72b-instruct-nx': 'qwen2572binstruct',
  'ERNIE-Speed-128k-nx': 'ERNIE-Speed-128k',
  'grok-v2-nx': 'grok',
  'llama-3.3-70b-nx': 'llama3370b',
  'claude-3.5-sonnet-poe-nx': 'claude_3_igloo',
  'gemini-2.0-flash-exp-nx': 'gemini_2_falsh',
};

// 提供商对应的API函数映射
const providerApis = {
  blackbox: blackboxAi,
  airforce: airforce,
  nexra: nexra,
  YT: FreeSearch,
  airoom: airoom,
  mhystical: mhystical,
  e2b: e2b,
  chatru: chatru,
  zaiwen: zaiwen
};

// 请求超时时间设置(毫秒)
const TIMEOUT = 240000;

// 延迟函数 - 用于重试间隔
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// 超时处理包装函数
const withTimeout = async (promise, timeout) => {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error('请求超时'));
    }, timeout);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return result;
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
};

// 根据权重和成功率计算提供商优先级
const calculateProviderPriority = (provider) => {
  const stats = providerStats[provider];
  const successRate = stats.success / (stats.success + stats.failure) || 0;
  // 权重占70%，成功率占30%的综合评分
  return (stats.weight * 0.7) + (successRate * 100 * 0.3);
};

// 获取按优先级排序的提供商列表
const getProvidersByPriority = () => {
  return Object.entries(providerStats)
    .sort(([providerA, a], [providerB, b]) => {
      const priorityA = calculateProviderPriority(providerA);
      const priorityB = calculateProviderPriority(providerB);
      return priorityB - priorityA;
    })
    .map(([provider]) => provider);
};

// 更新提供商的成功/失败统计
const updateStats = (provider, isSuccess) => {
  if (isSuccess) {
    providerStats[provider].success++;
  } else {
    providerStats[provider].failure++;
  }
};

// 带重试的单个提供商调用函数
async function callProviderWithRetry(provider, messages, modelName) {
  let retryCount = 0;

  while (retryCount < RETRY_CONFIG.maxRetries) {
    try {
      const apiFunction = providerApis[provider];
      const response = await withTimeout(apiFunction(messages, modelName), TIMEOUT);

      if (response) {
        updateStats(provider, true);
        return { success: true, response };
      }

      retryCount++;
      if (retryCount < RETRY_CONFIG.maxRetries) {
        console.log(`提供商 ${provider} 第 ${retryCount + 1}/${RETRY_CONFIG.maxRetries} 次尝试`);
        await delay(RETRY_CONFIG.retryDelay);
      }

    } catch (error) {
      retryCount++;
      console.error(`${provider} 第 ${retryCount} 次尝试失败:`, error);

      if (retryCount < RETRY_CONFIG.maxRetries) {
        await delay(RETRY_CONFIG.retryDelay);
      }
    }
  }

  updateStats(provider, false);
  return { success: false };
}

// 带重试和失败转移的服务调用函数
const retryWithFallback = async (messages, modelName, availableProviders) => {
  // 如果只有一个可用提供商
  if (availableProviders.length === 1) {
    const provider = availableProviders[0];
    const result = await callProviderWithRetry(provider, messages, modelName);
    return result.success ? result.response : '逆向服务调用失败';
  }

  // 多个提供商时，按优先级尝试
  const sortedProviders = getProvidersByPriority().filter(provider =>
    availableProviders.includes(provider)
  );

  let totalAttempts = 0;

  for (const provider of sortedProviders) {
    // 检查总尝试次数是否超过限制
    if (totalAttempts >= RETRY_CONFIG.maxTotalAttempts) {
      console.error('达到最大总尝试次数限制');
      return '所有逆向服务均失败：达到最大尝试次数';
    }

    const result = await callProviderWithRetry(provider, messages, modelName);
    totalAttempts += RETRY_CONFIG.maxRetries;

    if (result.success) {
      return result.response;
    }
  }

  return '所有逆向服务均失败';
};

// 添加字符串相似度计算函数 (Levenshtein Distance算法)
function getLevenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1,
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1
        );
      }
    }
  }
  return dp[m][n];
}

// 获取相似模型列表
function getSimilarModels(modelName, threshold = 0.7) {
  const cleanModelName = modelName.toLowerCase()
    .replace(/-nx$/, '') // 删除 '-nx' 后缀
    .replace(/[\d\.-]+(?:[a-z]*)/g, '') // 删除数字、点（用于日期或版本号等）、字母组合
    .replace(/[0-9]{4}[-/][0-9]{2}[-/][0-9]{2}/g, '') // 删除日期格式
    .replace(/[0-9]+/g, '') // 删除单独的数字
    .replace(/[-_]/g, ''); // 删除连字符和下划线

  return Object.keys(modelProviderMap)
    .filter(model => model !== modelName) // 排除原始模型
    .map(model => {
      const cleanCurrentModel = model.toLowerCase()
        .replace(/[\d.]+[a-z]*/g, '')
        .replace(/[-_]/g, '');

      const maxLength = Math.max(cleanModelName.length, cleanCurrentModel.length);
      const distance = getLevenshteinDistance(cleanModelName, cleanCurrentModel);
      const similarity = 1 - distance / maxLength;

      return {
        model,
        similarity
      };
    })
    .filter(item => item.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .map(item => item.model);
}

export const NXModelResponse = async (messages, model) => {
  const normalizedModel = modelNameNormalization[model] || model;
  const supportedProviders = modelProviderMap[normalizedModel];

  if (!supportedProviders) {
    return `不支持的模型: ${model}`;
  }

  try {
    // 首先尝试原始模型的所有提供商
    const response = await retryWithFallback(messages, normalizedModel, supportedProviders);

    // 如果原始模型调用成功，直接返回结果
    if (response && response !== '所有逆向服务均失败') {
      return response;
    }

    // 如果原始模型的所有提供商都失败了，尝试相似模型
    console.log(`模型 ${normalizedModel} 的所有提供商均失败，尝试相似模型...`);
    const similarModels = getSimilarModels(normalizedModel);

    for (const similarModel of similarModels) {
      const fallbackProviders = modelProviderMap[similarModel];
      if (fallbackProviders) {
        try {
          console.log(`尝试使用相似模型: ${similarModel}, 提供商: ${fallbackProviders.join(', ')}`);
          const fallbackResponse = await retryWithFallback(messages, similarModel, fallbackProviders);

          if (fallbackResponse && fallbackResponse !== '所有逆向服务均失败') {
            console.log(`成功使用相似模型 ${similarModel} 获得响应`);
            return fallbackResponse;
          }
        } catch (fallbackError) {
          console.error(`相似模型 ${similarModel} 调用失败:`, fallbackError.message);
          continue; // 继续尝试下一个相似模型
        }
      }
    }

    // 如果所有尝试都失败了
    return '所有可用服务（包括相似模型）均失败';

  } catch (error) {
    console.error('服务调用出错:', error.message);
    return `服务调用失败: ${error.message}`;
  }
};

// 用于调试的辅助函数
export const getModelSimilarityInfo = (modelName) => {
  const normalizedModel = modelNameNormalization[modelName] || modelName;
  const similarModels = getSimilarModels(normalizedModel);
  return {
    originalModel: modelName,
    normalizedModel,
    similarModels: similarModels.map(model => ({
      model,
      providers: modelProviderMap[model]
    }))
  };
};

// 获取提供商统计信息和优先级排序
export const getProviderStatistics = () => ({
  stats: { ...providerStats },
  sortedProviders: getProvidersByPriority()
});

// 更新提供商权重的函数
export const updateProviderWeight = (provider, weight) => {
  if (providerStats[provider] && weight >= 1 && weight <= 100) {
    providerStats[provider].weight = weight;
    return true;
  }
  return false;
};