import { extractFile } from '../../YTOpen-Ai/tools/textract.js';
import { getBufferFile } from '../../YTOpen-Ai/tools/UploadFile.js';
import { TotalTokens } from '../../YTOpen-Ai/tools/CalculateToken.js';
import { dependencies } from "../../YTdependence/dependencies.js";
const { mimeTypes } = dependencies;

/**
 * 处理上传文件
 * @param {string} fileUrl 文件URL
 * @param {string} fileName 文件名称
 * @param {string} userMessage 用户消息
 * @returns {Promise<string>} 处理后的消息文本
 */
export async function processUploadedFile(fileUrl, fileName, userMessage, maxTokens = 8000) {
  if (!fileName) {
    return userMessage;
  }

  try {
    const { buffer } = await getBufferFile(fileUrl, fileName) || {};
    
    const MimeType = mimeTypes.lookup(fileName) || 'application/octet-stream';

    const result = await extractFile(MimeType, buffer);

    const { completion_tokens: tokens } = await TotalTokens(result);
    console.log('文件总 token:', tokens);

    const contentText = tokens > maxTokens
      ? result.substring(0, maxTokens) + '...'
      : result;

    const separator = '='.repeat(50);

    const fileInfoText = `${separator}
文件名称: ${fileName}
${separator}
文件内容:
${contentText}
${separator}`;

    const finalMessage = `${fileInfoText}\n\n${userMessage}`;
    
    console.log('文件信息:\n', fileInfoText);
    
    return finalMessage;

  } catch (error) {
    console.error('处理文件时出错:', error);
    return userMessage;
  }
}