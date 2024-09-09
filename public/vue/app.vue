<template>
  <div id="app">
    <Header />
    <main>
      <ArticleList />
    </main>
    <Footer />
  </div>
</template>

<script>
import Header from 'Header.vue';
import Footer from 'Footer.vue';
import ArticleList from 'ArticleList.vue';

export default {
  components: {
    Header,
    Footer,
    ArticleList
  }
}
</script>