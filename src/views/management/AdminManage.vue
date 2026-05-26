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

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="用户管理" name="user">
          <UserTable
              :data="userList"
              :loading="loading"
              @delete="deleteUser"
          />
          <Pagination
              v-model="userPagination"
              @change="handleUserPageChange"
          />
        </el-tab-pane>

        <el-tab-pane label="小说管理" name="novel">
          <SearchBar
              v-model="searchForm.keyword"
              placeholder="搜索小说名或作者"
              @search="handleSearch"
          />
          <div class="novel-grid">
            <NovelCard
                v-for="novel in novelList"
                :key="novel.novelId"
                :novel="novel"
                :categories="categories"
                @delete="deleteNovel"
            />
            <div v-if="novelList.length === 0" class="empty-tip">
              暂无小说数据
            </div>
          </div>
          <Pagination
              v-model="novelPagination"
              @change="handleNovelPageChange"
          />
        </el-tab-pane>

        <el-tab-pane label="评论管理" name="comment">
          <SearchBar
              v-model="searchForm.keyword"
              placeholder="搜索评论内容"
              @search="handleSearch"
          />
          <CommentTable
              :data="commentList"
              :loading="loading"
              @delete="deleteComment"
          />
          <Pagination
              v-model="commentPagination"
              @change="handleCommentPageChange"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Refresh, SwitchButton } from '@element-plus/icons-vue'
import { userApi, novelApi, commentApi } from '../../api'
import SearchBar from '../../components/management/SearchBar.vue'
import NovelCard from '../../components/management/NovelCard.vue'
import Pagination from '../../components/management/Pagination.vue'
import UserTable from './UserTable.vue'
import CommentTable from './CommentTable.vue'

const router = useRouter()
const activeTab = ref('user')
const loading = ref(false)

const userList = ref([])
const novelList = ref([])
const commentList = ref([])
const categories = ref([])

const userPagination = reactive({ page: 1, pageSize: 10, total: 0 })
const novelPagination = reactive({ page: 1, pageSize: 10, total: 0 })
const commentPagination = reactive({ page: 1, pageSize: 10, total: 0 })

const searchForm = reactive({ keyword: '' })

onMounted(() => {
  loadUserList()
  loadCategories()
})

const loadUserList = async () => {
  loading.value = true
  try {
    const res = await userApi.getUsers()
    if (res.data.code === 200) {
      const list = res.data.data || []
      userList.value = list
      userPagination.total = list.length
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const loadNovelList = async () => {
  loading.value = true
  try {
    let list = []
    if (searchForm.keyword) {
      const res = await novelApi.searchNovels(searchForm.keyword)
      if (res.data.code === 200) {
        list = res.data.data || []
      }
    } else {
      const res = await novelApi.getNovels()
      if (res.data.code === 200) {
        list = res.data.data || []
      }
    }
    novelList.value = list
    novelPagination.total = list.length
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const loadCommentList = async () => {
  loading.value = true
  try {
    const res = await commentApi.getAllComments(commentPagination.page, commentPagination.pageSize)
    if (res.data.code === 200) {
      commentList.value = res.data.data || []
      commentPagination.total = res.data.data ? res.data.data.length : 0
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const loadCategories = () => {
  categories.value = [
    { categoryId: 1, categoryName: '玄幻奇幻' },
    { categoryId: 2, categoryName: '武侠仙侠' },
    { categoryId: 3, categoryName: '都市言情' },
    { categoryId: 4, categoryName: '科幻灵异' },
    { categoryId: 5, categoryName: '历史军事' },
    { categoryId: 6, categoryName: '游戏竞技' }
  ]
}

const handleTabChange = (tab) => {
  searchForm.keyword = ''
  if (tab === 'user') {
    loadUserList()
  } else if (tab === 'novel') {
    loadNovelList()
  } else if (tab === 'comment') {
    loadCommentList()
  }
}

const handleSearch = () => {
  if (activeTab.value === 'novel') {
    loadNovelList()
  } else if (activeTab.value === 'comment') {
    loadCommentList()
  }
}

const handleUserPageChange = ({ page }) => {
  userPagination.page = page
  loadUserList()
}

const handleNovelPageChange = ({ page }) => {
  novelPagination.page = page
  loadNovelList()
}

const handleCommentPageChange = ({ page }) => {
  commentPagination.page = page
  loadCommentList()
}

const deleteUser = async (userId) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', { type: 'warning' })
    const res = await userApi.deleteUser(userId)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      loadUserList()
    } else {
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

const deleteNovel = async (novelId) => {
  try {
    await ElMessageBox.confirm('确定要删除该小说吗？', '提示', { type: 'warning' })
    const res = await novelApi.deleteNovel(novelId)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      loadNovelList()
    } else {
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

const deleteComment = async (commentId) => {
  try {
    await ElMessageBox.confirm('确定要删除该评论吗？', '提示', { type: 'warning' })
    const res = await commentApi.deleteComment(commentId)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      loadCommentList()
    } else {
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

const logout = () => {
  localStorage.clear()
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background: linear-gradient(170deg, #0a1628 0%, #0f2847 30%, #143a63 60%, #1a4d80 100%);
  padding: 20px;
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #26b6ff 0%, #4fd1c5 50%, #81e6d9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.novel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.empty-tip {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: rgba(168, 216, 234, 0.5);
  font-size: 1rem;
}
</style>
