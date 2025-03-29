import { PassThrough } from "stream";
import path from "path";
import _ from "lodash";
import crypto from 'crypto';
import axios from 'axios';
import FormData from 'form-data';
import mimeTypes from 'mime-types';

// 日志工具
const logger = {
  info: (...args) => console.log("[INFO]", ...args),
  success: (...args) => console.log("[SUCCESS]", ...args),
  warn: (...args) => console.warn("[WARN]", ...args),
  error: (...args) => console.error("[ERROR]", ...args),
};

// 工具函数
const util = {
  unixTimestamp: () => Math.floor(Date.now() / 1000),
  timestamp: () => Date.now(),
  isBASE64Data: (str) => /^data:[\w\/]+;base64,/.test(str),
  extractBASE64DataFormat: (str) => str.match(/^data:([\w\/]+);base64,/)[1],
  removeBASE64DataHeader: (str) => str.replace(/^data:[\w\/]+;base64,/, ""),
  uuid: (dash = true) =>
    (dash ? [1e7] + -1e3 + -4e3 + -8e3 + -1e11 : [1e7] + 1e3 + 4e3 + 8e3 + 1e11).replace(/[018]/g, (c) =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    ),
};

// API异常类
class APIException extends Error {
  constructor([code, message]) {
    super(message);
    this.code = code;
    this.name = "APIException";
  }
}

// 异常常量
const EX = {
  API_TEST: [-9999, "API异常错误"],
  API_REQUEST_PARAMS_INVALID: [-2000, "请求参数非法"],
  API_REQUEST_FAILED: [-2001, "请求失败"],
  API_TOKEN_EXPIRES: [-2002, "Token已失效"],
  API_FILE_URL_INVALID: [-2003, "远程文件URL非法"],
  API_FILE_EXECEEDS_SIZE: [-2004, "远程文件超出大小"],
  API_CHAT_STREAM_PUSHING: [-2005, "已有对话流正在输出"],
  API_CONTENT_FILTERED: [-2006, "内容由于合规问题已被阻止生成"],
  API_IMAGE_GENERATION_FAILED: [-2007, "图像生成失败"],
  API_VIDEO_GENERATION_FAILED: [-2008, "视频生成失败"],
};

// 配置常量
const MODEL_NAME = "glm";
const DEFAULT_ASSISTANT_ID = "65940acff94777010aa6b796";
const ZERO_ASSISTANT_ID = "676411c38945bbc58a905d31";
const ACCESS_TOKEN_EXPIRES = 3600;
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 5000;
const FILE_MAX_SIZE = 100 * 1024 * 1024;
const FAKE_HEADERS = {
  Accept: "*/*",
  "App-Name": "chatglm",
  Platform: "pc",
  Origin: "https://chatglm.cn",
  "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Version: "0.0.1",
};

// 全局变量
const accessTokenMap = new Map();
const accessTokenRequestQueueMap = {};

/**
 * 请求access_token
 * @param {string} refreshToken - 用于刷新access_token的refresh_token
 */
async function requestToken(refreshToken) {
  if (accessTokenRequestQueueMap[refreshToken]) {
    return new Promise((resolve) => accessTokenRequestQueueMap[refreshToken].push(resolve));
  }
  accessTokenRequestQueueMap[refreshToken] = [];
  logger.info(`Refresh token: ${refreshToken}`);

  try {
    const result = await axios.post(
      "https://chatglm.cn/chatglm/backend-api/v1/user/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          Referer: "https://chatglm.cn/main/alltoolsdetail",
          "X-Device-Id": util.uuid(false),
          "X-Request-Id": util.uuid(false),
          ...FAKE_HEADERS,
        },
        timeout: 15000,
        validateStatus: () => true,
      }
    );
    const { result: _result } = checkResult(result, refreshToken);
    const { accessToken } = _result;
    const tokenData = {
      accessToken,
      refreshToken,
      refreshTime: util.unixTimestamp() + ACCESS_TOKEN_EXPIRES,
    };

    accessTokenRequestQueueMap[refreshToken].forEach((resolve) => resolve(tokenData));
    delete accessTokenRequestQueueMap[refreshToken];
    logger.success(`Refresh successful`);
    return tokenData;
  } catch (err) {
    accessTokenRequestQueueMap[refreshToken].forEach((resolve) => resolve(err));
    delete accessTokenRequestQueueMap[refreshToken];
    throw err;
  }
}

/**
 * 获取缓存中的access_token
 * @param {string} refreshToken - 用于刷新access_token的refresh_token
 */
