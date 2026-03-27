<template>
  <div class="novel-detail-container">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p class="error-message">❌ {{ error }}</p>
      <button @click="loadData" class="btn-retry">重试</button>
    </div>

    <template v-else-if="novel">
      <div class="novel-header">
        <div class="novel-cover">
          <img :src="novel.coverImage" :alt="novel.novelName" v-if="novel.coverImage">
          <div class="cover-placeholder" v-else>
            {{ novel.novelName.charAt(0) }}
          </div>
          <div class="status-badge" :class="'status-' + novel.novelStatus">
            {{ getNovelStatusText(novel.novelStatus) }}
          </div>
        </div>
        <div class="novel-info">
          <h2>{{ novel.novelName }}</h2>
          <div class="novel-meta">
            <span>👤 作者：{{ novel.authorId }}</span>
            <span>📚 分类：{{ novel.categoryId }}</span>
          </div>
          <div class="novel-stats">
            <div class="stat-item">
              <span class="stat-icon">🔥</span>
              <span class="stat-label">点击</span>
              <span class="stat-value">{{ formatNumber(novel.clickCount) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⭐</span>
              <span class="stat-label">收藏</span>
              <span class="stat-value">{{ formatNumber(novel.collectCount) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">👍</span>
              <span class="stat-label">推荐</span>
              <span class="stat-value">{{ formatNumber(novel.recommendCount) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">📊</span>
              <span class="stat-label">评分</span>
              <span class="stat-value">{{ novel.score ? novel.score.toFixed(1) : '--' }}</span>
              <span class="stat-count">({{ novel.scoreCount || 0 }}人)</span>
            </div>
          </div>
          <div class="novel-actions">
            <button class="btn btn-primary" @click="addToBookshelf">📚 加入书架</button>
            <button class="btn btn-success" @click="router.push(`/chapter/list/${novel.novelId}`)">📖 开始阅读</button>
            <button class="btn btn-warning" @click="showScoreModal = true">⭐ 评分</button>
          </div>
        </div>
      </div>

      <div class="novel-content">
        <h3>📖 小说简介</h3>
        <p class="content-text">{{ novel.content }}</p>
      </div>

      <div class="novel-chapters">
        <div class="section-header">
          <h3>📑 最新章节</h3>
          <span class="update-time" v-if="lastChapter">
            更新时间：{{ formatDate(lastChapter.updateTime || lastChapter.createTime) }}
          </span>
        </div>
        <div v-if="lastChapter" class="last-chapter">
          <router-link :to="`/chapter/read/${lastChapter.chapterId}`">
            <span class="chapter-num">第{{ lastChapter.chapterNum }}章</span>
            <span class="chapter-title">{{ lastChapter.chapterTitle }}</span>
          </router-link>
        </div>
        <div v-else class="no-chapter">暂无章节</div>
        <button class="btn btn-block" @click="router.push(`/chapter/list/${novel.novelId}`)">查看全部章节</button>
      </div>

      <div class="novel-comments">
        <h3>💬 评论</h3>
        <router-link :to="`/comment/list/${novel.novelId}`" class="btn btn-block">查看全部评论</router-link>
      </div>
    </template>

    <!-- 评分弹窗 -->
    <div v-if="showScoreModal" class="modal" @click.self="showScoreModal = false">
      <div class="modal-content">
        <h3>给小说评分</h3>
        <div class="score-stars">
          <span
              v-for="star in 5"
              :key="star"
              class="star"
              :class="{ active: star <= score }"
              @click="score = star"
          >
            {{ star <= score ? '⭐' : '☆' }}
          </span>
        </div>
        <div class="score-value">{{ score }}分</div>
        <div class="modal-actions">
          <button class="btn btn-cancel" @click="showScoreModal = false">取消</button>
          <button class="btn btn-primary" @click="submitScore">提交评分</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { novelApi, chapterApi, bookshelfApi } from '../../api'

const route = useRoute()
const router = useRouter()
const novelId = route.params.novelId
const novel = ref(null)
const lastChapter = ref(null)
const loading = ref(false)
const error = ref('')
const showScoreModal = ref(false)
const score = ref(5)

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
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

const loadData = async () => {
  try {
    loading.value = true
    error.value = ''

    console.log('开始加载小说详情，novelId:', novelId)

    // 加载小说详情
    const novelResponse = await novelApi.getNovel(novelId)
    console.log('小说详情响应:', novelResponse)

    if (novelResponse.data.code === 200 || novelResponse.data.message === 'success') {
      novel.value = novelResponse.data.data
      console.log('小说详情:', novel.value)

      // 增加点击量
      novelApi.addClick(novelId).catch(err => {
        console.error('增加点击量失败:', err)
      })
    } else {
      error.value = novelResponse.data.message || '获取小说详情失败'
      return
    }

    // 加载最新章节
    const chapterResponse = await chapterApi.getLatestChapter(novelId)
    console.log('最新章节响应:', chapterResponse)

    if (chapterResponse.data.code === 200 || chapterResponse.data.message === 'success') {
      lastChapter.value = chapterResponse.data.data
      console.log('最新章节:', lastChapter.value)
    }
  } catch (err) {
    console.error('加载数据失败:', err)
    if (err.response) {
      const { code, message } = err.response.data
      if (code === 200 && message === 'success') {
        return
      }
      error.value = `服务器错误：${message}`
    } else if (err.request) {
      error.value = '无法连接到服务器，请检查网络'
    } else {
      error.value = `请求错误：${err.message}`
    }
  } finally {
    loading.value = false
  }
}

const addToBookshelf = async () => {
  try {
    const userId = localStorage.getItem('userId') || '1'
    const response = await bookshelfApi.addToBookshelf({
      userId: parseInt(userId),
      novelId: parseInt(novelId)
    })

    if (response.data.code === 200 || response.data.message === 'success') {
      alert('✅ 加入书架成功')
      // 增加收藏量
      novelApi.addCollect(novelId).catch(err => {
        console.error('增加收藏量失败:', err)
      })
    } else {
      alert(response.data.message || '加入书架失败')
    }
  } catch (err) {
    console.error('加入书架失败:', err)
    alert('加入书架失败，请稍后重试')
  }
}

const submitScore = async () => {
  try {
    const response = await novelApi.rateNovel(novelId, { score: score.value })
    if (response.data.code === 200 || response.data.message === 'success') {
      alert('✅ 评分成功')
      showScoreModal.value = false
      await loadData()
    } else {
      alert(response.data.message || '评分失败')
    }
  } catch (err) {
    console.error('评分失败:', err)
    alert('评分失败，请稍后重试')
  }
}

onMounted(() => {
  console.log('NovelDetail 组件已挂载，novelId:', novelId)
  loadData()
})
</script>

<style scoped>
.novel-detail-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.loading-container,
.error-container {
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

.novel-header {
  display: flex;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.novel-cover {
  position: relative;
  width: 220px;
  height: 320px;
  margin-right: 2rem;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.novel-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 5rem;
  font-weight: bold;
}

.status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
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
  flex: 1;
  display: flex;
  flex-direction: column;
}

.novel-info h2 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  color: #333;
}

.novel-meta {
  display: flex;
  margin-bottom: 1.5rem;
  gap: 2rem;
  color: #666;
  font-size: 1rem;
}

.novel-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
}

.stat-value {
  font-size: 1.1rem;
  color: #333;
  font-weight: bold;
}

.stat-count {
  font-size: 0.8rem;
  color: #999;
}

.novel-actions {
  display: flex;
  gap: 1rem;
  margin-top: auto;
}

.btn {
  padding: 0.8rem 1.8rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
}

.btn-success:hover {
  background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
  transform: translateY(-2px);
}

.btn-warning {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
}

.btn-warning:hover {
  background: linear-gradient(135deg, #f57c00 0%, #e65100 100%);
  transform: translateY(-2px);
}

.btn-cancel {
  background-color: #9e9e9e;
  color: white;
}

.btn-cancel:hover {
  background-color: #757575;
}

.btn-block {
  width: 100%;
  margin-top: 1rem;
}

.novel-content {
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.novel-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
}

.content-text {
  line-height: 1.8;
  color: #555;
  white-space: pre-wrap;
}

.novel-chapters {
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.novel-chapters h3 {
  margin-top: 0;
  color: #333;
  font-size: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.update-time {
  font-size: 0.9rem;
  color: #999;
}

.last-chapter {
  padding: 1.2rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  border-radius: 8px;
  margin-bottom: 1rem;
}

.last-chapter a {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: #333;
}

.chapter-num {
  font-weight: bold;
  color: #667eea;
}

.chapter-title {
  flex: 1;
  font-size: 1.05rem;
}

.no-chapter {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.novel-comments {
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.novel-comments h3 {
  margin-top: 0;
  color: #333;
  font-size: 1.5rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2.5rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
}

.score-stars {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.star {
  font-size: 2.5rem;
  cursor: pointer;
  transition: all 0.3s;
  color: #ddd;
}

.star.active,
.star:hover {
  color: #ff9800;
  transform: scale(1.1);
}

.score-value {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 2rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

@media (max-width: 768px) {
  .novel-detail-container {
    padding: 1rem;
  }

  .novel-header {
    flex-direction: column;
  }

  .novel-cover {
    width: 100%;
    max-width: 220px;
    height: 320px;
    margin: 0 auto 1.5rem;
  }

  .novel-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .novel-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
