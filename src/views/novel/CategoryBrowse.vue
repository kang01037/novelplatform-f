<template>
  <div class="category-page">
    <header class="page-header">
      <div class="header-content">
        <h2 class="title">
          <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          分类浏览
        </h2>
        <p class="subtitle">按分类发现你喜欢的故事</p>
      </div>
    </header>

    <!-- 分类标签 -->
    <div class="category-tabs">
      <button
          class="category-tab"
          :class="{ active: activeCategory === '' }"
          @click="selectCategory('')"
      >全部</button>
      <button
          v-for="cat in categories"
          :key="cat.id"
          class="category-tab"
          :class="{ active: activeCategory === cat.id }"
          @click="selectCategory(cat.id)"
      >
        <span class="tab-icon">{{ cat.icon }}</span>
        {{ cat.name }}
      </button>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar glass-card">
      <div class="sort-group">
        <button
            v-for="opt in sortOptions"
            :key="opt.value"
            class="sort-btn"
            :class="{ active: sortBy === opt.value }"
            @click="changeSort(opt.value)"
        >{{ opt.label }}</button>
      </div>

      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
            type="text"
            v-model="searchKeyword"
            placeholder="在当前分类中搜索..."
            @keyup.enter="handleSearch"
        >
        <button @click="handleSearch" :disabled="!searchKeyword.trim()" class="search-btn">搜索</button>
      </div>
    </div>

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
        <p>{{ activeCategory ? '该分类暂无作品' : '暂无相关作品' }}</p>
      </div>

      <div v-else class="novel-grid">
        <div v-for="novel in novels" :key="novel.novelId" class="novel-card">
          <router-link :to="`/novel/detail/${novel.novelId}`" class="card-link">
            <div class="card-cover">
              <img v-if="novel.coverImage" :src="novel.coverImage" :alt="novel.novelName">
              <div v-else class="cover-placeholder">
                <span>{{ novel.novelName.charAt(0) }}</span>
              </div>
              <div class="status-badge" :class="'status-' + novel.novelStatus">
                {{ getNovelStatusText(novel.novelStatus) }}
              </div>
              <div class="cover-mask">
                <span class="view-detail">查看详情</span>
              </div>
            </div>
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

    <footer v-if="novels.length > 0" class="page-footer">
      <p>{{ activeCategory ? getCategoryName(activeCategory) + ' — ' : '' }}共 {{ novels.length }} 部作品</p>
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
const activeCategory = ref('')
const sortBy = ref('default')

const categories = [
  { id: 1, name: '玄幻奇幻' },
  { id: 2, name: '武侠仙侠' },
  { id: 3, name: '都市言情' },
  { id: 4, name: '科幻灵异' },
  { id: 5, name: '历史军事' },
  { id: 6, name: '游戏竞技' }
]

const sortOptions = [
  { value: 'default', label: '默认' },
  { value: 'click', label: '点击量' },
  { value: 'collect', label: '收藏数' },
  { value: 'score', label: '评分' },
  { value: 'update', label: '更新时间' }
]

const getNovelStatusText = (status) => {
  const map = { 0: '连载中', 1: '已完结', 2: '暂停' }
  return map[status] || '未知'
}

const getCategoryName = (id) => {
  const cat = categories.find(c => c.id === id)
  return cat ? cat.name : ''
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

    let response
    if (activeCategory.value) {
      response = await novelApi.getNovelsByCategory(activeCategory.value)
    } else {
      response = await novelApi.getNovels()
    }

    if (response.data.code === 200 || response.data.message === 'success') {
      let novelData = response.data.data || []
      if (!Array.isArray(novelData)) novelData = []

      // 搜索过滤
      if (searchKeyword.value.trim()) {
        const kw = searchKeyword.value.trim().toLowerCase()
        novelData = novelData.filter(n =>
          n.novelName.toLowerCase().includes(kw) ||
          (n.authorName && n.authorName.toLowerCase().includes(kw))
        )
      }

      // 排序
      switch (sortBy.value) {
        case 'click': novelData.sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0)); break
        case 'collect': novelData.sort((a, b) => (b.collectCount || 0) - (a.collectCount || 0)); break
        case 'score': novelData.sort((a, b) => (b.score || 0) - (a.score || 0)); break
        case 'update': novelData.sort((a, b) => new Date(b.lastUpdateTime || 0) - new Date(a.lastUpdateTime || 0)); break
      }

      novels.value = novelData
    } else {
      loadError.value = response.data.message || '获取数据失败'
    }
  } catch (err) {
    console.error(err)
    loadError.value = '网络连接异常，请检查后端服务'
  } finally {
    loading.value = false
  }
}

const selectCategory = (id) => {
  activeCategory.value = id
  getNovels()
}

const changeSort = (value) => {
  sortBy.value = value
  getNovels()
}

const handleSearch = () => {
  getNovels()
}

onMounted(() => getNovels())
</script>

<style scoped>
.category-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: transparent;
}

.page-header { margin-bottom: 2rem; }

