async function isPluginCommand(msg, Bot_Name) {
  if ((msg.startsWith('/') && !msg.startsWith(Bot_Name)) || (msg.startsWith('#') && !msg.startsWith(Bot_Name))) {
    console.log('检测到其他插件指令');
    return false;
  }
}

export { isPluginCommand }
