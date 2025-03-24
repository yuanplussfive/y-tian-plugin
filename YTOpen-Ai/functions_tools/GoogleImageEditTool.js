import { AbstractTool } from './AbstractTool.js';
import { callGeminiAPI, handleGeminiResult } from "../../YTOpen-Ai/GeminiAPI.js";

/**
 * 图片编辑工具类，用于处理用户的图片相关请求
 */
export class GoogleImageEditTool extends AbstractTool {
    constructor() {
        super();
        this.name = 'googleImageEditTool';
        this.description = '使用Google的Gemini进行图像编辑处理, 当用户需要编辑/识别图片内容时，使用此工具。支持多图片分析，可提取图片中的文字信息并进行理解分析。注意：所有图片URL必须保持完整原始形式，不得修改或简化URL参数。';
        this.parameters = {
            type: "object",
            properties: {
                prompt: {
                    type: 'string',
                    description: '用户的图片处理需求描述',
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
            console.log(result);
            await handleGeminiResult(result, e);

            return {
                success: true
            };

        } catch (error) {
            console.error('图片编辑过程发生错误:', error);
            return { error: `图片编辑失败: ${error.message}` };
        }
    }
}