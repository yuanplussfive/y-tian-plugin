import { dependencies } from "../YTdependence/dependencies.js";
const { _path } = dependencies;
import { spawn } from 'child_process';

export class example extends plugin {
    constructor() {
        super({
            name: '阴天[WebSite]',
            dsc: '',
            event: 'message',
            priority: -1000,
            rule: [
                {
                    reg: "^#阴天启动",
                    fnc: 'WebSiteStart'
                }
            ]
        });
    }

    async WebSiteStart(e) {
        if (e.group_id || !e.isMaster) {
            return false;
        }
        const directoryPath = `${_path}/plugins/y-tian-plugin`;

        try {
            const successMessage = await executeCommand('npm run serve', directoryPath);
            if (successMessage) {
                e.reply(successMessage);
            } else {
                console.log('失败.');
            }
        } catch (err) {
            console.error('error:', err);
        }
    }
}

function executeCommand(command, dir) {
    return new Promise((resolve, reject) => {
        const cmd = spawn(command, { shell: true, cwd: dir });

        let output = '';
        let errorOutput = '';

        cmd.stdout.on('data', (data) => {
            const message = data.toString();
            output += message;
            console.log(`stdout: ${message}`);
            clearTimeout(timer);
            resetTimeout();
        });

        cmd.stderr.on('data', (data) => {
            const message = data.toString();
            errorOutput += message;
            console.error(`stderr: ${message}`);
        });

        let timer;
        const resetTimeout = () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                console.log('超时.');
                handleCompletion();
            }, 9000);
        };

        cmd.on('close', (code) => {
            if (code !== 0) {
                reject(`exited with code ${code}. Errors:\n${errorOutput}`);
            } else {
                handleCompletion();
            }
        });

        cmd.on('error', (err) => {
            reject(`Error: ${err.message}`);
        });

        const handleCompletion = () => {
            clearTimeout(timer);
            const localMatch = output.match(/Local:\s+(http[^\s]+)/);
            const networkMatch = output.match(/Network:\s+(http[^\s]+)/);
            const localAddress = localMatch ? localMatch[1] : 'N/A';
            const networkAddress = networkMatch ? networkMatch[1] : 'N/A';
            resolve(`成功启动服务！\n本地地址: ${localAddress}\n网络地址: ${networkAddress}`);
        };
    });
}