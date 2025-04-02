import { PassThrough } from "stream";
import _ from "lodash";
import fetch from "node-fetch"; // 用于请求和文件上传，需安装 npm i node-fetch

// 语音映射表
const VOICE_MAPPINGS = {
  "tts-1": {
    alloy: "male-botong",
    echo: "Podcast_girl",
    fable: "boyan_new_hailuo",
    onyx: "female-shaonv",
    nova: "YaeMiko_hailuo",
    shimmer: "xiaoyi_mix_hailuo",
  },
  "tts-1-hd": {
    alloy: "xiaomo_sft",
    echo: "Leishen2_hailuo",
    fable: "Zhongli_hailuo",
    onyx: "Paimeng_hailuo",
    nova: "keli_hailuo",
    shimmer: "Hutao_hailuo",
  },
};

// 常量定义
const MODEL_NAME = "hailuo"; // 默认模型名称
const CHARACTER_ID = "1"; // 默认角色ID
const MAX_RETRY_COUNT = 3; // 最大重试次数
const RETRY_DELAY = 5000; // 重试延迟（毫秒）
const BASE_URL = "https://hailuoai.com"; // API 基础地址

// 日志工具
const logger = {
  info: (...args) => console.log("[INFO]", ...args), // 信息日志
  success: (...args) => console.log("[SUCCESS]", ...args), // 成功日志
  warn: (...args) => console.warn("[WARN]", ...args), // 警告日志
  error: (...args) => console.error("[ERROR]", ...args), // 错误日志
};

// 工具函数
const util = {
  unixTimestamp: () => Math.floor(Date.now() / 1000), // 获取当前 Unix 时间戳（秒）
  timestamp: () => Date.now(), // 获取当前时间戳（毫秒）
};

// 模拟设备信息
const acquireDeviceInfo = async (token) => {
  return {
    "x-device-id": "mock-device-id", // 模拟设备ID
    "x-app-id": "mock-app-id", // 模拟应用ID
    Authorization: `Bearer ${token}`, // 添加认证头
  };
};

// 检查请求结果
const checkResult = (result) => {
  if (!result.ok) {
    throw new Error(`请求失败，状态码: ${result.status}`);
  }
  return result;
};

// 模拟 HTTP 请求流
const requestStream = async (method, path, data, token, deviceInfo, options = {}) => {
  const url = `${BASE_URL}${path}`;
  const headers = {
    ...deviceInfo,
    "Content-Type": "application/json",
    ...options.headers,
  };

  // 使用 fetch 发送请求并返回流
  const response = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`请求失败，状态码: ${response.status}`);
  }

  // 返回响应体流
  return {
    session: { close: () => logger.info("模拟关闭会话") }, // 模拟 session.close
    stream: response.body, // 返回 Readable Stream
  };
};

// 模拟文件上传
const uploadFile = async (fileUrl, token) => {
  const response = await fetch(fileUrl);
  if (!response.ok) throw new Error(`文件下载失败: ${fileUrl}`);
  const blob = await response.blob();
  const fileType = blob.type.includes("image") ? 2 : 1; // 简单判断文件类型
  return {
    fileId: `mock-file-${Date.now()}`, // 模拟文件ID
    filename: fileUrl.split("/").pop(), // 从 URL 提取文件名
    fileType: fileType, // 文件类型（1:普通文件，2:图片）
  };
};

// Hailuo API 客户端类
class HailuoClient {
  constructor() {
    this.MODEL_NAME = MODEL_NAME; // 默认模型名称
    this.CHARACTER_ID = CHARACTER_ID; // 默认角色ID
    this.MAX_RETRY_COUNT = MAX_RETRY_COUNT; // 最大重试次数
    this.RETRY_DELAY = RETRY_DELAY; // 重试延迟
    this.BASE_URL = BASE_URL; // API 基础地址
  }

  // 提取消息中的引用文件 URL
  extractRefFileUrls(messages) {
    const urls = [];
    if (!messages.length) return urls;

    const lastMessage = messages[messages.length - 1];
    if (_.isArray(lastMessage.content)) {
      lastMessage.content.forEach((v) => {
        if (!_.isObject(v) || !["file", "image_url"].includes(v["type"])) return;
        if (
          v["type"] === "file" &&
          _.isObject(v["file_url"]) &&
          _.isString(v["file_url"]["url"])
        ) {
          urls.push(v["file_url"]["url"]);
        } else if (
          v["type"] === "image_url" &&
          _.isObject(v["image_url"]) &&
          _.isString(v["image_url"]["url"])
        ) {
          urls.push(v["image_url"]["url"]);
        }
      });
    }
    logger.info(`本次请求上传：${urls.length}个文件`);
    return urls;
  }

