import { AbstractTool } from './AbstractTool.js';
import { callGeminiAPI, handleGeminiResult, handleGeminiImage } from "../../YTOpen-Ai/GeminiAPI.js";

/**
 * 图片编辑工具类，用于处理用户的图片相关请求
 */
export class GoogleImageEditTool extends AbstractTool {
    constructor() {
        super();
        this.name = 'googleImageEditTool';
        this.description = '使用Google Gemini处理用户的任意图片（或用户的群聊头像），支持编辑、识别或分析图片内容。当用户请求处理图片/头像或识别图片细节时调用此工具，例如“识别这张图片的内容”或“编辑这张风景照”，“把我的头像改成红色”。';
        this.parameters = {
            type: 'object',
            properties: {
                prompt: {
                    type: 'string',
                    description: '用户对图片的处理或识别需求，例如“识别图片中的物体”“将图片转为黑白”“分析这张照片的内容”',
                    examples: ['把这张图片调亮', '告诉我这张图片里有什么']
                },
                images: {
                    type: 'array',
                    description: '用户提供的任意图片链接数组。必须保留原始URL完整性，包括所有查询参数。对于QQ头像，需要拼接反馈标准化链接如"https://q1.qlogo.cn/g?b=qq&nk=用户QQ号&s=640"。示例：\n' +
                        '1. "https://multimedia.nt.qq.com.cn/download?appid=1407&fileid=EhSpon0PNM0ysZkSasHTTFhNhPkn2xiM9ogCIP8KKPTzyfGXgYsDMgRwcm9kUIC9owFaELWsiGLkylkWILRwFGxE3cQ&spec=0&rkey=CAQSOAB6JWENi5LM1F9SWC-_lnNTz6V9r7O2ev3HX_QmYpr_odrwSXfUpXfNIyIowntqLF3KoE8inPMs"\n' +
                        '2. "https://gchat.qpic.cn/gchatpic_new/2119611465/782312429-2903731874-87B79F5B839EA2F3AD0AD48DD539D946/0?term=2&is_origin=0"' +
                        '3. "https://q1.qlogo.cn/g?b=qq&nk=116789034&s=640"',
                    items: {
                        type: 'string',
                        description: '完整的图片URL，必须与用户输入一致'
                    }
                }
            },
            required: ['prompt', 'images'],
            additionalProperties: false
        };
    }

    async func(opts, e) {
        try {
            console.log(opts.images);
            const result = await callGeminiAPI(opts.prompt, opts.images, {
                model: "gemini-2.0-flash-exp-image-generation",
                responseModalities: ['TEXT', 'IMAGE'],
                config: {
                    temperature: 0.8
                }
            });
            const output = await handleGeminiImage(result, e);
            console.log(output);
            if (!output?.hasImages && !output?.textContent) {
                return "失败了，当前无法处理该图片";
            }
            return "成功了，我已经完成了图像编辑任务";

        } catch (error) {
            console.error('图片编辑过程发生错误:', error);
            return { error: `失败了: ${error.message}` };
        }
    }
}