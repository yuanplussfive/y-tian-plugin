async function handleSystemCommand(e, _path, common, fs, history) {
console.log(history)
    try {
        const presetsPath = `${_path}/data/阴天预设`;
        const dirname = fs.readdirSync(presetsPath, "utf-8");
        if (e.msg.startsWith("#查看")) {
            const forwardMsg = await createAndSendForwardMessage(e, dirname, presetsPath, fs, common);
        } else if (e.msg.startsWith("#切换")) {
            await switchPresetAndReply(e, dirname, presetsPath, fs, history) 
        }
    } catch (error) {
        console.error("An error occurred: ", error);
        e.reply("查看预设失败了.")
    }
}

async function createAndSendForwardMessage(e, dirname, presetsPath, fs, common) {
    const forwardMsg = dirname.map((filename, index) => {
        const name = filename.replace(/\..txt/g, "");
        const weight = fs.readFileSync(`${presetsPath}/${filename}`, "utf-8").slice(0, 100);
        return `序号:${index + 1}\n名称:${name}\n内容简述:${weight}`;
    });

    const msg = await common.makeForwardMsg(e, forwardMsg, '预设魔法大全');
    await e.reply(msg);
}

async function switchPresetAndReply(e, dirname, presetsPath, fs, history) {
    const index = parseInt(e.msg.replace(/[^0-9]/ig, ""), 10) - 1;
    if (dirname[index]) {
        const prompt = fs.readFileSync(`${presetsPath}/${dirname[index]}`, "utf-8");      
        history.splice(0, history.length);
        history.push({ role: "system", content: prompt });
        e.reply("成功切换");
    } else {
        e.reply("无效的序号");
    }
 }

export { handleSystemCommand }