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
    console.log(`[歌曲生成] 开始生成歌曲，描述: ${prompt}`);
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        console.error("[歌曲生成] 错误: 歌曲描述为空");
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
        "Referer": "https://zaiwen.xueban.org.cn/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    function isDomainAvailable(domain) {
        if (!domainLimits.has(domain)) return true;
        const limitInfo = domainLimits.get(domain);
        const now = Date.now();
        if (now > limitInfo.expireTime) {
            console.log(`[歌曲生成] 账号 ${domain} 限制已过期，恢复可用`);
            domainLimits.delete(domain);
            return true;
        }
        return false;
    }

    function markDomainLimited(domain, lockTimeHours = 1) {
        const now = Date.now();
        const expireTime = now + (lockTimeHours * 60 * 60 * 1000);
        domainLimits.set(domain, { limitTime: now, expireTime, lockTimeHours });
        console.log(`[歌曲生成] 账号 ${domain} 被锁定 ${lockTimeHours} 小时，至 ${new Date(expireTime).toLocaleString()}`);
    }

    function getAvailableDomain() {
        const availableDomains = API_DOMAINS.filter(domain => isDomainAvailable(domain));
        console.log(`[歌曲生成] 当前可用账号数: ${availableDomains.length}/${API_DOMAINS.length}`);
        if (availableDomains.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * availableDomains.length);
        return availableDomains[randomIndex];
    }

    function getAvailableDomainCount() {
        return API_DOMAINS.filter(domain => isDomainAvailable(domain)).length;
    }

    async function makeApiRequest(endpoint, method, data = null, taskId = null) {
        console.log(`[歌曲生成] 开始API请求: ${endpoint}, 方法: ${method}, 数据: ${data ? JSON.stringify(data) : '无'}`);
        let lastError = null;
        let usedDomains = new Set();

        let preferredDomain = taskId && taskDomainMap.has(taskId) ? taskDomainMap.get(taskId) : null;
        if (preferredDomain && !isDomainAvailable(preferredDomain)) {
            console.log(`[歌曲生成] 任务 ${taskId} 的首选账号 ${preferredDomain} 已不可用，移除关联`);
            taskDomainMap.delete(taskId);
            preferredDomain = null;
        }

        const availableDomainCount = getAvailableDomainCount();
        const maxRetries = Math.max(3, availableDomainCount);

        for (let retry = 0; retry < maxRetries; retry++) {
            let domain = preferredDomain || getAvailableDomain();
            if (!domain) {
                console.log(`[歌曲生成] 无可用账号，等待 30 秒后重试...`);
                await new Promise(resolve => setTimeout(resolve, 30000));
                for (const [domainKey, limitInfo] of domainLimits.entries()) {
                    if (Date.now() > limitInfo.expireTime) {
                        domainLimits.delete(domainKey);
                        console.log(`[歌曲生成] 账号 ${domainKey} 限制已过期，恢复可用`);
                    }
                }
                domain = getAvailableDomain();
                if (!domain) {
                    console.error("[歌曲生成] 错误: 所有账号仍不可用");
                    throw new Error("所有API账号都被锁定，无法完成请求");
                }
            }

            if (!preferredDomain && usedDomains.has(domain)) {
                if (usedDomains.size >= getAvailableDomainCount()) usedDomains.clear();
                else continue;
            }
            if (!preferredDomain) usedDomains.add(domain);

            const url = `${domain}${endpoint}`;
            console.log(`[歌曲生成] 尝试请求: ${url}, 重试次数: ${retry + 1}/${maxRetries}`);

            try {
                let response;
                if (method.toUpperCase() === 'GET') {
                    response = await axios.get(url, { headers, timeout: 30000 });
                } else {
                    response = await axios.post(url, data, { headers, timeout: 30000 });
                }
                console.log(`[歌曲生成] 请求成功，返回数据: ${JSON.stringify(response.data).slice(0, 200)}...`);
                if (!response || !response.data) throw new Error("API返回空响应");

                if (response.data.status?.code === 10000 && response.data.status?.msg?.includes("次数已经用完")) {
                    console.log(`[歌曲生成] 账号 ${domain} 使用次数已用完，锁定 1 小时`);
                    markDomainLimited(domain, 1);
                    if (preferredDomain === domain && taskId) taskDomainMap.delete(taskId);
                    continue;
                }

                if (taskId && !taskDomainMap.has(taskId)) {
                    taskDomainMap.set(taskId, domain);
                    console.log(`[歌曲生成] 任务 ${taskId} 关联账号 ${domain}`);
                }
                return response.data;
            } catch (error) {
                lastError = error;
                const errorMessage = error.response?.data?.message || error.message || "未知错误";
                console.error(`[歌曲生成] 请求失败: ${errorMessage}, URL: ${url}`);
                if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
                    console.log(`[歌曲生成] 账号 ${domain} 连接问题，锁定 10 分钟`);
                    markDomainLimited(domain, 10 / 60);
                    if (preferredDomain === domain && taskId) taskDomainMap.delete(taskId);
                }
                if (!preferredDomain && usedDomains.size >= Math.min(3, getAvailableDomainCount()) && getAvailableDomainCount() > 0) {
                    const waitTime = Math.min(3000 * (retry + 1), 10000);
                    console.log(`[歌曲生成] 等待 ${waitTime / 1000} 秒后重试...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }
        }
        console.error(`[歌曲生成] 错误: 达到最大重试次数 ${maxRetries}`);
        throw new Error(`达到最大重试次数 (${maxRetries})，最后错误: ${lastError?.message || "未知错误"}`);
    }

    try {
        console.log("[歌曲生成] 步骤1: 开始生成歌词...");
        const safePrompt = prompt.trim();
        const lyricsData = await makeApiRequest('/suno_lyric_generate', 'POST', { message: safePrompt });
        if (!lyricsData?.title || !lyricsData?.lyrics) {
            console.error("[歌曲生成] 错误: 歌词数据不完整");
            throw new Error("歌词生成失败: 返回数据不完整");
        }
        console.log(`[歌曲生成] 歌词生成成功: ${lyricsData.title}`);

        console.log("[歌曲生成] 步骤2: 提交音乐生成请求...");
        const requestBody = {
            mv: "chirp-v4",
            tags: lyricsData.tags || "",
            title: lyricsData.title || "无标题",
            prompt: lyricsData.lyrics || ""
        };
        const submitData = await makeApiRequest('/suno/submit/music', 'POST', requestBody);
        if (!submitData?.task_id) {
            console.error("[歌曲生成] 错误: 未获取到任务ID");
            throw new Error("提交音乐生成请求失败: 未获取到任务ID");
        }
        const taskId = submitData.task_id;
        console.log(`[歌曲生成] 音乐生成任务提交成功，任务ID: ${taskId}`);

        console.log("[歌曲生成] 步骤3: 开始轮询音乐生成结果...");
        let result = null;
        let attempts = 0;
        const maxAttempts = 60;

        while (attempts < maxAttempts) {
            attempts++;
            console.log(`[歌曲生成] 检查任务状态，第 ${attempts}/${maxAttempts} 次尝试`);
            const statusData = await makeApiRequest(`/suno/fetch/${taskId}`, 'GET', null, taskId);
            if (!statusData || !statusData.data) {
                console.log(`[歌曲生成] 未获取到有效状态数据，等待 5 秒...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }
            console.log(`[歌曲生成] 任务进度: ${statusData.data.progress || '0%'}, 状态: ${statusData.data.status || '未知'}`);

            if (statusData.data.status === "SUCCESS") {
                // 验证数据完整性
                const songVersions = statusData.data.data || [];
                console.log(`[歌曲生成] 检查返回的版本数据: ${JSON.stringify(songVersions, null, 2)}`);
                if (!Array.isArray(songVersions) || songVersions.length === 0) {
                    console.error("[歌曲生成] 错误: 未获取到歌曲版本数据");
                    throw new Error("任务成功但未返回歌曲版本数据");
                }

                // 检查每个版本是否包含有效链接
                const validVersions = songVersions.filter(song => {
                    const hasAudio = song.audio_url && typeof song.audio_url === 'string' && song.audio_url.startsWith('http');
                    const hasVideo = song.video_url && typeof song.video_url === 'string' && song.video_url.startsWith('http');
                    if (!hasAudio && !hasVideo) {
                        console.warn(`[歌曲生成] 版本 ${song.id || song.title} 缺少有效音频和视频链接`);
                    }
                    return hasAudio || hasVideo; // 至少有一个有效链接
                });

                if (validVersions.length === 0) {
                    console.error("[歌曲生成] 错误: 所有版本缺少有效音频或视频链接");
                    throw new Error("任务成功但所有版本缺少有效音频或视频链接");
                }

                result = statusData.data;
                console.log(`[歌曲生成] 任务完成，获取到 ${validVersions.length} 个有效版本`);
                break;
            } else if (statusData.data.status === "FAILED") {
                console.error(`[歌曲生成] 任务失败: ${statusData.data.fail_reason || '未知原因'}`);
                throw new Error(`任务失败: ${statusData.data.fail_reason || '未知原因'}`);
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        taskDomainMap.delete(taskId);
        if (!result) {
            console.error("[歌曲生成] 错误: 达到最大尝试次数，任务未完成");
            throw new Error("达到最大尝试次数，任务可能仍在进行中");
        }

        const songVersions = result.data;
        const formattedResult = songVersions.map(song => ({
            title: song.title || "未知标题",
            audio_url: song.audio_url || "",
            video_url: song.video_url || "",
            image_url: song.image_large_url || song.image_url || "",
            duration: song.metadata?.duration || 0,
            lyrics: song.metadata?.prompt || ""
        })).filter(version => version.audio_url || version.video_url); // 过滤掉无有效链接的版本
        console.log(`[歌曲生成] 格式化后的版本数据: ${JSON.stringify(formattedResult, null, 2)}`);
        console.log("[歌曲生成] 音乐生成成功，返回格式化结果");
        return { title: lyricsData.title, tags: lyricsData.tags || "", versions: formattedResult };
    } catch (error) {
        console.error(`[歌曲生成] 生成过程出错: ${error.message}`);
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
    console.log(`[歌曲生成] 开始下载文件: ${url}, 目标路径: ${destPath}`);
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        console.error("[歌曲生成] 错误: 下载URL无效");
        throw new Error("下载失败: URL无效");
    }

    let lastError = null;
    for (let retry = 0; retry < maxRetries; retry++) {
        try {
            const response = await axios({
                method: 'GET',
                url: url,
                responseType: 'stream',
                timeout: 60000
            });
            console.log(`[歌曲生成] 文件请求成功，状态码: ${response.status}`);

            const dir = path.dirname(destPath);
            if (!fs.existsSync(dir)) {
                console.log(`[歌曲生成] 创建目录: ${dir}`);
                fs.mkdirSync(dir, { recursive: true });
            }
            await pipeline(response.data, fs.createWriteStream(destPath));
            console.log(`[歌曲生成] 文件下载完成: ${destPath}`);
            return destPath;
        } catch (error) {
            lastError = error;
            console.error(`[歌曲生成] 下载失败 (${retry + 1}/${maxRetries}): ${error.message}`);
            if (retry < maxRetries - 1) {
                const waitTime = (retry + 1) * 2000;
                console.log(`[歌曲生成] 等待 ${waitTime / 1000} 秒后重试...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    console.error(`[歌曲生成] 错误: 下载失败，达到最大重试次数 ${maxRetries}`);
    throw new Error(`下载文件失败，达到最大重试次数 (${maxRetries})，最后错误: ${lastError?.message || "未知错误"}`);
}

/**
 * 为 Yunzai-Bot 生成并发送歌曲
 * @param {import('icqq').Client} e Yunzai-Bot 消息事件对象
 * @param {string} prompt 歌曲风格描述
 * @param {boolean} keepFiles 是否保留文件
 * @returns {Promise<Object>} 生成结果
 */
export async function generateAndSendSong(e, prompt, keepFiles = false) {
    console.log(`[歌曲生成] 开始生成并发送歌曲，描述: ${prompt}, 保留文件: ${keepFiles}`);
    if (!e) {
        console.error("[歌曲生成] 错误: 消息事件对象为空");
        throw new Error("消息事件对象不能为空");
    }
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        console.error("[歌曲生成] 错误: 歌曲描述无效");
        await e.reply("请提供有效的歌曲描述");
        return null;
    }

    try {
        console.log("[歌曲生成] 发送等待消息...");
        await e.reply(`正在生成歌曲: "${prompt}"，请稍等...`);

        console.log("[歌曲生成] 调用 generateSuno 生成歌曲...");
        const result = await generateSuno(prompt);
        if (!result?.versions?.length) {
            console.error("[歌曲生成] 错误: 生成结果为空或无有效版本");
            throw new Error("生成结果为空或无有效版本");
        }
        console.log(`[歌曲生成] 生成结果: ${JSON.stringify(result, null, 2).slice(0, 200)}...`);

        const saveDir = path.join(process.cwd(), 'resources/suno_songs');
        console.log(`[歌曲生成] 检查保存目录: ${saveDir}`);
        if (!fs.existsSync(saveDir)) {
            console.log(`[歌曲生成] 创建保存目录: ${saveDir}`);
            fs.mkdirSync(saveDir, { recursive: true });
        }

        console.log("[歌曲生成] 发送歌曲总体信息...");
        await e.reply(`🎵 歌曲《${result.title}》生成成功！\n标签: ${result.tags || "无"}\n共生成 ${result.versions.length} 个版本`);

        const downloadResults = [];
        const filesToDelete = [];

        for (let i = 0; i < result.versions.length; i++) {
            const version = result.versions[i];
            const versionNumber = i + 1;
            console.log(`[歌曲生成] 处理版本 ${versionNumber}/${result.versions.length}: ${version.title}`);

            const timestamp = Date.now();
            const safeTitle = result.title.replace(/[\\/:*?"<>|]/g, '_');
            const coverPath = path.join(saveDir, `${safeTitle}_v${versionNumber}_${timestamp}.jpg`);
            const audioPath = path.join(saveDir, `${safeTitle}_v${versionNumber}_${timestamp}.mp3`);
            const videoPath = path.join(saveDir, `${safeTitle}_v${versionNumber}_${timestamp}.mp4`);
            filesToDelete.push(coverPath, audioPath, videoPath);

            try {
                console.log(`[歌曲生成] 处理歌词，版本 ${versionNumber}`);
                let lyricsText = `《${result.title}》(版本 ${versionNumber})\n\n`;
                if (version.lyrics) {
                    const lyricsLines = version.lyrics.split('\n');
                    lyricsLines.forEach(line => {
                        if (!line.startsWith('[') && line.trim()) lyricsText += line + '\n';
                    });
                    console.log(`[歌曲生成] 发送歌词，版本 ${versionNumber}`);
                    await e.reply(lyricsText);
                }

                let videoSent = false;
                let audioSent = false;

                if (version.video_url) {
                    try {
                        console.log(`[歌曲生成] 下载视频，版本 ${versionNumber}: ${version.video_url}`);
                        await downloadFile(version.video_url, videoPath);
                        console.log(`[歌曲生成] 发送视频，版本 ${versionNumber}`);
                        await e.reply(segment.video(videoPath));
                        videoSent = true;
                    } catch (error) {
                        console.error(`[歌曲生成] 视频下载或发送失败: ${error.message}`);
                        await e.reply(`视频下载或发送失败，您可以直接访问链接: ${version.video_url}`);
                    }
                } else {
                    console.log(`[歌曲生成] 版本 ${versionNumber} 无有效视频URL，跳过视频下载`);
                }

                if (version.audio_url) {
                    try {
                        console.log(`[歌曲生成] 下载音频，版本 ${versionNumber}: ${version.audio_url}`);
                        await downloadFile(version.audio_url, audioPath);
                        console.log(`[歌曲生成] 发送音频，版本 ${versionNumber}`);
                        await e.reply(segment.record(audioPath));
                        audioSent = true;
                    } catch (error) {
                        console.error(`[歌曲生成] 音频下载或发送失败: ${error.message}`);
                        await e.reply(`音频下载或发送失败，您可以直接访问链接: ${version.audio_url}`);
                    }
                } else {
                    console.log(`[歌曲生成] 版本 ${versionNumber} 无有效音频URL，跳过音频下载`);
                }

                // 如果既没有成功发送视频也没有成功发送音频，但有链接，则发送链接汇总
                if (!videoSent && !audioSent && (version.video_url || version.audio_url)) {
                    let linksMessage = `版本 ${versionNumber} 资源链接:\n`;
                    if (version.video_url) linksMessage += `视频: ${version.video_url}\n`;
                    if (version.audio_url) linksMessage += `音频: ${version.audio_url}\n`;
                    if (version.image_url) linksMessage += `封面: ${version.image_url}\n`;
                    await e.reply(linksMessage);
                }

                console.log(`[歌曲生成] 版本 ${versionNumber} 处理成功，记录结果`);
                downloadResults.push({
                    versionNumber,
                    title: result.title,
                    coverPath: version.image_url ? coverPath : null,
                    audioPath: version.audio_url ? audioPath : null,
                    videoPath: version.video_url ? videoPath : null,
                    lyrics: lyricsText,
                    version
                });
            } catch (error) {
                console.error(`[歌曲生成] 处理版本 ${versionNumber} 失败: ${error.message}`);

                // 即使处理失败，也尝试发送链接
                let linksMessage = `版本 ${versionNumber} 处理失败，但您可以直接访问以下链接:\n`;
                let hasLinks = false;

                if (version.video_url) {
                    linksMessage += `视频: ${version.video_url}\n`;
                    hasLinks = true;
                }
                if (version.audio_url) {
                    linksMessage += `音频: ${version.audio_url}\n`;
                    hasLinks = true;
                }
                if (version.image_url) {
                    linksMessage += `封面: ${version.image_url}\n`;
                    hasLinks = true;
                }

                if (hasLinks) {
                    await e.reply(linksMessage);

                    // 即使处理过程有错误，但有链接可以提供，也算作一个成功的版本
                    downloadResults.push({
                        versionNumber,
                        title: result.title,
                        coverPath: null,
                        audioPath: null,
                        videoPath: null,
                        lyrics: lyricsText,
                        version,
                        linksOnly: true
                    });
                } else {
                    await e.reply(`版本 ${versionNumber} 处理失败: ${error.message}`);
                }
            }
        }

        console.log(`[歌曲生成] 处理完成，成功版本数: ${downloadResults.length}/${result.versions.length}`);

        // 即使没有成功下载任何文件，只要有链接，也不算失败
        if (downloadResults.length === 0) {
            console.error("[歌曲生成] 警告: 所有版本处理失败且无可用链接");
            //await e.reply("所有版本处理失败且无可用链接，请稍后重试");
        }

        if (!keepFiles) {
            console.log("[歌曲生成] 计划清理临时文件，5秒后执行...");
            setTimeout(() => {
                for (const filePath of filesToDelete) {
                    try {
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                            console.log(`[歌曲生成] 删除文件: ${filePath}`);
                        }
                    } catch (err) {
                        console.error(`[歌曲生成] 删除文件失败: ${filePath}, 错误: ${err.message}`);
                    }
                }
            }, 5000);
        }

        console.log("[歌曲生成] 返回最终结果");
        return {
            title: result.title,
            tags: result.tags || "",
            versionCount: result.versions.length,
            versions: downloadResults,
            filesDeleted: !keepFiles
        };
    } catch (error) {
        console.error(`[歌曲生成] 生成歌曲失败: ${error.message}`);
        console.error(`[歌曲生成] 错误堆栈: ${error.stack || '无堆栈信息'}`);
        await e.reply(`生成歌曲失败: ${error.message}`);
        return null;
    } finally {
        isProcessing = false;
        if (taskQueue.length > 0) {
            const nextTask = taskQueue.shift();
            isProcessing = true;
            console.log(`[歌曲生成] 处理队列中的下一个任务: ${nextTask.prompt}`);
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
    console.log(`[歌曲生成] 添加任务到队列，描述: ${prompt}, 保留文件: ${keepFiles}`);
    if (!e) {
        console.error("[歌曲生成] 错误: 消息事件对象为空");
        return Promise.reject(new Error("消息事件对象不能为空"));
    }
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        console.error("[歌曲生成] 错误: 歌曲描述无效");
        return Promise.reject(new Error("歌曲描述不能为空"));
    }

    return new Promise((resolve) => {
        if (!isProcessing) {
            isProcessing = true;
            console.log(`[歌曲生成] 直接处理任务: ${prompt}`);
            resolve(generateAndSendSong(e, prompt, keepFiles));
        } else {
            console.log(`[歌曲生成] 任务加入队列，当前队列长度: ${taskQueue.length + 1}`);
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
    console.log("[歌曲生成] 获取账号限制状态");
    const now = Date.now();
    const generateApiUrls = (count) =>
        Array.from({ length: count }, (_, i) =>
            `https://sunoproxy${i ? i : ''}.deno.dev`
        );
    const API_DOMAINS = generateApiUrls(31);

    const result = {
        totalDomains: API_DOMAINS.length,
        limitedDomains: 0,
        availableDomains: 0,
        limitDetails: []
    };

    for (const [domain, limitInfo] of domainLimits.entries()) {
        if (now > limitInfo.expireTime) {
            domainLimits.delete(domain);
            console.log(`[歌曲生成] 账号 ${domain} 限制已过期，恢复可用`);
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
    console.log(`[歌曲生成] 账号状态: 总数 ${result.totalDomains}, 可用 ${result.availableDomains}, 受限 ${result.limitedDomains}`);
    return result;
}