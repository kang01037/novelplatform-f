<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { novelApi } from '../../api'

const router = useRouter()
const submitting = ref(false)

const form = reactive({
  novelName: '',
  content: '',
  categoryId: 1,
  novelStatus: 0
})

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
      </div>

      <div class="form-actions">
        <button @click="submitNovel" class="btn-submit" :disabled="submitting">
          {{ submitting ? '提交中...' : '🚀 创建小说' }}
        </button>
      </div>
    </div>
  </div>
</template>

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
