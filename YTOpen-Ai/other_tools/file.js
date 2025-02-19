import { dependencies } from "../../YTdependence/dependencies.js";
const { textract, require } = dependencies;
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;

async function extractTextFromBase64(mimeType, buffer) {
  try {
    buffer = Buffer.from(buffer, 'base64');
    
    // 针对PDF文件的处理
    if (mimeType === 'application/pdf') {
      try {
        const data = await pdfParse(buffer);
        return data.text;
      } catch (pdfError) {
        console.error('PDF解析失败:', pdfError);
        return null;
      }
    }

    // 针对纯文本类型文件的处理
    const textTypes = [
      'text/plain',
      'text/x-python',  // Python文件
      'application/x-python-code',
      'text/x-script.python',
      'application/octet-stream'  // 通用二进制流
    ];

    if (textTypes.includes(mimeType)) {
      try {
        return buffer.toString('utf-8');
      } catch (textError) {
        console.error('文本解析失败:', textError);
        return null;
      }
    }

    // 其他文件类型使用textract
    const text = await new Promise((resolve, reject) => {
      textract.fromBufferWithMime(mimeType, buffer, {
        preserveLineBreaks: true,
        // 添加更多文件类型支持
        typeOverride: {
          'application/octet-stream': function(type) {
            return buffer.toString('utf-8');
          }
        }
      }, (error, text) => {
        if (error) {
          // 如果textract失败，尝试直接读取为文本
          try {
            const textContent = buffer.toString('utf-8');
            resolve(textContent);
          } catch (fallbackError) {
            reject(error);
          }
        } else {
          resolve(text);
        }
      });
    });
    return text;
  } catch (error) {
    console.error('处理 base64 数据失败:', error);
    return null;
  }
}

export async function extractFile(mimeType, buffer) {
  try {
    // 处理MIME类型
    if (!mimeType || mimeType === 'application/octet-stream') {
      // 通过文件内容特征判断是否为Python文件
      const content = Buffer.from(buffer, 'base64').toString('utf-8');
      if (content.includes('def ') || content.includes('import ') || content.includes('class ')) {
        mimeType = 'text/x-python';
      }
    }
    
    const text = await extractTextFromBase64(mimeType, buffer);
    return text;
  } catch (error) {
    console.error('转换失败:', error);
    return null;
  }
}