const _path = process.cwd()
import { createRequire } from 'module'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
import axios from "../node_modules/axios/index.js";
const mimeTypesPath = join(__dirname, '../node_modules/mime-types');
const mimeTypes = require(mimeTypesPath);
import fs from "fs";
import path from "path";

/**
 * 获取文件扩展名
 * @param {string} url - 文件URL
 * @returns {Promise<string>} - 文件扩展名
 */
export async function getFileExtensionFromUrl(url) {
  try {
    const response = await axios.head(url);
    const contentType = response.headers['content-type'];
    const extension = mimeTypes.extensions[contentType.split(';')[0]];
    return extension ? `.${extension[0]}` : '无法识别的文件类型';
  } catch (error) {
    console.error('获取文件扩展名失败:', error.message);
    return '无法识别的文件类型';
  }
}

/**
 * 将数组分块
 * @param {Array} array - 原数组
 * @param {number} size - 每块大小
 * @returns {Array<Array>} - 分块后的二维数组
 */
export function chunk(array, size) {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, index) =>
    array.slice(index * size, (index + size))
  );
}

/**
 * 下载并保存文件
 * @param {string} url - 文件URL
 * @param {string} originalFileName - 原始文件名
 * @param {object} path - path模块
 * @param {function} fetch - fetch函数
 * @param {string} _path - 基础路径
 * @param {object} fs - fs模块
 * @param {object} e - 事件对象
 * @returns {Promise<Object>} - 下载结果
 */
