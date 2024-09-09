async function FreeChat35_6(messages, fetch) {
  try {
    const url = 'https://y-tian-plugin.top:1111/api/v1/freechat35/completions';
    const data = {
      model: "gpt-3.5-turbo",
      messages: messages,
      presence_penalty: 0
    };
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    let res = await response.text()
    return res
  } catch { return undefined }
}


module.exports = { FreeChat35_6 }

