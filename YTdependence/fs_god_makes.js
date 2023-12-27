import { dependencies } from "./dependencies.js";
const { fs, _path } = dependencies

async function fs_god(fs, _path){
let dirpath = _path + '/data/YTgptgod'
if(!fs.existsSync(dirpath)){
fs.mkdirSync(dirpath)    
}
if(!fs.existsSync(dirpath+"/user_cache")){
fs.mkdirSync(dirpath+"/user_cache")    
}
if(!fs.existsSync(dirpath+"/user_limit")){
fs.mkdirSync(dirpath+"/user_limit")    
}
if (!fs.existsSync(dirpath + "/" + "data.json")){
fs.writeFileSync(dirpath+ "/" + "data.json",JSON.stringify({
"chatgpt":{
"stoken":"",
"search": false
}}))
}
if (!fs.existsSync(dirpath + "/" + "name.json")){
fs.writeFileSync(dirpath+ "/" + "name.json",JSON.stringify({
"godgpt":{
"Bot_Name": "/godgpt"
}}))
}
if (!fs.existsSync(dirpath + "/" + "set.json")){
fs.writeFileSync(dirpath+ "/" + "set.json",JSON.stringify({
"godgpt":{
"open": false,
"role": "派蒙",
"image": false
}}))
}
if (!fs.existsSync(dirpath + "/" + "setting.json")){
fs.writeFileSync(dirpath+ "/" + "setting.json",JSON.stringify({
"godgpt":{
"style": "words",
"image": "ocr"
}}))
}
if (!fs.existsSync(dirpath + "/" + "proxy.json")){
fs.writeFileSync(dirpath+ "/" + "proxy.json",JSON.stringify({
"godgpt":{
"proxy": false,
"channel": "god",
"key": ""
}}))
}
if (!fs.existsSync(dirpath + "/" + "limit.json")){
fs.writeFileSync(dirpath+ "/" + "limit.json",JSON.stringify({
"limit":{
"permission": false,
"atres": false
}}))
}
if (!fs.existsSync(dirpath + "/" + "model.json")){
fs.writeFileSync(dirpath+ "/" + "model.json",JSON.stringify({
"godgpt":{
"model": "gpt-3.5-turbo-16k"
    }}))
  }
if (!fs.existsSync(dirpath + "/" + "workshop.json")){
fs.writeFileSync(dirpath+ "/" + "workshop.json",JSON.stringify({
  workshop: {
        limit: false
    }}))
  }
}

export { fs_god }





























