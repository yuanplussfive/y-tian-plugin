async function handleTTS(e, speakers, answer, WebSocket, _path, fs) {
  try {
    let record_url = await AnimeTTS(WebSocket, speakers, answer);
    console.log(record_url)
    const base64Data = record_url.split(',')[1];
    const audioBuffer = Buffer.from(base64Data, 'base64');
    fs.writeFile(`${_path}/resources/tts.mp3`, audioBuffer, (err) => {
      if (err) {
        console.error('Failed to save audio file:', err);
      } else {
        e.reply(segment.record(`${_path}/resources/tts.mp3`));
      }
    });
  } catch (error) {
    console.log(error)
    e.reply("tts服务通讯失败,请稍候重试");
  }

  async function AnimeTTS(WebSocket, speakers, answer) {
    const session_hash = Math.random().toString(36).substring(2, 12);
    const data = {
      data: [
        answer,
        '中文',
        '琪亚娜',
        0.6,
        0.668,
        1.2
      ],
      fn_index: 0,
      session_hash
    };
    return new Promise((resolve, reject) => {
      const ws = new WebSocket('wss://yuanpluss-vits.hf.space/queue/join', {
        headers: {
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
          'cache-control': 'no-cache',
          'pragma': 'no-cache',
          'sec-websocket-extensions': 'permessage-deflate; client_max_window_bits'
        }
      });

      const messages = [];

      ws.on('open', async () => {
        await ws.send(JSON.stringify({ fn_index: 0, session_hash: data.session_hash }));
        await ws.send(JSON.stringify(data));
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
        resolve(outputs.output.data[1]);
      });
    });
  }
}

export { handleTTS }