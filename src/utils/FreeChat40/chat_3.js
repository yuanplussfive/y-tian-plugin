async function FreeChat40_3(messages, fetch) {
  try {
    const url = 'https://cdp.aytsao.cn/v1/chat/completions';
    const data = {
      model: 'gpt-4',
      messages: messages
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer sk-deanxv-cdp"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      return null;
    }

    const responseData = await response.json();
    const inputString = responseData.choices[0].message.content
    return inputString.replace(/\(?(\d+号机)\)?/g, "4号机");

  } catch {
    return null
  }
}

module.exports = { FreeChat40_3 }

