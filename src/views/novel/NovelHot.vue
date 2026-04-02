<template>
  <div class="novel-recommend-page">
    <!-- 顶部区域 -->
    <header class="page-header">
      <div class="header-content">
        <h2 class="title">
          <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
          </svg>
          推荐排行榜
        </h2>
        <p class="subtitle">读者最爱推荐，发现优质好书</p>
      </div>

      <!-- 排序工具栏 -->
      <div class="toolbar glass-card">
        <div class="filter-group">
          <div class="select-wrapper">
            <select v-model="categoryFilter" @change="handleFilter">
              <option value="">全部类别</option>
              <option value="1">玄幻奇幻</option>
              <option value="2">武侠仙侠</option>
              <option value="3">都市言情</option>
              <option value="4">科幻灵异</option>
              <option value="5">游戏竞技</option>
              <option value="6">历史军事</option>
            </select>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          <div class="sort-buttons">
            <button
                :class="{ active: sortBy === 'recommend' }"
                @click="changeSort('recommend')"
                class="sort-btn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
              推荐数
            </button>
            <button
                :class="{ active: sortBy === 'click' }"
                @click="changeSort('click')"
                class="sort-btn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              点击量
            </button>
            <button
                :class="{ active: sortBy === 'collect' }"
                @click="changeSort('collect')"
                class="sort-btn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              收藏数
            </button>
            <button
                :class="{ active: sortBy === 'score' }"
                @click="changeSort('score')"
                class="sort-btn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              评分
            </button>
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
        <p>正在加载推荐排行...</p>
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

      <!-- 小说排行榜 -->
      <div v-else class="ranking-list">
        <div
            v-for="(novel, index) in novels"
            :key="novel.novelId"
            class="ranking-item"
            :class="getRankClass(index)"
        >
          <router-link :to="`/novel/detail/${novel.novelId}`" class="item-link">
            <!-- 排名序号 -->
            <div class="rank-number">
              <span v-if="index < 3" class="medal">{{ index + 1 }}</span>
              <span v-else class="num">{{ index + 1 }}</span>
            </div>

            <!-- 封面 -->
            <div class="item-cover">
              <img v-if="novel.coverImage" :src="novel.coverImage" :alt="novel.novelName">
              <div v-else class="cover-placeholder">{{ novel.novelName.charAt(0) }}</div>
              <!-- 状态标签 -->
              <div class="status-badge" :class="'status-' + novel.novelStatus">
                {{ getNovelStatusText(novel.novelStatus) }}
              </div>
            </div>

            <!-- 信息 -->
            <div class="item-info">
              <h3 class="item-title">{{ novel.novelName }}</h3>
              <p class="item-desc">{{ novel.content }}</p>
              <div class="item-meta">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>{{ novel.authorId }}</span>
                <span class="divider">|</span>
                <span>{{ getCategoryName(novel.categoryId) }}</span>
              </div>
            </div>

            <!-- 数据统计 -->
            <div class="item-stats">
              <div class="stat-box highlight" :class="{ 'active': sortBy === 'recommend' }">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
                <span class="label">推荐</span>
                <span class="value">{{ formatNumber(novel.recommendCount) }}</span>
              </div>
              <div class="stat-box" :class="{ 'active': sortBy === 'click' }">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span class="label">点击</span>
                <span class="value">{{ formatNumber(novel.clickCount) }}</span>
              </div>
              <div class="stat-box" :class="{ 'active': sortBy === 'collect' }">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span class="label">收藏</span>
                <span class="value">{{ formatNumber(novel.collectCount) }}</span>
              </div>
              <div class="stat-box" :class="{ 'active': sortBy === 'score' }">
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span class="label">评分</span>
                <span class="value">{{ novel.score ? novel.score.toFixed(1) : '--' }}</span>
              </div>
            </div>

            <!-- 箭头 -->
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </router-link>
        </div>
      </div>
    </main>

    <!-- 底部 -->
    <footer v-if="novels.length > 0" class="page-footer">
      <p>已为您展示 {{ novels.length }} 部作品 · 按{{ getSortText(sortBy) }}排序</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { novelApi } from '../../api'

const router = useRouter()
const route = useRoute()
const novels = ref([])
const loading = ref(false)
const loadError = ref('')
const searchKeyword = ref('')
const sortBy = ref('recommend')
const categoryFilter = ref('')

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

const getRankClass = (index) => {
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return ''
}

const getSortText = (sortType) => {
  const map = {
    'recommend': '推荐数',
    'click': '点击量',
    'collect': '收藏数',
    'score': '评分'
  }
  return map[sortType] || '推荐数'
}

const getNovels = async () => {
  try {
    loading.value = true
    loadError.value = ''

    const response = await novelApi.getNovels()
    if (response.data.code === 200 || response.data.message === 'success') {
      let novelData = response.data.data || []
      if (!Array.isArray(novelData)) novelData = []

      // 分类筛选 - 先执行分类过滤
      if (categoryFilter.value !== '') {
        novelData = novelData.filter(novel => novel.categoryId === parseInt(categoryFilter.value))
      }

      // 搜索过滤
      if (searchKeyword.value.trim()) {
        const keyword = searchKeyword.value.trim().toLowerCase()
        novelData = novelData.filter(novel =>
            (novel.novelName && novel.novelName.toLowerCase().includes(keyword)) ||
            (novel.authorId && novel.authorId.toString().toLowerCase().includes(keyword))
        )
      }

      // 排序逻辑 - 核心功能
      switch (sortBy.value) {
        case 'recommend':
          novelData.sort((a, b) => (b.recommendCount || 0) - (a.recommendCount || 0))
          break
        case 'click':
          novelData.sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
          break
        case 'collect':
          novelData.sort((a, b) => (b.collectCount || 0) - (a.collectCount || 0))
          break
        case 'score':
          novelData.sort((a, b) => (b.score || 0) - (a.score || 0))
          break
      }

      novels.value = novelData
    } else {
      loadError.value = response.data.message || '获取数据失败'
    }
  } catch (err) {
    console.error('获取小说列表失败:', err)
    loadError.value = '网络连接异常，请检查后端服务'
  } finally {
    loading.value = false
  }
}

