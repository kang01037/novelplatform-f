<template>
  <div class="novel-list-page">
    <!-- 顶部区域 -->
    <header class="page-header">
      <div class="header-content">
        <h2 class="title">
          <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          书库探索
        </h2>
        <p class="subtitle">发现精彩故事，开启阅读之旅</p>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar glass-card">
        <div class="filter-group">
          <div class="select-wrapper">
            <select v-model="statusFilter" @change="handleFilter">
              <option value="">全部状态</option>
              <option value="0">连载中</option>
              <option value="1">已完结</option>
              <option value="2">暂停更新</option>
            </select>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          <div class="select-wrapper">
            <select v-model="sortBy" @change="handleSort">
              <option value="default">默认排序</option>
              <option value="click">点击量</option>
              <option value="collect">收藏数</option>
              <option value="score">评分</option>
              <option value="update">更新时间</option>
            </select>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>

        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
              type="text"
              v-model="searchKeyword"
              placeholder="搜索小说名、作者..."
              @keyup.enter="handleSearch"
          >
          <button @click="handleSearch" :disabled="!searchKeyword.trim()" class="search-btn">
            搜索
          </button>
        </div>
      </div>
    </header>

    <!-- 内容区域 -->
    <main class="content-area">
      <!-- 加载状态 -->
      <div v-if="loading" class="state-container loading-state">
        <div class="spinner"></div>
        <p>正在加载书库...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="loadError" class="state-container error-state">
        <div class="error-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <p class="error-text">{{ loadError }}</p>
        <button @click="getNovels" class="retry-btn">重新加载</button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="novels.length === 0" class="state-container empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
        <p>暂无相关小说</p>
      </div>

      <!-- 小说网格 -->
      <div v-else class="novel-grid">
        <div v-for="novel in novels" :key="novel.novelId" class="novel-card">
          <router-link :to="`/novel/detail/${novel.novelId}`" class="card-link">
            <!-- 封面区域 -->
            <div class="card-cover">
              <img v-if="novel.coverImage" :src="novel.coverImage" :alt="novel.novelName">
              <div v-else class="cover-placeholder">
                <span>{{ novel.novelName.charAt(0) }}</span>
              </div>

              <!-- 状态标签 -->
              <div class="status-badge" :class="'status-' + novel.novelStatus">
                {{ getNovelStatusText(novel.novelStatus) }}
              </div>

              <!-- 悬浮遮罩 -->
              <div class="cover-mask">
                <span class="view-detail">查看详情</span>
              </div>
            </div>

            <!-- 信息区域 -->
            <div class="card-body">
              <h3 class="book-title">{{ novel.novelName }}</h3>
              <p class="book-desc">{{ novel.content }}</p>

              <div class="book-meta">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                <span>{{ novel.lastChapterName || '暂无章节' }}</span>
              </div>

              <div class="book-stats">
                <div class="stat-item" title="点击">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <span>{{ formatNumber(novel.clickCount) }}</span>
                </div>
                <div class="stat-item" title="收藏">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  <span>{{ formatNumber(novel.collectCount) }}</span>
                </div>
                <div class="stat-item" title="推荐">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                  <span>{{ formatNumber(novel.recommendCount) }}</span>
                </div>
                <div class="stat-item highlight" title="评分">
                  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  <span>{{ novel.score ? novel.score.toFixed(1) : '--' }}</span>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </main>

    <!-- 底部 -->
    <footer v-if="novels.length > 0" class="page-footer">
      <p>已为您展示 {{ novels.length }} 部作品</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const novels = ref([])
const loading = ref(false)
const loadError = ref('')
const searchKeyword = ref('')
const statusFilter = ref('')
const sortBy = ref('default')

const getNovelStatusText = (status) => {
  const map = { 0: '连载中', 1: '已完结', 2: '暂停' }
  return map[status] || '未知'
}

const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿'
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num.toString()
}

const getNovels = async () => {
  try {
    loading.value = true
    loadError.value = ''

    const response = await axios.get('/api/novel/list', {
      timeout: 10000
    })


    if (response.status === 200) {
      const { code, message, data } = response.data
      if (code === 200 || message === 'success') {
        let novelData = data || []
        if (!Array.isArray(novelData)) novelData = []

        // 筛选逻辑
        if (statusFilter.value !== '') {
          novelData = novelData.filter(novel => novel.novelStatus === parseInt(statusFilter.value))
        }

        // 排序逻辑
        switch (sortBy.value) {
          case 'click': novelData.sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0)); break
          case 'collect': novelData.sort((a, b) => (b.collectCount || 0) - (a.collectCount || 0)); break
          case 'score': novelData.sort((a, b) => (b.score || 0) - (a.score || 0)); break
          case 'update': novelData.sort((a, b) => new Date(b.lastUpdateTime || 0) - new Date(a.lastUpdateTime || 0)); break
        }

        novels.value = novelData
      } else {
        loadError.value = message || '获取数据失败'
      }
    }
  } catch (err) {
    console.error(err)
    loadError.value = '网络连接异常，请检查后端服务'
  } finally {
    loading.value = false
  }
}

