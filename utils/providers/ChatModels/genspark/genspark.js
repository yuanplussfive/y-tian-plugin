let fetch = (await import('node-fetch')).default;

export const genspark = async (messages, model) => {
    const url = 'https://gs.aytsao.cn/v1/chat/completions';
    const data = { model, messages, stream: false };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-genspark2api'
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            return null;
        }

        const res = await response.json();
        const output = await res?.choices[0]?.message?.content;
        return output?.trim();
    } catch (error) {
        return null;
    }
};