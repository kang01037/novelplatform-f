<template>
  <div class="comment-list-container">
    <div class="page-header">
      <h2>💬 评论列表</h2>
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
      <p class="empty-message">😕 暂无评论，快来发表第一条评论吧！</p>
    </div>

    <template v-else>
      <div class="comment-form">
        <h3>📝 发表评论</h3>
        <textarea
            v-model="newComment.content"
            placeholder="请输入评论内容..."
            rows="4"
            :disabled="submitting"
        ></textarea>
        <button class="btn btn-primary" @click="submitComment" :disabled="submitting || !newComment.content.trim()">
          {{ submitting ? '提交中...' : '发表评论' }}
        </button>
      </div>

      <div class="comments">
        <div v-for="comment in comments" :key="comment.commentId" class="comment-item">
          <div class="comment-header">
            <span class="comment-user">👤 用户{{ comment.userId }}</span>
            <span class="comment-time">🕐 {{ formatDate(comment.createdTime) }}</span>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
          <div class="comment-footer">
            <button class="btn-action" @click="likeComment(comment.commentId)" :disabled="liking">
              👍 {{ comment.likeCount || 0 }}
            </button>
            <button class="btn-action" @click="showReplyForm(comment.commentId)">
              💬 回复 ({{ comment.replyCount || 0 }})
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
              <button class="btn-sm btn-primary" @click="submitReply(comment.commentId)" :disabled="submitting || !replyContent.trim()">
                {{ submitting ? '提交中...' : '提交回复' }}
              </button>
              <button class="btn-sm btn-cancel" @click="cancelReply">取消</button>
            </div>
          </div>

          <!-- 回复列表 -->
          <div v-if="comment.replies && comment.replies.length > 0" class="replies">
            <div v-for="reply in comment.replies" :key="reply.commentId" class="reply-item">
              <div class="reply-header">
                <span class="reply-user">👤 用户{{ reply.userId }}</span>
                <span class="reply-time">🕐 {{ formatDate(reply.createdTime) }}</span>
              </div>
              <div class="reply-content">{{ reply.content }}</div>
              <div class="reply-footer">
                <button class="btn-action" @click="likeComment(reply.commentId)" :disabled="liking">
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
import { commentApi } from '../../api'

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

      // 获取每个评论的回复
      for (const comment of commentList) {
        if (comment.replyCount > 0) {
          try {
            const repliesResponse = await commentApi.getReplies(comment.commentId)
            console.log('回复列表响应:', repliesResponse)

            if (repliesResponse.data.code === 200 || repliesResponse.data.message === 'success') {
              comment.replies = repliesResponse.data.data || []
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

const likeComment = async (commentId) => {
  if (liking.value) return

  liking.value = true

  try {
    const response = await commentApi.likeComment(commentId)
    console.log('点赞响应:', response)

    if (response.data.code === 200 || response.data.message === 'success') {
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
    alert('点赞失败，请稍后重试')
  } finally {
    liking.value = false
  }
}

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
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
}

.page-header h2 {
  margin: 0;
  font-size: 1.8rem;
  color: #333;
}

.comment-count {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.comment-form {
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.comment-form h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.3rem;
}

.comment-form textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  margin-bottom: 1rem;
  transition: border-color 0.3s;
  font-family: inherit;
}

.comment-form textarea:focus {
  outline: none;
  border-color: #667eea;
}

.comment-form textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.btn {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: #9e9e9e;
  color: white;
}

.btn-cancel:hover {
  background-color: #757575;
}

.comments {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.comment-item {
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-item:hover {
  background-color: #f8f9fa;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  font-size: 0.9rem;
}

.comment-user {
  color: #667eea;
  font-weight: 500;
}

.comment-time {
  color: #999;
}

.comment-content {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #333;
  font-size: 1rem;
  white-space: pre-wrap;
}

.comment-footer,
.reply-footer {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-action {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  background-color: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-action:hover:not(:disabled) {
  background-color: #e0e0e0;
  transform: translateY(-1px);
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reply-form {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.reply-form textarea {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
  resize: vertical;
  margin-bottom: 0.8rem;
  font-family: inherit;
}

.reply-form textarea:focus {
  outline: none;
  border-color: #667eea;
}

.reply-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  border-radius: 4px;
}

.replies {
  margin-top: 1rem;
  padding-left: 2rem;
  border-left: 3px solid #667eea;
}

.reply-item {
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-item:hover {
  background-color: #f0f0f0;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.reply-user {
  color: #667eea;
  font-weight: 500;
}

.reply-time {
  color: #999;
}

.reply-content {
  margin-bottom: 0.5rem;
  line-height: 1.5;
  color: #333;
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
