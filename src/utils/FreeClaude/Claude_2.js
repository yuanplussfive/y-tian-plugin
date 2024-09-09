async function FreeClaude_2(messages, fetch, crypto) {
 try {
  const response = await fetch("https://aliyun.zaiwen.top/message_poe", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Referer": "https://www.zaiwen.top/"
    },
    body: JSON.stringify({
      "message": messages, 
      "mode": "claude_3_haiku", 
      "key": null
     })
    });
     if (!response.ok) {
     return null
    } else {
    return await response.text();
   } 
  } catch { 
  return null 
 }
}

module.exports = { FreeClaude_2 }

