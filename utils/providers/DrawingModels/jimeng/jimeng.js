import axios from 'axios';
import path from 'path';
import mime from 'mime-types';
import { randomUUID } from 'crypto';
import { random_safe } from '../../../requests/safeurl.js';

const log = {
    info: (...args) => console.log('[INFO]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    error: (...args) => console.error('[ERROR]', ...args),
};

export default {
    API_TEST: [-9999, 'API异常错误'],
    API_REQUEST_PARAMS_INVALID: [-2000, '请求参数非法'],
    API_REQUEST_FAILED: [-2001, '请求失败'],
    API_TOKEN_EXPIRES: [-2002, 'Token已失效'],
    API_FILE_URL_INVALID: [-2003, '远程文件URL非法'],
    API_FILE_EXECEEDS_SIZE: [-2004, '远程文件超出大小'],
    API_CHAT_STREAM_PUSHING: [-2005, '已有对话流正在输出'],
    API_CONTENT_FILTERED: [-2006, '内容由于合规问题已被阻止生成'],
    API_IMAGE_GENERATION_FAILED: [-2007, '图像生成失败'],
    API_VIDEO_GENERATION_FAILED: [-2008, '视频生成失败'],
    API_IMAGE_GENERATION_INSUFFICIENT_POINTS: [-2009, '即梦积分不足'],
};

const DEFAULT_ASSISTANT_ID = "513695";
const VERSION_CODE = "5.8.0";
const PLATFORM_CODE = "7";
const WEB_ID = Math.random() * 999999999999999999 + 7000000000000000000;
const USER_ID = uuid(false);
const FILE_MAX_SIZE = 100 * 1024 * 1024;
const DEFAULT_IMAGE_MODEL = "jimeng-2.1";
const DEFAULT_VIDEO_MODEL = "dreamina_ic_generate_video_model_vgfm_lite";
const DRAFT_VERSION = "3.0.2";

// 模型映射
const MODEL_MAP = {
    "jimeng-3.0": "high_aes_general_v30l:general_v3.0_18b",
    "jimeng-2.1": "high_aes_general_v21_L:general_v2.1_L",
    "jimeng-2.0-pro": "high_aes_general_v20_L:general_v2.0_L",
    "jimeng-2.0": "high_aes_general_v20:general_v2.0",
    "jimeng-xl-pro": "text2img_xl_sft",
    "jimeng-video-1.2": "dreamina_ailab_generate_video_model_v1.2",
    "jimeng-video-s2.0": "dreamina_ic_generate_video_model_vgfm_lite",
    "jimeng-video-p2.0-pro": "dreamina_ailab_generate_video_model_v1.4",
    "jimeng-video-s2.0-pro": "dreamina_ic_generate_video_model_vgfm1.0",
};

// 默认请求头
const FAKE_HEADERS = {
    Accept: "application/json, text/plain, */*",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Cache-Control": "no-cache",
    "Last-Event-Id": "undefined",
    Appid: DEFAULT_ASSISTANT_ID,
    Appvr: VERSION_CODE,
    Origin: random_safe('aHR0cHM6Ly9qaW1lbmcuamlhbnlpbmcuY29t'),
    Pragma: "no-cache",
    Priority: "u=1, i",
    Referer: random_safe('aHR0cHM6Ly9qaW1lbmcuamlhbnlpbmcuY29t'),
    Pf: PLATFORM_CODE,
    "Sec-Ch-Ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
};

// 工具函数
function uuid(withHyphen = true) {
    const id = randomUUID();
    return withHyphen ? id : id.replace(/-/g, '');
}

function unixTimestamp() {
    return Math.floor(Date.now() / 1000);
}

async function md5(str) {
    const { createHash } = await import('crypto');
    return createHash('md5').update(str).digest('hex');
}

function isBASE64Data(str) {
    return /^data:[\w\/]+;base64,/.test(str);
}

function extractBASE64DataFormat(str) {
    return str.match(/^data:([\w\/]+);base64,/)[1];
}

function removeBASE64DataHeader(str) {
    return str.replace(/^data:[\w\/]+;base64,/, '');
}

// Token 和 Cookie
async function acquireToken(sessionId) {
    log.info('获取 Token:', sessionId);
    return sessionId;
}

function generateCookie(sessionId) {
    log.info('生成 Cookie');
    return [
        `_tea_web_id=${WEB_ID}`,
        `is_staff_user=false`,
        `store-region=cn-gd`,
        `store-region-src=uid`,
        `sid_guard=${sessionId}|${unixTimestamp()}|5184000|Mon, 03-Feb-2025 08:17:09 GMT`,
        `uid_tt=${USER_ID}`,
        `uid_tt_ss=${USER_ID}`,
        `sid_tt=${sessionId}`,
        `sessionid=${sessionId}`,
        `sessionid_ss=${sessionId}`,
    ].join("; ");
}

// API 请求核心函数
async function request(method, uri, sessionId, options = {}) {
    log.info(`发起 ${method} 请求: ${uri}`);
    const token = await acquireToken(sessionId);
    const deviceTime = unixTimestamp();
    const sign = await md5(`9e2c|${uri.slice(-7)}|${PLATFORM_CODE}|${VERSION_CODE}|${deviceTime}||11ac`);

    try {
        const response = await axios.request({
            method,
            url: `${random_safe('aHR0cHM6Ly9qaW1lbmcuamlhbnlpbmcuY29t')}${uri}`,
            params: { aid: DEFAULT_ASSISTANT_ID, device_platform: "web", region: "CN", web_id: WEB_ID, ...options.params },
            headers: { ...FAKE_HEADERS, Cookie: generateCookie(token), "Device-Time": deviceTime, Sign: sign, "Sign-Ver": "1", ...options.headers },
            data: options.data,
            timeout: 480000,
            validateStatus: () => true,
        });
        log.info(`请求 ${uri} 成功`);
        return checkResult(response);
    } catch (error) {
        log.error(`请求 ${uri} 失败:`, error.message);
        throw error;
    }
}

function checkResult(response) {
    const { ret, errmsg, data } = response.data;

    // 检查返回码是否为数字
    if (!Number.isFinite(Number(ret))) {
        log.warn('响应格式异常，返回原始数据');
        return response.data;
    }

    const retCode = Number(ret);

    // 成功情况
    if (retCode === 0) {
        log.info('请求成功，返回数据');
        return data;
    }

    // 已知的错误码映射
    const errorMap = new Map(Object.entries({
        '-9999': 'API异常错误',
        '-2000': '请求参数非法',
        '-2001': '请求失败',
        '-2002': 'Token已失效',
        '-2003': '远程文件URL非法',
        '-2004': '远程文件超出大小',
        '-2005': '已有对话流正在输出',
        '-2006': '内容由于合规问题已被阻止生成',
        '-2007': '图像生成失败',
        '-2008': '视频生成失败',
        '-2009': '即梦积分不足',
        '5000': '积分不足',
    }));

    // 检查是否为已知错误
    if (errorMap.has(ret.toString())) {
        const errorMsg = errorMap.get(ret.toString());
        log.error(`请求失败 [${ret}]: ${errorMsg}${errmsg ? ' - ' + errmsg : ''}`);
        throw new Error(`[请求失败 ${ret}]: ${errorMsg}${errmsg ? ' - ' + errmsg : ''}`);
    }

    // 未匹配的错误码，返回默认失败结果
    log.error(`请求失败 [${ret}]: 未识别的错误码${errmsg ? ' - ' + errmsg : ''}`);
    return {
        success: false,
        code: retCode,
        message: `未识别的错误码${errmsg ? ' - ' + errmsg : ''}`,
        data: null
    };
}

// 积分相关
async function getCredit(sessionId) {
    log.info('获取积分信息');
    const { credit: { gift_credit, purchase_credit, vip_credit } } = await request("POST", "/commerce/v1/benefits/user_credit", sessionId, { data: {} });
    const totalCredit = gift_credit + purchase_credit + vip_credit;
    log.info(`积分信息: 赠送=${gift_credit}, 购买=${purchase_credit}, VIP=${vip_credit}, 总计=${totalCredit}`);
    return { giftCredit: gift_credit, purchaseCredit: purchase_credit, vipCredit: vip_credit, totalCredit };
}

async function receiveCredit(sessionId) {
    log.info('接收今日积分');
    const { cur_total_credits } = await request("POST", "/commerce/v1/benefits/credit_receive", sessionId, {
        data: { time_zone: "Asia/Shanghai" },
        headers: { Referer: random_safe('aHR0cHM6Ly9qaW1lbmcuamlhbnlpbmcuY29tL2FpLXRvb2wvaW1hZ2UvZ2VuZXJhdGU=') },
    });
    log.info(`今日积分接收成功，剩余积分: ${cur_total_credits}`);
    return cur_total_credits;
}

// 文件处理
async function checkFileUrl(fileUrl) {
    if (isBASE64Data(fileUrl)) {
        log.info('文件为 BASE64 数据，跳过 URL 检查');
        return;
    }
    log.info(`检查文件 URL: ${fileUrl}`);
    const result = await axios.head(fileUrl, { timeout: 15000, validateStatus: () => true });
    if (result.status >= 400) {
        log.error(`文件 ${fileUrl} 无效: [${result.status}] ${result.statusText}`);
        throw new Error(`文件 ${fileUrl} 无效: [${result.status}] ${result.statusText}`);
    }
    if (result.headers["content-length"] && parseInt(result.headers["content-length"], 10) > FILE_MAX_SIZE) {
        log.error(`文件 ${fileUrl} 超出大小限制`);
        throw new Error(`文件 ${fileUrl} 超出大小限制`);
    }
    log.info(`文件 ${fileUrl} 检查通过`);
}

async function uploadFile(fileUrl, sessionId, isVideoImage = false) {
    log.info(`上传文件: ${fileUrl}`);
    await checkFileUrl(fileUrl);
    let filename, fileData, mimeType;
    if (isBASE64Data(fileUrl)) {
        mimeType = extractBASE64DataFormat(fileUrl);
        const ext = mime.extension(mimeType);
        filename = `${uuid()}.${ext}`;
        fileData = Buffer.from(removeBASE64DataHeader(fileUrl), "base64");
        log.info(`处理 BASE64 文件: ${filename}`);
    } else {
        filename = path.basename(fileUrl);
        const response = await axios.get(fileUrl, { responseType: "arraybuffer", maxContentLength: FILE_MAX_SIZE, timeout: 60000 });
        fileData = response.data;
        log.info(`下载文件成功: ${filename}`);
    }
    mimeType = mimeType || mime.lookup(filename);
    log.info(`文件上传准备完成: ${filename}, MIME: ${mimeType}`);
    return { filename, fileData, mimeType };
}

// 模型解析
function parseModel(model, customWidth, customHeight) {
    const [_model, size] = model.split(":");
    const [_, width, height] = /(\d+)[\W\w](\d+)/.exec(size) ?? [];
    
    const parsed = { 
        model: _model, 
        width: customWidth || (size ? Math.ceil(parseInt(width) / 2) * 2 : 1024), 
        height: customHeight || (size ? Math.ceil(parseInt(height) / 2) * 2 : 1024) 
    };
    
    log.info(`解析模型: ${model} -> ${JSON.stringify(parsed)}`);
    return parsed;
}

function getModel(model, type = "image") {
    const defaultModel = type === "image" ? DEFAULT_IMAGE_MODEL : DEFAULT_VIDEO_MODEL;
    const mappedModel = MODEL_MAP[model] || MODEL_MAP[defaultModel];
    log.info(`模型映射: ${model} -> ${mappedModel}`);
    return mappedModel;
}

// 图像生成
async function generateImages(model, prompt, { width = 1024, height = 1024, sampleStrength = 0.8, negativePrompt = "" }, sessionId) {
    log.info(`生成图像: 模型=${model}, 提示词=${prompt}, 尺寸=${width}x${height}`);
    const mappedModel = getModel(model, "image");
    const { totalCredit } = await getCredit(sessionId);
    if (totalCredit <= 0) {
        log.warn('积分不足，尝试接收今日积分');
        await receiveCredit(sessionId);
    }

    const componentId = uuid();
    const { aigc_data } = await request("POST", "/mweb/v1/aigc_draft/generate", sessionId, {
        params: {
            babi_param: encodeURIComponent(JSON.stringify({
                scenario: "image_video_generation",
                feature_key: "aigc_to_image",
                feature_entrance: "to_image",
                feature_entrance_detail: `to_image-${mappedModel}`,
            })),
        },
        data: {
            extend: { root_model: mappedModel, template_id: "" },
            submit_id: uuid(),
            metrics_extra: JSON.stringify({ templateId: "", generateCount: 1, promptSource: "custom", templateSource: "", lastRequestId: "", originRequestId: "" }),
            draft_content: JSON.stringify({
                type: "draft",
                id: uuid(),
                min_version: DRAFT_VERSION,
                is_from_tsn: true,
                version: DRAFT_VERSION,
                main_component_id: componentId,
                component_list: [{
                    type: "image_base_component",
                    id: componentId,
                    min_version: DRAFT_VERSION,
                    generate_type: "generate",
                    aigc_mode: "workbench",
                    abilities: {
                        type: "",
                        id: uuid(),
                        generate: {
                            type: "",
                            id: uuid(),
                            core_param: {
                                type: "",
                                id: uuid(),
                                model: mappedModel,
                                prompt,
                                negative_prompt: negativePrompt,
                                seed: Math.floor(Math.random() * 100000000) + 2500000000,
                                sample_strength: sampleStrength,
                                image_ratio: 1,
                                large_image_info: { type: "", id: uuid(), height, width },
                            },
                            history_option: { type: "", id: uuid() },
                        },
                    },
                }],
            }),
            http_common_info: { aid: Number(DEFAULT_ASSISTANT_ID) },
        },
    });

    const historyId = aigc_data.history_record_id;
    if (!historyId) {
        log.error('记录ID不存在');
        throw new Error("记录ID不存在");
    }
    log.info(`生成记录ID: ${historyId}`);

    let status = 20, item_list = [];
    while (status === 20) {
        log.info(`轮询生成状态: ${historyId}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const result = await request("POST", "/mweb/v1/get_history_by_ids", sessionId, {
            data: {
                history_ids: [historyId],
                image_info: {
                    width: 2048,
                    height: 2048,
                    format: "webp",
                    image_scene_list: [
                        { scene: "smart_crop", width: 360, height: 360, uniq_key: "smart_crop-w:360-h:360", format: "webp" },
                        { scene: "smart_crop", width: 480, height: 480, uniq_key: "smart_crop-w:480-h:480", format: "webp" },
                        { scene: "smart_crop", width: 720, height: 720, uniq_key: "smart_crop-w:720-h:720", format: "webp" },
                        { scene: "smart_crop", width: 720, height: 480, uniq_key: "smart_crop-w:720-h:480", format: "webp" },
                        { scene: "smart_crop", width: 360, height: 240, uniq_key: "smart_crop-w:360-h:240", format: "webp" },
                        { scene: "smart_crop", width: 240, height: 320, uniq_key: "smart_crop-w:240-h:320", format: "webp" },
                        { scene: "smart_crop", width: 480, height: 640, uniq_key: "smart_crop-w:480-h:640", format: "webp" },
                        { scene: "normal", width: 2400, height: 2400, uniq_key: "2400", format: "webp" },
                        { scene: "normal", width: 1080, height: 1080, uniq_key: "1080", format: "webp" },
                        { scene: "normal", width: 720, height: 720, uniq_key: "720", format: "webp" },
                        { scene: "normal", width: 480, height: 480, uniq_key: "480", format: "webp" },
                        { scene: "normal", width: 360, height: 360, uniq_key: "360", format: "webp" },
                    ],
                },
                http_common_info: { aid: Number(DEFAULT_ASSISTANT_ID) },
            },
        });
        if (!result[historyId]) {
            log.error('记录不存在');
            throw new Error("记录不存在");
        }
        status = result[historyId].status;
        item_list = result[historyId].item_list;
        log.info(`当前状态: ${status}`);
    }

    if (status === 30) {
        log.error('图像生成失败');
        throw new Error("图像生成失败");
    }
    const imageUrls = item_list.map(item => item?.image?.large_images?.[0]?.image_url || item?.common_attr?.cover_url || null);
    log.info('图像生成完成:', imageUrls);
    return imageUrls;
}

// 视频生成
async function generateVideo(model, prompt, { aspectRatio = "16:9", fps = 24, durationMs = 5000, seed = Math.floor(Math.random() * 1000000000) }, sessionId) {
    log.info(`生成视频: 模型=${model}, 提示词=${prompt}, 宽高比=${aspectRatio}, FPS=${fps}, 时长=${durationMs}ms`);
    const mappedModel = getModel(model, "video");
    const { totalCredit } = await getCredit(sessionId);
    if (totalCredit <= 0) {
        log.warn('积分不足，尝试接收今日积分');
        await receiveCredit(sessionId);
    }

    const submitId = uuid();
    const { aigc_data } = await request("POST", "/mweb/v1/generate_video", sessionId, {
        params: {
            babi_param: encodeURIComponent(JSON.stringify({
                scenario: "image_video_generation",
                feature_key: "text_to_video",
                feature_entrance: "to_image",
                feature_entrance_detail: `to_image-${mappedModel}`,
            })),
        },
        data: {
            submit_id: submitId,
            task_extra: JSON.stringify({
                promptSource: "custom",
                originSubmitId: uuid(),
                isDefaultSeed: 1,
                originTemplateId: "",
                imageNameMapping: {},
                isUseAiGenPrompt: false,
                batchNumber: 1,
            }),
            input: {
                video_aspect_ratio: aspectRatio,
                seed,
                video_gen_inputs: [{
                    prompt,
                    fps,
                    duration_ms: durationMs,
                    video_mode: 2,
                    template_id: "",
                }],
                priority: 0,
                model_req_key: mappedModel,
            },
            mode: "workbench",
            history_option: {},
            commerce_info: {
                resource_id: "generate_video",
                resource_id_type: "str",
                resource_sub_type: "aigc",
                benefit_type: "basic_video_operation_vgfm_lite",
            },
            client_trace_data: {},
        },
    });

    const historyId = aigc_data.history_record_id;
    const taskId = aigc_data.task.task_id;
    if (!historyId || !taskId) {
        log.error('记录ID或任务ID不存在');
        throw new Error("记录ID或任务ID不存在");
    }
    log.info(`生成记录ID: ${historyId}, 任务ID: ${taskId}`);

    let status = 0, videoUrl = null;
    while (status !== 50) {
        log.info(`轮询视频生成状态: ${taskId}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        const result = await request("POST", "/mweb/v1/mget_generate_task", sessionId, {
            data: { task_id_list: [taskId] },
        });
        const taskData = result.task_map[taskId];
        if (!taskData) {
            log.error('任务不存在');
            throw new Error("任务不存在");
        }
        status = taskData.status;
        if (status === 10) {
            log.error('视频生成失败');
            throw new Error("视频生成失败");
        }
        if (status === 50) {
            videoUrl = taskData.item_list[0]?.video?.transcoded_video?.origin?.video_url;
        }
        log.info(`当前状态: ${status}`);
    }

    if (!videoUrl) {
        log.error('视频生成失败');
        throw new Error("视频生成失败");
    }
    log.info('视频生成完成:', videoUrl);
    return videoUrl;
}

// 对话补全
async function createCompletion(messages, sessionId, model = DEFAULT_IMAGE_MODEL, type = "image", options = {}) {
    log.info('开始对话补全:', { messages, model, type, options });
    if (!messages.length) {
        log.error('消息不能为空');
        throw new Error("消息不能为空");
    }
    const prompt = messages[messages.length - 1].content;
    if (type === "image") {
        const { model: parsedModel, width, height } = parseModel(model, options.width, options.height);
        const imageUrls = await generateImages(parsedModel, prompt, { width, height }, sessionId);
        const result = imageUrls.reduce((acc, url, i) => acc + `![image_${i}](${url})\n`, "");
        log.info('图像对话补全完成:', result);
        return result;
    } else if (type === "video") {
        const videoUrl = await generateVideo(model, prompt, options, sessionId);
        const result = `![video](${videoUrl})`;
        log.info('视频对话补全完成:', result);
        return result;
    }
    throw new Error("不支持的生成类型");
}

export {
    acquireToken,
    generateCookie,
    getCredit,
    receiveCredit,
    request,
    checkFileUrl,
    uploadFile,
    generateImages,
    generateVideo,
    createCompletion,
};