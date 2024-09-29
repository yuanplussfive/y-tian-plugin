async function replyBasedOnStyle(styles, answer, e, model, puppeteer, fs, _path, msg, common) {
    async function countTextInString(text) {
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
    }

    try {
        const words = await countTextInString(answer);
        console.log(words);

        const sendAsForwardMsg = async () => {
            const forwardMsg = await common.makeForwardMsg(e, [answer], 'text');
            e.reply(forwardMsg);
        };

        switch (styles) {
            case "words":
                words > 1000 ? await sendAsForwardMsg() : e.reply(answer, true);
                break;
            case "word":
                words > 1050 ? await sendAsForwardMsg() : e.reply(answer);
                break;
            case "picture":
                let tplFile = `${_path}/plugins/y-tian-plugin/resources/html/gptx.html`;
                let dz = `${_path}/plugins/y-tian-plugin/resources/css/gptx.css`;

                const pictureStyles = JSON.parse(fs.readFileSync(`${_path}/data/YTAi_Setting/data.json`)).chatgpt.pictureStyles;
                if (pictureStyles) {
                    tplFile = `${_path}/plugins/y-tian-plugin/resources/html/gptx2.html`;
                    dz = `${_path}/plugins/y-tian-plugin/resources/css/gptx2.css`;
                }

                const data = {
                    dz,
                    tplFile,
                    atom_one_dark_min_css: `${_path}/plugins/y-tian-plugin/resources/css/atom-one-dark.min.css`,
                    all_min_css: `${_path}/plugins/y-tian-plugin/resources/css/all.min.css`,
                    marked_min_js: `${_path}/plugins/y-tian-plugin/resources/js/marked.min.js`,
                    purify_min_js: `${_path}/plugins/y-tian-plugin/resources/js/purify.min.js`,
                    katex_css: `${_path}/plugins/y-tian-plugin/resources/css/katex.min.css`,
                    katex_js: `${_path}/plugins/y-tian-plugin/resources/js/katex.min.js`,
                    auto_render_js: `${_path}/plugins/y-tian-plugin/resources/js/auto-render.min.js`,
                    showdown: `${_path}/plugins/y-tian-plugin/resources/js/showdown.js`,
                    highlight: `${_path}/plugins/y-tian-plugin/resources/js/highlight.js`,
                    MathJax: `${_path}/plugins/y-tian-plugin/resources/js/MathJax.js`,
                    atom: `${_path}/plugins/y-tian-plugin/resources/css/atom.css`,
                    highlight_min_js: `${_path}/plugins/y-tian-plugin/resources/js/highlight.min.js`,
                    MSG: msg,
                    CONTENT: answer,
                    model,
                    id2: Bot.uin,
                    id1: e.user_id,
                    name: e.sender.nickname,
                    name1: Bot.nickname
                };

                //console.log(data);
                if (words < 1200) {
                    const img = await puppeteer.screenshot("753", data);
                    e.reply(img);
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