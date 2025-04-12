import { GPTSoVITS } from '../utils/providers/TTsModels/GPTSoVITS/GPTSoVITS.js';
import YAML from 'yaml';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadAudioFile(url, destination) {
  const writer = fs.createWriteStream(destination);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function handleTTS(e, answer) {
  try {
    const configPath = path.join(__dirname, '../config/message.yaml');
    console.log(configPath)
    let config = {};
    if (fs.existsSync(configPath)) {
      const file = fs.readFileSync(configPath, 'utf8');
      const configs = YAML.parse(file);
      config = configs.pluginSettings;
    }
    const HgGPTSovitsUrl = config?.HgGPTSovitsUrl;
    const voiceExamplePath = path.join(__dirname, '../resources/tts/generated.wav');
    let record_url = await GPTSoVITS(answer, HgGPTSovitsUrl, voiceExamplePath);
    const downloadPath = './resources/SoVits.mp3';
    if (!record_url) return;
    await downloadAudioFile(record_url, downloadPath);
    await e.reply(segment.record(downloadPath));
  } catch (error) {
    console.log('TTS处理错误:', error);
  }
}

export { handleTTS }