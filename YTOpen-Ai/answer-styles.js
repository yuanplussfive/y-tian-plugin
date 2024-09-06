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
                const styles = JSON.parse(fs.readFileSync(_path + '/data/YTAi_Setting/data.json')).chatgpt.pictureStyles
                if (styles) {
                    tplFile = _path + "/plugins/y-tian-plugin/resources/html/gptx2.html"
                }
                let data = {
                    tplFile: tplFile,
                    dz: `${_path}/plugins/y-tian-plugin/resources/css/gptx.css`,
                    showdown: `${_path}/plugins/y-tian-plugin/resources/js/showdown.js`,
                    highlight: `${_path}/plugins/y-tian-plugin/resources/js/highlight.js`,
                    MathJax: `${_path}/plugins/y-tian-plugin/resources/js/MathJax.js`,
                    atom: `${_path}/plugins/y-tian-plugin/resources/css/atom.css`,
                    MSG: msg,
                    CONTENT: answer,
                    model: model,
                    id2: Bot.uin,
                    id1: e.user_id,
                    name: e.sender.nickname,
                    name1: Bot.nickname
                };
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