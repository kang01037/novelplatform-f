<template>
  <div class="comment-list-container">
    <div class="page-header">
      <div class="header-left">
        <router-link :to="`/novel/detail/${novelId}`" class="btn-back">← 返回小说详情</router-link>
        <h2>评论列表</h2>
      </div>
      <div class="comment-count">共 {{ comments.length }} 条评论</div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p class="error-message">❌ {{ error }}</p>
      <button @click="getComments" class="btn-retry">重试</button>
    </div>

    <div v-else-if="comments.length === 0" class="empty-container">
      <p class="empty-message">暂无评论，快来发表第一条评论吧！</p>
    </div>

    <template v-else>
      <div class="comment-form">
        <h3>发表评论</h3>
        <textarea
            v-model="newComment.content"
            placeholder="请输入评论内容..."
            rows="4"
            :disabled="submitting"
        ></textarea>
        <button class="btn btn-primary" @click="debouncedSubmit" :disabled="submitting || !newComment.content.trim()">
          {{ submitting ? '提交中...' : '发表评论' }}
        </button>
      </div>

      <div class="comments">
        <div v-for="comment in comments" :key="comment.commentId" class="comment-item">
          <div class="comment-header">
            <div class="user-info">
              <div class="user-avatar">
                <img v-if="comment.userAvatar" :src="comment.userAvatar" :alt="comment.username">
                <div v-else class="avatar-placeholder">{{ comment.username?.charAt(0).toUpperCase() }}</div>
              </div>
              <div class="user-details">
                <span class="comment-user">{{ comment.username || '用户' }}</span>
              </div>
            </div>
            <span class="comment-time">🕐 {{ formatDate(comment.createdTime) }}</span>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
          <div class="comment-footer">
            <button class="btn-action" @click="throttledLike(comment.commentId)" :disabled="liking">
            </button>
            <button class="btn-action" @click="showReplyForm(comment.commentId)">
              回复 ({{ comment.replyCount || 0 }})
            </button>
          </div>

          <!-- 回复表单 -->
          <div v-if="replyCommentId === comment.commentId" class="reply-form">
            <textarea
                v-model="replyContent"
                placeholder="请输入回复内容..."
                rows="2"
                :disabled="submitting"
            ></textarea>
            <div class="reply-actions">
              <button class="btn-sm btn-primary" @click="debouncedReply(comment.commentId)" :disabled="submitting || !replyContent.trim()">
                {{ submitting ? '提交中...' : '提交回复' }}
              </button>
              <button class="btn-sm btn-cancel" @click="cancelReply">取消</button>
            </div>
          </div>

          <!-- 回复列表 -->
          <div v-if="comment.replies && comment.replies.length > 0" class="replies">
            <div v-for="reply in comment.replies" :key="reply.commentId" class="reply-item">
              <div class="reply-header">
                <div class="user-info">
                  <div class="user-avatar small">
                    <img v-if="reply.userAvatar" :src="reply.userAvatar" :alt="reply.username">
                    <div v-else class="avatar-placeholder small">{{ reply.username?.charAt(0).toUpperCase() }}</div>
                  </div>
                  <div class="user-details">
                    <span class="reply-user">{{ reply.username || '用户' }}</span>
                  </div>
                </div>
                <span class="reply-time">🕐 {{ formatDate(reply.createdTime) }}</span>
              </div>
              <div class="reply-content">{{ reply.content }}</div>
              <div class="reply-footer">
                <button class="btn-action" @click="throttledLike(reply.commentId)" :disabled="liking">
                  👍 {{ reply.likeCount || 0 }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { commentApi, userApi } from '../../api'
import { debounce, throttle } from '../../utils'

const route = useRoute()
const novelId = route.params.novelId
const comments = ref([])
const loading = ref(false)
const error = ref('')
const submitting = ref(false)
const liking = ref(false)
const newComment = ref({ content: '' })
const replyCommentId = ref(null)
const replyContent = ref('')
const userCache = ref({})

const getUserInfo = async (userId) => {
  // 如果已经缓存过，直接返回
  if (userCache.value[userId]) {
    return userCache.value[userId]
  }

  try {
    // 使用 getUser 方法，传入 userId
    const response = await userApi.getUser(userId)
    if (response.data.code === 200 || response.data.message === 'success') {
      const userInfo = response.data.data
      userCache.value[userId] = {
        username: userInfo.username || `用户${userId}`,
        avatar: userInfo.avatar
      }
      return userCache.value[userId]
    }
  } catch (err) {
    console.error(`获取用户${userId}信息失败:`, err)
  }

  return {
    username: `用户${userId}`,
    avatar: null
  }
}

const getComments = async () => {
  try {
    loading.value = true
    error.value = ''

    console.log('开始获取评论列表，novelId:', novelId)
    const response = await commentApi.getCommentsByNovel(novelId)
    console.log('评论列表响应:', response)
    console.log('响应数据:', response.data)

    if (response.data.code === 200 || response.data.message === 'success') {
      const commentList = response.data.data || []
      console.log('评论列表:', commentList)
      console.log('评论数量:', commentList.length)

      // 获取每个评论的用户名和头像
      for (const comment of commentList) {
        const userInfo = await getUserInfo(comment.userId)
        comment.username = userInfo.username
        comment.userAvatar = userInfo.avatar
        console.log(`评论用户信息:`, {
          userId: comment.userId,
          username: comment.username,
          avatar: comment.userAvatar
        })

        // 获取每个评论的回复
        if (comment.replyCount > 0) {
          try {
            const repliesResponse = await commentApi.getReplies(comment.commentId)
            console.log('回复列表响应:', repliesResponse)

            if (repliesResponse.data.code === 200 || repliesResponse.data.message === 'success') {
              const replies = repliesResponse.data.data || []
              // 获取回复的用户名和头像
              for (const reply of replies) {
                const replyUserInfo = await getUserInfo(reply.userId)
                reply.username = replyUserInfo.username
                reply.userAvatar = replyUserInfo.avatar
              }
              comment.replies = replies
              console.log(`评论${comment.commentId}的回复:`, comment.replies)
            }
          } catch (replyError) {
            console.error(`获取评论${comment.commentId}的回复失败:`, replyError)
          }
        }
      }

      comments.value = commentList
    } else {
      error.value = response.data.message || '获取评论失败'
      console.error('API 返回错误:', response.data)
    }
  } catch (err) {
    console.error('获取评论失败:', err)
    if (err.response) {
      console.error('错误响应:', err.response)
      const { code, message } = err.response.data
      if (code === 200 && message === 'success') {
        comments.value = err.response.data.data || []
        return
      }
      error.value = `服务器错误：${message}`
    } else if (err.request) {
      console.error('请求未得到响应:', err.request)
      error.value = '无法连接到服务器，请检查网络'
    } else {
      error.value = `请求错误：${err.message}`
    }
  } finally {
    loading.value = false
  }
}


const submitComment = async () => {
  if (!newComment.value.content.trim()) {
    alert('请输入评论内容')
    return
  }

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

    console.log('发表评论响应:', response)

    if (response.data.code === 200 || response.data.message === 'success') {
      alert('✅ 评论成功')
      newComment.value.content = ''
      await getComments()
    } else {
      alert(response.data.message || '评论失败')
    }
  } catch (err) {
    console.error('发表评论失败:', err)
    if (err.response) {
      const { code, message } = err.response.data
      if (code === 200 && message === 'success') {
        alert('✅ 评论成功')
        newComment.value.content = ''
        await getComments()
        return
      }
      alert(`评论失败：${message}`)
    } else {
      alert('发表评论失败，请稍后重试')
    }
  } finally {
    submitting.value = false
  }
}

