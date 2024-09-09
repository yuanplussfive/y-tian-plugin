import express, { Express, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import path from 'path';
import cors from 'cors';
import fetch from 'node-fetch';
import * as functions from './module';

const app: Express = express();
const port = 4200;

app.use(cors());
app.use(function (req: Request, res: Response, next: NextFunction) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public', {
  setHeaders: function (res: Response, path: string, stat: any) {
    if (path.endsWith(".js")) {
      res.set('Content-Type', 'application/javascript');
    }
  }
}));

app.get('/chat', function (req: Request, res: Response) {
  res.sendFile(path.join(__dirname + '/public/html/chat.html'));
});

interface Route {
  path: string;
  handler: (...args: any[]) => Promise<void>;
  dependencies: any[];
}

const routes: Route[] = [
  { path: '/api/v1/freechat35/completions', handler: functions.handleChat35Completions, dependencies: [functions.FreeChat35_1.FreeChat35_1, functions.FreeChat35_2.FreeChat35_2, functions.FreeChat35_3.FreeChat35_3, functions.FreeChat35_4.FreeChat35_4, functions.FreeChat35_5.FreeChat35_5, functions.FreeChat35_6.FreeChat35_6] },
  { path: '/api/v1/freegemini/completions', handler: functions.handleGeminiCompletions, dependencies: [functions.FreeGemini_1.FreeGemini_1, functions.FreeGemini_2.FreeGemini_2, functions.FreeGemini_3.FreeGemini_3] },
  { path: '/api/v1/freeclaude/completions', handler: functions.handleClaudeCompletions, dependencies: [functions.FreeClaude_1.FreeClaude_1] },
  { path: '/api/v1/freesearch/completions', handler: functions.handleSearchCompletions, dependencies: [functions.FreeSearch_1.FreeSearch_1] },
  { path: '/api/v1/freekimi/completions', handler: functions.handleMoonshotCompletions, dependencies: [functions.FreeKimi_1.FreeKimi_1] },
  { path: '/api/v1/glm4v/completions', handler: functions.handleGLM4VCompletions, dependencies: [functions.chatglm4v.chatglm4v] },
  { path: '/api/v1/glm4/completions', handler: functions.handleGLM4Completions, dependencies: [functions.chatglm4.chatglm4] },
  { path: '/api/v1/freestablediffusion/completions', handler: functions.handleSDCompletions, dependencies: [functions.FreeStableDiffusion_1.FreeStableDiffusion_1] },
  { path: '/api/v1/freedalle/completions', handler: functions.handleDalleCompletions, dependencies: [functions.FreeDalle_1.FreeDalle_1] },
  { path: '/api/v1/freechat40/completions', handler: functions.handleChat40Completions, dependencies: [functions.FreeChat40_1.FreeChat40_1, functions.FreeChat40_2.FreeChat40_2, functions.FreeChat40_3.FreeChat40_3, functions.FreeChat40_4.FreeChat40_4, functions.FreeChat40_5.FreeChat40_5] },
  { path: '/api/v1/tts', handler: functions.handleTTSCompletions, dependencies: [functions.getAudioFromTPS_1.getAudioFromTPS_1] }
];

routes.forEach(route => {
  app.post(route.path, async (req: Request, res: Response) => {
    const args = [req, res, ...route.dependencies, fetch, crypto];
    await route.handler(...args);
  });
});

app.listen(port, () => {
  console.log(`成功启动服务，端口号： ${port}`);
});