<template>
  <div class="app-container">
    <!-- 飘雪背景层 -->
    <div class="snow-bg">
      <div
          v-for="n in 30"
          :key="n"
          class="snowflake"
          :style="getSnowflakeStyle(n)"
      ></div>
    </div>

    <!-- 头部导航 -->
    <header class="app-header glass-effect" v-if="!isReaderPage && !isAdmin && !isLandingPage">
      <div class="header-inner">
        <!-- Logo 区域 -->
        <div class="logo-section">
          <router-link to="/" class="logo-link">
            <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span class="logo-text">NovelHub</span>
          </router-link>
        </div>

        <!-- 导航菜单 -->
        <nav class="nav-menu">
          <div class="nav-links">
            <!-- 普通用户菜单 -->
            <template v-if="!isWriter">
              <router-link to="/novel/hot" class="nav-item">
                <svg-icon name="fire" />
                <span>热门推荐</span>
              </router-link>
              <router-link to="/novel/list" class="nav-item">
                <svg-icon name="book" />
                <span>书库</span>
              </router-link>
              <router-link to="/bookshelf" class="nav-item">
                <svg-icon name="bookmark" />
                <span>我的书架</span>
              </router-link>
              <router-link to="/novel/completed" class="nav-item">
                <svg-icon name="check-circle" />
                <span>完本精选</span>
              </router-link>
              <router-link to="/novel/category" class="nav-item">
                <svg-icon name="grid" />
                <span>分类浏览</span>
              </router-link>
            </template>

            <!-- 作家菜单 -->
            <template v-else>
              <router-link to="/writer/novels" class="nav-item">
                <svg-icon name="edit" />
                <span>作品管理</span>
              </router-link>
              <router-link to="/writer/novel/create" class="nav-item">
                <svg-icon name="plus" />
                <span>创建新作</span>
              </router-link>
            </template>
          </div>
        </nav>

        <!-- 用户操作区 -->
        <div class="user-actions">
          <template v-if="!isLoggedIn">
            <router-link to="/login" class="btn-ghost">登录</router-link>
            <router-link to="/register" class="btn-primary">注册</router-link>
          </template>

          <template v-else>
            <div class="user-dropdown" @click="toggleDropdown">
              <div class="user-avatar">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div class="dropdown-menu" v-if="showDropdown">
                <router-link to="/user/profile" class="dropdown-item">
                  <svg-icon name="user" /> 个人中心
                </router-link>
                <router-link to="/user/comments" class="dropdown-item">
                  <svg-icon name="message-square" /> 我的评论
                </router-link>
                <div class="dropdown-divider"></div>
                <button @click.prevent="logout" class="dropdown-item text-red">
                  <svg-icon name="logout" /> 退出登录
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 底部 -->
    <footer class="app-footer glass-effect-dark" v-if="!isReaderPage && !isLandingPage">
      <div class="footer-inner">
        <p class="copyright">© 2026 NovelHub. All rights reserved.</p>
        <div class="footer-actions">
          <router-link
              v-if="!isWriter"
              to="/register/writer"
              class="fancy-btn writer-btn"
          >
            <span class="btn-content">
              <svg-icon name="pen" /> 成为作家
            </span>
          </router-link>

          <router-link
              v-if="isAdmin"
              to="/admin/dashboard"
              class="fancy-btn admin-btn"
          >
            <span class="btn-content">
              <svg-icon name="cog" /> 管理后台
            </span>
          </router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authApi } from './api'

const router = useRouter()
const route = useRoute()
const isLoggedIn = ref(false)
const userStatus = ref(1)
const showDropdown = ref(false)

// 计算属性
const isWriter = computed(() => userStatus.value >= 2)
const isAdmin = computed(() => userStatus.value >= 3)
const isReaderPage = computed(() => route.path.startsWith('/chapter/read/'))
const isLandingPage = computed(() => route.path === '/')

// 简单的 SVG 图标组件替代方案
const svgIcon = {
  props: ['name'],
  template: `
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <template v-if="name === 'fire'">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
      </template>
      <template v-else-if="name === 'book'">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </template>
      <template v-else-if="name === 'bookmark'">
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
      </template>
      <template v-else-if="name === 'edit'">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </template>
      <template v-else-if="name === 'plus'">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </template>
      <template v-else-if="name === 'user'">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </template>
      <template v-else-if="name === 'check-circle'">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </template>
      <template v-else-if="name === 'grid'">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </template>
      <template v-else-if="name === 'message-square'">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </template>
      <template v-else-if="name === 'logout'">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
      </template>
      <template v-else-if="name === 'pen'">
        <path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/>
      </template>
      <template v-else-if="name === 'cog'">
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </template>
    </svg>
  `
}

// 检查登录状态
const checkLoginStatus = () => {
  const accessToken = localStorage.getItem('accessToken')
  const username = localStorage.getItem('username')
  const status = parseInt(localStorage.getItem('userStatus') || '1')
  isLoggedIn.value = !!(accessToken || username)
  userStatus.value = status
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken')
  if (refreshToken) {
    try {
      await authApi.logout(refreshToken)
    } catch (e) {
      // 忽略服务端注销失败
    }
  }
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('username')
  localStorage.removeItem('userId')
  localStorage.removeItem('userStatus')
  localStorage.removeItem('userInfo')
  isLoggedIn.value = false
  userStatus.value = 1
  showDropdown.value = false
  router.push('/login')
}

