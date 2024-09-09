<template>
  <div class="chat-container">
    <div class="sidebar">
      <div class="sidebar-header">
        <h3> </h3>
        <button @click="showAddModal = true" class="new-conversation">
          <i class="fas fa-plus"></i> 新对话
        </button>
      </div>
      <div class="conversations">
<div
v-for="(conversation, index) in conversations"
:key="index"
class="conversation-item"
:class="{ active: selectedConversationIndex === index }"
@click="selectConversation(index)"
>
<div class="conversation-name">{{ conversation.name || '未命名对话' }}</div>
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
    <div class="model-select">
      <div class="select-wrapper">
        <div class="selected-model" @click="toggleOptions">
          <span class="model-icon">
            <img :src="require(`@/assets/${selectedConversation.selectedModel.logo}`)" :alt="selectedConversation.selectedModel.name" />
          </span>
          <span class="model-name">{{ selectedConversation.selectedModel.name }}</span>
          <i class="arrow" :class="{ open: showOptions }"></i>
        </div>
        <ul class="options" v-show="showOptions">
          <li
            v-for="model in models"
            :key="model.value"
            @click="selectModel(selectedConversation, model)"
            :class="{ selected: model === selectedConversation.selectedModel }"
          >
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

    <div class="right-section">
      <div class="prompt-select">
        <div class="select-wrapper">
          <div class="selected-prompt" @click="togglePromptOptions">
            <span class="prompt-text">{{ selectedConversation.systemPrompt || '选择系统提示词...' }}</span>
            <i class="arrow" :class="{ open: showPromptOptions }"></i>
          </div>
          <ul class="options" v-show="showPromptOptions">
            <li
              v-for="prompt in presetPrompts"
              :key="prompt.value"
              @click="selectPrompt(selectedConversation, prompt.value)"
              :class="{ selected: prompt.value === selectedConversation.systemPrompt }"
            >
              <span class="prompt-text">{{ prompt.name }}</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="api-key-input">
        <input
          v-model="apiKey"
          type="text"
          placeholder="输入你的 API 密钥..."
          @input="saveApiKey"
        />
      </div>
    </div>
  </div>


  <div v-if="selectedConversation" class="messages">
  <div v-if="selectedConversation.messages.length === 0" class="suggestion-box">
    <div class="suggestion-header">
      <h3>建议的问题：</h3>
      <div class="matrix-effect"></div>
    </div>
    <div class="suggestion-list">
      <ul>
        <li v-for="(suggestion, index) in suggestedQuestions" :key="index" @click="sendSuggestedQuestion(suggestion)">
          {{ suggestion }}
        </li>
      </ul>
    </div>
  </div>

  <div
