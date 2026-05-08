<template>
  <div class="home-page">
    <!-- 雪花背景 -->
    <div class="snow-bg">
      <div v-for="(flake, index) in snowflakes" :key="index" class="snowflake" :style="getSnowflakeStyle(flake)"></div>
    </div>

    <!-- 主内容 -->
    <div class="home-content">
      <!-- Logo区域 -->
      <div class="logo-area">
        <div class="logo-icon-wrapper">
          <svg class="logo-snowflake" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <line x1="12" y1="2" x2="12" y2="22"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            <line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/>
            <line x1="12" y1="2" x2="9" y2="6"/>
            <line x1="12" y1="2" x2="15" y2="6"/>
            <line x1="12" y1="22" x2="9" y2="18"/>
            <line x1="12" y1="22" x2="15" y2="18"/>
            <line x1="2" y1="12" x2="6" y2="9"/>
            <line x1="2" y1="12" x2="6" y2="15"/>
            <line x1="22" y1="12" x2="18" y2="9"/>
            <line x1="22" y1="12" x2="18" y2="15"/>
          </svg>
        </div>
        <h1 class="app-title">冰雪书阁</h1>
        <p class="app-subtitle">冬日暖阳，好书相伴</p>
      </div>

      <!-- 角色选择卡片 -->
      <div class="role-cards">
        <div class="role-card reader-card" @click="goLogin('reader')">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <h2 class="role-title">读者端</h2>
          <p class="role-desc">探索书海，沉浸阅读</p>
          <div class="role-features">
            <span>热门推荐</span>
            <span>书架管理</span>
            <span>互动评论</span>
          </div>
          <div class="card-snow">
            <div v-for="(mini, index) in miniSnowflakes" :key="index" class="mini-snow" :style="getMiniSnowStyle(mini)"></div>
          </div>
        </div>

        <div class="role-card writer-card" @click="goLogin('writer')">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <h2 class="role-title">作者端</h2>
          <p class="role-desc">挥洒才情，创作佳作</p>
          <div class="role-features">
            <span>作品管理</span>
            <span>章节编辑</span>
            <span>数据统计</span>
          </div>
          <div class="card-snow">
            <div v-for="(mini, index) in miniSnowflakes" :key="index" class="mini-snow" :style="getMiniSnowStyle(mini)"></div>
          </div>
        </div>

        <div class="role-card admin-card" @click="goLogin('admin')">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </div>
          <h2 class="role-title">管理者端</h2>
          <p class="role-desc">运营管控，守护平台</p>
          <div class="role-features">
            <span>用户管理</span>
            <span>内容审核</span>
            <span>数据监控</span>
          </div>
          <div class="card-snow">
            <div v-for="(mini, index) in miniSnowflakes" :key="index" class="mini-snow" :style="getMiniSnowStyle(mini)"></div>
          </div>
        </div>
      </div>

      <!-- 底部 -->
      <div class="home-footer">
        <p>&copy; 2026 冰雪书阁 · 冬日里的阅读时光</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const snowflakes = ref([])
const miniSnowflakes = ref([])

const goLogin = (role) => {
  router.push({ path: '/login', query: { role } })
}

const generateSnowflakes = () => {
  const flakes = []
  for (let n = 0; n < 50; n++) {
    flakes.push({
      left: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 8 + Math.random() * 15,
      size: 4 + Math.random() * 12,
      sway: Math.random() * 80 - 40
    })
  }
  return flakes
}

const generateMiniSnowflakes = () => {
  const flakes = []
  for (let n = 0; n < 6; n++) {
    flakes.push({
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 5 + Math.random() * 8,
      size: 3 + Math.random() * 6
    })
  }
  return flakes
}

const getSnowflakeStyle = (flake) => {
  return {
    left: `${flake.left}%`,
    animationDelay: `${flake.delay}s`,
    animationDuration: `${flake.duration}s`,
    width: `${flake.size}px`,
    height: `${flake.size}px`,
    '--sway': `${flake.sway}px`
  }
}

const getMiniSnowStyle = (flake) => {
  return {
    left: `${flake.left}%`,
    animationDelay: `${flake.delay}s`,
    animationDuration: `${flake.duration}s`,
    width: `${flake.size}px`,
    height: `${flake.size}px`
  }
}

