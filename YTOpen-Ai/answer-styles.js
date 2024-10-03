async function replyBasedOnStyle(styles, answer, e, model, puppeteer, fs, _path, msg, common) {
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

    const sendAsForwardMsg = async () => {
        const forwardMsg = await common.makeForwardMsg(e, [answer], 'text');
        e.reply(forwardMsg);
    };

    try {
        const words = await countTextInString(answer);
        console.log(`token: ${words}`);

        switch (styles) {
            case "words":
                if (words > 1000) {
                    await sendAsForwardMsg();
                } else {
                    e.reply(answer, true);
                }
                break;

            case "word":
                if (words > 1050) {
                    await sendAsForwardMsg();
                } else {
                    e.reply(answer);
                }
                break;

            case "picture":
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

                if (words < 3200) {
                    try {
                        const img = await Promise.race([
                            puppeteer.screenshot("753", data),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('截图超时')), 35000))
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