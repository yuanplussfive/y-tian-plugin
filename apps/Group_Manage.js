//addban+内容，添加禁词。
//openban,offban,开机关键字禁言
//给主人带话，自动推送给主人
//禁止带话@xx，禁止某个人带话，允许带话同理。
//开启群带话，顾名思义
//闭嘴／禁言@xx＋时间，禁言一个人
//禁用该群，启用该群，禁用当前群机器人功能
//查看历史+数字,查看群消息记录,不能过多
//清除权限@xx，不让他用机器人
import fs from "fs"
import schedule from "node-schedule";
import common from '../../../lib/common/common.js'
import cfg from '../../../lib/config/config.js';
const _path = process.cwd();
import YAML from "yaml"
let CD = {};
let dirpath = _path + '/resources/jingyan'
if (!fs.existsSync(dirpath)) {
    fs.mkdirSync(dirpath);
}
let dirpath2 = _path + '/resources/jinyan'
if (!fs.existsSync(dirpath2)) {
    fs.mkdirSync(dirpath2);
}
let dirpath3 = _path + '/resources/dhblacklist'
if (!fs.existsSync(dirpath3)) {
    fs.mkdirSync(dirpath3);
}
let dirpath4 = _path + '/resources/historymessage'
if (!fs.existsSync(dirpath4)) {
    fs.mkdirSync(dirpath4);
}
let msg = []
let grouplist = [];//想要推送的群聊,以","隔开
let muteTime = 1;//被禁言时间,单位分钟;
let ok = ""

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
schedule.scheduleJob("0 56 13 * * ?"/*第一个为秒，第二个为分钟，第三个为小时，第四个为日，第五个为星期几（每天的23:30推送,这边改推送的时间） */, async () => {
    let list = ['安静的夜晚，寄上我热和的祝福，带走我深深的问候，愿我的一声祝福洗走你劳动的劳累，一句晚安带你进进美丽的梦境!晚安啦，小可爱!', '(祝)愿美好(祝)愿长，(你)心飞翔(你)情扬，(晚)有好梦(晚)睡香，(安)收短信(安)而康。祝你晚安!', '风不吹，雨不下，此刻你什么都别怕;月光泻，星眼眨，时常我把你牵挂;云想衣，花想容，好梦伴你到天亮;祝你晚安。', '你要相信，你会被世界温柔以待，幸福只是迟到了，它不会永远缺席。晚安!', '让夜风带走一天的疲惫，让月光驱走一天的烦恼，让星星点亮一天的好心情，亲爱的，祝你轻松入眠，美梦连篇，晚安。', '问候不因疲惫而变懒，思念不因劳累而改变，祝福不因休息而变缓，关怀随星星眨眼，牵挂在深夜依然，轻轻道声：祝你晚安!'];//推送的文案
    let text = Math.ceil(Math.random() * list['length'])
    let image = segment.image("https://img.paulzzh.com/touhou/random");//推送图片的网址
});

