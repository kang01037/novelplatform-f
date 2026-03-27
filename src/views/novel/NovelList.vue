<template>
  <div class="novel-list-container">
    <div class="page-header">
      <h2>📚 小说列表</h2>
      <div class="header-actions">
        <div class="filter-group">
          <select v-model="statusFilter" @change="handleFilter">
            <option value="">全部状态</option>
            <option value="0">连载中</option>
            <option value="1">已完结</option>
            <option value="2">暂停更新</option>
          </select>

          <select v-model="sortBy" @change="handleSort">
            <option value="default">默认排序</option>
            <option value="click">点击量</option>
            <option value="collect">收藏数</option>
            <option value="score">评分</option>
            <option value="update">更新时间</option>
          </select>
        </div>

        <div class="search-box">
          <input
              type="text"
              v-model="searchKeyword"
              placeholder="搜索小说名..."
              @keyup.enter="handleSearch"
          >
          <button @click="handleSearch" :disabled="!searchKeyword.trim()">
            🔍 搜索
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="loadError" class="error-container">
      <p class="error-message">❌ {{ loadError }}</p>
      <button @click="getNovels" class="btn-retry">重试</button>
    </div>

    <div v-else-if="novels.length === 0" class="empty-container">
      <p class="empty-message">😕 暂无小说数据</p>
    </div>

    <div v-else class="novel-grid">
      <div v-for="novel in novels" :key="novel.novelId" class="novel-card">
        <router-link :to="`/novel/detail/${novel.novelId}`" class="novel-link">
          <div class="novel-cover">
            <img :src="novel.coverImage" :alt="novel.novelName" v-if="novel.coverImage">
            <div class="cover-placeholder" v-else>
              {{ novel.novelName.charAt(0) }}
            </div>
            <div class="cover-overlay">
              <span class="status-tag" :class="'status-' + novel.novelStatus">
                {{ getNovelStatusText(novel.novelStatus) }}
              </span>
            </div>
          </div>
          <div class="novel-info">
            <h3 class="novel-title">{{ novel.novelName }}</h3>
            <p class="novel-desc">{{ novel.content }}</p>
            <div class="novel-meta">
              <span class="last-chapter">
                📖 {{ novel.lastChapterName || '暂无章节' }}
              </span>
            </div>
            <div class="novel-stats">
              <div class="stat-item" title="点击量">
                <span class="stat-icon">🔥</span>
                <span class="stat-value">{{ formatNumber(novel.clickCount) }}</span>
              </div>
              <div class="stat-item" title="收藏数">
                <span class="stat-icon">⭐</span>
                <span class="stat-value">{{ formatNumber(novel.collectCount) }}</span>
              </div>
              <div class="stat-item" title="推荐数">
                <span class="stat-icon">👍</span>
                <span class="stat-value">{{ formatNumber(novel.recommendCount) }}</span>
              </div>
              <div class="stat-item" title="评分">
                <span class="stat-icon">📊</span>
                <span class="stat-value">{{ novel.score ? novel.score.toFixed(1) : '--' }}</span>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <div v-if="novels.length > 0" class="page-footer">
      <p>共 {{ novels.length }} 部小说</p>
    </div>
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
  const statusMap = {
    0: '连载中',
    1: '已完结',
    2: '暂停更新'
  }
  return statusMap[status] || '未知'
}

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

