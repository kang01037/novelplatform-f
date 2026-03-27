<template>
  <div class="novel-hot-container">
    <div class="page-header">
      <h2>🔥 热门小说排行榜</h2>
      <div class="header-actions">
        <select v-model="limit" @change="getHotNovels">
          <option :value="5">Top 5</option>
          <option :value="10">Top 10</option>
          <option :value="20">Top 20</option>
          <option :value="50">Top 50</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p class="error-message">❌ {{ error }}</p>
      <button @click="getHotNovels" class="btn-retry">重试</button>
    </div>

    <div v-else-if="hotNovels.length === 0" class="empty-container">
      <p class="empty-message">😕 暂无热门小说数据</p>
    </div>

    <div v-else class="ranking-container">
      <!-- 前三名特别展示 -->
      <div class="top-three">
        <div
            v-for="(novel, index) in hotNovels.slice(0, 3)"
            :key="novel.novelId"
            class="top-card"
            :class="'top-' + (index + 1)"
        >
          <router-link :to="`/novel/detail/${novel.novelId}`" class="novel-link">
            <div class="rank-badge">
              <span class="rank-number">{{ index + 1 }}</span>
            </div>
            <div class="top-cover">
              <img :src="novel.coverImage" :alt="novel.novelName" v-if="novel.coverImage">
              <div class="cover-placeholder" v-else>
                {{ novel.novelName.charAt(0) }}
              </div>
            </div>
            <div class="top-info">
              <h3 class="novel-title">{{ novel.novelName }}</h3>
              <div class="top-stats">
                <div class="stat-item">
                  <span class="stat-label">🔥 点击</span>
                  <span class="stat-value">{{ formatNumber(novel.clickCount) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">⭐ 收藏</span>
                  <span class="stat-value">{{ formatNumber(novel.collectCount) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">📊 评分</span>
                  <span class="stat-value">{{ novel.score ? novel.score.toFixed(1) : '--' }}</span>
                </div>
              </div>
              <p class="novel-desc">{{ novel.content }}</p>
            </div>
          </router-link>
        </div>
      </div>

      <!-- 第 4 名及以后 -->
      <div v-if="hotNovels.length > 3" class="rank-list">
        <div
            v-for="(novel, index) in hotNovels.slice(3)"
            :key="novel.novelId"
            class="rank-item"
        >
          <router-link :to="`/novel/detail/${novel.novelId}`" class="rank-link">
            <div class="rank-num">{{ index + 4 }}</div>
            <div class="rank-cover">
              <img :src="novel.coverImage" :alt="novel.novelName" v-if="novel.coverImage">
              <div class="mini-placeholder" v-else>
                {{ novel.novelName.charAt(0) }}
              </div>
            </div>
            <div class="rank-content">
              <h4 class="rank-title">{{ novel.novelName }}</h4>
              <div class="rank-stats">
                <span class="rank-stat">
                  🔥 {{ formatNumber(novel.clickCount) }}
                </span>
                <span class="rank-stat">
                  ⭐ {{ formatNumber(novel.collectCount) }}
                </span>
                <span class="rank-stat">
                  📊 {{ novel.score ? novel.score.toFixed(1) : '--' }}
                </span>
              </div>
            </div>
            <div class="rank-trend">
              <span class="trend-icon">📈</span>
              <span class="trend-text">热门</span>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="hotNovels.length > 0" class="page-footer">
      <p>当前显示前 {{ hotNovels.length }} 部热门小说</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { novelApi } from '../../api'

const hotNovels = ref([])
const loading = ref(false)
const error = ref('')
const limit = ref(10)

const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿'
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

const getHotNovels = async () => {
  try {
    loading.value = true
    error.value = ''

    const response = await novelApi.getHotNovels(limit.value)
    console.log('热门小说响应:', response)

    if (response.data.code === 200 || response.data.message === 'success') {
      hotNovels.value = response.data.data || []
    } else {
      error.value = response.data.message || '获取热门小说失败'
    }
  } catch (err) {
    console.error('获取热门小说失败:', err)
    if (err.response) {
      const { code, message } = err.response.data
      if (code === 200 && message === 'success') {
        hotNovels.value = err.response.data.data || []
        return
      }
    }
    error.value = '获取热门小说失败，请检查网络连接'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getHotNovels()
})
</script>

<style scoped>
.novel-hot-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e0e0e0;
}

.page-header h2 {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

.header-actions select {
  padding: 0.6rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.header-actions select:hover {
  border-color: #667eea;
}

.header-actions select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff6b6b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #666;
  font-size: 1.1rem;
}

.error-message {
  color: #f44336;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.empty-message {
  color: #999;
  font-size: 1.2rem;
}

.btn-retry {
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.ranking-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.top-three {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.top-card {
  position: relative;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.top-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.top-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
}

.top-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
}

.top-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #e8a87c 100%);
}

.rank-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.top-1 .rank-badge {
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
}

.top-2 .rank-badge {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.top-3 .rank-badge {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.novel-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.top-cover {
  height: 250px;
  overflow: hidden;
  position: relative;
}

.top-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.top-card:hover .top-cover img {
  transform: scale(1.1);
}

.cover-placeholder {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1));
  color: rgba(255,255,255,0.9);
  font-size: 5rem;
  font-weight: bold;
  backdrop-filter: blur(10px);
}

.top-info {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
}

.novel-title {
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.top-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #666;
}

.stat-value {
  font-size: 1rem;
  color: #333;
  font-weight: bold;
}

.novel-desc {
  margin: 0;
  color: #666;
  line-height: 1.5;
  font-size: 0.85rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rank-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.rank-item:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.rank-link {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 1.5rem;
  text-decoration: none;
  color: inherit;
}

.rank-num {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.3rem;
  font-weight: bold;
  border-radius: 50%;
  flex-shrink: 0;
}

.rank-cover {
  width: 80px;
  height: 100px;
  overflow: hidden;
  border-radius: 8px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.rank-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mini-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
}

.rank-content {
  flex: 1;
  min-width: 0;
}

.rank-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-stats {
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
}

.rank-stat {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #666;
}

.rank-trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
  color: white;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
  flex-shrink: 0;
}

.page-footer {
  text-align: center;
  padding-top: 2rem;
  margin-top: 2rem;
  border-top: 2px solid #e0e0e0;
}

.page-footer p {
  color: #999;
  font-size: 1rem;
}

@media (max-width: 1024px) {
  .top-three {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .novel-hot-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .page-header h2 {
    font-size: 1.5rem;
  }

  .rank-link {
    padding: 1rem;
    gap: 1rem;
  }

  .rank-cover {
    width: 60px;
    height: 80px;
  }

  .rank-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
