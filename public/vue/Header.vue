<template>
  <header>
    <div class="container">
      <h1 class="logo">My Tech Blog</h1>
      <nav>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">Articles</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header'
}
</script>

<style scoped>
/* Add your header styles here */
header {
  background-color: #07133b;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 32px;
  margin: 0;
  color: #f9d423;
}

nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

nav ul li {
  display: inline-block;
  margin-right: 20px;
}

nav ul li a {
  text-decoration: none;
  color: #fff;
  transition: color 0.3s;
}

nav ul li a:hover {
  color: #f9d423;
}
</style>