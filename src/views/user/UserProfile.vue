<template>
  <div class="profile-page-wrapper">
    <div class="profile-card glass-card">
      <!-- 头部背景装饰 -->
      <div class="card-header-bg"></div>

      <!-- 头像区域 -->
      <div class="avatar-section">
        <div class="avatar-container">
          <div class="avatar-ring">
            <div class="avatar">
              <img v-if="user.avatar" :src="user.avatar + '?t=' + timestamp" alt="头像">
              <div v-else class="avatar-placeholder">
                <span>{{ user.nickname?.charAt(0) || user.username?.charAt(0) || 'U' }}</span>
              </div>
            </div>

            <!-- 悬浮上传遮罩 -->
            <div class="avatar-overlay" @click="triggerUpload">
              <svg v-if="!uploading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              <div v-else class="spinner"></div>
            </div>
          </div>

          <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              @change="handleAvatarChange"
              style="display: none"
          >
        </div>

        <h2 class="username-title">{{ user.nickname || user.username || '用户' }}</h2>
        <p class="user-role">{{ getRoleText() }}</p>

        <div class="avatar-actions">
          <label for="avatar-upload" class="action-btn primary-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            更换头像
          </label>
          <button v-if="user.avatar" @click="removeAvatar" class="action-btn danger-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            删除
          </button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-body">
        <!-- 加载与错误状态 -->
        <div v-if="loading" class="state-container">
          <div class="spinner large"></div>
          <p>加载个人信息...</p>
        </div>
        <div v-else-if="error" class="state-container error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p>{{ error }}</p>
        </div>

        <!-- 编辑表单 -->
        <div v-else-if="isEditing" class="edit-form">
          <div class="form-grid">
            <div class="form-group">
              <label>昵称</label>
              <div class="input-wrapper">
                <input type="text" v-model="editForm.nickname" placeholder="设置一个昵称吧">
              </div>
            </div>
            <div class="form-group">
              <label>性别</label>
              <div class="input-wrapper select-wrapper">
                <select v-model="editForm.gender">
                  <option value="0">保密</option>
                  <option value="1">男</option>
                  <option value="2">女</option>
                </select>
              </div>
            </div>
            <div class="form-group full-width">
              <label>邮箱</label>
              <div class="input-wrapper">
                <input type="email" v-model="editForm.email" placeholder="example@mail.com">
              </div>
            </div>
            <div class="form-group full-width">
              <label>手机号</label>
              <div class="input-wrapper">
                <input type="tel" v-model="editForm.phone" placeholder="可选">
              </div>
            </div>
            <div class="form-group full-width">
              <label>生日</label>
              <div class="input-wrapper">
                <input type="date" v-model="editForm.birthday">
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button @click="saveProfile" class="btn save-btn">保存修改</button>
            <button @click="cancelEdit" class="btn cancel-btn">取消</button>
          </div>
        </div>

        <!-- 信息展示 -->
        <div v-else class="info-display">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div class="info-content">
                <span class="info-label">用户名</span>
                <span class="info-value">{{ user.username }}</span>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div class="info-content">
                <span class="info-label">邮箱</span>
                <span class="info-value">{{ user.email || '未绑定' }}</span>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div class="info-content">
                <span class="info-label">手机号</span>
                <span class="info-value">{{ user.phone || '未绑定' }}</span>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              </div>
              <div class="info-content">
                <span class="info-label">性别</span>
                <span class="info-value">{{ getGenderText(user.gender) }}</span>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div class="info-content">
                <span class="info-label">生日</span>
                <span class="info-value">{{ user.birthday || '未设置' }}</span>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div class="info-content">
                <span class="info-label">注册时间</span>
                <span class="info-value">{{ user.createdTime }}</span>
              </div>
            </div>
          </div>

          <div class="action-footer">
            <button @click="startEdit" class="btn edit-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              编辑资料
            </button>
            <button @click="handleLogout" class="btn logout-btn">退出登录</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '../../api' // 假设您保留了原有的 API 引入方式

const router = useRouter()
const user = ref({ username: 'Guest', nickname: '', avatar: '' }) // 初始化默认值防止报错
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

// 辅助函数
const getGenderText = (gender) => {
  const map = { 0: '保密', 1: '男', 2: '女' }
  return map[gender] || '保密'
}

const getRoleText = () => {
  // 简单的示例，您可以根据实际逻辑修改
  return '普通会员'
}

const triggerUpload = () => {
  document.getElementById('avatar-upload').click()
}

// --- 业务逻辑保持不变 ---

