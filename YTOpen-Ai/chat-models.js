export const getOptimizedModels = () => {
  // 原始模型数据
  const originalModels = [
    {
      "id": "1",
      "name": "gpt-3.5-turbo",
      "token_count": "4k",
      "Magnification": 0.75,
      "provider": "OpenAi",
      "features": ['conversation']
    },
    {
      "id": "2",
      "name": "gpt-3.5-turbo-0301",
      "token_count": "4k",
      "Magnification": 0.75,
      "provider": "OpenAi",
      "features": ['conversation']
    },
    {
      "id": "3",
      "name": "gpt-3.5-turbo-0613",
      "token_count": "4k",
      "Magnification": 0.75,
      "provider": "OpenAi",
      "features": ['conversation']
    },
    {
      "id": "4",
      "name": "gpt-3.5-turbo-1106",
      "token_count": "4k",
      "Magnification": 0.75,
      "provider": "OpenAi",
      "features": ['conversation']
    },
    {
      "id": "5",
      "name": "gpt-3.5-turbo-instruct",
      "token_count": "4k",
      "Magnification": 0.75,
      "provider": "OpenAi",
      "features": ['conversation']
    },
    {
      "id": "6",
      "name": "gpt-3.5-turbo-16k",
      "token_count": "16k",
      "Magnification": 1.5,
      "provider": "OpenAi",
      "features": ['conversation']
    },
    {
      "id": "7",
      "name": "gpt-3.5-turbo-16k-0613",
      "token_count": "16k",
      "Magnification": 1.5,
      "provider": "OpenAi",
      "features": ['conversation']
    },
    {
      "id": "8",
      "name": "gpt-4",
      "token_count": "8k",
      "Magnification": 15,
      "provider": "OpenAi",
      "features": ['conversation']
    },
    {
      "id": "9",
      "name": "gpt-4-0314",
      "token_count": "8k",
      "Magnification": 15,
      "provider": "OpenAi",
      "features": ['conversation']
    },
    {
      "id": "10",
      "name": "gpt-4-0613",
      "token_count": "8k",
      "Magnification": 15,
      "provider": "OpenAi",
      "features": ['conversation']
    },
    {
      "id": "11",
      "name": "gpt-4-32k",
      "token_count": "32k",
      "Magnification": 30,
      "provider": "OpenAi",
      "features": ['conversation']
    },
    {
      "id": "12",
      "name": "gpt-4-32k-0314",
      "token_count": "32k",
      "Magnification": 30,
      "provider": "OpenAi",
      "features": ['conversation']
    },
    {
      "id": "13",
      "name": "gpt-4-32k-0613",
      "token_count": "32k",
      "Magnification": 30,
      "provider": "OpenAi",
      "features": ['conversation']
    },
    {
      "id": "14",
      "name": "gpt-4-1106-preview",
      "token_count": "128k",
      "Magnification": 5,
      "provider": "OpenAi",
      "features": ['conversation']
    },
    {
      "id": "15",
      "name": "gpt-4-0125-preview",
      "token_count": "128k",
      "Magnification": 5,
      "provider": "OpenAi",
      "features": ['conversation']
    },
    {
      "id": "16",
      "name": "gpt-4-turbo-preview",
      "token_count": "128k",
      "Magnification": 5,
      "provider": "OpenAi",
      "features": ['conversation']
    },
    {
      "id": "17",
      "name": "gpt-4-turbo-2024-04-09",
      "token_count": "128k",
      "Magnification": 5,
      "provider": "OpenAi",
      "features": ['conversation']
    },
    {
      "id": "18",
      "name": "gpt-4o-mini",
      "token_count": "128k",
      "Magnification": 0.07,
      "provider": "OpenAi",
      "features": ['conversation']
    },
    {
      "id": "19",
      "name": "gpt-4-all",
      "token_count": "128k",
      "Magnification": 15,
      "provider": "OpenAi",
      "features": ['conversation', 'code', 'drawing', 'internet', 'file', 'image_recognition']
    },
    {
      "id": "20",
      "name": "gpt-4o",
      "token_count": "128k",
      "Magnification": 2.5,
      "provider": "OpenAi",
      "features": ['conversation', 'code', 'internet', 'image_recognition']
    },
    {
      "id": "21",
      "name": "gpt-4o-2024-05-13",
      "token_count": "128k",
      "Magnification": 2.5,
      "provider": "OpenAi",
      "features": ['conversation', 'code']
    },
    {
      "id": "22",
      "name": "gpt-4o-2024-08-06",
      "token_count": "128k",
      "Magnification": 1.25,
      "provider": "OpenAi",
      "features": ['conversation', 'code']
    },
    {
      "id": "23",
      "name": "chatgpt-4o-latest",
      "token_count": "128k",
      "Magnification": 1.25,
      "provider": "OpenAi",
      "features": ['conversation', 'code']
    },
    {
      "id": "24",
      "name": "gpt-4o-all",
      "token_count": "128k",
      "Magnification": 2.5,
      "provider": "OpenAi",
      "features": ['conversation', 'code', 'drawing', 'internet', 'file', 'image_recognition']
    },
    {
      "id": "25",
      "name": "gpt-4-dalle",
      "token_count": "128k",
      "Magnification": 15,
      "provider": "OpenAi",
      "features": ['conversation', 'code', 'drawing', 'internet', 'file', 'image_recognition']
    },
    {
      "id": "26",
      "name": "gpt-4-v",
      "token_count": "128k",
      "Magnification": 15,
      "provider": "OpenAi",
      "features": ['conversation', 'code', 'drawing', 'internet', 'file', 'image_recognition']
    },
    {
      "id": "27",
      "name": "gpt-4-search",
      "token_count": "4k",
      "Magnification": 15,
      "provider": "OpenAi",
      "features": ['conversation', 'internet', 'image_recognition']
    },
    {
      "id": "28",
      "name": "gpt-4o-search",
      "token_count": "4k",
      "Magnification": 2.5,
      "provider": "OpenAi",
      "features": ['conversation', 'internet', 'image_recognition']
    },
    // Anthropic Claude Models
    {
      "id": "29",
      "name": "claude-1-100k",
      "token_count": "100k",
      "Magnification": 1,
      "provider": "Anthropic",
      "features": ['conversation']
    },
    {
      "id": "30",
      "name": "claude-2",
      "token_count": "200k",
      "Magnification": 5,
      "provider": "Anthropic",
      "features": ['conversation']
    },
    {
      "id": "31",
      "name": "claude-3-haiku-20240307",
      "token_count": "200k",
      "Magnification": 0.5,
      "provider": "Anthropic",
      "features": ['conversation']
    },
    {
      "id": "32",
      "name": "claude-3-sonnet-20240229",
      "token_count": "200k",
      "Magnification": 1.5,
      "provider": "Anthropic",
      "features": ['conversation']
    },
    {
      "id": "33",
      "name": "claude-3-opus-20240229",
      "token_count": "200k",
      "Magnification": 7.5,
      "provider": "Anthropic",
      "features": ['conversation', 'code', 'image_recognition']
    },
    {
      "id": "34",
      "name": "claude-3-5-sonnet-20240620",
      "token_count": "200k",
      "Magnification": 2.5,
      "provider": "Anthropic",
      "features": ['conversation', 'code', 'image_recognition']
    },
    {
      "id": "35",
      "name": "claude-3-5-sonnet-all",
      "token_count": "200k",
      "Magnification": '0.2/次',
      "provider": "Anthropic",
      "features": ['conversation', 'code', 'image_recognition', 'file']
    },
    {
      "id": "36",
      "name": "claude-3-5-sonnet-20241022",
      "token_count": "200k",
      "Magnification": 12,
      "provider": "Anthropic",
      "features": ['conversation', 'code', 'image_recognition']
    },
    // Meta LLaMA Models
    {
      "id": "37",
      "name": "llama-2-7b",
      "token_count": "7k",
      "Magnification": 1,
      "provider": "meta",
      "features": ['conversation']
    },
    {
      "id": "38",
      "name": "llama-2-13b",
      "token_count": "32k",
      "Magnification": 1,
      "provider": "meta",
      "features": ['conversation']
    },
    {
      "id": "39",
      "name": "llama-2-70b",
      "token_count": "32k",
      "Magnification": 1,
      "provider": "meta",
      "features": ['conversation']
    },
    {
      "id": "40",
      "name": "llama-3-sonar-small-online",
      "token_count": "8k",
      "Magnification": 1,
      "provider": "meta",
      "features": ['conversation']
    },
    {
      "id": "41",
      "name": "llama-3-sonar-medium-online",
      "token_count": "32k",
      "Magnification": 1,
      "provider": "meta",
      "features": ['conversation']
    },
    {
      "id": "42",
      "name": "llama-3-sonar-small-chat",
      "token_count": "8k",
      "Magnification": 1,
      "provider": "meta",
      "features": ['conversation']
    },
    {
      "id": "43",
      "name": "llama-3-sonar-medium-chat",
      "token_count": "32k",
      "Magnification": 1,
      "provider": "meta",
      "features": ['conversation']
    },
    {
      "id": "44",
      "name": "llama-3-8b",
      "token_count": "8k",
      "Magnification": 2,
      "provider": "meta",
      "features": ['conversation']
    },
    {
      "id": "45",
      "name": "llama-3-70b",
      "token_count": "32k",
      "Magnification": 2,
      "provider": "meta",
      "features": ['conversation']
    },
    {
      "id": "46",
      "name": "llama-3.2-1b-instruct",
      "token_count": "32k",
      "Magnification": 0.25,
      "provider": "meta",
      "features": ['conversation', 'code']
    },
    {
      "id": "47",
      "name": "llama-3.2-3b-instruct",
      "token_count": "32k",
      "Magnification": 0.5,
      "provider": "meta",
      "features": ['conversation', 'code']
    },
    {
      "id": "48",
      "name": "llama-3.2-11b-vision-instruct",
      "token_count": "32k",
      "Magnification": 1,
      "provider": "meta",
      "features": ['conversation', 'code', 'image_recognition']
    },
    {
      "id": "49",
      "name": "llama-3.2-90b-vision-instruct",
      "token_count": "32k",
      "Magnification": 1,
      "provider": "meta",
      "features": ['conversation', 'code', 'image_recognition']
    },
    // Code LLaMA Models
    {
      "id": "50",
      "name": "code-llama-7b",
      "token_count": "7k",
      "Magnification": 1,
      "provider": "meta",
      "features": ['conversation', 'code']
    },
    {
      "id": "51",
      "name": "code-llama-13b",
      "token_count": "32k",
      "Magnification": 1,
      "provider": "meta",
      "features": ['conversation', 'code']
    },
    {
      "id": "52",
      "name": "code-llama-34b",
      "token_count": "34k",
      "Magnification": 1,
      "provider": "meta",
      "features": ['conversation', 'code']
    },
    {
      "id": "53",
      "name": "codellama-70b-instruct",
      "token_count": "7k",
      "Magnification": 1,
      "provider": "meta",
      "features": ['conversation', 'code']
    },
    // Mixtral Models
    {
      "id": "54",
      "name": "mixtral-8x7b",
      "token_count": "200k",
      "Magnification": 1.5,
      "provider": "mistral",
      "features": ['conversation']
    },
    {
      "id": "55",
      "name": "mixtral-8x7b-instruct",
      "token_count": "8k",
      "Magnification": 1,
      "provider": "mistral",
      "features": ['conversation']
    },
    {
      "id": "56",
      "name": "mixtral-8x22b",
      "token_count": "8k",
      "Magnification": 1,
      "provider": "mistral",
      "features": ['conversation']
    },
    // Gemini Models
    {
      "id": "57",
      "name": "gemini-pro",
      "token_count": "32k",
      "Magnification": 1,
      "provider": "Google",
      "features": ['conversation', 'image_recognition']
    },
    {
      "id": "58",
      "name": "gemini-pro-vision",
      "token_count": "32k",
      "Magnification": 2,
      "provider": "Google",
      "features": ['conversation', 'image_recognition']
    },
    {
      "id": "59",
      "name": "gemini-1.5-pro",
      "token_count": "1000k",
      "Magnification": 3.5,
      "provider": "Google",
      "features": ['conversation', 'image_recognition']
    },
    {
      "id": "60",
      "name": "gemini-1.5-flash",
      "token_count": "1000k",
      "Magnification": 0.35,
      "provider": "Google",
      "features": ['conversation', 'image_recognition']
    },
    {
      "id": "61",
      "name": "gemini-1.5-pro-exp-0801",
      "token_count": "1000k",
      "Magnification": 1.75,
      "provider": "Google",
      "features": ['conversation', 'image_recognition']
    },
    {
      "id": "62",
      "name": "gemini-1.5-pro-exp-0827",
      "token_count": "1000k",
      "Magnification": 1.75,
      "provider": "Google",
      "features": ['conversation', 'image_recognition']
    },
    {
      "id": "63",
      "name": "gemini-1.5-pro-001",
      "token_count": "1000k",
      "Magnification": 2,
      "provider": "Google",
      "features": ['conversation', 'image_recognition']
    },
    {
      "id": "64",
      "name": "gemini-1.5-pro-002",
      "token_count": "1000k",
      "Magnification": 2,
      "provider": "Google",
      "features": ['conversation', 'image_recognition']
    },
    // GLM Models
    {
      "id": "65",
      "name": "glm-3-turbo",
      "token_count": "128k",
      "Magnification": 0.75,
      "provider": "chatglm",
      "features": ['conversation']
    },
    {
      "id": "66",
      "name": "glm-4",
      "token_count": "128k",
      "Magnification": 15,
      "provider": "chatglm",
      "features": ['conversation']
    },
    {
      "id": "67",
      "name": "glm-4v",
      "token_count": "2k",
      "Magnification": 7.1,
      "provider": "chatglm",
      "features": ['conversation', 'image_recognition']
    },
    {
      "id": "68",
      "name": "glm-4-0520",
      "token_count": "128k",
      "Magnification": 15,
      "provider": "chatglm",
      "features": ['conversation', 'code']
    },
    {
      "id": "69",
      "name": "glm-4-air",
      "token_count": "128k",
      "Magnification": 1.5,
      "provider": "chatglm",
      "features": ['conversation', 'code']
    },
    {
      "id": "70",
      "name": "glm-4-airx",
      "token_count": "128k",
      "Magnification": 0.15,
      "provider": "chatglm",
      "features": ['conversation', 'code']
    },
    {
      "id": "71",
      "name": "glm-4-flash",
      "token_count": "128k",
      "Magnification": 0.01,
      "provider": "chatglm",
      "features": ['conversation', 'code']
    },
    // Suno Models
    {
      "id": "72",
      "name": "suno-v3",
      "token_count": "2k",
      "Magnification": '0.15/次',
      "provider": "suno",
      "features": ['music']
    },
    {
      "id": "73",
      "name": "suno-v3.5",
      "token_count": "2k",
      "Magnification": '0.15/次',
      "provider": "suno",
      "features": ['music']
    },
    // LLaVA Models
    {
      "id": "74",
      "name": "llava-v1.5-7b-wrapper",
      "token_count": "7k",
      "Magnification": 1,
      "provider": "llava",
      "features": ['conversation']
    },
    {
      "id": "75",
      "name": "llava-v1.6-34b",
      "token_count": "32k",
      "Magnification": 1,
      "provider": "llava",
      "features": ['conversation']
    },
    // Gemini All Models
    {
      "id": "76",
      "name": "gemma-2b-it",
      "token_count": "4k",
      "Magnification": 1,
      "provider": "Google",
      "features": ['conversation']
    },
    {
      "id": "77",
      "name": "gemma-7b-it",
      "token_count": "7k",
      "Magnification": 1,
      "provider": "Google",
      "features": ['conversation']
    },
    // Other Models
    {
      "id": "78",
      "name": "o1-mini",
      "token_count": "128k",
      "Magnification": "0.15/次",
      "provider": "OpenAi",
      "features": ['conversation', 'code', 'image_recognition', 'thinking']
    },
    {
      "id": "79",
      "name": "o1-mini-20240912",
      "token_count": "128k",
      "Magnification": "0.15/次",
      "provider": "OpenAi",
      "features": ['conversation', 'code', 'image_recognition', 'thinking']
    },
    {
      "id": "80",
      "name": "o1-mini-all",
      "token_count": "128k",
      "Magnification": "0.15/次",
      "provider": "OpenAi",
      "features": ['conversation', 'code', 'drawing', 'image_recognition', 'file', 'thinking']
    },
    {
      "id": "81",
      "name": "o1-preview",
      "token_count": "128k",
      "Magnification": "0.6/次",
      "provider": "OpenAi",
      "features": ['conversation', 'code', 'image_recognition', 'thinking']
    },
    {
      "id": "82",
      "name": "o1-preview-20240912",
      "token_count": "128k",
      "Magnification": "0.6/次",
      "provider": "OpenAi",
      "features": ['conversation', 'code', 'image_recognition', 'thinking']
    },
    {
      "id": "83",
      "name": "o1-preview-all",
      "token_count": "128k",
      "Magnification": "0.6/次",
      "provider": "OpenAi",
      "features": ['conversation', 'code', 'drawing', 'image_recognition', 'file', 'thinking']
    },
    {
      "id": "84",
      "name": "mj-chat",
      "token_count": "32k",
      "Magnification": "0.5/次",
      "provider": "midjourney",
      "features": ['drawing']
    },
    {
      "id": "85",
      "name": "luma-video",
      "token_count": "28k",
      "Magnification": '0.1/次',
      "provider": "luma",
      "features": ['video']
    },
    {
      "id": "86",
      "name": "stable-diffusion-3-2b",
      "token_count": "0.8k",
      "Magnification": '0.007/次',
      "provider": "stable-diffusion",
      "features": ['drawing']
    },
    {
      "id": "87",
      "name": "playground-v2.5",
      "token_count": "0.8k",
      "Magnification": '0.007/次',
      "provider": "playground",
      "features": ['drawing']
    },
    {
      "id": "88",
      "name": "runway-video",
      "token_count": "0.8k",
      "Magnification": '0.2/次',
      "provider": "runway",
      "features": ['video']
    },
    {
      "id": "89",
      "name": "ideogram",
      "token_count": "0.8k",
      "Magnification": '0.03/次',
      "provider": "ideogram",
      "features": ['drawing']
    },
    {
      "id": "90",
      "name": "advanced-voice",
      "token_count": "32k",
      "Magnification": '2.0/次',
      "provider": "OpenAi",
      "features": ['realtime']
    },
    {
      "id": "91",
      "name": "gemini-pro",
      "token_count": "32k",
      "Magnification": 1,
      "provider": "Google",
      "features": ['conversation', 'image_recognition']
    },
    {
      "id": "92",
      "name": "gemini-pro-vision",
      "token_count": "32k",
      "Magnification": 2,
      "provider": "Google",
      "features": ['conversation', 'image_recognition']
    },
    {
      "id": "93",
      "name": "yi-large",
      "token_count": "32k",
      "Magnification": 1,
      "provider": "零一万物",
      "features": ['conversation', 'internet']
    },
    {
      "id": "94",
      "name": "qwen2.5-72b-instruct",
      "token_count": "32k",
      "Magnification": 0.45,
      "provider": "通义千问",
      "features": ['conversation', 'internet']
    },
    {
      "id": "95",
      "name": "mixtral-moe-8x7b-instruct",
      "token_count": "32k",
      "Magnification": 0.45,
      "provider": "mistral",
      "features": ['conversation', 'internet']
    },
    {
      "id": "96",
      "name": "mixtral-moe-8x7b-instruct-hf",
      "token_count": "32k",
      "Magnification": 0.45,
      "provider": "mistral",
      "features": ['conversation', 'internet']
    },
    {
      "id": "97",
      "name": "mixtral-moe-8x22b-instruct",
      "token_count": "32k",
      "Magnification": 1,
      "provider": "mistral",
      "features": ['conversation', 'internet']
    },
    {
      "id": "98",
      "name": "flux-1-dev-fp8",
      "token_count": "0.8k",
      "Magnification": "0.01/次",
      "provider": "BlackForestLabs",
      "features": ['drawing']
    },
    {
      "id": "99",
      "name": "flux-1-schnell-fp8",
      "token_count": "0.8k",
      "Magnification": "0.005/次",
      "provider": "BlackForestLabs",
      "features": ['drawing']
    },
    {
      "id": "100",
      "name": "flux-1-schnell",
      "token_count": "0.8k",
      "Magnification": "0.005/次",
      "provider": "BlackForestLabs",
      "features": ['drawing']
    },
    {
      "id": "101",
      "name": "flux-1-dev",
      "token_count": "0.8k",
      "Magnification": "0.01/次",
      "provider": "BlackForestLabs",
      "features": ['drawing']
    },
    {
      "id": "102",
      "name": "sd3.5-medium",
      "token_count": "0.8k",
      "Magnification": "0.005/次",
      "provider": "stable-diffusion",
      "features": ['drawing']
    },
    {
      "id": "103",
      "name": "sd3.5-large",
      "token_count": "0.8k",
      "Magnification": "0.01/次",
      "provider": "stable-diffusion",
      "features": ['drawing']
    },
    {
      "id": "104",
      "name": "sd3.5-large-turbo",
      "token_count": "0.8k",
      "Magnification": "0.01/次",
      "provider": "stable-diffusion",
      "features": ['drawing']
    },
    {
      "id": "105",
      "name": "ssd-1b",
      "token_count": "0.8k",
      "Magnification": "0.01/次",
      "provider": "stable-diffusion",
      "features": ['drawing']
    },
    {
      "id": "106",
      "name": "stable-diffusion-xl-1024-v1-0",
      "token_count": "0.8k",
      "Magnification": "0.01/次",
      "provider": "stable-diffusion",
      "features": ['drawing']
    },
    {
      "id": "107",
      "name": "playground-v2-1024px-aesthetic",
      "token_count": "0.8k",
      "Magnification": "0.01/次",
      "provider": "playground",
      "features": ['drawing']
    },
    {
      "id": "108",
      "name": "playground-v2-5-1024px-aesthetic",
      "token_count": "0.8k",
      "Magnification": "0.01/次",
      "provider": "playground",
      "features": ['drawing']
    },
    {
      "id": "109",
      "name": "japanese-stable-diffusion-xl",
      "token_count": "0.8k",
      "Magnification": "0.01/次",
      "provider": "stable-diffusion",
      "features": ['drawing']
    },
    {
      "id": "110",
      "name": "o1",
      "token_count": "128k",
      "Magnification": "0.6/次",
      "provider": "OpenAi",
      "features": ['conversation', 'code', 'image_recognition', 'thinking']
    },
    {
      "id": "111",
      "name": "o1-all",
      "token_count": "128k",
      "Magnification": "0.6/次",
      "provider": "OpenAi",
      "features": ['conversation', 'code', 'image_recognition', 'thinking']
    },
    {
      "id": "112",
      "name": "o1-pro",
      "token_count": "128k",
      "Magnification": "1.2/次",
      "provider": "OpenAi",
      "features": ['conversation', 'code', 'image_recognition', 'thinking']
    },
    {
      "id": "113",
      "name": "o1-pro-all",
      "token_count": "128k",
      "Magnification": "1.2/次",
      "provider": "OpenAi",
      "features": ['conversation', 'code', 'image_recognition', 'thinking']
    },
    {
      "id": "114",
      "name": "sora-1:1-480p-5s",
      "token_count": "2k",
      "Magnification": "1.0/次",
      "provider": "OpenAi",
      "features": ['video']
    },
    {
      "id": "115",
      "name": "sora-1:1-720p-5s",
      "token_count": "2k",
      "Magnification": "1.5/次",
      "provider": "OpenAi",
      "features": ['video']
    },
    {
      "id": "116",
      "name": "sora-1:1-480p-10s",
      "token_count": "2k",
      "Magnification": "2.0/次",
      "provider": "OpenAi",
      "features": ['video']
    },
    {
      "id": "117",
      "name": "sora-16:9-480p-5s",
      "token_count": "2k",
      "Magnification": "1.25/次",
      "provider": "OpenAi",
      "features": ['video']
    },
    {
      "id": "118",
      "name": "sora-16:9-720p-5s",
      "token_count": "2k",
      "Magnification": "3.0/次",
      "provider": "OpenAi",
      "features": ['video']
    },
    {
      "id": "119",
      "name": "sora-16:9-480p-10s",
      "token_count": "2k",
      "Magnification": "2.5/次",
      "provider": "OpenAi",
      "features": ['video']
    },
    {
      "id": "120",
      "name": "sora-9:16-480p-5s",
      "token_count": "2k",
      "Magnification": "2.5/次",
      "provider": "OpenAi",
      "features": ['video']
    },
    {
      "id": "121",
      "name": "sora-9:16-720p-5s",
      "token_count": "2k",
      "Magnification": "3.0/次",
      "provider": "OpenAi",
      "features": ['video']
    },
    {
      "id": "122",
      "name": "gemini-2.0-flash-exp",
      "token_count": "1000k",
      "Magnification": 0.6,
      "provider": "Google",
      "features": ['conversation', 'code', 'image_recognition']
    },
    {
      "id": "123",
      "name": "gemini-2.0-flash-thinking-exp-1219",
      "token_count": "1000k",
      "Magnification": 0.6,
      "provider": "Google",
      "features": ['conversation', 'code', 'image_recognition', 'thinking']
    },
    {
      "id": "124",
      "name": "o3-mini",
      "token_count": "128k",
      "Magnification": 0.5,
      "provider": "OpenAi",
      "features": ['conversation', 'code', "internet", 'thinking']
    },
    {
      "id": "125",
      "name": "o3-mini-all",
      "token_count": "128k",
      "Magnification": 0.5,
      "provider": "OpenAi",
      "features": ['conversation', 'code', "internet", 'thinking']
    },
    {
      "id": "126",
      "name": "o3-mini-high",
      "token_count": "128k",
      "Magnification": '0.15/次',
      "provider": "OpenAi",
      "features": ['conversation', 'code', "internet", 'thinking']
    },
    {
      "id": "127",
      "name": "o3-mini-high-all",
      "token_count": "128k",
      "Magnification": '0.15/次',
      "provider": "OpenAi",
      "features": ['conversation', 'code', "internet", 'thinking']
    },
    {
      "id": "128",
      "name": "deepseek-v3",
      "token_count": "64k",
      "Magnification": 0.27,
      "provider": "deepseek",
      "features": ['conversation', 'code', 'thinking']
    },
    {
      "id": "129",
      "name": "deepseek-reasoner",
      "token_count": "64k",
      "Magnification": 5,
      "provider": "deepseek",
      "features": ['conversation', 'code', 'thinking']
    },
    {
      "id": "130",
      "name": "deepseek-r1",
      "token_count": "64k",
      "Magnification": 0.5,
      "provider": "deepseek",
      "features": ['conversation', 'code', 'thinking']
    },
    {
      "id": "131",
      "name": "moonshot-v1-8k",
      "token_count": "8k",
      "Magnification": 0.85,
      "provider": "moonshot",
      "features": ['conversation', 'code']
    },
    {
      "id": "132",
      "name": "moonshot-v1-32k",
      "token_count": "32k",
      "Magnification": 1.7,
      "provider": "moonshot",
      "features": ['conversation', 'code']
    },
    {
      "id": "133",
      "name": "moonshot-v1-128k",
      "token_count": "128k",
      "Magnification": 4.2,
      "provider": "moonshot",
      "features": ['conversation', 'code']
    },
    {
      "id": "134",
      "name": "claude-3-5-sonnet-all",
      "token_count": "200k",
      "Magnification": 1.5,
      "provider": "Anthropic",
      "features": ['conversation', 'code', 'image_recognition', 'file']
    },
    {
      "id": "135",
      "name": "claude-3-5-haiku-20241022",
      "token_count": "200k",
      "Magnification": 0.5,
      "provider": "Anthropic",
      "features": ['conversation', 'code']
    },
    {
      "id": "136",
      "name": "grok-2-1212",
      "token_count": "128k",
      "Magnification": 1,
      "provider": "Xai",
      "features": ['conversation', 'code']
    },
    {
      "id": "137",
      "name": "grok-3",
      "token_count": "128k",
      "Magnification": 2.5,
      "provider": "Xai",
      "features": ['conversation', 'code', 'image_recognition', 'drawing']
    },
    {
      "id": "138",
      "name": "grok-3-deepsearch",
      "token_count": "128k",
      "Magnification": 1,
      "provider": "Xai",
      "features": ['conversation', 'code', 'image_recognition', 'internet']
    },
    {
      "id": "139",
      "name": "grok-3-reasoner",
      "token_count": "128k",
      "Magnification": 10,
      "provider": "Xai",
      "features": ['conversation', 'code', 'image_recognition', 'internet']
    },
    {
      "id": "140",
      "name": "claude-3-7-sonnet-20250219",
      "token_count": "200k",
      "Magnification": 2,
      "provider": "Anthropic",
      "features": ['conversation', 'code', 'image_recognition', 'file']
    },
    {
      "id": "141",
      "name": "claude-3-7-sonnet-thinking",
      "token_count": "200k",
      "Magnification": 3,
      "provider": "Anthropic",
      "features": ['conversation', 'code', 'image_recognition', 'file', 'thinking']
    },
    {
      "id": "142",
      "name": "deepseek-reasoner-all",
      "token_count": "64k",
      "Magnification": 0.875,
      "provider": "deepseek",
      "features": ['conversation', 'code', 'file', 'internet', 'thinking']
    },
    {
      "id": "143",
      "name": "gemini-2.0-flash-exp-image-generation",
      "token_count": "1000k",
      "Magnification": 1.25,
      "provider": "Google",
      "features": ['conversation', 'code', 'file', 'drawing', 'image_recognition']
    },
    {
      "id": "144",
      "name": "gemini-2.0-pro-exp-02-05",
      "token_count": "1000k",
      "Magnification": 2.5,
      "provider": "Google",
      "features": ['conversation', 'code', 'file', 'image_recognition']
    },
    {
      "id": "145",
      "name": "gemini-2.5-pro-exp-03-25",
      "token_count": "1000k",
      "Magnification": 0.63,
      "provider": "Google",
      "features": ['conversation', 'code', 'file', 'image_recognition']
    },
    {
      "id": "146",
      "name": "qwq-32b-preview",
      "token_count": "128k",
      "Magnification": 0.73,
      "provider": "通义千问",
      "features": ['conversation', 'code']
    },
    {
      "id": "147",
      "name": "qwq-32b",
      "token_count": "128k",
      "Magnification": 0.73,
      "provider": "通义千问",
      "features": ['conversation', 'code']
    },
    {
      "id": "148",
      "name": "Doubao-1.5-lite-32k",
      "token_count": "32k",
      "Magnification": 0.15,
      "provider": "字节豆包",
      "features": ['conversation', 'code']
    },
    {
      "id": "149",
      "name": "Doubao-1.5-pro-32k",
      "token_count": "32k",
      "Magnification": 0.4,
      "provider": "字节豆包",
      "features": ['conversation', 'code']
    },
    {
      "id": "150",
      "name": "Doubao-1.5-vision-pro-32k",
      "token_count": "32k",
      "Magnification": 1.5,
      "provider": "字节豆包",
      "features": ['conversation', 'code', 'image_recognition']
    },
    {
      "id": "151",
      "name": "Doubao-1.5-pro-256k",
      "token_count": "256k",
      "Magnification": 2.5,
      "provider": "字节豆包",
      "features": ['conversation', 'code']
    },
    {
      "id": "152",
      "name": "gpt-4o-image",
      "token_count": "2k",
      "Magnification": "0.04/次",
      "provider": "OpenAi",
      "features": ['drawing', 'image_recognition']
    },
    {
      "id": "153",
      "name": "gpt-4o-image-vip",
      "token_count": "2k",
      "Magnification": "0.1/次",
      "provider": "OpenAi",
      "features": ['drawing', 'image_recognition']
    },
    {
      "id": "154",
      "name": "gpt-4.1",
      "token_count": "128k",
      "Magnification": 1,
      "provider": "OpenAi",
      "features": ['conversation', 'image_recognition', 'file']
    },
    {
      "id": "155",
      "name": "gpt-4.1-mini",
      "token_count": "128k",
      "Magnification": 0.2,
      "provider": "OpenAi",
      "features": ['conversation', 'image_recognition', 'file']
    },
    {
      "id": "156",
      "name": "gpt-4.1-nano",
      "token_count": "128k",
      "Magnification": 0.05,
      "provider": "OpenAi",
      "features": ['conversation', 'image_recognition', 'file']
    },
    {
      "id": "157",
      "name": "o3",
      "token_count": "128k",
      "Magnification": "0.6/次",
      "provider": "OpenAi",
      "features": ['conversation', 'image_recognition', 'file', 'internet']
    },
    {
      "id": "158",
      "name": "o3-all",
      "token_count": "128k",
      "Magnification": "0.6/次",
      "provider": "OpenAi",
      "features": ['conversation', 'image_recognition', 'file', 'internet']
    },
    {
      "id": "159",
      "name": "o4-mini-all",
      "token_count": "128k",
      "Magnification": "0.15/次",
      "provider": "OpenAi",
      "features": ['conversation', 'file']
    },
    {
      "id": "160",
      "name": "o4-mini-high-all",
      "token_count": "128k",
      "Magnification": "0.2/次",
      "provider": "OpenAi",
      "features": ['conversation', 'file']
    },
    {
      "id": "161",
      "name": "o4-mini-high-all",
      "token_count": "128k",
      "Magnification": "0.2/次",
      "provider": "OpenAi",
      "features": ['conversation', 'file']
    },
    {
      "id": "162",
      "name": "o4-mini",
      "token_count": "128k",
      "Magnification": 0.55,
      "provider": "OpenAi",
      "features": ['conversation', 'file']
    },
    {
      "id": "163",
      "name": "o4-mini-2025-04-16",
      "token_count": "128k",
      "Magnification": 0.55,
      "provider": "OpenAi",
      "features": ['conversation', 'file']
    },
    {
      "id": "164",
      "name": "gemini-2.5-flash-preview-04-17",
      "token_count": "1000k",
      "Magnification": 0.15,
      "provider": "Google",
      "features": ['conversation', 'image_recognition', 'file', 'internet']
    },
    {
      "id": "165",
      "name": "gpt-image-1",
      "token_count": "8k",
      "Magnification": "0.04/次",
      "provider": "OpenAi",
      "features": ['drawing', 'image_recognition']
    },
    {
      "id": "166",
      "name": "gpt-image-1-vip",
      "token_count": "8k",
      "Magnification": "0.1/次",
      "provider": "OpenAi",
      "features": ['drawing', 'image_recognition']
    }
  ]

  const groupedByprovider = {};
  originalModels.forEach(model => {
    if (!groupedByprovider[model.provider]) {
      groupedByprovider[model.provider] = [];
    }
    groupedByprovider[model.provider].push(model);
  });

  let newId = 1;
  const optimizedModels = [];

  Object.keys(groupedByprovider).forEach(provider => {
    const modelsInGroup = groupedByprovider[provider];
    modelsInGroup.forEach(model => {
      optimizedModels.push({
        ...model,
        id: newId++
      });
    });
  });

  return optimizedModels;
};

export const chat_models = getOptimizedModels();