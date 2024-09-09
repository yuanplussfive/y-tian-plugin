async function FreeChat35_3(messages, fetch, crypto) {
async function digestMessage(r) {
    if (typeof crypto < "u" && crypto?.subtle?.digest) {
        const e = new TextEncoder().encode(r),
              t = await crypto.subtle.digest("SHA-256", e);
        return Array.from(new Uint8Array(t)).map(a => a.toString(16).padStart(2, "0")).join("");
    } else {
        const hash = crypto.createHash('sha256');
        hash.update(r);
        return hash.digest('hex');
    }
}
const generateSignature = async(t,e)=>{
    const {t: a, m: r, id: o} = t
      , s = `${o}:${a}:${r}:${e}`;
    return await digestMessage(s)
}
const be = Date.now();
const prompt = messages
const uuid = crypto.randomUUID();
const sign = await generateSignature({
    t: be,
    m: `${prompt[prompt.length-1].content}`,
    id: uuid
}, "D6D4X4g9");
const data = JSON.stringify({
"conversationId": uuid,
"conversationType":"chat_continuous",
"botId":"chat_continuous",
"globalSettings":{
"baseUrl":"https://api.openai.com",
"model":"gpt-3.5-turbo-0613",
"maxTokens":2048,
"messageHistorySize":5,
"temperature":0.7,
"top_p":1
},
"prompt": prompt[prompt.length-1].content,
"messages": messages,
"sign": sign,
"timestamp": be
})
const options = {
  method: 'POST',
   headers: {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 12; HarmonyOS; NOH-AN01; HMSCore 6.13.0.302) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.88 HuaweiBrowser/13.0.3.301 Mobile Safari/537.36',
    'Content-Type': 'text/plain',
    'Origin': 'https://chatforai.store',
    'Referer': 'https://chatforai.store/'
  },
  body: data
};
 try {
  const response = await fetch("https://chatforai.store/api/handle/provider-openai", options)
  if (!response.ok) {
      return null
    }
   return await response.text()
  } catch {
  return null
 }
}

module.exports = { FreeChat35_3 }

