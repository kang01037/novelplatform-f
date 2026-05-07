<template>
  <div class="novel-recommend-page">
    <header class="page-header">
      <div class="header-content">
        <h2 class="title">
          <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
          </svg>
          推荐排行
        </h2>
        <p class="subtitle">依据读者推荐数据生成，每日更新</p>
      </div>

      <div class="toolbar">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
              type="text"
              v-model="searchKeyword"
              placeholder="搜索推荐作品..."
              @keyup.enter="handleSearch"
          >
          <button @click="handleSearch" :disabled="!searchKeyword.trim()" class="search-btn">搜索</button>
        </div>
      </div>
    </header>

    <main class="content-area">
      <div v-if="loading" class="state-container">
        <div class="spinner"></div>
        <p>正在加载...</p>
      </div>

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

      <div v-else-if="novels.length === 0" class="state-container empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
        <p>暂无推荐作品</p>
      </div>

      <div v-else class="ranking-list">
        <div
            v-for="(novel, index) in novels"
            :key="novel.novelId"
            class="ranking-item"
        >
          <router-link :to="`/novel/detail/${novel.novelId}`" class="item-link">
            <div class="rank-number">
              <span class="num">{{ index + 1 }}</span>
            </div>

            <div class="item-cover">
              <img v-if="novel.coverImage" :src="novel.coverImage" :alt="novel.novelName">
              <div v-else class="cover-placeholder">{{ novel.novelName.charAt(0) }}</div>
              <div class="status-badge" :class="'status-' + novel.novelStatus">
                {{ getNovelStatusText(novel.novelStatus) }}
              </div>
            </div>

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

            <div class="item-stats">
              <div class="stat-box recommend">
                <span class="value">{{ formatNumber(novel.recommendCount) }}</span>
                <span class="label">推荐</span>
              </div>
              <div class="stat-box">
                <span class="value">{{ formatNumber(novel.clickCount) }}</span>
                <span class="label">点击</span>
              </div>
              <div class="stat-box">
                <span class="value">{{ formatNumber(novel.collectCount) }}</span>
                <span class="label">收藏</span>
              </div>
              <div class="stat-box">
                <span class="value">{{ novel.score ? novel.score.toFixed(1) : '--' }}</span>
                <span class="label">评分</span>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </main>

    <footer v-if="novels.length > 0" class="page-footer">
      <p>共 {{ novels.length }} 部作品 · 按推荐数排序</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { novelApi } from '../../api'

const router = useRouter()
const novels = ref([])
const loading = ref(false)
const loadError = ref('')
const searchKeyword = ref('')

const getNovelStatusText = (status) => {
  const map = { 0: '连载中', 1: '已完结', 2: '暂停' }
  return map[status] || '未知'
}

const getCategoryName = (categoryId) => {
  const map = { 1: '玄幻奇幻', 2: '武侠仙侠', 3: '都市言情', 4: '科幻灵异', 5: '游戏竞技', 6: '历史军事' }
  return map[categoryId] || '未分类'
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

    const response = await novelApi.getNovels()
    if (response.data.code === 200 || response.data.message === 'success') {
      let novelData = response.data.data || []
      if (!Array.isArray(novelData)) novelData = []

      // 搜索过滤
      if (searchKeyword.value.trim()) {
        const kw = searchKeyword.value.trim().toLowerCase()
        novelData = novelData.filter(n =>
          (n.novelName && n.novelName.toLowerCase().includes(kw)) ||
          (n.authorId && n.authorId.toString().includes(kw))
        )
      }

      // 按推荐数排序
      novelData.sort((a, b) => (b.recommendCount || 0) - (a.recommendCount || 0))

      novels.value = novelData
    } else {
      loadError.value = response.data.message || '获取数据失败'
    }
  } catch (err) {
    console.error('获取推荐列表失败:', err)
    loadError.value = '网络连接异常，请检查后端服务'
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  getNovels()
}

onMounted(() => getNovels())
</script>

<style scoped>
.novel-recommend-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header { margin-bottom: 2rem; }

.header-content { margin-bottom: 1.5rem; text-align: center; }

