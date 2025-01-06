import { blackboxAi } from "../providers/ChatModels/blackbox/blackbox.js";
import { airforce } from "../providers/ChatModels/airforce/airforce.js";
import { nexra } from "../providers/ChatModels/nexra/nexra.js";
import { FreeSearch } from "../providers/ChatModels/YT/FreeSearch.js";
import { airoom } from "../providers/ChatModels/airoom/airoom.js";
import { mhystical } from "../providers/ChatModels/mhystical/mhystical.js";
import { e2b } from "../providers/ChatModels/e2b/e2b.js";
import { chatru } from "../providers/ChatModels/chatru/chatru.js";
import { zaiwen } from "../providers/ChatModels/zaiwen/zaiwen.js";

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
  'claude_3_igloo': ['zaiwen'],
  'claude-3.5-sonnet-20241022': ['e2b'],
  'claude-3.5-sonnet': ['blackbox', 'chatru', 'airoom'],
  'claude-3.5-haiku': ['e2b', 'airoom'],
  'deepseek': ['zaiwen'],
  'gemini-pro': ['chatru', 'blackbox'],
  'gpt-4o': ['blackbox', 'e2b', 'airforce', 'nexra'],
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

// 带重试和失败转移的服务调用函数
const retryWithFallback = async (messages, modelName, availableProviders) => {
  // 如果只有一个可用提供商，直接使用它
  if (availableProviders.length === 1) {
    const provider = availableProviders[0];
    try {
      const apiFunction = providerApis[provider];
      const response = await withTimeout(apiFunction(messages, modelName), TIMEOUT);
      updateStats(provider, !!response);
      return response || '逆向服务调用失败';
    } catch (error) {
      console.error(`${provider} failed:`, error);
      updateStats(provider, false);
      return '逆向服务调用失败';
    }
  }

  // 多个提供商时，按优先级尝试
  const sortedProviders = getProvidersByPriority().filter(provider =>
    availableProviders.includes(provider)
  );

  for (const provider of sortedProviders) {
    try {
      const apiFunction = providerApis[provider];
      const response = await withTimeout(apiFunction(messages, modelName), TIMEOUT);

      if (response) {
        updateStats(provider, true);
        return response;
      }
    } catch (error) {
      console.error(`${provider} failed:`, error);
      updateStats(provider, false);
      continue;
    }
  }
  return '所有逆向服务均失败';
};

// 主要的模型响应处理函数
export const NXModelResponse = async (messages, model) => {
  const normalizedModel = modelNameNormalization[model] || model;
  const supportedProviders = modelProviderMap[normalizedModel];

  if (!supportedProviders) {
    return `不支持的模型: ${model}`;
  }

  try {
    return await retryWithFallback(messages, normalizedModel, supportedProviders);
  } catch (error) {
    console.error('所有服务均失败:', error.message);
    return `所有逆向服务均失败: ${error.message}`;
  }
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