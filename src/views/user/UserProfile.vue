<template>
  <div class="user-profile-container">
    <h2>个人信息</h2>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="user" class="profile-content">
      <div class="avatar-section">
        <div class="avatar-wrapper">
          <div class="avatar">
            <img v-if="user.avatar" :src="user.avatar + '?t=' + timestamp" alt="头像">
            <div v-else class="avatar-placeholder">{{ user.nickname?.charAt(0) || user.username?.charAt(0) }}</div>
          </div>
          <div class="avatar-overlay">
            <label for="avatar-upload" class="upload-icon" title="更换头像">
            </label>
          </div>
        </div>
        <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            @change="handleAvatarChange"
            style="display: none"
        >
        <div v-if="uploading" class="uploading-tip">
          <span class="loading-spinner"></span>
          上传中...
        </div>

        <div class="avatar-actions">
          <button v-if="user.avatar" @click="removeAvatar" class="action-btn remove-action">
            <span>删除头像</span>
          </button>
          <label for="avatar-upload" class="action-btn upload-action">
            <span>上传新头像</span>
          </label>
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
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '../../api'

const router = useRouter()
const user = ref(null)
const loading = ref(true)
const error = ref('')
const isEditing = ref(false)
const uploading = ref(false)
const timestamp = ref(Date.now())


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

const handleAvatarChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('只支持 JPG、PNG、GIF、WebP 格式的图片')
      return
    }

    // 验证文件大小（最大 5MB）
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('图片大小不能超过 5MB')
      return
    }

    uploading.value = true

    // 创建 FormData 对象
    const formData = new FormData()
    formData.append('userId', user.value.userId)
    formData.append('file', file)

    console.log('上传头像:', formData)
    const response = await userApi.uploadAvatar(formData)

    if (response.data.code === 200 || response.data.message === 'success') {
      const avatarUrl = response.data.data?.avatar || response.data.data
      console.log('头像上传成功，URL:', avatarUrl)

      // 使用 nextTick 确保 DOM 更新
      await nextTick()

      // 更新用户头像，使用时间戳避免缓存
      user.value.avatar = avatarUrl
      timestamp.value = Date.now()

      alert('头像上传成功')

    } else {
      alert(response.data.message || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    if (error.response) {
      const { code, message } = error.response.data
      if (code === 200 && message === 'success') {
        const avatarUrl = error.response.data.data?.avatar || error.response.data.data
        user.value.avatar = avatarUrl
        timestamp.value = Date.now()
        alert('头像上传成功')
        return
      }
      alert(`上传失败：${message || '服务器错误'}`)
    } else if (error.request) {
      alert('上传失败：无法连接到服务器')
    } else {
      alert(`上传失败：${error.message}`)
    }
  } finally {
    uploading.value = false
    // 清空 input，允许重复上传同一文件
    event.target.value = ''
  }
}

const removeAvatar = async () => {
  if (!confirm('确定要删除头像吗？')) return

  try {
    console.log('删除头像，userId:', user.value.userId)

    // 使用专门的删除头像接口
    const response = await userApi.deleteAvatar(user.value.userId)

    console.log('删除头像响应:', response)

    if (response.data.code === 200 || response.data.message === 'success') {
      // 删除成功，更新本地数据
      user.value.avatar = null
      timestamp.value = Date.now()
      alert('✅ 头像已删除')
    } else {
      alert(response.data.message || '删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    if (error.response) {
      console.log('错误响应:', error.response.data)
      const { code, message } = error.response.data
      if (code === 200 && message === 'success') {
        user.value.avatar = null
        timestamp.value = Date.now()
        alert('✅ 头像已删除')
        return
      }
      alert(`删除失败：${message || '服务器错误'}`)
    } else if (error.request) {
      alert('删除失败：无法连接到服务器')
    } else {
      alert(`删除失败：${error.message}`)
    }
  }
}

onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
.avatar-section {
  text-align: center;
  margin-bottom: 2.5rem;
  position: relative;
}

.avatar-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.avatar-wrapper:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  font-size: 3.5rem;
  font-weight: bold;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.upload-icon {
  font-size: 2.5rem;
  filter: grayscale(100%);
  transition: all 0.3s ease;
}

.avatar-wrapper:hover .upload-icon {
  filter: grayscale(0%);
  transform: scale(1.1);
}

.uploading-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  color: #667eea;
  font-size: 0.95rem;
  font-weight: 600;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.avatar-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.action-btn:active {
  transform: translateY(0);
}

.upload-action {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.upload-action:hover {
  background: linear-gradient(135deg, #5568d3 0%, #63408a 100%);
}

.remove-action {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
}

.remove-action:hover {
  background: linear-gradient(135deg, #f55a5a 0%, #d64558 100%);
}

.btn-icon {
  font-size: 1.1rem;
  filter: brightness(0) invert(1);
}


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
