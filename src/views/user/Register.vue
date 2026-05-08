<template>
  <div class="register-page">
    <div class="snow-bg">
      <div v-for="n in 40" :key="n" class="snowflake" :style="getSnowflakeStyle(n)"></div>
    </div>

    <div class="register-wrapper">
      <div class="form-area">
        <div class="form-container">
          <div class="form-header">
            <h2 class="form-title">创建账户</h2>
            <p class="form-subtitle">加入冰雪书阁，开启阅读之旅</p>
          </div>

          <form @submit.prevent="handleRegister" class="register-form">
            <div class="form-row">
              <div class="input-group">
                <label>用户名</label>
                <div class="input-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input type="text" v-model="form.username" placeholder="请输入用户名" required>
                </div>
              </div>
              <div class="input-group">
                <label>昵称</label>
                <div class="input-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input type="text" v-model="form.nickname" placeholder="请输入昵称">
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="input-group">
                <label>密码</label>
                <div class="input-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type="password" v-model="form.password" placeholder="请输入密码" required>
                </div>
              </div>
              <div class="input-group">
                <label>确认密码</label>
                <div class="input-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type="password" v-model="form.confirmPassword" placeholder="再次输入密码" required>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="input-group">
                <label>邮箱</label>
                <div class="input-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <input type="email" v-model="form.email" placeholder="请输入邮箱">
                </div>
              </div>
              <div class="input-group">
                <label>手机号</label>
                <div class="input-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <input type="tel" v-model="form.phone" placeholder="请输入手机号">
                </div>
              </div>
            </div>

            <button type="submit" class="submit-btn" :disabled="loading">
              {{ loading ? '注册中...' : '注册' }}
            </button>
          </form>

          <div class="form-footer">
            <router-link to="/login" class="login-link">已有账户？去登录</router-link>
            <router-link to="/" class="back-link">返回首页</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '../../api'

const router = useRouter()
const loading = ref(false)
const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  nickname: '',
  gender: 1,
  birthday: ''
})

const handleRegister = async () => {
  if (!form.value.username || !form.value.password) {
    alert('请输入用户名和密码')
    return
  }
  if (form.value.password !== form.value.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }
  loading.value = true
  try {
    const registerData = {
      username: form.value.username,
      password: form.value.password,
      email: form.value.email || null,
      phone: form.value.phone || null,
      nickname: form.value.nickname || null,
      gender: form.value.gender,
      birthday: form.value.birthday || null
    }
    const response = await userApi.register(registerData)
    const { code, message } = response.data
    if (code === 200 || message === 'success' || message === '注册成功') {
      alert('注册成功，请登录')
      router.push('/login')
    } else {
      alert(message || '注册失败')
    }
  } catch (error) {
    if (error.response) {
      const { code, message } = error.response.data
      if (code === 200 || message === 'success' || message === '注册成功') {
        alert('注册成功，请登录')
        router.push('/login')
        return
      }
      alert(message || '注册失败')
    } else {
      alert('无法连接到服务器')
    }
  } finally {
    loading.value = false
  }
}

const getSnowflakeStyle = (n) => {
  const left = Math.random() * 100
  const delay = Math.random() * 15
  const duration = 8 + Math.random() * 15
  const size = 3 + Math.random() * 10
  const sway = Math.random() * 60 - 30
  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    width: `${size}px`,
    height: `${size}px`,
    '--sway': `${sway}px`
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(170deg, #0f1923 0%, #1a2a3a 30%, #1e3a4f 60%, #2a4a5f 100%);
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

.register-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 700px;
}

.form-area {
  background: rgba(15,25,35,0.9);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 30px 80px rgba(0,0,0,0.4);
  padding: 3rem;
}

.form-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.form-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.5rem;
}

.form-subtitle {
  color: rgba(168,216,234,0.5);
  font-size: 0.9rem;
  margin: 0;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
}

.input-group label {
  display: block;
  font-size: 0.85rem;
  color: rgba(168,216,234,0.7);
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
  color: rgba(168,216,234,0.3);
}

.input-wrapper input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.8rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 0.9rem;
  transition: all 0.3s;
  box-sizing: border-box;
}

.input-wrapper input::placeholder { color: rgba(168,216,234,0.25); }

.input-wrapper input:focus {
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
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 4px 15px rgba(79,172,254,0.3);
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79,172,254,0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.form-footer a {
  color: rgba(168,216,234,0.5);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.3s;
}

.form-footer a:hover { color: #4facfe; }

@media (max-width: 600px) {
  .form-row { grid-template-columns: 1fr; }
  .form-area { padding: 2rem 1.5rem; }
}
</style>