const submitReply = async (parentId) => {
  if (!replyContent.value.trim()) {
    alert('请输入回复内容')
    return
  }

  submitting.value = true

  try {
    const userId = localStorage.getItem('userId') || '1'
    const response = await commentApi.createComment({
      userId: parseInt(userId),
      novelId: parseInt(novelId),
      chapterId: null,
      parentId: parseInt(parentId),
      content: replyContent.value.trim()
    })

    console.log('发表回复响应:', response)

    if (response.data.code === 200 || response.data.message === 'success') {
      alert('✅ 回复成功')
      replyContent.value = ''
      replyCommentId.value = null
      await getComments()
    } else {
      alert(response.data.message || '回复失败')
    }
  } catch (err) {
    console.error('发表回复失败:', err)
    if (err.response) {
      const { code, message } = err.response.data
      if (code === 200 && message === 'success') {
        alert('✅ 回复成功')
        replyContent.value = ''
        replyCommentId.value = null
        await getComments()
        return
      }
      alert(`回复失败：${message}`)
    } else {
      alert('发表回复失败，请稍后重试')
    }
  } finally {
    submitting.value = false
  }
}

// 防抖包装：提交评论
const debouncedSubmit = debounce(() => {
  submitComment()
}, 300)

// 防抖包装：提交回复
const debouncedReply = debounce((parentId) => {
  submitReply(parentId)
}, 300)

