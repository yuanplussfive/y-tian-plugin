import { dependencies } from "../../YTdependence/dependencies.js";
const { textract } = dependencies;

async function extractTextFromBase64(mimeType, buffer) {
  try {
    buffer = Buffer.from(buffer, 'base64');
    const text = await new Promise((resolve, reject) => {
      textract.fromBufferWithMime(mimeType, buffer, {
        preserveLineBreaks: true
      }, (error, text) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(text);
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
    const text = await extractTextFromBase64(mimeType, buffer);
    return text;
  } catch (error) {
    console.error('转换失败:', error);
    return null;
  }
}