async function FreeStableDiffusion_1(messages, fetch) {
 try {
 const options = {
  method: 'GET',
  headers: {
    'referer': 'https://mj1.freemj.xyz/',
    'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7'
  }
};
const response = await fetch(`https://mj1.freemj.xyz/api/others/fastjourney?prompt=${messages[messages.length-1].content}`, options)
 const answer = await response.json()
 const res = `(${answer.data})`
   return res
   } catch { 
    return null
  }
}

module.exports = { FreeStableDiffusion_1 }

