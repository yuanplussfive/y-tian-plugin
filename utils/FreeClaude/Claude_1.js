async function FreeClaude_1(messages, fetch, crypto) {
  let previousRole = '';
  const result = [];
  messages.forEach((item) => {
    if (item.role === "system") {
      item.role = "user";
    }
    if (item.role === previousRole) {
      const lastItem = result[result.length - 1];
      lastItem.content += item.content;
    } else {
      result.push(item);
      previousRole = item.role;
    }
  });
  const url = "https://free.jgk-blog.tech/v1/messages";
  const headers = {
    "anthropic-version": "2023-06-01",
    "authorization": "Bearer sk-xxxxx",
    "content-type": "application/json",
    "x-api-key": "sk-xxxxx",
    "Referer": "https://app.nextchat.dev/"
  };
  const body = JSON.stringify({
    messages: result,
    stream: false,
    model: "claude-3.5-sonnet-20240620",
    max_tokens: 4000,
    temperature: 0.5,
    top_p: 1,
    top_k: 5
  });

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body
      });
      const data = await response.json();
      console.log(data)
      if (data?.content?.[0]?.text) {
        return data.content[0].text;
      }
    } catch (error) {
      if (attempt === 1) {
        return null;
      }
    }
  }
}

export { FreeClaude_1 }

