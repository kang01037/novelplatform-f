<template>
  <div class="create-page">
    <div class="content-wrapper">
      <!-- 页面头部 -->
      <header class="page-header">
        <div class="header-inner">
          <button @click="goBack" class="back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            返回
          </button>
          <div class="header-title">
            <h1>创建新小说</h1>
            <p>开启你的创作之旅</p>
          </div>
        </div>
      </header>

      <!-- 表单主体 -->
      <div class="form-container glass-card">
        <div class="form-layout">
          <!-- 左侧：封面上传 -->
          <div class="cover-section">
            <div class="cover-upload-box" :class="{ 'has-image': coverPreview }">
              <template v-if="coverPreview">
                <img :src="coverPreview" alt="封面预览" class="preview-img">
                <div class="cover-actions-overlay">
                  <label for="coverImage" class="action-btn change">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    更换
                  </label>
                  <button @click="removeCover" class="action-btn delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    删除
                  </button>
                </div>
              </template>
              <template v-else>
                <label for="coverImage" class="upload-placeholder">
                  <div class="icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                  <span class="text-main">点击上传封面</span>
                  <span class="text-sub">支持 JPG / PNG，建议尺寸 3:4</span>
                </label>
              </template>
              <input type="file" id="coverImage" @change="handleCoverChange" accept="image/*" hidden>
            </div>
            <div v-if="uploading" class="loading-tip">
              <div class="spinner small"></div>
              <span>正在上传...</span>
            </div>
          </div>

          <!-- 右侧：表单信息 -->
          <div class="form-section">
            <div class="form-group">
              <label>小说名称 <span class="required">*</span></label>
              <input type="text" v-model="form.novelName" placeholder="请输入一个响亮的名字" >
            </div>

            <div class="form-group">
              <label>作品简介 <span class="required">*</span></label>
              <textarea v-model="form.content" placeholder="简单介绍一下你的故事..." rows="5"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>分类</label>
                <div class="select-wrapper">
                  <select v-model="form.categoryId">
                    <option :value="1">玄幻奇幻</option>
                    <option :value="2">武侠仙侠</option>
                    <option :value="3">都市言情</option>
                    <option :value="4">科幻灵异</option>
                    <option :value="5">历史军事</option>
                    <option :value="6">游戏竞技</option>
                  </select>
                  <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>

              <div class="form-group">
                <label>连载状态</label>
                <div class="select-wrapper">
                  <select v-model="form.novelStatus">
                    <option :value="0">连载中</option>
                    <option :value="1">已完结</option>
                    <option :value="2">暂停</option>
                  </select>
                  <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>

            <div class="submit-section">
              <button @click="submitNovel" class="submit-btn" :disabled="submitting || uploading">
                <div v-if="submitting || uploading" class="spinner btn-spinner"></div>
                <span v-else>立即创建</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { novelApi } from '../../api'

const router = useRouter()
const submitting = ref(false)
const coverImage = ref(null)
const coverPreview = ref('')
const uploading = ref(false)

const form = reactive({
  novelName: '',
  content: '',
  categoryId: 1,
  novelStatus: 0,
  coverImage: ''
})

const handleCoverChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

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

  // 预览图片
  const reader = new FileReader()
  reader.onload = (e) => {
    coverPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
  coverImage.value = file
}

const removeCover = () => {
  coverImage.value = null
  coverPreview.value = ''
  const input = document.getElementById('coverImage')
  if (input) input.value = ''
}

// 保持原有的上传逻辑不变
const uploadCover = async (novelId) => {
  if (!coverImage.value) return null
  try {
    uploading.value = true
    const formData = new FormData()
    formData.append('novelId', novelId)
    formData.append('file', coverImage.value)

    const response = await novelApi.uploadCover(formData)
    if (response.data.code === 200 || response.data.message === 'success') {
      return response.data.data?.imageUrl || response.data.data
    }
    return null
  } catch (error) {
    console.error('封面上传失败:', error)
    if (error.response?.data?.code === 200) {
      return error.response.data.data?.imageUrl || error.response.data.data
    }
    return null
  } finally {
    uploading.value = false
  }
}

