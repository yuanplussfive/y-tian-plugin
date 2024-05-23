async function replyBasedOnStyle(styles, answer, e, model, puppeteer, fs, _path, msg) {
    try {
        switch (styles) {
            case "words":
                e.reply(answer, true);
                break;
            case "word":
                e.reply(answer);
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
                let img = await puppeteer.screenshot("777", data);
                e.reply(img);
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