export class KeyWordsWithDraw extends plugin {
    constructor() {
        super({
            name: '群管',
            dsc: '简单开发示例',
            event: 'message.group',
            priority: 50000,
            rule: [{
                reg: "^#?addban(.*)$",
                fnc: 'tj'
            }, {
                reg: "^#?清除权限$|^#?允许权限$",
                fnc: 'q'
            }, {
                reg: "^#?openban$",
                fnc: 'open'
            }, {
                reg: "^#?offban$",
                fnc: 'close'
            }, {
                reg: "#?给主人带话(.*?)",
                fnc: 'dh'
            }, {
                reg: "#?给群带话(.*?)",
                fnc: 'groupdh'
            }, {
                reg: "^#?禁止带话$|^#?允许带话$|^#?开启群带话$|^#?关闭群带话$",
                fnc: 'jzdh'
            }, {
                reg: '^#?查看历史(.*)$',
                fnc: 'op'
            }, {
                reg: '^#?禁用该群$',
                fnc: "jy",
                permission: 'master',
            }, {
                reg: '^#?启用该群$',
                fnc: "qy",
                permission: 'master',
            }, {
                reg: "^#?闭嘴(.*)$|^#?禁言(.*)",
                fnc: 'bz'
            }, {
                reg: /.*/g,
                fnc: 'Che',
                log: false
            }]
        })
    }
    async bz(e) {
        let muteTime = e.msg.match(/\d+/g);
        console.log(muteTime)
        let at = e.message.filter(item => item.type == 'at')?.map(item => item?.qq)
        console.log(at)
        if (e.sender.role == "admin" || e.sender.role == "owner" || e.isMaster) {
            await e.group.muteMember(at, 60 * muteTime)
            this.reply('给我闭嘴！')
            return false;
        } else {
            e.reply("你的权限不够")
        }
    }
    async jy(e) {
        if (e.isGroup) {
            this.file = './config/config/group.yaml'
            let data = YAML.parse(fs.readFileSync(this.file, 'utf8'))
            data[e.group_id] = { enable: ["群管",] }
            let yaml = YAML.stringify(data)
            fs.writeFileSync(this.file, yaml, "utf8")
            e.reply("该群聊功能已禁用")
        } else {
            e.reply('非群聊无法使用')
        }
    }
    async qy(e) {
        if (e.isGroup) {
            this.file = './config/config/group.yaml'
            let data = YAML.parse(fs.readFileSync(this.file, 'utf8'))
            data[e.group_id] = { enable: null }
            let yaml = YAML.stringify(data)
            fs.writeFileSync(this.file, yaml, "utf8")
            e.reply("该群聊功能已启用")
        } else {
            e.reply('非群聊无法使用')
        }
    }
    async q(e) {
        let dirpath = _path + '/resources/gm';
        let data = fs.readFileSync(dirpath + "/" + 'gm.json', 'utf-8');
        let obj = JSON.parse(data)
        if (!obj.gm.includes(`${e.user_id}`)) { e.reply("Sorry,you are not GM that You can not do it.SHIT!"); return false }
        let at = e.message.filter(item => item.type == 'at')?.map(item => item?.qq)

        if (at == cfg.masterQQ[0]) { e.reply("Sorry,you can not attempt to do this to my master.Fuck man!"); return false }
        //console.log(typeof(at))
        if (e.msg.includes("清除权限")) {
            let file = _path + '/config/config/other.yaml'
            let data = YAML.parse(fs.readFileSync(file, 'utf8'))
            let black = data.blackQQ
            let v = YAML.stringify(black)
            if (v.includes(at)) {
                e.reply("此人已经被禁用功能了")
                return
            }
            console.log(black)
            data["blackQQ"] = { at, black }
            let yaml = YAML.stringify(data)
            yaml = yaml.replace("at:", "").replace("black:", "").replace(/null/g, "")
            fs.writeFileSync(file, yaml, "utf8")
            e.reply(`ok,${at}已被禁用功能了`)
            return
        }

        if (e.msg.includes("允许权限")) {
            let file = _path + '/config/config/other.yaml'
            let data = YAML.parse(fs.readFileSync(file, 'utf8'))
            let black = data.blackQQ
            let v = YAML.stringify(black)
            if (!v.includes(at)) {
                e.reply("此人未被禁用功能")
                return
            }
            else {
                let yaml = YAML.stringify(data)
                yaml = yaml.replace(`- ${at}`, "").replace(/null/g, "")
                fs.writeFileSync(file, yaml, "utf8")
                e.reply(`ok,${at}已被从禁用功能名单内放出来了`)
                return
            }


        }
    }
    async jzdh(e) {
        if (!e.user_id == cfg.masterQQ) {
            e.reply("你不是主人,无权设置")
            return
        }
        if (e.msg.includes("开启群带话")) {
            ok = "open"
            e.reply("已开启")
        }
        if (e.msg.includes("关闭群带话")) {
            ok = "false"
            e.reply("已关闭")
        }
        let at = e.message.filter(item => item.type == 'at')?.map(item => item?.qq)
        if (e.msg.includes("禁止带话")) {
            if (!fs.existsSync(dirpath3 + "/" + `${e.group_id}.json`)) {
                let qq = at + ","
                fs.writeFileSync(dirpath3 + "/" + `${e.group_id}.json`, JSON.stringify({
                    "group_id":
                    {
                        "group_id": e.group_id,
                        "qq": qq,
                    },
                }));
                e.reply(`当前群聊[${e.group_id}]已禁止${at}带话`)
                return
            }
            if (fs.existsSync(dirpath3 + "/" + `${e.group_id}.json`)) {
                let qq = at + ","
                let js = JSON.parse(fs.readFileSync(dirpath3 + "/" + `${e.group_id}.json`, "utf8"))
                let qq2 = js.group_id.qq
                if (qq2.includes(`${at}`)) {
                    e.reply("此人已禁止过了")
                    return
                }

                qq2 = qq2 + qq
                fs.writeFileSync(dirpath3 + "/" + `${e.group_id}.json`, JSON.stringify({
                    "group_id":
                    {
                        "group_id": e.group_id,
                        "qq": qq2,
                    },
                }));
                e.reply(`当前群聊[${e.group_id}]已禁止${at}带话`)
                return
            }
        }
        else if (e.msg.includes("允许带话")) {
            if (!fs.existsSync(dirpath3 + "/" + `${e.group_id}.json`)) {
                e.reply(`此人没有被禁止带话`)
                return
            }
            if (fs.existsSync(dirpath3 + "/" + `${e.group_id}.json`)) {
                let qq = at + ","
                let js = JSON.parse(fs.readFileSync(dirpath3 + "/" + `${e.group_id}.json`, "utf8"))
                let qq2 = js.group_id.qq
                qq2 = qq2.replace(`${at},`, "")
                if (qq2 == "") {
                    fs.unlinkSync(dirpath3 + "/" + `${e.group_id}.json`, "utf-8")
                    e.reply(`当前群聊[${e.group_id}]已允许${at}带话`)
                    return
                }
                fs.writeFileSync(dirpath3 + "/" + `${e.group_id}.json`, JSON.stringify({
                    "group_id":
                    {
                        "group_id": e.group_id,
                        "qq": qq2,
                    },
                }));
                e.reply(`当前群聊[${e.group_id}]已允许${at}带话`)
                return
            }
        }
    }
    async dh(e) {
        if (ok == "false") {
            return
        }
        if (fs.existsSync(dirpath3 + "/" + `${e.group_id}.json`)) {
            let js = JSON.parse(fs.readFileSync(dirpath3 + "/" + `${e.group_id}.json`, "utf8"))
            let qq = js.group_id.qq
            if (qq.includes(`${e.user_id}`)) {
                e.reply("你小子已被禁止带话，找我主人去解封")
                return
            }
        }

        let sr = e.msg.replace(/#?给主人带话/g, "").trim();
        function shijian() {
            let date = new Date()
            let Y = date.getFullYear() + '-'
            let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
            let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' '
            let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
            let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
            let s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())
            return Y + M + D + h + m + s
        }
        console.log(cfg.masterQQ)
        let M = [`来自群聊:[${e.group_name}(${e.group_id})]`, "\n", `带话人:${e.sender.nickname}` + "(" + `${e.user_id}` + `)`, "\n", "带话内容:" + "[" + sr + "]", "\n", "时间:" + shijian()]
        Bot.pickFriend(cfg.masterQQ[0]).sendMsg(M)
        e.reply("给主人发送消息成功~")
    }
    async qc(e) {

    }
    async op(e) {
        if (fs.existsSync(dirpath4 + "/" + "jl.json")) {
            fs.unlinkSync(dirpath4 + "/" + "jl.json");
        }
        let sr = e.msg.replace(/#?查看历史/g, "").trim();
        sr = sr.match(/\d+/g);
        let chat = await e.group.getChatHistory(0, 1);
        let seq = chat[0].seq
        let time = chat[0].time
        let ranklistData = {}
        ranklistData[e.group_id] = ranklistData[e.group_id] ? ranklistData[e.group_id] : {
            lastseq: 0,
            acount: 0
        }
        e.reply("正在为您分析中，请稍等~")
        var start = new Date().getTime()
        let CharList = ranklistData[e.group_id].list ? ranklistData[e.group_id].list : {};
        let y = Number(seq) - Number(sr)
        console.log(y)
        console.log(seq)
        for (let p = seq; p > y; p = p - 1) {
            let Char = await e.group.getChatHistory(p, 1);
            //console.log(Char)
            for (let a = 0; a < sr; a++) {
                if (typeof (Char[a]) === "undefined") {
                    break;
                }
                let jl = Char[a].raw_message
                let uid = Char[a].sender.user_id
                let name = Char[a].sender.title
                let card = Char[a].sender.card
                let message = ["\n", `群称呼:[${name}]`, "\n", `群名称:[${card}]`, "\n", `qq:[${uid}]`, "\n", `发言内容:[${jl}]`, "\n", "\n"]
                fs.appendFileSync(dirpath4 + "/" + `jl.json`, `${message}`)
            }
        }
        await common.sleep(1000)
        var end = new Date().getTime()
        let sj = Number(end - start) / Number(1000)
        e.reply(`已经完成了,用时${sj}s`)
        var data_msg = []
        if (fs.existsSync(dirpath4 + "/" + `jl.json`)) {
            let js = fs.readFileSync(dirpath4 + "/" + `jl.json`, "utf8")
            data_msg.push({
                message: js,
                nickname: '狐狸',
                user_id: cfg.masterQQ[0]
            })
            let brief = ""
            let title = "历史记录"
            let summary = ``
            let ForwardMsg;
            ForwardMsg = await e.group.makeForwardMsg(data_msg);
            let regExp = /<summary color=\"#808080\" size=\"26\">查看(\d+)条转发消息<\/summary>/g;
            let res2 = regExp.exec(ForwardMsg.data);
            let pcs = res2[1];
            ForwardMsg.data = ForwardMsg.data.replace(/<msg brief="\[聊天记录\]"/g, `<msg brief=\"[${brief ? brief : "聊天记录"}]\"`)
                .replace(/<title color=\"#000000\" size=\"34\">转发的聊天记录<\/title>/g, `<title color="#000000" size="34">${title ? title : "群聊的聊天记录"}</title>`)
                .replace(/<summary color=\"#808080\" size=\"26\">查看(\d+)条转发消息<\/summary>/g, `<summary color="#808080" size="26">${summary ? summary : `查看${pcs}条转发消息`}</summary>`);
            e.reply(ForwardMsg)


        }
        console.log(time)
        function shijian(time) {
            let date = new Date()
            let Y = date.getFullYear() + '-'
            let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
            let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' '
            let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
            let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
            let s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())
            return Y + M + D + h + m + s
        }
        console.log(shijian(time))
        //console.log(chat)
    }
    async open(e) {
        let group = e.group_id
        if (!e.user_id == cfg.masterQQ) {
            e.reply("你不是主人，无法开启")
            return
        }
        if (!fs.existsSync(dirpath2 + "/" + `${group}.json`)) {
            fs.writeFileSync(dirpath2 + "/" + `${group}.json`, JSON.stringify({
                "group_id":
                {
                    "key": "open",
                },
            }));
            e.reply(`当前群聊[${e.group_id}]关键词禁言已开启`)
            return
        }
        if (fs.existsSync(dirpath2 + "/" + `${group}.json`)) {
            let js = JSON.parse(fs.readFileSync(dirpath2 + "/" + `${group}.json`, "utf8"))
            let key = js.group_id.key
            if (key == "close") {
                fs.writeFileSync(dirpath2 + "/" + `${e.group_id}.json`, JSON.stringify({
                    "group_id":
                    {
                        "key": "open",
                    },
                }));
                e.reply(`当前群聊[${e.group_id}]关键词禁言已开启`)
            } else if (key == "open") {
                e.reply("已经开启了")
            }
        }
    }
    async close(e) {
        let group = e.group_id
        if (!e.user_id == cfg.masterQQ) {
            e.reply("你不是主人，无法关闭")
            return
        }
        if (!fs.existsSync(dirpath2 + "/" + `${group}.json`)) {
            fs.writeFileSync(dirpath2 + "/" + `${group}.json`, JSON.stringify({
                "group_id":
                {
                    "key": "close",
                },
            }));
            e.reply(`当前群聊[${e.group_id}]关键词禁言已关闭`)
            return
        }
        if (fs.existsSync(dirpath2 + "/" + `${group}.json`)) {
            let js = JSON.parse(fs.readFileSync(dirpath2 + "/" + `${group}.json`, "utf8"))
            let key = js.group_id.key
            if (key == "open") {
                fs.writeFileSync(dirpath2 + "/" + `${e.group_id}.json`, JSON.stringify({
                    "group_id":
                    {
                        "key": "close",
                    },
                }));
                e.reply(`当前群聊[${e.group_id}]关键词禁言已关闭`)
            } else if (key == "close") {
                e.reply("已经关闭了")
            }
        }
    }
    async tj(e) {
        let group = e.group_id
        let sr = e.msg.replace(/#?addban/g, "").trim();
        if (!e.user_id == cfg.masterQQ) {
            e.reply("你不是主人，无法添加")
            return
        }
        if (!fs.existsSync(dirpath + "/" + `${group}.json`)) {
            let gh = sr + ","
            fs.writeFileSync(dirpath + "/" + `${group}.json`, JSON.stringify({
                "group_id":
                {
                    "群号": e.group_id,
                    "jing": gh,
                },
            }));
            e.reply(`当前群聊[${e.group_id}]新设置禁言词[${sr}]`)
            return
        }
        if (fs.existsSync(dirpath + "/" + `${group}.json`)) {
            let js = JSON.parse(fs.readFileSync(dirpath + "/" + `${group}.json`, "utf8"))
            let jing = js.group_id.jing
            let jing2 = jing + sr + ","
            fs.writeFileSync(dirpath + "/" + `${e.group_id}.json`, JSON.stringify({
                "group_id":
                {
                    "群号": e.group_id,
                    "jing": jing2,
                },
            }));
            e.reply(`当前群聊[${e.group_id}]新设置禁言词[${sr}]`)
        }
    }
    async Che(e) {
        if (!e.isGroup) {
            return false;
        }
        if (e.user_id == cfg.masterQQ) {
            console.log("对主人不生效")
            return false
        } else {
            msg[e.user_id] = e.msg + "";
            if (fs.existsSync(dirpath + "/" + `${e.group_id}.json`)) {
                let js = JSON.parse(fs.readFileSync(dirpath + "/" + `${e.group_id}.json`, "utf8"))
                let jing = js.group_id.jing
                console.log(jing.length)
                let Ch = jing.split(",")
                let Che = Ch.slice(0, -1)
                //console.log(Che)
                //console.log(Che.length)
                for (let i = 0; i < Che.length; i++) {
                    if (msg[e.user_id].indexOf(Che[i]) !== -1) {
                        console.log('检测到主人的违禁词：', Che[i]); let source = (await e.group.getChatHistory(e.msg.time, 1)).pop();
                        await common.sleep(500)
                        if (fs.existsSync(dirpath2 + "/" + `${e.group_id}.json`)) {
                            let js = JSON.parse(fs.readFileSync(dirpath2 + "/" + `${e.group_id}.json`, "utf8"))
                            let key = js.group_id.key
                            if (key == "open") {
                                e.reply(`检验到已触发主人的违禁词【${Che[i]}】,给你点小惩罚哦~`)
                                await e.group.muteMember(e.user_id, 60 * muteTime)
                            }
                        }
                        await e.group.recallMsg(source.message_id);
                        return
                    }
                }
            }
        }
    }
}