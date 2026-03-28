NEW_FILE_CODE
<template>
  <div class="unauthorized-container">
    <div class="error-content">
      <h1>⛔ 403</h1>
      <h2>无权限访问</h2>
      <p>抱歉，您没有权限访问该页面</p>
      <div class="action-buttons">
        <router-link to="/" class="btn-home">返回首页</router-link>
        <router-link to="/user/profile" class="btn-profile">个人中心</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.unauthorized-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-content {
  text-align: center;
  color: white;
  padding: 3rem;
}

.error-content h1 {
  font-size: 8rem;
  margin: 0;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.error-content h2 {
  font-size: 2.5rem;
  margin: 1rem 0;
}

.error-content p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-home,
.btn-profile {
  padding: 1rem 2rem;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-home:hover,
.btn-profile:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}
</style>
