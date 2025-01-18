//feed接口，即根据笔记ID获取笔记详情
import axios from "../../../../node_modules/axios/index.js";
import { x_s_common } from "../sign/X-S-Common.js";
import { b1, my_cookie, cookie_a1 } from "../config/config.js";
import { get_xs_xt } from "../sign/X-S.js";

function getRamNumber() {
    var result = '';
    for (var i = 0; i < 16; i++) {
        result += Math.floor(Math.random() * 16).toString(16);
    }
    return result.toUpperCase();
}

//xsec_token疑似不需要
export const feed = async (note_id, xsec_token) => {
    const data = {
        "source_note_id": note_id,
        "image_formats": ["jpg", "webp", "avif"],
        "extra": { "need_body_topic": "1" },
        "xsec_source": "pc_search",
        "xsec_token": xsec_token
    }
    const url = 'https://edith.xiaohongshu.com/api/sns/web/v1/feed'
    const temp_sign = await get_xs_xt(url, data, cookie_a1)
    const x_s = temp_sign['X-s']
    const x_t = temp_sign['X-t']
    const headers = {
        'Accept': "application/json, text/plain, */*",
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6,zh-TW;q=0.5',
        'Content-Type': 'application/json;charset=UTF-8',
        'Cookie': my_cookie,
        'Priority': 'u=1, i',
        'Referer': 'https://www.xiaohongshu.com/',
        'Sec-Ch-Ua':
            `"Microsoft Edge";v="125", "Chromium";v="125", "Not.A/Brand";v="24"`,
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': "Windows",
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0',
        'X-B3-Traceid': getRamNumber(),
        'X-S': x_s,
        'X-T': x_t,
        'X-S-Common': x_s_common(x_s, x_t, b1),
        'x-mns': 'unload',
        "sc-t": "atR1VykZ-RlKUNEOcZck81oPJEQScWjrO1DWVLXw3YtmKFW9prSiNlXx_lDm8cln9DCQuz3_lIRxuRua8kvFt0dMaInvNck6i3bW0ef1Njo-KfbvCER6R19C-h1MBvOeuU33FhuSY7Ys_znTclrk81oPJEQSkjRkiaIE-W9187Ys_DGn0EYkt1dDCshUiu4SYefWOcmMUefSOl8PSnrdYefSYko7ifKrXefWHcmMUefSNECler3SOEhP3U4C_kxStuMwaRDmjVo9iIyutV8eYEhm7fRtGepsZdlOruh7xAkS9hu9brnGYJXvdeSMKVxqCIlOLFQWA5kWEXgiuy3pYAmY8nI77cASxh1McFnu_aouhICd9EdedYyLodRwq054_yRsTyY47YqHeR9ofuWccdlV8KBeJUZfCOak-eX_oM60s1LcBiVfdJeVz7sS4o7zeNi12HhNCqzI31rdNongL60XFTIaOaLG2NcVMLV_AQEI11zNvkIHX7rVV68W-cNeoscUw0DoSQjfwW2mWihhnxjVmY1SCtNXMNNrM0DJJM6rPQpP7ingHK_jD2X72cc45Kar8EX_-weVxCG_7aX4UNzkIGsx4aKV5JisCaIbMv0A6WEOvkIVUTG6V5qQjoiVgKo2TLgx6M52vWrCBZqfUT0zb6VdWzir3Kc3NU4bqs2jM8kTxeVUUTj6fAqt3HT-WGYfS0Db43Hf48UZpEhzzNx3DTXFvfeXWd0r-nnJdJ2g41EdxI8znN55hAhMOcBuyv0OLXScXdWW1TuikYW9zdUVh0m8TFs1uOk7iVwcXYly.",
        'x-xray-traceid': 'ca3b2ac1f1c735709da9c2e65d48713a'
    }
    console.log(headers)
    const output = await axios.post(url, data, {
       headers
    })
    console.log(output?.data);
    return output.data;
}