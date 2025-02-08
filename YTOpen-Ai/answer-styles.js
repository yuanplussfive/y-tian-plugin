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
            if (total_tokens <= 50) {
                return await e.reply(output);
            }

            const punctuationMarks = ['。', '！', '？', '；', '.', '!', '?', ';', '\n'];
            let segments = [];

            // 预处理 Markdown 链接，将其替换为特殊标记
            let processedOutput = output;
            const markdownLinks = [];
            const markdownPattern = /(!?\[.*?\]\(.*?\))/g;
            let linkIndex = 0;

            processedOutput = processedOutput.replace(markdownPattern, (match) => {
                markdownLinks.push(match);
                return `{{MDLINK${linkIndex++}}}`;
            });

            const idealSegmentCount = processedOutput.length > 100 ? 3 : 2;
            const idealLength = Math.ceil(processedOutput.length / idealSegmentCount);

            let currentSegment = '';

            for (let i = 0; i < processedOutput.length; i++) {
                currentSegment += processedOutput[i];

                // 检查当前位置是否在特殊标记中
                const linkMatch = currentSegment.match(/{{MDLINK\d+}}/g);
                if (linkMatch) {
                    // 如果当前段包含未完成的特殊标记，继续添加字符
                    const lastLink = linkMatch[linkMatch.length - 1];
                    if (!currentSegment.endsWith('}}') && lastLink &&
                        currentSegment.indexOf(lastLink) + lastLink.length > currentSegment.length) {
                        continue;
                    }
                }

                if (punctuationMarks.includes(processedOutput[i])) {
                    if (currentSegment.length >= idealLength * 0.7) {
                        segments.push(currentSegment);
                        currentSegment = '';
                    }
                }
            }

            if (currentSegment.length > 0) {
                if (segments.length > 0 && currentSegment.length < 20) {
                    segments[segments.length - 1] += currentSegment;
                } else {
                    segments.push(currentSegment);
                }
            }

            if (segments.length <= 1) {
                segments = [];
                const segmentLength = Math.ceil(processedOutput.length / idealSegmentCount);

                let i = 0;
                while (i < processedOutput.length) {
                    let endIndex = Math.min(i + segmentLength, processedOutput.length);

                    // 检查分段点是否在特殊标记中间
                    const segment = processedOutput.slice(i, endIndex);
                    const linkMatch = segment.match(/{{MDLINK\d+}}/g);
                    if (linkMatch) {
                        const lastLink = linkMatch[linkMatch.length - 1];
                        if (!segment.endsWith('}}') && lastLink) {
                            // 调整分段点到特殊标记结束位置
                            const fullLink = processedOutput.slice(i).match(new RegExp(`${lastLink}}}`))[0];
                            endIndex = i + processedOutput.slice(i).indexOf(fullLink) + fullLink.length;
                        }
                    }

                    segments.push(processedOutput.slice(i, endIndex));
                    i = endIndex;
                }
            }

            // 还原特殊标记为原始 Markdown 链接
            segments = segments.map(segment => {
                return segment.replace(/{{MDLINK(\d+)}}/g, (match, index) => {
                    return markdownLinks[parseInt(index)];
                });
            });

            for (let segment of segments) {
                if (segment && segment.trim()) {
                    await e.reply(segment.trim());
                    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
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