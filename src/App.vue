<template>
  <div class="app">
    <header class="header">
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
            <router-link to="/writer/dashboard">作家后台</router-link>
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
    </header>
    <main class="main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <footer class="footer">
      <div class="footer-content">
        <p class="footer-text">© 2026 小说平台</p>
        <div class="footer-links">
          <router-link v-if="!isWriter" to="/writer/dashboard" class="footer-btn writer-btn">
            ✍️ 前往作家端
          </router-link>
          <router-link v-if="isAdmin" to="/admin/dashboard" class="footer-btn admin-btn">
            🛡️ 前往管理者端
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
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  background-color: #333;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.header a:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.header a.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

.header button {
  background-color: #555;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.header button:hover {
  background-color: #666;
}

.main {
  flex: 1;
  padding: 2rem;
}

.footer {
  background-color: #333;
  color: white;
  text-align: center;
  padding: 1.5rem;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.footer-text {
  margin: 0;
  font-size: 0.9rem;
}

.footer-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.footer-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.writer-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.writer-btn:hover {
  background: linear-gradient(135deg, #5568d3 0%, #63408a 100%);
}

.admin-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.admin-btn:hover {
  background: linear-gradient(135deg, #d64558 0%, #e84a7a 100%);
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