// 雪花样式生成
const getSnowflakeStyle = (n) => {
  const left = Math.random() * 100
  const delay = Math.random() * 15
  const duration = 10 + Math.random() * 20
  const size = 3 + Math.random() * 10
  const sway = Math.random() * 100 - 50

  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    width: `${size}px`,
    height: `${size}px`,
    '--sway': `${sway}px`
  }
}

onMounted(() => {
  checkLoginStatus()
  // 点击外部关闭下拉菜单
  window.addEventListener('click', (e) => {
    if (!e.target.closest('.user-dropdown')) {
      showDropdown.value = false
    }
  })
})

watch(() => route.path, () => {
  checkLoginStatus()
})
</script>

<style scoped>
/* --- 基础布局 --- */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  background: linear-gradient(170deg, #0f1923 0%, #1a2a3a 30%, #1e3a4f 60%, #2a4a5f 100%);
  overflow-x: hidden;
}

/* --- 雪花背景 --- */
.snow-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.snowflake {
  position: absolute;
  top: -20px;
  background: radial-gradient(circle, #fff 0%, rgba(255,255,255,0.5) 50%, transparent 100%);
  border-radius: 50%;
  opacity: 0;
  animation: snowfall linear infinite;
}

@keyframes snowfall {
  0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.8; }
  90% { opacity: 0.4; }
  100% { transform: translateY(110vh) translateX(var(--sway, 20px)) rotate(360deg); opacity: 0; }
}

/* --- 玻璃拟态效果 --- */
.glass-effect {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
}

.glass-effect-dark {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.7);
}

/* --- 头部样式 --- */
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 70px;
  padding: 0 5%;
}

.header-inner {
  max-width: 1400px;
  height: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: #4facfe;
  margin-right: 10px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

/* --- 导航菜单 --- */
.nav-menu {
  flex: 1;
  display: flex;
  justify-content: center;
  height: 100%;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: rgba(168, 216, 234, 0.6);
  text-decoration: none;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-item .icon {
  width: 18px;
  height: 18px;
  margin-right: 6px;
  color: rgba(168, 216, 234, 0.4);
  transition: color 0.3s;
}

.nav-item:hover {
  color: #4facfe;
  background: rgba(79, 172, 254, 0.1);
}

.nav-item:hover .icon {
  color: #4facfe;
}

.nav-item.router-link-active {
  color: #4facfe;
  background: rgba(79, 172, 254, 0.12);
}

.nav-item.router-link-active .icon {
  color: #4facfe;
}

/* --- 用户操作区 --- */
.user-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-ghost {
  padding: 0.5rem 1.2rem;
  color: #4facfe;
  text-decoration: none;
  font-weight: 600;
  border-radius: 6px;
  transition: background 0.2s;
}

.btn-ghost:hover { background: rgba(79, 172, 254, 0.1); }

.btn-primary {
  padding: 0.5rem 1.2rem;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  text-decoration: none;
  font-weight: 600;
  border-radius: 6px;
  box-shadow: 0 4px 14px rgba(79, 172, 254, 0.25);
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.35);
}

/* 用户下拉菜单 */
.user-dropdown {
  position: relative;
  cursor: pointer;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.user-avatar:hover { transform: scale(1.05); }

.user-avatar svg {
  width: 24px;
  height: 24px;
}

.dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0;
  width: 180px;
  background: rgba(15, 25, 35, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 200;
  animation: fadeIn 0.2s ease;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: background 0.2s;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
}

.dropdown-item:hover { background: rgba(255, 255, 255, 0.06); }
.dropdown-item.text-red { color: #ff6b81; }
.dropdown-item .icon { width: 16px; height: 16px; margin-right: 8px; color: rgba(168, 216, 234, 0.4); }
.dropdown-divider { height: 1px; background: rgba(255, 255, 255, 0.08); margin: 5px 0; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* --- 主内容区 --- */
.main-content {
  flex: 1;
  position: relative;
  z-index: 1;
  padding: 2rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

/* --- 底部样式 --- */
.app-footer {
  margin-top: auto;
  padding: 1.5rem 5%;
  position: relative;
  z-index: 10;
}

.footer-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  font-size: 0.9rem;
  opacity: 0.6;
  letter-spacing: 0.5px;
}

.footer-actions {
  display: flex;
  gap: 1rem;
}

.fancy-btn {
  text-decoration: none;
  padding: 0.6rem 1.5rem;
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.writer-btn {
  background: rgba(79, 172, 254, 0.1);
  border: 1px solid rgba(79, 172, 254, 0.3);
  color: #4facfe;
}

.writer-btn:hover {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.3);
  border-color: transparent;
}

.admin-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);
}

.admin-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

/* --- 过渡动画 --- */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
