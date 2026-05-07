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
  background: transparent;
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
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.error-content h2 {
  font-size: 2.5rem;
  margin: 1rem 0;
  color: rgba(255, 255, 255, 0.9);
}

.error-content p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: rgba(168, 216, 234, 0.6);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-home,
.btn-profile {
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  border-radius: 12px;
  font-weight: bold;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-home:hover,
.btn-profile:hover {
  transform: translateY(-3px);
  background: rgba(79, 172, 254, 0.2);
  border-color: rgba(79, 172, 254, 0.3);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  color: #4facfe;
}
</style>
