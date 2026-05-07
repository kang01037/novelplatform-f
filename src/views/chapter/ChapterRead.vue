<template>
  <div class="chapter-read-container" :class="{ 'night-mode': isNightMode, 'fullscreen': isFullscreen }">
    <div class="reader-header" :class="{ 'fullscreen-header': isFullscreen }">
      <div class="header-left">
        <button class="btn" @click="goBack">返回</button>
      </div>
      <div class="header-center">
        <h3>{{ chapter?.chapterTitle || '阅读中' }}</h3>
      </div>
      <div class="header-right">
        <button class="btn fullscreen-btn" @click="toggleFullscreen">
          <span v-if="!isFullscreen">🔍</span>
          <span v-else>🔎</span>
          {{ isFullscreen ? '退出全屏' : '沉浸式阅读' }}
        </button>
        <button class="btn" @click="showSettings = !showSettings">设置</button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p class="error-message">❌ {{ error }}</p>
      <button @click="getChapterDetail" class="btn-retry">重试</button>
    </div>

    <div v-else-if="chapter" class="reader-content">
      <div class="chapter-body" :style="chapterBodyStyle">
        <h2 class="chapter-title">{{ chapter.chapterTitle }}</h2>
        <div class="chapter-meta">
          <span class="word-count">{{ chapter.wordCount }}字</span>
        </div>
        <div class="content">
          {{ chapter.chapterContent }}
        </div>
      </div>

      <div class="chapter-nav">
        <button
            class="btn btn-nav"
            @click="prevChapter"
            :disabled="!hasPrevChapter"
        >
          ← 上一章
        </button>
        <button
            class="btn btn-nav"
            @click="nextChapter"
            :disabled="!hasNextChapter"
        >
          下一章 →
        </button>
      </div>
    </div>

    <!-- 阅读设置 -->
    <div v-if="showSettings" class="settings-overlay" @click.self="showSettings = false">
      <div class="settings-panel">
        <h4>阅读设置</h4>
        <div class="setting-item">
          <label>字体大小</label>
          <div class="font-size-controls">
            <button @click="decreaseFontSize">A-</button>
            <span class="font-size-display">{{ fontSize }}px</span>
            <button @click="increaseFontSize">A+</button>
          </div>
        </div>
        <div class="setting-item">
          <label>夜间模式</label>
          <input type="checkbox" v-model="isNightMode" class="night-mode-toggle">
        </div>
        <div class="setting-item">
          <label>背景色</label>
          <div class="bg-color-options">
            <div
                class="bg-color"
                :style="{ backgroundColor: '#ffffff', border: bgColor === '#ffffff' ? '3px solid #4facfe' : '1px solid rgba(255,255,255,0.1)' }"
                @click="bgColor = '#ffffff'"
                title="白色"
            ></div>
            <div
                class="bg-color"
                :style="{ backgroundColor: '#f5f5dc', border: bgColor === '#f5f5dc' ? '3px solid #4facfe' : '1px solid rgba(255,255,255,0.1)' }"
                @click="bgColor = '#f5f5dc'"
                title="米色"
            ></div>
            <div
                class="bg-color"
                :style="{ backgroundColor: '#e6e6fa', border: bgColor === '#e6e6fa' ? '3px solid #4facfe' : '1px solid rgba(255,255,255,0.1)' }"
                @click="bgColor = '#e6e6fa'"
                title="淡紫"
            ></div>
            <div
                class="bg-color"
                :style="{ backgroundColor: '#e8f5e9', border: bgColor === '#e8f5e9' ? '3px solid #4facfe' : '1px solid rgba(255,255,255,0.1)' }"
                @click="bgColor = '#e8f5e9'"
                title="绿色"
            ></div>
          </div>
        </div>
        <button class="btn btn-close" @click="showSettings = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chapterApi, bookshelfApi } from '../../api'

const route = useRoute()
const router = useRouter()
const chapterId = ref(route.params.chapterId)
const chapter = ref(null)
const chapters = ref([])
const currentIndex = ref(0)
const loading = ref(false)
const error = ref('')
const showSettings = ref(false)
const fontSize = ref(16)
const isNightMode = ref(false)
const bgColor = ref('#ffffff')
const isFullscreen = ref(false)

// 章节内容样式计算
const chapterBodyStyle = computed(() => {
  const baseStyle = {
    fontSize: `${fontSize.value}px`,
    backgroundColor: bgColor.value,
    color: isNightMode.value ? '#eee' : '#333'
  }

  if (isNightMode.value) {
    baseStyle.backgroundColor = '#333'
  }

  return baseStyle
})

