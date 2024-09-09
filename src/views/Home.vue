<template>
  <div class="ai-plugin-intro">
    <div class="header">
      <h1 class="title">
        <span v-for="(char, index) in title" :key="index" :style="{ animationDelay: `${index * 0.1}s` }">{{ char }}</span>
      </h1>
      <p class="subtitle">后端管理页</p>
    </div>
    <div class="content">
      <div class="feature-container">
        <div
          class="feature"
          v-for="(feature, index) in features"
          :key="index"
          :style="{ animationDelay: `${index * 0.2}s` }"
          @mouseover="showDescription(index)"
          @mouseleave="hideDescription(index)"
        >
          <div class="icon">
            <i :class="feature.icon"></i>
          </div>
          <h2 class="feature-title">{{ feature.title }}</h2>
        </div>
      </div>
    </div>
    <div class="background">
      <div class="particles" v-for="particle in particles" :key="particle.id" :style="particle.style"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AIPluginIntro",
  data() {
    return {
      title: "Y-Tian-Plugin",
      features: [
        {
          icon: "fas fa-brain",
          title: "智能学习"
        },
        {
          icon: "fas fa-bolt",
          title: "高效便捷"
        },
        {
          icon: "fas fa-lock",
          title: "安全可靰"
        },
      ],
      activeIndex: -1,
      particles: [],
    };
  },
  mounted() {
    this.createParticles();
    window.addEventListener("resize", this.createParticles);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.createParticles);
  },
  methods: {
    showDescription(index) {
      this.activeIndex = index;
    },
    hideDescription() {
      this.activeIndex = -1;
    },
    createParticles() {
      this.particles = [];
      const width = window.innerWidth;
      const height = window.innerHeight;
      const particleCount = Math.min(100, Math.max(20, (width * height) / 10000));

      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 3 + 1;
        const style = {
          left: `${x}px`,
          top: `${y}px`,
          width: `${size}px`,
          height: `${size}px`,
          animationDuration: `${Math.random() * 5 + 5}s`,
          animationDelay: `${Math.random() * 5}s`,
        };

        this.particles.push({ id: i, style });
      }
    },
  },
};
</script>

<style scoped>
.ai-plugin-intro {
  background-color: #0a192f;
  color: #ffffff;
  padding: 80px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.header {
  margin-bottom: 60px;
  text-align: center;
}

.title {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 20px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  display: flex;
  justify-content: center;
}

.title span {
  animation: fadeInUp 0.6s ease;
  opacity: 0;
  animation-fill-mode: forwards;
}

.subtitle {
  font-size: 24px;
  color: #64ffda;
}

.content {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.feature-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  perspective: 1000px;
}

.feature {
  max-width: 300px;
  margin: 20px;
  padding: 30px;
  background-color: #172a45;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease;
  transform-style: preserve-3d;
  position: relative;
}

.feature:hover {
  transform: translateY(-10px) rotateX(10deg);
  box-shadow: 0 10px 20px rgba(0, 255, 255, 0.4);
}

.icon {
  font-size: 48px;
  color: #64ffda;
  margin-bottom: 20px;
}

.feature-title {
  font-size: 24px;
  margin-bottom: 10px;
}

.feature-description {
  font-size: 16px;
  line-height: 1.5;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  padding: 20px;
  background-color: rgba(23, 42, 69, 0.9);
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
}

.feature:hover .feature-description {
  opacity: 1;
  transform: translateY(0);
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.particles {
  position: absolute;
  background-color: rgba(0, 255, 255, 0.3);
  border-radius: 50%;
  animation: particle linear infinite;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(50px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes particle {
  0% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(200%, 200%) scale(0);
  }
  50% {
    transform: translate(200%, -200%) scale(1);
  }
  75% {
    transform: translate(-200%, -200%) scale(0);
  }
  100% {
    transform: translate(-200%, 200%) scale(1);
  }
}
</style>