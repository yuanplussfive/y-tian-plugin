import { TotalTokens } from '../YTOpen-Ai/tools/CalculateToken.js';

async function replyBasedOnStyle(styles, answer, e, model, puppeteer, fs, _path, msg, common) {

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
            const { total_tokens } = await TotalTokens(output);
            
            // 如果文本很短，直接发送
            if (total_tokens <= 20) {
                return await e.reply(output);
            }
    
            // 定义标点符号和特殊字符列表
            const primaryPunctuations = ['。', '！', '？', '；', '!', '?', ';', '\n'];
            const secondaryPunctuations = ['：', ':', '）', ')', '》', '>'];
            const commas = ['，', ','];
            const endingPunctuations = ['。', '！', '？', '；', '!', '?', ';', '：', ':', '...', '…'];
            
            // 预处理文本，处理特殊字符串
            let processedOutput = output;
            
            // 保护省略号，防止被错误分割
            processedOutput = processedOutput.replace(/\.{3,}|。{3,}|…+/g, '{{ELLIPSIS}}');
            
            // 保存Markdown链接
            const markdownLinks = [];
            const markdownPattern = /(!?\[.*?\]\(.*?\))/g;
            let linkIndex = 0;
            
            processedOutput = processedOutput.replace(markdownPattern, (match) => {
                markdownLinks.push(match);
                return `{{MDLINK${linkIndex++}}}`;
            });
    
            // 保护括号内的完整内容
            const bracketTexts = [];
            let bracketIndex = 0;
            const bracketPattern = /[（(]((?:[^（()）]|（[^（()）]*）|\([^（()）]*\))*)[)）]/g;
            
            processedOutput = processedOutput.replace(bracketPattern, (match) => {
                // 超长括号内容不保护，允许分割
                if (match.length > 100) return match;
                bracketTexts.push(match);
                return `{{BRACKET${bracketIndex++}}}`;
            });
    
            // 计算分段策略
            const textLength = processedOutput.length;
            const idealSegmentCount = Math.ceil(textLength / 300) + 1;
            const idealLength = Math.ceil(textLength / idealSegmentCount);
            const minLength = Math.floor(idealLength * 0.6);
            const maxLength = Math.ceil(idealLength * 1.4);
            
            let segments = [];
            let currentSegment = '';
            let lastPunctuationIndex = 0;
    
            // 智能分段处理
            for (let i = 0; i < processedOutput.length; i++) {
                currentSegment += processedOutput[i];
                
                // 检查是否在特殊标记内
                const isInSpecialTag = /{{(?:MDLINK|BRACKET|ELLIPSIS)\d*}}/.test(currentSegment) && 
                                     !currentSegment.endsWith('}}');
                if (isInSpecialTag) continue;
    
                // 判断当前字符的分割属性
                const isPrimaryPunctuation = primaryPunctuations.includes(processedOutput[i]);
                const isSecondaryPunctuation = secondaryPunctuations.includes(processedOutput[i]);
                const isComma = commas.includes(processedOutput[i]);
                
                // 分段判断逻辑
                if (currentSegment.length >= minLength) {
                    let shouldSplit = false;
                    
                    // 主要标点符号直接分割
                    if (isPrimaryPunctuation) {
                        shouldSplit = true;
                    }
                    // 次要标点符号在段落过长时分割
                    else if (isSecondaryPunctuation && currentSegment.length > idealLength) {
                        shouldSplit = true;
                    }
                    // 逗号在段落明显过长时分割
                    else if (isComma && currentSegment.length > maxLength) {
                        shouldSplit = true;
                    }
    
                    if (shouldSplit) {
                        segments.push(currentSegment);
                        currentSegment = '';
                        lastPunctuationIndex = i;
                    }
                }
            }
    
            // 处理剩余文本
            if (currentSegment.length > 0) {
                if (segments.length > 0 && currentSegment.length < minLength) {
                    segments[segments.length - 1] += currentSegment;
                } else {
                    segments.push(currentSegment);
                }
            }
    
            // 强制分段（当智能分段失败时）
            if (segments.length <= 1 && textLength > maxLength) {
                segments = [];
                let i = 0;
                while (i < processedOutput.length) {
                    let endIndex = Math.min(i + idealLength, processedOutput.length);
                    
                    // 向后查找合适的分割点
                    let splitPointFound = false;
                    for (let j = endIndex; j > i && j > endIndex - 50; j--) {
                        if ([...primaryPunctuations, ...secondaryPunctuations, ...commas].includes(processedOutput[j])) {
                            endIndex = j + 1;
                            splitPointFound = true;
                            break;
                        }
                    }
                    
                    // 处理特殊标记
                    if (!splitPointFound) {
                        const segment = processedOutput.slice(i, endIndex);
                        const specialMatch = segment.match(/{{(?:MDLINK|BRACKET|ELLIPSIS)\d*}}/g);
                        if (specialMatch && !segment.endsWith('}}')) {
                            endIndex = i + processedOutput.slice(i).indexOf('}}') + 2;
                        }
                    }
    
                    segments.push(processedOutput.slice(i, endIndex));
                    i = endIndex;
                }
            }
    
            // 还原特殊标记并处理段落结尾标点
            segments = segments.map((segment, index) => {
                let processedSegment = segment;
                
                // 还原特殊标记
                processedSegment = processedSegment.replace(/{{ELLIPSIS}}/g, '...');
                processedSegment = processedSegment.replace(/{{MDLINK(\d+)}}/g, (_, index) => markdownLinks[parseInt(index)]);
                processedSegment = processedSegment.replace(/{{BRACKET(\d+)}}/g, (_, index) => bracketTexts[parseInt(index)]);
                
                // 处理段落结尾的标点符号
                processedSegment = processedSegment.trim();
                if (processedSegment.length > 0) {
                    const lastChar = processedSegment[processedSegment.length - 1];
                    // 如果末尾是逗号，替换为句号
                    if (commas.includes(lastChar)) {
                        processedSegment = processedSegment.slice(0, -1) + '。';
                    }
                    // 如果末尾没有标点符号，添加句号
                    else if (!endingPunctuations.includes(lastChar) && 
                             !lastChar.match(/[a-zA-Z0-9]}]/)) {
                        processedSegment += '。';
                    }
                }
                
                return processedSegment;
            });
    
            // 发送消息，模拟人类打字速度
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                if (segment?.trim()) {
                    await e.reply(segment.trim());
                    
                    // 根据文本长度和是否是最后一段动态调整延迟
                    if (i < segments.length - 1) {
                        const delay = 800 + Math.min(segment.length * 10, 2000) + Math.random() * 1000;
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }
        } catch (error) {
            console.error('分段发送错误:', error);
            await e.reply(output);
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
        answer = await processSource(answer);
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
                const resourcesPath = `${_path}/plugins/y-tian-plugin/resources`;
                const htmlPath = `${resourcesPath}/html`;
                const cssPath = `${resourcesPath}/css`;
                const jsPath = `${resourcesPath}/js`;
                const settings = JSON.parse(fs.readFileSync(`${_path}/data/YTAi_Setting/data.json`));
                const pictureStyles = settings.chatgpt.pictureStyles;

                const tplFile = pictureStyles
                    ? `${htmlPath}/gptx2.html`
                    : `${htmlPath}/gptx.html`;
                const dz = pictureStyles
                    ? `${cssPath}/gptx2.css`
                    : `${cssPath}/gptx.css`;

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