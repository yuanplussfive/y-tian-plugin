async function FreeChat35_2(messages, fetch) {
    const requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "referer": "https://nx.chkzh.com/"
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            stream: true,
            messages: messages
        }),
        redirect: 'follow'
    };
    try {
        const response = await fetch("https://nx.chkzh.com/api/openai/v1/chat/completions", requestOptions);
        if (!response.ok) {
         return null
       }
        const responseText = await response.text();
        const events = responseText.split('event: answer\ndata: ').slice(1);
        let result = '';
        for (const event of events) {
            const json = JSON.parse(event.trim());
            const content = json.choices[0].delta.content;
            if (content !== undefined) {
                result += content;
            }
            if (json.choices[0].finish_reason === "stop") {
                break;
            }
        }
        return result
    } catch (error) {
        return null
    }
}

module.exports = { FreeChat35_2 }
























