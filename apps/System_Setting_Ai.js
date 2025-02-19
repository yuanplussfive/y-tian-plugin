import { dependencies } from "../YTdependence/dependencies.js";
import { getFileInfo } from '../utils/fileUtils.js';
const { fs, _path, puppeteer, Anime_tts_roles, tts_roles, https, http, common, cfg } = dependencies
let dirpath = _path + '/data/YTAi_Setting';
if (!fs.existsSync(dirpath)) {
    fs.mkdirSync(dirpath)
}
if (!fs.existsSync(dirpath + "/" + "data.json")) {
    fs.writeFileSync(dirpath + "/" + "data.json", JSON.stringify({
        "chatgpt": {
            "ai_chat": "godgpt",
            "ai_chat_at": false,
            "ai_chat_style": "word",
            "ai_name_sess": "#sess",
            "ai_name_godgpt": "#godgpt",
            "ai_name_chat": "#chat",
            "ai_name_others": "#bot",
            "ai_tts_open": false,
            "ai_tts_role": "派蒙_ZH",
            "ai_ban_plans": [],
            "ai_ban_number": [],
            "ai_ban_group": [],
        }
    }))
}
function readJsonFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
function writeJsonFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data), "utf-8");
}
const dataFilePath = `${dirpath}/data.json`;
let src = _path + "/plugins/y-tian-plugin/resources/css/jty.OTF"
let systempromise = [];

export class example extends plugin {
    constructor() {
        super({
            name: '阴天[AI总设置]',
            dsc: '',
            event: 'message',
            priority: 1,
            rule: [
                {
                    reg: "^#(ai|Ai|AI)对话方式(文本|图片|图片2|引用|转发|语音|拟人)$",
                    fnc: 'changeStyles',
                    permission: 'master'
                },
                {
                    reg: "^#图片渲染使用(markdown|mathjax)$",
                    fnc: 'pictureStyles',
                    permission: 'master'
                },
                {
                    reg: "^#(开启|关闭)提示回复$",
                    fnc: 'promptAnswer',
                    permission: 'master'
                },
                {
                    reg: "^#更改(sess|chat|god|附加)触发名(.*)",
                    fnc: 'renameTrigger',
                    permission: 'master'
                },
                {
                    reg: "^#更改回复提示词(.*)",
                    fnc: 'prompttips',
                    permission: 'master'
                },
                {
                    reg: "^#(ai|Ai|AI)(开启|关闭)(艾特|at)$",
                    fnc: 'toggleAiAt',
                    permission: 'master'
                },
                {
                    reg: "^#(艾特|at)回复使用(god|chat|sess|附加)$",
                    fnc: 'changeAiChat',
                    permission: 'master'
                },
                {
                    reg: "^#私聊回复使用(god|chat|sess|附加)$",
                    fnc: 'changeAiChat_private',
                    permission: 'master'
                },
                {
                    reg: "^#(开启|关闭)私聊回复$",
                    fnc: 'toggleAi_private',
                    permission: 'master'
                },
                {
                    reg: "^#(开启|关闭)(tts|TTS)回复$",
                    fnc: 'toggleAiTts',
                    permission: 'master'
                },
                {
                    reg: "^#切换(tts|TTS)角色(.*?)$",
                    fnc: 'toggleTtsRole',
                    permission: 'master'
                },
                {
                    reg: "^#(tts|TTS)角色大全$",
                    fnc: 'totalTtsRole'
                },
                {
                    reg: "^#(禁用|解禁)方案(god|chat|附加|sess)$",
                    fnc: 'ban_plans',
                    permission: 'master'
                },
                {
                    reg: "^#(禁用|解禁)(ai|Ai|AI)$",
                    fnc: 'ban_number',
                    permission: 'master'
                },
                {
                    reg: "^#查看(Ai|ai|AI)总设置$",
                    fnc: 'ai_settings',
                    permission: 'master'
                },
                {
                    reg: "^#(ai|AI|Ai)(禁用|解禁)该群$",
                    fnc: 'ban_group',
                    permission: 'master'
                },
                {
                    reg: "^#(开启|关闭)(chat|god)方案记忆限制$",
                    fnc: 'moment_limit',
                    permission: 'master'
                },
                {
                    reg: "^#设置(chat|god)记忆条数(.*?)$",
                    fnc: 'moment_numbers',
                    permission: 'master'
                },
                {
                    reg: "^#(删除|查看)预设(.*?)$",
                    fnc: 'delete_prompts',
                    permission: 'master'
                },
                {
                    reg: "^#(开启|关闭)预设添加$",
                    fnc: 'add_prompts',
                    permission: 'master'
                },
                {
                    reg: "^#(开启|关闭)群记录携带$",
                    fnc: 'add_group_history',
                    permission: 'master'
                },
                {
                    reg: "^#(新增|删除)(ai|AI|aI)违禁词(.*)$",
                    fnc: 'add_words',
                    permission: 'master'
                },
                {
                    reg: "^#(开启|关闭)附加(联网|搜索)$",
                    fnc: 'other_netsearch',
                    permission: 'master'
                },
                {
                    reg: "^#(搜索|查看|下载)云预设[\s\S]*",
                    fnc: 'search_prompts'
                },
                {
                    reg: "^#下载预设[\s\S]*",
                    fnc: 'download_prompts',
                    log: false
                },
                {
                    reg: "^#上传预设[\s\S]*",
                    fnc: 'upload_prompts',
                    log: false
                }
            ]
        })
    }

