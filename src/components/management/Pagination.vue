<template>
  <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="pageSizes"
      :layout="layout"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
      style="margin-top: 20px; justify-content: flex-end"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const currentPage = computed({
  get: () => props.modelValue.page,
  set: (val) => {
    emit('update:modelValue', { ...props.modelValue, page: val })
  }
})

const pageSize = computed({
  get: () => props.modelValue.pageSize,
  set: (val) => {
    emit('update:modelValue', { ...props.modelValue, pageSize: val })
  }
})

const total = computed(() => props.modelValue.total || 0)

const handlePageChange = (page) => {
  emit('change', { page, pageSize: pageSize.value })
}

const handleSizeChange = (size) => {
  emit('change', { page: currentPage.value, pageSize: size })
}
</script>