v-else
v-for="(msg, msgIndex) in selectedConversation.messages"
:key="msgIndex"
:class="['message', msg.isUser ? 'user-message' : 'bot-message']"
>
<div :class="[msg.isUser ? 'user-avatar' : 'bot-avatar']">
<i class="fas" :class="[msg.isUser ? 'fa-user' : 'fa-robot']"></i>
</div>
<div class="message-content">
<div v-html="convertMarkdownToHtml(msg.text)"></div>
</div>
<button class="copy-button" @click="copyMessage(msg.text)" title="Copy">
<i class="fas fa-copy"></i>
</button>
<button class="del-button" @click="deleteMessage(msgIndex)" title="Delete">
<i class="fas fa-trash-alt"></i>
</button>
</div>
</div>


      
<div v-if="selectedConversation" class="input-area">
  <textarea
    v-model="selectedConversation.newMessage"
    placeholder="输入消息..."
    @keydown.shift.enter="sendMessage(selectedConversation)"
    rows="1"
    style="resize: none; overflow: auto; max-height: calc(5 * 1.2em);"
    ref="messageInput"
  ></textarea>
  <button @click="triggerFileUpload" class="file-upload-button">
    <i class="fas fa-upload"></i>
  </button>
  <input
    type="file"
    ref="fileInput"
    @change="handleFileUpload"
    accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif"
    style="display: none;"
  />
  <button
    @click="sendMessage(selectedConversation)"
    :disabled="selectedConversation.loading"
    class="send-button"
  >
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
          <input
            v-model="newConversationName"
            type="text"
            placeholder="输入对话名称"
          />
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
      apiKey: '',
      suggestedQuestions: [
      "你有什么兴趣爱好吗?",
      "最近看过什么有趣的电影或书籍吗?",
      "你对人工智能的发展有什么看法?",
      "如何提高工作效率和时间管理?",
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
          value: 'gpt-4o-all',
          name: 'gpt-4o-plus',
          logo: 'ChatGPT.jpg',
          description: 'OpenAI.'
        },
        {
          value: 'claude-1-100k',
          name: 'Claude-1-100k',
          logo: 'Claude.jpg',
          description: 'Anthropic.'
        },
        {
          value: 'claude-2',
          name: 'Claude-2',
          logo: 'Claude.jpg',
          description: 'Anthropic.'
        },
        {
          value: 'claude-3-haiku',
          name: 'Claude-3-haiku',
          logo: 'Claude.jpg',
          description: 'Anthropic.'
        },
        {
          value: 'claude-3-sonnect',
          name: 'Claude-3-sonnect',
          logo: 'Claude.jpg',
          description: 'Anthropic.'
        },
        {
          value: 'claude-3-opus',
          name: 'Claude-3-opus',
          logo: 'Claude.jpg',
          description: 'Anthropic.'
        },
        {
          value: 'gemini-pro',
          name: 'Gemini-Pro',
          logo: 'Gemini.jpg',
          description: 'Google.'
        },
        {
          value: 'glm-4',
          name: 'Glm-4',
          logo: 'ChatGLM.jpg',
          description: '智谱清言.'
        },
        {
          value: 'glm-4v',
          name: 'Glm-4V',
          logo: 'ChatGLM.jpg',
          description: '智谱清言.'
        }
      ],
      selectedModel: {
          value: 'chatgpt',
          name: 'ChatGPT',
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
          value: 'gpt-3.5-turbo',
          name: 'GPT-3.5-turbo',
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
  this.apiKey = localStorage.getItem('apiKey') || ''
},
  mounted() {
    const savedConversations = localStorage.getItem('conversations')
    if (savedConversations) {
      this.conversations = JSON.parse(savedConversations)
      console.log(this.conversations[0])
      this.conversations.forEach(conversation => {
    conversation.loading = false;
  });
    }
    this.conversations.forEach(conversation => {
      conversation.selectedModel = this.models[0]
    })
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
  },
  methods: {
    saveApiKey() {
    localStorage.setItem('apiKey', this.apiKey)
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
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.uploadedFile = {
          name: file.name,
          content: reader.result.split(',')[1],
        };
      };
      reader.readAsDataURL(file);
    }
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
  selectPrompt(conversation, prompt) {
    conversation.systemPrompt = prompt
    this.showPromptOptions = false
  },
    selectModel(conversation, model) {
      conversation.selectedModel = model
      this.showOptions = false
      this.showDetails = true
    },
    toggleOptions() {
      this.showOptions = !this.showOptions
      this.showDetails = this.showOptions
    },
    convertMarkdownToHtml(markdown) {
      const processedMessages = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (match, text, href) {
    const matchIndex = text.indexOf(')');
    if (matchIndex !== -1) {
      text = text.slice(0, matchIndex);
    }

    return `[${text}](${href})`;
  });
  const converter = new showdown.Converter({
    tables: true,
    ghCodeBlocks: true,
    tasklists: true,
    simplifiedAutoLink: true,
    completeOnSingleNewline: true,
    simpleLineBreaks: true,
    openLinksInNewWindow: true,
    customModifiers: ['myCustomModifier'],
    customDirs: ['customDir', 'customPreformatDir'],
    strikethrough: true,
    emoji: true
  });

  const wrappedMarkdown = `<div class="markdown-content">${processedMessages}</div>`;
  const html = converter.makeHtml(wrappedMarkdown);
  return html;
},
    async sendMessage(conversation) {
      if (conversation.newMessage.trim()) {
        conversation.messages.push({ text: conversation.newMessage, isUser: true })
        conversation.newMessage = ''
        try {
          conversation.loading = true
          console.log(conversation)
          let newConversations = conversation.messages.map(({ text, isUser }) => ({
           role: isUser ? 'user' : 'assistant',
           content: text
        }));
        console.log(conversation.systemPrompt)
        const isNot = conversation.systemPrompt !== null && conversation.systemPrompt !== undefined && !/^\s*$/.test(conversation.systemPrompt);
        if (isNot) {
          newConversations.unshift({ role: "system", content: conversation.systemPrompt })
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
        Knowledge cutoff: 2023-04
        Current model: ${conversation.selectedModel.value}
        Current time: ${formattedDate}
        Latex inline: x^2
        Latex block: e=mc^2`;
          newConversations.unshift({ role: "system", content: systemMessageContent })
        }
    let url = 'https://y-tian-plugin.top:3000/v1/chat/completions'
    const controller = new AbortController();
const timeout = setTimeout(() => {
  controller.abort();
}, 2 * 60 * 1000);

  const response = await fetch(url,
    {
      method: 'post',
      headers: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + this.apiKey,
      },
      body: JSON.stringify({
        model: conversation.selectedModel.value,
        messages: newConversations,
      }),
      signal: controller.signal, 
    }
  );

  clearTimeout(timeout); 

  const aiReply = await response.text();
  conversation.messages.push({ text: aiReply, isUser: false });
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
        this.conversations.push({
          name: this.newConversationName,
          messages: [],
          newMessage: '',
          loading: false,
          selectedModel: this.models[0],
        })
        this.selectConversation(this.conversations.length - 1)
        this.showAddModal = false
        this.newConversationName = ''
        this.saveConversations()
      }
    },
    deleteConversation() {
      if (this.deleteConversationIndex !== null) {
        this.conversations.splice(this.deleteConversationIndex, 1)
        this.showDeleteModal = false
        this.deleteConversationIndex = null
        this.saveConversations()
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
