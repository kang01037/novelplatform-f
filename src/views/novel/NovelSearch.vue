<template>
  <div class="novel-search-page">
    <!-- 顶部搜索区域 -->
    <header class="search-header">
      <div class="search-box-container">
        <h1 class="page-title">
          <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          搜索小说
        </h1>
        <div class="search-input-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
              type="text"
              v-model="keyword"
              placeholder="请输入小说名、作者名..."
              @keyup.enter="handleSearch"
              class="search-input"
          >
          <button @click="handleSearch" :disabled="!keyword.trim()" class="search-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
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
        <p>正在搜索中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="state-container error-state">
        <div class="error-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <p class="error-text">{{ error }}</p>
        <button @click="handleSearch" class="retry-btn">重新搜索</button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!hasSearched" class="state-container empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <p>输入关键词开始搜索</p>
        <p class="hint">支持搜索小说名、作者名</p>
      </div>

      <!-- 搜索结果 -->
      <div v-else-if="results.length === 0" class="state-container empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
        <p>未找到相关小说</p>
        <p class="hint">试试其他关键词吧</p>
      </div>

      <!-- 结果列表 -->
      <div v-else class="results-container">
        <div class="results-header">
          <span class="results-count">找到 {{ results.length }} 部相关作品</span>
          <div class="sort-options">
            <span class="label">排序：</span>
            <button
                :class="{ active: sortBy === 'relevance' }"
                @click="changeSort('relevance')"
                class="sort-btn"
            >
              相关度
            </button>
            <button
                :class="{ active: sortBy === 'recommend' }"
                @click="changeSort('recommend')"
                class="sort-btn"
            >
              推荐数
            </button>
            <button
                :class="{ active: sortBy === 'click' }"
                @click="changeSort('click')"
                class="sort-btn"
            >
              点击量
            </button>
            <button
                :class="{ active: sortBy === 'score' }"
                @click="changeSort('score')"
                class="sort-btn"
            >
              评分
            </button>
          </div>
        </div>

        <div class="results-list">
          <div
              v-for="(novel, index) in results"
              :key="novel.novelId"
              class="result-item"
          >
            <router-link :to="`/novel/detail/${novel.novelId}`" class="item-link">
              <!-- 封面 -->
              <div class="item-cover">
                <img v-if="novel.coverImage" :src="novel.coverImage" :alt="novel.novelName">
                <div v-else class="cover-placeholder">{{ novel.novelName.charAt(0) }}</div>
                <div class="status-badge" :class="'status-' + novel.novelStatus">
                  {{ getNovelStatusText(novel.novelStatus) }}
                </div>
              </div>

              <!-- 信息 -->
              <div class="item-info">
                <h3 class="item-title">
                  <span class="highlight" v-html="highlightText(novel.novelName)"></span>
                </h3>
                <p class="item-desc">{{ novel.content || '暂无简介' }}</p>
                <div class="item-meta">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>作者：{{ novel.authorId }}</span>
                  <span class="divider">|</span>
                  <span>类别：{{ getCategoryName(novel.categoryId) }}</span>
                </div>
              </div>

              <!-- 统计 -->
              <div class="item-stats">
                <div class="stat-item" title="推荐">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                  </svg>
                  <span>{{ formatNumber(novel.recommendCount) }}</span>
                </div>
                <div class="stat-item" title="点击">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <span>{{ formatNumber(novel.clickCount) }}</span>
                </div>
                <div class="stat-item" title="收藏">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span>{{ formatNumber(novel.collectCount) }}</span>
                </div>
                <div class="stat-item highlight" title="评分">
                  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span>{{ novel.score ? novel.score.toFixed(1) : '--' }}</span>
                </div>
              </div>

              <!-- 箭头 -->
              <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { novelApi } from '../../api'

const route = useRoute()
const router = useRouter()
const keyword = ref('')
const results = ref([])
const loading = ref(false)
const error = ref('')
const hasSearched = ref(false)
const sortBy = ref('relevance')

const getNovelStatusText = (status) => {
  const map = { 0: '连载中', 1: '已完结', 2: '暂停' }
  return map[status] || '未知'
}

const getCategoryName = (categoryId) => {
  const categoryMap = {
    1: '玄幻奇幻',
    2: '武侠仙侠',
    3: '都市言情',
    4: '科幻灵异',
    5: '游戏竞技',
    6: '历史军事'
  }
  return categoryMap[categoryId] || '未分类'
}

const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿'
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num.toString()
}

// 高亮关键词
const highlightText = (text) => {
  if (!keyword.value.trim() || !text) return text
  const regex = new RegExp(`(${keyword.value.trim()})`, 'gi')
  return text.replace(regex, '<span class="highlight-match">$1</span>')
}

