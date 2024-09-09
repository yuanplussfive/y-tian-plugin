async function FreeSearch_1(messages, fetch) {
 try {
 const url = 'https://y-tian-plugin.top:1111/api/v1/search/completions';
 const data = {
   messages: messages[messages.length-1].content,
   search: true
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

module.exports = { FreeSearch_1 }

