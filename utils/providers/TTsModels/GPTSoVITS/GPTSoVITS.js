import FormData from 'form-data';
import fetch from 'node-fetch';
import { randomUUID } from 'crypto';
import fs from 'fs';
import { EventEmitter } from 'events';

/**
 * GPT-SoVITS 语音合成类
 * 用于将文本转换为语音，支持中文输入
 */
class GPTSoVITSSynthesizer {
  constructor(baseUrl = 'https://yuoop-gpt-sovits-v2.hf.space') {
    this.baseUrl = baseUrl; // 使用用户提供的 baseUrl 或默认值
    this.sessionHash = this._generateSessionHash();
    this.heartbeatInterval = null;
  }

  /**
   * 生成随机会话哈希
   * @returns {string} 会话哈希字符串
   * @private
   */
  _generateSessionHash() {
    return randomUUID().replace(/-/g, '').slice(0, 11);
  }

  /**
   * 生成随机上传ID
   * @returns {string} 上传ID字符串
   * @private
   */
  _generateUploadId() {
    return randomUUID().replace(/-/g, '').slice(0, 11);
  }

  /**
   * 启动心跳检测
   * 每20分钟ping一次服务器以保持连接
   * @private
   */
  _startHeartbeat() {
    console.log('💓 启动心跳检测，每20分钟ping一次服务器');
    
    // 清除可能存在的旧心跳定时器
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // 设置新的心跳定时器
    this.heartbeatInterval = setInterval(async () => {
      try {
        console.log('💓 发送心跳请求...');
        const response = await fetch(`${this.baseUrl}/api/heartbeat`, {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'cache-control': 'no-cache',
          },
          timeout: 10000, // 10秒超时
        }).catch(() => {
          // 如果api/heartbeat端点不存在，尝试访问根路径
          return fetch(this.baseUrl, {
            method: 'GET',
            headers: {
              'accept': '*/*',
              'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
              'cache-control': 'no-cache',
            },
            timeout: 10000,
          });
        });
        
        if (response.ok) {
          console.log('💓 心跳检测成功，服务器响应正常');
        } else {
          console.warn(`⚠️ 心跳检测异常，状态码: ${response.status}`);
        }
      } catch (error) {
        console.error('❌ 心跳检测失败:', error.message);
      }
    }, 20 * 60 * 1000); // 20分钟 = 1200000毫秒
  }

  /**
   * 停止心跳检测
   * @private
   */
  _stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      console.log('💓 心跳检测已停止');
    }
  }

  /**
   * 上传音频文件
   * @param {string} audioFilePath 音频文件路径
   * @returns {Promise<string>} 上传后的文件路径
   * @private
   */
  async _uploadAudioFile(audioFilePath) {
    try {
      const uploadId = this._generateUploadId();
      const uploadUrl = `${this.baseUrl}/upload?upload_id=${uploadId}`;
      
      console.log('📤 正在上传音频文件...');
      
      const form = new FormData();
      form.append('files', fs.createReadStream(audioFilePath), {
        filename: 'audio.wav',
        contentType: 'audio/wav',
      });

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: form,
        headers: {
          accept: '*/*',
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`上传失败，状态码: ${uploadResponse.status}`);
      }

      const uploadResult = await uploadResponse.json();
      const uploadedFilePath = uploadResult[0];
      console.log('✅ 音频文件上传成功，路径:', uploadedFilePath);
      
      return uploadedFilePath;
    } catch (error) {
      console.error('❌ 音频文件上传失败:', error.message);
      throw error;
    }
  }

  /**
   * 提交合成请求到队列
   * @param {string} uploadedFilePath 已上传的文件路径
   * @param {string} text 要合成的文本
   * @param {number} fileSize 文件大小
   * @returns {Promise<string>} 队列事件ID
   * @private
   */
  async _submitToQueue(uploadedFilePath, text, fileSize) {
    try {
      console.log('🔄 正在提交合成请求到队列...');
      
      const queueUrl = `${this.baseUrl}/queue/join`;
      const queuePayload = {
        data: [
          {
            meta: { _type: 'gradio.FileData' },
            path: uploadedFilePath,
            url: `${this.baseUrl}/file=${uploadedFilePath}`,
            orig_name: 'audio.wav',
            size: fileSize,
            mime_type: 'audio/wav',
          },
          '',
          'Chinese', // 源语言
          text,      // 要合成的文本
          'Chinese', // 目标语言
          'Slice once every 4 sentences', // 切片策略
          15,        // 语速
          1,         // 音高
          1,         // 能量
          false,     // 是否启用参考音频增强
          1,         // 参考音频增强强度
          false,     // 是否启用情感控制
          null,      // 情感控制参数
        ],
        event_data: null,
        fn_index: 0,
        trigger_id: 34,
        session_hash: this.sessionHash,
      };

      const queueResponse = await fetch(queueUrl, {
        method: 'POST',
        body: JSON.stringify(queuePayload),
        headers: {
          accept: '*/*',
          'content-type': 'application/json',
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
        },
      });

      if (!queueResponse.ok) {
        throw new Error(`队列提交失败，状态码: ${queueResponse.status}`);
      }

      const queueResult = await queueResponse.json();
      const eventId = queueResult.event_id;
      console.log('✅ 合成请求已提交，事件ID:', eventId);
      
      return eventId;
    } catch (error) {
      console.error('❌ 合成请求提交失败:', error.message);
      throw error;
    }
  }

  /**
   * 监听合成进度
   * @returns {Promise<string|null>} 合成完成后的音频URL，失败则返回null
   * @private
   */
  async _monitorProgress() {
    try {
      console.log('⏳ 正在监听合成进度...');
      
      const progressUrl = `${this.baseUrl}/queue/data?session_hash=${this.sessionHash}`;
      let finalAudioUrl = null;

      await new Promise((resolve, reject) => {
        const emitter = new EventEmitter();
        let responseBody = '';
        let timeout = setTimeout(() => {
          emitter.emit('error', new Error('合成超时，请检查网络连接'));
        }, 180000);

        fetch(progressUrl, {
          method: 'GET',
          headers: {
            accept: 'text/event-stream',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'cache-control': 'no-cache',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
          },
        })
          .then((response) => {
            response.body.on('data', (chunk) => {
              responseBody += chunk.toString();
              // 处理SSE事件
              const lines = responseBody.split('\n');
              responseBody = lines.pop(); // 保留不完整的行用于下一个数据块

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    
                    if (data.msg === 'estimation') {
                      console.log(`🕒 预计等待时间: ${data.rank_eta || '未知'} 秒`);
                    } else if (data.msg === 'process_starts') {
                      console.log('🚀 开始处理合成请求...');
                    } else if (data.msg === 'process_generating') {
                      console.log('🔊 正在生成音频...');
                    } else if (data.msg === 'process_completed' && data.output?.data?.[0]?.url) {
                      finalAudioUrl = data.output.data[0].url;
                      console.log('✅ 音频合成完成!');
                      clearTimeout(timeout);
                      emitter.emit('complete');
                    } else if (data.msg === 'close_stream') {
                      clearTimeout(timeout);
                      emitter.emit('complete');
                    }
                  } catch (e) {
                    console.error('❌ 解析SSE数据错误:', e.message);
                  }
                }
              }
            });

            response.body.on('end', () => {
              clearTimeout(timeout);
              emitter.emit('complete');
            });

            response.body.on('error', (err) => {
              clearTimeout(timeout);
              emitter.emit('error', err);
            });
          })
          .catch((err) => {
            clearTimeout(timeout);
            emitter.emit('error', err);
          });

        emitter.on('complete', () => {
          resolve();
        });

        emitter.on('error', (err) => {
          reject(err);
        });
      });

      return finalAudioUrl;
    } catch (error) {
      console.error('❌ 监听合成进度失败:', error.message);
      return null;
    }
  }

  /**
   * 执行文本到语音的合成
   * @param {string} audioFilePath 参考音频文件路径
   * @param {string} text 要合成的文本
   * @returns {Promise<string|null>} 合成完成后的音频URL，失败则返回null
   */
  async synthesize(audioFilePath, text = "你好，你是谁") {
    try {
      console.log('🎯 开始语音合成流程');
      console.log(`📝 合成文本: "${text}"`);
      console.log(`🎵 参考音频: ${audioFilePath}`);

      // 启动心跳检测
      this._startHeartbeat();

      // 检查文件是否存在
      if (!fs.existsSync(audioFilePath)) {
        console.error(`❌ 参考音频文件不存在: ${audioFilePath}`);
        this._stopHeartbeat();
        return null;
      }

      // 获取文件大小
      const fileSize = fs.statSync(audioFilePath).size;
      
      // 上传音频文件
      const uploadedFilePath = await this._uploadAudioFile(audioFilePath);
      
      // 提交合成请求到队列
      await this._submitToQueue(uploadedFilePath, text, fileSize);
      
      // 监听合成进度
      const finalAudioUrl = await this._monitorProgress();
      
      if (finalAudioUrl) {
        console.log('🎉 语音合成成功! 音频URL:', finalAudioUrl);
        return finalAudioUrl;
      } else {
        console.error('❌ 未能获取合成后的音频URL');
        return null;
      }
    } catch (error) {
      console.error('❌ 语音合成失败:', error.message);
      return null;
    } finally {
      // 合成完成后不停止心跳检测，保持长连接
      // 如果需要停止心跳，可以手动调用 stopHeartbeat() 方法
    }
  }

  /**
   * 停止心跳检测（公开方法，可在不需要保持连接时调用）
   */
  stopHeartbeat() {
    this._stopHeartbeat();
  }

  /**
   * 手动发送一次心跳请求
   * @returns {Promise<boolean>} 心跳是否成功
   */
  async sendHeartbeat() {
    try {
      console.log('💓 手动发送心跳请求...');
      const response = await fetch(`${this.baseUrl}/api/heartbeat`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'cache-control': 'no-cache',
        },
        timeout: 10000,
      }).catch(() => {
        // 如果api/heartbeat端点不存在，尝试访问根路径
        return fetch(this.baseUrl, {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'cache-control': 'no-cache',
          },
          timeout: 10000,
        });
      });
      
      if (response.ok) {
        console.log('💓 心跳检测成功，服务器响应正常');
        return true;
      } else {
        console.warn(`⚠️ 心跳检测异常，状态码: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error('❌ 心跳检测失败:', error.message);
      return false;
    }
  }
}

export async function GPTSoVITS(text, customBaseUrl, videoUrl) {
  try {
    // 使用用户提供的 customBaseUrl 或默认值
    const synthesizer = new GPTSoVITSSynthesizer(customBaseUrl);
    
    // 发送一次手动心跳检测，确认服务器可用
    await synthesizer.sendHeartbeat();
    
    const audioUrl = await synthesizer.synthesize(videoUrl, text);
    
    if (audioUrl) {
      console.log('✨ 成功获取合成音频链接:', audioUrl);
      return audioUrl;
    } else {
      console.log('❗ 语音合成失败，未获取到音频链接');
      return null;
    }
  } catch (err) {
    console.error('❌ 程序执行错误:', err.message);
    return null;
  }
}