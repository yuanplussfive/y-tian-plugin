import { randomBytes } from 'crypto';
import fetch from 'node-fetch';

async function generateImage(prompt, apiUrl = random_safe('aHR0cHM6Ly9tZW55dS1ub29ieGwuaGYuc3BhY2U='), retries = 2) {
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
      // Join queue
      const joinQueueResponse = await fetch(
        `${apiUrl}/gradio_api/queue/join?__theme=system`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            data: [
              prompt,
              "lowres, {bad}, error, fewer, extra, missing, worst quality, jpeg artifacts, bad quality, watermark, unfinished, displeasing, chromatic aberration, signature, extra digits, artistic error, username, scan, [abstract]",
              true,
              1009179159,
              1024,
              1536,
              7,
              28,
              true,
            ],
            event_data: null,
            fn_index: 3,
            trigger_id: 5,
            session_hash: sessionHash,
          }),
        }
      );

      if (!joinQueueResponse.ok) {
        throw new Error(`Join queue failed: ${joinQueueResponse.statusText}`);
      }

      // Fetch queue data
      const queueDataResponse = await fetch(
        `${apiUrl}/gradio_api/queue/data?session_hash=${sessionHash}`,
        { method: 'GET', headers }
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
                if (data.msg === 'process_completed' && data.output?.data?.[0]?.url) {
                  imageUrl = data.output.data[0].url;
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
      if (attempt === retries - 1 && apiUrl !== random_safe('aHR0cHM6Ly9tZW55dS1ub29ieGwuaGYuc3BhY2U=')) {
        console.log('Switching to default API...');
        return generateImage(prompt, random_safe('aHR0cHM6Ly9tZW55dS1ub29ieGwuaGYuc3BhY2U='), 1);
      }
      if (attempt === retries) throw error;
    }
  }
}

export async function NoobxL(messages) {
  try {
    const arr = [random_safe('aHR0cHM6Ly9ub29iYWkuZGVuby5kZXY=')];
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