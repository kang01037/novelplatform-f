<template>
  <div class="novel-hot-container">
    <h2>热门小说</h2>
    <div class="novel-grid">
      <div v-for="novel in hotNovels" :key="novel.novelId" class="novel-card">
        <router-link :to="`/novel/detail/${novel.novelId}`">
          <div class="novel-cover">
            <img :src="novel.coverImage" :alt="novel.novelName" v-if="novel.coverImage">
            <div class="cover-placeholder" v-else>{{ novel.novelName }}</div>
          </div>
          <div class="novel-info">
            <h3>{{ novel.novelName }}</h3>
            <p class="novel-desc">{{ novel.content }}</p>
            <div class="novel-stats">
              <span>点击: {{ novel.clickCount }}</span>
              <span>收藏: {{ novel.collectCount }}</span>
              <span>评分: {{ novel.score }}</span>
            </div>
          </div>
        </router-link>
      </div>
    </div>
    <div v-if="hotNovels.length === 0" class="empty">暂无热门小说</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { novelApi } from '../../api'

const hotNovels = ref([])

const getHotNovels = async () => {
  try {
    const response = await novelApi.getHotNovels()
    if (response.data.code === '200') {
      hotNovels.value = response.data.data
    }
  } catch (error) {
    console.error('获取热门小说失败:', error)
  }
}

onMounted(() => {
  getHotNovels()
})
</script>

<style scoped>
.novel-hot-container {
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
}

.novel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.novel-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.novel-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.novel-card a {
  text-decoration: none;
  color: inherit;
  display: block;
}

.novel-cover {
  height: 200px;
  overflow: hidden;
  background-color: #f0f0f0;
}

.novel-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
  color: #666;
}

.novel-info {
  padding: 1.5rem;
}

.novel-info h3 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
}

.novel-desc {
  margin: 0 0 1rem 0;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.novel-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #999;
}

.empty {
  text-align: center;
  padding: 4rem;
  color: #666;
  font-size: 1.2rem;
}
</style>