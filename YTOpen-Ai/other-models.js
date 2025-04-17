export const getOptimizedModels = () => {
  // 原始模型数据
  const originalModels = [
    // OpenAI GPT-3.5 models
    {
      "id": 1,
      "model": "gpt-3.5-turbo",
      "points": "OpenAI",
      "token": "4k",
      "features": ['conversation', 'code'],
      "quota": 0.5
    },
    {
      "id": 2,
      "model": "gpt-3.5-turbo-0125",
      "points": "OpenAI",
      "token": "4k",
      "features": ['conversation', 'code'],
      "quota": 0.5
    },
    {
      "id": 3,
      "model": "gpt-3.5-turbo-0613",
      "points": "OpenAI",
      "token": "4k",
      "features": ['conversation', 'code'],
      "quota": 0.5
    },
    {
      "id": 4,
      "model": "gpt-3.5-turbo-1106",
      "points": "OpenAI",
      "token": "4k",
      "features": ['conversation', 'code'],
      "quota": 0.5
    },
    {
      "id": 5,
      "model": "gpt-3.5-turbo-16k",
      "points": "OpenAI",
      "token": "16k",
      "features": ['conversation', 'code'],
      "quota": 1
    },
    {
      "id": 6,
      "model": "gpt-3.5-turbo-16k-0125",
      "points": "OpenAI",
      "token": "16k",
      "features": ['conversation', 'code'],
      "quota": 1
    },
    {
      "id": 7,
      "model": "gpt-3.5-turbo-16k-0613",
      "points": "OpenAI",
      "token": "16k",
      "features": ['conversation', 'code'],
      "quota": 1
    },
    {
      "id": 8,
      "model": "gpt-3.5-turbo-16k-1106",
      "points": "OpenAI",
      "token": "16k",
      "features": ['conversation', 'code'],
      "quota": 1
    },

    // OpenAI GPT-4 models
    {
      "id": 9,
      "model": "gpt-4",
      "points": "OpenAI",
      "token": "8k",
      "features": ['conversation', 'code'],
      "quota": 15
    },
    {
      "id": 10,
      "model": "gpt-4-32k",
      "points": "OpenAI",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": 30
    },
    {
      "id": 11,
      "model": "gpt-4-turbo",
      "points": "OpenAI",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": 7.5
    },
    {
      "id": 12,
      "model": "gpt-4-0125-preview",
      "points": "OpenAI",
      "token": "131k",
      "features": ['conversation', 'code'],
      "quota": 5
    },
    {
      "id": 13,
      "model": "gpt-4-1106-preview",
      "points": "OpenAI",
      "token": "131k",
      "features": ['conversation', 'code'],
      "quota": 7.5
    },
    {
      "id": 14,
      "model": "gpt-4-all",
      "points": "OpenAI",
      "token": "128k",
      "features": ['conversation', 'internet', 'drawing', 'code', 'image_recognition'],
      "quota": 30
    },
    {
      "id": 15,
      "model": "gpt-4-gizmo",
      "points": "OpenAi",
      "token": "128k",
      "features": ['conversation', 'internet', 'drawing', 'code', 'image_recognition'],
      "quota": "0.5/次"
    },

    // OpenAI GPT-4o models
    {
      "id": 16,
      "model": "gpt-4o-all",
      "points": "OpenAi",
      "token": "128k",
      "features": ['conversation', 'internet', 'drawing', 'code', 'image_recognition'],
      "quota": 15
    },
    {
      "id": 17,
      "model": "gpt-4o-all-lite",
      "points": "OpenAi",
      "token": "8k",
      "features": ['conversation', 'internet', 'drawing', 'code', 'image_recognition'],
      "quota": 2.5
    },
    {
      "id": 18,
      "model": "gpt-4o-mini",
      "points": "OpenAI",
      "token": "128k",
      "features": ['conversation'],
      "quota": 0.07
    },
    {
      "id": 19,
      "model": "gpt-4o-mini-2024-07-18",
      "points": "OpenAI",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": 0.07
    },
    {
      "id": 20,
      "model": "chatgpt-4o-latest",
      "points": "OpenAI",
      "token": "128k",
      "features": ['conversation'],
      "quota": 2.5
    },
    {
      "id": 21,
      "model": "gpt-4o-2024-11-20",
      "points": "OpenAI",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": 1.25
    },

    // OpenAI o1 models
    {
      "id": 22,
      "model": "o1",
      "points": "OpenAi",
      "token": "200k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 90
    },
    {
      "id": 23,
      "model": "o1-all",
      "points": "OpenAi",
      "token": "200k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 90
    },
    {
      "id": 24,
      "model": "o1-pro",
      "points": "OpenAi",
      "token": "200k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 150
    },
    {
      "id": 25,
      "model": "o1-pro-all",
      "points": "OpenAi",
      "token": "200k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 150
    },
    {
      "id": 26,
      "model": "o1-preview-20240912",
      "points": "OpenAi",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 30
    },
    {
      "id": 27,
      "model": "o1-preview-all",
      "points": "OpenAi",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 30
    },
    {
      "id": 28,
      "model": "o1-mini-20240912",
      "points": "OpenAi",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 10
    },
    {
      "id": 29,
      "model": "o1-mini-all",
      "points": "OpenAi",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 10
    },

    // OpenAI o3 models
    {
      "id": 30,
      "model": "o3-mini",
      "points": "OpenAi",
      "token": "128k",
      "features": ["conversation", "code", "internet"],
      "quota": 6
    },
    {
      "id": 31,
      "model": "o3-mini-all",
      "points": "OpenAi Plus",
      "token": "128k",
      "features": ["conversation", "code", "internet"],
      "quota": 6
    },
    {
      "id": 32,
      "model": "o3-mini-high",
      "points": "OpenAi Plus",
      "token": "128k",
      "features": ["conversation", "code", "internet"],
      "quota": 24
    },
    {
      "id": 33,
      "model": "o3-mini-high-all",
      "points": "OpenAi Plus",
      "token": "128k",
      "features": ["conversation", "code", "internet"],
      "quota": 24
    },

    // OpenAI DALL-E
    {
      "id": 34,
      "model": "dall-e-3",
      "points": "OpenAI",
      "token": "2k",
      "features": ['drawing'],
      "quota": 0
    },

    // Claude models
    {
      "id": 35,
      "model": "claude-1-100k",
      "points": "Anthropic",
      "token": "100k",
      "features": ['conversation', 'image_recognition'],
      "quota": 0
    },
    {
      "id": 36,
      "model": "claude-1.3-100k",
      "points": "Anthropic",
      "token": "100k",
      "features": ['conversation', 'image_recognition'],
      "quota": 0
    },
    {
      "id": 37,
      "model": "claude-2-200k",
      "points": "Anthropic",
      "token": "200k",
      "features": ['conversation', 'image_recognition'],
      "quota": 0
    },
    {
      "id": 38,
      "model": "claude-3-haiku",
      "points": "Anthropic",
      "token": "200k",
      "features": ['conversation', 'image_recognition'],
      "quota": 0
    },
    {
      "id": 39,
      "model": "claude-3-sonnet",
      "points": "Anthropic",
      "token": "200k",
      "features": ['conversation', 'image_recognition'],
      "quota": 0
    },
    {
      "id": 40,
      "model": "claude-3-opus",
      "points": "Anthropic",
      "token": "200k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 0
    },
    {
      "id": 41,
      "model": "claude-3.5-sonnet",
      "points": "Anthropic",
      "token": "200k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 5
    },
    {
      "id": 42,
      "model": "claude-3.5-sonnet-20241022",
      "points": "Anthropic",
      "token": "200k",
      "features": ['conversation', 'code'],
      "quota": 7.5
    },
    {
      "id": 43,
      "model": "claude-3.5-sonnet-all",
      "points": "Anthropic",
      "token": "200k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 7.5
    },
    {
      "id": 44,
      "model": "code-claude-3.5-sonnet",
      "points": "Anthropic",
      "token": "40k",
      "features": ['code'],
      "quota": 12
    },
    {
      "id": 45,
      "model": "claude-3.7-sonnet",
      "points": "Anthropic",
      "token": "200k",
      "features": ['conversation', 'code'],
      "quota": 5
    },

    // Google Gemini models
    {
      "id": 46,
      "model": "gemini-pro",
      "points": "Google",
      "token": "32k",
      "features": ['conversation', 'image_recognition'],
      "quota": 1
    },
    {
      "id": 47,
      "model": "gemini-pro-vision",
      "points": "Google",
      "token": "32k",
      "features": ['conversation', 'image_recognition'],
      "quota": 2
    },
    {
      "id": 48,
      "model": "gemini-1.5-flash",
      "points": "Google",
      "token": "32k",
      "features": ['conversation', 'image_recognition'],
      "quota": 0.5
    },
    {
      "id": 49,
      "model": "gemini-1.5-flash-latest",
      "points": "Google",
      "token": "100k",
      "features": ['conversation', 'code'],
      "quota": 0.5
    },
    {
      "id": 50,
      "model": "gemini-1.5-pro",
      "points": "Google",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": 5
    },
    {
      "id": 51,
      "model": "gemini-1.5-pro-exp-0801",
      "points": "Google",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": 5
    },
    {
      "id": 52,
      "model": "gemini-1.5-pro-exp-0827",
      "points": "Google",
      "token": "200k",
      "features": ['conversation', 'image_recognition'],
      "quota": 3
    },
    {
      "id": 53,
      "model": "gemini-1.5-pro-001",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 5
    },
    {
      "id": 54,
      "model": "gemini-1.5-pro-002",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 5
    },
    {
      "id": 55,
      "model": "gemini-exp-1206",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 2
    },
    {
      "id": 56,
      "model": "gemini-2.0-flash-exp",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 0.5
    },
    {
      "id": 57,
      "model": "gemini-2.0-flash-thinking-exp",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 1
    },
    {
      "id": 58,
      "model": "gemini-2.0-flash-thinking-exp-1219",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 1
    },
    {
      "id": 59,
      "model": "gemini-2.0-flash-lite-preview-02-05",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 0.5
    },
    {
      "id": 60,
      "model": "gemini-2.0-pro-exp-02-05",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 6
    },
    {
      "id": 61,
      "model": "learnlm-1.5-pro-experimental",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code'],
      "quota": 1
    },
    {
      "id": 62,
      "model": "gemini-2.0-flash-exp-image-generation",
      "points": "Google",
      "token": "1000k",
      "features": ['drawing', 'image_recognition'],
      "quota": 0
    },
    {
      "id": 63,
      "model": "gemini-2.0-flash-net",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'internet', 'code', 'image_recognition'],
      "quota": 0
    },

    // Cohere models
    {
      "id": 64,
      "model": "command-r",
      "points": "Cohere",
      "token": "32k",
      "features": ['conversation'],
      "quota": 2.5
    },
    {
      "id": 65,
      "model": "command-r-plus",
      "points": "Cohere",
      "token": "100k",
      "features": ['conversation', 'code'],
      "quota": 5
    },
    {
      "id": 66,
      "model": "command-r-plus-08-2024",
      "points": "Cohere",
      "token": "100k",
      "features": ['conversation', 'code'],
      "quota": 5
    },

    // Meta/Llama models
    {
      "id": 67,
      "model": "llama-2-70b-chat",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": 0
    },
    {
      "id": 68,
      "model": "code-llama-70b",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": 1
    },
    {
      "id": 69,
      "model": "meta-llama-3.1-8B",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": 0
    },
    {
      "id": 70,
      "model": "meta-llama-3.1-70B",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": 0
    },
    {
      "id": 71,
      "model": "meta-llama-3.1-405B",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": 0
    },
    {
      "id": 72,
      "model": "llama-3-8b",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": 0
    },
    {
      "id": 73,
      "model": "llama-3-70b",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": 0
    },
    {
      "id": 74,
      "model": "llama-3-sonar-small-32k-online",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": 0
    },
    {
      "id": 75,
      "model": "llama-3-sonar-small-32k-chat",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": 0
    },
    {
      "id": 76,
      "model": "llama-3-sonar-large-32k-online",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": 0
    },
    {
      "id": 77,
      "model": "llama-3-sonar-large-32k-chat",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": 0
    },
    {
      "id": 78,
      "model": "llama-3.2-1B-Instruct",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": 0
    },
    {
      "id": 79,
      "model": "llama-3.2-3B-Instruct",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": 0
    },
    {
      "id": 80,
      "model": "llama-3.3-70B-Instruct-turbo",
      "points": "meta",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": 0.25
    },
    {
      "id": 81,
      "model": "llama-3-vision",
      "points": "meta",
      "token": "32k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 0.25
    },

    // 中文模型: 智谱GLM系列
    {
      "id": 82,
      "model": "glm-3-turbo",
      "points": "智谱清言",
      "token": "128k",
      "features": ['conversation', 'internet', 'code', 'image_recognition'],
      "quota": 1
    },
    {
      "id": 83,
      "model": "glm-4",
      "points": "智谱清言",
      "token": "128k",
      "features": ['conversation', 'internet', 'code', 'image_recognition'],
      "quota": 1
    },
    {
      "id": 84,
      "model": "glm-4-flash",
      "points": "智谱清言",
      "token": "128k",
      "features": ['conversation', 'internet', 'code', 'image_recognition'],
      "quota": 1
    },
    {
      "id": 85,
      "model": "glm-4-all",
      "points": "智谱清言",
      "token": "128k",
      "features": ['conversation', 'internet', 'code', 'image_recognition'],
      "quota": 1
    },
    {
      "id": 86,
      "model": "glm-4-flash-new",
      "points": "智谱清言",
      "token": "8k",
      "features": ['conversation', 'internet', 'code', 'image_recognition'],
      "quota": 1
    },

    // Moonshot models
    {
      "id": 87,
      "model": "moonshot-v1-8k",
      "points": "月之暗面",
      "token": "8k",
      "features": ['conversation', 'code'],
      "quota": 5
    },
    {
      "id": 88,
      "model": "moonshot-v1-32k",
      "points": "月之暗面",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": 10
    },
    {
      "id": 89,
      "model": "moonshot-v1-128k",
      "points": "月之暗面",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": 15
    },

    // Deepseek models
    {
      "id": 90,
      "model": "deepseek-chat",
      "points": "deepseek",
      "token": "32k",
      "features": ['conversation'],
      "quota": 0
    },
    {
      "id": 91,
      "model": "deepseek-code",
      "points": "deepseek",
      "token": "16k",
      "features": ['code'],
      "quota": 0
    },
    {
      "id": 92,
      "model": "deepseek-v2.5",
      "points": "deepseek",
      "token": "100k",
      "features": ['conversation', 'code'],
      "quota": 0
    },
    {
      "id": 93,
      "model": "deepseek-v2.5-new",
      "points": "deepseek",
      "token": "64k",
      "features": ['conversation', 'code'],
      "quota": 0
    },
    {
      "id": 94,
      "model": "deepseek-r1-preview",
      "points": "deepseek",
      "token": "64k",
      "features": ['conversation', 'code'],
      "quota": 0
    },
    {
      "id": 95,
      "model": "deepseek-search",
      "points": "deepseek",
      "token": "64k",
      "features": ['conversation', 'code', 'internet'],
      "quota": 0
    },
    {
      "id": 96,
      "model": "deepseek-v3-chat",
      "points": "deepseek",
      "token": "64k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 0.5
    },
    {
      "id": 97,
      "model": "deepseek-r1-search",
      "points": "deepseek",
      "token": "64k",
      "features": ['conversation', 'code', 'internet'],
      "quota": 4
    },
    {
      "id": 98,
      "model": "deepseek-reasoner",
      "points": "deepseek",
      "token": "64k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 4
    },
    {
      "id": 99,
      "model": "deepseek-r1-distill-qwen-7b",
      "points": "deepseek",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": 0.25
    },
    {
      "id": 100,
      "model": "deepseek-r1-distill-llama-8b",
      "points": "deepseek",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": 0.25
    },
    {
      "id": 101,
      "model": "deepseek-r1-distill-llama-70b",
      "points": "deepseek",
      "token": "64k",
      "features": ['conversation', 'code'],
      "quota": 0.25
    },
    {
      "id": 102,
      "model": "deepseek-r1-fast",
      "points": "deepseek",
      "token": "100k",
      "features": ['conversation'],
      "quota": "0.01/次"
    },

    // Yi models
    {
      "id": 103,
      "model": "yi-34b-chat-200k",
      "points": "零一万物",
      "token": "200k",
      "features": ['conversation'],
      "quota": 0
    },
    {
      "id": 104,
      "model": "yi-lightning",
      "points": "零一万物",
      "token": "100k",
      "features": ['conversation', 'code'],
      "quota": 0
    },
    {
      "id": 105,
      "model": "yi-1.5-9b-chat",
      "points": "零一万物",
      "token": "16k",
      "features": ['conversation', 'code'],
      "quota": 0.25
    },
    {
      "id": 106,
      "model": "yi-34b",
      "points": "零一万物",
      "token": "16k",
      "features": ['conversation', 'code'],
      "quota": 0.25
    },

    // Grok models
    {
      "id": 107,
      "model": "grok-v2.0",
      "points": "Xai",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 10
    },
    {
      "id": 108,
      "model": "grok-v2.0-mini",
      "points": "Xai",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 5
    },
    {
      "id": 109,
      "model": "grok-beta",
      "points": "Xai",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 2
    },
    {
      "id": 110,
      "model": "grok-3-preview",
      "points": "Xai",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": 4
    },
    {
      "id": 111,
      "model": "grok-3",
      "points": "Xai",
      "token": "128k",
      "features": ['conversation', 'code', 'internet'],
      "quota": 4
    },
    {
      "id": 112,
      "model": "mistral-7b",
      "points": "mistral",
      "token": "7k",
      "features": ['conversation'],
      "quota": 0
    },
    {
      "id": 113,
      "model": "mixtral-8x7b",
      "points": "mixtral",
      "token": "7k",
      "features": ['conversation'],
      "quota": 0
    },
    {
      "id": 114,
      "model": "mixtral-8x7b-instruct",
      "points": "mixtral",
      "token": "32k",
      "features": ['conversation'],
      "quota": 0
    },
    {
      "id": 115,
      "model": "mixtral-8x22b",
      "points": "mixtral",
      "token": "32k",
      "features": ['conversation'],
      "quota": 0
    },
    {
      "id": 116,
      "model": "dolphin-mixtral-8x7b",
      "points": "mixtral",
      "token": "8k",
      "features": ['conversation'],
      "quota": 0
    },
    {
      "id": 117,
      "model": "mistral-tiny-latest",
      "points": "mistral",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": 0.6
    },
    {
      "id": 118,
      "model": "ministral-8b-latest",
      "points": "mistral",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": 2
    },
    {
      "id": 119,
      "model": "open-mistral-nemo",
      "points": "mistral",
      "token": "131k",
      "features": ['conversation', 'code'],
      "quota": 0.3
    },
    {
      "id": 120,
      "model": "open-mixtral-8x7b",
      "points": "mistral",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": 0.5
    },
    {
      "id": 121,
      "model": "open-mixtral-8x22b",
      "points": "mistral",
      "token": "64k",
      "features": ['conversation', 'code'],
      "quota": 4
    },
    {
      "id": 122,
      "model": "mistral-small-latest",
      "points": "mistral",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": 0.5
    },
    {
      "id": 123,
      "model": "mistral-medium-latest",
      "points": "mistral",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": 2.5
    },
    {
      "id": 124,
      "model": "mistral-large-latest",
      "points": "mistral",
      "token": "131k",
      "features": ['conversation', 'code'],
      "quota": 3.5
    },
    {
      "id": 125,
      "model": "mistral-saba-latest",
      "points": "mistral",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": 1
    },
    {
      "id": 126,
      "model": "codestral-latest",
      "points": "mistral",
      "token": "32k",
      "features": ['code'],
      "quota": 2
    },
    {
      "id": 127,
      "model": "pixtral-12b",
      "points": "mistral",
      "token": "131k",
      "features": ['conversation', 'image_recognition'],
      "quota": 1
    },
    {
      "id": 128,
      "model": "pixtral-large-latest",
      "points": "mistral",
      "token": "131k",
      "features": ['conversation', 'image_recognition'],
      "quota": 3.5
    },
    {
      "id": 129,
      "model": "mistral-large-pixtral",
      "points": "mistral",
      "token": "131k",
      "features": ['conversation', 'code'],
      "quota": 3.5
    },

    // Qwen models
    {
      "id": 130,
      "model": "qwen-2.5-7B-instruct",
      "points": "通义千问",
      "token": "32k",
      "features": ['conversation'],
      "quota": 0.25
    },
    {
      "id": 131,
      "model": "qwen-2.5-7B-coder",
      "points": "通义千问",
      "token": "32k",
      "features": ['code'],
      "quota": 0.25
    },
    {
      "id": 132,
      "model": "qwq-32b-preview",
      "points": "通义千问",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": 0
    },

    // InternLM models
    {
      "id": 133,
      "model": "internlm-2.5-7b-chat",
      "points": "通义千问",
      "token": "64k",
      "features": ['conversation', 'code'],
      "quota": 0.25
    },

    // 其他模型: 腾讯混元
    {
      "id": 134,
      "model": "hunyuan",
      "points": "腾讯混元",
      "token": "32k",
      "features": ['conversation'],
      "quota": 0
    },

    // 月之暗面 Kimi models
    {
      "id": 135,
      "model": "kimi",
      "points": "月之暗面",
      "token": "200k",
      "features": ['conversation', 'code', 'image_recognition', 'file'],
      "quota": 0.8
    },
    {
      "id": 136,
      "model": "kimi-search",
      "points": "月之暗面",
      "token": "200k",
      "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
      "quota": 0.8
    },
    {
      "id": 137,
      "model": "kimi-research",
      "points": "月之暗面",
      "token": "200k",
      "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
      "quota": 0.8
    },
    {
      "id": 138,
      "model": "kimi-k1",
      "points": "月之暗面",
      "token": "200k",
      "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
      "quota": 0.8
    },
    {
      "id": 139,
      "model": "kimi-math",
      "points": "月之暗面",
      "token": "200k",
      "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
      "quota": 0.8
    },
    {
      "id": 140,
      "model": "kimi-silent",
      "points": "月之暗面",
      "token": "200k",
      "features": ['conversation', 'internet', 'code', 'image_recognition', 'file'],
      "quota": 0.8
    },

    // 绘图和多媒体模型
    {
      "id": 141,
      "model": "generate-pptx",
      "points": "OpenAi",
      "token": "20k",
      "features": [],
      "quota": "5.0/次"
    },
    {
      "id": 142,
      "model": "nijidjourney-create",
      "points": "nijidjourney",
      "token": "0.8k",
      "features": ['drawing', 'image_recognition'],
      "quota": "0.1/次"
    },
    {
      "id": 143,
      "model": "midjourney-create",
      "points": "midjourney",
      "token": "0.8k",
      "features": ['drawing', 'image_recognition'],
      "quota": "0.1/次"
    },
    {
      "id": 144,
      "model": "midjourney-all",
      "points": "midjourney",
      "token": "0.8k",
      "features": ['drawing', 'image_recognition'],
      "quota": "0.25/次"
    },
    {
      "id": 145,
      "model": "flux-pro",
      "points": "BlackForestLabs",
      "token": "1.2k",
      "features": ['drawing'],
      "quota": "0.08/次"
    },
    {
      "id": 146,
      "model": "flux-pro-max",
      "points": "BlackForestLabs",
      "token": "1.2k",
      "features": ['drawing'],
      "quota": "0.1/次"
    },
    {
      "id": 147,
      "model": "flux-1.1-pro",
      "points": "BlackForestLabs",
      "token": "1.2k",
      "features": ['drawing'],
      "quota": "0.15/次"
    },
    {
      "id": 148,
      "model": "jimeng-2.1",
      "points": "即梦",
      "token": "2k",
      "features": ['drawing'],
      "quota": "0.25/次"
    },
    {
      "id": 149,
      "model": "flux-lora",
      "points": "BlackForestLabs",
      "token": "0.8k",
      "features": ['drawing'],
      "quota": "0.7/次"
    },
    {
      "id": 150,
      "model": "ideogram-v2a",
      "points": "ideogram",
      "token": "0.8k",
      "features": ['drawing'],
      "quota": "0.4/次"
    },
    {
      "id": 151,
      "model": "sana",
      "points": "sana",
      "token": "0.8k",
      "features": ['drawing'],
      "quota": "0.08/次"
    },
    {
      "id": 152,
      "model": "flux-lora-nier",
      "points": "BlackForestLabs",
      "token": "0.8k",
      "features": ['drawing'],
      "quota": "0.7/次"
    },
    {
      "id": 153,
      "model": "flux-lora-nwsj",
      "points": "BlackForestLabs",
      "token": "0.8k",
      "features": ['drawing'],
      "quota": "0.7/次"
    },
    {
      "id": 154,
      "model": "flux-subject",
      "points": "BlackForestLabs",
      "token": "0.8k",
      "features": ['drawing', 'image_recognition'],
      "quota": "0.6/次"
    },
    {
      "id": 155,
      "model": "ideogram-v2",
      "points": "ideogram",
      "token": "0.8k",
      "features": ['drawing'],
      "quota": "0.8/次"
    },
    {
      "id": 156,
      "model": "minimax-Genimage",
      "points": "minimax",
      "token": "0.8k",
      "features": ['drawing'],
      "quota": "0.2/次"
    },
    {
      "id": 157,
      "model": "juggernaut-flux",
      "points": "BlackForestLabs",
      "token": "0.8k",
      "features": ['drawing'],
      "quota": "0.15/次"
    },
    {
      "id": 158,
      "model": "recraft-v3",
      "points": "recraft",
      "token": "0.8k",
      "features": ['drawing'],
      "quota": "0.3/次"
    },
    {
      "id": 159,
      "model": "Noobai",
      "points": "Noobai",
      "token": "0.8k",
      "features": ['drawing'],
      "quota": "0.04/次"
    },

    // 即梦绘图系列
    {
      "id": 160,
      "model": "jimeng-3.0",
      "points": "即梦",
      "token": "8k",
      "features": ["drawing"],
      "quota": 0
    },
    {
      "id": 161,
      "model": "jimeng-2.1",
      "points": "即梦",
      "token": "8k",
      "features": ["drawing"],
      "quota": 0
    },
    {
      "id": 162,
      "model": "jimeng-2.0-pro",
      "points": "即梦",
      "token": "8k",
      "features": ["drawing"],
      "quota": 0
    },
    {
      "id": 163,
      "model": "jimeng-2.0",
      "points": "即梦",
      "token": "8k",
      "features": ["drawing"],
      "quota": 0
    },
    {
      "id": 164,
      "model": "jimeng-xl-pro",
      "points": "即梦",
      "token": "8k",
      "features": ["drawing"],
      "quota": 0
    },

    // 视频生成模型
    {
      "id": 165,
      "model": "jimeng-video-1.2",
      "points": "即梦",
      "token": "8k",
      "features": ["video"],
      "quota": 0
    },
    {
      "id": 166,
      "model": "jimeng-video-s2.0",
      "points": "即梦",
      "token": "8k",
      "features": ["video"],
      "quota": 0
    },
    {
      "id": 167,
      "model": "jimeng-video-p2.0-pro",
      "points": "即梦",
      "token": "8k",
      "features": ["video"],
      "quota": 0
    },
    {
      "id": 168,
      "model": "jimeng-video-s2.0-pro",
      "points": "即梦",
      "token": "8k",
      "features": ["video"],
      "quota": 0
    },
    {
      "id": 169,
      "model": "luma-dream-machine-v2",
      "points": "luma",
      "token": "2k",
      "features": ['video'],
      "quota": "2.5/次"
    },
    {
      "id": 170,
      "model": "ltx-video",
      "points": "ltx",
      "token": "2k",
      "features": ['video'],
      "quota": "0.5/次"
    },

    // OpenAI图像生成
    {
      "id": 171,
      "model": "gpt-4o-image",
      "points": "OpenAi",
      "token": "8k",
      "features": ['drawing'],
      "quota": 0
    },
    {
      "id": 172,
      "model": "gpt-4o-image-vip",
      "points": "OpenAi",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.1/次"
    },

    // 音乐生成
    {
      "id": 173,
      "model": "suno-v4-vip",
      "points": "Suno",
      "token": "1000k",
      "features": ['music'],
      "quota": 0
    },

    // 快速处理模型
    {
      "id": 174,
      "model": "gemini-1.5-flash-fast",
      "points": "Google",
      "token": "100k",
      "features": ['conversation'],
      "quota": "0.004/次"
    },
    {
      "id": 175,
      "model": "gemini-2.0-flash-fast",
      "points": "Google",
      "token": "100k",
      "features": ['conversation'],
      "quota": "0.008/次"
    },
    {
      "id": 176,
      "model": "gemini-2.5-pro-fast",
      "points": "Google",
      "token": "100k",
      "features": ['conversation'],
      "quota": "0.01/次"
    },
    {
      "id": 177,
      "model": "claude-3.5-haiku-fast",
      "points": "Anthropic",
      "token": "100k",
      "features": ['conversation'],
      "quota": "0.025/次"
    },
    {
      "id": 178,
      "model": "claude-3.5-sonnet-fast",
      "points": "Anthropic",
      "token": "100k",
      "features": ['conversation'],
      "quota": "0.05/次"
    },
    {
      "id": 179,
      "model": "claude-3.7-sonnet-fast",
      "points": "Anthropic",
      "token": "100k",
      "features": ['conversation'],
      "quota": "0.05/次"
    },
    {
      "id": 179,
      "model": "wai-illustrious",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.03/次"
    },
    {
      "id": 180,
      "model": "wai-illustrious-sdxl",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.1/次"
    },
    {
      "id": 181,
      "model": "noobai-xl-v1.1",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.08/次"
    },
    {
      "id": 182,
      "model": "anishadow-v10",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.12/次"
    }
  ]

  const groupedByPoints = {};
  originalModels.forEach(model => {
    if (!groupedByPoints[model.points]) {
      groupedByPoints[model.points] = [];
    }
    groupedByPoints[model.points].push(model);
  });

  let newId = 1;
  const optimizedModels = [];

  Object.keys(groupedByPoints).forEach(points => {
    const modelsInGroup = groupedByPoints[points];
    modelsInGroup.forEach(model => {
      optimizedModels.push({
        ...model,
        id: newId++
      });
    });
  });

  return optimizedModels;
};

export const other_models = getOptimizedModels();