// 全屏切换函数 - 增强版本
const toggleFullscreen = async () => {
  try {
    if (!document.fullscreenElement) {
      // 进入全屏
      const element = document.querySelector('.chapter-read-container')
      if (element) {
        await element.requestFullscreen()
        isFullscreen.value = true
        document.body.style.overflow = 'hidden'
      }
    } else {
      // 退出全屏
      await document.exitFullscreen()
      isFullscreen.value = false
      document.body.style.overflow = 'auto'
    }
  } catch (err) {
    console.error('全屏切换失败:', err)
    // 如果浏览器不支持全屏 API，使用模拟全屏
    isFullscreen.value = !isFullscreen.value
  }
}

// 监听全屏变化
const onFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// 返回按钮
const goBack = () => {
  const lastRoute = localStorage.getItem('lastRoute')
  if (lastRoute) {
    router.push(lastRoute)
  } else {
    router.back()
  }
}

const getChapterDetail = async () => {
  try {
    loading.value = true
    error.value = ''

    console.log('开始获取章节详情，chapterId:', chapterId.value)
    const response = await chapterApi.getChapter(chapterId.value)
    console.log('章节详情响应:', response)
    console.log('响应数据:', response.data)

    if (response.data.code === 200 || response.data.message === 'success') {
      chapter.value = response.data.data
      console.log('章节详情:', chapter.value)

      // 获取章节列表
      await getChaptersByNovel()

      // 更新阅读进度
      updateReadingProgress()
    } else {
      error.value = response.data.message || '获取章节失败'
      console.error('API 返回错误:', response.data)
    }
  } catch (err) {
    console.error('获取章节详情失败:', err)
    if (err.response) {
      console.error('错误响应:', err.response)
      const { code, message } = err.response.data
      if (code === 200 && message === 'success') {
        chapter.value = err.response.data.data
        await getChaptersByNovel()
        updateReadingProgress()
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

const getChaptersByNovel = async () => {
  if (!chapter.value) return

  try {
    console.log('开始获取章节列表，novelId:', chapter.value.novelId)
    const response = await chapterApi.getChaptersByNovel(chapter.value.novelId)
    console.log('章节列表响应:', response)

    if (response.data.code === 200 || response.data.message === 'success') {
      chapters.value = response.data.data || []
      console.log('章节列表:', chapters.value)
      console.log('章节数量:', chapters.value.length)

      // 找到当前章节的索引
      currentIndex.value = chapters.value.findIndex(c => c.chapterId === parseInt(chapterId.value))
      console.log('当前章节索引:', currentIndex.value)
    } else {
      console.error('获取章节列表失败:', response.data)
    }
  } catch (err) {
    console.error('获取章节列表失败:', err)
  }
}

const updateReadingProgress = async () => {
  if (!chapter.value) return

  try {
    const userId = localStorage.getItem('userId') || '1'
    await bookshelfApi.updateReadingProgress({
      userId: parseInt(userId),
      novelId: chapter.value.novelId,
      chapterId: chapter.value.chapterId
    })
    console.log('阅读进度已更新')
  } catch (err) {
    console.error('更新阅读进度失败:', err)
  }
}

const prevChapter = () => {
  if (currentIndex.value > 0) {
    const prevChapterId = chapters.value[currentIndex.value - 1].chapterId
    router.push(`/chapter/read/${prevChapterId}`)
  }
}

const nextChapter = () => {
  if (currentIndex.value < chapters.value.length - 1) {
    const nextChapterId = chapters.value[currentIndex.value + 1].chapterId
    router.push(`/chapter/read/${nextChapterId}`)
  }
}

const increaseFontSize = () => {
  if (fontSize.value < 24) {
    fontSize.value += 2
  }
}

const decreaseFontSize = () => {
  if (fontSize.value > 12) {
    fontSize.value -= 2
  }
}

const hasPrevChapter = computed(() => {
  return currentIndex.value > 0
})

const hasNextChapter = computed(() => {
  return currentIndex.value < chapters.value.length - 1
})

// 监听路由变化，重新加载章节
watch(() => route.params.chapterId, (newChapterId) => {
  if (newChapterId) {
    chapterId.value = newChapterId
    getChapterDetail()
  }
})

// 添加事件监听
onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
  console.log('ChapterRead 组件已挂载，chapterId:', chapterId.value)
  getChapterDetail()
})

// 清理事件监听
onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  if (document.fullscreenElement) {
    document.exitFullscreen()
  }
  document.body.style.overflow = 'auto'
})
</script>

<style scoped>
.chapter-read-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  background: linear-gradient(170deg, #0f1923 0%, #1a2a3a 30%, #1e3a4f 60%, #2a4a5f 100%);
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.3s;
  z-index: 9999 !important;
}

