async function getAudioFromTPS_1(message) {
  const url = `https://api.lolimi.cn/API/yyhc/dxl.php?msg=${message}`
    try {
     let response = await fetch(url);
     const data = await response.json();
     return data.music;
   } catch {
    return null;
   }   
}

module.exports = { getAudioFromTPS_1 }