const likeComment = async (commentId) => {
  if (liking.value) return

  liking.value = true

  try {
    const response = await commentApi.likeComment(commentId)
    console.log('点赞响应:', response)

    if (response.data.code === 200 ||
        response.data.message === 'success' ||
        response.data.message === '点赞成功') {
      // 更新点赞数
      const updateLikeCount = (commentList) => {
        for (const comment of commentList) {
          if (comment.commentId === commentId) {
            comment.likeCount = (comment.likeCount || 0) + 1
            return true
          }
          if (comment.replies) {
            if (updateLikeCount(comment.replies)) {
              return true
            }
          }
        }
        return false
      }
      updateLikeCount(comments.value)
    } else {
      alert(response.data.message || '点赞失败')
    }
  } catch (err) {
    console.error('点赞失败:', err)
    if (err.response) {
      const { code, message } = err.response.data
      if (code === 200 && message === 'success') {
        const updateLikeCount = (commentList) => {
          for (const comment of commentList) {
            if (comment.commentId === commentId) {
              comment.likeCount = (comment.likeCount || 0) + 1
              return true
            }
            if (comment.replies) {
              if (updateLikeCount(comment.replies)) {
                return true
              }
            }
          }
          return false
        }
        updateLikeCount(comments.value)
        return
      }
      alert(`点赞失败：${message}`)
    } else {
      alert('点赞失败，请稍后重试')
    }
  } finally {
    liking.value = false
  }
}

// 节流包装：点赞
const throttledLike = throttle((commentId) => {
  likeComment(commentId)
}, 500, { leading: true, trailing: false })

const showReplyForm = (commentId) => {
  replyCommentId.value = commentId
  replyContent.value = ''
}

const cancelReply = () => {
  replyCommentId.value = null
  replyContent.value = ''
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

onMounted(() => {
  console.log('CommentList 组件已挂载，novelId:', novelId)
  getComments()
})
</script>

<style scoped>
.comment-list-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background: transparent;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.btn-back {
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s;
  display: inline-block;
}

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4);
}

.page-header h2 {
  margin: 0;
  font-size: 1.8rem;
  color: rgba(255, 255, 255, 0.85);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.user-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar.small {
  width: 35px;
  height: 35px;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
}

.avatar-placeholder.small {
  font-size: 1rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.comment-count {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
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
  border: 4px solid rgba(255, 255, 255, 0.08);
  border-top: 4px solid #4facfe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: rgba(168, 216, 234, 0.6);
  font-size: 1.1rem;
}

.error-message {
  color: #ff6b81;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  white-space: pre-line;
}

.empty-message {
  color: rgba(168, 216, 234, 0.5);
  font-size: 1.2rem;
}

.btn-retry {
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
  font-weight: 600;
}

.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4);
}

.comment-form {
  margin-bottom: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.comment-form h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.3rem;
}

.comment-form textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  margin-bottom: 1rem;
  transition: border-color 0.3s;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.85);
}

.comment-form textarea:focus {
  outline: none;
  border-color: rgba(79, 172, 254, 0.5);
}

.comment-form textarea::placeholder {
  color: rgba(168, 216, 234, 0.3);
}

.comment-form textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.btn-primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
}

.comments {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.comment-item {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  transition: background-color 0.3s;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.comment-user {
  color: #4facfe;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comment-time {
  color: rgba(168, 216, 234, 0.4);
  font-size: 0.85rem;
}

.comment-content {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  white-space: pre-wrap;
}

.comment-footer,
.reply-footer {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.btn-action {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(168, 216, 234, 0.6);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-action:hover:not(:disabled) {
  background: rgba(79, 172, 254, 0.15);
  color: #4facfe;
  transform: translateY(-1px);
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reply-form {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
}

.reply-form textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 0.9rem;
  resize: vertical;
  margin-bottom: 0.8rem;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.85);
}

.reply-form textarea:focus {
  outline: none;
  border-color: rgba(79, 172, 254, 0.5);
}

.reply-form textarea::placeholder {
  color: rgba(168, 216, 234, 0.3);
}

.reply-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.replies {
  margin-top: 1rem;
  padding-left: 2rem;
  border-left: 3px solid #4facfe;
}

.reply-item {
  padding: 1rem;
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  transition: background-color 0.3s;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.reply-user {
  color: #4facfe;
  font-weight: 500;
}

.reply-time {
  color: rgba(168, 216, 234, 0.4);
}

.reply-content {
  margin-bottom: 0.5rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .comment-list-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .header-left {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .comment-form {
    padding: 1rem;
  }

  .comment-item {
    padding: 1rem;
  }

  .replies {
    padding-left: 1rem;
  }
}
</style>
