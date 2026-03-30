<template>
  <div class="app">
    <!-- 樱花背景 - 左侧 -->
    <div class="sakura-container sakura-left">
      <div v-for="n in 8" :key="`left-${n}`" class="sakura" :style="getSakuraStyle(n, 'left')"></div>
    </div>

    <!-- 樱花背景 - 右侧 -->
    <div class="sakura-container sakura-right">
      <div v-for="n in 8" :key="`right-${n}`" class="sakura" :style="getSakuraStyle(n, 'right')"></div>
    </div>

    <div class="header">
      <h1><router-link to="/">小说平台</router-link></h1>
      <nav>
        <div class="nav-left">
          <!-- 普通用户显示这些 -->
          <template v-if="!isWriter">
            <router-link to="/novel/hot">热门小说</router-link>
            <router-link to="/novel/list">小说列表</router-link>
            <router-link to="/bookshelf">我的书架</router-link>
          </template>

          <!-- 作家显示这些 -->
          <template v-else>
            <router-link to="/writer/novels">我的小说</router-link>
            <router-link to="/writer/novel/create">创建小说</router-link>
          </template>
        </div>
        <div class="nav-right">
          <div v-if="!isLoggedIn">
            <router-link to="/login">登录</router-link>
            <router-link to="/register">注册</router-link>
          </div>
          <div v-else>
            <router-link to="/user/profile">个人中心</router-link>
            <button @click="logout">退出</button>
          </div>
        </div>
      </nav>
    </div>
    <main class="main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <footer class="footer" v-if="!isReaderPage">
      <div class="footer-content">
        <p class="footer-text">© 2026 小说平台</p>
        <div class="footer-links">
          <router-link v-if="!isWriter" to="/writer/dashboard" class="footer-btn writer-btn">
            前往作家端
          </router-link>
          <router-link v-if="isAdmin" to="/admin/dashboard" class="footer-btn admin-btn">
            前往管理者端
          </router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const isLoggedIn = ref(false)
const userStatus = ref(1)

const isWriter = computed(() => userStatus.value >= 2)
const isAdmin = computed(() => userStatus.value >= 3)
const isReaderPage = computed(() => {
  return route.path.startsWith('/chapter/read/')
})

const checkLoginStatus = () => {
  const token = localStorage.getItem('token')
  const username = localStorage.getItem('username')
  const status = parseInt(localStorage.getItem('userStatus') || '1')

  isLoggedIn.value = !!(token || username)
  userStatus.value = status
}

onMounted(() => {
  checkLoginStatus()
})

watch(() => route.path, () => {
  checkLoginStatus()
})

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('userId')
  localStorage.removeItem('userStatus')
  localStorage.removeItem('userInfo')
  isLoggedIn.value = false
  userStatus.value = 1
  router.push('/login')
}

const getSakuraStyle = (n, side) => {
  const isLeft = side === 'left'
  const left = isLeft ? (Math.random() * 15 + 2) : (Math.random() * 15 + 83)
  const animationDelay = Math.random() * 15
  const animationDuration = 10 + Math.random() * 10
  const size = 10 + Math.random() * 15
  const swayAmount = isLeft ? 30 : -30
  return {
    left: `${left}%`,
    animationDelay: `${animationDelay}s`,
    animationDuration: `${animationDuration}s`,
    width: `${size}px`,
    height: `${size}px`,
    '--sway-amount': `${swayAmount}px`
  }
}
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #f9f4ff 50%, #fff5f8 100%);
}

.sakura-container {
  position: fixed;
  top: 0;
  height: 100%;
  width: 18%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.sakura-left {
  left: 0;
}

.sakura-right {
  right: 0;
}

.sakura {
  position: absolute;
  top: -50px;
  background: linear-gradient(135deg, #ffb7c5 0%, #ff9eb5 100%);
  border-radius: 100% 0 50% 50%;
  opacity: 0.8;
  animation: sakura-fall linear infinite;
  transform: rotate(0deg);
}

.sakura::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: inherit;
  border-radius: inherit;
  transform: rotate(72deg);
  transform-origin: center;
}

.sakura::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: inherit;
  border-radius: inherit;
  transform: rotate(144deg);
  transform-origin: center;
}

@keyframes sakura-fall {
  0% {
    top: -20px;
    transform: translateX(0) rotate(0deg);
    opacity: 0.8;
  }
  25% {
    transform: translateX(var(--sway-amount, 30px)) rotate(90deg);
    opacity: 0.9;
  }
  50% {
    transform: translateX(calc(var(--sway-amount, 30px) * -0.6)) rotate(180deg);
    opacity: 0.7;
  }
  75% {
    transform: translateX(calc(var(--sway-amount, 30px) * 0.8)) rotate(270deg);
    opacity: 0.85;
  }
  100% {
    top: 100vh;
    transform: translateX(calc(var(--sway-amount, 30px) * -0.4)) rotate(360deg);
    opacity: 0;
  }
}

.header {
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
  color: #ffffff;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 10;
  box-shadow: 0 4px 15px rgba(161, 140, 209, 0.3);
}

.header nav {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 800px;
}

.nav-left,
.nav-right {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.header a {
  color: #ffffff;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.1);
}

.header a:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(255, 255, 255, 0.2);
}

.header a.router-link-active {
  background: rgba(255, 255, 255, 0.35);
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.header button {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
  font-weight: 500;
}

.header button:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(255, 255, 255, 0.25);
}

.main {
  flex: 1;
  padding: 0;
  position: relative;
  z-index: 10;
  max-width: 100%;
  width: 100%;
}

.footer {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  text-align: center;
  padding: 2rem;
  position: relative;
  z-index: 10;
  box-shadow: 0 -4px 15px rgba(102, 126, 234, 0.25);
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
}

.footer-text {
  margin: 0;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

.footer-links {
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.4rem;
  border-radius: 25px;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
  border: 2px solid transparent;
}

.footer-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.4);
}

.writer-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #ffffff;
}

.writer-btn:hover {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
}

.admin-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #ffffff;
}

.admin-btn:hover {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
