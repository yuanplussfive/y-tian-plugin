import { AbstractTool } from './AbstractTool.js';
import path from 'path';
import YAML from 'yaml';
import fs from 'fs';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, '../../config/message.yaml');
console.log(configPath);

let config = {};
if (fs.existsSync(configPath)) {
  const file = fs.readFileSync(configPath, 'utf8');
  const configs = YAML.parse(file);
  config = configs.pluginSettings;
}
const githubToken = config?.githubToken || '';

/**
 * GitHub仓库工具类，用于获取GitHub仓库详情
 */
export class GitHubRepoTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'githubRepoTool';
    this.description = '获取GitHub仓库的详细信息，包括基本信息、最近提交、贡献者等';
    this.parameters = {
      type: "object",
      properties: {
        repoUrl: {
          type: 'string',
          description: 'GitHub仓库的URL，例如：https://github.com/username/repo'
        }
      },
      required: ['repoUrl']
    };
    
    // 设置GitHub API请求的基本headers
    this.headers = {
      'User-Agent': 'GitHub-Repository-Tool',
      'Accept': 'application/vnd.github.v3+json'
    };
    
    // 如果有token，添加授权头
    if (githubToken) {
      this.headers['Authorization'] = `token ${githubToken}`;
    }
  }

  /**
   * 发送HTTP请求到GitHub API
   * @param {string} path - API路径
   * @returns {Promise<Object>} 解析后的JSON响应
   */
  fetchGitHubAPI(path) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: path,
        method: 'GET',
        headers: this.headers
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            
            if (res.statusCode >= 400) {
              reject(new Error(`API错误 (${res.statusCode}): ${jsonData.message || '未知错误'}`));
            } else {
              resolve(jsonData);
            }
          } catch (err) {
            reject(new Error(`解析响应失败: ${err.message}`));
          }
        });
      });
      
      req.on('error', (err) => {
        reject(new Error(`请求失败: ${err.message}`));
      });
      
      req.end();
    });
  }

  /**
   * 解析GitHub URL获取owner和repo
   * @param {string} url - GitHub仓库URL
   * @returns {Object} 包含owner和repo的对象
   * @throws {Error} 如果URL无效或解析失败
   */
  parseGitHubUrl(url) {
    try {
      const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
      const match = url.match(regex);
      if (!match) throw new Error('无效的GitHub仓库URL');
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
    } catch (error) {
      throw new Error(`URL解析失败: ${error.message}`);
    }
  }

  /**
   * 处理GitHub仓库信息获取操作并返回结构化结果
   * @param {Object} opts - 参数选项
   * @param {Object} e - 事件对象
   * @returns {Promise<Object>} 结构化的仓库信息或错误对象
   */
  async func(opts, e) {
    const { repoUrl } = opts;

    if (!repoUrl?.trim()) {
      return {
        status: 'error',
        code: 400,
        message: 'GitHub仓库URL不能为空'
      };
    }

    try {
      const { owner, repo } = this.parseGitHubUrl(repoUrl);

      // 获取仓库基本信息
      const repoData = await this.fetchGitHubAPI(`/repos/${owner}/${repo}`);

      // 获取最近5条提交
      const commitsData = await this.fetchGitHubAPI(`/repos/${owner}/${repo}/commits?per_page=5`);

      // 获取开放的issues
      const issuesData = await this.fetchGitHubAPI(`/repos/${owner}/${repo}/issues?state=open&per_page=100`);

      // 获取开放的pull requests
      const pullsData = await this.fetchGitHubAPI(`/repos/${owner}/${repo}/pulls?state=open&per_page=100`);

      // 获取分支信息
      const branchesData = await this.fetchGitHubAPI(`/repos/${owner}/${repo}/branches?per_page=100`);

      // 获取贡献者信息
      const contributorsData = await this.fetchGitHubAPI(`/repos/${owner}/${repo}/contributors?per_page=5`);

      // 格式化提交信息
      const commits = commitsData.map((commit, index) => ({
        [`提交${index + 1}`]: {
          消息: commit.commit.message,
          作者: commit.commit.author.name,
          日期: new Date(commit.commit.author.date).toLocaleString('zh-CN'),
          SHA: commit.sha.substring(0, 7),
        }
      }));

      // 格式化贡献者信息
      const contributors = contributorsData.map(contributor => ({
        用户名: contributor.login,
        贡献数: contributor.contributions,
        头像: contributor.avatar_url,
        主页: contributor.html_url,
      }));

      // 构建返回结果
      const result = {
        status: 'success',
        data: {
          基本信息: {
            仓库名称: repoData.name,
            描述: repoData.description || '无描述',
            创建时间: new Date(repoData.created_at).toLocaleString('zh-CN'),
            最后更新: new Date(repoData.updated_at).toLocaleString('zh-CN'),
            默认分支: repoData.default_branch,
            Star数量: repoData.stargazers_count,
            Fork数量: repoData.forks_count,
            Watch数量: repoData.subscribers_count,
            开放Issues: issuesData.length,
            开放PullRequests: pullsData.length,
            分支数量: branchesData.length,
            语言: repoData.language,
            URL: repoData.html_url,
            是否归档: repoData.archived,
            许可证: repoData.license ? repoData.license.name : '未指定',
          },
          最近提交: commits,
          主要贡献者: contributors,
        }
      };

      return result;
    } catch (error) {
      return {
        status: 'error',
        code: 500,
        message: `获取GitHub仓库信息失败: ${error.message}`
      };
    }
  }
}