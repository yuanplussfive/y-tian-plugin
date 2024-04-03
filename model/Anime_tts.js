import fetch from 'node-fetch';
import yaml from 'yaml'
import fs from "fs"
import os from "os"
const _path = process.cwd()

async function Anime_tts(speakers, answer) {
  const yamlStr = fs.readFileSync(_path+'/data/YTtts_Setting/Setting.yaml', 'utf8');
  const config = yaml.parse(yamlStr);
  const session_hash = Math.random().toString(36).substring(2);

  const body = {
    "data": [
      answer,
      speakers,
      config.sdp_ratio,
      config.noise,
      config.noise_w,
      config.length,
      "ZH",
      true,
      1,
      0.2,
      null,
      "Happy",
      "",
      0.7
    ],
    "event_data": null,
    "fn_index": 0,
    "session_hash": session_hash
  };
  const results = speakers.split("_")[0];
  return new Promise((resolve, reject) => {
    fetch(`https://api.lolimi.cn/API/yyhc/y.php?msg=${answer}&speaker=${results}`, {
      "headers": {
        "content-type": "application/json"
      },
      "body": JSON.stringify(body),
      "method": "POST"
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('寄');
      }
    })
    .then(res => {
      resolve(res.music);
    })
    .catch(async error => {
      console.error('Error:', error);
      let address = await get_ip_address()
      let body = {
        "voice_id": 111,
        "text": answer,
        "format": "mp3", 
        "pitch_factor": 0,
        "voice_speed": "0%",
        "rate": "1.1",
        "to_lang": "ZH",
        "speed_factor": 1,
        "client_ip": address
      }
      let response = await fetch("https://api.ttson.cn:50602/flashsummary/tts", {
        "headers": {
          "content-type": "application/json",
          "Referer": "https://www.ttson.cn/",
          "x-checkout-header": "_checkout",
          "X-Client-Header": "aab0640aebdb2fab8ca762142a935480"
        },
        "body": JSON.stringify(body),
        "method": "POST"
      });
      let res = await response.json()
      console.log(res)
      let voice_path = await res.voice_path
      let url = `https://api.ttson.cn:50602/flashsummary/retrieveFileData?user_id=user1&task_uuid=dx2oxaoa&task_type=0&download_type=0&file_name=input.mp4&voice_audio_path=${voice_path}`
      resolve(url);
    });
  });
}

async function get_ip_address() {
  try {
    const interfaces = os.networkInterfaces();
    for (const interfaceInfo of Object.values(interfaces)) {
      for (const info of interfaceInfo) {
        if (info.family === 'IPv4' && !info.internal) {
          return info.address;
        }
      }
    }
  } catch (error) {
   return "";
  }
  return "";
}

export { Anime_tts }