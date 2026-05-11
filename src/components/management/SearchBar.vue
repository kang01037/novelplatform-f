<template>
  <div class="search-bar">
    <el-input
        v-model="keyword"
        :placeholder="placeholder"
        style="width: 270px; margin-right: 30px"
        clearable
        @keyup.enter="handleSearch"
    >
      <template #append>
        <el-button @click="handleSearch">搜索</el-button>
      </template>
    </el-input>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '搜索'
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const keyword = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  keyword.value = val
})

watch(keyword, (val) => {
  emit('update:modelValue', val)
})

const handleSearch = () => {
  emit('search', keyword.value)
}
</script>

<style scoped>
.search-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.search-bar :deep(.el-input-group__append) {
  background: rgba(26, 182, 255, 0.1);
  border-color: rgba(26, 182, 255, 0.3);
  color: #26b6ff;
}
</style>
