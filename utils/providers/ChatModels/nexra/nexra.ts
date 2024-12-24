let fetch = (await import('node-fetch')).default;

interface Message {
    role: string;
    content: string;
}

interface NexraResponse {
    id: string;
    status: 'pending' | 'completed' | 'error' | 'not_found';
    gpt?: string;
}

export const nexra = async (messages: Message[], model: string): Promise<string | null> => {
    try {
        const url = 'https://nexra.aryahcr.cc/api/chat/gpt';
        messages = messages.map((item: Message) => ({
            ...item,
            role: item.role === 'system' ? 'user' : item.role
        }));

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

        const result: { id: string } = await response.json();

        // 检查状态的内部函数
        const checkStatus = async (id: string): Promise<NexraResponse> => {
            const checkUrl = `https://nexra.aryahcr.cc/api/chat/task/${encodeURIComponent(id)}`;
            let data = true;
            let finalResponse: NexraResponse | null = null;

            while (data) {
                const checkResponse = await fetch(checkUrl);
                const response: NexraResponse = await checkResponse.json();

                switch (response.status) {
                    case 'pending':
                        data = true;
                        break;
                    case 'error':
                    case 'completed':
                    case 'not_found':
                        data = false;
                        finalResponse = response;
                        break;
                }
            }

            return finalResponse!;
        };

        const finalResponse = await checkStatus(result.id);

        if (finalResponse && finalResponse.status === 'completed' && finalResponse.gpt) {
            return finalResponse.gpt;
        }

        return null;

    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};