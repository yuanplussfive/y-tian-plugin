async function FreeChat40_1(messages, fetch) {
 try {
 const url = 'https://y-tian-plugin.top:8080/api/v1/freechat4/completions';
 const data = {
   model: "gpt-4",
   messages: messages
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
   } catch { 
    return null
  }
}

module.exports = { FreeChat40_1 }