.title {
  font-size: 1.8rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0 0 0.5rem;
}

.title-icon {
  width: 28px;
  height: 28px;
  color: rgba(255, 255, 255, 0.5);
}

.subtitle {
  color: rgba(168, 216, 234, 0.5);
  font-size: 0.9rem;
  margin: 0;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 0.2rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: border-color 0.3s;
}

.search-box:focus-within {
  border-color: rgba(79, 172, 254, 0.4);
}

.search-icon {
  width: 18px;
  height: 18px;
  margin-left: 0.8rem;
  color: rgba(168, 216, 234, 0.4);
}

.search-box input {
  border: none;
  background: transparent;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  width: 200px;
  color: rgba(255, 255, 255, 0.85);
}

.search-box input::placeholder { color: rgba(168, 216, 234, 0.4); }
.search-box input:focus { outline: none; }

.search-btn {
  background: rgba(79, 172, 254, 0.15);
  color: #4facfe;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 1.2rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.search-btn:hover:not(:disabled) { background: rgba(79, 172, 254, 0.25); }
.search-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 2px solid rgba(255, 255, 255, 0.06);
  border-top: 2px solid rgba(79, 172, 254, 0.6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.error-icon-box svg, .empty-state svg { width: 48px; height: 48px; color: rgba(255, 255, 255, 0.12); margin-bottom: 1rem; }
.error-text { color: #ff6b81; margin-bottom: 1.5rem; }
.state-container p { color: rgba(168, 216, 234, 0.5); font-size: 0.9rem; }

.retry-btn {
  background: rgba(79, 172, 254, 0.15);
  color: #4facfe;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ranking-item {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  transition: background 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.ranking-item:last-child { border-bottom: none; }

.ranking-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.item-link {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 0.8rem 1rem;
  text-decoration: none;
  color: inherit;
}

.rank-number {
  flex-shrink: 0;
  width: 36px;
  text-align: center;
}

.num {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(168, 216, 234, 0.3);
}

.ranking-item:nth-child(1) .num,
.ranking-item:nth-child(2) .num,
.ranking-item:nth-child(3) .num {
  color: rgba(255, 215, 0, 0.6);
}

.item-cover {
  position: relative;
  width: 60px;
  height: 84px;
  border-radius: 6px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  flex-shrink: 0;
}

.item-cover img { width: 100%; height: 100%; object-fit: cover; }

.cover-placeholder {
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.3), rgba(0, 242, 254, 0.3));
  color: rgba(255, 255, 255, 0.6); font-size: 1.5rem; font-weight: bold;
}

.status-badge {
  position: absolute; top: 4px; right: 4px; padding: 1px 6px; border-radius: 4px;
  font-size: 0.6rem; font-weight: 600; color: white;
}
.status-0 { background: rgba(79, 172, 254, 0.7); }
.status-1 { background: rgba(0, 184, 148, 0.7); }
.status-2 { background: rgba(253, 203, 110, 0.7); }

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 0.3rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-desc {
  font-size: 0.8rem;
  color: rgba(168, 216, 234, 0.5);
  line-height: 1.4;
  height: 2.2em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 0 0 0.4rem;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: rgba(168, 216, 234, 0.4);
}

.item-meta svg { width: 12px; height: 12px; stroke: rgba(168, 216, 234, 0.3); }
.divider { color: rgba(255, 255, 255, 0.1); }

.item-stats {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 48px;
}

.stat-box .value {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.stat-box.recommend .value {
  color: rgba(79, 172, 254, 0.9);
}

.stat-box .label {
  font-size: 0.65rem;
  color: rgba(168, 216, 234, 0.35);
}

.page-footer {
  text-align: center;
  padding-top: 2rem;
  color: rgba(168, 216, 234, 0.4);
  font-size: 0.8rem;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .item-stats { gap: 0.5rem; }
  .stat-box { min-width: 40px; }
  .stat-box .value { font-size: 0.8rem; }
  .search-box input { width: 120px; }
  .item-link { gap: 0.8rem; padding: 0.6rem 0.5rem; }
}
</style>
