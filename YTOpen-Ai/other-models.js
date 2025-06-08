export const getOptimizedModels = () => {
  const originalModels = [
    {
      "model": "gpt-4o-mini",
      "points": "OpenAI",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": "0.1/4"
    },
    {
      "model": "gpt-4o-mini-2024-07-18",
      "points": "OpenAI",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": "0.1/4"
    },
    {
      "model": "gpt-4",
      "points": "OpenAI",
      "token": "8k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "15/2"
    },
    {
      "model": "gpt-4-32k",
      "points": "OpenAI",
      "token": "32k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "30/2"
    },
    {
      "model": "gpt-4-turbo",
      "points": "OpenAI",
      "token": "32k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "5/3"
    },
    {
      "model": "gpt-4-0125-preview",
      "points": "OpenAI",
      "token": "32k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "5/2"
    },
    {
      "model": "gpt-4-1106-preview",
      "points": "OpenAI",
      "token": "32k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "5/2"
    },
    {
      "model": "gpt-4-vision-preview",
      "points": "OpenAI",
      "token": "32k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "7.5/2"
    },
    {
      "model": "gpt-4-all",
      "points": "OpenAI",
      "token": "32k",
      "features": ['conversation', 'internet', 'drawing', 'code', 'image_recognition'],
      "quota": "15/2"
    },
    {
      "model": "gpt-4o-all",
      "points": "OpenAI",
      "token": "128k",
      "features": ['conversation', 'internet', 'drawing', 'code', 'image_recognition'],
      "quota": "7.5/5"
    },
    {
      "model": "gpt-4o-all-lite",
      "points": "OpenAI",
      "token": "8k",
      "features": ['conversation', 'internet', 'drawing', 'code'],
      "quota": "2.5/4"
    },
    {
      "model": "chatgpt-4o-latest",
      "points": "OpenAI",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "2.5/3"
    },
    {
      "model": "gpt-4o",
      "points": "OpenAI",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "2.5/4"
    },
    {
      "model": "gpt-4o-2024-05-13",
      "points": "OpenAI",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "2.5/3"
    },
    {
      "model": "gpt-4o-2024-08-06",
      "points": "OpenAI",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "1.25/4"
    },
    {
      "model": "gpt-4o-2024-11-20",
      "points": "OpenAI",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "1.25/4"
    },
    {
      "model": "gpt-4.1",
      "points": "OpenAI",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "1/4"
    },
    {
      "model": "gpt-4.1-2025-04-14",
      "points": "OpenAI",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "1/4"
    },
    {
      "model": "gpt-4.1-mini",
      "points": "OpenAI",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.2/4"
    },
    {
      "model": "gpt-4.1-mini-2025-04-14",
      "points": "OpenAI",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.2/4"
    },
    {
      "model": "gpt-4.1-nano",
      "points": "OpenAI",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.05/4"
    },
    {
      "model": "gpt-4.1-nano-2025-04-14",
      "points": "OpenAI",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.05/4"
    },
    {
      "model": "o1-mini",
      "points": "OpenAI",
      "token": "1000k",
      "features": ['conversation', 'code'],
      "quota": "0.15/次"
    },
    {
      "model": "o1-mini-2024-09-12",
      "points": "OpenAI",
      "token": "1000k",
      "features": ['conversation', 'code'],
      "quota": "0.15/次"
    },
    {
      "model": "o3-mini",
      "points": "OpenAI",
      "token": "1000k",
      "features": ['conversation', 'code'],
      "quota": "0.55/4"
    },
    {
      "model": "o3-mini-2025-01-31",
      "points": "OpenAI",
      "token": "1000k",
      "features": ['conversation', 'code'],
      "quota": "0.55/4"
    },
    {
      "model": "gpt-4o-image",
      "points": "OpenAI",
      "token": "32k",
      "features": ['drawing', 'image_recognition'],
      "quota": "0.2/次"
    },
    {
      "model": "gpt-4o-image-vip",
      "points": "OpenAI",
      "token": "32k",
      "features": ['drawing', 'image_recognition'],
      "quota": "0.3/次"
    },
    {
      "model": "gpt-image-1",
      "points": "OpenAI",
      "token": "32k",
      "features": ['drawing', 'image_recognition'],
      "quota": "0.2/次"
    },
    {
      "model": "gpt-image-1-vip",
      "points": "OpenAI",
      "token": "32k",
      "features": ['drawing', 'image_recognition'],
      "quota": "0.3/次"
    },
    {
      "model": "claude-1-100k",
      "points": "Anthropic",
      "token": "100k",
      "features": ['conversation', 'code'],
      "quota": "0.82/1"
    },
    {
      "model": "claude-2",
      "points": "Anthropic",
      "token": "200k",
      "features": ['conversation', 'code'],
      "quota": "5.51/3"
    },
    {
      "model": "claude-3-haiku",
      "points": "Anthropic",
      "token": "200k",
      "features": ['conversation', 'code'],
      "quota": "1/5"
    },
    {
      "model": "claude-3-sonnet",
      "points": "Anthropic",
      "token": "200k",
      "features": ['conversation', 'code'],
      "quota": "2/5"
    },
    {
      "model": "claude-3-opus",
      "points": "Anthropic",
      "token": "200k",
      "features": ['conversation', 'code'],
      "quota": "7.5/5"
    },
    {
      "model": "claude-3.5-sonnet",
      "points": "Anthropic",
      "token": "200k",
      "features": ['conversation', 'code'],
      "quota": "2/5"
    },
    {
      "model": "claude-3-5-sonnet-20241022",
      "points": "Anthropic",
      "token": "200k",
      "features": ['conversation', 'code'],
      "quota": "3/5"
    },
    {
      "model": "claude-3.5-sonnet-poe",
      "points": "Anthropic",
      "token": "200k",
      "features": ['conversation', 'code'],
      "quota": "2/5"
    },
    {
      "model": "code-claude-3.5-sonnet",
      "points": "Anthropic",
      "token": "40k",
      "features": ['conversation', 'code'],
      "quota": "2/5"
    },
    {
      "model": "claude-3.7-sonnet",
      "points": "Anthropic",
      "token": "200k",
      "features": ['conversation', 'code'],
      "quota": "2/5"
    },
    {
      "model": "claude-sonnet-4-20250514",
      "points": "Anthropic",
      "token": "200k",
      "features": ['conversation', 'code', 'thinking'],
      "quota": "3/5"
    },
    {
      "model": "claude-3.5-sonnet-re",
      "points": "Anthropic",
      "token": "100k",
      "features": ['conversation', 'code'],
      "quota": "0.1/次"
    },
    {
      "model": "claude-3.7-sonnet-re",
      "points": "Anthropic",
      "token": "100k",
      "features": ['conversation', 'code'],
      "quota": "0.1/次"
    },
    {
      "model": "gemini-pro",
      "points": "Google",
      "token": "32k",
      "features": ['conversation', 'image_recognition'],
      "quota": "1/3"
    },
    {
      "model": "gemini-pro-vision",
      "points": "Google",
      "token": "32k",
      "features": ['conversation', 'image_recognition'],
      "quota": "2/3"
    },
    {
      "model": "gemini-1.5-flash",
      "points": "Google",
      "token": "32k",
      "features": ['conversation', 'image_recognition'],
      "quota": "0.35/4"
    },
    {
      "model": "gemini-1.5-flash-8b",
      "points": "Google",
      "token": "32k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "1/4"
    },
    {
      "model": "gemini-1.5-flash-latest",
      "points": "Google",
      "token": "100k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.35/4"
    },
    {
      "model": "gemini-1.5-flash-re",
      "points": "Google",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": "0.02/次"
    },
    {
      "model": "gemini-1.5-pro",
      "points": "Google",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "3.5/4"
    },
    {
      "model": "gemini-1.5-pro-001",
      "points": "Google",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "2/4"
    },
    {
      "model": "gemini-1.5-pro-002",
      "points": "Google",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "2/4"
    },
    {
      "model": "gemini-1.5-pro-latest",
      "points": "Google",
      "token": "128k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "3.5/4"
    },
    {
      "model": "gemini-exp-1114",
      "points": "Google",
      "token": "32k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "2/4"
    },
    {
      "model": "gemini-exp-1121",
      "points": "Google",
      "token": "32k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "2/4"
    },
    {
      "model": "gemini-exp-1206",
      "points": "Google",
      "token": "32k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "2/4"
    },
    {
      "model": "gemini-2.0-flash-exp",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.6/4"
    },
    {
      "model": "gemini-2.0-flash",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "1.5/4"
    },
    {
      "model": "gemini-2.0-flash-lite-preview",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.07/4"  
    },
    {
      "model": "gemini-2.0-flash-lite-preview-02-05",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.07/4"    
    },
    {
      "model": "gemini-2.0-flash-re",
      "points": "Google",
      "token": "100k",
      "features": ['conversation', 'code'],
      "quota": "0.03/次"   
    },
    {
      "model": "gemini-2.0-flash-thinking-exp",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition', 'thinking'],
      "quota": "1/4" 
    },
    {
      "model": "gemini-2.0-flash-thinking-exp-01-21",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition', 'thinking'],
      "quota": "1/4" 
    },
    {
      "model": "gemini-2.0-pro-exp",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "1.5/4"
    },
    {
      "model": "gemini-2.0-pro-exp-02-05",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "2.5/4"
    },
    {
      "model": "gemini-2.0-flash-exp-image-generation",
      "points": "Google",
      "token": "1000k",
      "features": ['drawing', 'image_recognition'],
      "quota": 0
    },
    {
      "model": "gemini-2.0-flash-net",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'internet', 'code', 'image_recognition'],
      "quota": 0
    },
    {
      "model": "gemini-2.5-flash-preview-04-17",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'internet', 'code', 'image_recognition'],
      "quota": "0.15/4"
    },
    {
      "model": "gemini-2.5-flash-preview-05-20",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'internet', 'code', 'image_recognition'],
      "quota": "0.3/4"
    },
    {
      "model": "gemini-2.5-pro-exp-03-25",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'internet', 'code', 'image_recognition'],
      "quota": "1.25/4"
    },
    {
      "model": "gemini-2.5-pro-preview-05-06",
      "points": "Google",
      "token": "1000k",
      "features": ['conversation', 'internet', 'code', 'image_recognition'],
      "quota": "1.5/8"
    },
    {
      "model": "gemini-2.5-pro-re",
      "points": "Google",
      "token": "100k",
      "features": ['conversation', 'code'],
      "quota": "0.05/次"
    },
    {
      "model": "gemma-3-27b-it",
      "points": "Google",
      "token": "64k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.02/次"
    },
    {
      "model": "command-r",
      "points": "Cohere",
      "token": "128k",
      "features": ['conversation'],
      "quota": "0.25/3"
    },
    {
      "model": "command-r-plus",
      "points": "Cohere",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": "1.5/5"
    },
    {
      "model": "command-r-plus-04-2024",
      "points": "Cohere",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": "2/4"
    },
    {
      "model": "command-r7b-12-2024",
      "points": "Cohere",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": "2/4"
    },
    {
      "model": "command-a-03-2025",
      "points": "Cohere",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": "2/4"
    },
    {
      "model": "command-light",
      "points": "Cohere",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": "0.5/4"
    },
    {
      "model": "command-light-nightly",
      "points": "Cohere",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": "0.5/4"
    },
    {
      "model": "command-nightly",
      "points": "Cohere",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": "0.5/4"
    },
    {
      "model": "code-llama-34b",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": "1/1"
    },
    {
      "model": "codellama-70b-instruct",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": "1/1"
    },
    {
      "model": "llama-2-70b",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": "1/1"
    },
    {
      "model": "llama-3-70b",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": "2/1"
    },
    {
      "model": "llama-3-search",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation','internet'],
      "quota": "0.25/4"
    },
    {
      "model": "llama-3-sonar-small-32k-chat",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": "0.5/4"
    },
    {
      "model": "llama-3-sonar-large-32k-chat",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": "1/4"
    },
    {
      "model": "llama-3-sonar-small-32k-online",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": "0.5/4"
    },
    {
      "model": "llama-3-sonar-large-32k-online",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": "1/4"
    },
    {
      "model": "llama-3.1-405b",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": "3/1"
    },
    {
      "model": "llama-3.2-1b-instruct",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": "0.25/1"
    },
    {
      "model": "llama-3.2-3b-instruct",
      "points": "Meta",
      "token": "32k",
      "features": ['conversation'],
      "quota": "0.5/1"
    },
    {
      "model": "llama-4-scout",
      "points": "Meta",
      "token": "1000k",
      "features": ['conversation'],
      "quota": "1/4"
    },
    {
      "model": "llama-4-scout-re",
      "points": "Meta",
      "token": "1000k",
      "features": ['conversation'],
      "quota": "0.03/次"
    },
    {
      "model": "llama-4-maverick",
      "points": "Meta",
      "token": "1000k",
      "features": ['conversation'],
      "quota": "2/4"
    },
    {
      "model": "llama-4-maverick-re",
      "points": "Meta",
      "token": "1000k",
      "features": ['conversation'],
      "quota": "0.06/次"
    },
    {
      "model": "moonshot-v1-8k",
      "points": "Meta",
      "token": "moonshot",
      "features": ['conversation'],
      "quota": "0.85/0.85"
    },
    {
      "model": "moonshot-v1-32k",
      "points": "moonshot",
      "token": "32k",
      "features": ['conversation'],
      "quota": "1.7/1.7"
    },
    {
      "model": "moonshot-v1-128k",
      "points": "moonshot",
      "token": "128k",
      "features": ['conversation'],
      "quota": "4.2/4.2"
    },
    {
      "model": "moonlight-16b-a3b-instruct",
      "points": "moonshot",
      "token": "128k",
      "features": ['conversation'],
      "quota": "1/1"
    },
    {
      "model": "deepseek-chat",
      "points": "deepseek",
      "token": "32k",
      "features": ['conversation', "code"],
      "quota": "0.5/4"
    },
    {
      "model": "deepseek-v3",
      "points": "deepseek",
      "token": "64k",
      "features": ['conversation', "code"],
      "quota": "0.4/4"
    },
    {
      "model": "deepseek-v3-0324",
      "points": "deepseek",
      "token": "64k",
      "features": ['conversation', "code"],
      "quota": "0.4/4"
    },
    {
      "model": "deepseek-chat-v3-0324",
      "points": "deepseek",
      "token": "64k",
      "features": ['conversation', "code"],
      "quota": "0.8/4"
    },
    {
      "model": "deepseek-prover-v2-671b",
      "points": "deepseek",
      "token": "64k",
      "features": ["code"],
      "quota": "0.4/4"
    },
    {
      "model": "deepseek-r1",
      "points": "deepseek",
      "token": "64k",
      "features": ['conversation', "code"],
      "quota": "0.82/4"
    },
    {
      "model": "mai-deepseek-r1-fp8",
      "points": "deepseek",
      "token": "64k",
      "features": ['conversation', "code"],
      "quota": "0.6/4"
    },
    {
      "model": "deepseek-r1-0528",
      "points": "deepseek",
      "token": "64k",
      "features": ['conversation', "code"],
      "quota": "0.82/4"
    },
    {
      "model": "deepseek-r1-0528-qwen3",
      "points": "deepseek",
      "token": "64k",
      "features": ['conversation', "code"],
      "quota": "0.6/4"
    },
    {
      "model": "deepseek-reasoner",
      "points": "deepseek",
      "token": "64k",
      "features": ['conversation', "code"],
      "quota": "0.82/4"
    },
    {
      "model": "Doubao-1.5-lite-32k",
      "points": "byteDance",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": "0.15/2"
    },
    {
      "model": "Doubao-1.5-pro-32k",
      "points": "byteDance",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": "0.4/2.5"
    },
    {
      "model": "Doubao-1.5-pro-256k",
      "points": "byteDance",
      "token": "256k",
      "features": ['conversation', 'code'],
      "quota": "2.5/1.8"
    },
    {
      "model": "grok-beta",
      "points": "Xai",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": "1/4"
    },
    {
      "model": "grok-2-1212",
      "points": "Xai",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": "1/4"
    },
    {
      "model": "grok-3",
      "points": "Xai",
      "token": "128k",
      "features": ['conversation', 'code', 'internet'],
      "quota": "2/5"
    },
    {
      "model": "grok-3-think",
      "points": "Xai",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": "2/5"
    },
    {
      "model": "open-mistral-7b",
      "points": "mistral",
      "token": "8k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.12/3"
    },
    {
      "model": "open-mixtral-8x7b",
      "points": "mixtral",
      "token": "32k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "0.35/3"
    },
    {
      "model": "open-mixtral-8x22b",
      "points": "mixtral",
      "token": "32k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "1/3"
    },
    {
      "model": "open-mixtral-8x22b-2404",
      "points": "mixtral",
      "token": "32k",
      "features": ['conversation', 'code', 'image_recognition'],
      "quota": "1/3"
    },
    {
      "model": "mistral-tiny-latest",
      "points": "mistral",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": "0.5/3"
    },
    {
      "model": "ministral-3b-2410",
      "points": "mistral",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": "0.4/3"
    },
    {
      "model": "ministral-3b-latest",
      "points": "mistral",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": "0.4/3"
    },
    {
      "model": "ministral-8b-2410",
      "points": "mistral",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": "0.5/3"
    },
    {
      "model": "ministral-8b-latest",
      "points": "mistral",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": "0.5/3"
    },
    {
      "model": "mistral-small-latest",
      "points": "mistral",
      "token": "32k",
      "features": ['conversation', 'code'],
      "quota": "1/3"
    },
    {
      "model": "mistral-medium-latest",
      "points": "mistral",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": "1.35/3"
    },
    {
      "model": "mistral-medium-2312",
      "points": "mistral",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": "2/3"
    },
    {
      "model": "mistral-medium-2505",
      "points": "mistral",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": "1.35/3"
    },
    {
      "model": "mistral-medium",
      "points": "mistral",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": "1/3"
    },
    {
      "model": "mistral-large-latest",
      "points": "mistral",
      "token": "131k",
      "features": ['conversation', 'code', 'thinking'],
      "quota": "4/3"
    },
    {
      "model": "mistral-large-2402",
      "points": "mistral",
      "token": "131k",
      "features": ['conversation', 'code', 'thinking'],
      "quota": "3/3"
    },
    {
      "model": "mistral-large-2407",
      "points": "mistral",
      "token": "131k",
      "features": ['conversation', 'code', 'thinking'],
      "quota": "3/3"
    },
    {
      "model": "mistral-large-2411",
      "points": "mistral",
      "token": "131k",
      "features": ['conversation', 'code', 'thinking'],
      "quota": "3/3"
    },
    {
      "model": "mistral-saba-2502",
      "points": "mistral",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": "0.5/3"
    },
    {
      "model": "mistral-saba-latest",
      "points": "mistral",
      "token": "128k",
      "features": ['conversation', 'code'],
      "quota": "0.5/3"
    },
    {
      "model": "codestral-latest",
      "points": "mistral",
      "token": "64k",
      "features": ['code'],
      "quota": "2/2"
    },
    {
      "model": "codestral-2405",
      "points": "mistral",
      "token": "64k",
      "features": ['code'],
      "quota": "2/2"
    },
    {
      "model": "codestral-2411-rc5",
      "points": "mistral",
      "token": "64k",
      "features": ['code'],
      "quota": "2/2"
    },
    {
      "model": "codestral-2412",
      "points": "mistral",
      "token": "64k",
      "features": ['code'],
      "quota": "2/2"
    },
    {
      "model": "codestral-2501",
      "points": "mistral",
      "token": "64k",
      "features": ['code'],
      "quota": "2/2"
    },
    {
      "model": "pixtral-12b",
      "points": "mistral",
      "token": "131k",
      "features": ['conversation', 'image_recognition'],
      "quota": "1/4"
    },
    {
      "model": "pixtral-12b-latest",
      "points": "mistral",
      "token": "131k",
      "features": ['conversation', 'image_recognition'],
      "quota": "1/4"
    },
    {
      "model": "pixtral-large-2411",
      "points": "mistral",
      "token": "131k",
      "features": ['conversation', 'image_recognition'],
      "quota": "4/4"
    },
    {
      "model": "pixtral-large-latest",
      "points": "mistral",
      "token": "131k",
      "features": ['conversation', 'image_recognition'],
      "quota": "4/4"
    },
    {
      "model": "qwen-2.5-vl-7b-instruct",
      "points": "alibaba",
      "token": "32k",
      "features": ['conversation', 'image_recognition'],
      "quota": "1/4"
    },
    {
      "model": "qwen-2.5-vl-72b-instruct",
      "points": "alibaba",
      "token": "32k",
      "features": ['conversation', 'image_recognition'],
      "quota": "2/3"
    },
    {
      "model": "qwq-32b-preview",
      "points": "alibaba",
      "token": "128k",
      "features": ['conversation', 'code', 'thinking'],
      "quota": "0.8/0.8"
    },
    {
      "model": "qwq-32b",
      "points": "alibaba",
      "token": "128k",
      "features": ['conversation', 'code', 'thinking'],
      "quota": "0.8/0.8"
    },
    {
      "model": "qwq-32b-arliai-rpr-v1",
      "points": "alibaba",
      "token": "128k",
      "features": ['conversation', 'code', 'thinking'],
      "quota": "2/1"
    },
    {
      "model": "jimeng-3.0",
      "points": "Jimeng",
      "token": "8k",
      "features": ["drawing"],
      "quota": 0
    },
    {
      "model": "jimeng-2.1",
      "points": "Jimeng",
      "token": "8k",
      "features": ["drawing"],
      "quota": 0
    },
    {
      "model": "jimeng-2.0-pro",
      "points": "Jimeng",
      "token": "8k",
      "features": ["drawing"],
      "quota": 0
    },
    {
      "model": "jimeng-2.0",
      "points": "Jimeng",
      "token": "8k",
      "features": ["drawing"],
      "quota": 0
    },
    {
      "model": "jimeng-xl-pro",
      "points": "Jimeng",
      "token": "8k",
      "features": ["drawing"],
      "quota": 0
    },
    {
      "model": "jimeng-video-1.2",
      "points": "Jimeng",
      "token": "8k",
      "features": ["video"],
      "quota": 0
    },
    {
      "model": "jimeng-video-s2.0",
      "points": "Jimeng",
      "token": "8k",
      "features": ["video"],
      "quota": 0
    },
    {
      "model": "jimeng-video-p2.0-pro",
      "points": "Jimeng",
      "token": "8k",
      "features": ["video"],
      "quota": 0
    },
    {
      "model": "jimeng-video-s2.0-pro",
      "points": "Jimeng",
      "token": "8k",
      "features": ["video"],
      "quota": 0
    },
    {
      "model": "suno-v4-vip",
      "points": "Suno",
      "token": "1000k",
      "features": ['music'],
      "quota": 0
    },
    {
      "model": "lumensculptor-v1-fast",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.05/次"
    },
    {
      "model": "lumensculptor-v1-turbo",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.08/次"
    },
    {
      "model": "lumensculptor-v1-plus",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.1/次"
    },
    {
      "model": "luminaArchitect-v1-fast",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.05/次"
    },
    {
      "model": "luminaArchitect-v1-turbo",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.08/次"
    },
    {
      "model": "luminaArchitect-v1-plus",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.1/次"
    },
    {
      "model": "naishadow-v1-fast",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.05/次"
    },
    {
      "model": "naishadow-v1-turbo",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.08/次"
    },
    {
      "model": "naishadow-v1-plus",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.1/次"
    },
    {
      "model": "anishadow-v10-fast",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.05/次"
    },
    {
      "model": "anishadow-v10-turbo",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.08/次"
    },
    {
      "model": "anishadow-v10-plus",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.1/次"
    },
    {
      "model": "wai-illustrious-fast",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.05/次"
    },
    {
      "model": "wai-illustrious-turbo",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.08/次"
    },
    {
      "model": "wai-illustrious-plus",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.1/次"
    },
    {
      "model": "wai-noobai-fast",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.05/次"
    },
    {
      "model": "wai-noobai-turbo",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.08/次"
    },
    {
      "model": "wai-noobai-plus",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.1/次"
    },
    {
      "model": "noobai-xl-fast",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.05/次"
    },
    {
      "model": "noobai-xl-turbo",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.08/次"
    },
    {
      "model": "noobai-xl-plus",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.1/次"
    },
    {
      "model": "noobai-xl-v",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.075/次"
    },
    {
      "model": "novelai-v3-fast",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.05/次"
    },
    {
      "model": "novelai-v3-turbo",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.075/次"
    },
    {
      "model": "noobai-fast",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.03/次"
    },
    {
      "model": "shadowforge-naixl",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.001/次"
    },
    {
      "model": "kusa-image-generator",
      "points": "Noobai",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.001/次"
    },
    {
      "model": "flux-kontext-edit",
      "points": "flux",
      "token": "8k",
      "features": ['drawing','image_recognition'],
      "quota": "0.25/次"
    },
    {
      "model": "flux-kontext-edit-pro",
      "points": "flux",
      "token": "8k",
      "features": ['drawing','image_recognition'],
      "quota": "0.4/次"
    },
    {
      "model": "flux-kontext-edit-pro-max",
      "points": "flux",
      "token": "8k",
      "features": ['drawing','image_recognition'],
      "quota": "0.5/次"
    },
    {
      "model": "flux-pro-kontext",
      "points": "flux",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.25/次"
    },
    {
      "model": "flux-kontext-pro-max",
      "points": "flux",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.5/次"
    },
    {
      "model": "ideogram-turbo",
      "points": "flux",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.2/次"
    },
    {
      "model": "flux-schnell",
      "points": "flux",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.03/次"
    },
    {
      "model": "google-imagen4",
      "points": "Google",
      "token": "8k",
      "features": ['drawing'],
      "quota": "0.6/次"
    },
    {
      "model": "reka-3-flash",
      "points": "reka",
      "token": "128k",
      "features": ['conversation', 'code', 'thinking'],
      "quota": "1/1"
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