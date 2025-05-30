export const getOptimizedModels = () => {
  const originalModels = [
    {
      "id": 1,
      "model": "gpt-3.5-turbo",
      "points": "OpenAI",
      "token": "4k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 0.5
    },
    {
      "id": 2,
      "model": "gpt-3.5-turbo-0125",
      "points": "OpenAI",
      "token": "4k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 0.5
    },
    {
      "id": 3,
      "model": "gpt-3.5-turbo-0613",
      "points": "OpenAI",
      "token": "4k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 0.5
    },
    {
      "id": 4,
      "model": "gpt-3.5-turbo-1106",
      "points": "OpenAI",
      "token": "4k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 0.5
    },
    {
      "id": 5,
      "model": "gpt-3.5-turbo-16k",
      "points": "OpenAI",
      "token": "16k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 1
    },
    {
      "id": 6,
      "model": "gpt-3.5-turbo-16k-0125",
      "points": "OpenAI",
      "token": "16k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 1
    },
    {
      "id": 7,
      "model": "gpt-3.5-turbo-16k-0613",
      "points": "OpenAI",
      "token": "16k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 1
    },
    {
      "id": 8,
      "model": "gpt-3.5-turbo-16k-1106",
      "points": "OpenAI",
      "token": "16k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 1
    },
    {
      "id": 9,
      "model": "gpt-4",
      "points": "OpenAI",
      "token": "8k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 15
    },
    {
      "id": 10,
      "model": "gpt-4-32k",
      "points": "OpenAI",
      "token": "32k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 30
    },
    {
      "id": 11,
      "model": "gpt-4-turbo",
      "points": "OpenAI",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 7.5
    },
    {
      "id": 12,
      "model": "gpt-4-0125-preview",
      "points": "OpenAI",
      "token": "131k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 5
    },
    {
      "id": 13,
      "model": "gpt-4-1106-preview",
      "points": "OpenAI",
      "token": "131k",
      "features": ['conversation', 'code', 'image_recognition'],
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
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 0.07
    },
    {
      "id": 19,
      "model": "gpt-4o-mini-2024-07-18",
      "points": "OpenAI",
      "token": "32k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 0.07
    },
    {
      "id": 20,
      "model": "chatgpt-4o-latest",
      "points": "OpenAI",
      "token": "128k",
      "features": ['conversation', 'image_recognition'],
      "quota": 2.5
    },
    {
      "id": 21,
      "model": "gpt-4o-2024-11-20",
      "points": "OpenAI",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 1.25
    },
    {
      "id": 22,
      "model": "o1",
      "points": "OpenAi",
      "token": "200k",
      "features": ['conversation', 'code', 'image_recognition', 'thinking'],
      "quota": 90
    },
    {
      "id": 23,
      "model": "o1-all",
      "points": "OpenAi",
      "token": "200k",
      "features": ['conversation', 'code', 'image_recognition', 'thinking'],
      "quota": 90
    },
    {
      "id": 24,
      "model": "o1-pro",
      "points": "OpenAi",
      "token": "200k",
      "features": ['conversation', 'code', 'image_recognition', 'thinking'],
      "quota": 150
    },
    {
      "id": 25,
      "model": "o1-pro-all",
      "points": "OpenAi",
      "token": "200k",
      "features": ['conversation', 'code', 'image_recognition', 'thinking'],
      "quota": 150
    },
    {
      "id": 26,
      "model": "o1-preview-20240912",
      "points": "OpenAi",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition', 'thinking'],
      "quota": 30
    },
    {
      "id": 27,
      "model": "o1-preview-all",
      "points": "OpenAi",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition', 'thinking'],
      "quota": 30
    },
    {
      "id": 28,
      "model": "o1-mini-20240912",
      "points": "OpenAi",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition', 'thinking'],
      "quota": 10
    },
    {
      "id": 29,
      "model": "o1-mini-all",
      "points": "OpenAi",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition', 'thinking'],
      "quota": 10
    },
    {
      "id": 30,
      "model": "o3-mini",
      "points": "OpenAi",
      "token": "128k",
      "features": ["conversation", "code", "internet", 'thinking'],
      "quota": 6
    },
    {
      "id": 31,
      "model": "o3-mini-all",
      "points": "OpenAi",
      "token": "128k",
      "features": ["conversation", "code", "internet", 'thinking'],
      "quota": 6
    },
    {
      "id": 32,
      "model": "o3-mini-high",
      "points": "OpenAi",
      "token": "128k",
      "features": ["conversation", "code", "internet", 'thinking'],
      "quota": 24
    },
    {
      "id": 33,
      "model": "o3-mini-high-all",
      "points": "OpenAi",
      "token": "128k",
      "features": ["conversation", "code", "internet", 'thinking'],
      "quota": 24
    },
    {
      "id": 35,
      "model": "claude-1-100k",
      "points": "Anthropic",
      "token": "100k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.02/次"
    },
    {
      "id": 36,
      "model": "claude-1.3-100k",
      "points": "Anthropic",
      "token": "100k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.02/次"
    },
    {
      "id": 37,
      "model": "claude-2-200k",
      "points": "Anthropic",
      "token": "200k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.02/次"
    },
    {
      "id": 38,
      "model": "claude-3-haiku",
      "points": "Anthropic",
      "token": "200k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.02/次"
    },
    {
      "id": 39,
      "model": "claude-3-sonnet",
      "points": "Anthropic",
      "token": "200k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.03/次"
    },
    {
      "id": 40,
      "model": "claude-3-opus",
      "points": "Anthropic",
      "token": "200k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.05/次"
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
      "features": ['conversation', 'code'],
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
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 0.5
    },
    {
      "id": 50,
      "model": "gemini-1.5-pro",
      "points": "Google",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 5
    },
    {
      "id": 51,
      "model": "gemini-1.5-pro-exp-0801",
      "points": "Google",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 5
    },
    {
      "id": 52,
      "model": "gemini-1.5-pro-exp-0827",
      "points": "Google",
      "token": "200k",
      "features": ['conversation', 'code', 'image_recognition'],
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
      "features": ['conversation', 'code', 'image_recognition', 'thinking'],
      "quota": 1
    },
    {
      "id": 58,
      "model": "gemini-2.0-flash-thinking-exp-1219",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition', 'thinking'],
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
    {
      "id": 64,
      "model": "command-r",
      "points": "Cohere",
      "token": "128k",
      "features": ['conversation'],
      "quota": 0.5
    },
    {
      "id": 65,
      "model": "command-r-plus",
      "points": "Cohere",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": 0.5
    },
    {
      "id": 66,
      "model": "command-r-plus-08-2024",
      "points": "Cohere",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": 0.5
    },
    {
      "id": 67,
      "model": "llama-2-70b-chat",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": "0.01/次"
    },
    {
      "id": 68,
      "model": "code-llama-70b",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": "0.01/次"
    },
    {
      "id": 69,
      "model": "meta-llama-3.1-8B",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": "0.01/次"
    },
    {
      "id": 70,
      "model": "meta-llama-3.1-70B",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": "0.01/次"
    },
    {
      "id": 71,
      "model": "meta-llama-3.1-405B",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": "0.01/次"
    },
    {
      "id": 72,
      "model": "llama-3-8b",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": "0.01/次"
    },
    {
      "id": 73,
      "model": "llama-3-70b",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": "0.01/次"
    },
    {
      "id": 74,
      "model": "llama-3-sonar-small-32k-online",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": "0.01/次"
    },
    {
      "id": 75,
      "model": "llama-3-sonar-small-32k-chat",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": "0.01/次"
    },
    {
      "id": 76,
      "model": "llama-3-sonar-large-32k-online",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": "0.01/次"
    },
    {
      "id": 77,
      "model": "llama-3-sonar-large-32k-chat",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": "0.01/次"
    },
    {
      "id": 78,
      "model": "llama-3.2-1B-Instruct",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": "0.01/次"
    },
    {
      "id": 79,
      "model": "llama-3.2-3B-Instruct",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": "0.01/次"
    },
    {
      "id": 80,
      "model": "llama-3.3-70B-Instruct-turbo",
      "points": "meta",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": "0.01/次"
    },
    {
      "id": 81,
      "model": "llama-3-vision",
      "points": "meta",
      "token": "32k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 0.5
    },
    {
      "id": 87,
      "model": "moonshot-v1-8k",
      "points": "moonshot",
      "token": "8k",
      "features": ['conversation', 'code'],
      "quota": 5
    },
    {
      "id": 88,
      "model": "moonshot-v1-32k",
      "points": "moonshot",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": 10
    },
    {
      "id": 89,
      "model": "moonshot-v1-128k",
      "points": "moonshot",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": 15
    },
    {
      "id": 90,
      "model": "deepseek-chat",
      "points": "deepseek",
      "token": "32k",
      "features": ['conversation'],
      "quota": 0.5
    },
    {
      "id": 91,
      "model": "deepseek-code",
      "points": "deepseek",
      "token": "16k",
      "features": ['code'],
      "quota": 0.5
    },
    {
      "id": 92,
      "model": "deepseek-v2.5",
      "points": "deepseek",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": 0.5
    },
    {
      "id": 93,
      "model": "deepseek-v3",
      "points": "deepseek",
      "token": "64k",
      "features": ['conversation', 'code'],
      "quota": 0.5
    },
    {
      "id": 94,
      "model": "deepseek-r1-preview",
      "points": "deepseek",
      "token": "64k",
      "features": ['conversation', 'code'],
      "quota": 1.5
    },
    {
      "id": 95,
      "model": "kimi-vl-a3b-thinking",
      "points": "moonshot",
      "token": "128k",
      "features": ['conversation', 'code', 'thinking'],
      "quota": 0.5
    },
    {
      "id": 96,
      "model": "deepseek-v3-0324",
      "points": "deepseek",
      "token": "64k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 0.5
    },
    {
      "id": 97,
      "model": "deepseek-r1",
      "points": "deepseek",
      "token": "64k",
      "features": ['conversation', 'code'],
      "quota": 1
    },
    {
      "id": 98,
      "model": "deepseek-reasoner",
      "points": "deepseek",
      "token": "64k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 1.5
    },
    {
      "id": 99,
      "model": "llama-4-scout",
      "points": "meta",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.02/次"
    },
    {
      "id": 100,
      "model": "llama-4-maverick",
      "points": "meta",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.04/次"
    },
    {
      "id": 101,
      "model": "deepseek-r1-distill-llama-70b",
      "points": "deepseek",
      "token": "64k",
      "features": ['conversation', 'code'],
      "quota": 0.5
    },
    {
      "id": 102,
      "model": "qwq-32b-arliai-rpr-v1",
      "points": "alibaba",
      "token": "128k",
      "features": ['conversation', 'code', 'thinking'],
      "quota": 0.5
    },
    {
      "id": 103,
      "model": "Doubao-1.5-lite-32k",
      "points": "byteDance",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": "0.01/次"
    },
    {
      "id": 104,
      "model": "Doubao-1.5-pro-32k",
      "points": "byteDance",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": "0.04/次"
    },
    {
      "id": 105,
      "model": "Doubao-1.5-lite-256k",
      "points": "byteDance",
      "token": "256k",
      "features": ['conversation', 'code'],
      "quota": "0.03/次"
    },
    {
      "id": 106,
      "model": "Doubao-1.5-pro-256k",
      "points": "byteDance",
      "token": "16k",
      "features": ['conversation', 'code'],
      "quota": "0.08/次"
    },
    {
      "id": 107,
      "model": "grok-2",
      "points": "Xai",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 10
    },
    {
      "id": 108,
      "model": "grok-2-mini",
      "points": "Xai",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 5
    },
    {
      "id": 109,
      "model": "grok-2-beta",
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
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 1
    },
    {
      "id": 113,
      "model": "mixtral-8x7b",
      "points": "mixtral",
      "token": "7k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 1
    },
    {
      "id": 114,
      "model": "mixtral-8x7b-instruct",
      "points": "mixtral",
      "token": "32k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 1
    },
    {
      "id": 115,
      "model": "mixtral-8x22b",
      "points": "mixtral",
      "token": "32k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 1
    },
    {
      "id": 116,
      "model": "dolphin-mixtral-8x7b",
      "points": "mixtral",
      "token": "8k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 1
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
      "features": ['conversation', 'code', 'thinking'],
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
    {
      "id": 130,
      "model": "qwen-2.5-7B-instruct",
      "points": "alibaba",
      "token": "32k",
      "features": ['conversation'],
      "quota": 0.5
    },
    {
      "id": 131,
      "model": "qwen-2.5-7B-coder",
      "points": "alibaba",
      "token": "32k",
      "features": ['code'],
      "quota": 0.5
    },
    {
      "id": 132,
      "model": "qwq-32b-preview",
      "points": "alibaba",
      "token": "32k",
      "features": ['conversation', 'code', 'thinking'],
      "quota": 0.5
    },
    {
      "id": 133,
      "model": "internlm-2.5-7b-chat",
      "points": "alibaba",
      "token": "64k",
      "features": ['conversation', 'code'],
      "quota": 0.5
    },
    {
      "id": 134,
      "model": "moonlight-16b-a3b-instruct",
      "points": "moonshot",
      "token": "32k",
      "features": ['conversation'],
      "quota": 0.5
    },
    {
      "id": 135,
      "model": "grok-2-1212",
      "points": "Xai",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": 0.8
    },
    {
      "id": 136,
      "model": "gpt-4.1",
      "points": "OpenAi",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.15/次"
    },
    {
      "id": 137,
      "model": "gpt-4.1-mini",
      "points": "OpenAi",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.06/次"
    },
    {
      "id": 138,
      "model": "gpt-4.1-nano",
      "points": "OpenAi",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.02/次"
    },
    {
      "id": 139,
      "model": "gemma-2-27b-it",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code'],
      "quota": 0.5
    },
    {
      "id": 140,
      "model": "gemma-2-9b-it",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code'],
      "quota": 0.5
    },
    {
      "id": 142,
      "model": "command-light-nightly",
      "points": "Cohere",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": 0.5
    },
    {
      "id": 143,
      "model": "command-r7b-12-2024",
      "points": "Cohere",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": 0.5
    },
    {
      "id": 144,
      "model": "command-nightly",
      "points": "Cohere",
      "token": "4k",
      "features": ['conversation', 'code'],
      "quota": 0.5
    },
    {
      "id": 146,
      "model": "qwq-72b-preview",
      "points": "alibaba",
      "token": "2k",
      "features": ['conversation', 'code', 'thinking', 'image_recognition'],
      "quota": 0.5
    },
    {
      "id": 147,
      "model": "qwen-2.5-vl-7b-instruct",
      "points": "alibaba",
      "token": "2k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 0.5
    },
    {
      "id": 148,
      "model": "command-a-03-2025",
      "points": "Cohere",
      "token": "256k",
      "features": ['conversation', 'code'],
      "quota": 0.5
    },
    {
      "id": 159,
      "model": "noobai-fast",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.04/次"
    },
    {
      "id": 160,
      "model": "jimeng-3.0",
      "points": "Jimeng",
      "token": "8k",
      "features": ["drawing"],
      "quota": 0
    },
    {
      "id": 161,
      "model": "jimeng-2.1",
      "points": "Jimeng",
      "token": "8k",
      "features": ["drawing"],
      "quota": 0
    },
    {
      "id": 162,
      "model": "jimeng-2.0-pro",
      "points": "Jimeng",
      "token": "8k",
      "features": ["drawing"],
      "quota": 0
    },
    {
      "id": 163,
      "model": "jimeng-2.0",
      "points": "Jimeng",
      "token": "8k",
      "features": ["drawing"],
      "quota": 0
    },
    {
      "id": 164,
      "model": "jimeng-xl-pro",
      "points": "Jimeng",
      "token": "8k",
      "features": ["drawing"],
      "quota": 0
    },
    {
      "id": 165,
      "model": "jimeng-video-1.2",
      "points": "Jimeng",
      "token": "8k",
      "features": ["video"],
      "quota": 0
    },
    {
      "id": 166,
      "model": "jimeng-video-s2.0",
      "points": "Jimeng",
      "token": "8k",
      "features": ["video"],
      "quota": 0
    },
    {
      "id": 167,
      "model": "jimeng-video-p2.0-pro",
      "points": "Jimeng",
      "token": "8k",
      "features": ["video"],
      "quota": 0
    },
    {
      "id": 168,
      "model": "jimeng-video-s2.0-pro",
      "points": "Jimeng",
      "token": "8k",
      "features": ["video"],
      "quota": 0
    },
    {
      "id": 173,
      "model": "suno-v4-vip",
      "points": "Suno",
      "token": "1000k",
      "features": ['music'],
      "quota": 0
    },
    {
      "id": 174,
      "model": "gemini-1.5-flash-re",
      "points": "Google",
      "token": "100k",
      "features": ['conversation'],
      "quota": "0.004/次"
    },
    {
      "id": 175,
      "model": "gemini-2.0-flash-re",
      "points": "Google",
      "token": "100k",
      "features": ['conversation'],
      "quota": "0.008/次"
    },
    {
      "id": 176,
      "model": "gemini-2.5-pro-re",
      "points": "Google",
      "token": "100k",
      "features": ['conversation'],
      "quota": "0.01/次"
    },
    {
      "id": 177,
      "model": "qwq-32b",
      "points": "alibaba",
      "token": "128k",
      "features": ['conversation', 'code', 'thinking'],
      "quota": 0.5
    },
    {
      "id": 178,
      "model": "claude-3.5-sonnet-re",
      "points": "Anthropic",
      "token": "100k",
      "features": ['conversation', 'code'],
      "quota": "0.05/次"
    },
    {
      "id": 179,
      "model": "claude-3.7-sonnet-re",
      "points": "Anthropic",
      "token": "100k",
      "features": ['conversation', 'code'],
      "quota": "0.05/次"
    },
    {
      "id": 180,
      "model": "gemma-3-27b-it",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code'],
      "quota": 0.5
    },
    {
      "id": 181,
      "model": "gemini-2.5-flash-preview-04-17",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 0.5
    },
    {
      "id": 182,
      "model": "gemini-2.5-pro-exp-03-25",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 2.5
    },
    {
      "id": 183,
      "model": "reka-flash-3",
      "points": "reka",
      "token": "128k",
      "features": ['conversation', 'code', 'thinking'],
      "quota": 0.5
    },
    {
      "id": 184,
      "model": "qwen-2.5-vl-72b-instruct",
      "points": "alibaba",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": 0.5
    },
    {
      "id": 187,
      "model": "anishadow-v10-fast",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.03/次"
    },
    {
      "id": 188,
      "model": "anishadow-v10-chaomo",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.06/次"
    },
    {
      "id": 189,
      "model": "anishadow-v10-turbo",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.06/次"
    },
    {
      "id": 190,
      "model": "anishadow-v10-plus",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.09/次"
    },
    {
      "id": 191,
      "model": "wai-illustrious-fast",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.03/次"
    },
    {
      "id": 192,
      "model": "wai-illustrious-turbo",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.06/次"
    },
    {
      "id": 193,
      "model": "wai-illustrious-plus",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.09/次"
    },
    {
      "id": 194,
      "model": "wai-noobai-fast",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.03/次"
    },
    {
      "id": 195,
      "model": "wai-noobai-turbo",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.06/次"
    },
    {
      "id": 196,
      "model": "wai-noobai-plus",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.09/次"
    },
    {
      "id": 197,
      "model": "noobai-xl-fast",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.03/次"
    },
    {
      "id": 198,
      "model": "noobai-xl-turbo",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.06/次"
    },
    {
      "id": 199,
      "model": "noobai-xl-plus",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.09/次"
    },
    {
      "id": 200,
      "model": "noobai-xl-v",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.075/次"
    },
    {
      "id": 201,
      "model": "nai-xl",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.075/次"
    },
    {
      "id": 202,
      "model": "novelai-v3-fast",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.06/次"
    },
    {
      "id": 203,
      "model": "novelai-v3-turbo",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.075/次"
    },
    {
      "id": 204,
      "model": "claude-sonnet-4-20250514",
      "points": "Anthropic",
      "token": "100k",
      "features": ['conversation'],
      "quota": 0.5
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