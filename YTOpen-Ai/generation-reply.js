async function generateReply(dirname) {
  return dirname.map((name, index) => {
    const weight = await readFileAndSummarize(`${_path}/data/阴天预设/${name}`);
    return `序号:${index + 1}\n名称:${name.replace(/.txt/g, "")}\n内容简述:${weight}`;
  });
}

async function readFileAndSummarize(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  return content.slice(0, 100);
}
 
export { generateReply }