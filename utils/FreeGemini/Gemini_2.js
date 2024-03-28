async function FreeGemini_2(messages, fetch, crypto) {
async function digestMessage(message) {
  return crypto.createHash('sha256').update(message).digest('hex');
}
async function generateSignature({time, message}, PUBLIC_SECRET_KEY) {
  const dataToDigest = `${time}:${message}:${PUBLIC_SECRET_KEY}`;
  return await digestMessage(dataToDigest); 
}
async function signature(time, message) {
   const PUBLIC_SECRET_KEY = '';
    try {
      const signature = await generateSignature({time, message}, PUBLIC_SECRET_KEY);
      return signature
    } catch (error) {
     return error
    }
   }
  const transformedArray = messages.map(item => ({
    ...item,
    parts: [{ text: item.content }],
    content: undefined
})).map(item => {
    const { content, ...rest } = item;
    return rest;
 });
  const result = transformedArray.reduce((acc, curr, index, array) => {
    if (curr.role === "user") {
        if (acc.length > 0 && acc[acc.length - 1].role === "user") {
            return acc;
        } else {
          acc.push(curr);
        }
      }
      return acc;
   }, [])
    const time = new Date().getTime();
    const url = "https://gemini-ai.top/api/generate";
    const headers = {
        "content-type": "text/plain;charset=UTF-8",
        "Referer": "https://gemini-ai.top/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0"
    };  
    const sign = await signature(time, messages[messages.length-1].content);
    const body = JSON.stringify({
        "messages": result,
        "time": time,
        "pass": null,
        "sign": sign
    });
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body
        });
        if (!response.ok) {
         return null
        }
        const data = await response.text();
        if (data.startsWith(`{"error"`)) {
            return null
        }
       return data
    } catch (error) {
       return null
    }
}

export { FreeGemini_2 }















