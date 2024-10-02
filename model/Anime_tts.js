async function handleTTS(e, speakers, answer, fetch, _path) {
  try {
    let record_url = await AnimeTTS(speakers, answer);
    if (record_url) {
      e.reply(segment.record(record_url));
    }
  } catch (error) {
    console.log(error)
  }

  async function AnimeTTS(speakers, text) {
    const countTextElements = (text) => {
      const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
      const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
      return englishWords + chineseChars;
    };
    const words = countTextElements(text);
    if (words > 300) {
      return null;
    }
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
}

export { handleTTS }