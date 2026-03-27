<template>
  <div class="login-container">
    <h2>用户登录</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" id="username" v-model="form.username" placeholder="请输入用户名" required>
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" id="password" v-model="form.password" placeholder="请输入密码" required>
      </div>
      <button type="submit" class="btn" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
      <p class="register-link">还没有账号？<router-link to="/register">立即注册</router-link></p>
    </form>
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
  password: ''
})

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    alert('请输入用户名和密码')
    return
  }

  loading.value = true

  try {
    console.log('登录请求数据:', form.value)
    const response = await userApi.login(form.value)
    console.log('登录响应:', response)

    const { code, message, data } = response.data

    // 判断登录是否成功
    if (code === 200 || message === 'success') {
      // 登录成功后，再查询用户信息
      try {
        const userInfoResponse = await userApi.getUserByUsername(form.value.username)
        console.log('用户信息响应:', userInfoResponse)

        if (userInfoResponse.data.code === 200 && userInfoResponse.data.data) {
          const userInfo = userInfoResponse.data.data

          // 保存用户信息到 localStorage
          localStorage.setItem('userId', userInfo.userId)
          localStorage.setItem('username', userInfo.username)
          localStorage.setItem('userInfo', JSON.stringify(userInfo))

          if (userInfo.token) {
            localStorage.setItem('token', userInfo.token)
          }

          alert('登录成功')
          router.push('/')
        } else {
          // 如果查询失败，至少保存用户名
          localStorage.setItem('username', form.value.username)
          alert('登录成功')
          router.push('/')
        }
      } catch (queryError) {
        console.error('查询用户信息失败:', queryError)
        // 即使查询失败，也保存用户名，保证能跳转到个人中心
        localStorage.setItem('username', form.value.username)
        alert('登录成功')
        router.push('/')
      }
    } else {
      alert(message || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)

    if (error.response) {
      console.error('错误响应:', error.response)
      const { code, message } = error.response.data

      if (code === 200 && message === 'success') {
        // 登录成功但 HTTP 状态码错误，也保存用户名
        localStorage.setItem('username', form.value.username)
        alert('登录成功')
        router.push('/')
        return
      }

      alert(`登录失败：${message || '用户名或密码错误'}`)
    } else if (error.request) {
      console.error('请求发送失败:', error.request)
      alert('登录失败：无法连接到服务器，请检查网络')
    } else {
      alert(`登录失败：${error.message}`)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #333;
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

.btn:hover:not(:disabled) {
  background-color: #555;
}

.btn:disabled {
  background-color: #999;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.register-link a {
  color: #333;
  text-decoration: none;
  font-weight: bold;
}

.register-link a:hover {
  text-decoration: underline;
  color: #555;
}
</style>
