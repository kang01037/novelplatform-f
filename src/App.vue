<template>
  <div class="app">
    <header class="header">
      <h1><router-link to="/">小说平台</router-link></h1>
      <nav>
        <div class="nav-left">
          <router-link to="/novel/hot">热门小说</router-link>
          <router-link to="/novel/list">小说列表</router-link>
          <router-link to="/bookshelf">我的书架</router-link>
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
      <p>© 2026 小说平台</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const isLoggedIn = ref(false)

const checkLoginStatus = () => {
  const token = localStorage.getItem('token')
  const username = localStorage.getItem('username')
  isLoggedIn.value = !!(token || username)
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
  localStorage.removeItem('userInfo')
  isLoggedIn.value = false
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
  padding: 1rem;
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
