<template>
  <div class="chapter-list-container">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p class="error-message">❌ {{ error }}</p>
      <button @click="getChapters" class="btn-retry">重试</button>
    </div>

    <div v-else-if="chapters.length === 0" class="empty-container">
      <p class="empty-message">暂无章节</p>
    </div>

    <template v-else>
      <div class="page-header">
        <h2>{{ novelName }} - 章节列表</h2>
        <div class="chapter-count">共 {{ chapters.length }} 章</div>
      </div>

      <div class="chapter-list">
        <div v-for="chapter in chapters" :key="chapter.chapterId" class="chapter-item">
          <router-link :to="`/chapter/read/${chapter.chapterId}`" class="chapter-link">
            <span class="chapter-num">第{{ chapter.chapterNum }}章</span>
            <span class="chapter-title">{{ chapter.chapterTitle }}</span>
            <span class="chapter-word-count">{{ chapter.wordCount }}字</span>
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {useRoute} from 'vue-router'
import {chapterApi} from '../../api'

const route = useRoute()
const novelId = route.params.novelId
const chapters = ref([])
const novelName = ref('')
const loading = ref(false)
const error = ref('')

const getChapters = async () => {
  try {
    loading.value = true
    error.value = ''

    console.log('开始获取章节列表，novelId:', novelId)
    const response = await chapterApi.getChaptersByNovel(novelId)
    console.log('章节列表响应:', response)
    console.log('响应数据:', response.data)

    if (response.data.code === 200 || response.data.message === 'success') {
      const data = response.data.data || []
      console.log('章节数据:', data)
      console.log('数据长度:', data.length)

      chapters.value = data

      if (chapters.value.length > 0) {
        novelName.value = chapters.value[0].novelName || `小说${novelId}`
      } else {
        novelName.value = `小说${novelId}`
      }
    } else {
      error.value = response.data.message || '获取章节失败'
      console.error('API 返回错误:', response.data)
    }
  } catch (err) {
    console.error('获取章节列表失败:', err)
    if (err.response) {
      console.error('错误响应:', err.response)
      const {code, message} = err.response.data
      if (code === 200 && message === 'success') {
        chapters.value = err.response.data.data || []
        if (chapters.value.length > 0) {
          novelName.value = chapters.value[0].novelName || `小说${novelId}`
        }
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

onMounted(() => {
  console.log('ChapterList 组件已挂载，novelId:', novelId)
  getChapters()
})
</script>

<style scoped>
.chapter-list-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background: transparent;
  min-height: 100vh;
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.page-header h2 {
  margin: 0;
  font-size: 1.8rem;
  color: rgba(255, 255, 255, 0.85);
}

.chapter-count {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
}

.chapter-list {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chapter-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s;
}

.chapter-item:last-child {
  border-bottom: none;
}

.chapter-item:hover {
  background: rgba(79, 172, 254, 0.08);
  transform: translateX(5px);
}

.chapter-link {
  display: flex;
  padding: 1.2rem 1.5rem;
  text-decoration: none;
  color: inherit;
  align-items: center;
  gap: 1rem;
}

.chapter-num {
  min-width: 100px;
  font-weight: bold;
  color: #4facfe;
  font-size: 1rem;
}

.chapter-title {
  flex: 1;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chapter-word-count {
  min-width: 80px;
  text-align: right;
  color: rgba(168, 216, 234, 0.5);
  font-size: 0.85rem;
  padding-left: 1rem;
}

@media (max-width: 768px) {
  .chapter-list-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .chapter-link {
    flex-direction: column;
    gap: 0.5rem;
  }

  .chapter-num {
    min-width: auto;
  }

  .chapter-word-count {
    min-width: auto;
    text-align: left;
  }
}
</style>