const loadUserProfile = async () => {
  try {
    loading.value = true
    error.value = ''
    const username = localStorage.getItem('username')
    if (!username) {
      error.value = '未登录，请先登录'
      setTimeout(() => router.push('/login'), 2000)
      return
    }
    const response = await userApi.getUserByUsername(username)
    const { code, message, data } = response.data
    if (code === 200 || message === 'success') {
      user.value = data
      initEditForm()
    } else {
      error.value = message || '获取用户信息失败'
    }
  } catch (err) {
    console.error(err)
    error.value = '获取用户信息失败'
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

const startEdit = () => { initEditForm(); isEditing.value = true }
const cancelEdit = () => { isEditing.value = false; initEditForm() }

const saveProfile = async () => {
  try {
    if (!editForm.email) { alert('请输入邮箱'); return }
    const updateData = {
      userId: user.value.userId,
      username: user.value.username,
      nickname: editForm.nickname || null,
      email: editForm.email.trim(),
      phone: editForm.phone.trim() || null,
      gender: parseInt(editForm.gender),
      birthday: editForm.birthday || null
    }
    const response = await userApi.updateUser(updateData)
    const { code, message } = response.data
    if (code === 200 || message === 'success' || message === '更新成功') {
      alert('修改成功')
      await loadUserProfile()
      isEditing.value = false
    } else { 
      alert(message || '修改失败') 
    }
  } catch (error) {
    console.error(error)
    alert('修改失败，请检查网络')
  }
}

const handleLogout = () => {
  localStorage.clear()
  router.push('/login')
}

const handleAvatarChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
    alert('格式不支持'); return
  }
  if (file.size > 5 * 1024 * 1024) {
    alert('图片不能超过5MB'); return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('userId', user.value.userId)
    formData.append('file', file)
    const response = await userApi.uploadAvatar(formData)
    const { code, message, data } = response.data

    if (code === 200 || message === 'success') {
      const avatarUrl = data?.avatar || data
      user.value.avatar = avatarUrl
      timestamp.value = Date.now()
      alert('上传成功')
    } else {
      alert(message || '上传失败')
    }
  } catch (err) {
    console.error(err)
    alert('上传失败')
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}

const removeAvatar = async () => {
  if (!confirm('确定删除头像？')) return
  try {
    const response = await userApi.deleteAvatar(user.value.userId)
    const { code, message } = response.data
    if (code === 200 || message === 'success' || message === '删除成功') {
      user.value.avatar = null
      timestamp.value = Date.now()
      alert('已删除')
    } else {
      alert(message || '删除失败')
    }
  } catch (err) {
    console.error(err)
    alert('删除失败')
  }
}

onMounted(() => loadUserProfile())
</script>

<style scoped>
/* --- 基础布局 --- */
.profile-page-wrapper {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease;
}

/* --- 卡片样式 --- */
.profile-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-header-bg {
  height: 120px;
  background: linear-gradient(135deg, #1a2a3a 0%, #1e3a4f 100%);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 0;
}

/* --- 头像区域 --- */
.avatar-section {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 60px;
}

.avatar-container {
  position: relative;
  margin-bottom: 1rem;
}

.avatar-ring {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
  position: relative;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
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
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  cursor: pointer;
}

.avatar-ring:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay svg {
  width: 32px;
  height: 32px;
  color: white;
}

.username-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  margin: 0.5rem 0 0.2rem;
}

.user-role {
  color: rgba(168, 216, 234, 0.6);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.avatar-actions {
  display: flex;
  gap: 0.8rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.action-btn svg {
  width: 14px;
  height: 14px;
}

.primary-btn {
  background: rgba(79, 172, 254, 0.15);
  color: #4facfe;
}

.primary-btn:hover {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.danger-btn {
  background: rgba(255, 107, 129, 0.15);
  color: #ff6b81;
}

.danger-btn:hover {
  background: #ff6b81;
  color: white;
}

/* --- 内容主体 --- */
.content-body {
  padding: 2rem;
  position: relative;
  z-index: 1;
}

/* --- 加载与错误 --- */
.state-container {
  text-align: center;
  padding: 3rem;
  color: rgba(168, 216, 234, 0.6);
}

.state-container.error {
  color: #ff6b81;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.08);
  border-top: 3px solid #4facfe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.spinner.large {
  width: 40px;
  height: 40px;
  border-width: 4px;
}

/* --- 信息展示网格 --- */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.2rem;
  margin-bottom: 2rem;
}

.info-item {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s;
}

.info-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.info-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  stroke: #4facfe;
  flex-shrink: 0;
}

.info-icon-box svg {
  width: 20px;
  height: 20px;
  stroke: #4facfe;
}

.info-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.info-label {
  font-size: 0.8rem;
  color: rgba(168, 216, 234, 0.5);
  margin-bottom: 2px;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* --- 表单样式 --- */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(168, 216, 234, 0.7);
  margin-bottom: 0.5rem;
}

.input-wrapper input,
.input-wrapper select {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.85);
}

.input-wrapper input:focus,
.input-wrapper select:focus {
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
  outline: none;
}

.input-wrapper input::placeholder {
  color: rgba(168, 216, 234, 0.4);
}

.input-wrapper select option {
  background: #1a2a3a;
  color: rgba(255, 255, 255, 0.85);
}

/* --- 按钮区域 --- */
.action-footer, .form-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.btn {
  padding: 0.8rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.edit-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}

.edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 172, 254, 0.4);
}

.save-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
}

.logout-btn {
  background: rgba(255, 107, 129, 0.15);
  color: #ff6b81;
}

.logout-btn:hover {
  background: #ff6b81;
  color: white;
}

/* --- 动画 --- */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
