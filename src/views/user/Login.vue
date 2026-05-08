<template>
  <div class="login-page">
    <!-- 雪花背景 -->
    <div class="snow-bg">
      <div v-for="(flake, index) in snowflakes" :key="index" class="snowflake" :style="getSnowflakeStyle(flake)"></div>
    </div>

    <div class="login-wrapper">
      <!-- 左侧装饰 -->
      <div class="login-deco">
        <div class="deco-content">
          <svg class="deco-snowflake" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <line x1="12" y1="2" x2="12" y2="22"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            <line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/>
            <line x1="12" y1="2" x2="9" y2="6"/>
            <line x1="12" y1="2" x2="15" y2="6"/>
            <line x1="12" y1="22" x2="9" y2="18"/>
            <line x1="12" y1="22" x2="15" y2="18"/>
            <line x1="2" y1="12" x2="6" y2="9"/>
            <line x1="2" y1="12" x2="6" y2="15"/>
            <line x1="22" y1="12" x2="18" y2="9"/>
            <line x1="22" y1="12" x2="18" y2="15"/>
          </svg>
          <h2 class="deco-title">冰雪书阁</h2>
          <p class="deco-subtitle">冬日暖阳，好书相伴</p>
          <div class="deco-dots">
            <span v-for="n in 3" :key="n" class="dot" :class="{ active: n === 1 }"></span>
          </div>
        </div>
      </div>

      <!-- 右侧表单 -->
      <div class="login-form-area">
        <div class="form-container">
          <!-- 角色标签 -->
          <div class="role-badge" :class="roleClass">
            <svg v-if="role === 'reader'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <svg v-else-if="role === 'writer'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span>{{ roleLabel }}</span>
          </div>

          <h2 class="form-title">欢迎回来</h2>
          <p class="form-subtitle">登录您的账户继续阅读之旅</p>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="input-group">
              <div class="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <input type="text" v-model="form.username" placeholder="请输入用户名" required>
            </div>

            <div class="input-group">
              <div class="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <input type="password" v-model="form.password" placeholder="请输入密码" required>
            </div>

            <button type="submit" class="submit-btn" :disabled="loading" :class="roleClass">
              <span v-if="!loading">登录</span>
              <span v-else class="loading-dots">
                <span></span><span></span><span></span>
              </span>
            </button>
          </form>

          <div class="form-footer">
            <router-link to="/" class="back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:16px;height:16px">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              返回首页
            </router-link>
            <span class="divider-line">|</span>
            <router-link :to="registerLink" class="register-link">注册新账户</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userApi } from '../../api'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const role = ref('reader')
const snowflakes = ref([])

const form = ref({ username: '', password: '' })

const roleClass = computed(() => `role-${role.value}`)
const roleLabel = computed(() => {
  const map = { reader: '读者登录', writer: '作者登录', admin: '管理员登录' }
  return map[role.value] || '读者登录'
})
const registerLink = computed(() => {
  if (role.value === 'writer') return '/register/writer'
  if (role.value === 'admin') return '/register/admin'
  return '/register'
})

onMounted(() => {
  if (route.query.role) {
    role.value = route.query.role
  }
  // 页面加载时生成一次雪花数据
  snowflakes.value = generateSnowflakes()
})

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    alert('请输入用户名和密码')
    return
  }
  loading.value = true
  try {
    const response = await userApi.login(form.value)
    const { code, message, data } = response.data
    
    if (code === 200 || message === 'success') {
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('username', form.value.username)
      
      const userInfo = data.userInfo
      if (userInfo) {
        localStorage.setItem('userId', userInfo.userId)
        localStorage.setItem('userStatus', userInfo.userStatus)
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
        localStorage.setItem('loginRole', role.value)

        const status = parseInt(userInfo.userStatus)
        if (role.value === 'admin' && status >= 3) {
          router.push('/admin/dashboard')
        } else if (role.value === 'writer' && status >= 2) {
          router.push('/writer/novels')
        } else {
          router.push('/novel/hot')
        }
      } else {
        router.push('/novel/hot')
      }
    } else {
      alert(message || '登录失败')
    }
  } catch (error) {
    if (error.response) {
      const { data, message } = error.response.data
      if (data && (error.response.data.code === 200 || message === 'success')) {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        localStorage.setItem('username', form.value.username)
        
        const userInfo = data.userInfo
        if (userInfo) {
          localStorage.setItem('userId', userInfo.userId)
          localStorage.setItem('userStatus', userInfo.userStatus)
          localStorage.setItem('userInfo', JSON.stringify(userInfo))
          localStorage.setItem('loginRole', role.value)
          
          const status = parseInt(userInfo.userStatus)
          if (role.value === 'admin' && status >= 3) router.push('/admin/dashboard')
          else if (role.value === 'writer' && status >= 2) router.push('/writer/novels')
          else router.push('/novel/hot')
          return
        }
        router.push('/novel/hot')
        return
      }
      alert(message || '用户名或密码错误')
    } else {
      alert('无法连接到服务器')
    }
  } finally {
    loading.value = false
  }
}

