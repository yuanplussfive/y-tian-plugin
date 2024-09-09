async function FreeChat40_5(messages, fetch) {
  try {
    const url = 'https://ai-pro-free.aivvm.com/v1/chat/completions';
    const data = {
      model: 'gpt-4-turbo',
      messages: messages,
      stream: false
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      return null;
    }
    const responseData = await response.json();
    const inputString = responseData.choices[0].message.content
    return inputString
  } catch {
    return null
  }
}

module.exports = { FreeChat40_5 }