const changeSort = (type) => {
  sortBy.value = type
  getNovels()
}

const handleFilter = () => {
  getNovels()
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    getNovels()
  }
}

// 监听路由参数变化（支持 URL 参数）
watch(() => route.query.keyword, (newKeyword) => {
  if (newKeyword) {
    searchKeyword.value = newKeyword
    getNovels()
  }
}, { immediate: true })

onMounted(() => {
  // 检查 URL 参数
  if (route.query.keyword) {
    searchKeyword.value = route.query.keyword
  }
  getNovels()
})
</script>

<style scoped>
/* --- 页面整体布局 --- */
.novel-recommend-page {
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
  color: #f5576c;
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
  align-items: center;
  flex-wrap: wrap;
}

.select-wrapper {
  position: relative;
}

.select-wrapper select {
  appearance: none;
  padding: 0.7rem 2.5rem 0.7rem 1.2rem;
  border-radius: 25px;
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
  border-color: #f5576c;
}

.select-wrapper select:focus {
  outline: none;
  border-color: #f5576c;
  box-shadow: 0 0 0 3px rgba(245, 87, 108, 0.15);
}

.select-wrapper .arrow-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #999;
  pointer-events: none;
}

.sort-buttons {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.2rem;
  border-radius: 25px;
  border: 1px solid rgba(0,0,0,0.08);
  background: #fff;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.sort-btn svg {
  width: 16px;
  height: 16px;
}

.sort-btn:hover {
  border-color: #f5576c;
  color: #f5576c;
}

.sort-btn.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(245, 87, 108, 0.3);
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
  border-color: #f5576c;
  box-shadow: 0 0 0 3px rgba(245, 87, 108, 0.15);
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
  border-top: 3px solid #f5576c;
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
  background: #f5576c;
  color: white;
  border: none;
  padding: 0.6rem 2rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
}

/* --- 排行榜列表 --- */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.ranking-item {
  background: white;
  border-radius: 16px;
  padding: 1.2rem 1.5rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  position: relative;
}

.ranking-item:hover {
  transform: translateX(8px);
  box-shadow: 0 10px 25px rgba(245, 87, 108, 0.15);
}

.ranking-item.rank-gold {
  background: linear-gradient(135deg, #fff9e6 0%, #fff 100%);
  border: 1px solid #ffd700;
}

.ranking-item.rank-silver {
  background: linear-gradient(135deg, #f5f5f5 0%, #fff 100%);
  border: 1px solid #c0c0c0;
}

.ranking-item.rank-bronze {
  background: linear-gradient(135deg, #fff0e6 0%, #fff 100%);
  border: 1px solid #cd7f32;
}

.item-link {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  text-decoration: none;
  color: inherit;
}

/* --- 排名序号 --- */
.rank-number {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.medal {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 800;
  color: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.rank-gold .medal {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
}

.rank-silver .medal {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
}

.rank-bronze .medal {
  background: linear-gradient(135deg, #cd7f32 0%, #e8a87c 100%);
}

.num {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ddd;
}

/* --- 封面 --- */
.item-cover {
  position: relative;
  width: 80px;
  height: 110px;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f2f5;
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
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
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

.status-0 { background: #667eea; }
.status-1 { background: #00b894; }
.status-2 { background: #fdcb6e; color: #333; }

/* --- 信息区域 --- */
.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-desc {
  font-size: 0.85rem;
  color: #888;
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
  color: #666;
}

.item-meta svg {
  width: 14px;
  height: 14px;
}

.divider {
  color: #ccc;
}

/* --- 统计数据 --- */
.item-stats {
  display: flex;
  gap: 1.5rem;
  flex-shrink: 0;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 60px;
  padding: 0.5rem;
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.3s;
}

.stat-box svg {
  width: 18px;
  height: 18px;
  color: #999;
}

.stat-box.highlight svg {
  color: #f5576c;
}

.stat-box.active {
  background: rgba(245, 87, 108, 0.1);
}

.stat-box.active svg {
  color: #f5576c;
}

.stat-box .label {
  font-size: 0.7rem;
  color: #999;
}

.stat-box .value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #333;
}

/* --- 箭头 --- */
.arrow-icon {
  width: 24px;
  height: 24px;
  color: #ccc;
  flex-shrink: 0;
  transition: all 0.3s;
}

.ranking-item:hover .arrow-icon {
  color: #f5576c;
  transform: translateX(5px);
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
    justify-content: center;
  }

  .select-wrapper {
    width: 100%;
  }

  .select-wrapper select {
    width: 100%;
  }

  .sort-buttons {
    width: 100%;
    justify-content: center;
  }

  .search-box {
    width: 100%;
    margin-top: 1rem;
  }

  .search-box input {
    flex: 1;
    width: 100%;
  }

  .item-stats {
    gap: 0.8rem;
  }

  .stat-box {
    min-width: 50px;
    padding: 0.3rem;
  }

  .stat-box svg {
    width: 14px;
    height: 14px;
  }

  .stat-box .label {
    font-size: 0.65rem;
  }

  .stat-box .value {
    font-size: 0.85rem;
  }
}
</style>
