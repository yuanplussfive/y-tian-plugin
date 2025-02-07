let fetch = (await import('node-fetch')).default;

export const merlin = async (messages, model) => {
    const url = 'https://yuoop-merlin.hf.space/hf/v1/chat/completions';
    const data = {
        model,
        messages,
        stream: false
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            return null;
        }

        const output = await response.json();
        return output?.choices[0]?.message?.content;
    } catch (error) {
        return null;
    }
};