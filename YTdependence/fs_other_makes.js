import { dependencies } from "./dependencies.js";
const { fs, _path } = dependencies

async function fs_other(fs, _path){
const dirPath = `${_path}/data/YTotherai`;
let dirpath = `${_path}/data/YTotherai`;
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
        stoken: "",
        model: "gpt-3.5-turbo-16k",
        search: false,
        ifopen: true
    }
});
ensureJsonFileExists(`${dirPath}/limit.json`, {
    limit: {
        permission: false,
        atres: false,
        Bot_Name: "/chat"
    }
});

ensureJsonFileExists(`${dirPath}/proxy.json`, {
   chatgpt: {
       proxy: false
    }
});

ensureJsonFileExists(`${dirPath}/workshop.json`, {
    workshop: {
        limit: false
    }
});
ensureJsonFileExists(`${dirPath}/gpts.json`, {
    gpts: {
        id: ["gpt-4-gizmo-g-vfIEc66fv", "gpt-4-gizmo-g-snw330qdg", "gpt-4-gizmo-g-alKfVrz9K"]
    }
});
}

export { fs_other }