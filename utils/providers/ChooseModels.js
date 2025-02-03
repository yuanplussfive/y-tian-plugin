import { blackboxAi } from "../providers/ChatModels/blackbox/blackbox.js";
import { airforce } from "../providers/ChatModels/airforce/airforce.js";
import { nexra } from "../providers/ChatModels/nexra/nexra.js";
import { FreeSearch } from "../providers/ChatModels/YT/FreeSearch.js";
import { airoom } from "../providers/ChatModels/airoom/airoom.js";
import { mhystical } from "../providers/ChatModels/mhystical/mhystical.js";
import { e2b } from "../providers/ChatModels/e2b/e2b.js";
import { chatru } from "../providers/ChatModels/chatru/chatru.js";
import { zaiwen } from "../providers/ChatModels/zaiwen/zaiwen.js";
import { Chatnio } from "../providers/ChatModels/chatnio/chatnio.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 重试机制的配置参数
const RETRY_CONFIG = {
    maxRetries: 2,
    retryDelay: 1000,
    maxTotalAttempts: 6,
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
    zaiwen: { success: 0, failure: 0, weight: 90 },
    chatnio: { success: 0, failure: 0, weight: 95 }
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
        const modelConfig = JSON.parse(fs.readFileSync(modelConfigPath, 'utf-8'));
        providerModelConfigs[provider] = modelConfig;
    }
});

// 定义模型与提供商的映射关系
const modelProviderMap = {};
Object.keys(providerModelConfigs).forEach(provider => {
    const providerModels = providerModelConfigs[provider].models;
    if(providerModels){ // 确保providerModels存在
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

console.log(modelProviderMap)
// 模型名称标准化映射 (这里可以简化，直接使用别名映射)
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
    blackbox: blackboxAi,
    airforce: airforce,
    nexra: nexra,
    YT: FreeSearch,
    airoom: airoom,
    mhystical: mhystical,
    e2b: e2b,
    chatru: chatru,
    zaiwen: zaiwen,
    chatnio: Chatnio
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
async function callProviderWithRetry(provider, messages, modelName, timeout) {
    let retryCount = 0;

    while (retryCount < RETRY_CONFIG.maxRetries) {
        try {
            const apiFunction = providerApis[provider];
            // 获取 providerModelName
            const providerModel = providerModelConfigs[provider]?.models?.[modelName]
            const providerModelName = providerModel?.providerModelName || modelName;

            const response = await withTimeout(apiFunction(messages, providerModelName), timeout);

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
const retryWithFallback = async (messages, modelName, availableProviders, timeout) => {
    // 如果只有一个可用提供商
    if (availableProviders.length === 1) {
        const provider = availableProviders[0];
        const result = await callProviderWithRetry(provider, messages, modelName, timeout);
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

        const result = await callProviderWithRetry(provider, messages, modelName, timeout);
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
function getSimilarModels(modelName, initialThreshold = 0.7, thresholdStep = 0.05) {
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
            console.warn(`找不到合适的相似模型，使用最相似的模型：${similarModels[0]}`);
            return [similarModels[0]]; // 返回最相似的模型
        }
    }

    return similarModels;
}

// 默认兜底模型
const DEFAULT_FALLBACK_MODEL = 'gpt-3.5-turbo-16k';

export const NXModelResponse = async (messages, model) => {
    const normalizedModel = modelNameNormalization[model] || model;
    const supportedProviders = modelProviderMap[normalizedModel];
    const timeout = modelTimeouts[normalizedModel] || DEFAULT_TIMEOUT;

    console.log(normalizedModel)
    if (!supportedProviders) {
        return `不支持的模型: ${model}`;
    }

    try {
        // 首先尝试原始模型的所有提供商
        const response = await retryWithFallback(messages, normalizedModel, supportedProviders, timeout);

        // 如果原始模型调用成功，直接返回结果
        if (response && !(/失败|逆向/.test(response))) {
            return response;
        }

        // 如果原始模型的所有提供商都失败了，尝试相似模型
        console.log(`模型 ${normalizedModel} 的所有提供商均失败，尝试相似模型...`);
        let similarModels = getSimilarModels(normalizedModel);

        // 如果没有找到相似模型，使用默认兜底模型
        if (similarModels.length === 0) {
            console.log(`没有找到相似模型，使用默认兜底模型: ${DEFAULT_FALLBACK_MODEL}`);
            similarModels = [DEFAULT_FALLBACK_MODEL];
        }

        for (const similarModel of similarModels) {
            const fallbackProviders = modelProviderMap[similarModel];
            const fallbackTimeout = modelTimeouts[similarModel] || DEFAULT_TIMEOUT;
            if (fallbackProviders) {
                try {
                    console.log(`尝试使用相似模型: ${similarModel}, 提供商: ${fallbackProviders.join(', ')}`);
                    const fallbackResponse = await retryWithFallback(messages, similarModel, fallbackProviders, fallbackTimeout);

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
