<template>
  <div class="register-container">
    <h2>用户注册</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" id="username" v-model="form.username" required>
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" id="password" v-model="form.password" required>
      </div>
      <div class="form-group">
        <label for="email">邮箱</label>
        <input type="email" id="email" v-model="form.email" required>
      </div>
      <div class="form-group">
        <label for="phone">手机号</label>
        <input type="tel" id="phone" v-model="form.phone" required>
      </div>
      <button type="submit" class="btn">注册</button>
      <p class="login-link">已有账号？<router-link to="/login">立即登录</router-link></p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '../../api'

const router = useRouter()
const form = ref({
  username: '',
  password: '',
  email: '',
  phone: '',
  avatar: '',
  nickname: '',
  gender: 1,
  birthday: ''
})

const handleRegister = async () => {
  try {
    console.log('注册请求数据:', form.value)
    const response = await userApi.register(form.value)
    console.log('注册响应:', response)
    // 检查响应数据中的code字段
    if (response.data.code === 200 || response.data.message === 'success' || response.data.data === '注册成功') {
      alert('注册成功，请登录')
      router.push('/login')
    } else {
      alert(`注册失败: ${response.data.message}`)
    }
  } catch (error) {
    console.error('注册失败:', error)
    if (error.response) {
      console.error('错误响应:', error.response)
      // 即使是错误状态码，也要检查响应体中的成功信息
      if (error.response.data?.code === 200 || error.response.data?.message === 'success' || error.response.data?.data === '注册成功') {
        alert('注册成功，请登录')
        router.push('/login')
      } else {
        alert(`注册失败: ${error.response.data?.message || '服务器错误'}`)
      }
    } else if (error.request) {
      console.error('请求发送失败:', error.request)
      alert('注册失败: 无法连接到服务器')
    } else {
      alert(`注册失败: ${error.message}`)
    }
  }
}
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.btn {
  width: 100%;
  padding: 0.8rem;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #555;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
}

.login-link a {
  color: #333;
  text-decoration: none;
  font-weight: bold;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>