const getUserInfo = async (username) => {
  try {
    const response = await userApi.getUserByUsername(username)
    if (response.data.code === 200 || response.data.message === 'success') {
      return response.data.data
    }
    return null
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

const generateSnowflakes = () => {
  const flakes = []
  for (let n = 0; n < 40; n++) {
    flakes.push({
      left: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 8 + Math.random() * 15,
      size: 3 + Math.random() * 10,
      sway: Math.random() * 60 - 30
    })
  }
  return flakes
}

const getSnowflakeStyle = (flake) => {
  return {
    left: `${flake.left}%`,
    animationDelay: `${flake.delay}s`,
    animationDuration: `${flake.duration}s`,
    width: `${flake.size}px`,
    height: `${flake.size}px`,
    '--sway': `${flake.sway}px`
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(170deg, #0f1923 0%, #1a2a3a 30%, #1e3a4f 60%, #2a4a5f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.snow-bg {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 1;
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

.login-wrapper {
  position: relative;
  z-index: 2;
  display: flex;
  width: 900px;
  max-width: 95vw;
  min-height: 560px;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.08);
}

/* 左侧装饰 */
.login-deco {
  flex: 1;
  background: linear-gradient(135deg, rgba(79,172,254,0.15), rgba(0,242,254,0.05));
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border-right: 1px solid rgba(255,255,255,0.06);
}

.deco-content {
  text-align: center;
  padding: 2rem;
}

.deco-snowflake {
  width: 100px;
  height: 100px;
  color: rgba(168,216,234,0.5);
  animation: gentleSpin 20s linear infinite;
  margin-bottom: 2rem;
}

@keyframes gentleSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.deco-title {
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.5rem;
  letter-spacing: 4px;
}

.deco-subtitle {
  color: rgba(168,216,234,0.6);
  margin: 0 0 2rem;
  font-size: 0.95rem;
}

.deco-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
}

.dot.active {
  background: #4facfe;
  box-shadow: 0 0 10px rgba(79,172,254,0.5);
}

/* 右侧表单 */
.login-form-area {
  flex: 1;
  background: rgba(15,25,35,0.95);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.form-container {
  width: 100%;
  max-width: 360px;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

.role-badge svg { width: 16px; height: 16px; }

.role-badge.role-reader {
  background: rgba(79,172,254,0.15);
  color: #4facfe;
  border: 1px solid rgba(79,172,254,0.3);
}

.role-badge.role-writer {
  background: rgba(161,140,209,0.15);
  color: #a18cd1;
  border: 1px solid rgba(161,140,209,0.3);
}

.role-badge.role-admin {
  background: rgba(240,147,251,0.15);
  color: #f093fb;
  border: 1px solid rgba(240,147,251,0.3);
}

.form-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.5rem;
}

.form-subtitle {
  font-size: 0.9rem;
  color: rgba(168,216,234,0.5);
  margin: 0 0 2.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  width: 20px;
  height: 20px;
  color: rgba(168,216,234,0.4);
  z-index: 1;
}

.input-icon svg { width: 20px; height: 20px; }

.input-group input {
  width: 100%;
  padding: 0.9rem 1rem 0.9rem 3rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s;
  box-sizing: border-box;
}

.input-group input::placeholder {
  color: rgba(168,216,234,0.3);
}

.input-group input:focus {
  outline: none;
  border-color: rgba(79,172,254,0.5);
  background: rgba(255,255,255,0.08);
  box-shadow: 0 0 0 3px rgba(79,172,254,0.1);
}

.submit-btn {
  padding: 0.9rem;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 0.5rem;
}

.submit-btn.role-reader {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 4px 15px rgba(79,172,254,0.3);
}

.submit-btn.role-writer {
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
  box-shadow: 0 4px 15px rgba(161,140,209,0.3);
}

.submit-btn.role-admin {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4px 15px rgba(240,147,251,0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79,172,254,0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.8);
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  font-size: 0.85rem;
}

.form-footer a {
  color: rgba(168,216,234,0.6);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: color 0.3s;
}

.form-footer a:hover { color: #4facfe; }

.divider-line { color: rgba(255,255,255,0.15); }

@media (max-width: 768px) {
  .login-wrapper {
    flex-direction: column;
    min-height: auto;
  }

  .login-deco {
    padding: 2rem;
    border-right: none;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .deco-snowflake {
    width: 60px;
    height: 60px;
    margin-bottom: 1rem;
  }

  .deco-title { font-size: 1.5rem; }

  .login-form-area { padding: 2rem; }
}
</style>
