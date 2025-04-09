import fs from 'fs';
const _path = process.cwd();

async function fs_reverse() {
    const dirPath = `${_path}/data/YTreverseai`;
    function ensureDirectoryExists(directory) {
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }
    }
    function ensureJsonFileExists(filePath, defaultContent) {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 4));
        }
    }
    ensureDirectoryExists(dirPath);
    ensureDirectoryExists(`${dirPath}/user_cache`);
    ensureJsonFileExists(`${dirPath}/data.json`, {
        chatgpt: {
            Bot_Name: "#nx",
            model: "gpt-4o-mini",
            workshop: false
        }
    });
}

export { fs_reverse }