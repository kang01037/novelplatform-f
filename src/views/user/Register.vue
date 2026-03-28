<template>
  <div class="register-container">
    <h2>用户注册</h2>
    <div class="register-form">
      <div class="form-group">
        <label for="username">用户名</label>
        <input
            type="text"
            id="username"
            v-model="registerForm.username"
            placeholder="请输入用户名"
            required
        >
      </div>

      <div class="form-group">
        <label for="password">密码</label>
        <input
            type="password"
            id="password"
            v-model="registerForm.password"
            placeholder="请输入密码"
            required
        >
      </div>

      <div class="form-group">
        <label for="confirmPassword">确认密码</label>
        <input
            type="password"
            id="confirmPassword"
            v-model="registerForm.confirmPassword"
            placeholder="请再次输入密码"
            required
        >
      </div>

      <div class="form-group">
        <label for="email">邮箱</label>
        <input
            type="email"
            id="email"
            v-model="registerForm.email"
            placeholder="请输入邮箱"
        >
      </div>

      <div class="form-group">
        <label for="phone">手机号</label>
        <input
            type="tel"
            id="phone"
            v-model="registerForm.phone"
            placeholder="请输入手机号"
        >
      </div>

      <div class="form-group">
        <label for="nickname">昵称</label>
        <input
            type="text"
            id="nickname"
            v-model="registerForm.nickname"
            placeholder="请输入昵称"
        >
      </div>

      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" v-model="registerForm.isWriter">
          <span>注册为作家（发布小说）</span>
        </label>
      </div>

      <div class="form-actions">
        <button @click="handleRegister" class="btn-register">注册</button>
        <button @click="goToLogin" class="btn-login">去登录</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '../../api'

const router = useRouter()

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  nickname: '',
  gender: 1,
  birthday: '',
  isWriter: false  // 是否注册为作家
})

const handleRegister = async () => {
  // 验证表单
  if (!registerForm.username || !registerForm.password) {
    alert('请输入用户名和密码')
    return
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }

  try {
    const registerData = {
      username: registerForm.username,
      password: registerForm.password,
      email: registerForm.email || null,
      phone: registerForm.phone || null,
      nickname: registerForm.nickname || null,
      gender: registerForm.gender,
      birthday: registerForm.birthday || null,
      userStatus: registerForm.isWriter ? 2 : 1  // 作家：2，普通用户：1
    }

    console.log('注册数据:', registerData)
    const response = await userApi.register(registerData)

    if (response.data.code === 200 || response.data.message === 'success') {
      alert('注册成功，请登录')
      router.push('/login')
    } else {
      alert(response.data.message || '注册失败')
    }
  } catch (error) {
    console.error('注册失败:', error)
    if (error.response) {
      const { code, message } = error.response.data
      if (code === 200 && message === 'success') {
        alert('注册成功，请登录')
        router.push('/login')
        return
      }
      alert(`注册失败：${message || '服务器错误'}`)
    } else if (error.request) {
      alert('注册失败：无法连接到服务器')
    } else {
      alert(`注册失败：${error.message}`)
    }
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.register-form {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #333;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.checkbox-label span {
  color: #333;
  font-weight: normal;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-register,
.btn-login {
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-register {
  background-color: #4CAF50;
  color: white;
}

.btn-register:hover {
  background-color: #45a049;
}

.btn-login {
  background-color: #2196F3;
  color: white;
}

.btn-login:hover {
  background-color: #1976D2;
}
</style>
