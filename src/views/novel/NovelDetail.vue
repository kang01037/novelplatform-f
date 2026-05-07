<template>
  <div class="novel-detail-page">
    <!-- 顶部背景装饰 -->
    <div class="header-bg" :style="{ backgroundImage: `url(${novel?.coverImage})` }">
      <div class="gradient-overlay"></div>
    </div>

    <div class="content-wrapper">
      <!-- 加载状态 -->
      <div v-if="loading" class="state-box">
        <div class="spinner"></div>
        <p>正在加载小说信息...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="state-box error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p>{{ error }}</p>
        <button @click="loadData" class="retry-btn">重新加载</button>
      </div>

      <!-- 主内容 -->
      <template v-else-if="novel">
        <!-- 头部信息卡片 -->
        <header class="glass-card header-card">
          <div class="header-content">
            <!-- 封面 -->
            <div class="cover-wrapper">
              <img v-if="novel.coverImage" :src="novel.coverImage" :alt="novel.novelName">
              <div v-else class="cover-placeholder">{{ novel.novelName.charAt(0) }}</div>
              <div class="status-badge" :class="'status-' + novel.novelStatus">
                {{ getNovelStatusText(novel.novelStatus) }}
              </div>
            </div>

            <!-- 信息 -->
            <div class="info-wrapper">
              <h1 class="novel-title">{{ novel.novelName }}</h1>
              <div class="meta-row">
                <span class="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {{ novel.authorId }}
                </span>
                <span class="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  {{ novel.categoryId }}
                </span>
              </div>

              <!-- 数据统计 -->
              <div class="stats-grid">
                <div class="stat-box">
                  <span class="val">{{ formatNumber(novel.clickCount) }}</span>
                  <span class="label">点击</span>
                </div>
                <div class="stat-box">
                  <span class="val">{{ formatNumber(novel.collectCount) }}</span>
                  <span class="label">收藏</span>
                </div>
                <div class="stat-box">
                  <span class="val">{{ formatNumber(novel.recommendCount) }}</span>
                  <span class="label">推荐</span>
                </div>
                <div class="stat-box highlight">
                  <span class="val">{{ novel.score ? novel.score.toFixed(1) : '--' }}</span>
                  <span class="label">评分</span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="action-buttons">
                <button class="btn primary" @click="router.push(`/chapter/list/${novel.novelId}`)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  开始阅读
                </button>
                <button class="btn secondary" @click="addToBookshelf">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  加入书架
                </button>
                <button class="btn accent" @click="recommendNovel" :disabled="recommending">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                  {{ recommending ? '推荐中...' : `推荐 (${formatNumber(novel.recommendCount)})` }}
                </button>
                <button class="btn ghost" @click="showScoreModal = true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  评分
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- 简介卡片 -->
        <section class="glass-card intro-card">
          <h3 class="card-title">简介</h3>
          <p class="intro-text">{{ novel.content || '暂无简介' }}</p>
        </section>

        <!-- 章节卡片 -->
        <section class="glass-card chapter-card">
          <div class="card-header">
            <h3 class="card-title">最新章节</h3>
            <span v-if="lastChapter" class="update-time">
              更新于 {{ formatDate(lastChapter.updateTime || lastChapter.createTime) }}
            </span>
          </div>

          <div v-if="lastChapter" class="latest-chapter-box">
            <router-link :to="`/chapter/read/${lastChapter.chapterId}`" class="chapter-link">
              <span class="num">第{{ lastChapter.chapterNum }}章</span>
              <span class="title">{{ lastChapter.chapterTitle }}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </router-link>
          </div>
          <div v-else class="empty-text">暂无章节</div>

          <button @click="router.push(`/chapter/list/${novel.novelId}`)" class="view-all-btn">
            查看完整目录
          </button>
        </section>

        <!-- 评论区 -->
        <section class="glass-card comment-card">
          <div class="card-header">
            <h3 class="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              评论区
            </h3>
            <span class="comment-count">{{ comments.length }} 条留言</span>
          </div>

          <!-- 发表框 -->
          <div class="comment-form">
            <textarea
                v-model="newComment.content"
                placeholder="写下你的读后感..."
                rows="3"
            ></textarea>
            <button
                class="submit-btn"
                @click="debouncedSubmitComment"
                :disabled="submitting || !newComment.content.trim()"
            >
              {{ submitting ? '发送中...' : '发表评论' }}
            </button>
          </div>

          <!-- 列表 -->
          <div v-if="commentsLoading" class="loading-inline">
            <div class="spinner small"></div>
          </div>
          <template v-else>
            <div v-if="comments.length === 0" class="empty-text">快来抢沙发吧！</div>
            <div v-else class="comment-list">
              <div v-for="comment in comments.slice(0, 5)" :key="comment.commentId" class="comment-item">
                <div class="user-avatar">
                  <img v-if="comment.userAvatar" :src="comment.userAvatar">
                  <div v-else class="avatar-placeholder">{{ comment.username?.charAt(0).toUpperCase() }}</div>
                </div>
                <div class="comment-body">
                  <div class="comment-header">
                    <span class="username">{{ comment.username || '用户' }}</span>
                    <span class="time">{{ formatDate(comment.createdTime) }}</span>
                  </div>
                  <div class="comment-content">{{ comment.content }}</div>
                  <div class="comment-actions">
                    <button @click="throttledLike(comment.commentId)" :class="{ liked: comment.isLiked }">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                      {{ comment.likeCount || 0 }}
                    </button>
                  </div>
                </div>
              </div>
              <router-link v-if="comments.length > 5" :to="`/comment/list/${novel.novelId}`" class="view-more-link">
                查看全部评论
              </router-link>
            </div>
          </template>
        </section>
      </template>
    </div>

    <!-- 评分弹窗 -->
    <transition name="fade">
      <div v-if="showScoreModal" class="modal-overlay" @click.self="showScoreModal = false">
        <div class="modal-content glass-card">
          <h3>为小说评分</h3>
          <div class="stars-selector">
            <span
                v-for="star in 5"
                :key="star"
                class="star"
                :class="{ active: star <= score }"
                @click="score = star"
            >
              <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </span>
          </div>
          <div class="score-display">{{ score }}.0 分</div>
          <div class="modal-actions">
            <button class="btn cancel" @click="showScoreModal = false">取消</button>
            <button class="btn confirm" @click="submitScore">确认</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// 假设 API 引入路径正确，保持不变
