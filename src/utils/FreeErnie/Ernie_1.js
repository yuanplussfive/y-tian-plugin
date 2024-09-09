async function FreeErnie_1(messages, fetch) {
 try {
 const url = 'https://y-tian-plugin.top:8080/chat/wenxin';
 const data = {
   msg: messages[messages.length-1].content
 };
 let response = await fetch(url, {
   method: 'POST',
   headers: {
    'Content-Type': 'application/json'
   },
   body: JSON.stringify(data)
  })
   let res = await response.json()
   return res?.data?.output
   } catch { 
    return null
  }
}

module.exports = { FreeErnie_1 }

