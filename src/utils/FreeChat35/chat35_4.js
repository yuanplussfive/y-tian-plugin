async function FreeChat35_4(messages, fetch, crypto) {
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
const generateSignature = async r => {
    const { t: e, m: t } = r,
          n = {}.PUBLIC_SECRET_KEY || "",
          a = `${e}:${t}:${n}`;
    return await digestMessage(a);
}
const be = Date.now();
const _e = messages
const sign = await generateSignature({
    t: be,
    m: _e[_e.length - 1].content
})
const body = {
"model": "gpt-3.5-turbo",
"messages": messages,
"time": be,
"pass": null,
"sign": sign
}
try {
const response = await fetch("https://s.aifree.site/api/generate", {
  "method": "POST",
    "headers": {
      "authorization": "Bearer null",
      "content-type": "text/plain;charset=UTF-8",
      "Referer": "https://zz.aifree.site/"
     },
    "body": JSON.stringify(body)
   });
    if (!response.ok) {
      return null
    }
    return await response.text()
   } catch {
   return null
  }
}

module.exports = { FreeChat35_4 }

