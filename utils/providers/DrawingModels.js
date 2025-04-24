import { ZaiwenDrawing } from "../providers/DrawingModels/zaiwen/zaiwen.js";
import { liblibClient } from "../providers/DrawingModels/liblib/liblibClient.js";
import { huggingfaceClient } from "../providers/DrawingModels/huggingface/huggingfaceClient.js";
import { jimengClient } from "../providers/DrawingModels/jimeng/jimengClient.js";
import { imagelabs } from "../providers/DrawingModels/imagelabs/imagelabs.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// 重试机制的配置参数
const RETRY_CONFIG = {
    maxRetries: 2,
    retryDelay: 100,
};

// 存储服务商的成功/失败统计和权重配置
const providerStats = {
    zaiwen: { success: 0, failure: 0, weight: 100 },
    liblib: { success: 0, failure: 0, weight: 100 },
    huggingface: { success: 0, failure: 0, weight: 100 },
    jimeng: { success: 0, failure: 0, weight: 100 },
    imagelabs: { success: 0, failure: 0, weight: 100 },
};

// 获取当前文件所在的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载所有提供商的模型配置
const providerModelConfigs = {};
const chatModelDir = path.join(__dirname, '../providers/DrawingModels'); // 使用相对于当前文件的绝对路径
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
    zaiwen: ZaiwenDrawing,
    liblib: liblibClient,
    huggingface: huggingfaceClient,
    jimeng: jimengClient,
    imagelabs: imagelabs,
};

// 默认超时时间 (3分钟)
const DEFAULT_TIMEOUT = 180000;

// 模型超时时间配置
const modelTimeouts = {
    'gpt-4o': 120000,
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
    // Avoid division by zero
    const successRate = (stats.success + stats.failure) > 0 ? stats.success / (stats.success + stats.failure) : 0;
    // Simple weighted sum of weight and success rate (scaled)
    return (stats.weight * 0.7) + (successRate * 100 * 0.3);
};

// 获取按优先级排序的提供商列表 (所有提供商)
const getProvidersByPriority = () => {
    return Object.entries(providerStats)
        .sort(([providerA, a], [providerB, b]) => {
            const priorityA = calculateProviderPriority(providerA);
            const priorityB = calculateProviderPriority(providerB);
            return priorityB - priorityA; // Descending order
        })
        .map(([provider]) => provider);
};

// 更新提供商的成功/失败统计
const updateStats = (provider, isSuccess) => {
    if (providerStats[provider]) {
        if (isSuccess) {
            providerStats[provider].success++;
        } else {
            providerStats[provider].failure++;
        }
    }
};

// 带重试的单个提供商调用函数
async function callProviderWithRetry(provider, prompt, modelName, timeout, logger) {
    let retryCount = 0;
    const startTime = Date.now(); // 记录请求开始时间
    const providerModel = providerModelConfigs[provider]?.models?.[modelName];
    const providerModelName = providerModel?.providerModelName || modelName;

    // 记录开始请求的详细信息
    logger.debug(`开始请求：使用 ${chalk.cyan(provider)} 提供商，模型 ${chalk.yellow(modelName)} 映射为 ${chalk.yellow(providerModelName)}`);

    while (retryCount <= RETRY_CONFIG.maxRetries) { // Use <= for maxRetries attempts total (initial + retries)
        try {
            const apiFunction = providerApis[provider];

            if (!apiFunction) {
                 logger.error(`${chalk.red('错误')} 提供商 ${chalk.cyan(provider)} 的 API 函数未定义`);
                 updateStats(provider, false);
                 return { success: false, error: `提供商 ${provider} 的 API 函数未定义` };
            }

            // 记录尝试请求的详细信息
            logger.debug(`尝试请求：${chalk.cyan(provider)} 提供商，模型 ${chalk.yellow(providerModelName)}, 第 ${retryCount + 1}/${RETRY_CONFIG.maxRetries + 1} 次尝试`);
            const response = await withTimeout(apiFunction(prompt, providerModelName), timeout);
            const endTime = Date.now(); // 记录请求结束时间
            const duration = endTime - startTime; // 计算请求耗时

            if (response) {
                updateStats(provider, true);
                logger.info(`${chalk.green('成功')} 从 ${chalk.cyan(provider)} 提供商获取响应，模型 ${chalk.yellow(providerModelName)}，耗时 ${chalk.magenta(duration / 1000)} s`);
                return { success: true, response };
            }

            // If response is null/undefined but no error, treat as failure for retry
            logger.warn(`提供商 ${chalk.cyan(provider)} 返回空响应，第 ${retryCount + 1}/${RETRY_CONFIG.maxRetries + 1} 次尝试失败`);
            retryCount++;
            if (retryCount <= RETRY_CONFIG.maxRetries) {
                 logger.debug(`提供商 ${chalk.cyan(provider)} 第 ${retryCount + 1}/${RETRY_CONFIG.maxRetries + 1} 次重试`);
                 await delay(RETRY_CONFIG.retryDelay);
            }

        } catch (error) {
            retryCount++;
            const endTime = Date.now(); // 记录请求结束时间
            const duration = endTime - startTime; // 计算请求耗时
            logger.error(`${chalk.red('错误')} 在 ${chalk.cyan(provider)} 提供商，第 ${retryCount}/${RETRY_CONFIG.maxRetries + 1} 次尝试，耗时 ${chalk.magenta(duration / 1000)} s:`, error.message || error);

            if (retryCount <= RETRY_CONFIG.maxRetries) {
                await delay(RETRY_CONFIG.retryDelay);
            }
        }
    }

    // If loop finishes, all retries failed
    updateStats(provider, false);
    const endTime = Date.now(); // 记录请求结束时间
    const duration = endTime - startTime; // 计算请求耗时
    logger.warn(`${chalk.yellow('失败')} 所有尝试，提供商 ${chalk.cyan(provider)}，模型 ${chalk.yellow(providerModelName)}，耗时 ${chalk.magenta(duration / 1000)} s`);
    return { success: false, error: `提供商 ${provider} 模型 ${modelName} 在所有尝试后失败` };
}


