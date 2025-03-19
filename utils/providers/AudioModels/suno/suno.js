import axios from '../../../../node_modules/axios/index.js';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import stream from 'stream';
const pipeline = promisify(stream.pipeline);

// 任务队列状态
let isProcessing = false;
const taskQueue = [];

// 账号使用限制管理
const domainLimits = new Map();
// 任务与域名的映射关系
const taskDomainMap = new Map();

/**
 * 生成中文歌曲并获取结果
 * @param {string} prompt 歌曲风格描述
 * @returns {Promise<Object>} 包含歌曲信息的对象
 */
export async function generateSuno(prompt) {
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        throw new Error("歌曲描述不能为空");
    }

    const generateApiUrls = (count) =>
        Array.from({ length: count }, (_, i) =>
            `https://sunoproxy${i ? i : ''}.deno.dev`
        );

    const API_DOMAINS = generateApiUrls(31);

    const headers = {
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9",
        "content-type": "application/json",
        "Referer": "https/zaiwen.xueban.org.cn/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    /**
     * 检查账号是否被限制使用
     * @param {string} domain 账号
     * @returns {boolean} 是否可用
     */
    function isDomainAvailable(domain) {
        if (!domainLimits.has(domain)) {
            return true;
        }

        const limitInfo = domainLimits.get(domain);
        const now = Date.now();

        // 如果限制时间已过，移除限制
        if (now > limitInfo.expireTime) {
            domainLimits.delete(domain);
            return true;
        }

        return false;
    }

    /**
     * 标记账号使用次数已用完
     * @param {string} domain 账号
     * @param {number} lockTimeHours 锁定时间（小时）
     */
    function markDomainLimited(domain, lockTimeHours = 1) {
        const now = Date.now();
        const expireTime = now + (lockTimeHours * 60 * 60 * 1000);

        domainLimits.set(domain, {
            limitTime: now,
            expireTime: expireTime,
            lockTimeHours: lockTimeHours
        });

        console.log(`[歌曲生成] 账号 ${domain} 已被锁定 ${lockTimeHours} 小时，直到 ${new Date(expireTime).toLocaleString()}`);
    }

    /**
     * 获取可用的随机账号
     * @returns {string|null} 可用的账号或null
     */
    function getAvailableDomain() {
        // 过滤出所有可用的账号
        const availableDomains = API_DOMAINS.filter(domain => isDomainAvailable(domain));

        if (availableDomains.length === 0) {
            return null;
        }

        // 随机选择一个可用账号
        const randomIndex = Math.floor(Math.random() * availableDomains.length);
        return availableDomains[randomIndex];
    }

    /**
     * 获取当前可用账号数量
     * @returns {number} 可用账号数量
     */
    function getAvailableDomainCount() {
        return API_DOMAINS.filter(domain => isDomainAvailable(domain)).length;
    }

    async function makeApiRequest(endpoint, method, data = null, taskId = null) {
        let lastError = null;
        let usedDomains = new Set();

        // 如果有taskId且已经有关联的domain，优先使用该domain
        let preferredDomain = null;
        if (taskId && taskDomainMap.has(taskId)) {
            preferredDomain = taskDomainMap.get(taskId);
            // 确认该domain仍然可用
            if (!isDomainAvailable(preferredDomain)) {
                preferredDomain = null;
                taskDomainMap.delete(taskId);
            }
        }

        // 动态确定最大重试次数，基于可用账号数量
        const availableDomainCount = getAvailableDomainCount();
        const maxRetries = Math.max(3, availableDomainCount);

        for (let retry = 0; retry < maxRetries; retry++) {
            // 获取可用账号，优先使用preferredDomain
            let domain = preferredDomain || getAvailableDomain();

            // 如果没有可用账号，等待一段时间后重试
            if (!domain) {
                console.log(`[歌曲生成] 所有账号都被锁定，等待 30 秒后重试...`);
                await new Promise(resolve => setTimeout(resolve, 30000));

                // 清除过期的账号限制
                for (const [domainKey, limitInfo] of domainLimits.entries()) {
                    if (Date.now() > limitInfo.expireTime) {
                        domainLimits.delete(domainKey);
                        console.log(`[歌曲生成] 账号 ${domainKey} 锁定已过期，现在可用`);
                    }
                }

                // 重新获取可用账号
                domain = getAvailableDomain();

                // 如果仍然没有可用账号，抛出错误
                if (!domain) {
                    throw new Error("所有API账号都被锁定，无法完成请求");
                }
            }

            // 避免在同一次重试中使用相同的账号，但只在非preferredDomain情况下检查
            if (!preferredDomain && usedDomains.has(domain)) {
                // 如果所有可用账号都已尝试过，则清空已使用账号集合，允许重复使用
                if (usedDomains.size >= getAvailableDomainCount()) {
                    usedDomains.clear();
                } else {
                    continue;
                }
            }

            if (!preferredDomain) {
                usedDomains.add(domain);
            }
            
            const url = `${domain}${endpoint}`;

            try {
                if (retry === 0 || !preferredDomain) {
                    console.log(`[歌曲生成] 尝试请求: ${url}`);
                }

                let response;
                if (method.toUpperCase() === 'GET') {
                    response = await axios.get(url, {
                        headers,
                        timeout: 30000 // 30秒超时
                    });
                } else {
                    response = await axios.post(url, data, {
                        headers,
                        timeout: 30000 // 30秒超时
                    });
                }

                // 检查响应是否有效
                if (!response || !response.data) {
                    throw new Error("API返回空响应");
                }

                // 检查是否有使用次数限制的错误
                if (response.data && response.data.status &&
                    response.data.status.code === 10000 &&
                    response.data.status.msg &&
                    response.data.status.msg.includes("次数已经用完")) {
                    console.log(`[歌曲生成] 账号 ${domain} 的使用次数已用完，锁定1小时`);
                    markDomainLimited(domain, 1); // 锁定1小时
                    
                    // 如果是preferredDomain被限制，则清除关联
                    if (preferredDomain === domain && taskId) {
                        taskDomainMap.delete(taskId);
                        preferredDomain = null;
                    }
                    
                    continue;
                }

                // 如果是首次成功请求且有taskId，记录使用的domain
                if (taskId && !taskDomainMap.has(taskId)) {
                    taskDomainMap.set(taskId, domain);
                    console.log(`[歌曲生成] 任务 ${taskId} 关联到账号 ${domain}`);
                }

                return response.data;
            } catch (error) {
                lastError = error;
                const errorMessage = error.response?.data?.message || error.message || "未知错误";
                
                if (retry === 0 || !preferredDomain) {
                    console.log(`[歌曲生成] 请求失败: ${errorMessage}, URL: ${url}`);
                }

                // 如果是网络错误或超时，可能暂时锁定账号一小段时间（10分钟）
                if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
                    console.log(`[歌曲生成] 账号 ${domain} 连接问题，暂时锁定10分钟`);
                    markDomainLimited(domain, 10 / 60); // 10分钟
                    
                    // 如果是preferredDomain出现连接问题，清除关联
                    if (preferredDomain === domain && taskId) {
                        taskDomainMap.delete(taskId);
                        preferredDomain = null;
                    }
                }

                // 如果已尝试多个账号但仍有可用账号，则等待一段时间后继续
                if (!preferredDomain && usedDomains.size >= Math.min(3, getAvailableDomainCount()) && getAvailableDomainCount() > 0) {
                    const waitTime = Math.min(3000 * (retry + 1), 10000); // 递增等待时间，最多10秒
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }
        }

        throw new Error(`达到最大重试次数 (${maxRetries})，最后错误: ${lastError?.message || "未知错误"}`);
    }

    try {
        // 步骤1: 生成歌词
        console.log("[歌曲生成] 步骤1: 正在生成歌词...");

        // 确保prompt有效
        const safePrompt = prompt.trim();
        if (!safePrompt) {
            throw new Error("歌曲描述不能为空");
        }

        const lyricsData = await makeApiRequest('/suno_lyric_generate', 'POST', { message: safePrompt });

        if (!lyricsData) {
            throw new Error("歌词生成失败: 服务器返回空数据");
        }

        if (!lyricsData.title || !lyricsData.lyrics) {
            throw new Error("歌词生成失败: 返回数据不完整");
        }

        console.log(`[歌曲生成] 歌词生成成功: ${lyricsData.title}`);

        // 步骤2: 提交音乐生成请求
        console.log("[歌曲生成] 步骤2: 正在提交音乐生成请求...");
        const requestBody = {
            mv: "chirp-v4",
            tags: lyricsData.tags || "",
            title: lyricsData.title || "无标题",
            prompt: lyricsData.lyrics || ""
        };

        const submitData = await makeApiRequest('/suno/submit/music', 'POST', requestBody);

        if (!submitData) {
            throw new Error("提交音乐生成请求失败: 服务器返回空数据");
        }

        if (!submitData.task_id) {
            throw new Error("提交音乐生成请求失败: 未获取到任务ID");
        }

        const taskId = submitData.task_id;
        console.log(`[歌曲生成] 音乐生成任务已提交，任务ID: ${taskId}`);

        // 步骤3: 轮询获取结果
        console.log("[歌曲生成] 步骤3: 正在等待音乐生成结果...");
        let result = null;
        let attempts = 0;
        const maxAttempts = 60; // 最多尝试60次

        while (attempts < maxAttempts) {
            attempts++;

            const statusData = await makeApiRequest(`/suno/fetch/${taskId}`, 'GET', null, taskId);

            if (!statusData) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }

            if (!statusData.data) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }

            console.log(`[歌曲生成] 检查进度: ${statusData.data.progress || '0%'}, 状态: ${statusData.data.status || '未知'}`);

            if (statusData.data.status === "SUCCESS") {
                result = statusData.data;
                break;
            } else if (statusData.data.status === "FAILED") {
                throw new Error(`任务失败: ${statusData.data.fail_reason || '未知原因'}`);
            }

            // 等待5秒后再次检查
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        // 任务完成后清理taskDomainMap
        taskDomainMap.delete(taskId);

        if (!result) {
            throw new Error("达到最大尝试次数，任务可能仍在进行中");
        }

        // 步骤4: 整理并返回结果
        const songVersions = result.data;

        if (!Array.isArray(songVersions) || songVersions.length === 0) {
            throw new Error("未获取到歌曲版本数据");
        }

        const formattedResult = songVersions.map(song => ({
            title: song.title || "未知标题",
            audio_url: song.audio_url || "",
            video_url: song.video_url || "",
            image_url: song.image_large_url || song.image_url || "",
            duration: song.metadata?.duration || 0,
            lyrics: song.metadata?.prompt || ""
        }));

        console.log(`[歌曲生成] 音乐生成成功！共生成 ${formattedResult.length} 个版本`);
        return {
            title: lyricsData.title,
            tags: lyricsData.tags || "",
            versions: formattedResult
        };

    } catch (error) {
        console.error(`[歌曲生成] 生成过程中出错: ${error.message}`);
        throw error;
    }
}

