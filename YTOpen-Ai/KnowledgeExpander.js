import { readFile, appendFile, access } from 'fs/promises';
import crypto from 'crypto';
import OpenAI from 'openai';
import chalk from 'chalk';

class KnowledgeExpander {
  constructor({ apiKey, baseURL, dbPath = './knowledge-db.ndjson', model = 'text-embedding-3-small' }) {
    this.dbPath = dbPath;
    this.model = model;
    this.openai = new OpenAI({
      apiKey,
      baseURL,
    });
  }

  hashText(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
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
      console.log(chalk.yellow(`未找到知识库 ${this.dbPath}，初始化新库。`));
      return [];
    }
    const data = await readFile(this.dbPath, 'utf-8');
    return data.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
  }

  async appendKnowledgeItem(item) {
    const line = JSON.stringify(item) + '\n';
    await appendFile(this.dbPath, line, 'utf-8');
  }

  async expandSingle(text) {
    try {
      const res = await this.openai.embeddings.create({
        model: this.model,
        input: text,
      });
      const embedding = res.data[0].embedding;
      const hash = this.hashText(text);

      await this.appendKnowledgeItem({ text, hash, embedding });
      console.log(chalk.green(`添加成功：${text}`));
      return true;
    } catch (error) {
      console.error(chalk.red('生成Embedding失败：'), error.message);
      return false;
    }
  }

  async expand(knowledgeTexts) {
    if (!Array.isArray(knowledgeTexts)) {
      knowledgeTexts = [knowledgeTexts];
    }

    const db = await this.loadKnowledgeDB();
    const existingHashes = new Set(db.map(item => item.hash));
    const newTexts = knowledgeTexts.filter(text => !existingHashes.has(this.hashText(text)));

    if (newTexts.length === 0) {
      console.log(chalk.green('知识库无新增。'));
      return { added: 0, total: knowledgeTexts.length };
    }

    console.log(chalk.blue(`发现 ${newTexts.length} 条新知识，开始添加到 ${this.dbPath}...`));

    try {
      const res = await this.openai.embeddings.create({
        model: this.model,
        input: newTexts,
      });

      const embeddings = res.data.map(d => d.embedding);

      for (let i = 0; i < newTexts.length; i++) {
        const text = newTexts[i];
        const embedding = embeddings[i];
        const hash = this.hashText(text);

        await this.appendKnowledgeItem({ text, hash, embedding });
        console.log(chalk.green(`添加成功：${text}`));
      }

      return { 
        added: newTexts.length, 
        total: knowledgeTexts.length,
        success: true
      };
    } catch (error) {
      console.error(chalk.red('批量生成Embedding失败：'), error.message);
      console.log(chalk.yellow('降级为逐条添加...'));

      let successCount = 0;

      for (const text of newTexts) {
        const success = await this.expandSingle(text);
        if (success) successCount++;
      }

      return { 
        added: successCount, 
        total: knowledgeTexts.length,
        success: successCount > 0
      };
    }
  }
}

export default KnowledgeExpander;