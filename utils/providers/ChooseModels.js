import { blackboxAi } from "../providers/ChatModels/blackbox/blackbox.js";
import { airforce } from "../providers/ChatModels/airforce/airforce.js";
import { nexra } from "../providers/ChatModels/nexra/nexra.js";
import { FreeSearch } from "../providers/ChatModels/YT/FreeSearch.js";
import { airoom } from "../providers/ChatModels/airoom/airoom.js";
import { mhystical } from "../providers/ChatModels/mhystical/mhystical.js";

// 存储服务商的成功/失败统计
const providerStats = {
  blackbox: { success: 0, failure: 0 },
  airforce: { success: 0, failure: 0 },
  nexra: { success: 0, failure: 0 },
  YT: { success: 0, failure: 0 },
  airoom: { success: 0, failure: 0 },
  mhystical: { success: 0, failure: 0 },
};

// 定义模型与提供商的映射关系
const modelProviderMap = {
  'claude-3.5-sonnet': ['airoom', 'blackbox'],
  'claude-3.5-haiku': ['airoom'],
  'deepseek': ['airoom'],
  'gemini-pro': ['blackbox'],
  'gpt-4o': ['airoom', 'blackbox', 'airforce', 'nexra'],
  'gpt-4o-mini': ['airoom', 'nexra'],
  'gpt-3.5-turbo-16k': ['mhystical'],
  'net-gpt-4o-mini': ['YT'],
  'llama-3.1-405b': ['blackbox'],
};

// 模型名称标准化映射
const modelNameNormalization = {
  'claude-3-5-sonnet-0620-nx': 'claude-3.5-sonnet',
  'claude-3.5-sonnet@0620-nx': 'claude-3.5-sonnet',
  'claude-3-5-sonnet-nx': 'claude-3.5-sonnet',
  'claude-3.5-sonnet-nx': 'claude-3.5-sonnet',
  'claude-3.5-haiku-nx': 'claude-3.5-haiku',
  'gpt-4o-nx': 'gpt-4o',
  'gpt-3.5-turbo-nx': 'gpt-3.5-turbo-16k',
  'gemini-pro-nx': 'gemini-pro',
  'deepseek-v2.5-nx': 'deepseek',
  'llama-3.1-405b-nx': 'llama-3.1-405b',
  'net-gpt-4o-mini-nx': 'net-gpt-4o-mini',
};

// 提供商对应的API函数映射
const providerApis = {
  blackbox: blackboxAi,
  airforce: airforce,
  nexra: nexra,
  YT: FreeSearch,
  airoom: airoom,
  mhystical: mhystical
};

const TIMEOUT = 120000;

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

const getProvidersBySuccess = () => {
  return Object.entries(providerStats)
    .sort(([, a], [, b]) => {
      const successRateA = a.success / (a.success + a.failure) || 0;
      const successRateB = b.success / (b.success + b.failure) || 0;
      return successRateB - successRateA;
    })
    .map(([provider]) => provider);
};

const updateStats = (provider, isSuccess) => {
  if (isSuccess) {
    providerStats[provider].success++;
  } else {
    providerStats[provider].failure++;
  }
};

const retryWithFallback = async (messages, modelName, availableProviders) => {
  const sortedProviders = getProvidersBySuccess().filter(provider =>
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

export const getProviderStatistics = () => ({
  stats: { ...providerStats },
  sortedProviders: getProvidersBySuccess()
});