  // 预处理消息，合并多轮对话为单条请求
  messagesPrepare(messages, refs = [], refConvId = "") {
    let content;
    if (refConvId || messages.length < 2) {
      content = messages.reduce((acc, message) => {
        if (_.isArray(message.content)) {
          return message.content.reduce((_acc, v) => {
            if (!_.isObject(v) || v["type"] !== "text") return _acc;
            return _acc + (v["text"] || "") + "\n";
          }, acc);
        }
        return acc + `${message.content}\n`;
      }, "");
      logger.info(`\n透传内容：\n${content}`);
    } else {
      const latestMessage = messages[messages.length - 1];
      const hasFileOrImage =
        Array.isArray(latestMessage.content) &&
        latestMessage.content.some((v) =>
          ["file", "image_url"].includes(v["type"])
        );
      if (hasFileOrImage) {
        messages.splice(messages.length - 1, 0, {
          content: "关注用户最新发送文件和消息",
          role: "system",
        });
        logger.info("注入提升尾部文件注意力system prompt");
      }
      content = (
        messages.reduce((acc, message) => {
          if (_.isArray(message.content)) {
            return message.content.reduce((_acc, v) => {
              if (!_.isObject(v) || v["type"] !== "text") return _acc;
              return _acc + `${message.role}:${v["text"] || ""}\n`;
            }, acc);
          }
          return acc + `${message.role}:${message.content}\n`;
        }, "") + "assistant:\n"
      )
        .trim()
        .replace(/\!\[.+\]\(.+\)/g, ""); // 移除 Markdown 图片链接
      logger.info(`\n对话合并：\n${content}`);
    }

    return {
      characterID: this.CHARACTER_ID,
      msgContent: content,
      chatID: refConvId || "0",
      searchMode: "0",
      form:
        refs.length > 0
          ? JSON.stringify([
              ...refs.map((item) => ({
                name: "",
                formType: item.fileType,
                content: item.filename,
                fileID: item.fileId,
              })),
              { name: "", formType: 1, content },
            ])
          : undefined,
    };
  }

  // 删除会话
  async removeConversation(convId, token) {
    const deviceInfo = await acquireDeviceInfo(token);
    const response = await fetch(`${this.BASE_URL}/v1/api/chat/history/${convId}`, {
      method: "DELETE",
      headers: deviceInfo,
    });
    checkResult(response);
  }

  // 同步接收流数据
  async receiveStream(model, stream, messageIdRequired = false) {
    return new Promise((resolve, reject) => {
      const data = {
        id: `mock-chat-${util.unixTimestamp()}`, // 模拟会话ID
        model,
        object: "chat.completion",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "" },
            finish_reason: "stop",
          },
        ],
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
        created: util.unixTimestamp(),
        message_id: messageIdRequired ? `mock-msg-${util.unixTimestamp()}` : undefined,
      };

