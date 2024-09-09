async function chatglm4v(msg, imgurl, crypto) {
    const expSeconds = 3600;
    const expTimestamp = Math.round(Date.now()) + expSeconds * 1000;
    const Response = await fetch("https://y-tian-plugin.top:3000/glm4v/random-token")
    const Res = await Response.json()
    const apikey = Res.token
    const token = await generateToken(apikey, expTimestamp, crypto);

    const requestBody = {
        model: "glm-4v",
        stream: false,
        messages: [{
            role: "user",
            content: [{
                type: "text",
                text: msg
            },
            {
                type: "image_url",
                image_url: {
                    url: imgurl
                }
            }]
        }]
    };

    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    //console.log(data);
    return data.choices[0].message.content;
}

async function generateToken(apiKey, expTimestamp, crypto) {
    let id, secret;
    try {
        [id, secret] = apiKey.split(".");
    } catch (e) {
        throw new Error("Invalid apiKey: " + e.message);
    }

    const timestamp = Math.round(Date.now());
    const payload = {
        api_key: id,
        exp: expTimestamp,
        timestamp: timestamp
    };
    const header = {
        alg: "HS256",
        sign_type: "SIGN"
    };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const signature = crypto.createHmac('sha256', secret)
        .update(encodedHeader + "." + encodedPayload)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    return encodedHeader + "." + encodedPayload + "." + signature;
}

module.exports = { chatglm4v };