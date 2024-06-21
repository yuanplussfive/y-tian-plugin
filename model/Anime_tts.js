async function handleTTS(e, speakers, answer, WebSocket, fs, _path) {
  try {
    let record_url = await AnimeTTS(speakers, answer);
    e.reply(segment.record(record_url));
  } catch (error) {
    console.log(error)
  }

  async function AnimeTTS(speakers, text) {
    const session_hash = Math.random().toString(36).substring(2, 12);
    const data = {
      data: [
        text,
        true,
        null,
        '',
        0,
        48,
        0.7,
        1.5,
        0.7,
        speakers
      ],
      fn_index: 4,
      session_hash
    };
    return new Promise((resolve, reject) => {
      const ws = new WebSocket('wss://fs.firefly.matce.cn/queue/join', {
        headers: {
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
          'cache-control': 'no-cache',
          'pragma': 'no-cache',
          'sec-websocket-extensions': 'permessage-deflate; client_max_window_bits'
        }
      });

      const messages = [];

      ws.on('open', async () => {
        ws.send(JSON.stringify({ fn_index: 4, session_hash: data.session_hash }));
        ws.on('message', (response) => {
          ws.send(JSON.stringify(data));
        });
      });

      ws.on('message', (message) => {
        messages.push(message.toString('utf-8'));
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error: ${error}`);
        reject(error);
      });

      ws.on('close', () => {
        const result = messages.pop();
        const outputs = JSON.parse(result);
        console.log(outputs)
        let recordurl = null
        if (outputs.output.data[0] && outputs.output.data[0].name) {
          recordurl = 'https://fs.firefly.matce.cn/file=' + outputs.output.data[0].name
        }
        resolve(recordurl);
      })
    });
  }
}

export { handleTTS }