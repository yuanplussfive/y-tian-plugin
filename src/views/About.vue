<template>
  <div id="app">
    <div v-if="!isLoggedIn" class="login-container">
      <div class="login-form">
        <h3>登录</h3>
        <input type="text" v-model="username" placeholder="用户名" />
        <input type="password" v-model="password" placeholder="密码" />
        <button @click="login">登录</button>
        <p v-if="loginError" class="error">{{ loginError }}</p>
      </div>
    </div>
    <div v-else>
      <div class="chat-container">
        <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
          <div class="sidebar-header">
            <h3></h3>
            <button @click="toggleSidebar" class="settings-button"
              :style="{ position: 'absolute', left: isButtonAtLeft ? '0' : 'calc(100% - 40px)', top: '10px' }"
              title="Toggle Sidebar">
              <i class="fas" :class="isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
            </button>
            <button v-if="!isCollapsed" @click="showAddModal = true" class="new-conversation">
              <i class="fas fa-plus"></i> 新对话
            </button>
          </div>

          <div class="conversations" v-show="!isCollapsed">
            <div v-for="(conversation, index) in conversations" :key="index" class="conversation-item"
              :class="{ active: selectedConversationIndex === index }" @click="selectConversation(index)">
              <div class="conversation-name">
                {{ conversation.name || '未命名对话' }}
              </div>
              <div class="conversation-actions">
                <button @click.stop="exportConversation(conversation)">
                  <i class="fas fa-download"></i>
                </button>
                <button @click.stop="showDeleteModal = true; deleteConversationIndex = index">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-window">
          <div v-if="selectedConversation" class="header">
            <div class="model-prompt-settings">
              <button class="settings-toggle" @click="toggleSettingsPanel">
                <i class="fas fa-cogs"></i> 设置
              </button>

              <div v-if="showSettingsPanel" class="settings-panel">
                <button class="close-settings-button" @click="toggleSettingsPanel">
                  <i class="fas fa-times"></i> 关闭设置
                </button>

                <div class="setting-item" style="display: flex; align-items: center; margin-bottom: 16px;">
                  <i class="fas fa-font" style="margin-right: 8px;"></i>
                  <div style="flex: 1;">
                    <label for="fontSize">字体大小:</label>
                    <span>{{ fontSize }}px</span>
                    <input type="range" id="fontSize" v-model.number="fontSize" min="10" max="30" step="1" @input="updateFontSize" style="flex: 3; width: 100%;" />
                  </div>
                </div>
                <p class="setting-notes">调整聊天窗口中消息的字体大小，以便于阅读。</p>

                <div class="setting-item" style="display: flex; align-items: center; margin-bottom: 16px;">
                  <i class="fas fa-cogs" style="margin-right: 8px;"></i>
                  <div style="flex: 1;">
                    <label for="modelSelect">选择模型:</label>
                    <div class="select-wrapper">
                      <div class="selected-model" @click="toggleOptions" style="cursor: pointer;">
                        <span class="model-icon">
                          <img :src="require(`@/assets/${selectedConversation.selectedModel.logo}`)" :alt="selectedConversation.selectedModel.name" />
                        </span>
                        <span class="model-name">{{ selectedConversation.selectedModel.name }}</span>
                        <i class="arrow" :class="{ open: showOptions }"></i>
                      </div>
                      <ul class="options" v-show="showOptions" style="list-style-type: none; padding: 0; margin: 0;">
                        <li v-for="model in models" :key="model.value" @click="selectModel(selectedConversation, model)"
                            :class="{ selected: model === selectedConversation.selectedModel }" style="cursor: pointer;">
                          <span class="model-icon">
                            <img :src="require(`@/assets/${model.logo}`)" :alt="model.name" />
                          </span>
                          <div class="model-info">
                            <span class="model-name">{{ model.name }}</span>
                            <p v-if="showDetails" class="model-description">{{ model.description }}</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <p class="setting-notes">选择您想要使用的对话模型以提供不同的回答风格。</p>

                <div class="setting-item current-prompt-area">
                  <i class="fas fa-lightbulb" style="margin-right: 8px;"></i>
                  <div style="flex: 1;">
                    <label for="presetPrompt">当前提示词:</label>
                    <div class="current-prompt-box">
                      <span class="selected-prompt">{{ shortenText(selectedConversation.systemPrompt) || '选择系统提示词...' }}</span>
                    </div>
                    <button class="clear-button" @click="clearPresetPrompt">清空预设</button>
                  </div>
                </div>

                <p class="setting-notes">您可以为对话设置系统提示词，以引导聊天内容。</p>

                <!-- 自定义提示的输入部分 -->
                <div class="setting-item" style="display: flex; align-items: center; margin-bottom: 16px;">
                  <i class="fas fa-pencil-alt" style="margin-right: 8px;"></i>
                  <div class="flex-1">
                    <label for="customPrompt">自定义提示:</label>
                    <input type="text" v-model="customPromptInput" placeholder="输入自定义提示..." class="custom-prompt-input" />
                    <button class="custom-prompt-button" @click="setCustomPrompt">设置</button>
                  </div>
                </div>
                <p class="setting-notes">输入您的自定义提示词，并点击设置以应用。</p>

                <div class="setting-item toggle-preset-area">
                  <i class="fas fa-tasks" style="margin-right: 8px;"></i>
                  <div style="flex: 1;">
                    <button class="toggle-preset-button" @click="togglePresetGallery" style="width: 100%;">
                      {{ showPresetGallery ? '隐藏可用的预设模板' : '显示可用的预设模板' }}
                    </button>
                  </div>
                </div>
                <p class="setting-notes">查看可用的预设模板，帮助您更好地开始对话。</p>

                <!-- 预设模板展示 -->
                <div v-if="showPresetGallery" class="preset-prompts-gallery">
                  <h3>可用的预设模板</h3>
                  <div class="template-cards">
                    <button class="close-preset-gallery" @click="showPresetGallery = false">
                      <i class="fas fa-times"></i> 关闭
                    </button>
                    <div v-for="prompt in presetPrompts" :key="prompt.value" class="template-card" @click="selectPrompt(selectedConversation, prompt.value)">
                      <div class="card-content">
                        <h4>{{ prompt.name }}</h4>
                        <p>{{ prompt.description || '无描述' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedConversation" class="messages" :style="{ fontSize: fontSize + 'px' }">
            <div v-if="selectedConversation.messages.length === 0" class="suggestion-box">
              <div class="suggestion-header">
                <h3>建议的问题：</h3>
                <div class="matrix-effect"></div>
              </div>
              <div class="suggestion-list">
                <ul>
                  <li v-for="(suggestion, index) in suggestedQuestions" :key="index"
                    @click="sendSuggestedQuestion(suggestion)">
                    {{ suggestion }}
                  </li>
                </ul>
              </div>
            </div>

            <div v-else v-for="(msg, msgIndex) in selectedConversation.messages" :key="msgIndex"
            class="message-wrapper" :ref="msgIndex === selectedConversation.messages.length - 1 ? 'lastMessage' : ''">
              <div v-if="!msg.isUser" class="bot-avatar">
                <img :src="require(`@/assets/${selectedConversation.selectedModel.logo}`)" alt="Bot Avatar" />
              </div>

              <div :class="['message', msg.isUser ? 'user-message' : 'bot-message']"
                :style="{ fontSize: fontSize + 'px' }">
                <div class="message-content" :style="{ fontSize: fontSize + 'px' }">
                  <div v-html="convertMarkdownToHtml(msg.text, fontSize)"></div>
                </div>
                <button class="copy-button" @click="copyMessage(msg.text)" title="复制">
                  <i class="fas fa-copy"></i>
                </button>
                <button class="del-button" @click="deleteMessage(msgIndex)" title="删除">
                  <i class="fas fa-trash-alt"></i>
                </button>
                <button class="retry-button" @click="requestAIResponse(msg.text, selectedConversation)" title="重答">
                  <i class="fas fa-redo"></i>
                </button>
                <button class="action-button" v-if="selectedConversation.loading" @click="cancelRequest" title="取消">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div v-if="msg.isUser" class="user-avatar">
                <img src="@/assets/User.jpg" alt="User Avatar" />
              </div>
            </div>
          </div>

          <div v-if="selectedConversation" class="input-area">
            <textarea v-model="selectedConversation.newMessage" placeholder="输入消息..."
              @keydown.shift.enter="sendMessage(selectedConversation)" rows="1"
              style="resize: none; overflow: auto; max-height: calc(5 * 1.2em);" ref="messageInput"></textarea>
            <button @click="triggerFileUpload" class="file-upload-button">
              <i class="fas fa-upload"></i>
            </button>
            <input type="file" ref="fileInput" @change="handleFileUpload"
              accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif" style="display: none;" />
            <button @click="sendMessage(selectedConversation)" :disabled="selectedConversation.loading"
              class="send-button">
              <span v-if="!selectedConversation.loading" class="send-icon">
                <i class="fas fa-paper-plane"></i>
              </span>
              <span v-else class="loading-spinner">
                <i class="fas fa-circle-notch fa-spin"></i>
              </span>
            </button>
          </div>
        </div>

        <div v-if="showAddModal" class="modal-overlay">
          <div class="modal">
            <div class="modal-header">
              <h3>新建对话</h3>
              <button @click="showAddModal = false" class="close-button">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <input v-model="newConversationName" type="text" placeholder="输入对话名称" />
            </div>
            <div class="modal-footer">
              <button @click="createNewConversation" class="create-button">
                创建
              </button>
              <button @click="showAddModal = false" class="cancel-button">
                取消
              </button>
            </div>
          </div>
        </div>

        <div v-if="showDeleteModal" class="modal-overlay">
          <div class="modal">
            <div class="modal-header">
              <h3>删除对话</h3>
              <button @click="showDeleteModal = false; deleteConversationIndex = null" class="close-button">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <p>确定要删除此对话吗?</p>
            </div>
            <div class="modal-footer">
              <button @click="deleteConversation" class="delete-button">删除</button>
              <button @click="showDeleteModal = false; deleteConversationIndex = null" class="cancel-button">取消</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import showdown from 'showdown';
  import hljs from 'highlight.js'
  //import Prism from 'prismjs';
  //import 'prismjs/components/prism-javascript';

  export default {
    name: 'ChatWindow',
    components: {
      //VueMarked,
    },
    data() {
      return {
        isCancelled: false,
        showDetailss: false, // 控制详细信息的显示状态
        showPresetGallery: false, // 控制预设模板的显示状态
        isLoggedIn: false,
        username: '',
        password: '',
        loginError: '',
        isCollapsed: false,
        isButtonAtLeft: false, // 新增的变量
        showSettingsPanel: false,
        suggestedQuestions: [
          "你有什么兴趣爱好吗?",
          "最近看过什么有趣的电影或书籍吗?",
          "你对人工智能的发展有什么看法?",
          "如何提高工作效率和时间管理?"
        ],
        uploadedFile: null,
        showOptions: false,
        showDetails: false,
        showPromptOptions: false,
        showCustomPromptInput: false,
        customPromptInput: '',
        presetPrompts: [],
        models: [
          {
            value: 'gpt-3.5-turbo',
            name: 'GPT-3.5-turbo',
            logo: 'ChatGPT.jpg',
            description: 'OpenAI.'
          },
          {
            value: 'gpt-3.5-turbo-16k',
            name: 'GPT-3.5-turbo-16k',
            logo: 'ChatGPT.jpg',
            description: 'OpenAI.'
          },
          {
            value: 'gpt-4',
            name: 'GPT-4',
            logo: 'ChatGPT.jpg',
            description: 'OpenAI.'
          },
          {
            value: 'gpt-4-turbo-preview',
            name: 'GPT-4-turbo',
            logo: 'ChatGPT.jpg',
            description: 'OpenAI.'
          },
          {
            value: 'gpt-4-turbo',
            name: 'GPT-4-turbo-0429',
            logo: 'ChatGPT.jpg',
            description: 'OpenAI.'
          },
          {
            value: 'gpt-4o-mini',
            name: 'GPT-4-Mini',
            logo: 'ChatGPT.jpg',
            description: 'OpenAI.'
          },
          {
            value: 'gpt-4o',
            name: 'GPT-4o',
            logo: 'ChatGPT.jpg',
            description: 'OpenAI.'
          },
          {
            value: 'gpt-4o-0513',
            name: 'GPT-4o-0513',
            logo: 'ChatGPT.jpg',
            description: 'OpenAI.'
          },
          {
            value: 'gpt-4o-0806',
            name: 'GPT-4o-0806',
            logo: 'ChatGPT.jpg',
            description: 'OpenAI.'
          },
          {
            value: 'gpt-4o-latest',
            name: 'GPT-4o-Latest',
            logo: 'ChatGPT.jpg',
            description: 'OpenAI.'
          },
          {
            value: 'gpt-4o-all',
            name: 'GPT-4o-all',
            logo: 'ChatGPT.jpg',
            description: 'OpenAI.'
          },
          {
            value: 'claude-3-opus',
            name: 'Claude-3-Opus',
            logo: 'Claude.jpg',
            description: 'Claude.'
          },
          {
            value: 'claude-3-5-sonnet-20240620',
            name: 'Claude-3.5-sonnet',
            logo: 'Claude.jpg',
            description: 'Claude.'
          },
          {
            value: 'bing-creative',
            name: 'Bing-Creative',
            logo: 'Bing.jpg',
            description: 'Microsoft.'
          },
          {
            value: 'bing-balanced',
            name: 'Bing-Balanced',
            logo: 'Bing.jpg',
            description: 'Microsoft.'
          },
          {
            value: 'bing-practice',
            name: 'Bing-Practice',
            logo: 'Bing.jpg',
            description: 'Microsoft.'
          },
          {
            value: 'gemini-pro',
            name: 'Gemini-Pro',
            logo: 'Gemini.jpg',
            description: 'Google.'
          },
          {
            value: 'gemini-1.5-flash',
            name: 'Gemini-1.5-Flash',
            logo: 'Gemini.jpg',
            description: 'Google.'
          },
          {
            value: 'gemini-1.5-pro',
            name: 'Gemini-1.5-Pro',
            logo: 'Gemini.jpg',
            description: 'Google.'
          },
          {
            value: 'glm-4-air',
            name: 'Glm-4-Air',
            logo: 'ChatGLM.jpg',
            description: 'ChatGLM.'
          },
          {
            value: 'glm-4-flash',
            name: 'Glm-4-Flash',
            logo: 'ChatGLM.jpg',
            description: 'ChatGLM.'
          },
          {
            value: 'glm-4-turbo',
            name: 'Glm-4-Turbo',
            logo: 'ChatGLM.jpg',
            description: 'ChatGLM.'
          },
          {
            value: 'flux-dev',
            name: 'Flux-Dev',
            logo: 'Flux.jpg',
            description: 'Flux.'
          },
          {
            value: 'flux-pro',
            name: 'Flux-Pro',
            logo: 'Flux.jpg',
            description: 'Flux.'
          }
        ],
        selectedModel: {
          value: 'gpt-4o',
          name: 'GPT-4o',
          logo: 'ChatGPT.jpg',
          description: 'OpenAI.'
        },
        conversations: [
          {
            name: '',
            messages: [],
            newMessage: '',
            loading: false,
            systemPrompt: null,
            selectedModel: {
              value: 'gpt-4o',
              name: 'GPT-4o',
              logo: 'ChatGPT.jpg',
              description: 'OpenAI.'
            }
          },
        ],
        selectedConversationIndex: 0,
        showAddModal: false,
        showDeleteModal: false,
        deleteConversationIndex: null,
        newConversationName: '',
      }
    },
    created() {
      this.presetPrompts = require('@/prompts.json')
      // 检查 localStorage 中的登录信息
      const loginTime = localStorage.getItem('loginTime');
      if (loginTime) {
        const currentTime = new Date().getTime();
        const ONE_DAY = 24 * 60 * 60 * 1000; // 一天的毫秒数
        if (currentTime - loginTime < ONE_DAY) {
          this.isLoggedIn = true; // 如果已经登录且不超过一天，直接登录
        } else {
          localStorage.removeItem('loginTime'); // 超过一天，清除登录时间
        }
      }
      const savedFontSize = localStorage.getItem('fontSize');
      this.fontSize = savedFontSize ? parseInt(savedFontSize) : 18;
    },
    mounted() {
      const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
        this.conversations = JSON.parse(savedConversations);
    }

    this.conversations.forEach(conversation => {
        // 如果选定的模型在 models 中，则保留该模型
        const modelMatch = this.models.find(model => model.value === conversation.selectedModel.value);
        conversation.selectedModel = modelMatch ? modelMatch : this.models[0]; // 找到模型或使用默认模型
        conversation.loading = false;
    });

    this.$nextTick(() => {
        this.addCodeLanguage();
        hljs.highlightAll();
    });
},
    updated() {
      hljs.highlightAll();
      this.addCodeLanguage();
      this.$nextTick(() => {
        const textarea = this.$refs.messageInput;
        textarea.addEventListener('input', () => {
          textarea.style.height = 'auto';
          textarea.style.height = `${textarea.scrollHeight}px`;
          textarea.style.height = Math.min(textarea.scrollHeight, textarea.offsetHeight * 4) + 'px';
        });
      });
    },
    computed: {
      selectedConversation() {
        return this.conversations[this.selectedConversationIndex]
      },
      displayPromptText() {
    return this.selectedConversation.systemPrompt && this.selectedConversation.systemPrompt.length > 10
      ? this.selectedConversation.systemPrompt.slice(0, 10) + '...'
      : this.selectedConversation.systemPrompt || '尚未设置系统提示词';
  }
    },
    methods: {
      shortenText(text) {
  // 检查 text 是否为有效的字符串
  if (typeof text !== 'string') {
    return ''; // 或者返回一个合适的默认值
  }
  
  return text.length > 12 ? text.substring(0, 12) + '…' : text;
},
      togglePresetGallery() {
      this.showPresetGallery = !this.showPresetGallery; // 切换预设模板显示状态
    },
    clearPresetPrompt() {
  this.selectedConversation.systemPrompt = '';
  this.$nextTick(() => {
    // 在 DOM 更新后需要执行的代码
    console.log('系统提示词已经清空');
  });
},
      setCustomPrompt() {
      if (this.customPromptInput.trim()) {
        this.selectedConversation.systemPrompt = this.customPromptInput;
        this.showPromptOptions = false;
        this.customPromptInput = ''; // 清空输入框
      }
    },
      updateFontSize() {
        localStorage.setItem('fontSize', this.fontSize);
      },
      login() {
        // 假设我们有一个硬编码的用户名和密码，这里可以修改为API请求
        const validUsername = 'admin';
        const validPassword = '114514';

        if (this.username === validUsername && this.password === validPassword) {
          this.isLoggedIn = true;
          this.loginError = '';
          localStorage.setItem('loginTime', new Date().getTime()); // 存储登录时间
        } else {
          this.loginError = '用户名或密码不正确';
        }
      },
      toggleSettingsPanel() {
        this.showSettingsPanel = !this.showSettingsPanel;  // 切换设置面板的显示状态
      },
      selectPrompt(conversation, prompt) {
    this.$set(conversation, 'systemPrompt', prompt);  // 确保是响应式更新
    this.showPromptOptions = false;
},
      selectModel(conversation, model) {
    conversation.selectedModel = model;
    this.showOptions = false;
    this.showDetails = true;
    this.saveConversations(); // 每次选择模型后保存
},
      toggleSidebar() {
        this.isCollapsed = !this.isCollapsed; // 切换侧边栏状态
        this.isButtonAtLeft = this.isCollapsed; // 当侧边栏收起时移动按钮
      },
      sendSuggestedQuestion(suggestion) {
        this.selectedConversation.newMessage = suggestion;
        this.sendMessage(this.selectedConversation);
      },
      exportConversation(conversation) {
        const conversationData = JSON.stringify(conversation.messages);
        const blob = new Blob([conversationData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `conversation-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
      },
      triggerFileUpload() {
        this.$refs.fileInput.click();
      },
      handleFileUpload(event) {
        alert('免费模型不支持文件上传');
        event.target.value = '';
        return;
      },
      copyMessage(text) {
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = text;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
        const copySuccessElement = document.createElement('div');
        copySuccessElement.classList.add('copy-success');
        copySuccessElement.innerHTML = 'tips: 已复制到剪贴板 <span class="copy-success__icon"></span>';
        document.body.appendChild(copySuccessElement);
        setTimeout(() => {
          copySuccessElement.classList.add('copy-success--fade-out');
          setTimeout(() => {
            document.body.removeChild(copySuccessElement);
          }, 500);
        }, 2000);
      },
      deleteMessage(index) {
  const confirmationWrapper = document.createElement('div');
  confirmationWrapper.classList.add('confirmation-wrapper');

  const confirmationBox = document.createElement('div');
  confirmationBox.classList.add('confirmation-box');

  const confirmationText = document.createElement('p');
  confirmationText.textContent = '确定要删除这条消息吗?';
  confirmationBox.appendChild(confirmationText);

  const buttonsWrapper = document.createElement('div');
  buttonsWrapper.classList.add('buttons-wrapper');

  const confirmButton = document.createElement('button');
  confirmButton.textContent = '删除';
  confirmButton.classList.add('confirm-button');
  buttonsWrapper.appendChild(confirmButton);

  const cancelButton = document.createElement('button');
  cancelButton.textContent = '取消';
  cancelButton.classList.add('cancel-button');
  buttonsWrapper.appendChild(cancelButton);

  confirmationBox.appendChild(buttonsWrapper);
  confirmationWrapper.appendChild(confirmationBox);
  document.body.appendChild(confirmationWrapper);

  confirmButton.addEventListener('click', () => {
    this.selectedConversation.messages.splice(index, 1);
    this.saveConversations(); // 在删除消息后调用 saveConversations
    document.body.removeChild(confirmationWrapper);
  });

  cancelButton.addEventListener('click', () => {
    document.body.removeChild(confirmationWrapper);
  });
},
      addCodeLanguage() {
        const codeBlocks = this.$el.querySelectorAll('.markdown-content pre code');
        //console.log(codeBlocks)
        codeBlocks.forEach((codeBlock) => {
          let language = codeBlock.className;
          console.log(language)
          function getLanguage(str) {
            const regex = /language-(\w+)/;
            const match = str.match(regex);
            return match ? match[1] : 'unknown';
          }
          language = getLanguage(language)
          codeBlock.parentNode.setAttribute('data-language', language);
        });
      },
      togglePromptOptions() {
        this.showPromptOptions = !this.showPromptOptions
      },
      toggleOptions() {
        this.showOptions = !this.showOptions
        this.showDetails = this.showOptions
      },
      convertMarkdownToHtml(markdown) {
        // 处理 Markdown 链接格式
        const processedMessages = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (match, text, href) {
          return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`; // 用安全的链接生成
        });

        // 创建 Showdown Converter 实例
        const converter = new showdown.Converter({
          tables: true,
          ghCodeBlocks: true,
          tasklists: true,
          simplifiedAutoLink: true,
          completeOnSingleNewline: true,
          simpleLineBreaks: true,
          openLinksInNewWindow: true,
          strikethrough: true,
          emoji: true
        });

        // 将 Markdown 转换为 HTML
        const html = converter.makeHtml(processedMessages);

        // 将转换后的 HTML 包装在一个 div 中，并设置样式，通过 fontSize 来动态设置
        return `<div class="markdown-content" style="font-size: ${this.fontSize}px;">${html}</div>`;
      },
      cancelRequest() {
    this.isCancelled = true; // 标记请求已被取消
    this.selectedConversation.loading = false; // 停止加载状态
    this.selectedConversation.newMessage = ''; // 清理输入框
    console.log('请求已取消');
  },
  requestAIResponse(question, conversation) {
    // 将用户的问题重新设置到输入框
    conversation.newMessage = question; 
    // 调用发送消息的方法，发送给 AI
    this.sendMessage(conversation);
  },
      async sendMessage(conversation) {
        if (conversation.newMessage.trim()) {
          conversation.messages.push({ text: conversation.newMessage, isUser: true });
          conversation.newMessage = '';
          this.isCancelled = false; // 重置为未取消状态

          try {
            conversation.loading = true;

            // 构建对话内容
            let newConversations = conversation.messages.map(({ text, isUser }) => ({
              role: isUser ? 'user' : 'assistant',
              content: text,
            }));

            const isNot = conversation.systemPrompt !== null && conversation.systemPrompt !== undefined && !/^\s*$/.test(conversation.systemPrompt);
            if (isNot) {
              newConversations.unshift({ role: "system", content: conversation.systemPrompt });
            } else if (!isNot && conversation.selectedModel.value.includes("gpt")) {
              const currentDate = new Date();
              const year = currentDate.getFullYear();
              const month = String(currentDate.getMonth() + 1).padStart(2, '0');
              const day = String(currentDate.getDate()).padStart(2, '0');
              const hours = String(currentDate.getHours()).padStart(2, '0');
              const minutes = String(currentDate.getMinutes()).padStart(2, '0');
              const seconds = String(currentDate.getSeconds()).padStart(2, '0');
              const formattedDate = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
              const systemMessageContent = `You are ChatGPT, a large language model trained by OpenAI. If you need to provide relevant links or other requests, please use the markup format
Knowledge cutoff: 2023-10
Current model: ${conversation.selectedModel.value}
Current time: ${formattedDate}
Latex inline: x^2
Latex block: e=mc^2`;
              newConversations.unshift({ role: "system", content: systemMessageContent });
            }

            // 判断是否有文件上传
            let messagesToSend = newConversations;

            if (conversation.uploadedFile && conversation.uploadedFile.content) {
              let imgurls = [{
                "type": "text",
                "text": newConversations.map(c => c.content).join('\n')
              }];

              imgurls.push({
                "type": "image_url",
                "image_url": {
                  url: conversation.uploadedFile.content
                }
              });

              console.log(imgurls);
              const imageUrls = [{ role: "user", content: imgurls }];
              messagesToSend = imageUrls; // 替换为图片消息
            }

            // 根据模型选择URL
            let url = 'https://yuanpluss.online:3000/v1/chat/completions';
            if (conversation?.selectedModel?.value?.includes('claude')) url = 'https://yuanpluss.online:3000/ffa/chat/completions';
            if (conversation?.selectedModel?.value?.includes('all')) url = 'https://yuanpluss.online:3000/gods/chat/completions';
            if (conversation?.selectedModel?.value?.includes('bing')) url = 'https://yuanpluss.online:3000/bing/chat/completions';
            if (conversation?.selectedModel?.value?.includes('gemini')) url = 'https://yuanpluss.online:3000/gemini/chat/completions';
            if (conversation?.selectedModel?.value?.includes('chatglm')) url = 'https://yuanpluss.online:3000/v2/free35/completions';
            if (conversation?.selectedModel?.value?.includes('flux')) url = 'https://yuanpluss.online:3000/flux/create';

            const controller = new AbortController();
            const timeout = setTimeout(() => {
              controller.abort();
            }, 2 * 60 * 1000);

            const response = await fetch(url, {
              method: 'post',
              headers: {
                'content-type': 'application/json',
              },
              body: JSON.stringify({
                model: conversation.selectedModel.value,
                messages: messagesToSend,
              }),
              signal: controller.signal,
            });

            clearTimeout(timeout);

              // 如果请求被取消了，返回
            if (this.isCancelled) return;

            let aiReply = await response.text();
            if (conversation?.selectedModel?.value?.includes('flux')) aiReply = `![flux](${aiReply})\n**[点击查看图片](${aiReply})**`
            conversation.messages.push({ text: aiReply, isUser: false });
            this.$nextTick(() => {
        const lastMessage = this.$refs.lastMessage;
        if (lastMessage && lastMessage.length) {
          lastMessage[lastMessage.length - 1].scrollIntoView({ behavior: 'smooth' });
        }
      });
            this.saveConversations();
          } catch (error) {
            if (error.name === 'AbortError') {
              console.log('Request timed out');
              conversation.messages.push({ text: '请求超时！', isUser: false });
            } else {
              console.log(error);
              conversation.messages.pop();
            }
            conversation.loading = false;
          } finally {
            conversation.loading = false;
          }
        }
      },
      selectConversation(index) {
        this.selectedConversationIndex = index
      },
      createNewConversation() {
    if (this.newConversationName.trim()) {
        const newConversation = {
            name: this.newConversationName,
            messages: [],
            newMessage: '',
            loading: false,
            selectedModel: this.models[0], // 新对话的默认模型
        };
        this.conversations.push(newConversation);
        this.selectConversation(this.conversations.length - 1);
        this.showAddModal = false;
        this.newConversationName = '';
        this.saveConversations(); // 创建新对话后保存
    }
},
deleteConversation() {
  if (this.deleteConversationIndex !== null) {
    // 从对话中删除指定的索引
    this.conversations.splice(this.deleteConversationIndex, 1);
    
    // 关闭删除对话的模态框
    this.showDeleteModal = false;
    this.deleteConversationIndex = null;
    
    // 保存当前对话状态，以更新 localStorage
    this.saveConversations(); // 确保调用了此方法
  }
},
      saveConversations() {
        localStorage.setItem('conversations', JSON.stringify(this.conversations))
      },
    },
  }
</script>

<style scoped>
  @import '../markdown.css';
  @import '../chat.css';
  @import 'highlight.js/styles/github.css'
</style>