<template>
  <div class="novel-create">
    <div class="page-header">
      <h1>创建新小说</h1>
      <button @click="goBack" class="btn-back">← 返回</button>
    </div>

    <div class="create-form">
      <div class="form-section">
        <h3>基本信息</h3>

        <div class="form-group">
          <label for="coverImage">小说封面</label>
          <div class="cover-upload">
            <div v-if="coverPreview" class="cover-preview">
              <img :src="coverPreview" alt="封面预览">
              <button @click="removeCover" class="btn-remove" type="button">✕</button>
            </div>
            <div v-else class="cover-placeholder">
              <label for="coverImage" class="upload-label">
                <span class="upload-text">点击上传封面</span>
                <span class="upload-hint">支持 JPG、PNG 格式，不超过 5MB</span>
              </label>
            </div>
            <input
                type="file"
                id="coverImage"
                @change="handleCoverChange"
                accept="image/*"
                style="display: none"
            >
          </div>
          <div v-if="uploading" class="uploading-tip">
            <span class="loading-spinner"></span>
            上传中...
          </div>
        </div>

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
      </div>

      <div class="form-actions">
        <button @click="submitNovel" class="btn-submit" :disabled="submitting || uploading">
          {{ uploading ? '上传中...' : submitting ? '提交中...' : '🚀 创建小说' }}
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
  // 清空 input，允许重新上传
  const input = document.getElementById('coverImage')
  if (input) {
    input.value = ''
  }
}

const uploadCover = async (novelId) => {
  if (!coverImage.value) return null

  try {
    uploading.value = true

    // 创建 FormData 对象（参考头像上传）
    const formData = new FormData()
    formData.append('novelId', novelId)
    formData.append('file', coverImage.value)

    console.log('上传封面:', formData)
    const response = await novelApi.uploadCover(formData)
    console.log('封面上传响应:', response)

    if (response.data.code === 200 || response.data.message === 'success') {
      const coverUrl = response.data.data?.imageUrl || response.data.data
      console.log('封面上传成功，URL:', coverUrl)
      return coverUrl
    } else {
      console.error('封面上传失败:', response.data.message)
      return null
    }
  } catch (error) {
    console.error('封面上传失败:', error)
    // 参考头像上传的 catch 处理
    if (error.response) {
      const { code, message } = error.response.data
      if (code === 200 && message === 'success') {
        const coverUrl = error.response.data.data?.imageUrl || error.response.data.data
        console.log('封面上传成功，URL:', coverUrl)
        return coverUrl
      }
      console.error('封面上传失败:', message)
    } else if (error.request) {
      console.error('封面上传失败：无法连接到服务器')
    } else {
      console.error('封面上传失败:', error.message)
    }
    return null
  } finally {
    uploading.value = false
  }
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

    // 第一步：创建小说（不传封面）
    const novelData = {
      novelName: form.novelName,
      content: form.content,
      authorId: parseInt(userId),
      categoryId: parseInt(form.categoryId),
      novelStatus: parseInt(form.novelStatus)
    }

    console.log('创建小说:', novelData)
    const response = await novelApi.createNovel(novelData)
    console.log('创建小说响应:', response)

    if (response.data.code === 200 || response.data.message === 'success') {
      // 第二步：通过小说名查询刚创建的小说，获取 novelId
      console.log('开始查询小说 ID，小说名:', form.novelName)
      const searchResponse = await novelApi.searchNovels(form.novelName)
      console.log('查询小说响应:', searchResponse)

      if (searchResponse.data.code === 200 || searchResponse.data.message === 'success') {
        const novels = searchResponse.data.data || []
        // 找到匹配的小说（通过小说名和作者 ID）
        const novel = novels.find(n =>
            n.novelName === form.novelName &&
            n.authorId === parseInt(userId)
        )

        if (novel) {
          const novelId = novel.novelId
          console.log('查询到小说 ID:', novelId)

          // 第三步：如果有上传封面，调用上传接口
          if (coverImage.value && novelId) {
            console.log('开始上传封面')
            const coverUrl = await uploadCover(novelId)
            if (coverUrl) {
              console.log('封面上传成功:', coverUrl)
              alert('✅ 小说创建成功，封面已上传！')
            } else {
              alert('⚠️ 小说创建成功，但封面上传失败！请稍后在小说管理中上传封面')
            }
          } else {
            alert('小说创建成功！')
          }

          router.push('/writer/novels')
        } else {
          console.error('未找到匹配的小说')
          alert('小说创建成功，但未找到小说信息')
          router.push('/writer/novels')
        }
      } else {
        console.error('查询小说失败:', searchResponse.data.message)
        alert('小说创建成功，但查询小说信息失败')
        router.push('/writer/novels')
      }
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

.form-actions {
  text-align: center;
  padding-top: 1rem;
  border-top: 2px solid #eee;
}

.btn-submit {
  padding: 1rem 3rem;
  background: linear-gradient(135deg, #ff0000 0%, #00ff67 100%);
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

.cover-upload {
  position: relative;
  width: 100%;
  max-width: 300px;
}

.cover-preview {
  position: relative;
  width: 100%;
  padding-bottom: 133%; /* 3:4 比例 */
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.cover-preview img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(244, 67, 54, 0.9);
  color: white;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  z-index: 10;
}

.btn-remove:hover {
  background: rgba(244, 67, 54, 1);
  transform: scale(1.1);
}

.cover-placeholder {
  width: 100%;
  padding-bottom: 133%; /* 3:4 比例 */
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #f9f9f9;
  cursor: pointer;
  transition: all 0.3s;
}

.cover-placeholder:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.upload-label {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #999;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.upload-text {
  font-size: 1rem;
  font-weight: 600;
  color: #667eea;
}

.upload-hint {
  font-size: 0.85rem;
  color: #999;
  margin-top: 0.5rem;
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
</style>
