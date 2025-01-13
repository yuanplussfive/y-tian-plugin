import { dependencies } from '../YTdependence/dependencies.js';
const { fs, _path, mimeTypes, axios, path } = dependencies;

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
        // OneBot 11 协议方式
        if (e.bot?.upload_group_file) {
          await e.bot.upload_group_file({
            group_id: e.group_id,
            file: filePath,
            name: path.basename(filePath)
          });
        }
        // napcat API
        else if (e.group?.upload_group_file) {
          await e.group.upload_group_file(e.group_id, filePath);
        }
        // napcat 旧版写法
        else if (e.group?.fs?.upload) {
          await e.group.fs.upload(filePath);
        }
        // icqq 写法
        else if (e.group?.sendFile) {
          await e.group.sendFile(filePath);
        }
      } else if (e.friend || e.user_id) {
        // OneBot 11 协议方式
        if (e.bot?.upload_private_file) {
          await e.bot.upload_private_file({
            user_id: e.user_id,
            file: filePath,
            name: path.basename(filePath)
          });
        }
        // napcat API
        else if (e.friend?.fs?.upload) {
          await e.friend.fs.upload(filePath);
        }
        // icqq 写法
        else if (e.friend?.sendFile) {
          await e.friend.sendFile(filePath);
        }
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
  const regex = /!?\[([^\]]*?)\]\((https:\/\/(?:filesystem\.site\/cdn\/\d{8}\/[a-zA-Z0-9]+?\.[a-z]{2,4}|yuanpluss\.online:\d+\/files\/[a-zA-Z0-9_\/]+?\.[a-z]{2,4}))\)/g;
  let match;
  let links = [];
  let extensions = new Set();
  while ((match = regex.exec(inputString)) !== null) {
    const link = match[2];
    const extension = link.split('.').pop().toLowerCase();
    if (!extensions.has(extension)) {
      links.push(link);
      extensions.add(extension);
    }
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

/**
 * 获取Base64格式的图片
 * @param {string} imageUrl - 图片URL
 * @param {string} filename - 文件名
 * @returns {Promise<string>} - Base64字符串或错误信息
 */
export async function getBase64Image(imageUrl, filename) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      validateStatus: function (status) {
        return status >= 200 && status <= 500; // 接受更广范围的状态码以处理错误
      }
    });
    if (response?.status >= 400) {
      return "该图片链接已过期，请重新获取";
    }
    // 检查是否返回了JSON错误信息(腾讯下载图床)
    if (response.headers['content-type'].includes('application/json')) {
      const textDecoder = new TextDecoder('utf-8');
      const jsonStr = textDecoder.decode(response.data);
      const jsonData = JSON.parse(jsonStr);

      if (jsonData.retmsg?.includes('expired')) {
        return "该图片链接已过期，请重新获取";
      }
    }

    const mimeType = mimeTypes.lookup(filename) || 'application/octet-stream';
    const base64 = `data:${mimeType};base64,` + Buffer.from(response.data, 'binary').toString('base64');
    return base64;
  } catch (error) {
    console.error('校验失败:', error.message);
    return "无效的图片下载链接";
  }
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