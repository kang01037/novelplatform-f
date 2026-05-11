<template>
  <el-table :data="data" v-loading="loading" stripe style="width: 100%">
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
    <el-table-column label="操作" width="100">
      <template #default="scope">
        <el-button
            v-if="scope.row.userStatus !== 3"
            size="small"
            type="danger"
            @click="handleDelete(scope.row.userId)"
        >
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
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

const handleDelete = (userId) => {
  emit('delete', userId)
}
</script>
