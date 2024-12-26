let fetch = (await import('node-fetch')).default;

export const mhystical = async (messages) => {
    const url = 'https://api.mhystical.cc/v1/completions';
    const data = { model: 'gpt-4', messages, stream: false };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-api-key': 'mhystical'
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            return null;
        }

        return (await response.json()).choices[0]?.message?.content;
    } catch (error) {
        return null;
    }
};