import { blackbox } from "../providers/ChatModels/blackbox/blackbox.js";
import { airforce } from "../providers/ChatModels/airforce/airforce.js";
import { nexra } from "../providers/ChatModels/nexra/nexra.js";
import { FreeSearch } from "../providers/ChatModels/YT/FreeSearch.js";
import { airoom } from "../providers/ChatModels/airoom/airoom.js";
import { mhystical } from "../providers/ChatModels/mhystical/mhystical.js";
import { e2b } from "../providers/ChatModels/e2b/e2b.js";
import { chatru } from "../providers/ChatModels/chatru/chatru.js";
import { zaiwen } from "../providers/ChatModels/zaiwen/zaiwen.js";
import { Chatnio } from "../providers/ChatModels/chatnio/chatnio.js";
import { pollinations } from "../providers/ChatModels/pollinations/pollinations.js";
import { glider } from "../providers/ChatModels/glider/glider.js";
import { gizai } from "../providers/ChatModels/gizai/gizai.js";
import { jmuz } from "../providers/ChatModels/jmuz/jmuz.js";
import { AnthropicDoc } from "../providers/ChatModels/AnthropicDoc/AnthropicDoc.js";
import { reka } from "../providers/ChatModels/reka/reka.js";
import { SlackAi } from "../providers/ChatModels/slack/slack.js";
import { cursor } from "../providers/ChatModels/cursor/cursor.js";
import { ddg } from "../providers/ChatModels/ddg/ddg.js";
import { PromPlateAi } from "../providers/ChatModels/PromPlateAi/PromPlateAi.js";
import { genspark } from "../providers/ChatModels/genspark/genspark.js";
import { deepseek_thinking } from "./config.js";
import { ThinkingProcessor } from "./ThinkingProcessor.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// 重试机制的配置参数
const RETRY_CONFIG = {
  maxRetries: 2, // 最大重试次数
  retryDelay: 1000, // 重试延迟（毫秒）
  maxTotalAttempts: 6, // 最大总尝试次数
};

// 存储服务商的成功/失败统计和权重配置
const providerStats = {
  blackbox: { success: 0, failure: 0, weight: 75 },
  airforce: { success: 0, failure: 0, weight: 50 },
  nexra: { success: 0, failure: 0, weight: 50 },
  YT: { success: 0, failure: 0, weight: 50 },
  airoom: { success: 10, failure: 0, weight: 45 },
  mhystical: { success: 0, failure: 0, weight: 40 },
  e2b: { success: 0, failure: 0, weight: 85 },
  chatru: { success: 0, failure: 0, weight: 89 },
  zaiwen: { success: 0, failure: 0, weight: 90 },
  chatnio: { success: 0, failure: 0, weight: 95 },
  pollinations: { success: 0, failure: 0, weight: 88 },
  glider: { success: 0, failure: 0, weight: 92 },
  gizai: { success: 0, failure: 0, weight: 90 },
  jmuz: { success: 0, failure: 0, weight: 70 },
  AnthropicDoc: { success: 0, failure: 0, weight: 100 },
  reka: { success: 0, failure: 0, weight: 100 },
  slack: { success: 0, failure: 0, weight: 100 },
  PromPlateAi: { success: 0, failure: 0, weight: 90 },
  cursor: { success: 0, failure: 0, weight: 100 },
  ddg: { success: 0, failure: 0, weight: 100 },
  genspark: { success: 0, failure: 0, weight: 92 },
};

// 获取当前文件所在的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载所有提供商的模型配置
const providerModelConfigs = {};
const chatModelDir = path.join(__dirname, '../providers/ChatModels'); // 使用相对于当前文件的绝对路径
fs.readdirSync(chatModelDir).forEach(provider => {
  const modelConfigPath = path.join(chatModelDir, provider, 'model.json');
  if (fs.existsSync(modelConfigPath)) {
      try {
          const modelConfig = JSON.parse(fs.readFileSync(modelConfigPath, 'utf-8'));
          providerModelConfigs[provider] = modelConfig;
      } catch (error) {
          console.error(`Error parsing model config for provider ${provider}:`, error);
      }
  }
});

