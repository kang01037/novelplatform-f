<template>
  <div class="chapter-manage">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <div class="nav-content">
        <button @click="goBack" class="nav-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="nav-title">章节管理</h1>
        <div class="nav-info">
          <span class="novel-name">{{ novelInfo.novelName }}</span>
        </div>
      </div>
      <router-link :to="`/writer/chapter/create/${novelId}`" class="create-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        新建章节
      </router-link>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="chapters.length === 0" class="empty-state">
        <div class="empty-content">
          <div class="empty-icon">📝</div>
          <h2 class="empty-title">暂无章节</h2>
          <p class="empty-description">开始创作您的第一部作品吧！</p>
          <router-link :to="`/writer/chapter/create/${novelId}`" class="empty-action">
            创建第一章节
          </router-link>
        </div>
      </div>

      <!-- 章节列表 -->
      <div v-else class="chapter-grid">
        <div v-for="chapter in chapters" :key="chapter.chapterId" class="chapter-card">
          <div class="card-header">
            <div class="chapter-number">第{{ chapter.chapterNum }}章</div>
            <div class="chapter-status"></div>
          </div>
          <div class="card-content">
            <h3 class="chapter-title">{{ chapter.chapterTitle }}</h3>
            <div class="chapter-meta">
              <div class="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
                <span>{{ chapter.wordCount || 0 }} 字</span>
              </div>
              <div class="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
                <span>{{ formatTime(chapter.updateTime || chapter.createTime) }}</span>
              </div>
            </div>
          </div>
          <div class="card-actions">
            <router-link :to="`/writer/chapter/edit/${chapter.chapterId}`" class="action-btn edit-btn">
              <span>编辑</span>
            </router-link>
            <button @click="deleteChapter(chapter.chapterId)" class="action-btn delete-btn">
              <span>删除</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { chapterApi, novelApi } from '../../api'

const route = useRoute()
const novelId = route.params.novelId
const chapters = ref([])
const loading = ref(true)
const novelInfo = ref({ novelName: '' })

const formatTime = (time) => {
  if (!time) return '未更新'
  return new Date(time).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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
  if (!confirm('确定要删除这个章节吗？此操作不可恢复。')) return

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

<style scoped>
.chapter-manage {
  min-height: 100vh;
}

.top-nav {
  background: rgba(15, 25, 35, 0.9);
  backdrop-filter: blur(20px);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  padding: 0.5rem;
  color: rgba(168, 216, 234, 0.7);
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.nav-btn:hover {
  background: rgba(79, 172, 254, 0.15);
  color: #4facfe;
  border-color: rgba(79, 172, 254, 0.3);
}

.nav-btn svg {
  stroke: currentColor;
}

.nav-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.nav-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(168, 216, 234, 0.6);
  font-size: 0.9rem;
}

.novel-name {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
  transition: all 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
}

.create-btn svg {
  stroke: currentColor;
}

.main-content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 4rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  position: relative;
}

.spinner {
  width: 100%;
  height: 100%;
  border: 3px solid rgba(255, 255, 255, 0.08);
  border-top: 3px solid #4facfe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-content {
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: #4facfe;
}

.empty-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 1rem;
}

.empty-description {
  font-size: 1.1rem;
  color: rgba(168, 216, 234, 0.6);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.empty-action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.empty-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
}

.chapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.chapter-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.chapter-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  border-color: rgba(79, 172, 254, 0.2);
}

.card-header {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chapter-number {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4facfe;
  background: rgba(79, 172, 254, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.chapter-status {
  width: 8px;
  height: 8px;
  background: #00b894;
  border-radius: 50%;
}

.card-content {
  padding: 1.5rem;
}

.chapter-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.chapter-meta {
  display: flex;
  gap: 2rem;
  font-size: 0.9rem;
  color: rgba(168, 216, 234, 0.6);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-item svg {
  stroke: rgba(168, 216, 234, 0.4);
}

.card-actions {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  gap: 1rem;
}

.action-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-decoration: none;
}

.edit-btn {
  background: rgba(79, 172, 254, 0.12);
  color: #4facfe;
}

.edit-btn:hover {
  background: rgba(79, 172, 254, 0.2);
}

.delete-btn {
  background: rgba(255, 107, 129, 0.12);
  color: #ff6b81;
}

.delete-btn:hover {
  background: rgba(255, 107, 129, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chapter-grid {
    grid-template-columns: 1fr;
  }

  .top-nav {
    padding: 1rem;
  }

  .nav-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .create-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0 1rem;
  }

  .chapter-card {
    border-radius: 12px;
  }

  .card-header, .card-content, .card-actions {
    padding: 1rem;
  }
}
</style>