.header-content { margin-bottom: 1.5rem; text-align: center; }

.title {
  font-size: 2rem; font-weight: 800; color: rgba(255, 255, 255, 0.85);
  display: inline-flex; align-items: center; gap: 0.8rem; margin: 0 0 0.5rem;
}

.title-icon { width: 32px; height: 32px; color: #4facfe; }

.subtitle { color: rgba(168, 216, 234, 0.6); font-size: 1rem; margin: 0; }

/* 分类标签 */
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.5rem;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(168, 216, 234, 0.7);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.category-tab:hover {
  border-color: rgba(79, 172, 254, 0.4);
  color: #4facfe;
  background: rgba(79, 172, 254, 0.1);
}

.category-tab.active {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.tab-icon { font-size: 1.1rem; }

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  gap: 1.5rem;
  flex-wrap: wrap;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
}

.sort-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sort-btn {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(168, 216, 234, 0.7);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.sort-btn:hover {
  border-color: rgba(79, 172, 254, 0.3);
  color: #4facfe;
}

.sort-btn.active {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border-color: transparent;
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 30px;
  padding: 0.3rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.search-box:focus-within { border-color: #4facfe; box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.15); }

.search-icon { width: 20px; height: 20px; margin-left: 1rem; color: rgba(168, 216, 234, 0.5); }

.search-box input {
  border: none; background: transparent; padding: 0.5rem 1rem; font-size: 0.95rem;
  width: 200px; color: rgba(255, 255, 255, 0.85);
}
.search-box input::placeholder { color: rgba(168, 216, 234, 0.4); }
.search-box input:focus { outline: none; }

.search-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white; border: none; border-radius: 25px; padding: 0.5rem 1.5rem;
  font-weight: 600; cursor: pointer; transition: transform 0.2s;
}
.search-btn:hover:not(:disabled) { transform: scale(1.05); }
.search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* 状态 */
.state-container {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 5rem 2rem; text-align: center;
}

.spinner {
  width: 40px; height: 40px; border: 3px solid rgba(255, 255, 255, 0.08);
  border-top: 3px solid #4facfe; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;
}

.error-icon-box svg, .empty-state svg { width: 60px; height: 60px; color: rgba(255, 255, 255, 0.15); margin-bottom: 1rem; }
.error-text { color: #ff6b81; margin-bottom: 1.5rem; max-width: 400px; }
.state-container p { color: rgba(168, 216, 234, 0.6); }

.retry-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white; border: none; padding: 0.6rem 2rem; border-radius: 20px; cursor: pointer; font-weight: 600;
}

/* 网格 */
.novel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 2rem;
}

.novel-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.novel-card:hover { transform: translateY(-8px); box-shadow: 0 15px 30px rgba(79, 172, 254, 0.15); }
.card-link { text-decoration: none; color: inherit; display: block; }

.card-cover { position: relative; height: 200px; overflow: hidden; background: rgba(255, 255, 255, 0.05); }
.card-cover img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.novel-card:hover .card-cover img { transform: scale(1.08); }

.cover-placeholder {
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white; font-size: 4rem; font-weight: bold; opacity: 0.8;
}

.status-badge {
  position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 20px;
  font-size: 0.75rem; font-weight: 600; color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); z-index: 2;
}
.status-0 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.status-1 { background: #00b894; }
.status-2 { background: #fdcb6e; color: #333; }

.cover-mask {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.3s;
}
.novel-card:hover .cover-mask { opacity: 1; }

.view-detail {
  color: white; border: 1px solid white; padding: 0.5rem 1.5rem;
  border-radius: 20px; font-size: 0.9rem; font-weight: 500; backdrop-filter: blur(5px);
}

.card-body { padding: 1.2rem 1.5rem 1.5rem; }

.book-title {
  font-size: 1.1rem; font-weight: 700; color: rgba(255, 255, 255, 0.85);
  margin: 0 0 0.5rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.book-desc {
  font-size: 0.85rem; color: rgba(168, 216, 234, 0.6); line-height: 1.5;
  height: 2.55em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; margin: 0 0 1rem;
}

.book-meta {
  display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem;
  color: #4facfe; margin-bottom: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.book-meta svg { width: 14px; height: 14px; flex-shrink: 0; }

.book-stats {
  display: flex; justify-content: space-between; padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-item {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  font-size: 0.8rem; color: rgba(168, 216, 234, 0.6);
}
.stat-item svg { width: 16px; height: 16px; stroke: rgba(168, 216, 234, 0.5); }
.stat-item.highlight svg { stroke: none; fill: #f1c40f; color: #f1c40f; }
.stat-item span { font-weight: 600; color: rgba(255, 255, 255, 0.7); }

.page-footer { text-align: center; padding-top: 3rem; color: rgba(168, 216, 234, 0.5); font-size: 0.9rem; }

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .toolbar { flex-direction: column; align-items: stretch; }
  .sort-group { width: 100%; justify-content: center; }
  .search-box { width: 100%; }
  .search-box input { flex: 1; width: 100%; }
}
</style>