// 定义模型与提供商的映射关系
const modelProviderMap = {};
Object.keys(providerModelConfigs).forEach(provider => {
  const providerModels = providerModelConfigs[provider].models;
  if (providerModels) { // 确保providerModels存在
      Object.keys(providerModels).forEach(modelName => {
          const modelConfig = providerModels[modelName];
          if (!modelProviderMap[modelName]) {
              modelProviderMap[modelName] = [];
          }
          if (!modelProviderMap[modelName].includes(provider)) {
              modelProviderMap[modelName].push(provider);
          }
          if (modelConfig.aliases) {
              modelConfig.aliases.forEach(alias => {
                  if (!modelProviderMap[alias]) {
                      modelProviderMap[alias] = [];
                  }
                  if (!modelProviderMap[alias].includes(provider)) {
                      modelProviderMap[alias].push(provider);
                  }
              });
          }
      });
  }
});

// 模型名称标准化映射
const modelNameNormalization = {};
Object.keys(providerModelConfigs).forEach(provider => {
  const providerModels = providerModelConfigs[provider].models;
  Object.keys(providerModels).forEach(modelName => {
      const modelConfig = providerModels[modelName];
      if (modelConfig.aliases) {
          modelConfig.aliases.forEach(alias => {
              modelNameNormalization[alias] = modelName;
          });
      }
  });
});

// 提供商对应的API函数映射
const providerApis = {
  blackbox: blackbox,
  airforce: airforce,
  nexra: nexra,
  YT: FreeSearch,
  airoom: airoom,
  mhystical: mhystical,
  e2b: e2b,
  chatru: chatru,
  zaiwen: zaiwen,
  chatnio: Chatnio,
  pollinations: pollinations,
  glider: glider,
  gizai: gizai,
  jmuz: jmuz,
  AnthropicDoc: AnthropicDoc,
  reka: reka,
  slack: SlackAi,
  PromPlateAi: PromPlateAi,
  cursor: cursor,
  ddg: ddg,
  genspark: genspark
};

// 默认超时时间 (3分钟)
const DEFAULT_TIMEOUT = 180000;

// 模型超时时间配置
const modelTimeouts = {
  'gpt-4o': 120000, // 2分钟
  'claude-3.5-sonnet': 120000, // 2分钟
  'gemini-pro': 120000, // 2分钟
  'gpt-3.5-turbo-16k': 120000, // 2分钟
  'net-gpt-4o-mini': 120000, // 2分钟
  'llama-3.1-405b': 120000, // 2分钟
  'qwen-qwq-32b-preview': 240000, // 4分钟
  'gemini-1.5-pro': 90000, // 1.5分钟
  'gemini-1.5-flash-vision': 90000, // 1.5分钟
  'gpt-4o-vision': 120000, // 2分钟
  'o1-mini': 120000, // 2分钟
  'o1-preview': 300000, // 5分钟
  'gemini-2-flash-thinking-exp': 300000, // 5分钟
  'deepseek-r1': 360000, // 6分钟
  'deepseek-reasoner': 360000, // 6分钟
};

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
async function callProviderWithRetry(provider, messages, modelName, timeout, logger) {
  let retryCount = 0;
  const startTime = Date.now(); // 记录请求开始时间
  const providerModel = providerModelConfigs[provider]?.models?.[modelName];
  const providerModelName = providerModel?.providerModelName || modelName;

  // 记录开始请求的详细信息
  logger.debug(`开始请求：使用 ${chalk.cyan(provider)} 提供商，模型 ${chalk.yellow(modelName)} 映射为 ${chalk.yellow(providerModelName)}，第 ${retryCount + 1}/${RETRY_CONFIG.maxRetries} 次重试`);

  while (retryCount < RETRY_CONFIG.maxRetries) {
      try {
          const apiFunction = providerApis[provider];

          // 记录尝试请求的详细信息
          logger.debug(`尝试请求：${chalk.cyan(provider)} 提供商，模型 ${chalk.yellow(providerModelName)}, 第 ${retryCount + 1}/${RETRY_CONFIG.maxRetries} 次重试`);
          const response = await withTimeout(apiFunction(messages, providerModelName), timeout);
          const endTime = Date.now(); // 记录请求结束时间
          const duration = endTime - startTime; // 计算请求耗时

          if (response) {
              updateStats(provider, true);
              logger.info(`${chalk.green('成功')} 从 ${chalk.cyan(provider)} 提供商获取响应，模型 ${chalk.yellow(providerModelName)}，耗时 ${chalk.magenta(duration / 1000)} s`);
              return { success: true, response };
          }

          retryCount++;
          if (retryCount < RETRY_CONFIG.maxRetries) {
              logger.debug(`提供商 ${chalk.cyan(provider)} 第 ${retryCount + 1}/${RETRY_CONFIG.maxRetries} 次重试`);
              await delay(RETRY_CONFIG.retryDelay);
          }

      } catch (error) {
          retryCount++;
          const endTime = Date.now(); // 记录请求结束时间
          const duration = endTime - startTime; // 计算请求耗时
          logger.error(`${chalk.red('错误')} 在 ${chalk.cyan(provider)} 提供商，第 ${retryCount} 次重试，耗时 ${chalk.magenta(duration / 1000)} s:`, error);

          if (retryCount < RETRY_CONFIG.maxRetries) {
              await delay(RETRY_CONFIG.retryDelay);
          }
      }
  }

  updateStats(provider, false);
  const endTime = Date.now(); // 记录请求结束时间
  const duration = endTime - startTime; // 计算请求耗时
  logger.warn(`${chalk.yellow('失败')} 所有重试尝试，提供商 ${chalk.cyan(provider)}，耗时 ${chalk.magenta(duration / 1000)} s`);
  return { success: false };
}

