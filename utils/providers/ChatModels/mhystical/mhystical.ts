let fetch = (await import('node-fetch')).default;

interface ModelRequest {
    model: string;
    messages: any[];
    stream: boolean;
}

type ResponseData = {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
};

export const mhystical = async (messages: any[], model: string): Promise<string | null> => {
    const url = 'https://api.mhystical.cc/v1/completions';
    const data: ModelRequest = { model: 'gpt-4', messages, stream: false };
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

        const result = await response.json() as ResponseData
        return result.choices[0]?.message?.content;
    } catch (error) {
        return null;
    }
};