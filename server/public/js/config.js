document.addEventListener('DOMContentLoaded', async () => {
    const themeSelector = document.getElementById('theme-selector');
    const showYamlEditorBtn = document.getElementById('show-yaml-editor');
    const showGraphicEditorBtn = document.getElementById('show-graphic-editor');
    const yamlEditorContainer = document.getElementById('yaml-editor-container');
    const graphicEditorContainer = document.getElementById('graphic-editor-container');
    const saveBtn = document.getElementById('saveBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const messageSpan = document.getElementById('message');

    let editor;
    let currentMode = 'graphic'; // 默认图形化
    let configData = {}; // 存储获取的配置数据

    // 配置板块定义
    const configSections = [
        {
            title: "通用设置",
            icon: "⚙️",
            fields: [
                "Aisettings.chatgpt.ai_name_sess",
                "Aisettings.chatgpt.ai_name_godgpt",
                "Aisettings.chatgpt.ai_name_chat",
                "Aisettings.chatgpt.ai_name_others",
                "Aisettings.chatgpt.prompts_answer_open",
                "Aisettings.chatgpt.prompts_answers",
                "Aisettings.chatgpt.ai_private_open",
                "Aisettings.chatgpt.ai_private_plan",
                "Aisettings.chatgpt.chat_moment_open",
                "Aisettings.chatgpt.god_moment_open",
                "Aisettings.chatgpt.chat_moment_numbers",
                "Aisettings.chatgpt.god_moment_numbers"
            ]
        },
        {
            title: "TTS 设置",
            icon: "🔊",
            fields: [
                "Aisettings.chatgpt.ai_tts_open",
                "Aisettings.chatgpt.ai_tts_role",
            ]
        },
        {
            title: "方案设置",
            icon: "🧩",
            fields: [
                "Aisettings.chatgpt.ai_ban_plans",
                "Aisettings.chatgpt.ai_chat_style",
                "Aisettings.chatgpt.ai_chat_at",
                "Aisettings.chatgpt.ai_chat",
            ]
        },
        {
            title: "违禁词设置",
            icon: "⚠️",
            fields: [
                "Aisettings.chatgpt.add_words",
            ]
        },
        {
            title: "专业版方案",
            icon: "🔑",
            fields: [
                "openaiConfig.chatgpt.stoken",
                "openaiConfig.chatgpt.model",
                "openaiConfig.chatgpt.search",
                "openaiConfig.chatgpt.ifopen",
                "openaiConfig.chatgpt.stokens",
                "openaiProxy.chatgpt.proxy",
                "openaiProxy.chatgpt.proxy_id",
                "openaiWorkshop.workshop.limit",
                "openaiGPTS.gpts.id"
            ]
        },
        {
            title: "附加方案",
            icon: "➕",
            fields: [
                "otheraiConfig.chatgpt.stoken",
                "otheraiConfig.chatgpt.model",
                "otheraiConfig.chatgpt.search",
                "otheraiConfig.chatgpt.ifopen",
                "otheraiProxy.chatgpt.proxy",
                "otheraiWorkshop.workshop.limit"
            ]
        },
        {
            title: "用户/群组设置",
            icon: "👥",
            fields: [
                "Aisettings.chatgpt.ai_ban_number",
                "Aisettings.chatgpt.ai_ban_group",
            ]
        },
    ];

    // 数据映射配置：定义配置键和UI表示之间的映射关系，添加了图标和描述
    const fieldMappings = {
        "Aisettings.chatgpt.ai_name_sess": {
            label: "Sess 方案触发名（已弃用）",
            type: "text",
            icon: "🏷️", // 添加图标
            description: "设置用户触发已弃用的 Sess 方案的关键词。" // 添加描述
        },
        "Aisettings.chatgpt.ai_name_godgpt": {
            label: "GOD 方案触发名",
            type: "text",
            icon: "👑",
            description: "定义用户触发 GOD 方案的关键词，赋予 AI 上帝模式。"
        },
        "Aisettings.chatgpt.ai_name_chat": {
            label: "Chat 方案触发名",
            type: "text",
            icon: "💬",
            description: "设置用户触发 Chat 方案的关键词，进行日常对话。"
        },
        "Aisettings.chatgpt.ai_name_others": {
            label: "附加方案触发名",
            type: "text",
            icon: "✨",
            description: "配置用户触发附加免费方案的关键词，体验更多 AI 功能。"
        },
        "Aisettings.chatgpt.ai_tts_open": {
            label: "开启 TTS 回复",
            type: "boolean",
            icon: "📢",
            description: "启用后，AI 将使用文本转语音技术回复消息。",
            options: {
                true: "开启",
                false: "关闭"
            }
        },
        "Aisettings.chatgpt.ai_tts_role": {
            label: "Ai TTS 角色",
            type: "text",
            icon: "🗣️",
            description: "设置 AI 文本转语音回复时使用的角色声音。"
        },
        "Aisettings.chatgpt.ai_ban_plans": {
            label: "禁用 Ai 方案",
            type: "array",
            icon: "⛔",
            description: "选择要禁用的 AI 方案，阻止特定功能的使用。",
            options: {
                godgpt: "GODGPT 方案",
                chatgpt: "CHATGPT 方案",
                others: "附加方案"
            }
        },
        "Aisettings.chatgpt.ai_ban_number": {
            label: "禁用用户",
            type: "array",
            icon: "👤",
            description: "输入要禁用的用户 ID，阻止其使用 AI 功能。",
        },
        "Aisettings.chatgpt.ai_ban_group": {
            label: "禁用群聊",
            type: "array",
            icon: "🏘️",
            description: "输入要禁用的群聊 ID，限制 AI 在特定群组中的使用。",
        },
        "Aisettings.chatgpt.add_words": {
            label: "Ai 违禁词",
            type: "array",
            icon: "🛡️",
            description: "添加 AI 违禁词，防止 AI 生成不当内容。",
        },
        "Aisettings.chatgpt.ai_chat_style": {
            label: "Ai 对话方式",
            type: "select",
            icon: "✒️",
            description: "选择 AI 的消息发送风格，影响回复呈现方式。",
            options: {
                word: "普通文本",
                words: "引用文本",
                forward: "转发消息",
                similar: "拟人分段",
                picture: "图片模式 1",
                pictures: "图片模式 2",
                tts: "语音发送"
            }
        },
        "Aisettings.chatgpt.ai_chat_at": {
            label: "开启 Ai @",
            type: "boolean",
            icon: "🔔",
            description: "启用后，AI 将在回复消息时 @ 用户。",
            options: {
                true: "开启",
                false: "关闭"
            }
        },
        "Aisettings.chatgpt.prompts_answer_open": {
            label: "开启 Ai 提示词回复",
            type: "boolean",
            icon: "💡",
            description: "启用后，AI 会在回复前显示提示词反馈。",
            options: {
                true: "开启",
                false: "关闭"
            }
        },
        "Aisettings.chatgpt.chat_moment_open": {
            label: "专业版方案记忆限制",
            type: "boolean",
            icon: "🧠",
            description: "启用后，限制专业版方案的记忆条数。",
            options: {
                true: "开启",
                false: "关闭"
            }
        },
        "Aisettings.chatgpt.god_moment_open": {
            label: "GOD版方案记忆限制",
            type: "boolean",
            icon: "🌟",
            description: "启用后，限制 GOD 版方案的记忆条数。",
            options: {
                true: "开启",
                false: "关闭"
            }
        },
        "Aisettings.chatgpt.chat_moment_numbers": {
            label: "专业版方案记忆限制条数",
            type: "text",
            icon: "🔢",
            description: "设置专业版方案的记忆条数，影响回复速度和消耗。",
        },
        "Aisettings.chatgpt.god_moment_numbers": {
            label: "GOD方案记忆限制条数",
            type: "text",
            icon: "🔢",
            description: "设置 GOD 版方案的记忆条数，影响回复速度和消耗。",
        },
        "Aisettings.chatgpt.ai_private_open": {
            label: "是否允许 Ai 私聊回复",
            type: "boolean",
            icon: "✉️",
            description: "开启后，允许 AI 在私聊中回复用户消息。",
            options: {
                true: "开启",
                false: "关闭"
            }
        },
        "Aisettings.chatgpt.prompts_answers": {
            label: "Ai 回复提示词",
            type: "text",
            icon: "🔑",
            description: "设置 AI 回复消息前的提示词，引导 AI 的回答方向。",
        },
        "Aisettings.chatgpt.ai_chat": {
            label: "Ai 聊天方案",
            type: "select",
            icon: "🤖",
            description: "选择 AI 使用的聊天方案，决定 AI 的功能和特性。",
            options: {
                godgpt: "GodGPT 方案",
                chatgpt: "ChatGPT 方案",
                others: "附加免费方案"
            }
        },
        "Aisettings.chatgpt.ai_private_plan": {
            label: "Ai 私聊方案",
            type: "select",
            icon: "🤖",
            description: "选择 AI 在私聊中使用的方案，决定 AI 的功能和特性。",
            options: {
                godgpt: "GodGPT 方案",
                chatgpt: "ChatGPT 方案",
                others: "附加免费方案"
            }
        },
        "otheraiConfig.chatgpt.stoken": {
            label: "附加方案密钥",
            type: "text",
            icon: "🔑",
            description: "输入附加方案的 API 密钥，用于访问 AI 服务。",
        },
        "otheraiConfig.chatgpt.model": {
            label: "附加方案模型",
            type: "text",
            icon: "🧠",
            description: "选择附加方案使用的 AI 模型，影响 AI 的回复质量。",
        },
        "otheraiConfig.chatgpt.search": {
            label: "允许 Ai 搜索 (已废弃)",
            type: "boolean",
            icon: "🌐",
            description: "是否允许 AI 使用外置搜索 (已废弃)。",
            options: {
                true: "开启",
                false: "关闭"
            }
        },
        "otheraiConfig.chatgpt.ifopen": {
            label: "开放此方案 (已废弃)",
            type: "boolean",
            icon: "🔓",
            description: "是否允许开放此方案 (已废弃)。",
            options: {
                true: "开启",
                false: "关闭"
            }
        },
        "otheraiProxy.chatgpt.proxy": {
            label: "附加版方案强制反代",
            type: "select",
            icon: "🌍",
            description: "设置附加版方案是否开启强制反代。",
            options: {
                true: "开启",
                false: "关闭"
            }
        },
        "otheraiWorkshop.workshop.limit": {
            label: "附加版方案分区间",
            type: "boolean",
            icon: "🗂️",
            description: "是否开启附加版方案分区间, 开启为群区间/关闭为个人区间",
            options: {
                true: "开启",
                false: "关闭"
            }
        },
        "openaiConfig.chatgpt.stoken": {
            label: "专业版方案密钥",
            type: "text",
            icon: "🔑",
            description: "输入专业版方案的 API 密钥，用于访问 AI 服务。",
        },
        "openaiConfig.chatgpt.model": {
            label: "专业版方案模型",
            type: "text",
            icon: "🧠",
            description: "选择专业版方案使用的 AI 模型，影响 AI 的回复质量。",
        },
        "openaiConfig.chatgpt.search": {
            label: "允许 Ai 搜索",
            type: "boolean",
            icon: "🌐",
            description: "是否允许 AI 使用外置搜索。",
            options: {
                true: "开启",
                false: "关闭"
            }
        },
        "openaiConfig.chatgpt.ifopen": {
            label: "开放此方案 (已废弃)",
            type: "boolean",
            icon: "🔓",
            description: "是否允许开放此方案 (已废弃)。",
            options: {
                true: "开启",
                false: "关闭"
            }
        },
        "openaiConfig.chatgpt.stokens": {
            label: "专业版方案总密钥",
            type: "array",
            icon: "🔑",
            description: "输入专业版方案的总密钥。",
        },
        "openaiProxy.chatgpt.proxy_id": {
            label: "专业版方案选择代理",
            type: "select",
            icon: "📡",
            description: "选择专业版方案代理地区。",
            options: {
                1: "国内节点(带cf)",
                2: "国内节点(无cf)",
                3: "日本节点",
                4: "硅谷节点"
            }
        },
        "openaiProxy.chatgpt.proxy": {
            label: "专业版方案强制反代",
            type: "select",
            icon: "🌍",
            description: "设置专业版方案是否开启强制反代。",
            options: {
                true: "开启",
                false: "关闭"
            }
        },
        "openaiWorkshop.workshop.limit": {
            label: "专业版方案分区间",
            type: "boolean",
            icon: "🗂️",
            description: "是否开启专业版方案分区间, 开启为群区间/关闭为个人区间",
            options: {
                true: "开启",
                false: "关闭"
            }
        },
        "openaiGPTS.gpts.id": {
            label: "OpenAi 的gpts-id组",
            type: "array",
            icon: "🧩",
            description: "输入OpenAi的gptsid以使用gpts模型。",
        },
        "openaiWorkshop.workshop.limit": {
            label: "专业版方案分区间",
            type: "boolean",
            icon: "🗂️",
            description: "是否开启专业版方案分区间, 开启为群区间/关闭为个人区间",
            options: {
                true: "开启",
                false: "关闭"
            }
        },
    };

    // 函数：显示消息
    function displayMessage(text, type = 'info') {
        messageSpan.textContent = text;
        messageSpan.className = `message ${type}`; // 添加一个类用于样式设置 (例如, 'success', 'error')
        setTimeout(() => {
            messageSpan.textContent = '';
            messageSpan.className = 'message';
        }, 3000); // 3秒后清除
    }

    // 函数：获取配置
    async function fetchConfig() {
        try {
            const response = await fetch('/v1/config'); // 根据需要调整URL
            if (!response.ok) {
                throw new Error(`HTTP 错误! 状态: ${response.status}`);
            }
            const data = await response.json();
            configData = data.config; // 存储配置
            return data.config;
        } catch (error) {
            console.error('获取配置失败:', error);
            displayMessage(`获取配置失败: ${error.message}`, 'error');
            return null;
        }
    }

    // 函数：初始化 Monaco 编辑器
    function initMonacoEditor(config) {
        require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
        require(['vs/editor/editor.main'], () => {
            editor = monaco.editor.create(document.getElementById('editor'), {
                value: JSON.stringify(config, null, 2),
                language: 'json',
                theme: 'vs-dark', // 使用黑暗模式主题
                automaticLayout: true
            });
        });
    }

    // 函数：生成图形化编辑器表单
    function generateGraphicEditor(config) {
        graphicEditorContainer.innerHTML = ''; // 清除现有内容

        // 函数：获取键路径的映射
        function getMapping(keyPath) {
            return fieldMappings[keyPath] || {}; // 如果未找到，则返回空对象
        }

        // 函数：创建表单元素
        function createFormElement(key, value, parentElement, configObject, keyPath) {
            const mapping = getMapping(keyPath);
            if (mapping.hidden) return; // 跳过隐藏字段

            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';

            // 添加图标和标签
            const labelContainer = document.createElement('div');
            labelContainer.className = 'label-container';
            const iconSpan = document.createElement('span');
            iconSpan.className = 'label-icon';
            iconSpan.textContent = mapping.icon || '⚙️'; // 默认图标
            labelContainer.appendChild(iconSpan);
            const label = document.createElement('label');
            label.textContent = mapping.label || key; // 使用映射标签，否则默认为键
            labelContainer.appendChild(label);
            formGroup.appendChild(labelContainer);

            // 添加描述
            if (mapping.description) {
                const description = document.createElement('p');
                description.className = 'field-description';
                description.textContent = mapping.description;
                formGroup.appendChild(description);
            }

            let inputElement;

            if (mapping.type === 'select') {
                // 创建自定义选择框容器
                const selectContainer = document.createElement('div');
                selectContainer.className = 'custom-select-graphic'; // 应用自定义 CSS 类

                // 创建触发器（显示当前选择的选项）
                const selectTrigger = document.createElement('div');
                selectTrigger.className = 'select-trigger';
                selectContainer.appendChild(selectTrigger);

                const selectedValueSpan = document.createElement('span');
                selectedValueSpan.textContent = mapping.options[value] || value; // 显示当前值
                selectTrigger.appendChild(selectedValueSpan);

                const arrowSpan = document.createElement('span');
                arrowSpan.innerHTML = '&#9660;'; // 向下箭头
                selectTrigger.appendChild(arrowSpan);

                // 创建选项列表
                const selectOptions = document.createElement('div');
                selectOptions.className = 'select-options';
                selectContainer.appendChild(selectOptions);

                // 填充选项
                for (const optionValue in mapping.options) {
                    if (mapping.options.hasOwnProperty(optionValue)) {
                        const label = mapping.options[optionValue];
                        const optionElement = document.createElement('div');
                        optionElement.className = 'option';
                        optionElement.textContent = label;
                        optionElement.dataset.value = optionValue; // 存储选项值
                        selectOptions.appendChild(optionElement);

                        // 选项点击事件
                        optionElement.addEventListener('click', () => {
                            selectedValueSpan.textContent = label; // 更新显示
                            //configObject[key] = optionValue; // 更新配置数据
                            updateConfigData(configData, keyPath, optionValue); // 更新全局配置数据
                            selectOptions.classList.remove('show'); // 关闭选项列表
                            selectContainer.classList.remove('active');
                        });
                    }
                }

                // 触发器点击事件（显示/隐藏选项列表）
                selectTrigger.addEventListener('click', (event) => {
                    selectOptions.classList.toggle('show');
                    selectContainer.classList.toggle('active');
                    event.stopPropagation(); // 阻止事件冒泡
                });

                inputElement = selectContainer; // 将容器赋值给 inputElement
            } else if (mapping.type === 'boolean') {
                // 创建自定义选择框容器
                const selectContainer = document.createElement('div');
                selectContainer.className = 'custom-select-graphic'; // 应用自定义 CSS 类

                // 创建触发器（显示当前选择的选项）
                const selectTrigger = document.createElement('div');
                selectTrigger.className = 'select-trigger';
                selectContainer.appendChild(selectTrigger);

                const selectedValueSpan = document.createElement('span');
                selectedValueSpan.textContent = mapping.options[value] || (value ? mapping.options.true : mapping.options.false); // 显示当前值
                selectTrigger.appendChild(selectedValueSpan);

                const arrowSpan = document.createElement('span');
                arrowSpan.innerHTML = '&#9660;'; // 向下箭头
                selectTrigger.appendChild(arrowSpan);

                // 创建选项列表
                const selectOptions = document.createElement('div');
                selectOptions.className = 'select-options';
                selectContainer.appendChild(selectOptions);

                // 填充选项
                const trueOption = document.createElement('div');
                trueOption.className = 'option';
                trueOption.textContent = mapping.options.true;
                trueOption.dataset.value = 'true';
                selectOptions.appendChild(trueOption);

                const falseOption = document.createElement('div');
                falseOption.className = 'option';
                falseOption.textContent = mapping.options.false;
                falseOption.dataset.value = 'false';
                selectOptions.appendChild(falseOption);

                // 选项点击事件
                trueOption.addEventListener('click', () => {
                    selectedValueSpan.textContent = mapping.options.true; // 更新显示
                    //configObject[key] = true; // 更新配置数据
                    updateConfigData(configData, keyPath, true); // 更新全局配置数据
                    selectOptions.classList.remove('show'); // 关闭选项列表
                    selectContainer.classList.remove('active');
                });

                falseOption.addEventListener('click', () => {
                    selectedValueSpan.textContent = mapping.options.false; // 更新显示
                    //configObject[key] = false; // 更新配置数据
                    updateConfigData(configData, keyPath, false); // 更新全局配置数据
                    selectOptions.classList.remove('show'); // 关闭选项列表
                    selectContainer.classList.remove('active');
                });

                // 触发器点击事件（显示/隐藏选项列表）
                selectTrigger.addEventListener('click', (event) => {
                    selectOptions.classList.toggle('show');
                    selectContainer.classList.toggle('active');
                    event.stopPropagation(); // 阻止事件冒泡
                });

                inputElement = selectContainer; // 将容器赋值给 inputElement
            } else if (mapping.type === 'array') {
                // 数组输入：改为按钮，点击弹出模态框编辑
                const arrayButton = document.createElement('button');
                arrayButton.textContent = `编辑 ${mapping.label}`;
                arrayButton.className = 'btn primary';
                arrayButton.addEventListener('click', () => {
                    openArrayModal(keyPath, value, mapping); // 打开模态框
                });
                inputElement = arrayButton;
            } else if (typeof value === 'string') {
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.value = value;
            } else if (typeof value === 'number') {
                inputElement = document.createElement('input');
                inputElement.type = 'number';
                inputElement.value = value;
            } else if (typeof value === 'object' && value !== null) {
                // 嵌套对象
                const nestedContainer = document.createElement('div');
                nestedContainer.className = 'nested-container';
                createForm(value, nestedContainer, keyPath); // 递归调用
                formGroup.appendChild(nestedContainer);
            } else {
                inputElement = document.createElement('span');
                inputElement.textContent = '不支持的数据类型';
            }

            if (inputElement) {
                inputElement.dataset.key = key; // 存储键供以后使用
                inputElement.dataset.keyPath = keyPath; // 存储完整的键路径
                inputElement.addEventListener('change', (event) => {
                    const changedKey = event.target.dataset.key;
                    const changedKeyPath = event.target.dataset.keyPath;
                    let newValue = event.target.value;

                    if (mapping.type === 'number' || typeof value === 'number') {
                        newValue = parseFloat(newValue);
                    } else if (mapping.type === 'boolean' || typeof value === 'boolean') {
                        newValue = event.target.value === 'true';
                    }

                    // 使用键路径更新 configData
                    updateConfigData(configData, changedKeyPath, newValue);
                });
                formGroup.appendChild(inputElement);
            }

            parentElement.appendChild(formGroup);
        }

        // 函数：创建表单
        function createForm(config, container, parentKeyPath = '') {
            for (const key in config) {
                if (config.hasOwnProperty(key)) {
                    const keyPath = parentKeyPath ? `${parentKeyPath}.${key}` : key;
                    createFormElement(key, config[key], container, config, keyPath);
                }
            }
        }

        // 函数：创建配置板块
        function createConfigSection(section) {
            const sectionContainer = document.createElement('div');
            sectionContainer.className = 'config-section';

            const sectionTitle = document.createElement('h2');
            sectionTitle.textContent = `${section.icon} ${section.title}`;
            sectionContainer.appendChild(sectionTitle);

            section.fields.forEach(fieldKey => {
                // 提取 key 和 config
                const keys = fieldKey.split('.');
                let currentConfig = config;
                for (let i = 0; i < keys.length - 1; i++) {
                    currentConfig = currentConfig[keys[i]];
                }
                const key = keys[keys.length - 1];
                const keyPath = fieldKey;

                // 调用 createFormElement
                createFormElement(key, currentConfig[key], sectionContainer, config, keyPath);
            });

            return sectionContainer;
        }

        // 循环创建配置板块
        configSections.forEach(section => {
            const sectionElement = createConfigSection(section);
            graphicEditorContainer.appendChild(sectionElement);
        });
    }

    // 函数：更新配置数据
    function updateConfigData(obj, keyPath, value) {
        const keys = keyPath.split('.');
        let current = obj;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {}; // Create nested objects if they don't exist
            }
            current = current[key];
        }

        current[keys[keys.length - 1]] = value;
    }

    // 函数：根据 currentMode 显示/隐藏编辑器
    function showEditor(mode) {
        currentMode = mode;
        if (mode === 'json') {
            yamlEditorContainer.style.display = 'block';
            graphicEditorContainer.style.display = 'none';
            showYamlEditorBtn.classList.add('active');
            showGraphicEditorBtn.classList.remove('active');
        } else {
            yamlEditorContainer.style.display = 'none';
            graphicEditorContainer.style.display = 'block';
            showYamlEditorBtn.classList.remove('active');
            showGraphicEditorBtn.classList.add('active');
        }
    }

    // 初始获取和设置
    async function initialize() {
        const config = await fetchConfig();
        if (config) {
            configData = config; // 存储配置
            initMonacoEditor(config);
            generateGraphicEditor(config);
            showEditor(currentMode); // 根据 currentMode 设置初始可见性
        }
    }

    // 主题选择器
    themeSelector.addEventListener('change', () => {
        monaco.editor.setTheme(themeSelector.value);
    });

    // 按钮事件监听器
    showYamlEditorBtn.addEventListener('click', () => {
        showEditor('json');
    });

    showGraphicEditorBtn.addEventListener('click', () => {
        showEditor('graphic');
    });

    // 保存按钮
    saveBtn.addEventListener('click', async () => {
        try {
            let configToSave;

            if (currentMode === 'json') {
                // 在保存之前验证 JSON
                try {
                    configToSave = JSON.parse(editor.getValue());
                } catch (e) {
                    displayMessage('无效的 JSON!', 'error');
                    return;
                }
            } else {
                configToSave = configData;
            }

            // **在保存之前过滤数组中的空字符串**
            function filterEmptyStringsInArrays(obj) {
                for (const key in obj) {
                    if (Array.isArray(obj[key])) {
                        obj[key] = obj[key].filter(item => item !== "");
                    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                        filterEmptyStringsInArrays(obj[key]); // 递归处理嵌套对象
                    }
                }
            }

            filterEmptyStringsInArrays(configToSave);

            const response = await fetch('/v1/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ config: configToSave })
            });

            if (!response.ok) {
                throw new Error(`HTTP 错误! 状态: ${response.status}`);
            }

            displayMessage('配置保存成功!', 'success');
        } catch (error) {
            console.error('保存配置失败:', error);
            displayMessage(`保存配置失败: ${error.message}`, 'error');
        }
    });

    // 刷新按钮
    refreshBtn.addEventListener('click', async () => {
        const config = await fetchConfig();
        if (config) {
            if (editor) {
                editor.setValue(JSON.stringify(config, null, 2));
            }
            generateGraphicEditor(config);
            showEditor(currentMode); // 刷新并确保正确的可见性
            displayMessage('配置已刷新!', 'info');
        }
    });

    // 将 initialize 函数暴露给 window 对象
    window.initialize = initialize;

    // 添加全局点击事件监听器
    document.addEventListener('click', () => {
        const allSelectOptions = document.querySelectorAll('.custom-select-graphic .select-options');
        allSelectOptions.forEach(options => options.classList.remove('show'));

        const allSelectContainers = document.querySelectorAll('.custom-select-graphic');
        allSelectContainers.forEach(container => container.classList.remove('active'));
    });

    // 函数：打开数组编辑模态框
    function openArrayModal(keyPath, initialValue, mapping) {
        // 创建模态框元素
        const modal = document.createElement('div');
        modal.className = 'modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modal.appendChild(modalContent);

        const modalTitle = document.createElement('h2');
        modalTitle.textContent = `编辑 ${mapping.label}`;
        modalContent.appendChild(modalTitle);

        const closeButton = document.createElement('span');
        closeButton.className = 'close-button';
        closeButton.innerHTML = '&times;'; // 关闭符号
        closeButton.addEventListener('click', () => {
            closeModal();
        });
        modalContent.appendChild(closeButton);

        const arrayInputContainer = document.createElement('div');
        arrayInputContainer.className = 'array-input-container';
        modalContent.appendChild(arrayInputContainer);

        let value = [...initialValue]; // Create a copy to avoid direct modification

        function renderArrayItems() {
            arrayInputContainer.innerHTML = ''; // Clear existing items before re-rendering

            value.forEach((item, index) => {
                const arrayInputItem = document.createElement('div');
                arrayInputItem.className = 'array-input-item';

                let itemInput;

                if (mapping.options) {
                    // Fixed options: use a select element
                    itemInput = document.createElement('select');

                    // Handle object-based options
                    if (typeof mapping.options === 'object' && !Array.isArray(mapping.options)) {
                        for (const optionValue in mapping.options) {
                            if (mapping.options.hasOwnProperty(optionValue)) {
                                const optionElement = document.createElement('option');
                                optionElement.value = optionValue;
                                optionElement.textContent = mapping.options[optionValue];
                                itemInput.appendChild(optionElement);
                            }
                        }
                    } else if (Array.isArray(mapping.options)) {
                        // Handle array-based options (previous implementation)
                        mapping.options.forEach(option => {
                            const optionElement = document.createElement('option');
                            optionElement.value = option;
                            optionElement.textContent = option;
                            itemInput.appendChild(optionElement);
                        });
                    }

                    itemInput.value = item; // Set selected value
                    itemInput.addEventListener('change', () => {
                        value[index] = itemInput.value; // Update the array value on input change
                    });
                } else {
                    // Free input: use a text input
                    itemInput = document.createElement('input');
                    itemInput.type = 'text'; // 假设数组项是字符串，根据需要调整
                    itemInput.value = item;
                    itemInput.addEventListener('change', () => {
                        value[index] = itemInput.value; // Update the array value on input change
                    });
                }
                arrayInputItem.appendChild(itemInput);

                const removeButton = document.createElement('button');
                removeButton.textContent = '移除';
                removeButton.className = 'btn secondary';
                removeButton.addEventListener('click', () => {
                    value.splice(index, 1); // 从数组中移除
                    renderArrayItems(); // Re-render the array items
                });
                arrayInputItem.appendChild(removeButton);

                arrayInputContainer.appendChild(arrayInputItem);
            });
        }

        renderArrayItems(); // Initial render

        const addButton = document.createElement('button');
        addButton.textContent = '添加项目';
        addButton.className = 'btn primary';
        addButton.addEventListener('click', () => {
            let newItem = '';
            if (mapping.options) {
                // Default to the first option's value when adding a new item
                if (typeof mapping.options === 'object' && !Array.isArray(mapping.options)) {
                    newItem = Object.keys(mapping.options)[0] || '';
                } else if (Array.isArray(mapping.options)) {
                    newItem = mapping.options[0] || '';
                }
            }
            value.push(newItem); // 向数组添加一个新的空项目
            renderArrayItems(); // Re-render the array items
        });
        modalContent.appendChild(addButton);

        // Action buttons
        const modalActions = document.createElement('div');
        modalActions.className = 'modal-actions';
        modalContent.appendChild(modalActions);

        const saveButton = document.createElement('button');
        saveButton.textContent = '保存';
        saveButton.className = 'btn primary';
        saveButton.addEventListener('click', () => {
            updateConfigData(configData, keyPath, value); // Update the actual configData
            closeModal();
            generateGraphicEditor(configData); // Refresh the graphic editor
        });
        modalActions.appendChild(saveButton);

        const cancelButton = document.createElement('button');
        cancelButton.textContent = '取消';
        cancelButton.className = 'btn secondary';
        cancelButton.addEventListener('click', () => {
            closeModal();
        });
        modalActions.appendChild(cancelButton);

        // Append the modal to the body
        document.body.appendChild(modal);

        // Function to close the modal
        function closeModal() {
            modal.remove();
        }
    }
});
