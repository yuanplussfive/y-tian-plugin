import { readFile, access } from 'fs/promises';
import OpenAI from 'openai';
import chalk from 'chalk';

class KnowledgeSearcher {
  constructor({ apiKey, baseURL, dbPath = './knowledge-db.ndjson', model = 'text-embedding-3-small', topN = 4, threshold = 0.6 }) {
    this.dbPath = dbPath;
    this.topN = topN;
    this.threshold = threshold;
    this.model = model;
    this.openai = new OpenAI({
      apiKey,
      baseURL,
    });
  }

  async fileExists(filepath) {
    try {
      await access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  async loadKnowledgeDB() {
    if (!(await this.fileExists(this.dbPath))) {
      console.log(chalk.yellow(`知识库文件 ${this.dbPath} 不存在，返回空库。`));
      return [];
    }
    const data = await readFile(this.dbPath, 'utf-8');
    return data.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
  }

  cosineSimilarity(vecA, vecB) {
    const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return (normA && normB) ? (dot / (normA * normB)) : 0;
  }

  buildKnowledgeContext(matches) {
    return matches.map((item, index) =>
      `【知识${index + 1}】(${(item.score * 100).toFixed(2)}%)：${item.text}`
    ).join('\n');
  }

  buildCOTChain(userQuestion, knowledgeContext) {
    return {
      knowledgeContext,
      userQuestion
    }
  }

  async search(userQuestion) {
    const db = await this.loadKnowledgeDB();
    if (db.length === 0) {
      console.log(chalk.red(`知识库 ${this.dbPath} 为空，无法检索。`));
      return null;
    }

    const res = await this.openai.embeddings.create({
      model: this.model,
      input: userQuestion,
    });

    const questionEmbedding = res.data[0].embedding;

    const matches = db.map(item => ({
      text: item.text,
      score: this.cosineSimilarity(questionEmbedding, item.embedding),
    })).filter(item => item.score >= this.threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, this.topN);

    if (matches.length === 0) {
      console.log(chalk.yellow('没有找到满足阈值的知识。'));
      return null;
    }

    const knowledgeContext = this.buildKnowledgeContext(matches);
    return this.buildCOTChain(userQuestion, knowledgeContext);
  }

  async batchSearch(userQuestions = []) {
    const db = await this.loadKnowledgeDB();
    if (db.length === 0) {
      console.log(chalk.red(`知识库 ${this.dbPath} 为空，无法批量检索。`));
      return userQuestions.map(() => null);
    }

    const res = await this.openai.embeddings.create({
      model: this.model,
      input: userQuestions,
    });

    const questionEmbeddings = res.data.map(d => d.embedding);

    const results = [];

    for (let i = 0; i < userQuestions.length; i++) {
      const questionEmbedding = questionEmbeddings[i];

      const matches = db.map(item => ({
        text: item.text,
        score: this.cosineSimilarity(questionEmbedding, item.embedding),
      })).filter(item => item.score >= this.threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, this.topN);

      if (matches.length === 0) {
        results.push(null);
      } else {
        const knowledgeContext = this.buildKnowledgeContext(matches);
        results.push(this.buildCOTChain(userQuestions[i], knowledgeContext));
      }
    }

    return results;
  }
}

export default KnowledgeSearcher;