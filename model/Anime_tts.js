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
    const url = `https://api.yujn.cn/api/yuyin.php?type=json&from=胡桃&msg=${text}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data?.url;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }
}

export { handleTTS }