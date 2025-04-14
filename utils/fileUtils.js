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
import crypto from 'crypto';
import common from '../../../lib/common/common.js';

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
 * 获取链接内容的 SHA256 哈希值
 * @param {string} url - 链接地址
 * @returns {Promise<string|null>} - 内容的哈希值，失败时返回 null
 */
async function getContentHash(url) {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const hash = crypto.createHash('sha256').update(Buffer.from(buffer)).digest('hex');
    return hash;
  } catch (error) {
    console.error(`获取 ${url} 内容失败:`, error);
    return null;
  }
}

/**
 * 解析文本中的各种格式链接并按进度百分比排序，同时基于内容去重
 * @param {string} inputString - 需要解析的输入字符串
 * @returns {Promise<Array>} - 按进度排序的去重链接数组
 */
export async function get_address(inputString) {
  // 支持的域名正则表达式
  const supportedDomains = [
    `filesystem\\.site\/cdn\/\\d{8}\/[a-zA-Z0-9\\-]+?\\.[a-z]{2,4}`,
    `yuanpluss\\.online:\\d+\/files\/[a-zA-Z0-9_\\/\\-]+?\\.[a-z]{2,4}`,
    `openai\\.yuanplus\\.chat\/files\/[a-zA-Z0-9_\\/\\-]+?\\.[a-z]{2,4}`,
    `v3\\.fal\\.media\/files\/(?:[a-zA-Z0-9_\\-]+\/)*[a-zA-Z0-9_\\-]+\\.[a-zA-Z0-9]+`,
    `sfile\\.chatglm\\.cn\/(?:[a-zA-Z0-9_\\-]+(?:-[a-zA-Z0-9_]+)*\\/)*[a-zA-Z0-9_\\-]+(?:-[a-zA-Z0-9_]+)*\\.[a-z]{2,4}`,
    `[a-zA-Z0-9\\-]+(?:\\.[a-zA-Z0-9\\-]+)*\\.oaiusercontent\\.[a-zA-Z0-9\\-.]+/files/[a-zA-Z0-9\\-/]+(?:\\?.*)?`,
    `[a-zA-Z0-9_\\-.]+\\.byteimg\\.com/[^/]+/[^~]+~tplv-[a-zA-Z0-9_\\-:.]*\\.[a-z]{2,6}(?:\\?.*)?`,
    `[a-zA-Z0-9_\\-.]+\\.vlabvod\\.com(?:/[^?#]+)?(?:\\?.*)?`,
    `[a-zA-Z0-9\\-.]+\\.filesystem\\.site\/files\/[a-zA-Z0-9\\-]+(?:\/[a-zA-Z0-9\\-]+)*(?:\\?.*)?`,
    `[a-zA-Z0-9\\-]+(?:\\.[a-zA-Z0-9\\-]+)*\\.zaiwen\\.top/images/[a-zA-Z0-9\\-]+\\.[a-z]{2,4}(?:\\?.*)?`,
    `[a-zA-Z0-9\\-]+\\.s3(?:-[a-z0-9\\-]+)?\\.amazonaws\\.com/[a-zA-Z0-9\\-./]+\\.[a-z]{2,4}(?:\\?.*)?`,
    `[a-zA-Z0-9_\\-.]+\\.hf\\.space/gradio_api/file=[^?#]+\\.[a-zA-Z0-9]{2,6}(?:\\?.*)?`,
    `[a-zA-Z0-9_\\-.]+\\.hf\\.space/file=[^?#]+\\.[a-zA-Z0-9]{2,6}(?:\\?.*)?`
  ].join('|');

  // 定义链接模式及其对应的进度提取规则
  const patterns = [
    {
      regex: `>[\\s]*\\[进度\\s*(\\d+)%\\]\\((https:\\/\\/(${supportedDomains}))\\)`,
      progressGroup: 1,
      linkGroup: 2
    },
    {
      regex: `(?:!?\\[([^进度\\]]*?)\\]\\((https:\\/\\/(${supportedDomains}))\\))`,
      progressGroup: null,
      linkGroup: 2
    },
    {
      regex: `[\\p{Emoji}\\s]*\\[([^进度\\]]*?)\\]\\((https:\\/\\/(${supportedDomains}))\\)`,
      progressGroup: null,
      linkGroup: 2
    }
  ];

  // 提取并存储链接数据
  const linkData = [];
  const seenLinks = new Set();

  for (const pattern of patterns) {
    const regex = new RegExp(pattern.regex, 'gu');
    let match;
    while ((match = regex.exec(inputString)) !== null) {
      const link = match[pattern.linkGroup];
      if (!seenLinks.has(link)) {
        seenLinks.add(link);
        const progress = pattern.progressGroup !== null
          ? parseInt(match[pattern.progressGroup])
          : null;
        linkData.push({ link, progress, originalText: match[0] });
      }
    }
  }

  // 如果数组长度小于 2，直接返回
  if (linkData.length < 2) {
    const sortedLinks = linkData.map(item => item.link);
    console.log('链接数量少于 2，无需处理:', linkData);
    return sortedLinks;
  }

  // 使用 Promise.all 进行内容去重
  const contentHashMap = new Map();
  const hashPromises = linkData.map(async (item) => {
    const hash = await getContentHash(item.link);
    if (hash) contentHashMap.set(item.link, hash);
    return { ...item, hash }; // 添加哈希值到每个项
  });

  const hashedLinkData = await Promise.all(hashPromises);

  // 基于内容去重
  const uniqueLinkData = [];
  const seenHashes = new Set();

  for (const item of hashedLinkData) {
    const hash = item.hash;
    if (hash && !seenHashes.has(hash)) {
      seenHashes.add(hash);
      uniqueLinkData.push({ link: item.link, progress: item.progress, originalText: item.originalText });
    } else if (!hash) {
      // 如果获取哈希失败，保留该链接
      uniqueLinkData.push({ link: item.link, progress: item.progress, originalText: item.originalText });
    }
  }

  // 按进度排序
  uniqueLinkData.sort((a, b) => {
    if (a.progress !== null && b.progress !== null) return a.progress - b.progress;
    if (a.progress !== null) return -1;
    if (b.progress !== null) return 1;
    return 0;
  });

  // 提取排序后的链接数组
  const sortedLinks = uniqueLinkData.map(item => item.link);

  // 输出调试信息
  console.log('解析并排序后的链接数据（内容去重后）:', uniqueLinkData);
  console.log('最终链接数组:', sortedLinks);

  return sortedLinks;
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

/**
 * 保存用户历史记录
 * 优先保存到 Redis，然后同步保存到本地 JSON 文件
 * 即使 Redis 保存成功，也会同步保存到本地
 * 如果 Redis 保存失败，仍然会保存到本地文件
 * @param {string} userId - 用户 ID
 * @param {string} dirpath - 本地存储目录路径
 * @param {Array} history - 用户历史记录数组
 */
export async function saveUserHistory(userId, dirpath, history, type) {
  const redisKey = `YTUSER_${type}:${userId}`;
  const historyPath = path.join(dirpath, 'user_cache', `${userId}.json`);
  try {
    const lastSystemMessage = history.filter(item => item.role === 'system').pop();
    if (lastSystemMessage) {
      history = history.filter(item => item.role !== 'system');
      history.unshift(lastSystemMessage);
    }
    const historyJson = JSON.stringify(history, null, 2);
    try {
      await redis.set(redisKey, historyJson);
      console.log(`用户历史已保存到 Redis: ${userId}`);
    } catch (redisErr) {
      console.error(`保存用户历史到 Redis 失败: ${redisErr}`);
    }
    const dir = path.dirname(historyPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(historyPath, historyJson, { encoding: 'utf-8' });
    console.log(`用户历史已保存到本地文件: ${historyPath}`);
  } catch (err) {
    console.error(`保存用户历史失败: ${err}`);
  }
}

export async function handleImages(e, urls, _path) {
  // 如果没有URLs，直接返回
  if (!urls || urls.length === 0) {
    return ["预览"];
  }

  // 并行下载所有图片
  const downloadPromises = urls.map(async (url, index) => {
    const filePath = path.join(_path, 'resources', `dall_e_chat_${index}.png`);
    try {
      const result = await downloadImage(url, filePath);
      if (result.success) {
        // 下载成功返回文件路径
        return { success: true, path: filePath };
      } else {
        // 下载失败返回URL
        return { success: false, url: url.trim() };
      }
    } catch (error) {
      console.error(`下载失败: ${url}`, error);
      return { success: false, url: url.trim() };
    }
  });

  try {
    // 等待所有下载完成
    const results = await Promise.all(downloadPromises);

    // 初始化结果数组
    const imageResults = ["预览"];

    // 收集所有成功下载的图片
    const successfulImages = results
      .filter(result => result.success)
      .map(result => segment.image(result.path));

    // 如果有成功下载的图片，一次性发送
    if (successfulImages.length > 0) {
      await e.reply(successfulImages);
    }

    // 将失败的URL添加到结果数组
    results.forEach(result => {
      if (!result.success) {
        imageResults.push(result.url);
      }
    });

    return imageResults;
  } catch (error) {
    console.error('处理图片时发生错误:', error);
    return ["预览", "处理图片时发生错误"];
  }
}

/**
* 将长文本消息分段添加到转发消息数组
* @param {Object} e 事件对象
* @param {String|Array} messages 要发送的消息
* @param {Number} maxLength 单段最大长度，默认1000字符
*/
export async function sendLongMessage(e, messages, forwardMsg, maxLength = 1000) {
  // 如果是字符串，转换为数组处理
  const msgArray = typeof messages === 'string' ? [messages] : messages;

  try {
    // 先尝试直接将所有消息添加到转发消息中
    const directForwardMsg = [...forwardMsg];
    msgArray.forEach(msg => directForwardMsg.push(msg));

    // 尝试一次性发送所有消息
    const jsonPart = await common.makeForwardMsg(e, directForwardMsg, 'Preview');
    await e.reply(jsonPart);
    logger.info('消息已成功一次性发送');

  } catch (error) {
    logger.warn(`一次性发送失败，将尝试分段发送: ${error.message}`);

    try {
      // 创建新的转发消息数组
      const segmentedForwardMsg = [...forwardMsg];

      // 对每条消息进行处理
      for (let msg of msgArray) {
        if (typeof msg === 'string' && msg.length > maxLength) {
          // 计算需要分成几段
          const segmentCount = Math.ceil(msg.length / maxLength);
          logger.info(`消息长度为${msg.length}，将分为${segmentCount}段发送`);

          // 分段处理文本
          for (let i = 0; i < segmentCount; i++) {
            const start = i * maxLength;
            const end = Math.min(start + maxLength, msg.length);
            const segment = msg.substring(start, end);

            if (segment.trim()) {
              segmentedForwardMsg.push(segment);
            }
          }
        } else {
          segmentedForwardMsg.push(msg);
        }
      }

      // 生成转发消息并发送
      const jsonPart = await common.makeForwardMsg(e, segmentedForwardMsg, 'Preview');
      await e.reply(jsonPart);
      logger.info('消息已成功分段发送');

    } catch (secondError) {
      logger.error(`分段发送也失败了: ${secondError.message}`);
      await e.reply('消息发送失败，请稍后重试');
    }
  }
}

/**
 * 从 Redis 加载数据，如果失败则从本地文件读取
 * @param {string} redisKey - Redis 的键
 * @param {string} filePath - 本地文件路径
 * @returns {Array} 加载的数据
 */
export async function loadData(redisKey, filePath) {
  try {
    const data = await redis.get(redisKey);
    if (data) {
      console.log(`从 Redis 加载数据成功: ${redisKey}`);
      return JSON.parse(data);
    } else {
      console.log(`Redis 中没有数据，尝试从本地文件加载: ${filePath}`);
      if (fs.existsSync(filePath)) {
        const fileData = await fs.promises.readFile(filePath, 'utf-8');
        const parsedData = JSON.parse(fileData);
        try {
          // 将本地数据缓存到 Redis
          await redis.set(redisKey, JSON.stringify(parsedData));
          console.log(`将本地数据缓存到 Redis 成功: ${redisKey}`);
        } catch (err) {
          console.error(`将本地数据缓存到 Redis 失败: ${err}`);
        }
        return parsedData;
      } else {
        console.log(`本地文件不存在: ${filePath}`);
        return [];
      }
    }
  } catch (err) {
    console.error(`从 Redis 加载数据失败: ${err}，尝试从本地文件加载`);
    try {
      if (fs.existsSync(filePath)) {
        const fileData = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(fileData);
      } else {
        console.log(`本地文件不存在: ${filePath}`);
        return [];
      }
    } catch (fileErr) {
      console.error(`从本地文件加载数据失败: ${fileErr}`);
      return [];
    }
  }
}

/**
 * 加载用户历史记录
 * 优先从 Redis 获取，如果失败则从本地 JSON 文件读取
 * @param {string} userId - 用户 ID
 * @param {string} dirpath - 本地存储目录路径
 * @returns {Array} 用户历史记录数组
 */
export async function loadUserHistory(userId, dirpath, type) {
  const redisKey = `YTUSER_${type}:${userId}`;
  const historyPath = path.join(dirpath, 'user_cache', `${userId}.json`);
  try {
    const data = await redis.get(redisKey);
    if (data) {
      console.log(`从 Redis 加载用户历史成功: ${userId}`);
      return JSON.parse(data);
    } else {
      console.log(`Redis 中没有数据，尝试从本地文件加载: ${historyPath}`);
      if (fs.existsSync(historyPath)) {
        const fileData = fs.readFileSync(historyPath, 'utf-8');
        const parsedData = JSON.parse(fileData);
        try {
          await redis.set(redisKey, JSON.stringify(parsedData));
          console.log(`将本地数据缓存到 Redis 成功: ${userId}`);
        } catch (err) {
          console.error(`将本地数据缓存到 Redis 失败: ${err}`);
        }
        return parsedData;
      } else {
        console.log(`本地文件不存在: ${historyPath}`);
        return [];
      }
    }
  } catch (err) {
    console.error(`从 Redis 加载用户历史失败: ${err}，尝试从本地文件加载`);
    try {
      if (fs.existsSync(historyPath)) {
        const fileData = fs.readFileSync(historyPath, 'utf-8');
        return JSON.parse(fileData);
      } else {
        console.log(`本地文件不存在: ${historyPath}`);
        return [];
      }
    } catch (fileErr) {
      console.error(`从本地文件加载用户历史失败: ${fileErr}`);
      return [];
    }
  }
}

/**
 * 保存数据到 Redis，并同步保存到本地文件
 * @param {string} redisKey - Redis 的键
 * @param {string} filePath - 本地文件路径
 * @param {Array} data - 要保存的数据
 * @returns {Object} 保存结果
 */
export async function saveData(redisKey, filePath, data) {
  const dataJson = JSON.stringify(data, null, 2);
  try {
    // 尝试保存到 Redis
    await redis.set(redisKey, dataJson);
    console.log(`数据已保存到 Redis: ${redisKey}`);
  } catch (redisErr) {
    console.error(`保存数据到 Redis 失败: ${redisErr}`);
  }

  try {
    // 同步保存到本地文件
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    await fs.promises.writeFile(filePath, dataJson, 'utf-8');
    console.log(`数据已保存到本地文件: ${filePath}`);
  } catch (fileErr) {
    console.error(`保存数据到本地文件失败: ${fileErr}`);
  }

  return { success: true };
}

export async function downloadImage(url, filePath) {
  const fileExtension = path.extname(url).toLowerCase();
  if (!['.webp', '.png', '.jpg'].includes(fileExtension)) {
    return { success: false };
  }

  const downloadTimeout = 40000;
  let downloadAborted = false;

  const downloadPromise = async () => {
    try {
      const response = await axios({
        url: url.trim(),
        method: 'GET',
        responseType: 'stream'
      });

      if (response.status >= 400) {
        throw new Error(`Failed to download ${url}: ${response.status}`);
      }

      const file = fs.createWriteStream(filePath);
      response.data.pipe(file);

      await new Promise((resolve, reject) => {
        file.on('finish', resolve);
        file.on('error', reject);
      });

      if (!downloadAborted) {
        return { success: true };
      }
      return { success: false };

    } catch (err) {
      console.error(err);
      return { success: false };
    }
  };

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => {
      downloadAborted = true;
      reject(new Error('Download timed out'));
    }, downloadTimeout)
  );

  try {
    const result = await Promise.race([downloadPromise(), timeoutPromise]);
    return result;
  } catch (err) {
    console.error(err);
    return { success: false };
  }
}