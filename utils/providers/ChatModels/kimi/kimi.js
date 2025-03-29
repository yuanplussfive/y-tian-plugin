import { PassThrough } from "stream";
import crypto from 'crypto';
import path from 'path';
import _ from 'lodash';
import axios from 'axios';
import mimeTypes from 'mime-types';

// 日志工具
const logger = {
    info: (...args) => console.log('[INFO]', ...args),
    success: (...args) => console.log('[SUCCESS]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    error: (...args) => console.error('[ERROR]', ...args)
};

// 工具函数
const util = {
    generateCookie: () => `session_id=${Math.random().toString(36).substring(2)}`,
    unixTimestamp: () => Math.floor(Date.now() / 1000),
    timestamp: () => Date.now(),
    isBASE64Data: (str) => /^data:[\w\/]+;base64,/.test(str),
    extractBASE64DataFormat: (str) => str.match(/^data:([\w\/]+);base64,/)[1],
    removeBASE64DataHeader: (str) => str.replace(/^data:[\w\/]+;base64,/, ''),
    uuid: () => ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
};

// API异常类
class APIException extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'APIException';
    }
}

// 异常常量
const EX = {
    API_REQUEST_FAILED: 1001,
    API_CHAT_STREAM_PUSHING: 1002,
    API_RESEARCH_EXCEEDS_LIMIT: 1003,
    API_FILE_URL_INVALID: 1004,
    API_FILE_EXECEEDS_SIZE: 1005
};

// Kimi API 客户端类
class KimiClient {
    constructor() {
        this.MODEL_NAME = 'kimi';
        this.DEVICE_ID = Math.random() * 999999999999999999 + 7000000000000000000;
        this.SESSION_ID = Math.random() * 99999999999999999 + 1700000000000000000;
        this.ACCESS_TOKEN_EXPIRES = 300;
        this.MAX_RETRY_COUNT = 3;
        this.RETRY_DELAY = 5000;
        this.BASE_URL = 'https://kimi.moonshot.cn';
        this.FILE_MAX_SIZE = 100 * 1024 * 1024;

        this.FAKE_HEADERS = {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Origin': this.BASE_URL,
            'Cookie': util.generateCookie(),
            'R-Timezone': 'Asia/Shanghai',
            'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Priority': 'u=1, i',
            'X-Msh-Device-Id': `${this.DEVICE_ID}`,
            'X-Msh-Platform': 'web',
            'X-Msh-Session-Id': `${this.SESSION_ID}`
        };

        this.accessTokenMap = new Map();
        this.accessTokenRequestQueueMap = {};
    }

    async requestToken(refreshToken) {
        if (this.accessTokenRequestQueueMap[refreshToken]) {
            return new Promise(resolve => this.accessTokenRequestQueueMap[refreshToken].push(resolve));
        }
        this.accessTokenRequestQueueMap[refreshToken] = [];

        try {
            logger.info(`刷新 token: ${refreshToken}`);
            const tokenResult = await axios.get(`${this.BASE_URL}/api/auth/token/refresh`, {
                headers: { Authorization: `Bearer ${refreshToken}`, ...this.FAKE_HEADERS },
                timeout: 15000,
                validateStatus: () => true
            });

            const { access_token, refresh_token } = this.checkResult(tokenResult, refreshToken);

            const userResult = await axios.get(`${this.BASE_URL}/api/user`, {
                headers: { Authorization: `Bearer ${access_token}`, ...this.FAKE_HEADERS },
                timeout: 15000,
                validateStatus: () => true
            });

            if (!userResult.data.id) {
                throw new APIException(EX.API_REQUEST_FAILED, '获取用户信息失败');
            }

            const result = {
                userId: userResult.data.id,
                accessToken: access_token,
                refreshToken: refresh_token,
                refreshTime: util.unixTimestamp() + this.ACCESS_TOKEN_EXPIRES
            };

            this.accessTokenRequestQueueMap[refreshToken].forEach(resolve => resolve(result));
            delete this.accessTokenRequestQueueMap[refreshToken];
            logger.success(`刷新成功`);
            return result;
        } catch (err) {
            logger.error(err);
            this.accessTokenRequestQueueMap[refreshToken].forEach(resolve => resolve(err));
            delete this.accessTokenRequestQueueMap[refreshToken];
            throw err;
        }
    }

