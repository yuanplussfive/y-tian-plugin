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
            
            // 直接发送小段文本
            if (total_tokens <= 20) {
                return await e.reply(output);
            }
    
            // 原有的长文本处理逻辑
            const primaryPunctuations = ['。', '！', '？', '；', '.', '!', '?', ';', '\n', '，', ','];
            const secondaryPunctuations = ['：', ':', '）', ')', '》', '>'];
            
            let processedOutput = output;
            const markdownLinks = [];
            const markdownPattern = /(!?\[.*?\]\(.*?\))/g;
            let linkIndex = 0;
    
            processedOutput = processedOutput.replace(markdownPattern, (match) => {
                markdownLinks.push(match);
                return `{{MDLINK${linkIndex++}}}`;
            });
    
            const textLength = processedOutput.length;
            const idealSegmentCount = Math.ceil(textLength / 300) + 1;
            const idealLength = Math.ceil(textLength / idealSegmentCount);
            const minLength = Math.floor(idealLength * 0.6);
            
            let segments = [];
            let currentSegment = '';
            let lastPunctuationIndex = 0;
    
            for (let i = 0; i < processedOutput.length; i++) {
                currentSegment += processedOutput[i];
                
                const linkMatch = /{{MDLINK\d+}}/.test(currentSegment);
                if (linkMatch && !currentSegment.endsWith('}}')) {
                    continue;
                }
    
                const isPrimaryPunctuation = primaryPunctuations.includes(processedOutput[i]);
                const isSecondaryPunctuation = secondaryPunctuations.includes(processedOutput[i]);
                
                if ((isPrimaryPunctuation || isSecondaryPunctuation) && 
                    currentSegment.length >= minLength) {
                    
                    if (isPrimaryPunctuation || 
                        (isSecondaryPunctuation && i - lastPunctuationIndex > idealLength * 1.2)) {
                        segments.push(currentSegment);
                        currentSegment = '';
                        lastPunctuationIndex = i;
                    }
                }
            }
    
            if (currentSegment.length > 0) {
                if (segments.length > 0 && currentSegment.length < minLength) {
                    segments[segments.length - 1] += currentSegment;
                } else {
                    segments.push(currentSegment);
                }
            }
    
            if (segments.length <= 1) {
                segments = [];
                let i = 0;
                while (i < processedOutput.length) {
                    let endIndex = Math.min(i + idealLength, processedOutput.length);
                    
                    let punctuationFound = false;
                    for (let j = endIndex; j > i && j > endIndex - 50; j--) {
                        if (primaryPunctuations.includes(processedOutput[j])) {
                            endIndex = j + 1;
                            punctuationFound = true;
                            break;
                        }
                    }
                    
                    if (!punctuationFound) {
                        const segment = processedOutput.slice(i, endIndex);
                        if (/{{MDLINK\d+}}/.test(segment) && !segment.endsWith('}}')) {
                            endIndex = i + processedOutput.slice(i).indexOf('}}') + 2;
                        }
                    }
    
                    segments.push(processedOutput.slice(i, endIndex));
                    i = endIndex;
                }
            }
    
            segments = segments.map(segment => {
                return segment.replace(/{{MDLINK(\d+)}}/g, (_, index) => markdownLinks[parseInt(index)]);
            });
    
            for (let segment of segments) {
                if (segment?.trim()) {
                    await e.reply(segment.trim());
                    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
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