async function FreeChat35_1(messages, fetch, crypto) {
  const data = JSON.stringify({
    "messages": messages,
    "model": "gpt-3.5-turbo-1106"
  });
  const options = {
    method: 'PUT',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 12; HarmonyOS; NOH-AN01; HMSCore 6.13.0.302) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.88 HuaweiBrowser/13.0.3.301 Mobile Safari/537.36',
      'Content-Type': 'application/json',
      'origin': 'https://e8.free-chat.asia',
      'referer': 'https://e8.free-chat.asia/'
    },
    body: data
  };
  try {
    const response = await fetch('https://demo-railway.promplate.dev/single/chat_messages', options);
    if (!response.ok) {
      return null
    }
    return await response.text();
  } catch (error) {
    return null
  }
}

export { FreeChat35_1 }

