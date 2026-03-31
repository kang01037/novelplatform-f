<template>
  <div class="chapter-edit">
    <div class="page-header">
      <div>
        <button @click="goBack" class="btn-back">← 返回</button>
        <h1>{{ isEdit ? '编辑章节' : '创建章节' }}</h1>
      </div>
      <div class="header-actions">
        <button @click="saveChapter" class="btn-save" :disabled="saving">
          {{ saving ? '保存中...' : '保存' }}
        </button>
        <button @click="publishChapter" class="btn-publish" :disabled="saving">
          {{ saving ? '发布中...' : '发布' }}
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

<script setup>import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chapterApi } from '../../api'

const route = useRoute()
const router = useRouter()
const saving = ref(false)
const isEdit = ref(false)
const nextChapterNum = ref(1)

const form = reactive({
  chapterId: null,
  novelId: null,
  chapterTitle: '',
  chapterContent: '',
  chapterNum: 0
})

const isEditId = computed(() => route.params.chapterId)

// 获取最新章节号
const loadNextChapterNum = async (novelId) => {
  try {
    const response = await chapterApi.getChaptersByNovel(novelId)
    if (response.data.code === 200 || response.data.message === 'success') {
      const chapters = response.data.data || []
      if (chapters.length > 0) {
        // 找到最大的章节号
        const maxChapterNum = Math.max(...chapters.map(c => c.chapterNum || 0))
        nextChapterNum.value = maxChapterNum + 1
      } else {
        nextChapterNum.value = 1
      }
    }
  } catch (error) {
    console.error('获取最新章节号失败:', error)
    nextChapterNum.value = 1
  }
}

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

  try {
    saving.value = true

    // 如果没有 novelId，从路由获取
    if (!form.novelId) {
      form.novelId = route.params.novelId
    }

    // 如果没有 novelName，使用默认值
    if (!form.novelName) {
      form.novelName = '小说'
    }

    // 自动计算章节号（如果是新建）
    if (!form.chapterNum && !isEdit.value) {
      form.chapterNum = nextChapterNum.value
    }

    // 如果没有 wordCount，自动计算
    if (!form.wordCount) {
      form.wordCount = form.chapterContent.length
    }

    console.log('保存章节数据:', form)

    const response = isEdit.value
        ? await chapterApi.updateChapter(form)
        : await chapterApi.createChapter(form)

    console.log('保存响应:', response)

    if (response.data.code === 200 ||
        response.data.message === 'success' ||
        response.data.message === '保存成功' ||
        response.data.message === '章节创建成功' ||
        response.data.message === '章节更新成功') {
      alert('✅ 保存成功')
      if (!isEdit.value) {
        isEdit.value = true
        form.chapterId = response.data.data?.chapterId || form.chapterId
        // 更新下一个章节号
        nextChapterNum.value = form.chapterNum + 1
      }
    } else {
      alert(response.data.message || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    // 即使 HTTP 状态码错误，也检查业务逻辑是否成功
    if (error.response) {
      const { code, message, data } = error.response.data
      console.log('错误响应:', { code, message, data })

      // 如果业务 code 是 200 或消息表示成功，也认为成功
      if (code === 200 ||
          message === 'success' ||
          message === '保存成功' ||
          message === '章节创建成功' ||
          message === '章节更新成功') {
        alert('✅ 保存成功')
        if (!isEdit.value) {
          isEdit.value = true
          form.chapterId = data?.chapterId || form.chapterId
          nextChapterNum.value = form.chapterNum + 1
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
  if (!form.chapterTitle || !form.chapterContent) {
    alert('请填写章节标题和内容')
    return
  }

  try {
    saving.value = true

    // 如果没有 novelId，从路由获取
    if (!form.novelId) {
      form.novelId = route.params.novelId
    }

    // 如果没有 novelName，使用默认值
    if (!form.novelName) {
      form.novelName = '小说'
    }

    // 自动计算章节号（如果是新建）
    if (!form.chapterNum && !isEdit.value) {
      form.chapterNum = nextChapterNum.value
    }

    // 如果没有 wordCount，自动计算
    if (!form.wordCount) {
      form.wordCount = form.chapterContent.length
    }

    console.log('发布章节数据:', form)

    const response = isEdit.value
        ? await chapterApi.updateChapter(form)
        : await chapterApi.createChapter(form)

    console.log('发布响应:', response)

    if (response.data.code === 200 ||
        response.data.message === 'success' ||
        response.data.message === '发布成功' ||
        response.data.message === '章节创建成功' ||
        response.data.message === '章节更新成功') {
      alert('🎉 发布成功！')
      router.push(`/writer/novel/${form.novelId}/chapters`)
    } else {
      alert(response.data.message || '发布失败')
    }
  } catch (error) {
    console.error('发布失败:', error)
    // 即使 HTTP 状态码错误，也检查业务逻辑是否成功
    if (error.response) {
      const { code, message, data } = error.response.data
      console.log('错误响应:', { code, message, data })

      // 如果业务 code 是 200 或消息表示成功，也认为成功
      if (code === 200 ||
          message === 'success' ||
          message === '发布成功' ||
          message === '章节创建成功' ||
          message === '章节更新成功') {
        alert('🎉 发布成功！')
        router.push(`/writer/novel/${form.novelId}/chapters`)
        return
      }

      alert(`发布失败：${message || '服务器错误'}`)
    } else if (error.request) {
      alert('发布失败：无法连接到服务器')
    } else {
      alert(`发布失败：${error.message}`)
    }
  } finally {
    saving.value = false
  }
}


const goBack = () => {
  if (confirm('确定要返回吗？未保存的内容将丢失。')) {
    router.back()
  }
}

onMounted(async () => {
  const chapterId = route.params.chapterId
  const novelId = route.params.novelId

  if (chapterId) {
    loadChapter(chapterId)
  } else if (novelId) {
    form.novelId = novelId
    isEdit.value = false
    // 获取最新章节号
    await loadNextChapterNum(novelId)
    console.log('下一章章节号:', nextChapterNum.value)
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
  color: #000000;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(255, 254, 254, 0.4);
}

.btn-publish {
  color: #000000;
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
