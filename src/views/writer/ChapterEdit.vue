<template>
  <div class="chapter-edit">
    <div class="page-header">
      <div>
        <button @click="goBack" class="btn-back">← 返回</button>
        <h1>{{ isEdit ? '✏️ 编辑章节' : '➕ 创建章节' }}</h1>
      </div>
      <div class="header-actions">
        <button @click="saveChapter" class="btn-save" :disabled="saving">
          {{ saving ? '保存中...' : '💾 保存' }}
        </button>
        <button @click="publishChapter" class="btn-publish" :disabled="saving">
          {{ saving ? '发布中...' : '🚀 发布' }}
        </button>
      </div>
    </div>

    <div class="edit-form">
      <div class="form-group">
        <label for="chapterTitle">章节标题 *</label>
        <input
            type="text"
            id="chapterTitle"
            v-model="form.chapterTitle"
            placeholder="请输入章节标题，如：第一章 初出茅庐"
            required
        >
      </div>

      <div class="form-group">
        <label for="chapterContent">章节内容 *</label>
        <textarea
            id="chapterContent"
            v-model="form.chapterContent"
            class="content-editor"
            placeholder="请输入章节内容..."
            rows="30"
            required
        ></textarea>
        <div class="word-count">
          字数：{{ form.chapterContent?.length || 0 }}
        </div>
      </div>

      <div class="form-tips">
        <h4>💡 写作提示：</h4>
        <ul>
          <li>保持章节字数在 2000-3000 字之间</li>
          <li>注意段落分明，便于读者阅读</li>
          <li>章节结尾留悬念，吸引读者继续阅读</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chapterApi } from '../../api'

const route = useRoute()
const router = useRouter()
const saving = ref(false)
const isEdit = ref(false)

const form = reactive({
  chapterId: null,
  novelId: null,
  chapterTitle: '',
  chapterContent: '',
  chapterNum: 0
})

const isEditId = computed(() => route.params.chapterId)

const loadChapter = async (chapterId) => {
  try {
    const response = await chapterApi.getChapter(chapterId)
    if (response.data.code === 200) {
      const chapter = response.data.data
      form.chapterId = chapter.chapterId
      form.novelId = chapter.novelId
      form.chapterTitle = chapter.chapterTitle
      form.chapterContent = chapter.chapterContent
      form.chapterNum = chapter.chapterNum
      isEdit.value = true
    }
  } catch (error) {
    console.error('加载章节失败:', error)
    alert('加载章节失败')
  }
}

const saveChapter = async () => {
  if (!form.chapterTitle || !form.chapterContent) {
    alert('请填写章节标题和内容')
    return
  }

  if (form.chapterContent.length < 100) {
    alert('章节内容太短了，至少写 100 字吧~')
    return
  }

  try {
    saving.value = true

    // 如果没有 novelId，从路由获取
    if (!form.novelId) {
      form.novelId = route.params.novelId
    }

    // 自动计算章节号（如果是新建）
    if (!form.chapterNum && !isEdit.value) {
      form.chapterNum = 1 // TODO: 实际应该查询最新章节号 +1
    }

    const response = isEdit.value
        ? await chapterApi.updateChapter(form)
        : await chapterApi.createChapter(form)

    if (response.data.code === 200 || response.data.message === 'success') {
      alert('保存成功')
      if (!isEdit.value) {
        isEdit.value = true
        form.chapterId = response.data.data?.chapterId
      }
    } else {
      alert(response.data.message || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    if (error.response) {
      const { code, message } = error.response.data
      if (code === 200 && message === 'success') {
        alert('保存成功')
        if (!isEdit.value) {
          isEdit.value = true
          form.chapterId = error.response.data.data?.chapterId
        }
        return
      }
      alert(`保存失败：${message || '服务器错误'}`)
    } else if (error.request) {
      alert('保存失败：无法连接到服务器')
    } else {
      alert(`保存失败：${error.message}`)
    }
  } finally {
    saving.value = false
  }
}

const publishChapter = async () => {
  if (!confirm('确定要发布章节吗？发布后将无法修改。')) return

  await saveChapter()
  if (form.chapterId) {
    router.push(`/writer/novel/${form.novelId}/chapters`)
  }
}

const goBack = () => {
  if (confirm('确定要返回吗？未保存的内容将丢失。')) {
    router.back()
  }
}

onMounted(() => {
  const chapterId = route.params.chapterId
  const novelId = route.params.novelId

  if (chapterId) {
    loadChapter(chapterId)
  } else if (novelId) {
    form.novelId = novelId
    isEdit.value = false
  }
})
</script>

<style scoped>
.chapter-edit {
  max-width: 1000px;
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
  display: inline-block;
  margin: 0.5rem 0 0 0;
  font-size: 1.5rem;
  color: #333;
}

.btn-back {
  padding: 0.6rem 1.2rem;
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  margin-right: 1rem;
  transition: all 0.3s;
}

.btn-back:hover {
  background: #e0e0e0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-save,
.btn-publish {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: linear-gradient(135deg, #5568d3 0%, #63408a 100%);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-publish {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
}

.btn-publish:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.btn-save:disabled,
.btn-publish:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.edit-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1.1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.content-editor {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  line-height: 1.8;
}

.content-editor:focus {
  outline: none;
  border-color: #667eea;
}

.word-count {
  text-align: right;
  color: #666;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.form-tips {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 2rem;
}

.form-tips h4 {
  margin: 0 0 1rem 0;
  color: #667eea;
  font-size: 1rem;
}

.form-tips ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #666;
  line-height: 2;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn-save,
  .btn-publish {
    width: 100%;
  }
}
</style>
