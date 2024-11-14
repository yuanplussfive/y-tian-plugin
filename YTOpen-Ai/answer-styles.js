async function replyBasedOnStyle(styles, answer, e, model, puppeteer, fs, _path, msg, common) {
    //console.log(answer);
    async function formatCodeBlocks(text) {
        const codeBlockRegex = /(^|\n)?(`{3})\s*\n*([a-zA-Z]*)\n([\s\S]*?)\n`{3}(\n|$)?/g;
        return text.replace(codeBlockRegex, (match, beforeNewline, backticks, lang, code, afterNewline) => {
            const prefix = beforeNewline || '\n';
            const suffix = afterNewline || '\n';
            return `${prefix}${backticks}${lang}\n${code}\n\`\`\`${suffix}`;
        });
    }
    async function processSourceText(text) {
        return text.replace(/(\*[^*]*来源[^*]*\*)(?![\r\n]{2})/g, '$1\n\n');
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
    async function splitTextAndReply(text) {
        const terminators = ['。', '！', '；', '!', ';', '？', '?', '.'];
        let segmentCount = 1;
        if (text.length > 800) {
            segmentCount = text.length > 1200 ? 3 : 2;
        } else if (text.length > 500) {
            segmentCount = 2;
        }
        if (segmentCount === 1) {
            e.reply(text);
            return;
        }
        const idealLength = Math.ceil(text.length / segmentCount);
        const segments = [];
        let startIndex = 0;
        while (startIndex < text.length) {
            let searchEnd = Math.min(startIndex + idealLength + (idealLength * 0.3), text.length);
            let endIndex = -1;
            for (let i = searchEnd; i > startIndex + (idealLength * 0.7); i--) {
                if (terminators.includes(text[i])) {
                    endIndex = i + 1;
                    break;
                }
            }
            if (endIndex === -1) {
                for (let i = searchEnd; i > startIndex + (idealLength * 0.7); i--) {
                    if (text[i] === '；' || text[i] === '。' || text[i] === '!' || text[i] === '！' || text[i] === '？' || text[i] === '?' || text[i] === ';' || text[i] === '.') {
                        endIndex = i + 1;
                        break;
                    }
                }
                if (endIndex === -1) {
                    for (let i = searchEnd; i > startIndex + (idealLength * 0.7); i--) {
                        if (text[i] === ' ') {
                            endIndex = i + 1;
                            break;
                        }
                    }
                }
                if (endIndex === -1) {
                    endIndex = Math.min(startIndex + idealLength, text.length);
                }
            }
            segments.push(text.substring(startIndex, endIndex));
            startIndex = endIndex;
            if (text.length - startIndex < idealLength * 0.5) {
                segments.push(text.substring(startIndex));
                break;
            }
        }
        segments.forEach((segment, index) => {
            setTimeout(() => {
                e.reply(segment.trim());
            }, index * 2500);
        });
    }

    const countTextInString = async (text) => {
        if (Array.isArray(text)) {
            text = text
                .filter(item => item.type === 'text')
                .map(item => item.text)
                .join(' ');
        }
        if (typeof text !== 'string' || !text.trim()) {
            return 0;
        }
        const englishWordRegex = /[a-zA-Z]+/g;
        const chineseCharRegex = /[\u4e00-\u9fa5]/g;
        const englishWords = text.match(englishWordRegex) || [];
        const chineseChars = text.match(chineseCharRegex) || [];
        return Math.floor(englishWords.length * 2 + chineseChars.length * 1.5);
    };

    const sendAsForwardMsg = async (text) => {
        const forwardMsg = await common.makeForwardMsg(e, [text], 'text');
        e.reply(forwardMsg);
    };

    const processSource = async (answer) => {
        answer = await processSourceText(answer);
        answer = await decodeSearchContent(answer);
        answer = await formatCodeBlocks(answer);
        return answer;
    }

    try {
        const words = await countTextInString(answer);
        console.log(`token: ${words}`);
        answer = await processSource(answer);
        msg = await processSource(msg);
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
                await splitTextAndReply(answer);
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