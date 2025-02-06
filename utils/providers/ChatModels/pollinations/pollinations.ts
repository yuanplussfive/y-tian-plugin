import fetch, { HeadersInit } from 'node-fetch';

interface PollinationsAIOptions {
   headers?: HeadersInit;
   apiEndpoint?: string;
   modelAliases?: { [key: string]: string };
}

interface GenerateTextOptions {
   model: string;
   messages: { role: string; content: string }[];
   temperature?: number;
   presence_penalty?: number;
   top_p?: number;
   frequency_penalty?: number;
   seed?: number | null;
   cache?: boolean;
}

class PollinationsAI {
   private readonly DEFAULT_HEADERS: HeadersInit = {
       'Accept': '*/*',
       'Accept-Language': 'en-US,en;q=0.9',
       'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
   };

   private readonly TEXT_API_ENDPOINT: string = "https://text.pollinations.ai/openai";

   private readonly model_aliases: { [key: string]: string } = {
       "gpt-4o-mini": "openai",
       "gpt-4o": "openai-large",
       "qwen-72b": "qwen",
       "qwen-coder-32b": "qwen-coder",
       "llama-70b": "llama",
       "mistral-nemo": "mistral",
       "unity-mistral": "unity",
       "midijourney-music": "midijourney",
       "rtist-image": "rtist",
       "searchgpt-web": "searchgpt",
       "evil-mode": "evil",
       "deepseek-v3": "deepseek",
       "claude-hybrid": "claude-hybridspace",
       "deepseek-r1": "deepseek-r1",
       "llama-8b": "llamalight",
       "llamaguard-7b": "llamaguard",
       "gemini-2-flash": "gemini",
       "gemini-2-flash-thinking": "gemini-thinking",
       "hormoz-8b": "hormoz"
   };

   private readonly headers: HeadersInit;
   private readonly apiEndpoint: string;
   private readonly modelAliases: { [key: string]: string };
   private readonly availableModels: string[];

   /**
    * 构造函数
    *
    * @param {object} [options={}] - 全局配置选项
    * @param {object} [options.headers=DEFAULT_HEADERS] - 默认请求头
    * @param {string} [options.apiEndpoint=TEXT_API_ENDPOINT] - API 端点
    * @param {object} [options.modelAliases=model_aliases] - 模型别名映射
    */
   constructor(options: PollinationsAIOptions = {}) {
       this.headers = options.headers || this.DEFAULT_HEADERS;
       this.apiEndpoint = options.apiEndpoint || this.TEXT_API_ENDPOINT;
       this.modelAliases = options.modelAliases || this.model_aliases;
       this.availableModels = Object.keys(this.modelAliases);
   }

   /**
    * 获取可用的文本模型列表
    *
    * @returns {string[]} - 可用模型别名的数组
    */
   getAvailableModels(): string[] {
       return this.availableModels;
   }

   /**
    * 异步生成文本
    *
    * @param {object} options - 配置选项
    * @param {string} options.model - 使用的模型别名
    * @param {array} options.messages - 消息数组
    * @param {number} [options.temperature=0.7] - 温度参数，控制生成文本的随机性
    * @param {number} [options.presence_penalty=0] - 存在惩罚参数
    * @param {number} [options.top_p=1] - Top P 采样参数
    * @param {number} [options.frequency_penalty=0] - 频率惩罚参数
    * @param {number} [options.seed=null] - 随机种子
    * @param {boolean} [options.cache=false] - 是否使用缓存
    * @returns {Promise<string>} - 生成的文本内容的 Promise
    * @throws {Error} - 如果请求失败或 API 返回错误
    */
   async generateText(options: GenerateTextOptions): Promise<string | null> {
       const {
           model: modelAlias,
           messages,
           temperature = 0.7,
           presence_penalty = 0,
           top_p = 1,
           frequency_penalty = 0,
           seed = null,
           cache = false,
       } = options;

       if (!this.availableModels.includes(modelAlias)) {
           throw new Error(`模型 "${modelAlias}" 不可用. 可用的模型有: ${this.availableModels.join(', ')}`);
       }

       const model = this.modelAliases[modelAlias];

       const requestBody = {
           messages,
           model,
           temperature,
           presence_penalty,
           top_p,
           frequency_penalty,
           stream: false,
           seed,
           cache,
       };

       try {
           const response = await fetch(this.apiEndpoint, {
               method: 'POST',
               headers: {
                   ...this.headers,
                   'Content-Type': 'application/json',
               },
               body: JSON.stringify(requestBody),
           });

           if (!response.ok) {
               throw new Error(`HTTP 错误! 状态码: ${response.status}`);
           }

           const data: any = await response.json();

           const content: string | undefined = data.choices?.[0]?.message?.content;
           if (!content) {
                console.error('API 没有返回内容');
               return null;
           }
           return content;
       } catch (error: any) {
           console.error('文本生成过程中发生错误:', error);
           return null;
       }
   }
}

export async function pollinations(messages: { role: string; content: string }[], model: string): Promise<string | null> {
   try {
       const client = new PollinationsAI();
       const generatedText = await client.generateText({
           model,
           messages,
       });

       return generatedText;
   } catch (error: any) {
       console.error('生成文本失败:', error);
       return null;
   }
}