async function FreeClaude_1(messages, fetch) {
 try {
  const response = await fetch("https://aliyun.zaiwen.top/message_poe", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Referer": "https://www.zaiwen.top/"
    },
    body: JSON.stringify({
      "message": messages, 
      "mode": "claude_2_1_bamboo", 
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

module.exports = { FreeClaude_1 }