// 带重试和失败转移的服务调用函数
const retryWithFallback = async (messages, modelName, availableProviders, timeout, logger) => {
  // 如果只有一个可用提供商
  if (availableProviders.length === 1) {
      const provider = availableProviders[0];
      logger.debug(`只有一个可用提供商 ${chalk.cyan(provider)}，模型 ${chalk.yellow(modelName)}`);
      const result = await callProviderWithRetry(provider, messages, modelName, timeout, logger);
      return result.success ? result.response?.trim() : '逆向服务调用失败';
  }

  // 多个提供商时，按优先级尝试
  const sortedProviders = getProvidersByPriority().filter(provider =>
      availableProviders.includes(provider)
  );

  logger.debug(`模型 ${chalk.yellow(modelName)} 的提供商按优先级排序: ${chalk.cyan(sortedProviders.join(', '))}`);

  let totalAttempts = 0;

  for (const provider of sortedProviders) {
      // 记录当前尝试的提供商
      logger.debug(`尝试提供商：${chalk.cyan(provider)}，模型：${chalk.yellow(modelName)}，总尝试次数：${totalAttempts + 1}/${RETRY_CONFIG.maxTotalAttempts}`);
      // 检查总尝试次数是否超过限制
      if (totalAttempts >= RETRY_CONFIG.maxTotalAttempts) {
          logger.error(`${chalk.red('达到最大总尝试次数限制')}`);
          return '所有逆向服务均失败：达到最大尝试次数';
      }

      const result = await callProviderWithRetry(provider, messages, modelName, timeout, logger);
      totalAttempts += RETRY_CONFIG.maxRetries;

      if (result.success) {
          return result.response?.trim();
      }
  }

  logger.warn(`${chalk.yellow('所有提供商都失败')}，模型 ${chalk.yellow(modelName)}`);
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

// 模型名称预处理函数
const preprocessModelName = (modelName) => {
  return modelName.toLowerCase()
      .replace(/-nx$/, '')
      .replace(/[\d\.-]+(?:[a-z]*)/g, '')
      .replace(/[0-9]{4}[-/][0-9]{2}[-/][0-9]{2}/g, '')
      .replace(/[0-9]+/g, '')
      .replace(/[-_]/g, '');
};

// 获取相似模型列表
function getSimilarModels(modelName, initialThreshold = 0.7, thresholdStep = 0.05, logger) {
  const cleanModelName = preprocessModelName(modelName);
  let currentThreshold = initialThreshold;
  let similarModels = [];

  while (currentThreshold >= 0.2 && similarModels.length === 0) { // 确保至少有一个相似模型，最低阈值设置为0.2
      similarModels = Object.keys(modelProviderMap)
          .filter(model => model !== modelName)
          .map(model => {
              const cleanCurrentModel = preprocessModelName(model);
              const maxLength = Math.max(cleanModelName.length, cleanCurrentModel.length);
              const distance = getLevenshteinDistance(cleanModelName, cleanCurrentModel);
              const similarity = 1 - distance / maxLength;

              // 优先考虑提供商重叠的模型
              const providerOverlap = modelProviderMap[model].filter(provider => modelProviderMap[modelName]?.includes(provider)).length;
              return {
                  model,
                  similarity,
                  providerOverlap,
                  historySuccessRate: providerStats[modelProviderMap[model]?.[0]]?.success / (providerStats[modelProviderMap[model]?.[0]]?.success + providerStats[modelProviderMap[model]?.[0]]?.failure) || 0
              };
          })
          .filter(item => item.similarity >= currentThreshold)
          .sort((a, b) => {
              // 优先考虑提供商重叠、历史成功率，然后才是相似度
              if (b.providerOverlap !== a.providerOverlap) {
                  return b.providerOverlap - a.providerOverlap;
              }
              if (b.historySuccessRate !== a.historySuccessRate) {
                  return b.historySuccessRate - a.historySuccessRate
              }
              return b.similarity - a.similarity;
          })
          .map(item => item.model);

      currentThreshold -= thresholdStep;
  }

  // 如果在所有阈值下都找不到相似模型，则返回一个最相似的模型（即使相似度较低）
  if (similarModels.length === 0) {
      similarModels = Object.keys(modelProviderMap)
          .filter(model => model !== modelName)
          .map(model => {
              const cleanCurrentModel = preprocessModelName(model);
              const maxLength = Math.max(cleanModelName.length, cleanCurrentModel.length);
              const distance = getLevenshteinDistance(cleanModelName, cleanCurrentModel);
              const similarity = 1 - distance / maxLength;
              return {
                  model,
                  similarity
              }
          })
          .sort((a, b) => b.similarity - a.similarity)
          .map(item => item.model);
      if (similarModels.length > 0) {
          logger.warn(`找不到合适的相似模型，使用最相似的模型：${chalk.yellow(similarModels[0])}`);
          return [similarModels[0]]; // 返回最相似的模型
      }
  }

  logger.debug(`为模型 ${chalk.yellow(modelName)} 找到的相似模型：${chalk.cyan(similarModels.join(', '))}`);
  return similarModels;
}

// 默认兜底模型
const DEFAULT_FALLBACK_MODEL = 'gpt-4o';


class Logger {
  constructor(options = {}) {
      // 日志级别设置，默认为 debug
      this.logLevel = options.logLevel || 'debug'; // debug, info, warn, error
  }

  // 日志输出函数
  log(level, message, error = null) {
      const levels = {
          debug: 0,
          info: 1,
          warn: 2,
          error: 3
      };

      if (levels[level] >= levels[this.logLevel]) {
          const timestamp = new Date().toLocaleTimeString();
          let logMessage = `${chalk.gray(`[${timestamp}]`)} ${message}`;

          if (error) {
              logMessage += `\n${chalk.red(error.stack || error.message || error)}`;
          }

          console.log(logMessage);
      }
  }

  debug(message, error = null) {
      this.log('debug', chalk.blue(`[调试] `) + message, error);
  }

  info(message, error = null) {
      this.log('info', chalk.green(`[信息] `) + message, error);
  }

  warn(message, error = null) {
      this.log('warn', chalk.yellow(`[警告] `) + message, error);
  }

  error(message, error = null) {
      this.log('error', chalk.red(`[错误] `) + message, error);
  }
}

export const NXModelResponse = async (messages, model, options = {}) => {
  const logger = new Logger(options);
  const startTime = Date.now(); // 记录整个请求开始时间

  let provider = null;
  let modelName = model;

  // 检查是否指定了服务商和模型，格式为 "provider/modelName"
  if (model.includes('/')) {
      const [specifiedProvider, specifiedModelName] = model.split('/');
      if (providerApis[specifiedProvider]) {
          provider = specifiedProvider;
          modelName = specifiedModelName;
      } else {
          logger.warn(`指定的提供商 ${chalk.cyan(specifiedProvider)} 无效，将尝试自动选择`);
      }
  }

  const normalizedModel = modelNameNormalization[modelName] || modelName;
  let supportedProviders = modelProviderMap[normalizedModel];
  const timeout = modelTimeouts[normalizedModel] || DEFAULT_TIMEOUT;

  logger.debug(`收到模型请求：${chalk.yellow(model)}，解析后模型名称：${chalk.yellow(modelName)}，标准化模型名称：${chalk.yellow(normalizedModel)}`);

  if (!supportedProviders && !provider) {
      logger.warn(`不支持的模型：${chalk.yellow(modelName)}`);
      return `不支持的模型: ${modelName}`;
  }

  try {
      let response;

      if (provider) {
          // 如果指定了服务商，则直接调用该服务商
          if (!supportedProviders?.includes(provider)) {
              logger.warn(`指定的提供商 ${chalk.cyan(provider)} 不支持模型 ${chalk.yellow(normalizedModel)}`);
              return `指定的提供商 ${provider} 不支持模型 ${normalizedModel}`;
          }
          logger.debug(`尝试使用指定的提供商 ${chalk.cyan(provider)} 和模型 ${chalk.yellow(normalizedModel)}`);
          const result = await callProviderWithRetry(provider, messages, normalizedModel, timeout, logger);
          response = result.success ? result.response?.trim() : '指定服务商调用失败';
      } else {
          // 否则，尝试自动选择提供商
          logger.debug(`开始尝试原始模型：${chalk.yellow(normalizedModel)}，可用提供商：${chalk.cyan(supportedProviders.join(', '))}`);
          response = await retryWithFallback(messages, normalizedModel, supportedProviders, timeout, logger);
      }

      const endTime = Date.now(); // 记录整个请求结束时间
      const duration = endTime - startTime; // 计算整个请求耗时

      // 如果原始模型调用成功，直接返回结果
      if (response && !(/失败|逆向/.test(response))) {
          logger.info(`成功使用模型 ${chalk.yellow(normalizedModel)} 获取响应，总耗时 ${chalk.magenta(duration / 1000)} s`);

          // 添加deepseek处理逻辑
          if (normalizedModel.includes('deepseek') && !deepseek_thinking) {
              response = ThinkingProcessor.removeThinking(response);
              logger.info(`使用 deleteBeforeThink 处理 deepseek 模型 ${chalk.yellow(normalizedModel)} 的响应`);
          }

          return response;
      }

      // 如果原始模型的所有提供商都失败了，尝试相似模型
      logger.warn(`模型 ${chalk.yellow(normalizedModel)} 的所有提供商均失败，尝试相似模型...`);
      let similarModels = getSimilarModels(normalizedModel, 0.7, 0.05, logger);

      // 如果没有找到相似模型，使用默认兜底模型
      if (similarModels.length === 0) {
          logger.warn(`没有找到相似模型，使用默认兜底模型：${chalk.yellow(DEFAULT_FALLBACK_MODEL)}`);
          similarModels = [DEFAULT_FALLBACK_MODEL];
      }

      for (const similarModel of similarModels) {
          const fallbackProviders = modelProviderMap[similarModel];
          const fallbackTimeout = modelTimeouts[similarModel] || DEFAULT_TIMEOUT;
          const startTimeSimilar = Date.now(); // 记录相似模型请求开始时间
          if (fallbackProviders) {
              try {
                  logger.debug(`尝试使用相似模型：${chalk.yellow(similarModel)}，提供商：${chalk.cyan(fallbackProviders.join(', '))}`);
                  let fallbackResponse = await retryWithFallback(messages, similarModel, fallbackProviders, fallbackTimeout, logger);
                  const endTimeSimilar = Date.now(); // 记录相似模型请求结束时间
                  const durationSimilar = endTimeSimilar - startTimeSimilar; // 计算相似模型请求耗时
                  if (fallbackResponse && fallbackResponse !== '所有逆向服务均失败') {
                      logger.info(`成功使用相似模型 ${chalk.yellow(similarModel)} 获取响应，耗时 ${chalk.magenta(durationSimilar / 1000)} s`);

                       // 添加deepseek处理逻辑
                       if (similarModel.includes('deepseek') && !deepseek_thinking) {
                          fallbackResponse = ThinkingProcessor.removeThinking(fallbackResponse);
                          logger.info(`使用 deleteBeforeThink 处理 deepseek 模型 ${chalk.yellow(similarModel)} 的响应`);
                      }


                      return fallbackResponse;
                  }
              } catch (fallbackError) {
                  logger.error(`相似模型 ${chalk.yellow(similarModel)} 调用失败：`, fallbackError);
                  continue; // 继续尝试下一个相似模型
              }
          }
      }

      // 如果所有尝试都失败了
      logger.error(`所有可用服务（包括相似模型）均失败`);
      const endTimeAll = Date.now(); // 记录整个请求结束时间
      const durationAll = endTimeAll - startTime; // 计算整个请求耗时
      logger.error(`所有可用服务（包括相似模型）均失败, 总耗时 ${chalk.magenta(durationAll / 1000)} s`);
      return '所有可用服务（包括相似模型）均失败';

  } catch (error) {
      const endTimeAll = Date.now(); // 记录整个请求结束时间
      const durationAll = endTimeAll - startTime; // 计算整个请求耗时
      logger.error(`服务调用出错，总耗时 ${chalk.magenta(durationAll / 1000)} s：`, error);
      return `服务调用失败: ${error.message}`;
  }
};

// 用于调试的辅助函数
export const getModelSimilarityInfo = (modelName, options = {}) => {
  const logger = new Logger(options);
  const normalizedModel = modelNameNormalization[modelName] || modelName;
  const similarModels = getSimilarModels(normalizedModel, 0.7, 0.05, logger);
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
export const getProviderStatistics = (options = {}) => {
  const logger = new Logger(options);
  logger.debug(`请求提供商统计信息`);
  return {
      stats: { ...providerStats },
      sortedProviders: getProvidersByPriority()
  };
};

// 更新提供商权重的函数
export const updateProviderWeight = (provider, weight, options = {}) => {
  const logger = new Logger(options);
  if (providerStats[provider] && weight >= 1 && weight <= 100) {
      providerStats[provider].weight = weight;
      logger.info(`提供商 ${chalk.cyan(provider)} 的权重更新为 ${chalk.yellow(weight)}`);
      return true;
  }
  logger.warn(`提供商 ${chalk.cyan(provider)} 无效或权重值无效`);
  return false;
};

// 获取所有模型和提供商，按照提供商调用顺序排列
export const getAllModelsWithProviders = (options = {}) => {
  const logger = new Logger(options);
  logger.debug(`请求所有模型和提供商信息`);

  const modelsWithProviders = {};

  // 获取按优先级排序的提供商列表
  const sortedProviders = getProvidersByPriority();

  // 遍历排序后的提供商列表
  sortedProviders.forEach(provider => {
      // 遍历所有模型，查找当前提供商支持的模型
      Object.keys(modelProviderMap).forEach(model => {
          if (modelProviderMap[model].includes(provider)) {
              if (!modelsWithProviders[model]) {
                  modelsWithProviders[model] = [];
              }
              if (!modelsWithProviders[model].includes(provider)) {
                  modelsWithProviders[model].push(provider);
              }
          }
      });
  });

  return modelsWithProviders;
};