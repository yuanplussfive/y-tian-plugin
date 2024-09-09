<template>
  <div>
    <h1>Chat</h1>
    <form @submit.prevent="sendMessage">
      <input v-model="message" placeholder="Enter your message">
      <button type="submit">Send</button>
    </form>
    <div v-for="msg in messages" :key="msg.id">{{ msg.text }}</div>
  </div>
</template>

<script>
import exportedDependencies from '../module.ts';

export default {
  name: 'ChatView',
  data() {
    return {
      message: '',
      messages: []
    }
  },
  methods: {
    async sendMessage() {
      const result = exportedDependencies
      console.log(result)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: this.message })
      })
      const data = await response.json()
      this.messages.push({ id: Date.now(), text: data.response })
      this.message = ''
    }
  }
}
</script>