.chapter-read-container.night-mode {
  background-color: #0a0a0a;
}

/* 全屏模式样式 */
.chapter-read-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
  z-index: 10000 !important;
}

.chapter-read-container.fullscreen .reader-header {
  background: rgba(0, 0, 0, 0.8);
  border: none;
  box-shadow: none;
}

.chapter-read-container.fullscreen .reader-header .btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}

.chapter-read-container.fullscreen .reader-header .btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.chapter-read-container.fullscreen .reader-content {
  padding: 0;
}

.chapter-read-container.fullscreen .chapter-body {
  padding: 4rem 15%;
  margin: 0;
  box-shadow: none;
  border-radius: 0;
}

.chapter-read-container.fullscreen .chapter-nav {
  padding: 0 15% 4rem;
}

/* 全屏模式下的夜间模式优化 */
.chapter-read-container.fullscreen.night-mode {
  background-color: #0a0a0a;
}

.chapter-read-container.fullscreen.night-mode .reader-header {
  background: rgba(0, 0, 0, 0.9);
}

.chapter-read-container.fullscreen.night-mode .reader-header .btn {
  background: rgba(255, 255, 255, 0.1);
  color: #eee;
  border-color: rgba(255, 255, 255, 0.3);
}

.chapter-read-container.fullscreen.night-mode .reader-header .btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.reader-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 25, 35, 0.9);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
}

.reader-header.fullscreen-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(15, 25, 35, 0.95);
  z-index: 101;
}

.reader-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.85);
}

.chapter-read-container.night-mode .reader-header {
  background: rgba(10, 10, 10, 0.95);
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.chapter-read-container.night-mode .reader-header h3 {
  color: #eee;
}

.btn {
  padding: 0.6rem 1.2rem;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.95rem;
  font-weight: 500;
}

.btn:hover:not(:disabled) {
  background: rgba(79, 172, 254, 0.15);
  border-color: #4facfe;
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.fullscreen-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
}

.fullscreen-btn:hover {
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
  min-height: calc(100vh - 60px);
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

.btn-retry {
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4);
}

.reader-content {
  padding: 0;
  width: 100%;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

.chapter-body {
  padding: 2rem 8%;
  border-radius: 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  transition: all 0.3s;
  flex: 1;
}

.chapter-body .content {
  text-indent: 2em;
  white-space: pre-wrap;
  line-height: 2.2;
  font-size: inherit;
  color: inherit;
}

.chapter-title {
  text-align: center;
  margin: 0 0 2rem 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.85);
}

.chapter-read-container.night-mode .chapter-title {
  color: #eee;
}

.chapter-meta {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.9rem;
  color: rgba(168, 216, 234, 0.5);
}

.word-count {
  color: rgba(168, 216, 234, 0.5);
}

.content {
  text-indent: 2em;
  white-space: pre-wrap;
  line-height: 2.2;
  font-size: 1.05rem;
}

.chapter-nav {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 8% 2rem;
  width: 100%;
  box-sizing: border-box;
}

.btn-nav {
  flex: 1;
  padding: 1rem 2rem;
  font-size: 1rem;
}

.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.settings-panel {
  background: rgba(15, 25, 35, 0.95);
  backdrop-filter: blur(20px);
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 201;
  min-width: 350px;
  max-width: 90%;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.settings-panel h4 {
  margin-top: 0;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.85);
}

.setting-item {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-item label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.font-size-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.font-size-controls button {
  width: 45px;
  height: 45px;
  border: 1px solid rgba(79, 172, 254, 0.4);
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  color: #4facfe;
  transition: all 0.3s;
}

.font-size-controls button:hover {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.font-size-display {
  min-width: 60px;
  text-align: center;
  font-size: 1.1rem;
  font-weight: bold;
  color: #4facfe;
}

.night-mode-toggle {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #4facfe;
}

.bg-color-options {
  display: flex;
  gap: 1rem;
}

.bg-color {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
}

.bg-color:hover {
  transform: scale(1.1);
}

.btn-close {
  width: 100%;
  padding: 0.8rem;
  margin-top: 1rem;
  justify-content: center;
}

@media (max-width: 768px) {
  .reader-header {
    padding: 0.8rem 1rem;
  }

  .chapter-body {
    padding: 1.5rem 4%;
  }

  .chapter-title {
    font-size: 1.3rem;
  }

  .chapter-nav {
    flex-direction: column;
    padding: 0 4% 2rem;
  }

  .btn-nav {
    width: 100%;
  }

  .settings-panel {
    min-width: auto;
    width: 90%;
    padding: 1.5rem;
  }
}
</style>
