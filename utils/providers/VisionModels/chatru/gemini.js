import { chatru } from '../../ChatModels/chatru/chatru.js';
import { getBase64File } from '../../../fileUtils.js';

export const Chatru_gemini = async (messages, fileUrl) => {
    let imgurls = [{
        "type": "text",
        "text": `You'd better use the language I use to answer me\n\n${messages[messages.length - 1].content}`
    }]
    for (let url of fileUrl) {
        const filetypes = "1.png"
        const img_urls = await getBase64File(url, filetypes, 'img');
        
        // 检查是否为base64格式
        if (!img_urls.startsWith('data:image')) {
            // 如果不是base64格式，直接返回错误信息
            return "图片格式无效或未能正确转换为base64格式，请确保图片链接有效并重新上传";
        }

        imgurls.push({
            "type": "image_url",
            "image_url": {
                url: img_urls
            }
        });
    }
    console.log(imgurls)
    const result = await chatru([{ role: 'user', content: imgurls }], 'gemini-1.5-flash');
    return result;
}