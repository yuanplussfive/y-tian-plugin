<template>
  <div class="chat-window">
    <div class="messages">
      <!-- 渲染聊天消息 -->
      <div v-for="(msg, index) in messages" :key="index" :class="{ 'user-message': msg.isUser, 'bot-message': !msg.isUser }">
        {{ msg.text }}
      </div>
    </div>
    <div class="input-area">
      <input v-model="newMessage" placeholder="输入消息..." @keyup.enter="sendMessage" />
      <button @click="sendMessage" :disabled="loading">
        <span v-if="loading">加载中...</span>
        <span v-else>发送</span>
      </button>
    </div>
    <div v-if="loading" class="loading-spinner">
      <!-- 加载动画或其他加载状态指示器 -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatWindow',
  data() {
    return {
      messages: [], // 存储聊天消息
      newMessage: '', // 新输入的消息
      loading: false, // 标记是否正在加载中
    }
  },
  methods: {
    async sendMessage() {
      // 发送消息的逻辑
      if (this.newMessage.trim()) {
        // 将用户输入的消息添加到消息列表
        this.messages.push({ text: this.newMessage, isUser: true })
        this.newMessage = '' // 清空输入框

        try {
          this.loading = true // 设置加载状态为 true
          // 在这里调用后端 API 获取 AI 回复
          const messages = [ { "role": "user", "content": this.messages[this.messages.length - 1].text } ]
          const response = await fetch('http://localhost:4200/api/v1/freechat35/completions', {
            method: "post",
            headers: {
              "content-type": "application/json"
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: messages
            })
          })
          console.log(messages)
          const aiReply = await response.text()

          // 将 AI 回复添加到消息列表
          this.messages.push({ text: aiReply, isUser: false })
        } catch (error) {
          console.error('获取 AI 回复失败:', error)
          // 可以在这里显示错误提示
        } finally {
          this.loading = false // 设置加载状态为 false
        }
      }
    }
  }
}
</script>

<style scoped>
.chat-window {
  width: 500px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-family: Arial, sans-serif;
}

.messages {
  height: 300px;
  overflow-y: auto;
  padding: 10px;
}

.input-area {
  display: flex;
  padding: 10px;
}

.input-area input {
  flex-grow: 1;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.input-area button {
  margin-left: 10px;
  padding: 5px 10px;
  border: none;
  background-color: #007bff;
  color: #fff;
  border-radius: 3px;
  cursor: pointer;
}
</style>