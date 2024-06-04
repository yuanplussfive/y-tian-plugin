async function FreeGemini_3(messages, fetch, crypto) {
 try {
  const response = await fetch("https://aliyun.zaiwen.top/admin/chatbot", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "token": "null",
      "Referer": "https://www.zaiwen.top/"
    },
    body: JSON.stringify({
      "message": messages, 
      "mode": "gemini_pro", 
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

export { FreeGemini_3 }

