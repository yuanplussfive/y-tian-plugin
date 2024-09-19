async function replyBasedOnStyle(styles, answer, e, model, puppeteer, fs, _path, msg, common) {
    async function countTextElements(text) {
        const englishWordRegex = /[a-zA-Z]+/g;
        const chineseCharRegex = /[\u4e00-\u9fa5]/g;
        const englishWords = text.match(englishWordRegex) || [];
        const chineseChars = text.match(chineseCharRegex) || [];
        const totalCount = englishWords.length + chineseChars.length;
        return totalCount;
    }
    try {
        const words = await countTextElements(answer)
        console.log(words)
        switch (styles) {
            case "words":
                if (words > 1000) {
                    let forwardMsg = [answer]
                    const JsonPart = await common.makeForwardMsg(e, forwardMsg, 'text');
                    e.reply(JsonPart)
                } else {
                    e.reply(answer, true);
                }
                break;
            case "word":
                if (words > 1050) {
                    let forwardMsg = [answer]
                    const JsonPart = await common.makeForwardMsg(e, forwardMsg, 'text');
                    e.reply(JsonPart)
                } else {
                    e.reply(answer);
                }
                break;
            case "picture":
                let tplFile = _path + "/plugins/y-tian-plugin/resources/html/gptx.html"
                let dz = `${_path}/plugins/y-tian-plugin/resources/css/gptx.css`
                const styles = JSON.parse(fs.readFileSync(_path + '/data/YTAi_Setting/data.json')).chatgpt.pictureStyles
                if (styles) {
                    tplFile = _path + "/plugins/y-tian-plugin/resources/html/gptx2.html"
                    dz = `${_path}/plugins/y-tian-plugin/resources/css/gptx2.css`
                }
                let data = {
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
                    model: model,
                    id2: Bot.uin,
                    id1: e.user_id,
                    name: e.sender.nickname,
                    name1: Bot.nickname
                };
                console.log(data);
                if (words < 1200) {
                    let img = await puppeteer.screenshot("777", data);
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

export { replyBasedOnStyle }