import { novelApi, chapterApi, bookshelfApi, commentApi, userApi } from '../../api'
import { debounce, throttle } from '../../utils'

const route = useRoute()
const router = useRouter()
const novelId = route.params.novelId
const novel = ref(null)
const lastChapter = ref(null)
const loading = ref(false)
const error = ref('')
const showScoreModal = ref(false)
const score = ref(5)
const recommending = ref(false)
const hasRecommended = ref(false)

// 评论相关
const comments = ref([])
const commentsLoading = ref(false)
const submitting = ref(false)
const liking = ref(false)
const newComment = ref({ content: '' })
const userCache = ref({})

// --- 保持所有原有逻辑不变 ---

const getUserInfo = async (userId) => {
  if (userCache.value[userId]) return userCache.value[userId]
  try {
    const response = await userApi.getUser(userId)
    if (response.data.code === 200 || response.data.message === 'success') {
      const userInfo = response.data.data
      userCache.value[userId] = {
        username: userInfo.username || `用户${userId}`,
        avatar: userInfo.avatar || null
      }
      return userCache.value[userId]
    }
  } catch (err) {
    console.error(`获取用户${userId}信息失败:`, err)
  }
  return { username: `用户${userId}`, avatar: null }
}

const getComments = async () => {
  try {
    commentsLoading.value = true
    const response = await commentApi.getCommentsByNovel(novelId)
    if (response.data.code === 200 || response.data.message === 'success') {
      const commentList = response.data.data || []
      for (const comment of commentList) {
        const userInfo = await getUserInfo(comment.userId)
        comment.username = userInfo.username
        comment.userAvatar = userInfo.avatar
      }
      comments.value = commentList
    }
  } catch (err) {
    console.error('获取评论失败:', err)
  } finally {
    commentsLoading.value = false
  }
}

