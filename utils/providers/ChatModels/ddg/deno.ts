import { serve } from "https://deno.land/std@0.216.0/http/server.ts";
import { Hono } from "https://deno.land/x/hono@v4.0.7/mod.ts";
import { cors } from "https://deno.land/x/hono@v4.0.7/middleware.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const STATUS_URL = "https://duckduckgo.com/duckchat/v1/status";
const CHAT_URL = "https://duckduckgo.com/duckchat/v1/chat";
const REFERER = "https://duckduckgo.com/";
const ORIGIN = "https://duckduckgo.com";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36";
const DEFAULT_HEADERS = {
  "User-Agent": USER_AGENT,
  Accept: "text/event-stream",
  "Accept-Language": "en-US,en;q=0.5",
  "Accept-Encoding": "gzip, deflate, br",
  Referer: REFERER,
  "Content-Type": "application/json",
  Origin: ORIGIN,
  Connection: "keep-alive",
  Cookie: "dcm=3; s=l; bf=1",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  Pragma: "no-cache",
  TE: "trailers",
};

/**
 * 获取 DuckDuckGo Chat 的 VQD 值。
 * @returns {Promise<string>} VQD 值。
 * @throws {Error} 如果 HTTP 请求失败或 VQD header 不存在。
 */
const getVqd = async (): Promise<string> => {
  const headers = { ...DEFAULT_HEADERS, "x-vqd-accept": "1" };
  const response = await fetch(STATUS_URL, { headers });

  if (!response.ok) {
    throw new Error(`HTTP 错误! getVqd 状态: ${response.status}`);
  }

  const vqd = response.headers.get("x-vqd-4");
  if (!vqd) {
    throw new Error("x-vqd-4 header 在响应中未找到。");
  }
  return vqd;
};

/**
 * 与 DuckDuckGo Chat 进行交互。
 * @param {string} model 模型名称。
 * @param {array} messages 消息数组。
 * @returns {Promise<string>} 聊天机器人的回复。
 * @throws {Error} 如果 HTTP 请求失败。
 */
const duckduckgoChat = async (model: string, messages: any[]): Promise<string> => {
  try {
    const xVqd4 = await getVqd();

    const chatHeaders = {
      ...DEFAULT_HEADERS,
      "x-vqd-4": xVqd4,
    };

    const body = JSON.stringify({
      model,
      messages,
    });

    const response = await fetch(CHAT_URL, {
      method: "POST",
      headers: chatHeaders,
      body,
    });

    if (!response.ok) {
      throw new Error(`HTTP 错误! chat 状态: ${response.status}`);
    }

    const responseText = await response.text();
    const fullMessage = responseText.split("\n")
      .filter((line) => line.startsWith("data: "))
      .map((line) => {
        try {
          const jsonData = JSON.parse(line.substring(5));
          return jsonData.message || "";
        } catch (error) {
          //console.error("JSON 解析错误:", error, "行:", line);
          return ""; // 忽略解析错误
        }
      })
      .join("");

    return fullMessage;
  } catch (error) {
    console.error("错误:", error);
    throw error;
  }
};

// 支持的模型列表
const SUPPORTED_MODELS = ["o3-mini", "gpt-4o-mini", "claude-3-haiku-20240307", "meta-llama/Llama-3.3-70B-Instruct-Turbo"];

const CompletionSchema = z.object({
  model: z.string().optional(), // 模型名称，可选
  messages: z.array(
    z.object({
      role: z.enum(["user", "system", "assistant"]),
      content: z.string(),
    }),
  ),
  stream: z.boolean().optional().default(false), // 是否流式传输，可选，默认为 false
});

const app = new Hono();

// 启用 CORS 中间件
app.use(cors());

// 自定义 Zod 验证中间件
const validateBody = (schema: z.ZodSchema) => {
  return async (c: any, next: any) => {
    try {
      const body = await c.req.json();
      const parsedBody = schema.parse(body);
      c.req.parsedBody = parsedBody; // 将解析后的 body 存储到 c.req 中
      await next();
    } catch (error: any) {
      console.error("验证错误:", error);
      if (error instanceof z.ZodError) {
        return c.json({ errors: error.errors }, 400); // 返回详细的 Zod 错误信息
      }
      return c.json({ error: "无效的请求体" }, 400);
    }
  };
};

// 定义 POST 路由 /v1/chat/completions
app.post(
  "/v1/chat/completions",
  validateBody(CompletionSchema), // 使用自定义验证中间件
  async (c) => {
    const body = c.req.parsedBody; // 从 c.req 中获取解析后的 body
    const model = body.model || "o3-mini"; // 获取模型名称，如果未指定则使用默认模型

    // 检查模型是否受支持
    if (!SUPPORTED_MODELS.includes(model)) {
      return c.json({ error: `模型 "${model}" 不支持。支持的模型有: ${SUPPORTED_MODELS.join(", ")}` }, 400);
    }

    const messages = body.messages;

    if (!messages) {
      return c.json({ error: "未提供任何消息内容" }, 400);
    }

    try {
      // 1. 处理 system 消息（如果存在）
      const systemMessage = messages.find((message) => message.role === "system");
      const systemPrompt = systemMessage ? `你将扮演一个${systemMessage.content}.\n` : "";

      // 2. 提取历史消息并格式化
      const historyMessages = messages
        .filter((message) => message.role !== "system") // 排除 system 消息
        .slice(0, -1) // 排除最后一条用户消息
        .map((message) => `${message.role}: ${message.content}`)
        .join("\n");

      // 3. 提取最后一条用户消息（当前提问）
      const lastUserMessage = messages[messages.length - 1];
      const currentQuestion = lastUserMessage.role === "user" ? lastUserMessage.content : "";

      // 4. 构建合并后的消息
      const combinedMessageContent = `${systemPrompt}以下是历史对话记录：\n${historyMessages}\n用户当前提问：${currentQuestion}`;

      // 5. 创建新的消息对象
      const combinedMessage = {
        role: "user",
        content: combinedMessageContent,
      };

      // 6. 发送单条消息
      const responseText = await duckduckgoChat(model, [combinedMessage]);

      // 构建 OpenAI 风格的响应
      const openaiResponse = {
        id: `chatcmpl-${Date.now()}`, // 生成唯一 ID
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model, // 使用请求的模型名称
        choices: [
          {
            message: {
              role: "assistant",
              content: responseText,
            },
            finish_reason: "stop",
            index: 0,
          },
        ],
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        },
      };

      return c.json(openaiResponse);
    } catch (error) {
      console.error("API 错误:", error);
      return c.json({ error: error.message }, 500);
    }
  },
);

// 定义 404 路由
app.notFound((c) => {
  return c.json({ message: "未找到" }, 404);
});

// 定义全局错误处理
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ error: "服务器内部错误" }, 500);
});

// 启动服务器
serve(app.fetch, { port: 3000 });

console.log("服务器运行在端口 3000");