import { randomBytes } from 'crypto';
import fetch from 'node-fetch';

async function generateImage(prompt, apiUrl = 'https://gokaygokay-noobai-animagine-t-ponynai3.hf.space', retries = 2) {
    const sessionHash = randomBytes(10).toString('hex');
    const headers = {
        accept: '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'content-type': 'application/json',
        priority: 'u=1, i',
        'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Microsoft Edge";v="134"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-storage-access': 'active',
        Referer: `${apiUrl}/?__theme=system`,
        'Referrer-Policy': 'strict-origin-when-cross-origin',
    };

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // Step 1: Join queue with POST request
            const joinQueueResponse = await fetch(
                `${apiUrl}/queue/join?__theme=system`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        data: [
                            'T-ponynai3',
                            prompt,
                            'bad anatomy, blurry, out of focus, deformed, poorly drawn, oversaturated, low quality, low resolution, pixelated, artifact, distort, ugly, weird proportions, unbalanced, asymmetrical, unnatural, poorly lit, dark, too bright, distorted face, extra limbs, bad proportions, missing limbs, amputee, extra eyes, mutated hands, out of frame, out of place, low detail, disfigured, awkward pose, incomplete, cluttered, chaotic, noisy, nonsensical, incorrect perspective, wrong colors, bad lighting, overexposed, underexposed, glitch, broken, bad shadows, unclean, messy, unrealistic, unnatural expression, monstrous, creepy, horror, grotesque, monster, disturbing, blurry face, poorly textured, unrefined, unfinished, abnormal, unappealing, unflattering, garish, dull, flat, simple, underdetailed, messy composition, unprofessional, childish, unpolished, rough, unappealing skin, wrinkled, old, unhealthy, alien, robotic, unnatural eyes, glitchy, low contrast, unsharp, low fidelity, awkward anatomy, malformed, unrealistic skin, no details, bad proportions, unnatural colors, fake looking, rough edges, jagged lines',
                            1280,
                            832,
                            55,
                            6,
                            1,
                            true,
                            0,
                            'DPM++ 2M SDE Karras',
                            2,
                            false,
                            false,
                            false,
                            true,
                            true,
                            true,
                            true,
                            null,
                        ],
                        event_data: null,
                        fn_index: 0,
                        trigger_id: 24,
                        session_hash: sessionHash,
                    }),
                }
            );

            if (!joinQueueResponse.ok) {
                throw new Error(`Join queue failed: ${joinQueueResponse.statusText}`);
            }

            const queueDataResponse = await fetch(
                `${apiUrl}/queue/data?session_hash=${sessionHash}`,
                {
                    method: 'GET',
                    headers: { ...headers, accept: 'text/event-stream' },
                }
            );

            if (!queueDataResponse.ok) {
                throw new Error(`Queue data fetch failed: ${queueDataResponse.statusText}`);
            }

            let imageUrl = null;
            const decoder = new TextDecoder();

            await new Promise((resolve, reject) => {
                let buffer = '';
                queueDataResponse.body.on('data', (chunk) => {
                    buffer += decoder.decode(chunk, { stream: true });
                    const lines = buffer.split('\n');

                    for (let i = 0; i < lines.length - 1; i++) {
                        if (lines[i].startsWith('data: ')) {
                            try {
                                const data = JSON.parse(lines[i].slice(6));
                                if (data.msg === 'process_completed' && data.output?.data?.[0]?.[0]?.image?.url) {
                                    imageUrl = data.output.data[0][0].image.url;
                                }
                            } catch (e) {
                                console.error('JSON parse error:', lines[i]);
                            }
                        }
                    }
                    buffer = lines[lines.length - 1];
                });

                queueDataResponse.body.on('end', resolve);
                queueDataResponse.body.on('error', reject);
            });

            if (imageUrl) return imageUrl;
            throw new Error('No image URL generated');

        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed:`, error.message);
            if (attempt === retries - 1 && apiUrl !== 'https://gokaygokay-noobai-animagine-t-ponynai3.hf.space') {
                console.log('Switching to default API...');
                return generateImage(prompt, 'https://gokaygokay-noobai-animagine-t-ponynai3.hf.space', 1); // Fallback to default
            }
            if (attempt === retries) throw error;
        }
    }
}

export async function NoobxL(messages) {
    try {
        const arr = ['https://noobai.deno.dev'];
        const randomIndex = Math.floor(Math.random() * arr.length);
        const apiUrl = arr[randomIndex];
        const prompt = messages[messages.length - 1].content;
        const imageUrl = await generateImage(prompt, apiUrl);
        return imageUrl ? `![NoobXL](${imageUrl})` : null;

    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}