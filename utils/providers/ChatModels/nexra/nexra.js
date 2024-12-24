let fetch = (await import('node-fetch')).default;

export const nexra = async (messages, model) => {
    try {
        const url = 'https://nexra.aryahcr.cc/api/chat/gpt';
        messages = messages.map(item => {
            if (item.role === 'system') {
                item.role = 'user';
            }
            return item;
        });
        const message = messages.pop();
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages,
                prompt: message?.content,
                model,
                markdown: false
            })
        });

        const result = await response.json();
        const id = result.id;
        const checkStatus = async (id) => {
            const checkUrl = `https://nexra.aryahcr.cc/api/chat/task/${encodeURIComponent(id)}`;
            let data = true;
            let finalResponse = null;

            while (data) {
                const checkResponse = await fetch(checkUrl);
                const response = await checkResponse.json();
                //console.log(response);

                switch (response.status) {
                    case "pending":
                        data = true;
                        break;
                    case "error":
                    case "completed":
                    case "not_found":
                        data = false;
                        finalResponse = response;
                        break;
                }
            }

            return finalResponse;
        };
        const finalResponse = await checkStatus(id);
        if (finalResponse && finalResponse.status === 'completed' && finalResponse.gpt) {
            return finalResponse.gpt;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}