async function FreeChat40_2(messages, fetch) {
  try {
    const url = 'https://chat.gking.me/gpt4/v1/chat/completions';
    const data = {
      model: 'gpt-4',
      stream: false,
      messages: messages
    };
    const currentTime = Date.now().toString();
    const paddedTimestamp = currentTime.padStart(13, '0'); 
    //console.log(paddedTimestamp);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0',
        'Referer': `https://chat.gking.me/?${paddedTimestamp}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      return null;
    }

    const responseData = await response.json();
    return responseData.choices[0].message.content

  } catch {
    return null
  }
}

module.exports = { FreeChat40_2 }

