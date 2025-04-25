import fetch from 'node-fetch';
import path from 'path';
import YAML from 'yaml';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { random_safe } from '../../../../utils/requests/safeurl.js';

export async function waiIll(prompt, model = 'WAI-illustrious-SDXL_v13.0') {
    try {
        const modelMapping = {
            "WAI-illustrious-SDXL_v13.0": {
                checkpointModelVersionId: 97167,
                sampler: 'Euler',
                guidanceScale: 6,
                modelName: 'R-ESRGAN 4x+ Anime 6B'
            },
            "万象熔炉 | Anything XL_XL": {
                checkpointModelVersionId: 45,
                sampler: 'DPM++ 2M SDE Karras',
                guidanceScale: 7,
                modelName: 'R-ESRGAN 4x+ Anime 6B'
            },
            "Animagine XL 4.0_v4-opt": {
                checkpointModelVersionId: 40674,
                sampler: 'Euler',
                guidanceScale: 6,
                modelName: 'R-ESRGAN 4x+ Anime 6B'
            },
            "NoobAI-XL(NAI-XL)_epsilon1.1": {
                checkpointModelVersionId: 7672,
                sampler: 'Euler',
                guidanceScale: 6,
                modelName: 'R-ESRGAN 4x+ Anime 6B'
            },
            "ModelE/Illustrious-XL_v1.1": {
                checkpointModelVersionId: 73119,
                sampler: 'Euler',
                guidanceScale: 6,
                modelName: 'R-ESRGAN 4x+ Anime 6B'
            },
            "JKCCCC/test2_pony": {
                checkpointModelVersionId: 56191,
                sampler: 'Euler',
                guidanceScale: 6,
                modelName: 'Ultrasharp 4x'
            },
            "menyudada/MiaoMiaoPixel_v1.0": {
                checkpointModelVersionId: 43927,
                sampler: 'Euler',
                guidanceScale: 6,
                modelName: 'R-ESRGAN 4x+ Anime 6B'
            },
            "JKCCCC/WAI-ANI_WANNI": {
                checkpointModelVersionId: 101219,
                sampler: 'Euler',
                guidanceScale: 6,
                modelName: 'Ultrasharp 4x'
            }
        };
        const configPath = path.join(__dirname, '../../../../config/message.yaml');
        console.log(configPath)
        let config = {};
        if (fs.existsSync(configPath)) {
            const file = fs.readFileSync(configPath, 'utf8');
            const configs = YAML.parse(file);
            config = configs.pluginSettings;
        }

        const m_session_id = config?.modelscope_m_session_id || '';
        const submitResponse = await fetch(random_safe('aHR0cHM6Ly9tb2RlbHNjb3BlLmNuL2FwaS92MS9tdXNlL3ByZWRpY3QvdGFzay9zdWJtaXQ='), {
            method: 'POST',
            headers: {
                'accept': 'application/json, text/plain, */*',
                'content-type': 'application/json',
                'cookie': `m_session_id=${m_session_id}`,
                'x-modelscope-accept-language': 'zh_CN',
                'Referer': random_safe('aHR0cHM6Ly9tb2RlbHNjb3BlLmNuL2FpZ2MvaW1hZ2VHZW5lcmF0aW9uP3RhYj1hZHZhbmNlZA=='),
                'Referrer-Policy': 'strict-origin-when-cross-origin'
            },
            body: JSON.stringify({
                modelArgs: {
                    checkpointModelVersionId: modelMapping[model].checkpointModelVersionId,
                    loraArgs: [],
                    checkpointShowInfo: model
                },
                promptArgs: {
                    prompt,
                    negativePrompt: 'text,username,logo,low quality,worst quality,bad anatomy,inaccurate limb,bad composition,inaccurate eyes,extra digit,fewer digits,(extra arms:1.2),furry,artist_name,weibo_username,weibo_logo,twitter_username,twitter_logo,patreon_username,multiple views,censored,bar censor,multiple view,mosaic censoring,pointless censoring,artist name,heart censor,signature,dated,lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry'
                },
                basicDiffusionArgs: {
                    sampler: modelMapping[model].sampler,
                    guidanceScale: modelMapping[model].guidanceScale,
                    seed: -1,
                    numInferenceSteps: 30,
                    numImagesPerPrompt: 1,
                    width: 1080,
                    height: 1440
                },
                adetailerArgsMap: {
                    adetailerHand: {
                        adModel: "hand_yolov8s.pt",
                        adInpaintingArgs: {}
                    }
                },
                hiresFixFrontArgs: {
                    modelName: modelMapping[model].modelName,
                    scale: 2
                },
                predictType: 'TXT_2_IMG',
                controlNetFullArgs: []
            })
        });

        const submitData = await submitResponse.json();
        if (!submitData.Success || submitData.Code !== 200) {
            throw new Error('任务提交失败: ' + submitData.Message);
        }

        const taskId = submitData.Data.data.recordId;
        console.log('任务提交成功，taskId:', taskId);

        // 查询状态
        const maxAttempts = 50;
        const interval = 5000;

        for (let attempts = 0; attempts < maxAttempts; attempts++) {
            const statusResponse = await fetch(`${random_safe('aHR0cHM6Ly9tb2RlbHNjb3BlLmNuL2FwaS92MS9tdXNlL3ByZWRpY3QvdGFzay9zdGF0dXM/dGFza0lkPQ==')}${taskId}`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'cookie': `m_session_id=${m_session_id}`,
                    'x-modelscope-accept-language': 'zh_CN'
                }
            });

            const statusData = await statusResponse.json();
            if (!statusData.Success || statusData.Code !== 200) {
                throw new Error('状态查询失败: ' + statusData.Message);
            }

            const status = statusData.Data.data.status;
            console.log(`第 ${attempts + 1} 次查询，状态: ${status}`);

            if (status === 'SUCCEED') {
                const imageUrl = statusData.Data.data.predictResult.images[0].imageUrl;
                return imageUrl;
            }

            if (status === 'FAILED') {
                throw new Error('任务失败: ' + statusData.Data.data.errorMsg);
            }

            await new Promise(resolve => setTimeout(resolve, interval));
        }

        throw new Error('任务超时，未在最大轮询次数内完成');
    } catch (error) {
        console.error('错误:', error.message);
        throw new Error('任务处理失败: ' + error.message);
    }
}