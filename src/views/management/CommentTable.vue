<template>
  <div class="table-wrapper">
    <el-table :data="data" v-loading="loading" stripe style="width: 100%">
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
              @click="handleDelete(scope.row.commentId)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['delete'])

const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

const handleDelete = (commentId) => {
  emit('delete', commentId)
}
</script>

<style scoped>
.table-wrapper {
  overflow-x: auto;
  margin-bottom: 10px;
}
</style>
