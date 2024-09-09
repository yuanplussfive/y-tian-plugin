async function FreeDalle_1(messages, fetch) {
   try {
    const tokens = ['6d83586a-44d5', 'f3e43973-fdf3']
    const randomIndex = Math.floor(Math.random() * tokens.length);
    const token = "Bearer " + tokens[randomIndex];
    let response = await
fetch("https://dalle.feiyuyu.net/v1/images/generations", {
      method: "post",
       headers: {
        "content-type": "application/json",
        "Authorization": token
      },
       body: JSON.stringify({
      "prompt": messages[messages.length-1].content,
      "model": "dall-e-3",
      "n": 1,
      "quality": "standard",
      "size": "1024x1024"
      })
   })
    let res = await response.json()
    //console.log(res)
    if (res.data[0].url.includes("sorry_cat.png")) {
    return null
    } else {
    return `(${res.data[0].url})`
   }
  } catch {
    return null
  }
}

module.exports = { FreeDalle_1 }