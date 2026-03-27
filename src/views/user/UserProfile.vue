<template>
  <div class="user-profile-container">
    <h2>个人信息</h2>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="user" class="profile-content">
      <div class="avatar-section">
        <div class="avatar">
          <img v-if="user.avatar" :src="user.avatar" alt="头像">
          <div v-else class="avatar-placeholder">{{ user.nickname?.charAt(0) || user.username?.charAt(0) }}</div>
        </div>
      </div>

      <div v-if="isEditing" class="edit-form">
        <div class="form-group">
          <label for="nickname">昵称</label>
          <input
              type="text"
              id="nickname"
              v-model="editForm.nickname"
              placeholder="请输入昵称"
          >
        </div>

        <div class="form-group">
          <label for="email">邮箱</label>
          <input
              type="email"
              id="email"
              v-model="editForm.email"
              placeholder="请输入邮箱"
          >
        </div>

        <div class="form-group">
          <label for="phone">手机号</label>
          <input
              type="tel"
              id="phone"
              v-model="editForm.phone"
              placeholder="请输入手机号"
          >
        </div>

        <div class="form-group">
          <label for="gender">性别</label>
          <select id="gender" v-model="editForm.gender">
            <option value="0">保密</option>
            <option value="1">男</option>
            <option value="2">女</option>
          </select>
        </div>

        <div class="form-group">
          <label for="birthday">生日</label>
          <input
              type="date"
              id="birthday"
              v-model="editForm.birthday"
          >
        </div>

        <div class="form-actions">
          <button @click="saveProfile" class="btn btn-save">保存</button>
          <button @click="cancelEdit" class="btn btn-cancel">取消</button>
        </div>
      </div>

      <div v-else class="info-section">
        <div class="info-item">
          <label>用户名：</label>
          <span>{{ user.username }}</span>
        </div>
        <div class="info-item">
          <label>昵称：</label>
          <span>{{ user.nickname || '未设置' }}</span>
        </div>
        <div class="info-item">
          <label>邮箱：</label>
          <span>{{ user.email || '未设置' }}</span>
        </div>
        <div class="info-item">
          <label>手机号：</label>
          <span>{{ user.phone || '未设置' }}</span>
        </div>
        <div class="info-item">
          <label>性别：</label>
          <span>{{ getGenderText(user.gender) }}</span>
        </div>
        <div class="info-item">
          <label>生日：</label>
          <span>{{ user.birthday || '未设置' }}</span>
        </div>
        <div class="info-item">
          <label>登录次数：</label>
          <span>{{ user.loginCount }} 次</span>
        </div>
        <div class="info-item">
          <label>上次登录：</label>
          <span>{{ user.lastLoginTime || '未知' }}</span>
        </div>
        <div class="info-item">
          <label>注册时间：</label>
          <span>{{ user.createdTime }}</span>
        </div>
      </div>

      <div class="action-section">
        <button v-if="!isEditing" @click="startEdit" class="btn btn-edit">编辑资料</button>
        <button @click="handleLogout" class="btn btn-logout">退出登录</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '../../api'

const router = useRouter()
const user = ref(null)
const loading = ref(true)
const error = ref('')
const isEditing = ref(false)

const editForm = reactive({
  nickname: '',
  email: '',
  phone: '',
  gender: 1,
  birthday: ''
})

const getGenderText = (gender) => {
  const genderMap = {
    0: '未知',
    1: '男',
    2: '女'
  }
  return genderMap[gender] || '未知'
}

const loadUserProfile = async () => {
  try {
    loading.value = true
    error.value = ''

    const username = localStorage.getItem('username')

    if (!username) {
      error.value = '未登录，请先登录'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
      return
    }

    const response = await userApi.getUserByUsername(username)

    if (response.data.code === 200) {
      user.value = response.data.data
      // 初始化编辑表单
      initEditForm()
    } else {
      error.value = response.data.message || '获取用户信息失败'
    }
  } catch (err) {
    console.error('获取用户信息失败:', err)
    error.value = '获取用户信息失败，请检查网络连接'
  } finally {
    loading.value = false
  }
}

const initEditForm = () => {
  if (user.value) {
    editForm.nickname = user.value.nickname || ''
    editForm.email = user.value.email || ''
    editForm.phone = user.value.phone || ''
    editForm.gender = user.value.gender || 0
    editForm.birthday = user.value.birthday || ''
  }
}

const startEdit = () => {
  initEditForm()
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  initEditForm()
}

const saveProfile = async () => {
  try {
    // 验证表单
    if (!editForm.email) {
      alert('请输入邮箱')
      return
    }

    const updateData = {
      userId: user.value.userId,
      username: user.value.username,
      nickname: editForm.nickname || null,
      email: editForm.email.trim(),
      phone: editForm.phone.trim() || null,
      gender: parseInt(editForm.gender),
      birthday: editForm.birthday || null
    }

    console.log('更新用户数据:', updateData)
    const response = await userApi.updateUser(updateData)

    if (response.data.code === 200 || response.data.message === 'success') {
      alert('修改成功')
      // 重新加载用户信息
      await loadUserProfile()
      isEditing.value = false
    } else {
      alert(response.data.message || '修改失败')
    }
  } catch (error) {
    console.error('修改失败:', error)

    if (error.response) {
      const { code, message } = error.response.data
      if (code === 200 && message === 'success') {
        alert('修改成功')
        loadUserProfile()
        isEditing.value = false
        return
      }
      alert(`修改失败：${message || '服务器错误'}`)
    } else if (error.request) {
      alert('修改失败：无法连接到服务器')
    } else {
      alert(`修改失败：${error.message}`)
    }
  }
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('userId')
  localStorage.removeItem('userInfo')
  router.push('/login')
}

onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
.user-profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.loading,
.error {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
}

.error {
  color: #f44336;
}

.profile-content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.avatar-section {
  text-align: center;
  margin-bottom: 2rem;
}

.avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #333;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 3rem;
  font-weight: bold;
}

.info-section {
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  width: 100px;
  font-weight: bold;
  color: #666;
}

.info-item span {
  flex: 1;
  color: #333;
}

.edit-form {
  margin-bottom: 2rem;
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #333;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.action-section {
  text-align: center;
  padding-top: 1rem;
  border-top: 2px solid #eee;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit {
  background-color: #2196F3;
  color: white;
}

.btn-edit:hover {
  background-color: #1976D2;
}

.btn-save {
  background-color: #4CAF50;
  color: white;
}

.btn-save:hover {
  background-color: #45a049;
}

.btn-cancel {
  background-color: #9e9e9e;
  color: white;
}

.btn-cancel:hover {
  background-color: #757575;
}

.btn-logout {
  background-color: #f44336;
  color: white;
}

.btn-logout:hover {
  background-color: #d32f2f;
}
</style>
