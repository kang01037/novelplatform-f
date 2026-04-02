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
          <el-input
              v-model="searchForm.keyword"
              placeholder="搜索小说名或作者"
              style="width: 300px; margin-bottom: 16px"
              clearable
              @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
          <el-table :data="novelList" v-loading="loading" stripe style="width: 100%">
            <el-table-column prop="novelId" label="ID" width="80" />
            <el-table-column prop="novelName" label="小说名" />
            <el-table-column prop="authorId" label="作者 ID" width="100" />
            <el-table-column label="类别" width="100">
              <template #default="scope">
                <el-tag>{{ getCategoryName(scope.row.categoryId) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
                  {{ scope.row.status === 1 ? '连载中' : '已完结' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="字数" width="100">
              <template #default="scope">
                {{ scope.row.wordCount || 0 }}
              </template>
            </el-table-column>
            <el-table-column prop="clickCount" label="点击量" width="100" />
            <el-table-column prop="collectCount" label="收藏量" width="100" />
            <el-table-column prop="recommendCount" label="推荐数" width="100" />
            <el-table-column prop="score" label="评分" width="80">
              <template #default="scope">
                {{ scope.row.score || 0 }}分
              </template>
            </el-table-column>
            <el-table-column label="最新章节" width="150" show-overflow-tooltip>
              <template #default="scope">
                {{ scope.row.lastChapterName || '无' }}
              </template>
            </el-table-column>
            <el-table-column label="创建时间" width="180">
              <template #default="scope">
                {{ formatTime(scope.row.createdTime) }}
              </template>
            </el-table-column>
            <el-table-column label="更新时间" width="180">
              <template #default="scope">
                {{ formatTime(scope.row.updatedTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="scope">
                <el-button
                    size="small"
                    type="danger"
                    :icon="Delete"
                    @click="deleteNovel(scope.row.novelId)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
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
          <el-input
              v-model="searchForm.keyword"
              placeholder="搜索评论内容"
              style="width: 300px; margin-bottom: 16px"
              clearable
              @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
          <el-table :data="commentList" v-loading="loading" stripe style="width: 100%">
            <el-table-column prop="commentId" label="ID" width="80" />
            <el-table-column prop="username" label="评论用户" width="120" />
            <el-table-column prop="nickname" label="用户昵称" width="100" />
            <el-table-column prop="novelTitle" label="小说名" width="150" />
            <el-table-column prop="content" label="评论内容" show-overflow-tooltip />
            <el-table-column label="点赞数" width="80">
              <template #default="scope">
                {{ scope.row.likeCount || 0 }}
              </template>
            </el-table-column>
            <el-table-column label="评论时间" width="180">
              <template #default="scope">
                {{ formatTime(scope.row.createdTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
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
  // 清空所有本地存储数据
  localStorage.removeItem('token')
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
  background: #f5f7fa;
  min-height: calc(100vh - 200px);
}

.admin-card {
  max-width: 1400px;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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
  color: #333;
}

:deep(.el-tabs__header) {
  margin-bottom: 24px;
}

:deep(.el-tabs__item) {
  font-size: 1rem;
  padding: 0 20px;
}

:deep(.el-table) {
  font-size: 0.95rem;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-pagination) {
  display: flex;
}

:deep(.el-tag) {
  border-radius: 4px;
}

:deep(.el-button) {
  border-radius: 6px;
}

:deep(.el-card__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
</style>
