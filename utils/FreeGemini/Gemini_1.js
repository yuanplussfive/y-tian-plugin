async function FreeGemini_1(messages, fetch, crypto) {
  const transformedArray = messages.map(item => ({
    ...item,
    parts: [{ text: item.content }],
    content: undefined
  })).map(item => {
    const { content, ...rest } = item;
    return rest;
  });
  for (let item of transformedArray) {
    if (item.role === "assistant") {
      item.role = "model";
    }
    if (item.role === "system") {
      item.role = "user";
    }
  }
  console.log(transformedArray)
  const data = JSON.stringify({
    "contents": transformedArray,
    "generationConfig": {
      "temperature": 0.5,
      "maxOutputTokens": 4000,
      "topP": 1
    },
    "safetySettings": [
      {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_ONLY_HIGH"
      },
      {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_ONLY_HIGH"
      },
      {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_ONLY_HIGH"
      },
      {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_ONLY_HIGH"
      }
    ]
  });
  const options = {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 12; HarmonyOS; NOH-AN01; HMSCore 6.13.0.302) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.88 HuaweiBrowser/13.0.3.301 Mobile Safari/537.36',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'origin': 'https://ai.kldns.fun',
      'referer': 'https://ai.kldns.fun'
    },
    body: data
  };
  try {
    const response = await fetch('https://ai.kldns.fun/api/google/v1beta/models/gemini-pro:streamGenerateContent', options);
    if (!response.ok) {
      return null
    }
    const result = await response.json();
    const fullText = result.map(item =>
      item.candidates.map(candidate =>
        candidate.content.parts.map(part => part.text).join('')
      ).join('')
    ).join('');
    return fullText
  } catch (error) {
    return null
  }
}

export { FreeGemini_1 }