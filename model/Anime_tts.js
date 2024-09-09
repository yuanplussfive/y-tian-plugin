async function handleTTS(e, speakers, answer, WebSocket, fs, _path) {
  try {
    let record_url = await AnimeTTS(speakers, answer);
    if (record_url) {
      e.reply(segment.record(record_url));
    }
  } catch (error) {
    console.log(error)
  }

  async function AnimeTTS(speakers, text) {
    const url = 'https://u95167-bd74-2aef8085.westx.seetacloud.com:8443/flashsummary/tts';

    const headers = {
      "accept": "application/json, text/plain, */*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
      "content-type": "application/json",
      "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Microsoft Edge\";v=\"126\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "x-checkout-header": "_checkout",
      "x-client-header": "38cfc720f2531b4f7e29584374642739",
      "Referer": "https://acgn.ttson.cn/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    const body = {
      voice_id: 1936,
      text,
      format: "mp3",
      to_lang: "ZH",
      auto_translate: 0,
      voice_speed: "0%",
      speed_factor: 1,
      pitch_factor: 0,
      rate: "1.0",
      client_ip: "ACGN",
      emotion: 1
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const Path = data?.voice_path
      const video_path = 'https://api.ttson.cn:50602/flashsummary/retrieveFileData?stream=True&token=null&voice_audio_path=' + Path
      return video_path;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }
}

export { handleTTS }