async function acquireToken(refreshToken) {
  let result = accessTokenMap.get(refreshToken);
  if (!result || util.unixTimestamp() > result.refreshTime) {
    result = await requestToken(refreshToken);
    accessTokenMap.set(refreshToken, result);
  }
  return result.accessToken;
}

/**
 * 移除会话
 * @param {string} convId - 会话ID
 * @param {string} refreshToken - 用于刷新access_token的refresh_token
 * @param {string} assistantId - 智能体ID
 */
async function removeConversation(convId, refreshToken, assistantId = DEFAULT_ASSISTANT_ID) {
  const token = await acquireToken(refreshToken);
  const result = await axios.post(
    "https://chatglm.cn/chatglm/backend-api/assistant/conversation/delete",
    { assistant_id: assistantId, conversation_id: convId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Referer: "https://chatglm.cn/main/alltoolsdetail",
        "X-Device-Id": util.uuid(false),
        "X-Request-Id": util.uuid(false),
        ...FAKE_HEADERS,
      },
      timeout: 15000,
      validateStatus: () => true,
    }
  );
  checkResult(result, refreshToken);
}

/**
 * 同步对话补全
 * @param {Array} messages - 消息列表
 * @param {string} refreshToken - 用于刷新access_token的refresh_token
 * @param {string} model - 模型ID
 * @param {string} refConvId - 引用会话ID
 * @param {number} retryCount - 重试次数
 */