const handleFilter = () => getNovels()
const handleSort = () => getNovels()
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push(`/novel/search?keyword=${encodeURIComponent(searchKeyword.value.trim())}`)
  }
}

onMounted(() => getNovels())
</script>

<style scoped>
/* --- 页面整体布局 --- */
.novel-list-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: transparent;
}

/* --- 头部设计 --- */
.page-header {
  margin-bottom: 2.5rem;
}

.header-content {
  margin-bottom: 2rem;
  text-align: center;
}

.title {
  font-size: 2rem;
  font-weight: 800;
  color: #333;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  margin: 0 0 0.5rem;
}

.title-icon {
  width: 32px;
  height: 32px;
  color: #667eea;
}

.subtitle {
  color: #888;
  font-size: 1rem;
  margin: 0;
}

/* --- 工具栏 (玻璃态) --- */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.8rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  gap: 1.5rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  gap: 1rem;
}

.select-wrapper {
  position: relative;
}

.select-wrapper select {
  appearance: none;
  padding: 0.7rem 2.5rem 0.7rem 1.2rem;
  border-radius: 30px;
  border: 1px solid rgba(0,0,0,0.08);
  background: #fff;
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.select-wrapper select:hover {
  border-color: #a18cd1;
}

.select-wrapper select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

.arrow-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #999;
  pointer-events: none;
}

/* --- 搜索框 --- */
.search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 30px;
  padding: 0.3rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.08);
  transition: all 0.3s;
}

.search-box:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

.search-icon {
  width: 20px;
  height: 20px;
  margin-left: 1rem;
  color: #999;
}

.search-box input {
  border: none;
  background: transparent;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  width: 220px;
  color: #333;
}

.search-box input:focus {
  outline: none;
}

.search-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 0.5rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.search-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* --- 状态显示 --- */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.error-icon-box svg, .empty-state svg {
  width: 60px;
  height: 60px;
  color: #ddd;
  margin-bottom: 1rem;
}

.error-text {
  color: #ff4757;
  margin-bottom: 1.5rem;
  max-width: 400px;
}

.retry-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.6rem 2rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
}

/* --- 小说网格 --- */
.novel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 2rem;
}

.novel-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  position: relative;
}

.novel-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(102, 126, 234, 0.15);
}

.card-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

/* --- 封面设计 --- */
.card-cover {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: #f0f2f5;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.novel-card:hover .card-cover img {
  transform: scale(1.08);
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
  color: white;
  font-size: 4rem;
  font-weight: bold;
  opacity: 0.8;
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  z-index: 2;
}

.status-0 { background: #667eea; }
.status-1 { background: #00b894; }
.status-2 { background: #fdcb6e; color: #333; }

.cover-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.novel-card:hover .cover-mask {
  opacity: 1;
}

.view-detail {
  color: white;
  border: 1px solid white;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  backdrop-filter: blur(5px);
}

/* --- 卡片内容 --- */
.card-body {
  padding: 1.2rem 1.5rem 1.5rem;
}

.book-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-desc {
  font-size: 0.85rem;
  color: #888;
  line-height: 1.5;
  height: 2.55em; /* 限制两行 */
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 0 0 1rem;
}

.book-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #667eea;
  margin-bottom: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-meta svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* --- 统计数据 --- */
.book-stats {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: #999;
}

.stat-item svg {
  width: 16px;
  height: 16px;
  stroke: #999;
}

.stat-item.highlight svg {
  stroke: none;
  fill: #f1c40f;
  color: #f1c40f;
}

.stat-item span {
  font-weight: 600;
}

/* --- 页脚 --- */
.page-footer {
  text-align: center;
  padding-top: 3rem;
  color: #aaa;
  font-size: 0.9rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* --- 响应式 --- */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    width: 100%;
  }

  .select-wrapper {
    flex: 1;
  }

  .select-wrapper select {
    width: 100%;
  }

  .search-box {
    width: 100%;
    margin-top: 1rem;
  }

  .search-box input {
    flex: 1;
    width: 100%;
  }
}
</style>
