<template>
  <div class="admin-container">
    <el-card class="admin-card">
      <template #header>
        <div class="card-header">
          <h2 class="card-title">管理后台</h2>
          <div class="header-actions">
            <el-button @click="handleTabChange" :icon="Refresh" circle />
            <el-button @click="logout" :icon="SwitchButton" type="danger" plain>
              退出登录
            </el-button>
          </div>
        </div>
      </template>

      <!-- 标签页切换 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="用户管理" name="user">
          <el-table :data="userList" v-loading="loading" stripe style="width: 100%">
            <el-table-column prop="userId" label="ID" width="80" />
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="nickname" label="昵称" width="100" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="phone" label="手机号" width="120" />
            <el-table-column label="性别" width="80">
              <template #default="scope">
                <span v-if="scope.row.gender === 1">男</span>
                <span v-else-if="scope.row.gender === 2">女</span>
                <span v-else>未知</span>
              </template>
            </el-table-column>
            <el-table-column label="用户状态" width="100">
              <template #default="scope">
                <el-tag v-if="scope.row.userStatus === 1">普通用户</el-tag>
                <el-tag v-else-if="scope.row.userStatus === 2" type="success">作家</el-tag>
                <el-tag v-else-if="scope.row.userStatus === 3" type="warning">管理员</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="最后登录" width="180">
              <template #default="scope">
                {{ formatTime(scope.row.lastLoginTime) }}
              </template>
            </el-table-column>
            <el-table-column label="登录次数" width="100">
              <template #default="scope">
                {{ scope.row.loginCount || 0 }}
              </template>
            </el-table-column>
            <el-table-column label="注册时间" width="180">
              <template #default="scope">
                {{ formatTime(scope.row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="scope">
                <el-button
                    v-if="scope.row.userStatus !== 3"
                    size="small"
                    type="danger"
                    :icon="Delete"
                    @click="deleteUser(scope.row.userId)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
              v-model:current-page="userPagination.page"
              v-model:page-size="userPagination.pageSize"
              :total="userPagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @current-change="handleUserPageChange"
              style="margin-top: 20px; justify-content: flex-end"
          />
        </el-tab-pane>

        <el-tab-pane label="小说管理" name="novel">
          <div class="search-bar">
            <el-input
                v-model="searchForm.keyword"
                placeholder="搜索小说名或作者"
                style="width: 300px"
                clearable
                @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button @click="handleSearch">搜索</el-button>
              </template>
            </el-input>
          </div>
          <div class="novel-grid">
            <div v-for="novel in novelList" :key="novel.novelId" class="novel-card">
              <div class="novel-header">
                <span class="novel-id">ID: {{ novel.novelId }}</span>
                <el-tag :type="novel.status === 1 ? 'success' : 'info'" size="small">
                  {{ novel.status === 1 ? '连载中' : '完结' }}
                </el-tag>
              </div>
              <h3 class="novel-name">{{ novel.novelName }}</h3>
              <div class="novel-info">
                <div class="info-row">
                  <span class="label">作者 ID：</span>
                  <span class="value">{{ novel.authorId }}</span>
                </div>
                <div class="info-row">
                  <span class="label">类别：</span>
                  <el-tag size="small">{{ getCategoryName(novel.categoryId) }}</el-tag>
                </div>
                <div class="info-row">
                  <span class="label">字数：</span>
                  <span class="value">{{ novel.wordCount || 0 }}</span>
                </div>
                <div class="info-row">
                  <span class="label">点击：</span>
                  <span class="value">{{ novel.clickCount || 0 }}</span>
                </div>
                <div class="info-row">
                  <span class="label">收藏：</span>
                  <span class="value">{{ novel.collectCount || 0 }}</span>
                </div>
                <div class="info-row">
                  <span class="label">评分：</span>
                  <span class="value">{{ novel.score || 0 }}</span>
                </div>
                <div class="info-row full-width">
                  <span class="label">创建时间：</span>
                  <span class="value">{{ formatTime(novel.createdTime) }}</span>
                </div>
              </div>
              <div class="novel-actions">
                <el-button size="small" type="danger" :icon="Delete" @click="deleteNovel(novel.novelId)">
                  删除
                </el-button>
              </div>
            </div>
            <div v-if="novelList.length === 0" class="empty-tip">
              暂无小说数据
            </div>
          </div>
          <el-pagination
              v-model:current-page="novelPagination.page"
              v-model:page-size="novelPagination.pageSize"
              :total="novelPagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @current-change="handleNovelPageChange"
              style="margin-top: 20px; justify-content: flex-end"
          />
        </el-tab-pane>

        <el-tab-pane label="评论管理" name="comment">
          <div class="search-bar">
            <el-input
                v-model="searchForm.keyword"
                placeholder="搜索评论内容"
                style="width: 300px"
                clearable
                @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button @click="handleSearch">搜索</el-button>
              </template>
            </el-input>
          </div>
          <div class="table-wrapper">
            <el-table :data="commentList" v-loading="loading" stripe style="width: 100%">
            <el-table-column prop="commentId" label="ID" width="60" />
            <el-table-column prop="username" label="用户" width="80" show-overflow-tooltip />
            <el-table-column prop="novelTitle" label="小说" width="100" show-overflow-tooltip />
            <el-table-column prop="content" label="评论内容" min-width="150" show-overflow-tooltip />
            <el-table-column label="点赞" width="60">
              <template #default="scope">
                {{ scope.row.likeCount || 0 }}
              </template>
            </el-table-column>
            <el-table-column label="评论时间" width="160">
              <template #default="scope">
                {{ formatTime(scope.row.createdTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="scope">
                <el-button
                    size="small"
                    type="danger"
                    :icon="Delete"
                    @click="deleteComment(scope.row.commentId)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          </div>
          <el-pagination
              v-model:current-page="commentPagination.page"
              v-model:page-size="commentPagination.pageSize"
              :total="commentPagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @current-change="handleCommentPageChange"
              style="margin-top: 20px; justify-content: flex-end"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Refresh } from '@element-plus/icons-vue'
import { userApi, novelApi, commentApi } from '../../api'

const router = useRouter()
const activeTab = ref('user')
const loading = ref(false)

// 数据列表
const userList = ref([])
const novelList = ref([])
const commentList = ref([])

// 分页
const userPagination = ref({ page: 1, pageSize: 10, total: 0 })
const novelPagination = ref({ page: 1, pageSize: 10, total: 0 })
const commentPagination = ref({ page: 1, pageSize: 10, total: 0 })

// 搜索
const searchForm = ref({
  keyword: ''
})

// 时间格式化
const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 类别名称映射
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

const getUserList = async () => {
  loading.value = true
  try {
    const response = await userApi.getUsers()
    console.log('用户列表响应:', response.data)

    const { code, message, data } = response.data

    if (code === 200) {
      // 后端返回的是数组，需要处理成分页格式
      const users = Array.isArray(data) ? data : []

      console.log('用户数据:', users)
      if (users.length > 0) {
        console.log('第一个用户的数据:', users[0])
        console.log('createTime 字段:', users[0].createTime)
        console.log('createdTime 字段:', users[0].createdTime)

        // 修复：后端返回的是 createdTime，需要映射到 createTime
        users.forEach(user => {
          if (user.createdTime && !user.createTime) {
            user.createTime = user.createdTime
          }
        })
      }

      userList.value = users.slice(
          (userPagination.value.page - 1) * userPagination.value.pageSize,
          userPagination.value.page * userPagination.value.pageSize
      )
      userPagination.value.total = users.length
    } else {
      ElMessage.error(message || '获取用户列表失败')
      userList.value = []
      userPagination.value.total = 0
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败：' + (error.response?.data?.message || error.message))
    userList.value = []
    userPagination.value.total = 0
  } finally {
    loading.value = false
  }
}

const getNovelList = async () => {
  loading.value = true
  try {
    const response = await novelApi.getNovels()
    console.log('小说列表响应:', response.data)

    const {code, message, data} = response.data

    if (code === 200) {
      // 后端返回的是数组，需要处理成分页格式
      const novels = Array.isArray(data) ? data : []

      // 搜索过滤
      let filtered = novels
      if (searchForm.value.keyword) {
        const keyword = searchForm.value.keyword.toLowerCase()
        filtered = novels.filter(novel =>
            (novel.novelName && novel.novelName.toLowerCase().includes(keyword)) ||
            (novel.authorName && novel.authorName.toLowerCase().includes(keyword))
        )
      }

      novelList.value = filtered.slice(
          (novelPagination.value.page - 1) * novelPagination.value.pageSize,
          novelPagination.value.page * novelPagination.value.pageSize
      )
      novelPagination.value.total = filtered.length
    } else {
      ElMessage.error(message || '获取小说列表失败')
      novelList.value = []
      novelPagination.value.total = 0
    }
  } catch (error) {
    console.error('获取小说列表失败:', error)
    ElMessage.error('获取小说列表失败：' + (error.response?.data?.message || error.message))
    novelList.value = []
    novelPagination.value.total = 0
  } finally {
    loading.value = false
  }
}

const getCommentList = async () => {
  loading.value = true
  try {
    // 1. 获取所有评论
    const commentResponse = await commentApi.getAllComments()
    if (commentResponse.data.code === 200) {
      let allComments = Array.isArray(commentResponse.data.data) ? commentResponse.data.data : []

      // 2. 获取小说信息并创建映射
      const novelResponse = await novelApi.getNovels()
      const novelMap = new Map()
      if (novelResponse.data.code === 200) {
        const novels = Array.isArray(novelResponse.data.data) ? novelResponse.data.data : []
        novels.forEach(novel => {
          novelMap.set(novel.novelId, novel.novelName)
        })
      }

      // 3. 获取用户信息并创建映射
      const userResponse = await userApi.getUsers()
      const userMap = new Map()
      if (userResponse.data.code === 200) {
        const users = Array.isArray(userResponse.data.data) ? userResponse.data.data : []
        users.forEach(user => {
          userMap.set(user.userId, {
            username: user.username,
            nickname: user.nickname
          })
        })
      }

      // 4. 为评论关联用户和小说信息
      allComments = allComments.map(comment => {
        const userInfo = userMap.get(comment.userId) || {}
        return {
          ...comment,
          username: userInfo.username || '未知用户',
          nickname: userInfo.nickname || '未知用户',
          novelTitle: novelMap.get(comment.novelId) || '未知小说'
        }
      })

      console.log('评论列表响应:', allComments)

      // 5. 搜索过滤（支持用户名、昵称、内容）
      let filtered = allComments
      if (searchForm.value.keyword) {
        const keyword = searchForm.value.keyword.toLowerCase()
        filtered = allComments.filter(comment =>
            (comment.content && comment.content.toLowerCase().includes(keyword)) ||
            (comment.username && comment.username.toLowerCase().includes(keyword)) ||
            (comment.nickname && comment.nickname.toLowerCase().includes(keyword))
        )
      }

      // 6. 分页处理
      commentList.value = filtered.slice(
          (commentPagination.value.page - 1) * commentPagination.value.pageSize,
          commentPagination.value.page * commentPagination.value.pageSize
      )
      commentPagination.value.total = filtered.length
    }
  } catch (error) {
    console.error('获取评论列表失败:', error)
    ElMessage.error('获取评论列表失败：' + (error.response?.data?.message || error.message))
    commentList.value = []
    commentPagination.value.total = 0
  } finally {
    loading.value = false
  }
}

const deleteUser = async (userId) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await userApi.deleteUser(userId)
    const {code, message} = response.data

    if (code === 200) {
      ElMessage.success('删除成功')
      getUserList()
    } else {
      ElMessage.error(message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

const deleteNovel = async (novelId) => {
  try {
    await ElMessageBox.confirm('确定要删除该小说吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await novelApi.deleteNovel(novelId)
    const {code, message} = response.data

    if (code === 200) {
      ElMessage.success('删除成功')
      getNovelList()
    } else {
      ElMessage.error(message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

const deleteComment = async (commentId) => {
  try {
    await ElMessageBox.confirm('确定要删除该评论吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await commentApi.deleteComment(commentId)
    const {code, message} = response.data

    if (code === 200) {
      ElMessage.success('删除成功')
      getCommentList()
    } else {
      ElMessage.error(message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

const handleSearch = () => {
  if (activeTab.value === 'user') {
    userPagination.value.page = 1
    getUserList()
  } else if (activeTab.value === 'novel') {
    novelPagination.value.page = 1
    getNovelList()
  } else if (activeTab.value === 'comment') {
    commentPagination.value.page = 1
    getCommentList()
  }
}

const handleTabChange = () => {
  searchForm.value.keyword = ''
  if (activeTab.value === 'user') {
    getUserList()
  } else if (activeTab.value === 'novel') {
    getNovelList()
  } else if (activeTab.value === 'comment') {
    getCommentList()
  }
}

const handleUserPageChange = (page) => {
  userPagination.value.page = page
  getUserList()
}

const handleNovelPageChange = (page) => {
  novelPagination.value.page = page
  getNovelList()
}

const handleCommentPageChange = (page) => {
  commentPagination.value.page = page
  getCommentList()
}

const logout = () => {
  // 通知服务端吊销 refresh token
  const refreshToken = localStorage.getItem('refreshToken')
  if (refreshToken) {
    import('../../api').then(({ authApi }) => {
      authApi.logout(refreshToken).catch(() => {})
    })
  }
  // 清空所有本地存储数据
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('username')
  localStorage.removeItem('userId')
  localStorage.removeItem('userStatus')
  localStorage.removeItem('userInfo')

  // 清空 sessionStorage 中的数据（如果有）
  sessionStorage.clear()

  // 跳转到登录页
  router.push('/login')
}

onMounted(() => {
  getUserList()
})
</script>

<style scoped>
.admin-container {
  padding: 2rem;
  background: transparent;
  min-height: calc(100vh - 200px);
}

.admin-card {
  max-width: 1400px;
  margin: 0 auto;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.table-wrapper {
  overflow-x: auto;
  margin-bottom: 10px;
}

.table-wrapper .el-table {
  min-width: 800px;
}

.search-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.search-bar :deep(.el-input) {
  margin-right: 30px;
  width: 270px !important;
}

.search-bar :deep(.el-input-group__append) {
  background: rgba(26, 182, 255, 0.1);
  border-color: rgba(26, 182, 255, 0.3);
  color: #26b6ff;
}

.novel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.novel-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s;
}

.novel-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(26, 182, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.novel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.novel-id {
  color: rgba(129, 230, 217, 0.5);
  font-size: 0.85rem;
}

.novel-name {
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  color: #fff;
  word-break: break-word;
}

.novel-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.info-row.full-width {
  width: 100%;
  flex-basis: 100%;
}

.info-row .label {
  color: rgba(129, 230, 217, 0.6);
}

.info-row .value {
  color: #fff;
}

.novel-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.empty-tip {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: rgba(168, 216, 234, 0.5);
  font-size: 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
}

:deep(.el-tabs__header) {
  margin-bottom: 24px;
}

:deep(.el-tabs__item) {
  font-size: 1rem;
  padding: 0 20px;
  color: rgba(168, 216, 234, 0.6);
}

:deep(.el-tabs__item.is-active) {
  color: #4facfe;
}

:deep(.el-tabs__active-bar) {
  background-color: #4facfe;
}

:deep(.el-table) {
  font-size: 0.95rem;
  background-color: transparent;
  color: rgba(255, 255, 255, 0.85);
}

:deep(.el-table th) {
  background-color: rgba(255, 255, 255, 0.06);
  color: rgba(168, 216, 234, 0.8);
  font-weight: 600;
}

:deep(.el-table td) {
  background-color: transparent;
  color: rgba(255, 255, 255, 0.75);
}

:deep(.el-table tr) {
  background-color: transparent;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: rgba(255, 255, 255, 0.03);
}

:deep(.el-table__body tr:hover > td) {
  background-color: rgba(79, 172, 254, 0.08) !important;
}

:deep(.el-table__header-wrapper) {
  background-color: transparent;
}

:deep(.el-table__inner-wrapper) {
  background-color: transparent;
}

:deep(.el-table__border-left-pattern), :deep(.el-table__border-right-pattern) {
  display: none;
}

:deep(.el-table--border) {
  border-color: rgba(255, 255, 255, 0.08);
}

:deep(.el-table__cell) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

:deep(.el-pagination) {
  display: flex;
  padding-top: 16px;
}

:deep(.el-pagination button),
:deep(.el-pager li),
:deep(.el-pagination .el-pagination__total),
:deep(.el-pagination .el-pagination__jump) {
  color: rgba(168, 216, 234, 0.6);
  background: transparent;
}

:deep(.el-pager li.active) {
  color: #4facfe;
}

:deep(.el-pagination .el-input__inner) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
}

:deep(.el-tag) {
  border-radius: 4px;
}

:deep(.el-button) {
  border-radius: 6px;
}

:deep(.el-card__header) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 16px 20px;
  border-bottom: none;
}

:deep(.card-header .el-button) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

:deep(.card-header .el-button:hover) {
  background: rgba(255, 255, 255, 0.3);
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: none;
}

:deep(.el-input__wrapper:hover) {
  border-color: rgba(79, 172, 254, 0.5);
}

:deep(.el-input__inner) {
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
}

:deep(.el-input-group__append) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

:deep(.el-input__inner::placeholder) {
  color: rgba(168, 216, 234, 0.3);
}
</style>
