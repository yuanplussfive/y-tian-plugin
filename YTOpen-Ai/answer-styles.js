async function replyBasedOnStyle(styles, answer, e, common, puppeteer, fs, _path, msg) {
    try {
        switch (styles) {
            case "words":
                e.reply(answer, true);
                break;
            case "word":
                e.reply(answer);
                break;
            case "picture":
                let content = answer.replace(/\n/g, "<br>");
                let html = await fs.promises.readFile(_path + "/plugins/y-tian-plugin/resources/html/gptx.html", "utf-8");
                html = html.replace("Content", content);
                await fs.promises.writeFile(_path + "/resources/gptx2.html", html, "utf-8");
                await common.sleep(1500);
                let data2 = {
                    tplFile: _path + "/resources/gptx2.html",
                    dz: `${_path}/plugins/y-tian-plugin/resources/css/gptx.css`,
                    msg: msg,
                    id2: Bot.uin,
                    id1: e.user_id,
                    name: e.sender.nickname,
                    name1: Bot.nickname
                };
                let img = await puppeteer.screenshot("777", data2);
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






