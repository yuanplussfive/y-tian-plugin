export const getOptimizedModels = () => {
  const originalModels = [
    {
      id: 1,
      model: "gpt-4o-mini",
      providers: 5,
      token: "8k",
      provider: "OpenAi",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 2,
      model: "gpt-4o",
      providers: 5,
      token: "8k",
      provider: "OpenAi",
      features: ["conversation", "internet", "code"],
      auth: "否"
    },
    {
      id: 3,
      model: "gpt-4o-all",
      providers: 1,
      token: "8k",
      provider: "OpenAi",
      features: ["conversation", "internet", "code"],
      auth: "否"
    },
    {
      id: 4,
      model: "gpt-4o-all-lite",
      providers: 1,
      token: "8k",
      provider: "OpenAi",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 5,
      model: "gpt-4o-vision",
      providers: 1,
      token: "8k",
      provider: "OpenAi",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 6,
      model: "gpt-3.5-turbo",
      providers: 1,
      token: "8k",
      provider: "OpenAi",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 7,
      model: "gpt-3.5-turbo-16k",
      providers: 1,
      token: "16k",
      provider: "OpenAi",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 8,
      model: "hunyuan-t1",
      providers: 1,
      token: "128k",
      provider: "腾讯混元",
      features: ["conversation", "code", "internet", "thinking"],
      auth: "是"
    },
    {
      id: 9,
      model: "grok-v2",
      providers: 1,
      token: "128k",
      provider: "Xai",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 10,
      model: "deepseek-v3",
      providers: 1,
      token: "64k",
      provider: "deepseek",
      features: ["conversation", "code", "thinking"],
      auth: "否"
    },
    {
      id: 11,
      model: "grok-2-1212",
      providers: 1,
      token: "128k",
      provider: "Xai",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 12,
      model: "gemini-2.0-flash-exp",
      providers: 3,
      token: "1000k",
      provider: "Google",
      features: ["conversation", "internet", "code"],
      auth: "否"
    },
    {
      id: 13,
      model: "gemini-2.0-flash-thinking-exp",
      providers: 2,
      token: "1000k",
      provider: "Google",
      features: ["conversation", "internet", "code", "thinking"],
      auth: "否"
    },
    {
      id: 14,
      model: "gemini-1.5-flash",
      providers: 3,
      token: "1000k",
      provider: "Google",
      features: ["conversation", "internet", "code"],
      auth: "否"
    },
    {
      id: 15,
      model: "gemini-2.0-flash",
      providers: 1,
      token: "1000k",
      provider: "Google",
      features: ["conversation", "internet", "code"],
      auth: "否"
    },
    {
      id: 16,
      model: "gemini-1.5-pro",
      providers: 3,
      token: "1000k",
      provider: "Google",
      features: ["conversation", "internet", "code"],
      auth: "否"
    },
    {
      id: 17,
      model: "gemini-pro",
      providers: 2,
      token: "1000k",
      provider: "Google",
      features: ["conversation", "internet", "code"],
      auth: "否"
    },
    {
      id: 18,
      model: "gemini-1.5-flash-vision",
      providers: 1,
      token: "1000k",
      provider: "Google",
      features: ["conversation", "internet", "code"],
      auth: "否"
    },
    {
      id: 19,
      model: "claude-3.5-sonnet",
      providers: 4,
      token: "200k",
      provider: "Anthropic",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 20,
      model: "claude-3.7-sonnet",
      providers: 2,
      token: "200k",
      provider: "Anthropic",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 21,
      model: "claude-3.5-sonnet-poe",
      providers: 1,
      token: "200k",
      provider: "Anthropic",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 22,
      model: "claude-3.5-haiku",
      providers: 2,
      token: "200k",
      provider: "Anthropic",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 23,
      model: "claude-3.5-sonnet-20241022",
      providers: 1,
      token: "200k",
      provider: "Anthropic",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 24,
      model: "deepseek-r1",
      providers: 4,
      token: "128k",
      provider: "deepseek",
      features: ["conversation", "code", "thinking"],
      auth: "否"
    },
    {
      id: 25,
      model: "deepseek-v3",
      providers: 5,
      token: "128k",
      provider: "deepseek",
      features: ["conversation", "code", "thinking"],
      auth: "否"
    },
    {
      id: 26,
      model: "deepseek-reasoner",
      providers: 1,
      token: "128k",
      provider: "deepseek",
      features: ["conversation", "code", "thinking"],
      auth: "否"
    },
    {
      id: 27,
      model: "deepseek-v3-0324",
      providers: 1,
      token: "128k",
      provider: "deepseek",
      features: ["conversation", "code", "thinking"],
      auth: "否"
    },
    {
      id: 28,
      model: "llama-3.3-70b",
      providers: 3,
      token: "32k",
      provider: "Meta",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 29,
      model: "llama-3.1-405b",
      providers: 1,
      token: "32k",
      provider: "Meta",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 30,
      model: "llama-3.2-3b",
      providers: 1,
      token: "8k",
      provider: "Meta",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 31,
      model: "llama-3.1-8b",
      providers: 1,
      token: "8k",
      provider: "Meta",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 32,
      model: "llama-3.3-70B",
      providers: 1,
      token: "32k",
      provider: "Meta",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 58,
      model: "llama-4-scout",
      providers: 1,
      token: "1000k",
      provider: "Meta",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 33,
      model: "qwen-2-72b",
      providers: 2,
      token: "32k",
      provider: "通义千问",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 34,
      model: "qwen-coder-32b",
      providers: 1,
      token: "32k",
      provider: "通义千问",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 35,
      model: "qwen-2.5-72b-instruct",
      providers: 1,
      token: "32k",
      provider: "通义千问",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 36,
      model: "hunyuan-gpt-175B-0404",
      providers: 1,
      token: "128k",
      provider: "腾讯混元",
      features: ["conversation", "code", "internet", "drawing"],
      auth: "是"
    },
    {
      id: 37,
      model: "hunyuan-deepseek-r1",
      providers: 1,
      token: "128k",
      provider: "腾讯混元",
      features: ["conversation", "code", "internet", "thinking"],
      auth: "是"
    },
    {
      id: 38,
      model: "hunyuan-deepseek-v3",
      providers: 1,
      token: "128k",
      provider: "腾讯混元",
      features: ["conversation", "code", "internet"],
      auth: "是"
    },
    {
      id: 39,
      model: "qwq-32b-preview",
      providers: 1,
      token: "128k",
      provider: "通义千问",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 40,
      model: "mistral-7b",
      providers: 2,
      token: "32k",
      provider: "mistral",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 41,
      model: "mistral-nemo",
      providers: 1,
      token: "32k",
      provider: "mistral",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 42,
      model: "mistral-large-2411",
      providers: 1,
      token: "128k",
      provider: "mistral",
      features: ["conversation", "code", "thinking"],
      auth: "否"
    },
    {
      id: 43,
      model: "mixtral-8x7b",
      providers: 1,
      token: "32k",
      provider: "mistral",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 44,
      model: "sdxl-turbo",
      providers: 1,
      token: "8k",
      provider: "stable-diffusion",
      features: ["drawing"],
      auth: "否"
    },
    {
      id: 45,
      model: "o3-mini",
      providers: 2,
      token: "128k",
      provider: "OpenAi",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 46,
      model: "yi-lightning",
      providers: 2,
      token: "16k",
      provider: "零一万物",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 47,
      model: "hunyuan-lite",
      providers: 1,
      token: "8k",
      provider: "腾讯混元",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 48,
      model: "glm-4-flash",
      providers: 1,
      token: "8k",
      provider: "chatglm",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 49,
      model: "spark-max",
      providers: 1,
      token: "128k",
      provider: "讯飞星火",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 50,
      model: "ERNIE-Speed-128k",
      providers: 1,
      token: "128k",
      provider: "文心一言",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 51,
      model: "o1-preview",
      providers: 2,
      token: "128k",
      provider: "OpenAi",
      features: ["conversation", "code", "thinking"],
      auth: "否"
    },
    {
      id: 52,
      model: "o1-mini",
      providers: 1,
      token: "128k",
      provider: "OpenAi",
      features: ["conversation", "code", "thinking"],
      auth: "否"
    },
    {
      id: 53,
      model: "o1",
      providers: 1,
      token: "128k",
      provider: "OpenAi",
      features: ["conversation", "code", "thinking"],
      auth: "否"
    },
    {
      id: 55,
      model: "gemma-2-9b-it",
      providers: 1,
      token: "32k",
      provider: "Google",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 56,
      model: "glm-4-9b-chat",
      providers: 1,
      token: "32k",
      provider: "chatglm",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 57,
      model: "gemma-3-27b-it",
      providers: 1,
      token: "64k",
      provider: "Google",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 58,
      model: "grok-3",
      providers: 1,
      token: "128k",
      provider: "Xai",
      features: ["conversation", "code", "internet"],
      auth: "否"
    },
    {
      id: 59,
      model: "llama-4-maverick",
      providers: 1,
      token: "1000k",
      provider: "Meta",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 60,
      model: "noobai-xl-v1.1",
      providers: 1,
      token: "8k",
      provider: "Noobai",
      features: ["drawing"],
      auth: "否"
    },
    {
      id: 61,
      model: "gpt-4.1-mini",
      providers: 1,
      token: "1000k",
      provider: "OpenAi",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 62,
      model: "gpt-4.1-nano",
      providers: 1,
      token: "1000k",
      provider: "OpenAi",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 63,
      model: "stable-diffusion-v3.5-turbo",
      providers: 1,
      token: "8k",
      provider: "stable-diffusion",
      features: ["drawing"],
      auth: "否"
    },
    {
      id: 64,
      model: "anything-xl",
      providers: 1,
      token: "8k",
      provider: "stable-diffusion",
      features: ["drawing"],
      auth: "否"
    },
    {
      id: 65,
      model: "flux-dev",
      providers: 1,
      token: "8k",
      provider: "BlackForestLabs",
      features: ["drawing"],
      auth: "否"
    },
    {
      id: 66,
      model: "flux-schnell",
      providers: 1,
      token: "8k",
      provider: "BlackForestLabs",
      features: ["drawing"],
      auth: "否"
    },
    {
      id: 67,
      model: "imagen-v3",
      providers: 1,
      token: "8k",
      provider: "Google",
      features: ["drawing"],
      auth: "否"
    },
    {
      id: 68,
      model: "liblib-imagen",
      providers: 1,
      token: "8k",
      provider: "liblib",
      features: ["drawing"],
      auth: "是"
    },
    {
      id: 69,
      model: "noobxl-hg",
      providers: 1,
      token: "8k",
      provider: "huggingface",
      features: ["drawing"],
      auth: "否"
    },
    {
      id: 70,
      model: "playground-v2.5",
      providers: 1,
      token: "8k",
      provider: "playground",
      features: ["drawing"],
      auth: "否"
    },
    {
      id: 71,
      model: "playground-v3",
      providers: 1,
      token: "8k",
      provider: "playground",
      features: ["drawing"],
      auth: "否"
    },
    {
      id: 72,
      model: "recraft-v3",
      providers: 1,
      token: "8k",
      provider: "recraft",
      features: ["drawing"],
      auth: "否"
    },
    {
      id: 73,
      model: "jimeng-3.0",
      providers: 1,
      token: "8k",
      provider: "Jimeng",
      features: ["drawing"],
      auth: "是"
    },
    {
      id: 74,
      model: "jimeng-2.1",
      providers: 1,
      token: "8k",
      provider: "Jimeng",
      features: ["drawing"],
      auth: "是"
    },
    {
      id: 75,
      model: "jimeng-2.0-pro",
      providers: 1,
      token: "8k",
      provider: "Jimeng",
      features: ["drawing"],
      auth: "是"
    },
    {
      id: 76,
      model: "jimeng-2.0",
      providers: 1,
      token: "8k",
      provider: "Jimeng",
      features: ["drawing"],
      auth: "是"
    },
    {
      id: 77,
      model: "jimeng-xl-pro",
      providers: 1,
      token: "8k",
      provider: "Jimeng",
      features: ["drawing"],
      auth: "是"
    },
    {
      id: 78,
      model: "gemini-2.5-flash",
      providers: 1,
      token: "1000k",
      provider: "Google",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 79,
      model: "o4-mini",
      providers: 1,
      token: "1000k",
      provider: "OpenAi",
      features: ["conversation", "code"],
      auth: "否"
    },
    {
      id: 80,
      model: "kusa-imagen",
      providers: 1,
      token: "8k",
      provider: "kusa",
      features: ["drawing"],
      auth: "否"
    }
  ];
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

export const reverse_models = getOptimizedModels();