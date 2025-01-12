import fetch from 'node-fetch';

class SearchClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'https://search.lepton.run/api/query';
    this.timeout = options.timeout || 10000;
    this.retries = options.retries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.concurrency = options.concurrency || 3;
    
    this.defaultHeaders = {
      'accept': '*/*',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'content-type': 'text/plain;charset=UTF-8',
      'priority': 'u=1, i',
      'sec-ch-ua': '"Microsoft Edge";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin'
    };
  }

  generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }

  generateRid() {
    return `r${this.generateRandomString(5)}_${this.generateRandomString(15)}`;
  }

  parseResponse(text) {
    const result = {
      response: '',
      questions: [],
      raw: text,
      list: ''
    };

    try {
      const responseMatch = text.match(/__LLM_RESPONSE__\n\n(.*?)\n\n__RELATED_QUESTIONS__/s);
      if (responseMatch) {
        result.response = responseMatch[1]
          .replace(/\[citation:\d+\]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        result.list = this.parseContexts(text)
      }
      const questionsMatch = text.match(/__RELATED_QUESTIONS__\n\n(.*?)$/s);
      if (questionsMatch) {
        const questionsJson = questionsMatch[1].trim();
        result.questions = JSON.parse(questionsJson);
      }
    } catch (error) {
      console.error('解析响应失败:', error);
      throw new Error('响应解析失败: ' + error.message);
    }

    return result;
  }

  async fetchWithTimeout(query, rid, attempt = 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          ...this.defaultHeaders,
          'Referer': `https://search.lepton.run/search?q=${encodeURIComponent(query)}&rid=${rid}`
        },
        body: JSON.stringify({ query, rid }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      return this.parseResponse(text);

    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('请求超时');
      }

      if (attempt < this.retries) {
        console.warn(`第 ${attempt} 次请求失败，${this.retryDelay}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.fetchWithTimeout(query, rid, attempt + 1);
      }

      throw error;
    }
  }

  async search(query, options = {}) {
    const rid = this.generateRid();
    return this.fetchWithTimeout(query, rid);
  }

  async batchSearch(queries, options = {}) {
    const results = [];
    for (let i = 0; i < queries.length; i += this.concurrency) {
      const batch = queries.slice(i, i + this.concurrency);
      const batchResults = await Promise.all(
        batch.map(query => this.search(query, options)
          .catch(error => ({ error: error.message, query }))
        )
      );
      results.push(...batchResults);
    }
    return results;
  }

  async parseContexts(dirtyString, maxResults = 5) {
    try {
        const jsonString = dirtyString.split('__LLM_RESPONSE__')[0];
        if (!jsonString) {
            return null;
        }

        const data = JSON.parse(jsonString);

        const contexts = data.contexts || [];
        const results = contexts
            .slice(0, maxResults)
            .map(context => ({
                title: context.name,
                url: context.url,
                description: context.snippet
            }));

        return results.map((item, index) =>
            `${index + 1}. ${item.title}\n   链接：${item.url}\n   描述：${item.description}\n`
        ).join('\n');

    } catch (error) {
        console.error('解析失败:', error);
        return '数据解析失败: ' + error.message;
    }
  }  
}

// 创建默认实例
const defaultClient = new SearchClient();

// 导出类和默认实例
export {
  SearchClient,
  defaultClient as default
};
