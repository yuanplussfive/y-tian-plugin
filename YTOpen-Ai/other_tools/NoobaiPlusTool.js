import { AbstractTool } from './AbstractTool.js';
import { YTOtherModels, get_address } from '../../utils/fileUtils.js';

/**
* 多模型AI绘图工具类
*/
export class NoobaiTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'noobaiTool';
    this.description = '根据提示词生成图片, 使用noobai(noobai)模型进行绘图';
    this.parameters = {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: '绘图的描述提示词',
          minLength: 1,
          maxLength: 4000
        }
      },
      required: ['prompt'],
      additionalProperties: false
    };
  }

  async formatPrompt(content) {
    const jsonSchema = {
      type: "object",
      properties: {
        characters: {
          type: "array",
          items: {
            type: "string"
          },
          description: "所有出现在预设或对话中的角色名称列表，例如 ['宫本武藏', '源氏']。若无法识别角色，则返回空数组。"
        },
        main_character: {
          type: "string",
          description: "主要角色名称，即对话或场景中最核心的角色，例如 '宫本武藏'。若无法识别主要角色，则返回 null。"
        },
        features: {
          type: "array",
          items: {
            type: "string"
          },
          description: "角色的外观特征列表，例如 ['红发', '蓝眼睛', '和服', '长发']。提取所有明确提到的外观特征，若无明确特征，则返回空数组。"
        },
        actions: {
          type: "array",
          items: {
            type: "string"
          },
          description: "角色正在进行的动作列表，例如 ['微笑', '站立', '挥手']。提取所有明确提到的动作，若无明确动作，则返回空数组。"
        },
        environment: {
          type: "string",
          description: "场景环境描述，例如 '樱花树下'、'教室内'、'海滩'。若无明确环境描述，则返回 null。"
        },
        time_of_day: {
          type: "string",
          description: "时间描述，例如 '黄昏'、'夜晚'、'清晨'。若无明确时间描述，则返回 null。"
        },
        mood: {
          type: "string",
          description: "场景或角色的情绪氛围，例如 '开心'、'悲伤'、'紧张'。若无明确情绪描述，则返回 null。"
        },
        style_tags: {
          type: "array",
          items: {
            type: "string"
          },
          description: "适合绘图的风格标签列表，例如 ['动漫风格', '写实', '赛博朋克']。根据内容推断合适的风格，若无法推断，则返回默认标签 ['高质量', '精细']。"
        }
      },
      required: ["characters", "main_character", "features", "actions", "environment", "time_of_day", "mood", "style_tags"],
      additionalProperties: false
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const dirpath = `${_path}/data/YTotherai`;
    const dataPath = path.join(dirpath, "data.json");

    let data;
    try {
      const dataString = await fs.promises.readFile(dataPath, "utf-8");
      data = JSON.parse(dataString);
    } catch (readError) {
      return null;
    }

    const openAiApiKey = this.config.OpenAiUrl === 'https://yuanpluss.online:3000/api/v1/4o/fc'
      ? data.chatgpt.stoken
      : this.config.OpenAiApikey;
    if (!openAiApiKey) return false;

    try {
      const response = await fetch(this.config.OpenAiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiApiKey}`
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.config.OpenAiModel,
          messages: [
            {
              role: "system",
              content: "你是一个专业的图像提示词生成助手，擅长从用户提供的角色预设和对话中提取关键信息，用于生成高质量的绘图提示词。你需要分析文本并识别出角色、特征、动作、环境等关键元素，以便生成准确的绘图指引。请仔细分析用户提供的所有信息，包括角色预设和最新对话，确保提取的信息准确反映场景内容。如果某些信息不明确，请使用null或空数组表示，不要随意添加不存在的信息。"
            },
            {
              role: "user",
              content: "预设：宫本武藏，女性，红色长发，蓝色眼睛，身穿传统和服，手持双刀\n最新对话：宫本武藏微笑着站在樱花树下，轻轻抚摸着刀柄"
            },
            {
              role: "assistant",
              content: "{\"characters\":[\"宫本武藏\"],\"main_character\":\"宫本武藏\",\"features\":[\"女性\",\"红色长发\",\"蓝色眼睛\",\"传统和服\",\"双刀\"],\"actions\":[\"微笑\",\"站立\",\"抚摸刀柄\"],\"environment\":\"樱花树下\",\"time_of_day\":null,\"mood\":\"平静\",\"style_tags\":[\"动漫风格\",\"高质量\",\"日本传统\"]}"
            },
            {
              role: "user",
              content: "预设：高中教室场景，有源氏和半藏两兄弟\n最新对话：放学后的阳光照进教室，源氏正在窗边看书，而半藏站在门口等他"
            },
            {
              role: "assistant",
              content: "{\"characters\":[\"源氏\",\"半藏\"],\"main_character\":\"源氏\",\"features\":[],\"actions\":[\"看书\",\"站立\",\"等待\"],\"environment\":\"高中教室\",\"time_of_day\":\"傍晚\",\"mood\":\"宁静\",\"style_tags\":[\"校园\",\"动漫风格\",\"温暖色调\"]}"
            },
            {
              role: "user",
              content: content
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "image_prompt",
              schema: jsonSchema,
              strict: true
            }
          },
          temperature: 0
        })
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.error("API request failed:", await response.text());
        return null;
      }

      const responseData = await response.json();
      const result = JSON.parse(responseData.choices[0].message.content);
      console.log("Generated prompt data:", result);

      // 将结果转换为格式化的提示词字符串
      let formattedPrompt = "";

      // 添加角色信息
      if (result.main_character) {
        formattedPrompt += `${result.main_character}, `;
      }

      // 添加特征
      if (result.features && result.features.length > 0) {
        formattedPrompt += result.features.join(", ") + ", ";
      }

      // 添加动作
      if (result.actions && result.actions.length > 0) {
        formattedPrompt += result.actions.join(", ") + ", ";
      }

      // 添加环境
      if (result.environment) {
        formattedPrompt += `${result.environment}, `;
      }

      // 添加时间
      if (result.time_of_day) {
        formattedPrompt += `${result.time_of_day}, `;
      }

      // 添加情绪
      if (result.mood) {
        formattedPrompt += `${result.mood} mood, `;
      }

      // 添加风格标签
      if (result.style_tags && result.style_tags.length > 0) {
        formattedPrompt += result.style_tags.join(", ");
      }

      // 移除末尾的逗号和空格（如果有）
      formattedPrompt = formattedPrompt.replace(/,\s*$/, "");

      console.log("Final formatted prompt:", formattedPrompt);
      return {
        rawData: result,
        formattedPrompt: formattedPrompt
      };
    } catch (error) {
      console.error("Error generating prompt:", error);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * 执行绘图操作
   */
  async func(opts, e) {
    const { prompt } = opts;
    let imageUrls = [];

    if (!prompt) {
      return "错误：绘图提示词（prompt）不能为空。";
    }

    try {
      const { formattedPrompt } = await this.formatPrompt(prompt);
      const imageArray = await YTOtherModels([{ role: "user", content: formattedPrompt }], "anishadow-v10-fast");

      console.log(imageArray)
      if (!imageArray) {
        return "错误：生成失败，服务器无响应，请稍后再试。";
      } else {
        imageUrls = await get_address(imageArray);
        if (imageUrls && imageUrls.length > 0) {
          const images = imageUrls.map(imgurl => segment.image(imgurl.trim()));
          await e.reply(images); // 发送图片
          return `好的，${prompt}，成功了，我已生成并发送图片到群里了`;
        } else {
          return "绘图生成失败了，可能负载过高或提示词违规，请稍后再试。";
        }
      }
    } catch (error) {
      console.log('其他模型处理错误:', error);
      return "绘图生成失败了，可能负载过高或提示词违规，请稍后再试。";
    }
  }
}