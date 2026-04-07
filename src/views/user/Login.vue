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

    <!-- 角色选择弹窗 -->
    <div v-if="showRoleSelect" class="role-select-modal">
      <div class="modal-content">
        <h3>欢迎回来，{{ form.username }}！</h3>
        <p>请选择您要进入的页面：</p>
        <div class="role-options">
          <button @click="selectRole('home')" class="role-btn home-btn">
            🏠 首页
          </button>
          <button v-if="userStatus === 2" @click="selectRole('writer')" class="role-btn writer-btn">
            ✍️ 作家后台
          </button>
          <button v-if="userStatus >= 3" @click="selectRole('admin')" class="role-btn admin-btn">
            🛡️ 管理后台
          </button>
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
const showRoleSelect = ref(false)
const userStatus = ref(1)
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
    if (code === 200 && data) {
      // 后端返回结构：data = { userInfo: {...}, token: "..." }

      // 1. 保存 token
      if (data.token) {
        localStorage.setItem('token', data.token)
        console.log('Token 已保存:', data.token)
      }

      // 2. 保存用户信息
      if (data.userInfo) {
        const userInfo = data.userInfo

        localStorage.setItem('userId', userInfo.userId)
        localStorage.setItem('username', userInfo.username)
        localStorage.setItem('userStatus', userInfo.userStatus)
        localStorage.setItem('userInfo', JSON.stringify(userInfo))

        console.log('用户信息已保存:', userInfo)

        // 3. 根据用户角色跳转
        const status = parseInt(userInfo.userStatus)
        alert('登录成功')

        if (status >= 3) {
          router.push('/admin/dashboard')
        } else if (status === 2) {
          router.push('/writer/novels')
        } else {
          router.push('/')
        }
      } else {
        alert('登录成功，但未返回用户信息')
        router.push('/')
      }
    } else {
      alert(message || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)

    // 处理 HTTP 错误响应
    if (error.response) {
      const { data, status } = error.response
      console.error('错误响应:', data, status)

      // 兼容后端返回 HTTP 错误但业务成功的情况
      if (data && data.code === 200 && data.data) {
        const responseData = data.data

        // 保存 token
        if (responseData.token) {
          localStorage.setItem('token', responseData.token)
        }

        // 保存用户信息
        if (responseData.userInfo) {
          const userInfo = responseData.userInfo
          localStorage.setItem('userId', userInfo.userId)
          localStorage.setItem('username', userInfo.username)
          localStorage.setItem('userStatus', userInfo.userStatus)
          localStorage.setItem('userInfo', JSON.stringify(userInfo))

          const status = parseInt(userInfo.userStatus)
          alert('登录成功')

          if (status >= 3) {
            router.push('/admin/dashboard')
          } else if (status === 2) {
            router.push('/writer/novels')
          } else {
            router.push('/')
          }
          return
        }

        alert('登录成功，但未返回用户信息')
        router.push('/')
        return
      }

      const errorMsg = data?.message || '用户名或密码错误'
      alert(`登录失败：${errorMsg}`)
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

// 角色选择（预留功能）
const selectRole = (role) => {
  showRoleSelect.value = false
  switch(role) {
    case 'home':
      router.push('/')
      break
    case 'writer':
      router.push('/writer/novels')
      break
    case 'admin':
      router.push('/admin/dashboard')
      break
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
  position: relative;
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

/* 角色选择弹窗样式 */
.role-select-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 400px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.5rem;
}

.modal-content p {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.role-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.role-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.home-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.home-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.writer-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.writer-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(245, 87, 108, 0.4);
}

.admin-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.admin-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4);
}
</style>