    async acquireToken(refreshToken) {
        let result = this.accessTokenMap.get(refreshToken);
        if (!result || util.unixTimestamp() > result.refreshTime) {
            result = await this.requestToken(refreshToken);
            this.accessTokenMap.set(refreshToken, result);
        }
        return result;
    }

    async request(method, uri, refreshToken, options = {}, retries = 3) {
        const { accessToken, userId } = await this.acquireToken(refreshToken);
        logger.info(`请求URL: ${uri}`);

        try {
            const result = await axios({
                method,
                url: `${this.BASE_URL}${uri}`,
                params: options.params,
                data: options.data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'X-Traffic-Id': userId,
                    ...this.FAKE_HEADERS,
                    ...(options.headers || {})
                },
                timeout: options.timeout || 15000,
                responseType: options.responseType,
                validateStatus: () => true
            });
            return this.checkResult(result, refreshToken);
        } catch (err) {
            if (retries > 0) {
                logger.warn(`请求失败，重试剩余 ${retries} 次: ${err.message}`);
                await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
                return this.request(method, uri, refreshToken, options, retries - 1);
            }
            throw err;
        }
    }

    async createConversation(model, name, refreshToken) {
        const { id: convId } = await this.request('POST', '/api/chat', refreshToken, {
            data: {
                enter_method: 'new_chat',
                is_example: false,
                kimiplus_id: /^[0-9a-z]{20}$/.test(model) ? model : 'kimi',
                name
            }
        });
        return convId;
    }

    async removeConversation(convId, refreshToken) {
        return await this.request('DELETE', `/api/chat/${convId}`, refreshToken);
    }

    async createCompletion({
        model = this.MODEL_NAME,
        messages = [],
        refreshToken,
        refConvId,
        retryCount = 0,
        segmentId,
        skipPreN2s = false
    } = {}) {
        try {
            logger.info(messages);
            const convId = /[0-9a-zA-Z]{20}/.test(refConvId) ? refConvId : await this.createConversation(model, "未命名会话", refreshToken);

            const { refs, refsFile } = await this.processFileRefs(messages, refreshToken, convId);
            this.fakeRequest(refreshToken).catch(err => logger.error('伪装请求失败:', err));

            const sendMessages = this.messagesPrepare(messages, !!refConvId);
            await this.preProcessMessages(model, sendMessages, refs, refreshToken, convId, segmentId, skipPreN2s);

            const { stream, kimiplusId } = await this.prepareCompletionRequest(model, convId, refreshToken, sendMessages, refs, refsFile, segmentId);
            const streamStartTime = util.timestamp();
            const answer = await this.receiveStream(model, convId, stream);

            if (answer.choices[0].finish_reason === 'length' && answer.segment_id) {
                const continueAnswer = await this.createCompletion({ model, messages: [], refreshToken, refConvId: convId, segmentId: answer.segment_id, skipPreN2s });
                answer.choices[0].message.content += continueAnswer.choices[0].message.content;
            }

            logger.success(`流传输完成 ${util.timestamp() - streamStartTime}ms`);
            if (!refConvId) this.removeConversation(convId, refreshToken).catch(err => logger.error('删除会话失败:', err));
            return answer;
        } catch (err) {
            logger.error('发生错误:', err.stack); // 打印堆栈跟踪
            return this.handleRetry(err, retryCount, () => this.createCompletion({ model, messages, refreshToken, refConvId, retryCount: retryCount + 1, skipPreN2s }));
        }
    }

    async createCompletionStream({
        model = this.MODEL_NAME,
        messages = [],
        refreshToken,
        refConvId,
        retryCount = 0,
        skipPreN2s = false
    } = {}) {
        try {
            logger.info(messages);
            const convId = /[0-9a-zA-Z]{20}/.test(refConvId) ? refConvId : await this.createConversation(model, "未命名会话", refreshToken);

            const { refs, refsFile } = await this.processFileRefs(messages, refreshToken, convId);
            this.fakeRequest(refreshToken).catch(err => logger.error('伪装请求失败:', err));

            const sendMessages = this.messagesPrepare(messages, !!refConvId);
            await this.preProcessMessages(model, sendMessages, refs, refreshToken, convId, null, skipPreN2s);

            const { stream, kimiplusId } = await this.prepareCompletionRequest(model, convId, refreshToken, sendMessages, refs, refsFile);
            const streamStartTime = util.timestamp();

            return this.createTransStream(model, convId, stream, () => {
                logger.success(`流传输完成 ${util.timestamp() - streamStartTime}ms`);
                if (!refConvId) this.removeConversation(convId, refreshToken).catch(err => logger.error('删除会话失败:', err));
            });
        } catch (err) {
            return this.handleRetry(err, retryCount, () => this.createCompletionStream({ model, messages, refreshToken, refConvId, retryCount: retryCount + 1, skipPreN2s }));
        }
    }

    async processFileRefs(messages, refreshToken, convId) {
        const refFileUrls = this.extractRefFileUrls(messages);
        const refResults = refFileUrls.length ? await Promise.all(refFileUrls.map(fileUrl => this.uploadFile(fileUrl, refreshToken, convId))) : [];
        return {
            refs: refResults.map(result => result.id),
            refsFile: refResults.map(result => ({
                detail: result,
                done: true,
                file: {},
                file_info: result,
                id: result.id,
                name: result.name,
                parse_status: 'success',
                size: result.size,
                upload_progress: 100,
                upload_status: 'success'
            }))
        };
    }

    async preProcessMessages(model, messages, refs, refreshToken, convId, segmentId, skipPreN2s = false) {
        if (!segmentId) {
            if (!skipPreN2s) {
                try {
                    await this.preN2s(model, messages, refs, refreshToken, convId);
                } catch (err) {
                    logger.error('preN2s 失败，但继续执行:', err);
                }
            } else {
                logger.info('跳过 preN2s 调用');
            }
        }
        this.getSuggestion(messages[0].content, refreshToken).catch(err => logger.error('getSuggestion 失败:', err));
        this.tokenSize(messages[0].content, refs, refreshToken, convId).catch(err => logger.error('tokenSize 失败:', err));
    }

    async prepareCompletionRequest(model, convId, refreshToken, messages, refs, refsFile, segmentId) {
        const isMath = model.indexOf('math') !== -1;
        const isSearchModel = model.indexOf('search') !== -1;
        const isResearchModel = model.indexOf('research') !== -1;
        const isK1Model = model.indexOf('k1') !== -1;

        logger.info(`使用模型: ${model}，是否联网检索: ${isSearchModel}，是否探索版: ${isResearchModel}，是否K1模型: ${isK1Model}，是否数学模型: ${isMath}`);
        if (segmentId) logger.info(`继续请求，segmentId: ${segmentId}`);

        if (isResearchModel) {
            const { total, used } = await this.getResearchUsage(refreshToken);
            if (used >= total) throw new APIException(EX.API_RESEARCH_EXCEEDS_LIMIT, `探索版使用量已达到上限`);
            logger.info(`探索版当前额度: ${used}/${total}`);
        }

        const kimiplusId = isK1Model ? 'crm40ee9e5jvhsn7ptcg' : (/^[0-9a-z]{20}$/.test(model) ? model : 'kimi');
        const stream = await this.request('POST', `/api/chat/${convId}/completion/stream`, refreshToken, {
            data: segmentId ? {
                segment_id: segmentId,
                action: 'continue',
                messages: [{ role: 'user', content: ' ' }],
                kimiplus_id: kimiplusId,
                extend: { sidebar: true }
            } : {
                kimiplus_id: kimiplusId,
                messages,
                refs,
                refs_file: refsFile,
                use_math: isMath,
                use_research: isResearchModel,
                use_search: isSearchModel,
                extend: { sidebar: true }
            },
            headers: { Referer: `https://kimi.moonshot.cn/chat/${convId}` },
            responseType: 'stream'
        });

        return { stream, kimiplusId };
    }

    async handleRetry(err, retryCount, retryFn) {
        if (retryCount < this.MAX_RETRY_COUNT) {
            logger.error(`流响应错误: ${err.message}`);
            logger.warn(`将在 ${this.RETRY_DELAY / 1000}秒后重试...`);
            await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
            return retryFn();
        }
        throw err;
    }

    async getSuggestion(query, refreshToken) {
        return await this.request('POST', '/api/suggestion', refreshToken, {
            data: {
                offset: 0,
                page_referer: 'chat',
                query: query.replace('user:', '').replace('assistant:', ''),
                scene: 'first_round',
                size: 10
            }
        });
    }

    async preN2s(model, messages, refs, refreshToken, refConvId) {
        const isSearchModel = model.indexOf('search') !== -1;
        return await this.request('POST', `/api/chat/${refConvId}/pre-n2s`, refreshToken, {
            data: {
                is_pro_search: false,
                kimiplus_id: /^[0-9a-z]{20}$/.test(model) ? model : 'kimi',
                messages,
                refs,
                use_search: isSearchModel
            }
        });
    }

    async tokenSize(query, refs, refreshToken, refConvId) {
        return await this.request('POST', `/api/chat/${refConvId}/token_size`, refreshToken, {
            data: { content: query, refs: [] }
        });
    }

    async getResearchUsage(refreshToken) {
        return await this.request('GET', '/api/chat/research/usage', refreshToken);
    }

    async fakeRequest(refreshToken) {
        const fakeRequests = [
            () => this.request('GET', '/api/user', refreshToken),
            () => this.request('POST', '/api/user/usage', refreshToken, { data: { usage: ['kimiv', 'math'] } }),
            () => this.request('GET', '/api/chat_1m/user/status', refreshToken),
            () => this.request('GET', '/api/kimi_mv/user/status', refreshToken),
            () => this.request('POST', '/api/kimiplus/history', refreshToken),
            () => this.request('POST', '/api/kimiplus/search', refreshToken, { data: { offset: 0, size: 20 } }),
            () => this.request('POST', '/api/chat/list', refreshToken, { data: { offset: 0, size: 50 } })
        ];
        await fakeRequests[Math.floor(Math.random() * 7)]();
    }

    extractRefFileUrls(messages) {
        const urls = [];
        if (!messages.length) return urls;
        const lastMessage = messages[messages.length - 1];
        if (_.isArray(lastMessage.content)) {
            lastMessage.content.forEach(v => {
                if (!_.isObject(v) || !['file', 'image_url'].includes(v['type'])) return;
                if (v['type'] === 'file' && _.isObject(v['file_url']) && _.isString(v['file_url']['url']))
                    urls.push(v['file_url']['url']);
                else if (v['type'] === 'image_url' && _.isObject(v['image_url']) && _.isString(v['image_url']['url']))
                    urls.push(v['image_url']['url']);
            });
        }
        logger.info(`本次请求上传：${urls.length}个文件`);
        return urls;
    }

    messagesPrepare(messages, isRefConv = false) {
        let content;
        if (isRefConv || messages.length < 2) {
            content = messages.reduce((content, message) => {
                if (_.isArray(message.content)) {
                    return message.content.reduce((_content, v) => {
                        if (!_.isObject(v) || v['type'] !== 'text') return _content;
                        return _content + `${v["text"] || ""}\n`;
                    }, content);
                }
                return content += `${message.role === 'user' ? this.wrapUrlsToTags(message.content) : message.content}\n`;
            }, '');
        } else {
            let latestMessage = messages[messages.length - 1];
            let hasFileOrImage = Array.isArray(latestMessage.content) &&
                latestMessage.content.some(v => (typeof v === 'object' && ['file', 'image_url'].includes(v['type'])));
            if (hasFileOrImage) {
                messages.splice(messages.length - 1, 0, { "content": "关注用户最新发送文件和消息", "role": "system" });
                logger.info("注入提升尾部文件注意力system prompt");
            } else {
                messages.splice(messages.length - 1, 0, { "content": "关注用户最新的消息", "role": "system" });
                logger.info("注入提升尾部消息注意力system prompt");
            }
            content = messages.reduce((content, message) => {
                if (_.isArray(message.content)) {
                    return message.content.reduce((_content, v) => {
                        if (!_.isObject(v) || v['type'] !== 'text') return _content;
                        return _content + `${message.role || "user"}:${v["text"] || ""}\n`;
                    }, content);
                }
                return content += `${message.role || "user"}:${message.role === 'user' ? this.wrapUrlsToTags(message.content) : message.content}\n`;
            }, '');
            logger.info(`\n对话合并：\n${content}`);
        }
        return [{ role: 'user', content }];
    }

    wrapUrlsToTags(content) {
        return content.replace(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi,
            url => `<url id="" type="url" status="" title="" wc="">${url}</url>`);
    }

    async preSignUrl(action, filename, refreshToken) {
        const { accessToken, userId } = await this.acquireToken(refreshToken);
        const result = await axios.post('https://kimi.moonshot.cn/api/pre-sign-url', {
            action,
            name: filename
        }, {
            timeout: 15000,
            headers: { Authorization: `Bearer ${accessToken}`, Referer: `https://kimi.moonshot.cn/`, 'X-Traffic-Id': userId, ...this.FAKE_HEADERS },
            validateStatus: () => true
        });
        return this.checkResult(result, refreshToken);
    }

    async checkFileUrl(fileUrl) {
        if (util.isBASE64Data(fileUrl)) return;
        const result = await axios.head(fileUrl, { timeout: 15000, validateStatus: () => true });
        if (result.status >= 400)
            throw new APIException(EX.API_FILE_URL_INVALID, `文件 ${fileUrl} 无效: [${result.status}] ${result.statusText}`);
        if (result.headers && result.headers['content-length']) {
            const fileSize = parseInt(result.headers['content-length'], 10);
            if (fileSize > this.FILE_MAX_SIZE)
                throw new APIException(EX.API_FILE_EXECEEDS_SIZE, `文件 ${fileUrl} 超过大小限制`);
        }
    }

    async uploadFile(fileUrl, refreshToken, refConvId) {
        await this.checkFileUrl(fileUrl);
        let filename, fileData, mimeType;
    
        if (util.isBASE64Data(fileUrl)) {
            mimeType = util.extractBASE64DataFormat(fileUrl);
            const ext = mimeTypes.extension(mimeType);
            filename = `${util.uuid()}.${ext || 'bin'}`;
            fileData = Buffer.from(util.removeBASE64DataHeader(fileUrl), 'base64');
        } else {
            filename = path.basename(fileUrl);
            ({ data: fileData } = await axios.get(fileUrl, { responseType: 'arraybuffer', maxContentLength: this.FILE_MAX_SIZE, timeout: 60000 }));
        }
    
        const fileType = (mimeType || mimeTypes.lookup(filename) || '').includes('image') ? 'image' : 'file';
        const { url: uploadUrl, object_name: objectName } = await this.preSignUrl(fileType, filename, refreshToken);
        let fileId = (await this.preSignUrl(fileType, filename, refreshToken)).file_id;
        mimeType = mimeType || mimeTypes.lookup(filename) || 'application/octet-stream';
    
        const { accessToken, userId } = await this.acquireToken(refreshToken);
        let result = await axios.request({
            method: 'PUT',
            url: uploadUrl,
            data: fileData,
            maxBodyLength: this.FILE_MAX_SIZE,
            timeout: 120000,
            headers: { 'Content-Type': mimeType, Authorization: `Bearer ${accessToken}`, Referer: `https://kimi.moonshot.cn/`, 'X-Traffic-Id': userId, ...this.FAKE_HEADERS },
            validateStatus: () => true
        });
        this.checkResult(result, refreshToken);
    
        let status, startTime = Date.now();
        let fileDetail;
        while (status !== 'initialized' && status !== 'parsed') {
            if (Date.now() - startTime > 30000) throw new Error('文件等待处理超时');
            result = await axios.post('https://kimi.moonshot.cn/api/file', fileType === 'image' ? {
                type: 'image',
                file_id: fileId,
                name: filename
            } : {
                type: 'file',
                name: filename,
                object_name: objectName,
                file_id: '',
                chat_id: refConvId
            }, {
                headers: { Authorization: `Bearer ${accessToken}`, Referer: `https://kimi.moonshot.cn/`, 'X-Traffic-Id': userId, ...this.FAKE_HEADERS }
            });
            fileDetail = this.checkResult(result, refreshToken);
            ({ id: fileId, status } = fileDetail); // 现在可以用解构赋值更新 fileId
        }
    
        startTime = Date.now();
        let parseFinish = status === 'parsed';
        while (!parseFinish) {
            if (Date.now() - startTime > 30000) throw new Error('文件等待处理超时');
            parseFinish = await new Promise(resolve => {
                axios.post('https://kimi.moonshot.cn/api/file/parse_process', { ids: [fileId], timeout: 120000 }, {
                    headers: { Authorization: `Bearer ${accessToken}`, Referer: `https://kimi.moonshot.cn/`, 'X-Traffic-Id': userId, ...this.FAKE_HEADERS }
                }).then(() => resolve(true)).catch(() => resolve(false));
            });
        }
        return fileDetail;
    }
    
    checkResult(result, refreshToken) {
        if (result.status === 401) {
            this.accessTokenMap.delete(refreshToken);
            throw new APIException(EX.API_REQUEST_FAILED, '认证失败');
        }
        if (!result.data) return null;
        const { error_type, message } = result.data;
        if (!_.isString(error_type)) return result.data;
        if (error_type === 'auth.token.invalid') {
            this.accessTokenMap.delete(refreshToken);
            throw new APIException(EX.API_REQUEST_FAILED, 'Token 无效');
        }
        if (error_type === 'chat.user_stream_pushing') {
            throw new APIException(EX.API_CHAT_STREAM_PUSHING, '用户流正在推送');
        }
        logger.error('服务返回错误:', result.data);
        throw new APIException(EX.API_REQUEST_FAILED, `[请求kimi失败]: ${message}`);
    }

    async receiveStream(model, convId, stream) {
        let webSearchCount = 0;
        let temp = Buffer.from('');
        return new Promise((resolve, reject) => {
            const data = {
                id: convId,
                model,
                object: 'chat.completion',
                choices: [{ index: 0, message: { role: 'assistant', content: '' }, finish_reason: 'stop' }],
                usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
                segment_id: '',
                created: util.unixTimestamp()
            };
            let refContent = '';
            const silentSearch = model.indexOf('silent') !== -1;

            stream.on("data", buffer => {
                if (buffer.toString().indexOf('�') !== -1) {
                    temp = Buffer.concat([temp, buffer]);
                    return;
                }
                if (temp.length > 0) {
                    buffer = Buffer.concat([temp, buffer]);
                    temp = Buffer.from('');
                }

                const lines = buffer.toString().split('\n');
                for (const line of lines) {
                    if (!line.trim()) continue;
                    if (!line.startsWith('data: ')) continue;

                    const eventData = line.slice(6);
                    try {
                        const result = JSON.parse(eventData);
                        logger.info('解析事件:', result);

                        if (result.event === 'cmpl') {
                            if (typeof result.text === 'string') {
                                data.choices[0].message.content += result.text;
                                logger.info('当前累积内容:', data.choices[0].message.content);
                            }
                        } else if (result.event === 'req') {
                            data.segment_id = result.id;
                        } else if (result.event === 'length') {
                            logger.warn('生成达到max_tokens，将继续请求拼接完整响应');
                            data.choices[0].finish_reason = 'length';
                        } else if (result.event === 'all_done') {
                            data.choices[0].message.content += (refContent ? `\n\n搜索结果来自：\n${refContent}` : '');
                            logger.info('最终内容:', data.choices[0].message.content);
                            resolve(data);
                        } else if (!silentSearch && result.event === 'search_plus' && result.msg && result.msg.type === 'get_res') {
                            webSearchCount += 1;
                            refContent += `【检索 ${webSearchCount}】 [${result.msg.title}](${result.msg.url})\n\n`;
                        }
                    } catch (err) {
                        logger.error('解析错误:', err);
                        reject(err);
                    }
                }
            });

            stream.once("error", err => reject(err));
            stream.once("close", () => {
                logger.info('流关闭，最终内容:', data.choices[0].message.content);
                if (!data.choices[0].message.content) {
                    logger.warn('流关闭时内容为空，可能未收到 all_done 事件');
                }
                resolve(data);
            });
        });
    }

    createTransStream(model, convId, stream, endCallback) {
        const created = util.unixTimestamp();
        const transStream = new PassThrough();
        let webSearchCount = 0;
        let searchFlag = false;
        let lengthExceed = false;
        let segmentId = '';
        const silentSearch = model.indexOf('silent') !== -1;

        !transStream.closed && transStream.write(`data: ${JSON.stringify({
            id: convId,
            model,
            object: 'chat.completion.chunk',
            choices: [{ index: 0, delta: { role: 'assistant', content: '' }, finish_reason: null }],
            segment_id: '',
            created
        })}\n\n`);

        stream.on("data", buffer => {
            const lines = buffer.toString().split('\n');
            for (const line of lines) {
                if (!line.trim()) continue;
                if (!line.startsWith('data: ')) continue;

                const eventData = line.slice(6);
                try {
                    const result = JSON.parse(eventData);
                    if (result.event === 'cmpl') {
                        const exceptCharIndex = result.text.indexOf("�");
                        const chunk = result.text.substring(0, exceptCharIndex === -1 ? result.text.length : exceptCharIndex);
                        const data = `data: ${JSON.stringify({
                            id: convId,
                            model,
                            object: 'chat.completion.chunk',
                            choices: [{ index: 0, delta: { content: (searchFlag ? '\n' : '') + chunk }, finish_reason: null }],
                            segment_id: segmentId,
                            created
                        })}\n\n`;
                        if (searchFlag) searchFlag = false;
                        !transStream.closed && transStream.write(data);
                    } else if (result.event === 'req') {
                        segmentId = result.id;
                    } else if (result.event === 'length') {
                        lengthExceed = true;
                    } else if (result.event === 'all_done' || result.event === 'error') {
                        const data = `data: ${JSON.stringify({
                            id: convId,
                            model,
                            object: 'chat.completion.chunk',
                            choices: [{
                                index: 0,
                                delta: result.event === 'error' ? { content: '\n[内容由于不合规被停止生成，我们换个话题吧]' } : {},
                                finish_reason: lengthExceed ? 'length' : 'stop'
                            }],
                            usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
                            segment_id: segmentId,
                            created
                        })}\n\n`;
                        !transStream.closed && transStream.write(data);
                        !transStream.closed && transStream.end('data: [DONE]\n\n');
                        endCallback && endCallback();
                    } else if (!silentSearch && result.event === 'search_plus' && result.msg && result.msg.type === 'get_res') {
                        if (!searchFlag) searchFlag = true;
                        webSearchCount += 1;
                        const data = `data: ${JSON.stringify({
                            id: convId,
                            model,
                            object: 'chat.completion.chunk',
                            choices: [{
                                index: 0,
                                delta: { content: `【检索 ${webSearchCount}】 [${result.msg.title}](${result.msg.url})\n` },
                                finish_reason: null
                            }],
                            segment_id: segmentId,
                            created
                        })}\n\n`;
                        !transStream.closed && transStream.write(data);
                    }
                } catch (err) {
                    logger.error(err);
                    !transStream.closed && transStream.end('\n\n');
                }
            }
        });

        stream.once("error", () => !transStream.closed && transStream.end('data: [DONE]\n\n'));
        stream.once("close", () => !transStream.closed && transStream.end('data: [DONE]\n\n'));
        return transStream;
    }

    tokenSplit(authorization) {
        return authorization.replace('Bearer ', '').split(',');
    }

    async getTokenLiveStatus(refreshToken) {
        const result = await axios.get('https://kimi.moonshot.cn/api/auth/token/refresh', {
            headers: { Authorization: `Bearer ${refreshToken}`, Referer: 'https://kimi.moonshot.cn/', ...this.FAKE_HEADERS },
            timeout: 15000,
            validateStatus: () => true
        });
        try {
            const { access_token, refresh_token } = this.checkResult(result, refreshToken);
            return !!(access_token && refresh_token);
        } catch (err) {
            return false;
        }''
    }
}

const kimiClient = new KimiClient();

export default {
    createConversation: (...args) => kimiClient.createConversation(...args),
    createCompletion: (config) => kimiClient.createCompletion(config),
    createCompletionStream: (config) => kimiClient.createCompletionStream(config),
    getTokenLiveStatus: (...args) => kimiClient.getTokenLiveStatus(...args),
    tokenSplit: (...args) => kimiClient.tokenSplit(...args)
};