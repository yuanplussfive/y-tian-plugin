async function FreeChat40_4(messages, fetch) {
  try {
    const url = 'https://chat.smnet1.asia/api/openai/v1/chat/completions';
    const data = {
      model: 'gpt-4',
      messages: messages
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer nk-2311676378"
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

module.exports = { FreeChat40_4 }