export async function downloadAndSaveFile(url, originalFileName, e) {
  try {
    const response = await fetch(url.trim());
    const fileBuffer = await response.arrayBuffer();

    // 文件名称处理
    const timestamp = new Date().getTime();
    let finalFileName = '';
    let fileExtension = '';

    // 尝试从原始文件名获取扩展名
    if (originalFileName) {
      fileExtension = path.extname(originalFileName);
      // 如果原始文件名有效，使用原始文件名
      if (fileExtension) {
        const baseName = path.basename(originalFileName, fileExtension);
        finalFileName = `${baseName}_${timestamp}${fileExtension}`;
      }
    }

    // 如果没有有效的原始文件名，尝试从URL获取
    if (!finalFileName) {
      fileExtension = path.extname(url) || await getFileExtensionFromUrl(url);
      if (!fileExtension || fileExtension === '无法识别的文件类型') {
        fileExtension = '.unknown';
      }
      finalFileName = `file_${timestamp}${fileExtension}`;
    }

    // 确保目录存在
    const saveDir = path.join(_path, 'resources/YT_alltools');
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }

    const filePath = path.join(saveDir, finalFileName);
    fs.writeFileSync(filePath, Buffer.from(fileBuffer));

    // 发送非图片文件
    const imageExtensions = ['.webp', '.png', '.jpg', '.jpeg', '.gif'];
    if (!imageExtensions.includes(fileExtension.toLowerCase())) {
      if (e.group_id) {
        await e.group.sendFile(filePath);
      } else {
        await e.friend.sendFile(filePath);
      }
    }

    return {
      success: true,
      filePath,
      fileName: finalFileName
    };

  } catch (error) {
    console.error(`文件下载保存失败: ${url}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 解析文本中的链接
 * @param {string} inputString - 输入字符串
 * @returns {Promise<Array>} - 链接数组
 */
export async function get_address(inputString) {
  const filesystemSiteRegex = `filesystem\\.site\/cdn\/\\d{8}\/[a-zA-Z0-9]+?\\.[a-z]{2,4}`;
  const yuanplussOnlineRegex = `yuanpluss\\.online:\\d+\/files\/[a-zA-Z0-9_\\/]+?\\.[a-z]{2,4}`;
  const openaiYuanplusChatRegex = `openai\\.yuanplus\\.chat\/files\/[a-zA-Z0-9_\\/]+?\\.[a-z]{2,4}`;

  const exclamationMarkRegex = `!\\[([^\\]]*?)\\]\\((https:\\\/\\\/(${filesystemSiteRegex}|${yuanplussOnlineRegex}|${openaiYuanplusChatRegex}))\\)`;
  const noExclamationMarkRegex = `\\[([^\\]]*?)\\]\\((https:\\\/\\\/(${filesystemSiteRegex}|${yuanplussOnlineRegex}|${openaiYuanplusChatRegex}))\\)`;

  let links = [];

  const exclamationRegex = new RegExp(exclamationMarkRegex, "g");
  let exclamationMatch;
  while ((exclamationMatch = exclamationRegex.exec(inputString)) !== null) {
    const link = exclamationMatch[2];
    links.push(link);
  }

  if (links.length >= 1) {
    console.log(links);
    return links;
  }

  const noExclamationRegex = new RegExp(noExclamationMarkRegex, "g");
  let noExclamationMatch;
  while ((noExclamationMatch = noExclamationRegex.exec(inputString)) !== null) {
    const link = noExclamationMatch[2];
    links.push(link);
  }

  console.log(links);
  return links;
}

/**
 * 移除重复链接
 * @param {Array} array - 链接数组
 * @returns {Promise<Array>} - 去重后的链接数组
 */
export async function removeDuplicates(array) {
  const result = array.filter((item, index) => {
    if (item.indexOf('/cdn/download/') == -1) {
      return true;
    } else {
      const nonDownloadUrl = item.replace('/cdn/download/', '/cdn/');
      return array.indexOf(nonDownloadUrl) == -1;
    }
  });
  return result;
}

export async function PluginUploadFile(base64Data, filename) {
  try {
    const response = await fetch('https://openai.yuanplus.chat/v2/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        base64Data: base64Data,
        filename: filename
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log(data);
      return data;
    } else {
      return {};
    }

  } catch (error) {
    console.error('上传错误:', error);
    return {};
  }
}

export async function getBase64Image(imageUrl, filename) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
      maxRedirects: 5,
      maxBodyLength: 15 * 1024 * 1024,
      validateStatus: function (status) {
        return status >= 200 && status <= 500;
      }
    });

    if (response?.status >= 400) {
      return "该图片链接已过期，请重新获取";
    }

    // 检查是否返回了JSON错误信息(腾讯下载图床)
    if (response.headers['content-type']?.includes('application/json')) {
      const text = Buffer.from(response.data).toString();
      if (text.includes('retmsg') || text.includes('expired') || text.includes('error')) {
        return "该图片链接已过期，请重新获取";
      }
    }

    const buffer = Buffer.from(response.data);
    // 检查是否是有效的图片格式
    if (!isBufferImage(buffer)) {
      return "无效的图片格式";
    }

    const mimeType = mimeTypes.lookup(filename) || 'application/octet-stream';
    const base64 = `data:${mimeType};base64,` + buffer.toString('base64');
    return base64;

  } catch (error) {
    console.error('校验失败:', error.message);
    return "无效的图片下载链接";
  }
}

/**
 * 获取Base64格式的文件
 * @param {string} fileUrl - 文件URL
 * @param {string} filename - 文件名
 * @param {string} type - 文件类型('file'或'img')
 * @returns {Promise<string>} - Base64字符串或错误信息
 */
export async function getBase64File(fileUrl, filename, type = 'file') {
  try {
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
      timeout: 60000, // 设置超时时间为60秒
      maxRedirects: 5, // 设置最大重定向次数
      maxBodyLength: 20 * 1024 * 1024,
      validateStatus: function (status) {
        return status >= 200 && status <= 500;
      }
    });

    if (response?.status >= 400) {
      return "该文件链接已过期，请重新获取";
    }

    // 检查是否返回了JSON错误信息
    if (response.headers['content-type']?.includes('application/json')) {
      const text = Buffer.from(response.data).toString();
      if (text.includes('retmsg') || text.includes('expired') || text.includes('error')) {
        return "该文件链接已过期，请重新获取";
      }
    }

    const buffer = Buffer.from(response.data);

    // 如果是图片类型，需要验证图片格式
    if (type === 'img' && !isBufferImage(buffer)) {
      return "无效的图片格式";
    }

    // 获取MIME类型
    const mimeType = getMimeType(filename, type);
    const base64 = `data:${mimeType};base64,` + buffer.toString('base64');
    return base64;

  } catch (error) {
    console.error('校验失败:', error.message);
    return type === 'img' ? "无效的图片下载链接" : "无效的文件下载链接";
  }
}

/**
* 获取文件的MIME类型
* @param {string} filename - 文件名
* @param {string} type - 文件类型('file'或'img')
* @returns {string} - MIME类型
*/
function getMimeType(filename, type) {
  const mimeType = mimeTypes.lookup(filename);

  if (mimeType) return mimeType;

  // 默认MIME类型
  if (type === 'img') {
    return 'image/jpeg';
  }
  return 'application/octet-stream';
}

/**
* 检查是否是有效的图片格式
* @param {Buffer} buffer - 文件buffer
* @returns {boolean} - 是否为有效图片
*/
function isBufferImage(buffer) {
  const imageSignatures = {
    jpeg: ['FF', 'D8'],
    png: ['89', '50', '4E', '47'],
    gif: ['47', '49', '46'],
    webp: ['52', '49', '46', '46'],
    bmp: ['42', '4D']
  };

  const fileHeader = [...buffer.slice(0, 8)].map(byte =>
    byte.toString(16).padStart(2, '0').toUpperCase()
  );

  return Object.values(imageSignatures).some(signature =>
    signature.every((byte, index) => fileHeader[index] === byte)
  );
}

/**
 * 获取聊天中的图片链接
 * @param {Object} e - 事件对象
 * @returns {Promise<Array>} - 图片URL数组
 */
export async function TakeImages(e) {
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
          const customUrl = `${host}/download?appid=${appid}&fileid=${fid}&rkey=${rkey}`;
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

/**
 * 获取rkey参数
 * @param {string} url - URL字符串
 * @returns {Promise<string|null>} - rkey值或null
 */
export async function getRKey(url) {
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

/**
 * 提取URL的域名部分
 * @param {string} url - URL字符串
 * @returns {Promise<string>} - 域名
 */
export async function extractDomain(url) {
  const ampIndex = url.indexOf('&');
  if (ampIndex !== -1) {
    return url.slice(0, ampIndex);
  }
  return url;
}

export async function YTOtherModels(messages, model) {
  const dirpath = `${_path}/data/YTotherai`;
  const dataPath = dirpath + "/data.json";
  const data = JSON.parse(await fs.promises.readFile(dataPath, "utf-8"));
  const token = data.chatgpt.stoken;
  try {
    const url = 'https://yuanpluss.online:3000/api/v1/chat/completions';
    const data = {
      model,
      messages
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    //console.log(response.ok)
    const responseData = await response.json();
    if (responseData.error) {
      console.log(responseData)
      return responseData.error;
    }
    console.log(responseData);
    return responseData?.choices[0]?.message?.content;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function YTalltools(messages) {
  const dirpath = `${_path}/data/YTotherai`;
  const dataPath = dirpath + "/data.json";
  const data = JSON.parse(await fs.promises.readFile(dataPath, "utf-8"));
  const token = data.chatgpt.stoken;
  try {
    const url = 'https://yuanpluss.online:3000/api/v1/chat/completions';
    const data = {
      model: 'gpt-4o-all',
      messages
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    //console.log(response.ok)
    const responseData = await response.json();
    if (responseData.error) {
      return responseData.error;
    }
    console.log(responseData);
    return responseData?.choices[0]?.message?.content;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getResponse(messages, model, services) {
  for (const service of services) {
    try {
      const result = await Promise.race([
        service(messages, model),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 360000)
        ),
      ]);
      if (result) {
        console.log(`${service.name} succeeded.`);
        return result;
      }
    } catch (error) {
      console.error(`${service.name} failed: ${error.message}`);
    }
  }
  console.error('All services failed.');
  return null;
}

/**
* 获取引用消息
* @param {object} e - 消息事件
* @param {object} options - 可选参数
* @param {boolean} options.img - 是否获取图片直链
* @param {boolean} options.file - 是否获取文件下载链接
* @returns {Promise<Array|string|false>} 获取到的消息链或false
*/
async function takeSourceMsg(e, { img, file } = {}) {
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

/**
 * 获取文件URL和文件名
 * @param {Object} e - 事件对象
 * @returns {Promise<{fileUrl: string, fileName: string}>}
 */
export async function getFileInfo(e) {
  try {
    const ncResult = await getFileUrl(e);
    if (ncResult?.fileUrl) {
      return {
        fileUrl: ncResult.fileUrl,
        fileName: ncResult.fileName
      };
    }

    const sourceFiles = await takeSourceMsg(e, { file: true });
    if (!sourceFiles) {
      return {};
    }

    let fileName;
    if (e.group?.getChatHistory) {
      const [history] = await e.group.getChatHistory(e.source.seq, 1).then(hist => hist.slice(-1));
      fileName = history?.message[0]?.name;
    } else if (e.friend?.getChatHistory) {
      const [history] = await e.friend.getChatHistory(e.source.time, 1).then(hist => hist.slice(-1));
      fileName = history?.message[0]?.name;
    }

    return {
      fileUrl: sourceFiles,
      fileName
    };
  } catch (error) {
    console.error('获取文件信息失败:', error);
    return {};
  }
}

async function getFileUrl(e) {
  if (!e?.reply_id) return {};

  const replyMsg = await getReplyMsg(e);
  const messages = replyMsg?.message;

  if (!Array.isArray(messages)) return {};

  for (const msg of messages) {
    if (msg.type === 'file') {
      const file_id = msg.data?.file_id;

      // 判断是群聊还是私聊
      if (e.group_id) {
        // 群聊文件
        const { data: { url } } = await e.bot.sendApi("get_group_file_url", {
          group_id: e.group_id,
          file_id
        });
        const filename = await extractFileExtension(file_id);
        return {
          fileUrl: `${url}file.${filename}`,
          fileName: `file.${filename}`
        };
      } else {
        // 私聊文件
        const { data: { url } } = await e.bot.sendApi("get_private_file_url", {
          user_id: e.user_id,
          file_id
        });
        const filename = await extractFileExtension(file_id);
        return {
          fileUrl: `${url}file.${filename}`,
          fileName: `file.${filename}`
        };
      }
    }
  }

  return {};
}

async function getReplyMsg(e) {
  try {
    let historyResponse;

    // 判断是群聊还是私聊
    if (e.group_id) {
      // 群聊消息历史
      historyResponse = await e.bot.sendApi("get_group_msg_history", {
        group_id: e.group_id,
        count: 1,
      });
    } else {
      // 私聊消息历史
      historyResponse = await e.bot.sendApi("get_private_msg_history", {
        user_id: e.user_id,
        count: 1,
      });
    }

    if (!historyResponse?.data?.messages || historyResponse.data.messages.length === 0) {
      return null;
    }

    const recentMessage = historyResponse.data.messages[0];
    const messageId = recentMessage?.message?.[0]?.data?.id;

    if (!messageId) {
      return null;
    }

    const messageResponse = await e.bot.sendApi("get_msg", {
      message_id: messageId,
    });

    if (!messageResponse?.data) {
      return null;
    }

    return messageResponse.data;

  } catch (error) {
    console.error("getReplyMsg:", error);
    return null;
  }
}

async function extractFileExtension(filename) {
  const match = filename.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1] : null;
}