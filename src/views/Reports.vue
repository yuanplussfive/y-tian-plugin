<template>
  <div class="access-denied">
    <div class="container">
      <svg viewBox="0 0 100 100" class="icon">
        <path d="M50 10 L90 90 H10 Z"></path>
      </svg>
      <h1>禁止访问</h1>
      <p>您没有权限访问此页面。</p>
      <router-link to="/">返回首页</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AccessDenied'
};
</script>

<style scoped>
.access-denied {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #0f0f0f;
  color: #fff;
  font-family: 'Roboto', sans-serif;
}

.container {
  text-align: center;
  animation: fadeIn 1s ease-in-out;
}

.icon {
  width: 100px;
  height: 100px;
  fill: #ff0000;
  animation: pulse 1.5s infinite;
}

h1 {
  margin: 20px 0;
  font-size: 2em;
  color: #ff0000;
}

p {
  margin: 10px 0;
  font-size: 1.2em;
  color: #ddd;
}

a {
  color: #fff;
  text-decoration: none;
  border: 2px solid #ff0000;
  padding: 10px 20px;
  border-radius: 5px;
  transition: background 0.3s ease;
}

a:hover {
  background: #ff0000;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>