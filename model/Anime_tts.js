import fetch from 'node-fetch';
import yaml from 'yaml'
import fs from "fs"
const _path = process.cwd()

async function Anime_tts(speakers, answer) {
const yamlStr = fs.readFileSync(_path+'/data/YTtts_Setting/Setting.yaml', 'utf8');
const config = yaml.parse(yamlStr);
const session_hash = Math.random().toString(36).substring(2);

 const body = {
    "data": [
      answer,
      speakers,
      config.motion,
      config.sdp_ratio,
      config.noise,
      config.noise_w,
      config.length,
      "ZH",
      null
    ],
    "event_data": null,
    "fn_index": 2,
    "session_hash": session_hash
  };

  return new Promise((resolve, reject) => {
    fetch("https://v2.genshinvoice.top/run/predict", {
      "headers": {
        "content-type": "application/json",
        "Referer": "https://v2.genshinvoice.top/"
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
      let record_name = res.data[1].name;
      record_name = "https://v2.genshinvoice.top/file=" + record_name;
      resolve(record_name);
    })
    .catch(error => {
      console.error('Error:', error);
      reject(error);
    });
  });
}

export { Anime_tts };










