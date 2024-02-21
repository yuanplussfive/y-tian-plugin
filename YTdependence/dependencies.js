const _path = process.cwd()
import fetch from "node-fetch"
import path from "path"
import crypto from 'crypto'
import https from "https"
import YAML from "yaml"
import os from "os"
import querystring from 'querystring'
import fs from "fs"
import moment from "moment"
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
import cfg from "../../../lib/config/config.js"
import puppeteer from "../../../lib/puppeteer/puppeteer.js"
import common from "../../../lib/common/common.js"
import request from "../node_modules/request/index.js"
import WebSocket from "../node_modules/ws/index.js"
import FormData from "../node_modules/form-data/lib/form_data.js"
import cheerio from '../node_modules/cheerio/lib/index.js'
import axios from "../node_modules/axios/index.js"
import { Anime_tts } from "../model/Anime_tts.js"
import { Anime_tts_roles } from "../model/Anime_tts_roles.js"
import { other_models } from "../YTOpen-Ai/other-models.js"
import { god_models } from "../YTOpen-Ai/god-models.js"
import { sess_models } from "../YTOpen-Ai/sess-models.js"
import { chat_models } from "../YTOpen-Ai/chat-models.js"
import { isPluginCommand } from "../YTOpen-Ai/ask-ban.js"
import { replyBasedOnStyle } from "../YTOpen-Ai/answer-styles.js"
import { handleSystemCommand } from "../YTOpen-Ai/prompt-system.js"
import { run_conversation } from "../YTOpen-Ai/chat-conversations.js"
import { god_conversation } from "../YTOpen-Ai/god-conversation.js"

export const dependencies = {
  _path: _path,
  fetch: fetch,
  path: path,
  YAML: YAML,
  cheerio: cheerio,
  FormData: FormData,
  crypto: crypto,
  common: common,
  moment: moment,
  require,
  fs: fs,
  os: os,
  WebSocket: WebSocket,
  https: https,
  cfg: cfg,
  axios: axios,
  puppeteer: puppeteer,
  request: request,
  querystring: querystring,
  AnimeTTS: Anime_tts,
  Anime_tts_roles,
  OtherModels: other_models,
  GodModels: god_models,
  SessModels: sess_models,
  ChatModels: chat_models,
  run_conversation: run_conversation,
  god_conversation: god_conversation,
  isPluginCommand,
  replyBasedOnStyle,
  handleSystemCommand
}