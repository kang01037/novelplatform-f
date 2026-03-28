<template>
  <div class="novel-create">
    <div class="page-header">
      <h1>➕ 创建新小说</h1>
      <button @click="goBack" class="btn-back">← 返回</button>
    </div>

    <div class="create-form">
      <div class="form-section">
        <h3>基本信息</h3>

        <div class="form-group">
          <label for="novelName">小说名称 *</label>
          <input
              type="text"
              id="novelName"
              v-model="form.novelName"
              placeholder="请输入小说名称"
              required
          >
        </div>

        <div class="form-group">
          <label for="content">简介 *</label>
          <textarea
              id="content"
              v-model="form.content"
              placeholder="请输入小说简介"
              rows="5"
              required
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="categoryId">分类</label>
            <select id="categoryId" v-model="form.categoryId">
              <option :value="1">玄幻奇幻</option>
              <option :value="2">武侠仙侠</option>
              <option :value="3">都市言情</option>
              <option :value="4">科幻灵异</option>
              <option :value="5">历史军事</option>
              <option :value="6">游戏竞技</option>
            </select>
          </div>

          <div class="form-group">
            <label for="novelStatus">连载状态</label>
            <select id="novelStatus" v-model="form.novelStatus">
              <option :value="0">连载中</option>
              <option :value="1">已完结</option>
              <option :value="2">暂停</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>封面图片</label>
          <div class="cover-upload">
            <div v-if="coverUrl" class="cover-preview">
              <img :src="coverUrl" alt="封面预览">
              <button @click="removeCover" class="btn-remove-cover">✕</button>
            </div>
            <label v-else for="cover-upload" class="cover-upload-btn">
              <span class="upload-icon">📷</span>
              <span>点击上传封面</span>
              <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  @change="handleCoverUpload"
                  style="display: none"
              >
            </label>
            <p class="upload-tip">支持 jpg、png、gif、webp 格式，不超过 5MB</p>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button @click="submitNovel" class="btn-submit" :disabled="submitting">
          {{ submitting ? '提交中...' : '🚀 创建小说' }}
        </button>
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
const coverUrl = ref('')
const coverFile = ref(null)

const form = reactive({
  novelName: '',
  content: '',
  categoryId: 1,
  novelStatus: 0
})

const handleCoverUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    alert('只支持 JPG、PNG、GIF、WebP 格式的图片')
    return
  }

  // 验证文件大小
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    alert('图片大小不能超过 5MB')
    return
  }

  coverFile.value = file

  // 预览
  const reader = new FileReader()
  reader.onload = (e) => {
    coverUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const removeCover = () => {
  coverUrl.value = ''
  coverFile.value = null
}

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

    // 创建小说数据
    const novelData = {
      novelName: form.novelName,
      content: form.content,
      authorId: parseInt(userId),
      categoryId: parseInt(form.categoryId),
      novelStatus: parseInt(form.novelStatus)
    }

    console.log('创建小说:', novelData)
    const response = await novelApi.createNovel(novelData)

    if (response.data.code === 200 || response.data.message === 'success') {
      alert('小说创建成功！')
      // 如果有封面，上传封面
      if (coverFile.value) {
        // TODO: 上传封面逻辑
      }
      router.push('/writer/novels')
    } else {
      alert(response.data.message || '创建失败')
    }
  } catch (error) {
    console.error('创建失败:', error)
    if (error.response) {
      const { code, message } = error.response.data
      if (code === 200 && message === 'success') {
        alert('创建成功！')
        router.push('/writer/novels')
        return
      }
      alert(`创建失败：${message || '服务器错误'}`)
    } else if (error.request) {
      alert('创建失败：无法连接到服务器')
    } else {
      alert(`创建失败：${error.message}`)
    }
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.novel-create {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

.btn-back {
  padding: 0.6rem 1.5rem;
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-back:hover {
  background: #e0e0e0;
}

.create-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.2rem;
  color: #333;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eee;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.cover-upload {
  margin-top: 0.5rem;
}

.cover-preview {
  position: relative;
  width: 200px;
  height: 260px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-cover {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-remove-cover:hover {
  background: rgba(0, 0, 0, 0.9);
}

.cover-upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 260px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: #999;
}

.cover-upload-btn:hover {
  border-color: #667eea;
  color: #667eea;
  background: #f8f9fa;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.upload-tip {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #999;
}

.form-actions {
  text-align: center;
  padding-top: 1rem;
  border-top: 2px solid #eee;
}

.btn-submit {
  padding: 1rem 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
