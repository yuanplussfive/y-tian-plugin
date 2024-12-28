let fetch = (await import('node-fetch')).default;

interface SearchRequest {
    model: string;
    messages: any[];
    stream: boolean;
}

export const FreeSearch = async (messages: any[], model: string): Promise<string | null> => {
    const url = 'https://yuanpluss.online:3000/api/v1/search';
    const data: SearchRequest = { model, messages, stream: false };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            return null;
        }

        return (await response.text()).trim();
    } catch (error) {
        return null;
    }
};