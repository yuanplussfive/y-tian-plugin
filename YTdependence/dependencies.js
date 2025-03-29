const _path = process.cwd();
import fetch from "node-fetch";
import path from "path";
import crypto from 'crypto';
import http from "http";
import https from "https";
import YAML from "yaml";
import os from "os";
import querystring from 'querystring';
import fs from "fs";
import moment from "moment";
import cfg from "../../../lib/config/config.js";
import puppeteer from "../../../lib/puppeteer/puppeteer.js";
import common from "../../../lib/common/common.js";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import FormData from 'form-data';
import request from "request";
import WebSocket from 'ws';
import axios from "axios";
import { getEncoding } from 'js-tiktoken';
import textract from 'textract';
import mimeTypes from "mime-types";
import { handleTTS } from "../model/Anime_tts.js";
import { Anime_tts_roles } from "../model/Anime_tts_roles.js";
import { tts_roles } from "../model/Anime_roles.js";
import { other_models } from "../YTOpen-Ai/other-models.js";
import { god_models } from "../YTOpen-Ai/god-models.js";
import { sess_models } from "../YTOpen-Ai/sess-models.js";
import { chat_models } from "../YTOpen-Ai/chat-models.js";
import { isPluginCommand } from "../YTOpen-Ai/ask-ban.js";
import { replyBasedOnStyle } from "../YTOpen-Ai/answer-styles.js";
import { handleSystemCommand } from "../YTOpen-Ai/prompt-system.js";
import { run_conversation } from "../YTOpen-Ai/chat-conversations.js";
import { god_conversation } from "../YTOpen-Ai/god-conversation.js";
import { processArray, countTextInString } from '../YTOpen-Ai/tools/messageGenerator.js';
import { extractAndRender, extractCodeBlocks } from '../YTOpen-Ai/tools/preview.js';
import { NXModelResponse } from "../utils/providers/ChooseModels.js";
import { bilibiliParser } from "../YTOpen-Ai/tools/bilibilivideoanalysis.js";

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