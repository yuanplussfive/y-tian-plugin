import fs from 'fs';
import { TTSCreate } from '../utils/providers/TTsModels/acgnai/tts.js';

async function handleTTS(e, speakers, answer, fetch, _path) {
  try {
    let record_url = await TTSCreate(answer);
    if (!record_url) return;
    /*
        console.log(record_url)
    
        let savePath = `./resources/${Date.now()}.mp3`;
    
        const response = await fetch(record_url);
        const buffer = await response.arrayBuffer();
    
        fs.writeFileSync(savePath, Buffer.from(buffer));
    
        await e.reply(segment.record(savePath));
    
        // 延迟删除临时文件
        setTimeout(() => {
          fs.unlink(savePath, (err) => {
            if (err) console.log('删除临时音频文件失败:', err);
          });
        }, 5000);
    */
    await e.reply(segment.record(record_url));
  } catch (error) {
    console.log('TTS处理错误:', error);
  }

  async function AnimeTTS(speakers, text) {
    const url = 'https://yuanpluss.online:3000/v1/tts/create';
    try {
      const response = await fetch(url, {
        method: 'post',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          text,
          referenceId: speakers
        })
      });
      if (!response.ok) {
        return null;
      }
      const data = await response.text();
      return data.trim();
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }
}

export { handleTTS }