onMounted(() => {
  snowflakes.value = generateSnowflakes()
  miniSnowflakes.value = generateMiniSnowflakes()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(170deg, #0f1923 0%, #1a2a3a 30%, #1e3a4f 60%, #2a4a5f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* 雪花背景 */
.snow-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.snowflake {
  position: absolute;
  top: -20px;
  background: radial-gradient(circle, #fff 0%, rgba(255,255,255,0.6) 50%, transparent 100%);
  border-radius: 50%;
  opacity: 0;
  animation: snowfall linear infinite;
  filter: blur(0.5px);
}

@keyframes snowfall {
  0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.9; }
  90% { opacity: 0.5; }
  100% { transform: translateY(110vh) translateX(var(--sway, 20px)) rotate(360deg); opacity: 0; }
}

/* 主内容 */
.home-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1100px;
  padding: 3rem 2rem;
  text-align: center;
}

/* Logo */
.logo-area {
  margin-bottom: 4rem;
}

.logo-icon-wrapper {
  margin: 0 auto 1.5rem;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.15);
  box-shadow: 0 8px 32px rgba(0,0,0,0.2), inset 0 0 20px rgba(255,255,255,0.05);
}

.logo-snowflake {
  width: 44px;
  height: 44px;
  color: #a8d8ea;
  animation: gentleSpin 20s linear infinite;
}

@keyframes gentleSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.app-title {
  font-size: 3rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.8rem;
  letter-spacing: 6px;
  text-shadow: 0 0 40px rgba(168,216,234,0.3);
}

.app-subtitle {
  font-size: 1.1rem;
  color: rgba(168,216,234,0.7);
  margin: 0;
  letter-spacing: 3px;
}

/* 角色卡片 */
.role-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 4rem;
}

.role-card {
  position: relative;
  padding: 2.5rem 2rem;
  border-radius: 24px;
  background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
}

.role-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 24px 24px 0 0;
  opacity: 0;
  transition: opacity 0.3s;
}

.reader-card::before { background: linear-gradient(90deg, #4facfe, #00f2fe); }
.writer-card::before { background: linear-gradient(90deg, #a18cd1, #fbc2eb); }
.admin-card::before { background: linear-gradient(90deg, #f093fb, #f5576c); }

.role-card:hover::before { opacity: 1; }

.role-card:hover {
  transform: translateY(-12px) scale(1.02);
  border-color: rgba(255,255,255,0.25);
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.reader-card:hover { box-shadow: 0 20px 60px rgba(79,172,254,0.2); }
.writer-card:hover { box-shadow: 0 20px 60px rgba(161,140,209,0.2); }
.admin-card:hover { box-shadow: 0 20px 60px rgba(240,147,251,0.2); }

.card-icon {
  margin: 0 auto 1.5rem;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.reader-card .card-icon {
  background: linear-gradient(135deg, rgba(79,172,254,0.2), rgba(0,242,254,0.1));
  border: 1px solid rgba(79,172,254,0.3);
}

.writer-card .card-icon {
  background: linear-gradient(135deg, rgba(161,140,209,0.2), rgba(251,194,235,0.1));
  border: 1px solid rgba(161,140,209,0.3);
}

.admin-card .card-icon {
  background: linear-gradient(135deg, rgba(240,147,251,0.2), rgba(245,87,108,0.1));
  border: 1px solid rgba(240,147,251,0.3);
}

.card-icon svg {
  width: 30px;
  height: 30px;
}

.reader-card .card-icon svg { color: #4facfe; }
.writer-card .card-icon svg { color: #a18cd1; }
.admin-card .card-icon svg { color: #f093fb; }

.role-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.6rem;
}

.role-desc {
  font-size: 0.95rem;
  color: rgba(168,216,234,0.6);
  margin: 0 0 1.5rem;
}

.role-features {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.role-features span {
  padding: 0.3rem 0.8rem;
  background: rgba(255,255,255,0.06);
  border-radius: 12px;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.6);
  border: 1px solid rgba(255,255,255,0.08);
}

/* 卡片内雪花 */
.card-snow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.mini-snow {
  position: absolute;
  top: -10px;
  background: rgba(255,255,255,0.4);
  border-radius: 50%;
  opacity: 0;
  animation: miniSnowfall linear infinite;
}

@keyframes miniSnowfall {
  0% { transform: translateY(0); opacity: 0; }
  10% { opacity: 0.6; }
  90% { opacity: 0.3; }
  100% { transform: translateY(400px); opacity: 0; }
}

/* 底部 */
.home-footer {
  color: rgba(168,216,234,0.4);
  font-size: 0.85rem;
}

.home-footer p {
  margin: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .home-content {
    padding: 2rem 1rem;
  }

  .app-title {
    font-size: 2rem;
    letter-spacing: 3px;
  }

  .role-cards {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .logo-area {
    margin-bottom: 2.5rem;
  }
}
</style>
