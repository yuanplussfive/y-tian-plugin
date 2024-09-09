<template>
  <section class="featured">
    <div class="container">
      <h2>Featured Articles</h2>
      <div class="article-list">
        <div class="article" v-for="(article, index) in articles" :key="index">
          <h3>{{ article.title }}</h3>
          <p>{{ article.content }}</p>
          <a :href="article.link" class="btn">Read More</a>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ArticleList',
  data() {
    return {
      articles: [
        { 
          title: 'Article 1',
          content: 'Content of article 1 goes here.',
          link: '#'
        },
        { 
          title: 'Article 2',
          content: 'Content of article 2 goes here.',
          link: '#'
        },
        { 
          title: 'Article 3',
          content: 'Content of article 3 goes here.',
          link: '#'
        }
        // Add more articles as needed
      ]
    }
  }
}
</script>

<style scoped>
/* Add your article list styles here */
.featured {
  margin-top: 40px;
}

.article {
  margin-bottom: 40px;
  padding: 20px;
  background-color: #1c2a6a;
  border-radius: 5px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s;
}

.article:hover {
  transform: translateY(-5px);
}

.article h3 {
  font-size: 24px;
  margin-bottom: 10px;
  line-height: 1.2;
}

.article p {
  font-size: 16px;
  margin-bottom: 0;
  line-height: 1.6;
}

.article:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, transparent 100%);
  z-index: 1;
  transition: opacity 0.3s;
  opacity: 0;
}

.article:hover:before {
  opacity: 1;
}

.article a {
  position: relative;
  z-index: 2;
  color: #fff;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s;
}

.article a:hover {
  color: #f9d423;
}
</style>