async function createCompletion(messages, refreshToken, model = MODEL_NAME, refConvId = "", retryCount = 0) {
  try {
    logger.info(messages);
    const refFileUrls = extractRefFileUrls(messages);
    const refs = refFileUrls.length ? await Promise.all(refFileUrls.map((url) => uploadFile(url, refreshToken))) : [];
    const assistantId = /^[a-z0-9]{24,}$/.test(model) ? model : (model.includes("think") || model.includes("zero") ? ZERO_ASSISTANT_ID : DEFAULT_ASSISTANT_ID);
    if (!/[0-9a-zA-Z]{24}/.test(refConvId)) refConvId = "";

    const token = await acquireToken(refreshToken);
    const result = await axios.post(
      "https://chatglm.cn/chatglm/backend-api/assistant/stream",
      {
        assistant_id: assistantId,
        conversation_id: refConvId,
        messages: messagesPrepare(messages, refs, !!refConvId),
        meta_data: { channel: "", draft_id: "", if_plus_model: true, input_question_type: "xxxx", is_test: false, platform: "pc", quote_log_id: "" },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Referer: assistantId === DEFAULT_ASSISTANT_ID ? "https://chatglm.cn/main/alltoolsdetail" : `https://chatglm.cn/main/gdetail/${assistantId}`,
          "X-Device-Id": util.uuid(false),
          "X-Request-Id": util.uuid(false),
          ...FAKE_HEADERS,
        },
        timeout: 120000,
        validateStatus: () => true,
        responseType: "stream",
      }
    );

    if (!result.headers["content-type"].includes("text/event-stream")) {
      throw new APIException(EX.API_REQUEST_FAILED, `Stream response Content-Type invalid: ${result.headers["content-type"]}`);
    }

    const streamStartTime = util.timestamp();
    const answer = await receiveStream(model, result.data);
    logger.success(`Stream completed in ${util.timestamp() - streamStartTime}ms`);

    removeConversation(answer.id, refreshToken, assistantId).catch((err) => !refConvId && logger.error(err));
    return answer;
  } catch (err) {
    if (retryCount < MAX_RETRY_COUNT) {
      logger.error(`Stream error: ${err.stack}`);
      logger.warn(`Retrying in ${RETRY_DELAY / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return createCompletion(messages, refreshToken, model, refConvId, retryCount + 1);
    }
    throw err;
  }
}

/**
 * 流式对话补全
 * @param {Array} messages - 消息列表
 * @param {string} refreshToken - 用于刷新access_token的refresh_token
 * @param {string} model - 模型ID
 * @param {string} refConvId - 引用会话ID
 * @param {number} retryCount - 重试次数
 */
async function createCompletionStream(messages, refreshToken, model = MODEL_NAME, refConvId = "", retryCount = 0) {
  try {
    logger.info(messages);
    const refFileUrls = extractRefFileUrls(messages);
    const refs = refFileUrls.length ? await Promise.all(refFileUrls.map((url) => uploadFile(url, refreshToken))) : [];
    const assistantId = /^[a-z0-9]{24,}$/.test(model) ? model : (model.includes("think") || model.includes("zero") ? ZERO_ASSISTANT_ID : DEFAULT_ASSISTANT_ID);
    if (!/[0-9a-zA-Z]{24}/.test(refConvId)) refConvId = "";

    const token = await acquireToken(refreshToken);
    const result = await axios.post(
      "https://chatglm.cn/chatglm/backend-api/assistant/stream",
      {
        assistant_id: assistantId,
        conversation_id: refConvId,
        messages: messagesPrepare(messages, refs, !!refConvId),
        meta_data: { channel: "", draft_id: "", if_plus_model: true, input_question_type: "xxxx", is_test: false, platform: "pc", quote_log_id: "" },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Referer: assistantId === DEFAULT_ASSISTANT_ID ? "https://chatglm.cn/main/alltoolsdetail" : `https://chatglm.cn/main/gdetail/${assistantId}`,
          "X-Device-Id": util.uuid(false),
          "X-Request-Id": util.uuid(false),
          ...FAKE_HEADERS,
        },
        timeout: 120000,
        validateStatus: () => true,
        responseType: "stream",
      }
    );

    if (!result.headers["content-type"].includes("text/event-stream")) {
      const transStream = new PassThrough();
      transStream.end(
        `data: ${JSON.stringify({
          id: "",
          model: MODEL_NAME,
          object: "chat.completion.chunk",
          choices: [{ index: 0, delta: { role: "assistant", content: "服务暂时不可用，第三方响应错误" }, finish_reason: "stop" }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
          created: util.unixTimestamp(),
        })}\n\n`
      );
      return transStream;
    }

    const streamStartTime = util.timestamp();
    return createTransStream(model, result.data, (convId) => {
      logger.success(`Stream completed in ${util.timestamp() - streamStartTime}ms`);
      removeConversation(convId, refreshToken, assistantId).catch((err) => !refConvId && logger.error(err));
    });
  } catch (err) {
    if (retryCount < MAX_RETRY_COUNT) {
      logger.error(`Stream error: ${err.stack}`);
      logger.warn(`Retrying in ${RETRY_DELAY / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return createCompletionStream(messages, refreshToken, model, refConvId, retryCount + 1);
    }
    throw err;
  }
}

/**
 * 从流接收完整消息内容
 * @param {string} model - 模型名称
 * @param {Stream} stream - 输入流
 */
async function receiveStream(model, stream) {
  return new Promise((resolve, reject) => {
    const data = {
      id: "",
      model,
      object: "chat.completion",
      choices: [{ index: 0, message: { role: "assistant", content: "" }, finish_reason: "stop" }],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
      created: util.unixTimestamp(),
    };

    const isSilentModel = model.includes("silent");
    // 按 type 存储每种类型最新的有效数据
    const typeMap = new Map();
    let buffer = "";

    stream.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const result = JSON.parse(line.slice(6));
          if (!data.id && result.conversation_id) data.id = result.conversation_id;

          if (result.status !== "finish" && result.parts?.length) {
            result.parts.forEach((part) => {
              const { content } = part;
              if (!Array.isArray(content) || !content.length) return;

              content.forEach((item) => {
                const { type } = item;
                // 只存储每个 type 的最新数据
                typeMap.set(type, item);
              });
            });
          } else if (result.status === "finish") {
            // 处理所有类型的最终内容
            let finalContent = "";
            let images = [];
            let files = [];
            let refContent = "";

            for (const [type, item] of typeMap.entries()) {
              const { text, image, meta_data } = item;

              if (type === "text" && text) {
                finalContent += text;
              } else if (type === "text_thinking" && !isSilentModel && text) {
                finalContent = `[思考开始]\n${text}[思考结束]\n\n${finalContent}`;
              } else if (type === "quote_result" && !isSilentModel && meta_data?.metadata_list) {
                refContent = meta_data.metadata_list.reduce(
                  (meta, v) => meta + `${v.title} - ${v.url}\n`,
                  ""
                );
              } else if (type === "image" && image?.length) {
                images.push(...image.filter(img => img.image_url).map(img => img.image_url));
              } else if (type === "tool_calls" && meta_data?.python_assets) {
                const assets = meta_data.python_assets;
                for (const [filename, url] of Object.entries(assets)) {
                  files.push({ filename, url });
                }
              }
            }

            // 合并内容
            if (finalContent) {
              data.choices[0].message.content = finalContent;
            }
            if (images.length) {
              const imageMarkdown = images.map(url => `![Image](${url})`).join("\n");
              data.choices[0].message.content += `\n\n${imageMarkdown}`;
            }
            if (files.length) {
              const fileMarkdown = files.map(file => `[${file.filename}](${file.url})`).join("\n");
              data.choices[0].message.content += `\n\n生成的文件：\n${fileMarkdown}`;
            }
            if (refContent) {
              data.choices[0].message.content += `\n\n搜索结果来自：\n${refContent.trim()}`;
            }

            // 清理引用标记
            data.choices[0].message.content = data.choices[0].message.content
              .replace(/【\d+†(来源|源|source)】/g, "")
              .trim();

            resolve(data);
          }
        } catch (err) {
          logger.error(err);
          reject(err);
        }
      }
    });

    stream.on("error", reject);
    stream.on("close", () => resolve(data));
  });
}



/**
 * 创建转换流
 * @param {string} model - 模型名称
 * @param {Stream} stream - 输入流
 * @param {Function} endCallback - 结束回调
 */
function createTransStream(model, stream, endCallback) {
  const created = util.unixTimestamp();
  const transStream = new PassThrough();
  const isSilentModel = model.includes("silent");
  let content = "";
  let buffer = "";

  transStream.write(
    `data: ${JSON.stringify({
      id: "",
      model,
      object: "chat.completion.chunk",
      choices: [{ index: 0, delta: { role: "assistant", content: "" }, finish_reason: null }],
      created,
    })}\n\n`
  );

  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const result = JSON.parse(line.slice(6));
        if (result.status !== "finish" && result.status !== "intervene") {
          const text = result.parts.reduce((str, part) => {
            const { content } = part;
            if (!Array.isArray(content)) return str;
            return str + content.reduce((innerStr, value) => {
              const { type, text } = value;
              if (type === "text") return innerStr + text;
              return innerStr;
            }, "");
          }, "");
          if (text) {
            content += text;
            transStream.write(
              `data: ${JSON.stringify({
                id: result.conversation_id || "",
                model,
                object: "chat.completion.chunk",
                choices: [{ index: 0, delta: { content: text }, finish_reason: null }],
                created,
              })}\n\n`
            );
          }
        } else {
          transStream.write(
            `data: ${JSON.stringify({
              id: result.conversation_id || "",
              model,
              object: "chat.completion.chunk",
              choices: [
                {
                  index: 0,
                  delta: result.status === "intervene" && result.last_error?.intervene_text ? { content: `\n\n${result.last_error.intervene_text}` } : {},
                  finish_reason: "stop",
                },
              ],
              usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
              created,
            })}\n\n`
          );
          transStream.end("data: [DONE]\n\n");
          endCallback?.(result.conversation_id);
        }
      } catch (err) {
        logger.error(err);
        transStream.end("\n\n");
      }
    }
  });

  stream.on("error", () => transStream.end("data: [DONE]\n\n"));
  stream.on("close", () => transStream.end("data: [DONE]\n\n"));
  return transStream;
}

/**
 * 提取消息中引用的文件URL
 * @param {Array} messages - 消息列表
 */
function extractRefFileUrls(messages) {
  const urls = [];
  if (!messages.length) return urls;
  const lastMessage = messages[messages.length - 1];
  if (Array.isArray(lastMessage.content)) {
    lastMessage.content.forEach((v) => {
      if (!_.isObject(v) || !["file", "image_url"].includes(v.type)) return;
      if (v.type === "file" && _.isObject(v.file_url) && _.isString(v.file_url.url)) urls.push(v.file_url.url);
      else if (v.type === "image_url" && _.isObject(v.image_url) && _.isString(v.image_url.url)) urls.push(v.image_url.url);
    });
  }
  logger.info(`本次请求上传：${urls.length}个文件`);
  return urls;
}

/**
 * 消息预处理
 * @param {Array} messages - 消息列表
 * @param {Array} refs - 引用文件列表
 * @param {boolean} isRefConv - 是否为引用会话
 */
function messagesPrepare(messages, refs, isRefConv = false) {
  let content = isRefConv || messages.length < 2
    ? messages.reduce((content, message) => {
      if (Array.isArray(message.content)) {
        return message.content.reduce((_content, v) => (!_.isObject(v) || v.type !== "text" ? _content : _content + `${v.text || ""}\n`), content);
      }
      return content + `${message.content}\n`;
    }, "")
    : messages.reduce((content, message) => {
      const role = message.role.replace("system", "<|system|>").replace("assistant", "<|assistant|>").replace("user", "<|user|>");
      if (Array.isArray(message.content)) {
        return message.content.reduce((_content, v) => (!_.isObject(v) || v.type !== "text" ? _content : _content + `${role}\n${v.text || ""}\n`), content);
      }
      return content + `${role}\n${message.content}\n`;
    }, "") + "<|assistant|>\n";

  content = content.replace(/\!\[.+\]\(.+\)/g, "").replace(/\/mnt\/data\/.+/g, "");
  logger.info(`\n${isRefConv || messages.length < 2 ? "透传内容" : "对话合并"}：\n${content}`);

  const fileRefs = refs.filter((ref) => !ref.width && !ref.height);
  const imageRefs = refs.filter((ref) => ref.width || ref.height).map((ref) => ({ ...ref, image_url: ref.file_url }));
  return [
    {
      role: "user",
      content: [
        { type: "text", text: content },
        ...(fileRefs.length ? [{ type: "file", file: fileRefs }] : []),
        ...(imageRefs.length ? [{ type: "image", image: imageRefs }] : []),
      ],
    },
  ];
}

/**
 * 检查文件URL有效性
 * @param {string} fileUrl - 文件URL
 */
async function checkFileUrl(fileUrl) {
  if (util.isBASE64Data(fileUrl)) return;
  const result = await axios.head(fileUrl, { timeout: 15000, validateStatus: () => true });
  if (result.status >= 400) throw new APIException(EX.API_FILE_URL_INVALID, `File ${fileUrl} invalid: [${result.status}] ${result.statusText}`);
  if (result.headers["content-length"] && parseInt(result.headers["content-length"], 10) > FILE_MAX_SIZE) {
    throw new APIException(EX.API_FILE_EXECEEDS_SIZE, `File ${fileUrl} exceeds size limit`);
  }
}

/**
 * 上传文件
 * @param {string} fileUrl - 文件URL
 * @param {string} refreshToken - 用于刷新access_token的refresh_token
 */
async function uploadFile(fileUrl, refreshToken) {
  await checkFileUrl(fileUrl);
  let filename, fileData, mimeType;

  if (util.isBASE64Data(fileUrl)) {
    mimeType = util.extractBASE64DataFormat(fileUrl);
    const ext = mimeTypes.extension(mimeType) || "bin";
    filename = `${util.uuid()}.${ext}`;
    fileData = Buffer.from(util.removeBASE64DataHeader(fileUrl), "base64");
  } else {
    filename = path.basename(fileUrl);
    const response = await axios.get(fileUrl, { responseType: "arraybuffer", maxContentLength: FILE_MAX_SIZE, timeout: 60000 });
    fileData = response.data;
  }

  mimeType = mimeType || mimeTypes.lookup(filename) || "application/octet-stream";
  const formData = new FormData();
  formData.append("file", fileData, { filename, contentType: mimeType });

  const token = await acquireToken(refreshToken);
  const result = await axios.post(
    "https://chatglm.cn/chatglm/backend-api/assistant/file_upload",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Referer: "https://chatglm.cn/",
        ...FAKE_HEADERS,
        ...formData.getHeaders(),
      },
      maxBodyLength: FILE_MAX_SIZE,
      timeout: 60000,
      validateStatus: () => true,
    }
  );
  const { result: uploadResult } = checkResult(result, refreshToken);
  return uploadResult;
}

/**
 * 检查请求结果
 * @param {Object} result - 请求结果
 * @param {string} refreshToken - 用于刷新access_token的refresh_token
 */
function checkResult(result, refreshToken) {
  if (!result.data) return null;
  const { code, status, message } = result.data;
  if (!_.isFinite(code) && !_.isFinite(status)) return result.data;
  if (code === 0 || status === 0) return result.data;
  if (code === 401) accessTokenMap.delete(refreshToken);
  throw new APIException(EX.API_REQUEST_FAILED, `[请求glm失败]: ${message}`);
}

export default {
  createCompletion,
  createCompletionStream,
  getTokenLiveStatus: async (refreshToken) => {
    const result = await axios.post(
      "https://chatglm.cn/chatglm/backend-api/v1/user/refresh",
      {},
      {
        headers: { Authorization: `Bearer ${refreshToken}`, Referer: "https://chatglm.cn/main/alltoolsdetail", "X-Device-Id": util.uuid(false), "X-Request-Id": util.uuid(false), ...FAKE_HEADERS },
        timeout: 15000,
        validateStatus: () => true,
      }
    );
    try {
      const { result: _result } = checkResult(result, refreshToken);
      return !!_result.accessToken;
    } catch {
      return false;
    }
  },
  tokenSplit: (authorization) => authorization.replace("Bearer ", "").split(","),
};