class Logger {
    constructor(options = {}) {
        // 日志级别设置，默认为 debug
        this.logLevel = options.logLevel || 'debug'; // debug, info, warn, error
        // Define colors for different levels
        this.levelColors = {
            debug: chalk.blue,
            info: chalk.green,
            warn: chalk.yellow,
            error: chalk.red,
        };
        // Define prefixes for different levels
        this.levelPrefixes = {
            debug: '[调试]',
            info: '[信息]',
            warn: '[警告]',
            error: '[错误]',
        };
        // Map level strings to numerical values for comparison
        this.levelValues = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
        };
    }

    // 日志输出函数
    log(level, message, error = null) {
        if (this.levelValues[level] >= this.levelValues[this.logLevel]) {
            const timestamp = new Date().toLocaleTimeString();
            const levelColor = this.levelColors[level];
            const levelPrefix = this.levelPrefixes[level];

            let logMessage = `${chalk.gray(`[${timestamp}]`)} ${levelColor(levelPrefix)} ${message}`;

            if (error) {
                 // If error is an Error object, log stack; otherwise, log message
                logMessage += `\n${chalk.red(error instanceof Error && error.stack ? error.stack : error.message || String(error))}`;
            }

            console.log(logMessage);
        }
    }

    debug(message, error = null) {
        this.log('debug', message, error);
    }

    info(message, error = null) {
        this.log('info', message, error);
    }

    warn(message, error = null) {
        this.log('warn', message, error);
    }

    error(message, error = null) {
        this.log('error', message, error);
    }
}


/**
 * 调用逆向模型服务
 * @param {string} prompt - 用户输入的提示字符串
 * @param {string} model - 模型名称，可选格式为 "provider/modelName" 或 "modelName"
 * @param {object} options - 可选配置项
 * @param {string} [options.logLevel='debug'] - 日志级别 (debug, info, warn, error)
 * @returns {Promise<string>} - 模型响应字符串或错误信息
 */
