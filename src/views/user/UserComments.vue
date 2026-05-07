<template>
  <div class="user-comments-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <router-link to="/user/profile" class="btn-back">← 返回个人中心</router-link>
        <h1>我的评论</h1>
      </div>
      <span v-if="!loading" class="comment-total">共 {{ total }} 条评论</span>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="state-container">
      <div class="spinner"></div>
      <p class="state-text">加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="state-container error">
      <p class="state-text">{{ error }}</p>
      <button @click="loadComments" class="btn-retry">重试</button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="comments.length === 0" class="state-container empty">
      <div class="empty-icon"></div>
      <p class="state-text">暂无评论</p>
      <router-link to="/novel/list" class="btn-browse">去书库看看</router-link>
    </div>

    <!-- 评论列表 -->
    <template v-else>
      <div class="comment-list">
        <div v-for="comment in comments" :key="comment.commentId" class="comment-card">
          <div class="card-header">
            <router-link
                :to="`/novel/detail/${comment.novelId}`"
                class="novel-link"
            >
              《{{ novelCache[comment.novelId] || loadNovelName(comment.novelId) || '未知小说' }}》
            </router-link>
          </div>
          <div class="card-body">
            <p class="comment-content">{{ comment.content }}</p>
          </div>
          <div class="card-footer">
            <span class="comment-time">{{ formatDate(comment.createdTime || comment.createTime) }}</span>
            <button
                class="btn-delete"
                :disabled="deletingId === comment.commentId"
                @click="handleDelete(comment.commentId)"
            >
              {{ deletingId === comment.commentId ? '删除中...' : '删除' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > size" class="pagination-wrapper">
        <el-pagination
            v-model:current-page="page"
            :page-size="size"
            :total="total"
            layout="prev, pager, next"
            background
            @current-change="onPageChange"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { commentApi, novelApi } from '../../api'

const router = useRouter()
const comments = ref([])
const loading = ref(false)
const error = ref('')
const page = ref(1)
const size = ref(20)
const total = ref(0)
const deletingId = ref(null)
const novelCache = ref({})

const loadNovelName = async (novelId) => {
  if (novelCache.value[novelId]) return novelCache.value[novelId]
  try {
    const res = await novelApi.getNovel(novelId)
    const data = res.data.data
    const name = data?.novelName || '未知小说'
    novelCache.value[novelId] = name
    return name
  } catch {
    novelCache.value[novelId] = '未知小说'
    return '未知小说'
  }
}

const loadComments = async () => {
  const userId = localStorage.getItem('userId')
  if (!userId) {
    error.value = '请先登录'
    return
  }

  try {
    loading.value = true
    error.value = ''

    const response = await commentApi.getCommentsByUser(userId, page.value, size.value)
    if (response.data.code === 200 || response.data.message === 'success') {
      comments.value = response.data.data || []

      // 加载评论总数
      try {
        const countRes = await commentApi.getCommentCountByUser(userId)
        if (countRes.data.code === 200 || countRes.data.message === 'success') {
          total.value = countRes.data.data || 0
        }
      } catch { /* ignore */ }

      // 预加载所有关联的小说名称
      const novelIds = [...new Set(comments.value.map(c => c.novelId).filter(Boolean))]
      await Promise.all(novelIds.map(id => loadNovelName(id)))
    } else {
      error.value = response.data.message || '获取评论失败'
    }
  } catch (err) {
    console.error('获取评论失败:', err)
    error.value = '获取评论失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const handleDelete = async (commentId) => {
  try {
    await ElMessageBox.confirm('确定删除这条评论吗？此操作不可恢复。', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
  } catch {
    return
  }

  try {
    deletingId.value = commentId
    const response = await commentApi.deleteComment(commentId)
    if (response.data.code === 200 || response.data.message === 'success') {
      ElMessage.success('删除成功')
      comments.value = comments.value.filter(c => c.commentId !== commentId)
      total.value = Math.max(0, total.value - 1)
    } else {
      ElMessage.error(response.data.message || '删除失败')
    }
  } catch (err) {
    console.error('删除评论失败:', err)
    ElMessage.error('删除失败，请稍后重试')
  } finally {
    deletingId.value = null
  }
}

const onPageChange = (newPage) => {
  page.value = newPage
  loadComments()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadComments()
})
</script>

<style scoped>
.user-comments-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(168, 216, 234, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.3s;
}

.btn-back:hover {
  background: rgba(79, 172, 254, 0.15);
  color: #4facfe;
  border-color: rgba(79, 172, 254, 0.3);
}

.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.85);
}

.comment-total {
  color: rgba(168, 216, 234, 0.6);
  font-size: 0.9rem;
}

/* 状态容器 */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.state-text {
  color: rgba(168, 216, 234, 0.6);
  font-size: 1.1rem;
  margin: 1rem 0;
}

.empty-icon {
  font-size: 3rem;
  color: #4facfe;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.08);
  border-top: 3px solid #4facfe;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-retry,
.btn-browse {
  padding: 0.7rem 1.5rem;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s;
  margin-top: 0.5rem;
}

.btn-retry:hover,
.btn-browse:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

/* 评论列表 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.3s;
}

.comment-card:hover {
  border-color: rgba(79, 172, 254, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.novel-link {
  color: #4facfe;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.novel-link:hover {
  color: #00f2fe;
  text-decoration: underline;
}

.card-body {
  padding: 1.25rem 1.5rem;
}

.comment-content {
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.7;
  font-size: 0.95rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.card-footer {
  padding: 0.75rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-time {
  color: rgba(168, 216, 234, 0.5);
  font-size: 0.85rem;
}

.btn-delete {
  padding: 0.4rem 1rem;
  background: rgba(255, 107, 129, 0.12);
  color: #ff6b81;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete:hover:not(:disabled) {
  background: rgba(255, 107, 129, 0.25);
}

.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  padding: 1rem 0;
}

.pagination-wrapper :deep(.el-pagination.is-background .el-pager li) {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
}

.pagination-wrapper :deep(.el-pagination.is-background .el-pager li:not(.disabled).active) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.pagination-wrapper :deep(.el-pagination.is-background .el-pager li:hover) {
  color: #4facfe;
}

.pagination-wrapper :deep(.el-pagination button) {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
}

.pagination-wrapper :deep(.el-pagination button:hover) {
  color: #4facfe;
}

.pagination-wrapper :deep(.el-pagination button:disabled) {
  color: rgba(255, 255, 255, 0.3);
}

/* 响应式 */
@media (max-width: 768px) {
  .user-comments-page {
    padding: 1rem 0.75rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-header,
  .card-body,
  .card-footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