    async other_netsearch(e) {
        let data = readJsonFile(dataFilePath);
        data.chatgpt.other_netsearch = e.msg.includes("开启");
        writeJsonFile(dataFilePath, data);
        e.reply(`附加方案智能联网搜索已${data.chatgpt.other_netsearch ? '开启' : '关闭'}`);
    }

    async totalTtsRole(e) {
        const groupSize = 20;
        const values = Object.values(tts_roles);
        const result = Array.from({ length: Math.ceil(values.length / groupSize) }, (_, i) =>
            values.slice(i * groupSize, (i + 1) * groupSize).join('，')
        );

        const forwardMsg = await common.makeForwardMsg(e, result, 'tts角色大全');
        await e.reply(forwardMsg);
    }


    async search_prompts(e) {
        if (e.msg.includes('#下载云预设')) {
            const nums = e.msg.replace(/#下载云预设/g, '').match(/\d+/g);
            const presetsPath = `${_path}/data/阴天预设`;
            if (systempromise[nums - 1]) {
                await fs.promises.writeFile(`${presetsPath}/${systempromise[nums - 1].fileName.replace(/^[^/]+\//, '')}`, systempromise[nums - 1].content, 'utf-8');
                e.reply(`成功下载预设【${systempromise[nums - 1].fileName.replace(/\.txt$/, "")}】`);
            } else {
                e.reply('不存在当前预设id，请先搜索');
            }
            return false;
        }
        try {
            const keyword = e.msg.replace(/#(搜索|查看)云预设/g, '');
            const response = await fetch('https://yuanpluss.online:3000/v1/prompts/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ keyword })
            });
            if (!response.ok) {
                e.reply(`HTTP error! status: ${response.status}`);
            }
            const { matchingFiles } = await response.json();

            if (!matchingFiles || matchingFiles.length === 0) {
                await e.reply('未找到相关预设。');
                return false;
            }

            //适配服务器返回的是文件名字符串而不是对象的情况
            systempromise = matchingFiles.map(fileName => ({ fileName })); //将文件名字符串转换为包含fileName属性的数组

            // 获取文件内容
            await Promise.all(systempromise.map(async (item) => {
                try {
                    const filePath = `https://yuanpluss.online:3000/uploads/${encodeURIComponent(item.fileName)}`; // 构建静态文件URL，并进行编码
                    const response = await fetch(filePath);
                    if (response.ok) {
                        item.content = await response.text();
                    } else {
                        console.error(`无法获取文件内容：${filePath}, 状态码：${response.status}`);
                        item.content = "(获取失败)"; // 或者设置为一个错误信息
                    }
                } catch (error) {
                    console.error(`获取文件内容时发生错误：${error.message}`);
                    item.content = "(获取失败)"; // 或者设置为一个错误信息
                }
            }));


            let startIndex = 0;
            const batchSize = 80;

            while (startIndex < systempromise.length) { // 使用systempromise.length
                const batchFiles = systempromise.slice(startIndex, startIndex + batchSize);

                const fileDetails = batchFiles.map((item, index) => {
                    const cleanName = item.fileName.replace(/\.txt$/, "");
                    const weight = item.content ? item.content.slice(0, 100) : "（内容为空或获取失败）";
                    return `
                ┌──────────────────────
                │ 序号: ${startIndex + index + 1}
                │ 名称: ${cleanName}
                │ 内容简述:
                │   ${weight}
                └──────────────────────
                    `.trim();
                });

                const forwardMsg = await common.makeForwardMsg(e, fileDetails, '云预设魔法大全');
                await common.sleep(1500);
                await e.reply(forwardMsg);

                startIndex += batchSize;
            }

        } catch (error) {
            console.error("搜索预设时发生错误:", error.message);
            await e.reply('搜索过程中发生错误，请稍后再试。');
        }
    }

    async add_group_history(e) {
        let data = readJsonFile(dataFilePath);
        data.chatgpt.group_history_open = e.msg.includes("开启");
        writeJsonFile(dataFilePath, data);
        e.reply(`群聊上下文已${data.chatgpt.group_history_open ? '开启' : '关闭'}携带`);
    }

    async add_words(e) {
        let data = readJsonFile(dataFilePath);
        const words = e.msg.replace(/#(新增|删除)(ai|AI|aI)违禁词/g, '')
        if (!data.chatgpt.add_words) {
            data.chatgpt.add_words = []
        }
        if (e.msg.includes("删除")) {
            data.chatgpt.add_words = data.chatgpt.add_words.filter(item => item !== words);
            writeJsonFile(dataFilePath, data);
            e.reply('屏蔽词已成功删除');
            return false;
        }
        data.chatgpt.add_words.push(words);
        writeJsonFile(dataFilePath, data);
        e.reply(`屏蔽词已成功添加${words}`);
    }

    async prompttips(e) {
        let data = readJsonFile(dataFilePath);
        data.chatgpt.prompts_answers = e.msg.replace("#更改回复提示词", '');
        writeJsonFile(dataFilePath, data);
        e.reply(`提示回复词已成功切换为 ·${data.chatgpt.prompts_answers}·`);
    }

    async promptAnswer(e) {
        let data = readJsonFile(dataFilePath);
        data.chatgpt.prompts_answer_open = e.msg.includes("开启");
        writeJsonFile(dataFilePath, data);
        e.reply(`提示回复已${data.chatgpt.prompts_answer_open ? '开启' : '关闭'}`);
    }

    async pictureStyles(e) {
        let data = readJsonFile(dataFilePath);
        data.chatgpt.pictureStyles = e.msg.includes("mathjax");
        writeJsonFile(dataFilePath, data);
        e.reply(`AI图片回复方式已使用${data.chatgpt.pictureStyles ? 'mathjax' : 'markdown'}`);
    }

    async delete_prompts(e) {
        const PATH = `${_path}/data/阴天预设`
        const messages = e.msg.match(/\d+/g);
        const dirname = await fs.promises.readdir(PATH, "utf-8");
        if (!messages || !messages.length) { return false; }
        const msg = Number(messages[0]) - 1;
        if (msg < 0 || msg >= dirname.length) { return false; }
        const filePath = `${PATH}/${dirname[msg]}`;
        if (e.msg.includes("删除")) {
            try {
                await fs.promises.unlink(filePath);
                e.reply(`预设已成功删除`);
            } catch (err) {
                console.error(err);
            }
        } else if (e.msg.includes("查看")) {
            try {
                const prompt = await fs.promises.readFile(filePath, "utf-8");
                const forwardMsg = await common.makeForwardMsg(e, [prompt], '预设魔法大全');
                await e.reply(forwardMsg);
            } catch (err) {
                e.reply(err);
            }
        }
    }

    async add_prompts(e) {
        let data = readJsonFile(dataFilePath);
        data.chatgpt.add_prompts_open = e.msg.includes("开启");
        writeJsonFile(dataFilePath, data);
        e.reply(`预设添加已${data.chatgpt.add_prompts_open ? '开启' : '关闭'}`);
    }

    async upload_prompts(e) {
        let { fileUrl, fileName: filenames } = await getFileInfo(e)
        if (!fileUrl || !filenames) return false;
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error('获取文件失败');
        }
        const content = await response.text();
        const uploads = await UploadSystemFile(e.user_id, filenames, content);
        e.reply(uploads?.message || '文件上传失败');
        return false;
    }

    async download_prompts(e) {
        let { fileUrl, fileName: filenames } = await getFileInfo(e)
        if (!fileUrl || !filenames) return false
        const client = fileUrl.startsWith('https') ? https : http
        client.get(fileUrl, function (response) {
            const presetsPath = `${_path}/data/阴天预设`;
            const file = fs.createWriteStream(presetsPath + "/" + filenames)
            response.pipe(file)
            file.on('finish', function () {
                file.close(() => {
                    e.reply('成功新增预设:\n ' + filenames.replace(/.txt/, ""))
                })
            })
        }).on('error', function (error) {
            fs.unlink(filenames)
            console.error('下载预设文件失败:\n ' + error.message)
        })
        return false
    }

    async moment_numbers(e) {
        const [...nums] = e.msg.match(/\d+/g).map(Number);
        const data = await readJsonFile(dataFilePath);
        if (e.msg.includes("god") && nums[0] >= 1) {
            data.chatgpt.god_moment_numbers = nums[0];
            await writeJsonFile(dataFilePath, data);
            e.reply(`已将所有对话记忆限制为: ${nums[0]} 条,仅god方案生效`);
        }
        if (e.msg.includes("chat") && nums[0] >= 1) {
            data.chatgpt.chat_moment_numbers = nums[0];
            await writeJsonFile(dataFilePath, data);
            e.reply(`已将所有对话记忆限制为: ${nums[0]} 条,仅专业版方案生效`);
        }
    }

    async moment_limit(e) {
        let data = readJsonFile(dataFilePath);
        if (e.msg.includes("god")) {
            data.chatgpt.god_moment_open = e.msg.includes("开启");
            writeJsonFile(dataFilePath, data);
            e.reply(`god方案记忆限制已${data.chatgpt.god_moment_open ? '开启' : '关闭'}`);
        } else if (e.msg.includes("chat")) {
            data.chatgpt.chat_moment_open = e.msg.includes("开启");
            writeJsonFile(dataFilePath, data);
            e.reply(`chat方案记忆限制已${data.chatgpt.chat_moment_open ? '开启' : '关闭'}`);
        }
    }

    async toggleAi_private(e) {
        let data = readJsonFile(dataFilePath);
        data.chatgpt.ai_private_open = e.msg.includes("开启");
        writeJsonFile(dataFilePath, data);
        e.reply(`bot私聊回复已${data.chatgpt.ai_private_open ? '开启' : '关闭'}`);
    }

    async changeAiChat_private(e) {
        let data = readJsonFile(dataFilePath);
        const responseMap = {
            "god": "godgpt",
            "chat": "chat",
            "附加": "others",
            "sess": "sess"
        };

        const foundKey = Object.keys(responseMap).find(key => e.msg.includes(key));
        if (foundKey) {
            data.chatgpt.ai_private_plan = responseMap[foundKey];
            writeJsonFile(dataFilePath, data);
            e.reply(`当前bot私聊回复使用${foundKey}方案,请参考: ${foundKey} 方案的帮助`);
        } else {
            e.reply("无效的方案名称.", true);
        }
    }

    async ai_settings(e) {
        let response = readJsonFile(dataFilePath);
        const chatgptArray = Object.values(response.chatgpt);
        //console.log(response)
        let others_group = JSON.parse(await fs.promises.readFile(_path + "/data/YTotherai/workshop.json", "utf-8")).workshop.limit;
        let god_group = JSON.parse(await fs.promises.readFile(_path + "/data/YTgptgod/workshop.json", "utf-8")).workshop.limit;
        let chat_group = JSON.parse(await fs.promises.readFile(_path + "/data/YTopenai/workshop.json", "utf-8")).workshop.limit;
        const yunzaiNameMap = {
            'miao-yunzai': 'Miao-Yunzai',
            'yunzai': 'Yunzai-Bot',
            'trss-yunzai': 'TRSS-Yunzai',
        };
        let yunzaiName = yunzaiNameMap[cfg.package.name] || '未知';
        const proxyIds = {
            default: '国内线路1',
            1: '国内线路1',
            2: '国内线路2',
            3: '日本节点',
            4: '硅谷机房'
        };
        const chat_proxy = JSON.parse(fs.readFileSync(_path + "/data/YTopenai/proxy.json", "utf-8"));
        const chat_proxyId = chat_proxy.chatgpt.proxy_id;
        const chat_proxyIds = proxyIds[chat_proxyId] || proxyIds.default;
        const god_proxy = JSON.parse(fs.readFileSync(_path + "/data/YTopenai/proxy.json", "utf-8"));
        const god_proxyId = god_proxy.chatgpt.proxy_id;
        const god_proxyIds = proxyIds[god_proxyId] || proxyIds.default;
        let data = {
            quality: 100,
            imgType: 'jpeg',
            all_min_css: _path + "/plugins/y-tian-plugin/resources/css/fontawesome-free-6.6.0-web/css/all.min.css",
            yunzaiName: yunzaiName,
            god_proxy: god_proxyIds,
            chat_proxy: chat_proxyIds,
            others_group: others_group ? '共享区间' : '独立区间',
            god_group: god_group ? '共享区间' : '独立区间',
            chat_group: chat_group ? '共享区间' : '独立区间',
            tplFile: _path + '/plugins/y-tian-plugin/resources/html/data.html',
            src: src,
            css_src: _path + '/plugins/y-tian-plugin/resources/css/data.css',
            BotImage_src: Bot.uin,
            Bot_Nickname: Bot.nickname,
            pictureStyles: response.chatgpt['pictureStyles'] ? 'Mathjax' : 'Markdown',
            ai_chat: response.chatgpt['ai_chat'] == 'godgpt' ? 'god方案' : response.chatgpt['ai_chat'] == 'chat' ? '专业版方案' : response.chatgpt['ai_chat'] == 'sess' ? 'sess方案' : response.chatgpt['ai_chat'] == 'others' ? '附加方案' : '未知',
            ai_chat_at: response.chatgpt['ai_chat_at'] ? '已开启' : '已关闭',
            ai_chat_style: response.chatgpt['ai_chat_style'] == 'picture' ? '图片模式' : response.chatgpt['ai_chat_style'] == 'similar' ? '拟人模式' : response.chatgpt['ai_chat_style'] == 'tts' ? '语音模式' : response.chatgpt['ai_chat_style'] == 'forward' ? '转发文本' : response.chatgpt['ai_chat_style'] == 'pictures' ? '图片模式2' : response.chatgpt['ai_chat_style'] == 'words' ? '引用文本' : response.chatgpt['ai_chat_style'] == 'word' ? '文本模式' : '未知',
            ai_name_sess: response.chatgpt['ai_name_sess'],
            ai_name_godgpt: response.chatgpt['ai_name_godgpt'],
            ai_name_chat: response.chatgpt['ai_name_chat'],
            ai_name_others: response.chatgpt['ai_name_others'],
            ai_private_open: response.chatgpt['ai_private_open'] ? '已开启' : '已关闭',
            ai_private_plan: response.chatgpt['ai_private_plan'] == 'godgpt' ? 'god方案' : response.chatgpt['ai_private_plan'] == 'chat' ? '专业版方案' : response.chatgpt['ai_private_plan'] == 'sess' ? 'sess方案' : response.chatgpt['ai_private_plan'] == 'others' ? '附加方案' : '未知',
            ai_moment_open: response.chatgpt['ai_moment_open'] ? '已开启' : '已关闭',
            ai_moment_numbers: response.chatgpt['ai_moment_numbers'],
            ai_tts: response.chatgpt['ai_tts_open'] ? '已开启' : '已关闭',
            ai_tts_role: response.chatgpt['ai_tts_role'],
            ai_ban_plans: chatgptArray[9],
            ai_ban_number: chatgptArray[10],
            ai_ban_group: chatgptArray[11],
        }
        let img = await puppeteer.screenshot('777', {
            ...data,
        })
        e.reply(img)
    }

    async ban_group(e) {
        let data = readJsonFile(dataFilePath);
        let group_id = e.group_id
        console.log(group_id)
        if (group_id == undefined) { return false }
        if (e.msg.includes("禁用")) {
            if (!data.chatgpt.ai_ban_group.includes(group_id)) {
                data.chatgpt.ai_ban_group.push(group_id)
                writeJsonFile(dataFilePath, data);
                e.reply(`成功禁用群聊:${group_id},此群无法使用AI`);
            }
        } else {
            if (data.chatgpt.ai_ban_group.includes(group_id)) {
                data.chatgpt.ai_ban_group = data.chatgpt.ai_ban_group.filter(item => item !== group_id);
                writeJsonFile(dataFilePath, data);
                e.reply(`成功解禁群聊:${group_id}`);
            }
        }
    }

    async ban_number(e) {
        let data = readJsonFile(dataFilePath);
        let at_qq = e.message.filter(item => item.type == 'at')?.map(item => item?.qq)

        if (e.msg.includes("禁用")) {
            for (var i = 0; i < at_qq.length; i++) {
                if (!data.chatgpt.ai_ban_number.includes(at_qq[i])) {
                    data.chatgpt.ai_ban_number.push(at_qq[i])
                    writeJsonFile(dataFilePath, data);
                }
            }
            if (at_qq.length !== 0) {
                e.reply(`成功禁用${at_qq.length}个成员`);
            }
        } else {
            for (var i = 0; i < at_qq.length; i++) {
                if (data.chatgpt.ai_ban_number.includes(at_qq[i])) {
                    data.chatgpt.ai_ban_number = data.chatgpt.ai_ban_number.filter(item => item !== at_qq[i]);
                    writeJsonFile(dataFilePath, data);
                }
            }

            if (at_qq.length !== 0) {
                e.reply(`成功解禁${at_qq.length}个成员`);
            }
        }
    }

    async ban_plans(e) {
        let data = readJsonFile(dataFilePath);
        const responseMap = {
            "god": "godgpt",
            "chat": "chat",
            "附加": "others",
            "sess": "sess"
        };

        const foundKey = Object.keys(responseMap).find(key => e.msg.includes(key));

        if (e.msg.includes("禁用")) {
            if (data.chatgpt.ai_ban_plans.includes(responseMap[foundKey])) {
                e.reply("此方案已经禁用过了")
                return false
            }

            if (foundKey) {
                data.chatgpt.ai_ban_plans.push(responseMap[foundKey])
                writeJsonFile(dataFilePath, data);
                e.reply(`当前已经禁用${foundKey}方案`);
            } else {
                e.reply("无效的方案名称.", true);
            }
        } else {
            if (!data.chatgpt.ai_ban_plans.includes(responseMap[foundKey])) {
                e.reply("此方案没被禁用")
                return false
            }

            if (foundKey) {
                data.chatgpt.ai_ban_plans = data.chatgpt.ai_ban_plans.filter(item => item !== responseMap[foundKey])
                writeJsonFile(dataFilePath, data);
                e.reply(`当前已重新启用${foundKey}方案`);
            }
        }
    }
    async toggleTtsRole(e) {
        let userInput = e.msg.replace(/#切换(tts|TTS)角色/g, "").trim()
        let speakers = Anime_tts_roles(userInput)
        let data = readJsonFile(dataFilePath);
        if (!speakers) { e.reply("不存在当前角色", true); return false }
        data.chatgpt.ai_tts_role = userInput
        writeJsonFile(dataFilePath, data);
        e.reply(`当前tts角色已切换为【${userInput}】`)
    }

    async toggleAiTts(e) {
        let data = readJsonFile(dataFilePath);
        data.chatgpt.ai_tts_open = e.msg.includes("开启");
        writeJsonFile(dataFilePath, data);
        e.reply(`Ai-tts回复已${data.chatgpt.ai_tts_open ? '开启' : '关闭'}`);
    }

    async changeAiChat(e) {
        let data = readJsonFile(dataFilePath);
        const responseMap = {
            "god": "godgpt",
            "chat": "chat",
            "附加": "others",
            "sess": "sess"
        };

        const foundKey = Object.keys(responseMap).find(key => e.msg.includes(key));
        if (foundKey) {
            data.chatgpt.ai_chat = responseMap[foundKey];
            writeJsonFile(dataFilePath, data);
            e.reply(`当前at回复使用${foundKey}方案,请参考:/${foundKey}帮助`);
        } else {
            e.reply("无效的方案名称.", true);
        }
    }

    async toggleAiAt(e) {
        let data = readJsonFile(dataFilePath);
        data.chatgpt.ai_chat_at = e.msg.includes("开启");
        writeJsonFile(dataFilePath, data);
        e.reply(`AI模型已${data.chatgpt.ai_chat_at ? '开启' : '关闭'}at回复`);
    }

    async renameTrigger(e) {
        const regex = /#更改(sess|chat|god|附加)触发名(.+)/;
        const match = e.msg.match(regex);

        if (!match) {
            e.reply("指令格式错误!", true);
            return;
        }

        const modelType = match[1];
        const name = match[2].trim();

        if (/[&?@+$!%^=|…]/.test(name)) {
            e.reply("触发名不能有特殊字符!");
            return;
        }

        if (name === "") {
            e.reply("触发名不能为空!");
            return;
        }

        let data = readJsonFile(dataFilePath);
        const modelMap = {
            "god": "ai_name_godgpt",
            "chat": "ai_name_chat",
            "附加": "ai_name_others",
            "sess": "ai_name_sess"
        };

        if (modelMap[modelType]) {
            data.chatgpt[modelMap[modelType]] = name;
            writeJsonFile(dataFilePath, data);
            e.reply(`${modelType}模型现在触发名称已修改为:${name}`);
        } else {
            e.reply("无效的模型名称.", true);
        }
    }

    async changeStyles(e) {
        let data = readJsonFile(dataFilePath);
        const styleMap = {
            "文本": "word",
            "引用": "words",
            "转发": "forward",
            "图片2": "pictures",
            "图片": "picture",
            "语音": "tts",
            "拟人": "similar"
        };

        const foundKey = Object.keys(styleMap).find(key => e.msg.includes(key));
        if (foundKey) {
            data.chatgpt.ai_chat_style = styleMap[foundKey];
            writeJsonFile(dataFilePath, data);
            e.reply(`当前AI回复已切换为${foundKey}`);
        } else {
            e.reply("无效的方案名称.", true);
        }
    }
}

const UploadSystemFile = async (username, filename, content) => {
    try {
        const response = await fetch(`https://yuanpluss.online:3000/api/upload/txt/${username}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename: filename,
                content: content
            })
        });

        const result = await response.json();
        if (!response.ok) {
            return '失败：' + result.error;
        }

        return result;
    } catch (error) {
        console.error('上传失败:', error);
        return '失败：' + error?.message;
    }
};