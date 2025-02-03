export const other_models = [
  // OpenAI Models
  {
    "id": 1,
    "model": "gpt-3.5-turbo",
    "points": "OpenAI",
    "token": 4096,
    "features": ['conversation'],
    "quota": 0.5
  },
  {
    "id": 2,
    "model": "gpt-3.5-turbo-0613",
    "points": "OpenAI",
    "token": 4096,
    "features": ['conversation'],
    "quota": 0.5
  },
  {
    "id": 3,
    "model": "gpt-3.5-turbo-1106",
    "points": "OpenAI",
    "token": 4096,
    "features": ['conversation'],
    "quota": 0.5
  },
  {
    "id": 4,
    "model": "gpt-3.5-turbo-0125",
    "points": "OpenAI",
    "token": 4096,
    "features": ['conversation'],
    "quota": 0.5
  },
  {
    "id": 5,
    "model": "gpt-3.5-turbo-16k",
    "points": "OpenAI",
    "token": 16384,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 6,
    "model": "gpt-3.5-turbo-16k-0613",
    "points": "OpenAI",
    "token": 16384,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 7,
    "model": "gpt-3.5-turbo-16k-1106",
    "points": "OpenAI",
    "token": 16384,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 8,
    "model": "gpt-3.5-turbo-16k-0125",
    "points": "OpenAI",
    "token": 16384,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 9,
    "model": "gpt-4",
    "points": "OpenAI",
    "token": 8192,
    "features": ['conversation'],
    "quota": 15
  },
  {
    "id": 10,
    "model": "gpt-4-32k",
    "points": "OpenAI",
    "token": 32000,
    "features": ['conversation'],
    "quota": 30
  },
  {
    "id": 11,
    "model": "gpt-4-turbo",
    "points": "OpenAI",
    "token": 128000,
    "features": ['conversation'],
    "quota": 7.5
  },
  {
    "id": 12,
    "model": "gpt-4-1106-preview",
    "points": "OpenAI",
    "token": 131072,
    "features": ['conversation'],
    "quota": 7.5
  },
  {
    "id": 13,
    "model": "gpt-4-0125-preview",
    "points": "OpenAI",
    "token": 131072,
    "features": ['conversation'],
    "quota": 5
  },
  {
    "id": 14,
    "model": "gpt-4o",
    "points": "OpenAI",
    "token": 8000,
    "features": ['conversation', 'internet', 'drawing', 'code', 'image_recognition'],
    "quota": 2.5
  },
  {
    "id": 15,
    "model": "gpt-4-all",
    "points": "OpenAI",
    "token": 128000,
    "features": ['conversation', 'internet', 'drawing', 'code', 'image_recognition'],
    "quota": 30
  },
  {
    "id": 16,
    "model": "gpt-4o-all",
    "points": "OpenAI",
    "token": 128000,
    "features": ['conversation', 'internet', 'drawing', 'code', 'image_recognition'],
    "quota": 15
  },
  {
    "id": 17,
    "model": "gpt-4-omni",
    "points": "OpenAI",
    "token": 32000,
    "features": ['conversation', 'internet', 'drawing'],
    "quota": 60
  },
  {
    "id": 18,
    "model": "dall-e-3",
    "points": "OpenAI",
    "token": 2000,
    "features": ['drawing'],
    "quota": "0.16/次"
  },
  {
    "id": 19,
    "model": "gpt-4o-mini",
    "points": "OpenAI",
    "token": 128000,
    "features": ['conversation'],
    "quota": "0.07"
  },
  {
    "id": 20,
    "model": "chatgpt-4o-latest",
    "points": "OpenAI",
    "token": 128000,
    "features": ['conversation'],
    "quota": 2.5
  },
  {
    "id": 21,
    "model": "gpt-4.5o-ultra",
    "points": "OpenAI",
    "token": 128000,
    "features": ['conversation', 'code'],
    "quota": 30
  },
  {
    "id": 22,
    "model": "o1-preview-20240912",
    "points": "OpenAI-Plus",
    "token": 128000,
    "features": ['conversation', 'code', 'image_recognition'],
    "quota": 30
  },
  {
    "id": 23,
    "model": "o1-preview-all",
    "points": "OpenAI-Plus",
    "token": 128000,
    "features": ['conversation', 'code', 'image_recognition'],
    "quota": 30
  },
  {
    "id": 24,
    "model": "o1-mini-20240912",
    "points": "OpenAI-Plus",
    "token": 128000,
    "features": ['conversation', 'code', 'image_recognition'],
    "quota": 10
  },
  {
    "id": 25,
    "model": "o1-mini-all",
    "points": "OpenAI-Plus",
    "token": 128000,
    "features": ['conversation', 'code', 'image_recognition'],
    "quota": 10
  },

  // Microsoft Models
  {
    "id": 26,
    "model": "Bing-Balanced",
    "points": "Microsoft",
    "token": 32768,
    "features": ['conversation', 'internet', 'image_recognition'],
    "quota": 15
  },
  {
    "id": 27,
    "model": "Bing-Precise",
    "points": "Microsoft",
    "token": 32768,
    "features": ['conversation', 'internet', 'image_recognition'],
    "quota": 15
  },
  {
    "id": 28,
    "model": "Bing-Creative",
    "points": "Microsoft",
    "token": 32768,
    "features": ['conversation', 'internet', 'image_recognition'],
    "quota": 15
  },
  {
    "id": 29,
    "model": "Bing-gpt-4-turbo",
    "points": "Microsoft",
    "token": 128000,
    "features": ['conversation', 'image_recognition'],
    "quota": 15
  },
  {
    "id": 30,
    "model": "phi-3-mini-128k-instruct",
    "points": "Microsoft",
    "token": 128000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 31,
    "model": "phi-3-medium-128k-instruct",
    "points": "Microsoft",
    "token": 128000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 32,
    "model": "Bing-gpt-4o-mini",
    "points": "Microsoft",
    "token": 128000,
    "features": ['conversation', 'internet', 'image_recognition'],
    "quota": "0.07"
  },
  {
    "id": 33,
    "model": "Bing-copilot",
    "points": "Microsoft",
    "token": 131072,
    "features": ['conversation', 'internet', 'image_recognition'],
    "quota": 7.5
  },

  // Claude Models
  {
    "id": 34,
    "model": "claude-1-100k",
    "points": "Claude",
    "token": 100000,
    "features": ['conversation', 'image_recognition'],
    "quota": "0"
  },
  {
    "id": 35,
    "model": "claude-1.3-100k",
    "points": "Claude",
    "token": 100000,
    "features": ['conversation', 'image_recognition'],
    "quota": "0"
  },
  {
    "id": 36,
    "model": "claude-2-200k",
    "points": "Claude",
    "token": 200000,
    "features": ['conversation', 'image_recognition'],
    "quota": "0"
  },
  {
    "id": 37,
    "model": "claude-3-haiku",
    "points": "Claude",
    "token": 200000,
    "features": ['conversation', 'image_recognition'],
    "quota": "0"
  },
  {
    "id": 38,
    "model": "claude-3-sonnet",
    "points": "Claude",
    "token": 200000,
    "features": ['conversation', 'image_recognition'],
    "quota": "0"
  },
  {
    "id": 39,
    "model": "claude-3-opus",
    "points": "Claude",
    "token": 200000,
    "features": ['conversation', 'code', 'image_recognition'],
    "quota": 0
  },
  {
    "id": 40,
    "model": "claude-3.5-sonnet",
    "points": "Claude",
    "token": 200000,
    "features": ['conversation', 'code', 'image_recognition'],
    "quota": 5
  },
  {
    "id": 41,
    "model": "claude-3-5-sonnet-20241022",
    "points": "Claude",
    "token": 200000,
    "features": ['conversation', 'code'],
    "quota": 30
  },
  {
    "id": 42,
    "model": "claude-3-5-sonnet-all",
    "points": "Claude",
    "token": 200000,
    "features": ['conversation', 'code', 'image_recognition'],
    "quota": 60
  },

  // Microsoft & ByteDance Models
  {
    "id": 43,
    "model": "coze-gpt-4-all",
    "points": "Microsoft & 字节跳动",
    "token": 32768,
    "features": ['conversation', 'internet', 'drawing'],
    "quota": 15
  },
  {
    "id": 44,
    "model": "coze-assistent-all",
    "points": "字节跳动",
    "token": 32000,
    "features": ['conversation', 'internet', 'drawing'],
    "quota": 1
  },

  // Google Models
  {
    "id": 45,
    "model": "gemini-pro",
    "points": "Google",
    "token": 32000,
    "features": ['conversation', 'image_recognition'],
    "quota": 1
  },
  {
    "id": 46,
    "model": "gemini-pro-vision",
    "points": "Google",
    "token": 32000,
    "features": ['conversation', 'image_recognition'],
    "quota": 2
  },
  {
    "id": 47,
    "model": "gemini-1.5-flash",
    "points": "Google",
    "token": 32000,
    "features": ['conversation', 'image_recognition'],
    "quota": 0.5
  },
  {
    "id": 48,
    "model": "gemini-1.5-flash-latest",
    "points": "Google",
    "token": 100000,
    "features": ['conversation', 'code'],
    "quota": 0.5
  },
  {
    "id": 49,
    "model": "gemini-1.5-pro",
    "points": "Google",
    "token": 128000,
    "features": ['conversation', 'code'],
    "quota": 5
  },
  {
    "id": 50,
    "model": "gemini-1.5-pro-exp-0801",
    "points": "Google",
    "token": 128000,
    "features": ['conversation', 'code'],
    "quota": 5
  },
  {
    "id": 51,
    "model": "gemini-1.5-pro-exp-0827",
    "points": "Google",
    "token": 200000,
    "features": ['conversation', 'image_recognition'],
    "quota": 3
  },
  {
    "id": 52,
    "model": "gemini-1.5-pro-001",
    "points": "Google",
    "token": 1000000,
    "features": ['conversation', 'code', 'image_recognition'],
    "quota": 5
  },
  {
    "id": 53,
    "model": "gemini-1.5-pro-002",
    "points": "Google",
    "token": 1000000,
    "features": ['conversation', 'code', 'image_recognition'],
    "quota": 5
  },

  // Google Search Models
  {
    "id": 54,
    "model": "command-r",
    "points": "Cohere",
    "token": 32000,
    "features": ['conversation'],
    "quota": 2.5
  },

  // Meta Models
  {
    "id": 55,
    "model": "llama-2-70b-chat",
    "points": "Meta",
    "token": 32000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 56,
    "model": "code-llama-70b",
    "points": "Meta",
    "token": 32000,
    "features": ['conversation', 'code'],
    "quota": 1
  },
  {
    "id": 57,
    "model": "llava-13b",
    "points": "llava",
    "token": 8000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 58,
    "model": "baichuan-53b",
    "points": "百川智能",
    "token": 32000,
    "features": ['conversation'],
    "quota": "0.05/次"
  },
  {
    "id": 59,
    "model": "glm-turbo",
    "points": "清华&智谱",
    "token": 8000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 1
  },
  {
    "id": 60,
    "model": "glm-pro",
    "points": "清华&智谱",
    "token": 8000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 1
  },
  {
    "id": 61,
    "model": "glm-3-turbo",
    "points": "清华&智谱",
    "token": 128000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 1
  },
  {
    "id": 62,
    "model": "glm-4",
    "points": "清华&智谱",
    "token": 128000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 1
  },
  {
    "id": 63,
    "model": "glm-4-flash",
    "points": "清华&智谱",
    "token": 128000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 1
  },
  {
    "id": 64,
    "model": "glm-4-all",
    "points": "智谱清言",
    "token": 128000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 1
  },
  {
    "id": 65,
    "model": "glm-turbo",
    "points": "清华&智谱",
    "token": 8000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 1
  },
  {
    "id": 66,
    "model": "glm-pro",
    "points": "清华&智谱",
    "token": 8000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 1
  },
  {
    "id": 67,
    "model": "glm-3-turbo",
    "points": "清华&智谱",
    "token": 128000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 1
  },
  {
    "id": 68,
    "model": "glm-4",
    "points": "清华&智谱",
    "token": 128000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 1
  },
  {
    "id": 69,
    "model": "glm-4-flash",
    "points": "清华&智谱",
    "token": 128000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 1
  },
  {
    "id": 70,
    "model": "glm-4-all",
    "points": "智谱清言",
    "token": 128000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 1
  },

  // Moonshot Models
  {
    "id": 71,
    "model": "kimi-search",
    "points": "moonshot",
    "token": 8000,
    "features": ['conversation', 'internet'],
    "quota": 10
  },
  {
    "id": 72,
    "model": "kimi-all",
    "points": "moonshot",
    "token": 128000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 10
  },
  {
    "id": 73,
    "model": "moonshot-v1-8k",
    "points": "moonshot",
    "token": 8000,
    "features": ['conversation', 'code'],
    "quota": 5
  },
  {
    "id": 74,
    "model": "moonshot-v1-32k",
    "points": "moonshot",
    "token": 32000,
    "features": ['conversation', 'code'],
    "quota": 10
  },
  {
    "id": 75,
    "model": "moonshot-v1-128k",
    "points": "moonshot",
    "token": 128000,
    "features": ['conversation', 'code'],
    "quota": 15
  },

  // 腾讯混元模型
  {
    "id": 76,
    "model": "hunyuan",
    "points": "腾讯混元",
    "token": 32000,
    "features": ['conversation'],
    "quota": "0.05/次"
  },

  // Meta Models
  {
    "id": 77,
    "model": "meta-llama-3.1-8B",
    "points": "Meta",
    "token": 32000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 78,
    "model": "meta-llama-3.1-70B",
    "points": "Meta",
    "token": 32000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 79,
    "model": "meta-llama-3.1-405B",
    "points": "Meta",
    "token": 32000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 80,
    "model": "llama-3-8b",
    "points": "Meta",
    "token": 32000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 81,
    "model": "llama-3-70b",
    "points": "Meta",
    "token": 32000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 82,
    "model": "llama-3-sonar-small-32k-online",
    "points": "Meta",
    "token": 32000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 83,
    "model": "llama-3-sonar-small-32k-chat",
    "points": "Meta",
    "token": 32000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 84,
    "model": "llama-3-sonar-large-32k-online",
    "points": "Meta",
    "token": 32000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 85,
    "model": "llama-3-sonar-large-32k-chat",
    "points": "Meta",
    "token": 32000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 86,
    "model": "llama-3.2-1B-Instruct",
    "points": "Meta",
    "token": 32000,
    "features": ['conversation', 'code'],
    "quota": 30
  },
  {
    "id": 87,
    "model": "llama-3.2-3B-Instruct",
    "points": "Meta",
    "token": 32000,
    "features": ['conversation', 'code'],
    "quota": 30
  },

  // Other Providers
  {
    "id": 88,
    "model": "ERNIE-Bot-4",
    "points": "百度千帆",
    "token": 8000,
    "features": ['conversation'],
    "quota": "0.05/次"
  },
  {
    "id": 89,
    "model": "yi-34b-chat-200k",
    "points": "零一万物",
    "token": 2000000,
    "features": ['conversation'],
    "quota": "0.05/次"
  },
  {
    "id": 90,
    "model": "reka-core",
    "points": "reka",
    "token": 24000,
    "features": ['conversation', 'image_recognition'],
    "quota": "0.05/次"
  },
  {
    "id": 91,
    "model": "reka-flash",
    "points": "reka",
    "token": 24000,
    "features": ['conversation', 'image_recognition'],
    "quota": "0.05/次"
  },
  {
    "id": 92,
    "model": "reka-edge",
    "points": "reka",
    "token": 24000,
    "features": ['conversation', 'image_recognition'],
    "quota": "0.05/次"
  },
  {
    "id": 93,
    "model": "deepseek-chat",
    "points": "deepseek",
    "token": 32000,
    "features": ['conversation'],
    "quota": 0
  },
  {
    "id": 94,
    "model": "deepseek-code",
    "points": "deepseek",
    "token": 16000,
    "features": ['code'],
    "quota": 0
  },
  {
    "id": 95,
    "model": "deepseek-v2.5",
    "points": "深度求索",
    "token": 100000,
    "features": ['conversation', 'code'],
    "quota": 0
  },
  {
    "id": 96,
    "model": "blackbox-chat",
    "points": "blackbox",
    "token": 9000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 97,
    "model": "blackbox-online",
    "points": "blackbox",
    "token": 9000,
    "features": ['conversation', 'internet'],
    "quota": 1
  },
  {
    "id": 98,
    "model": "blackbox-code",
    "points": "blackbox",
    "token": 9000,
    "features": ['conversation', 'code'],
    "quota": 1
  },
  {
    "id": 99,
    "model": "zephyr-7b-beta",
    "points": "huggingface",
    "token": 8000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 100,
    "model": "openchat-7b",
    "points": "huggingface",
    "token": 8000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 101,
    "model": "suno-v3.5-vip",
    "points": "suno",
    "token": 240,
    "features": ['music'],
    "quota": "0.24/次"
  },
  {
    "id": 102,
    "model": "search-llm",
    "points": "y-tian-plugin",
    "token": 8000,
    "features": ['conversation', 'internet'],
    "quota": 1
  },
  {
    "id": 103,
    "model": "gemma-8b-it",
    "points": "Google",
    "token": 8000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 104,
    "model": "gemma-7b-it",
    "points": "Google",
    "token": 32000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 105,
    "model": "gemma-2b-it",
    "points": "Google",
    "token": 32000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 106,
    "model": "gemma-2-9b-it",
    "points": "Google",
    "token": 32000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 107,
    "model": "gemma-2-27b-it",
    "points": "Google",
    "token": 32000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 108,
    "model": "gemini-1.5-pro-exp-0801",
    "points": "Google",
    "token": 200000,
    "features": ['conversation', 'image_recognition'],
    "quota": 3
  },
  {
    "id": 109,
    "model": "gemini-1.5-pro-001",
    "points": "Google",
    "token": 1000000,
    "features": ['conversation', 'code', 'image_recognition'],
    "quota": 5
  },
  {
    "id": 110,
    "model": "gemini-1.5-pro-002",
    "points": "Google",
    "token": 1000000,
    "features": ['conversation', 'code', 'image_recognition'],
    "quota": 5
  },

  // Fast Technology (快手科技) Models
  {
    "id": 111,
    "model": "kling-v1-5s",
    "points": "快手科技",
    "token": 1200,
    "features": ['video'],
    "quota": "4/次"
  },
  {
    "id": 112,
    "model": "kling-v1-pro-5s",
    "points": "快手科技",
    "token": 1200,
    "features": ['video'],
    "quota": "12/次"
  },
  {
    "id": 113,
    "model": "kling-v1-10s",
    "points": "快手科技",
    "token": 1200,
    "features": ['video'],
    "quota": "6/次"
  },
  {
    "id": 114,
    "model": "kling-v1-pro-10s",
    "points": "快手科技",
    "token": 1200,
    "features": ['video'],
    "quota": "18/次"
  },

  // Other Models
  {
    "id": 115,
    "model": "mistral-7b",
    "points": "mistral",
    "token": 7000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 116,
    "model": "mixtral-8x7b",
    "points": "mixtral",
    "token": 7000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 117,
    "model": "mixtral-8x7b-instruct",
    "points": "mixtral",
    "token": 32000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 118,
    "model": "mixtral-8x22b",
    "points": "mixtral",
    "token": 32000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 119,
    "model": "pplx-70b-online",
    "points": "pplx",
    "token": 32000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 120,
    "model": "dolphin-mixtral-8x7b",
    "points": "mixtral",
    "token": 8000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 121,
    "model": "Atom-13B-Chat",
    "points": "Atom",
    "token": 7000,
    "features": ['conversation'],
    "quota": "0.05/次"
  },
  {
    "id": 122,
    "model": "spark-desk-v1.5",
    "points": "讯飞星火",
    "token": 8000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 1
  },
  {
    "id": 123,
    "model": "spark-desk-v2",
    "points": "讯飞星火",
    "token": 32000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 1
  },
  {
    "id": 124,
    "model": "spark-desk-v3",
    "points": "讯飞星火",
    "token": 32000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 1
  },
  {
    "id": 125,
    "model": "spark-desk-v3.5",
    "points": "讯飞星火",
    "token": 128000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 1
  },
  {
    "id": 126,
    "model": "spark-desk-v4",
    "points": "科大讯飞",
    "token": 128000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 1
  },
  {
    "id": 127,
    "model": "spark-desk-max",
    "points": "科大讯飞",
    "token": 128000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 1
  },
  {
    "id": 128,
    "model": "grok-v2.0",
    "points": "Xai",
    "token": 128000,
    "features": ['conversation', 'code', , 'image_recognition'],
    "quota": 10
  },
  {
    "id": 129,
    "model": "grok-v2.0-mini",
    "points": "Xai",
    "token": 128000,
    "features": ['conversation', 'code', 'image_recognition'],
    "quota": 5
  },
  {
    "id": 130,
    "model": "grok-beta",
    "points": "Xai",
    "token": 128000,
    "features": ['conversation', 'code', 'image_recognition'],
    "quota": 2
  },
  {
    "id": 131,
    "model": "llava-13b",
    "points": "llava",
    "token": 8000,
    "features": ['conversation'],
    "quota": 1
  },
  {
    "id": 132,
    "model": "yi-lightning",
    "points": "零一万物",
    "token": 100000,
    "features": ['conversation', 'code'],
    "quota": "0.05/次"
  },
  {
    "id": 133,
    "model": "nijidjourney-create",
    "points": "nijidjourney",
    "token": 800,
    "features": ['drawing'],
    "quota": "0.1/次"
  },
  {
    "id": 134,
    "model": "midjourney-create",
    "points": "midjourney",
    "token": 800,
    "features": ['drawing'],
    "quota": "0.1/次"
  },
  {
    "id": 135,
    "model": "midjourney-all",
    "points": "midjourney",
    "token": 800,
    "features": ['drawing'],
    "quota": "0.25/次"
  },
  {
    "id": 136,
    "model": "glm-4-flash-new",
    "points": "质谱清言",
    "token": 8000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 1
  },
  {
    "id": 137,
    "model": "deepseek-v2.5-new",
    "points": "深度求索",
    "token": 32000,
    "features": ['conversation', 'code'],
    "quota": 0
  },
  {
    "id": 138,
    "model": "deepseek-r1-preview",
    "points": "深度求索",
    "token": 32000,
    "features": ['conversation', 'code'],
    "quota": 0
  },
  {
    "id": 139,
    "model": "code-claude-3.5-sonnet",
    "points": "Claude",
    "token": 40000,
    "features": ['code'],
    "quota": 12
  },
  {
    "id": 140,
    "model": "qwq-32b-preview",
    "points": "通义千问",
    "token": 32000,
    "features": ['conversation', 'code'],
    "quota": "0.05/次"
  },
  {
    "id": 141,
    "model": "o1",
    "points": "OpenAi",
    "token": 200000,
    "features": ['conversation', 'code', 'image_recognition'],
    "quota": 90
  },
  {
    "id": 142,
    "model": "o1-all",
    "points": "OpenAi",
    "token": 200000,
    "features": ['conversation', 'code', 'image_recognition'],
    "quota": 90
  },
  {
    "id": 143,
    "model": "o1-pro",
    "points": "OpenAi",
    "token": 200000,
    "features": ['conversation', 'code', 'image_recognition'],
    "quota": 150
  },
  {
    "id": 144,
    "model": "o1-pro-all",
    "points": "OpenAi",
    "token": 200000,
    "features": ['conversation', 'code', 'image_recognition'],
    "quota": 150
  },
  {
    "id": 145,
    "model": "flux-pro",
    "points": "BlackForestLabs",
    "token": 1200,
    "features": ['drawing'],
    "quota": "0.08/次"
  },
  {
    "id": 146,
    "model": "flux-pro-max",
    "points": "BlackForestLabs",
    "token": 1200,
    "features": ['drawing'],
    "quota": "0.1/次"
  },
  {
    "id": 147,
    "model": "flux-1.1-pro",
    "points": "BlackForestLabs",
    "token": 1200,
    "features": ['drawing'],
    "quota": "0.15/次"
  },
  {
    "id": 148,
    "model": "generate-pptx",
    "points": "y-tian-plugin",
    "token": 20000,
    "features": [],
    "quota": "5.0/次"
  },
  {
    "id": 149,
    "model": "gemini-2.0-flash-exp",
    "points": "Google",
    "token": 2000000,
    "features": ['conversation', 'code', 'image_recognition'],
    "quota": 0.5
  },
  {
    "id": 150,
    "model": "gpt-4-gizmo",
    "points": "OpenAi",
    "token": 128000,
    "features": ['conversation', 'internet', 'drawing', 'code', 'image_recognition'],
    "quota": "0.5/次"
  },
  {
    "id": 151,
    "model": "jimeng-2.1",
    "points": "字节跳动",
    "token": 2000,
    "features": ['drawing'],
    "quota": "0.25/次"
  },
  {
    "id": 152,
    "model": "kimi",
    "points": "月之暗面",
    "token": 200000,
    "features": ['conversation', 'code', 'image_recognition', 'file'],
    "quota": 0.8
  },
  {
    "id": 153,
    "model": "kimi-search",
    "points": "月之暗面",
    "token": 200000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 0.8
  },
  {
    "id": 154,
    "model": "kimi-research",
    "points": "月之暗面",
    "token": 200000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 0.8
  },
  {
    "id": 155,
    "model": "kimi-k1",
    "points": "月之暗面",
    "token": 200000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 0.8
  },
  {
    "id": 156,
    "model": "kimi-math",
    "points": "月之暗面",
    "token": 200000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 0.8
  },
  {
    "id": 157,
    "model": "kimi-silent",
    "points": "月之暗面",
    "token": 200000,
    "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
    "quota": 0.8
  },
  {
    "id": 158,
    "model": "cogvideox",
    "points": "质谱清言",
    "token": 2000,
    "features": ['video', 'image_recognition'],
    "quota": "1.5/次"
  },
  {
    "id": 159,
    "model": "deepseek-search",
    "points": "深度求索",
    "token": 32000,
    "features": ['conversation', 'code', 'internet'],
    "quota": 0
  },
  {
    "id": 160,
    "model": "command-r-plus",
    "points": "Cohere",
    "token": 100000,
    "features": ['conversation', 'code'],
    "quota": 5
  },
  {
    "id": 161,
    "model": "command-r-plus-08-2024",
    "points": "Cohere",
    "token": 100000,
    "features": ['conversation', 'code'],
    "quota": 5
  },
  {
    "id": 162,
    "model": "gemini-exp-1206",
    "points": "Google",
    "token": 1000000,
    "features": ['conversation', 'code', 'image_recognition'],
    "quota": 2
  },
  {
    "id": 163,
    "model": "gpt-4o-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ['conversation', 'code'],
    "quota": 0
  },
  {
    "id": 164,
    "model": "gpt-4o-mini-nx",
    "points": "逆向渠道",
    "token": 8000,
    "features": ['conversation', 'code'],
    "quota": 0
  },
  {
    "id": 165,
    "model": "gemini-pro-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ['conversation', 'code'],
    "quota": 0
  },
  {
    "id": 166,
    "model": "llama-3.1-405b-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ['conversation', 'code'],
    "quota": 0
  },
  {
    "id": 167,
    "model": "claude-3.5-sonnet-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ['conversation', 'code'],
    "quota": 0
  },
  {
    "id": 168,
    "model": "net-gpt-4o-mini-nx",
    "points": "逆向渠道",
    "token": 8000,
    "features": ['conversation', 'code', 'internet'],
    "quota": 0
  },
  {
    "id": 169,
    "model": "claude-3.5-haiku-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ['conversation', 'code'],
    "quota": 0
  },
  {
    "id": 170,
    "model": "deepseek-v2.5-nx",
    "points": "逆向渠道",
    "token": 16000,
    "features": ['conversation', 'code'],
    "quota": 0
  },
  {
    "id": 171,
    "model": "claude-3.5-sonnet-20241022-nx",
    "points": "逆向渠道",
    "token": 100000,
    "features": ['conversation', 'code'],
    "quota": 0
  },
  {
    "id": 172,
    "model": "gemini-1.5-pro-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ['conversation', 'code'],
    "quota": 0
  },
  {
    "id": 173,
    "model": "qwen-qwq-32b-preview-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ['conversation', 'code'],
    "quota": 0
  },
  {
    "id": 174,
    "model": "o1-mini-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ['conversation', 'code'],
    "quota": 0
  },
  {
    "id": 175,
    "model": "o1-preview-nx",
    "points": "逆向渠道",
    "token": 100000,
    "features": ['conversation', 'code'],
    "quota": 0
  },
  {
    "id": 176,
    "model": "gpt-4o-vision-nx",
    "points": "逆向渠道",
    "token": 8000,
    "features": ['conversation', 'code', 'image_recognition'],
    "quota": 0
  },
  {
    "id": 177,
    "model": "gemini-1.5-flash-vision-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ['conversation', 'code', 'image_recognition'],
    "quota": 0
  },
  {
    "id": 178,
    "model": "yi-lightning-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ["conversation"],
    "quota": 0
  },
  {
    "id": 179,
    "model": "hunyuan-lite-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ["conversation"],
    "quota": 0
  },
  {
    "id": 180,
    "model": "glm-4-flash-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ["conversation", "code", "internet", "drawing"],
    "quota": 0
  },
  {
    "id": 181,
    "model": "deepseek-v3-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ["conversation"],
    "quota": 0
  },
  {
    "id": 182,
    "model": "spark-max-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ["conversation"],
    "quota": 0
  },
  {
    "id": 183,
    "model": "qwen-2.5-72b-instruct-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ["conversation"],
    "quota": 0
  },
  {
    "id": 184,
    "model": "ERNIE-Speed-128k-nx",
    "points": "逆向渠道",
    "token": 128000,
    "features": ["conversation"],
    "quota": 0
  },
  {
    "id": 185,
    "model": "grok-v2-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ["conversation"],
    "quota": 0
  },
  {
    "id": 186,
    "model": "llama-3.3-70b-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ["conversation"],
    "quota": 0
  },
  {
    "id": 187,
    "model": "claude-3.5-sonnet-poe-nx",
    "points": "逆向渠道",
    "token": 8000,
    "features": ["conversation"],
    "quota": 0
  },
  {
    "id": 188,
    "model": "gemini-2.0-flash-exp-nx",
    "points": "逆向渠道",
    "token": 1000000,
    "features": ["conversation"],
    "quota": 0
  },
  {
    "id": 189,
    "model": "deepseek-reasoner-nx",
    "points": "逆向渠道",
    "token": 128000,
    "features": ["conversation", "code"],
    "quota": 0
  },
  {
    "id": 190,
    "model": "minimax-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ["conversation", "code", "internet"],
    "quota": 0
  },
  {
    "id": 191,
    "model": "mita-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ["internet"],
    "quota": 0
  },
  {
    "id": 192,
    "model": "step-2-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ["conversation", "code", "internet"],
    "quota": 0
  },
  {
    "id": 193,
    "model": "qwen-2-72b-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ["conversation", "code"],
    "quota": 0
  },
  {
    "id": 194,
    "model": "kimi-pro-nx",
    "points": "逆向渠道",
    "token": 200000,
    "features": ["conversation", "code", "internet"],
    "quota": 0
  },
  {
    "id": 195,
    "model": "doubao-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ["conversation", "code", "internet"],
    "quota": 0
  },
  {
    "id": 196,
    "model": "o3-mini",
    "points": "OpenAi",
    "token": 128000,
    "features": ["conversation", "code"],
    "quota": 6
  },
  {
    "id": 197,
    "model": "o3-mini-all",
    "points": "OpenAi Plus",
    "token": 128000,
    "features": ["conversation", "code"],
    "quota": 6
  },
  {
    "id": 198,
    "model": "o3-mini-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ["conversation", "code"],
    "quota": 0
  },
  {
    "id": 199,
    "model": "o1-nx",
    "points": "逆向渠道",
    "token": 32000,
    "features": ["conversation", "code"],
    "quota": 0
  },
  {
    "id": 200,
    "model": "deepseek-r1-nothinking",
    "points": "deepseek",
    "token": 64000,
    "features": ["conversation", "code"],
    "quota": 8
  }
]