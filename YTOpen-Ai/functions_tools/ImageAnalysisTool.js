import { AbstractTool } from './AbstractTool.js';
import { YTalltools, getBase64Image } from '../../utils/fileUtils.js';
import { dependencies } from "../../YTdependence/dependencies.js";
const { mimeTypes } = dependencies;

/**
 * 图片处理工具类，用于处理用户的图片相关请求
 */
export class ImageAnalysisTool extends AbstractTool {
    constructor() {
        super();
        this.name = 'imageAnalysisTool';
        this.description = '当用户需要分析、处理、识别图片内容，或者询问图片相关信息时使用此工具。支持多图片分析，可提取图片中的文字信息并进行理解分析。注意：所有图片URL必须保持完整原始形式，不得修改或简化URL参数。';
        this.parameters = {
            type: "object",
            properties: {
                prompt: {
                    type: 'string',
                    description: '用户的图片处理需求描述，如果为空则进行默认的图片分析',
                },
                images: {
                    type: 'array',
                    description: '需要处理的图片链接数组。重要：必须保持原始URL的完整性，包括所有查询参数。示例链接：\n' +
                        '1. 示例1: "https://multimedia.nt.qq.com.cn/download?appid=1407&fileid=EhSpon0PNM0ysZkSasHTTFhNhPkn2xiM9ogCIP8KKPTzyfGXgYsDMgRwcm9kUIC9owFaELWsiGLkylkWILRwFGxE3cQ&spec=0&rkey=CAQSOAB6JWENi5LM1F9SWC-_lnNTz6V9r7O2ev3HX_QmYpr_odrwSXfUpXfNIyIowntqLF3KoE8inPMs"\n' +
                        '2. 示例2: "https://gchat.qpic.cn/gchatpic_new/2119611465/782312429-2903731874-87B79F5B839EA2F3AD0AD48DD539D946/0?term=2&is_origin=0"\n' +
                        '以上链接中的所有参数（特别是rkey、fileid等）都必须完整保留，不得简化或修改',
                    items: {
                        type: 'string',
                        description: '完整的图片URL，必须与原始输入完全一致。示例：\n' +
                            '"https://multimedia.nt.qq.com.cn/download?appid=1407&fileid=EhSpon0PNM0ysZkSasHTTFhNhPkn2xiM9ogCIP8KKPTzyfGXgYsDMgRwcm9kUIC9owFaELWsiGLkylkWILRwFGxE3cQ&spec=0&rkey=CAQSOAB6JWENi5LM1F9SWC-_lnNTz6V9r7O2ev3HX_QmYpr_odrwSXfUpXfNIyIowntqLF3KoE8inPMs"',
                        examples: [
                            "https://gchat.qpic.cn/gchatpic_new/2119611465/782312429-2903731874-87B79F5B839EA2F3AD0AD48DD539D946/0?term=2&is_origin=0",
                            "https://multimedia.nt.qq.com.cn/download?appid=1407&fileid=EhSpon0PNM0ysZkSasHTTFhNhPkn2xiM9ogCIP8KKPTzyfGXgYsDMgRwcm9kUIC9owFaELWsiGLkylkWILRwFGxE3cQ&spec=0&rkey=CAQSOAB6JWENi5LM1F9SWC-_lnNTz6V9r7O2ev3HX_QmYpr_odrwSXfUpXfNIyIowntqLF3KoE8inPMs"
                        ]
                    }
                }
            },
            required: ['images'],
            additionalProperties: false
        };
    }

    async processImageUrl(url) {
        if (!url) return null;

        // 处理腾讯图床链接
        if (url.includes('qq.com')) {
            const fid = url.match(/fileid=([^&]+)/)?.[1];
            const rkey = await this.getRKey(url);
            const host = await this.extractDomain(url);

            if (fid && rkey && host) {
                // 尝试不同的 appid
                for (let appid = 1407; appid >= 1403; appid--) {
                    const newUrl = `${host}/download?appid=${appid}&fileid=${fid}&spec=0&rkey=${rkey}`;
                    if (await this.isUrlAvailable(newUrl)) {
                        return newUrl;
                    }
                }
            }
        }

        return url;
    }

    async isUrlAvailable(url) {
        try {
            const response = await axios.head(url);
            const contentType = response.headers['content-type'];
            return contentType && !contentType.includes('application/json');
        } catch {
            return false;
        }
    }

    getRKey(url) {
        const rkeyMatch = url.match(/rkey=([^&]+)/);
        return rkeyMatch ? rkeyMatch[1] : null;
    }

    extractDomain(url) {
        const ampIndex = url.indexOf('&');
        return ampIndex !== -1 ? url.slice(0, ampIndex) : url;
    }

    async func(opts, e) {
        try {
            console.log(opts.images);
            // 确保 opts.images 是数组并处理每个URL
            const rawImages = Array.isArray(opts.images) ? opts.images :
                typeof opts.images === 'string' ? [opts.images] : [];

            // 处理所有图片URL
            const images = await Promise.all(
                rawImages.map(url => this.processImageUrl(url))
            );
            const prompt = opts.prompt;

            if (images.length === 0) {
                return { error: '未检测到有效的图片链接' };
            }

            // 构建图片分析消息
            let imgurls = [{
                "type": "text",
                "text": prompt || '分析图片的大致情况，详细描述, 200字概括, 如果图片含有大量的文本信息，先提取，再理解分析'
            }];

            // 处理每张图片
            for (let url of images) {
                const filetypes = "other.png";
                const img_urls = await getBase64Image(url, filetypes);

                if (img_urls.includes("该图片链接已过期")) {
                    return { error: "该图片下载链接已过期，请重新上传" };
                }
                if (img_urls.includes("无效的图片下载链接")) {
                    return { error: "无效的图片下载链接，请确保适配器支持且图片未过期" };
                }

                const mimeType = mimeTypes.lookup(filetypes) || 'application/octet-stream';
                const isImage = mimeType.startsWith('image/');

                imgurls.push(isImage ? {
                    "type": "image_url",
                    "image_url": { url: img_urls }
                } : {
                    "type": "file",
                    "file_url": { url: img_urls }
                });
            }

            const history = [{ role: "user", content: imgurls }];
            const analysis = await YTalltools(history);

            return {
                analysis: analysis,
                originalImages: images
            };

        } catch (error) {
            console.error('图片分析过程发生错误:', error);
            return { error: `图片分析失败: ${error.message}` };
        }
    }
}