const submitComment = async () => {
  if (!newComment.value.content.trim()) { alert('请输入评论内容'); return }
  submitting.value = true
  try {
    const userId = localStorage.getItem('userId') || '1'
    const response = await commentApi.createComment({
      userId: parseInt(userId),
      novelId: parseInt(novelId),
      chapterId: null,
      parentId: null,
      content: newComment.value.content.trim()
    })
    if (response.data.code === 200 || response.data.message === 'success') {
      alert('✅ 评论成功')
      newComment.value.content = ''
      await getComments()
    } else { alert(response.data.message || '评论失败') }
  } catch (err) {
    console.error('发表评论失败:', err)
    alert('发表评论失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const likeComment = async (commentId) => {
  if (liking.value) return
  liking.value = true
  try {
    const response = await commentApi.likeComment(commentId)
    if (response.data.code === 200 || response.data.message === 'success') {
      const comment = comments.value.find(c => c.commentId === commentId)
      if (comment) comment.likeCount = (comment.likeCount || 0) + 1
    }
  } catch (err) {
    console.error('点赞失败:', err)
  } finally {
    liking.value = false
  }
}

// 防抖包装：发表评论
const debouncedSubmitComment = debounce(() => {
  submitComment()
}, 300)

// 节流包装：点赞
const throttledLike = throttle((commentId) => {
  likeComment(commentId)
}, 500, { leading: true, trailing: false })

const getNovelStatusText = (status) => {
  const map = { 0: '连载中', 1: '已完结', 2: '暂停' }
  return map[status] || '未知'
}

const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num.toString()
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const loadData = async () => {
  try {
    loading.value = true; error.value = ''
    const novelResponse = await novelApi.getNovel(novelId)
    if (novelResponse.data.code === 200 || novelResponse.data.message === 'success') {
      novel.value = novelResponse.data.data
      novelApi.addClick(novelId).catch(() => {})
    } else { error.value = novelResponse.data.message || '获取详情失败'; return }

    const chapterResponse = await chapterApi.getLatestChapter(novelId)
    if (chapterResponse.data.code === 200 || chapterResponse.data.message === 'success') {
      lastChapter.value = chapterResponse.data.data
    }
    await getComments()
  } catch (err) {
    console.error(err); error.value = '加载失败'
  } finally {
    loading.value = false
  }
}

const addToBookshelf = async () => {
  try {
    const userId = localStorage.getItem('userId') || '1'
    const response = await bookshelfApi.addToBookshelf({ userId: parseInt(userId), novelId: parseInt(novelId) })
    if (response.data.code === 200 || response.data.message === 'success') {
      alert('✅ 加入书架成功')
      novelApi.addCollect(novelId).catch(() => {})
    } else { alert(response.data.message || '失败') }
  } catch (err) {
    console.error(err); alert('加入书架成功')
  }
}

const recommendNovel = async () => {
  if (hasRecommended.value) {
    alert('您已经推荐过这本小说了')
    return
  }

  try {
    recommending.value = true
    const userId = localStorage.getItem('userId')

    if (!userId) {
      alert('请先登录后再推荐')
      router.push('/login')
      return
    }

    const response = await novelApi.addRecommend(novelId)
    if (response.data.code === 200 || response.data.message === 'success') {
      alert('✅ 推荐成功！感谢您的支持')
      hasRecommended.value = true
      novel.value.recommendCount = (novel.value.recommendCount || 0) + 1
    } else {
      alert(response.data.message || '推荐失败')
    }
  } catch (err) {
    console.error('推荐失败:', err)
    alert('推荐失败，请稍后重试')
  } finally {
    recommending.value = false
  }
}

const submitScore = async () => {
  try {
    const currentScore = novel.value.score || 0
    const scoreCount = novel.value.scoreCount || 0
    const newScore = (currentScore * scoreCount + score.value) / (scoreCount + 1)
    const response = await novelApi.rateNovel(novelId, { score: newScore, scoreCount: scoreCount + 1 })
    if (response.data.code === 200 || response.data.message === 'success') {
      alert(`✅ 评分成功！`)
      showScoreModal.value = false
      await loadData()
    }
  } catch (err) {
    console.error(err); alert('评分失败')
  }
}

onMounted(() => loadData())
</script>

<style scoped>
/* --- 页面布局 --- */
.novel-detail-page {
  position: relative;
  min-height: 100vh;
  padding-bottom: 4rem;
}

.header-bg {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 350px;
  background-size: cover;
  background-position: center;
  filter: blur(30px) brightness(0.5);
  transform: scale(1.1);
  z-index: 0;
}
.gradient-overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: linear-gradient(to bottom, rgba(15,25,35,0) 0%, rgba(15,25,35,0.8) 50%, rgba(15,25,35,1) 100%);
}

.content-wrapper {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem 0;
}

/* --- 玻璃卡片 --- */
.glass-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

/* --- 头部 --- */
.header-card {
  padding: 2rem;
}
.header-content {
  display: flex;
  gap: 2rem;
}

.cover-wrapper {
  flex-shrink: 0;
  width: 180px;
  height: 250px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 15px 35px rgba(0,0,0,0.3);
}
.cover-wrapper img {
  width: 100%; height: 100%;
  object-fit: cover;
}
.cover-placeholder {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  display: flex; align-items: center; justify-content: center;
  font-size: 4rem; color: white; font-weight: bold;
}
.status-badge {
  position: absolute;
  top: 12px; right: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem; font-weight: 600;
  color: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
.status-0 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.status-1 { background: #00b894; }
.status-2 { background: #fdcb6e; color: #333; }

.info-wrapper { flex: 1; display: flex; flex-direction: column; }
.novel-title { font-size: 1.8rem; margin: 0 0 0.8rem; color: rgba(255, 255, 255, 0.85); font-weight: 700; }
.meta-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.meta-item {
  display: flex; align-items: center; gap: 0.3rem;
  color: rgba(168, 216, 234, 0.7); font-size: 0.9rem;
}
.meta-item svg { width: 16px; height: 16px; stroke: rgba(168, 216, 234, 0.5); }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.stat-box { display: flex; flex-direction: column; align-items: center; }
.stat-box .val { font-size: 1.2rem; font-weight: 700; color: rgba(255, 255, 255, 0.85); }
.stat-box .label { font-size: 0.8rem; color: rgba(168, 216, 234, 0.6); margin-top: 4px; }
.stat-box.highlight .val { color: #4facfe; }

.action-buttons { display: flex; gap: 1rem; margin-top: auto; flex-wrap: wrap; }
.btn {
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border-radius: 30px;
  font-size: 0.95rem; font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}
.btn svg { width: 18px; height: 18px; }
.btn.primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}
.btn.primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79, 172, 254, 0.4); }
.btn.secondary { background: rgba(79, 172, 254, 0.1); color: #4facfe; }
.btn.secondary:hover { background: rgba(79, 172, 254, 0.2); }
.btn.accent {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}
.btn.accent:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 172, 254, 0.4);
}
.btn.accent:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
.btn.ghost { background: rgba(255, 255, 255, 0.08); color: rgba(255, 255, 255, 0.7); }
.btn.ghost:hover { background: rgba(255, 255, 255, 0.12); }

/* --- 内容卡片通用 --- */
.intro-card, .chapter-card, .comment-card { padding: 1.5rem 2rem; }
.card-title {
  font-size: 1.1rem; color: rgba(255, 255, 255, 0.85);
  margin: 0 0 1rem;
  display: flex; align-items: center; gap: 0.5rem;
}
.card-title svg { width: 20px; height: 20px; stroke: #4facfe; }
.card-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1rem;
}
.update-time { font-size: 0.8rem; color: rgba(168, 216, 234, 0.5); }

.intro-text { color: rgba(168, 216, 234, 0.7); line-height: 1.8; font-size: 0.95rem; white-space: pre-wrap; }

/* --- 章节区域 --- */
.latest-chapter-box {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}
.chapter-link {
  display: flex; align-items: center;
  color: rgba(255, 255, 255, 0.85); text-decoration: none;
}
.chapter-link .num { color: #4facfe; font-weight: 600; margin-right: 0.8rem; }
.chapter-link .title { flex: 1; font-weight: 500; color: rgba(255, 255, 255, 0.7); }
.chapter-link svg { width: 20px; height: 20px; stroke: rgba(255, 255, 255, 0.2); transition: transform 0.3s; }
.chapter-link:hover svg { transform: translateX(5px); stroke: #4facfe; }

.view-all-btn {
  width: 100%;
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  color: #4facfe;
  padding: 0.8rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}
.view-all-btn:hover { background: rgba(79, 172, 254, 0.08); border-color: #4facfe; }

/* --- 评论区 --- */
.comment-form {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.comment-form textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  font-size: 0.95rem;
  resize: none;
  margin-bottom: 0.8rem;
  transition: border-color 0.3s;
  color: rgba(255, 255, 255, 0.85);
}
.comment-form textarea::placeholder {
  color: rgba(168, 216, 234, 0.4);
}
.comment-form textarea:focus {
  outline: none;
  border-color: #4facfe;
}
.submit-btn {
  float: right;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
}

.comment-list { display: flex; flex-direction: column; gap: 1.5rem; }
.comment-item { display: flex; gap: 1rem; }
.user-avatar { flex-shrink: 0; }
.user-avatar img, .avatar-placeholder {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  display: flex; align-items: center; justify-content: center;
  font-weight: bold;
}

.comment-body { flex: 1; }
.comment-header {
  display: flex; justify-content: space-between;
  margin-bottom: 0.3rem;
}
.username { font-weight: 600; color: rgba(255, 255, 255, 0.85); }
.time { font-size: 0.8rem; color: rgba(168, 216, 234, 0.5); }
.comment-content { color: rgba(168, 216, 234, 0.7); line-height: 1.6; font-size: 0.9rem; }
.comment-actions { margin-top: 0.5rem; }
.comment-actions button {
  background: none; border: none; color: rgba(168, 216, 234, 0.5);
  cursor: pointer; display: flex; align-items: center; gap: 4px;
  font-size: 0.85rem; padding: 0;
}
.comment-actions button svg { width: 16px; height: 16px; }
.comment-actions button:hover { color: #4facfe; }
.comment-actions button.liked { color: #4facfe; }

.view-more-link {
  display: block;
  text-align: center;
  color: #4facfe;
  text-decoration: none;
  margin-top: 1rem;
  font-weight: 500;
}

.comment-count {
  color: rgba(168, 216, 234, 0.6);
  font-size: 0.85rem;
}

/* --- 模态框 --- */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal-content {
  width: 320px;
  padding: 2rem;
  text-align: center;
  background: rgba(15, 25, 35, 0.95);
}
.modal-content h3 {
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}
.stars-selector { display: flex; justify-content: center; gap: 0.5rem; margin: 1.5rem 0; }
.star { cursor: pointer; color: rgba(255, 255, 255, 0.15); transition: transform 0.2s; }
.star svg { width: 32px; height: 32px; }
.star.active { color: #f1c40f; transform: scale(1.1); }
.score-display { font-size: 1.5rem; font-weight: bold; color: rgba(255, 255, 255, 0.85); margin-bottom: 1.5rem; }
.modal-actions { display: flex; gap: 1rem; }
.modal-actions .btn { flex: 1; padding: 0.6rem; }
.modal-actions .cancel { background: rgba(255, 255, 255, 0.08); color: rgba(255, 255, 255, 0.7); }
.modal-actions .confirm { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; }

/* --- 其他 --- */
.state-box { text-align: center; padding: 5rem 2rem; color: rgba(168, 216, 234, 0.6); }
.state-box.error { color: #ff6b81; }
.spinner { width: 40px; height: 40px; border: 3px solid rgba(255, 255, 255, 0.08); border-top-color: #4facfe; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
.spinner.small { width: 20px; height: 20px; border-width: 2px; }
.loading-inline { padding: 2rem; text-align: center; }
.empty-text { text-align: center; color: rgba(168, 216, 234, 0.4); padding: 1rem; }
.retry-btn { margin-top: 1rem; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border: none; padding: 0.5rem 2rem; border-radius: 20px; cursor: pointer; }

@keyframes spin { to { transform: rotate(360deg); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .header-content { flex-direction: column; align-items: center; text-align: center; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .action-buttons { flex-direction: column; width: 100%; }
}
</style>
