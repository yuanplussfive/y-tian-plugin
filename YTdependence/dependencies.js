const _path = process.cwd()
import fetch from "node-fetch"
import path from "path"
import crypto from 'crypto'
import http from "http"
import https from "https"
import YAML from "yaml"
import os from "os"
import querystring from 'querystring'
import fs from "fs"
import moment from "moment"
import cfg from "../../../lib/config/config.js"
import puppeteer from "../../../lib/puppeteer/puppeteer.js"
import common from "../../../lib/common/common.js"
import { createRequire } from 'module'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
const formDataPath = join(__dirname, '../node_modules/form-data');
const FormData = require(formDataPath);
const requestPath = join(__dirname, '../node_modules/request');
const request = require(requestPath);
const WebSocketPath = join(__dirname, '../node_modules/ws');
const WebSocket = require(WebSocketPath);
import axios from "../node_modules/axios/index.js";
import { getEncoding } from 'js-tiktoken';
const textractPath = join(__dirname, '../node_modules/textract');
const textract = require(textractPath);
const mimeTypesPath = join(__dirname, '../node_modules/mime-types');
const mimeTypes = require(mimeTypesPath);
import { handleTTS } from "../model/Anime_tts.js"
import { Anime_tts_roles } from "../model/Anime_tts_roles.js"
import { tts_roles } from "../model/Anime_roles.js"
import { other_models } from "../YTOpen-Ai/other-models.js"
import { god_models } from "../YTOpen-Ai/god-models.js"
import { sess_models } from "../YTOpen-Ai/sess-models.js"
import { chat_models } from "../YTOpen-Ai/chat-models.js"
import { isPluginCommand } from "../YTOpen-Ai/ask-ban.js"
import { replyBasedOnStyle } from "../YTOpen-Ai/answer-styles.js"
import { handleSystemCommand } from "../YTOpen-Ai/prompt-system.js"
import { run_conversation } from "../YTOpen-Ai/chat-conversations.js"
import { god_conversation } from "../YTOpen-Ai/god-conversation.js"
import { FreeChat35_1 } from '../utils/FreeChat35/chat35_1.js';
import { FreeChat35_2 } from '../utils/FreeChat35/chat35_2.js';
import { FreeChat35_3 } from '../utils/FreeChat35/chat35_3.js';
import { FreeChat35_4 } from '../utils/FreeChat35/chat35_4.js';
import { FreeChat35_5 } from '../utils/FreeChat35/chat35_5.js';
import { FreeGemini_1 } from '../utils/FreeGemini/Gemini_1.js';
import { FreeGemini_2 } from '../utils/FreeGemini/Gemini_2.js';
import { FreeGemini_3 } from '../utils/FreeGemini/Gemini_3.js';
import { FreeClaude_1 } from '../utils/FreeClaude/Claude_1.js';
import { processArray, countTextInString } from '../YTOpen-Ai/tools/messageGenerator.js';
import { extractAndRender, extractCodeBlocks } from '../YTOpen-Ai/tools/preview.js';
import { NXModelResponse } from "../utils/providers/ChooseModels.js"
import { bilibiliParser } from "../YTOpen-Ai/tools/bilibilivideoanalysis.js"

export const dependencies = {
  fs,
  os,
  cfg,
  http,
  path,
  fetch,
  https,
  axios,
  _path,
  YAML,
  crypto,
  require,
  request,
  moment,
  common,
  getEncoding,
  tts_roles,
  FormData,
  puppeteer,
  WebSocket,
  mimeTypes,
  querystring,
  textract,
  processArray,
  countTextInString,
  FreeChat35_1,
  FreeChat35_2,
  FreeChat35_3,
  FreeChat35_4,
  FreeChat35_5,
  FreeGemini_1,
  FreeGemini_2,
  FreeGemini_3,
  FreeClaude_1,
  Anime_tts_roles,
  run_conversation,
  god_conversation,
  isPluginCommand,
  replyBasedOnStyle,
  handleTTS,
  handleSystemCommand,
  extractAndRender,
  extractCodeBlocks,
  GodModels: god_models,
  SessModels: sess_models,
  ChatModels: chat_models,
  OtherModels: other_models,
  NXModelResponse,
  bilibiliParser
}