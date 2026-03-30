<template>
  <div class="chapter-manage">
    <div class="page-header">
      <div>
        <button @click="goBack" class="btn-back">← 返回</button>
        <h1>📖 章节管理 - {{ novelInfo.novelName }}</h1>
      </div>
      <router-link :to="`/writer/chapter/create/${novelId}`" class="btn-create">
        ➕ 新建章节
      </router-link>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="chapters.length === 0" class="empty-state">
      <p>暂无章节，开始创作吧！</p>
      <router-link :to="`/writer/chapter/create/${novelId}`" class="btn-create-first">
        创建第一章节
      </router-link>
    </div>

    <div v-else class="chapter-list">
      <div v-for="chapter in chapters" :key="chapter.chapterId" class="chapter-item">
        <div class="chapter-info">
          <h3 class="chapter-title">
            第{{ chapter.chapterNum }}章 {{ chapter.chapterTitle }}
          </h3>
          <div class="chapter-meta">
            <span class="word-count">📝 {{ chapter.wordCount || 0 }} 字</span>
            <span class="update-time">🕐 {{ formatTime(chapter.updateTime || chapter.createTime) }}</span>
          </div>
        </div>
        <div class="chapter-actions">
          <router-link :to="`/writer/chapter/edit/${chapter.chapterId}`" class="btn-edit">
            编辑
          </router-link>
          <button @click="deleteChapter(chapter.chapterId)" class="btn-delete">
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>import {ref, onMounted} from 'vue'
import {useRoute} from 'vue-router'
import {chapterApi, novelApi} from '../../api'

const route = useRoute()
const novelId = route.params.novelId
const chapters = ref([])
const loading = ref(true)
const novelInfo = ref({novelName: ''})

const formatTime = (time) => {
  if (!time) return '未更新'
  return new Date(time).toLocaleString('zh-CN')
}

const loadChapters = async () => {
  try {
    loading.value = true

    // 先获取小说信息
    const novelResponse = await novelApi.getNovel(novelId)
    if (novelResponse.data.code === 200 || novelResponse.data.message === 'success') {
      novelInfo.value = novelResponse.data.data
    }

    // 获取章节列表
    const response = await chapterApi.getChaptersByNovel(novelId)
    if (response.data.code === 200 || response.data.message === 'success') {
      chapters.value = response.data.data || []
    }
  } catch (error) {
    console.error('加载章节列表失败:', error)
    alert('加载失败：' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

const deleteChapter = async (chapterId) => {
  if (!confirm('确定要删除这个章节吗？')) return

  try {
    const response = await chapterApi.deleteChapter(chapterId)
    if (response.data.code === 200 || response.data.message === 'success') {
      alert('删除成功')
      loadChapters()
    } else {
      alert(response.data.message || '删除失败')
    }
  } catch (error) {
    console.error('删除章节失败:', error)
    alert('删除失败，请稍后重试')
  }
}

const goBack = () => {
  window.history.back()
}

onMounted(() => {
  loadChapters()
})
</script>

<style scoped>.chapter-manage {
  max-width: 1200px;
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
  font-size: 1.8rem;
  color: #333;
}

.btn-back {
  padding: 0.6rem 1.2rem;
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 1rem;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-back:hover {
  background: #e0e0e0;
}

.btn-create {
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-create:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-state p {
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  color: #999;
}

.btn-create-first {
  display: inline-block;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-create-first:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chapter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.chapter-item:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.chapter-info {
  flex: 1;
}

.chapter-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.chapter-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.chapter-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
}

.btn-edit:hover {
  background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
}

.btn-delete {
  background: linear-gradient(135deg, #f44336 0%, #da190b 100%);
  color: white;
}

.btn-delete:hover {
  background: linear-gradient(135deg, #da190b 0%, #c61609 100%);
}

@media (max-width: 768px) {
  .chapter-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .chapter-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
