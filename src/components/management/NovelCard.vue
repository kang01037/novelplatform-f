<template>
  <div class="novel-card">
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
        <el-tag size="small">{{ categoryName }}</el-tag>
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
      <el-button size="small" type="danger" @click="handleDelete">
        删除
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  novel: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['delete'])

const categoryName = computed(() => {
  const category = props.categories.find(c => c.categoryId === props.novel.categoryId)
  return category ? category.categoryName : '未知'
})

const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

const handleDelete = () => {
  emit('delete', props.novel.novelId)
}
</script>

<style scoped>
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
</style>