/**
 * 下载文件到本地
 * @param {string} url 文件URL
 * @param {string} destPath 目标路径
 * @returns {Promise<string>} 文件保存路径
 */
export async function downloadFile(url, destPath, maxRetries = 3) {
    if (!url) {
        throw new Error("下载失败: URL不能为空");
    }

    let lastError = null;

    for (let retry = 0; retry < maxRetries; retry++) {
        try {
            console.log(`[歌曲生成] 正在下载文件: ${url}`);

            const response = await axios({
                method: 'GET',
                url: url,
                responseType: 'stream',
                timeout: 60000 // 60秒超时
            });

            // 确保目录存在
            const dir = path.dirname(destPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            await pipeline(response.data, fs.createWriteStream(destPath));
            console.log(`[歌曲生成] 文件已下载到: ${destPath}`);
            return destPath;
        } catch (error) {
            lastError = error;
            console.error(`[歌曲生成] 下载文件失败 (${retry + 1}/${maxRetries}): ${error.message}`);

            // 如果不是最后一次尝试，等待后重试
            if (retry < maxRetries - 1) {
                const waitTime = (retry + 1) * 2000; // 递增等待时间
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    throw new Error(`下载文件失败，达到最大重试次数 (${maxRetries})，最后错误: ${lastError?.message || "未知错误"}`);
}

/**
 * 为 Yunzai-Bot 生成并发送歌曲
 * @param {import('icqq').Client} e Yunzai-Bot 消息事件对象
 * @param {string} prompt 歌曲风格描述
 * @param {boolean} keepFiles 是否保留文件（默认为false，即发送后删除）
 * @returns {Promise<Object>} 生成结果
 */
export async function generateAndSendSong(e, prompt, keepFiles = false) {
    if (!e) {
        throw new Error("消息事件对象不能为空");
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        await e.reply("请提供有效的歌曲描述");
        return null;
    }

    try {
        // 发送等待消息
        await e.reply(`正在生成歌曲: "${prompt}"，请稍等...`);

        // 生成歌曲
        const result = await generateSuno(prompt);

        if (!result) {
            throw new Error("生成结果为空");
        }

        // 创建保存目录
        const saveDir = path.join(process.cwd(), 'resources/suno_songs');
        if (!fs.existsSync(saveDir)) {
            fs.mkdirSync(saveDir, { recursive: true });
        }

        // 发送歌曲总体信息
        await e.reply(`🎵 歌曲《${result.title}》生成成功！\n标签: ${result.tags || "无"}\n共生成 ${result.versions.length} 个版本`);

        // 处理每个版本
        const downloadResults = [];
        const filesToDelete = [];

        for (let i = 0; i < result.versions.length; i++) {
            const version = result.versions[i];
            const versionNumber = i + 1;

            // 检查版本数据是否完整
            if (!version.audio_url) {
                console.warn(`[歌曲生成] 版本 ${versionNumber} 缺少音频URL，跳过`);
                await e.reply(`版本 ${versionNumber} 缺少音频URL，跳过`);
                continue;
            }

            const timestamp = Date.now();
            const safeTitle = result.title.replace(/[\\/:*?"<>|]/g, '_'); // 安全的文件名
            const coverPath = path.join(saveDir, `${safeTitle}_v${versionNumber}_${timestamp}.jpg`);
            const audioPath = path.join(saveDir, `${safeTitle}_v${versionNumber}_${timestamp}.mp3`);

            filesToDelete.push(coverPath, audioPath);

            try {
                // 下载封面图片（如果有）
                if (version.image_url) {
                    await downloadFile(version.image_url, coverPath);
                    await e.reply([
                        segment.image(coverPath),
                        `时长: ${Math.floor(version.duration / 60)}分${Math.round(version.duration % 60)}秒`
                    ]);
                } else {
                    await e.reply(`版本 ${versionNumber} 时长: ${Math.floor(version.duration / 60)}分${Math.round(version.duration % 60)}秒`);
                }

                // 处理歌词
                let lyricsText = `《${result.title}》(版本 ${versionNumber})\n\n`;
                if (version.lyrics) {
                    const lyricsLines = version.lyrics.split('\n');
                    lyricsLines.forEach(line => {
                        if (!line.startsWith('[') && line.trim()) {
                            lyricsText += line + '\n';
                        }
                    });
                    await e.reply(lyricsText);
                }

                // 下载并发送音频
                await downloadFile(version.audio_url, audioPath);
                await e.reply(segment.record(audioPath));

                downloadResults.push({
                    versionNumber,
                    title: result.title,
                    coverPath: version.image_url ? coverPath : null,
                    audioPath,
                    lyrics: lyricsText,
                    version
                });
            } catch (error) {
                console.error(`[歌曲生成] 处理版本 ${versionNumber} 失败: ${error.message}`);
                await e.reply(`版本 ${versionNumber} 处理失败: ${error.message}`);
            }
        }

        if (downloadResults.length === 0) {
            throw new Error("所有版本处理失败");
        }

        // 清理文件
        if (!keepFiles) {
            setTimeout(() => {
                for (const filePath of filesToDelete) {
                    try {
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    } catch (err) {
                        console.error(`[歌曲生成] 删除文件失败: ${filePath}, 错误: ${err.message}`);
                    }
                }
            }, 5000);
        }

        return {
            title: result.title,
            tags: result.tags || "",
            versionCount: result.versions.length,
            versions: downloadResults,
            filesDeleted: !keepFiles
        };
    } catch (error) {
        const errorMessage = error?.message || "未知错误";
        console.error(`[歌曲生成] 生成歌曲失败: ${errorMessage}`);
        console.error(error.stack || "无堆栈信息");
        await e.reply(`生成歌曲失败: ${errorMessage}`);
        return null;
    } finally {
        // 任务完成后处理队列
        isProcessing = false;
        if (taskQueue.length > 0) {
            const nextTask = taskQueue.shift();
            isProcessing = true;
            console.log(`[歌曲生成] 开始处理队列中的下一个任务: ${nextTask.prompt}`);
            nextTask.resolve(await generateAndSendSong(nextTask.e, nextTask.prompt, nextTask.keepFiles));
        }
    }
}

/**
 * 添加任务到队列
 * @param {import('icqq').Client} e 消息事件对象
 * @param {string} prompt 歌曲风格描述
 * @param {boolean} keepFiles 是否保留文件
 * @returns {Promise<Object>} 生成结果
 */
export function enqueueTask(e, prompt, keepFiles = false) {
    if (!e) {
        return Promise.reject(new Error("消息事件对象不能为空"));
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        return Promise.reject(new Error("歌曲描述不能为空"));
    }

    return new Promise((resolve) => {
        if (!isProcessing) {
            // 如果当前没有任务在处理，直接执行
            isProcessing = true;
            console.log(`[歌曲生成] 开始处理任务: ${prompt}`);
            resolve(generateAndSendSong(e, prompt, keepFiles));
        } else {
            // 如果有任务在处理，加入队列
            console.log(`[歌曲生成] 任务加入队列: ${prompt}, 当前队列长度: ${taskQueue.length + 1}`);
            taskQueue.push({ e, prompt, keepFiles, resolve });
            e.reply(`当前有任务正在处理，已将您的请求加入队列（位置：${taskQueue.length}）`);
        }
    });
}

/**
 * 获取当前账号限制状态
 * @returns {Object} 账号限制状态信息
 */
export function getDomainLimitStatus() {
    const now = Date.now();
    const generateApiUrls = (count) =>
        Array.from({ length: count }, (_, i) =>
            `https/sunoproxy${i ? i : ''}.deno.dev`
        );
    const API_DOMAINS = generateApiUrls(31);

    const result = {
        totalDomains: API_DOMAINS.length,
        limitedDomains: 0,
        availableDomains: 0,
        limitDetails: []
    };

    // 清理过期的限制
    for (const [domain, limitInfo] of domainLimits.entries()) {
        if (now > limitInfo.expireTime) {
            domainLimits.delete(domain);
        } else {
            result.limitedDomains++;
            result.limitDetails.push({
                domain,
                limitedAt: new Date(limitInfo.limitTime).toLocaleString(),
                expireAt: new Date(limitInfo.expireTime).toLocaleString(),
                remainingTime: Math.round((limitInfo.expireTime - now) / 60000) + "分钟"
            });
        }
    }

    result.availableDomains = result.totalDomains - result.limitedDomains;
    return result;
}