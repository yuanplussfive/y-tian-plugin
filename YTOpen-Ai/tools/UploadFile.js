import axios from '../../node_modules/axios/index.js';
import { dependencies } from "../../YTdependence/dependencies.js";
const { mimeTypes } = dependencies;

/**
* 获取引用消息
* @param {object} e - 消息事件
* @param {object} options - 可选参数
* @param {boolean} options.img - 是否获取图片直链
* @param {boolean} options.file - 是否获取文件下载链接
* @returns {Promise<Array|string|false>} 获取到的消息链或false
*/
export async function takeSourceMsg(e, { img, file } = {}) {
  let source = ""
  if (e.getReply) {
    source = await e.getReply()
  } else if (e.source) {
    if (e.group?.getChatHistory) {
      source = (await e.group.getChatHistory(e.source.seq, 1)).pop()
    } else if (e.friend?.getChatHistory) {
      source = (await e.friend.getChatHistory(e.source.time, 1)).pop()
    }
  }
  //console.log(source);
  if (!source) return false
  if (img) {
    let imgArr = []
    for (let i of source.message) {
      if (i.type == "image") {
        imgArr.push(i.url)
      }
    }
    return !_.isEmpty(imgArr) && imgArr
  }
  if (file) {
    if (source.message[0].type === "file") {
      let { fid } = source.message[0]
      return fid && e.group_id ? e?.group?.getFileUrl(fid) : e?.friend?.getFileUrl(fid)
    }
    return false
  }
  return source
}

async function TakeImages(e) {
  const getImageUrl = async (message) => {
    async function isUrlAvailable(url) {
      try {
        const response = await axios.get(url);
        const contentType = response.headers['content-type'];
        return !contentType || !contentType.includes('application/json');
      } catch (error) {
        //console.error('请求出错:', error.message);
        return false;
      }
    }

    async function processUrl(url, fid) {
      if (url.includes('rkey=') && !url.includes('fileid=') && !url.includes(fid)) {
        const rkey = await getRKey(url);
        const host = await extractDomain(url);
        let appid = 1407;
        let attempts = 0;
        while (attempts < 5) {
          const customUrl = `${host}/download?appid=${appid}&fileid=${fid}&spec=0&rkey=${rkey}`;
          //console.log(customUrl)
          if (await isUrlAvailable(customUrl)) {
            return customUrl;
          }
          appid--;
          attempts++;
        }
      }
      return url;
    }

    for (const { type, url, fid } of message) {
      if ((type === "image" || type === "file") && url) {
        return await processUrl(url, fid);
      }
    }
    return null;
  };

  let imgurl = e.getReply ? await e.getReply() : null;
  if (!imgurl && e.source) {
    const chatHistory = e.group?.getChatHistory || e.friend?.getChatHistory;
    if (chatHistory) {
      const seq = e.group ? e.source.seq : e.source.time;
      imgurl = (await chatHistory.call(e.group || e.friend, seq, 1)).pop();
    }
  }
  imgurl = imgurl?.message ? await getImageUrl(imgurl.message) : null;
  const img_urls = e.message ? await Promise.all(e.message.map(async (msg) => await getImageUrl([msg]))) : [];
  imgurl = imgurl ? [imgurl] : img_urls.filter(Boolean);
  return imgurl;
}

async function getRKey(url) {
  const rkeyParam = 'rkey=';
  const rkeyStartIndex = url.indexOf(rkeyParam);
  if (rkeyStartIndex === -1) return null;
  const actualStartIndex = rkeyStartIndex + rkeyParam.length;
  const rkeyEndIndex = url.indexOf('&', actualStartIndex);
  const rkey = rkeyEndIndex === -1
    ? url.substring(actualStartIndex)
    : url.substring(actualStartIndex, rkeyEndIndex);
  return rkey;
}

async function extractDomain(url) {
  const ampIndex = url.indexOf('&');
  if (ampIndex !== -1) {
    return url.slice(0, ampIndex);
  }
  return url;
}

export async function TakeFiles(e) {
  let files = await getFileUrl(e, e.group_id ? 'group' : 'friend');
  if (files) {
    files = [files]
  }
  return files
}

export async function getBufferFile(fileUrl, filename) {
  try {
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
      validateStatus: function (status) {
        return status >= 200 && status <= 500;
      }
    });
    if (response?.status >= 400) {
      return {
        type: null,
        buffer: null
      }
    }
    if (response.headers['content-type'].includes('application/json')) {
      const textDecoder = new TextDecoder('utf-8');
      const jsonStr = textDecoder.decode(response.data);
      const jsonData = JSON.parse(jsonStr);

      if (jsonData.retmsg?.includes('expired')) {
        return {
          type: null,
          buffer: null
        }
      }
    }

    const mimeType = mimeTypes.lookup(filename) || 'application/octet-stream';
    return {
      type: mimeType,
      buffer: Buffer.from(response.data, 'binary').toString('base64')
    }
  } catch (error) {
    console.error('校验失败:', error.message);
    return {
      type: null,
      buffer: null
    }
  }
}