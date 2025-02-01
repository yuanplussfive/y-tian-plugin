import yaml from 'yaml';
import fs from 'fs/promises';

const CONFIG_FILE = `${process.cwd()}/plugins/y-tian-plugin/config/voice_config.yaml`;
const BASE_URL = 'https://gsv.acgnai.top/gradio_api/queue';
const HEADERS = {
    'accept': '*/*',
    'content-type': 'application/json',
    'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132", "Microsoft Edge";v="132"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Referer': 'https://gsv.acgnai.top/',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
};

let config;
(async () => {
    try {
        await fs.access(CONFIG_FILE);
        const file = await fs.readFile(CONFIG_FILE, 'utf8');
        config = yaml.parse(file);
    } catch (error) {
        if (error.code === 'ENOENT') {
            const defaultConfig = {
                character: '【原神】稻妻',
                speaker: '雷电将军',
                language: '中文',
                emotion: '生气_angry',
                outputLanguage: '中文',
                speed: 10,
                volume: 1,
                pitch: 1,
                segmentMethod: '按标点符号切',
                noise: 10,
                noisew: 0.75,
                sdp: true,
                length: 1,
                alpha: 0.3,
                format: 'wav',
                play: true,
                sampleRate: 1.35,
                seed: -1
            };
            await fs.writeFile(CONFIG_FILE, yaml.stringify(defaultConfig));
            config = defaultConfig;
        } else {
            console.error('加载tts配置文件时发生错误:', error);
        }
    }
    //console.log('配置文件加载完成:', config);
})();

// 生成会话哈希
function generateSessionHash() {
    return Math.random().toString(36).substring(2, 12);
}

// 发送请求并处理响应
async function sendRequest(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`请求失败: ${response.status} ${await response.text()}`);
    }
    return response;
}

async function postJson(url, body, headers) {
    const response = await sendRequest(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });
    return response.json();
}

// 监听流式响应
async function waitForStreamEnd(sessionHash, headers) {
    return new Promise(async (resolve, reject) => {
        const response = await sendRequest(`${BASE_URL}/data?session_hash=${sessionHash}`, {
            headers: { ...headers, 'accept': 'text/event-stream' }
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const processData = async () => {
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        console.log('流式响应结束');
                        resolve();
                        return;
                    }
                    const lines = decoder.decode(value).split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataString = line.replace("data:", "").trim();
                            if (dataString) {
                                try {
                                    const data = JSON.parse(dataString);
                                    console.log('收到状态数据:', data);
                                    if (data.msg === 'close_stream') {
                                        reader.releaseLock();
                                        resolve();
                                        return;
                                    }
                                } catch (parseError) {
                                    console.warn('解析 JSON 数据时发生错误，跳过:', parseError);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('流式响应处理错误:', error);
                reject(error);
            }
        };
        processData();
    });
}


// 1. 触发角色列表加载
async function fetchCharacterChoices(sessionHash, headers) {
    const body = {
        data: [config.character],
        event_data: null,
        fn_index: 0,
        trigger_id: 18,
        session_hash: sessionHash
    };
    const { event_id } = await postJson(`${BASE_URL}/join`, body, { ...headers, 'priority': 'u=1, i', 'sec-fetch-dest': 'empty', 'sec-fetch-mode': 'cors', 'sec-fetch-site': 'same-origin' });
    console.log('成功触发角色列表加载, event_id:', event_id);
    return event_id;
}

// 2. 更新角色选择 (选择说话人，语言，情绪等)
async function updateCharacterChoices(sessionHash, headers) {
    const body = {
        data: [config.character, config.speaker],
        event_data: null,
        fn_index: 1,
        trigger_id: 19,
        session_hash: sessionHash
    };
    const { event_id } = await postJson(`${BASE_URL}/join`, body, { ...headers, 'priority': 'u=1, i', 'sec-fetch-dest': 'empty', 'sec-fetch-mode': 'cors', 'sec-fetch-site': 'same-origin' });
    console.log('成功更新角色选择, event_id:', event_id);
    return event_id;
}


// 3. 生成音频
async function generateAudio(text, sessionHash, headers) {
    const body = {
        data: [
            config.character,
            config.speaker,
            config.language,
            config.emotion,
            text,
            config.outputLanguage,
            config.speed,
            config.volume,
            config.pitch,
            config.segmentMethod,
            config.noise,
            config.noisew,
            config.sdp,
            config.length,
            config.alpha,
            config.format,
            config.play,
            config.sampleRate,
            config.seed
        ],
        fn_index: 7,
        trigger_id: 26,
        event_data: null,
        session_hash: sessionHash
    };

    const { event_id } = await postJson(`${BASE_URL}/join`, body, headers);
    console.log('成功加入音频生成队列，event_id:', event_id);

    return new Promise(async (resolve, reject) => {
        try {
            const response = await sendRequest(`${BASE_URL}/data?session_hash=${sessionHash}`, {
                headers: { ...headers, 'accept': 'text/event-stream' }
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const lines = decoder.decode(value).split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataString = line.replace("data:", "").trim();
                        if (dataString) {
                            try {
                                const data = JSON.parse(dataString);
                                console.log('收到音频生成队列状态数据:', data);

                                if (data.msg === 'process_completed') {
                                    const audioUrl = data.output?.data?.[0]?.url;
                                    if (audioUrl) {
                                        console.log('音频生成完成，音频URL:', audioUrl);
                                        resolve(audioUrl);
                                    } else {
                                        console.error('音频生成完成，但未找到音频 URL');
                                        reject(new Error('音频生成完成，但未找到音频 URL'));
                                    }
                                    return;
                                }

                                if (data.msg === 'estimation') {
                                    console.log(`队列位置: ${data.rank}, 预计等待时间: ${data.rank_eta}秒`);
                                } else if (data.msg === 'process_starts') {
                                    console.log(`开始处理，预计处理时间: ${data.eta}秒`);
                                }
                            } catch (parseError) {
                                console.warn('解析 JSON 数据时发生错误，跳过:', parseError);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('生成音频时发生错误:', error);
            reject(error);
        }
    });
}


// 主函数
export async function TTSCreate(text) {
    try {
        const sessionHash = generateSessionHash();
        console.log("Session Hash:", sessionHash);

        console.log("开始触发角色列表加载...");
        await fetchCharacterChoices(sessionHash, HEADERS);
        console.log("开始监听角色列表加载状态 (等待流式响应结束)...");
        await waitForStreamEnd(sessionHash, HEADERS);
        console.log("角色列表加载完成 (流式响应结束).");

        console.log("开始更新角色选择...");
        await updateCharacterChoices(sessionHash, HEADERS);
        console.log("开始监听角色选择更新状态 (等待流式响应结束)...");
        await waitForStreamEnd(sessionHash, HEADERS);
        console.log("角色选择更新完成 (流式响应结束).");

        console.log("开始加入音频生成队列...");
        const audioUrl = await generateAudio(text, sessionHash, HEADERS);
        console.log('最终音频 URL:', audioUrl);
        return audioUrl;
    } catch (error) {
        console.error('音频生成过程中发生错误:', error);
        throw error;
    }
}