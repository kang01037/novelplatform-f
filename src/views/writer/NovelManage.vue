<script setup>
import { ref, onMounted } from 'vue'
import { novelApi } from '../../api'

const novels = ref([])
const loading = ref(true)

const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

const formatTime = (time) => {
  if (!time) return '未更新'
  return new Date(time).toLocaleString('zh-CN')
}


const handleImageError = (event) => {
  // 图片加载失败时，隐藏 img 元素，显示占位符
  event.target.style.display = 'none'
}


const loadNovels = async () => {
  try {
    loading.value = true
    const userId = localStorage.getItem('userId')

    if (!userId) {
      alert('请先登录')
      return
    }

    const response = await novelApi.getNovelsByAuthor(userId)
    if (response.data.code === 200) {
      novels.value = response.data.data || []
    }
  } catch (error) {
    console.error('加载小说列表失败:', error)
    alert('加载失败：' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadNovels()
})
</script>

<template>
  <div class="novel-manage">
    <div class="page-header">
      <h1>小说管理</h1>
      <router-link to="/writer/novel/create" class="btn-create">创建新小说</router-link>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="novels.length === 0" class="empty-state">
      <p>暂无作品，快去创作吧！</p>
      <router-link to="/writer/novel/create" class="btn-create-first">创作第一部小说</router-link>
    </div>

    <div v-else class="novel-list">
      <div v-for="novel in novels" :key="novel.novelId" class="novel-item">
        <div class="novel-cover">
          <img v-if="novel.coverImage && novel.coverImage.trim()" :src="novel.coverImage" :alt="novel.novelName" @error="handleImageError">
          <div v-else class="cover-placeholder">{{ novel.novelName.charAt(0) }}</div>
        </div>
        <div class="novel-info">
          <h3 class="novel-title">{{ novel.novelName }}</h3>
          <p class="novel-desc">{{ novel.content }}</p>
          <div class="novel-meta">
            <span class="status-badge" :class="`status-${novel.novelStatus}`">
              {{ novel.novelStatus === 1 ? '已完结' : novel.novelStatus === 0 ? '连载中' : '暂停' }}
            </span>
            <span class="update-time">更新：{{ formatTime(novel.lastUpdateTime) }}</span>
          </div>
          <div class="novel-stats">
            <span>点击量： {{ formatNumber(novel.clickCount) }}</span>
            <span>收藏量： {{ formatNumber(novel.collectCount) }}</span>
            <span>评分： {{ novel.score?.toFixed(1) || '--' }}</span>
          </div>
        </div>
        <div class="novel-actions">
          <router-link :to="`/writer/novel/${novel.novelId}/chapters`" class="btn-chapters">
            章节管理
          </router-link>
          <router-link :to="`/novel/detail/${novel.novelId}`" class="btn-detail" target="_blank">
            查看详情
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.novel-manage {
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
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.85);
}

.btn-create {
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-create:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4);
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: rgba(168, 216, 234, 0.6);
}

.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.empty-state p {
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  color: rgba(168, 216, 234, 0.6);
}

.btn-create-first {
  display: inline-block;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-create-first:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4);
}

.novel-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.novel-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.novel-item:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.novel-cover {
  width: 120px;
  height: 160px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.novel-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  font-weight: bold;
}

.novel-info {
  flex: 1;
  min-width: 0;
}

.novel-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.85);
}

.novel-desc {
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
  color: rgba(168, 216, 234, 0.6);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.novel-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-0 {
  background: rgba(79, 172, 254, 0.15);
  color: #4facfe;
}

.status-1 {
  background: rgba(0, 184, 148, 0.15);
  color: #00b894;
}

.status-2 {
  background: rgba(253, 203, 110, 0.15);
  color: #fdcb6e;
}

.update-time {
  font-size: 0.85rem;
  color: rgba(168, 216, 234, 0.5);
}

.novel-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: rgba(168, 216, 234, 0.6);
}

.novel-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: center;
}

.btn-chapters,
.btn-detail {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s;
}

.btn-chapters {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-chapters:hover {
  box-shadow: 0 3px 10px rgba(79, 172, 254, 0.4);
}

.btn-detail {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
}

.btn-detail:hover {
  background: rgba(255, 255, 255, 0.12);
}

@media (max-width: 768px) {
  .novel-item {
    flex-direction: column;
  }

  .novel-cover {
    width: 100%;
    height: 200px;
  }
}
</style>
