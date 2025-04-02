import fetch from 'node-fetch';

export async function gpt4oImage(messages, model) {
    const array = [
        'https://yuoop-xyz.hf.space/v1/chat/completions',
        'https://yuoop-xyz1.hf.space/v1/chat/completions',
        'https://yuoop-xyz2.hf.space/v1/chat/completions'
    ];
    const randomIndex = Math.floor(Math.random() * array.length);
    const url = array[randomIndex];
    try {
        const response = await fetch('https://yuoop-xyz.hf.space/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-y-tian-plugin'
            },
            body: JSON.stringify({
                model,
                messages
            })
        });

        const data = await response.json();
        console.log(data.choices[0].message.content);
        return data;
    } catch(error) {
        console.log(error);
        return null;
    }
}