const getNovels = async () => {
  try {
    loading.value = true
    loadError.value = ''

    console.log('====== 开始请求小说列表 ======')
    console.log('请求 URL:', '/api/novel/list')
    console.log('完整 URL:', 'http://localhost:5173/api/novel/list')

    // 直接使用 axios 请求，绕过 API 封装
    const response = await axios.get('/api/novel/list', {
      baseURL: 'http://localhost:5173',
      timeout: 10000
    })

    console.log('====== 收到响应 ======')
    console.log('响应数据:', response)
    console.log('响应状态:', response.status)
    console.log('响应数据 data:', response.data)

    if (response.status === 200) {
      const { code, message, data } = response.data

      console.log('code:', code)
      console.log('message:', message)
      console.log('data:', data)
      console.log('data 是否为数组:', Array.isArray(data))

      if (code === 200 || message === 'success') {
        let novelData = data || []

        if (!Array.isArray(novelData)) {
          console.error('data 不是数组:', novelData)
          novelData = []
        }

        console.log('处理后的数据:', novelData)
        console.log('数据长度:', novelData.length)

        // 状态筛选
        if (statusFilter.value !== '') {
          novelData = novelData.filter(novel => novel.novelStatus === parseInt(statusFilter.value))
        }

        // 排序
        switch (sortBy.value) {
          case 'click':
            novelData.sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
            break
          case 'collect':
            novelData.sort((a, b) => (b.collectCount || 0) - (a.collectCount || 0))
            break
          case 'score':
            novelData.sort((a, b) => (b.score || 0) - (a.score || 0))
            break
          case 'update':
            novelData.sort((a, b) => new Date(b.lastUpdateTime || 0) - new Date(a.lastUpdateTime || 0))
            break
        }

        novels.value = novelData
        console.log('最终 novels:', novels.value)
        console.log('====== 数据加载完成 ======')
      } else {
        loadError.value = `API 返回错误：${message || '未知错误'}`
        console.error('API 错误:', response.data)
      }
    }
  } catch (err) {
    console.error('====== 请求失败 ======')
    console.error('错误类型:', err)
    console.error('错误消息:', err.message)
    console.error('错误堆栈:', err.stack)

    if (err.response) {
      console.error('错误响应状态:', err.response.status)
      console.error('错误响应数据:', err.response.data)
      loadError.value = `服务器错误 (${err.response.status}): ${err.response.data?.message || '未知错误'}`
    } else if (err.request) {
      console.error('请求未得到响应:', err.request)
      loadError.value = '无法连接到服务器，请检查：\n1. 前端开发服务器是否运行 (npm run dev)\n2. 后端服务是否启动 (http://localhost:8080)\n3. 查看 Network 标签中的请求详情'
    } else {
      loadError.value = `请求错误：${err.message}`
    }
  } finally {
    loading.value = false
    console.log('====== 加载结束，loading = false ======')
  }
}

const handleFilter = () => {
  getNovels()
}

const handleSort = () => {
  getNovels()
}

const handleSearch = () => {
  const keyword = searchKeyword.value.trim()
  if (keyword) {
    router.push(`/novel/search?keyword=${encodeURIComponent(keyword)}`)
  }
}

onMounted(() => {
  console.log('NovelList 组件已挂载')
  getNovels()
})
</script>

<style scoped>
.novel-list-container {
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

.header-actions {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.filter-group {
  display: flex;
  gap: 1rem;
}

.filter-group select {
  padding: 0.6rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-group select:hover {
  border-color: #667eea;
}

.filter-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-box {
  display: flex;
  gap: 0.5rem;
}

.search-box input {
  padding: 0.6rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  width: 250px;
  transition: all 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-box button {
  padding: 0.6rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
}

.search-box button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.search-box button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  border-top: 4px solid #667eea;
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
  white-space: pre-line;
}

.empty-message {
  color: #999;
  font-size: 1.2rem;
}

.debug-info {
  margin-top: 1rem;
  padding: 1.5rem;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  color: #856404;
  text-align: left;
  max-width: 600px;
}

.debug-info p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
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
  margin-top: 1rem;
}

.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.novel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.novel-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.novel-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.novel-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.novel-cover {
  position: relative;
  height: 220px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.novel-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.novel-card:hover .novel-cover img {
  transform: scale(1.1);
}

.cover-placeholder {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 4rem;
  font-weight: bold;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 0.8rem;
  display: flex;
  justify-content: flex-end;
}

.status-tag {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
}

.status-0 {
  background-color: #2196F3;
}

.status-1 {
  background-color: #4CAF50;
}

.status-2 {
  background-color: #FF9800;
}

.novel-info {
  padding: 1.5rem;
}

.novel-title {
  margin: 0 0 0.8rem 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.novel-desc {
  margin: 0 0 1rem 0;
  color: #666;
  line-height: 1.5;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.8rem;
}

.novel-meta {
  margin-bottom: 1rem;
}

.last-chapter {
  display: block;
  font-size: 0.85rem;
  color: #667eea;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.novel-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.stat-icon {
  font-size: 1.2rem;
}

.stat-value {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
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

@media (max-width: 768px) {
  .novel-list-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }

  .page-header h2 {
    font-size: 1.5rem;
  }

  .header-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .filter-group {
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }

  .search-box input {
    flex: 1;
    width: 100%;
  }

  .novel-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
}
</style>
