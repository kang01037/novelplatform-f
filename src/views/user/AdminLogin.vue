<template>
  <div class="admin-login-page">
    <div class="snow-bg">
      <div v-for="(flake, index) in snowflakes" :key="index" class="snowflake" :style="getSnowflakeStyle(flake)"></div>
    </div>

    <div class="login-wrapper">
      <div class="form-area">
        <div class="form-container">
          <div class="form-header">
            <div class="admin-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
            <h2 class="form-title">管理员登录</h2>
            <p class="form-subtitle">进入管理后台，维护平台运营</p>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="input-group">
              <label>用户名</label>
              <div class="input-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input type="text" v-model="form.username" placeholder="请输入用户名" required>
              </div>
            </div>

            <div class="input-group">
              <label>密码</label>
              <div class="input-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type="password" v-model="form.password" placeholder="请输入密码" required>
              </div>
            </div>

            <button type="submit" class="submit-btn admin-submit" :disabled="loading">
              {{ loading ? '登录中...' : '登录' }}
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
            <router-link to="/register/admin" class="register-link">注册管理员账户</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userApi } from '../../api'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const snowflakes = ref([])

const form = ref({
  username: '',
  password: ''
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

        const status = parseInt(userInfo.userStatus)
        if (status >= 3) {
          router.push('/admin/dashboard')
        } else {
          alert('您不是管理员，无法进入管理后台')
        }
      }
    } else {
      alert(message || '登录失败')
    }
  } catch (error) {
    if (error.response) {
      const { message } = error.response.data
      alert(message || '登录失败')
    } else {
      alert('无法连接到服务器')
    }
  } finally {
    loading.value = false
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

onMounted(() => {
  snowflakes.value = generateSnowflakes()
})
</script>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  background: linear-gradient(170deg, #0a1628 0%, #0f2847 30%, #143a63 60%, #1a4d80 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 2rem;
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
  width: 100%;
  max-width: 420px;
}

.form-area {
  background: rgba(10,22,40,0.9);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  border: 1px solid rgba(26,182,255,0.2);
  box-shadow: 0 30px 80px rgba(0,0,0,0.5), 0 0 40px rgba(26,182,255,0.1);
  padding: 3rem;
}

.form-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.admin-badge {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #26b6ff 0%, #4fd1c5 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(26,182,255,0.3);
}

.admin-badge svg {
  width: 32px;
  height: 32px;
  color: white;
}

.form-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.5rem;
  background: linear-gradient(135deg, #26b6ff 0%, #4fd1c5 50%, #81e6d9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-subtitle {
  color: rgba(129,230,217,0.5);
  font-size: 0.9rem;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group label {
  display: block;
  font-size: 0.85rem;
  color: rgba(129,230,217,0.7);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper svg {
  position: absolute;
  left: 1rem;
  width: 18px;
  height: 18px;
  color: rgba(129,230,217,0.3);
}

.input-wrapper input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.8rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(26,182,255,0.2);
  border-radius: 12px;
  color: #fff;
  font-size: 0.9rem;
  transition: all 0.3s;
  box-sizing: border-box;
}

.input-wrapper input::placeholder {
  color: rgba(129,230,217,0.25);
}

.input-wrapper input:focus {
  outline: none;
  border-color: rgba(26,182,255,0.5);
  background: rgba(255,255,255,0.08);
  box-shadow: 0 0 0 3px rgba(26,182,255,0.1);
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

.admin-submit {
  background: linear-gradient(135deg, #26b6ff 0%, #4fd1c5 100%);
  box-shadow: 0 4px 15px rgba(26,182,255,0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(26,182,255,0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.form-footer a {
  color: rgba(129,230,217,0.5);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.3s;
}

.form-footer a:hover {
  color: #26b6ff;
}

@media (max-width: 600px) {
  .form-area { padding: 2rem 1.5rem; }
}
</style>
