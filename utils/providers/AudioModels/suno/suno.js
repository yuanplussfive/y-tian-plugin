import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import stream from 'stream';
const pipeline = promisify(stream.pipeline);

// 任务队列状态
let isProcessing = false;
const taskQueue = [];

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

    const API_DOMAINS = generateApiUrls(16);

    const headers = {
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9",
        "content-type": "application/json",
        "Referer": "https://zaiwen.xueban.org.cn/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    function getRandomDomain() {
        const randomIndex = Math.floor(Math.random() * API_DOMAINS.length);
        return API_DOMAINS[randomIndex];
    }

    async function makeApiRequest(endpoint, method, data = null, maxRetries = 5) {
        let lastError = null;
        let usedDomains = new Set();

        for (let retry = 0; retry < maxRetries; retry++) {
            let domain;
            do {
                domain = getRandomDomain();
            } while (usedDomains.has(domain) && usedDomains.size < API_DOMAINS.length);

            usedDomains.add(domain);
            const url = `${domain}${endpoint}`;

            try {
                logger.info(`[歌曲生成] 尝试请求 (${retry + 1}/${maxRetries}): ${url}`);

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
                    //logger.warn(`[歌曲生成] 域名 ${domain} 的使用次数已用完，尝试其他域名...`);
                    continue;
                }

                return response.data;
            } catch (error) {
                lastError = error;
                const errorMessage = error.response?.data?.message || error.message || "未知错误";
                logger.error(`[歌曲生成] 请求失败 (${retry + 1}/${maxRetries}): ${errorMessage}, URL: ${url}`);

                // 如果已尝试所有域名，则等待一段时间后重试
                if (usedDomains.size >= API_DOMAINS.length) {
                    //logger.info(`[歌曲生成] 已尝试所有域名，等待 3 秒后重试...`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    usedDomains.clear(); // 清空已使用域名，重新开始
                }
            }
        }

        throw new Error(`达到最大重试次数 (${maxRetries})，最后错误: ${lastError?.message || "未知错误"}`);
    }

    try {
        // 步骤1: 生成歌词
        logger.info("[歌曲生成] 步骤1: 正在生成歌词...");

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
            logger.error(`[歌曲生成] 歌词生成返回不完整数据: ${JSON.stringify(lyricsData)}`);
            throw new Error("歌词生成失败: 返回数据不完整");
        }

        logger.info(`[歌曲生成] 歌词生成成功: ${lyricsData.title}`);

        // 步骤2: 提交音乐生成请求
        logger.info("[歌曲生成] 步骤2: 正在提交音乐生成请求...");
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
            logger.error(`[歌曲生成] 提交响应: ${JSON.stringify(submitData, null, 2)}`);
            throw new Error("提交音乐生成请求失败: 未获取到任务ID");
        }

        const taskId = submitData.task_id;
        logger.info(`[歌曲生成] 音乐生成任务已提交，任务ID: ${taskId}`);

        // 步骤3: 轮询获取结果
        logger.info("[歌曲生成] 步骤3: 正在等待音乐生成结果...");
        let result = null;
        let attempts = 0;
        const maxAttempts = 60; // 最多尝试60次

        while (attempts < maxAttempts) {
            attempts++;

            const statusData = await makeApiRequest(`/suno/fetch/${taskId}`, 'GET');

            if (!statusData) {
                //logger.info(`[歌曲生成] 检查进度 (${attempts}/${maxAttempts}): 返回空数据，继续尝试...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }

            if (!statusData.data) {
                //logger.info(`[歌曲生成] 检查进度 (${attempts}/${maxAttempts}): 返回数据不完整，继续尝试...`);
                //logger.debug(`[歌曲生成] 状态响应: ${JSON.stringify(statusData)}`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }

            //logger.info(`[歌曲生成] 检查进度 (${attempts}/${maxAttempts}): ${statusData.data.progress || '未知'}, 状态: ${statusData.data.status || '未知'}`);

            if (statusData.data.status === "SUCCESS") {
                result = statusData.data;
                break;
            } else if (statusData.data.status === "FAILED") {
                throw new Error(`任务失败: ${statusData.data.fail_reason || '未知原因'}`);
            }

            // 等待5秒后再次检查
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        if (!result) {
            throw new Error("达到最大尝试次数，任务可能仍在进行中");
        }

        // 步骤4: 整理并返回结果
        const songVersions = result.data;

        if (!Array.isArray(songVersions) || songVersions.length === 0) {
            logger.error(`[歌曲生成] 未获取到歌曲版本数据: ${JSON.stringify(result)}`);
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

        logger.info(`[歌曲生成] 音乐生成成功！共生成 ${formattedResult.length} 个版本`);
        return {
            title: lyricsData.title,
            tags: lyricsData.tags || "",
            versions: formattedResult
        };

    } catch (error) {
        logger.error(`[歌曲生成] 生成过程中出错: ${error.message}`);
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
            logger.info(`[歌曲生成] 尝试下载文件 (${retry + 1}/${maxRetries}): ${url}`);

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
            logger.info(`[歌曲生成] 文件已下载到: ${destPath}`);
            return destPath;
        } catch (error) {
            lastError = error;
            logger.error(`[歌曲生成] 下载文件失败 (${retry + 1}/${maxRetries}): ${error.message}`);

            // 如果不是最后一次尝试，等待后重试
            if (retry < maxRetries - 1) {
                const waitTime = (retry + 1) * 2000; // 递增等待时间
                logger.info(`[歌曲生成] 等待 ${waitTime / 1000} 秒后重试下载...`);
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
                logger.warn(`[歌曲生成] 版本 ${versionNumber} 缺少音频URL，跳过`);
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
                logger.error(`[歌曲生成] 处理版本 ${versionNumber} 失败: ${error.message}`);
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
                            logger.info(`[歌曲生成] 已删除文件: ${filePath}`);
                        }
                    } catch (err) {
                        logger.error(`[歌曲生成] 删除文件失败: ${filePath}, 错误: ${err.message}`);
                    }
                }
                logger.info(`[歌曲生成] 清理完成，共删除 ${filesToDelete.length} 个文件`);
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
        logger.error(`[歌曲生成] 生成歌曲失败: ${errorMessage}`);
        logger.error(error.stack || "无堆栈信息");
        await e.reply(`生成歌曲失败: ${errorMessage}`);
        return null;
    } finally {
        // 任务完成后处理队列
        isProcessing = false;
        if (taskQueue.length > 0) {
            const nextTask = taskQueue.shift();
            isProcessing = true;
            logger.info(`[歌曲生成] 开始处理队列中的下一个任务: ${nextTask.prompt}`);
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
            logger.info(`[歌曲生成] 开始处理任务: ${prompt}`);
            resolve(generateAndSendSong(e, prompt, keepFiles));
        } else {
            // 如果有任务在处理，加入队列
            logger.info(`[歌曲生成] 任务加入队列: ${prompt}, 当前队列长度: ${taskQueue.length + 1}`);
            taskQueue.push({ e, prompt, keepFiles, resolve });
            e.reply(`当前有任务正在处理，已将您的请求加入队列（位置：${taskQueue.length}）`);
        }
    });
}