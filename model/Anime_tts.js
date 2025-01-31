async function handleTTS(e, speakers, answer, fetch, _path) {
  try {
    let record_url = await UapiTTS(answer) || await AnimeTTS(speakers, answer);
    if (record_url) {
      e.reply(segment.record(record_url));
    }
  } catch (error) {
    console.log(error)
  }

  async function AnimeTTS(speakers, text) {
    const url = `https://yuanpluss.online:3000/v1/tts/create`;
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

  async function UapiTTS(text) {
    const Apiurl = 'http://uapi.dxx.gd.cn/voice/add';
    try {
      const response = await fetch(Apiurl, {
        method: 'post',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          "type": "url",
          "model": "东雪莲",
          "text": text
        })
      });
      if (!response.ok) {
        return null;
      }
      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }
}

export { handleTTS }