export const NXDrawingModelResponse = async (prompt, model, options = {}) => {
    const logger = new Logger(options);
    const startTime = Date.now();

    let chosenProvider = null;
    let modelName = model;

    let specifiedProvider = null;
    if (model.includes('/')) {
        const parts = model.split('/');
        if (parts.length === 2) {
            specifiedProvider = parts[0];
            modelName = parts[1]; // Update modelName to the part after '/'
            if (!providerApis[specifiedProvider]) {
                logger.warn(`指定的提供商 ${chalk.cyan(specifiedProvider)} 无效或未配置，将尝试自动选择该模型可用的提供商`);
                specifiedProvider = null; // Treat as if no provider was specified
            } else {
                 logger.debug(`检测到指定提供商: ${chalk.cyan(specifiedProvider)}`);
            }
        } else {
             logger.warn(`模型格式 ${chalk.yellow(model)} 无效，期望格式为 "provider/modelName" 或 "modelName"`);
        }
    }

    const normalizedModel = modelNameNormalization[modelName] || modelName;
    const supportedProviders = modelProviderMap[normalizedModel];
    const timeout = modelTimeouts[normalizedModel] || DEFAULT_TIMEOUT;

    logger.debug(`收到模型请求：${chalk.yellow(model)}，解析后模型名称：${chalk.yellow(modelName)}，标准化模型名称：${chalk.yellow(normalizedModel)}`);

    if (!supportedProviders || supportedProviders.length === 0) {
        logger.error(`${chalk.red('不支持的模型')}: ${chalk.yellow(normalizedModel)}`);
        const duration = Date.now() - startTime;
        logger.info(`请求处理完成，总耗时 ${chalk.magenta(duration / 1000)} s`);
        return `不支持的模型: ${modelName}`;
    }

    // 2. 确定最终要使用的提供商
    if (specifiedProvider) {
        // 如果指定了提供商，检查它是否支持这个标准化模型
        if (supportedProviders.includes(specifiedProvider)) {
            chosenProvider = specifiedProvider;
            logger.debug(`使用指定的提供商 ${chalk.cyan(chosenProvider)} 来调用模型 ${chalk.yellow(normalizedModel)}`);
        } else {
            logger.error(`${chalk.red('指定提供商不支持该模型')}: 提供商 ${chalk.cyan(specifiedProvider)} 不支持模型 ${chalk.yellow(normalizedModel)}`);
            const duration = Date.now() - startTime;
            logger.info(`请求处理完成，总耗时 ${chalk.magenta(duration / 1000)} s`);
            return `指定的提供商 ${specifiedProvider} 不支持模型 ${modelName}`;
        }
    } else {
        // 如果没有指定提供商，选择该模型可用提供商中优先级最高的
        const sortedProviders = getProvidersByPriority().filter(provider =>
            supportedProviders.includes(provider)
        );

        if (sortedProviders.length === 0) {
             logger.error(`${chalk.red('找不到可用提供商')}: 模型 ${chalk.yellow(normalizedModel)} 没有可用提供商`);
             const duration = Date.now() - startTime;
             logger.info(`请求处理完成，总耗时 ${chalk.magenta(duration / 1000)} s`);
             return `模型 ${modelName} 没有可用提供商`;
        }

        chosenProvider = sortedProviders[0]; // Select the highest priority provider
        logger.debug(`自动选择优先级最高的提供商 ${chalk.cyan(chosenProvider)} 来调用模型 ${chalk.yellow(normalizedModel)}`);
    }

    // 3. 调用选定的提供商并进行重试
    try {
        const result = await callProviderWithRetry(chosenProvider, prompt, normalizedModel, timeout, logger);

        const endTime = Date.now(); // 记录整个请求结束时间
        const duration = endTime - startTime; // 计算整个请求耗时

        if (result.success) {
            logger.info(`成功获取响应，总耗时 ${chalk.magenta(duration / 1000)} s`);

            // 添加deepseek处理逻辑
            let response = result.response?.trim();
            if (normalizedModel.includes('deepseek') && !deepseek_thinking) {
                response = ThinkingProcessor.removeThinking(response);
                logger.info(`使用 deleteBeforeThink 处理 deepseek 模型 ${chalk.yellow(normalizedModel)} 的响应`);
            }

            return response;
        } else {
            // 如果调用失败（包括所有重试），返回失败信息
            logger.error(`${chalk.red('服务调用失败')}: ${result.error || '未知错误'}，总耗时 ${chalk.magenta(duration / 1000)} s`);
            return `服务调用失败: ${result.error || '未知错误'}`;
        }

    } catch (error) {
        const endTimeAll = Date.now(); // 记录整个请求结束时间
        const durationAll = endTimeAll - startTime; // 计算整个请求耗时
        logger.error(`服务调用出错，总耗时 ${chalk.magenta(durationAll / 1000)} s：`, error);
        return `服务调用失败: ${error.message}`;
    }
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
    logger.warn(`提供商 ${chalk.cyan(provider)} 无效或权重值 ${chalk.yellow(weight)} 无效 (应在 1-100 之间)`);
    return false;
};

// 获取所有模型和提供商，按照提供商调用顺序排列
export const getAllDrawingModelsWithProviders = (options = {}) => {
    const logger = new Logger(options);
    logger.debug(`请求所有模型和提供商信息`);

    const modelsWithProviders = {};

    // 获取按优先级排序的提供商列表
    const sortedProviders = getProvidersByPriority();

    // 遍历所有模型
    Object.keys(modelProviderMap).forEach(model => {
        modelsWithProviders[model] = [];
        // 遍历排序后的提供商列表，将支持该模型的提供商按优先级添加到列表中
        sortedProviders.forEach(provider => {
            if (modelProviderMap[model].includes(provider)) {
                 modelsWithProviders[model].push(provider);
            }
        });
    });

    return modelsWithProviders;
};