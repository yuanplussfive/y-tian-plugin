<template>
  <div id="app">
    <nav class="cyber-nav" :class="{ expanded: isExpanded }">
      <div class="nav-logo">
        <svg viewBox="0 0 24 24" class="logo-icon">
          <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
        </svg>
      </div>
      <button class="nav-toggle" @click="toggleNav" :aria-expanded="isExpanded">
        <span class="sr-only">Toggle navigation</span>
        <div class="nav-toggle-icon"></div>
      </button>
      <div class="nav-links" :class="{ 'nav-links-expanded': isExpanded }">
        <router-link
          v-for="(link, index) in navLinks"
          :key="index"
          :to="link.path"
          class="nav-link"
          @click.native="handleClick(index, $event)"
          :class="{ active: activeIndex === index }"
          @mouseover.native="handleHover($event)"
          @mouseleave.native="handleLeave()"
        >
          <i :class="link.icon"></i>
          <span>{{ link.name }}</span>
          <div class="link-effect"></div>
        </router-link>
      </div>
    </nav>
    <div class="cyber-background">
      <div class="grid"></div>
      <div class="glow"></div>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      navLinks: [
        { name: 'Home', path: '/', icon: 'fas fa-microchip' },
        { name: 'Chat', path: '/about', icon: 'fas fa-brain' },
        { name: 'Gallery', path: '/gallery', icon: 'fas fa-vr-cardboard' },
        { name: 'Profile', path: '/profile', icon: 'fas fa-user-astronaut' },
        { name: 'Admin', path: '/admin', icon: 'fas fa-satellite' }
      ],
      activeIndex: null,
      isExpanded: false,
    };
  },
  methods: {
    handleClick(index, event) {
      this.activeIndex = index;
      if (window.innerWidth <= 768) {
        this.toggleNav();
      }
      this.animateClick(event.currentTarget);
    },
    handleHover(event) {
      this.animateHover(event.currentTarget);
    },
    handleLeave() {
      // Reset hover effects
    },
    toggleNav() {
      this.isExpanded = !this.isExpanded;
    },
    animateClick(element) {
      element.classList.add('clicked');
      setTimeout(() => element.classList.remove('clicked'), 300);
    },
    animateHover(element) {
      element.classList.add('hovered');
      element.addEventListener('mouseleave', () => {
        element.classList.remove('hovered');
      }, { once: true });
    }
  },
};
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');

:root {
  --primary-color: #0ff;
  --secondary-color: #111;
  --text-color: #fff;
  --hover-color: rgba(0, 255, 255, 0.2);
  --nav-height: 60px;
  --glow-color: #0ff;
}

body {
  background-color: var(--secondary-color);
  color: var(--text-color);
  font-family: 'Orbitron', sans-serif;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.cyber-nav {
  display: flex;
  align-items: center;
  background: rgba(17, 17, 17, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid var(--primary-color);
  height: var(--nav-height);
  padding: 0 20px;
  position: relative;
  box-shadow: 0 0 20px var(--glow-color);
  z-index: 1000;
}

.nav-logo {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  color: var(--primary-color);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    filter: drop-shadow(0 0 2px var(--glow-color));
  }
  50% {
    filter: drop-shadow(0 0 10px var(--glow-color));
  }
  100% {
    filter: drop-shadow(0 0 2px var(--glow-color));
  }
}

.nav-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  padding: 10px;
}

.nav-toggle-icon {
  width: 30px;
  height: 3px;
  background-color: var(--primary-color);
  position: relative;
  transition: background-color 0.3s ease;
}

.nav-toggle-icon::before,
.nav-toggle-icon::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: var(--primary-color);
  transition: transform 0.3s ease;
}

.nav-toggle-icon::before {
  transform: translateY(-8px);
}

.nav-toggle-icon::after {
  transform: translateY(8px);
}

.expanded .nav-toggle-icon {
  background-color: transparent;
}

.expanded .nav-toggle-icon::before {
  transform: rotate(45deg);
}

.expanded .nav-toggle-icon::after {
  transform: rotate(-45deg);
}

.nav-links {
  display: flex;
  align-items: center;
  flex-grow: 1;
  justify-content: flex-end;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0 15px;
  text-decoration: none;
  color: var(--text-color);
  height: var(--nav-height);
  position: relative;
  overflow: hidden;
  transition: color 0.3s ease;
}

.nav-link i {
  margin-right: 10px;
  color: var(--primary-color);
  transition: transform 0.3s ease;
}

.nav-link span {
  position: relative;
  z-index: 1;
}

.link-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--hover-color);
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.nav-link:hover .link-effect,
.nav-link.active .link-effect {
  transform: translateY(0);
}

.nav-link:hover i,
.nav-link.active i {
  transform: scale(1.2);
}

.nav-link.clicked::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, var(--primary-color) 0%, transparent 70%);
  opacity: 0;
  transform: scale(0);
  animation: click-ripple 0.6s ease-out;
}

@keyframes click-ripple {
  to {
    opacity: 0.3;
    transform: scale(2.5);
  }
}

.cyber-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.grid {
  position: absolute;
  width: 200%;
  height: 200%;
  background-image: 
    linear-gradient(to right, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  transform: rotate(-45deg);
  left: -50%;
  top: -50%;
  animation: moveGrid 20s linear infinite;
}

@keyframes moveGrid {
  0% {
    transform: rotate(-45deg) translateY(0);
  }
  100% {
    transform: rotate(-45deg) translateY(50px);
  }
}

.glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(0, 255, 255, 0.1) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  animation: pulse 4s infinite alternate;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 768px) {
  .nav-toggle {
    display: block;
  }
  
  .nav-links {
    flex-direction: column;
    position: absolute;
    top: var(--nav-height);
    left: 0;
    right: 0;
    background: rgba(17, 17, 17, 0.9);
    backdrop-filter: blur(10px);
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  .nav-links-expanded {
    max-height: 400px;
    border-top: 2px solid var(--primary-color);
  }

  .nav-link {
    width: 100%;
    padding: 15px;
    border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  }
}
</style>