// 保持原有的提交逻辑不变
const submitNovel = async () => {
  if (!form.novelName || !form.content) {
    alert('请填写小说名称和简介')
    return
  }

  try {
    submitting.value = true
    const userId = localStorage.getItem('userId')
    if (!userId) {
      alert('请先登录')
      router.push('/login')
      return
    }

    // 1. 创建小说
    const novelData = {
      novelName: form.novelName,
      content: form.content,
      authorId: parseInt(userId),
      categoryId: parseInt(form.categoryId),
      novelStatus: parseInt(form.novelStatus)
    }

    const response = await novelApi.createNovel(novelData)

    if (response.data.code === 200 || response.data.message === 'success') {
      // 2. 查询ID
      const searchResponse = await novelApi.searchNovels(form.novelName)
      if (searchResponse.data.code === 200 || searchResponse.data.message === 'success') {
        const novels = searchResponse.data.data || []
        const novel = novels.find(n => n.novelName === form.novelName && n.authorId === parseInt(userId))

        if (novel) {
          const novelId = novel.novelId
          // 3. 上传封面
          if (coverImage.value && novelId) {
            const coverUrl = await uploadCover(novelId)
            if (coverUrl) {
              alert('✅ 小说创建成功，封面已上传！')
            } else {
              alert('⚠️ 小说创建成功，但封面上传失败！')
            }
          } else {
            alert('小说创建成功！')
          }
          router.push('/writer/novels')
        } else {
          alert('小说创建成功，但未找到小说信息')
          router.push('/writer/novels')
        }
      }
    } else {
      alert(response.data.message || '创建失败')
    }
  } catch (error) {
    console.error('创建失败:', error)
    alert('创建失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
/* --- 页面布局 --- */
.create-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f9f4ff 50%, #fff5f8 100%);
  padding: 2rem 1rem;
}

.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

/* --- 头部 --- */
.page-header {
  margin-bottom: 2rem;
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.6);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 30px;
  color: #666;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}

.back-btn:hover {
  background: white;
  color: #667eea;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.1);
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

.header-title h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #333;
  font-weight: 700;
}

.header-title p {
  margin: 0.3rem 0 0;
  color: #888;
  font-size: 0.9rem;
}

/* --- 玻璃卡片 --- */
.glass-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.form-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 3rem;
  padding: 2.5rem;
}

/* --- 封面上传 --- */
.cover-section {
  display: flex;
  flex-direction: column;
}

.cover-upload-box {
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background: #f0f2f5;
  border: 2px dashed transparent;
  transition: all 0.3s;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #999;
  border: 2px dashed rgba(0,0,0,0.1);
  border-radius: 16px;
  transition: all 0.3s;
}

.upload-placeholder:hover {
  border-color: #a18cd1;
  background: rgba(161, 140, 209, 0.03);
}

.icon-box {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(0,0,0,0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.icon-box svg {
  width: 24px;
  height: 24px;
  color: #aaa;
}

.text-main { font-weight: 600; color: #555; margin-bottom: 0.3rem; }
.text-sub { font-size: 0.8rem; color: #aaa; }

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-actions-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  display: flex;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.cover-upload-box:hover .cover-actions-overlay {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: transform 0.2s;
}

.action-btn svg { width: 14px; height: 14px; }
.action-btn.change { background: white; color: #333; }
.action-btn.delete { background: rgba(255,255,255,0.2); color: white; }
.action-btn:hover { transform: scale(1.05); }

.loading-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  color: #667eea;
  font-size: 0.9rem;
}

/* --- 表单区域 --- */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #444;
  margin-bottom: 0.6rem;
}

.required { color: #ff4757; margin-left: 2px; }

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.9rem 1.2rem;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 12px;
  background: rgba(255,255,255,0.6);
  font-size: 0.95rem;
  color: #333;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #a18cd1;
  background: white;
  box-shadow: 0 0 0 3px rgba(161, 140, 209, 0.1);
}

.form-group textarea {
  resize: none;
  line-height: 1.6;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.select-wrapper {
  position: relative;
}

.select-wrapper select {
  width: 100%;
  padding: 0.9rem 1.2rem;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 12px;
  background: rgba(255,255,255,0.6);
  font-size: 0.95rem;
  color: #333;
  appearance: none;
  cursor: pointer;
}

.select-wrapper .arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #999;
  pointer-events: none;
}

/* --- 提交按钮 --- */
.submit-section {
  margin-top: 1rem;
  text-align: right;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* --- 加载动画 --- */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
  border-top-color: #667eea;
  border-left-color: #667eea;
  border-bottom-color: #667eea;
}

.spinner.btn-spinner {
  width: 18px;
  height: 18px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* --- 响应式 --- */
@media (max-width: 768px) {
  .form-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 1.5rem;
  }

  .cover-upload-box {
    max-width: 250px;
    margin: 0 auto;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
