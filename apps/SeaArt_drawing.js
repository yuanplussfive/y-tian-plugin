import { dependencies } from "../YTdependence/dependencies.js";
const { axios, common, fs, YAML, _path } = dependencies
const MAX_RETRIES = 24;
const RETRY_DELAY = 5000;
let art_model_no = "1a486c58c2aa0601b57ddc263fc350d0"
await SaveFile()

export class example extends plugin {
    constructor() {
        super({
            name: '阴天[海艺绘图]',
            dsc: '',
            event: 'message',
            priority: 2000,
            rule: [
                {
                    reg: "^#海艺绘图(.*)",
                    fnc: 'drawing'
                }, 
                {
                    reg: "^#查看海艺模型",
                    fnc: 'search'
                }, 
                {
                    reg: "^#切换海艺模型(.*)",
                    fnc: 'change'
                }
            ]
        });
    }

    async change(e) {
        const headers = await getHeaders()
        const data = await models(headers)
        const lists = data.map(({ model_no, model_name }) => ({ model: model_no, model_name }));
        //console.log(lists)
        const firstNumber = e.msg.match(/\d+/);
        if (firstNumber[0]) {
            console.log(Number(firstNumber[0]));
            art_model_no = lists[Number(firstNumber[0] - 1)].model
            e.reply(`绘图超过切换为${lists[Number(firstNumber[0] - 1)].model_name}`)
        }

    }

    async search(e) {
        const headers = await getHeaders()
        const data = await models(headers)
        const forwardMsg = data.map(({ model_name, model_cover, sort, desc }) => {
            const result = `模型序号:${sort}\n模型名称:${model_name}\n模型封面:${model_cover}\n模型描述:${desc}`
            return result;
        });
        const JsonPart = await common.makeForwardMsg(e, forwardMsg, '海艺绘图模型');
        e.reply(JsonPart)
    }

    async drawing(e) {
        const config = YAML.parse(fs.readFileSync(`${_path}/data/YTseaart/config.yaml`, 'utf8'));
        console.log(config)
        let { data } = config
        const headers = await getHeaders()

        const prompt = e.msg.replace(/#海艺绘图/g, '').trim()
        data.art_model_no = art_model_no
        data.meta.prompt = prompt
        data.meta.lora_models = []
        const id = await create(data, headers)

        //console.log(id)
        const imageUrl = await fetchImageUris(id, headers)
        //console.log(imageUrl)
        e.reply(segment.image(imageUrl))
    }
}

async function create(data, headers) {
    try {
        data.meta.seed = Math.floor(Math.random() * (2000000 - 1 + 1)) + 1;
        const response = await axios({
            method: 'post',
            url: 'https://www.seaart.me/api/v1/task/create',
            headers,
            data
        });

        //console.log(response.data.data);
        //console.log(response.data.status);
        return response.data.data.id
    } catch (error) {
        return null
    }
}

async function fetchImageUris(id, headers) {
    let retries = 0;
    while (retries < MAX_RETRIES) {
        try {
            const response = await axios.post('https://www.seaart.me/api/v1/task/batch-progress', { task_ids: [id] }, { headers });
            const { data } = response.data;
            const items = data.items;
            console.log(items)
            if (items && items.length > 0 && items.some(item => item.img_uris && Array.isArray(item.img_uris) && item.img_uris.length > 0)) {
                return data.items[0].img_uris[0].url;
            }
        } catch (error) {
            return error;
        }
        retries++;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
    return null
}

async function models(headers) {
    try {
        const response = await axios.post(
            'https://www.seaart.me/api/v1/task/simple/config',
            null,
            {
                headers
            }
        );

        return response.data.data.recommend_models;
    } catch (error) {
        return null;
    }
};

async function getHeaders() {
    const config = YAML.parse(fs.readFileSync(`${_path}/data/YTseaart/config.yaml`, 'utf8'));
    //console.log(config)
    let { user_token } = config
    const headers = {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'zhCN',
        'content-type': 'application/json',
        'token': user_token,
        'x-app-id': 'web_global_seaart',
        'x-platform': 'web',
        'Referer': 'https://www.seaart.me/zhCN'
    }
    return headers
}

async function SaveFile() {
    if (!fs.existsSync(_path + "/data/YTseaart")) {
        fs.mkdirSync(_path + "/data/YTseaart")
    }
    if (!fs.existsSync(_path + "/data/YTseaart/config.yaml")) {
        const yamlFile = fs.readFileSync(`${_path}/plugins/y-tian-plugin/YTfreeai/drawing/config.yaml`, 'utf8');
        const yamlFiledata = YAML.parse(yamlFile);
        //console.log(yamlFiledata)
        fs.writeFileSync(_path + "/data/YTseaart/config.yaml", YAML.stringify(yamlFiledata), 'utf8');
    }
}