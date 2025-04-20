const _path = process.cwd();
import { TotalTokens } from '../YTOpen-Ai/tools/CalculateToken.js';
import common from "../../../lib/common/common.js";
import puppeteer from "../../../lib/puppeteer/puppeteer.js";
import fs from "fs";

function removeThinkTagsAndFormat(input) {
  const cleanedText = input.replace(/<(think|reasoning|thinking)>.*?<\/(think|reasoning|thinking)>/gs, '');
  return cleanedText.trim();
}

async function replyBasedOnStyle(answer, e, model, msg) {
  const styles = JSON.parse(fs.readFileSync(_path + '/data/YTAi_Setting/data.json')).chatgpt.ai_chat_style;
  const processSource = async (answer) => {
    answer = await processSourceText(answer);
    answer = await decodeSearchContent(answer);
    answer = await formatCodeBlocks(answer);
    return answer.trim();
  }

  async function formatCodeBlocks(text) {
    const codeBlockRegex = /(^|\n)?(`{3})\s*\n*([a-zA-Z]*)\n([\s\S]*?)\n`{3}(\n|$)?/g;
    return text.replace(codeBlockRegex, (match, beforeNewline, backticks, lang, code, afterNewline) => {
      const prefix = beforeNewline || '\n';
      const suffix = afterNewline || '\n';
      return `${prefix}${backticks}${lang}\n${code}\n\`\`\`${suffix}`;
    });
  }

  async function processSourceText(text) {
    return text
      .replace(/(^>.*\*来源：[^*\n]+\*)(?!\n{2})/gm, '$1\n\n')
      .replace(/(\*来源：[^*\n]+\*)(\s*\*\*[^*\n]+\*\*)/g, '$1\n\n$2')
      .replace(/([^\n])\*来源：([^*\n]+)\*([^\n])/g, '$1\n*来源：$2*\n\n$3')
      .replace(/(\*来源：[^*\n]+\*)\n(?!\n)/g, '$1\n\n')
      .replace(/(^\*来源：[^*\n]+\*)(?!\n{2})/gm, '$1\n\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/([^*])\*\*([^*]+)\*\*([^*])/g, '$1**$2**$3');
  }

  async function decodeSearchContent(str) {
    return str.replace(/search\((["'])\s*(.*?)\s*\1\)/g, (match, quote, content) => {
      let decoded = content.trim().replace(/\\u[\dA-Fa-f]{4}/g, uMatch =>
        String.fromCharCode(parseInt(uMatch.replace('\\u', ''), 16))
      );
      decoded = decoded.replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\b/g, '\b')
        .replace(/\\f/g, '\f')
        .replace(/\\\\/g, '\\')
        .replace(/\\'/g, "'")
        .replace(/\\"/g, '"');
      return `search(${quote}${decoded}${quote})`;
    });
  }

  async function sendSegmentedMessage(e, output) {
    try {
      // 计算输出文本的总 token 数，用于判断是否需要分段发送
      const { total_tokens } = await TotalTokens(output);

      // 如果文本较短（token 数小于等于 20），则直接发送
      if (total_tokens <= 20) {
        return await e.reply(output);
      }

      // 定义用于分割句子的标点符号列表
      const punctuations = ['。', '！', '？', '；', '!', '?', ';', '\n'];
      // 定义句子结尾可能出现的标点符号列表，用于确保每个分段都有结尾标点
      const endingPunctuations = ['。', '！', '？', '；', '!', '?', ';', '...', '…'];

      // 预处理文本，防止分割时破坏特殊字符

      let processedOutput = output;

      // 保护 emojis 和 emoticons，用占位符替换，避免被分割
      const emojiPattern = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[（(][^（)）]*[）)]|[:;][)D]|[:<]3/gu;
      const emojis = []; // 存储提取出的 emojis
      let emojiIndex = 0; // emojis 的索引

      processedOutput = processedOutput.replace(emojiPattern, (match) => {
        emojis.push(match); // 将匹配到的 emoji 存入数组
        return `{{EMOJI${emojiIndex++}}}`; // 用占位符替换
      });

      // 保护省略号，避免被分割
      processedOutput = processedOutput.replace(/\.{3,}|。{3,}|…+/g, '{{ELLIPSIS}}');

      // 计算理想的分段长度
      const maxSegments = 5; // 最大分段数
      const textLength = processedOutput.length; // 文本长度
      const idealSegmentCount = Math.min(Math.ceil(textLength / 300), maxSegments); // 理想的分段数，每段大约300个字符，但不超过最大分段数
      const idealLength = Math.ceil(textLength / idealSegmentCount); // 理想的每段长度

      // 寻找分割点
      const splitPoints = []; // 存储分割点的数组
      let lastSplitPoint = 0; // 上一个分割点的位置

      // 遍历文本，寻找合适的分割点
      for (let i = 0; i < processedOutput.length; i++) {
        // 如果当前字符是标点符号
        if (punctuations.includes(processedOutput[i])) {
          const segmentLength = i - lastSplitPoint + 1; // 计算当前段的长度
          // 如果当前段的长度大于等于理想长度的 70%，则认为是一个合适的分割点
          if (segmentLength >= idealLength * 0.7) {
            splitPoints.push(i + 1); // 将分割点添加到数组
            lastSplitPoint = i + 1; // 更新上一个分割点的位置
          }
        }
      }

      // 调整分割点，以维持最大分段数
      while (splitPoints.length >= maxSegments) {
        // 寻找最短的段，并移除其分割点
        let minLength = Infinity; // 最小长度，初始值为无穷大
        let removeIndex = -1; // 要移除的分割点的索引，初始值为 -1

        // 遍历分割点，寻找最短的段
        for (let i = 0; i < splitPoints.length - 1; i++) {
          const segmentLength = splitPoints[i + 1] - splitPoints[i]; // 计算当前段的长度
          // 如果当前段的长度小于最小长度，则更新最小长度和要移除的分割点的索引
          if (segmentLength < minLength) {
            minLength = segmentLength;
            removeIndex = i;
          }
        }

        // 如果找到了要移除的分割点，则移除它
        if (removeIndex !== -1) {
          splitPoints.splice(removeIndex, 1);
        } else {
          // 如果没有找到要移除的分割点，则跳出循环（理论上不应该发生）
          break;
        }
      }

      // 创建分段
      let segments = []; // 存储分段的数组
      let start = 0; // 分段的起始位置

      // 根据分割点分割文本
      for (const point of splitPoints) {
        // 如果分割点大于起始位置，则创建一个分段
        if (point > start) {
          segments.push(processedOutput.slice(start, point)); // 将分段添加到数组
          start = point; // 更新起始位置
        }
      }

      // 如果起始位置小于文本长度，则将剩余的文本作为一个分段
      if (start < processedOutput.length) {
        segments.push(processedOutput.slice(start));
      }

      // 恢复特殊字符并处理分段
      segments = segments.map((segment, index) => {
        // 恢复省略号和 emojis
        let processed = segment
          .replace(/{{ELLIPSIS}}/g, '...') // 恢复省略号
          .replace(/{{EMOJI(\d+)}}/g, (_, index) => emojis[parseInt(index)]) // 恢复 emojis
          .trim(); // 移除首尾空格

        // 添加适当的结尾标点
        if (processed && !endingPunctuations.some(p => processed.endsWith(p))) {
          processed += ''; // 如果分段没有以结尾标点结尾，则添加句号
        }

        return processed; // 返回处理后的分段
      });

      // 发送消息，模拟人类发送的自然延迟
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]; // 获取当前分段
        // 如果分段不为空
        if (segment?.trim()) {
          await e.reply(segment.trim()); // 发送分段

          // 如果不是最后一个分段，则添加延迟
          if (i < segments.length - 1) {
            // 动态延迟，基于分段长度
            const baseDelay = 1000; // 基础延迟 1 秒
            const charDelay = segment.length * 5; // 每字符延迟 5 毫秒
            const randomDelay = Math.random() * 500; // 随机延迟 0-500 毫秒
            const delay = Math.min(baseDelay + charDelay + randomDelay, 3000); // 总延迟，但不超过 3 秒
            await new Promise(resolve => setTimeout(resolve, delay)); // 延迟
          }
        }
      }
    } catch (error) {
      // 如果发生错误，则打印错误信息，并直接发送原始文本
      console.error('分段发送错误:', error);
      await e.reply(output); // 直接发送原始文本
    }
  }

  const sendAsForwardMsg = async (text) => {
    const forwardMsg = await common.makeForwardMsg(e, [text], 'text');
    e.reply(forwardMsg);
  };

  try {
    const { completion_tokens: words } = await TotalTokens(answer);
    console.log(`token: ${words}`);
    //console.log(answer);
    //answer = await processSource(answer);
    msg = await processSource(msg);
    //console.log("\n\n",answer);
    switch (styles) {
      case "words":
        if (words > 1000) {
          await sendAsForwardMsg(answer);
        } else {
          e.reply(answer, true);
        }
        break;

      case "word":
        if (words > 1050) {
          await sendAsForwardMsg(answer);
        } else {
          e.reply(answer);
        }
        break;

      case "forward":
        await sendAsForwardMsg(answer);
        break;

      case "tts":
        break;

      case "similar":
        await sendSegmentedMessage(e, answer);
        break;

      case "picture":
      case "pictures":
        if (model.includes("ds") || model.includes("deepseek") || model.includes("元宝")) {
          answer = removeThinkTagsAndFormat(answer);
        }
        const resourcesPath = `${_path}/plugins/y-tian-plugin/resources`;
        const htmlPath = `${resourcesPath}/html`;
        const cssPath = `${resourcesPath}/css`;
        const jsPath = `${resourcesPath}/js`;
        const settings = JSON.parse(fs.readFileSync(`${_path}/data/YTAi_Setting/data.json`));
        const pictureStyles = settings.chatgpt.viewStyles;

        const fileMappings = {
          "default": {
            tplFile: `${htmlPath}/gptx1.html`,
            dz: `${cssPath}/gptx1.css`
          },
          "cute": {
            tplFile: `${htmlPath}/gptx2.html`,
            dz: `${cssPath}/gptx2.css`
          },
          "chatroom": {
            tplFile: `${htmlPath}/gptx3.html`,
            dz: `${cssPath}/gptx3.css`
          },
          "simple": {
            tplFile: `${htmlPath}/gptx4.html`,
            dz: `${cssPath}/gptx4.css`
          }
        };
        const { tplFile, dz } = fileMappings[pictureStyles] || {
          tplFile: `${htmlPath}/gptx1.html`,
          dz: `${cssPath}/gptx1.css`
        };
        const data = {
          dz,
          tplFile,
          quality: 100,
          imgType: 'jpeg',
          atom_one_dark_min_css: `${cssPath}/atom-one-dark.min.css`,
          all_min_css: `${cssPath}/all.min.css`,
          marked_min_js: `${jsPath}/marked.min.js`,
          purify_min_js: `${jsPath}/purify.min.js`,
          katex_css: `${cssPath}/katex.min.css`,
          katex_js: `${jsPath}/katex.min.js`,
          auto_render_js: `${jsPath}/auto-render.min.js`,
          showdown: `${jsPath}/showdown.js`,
          highlight: `${jsPath}/highlight.js`,
          MathJax: `${jsPath}/MathJax.js`,
          atom: `${cssPath}/atom.css`,
          highlight_min_js: `${jsPath}/highlight.min.js`,
          MSG: msg,
          CONTENT: answer,
          model,
          id2: Bot.uin,
          id1: e.user_id,
          name: e.sender.nickname,
          name1: Bot.nickname
        };

        if (words < 4800) {
          try {
            const img = await Promise.race([
              puppeteer.screenshot("759", data),
              new Promise((_, reject) => setTimeout(() => reject(new Error('截图超时')), 60000))
            ]);
            e.reply(img);
          } catch (screenshotError) {
            console.error("截图生成失败: ", screenshotError);
            e.reply("生成图片回复时发生错误或超时。");
          }
        }
        break;

      default:
        e.reply("未知的回复风格");
    }
  } catch (error) {
    console.error("回复生成出错: ", error);
    e.reply("回复生成时发生错误");
  }
}

export { replyBasedOnStyle };