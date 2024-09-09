async function FreeChat35_5(messages, fetch, crypto, mode = "xin", key = null) {
  const body = {
    message: messages,
    mode: mode,
    key: key,
  };
  try {
  const response = await fetch("https://aliyun.zaiwen.top/message", {
   method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Referer": "https://www.zaiwen.top/"
    },
    body: JSON.stringify(body)
   });
     if (!response.ok) {
      return null
    }
   return await response.text();
  } catch {
   return null
 }
}

module.exports = { FreeChat35_5 }

