
let editor;

require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: '',
        language: 'yaml',
        theme: 'vs-dark',
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
    });

    fetchConfig();
});

async function fetchConfig() {
    try {
        const response = await fetch('/v1/config', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('apiKey') || 'sk-123456'}`
            }
        });
        const data = await response.json();
        editor.setValue(data.config || '');
        showMessage('配置已加载');
    } catch (error) {
        showMessage('获取配置失败', true);
    }
}

async function saveConfig() {
    try {
        const config = editor.getValue();
        const response = await fetch('/v1/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('apiKey') || 'sk-123456'}`
            },
            body: JSON.stringify({ config })
        });
        const data = await response.json();
        showMessage(data.message || '保存成功');
    } catch (error) {
        showMessage('保存失败', true);
    }
}

function showMessage(text, isError = false) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${isError ? 'error' : ''}`;
    setTimeout(() => {
        messageEl.textContent = '';
    }, 3000);
}

document.getElementById('saveBtn').addEventListener('click', saveConfig);
document.getElementById('refreshBtn').addEventListener('click', fetchConfig);