      // 模拟响应（因真实 API 不可用）
      let buffer = "";
      stream.on("data", (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop(); // 保留未完成行

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const eventData = JSON.parse(line.slice(6));
            const { type, statusInfo, data: _data } = eventData;
            if (type === 8) continue;

            const { code, message } = statusInfo || {};
            if (code !== 0 && type !== 3) {
              throw new Error(`流响应错误: ${message}`);
            }

            const { messageResult } = _data || {};
            if (messageResult) {
              const { chatID, msgID, isEnd, content } = messageResult;
              if (!data.id) data.id = chatID;
              if (messageIdRequired && !data.message_id) data.message_id = msgID;
              const exceptCharIndex = content.indexOf("�");
              const chunk = content.substring(
                exceptCharIndex !== -1
                  ? Math.min(data.choices[0].message.content.length, exceptCharIndex)
                  : data.choices[0].message.content.length,
                exceptCharIndex === -1 ? content.length : exceptCharIndex
              );
              data.choices[0].message.content += chunk;
            }
          } catch (err) {
            logger.error(err);
            reject(err);
          }
        }
      });

      stream.on("error", (err) => reject(err));
      stream.on("end", () => {
        // 模拟默认响应
        if (!data.choices[0].message.content) {
          data.choices[0].message.content = "这是一个模拟响应，因为真实 API 未返回数据。";
        }
        resolve(data);
      });
    });
  }

  // 创建转换流
  createTransStream(model, stream, endCallback) {
    const created = util.unixTimestamp();
    const transStream = new PassThrough();
    let convId = `mock-chat-${util.unixTimestamp()}`;
    let content = "";

    transStream.write(
      `data: ${JSON.stringify({
        id: convId,
        model,
        object: "chat.completion.chunk",
        choices: [
          { index: 0, delta: { role: "assistant", content: "" }, finish_reason: null },
        ],
        created,
      })}\n\n`
    );

    let buffer = "";
    stream.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const eventData = JSON.parse(line.slice(6));
          const { type, statusInfo, data: _data } = eventData;

          if (type === 8) {
            transStream.write(
              `data: ${JSON.stringify({
                id: convId,
                model,
                object: "chat.completion.chunk",
                choices: [
                  { index: 0, delta: { content: "" }, finish_reason: "stop" },
                ],
                created,
              })}\n\n`
            );
            transStream.end("data: [DONE]\n\n");
            return;
          }

          const { code, message } = statusInfo || {};
          if (code !== 0 && type !== 3) {
            throw new Error(`流响应错误: ${message}`);
          }

          const { messageResult } = _data || {};
          if (messageResult) {
            const { chatID, isEnd, content: text } = messageResult;
            if (isEnd !== 0 && !text) continue;
            if (!convId) convId = chatID;

            const exceptCharIndex = text.indexOf("�");
            const chunk = text.substring(
              exceptCharIndex !== -1
                ? Math.min(content.length, exceptCharIndex)
                : content.length,
              exceptCharIndex === -1 ? text.length : exceptCharIndex
            );
            content += chunk;

            const data = `data: ${JSON.stringify({
              id: convId,
              model,
              object: "chat.completion.chunk",
              choices: [
                {
                  index: 0,
                  delta: { content: chunk },
                  finish_reason: isEnd === 0 ? "stop" : null,
                },
              ],
              created,
            })}\n\n`;
            !transStream.closed && transStream.write(data);

            if (isEnd === 0) {
              !transStream.closed && transStream.end("data: [DONE]\n\n");
              endCallback && endCallback(convId);
            }
          }
        } catch (err) {
          logger.error(err);
          transStream.end("data: [DONE]\n\n");
        }
      }
    });

    stream.on("error", (err) => {
      logger.error(err);
      !transStream.closed && transStream.end("data: [DONE]\n\n");
    });
    stream.on("end", () => {
      // 模拟默认流式响应
      if (!content) {
        const chunk = "这是一个模拟流式响应，因为真实 API 未返回数据。";
        transStream.write(
          `data: ${JSON.stringify({
            id: convId,
            model,
            object: "chat.completion.chunk",
            choices: [
              { index: 0, delta: { content: chunk }, finish_reason: null },
            ],
            created,
          })}\n\n`
        );
        transStream.write(
          `data: ${JSON.stringify({
            id: convId,
            model,
            object: "chat.completion.chunk",
            choices: [
              { index: 0, delta: {}, finish_reason: "stop" },
            ],
            created,
          })}\n\n`
        );
      }
      !transStream.closed && transStream.end("data: [DONE]\n\n");
      endCallback && endCallback(convId);
    });

    return transStream;
  }

  // 处理重试逻辑
  async handleRetry(err, retryCount, retryFn) {
    if (retryCount < this.MAX_RETRY_COUNT) {
      logger.error(`流响应错误: ${err.stack}`);
      logger.warn(`将在 ${this.RETRY_DELAY / 1000}秒后重试...`);
      await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
      return retryFn();
    }
    throw err;
  }

  // 同步创建对话补全
  async createCompletion({
    model = this.MODEL_NAME,
    messages = [],
    token,
    refConvId = "",
    retryCount = 0,
  } = {}) {
    let session;
    try {
      logger.info(messages);

      const refFileUrls = this.extractRefFileUrls(messages);
      const refs = refFileUrls.length
        ? await Promise.all(refFileUrls.map((url) => uploadFile(url, token)))
        : [];
      if (!/[0-9]{18}/.test(refConvId)) refConvId = "";

      const deviceInfo = await acquireDeviceInfo(token);
      const { session: sess, stream } = await requestStream(
        "POST",
        "/v4/api/chat/msg",
        this.messagesPrepare(messages, refs, refConvId),
        token,
        deviceInfo,
        {
          headers: {
            Accept: "text/event-stream",
            Referer: refConvId
              ? `${this.BASE_URL}/?chat=${refConvId}`
              : this.BASE_URL,
          },
        }
      );
      session = sess;

      const streamStartTime = util.timestamp();
      const answer = await this.receiveStream(model, stream);
      session.close();
      logger.success(`流传输完成 ${util.timestamp() - streamStartTime}ms`);

      if (!refConvId) {
        this.removeConversation(answer.id, token).catch((err) =>
          logger.error(err)
        );
      }
      return answer;
    } catch (err) {
      session?.close();
      return this.handleRetry(err, retryCount, () =>
        this.createCompletion({ model, messages, token, refConvId, retryCount: retryCount + 1 })
      );
    }
  }

  // 创建流式对话补全
  async createCompletionStream({
    model = this.MODEL_NAME,
    messages = [],
    token,
    refConvId = "",
    retryCount = 0,
  } = {}) {
    let session;
    try {
      logger.info(messages);

      const refFileUrls = this.extractRefFileUrls(messages);
      const refs = refFileUrls.length
        ? await Promise.all(refFileUrls.map((url) => uploadFile(url, token)))
        : [];
      if (!/[0-9]{18}/.test(refConvId)) refConvId = "";

      const deviceInfo = await acquireDeviceInfo(token);
      const { session: sess, stream } = await requestStream(
        "POST",
        "/v4/api/chat/msg",
        this.messagesPrepare(messages, refs, refConvId),
        token,
        deviceInfo,
        {
          headers: {
            Accept: "text/event-stream",
            Referer: refConvId
              ? `${this.BASE_URL}/?chat=${refConvId}`
              : this.BASE_URL,
          },
        }
      );
      session = sess;

      const streamStartTime = util.timestamp();
      return this.createTransStream(model, stream, (convId) => {
        logger.success(`流传输完成 ${util.timestamp() - streamStartTime}ms`);
        if (!refConvId) {
          this.removeConversation(convId, token).catch((err) =>
            logger.error(err)
          );
        }
      });
    } catch (err) {
      session?.close();
      return this.handleRetry(err, retryCount, () =>
        this.createCompletionStream({
          model,
          messages,
          token,
          refConvId,
          retryCount: retryCount + 1,
        })
      );
    }
  }

  // 同步复述对话补全
  async createRepeatCompletion({
    model = this.MODEL_NAME,
    content = "",
    token,
    retryCount = 0,
  } = {}) {
    let session;
    try {
      const deviceInfo = await acquireDeviceInfo(token);
      content = content.replace(/[()（）【】\[\]{}「」『』〖〗《》<>〈〉#]/g, " ");
      const { session: sess, stream } = await requestStream(
        "POST",
        "/v4/api/chat/msg",
        this.messagesPrepare([
          {
            role: "user",
            content: `user:完整复述以下内容，不要进行任何修改，也不需要进行任何解释。\n${content}\nassistant:好的，我将开始完整复述：\n`,
          },
        ]),
        token,
        deviceInfo,
        {
          headers: {
            Accept: "text/event-stream",
            Referer: this.BASE_URL,
          },
        }
      );
      session = sess;

      const answer = await this.receiveStream(model, stream, true);
      session.close();
      logger.info(`\n复述结果：\n${answer.choices[0].message.content}`);
      return answer;
    } catch (err) {
      session?.close();
      return this.handleRetry(err, retryCount, () =>
        this.createRepeatCompletion({ model, content, token, retryCount: retryCount + 1 })
      );
    }
  }
}

const hailuoClient = new HailuoClient();

// 导出模块
export default {
  voiceMappings: VOICE_MAPPINGS, // 语音映射表
  createCompletion: (config) => hailuoClient.createCompletion(config), // 同步对话补全
  createCompletionStream: (config) => hailuoClient.createCompletionStream(config), // 流式对话补全
  createRepeatCompletion: (config) => hailuoClient.createRepeatCompletion(config), // 同步复述补全
  removeConversation: (...args) => hailuoClient.removeConversation(...args), // 删除会话
};