const handleSearch = async () => {
  if (!keyword.value.trim()) {
    error.value = '请输入搜索关键词'
    return
  }

  loading.value = true
  error.value = ''
  hasSearched.value = true

  try {
    const response = await novelApi.getNovels()
    if (response.data.code === 200 || response.data.message === 'success') {
      let novelData = response.data.data || []
      if (!Array.isArray(novelData)) novelData = []

      // 搜索过滤
      const searchKeyword = keyword.value.trim().toLowerCase()
      const filtered = novelData.filter(novel =>
          (novel.novelName && novel.novelName.toLowerCase().includes(searchKeyword)) ||
          (novel.authorId && novel.authorId.toString().toLowerCase().includes(searchKeyword)) ||
          (novel.content && novel.content.toLowerCase().includes(searchKeyword))
      )

      // 排序
      switch (sortBy.value) {
        case 'recommend':
          filtered.sort((a, b) => (b.recommendCount || 0) - (a.recommendCount || 0))
          break
        case 'click':
          filtered.sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
          break
        case 'score':
          filtered.sort((a, b) => (b.score || 0) - (a.score || 0))
          break
        default:
          // 相关度排序：包含关键词的位置越靠前，相关度越高
          filtered.sort((a, b) => {
            const aNameIndex = a.novelName.toLowerCase().indexOf(searchKeyword)
            const bNameIndex = b.novelName.toLowerCase().indexOf(searchKeyword)
            if (aNameIndex !== -1 && bNameIndex !== -1) return aNameIndex - bNameIndex
            if (aNameIndex !== -1) return -1
            if (bNameIndex !== -1) return 1
            return 0
          })
      }

      results.value = filtered
    } else {
      error.value = response.data.message || '搜索失败'
    }
  } catch (err) {
    console.error('搜索失败:', err)
    error.value = '搜索失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const changeSort = (type) => {
  sortBy.value = type
  if (hasSearched.value) {
    handleSearch()
  }
}

onMounted(() => {
  // 从 URL 参数获取关键词
  if (route.query.keyword) {
    keyword.value = route.query.keyword
    handleSearch()
  }
})
</script>

<style scoped>
/* --- 页面整体布局 --- */
.novel-search-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: transparent;
  min-height: calc(100vh - 200px);
}

/* --- 搜索头部 --- */
.search-header {
  margin-bottom: 2.5rem;
  text-align: center;
}

.search-box-container {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.85);
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 2rem;
}

.title-icon {
  width: 32px;
  height: 32px;
  color: #4facfe;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 50px;
  padding: 0.4rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border: 2px solid transparent;
  transition: all 0.3s;
  backdrop-filter: blur(20px);
}

.search-input-wrapper:focus-within {
  border-color: #4facfe;
  box-shadow: 0 4px 25px rgba(79, 172, 254, 0.2);
}

.search-icon {
  width: 22px;
  height: 22px;
  margin-left: 1.2rem;
  color: rgba(168, 216, 234, 0.5);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
}

.search-input::placeholder {
  color: rgba(168, 216, 234, 0.4);
}

.search-input:focus {
  outline: none;
}

.search-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  padding: 0.7rem 1.8rem;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.search-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-btn svg {
  width: 18px;
  height: 18px;
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
  border: 3px solid rgba(255, 255, 255, 0.08);
  border-top: 3px solid #4facfe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.state-container p {
  color: rgba(168, 216, 234, 0.6);
}

.error-icon-box svg, .empty-state svg {
  width: 60px;
  height: 60px;
  color: rgba(255, 255, 255, 0.15);
  margin-bottom: 1rem;
}

.error-text {
  color: #ff6b81;
  margin-bottom: 1.5rem;
  max-width: 400px;
}

.retry-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  padding: 0.6rem 2rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
}

.hint {
  color: rgba(168, 216, 234, 0.4);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* --- 结果区域 --- */
.results-container {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.results-count {
  font-size: 0.95rem;
  color: rgba(168, 216, 234, 0.7);
  font-weight: 500;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.sort-options .label {
  font-size: 0.9rem;
  color: rgba(168, 216, 234, 0.6);
}

.sort-btn {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(168, 216, 234, 0.7);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
}

.sort-btn:hover {
  border-color: #4facfe;
  color: #4facfe;
}

.sort-btn.active {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border-color: transparent;
}

/* --- 结果列表 --- */
.results-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.result-item {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  padding: 1.2rem;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.result-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(79, 172, 254, 0.2);
  transform: translateX(5px);
}

.item-link {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  text-decoration: none;
  color: inherit;
}

.item-cover {
  position: relative;
  width: 80px;
  height: 110px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.item-cover img {
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
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  font-size: 2rem;
  font-weight: bold;
}

.status-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.status-0 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.status-1 { background: #00b894; }
.status-2 { background: #fdcb6e; color: #333; }

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-title .highlight-match {
  color: #4facfe;
  font-weight: 700;
}

.item-desc {
  font-size: 0.85rem;
  color: rgba(168, 216, 234, 0.6);
  line-height: 1.5;
  height: 2.55em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 0 0 0.8rem;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: rgba(168, 216, 234, 0.6);
}

.item-meta svg {
  width: 14px;
  height: 14px;
  stroke: rgba(168, 216, 234, 0.4);
}

.divider {
  color: rgba(255, 255, 255, 0.15);
}

/* --- 统计数据 --- */
.item-stats {
  display: flex;
  gap: 1.2rem;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 50px;
}

.stat-item svg {
  width: 16px;
  height: 16px;
  stroke: rgba(168, 216, 234, 0.4);
}

.stat-item.highlight svg {
  stroke: none;
  fill: #f1c40f;
  color: #f1c40f;
}

.stat-item span {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

/* --- 箭头 --- */
.arrow-icon {
  width: 24px;
  height: 24px;
  stroke: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
  transition: all 0.3s;
}

.result-item:hover .arrow-icon {
  stroke: #4facfe;
  transform: translateX(5px);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* --- 响应式 --- */
@media (max-width: 768px) {
  .search-input-wrapper {
    flex-wrap: wrap;
  }

  .search-input {
    width: 100%;
    padding: 0.8rem;
  }

  .search-btn {
    width: 100%;
    justify-content: center;
    margin-top: 0.5rem;
  }

  .results-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .sort-options {
    flex-wrap: wrap;
  }

  .item-link {
    flex-wrap: wrap;
  }

  .item-stats {
    width: 100%;
    justify-content: space-around;
    margin-top: 1rem;
  }
}
</style>
