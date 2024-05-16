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
                let content = answer
                let data = {
                    tplFile: _path + "/plugins/y-tian-plugin/resources/html/gptx.html",
                    dz: `${_path}/plugins/y-tian-plugin/resources/css/gptx.css`,
                    MSG: msg,
                    CONTENT: content,
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