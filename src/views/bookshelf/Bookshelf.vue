<template>
  <div class="bookshelf-container">
    <h2>我的书架</h2>
    <div v-if="bookshelfItems.length > 0" class="bookshelf-list">
      <div v-for="item in bookshelfItems" :key="item.id" class="bookshelf-item">
        <div class="book-info">
          <div class="book-cover" v-if="item.novelCover">
            <img :src="item.novelCover" :alt="item.novelName">
          </div>
          <div class="book-cover" v-else>
            <div class="cover-placeholder">{{ item.novelName?.charAt(0) }}</div>
          </div>
          <router-link :to="`/novel/detail/${item.novelId}`">
            <h3>{{ item.novelName || '未知小说' }}</h3>
            <p class="last-read">最后阅读：{{ formatDate(item.lastReadTime) || '未阅读' }}</p>
          </router-link>
        </div>
        <div class="book-actions">
          <button class="btn" @click="continueReading(item)">继续阅读</button>
          <button class="btn btn-danger" @click="removeFromBookshelf(item.id)">移除</button>
        </div>
      </div>
    </div>
    <div v-else class="empty">书架为空，去添加一些小说吧！</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { bookshelfApi, novelApi, chapterApi } from '../../api'

const router = useRouter()
const bookshelfItems = ref([])

const getBookshelfItems = async () => {
  try {
    // 从 localStorage 获取实际登录用户的 ID
    const userId = localStorage.getItem('userId')

    if (!userId) {
      alert('请先登录')
      router.push('/login')
      return
    }

    console.log('获取书架列表，userId:', userId)
    const response = await bookshelfApi.getBookshelfByUser(parseInt(userId))
    console.log('书架列表响应:', response)

    if (response.data.code === '200' || response.data.message === 'success') {
      const items = response.data.data || []
      console.log('书架列表:', items)

      // 获取小说名称
      for (const item of items) {
        try {
          const novelResponse = await novelApi.getNovel(item.novelId)
          if (novelResponse.data.code === '200' || novelResponse.data.message === 'success') {
            item.novelName = novelResponse.data.data.novelName
            item.novelCover = novelResponse.data.data.coverImage
          }
        } catch (novelError) {
          console.error(`获取小说${item.novelId}信息失败:`, novelError)
        }
      }
      bookshelfItems.value = items
    }
  } catch (error) {
    console.error('获取书架失败:', error)
    alert('获取书架失败，请稍后重试')
  }
}

const continueReading = async (item) => {
  try {
    if (item.lastReadChapterId) {
      // 直接跳转到上次阅读的章节
      router.push(`/chapter/read/${item.lastReadChapterId}`)
    } else {
      // 跳转到小说的章节列表
      router.push(`/chapter/list/${item.novelId}`)
    }
  } catch (error) {
    console.error('跳转失败:', error)
  }
}

const removeFromBookshelf = async (id) => {
  try {
    const item = bookshelfItems.value.find(item => item.id === id)
    if (item) {
      const userId = localStorage.getItem('userId')
      const response = await bookshelfApi.removeFromBookshelf({
        userId: parseInt(userId),
        novelId: item.novelId
      })
      if (response.data.code === '200' || response.data.message === 'success') {
        alert('移除成功')
        await getBookshelfItems()
      } else {
        alert(response.data.message || '移除失败')
      }
    }
  } catch (error) {
    console.error('移除失败:', error)
    alert('移除成功')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

onMounted(() => {
  getBookshelfItems()
})
</script>

<style scoped>
.bookshelf-container {
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
}

.bookshelf-list {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.bookshelf-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  transition: all 0.3s;
  gap: 1.5rem;
}

.bookshelf-item:last-child {
  border-bottom: none;
}

.bookshelf-item:hover {
  background-color: #f9f9f9;
  transform: translateX(5px);
}

.book-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.book-cover {
  width: 80px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
}

.book-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: #333;
}


.bookshelf-item:last-child {
  border-bottom: none;
}

.bookshelf-item:hover {
  background-color: #f9f9f9;
}

.book-info {
  flex: 1;
}

.book-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.book-info a {
  text-decoration: none;
  color: #333;
}

.last-read {
  margin: 0;
  font-size: 0.9rem;
  color: #999;
}

.book-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #555;
}

.btn-danger {
  background-color: #dc3545;
}

.btn-danger:hover {
  background-color: #c82333;
}

.empty {
  text-align: center;
  padding: 4rem;
  color: #666;
  font-size: 1.2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-top: 2rem;
}
</style>