import fs from 'fs';
import path from 'path';

/**
 * 从 Redis 加载数据，如果失败则从本地文件读取
 * @param {string} redisKey - Redis 的键
 * @param {string} filePath - 本地文件路径
 * @returns {Promise<Array>} 加载的数据
 */
export async function loadData(redisKey, filePath) {
  try {
    const data = await redis.get(redisKey);
    if (data) {
      console.log(`从 Redis 加载数据成功: ${redisKey}`);
      return JSON.parse(data);
    } else {
      console.log(`Redis 中没有数据，尝试从本地文件加载: ${filePath}`);
      if (fs.existsSync(filePath)) {
        const fileData = await fs.promises.readFile(filePath, 'utf-8');
        const parsedData = JSON.parse(fileData);
        try {
          // 将本地数据缓存到 Redis
          await redis.set(redisKey, JSON.stringify(parsedData));
          console.log(`将本地数据缓存到 Redis 成功: ${redisKey}`);
        } catch (err) {
          console.error(`将本地数据缓存到 Redis 失败: ${err}`);
        }
        return parsedData;
      } else {
        console.log(`本地文件不存在: ${filePath}`);
        return [];
      }
    }
  } catch (err) {
    console.error(`从 Redis 加载数据失败: ${err}，尝试从本地文件加载`);
    try {
      if (fs.existsSync(filePath)) {
        const fileData = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(fileData);
      } else {
        console.log(`本地文件不存在: ${filePath}`);
        return [];
      }
    } catch (fileErr) {
      console.error(`从本地文件加载数据失败: ${fileErr}`);
      return [];
    }
  }
}

/**
 * 将数据保存到 Redis，如果失败则保存到本地文件
 * @param {string} redisKey - Redis 的键
 * @param {string} filePath - 本地文件路径
 * @param {Array} data - 要保存的数据
 */
export async function saveData(redisKey, filePath, data) {
  try {
    await redis.set(redisKey, JSON.stringify(data));
    console.log(`数据已保存到 Redis: ${redisKey}`);
  } catch (err) {
    console.error(`保存数据到 Redis 失败: ${err}，尝试保存到本地文件`);
    try {
      // 确保目录存在
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        await fs.promises.mkdir(dirPath, { recursive: true });
      }
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`数据已保存到本地文件: ${filePath}`);
    } catch (fileErr) {
      console.error(`保存数据到本地文件失败: ${fileErr}`);
    }
  }
}