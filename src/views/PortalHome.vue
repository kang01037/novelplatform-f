<template>
  <div class="portal-home">
    <div class="snow-bg">
      <div v-for="(flake, index) in snowflakes" :key="index" class="snowflake" :style="getSnowflakeStyle(flake)"></div>
    </div>

    <div class="portal-content">
      <div class="brand">
        <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
        <h1 class="brand-title">NovelHub</h1>
        <p class="brand-subtitle">选择您的身份进入</p>
      </div>

      <div class="portal-cards">
        <div class="portal-card reader" @click="enterPortal('reader')">
          <div class="card-glow"></div>
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <h2 class="card-title">读者端</h2>
          <p class="card-desc">畅享阅读，发现精彩故事<br>浏览书库、追更小说、留下评论</p>
          <div class="card-action">
            <span>进入书阁</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </div>

        <div class="portal-card writer" @click="enterPortal('writer')">
          <div class="card-glow"></div>
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <h2 class="card-title">作者端</h2>
          <p class="card-desc">创作佳作，展现文学才华<br>管理作品、发布章节、与读者互动</p>
          <div class="card-action">
            <span>进入创作</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </div>

        <div class="portal-card admin" @click="enterPortal('admin')">
          <div class="card-glow"></div>
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </div>
          <h2 class="card-title">管理者端</h2>
          <p class="card-desc">系统管理，维护平台运营<br>管理用户、审核内容、数据统计</p>
          <div class="card-action">
            <span>进入管理</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const snowflakes = ref([])

const enterPortal = (role) => {
  if (role === 'reader') {
    router.push('/novel/list')
  } else if (role === 'writer') {
    router.push('/login?role=writer')
  } else if (role === 'admin') {
    router.push('/login/admin')
  }
}

const generateSnowflakes = () => {
  const flakes = []
  for (let n = 0; n < 40; n++) {
    flakes.push({
      left: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 10 + Math.random() * 20,
      size: 3 + Math.random() * 10,
      sway: Math.random() * 100 - 50
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

onMounted(() => {
  snowflakes.value = generateSnowflakes()
})
</script>

<style scoped>
.portal-home {
  min-height: 100vh;
  background: linear-gradient(170deg, #0f1923 0%, #1a2a3a 30%, #1e3a4f 60%, #2a4a5f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.snow-bg {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 1;
}

.snowflake {
  position: absolute;
  top: -20px;
  background: radial-gradient(circle, #fff 0%, rgba(255,255,255,0.5) 50%, transparent 100%);
  border-radius: 50%;
  opacity: 0;
  animation: snowfall linear infinite;
}

@keyframes snowfall {
  0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.8; }
  90% { opacity: 0.4; }
  100% { transform: translateY(110vh) translateX(var(--sway, 20px)) rotate(360deg); opacity: 0; }
}

.portal-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2rem;
  max-width: 1100px;
  width: 100%;
}

/* Brand section */
.brand {
  margin-bottom: 4rem;
}

.brand-icon {
  width: 56px;
  height: 56px;
  color: #4facfe;
  margin-bottom: 1rem;
}

.brand-title {
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.8rem;
  letter-spacing: -1px;
}

.brand-subtitle {
  color: rgba(168, 216, 234, 0.5);
  font-size: 1.15rem;
  margin: 0;
  letter-spacing: 2px;
}

/* Portal cards */
.portal-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.portal-card {
  position: relative;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 3rem 2rem;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.portal-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  opacity: 0;
  transition: opacity 0.5s;
  pointer-events: none;
}

.portal-card:hover .card-glow {
  opacity: 1;
}

/* Card accent colors */
.portal-card.reader {
  border-color: rgba(79, 172, 254, 0.15);
}

.portal-card.reader:hover {
  border-color: rgba(79, 172, 254, 0.4);
  background: rgba(79, 172, 254, 0.06);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(79, 172, 254, 0.05);
}

.portal-card.reader .card-glow {
  background: radial-gradient(ellipse at center, rgba(79, 172, 254, 0.08) 0%, transparent 70%);
}

.portal-card.writer {
  border-color: rgba(161, 140, 209, 0.15);
}

.portal-card.writer:hover {
  border-color: rgba(161, 140, 209, 0.4);
  background: rgba(161, 140, 209, 0.06);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(161, 140, 209, 0.05);
}

.portal-card.writer .card-glow {
  background: radial-gradient(ellipse at center, rgba(161, 140, 209, 0.08) 0%, transparent 70%);
}

.portal-card.admin {
  border-color: rgba(240, 147, 251, 0.15);
}

.portal-card.admin:hover {
  border-color: rgba(240, 147, 251, 0.4);
  background: rgba(240, 147, 251, 0.06);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(240, 147, 251, 0.05);
}

.portal-card.admin .card-glow {
  background: radial-gradient(ellipse at center, rgba(240, 147, 251, 0.08) 0%, transparent 70%);
}

/* Card icon */
.card-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  transition: all 0.5s;
}

.card-icon svg {
  width: 36px;
  height: 36px;
}

.portal-card.reader .card-icon {
  background: rgba(79, 172, 254, 0.12);
  color: #4facfe;
}

.portal-card.writer .card-icon {
  background: rgba(161, 140, 209, 0.12);
  color: #a18cd1;
}

.portal-card.admin .card-icon {
  background: rgba(240, 147, 251, 0.12);
  color: #f093fb;
}

.portal-card:hover .card-icon {
  transform: scale(1.1);
}

/* Card title */
.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 0.8rem;
}

/* Card description */
.card-desc {
  font-size: 0.9rem;
  color: rgba(168, 216, 234, 0.5);
  line-height: 1.7;
  margin: 0 0 2rem;
}

/* Card action button */
.card-action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.5rem;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
  margin-top: auto;
}

.card-action svg {
  width: 16px;
  height: 16px;
  transition: transform 0.3s;
}

.portal-card.reader .card-action {
  background: rgba(79, 172, 254, 0.1);
  color: #4facfe;
  border: 1px solid rgba(79, 172, 254, 0.2);
}

.portal-card.reader:hover .card-action {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}

.portal-card.writer .card-action {
  background: rgba(161, 140, 209, 0.1);
  color: #a18cd1;
  border: 1px solid rgba(161, 140, 209, 0.2);
}

.portal-card.writer:hover .card-action {
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(161, 140, 209, 0.3);
}

.portal-card.admin .card-action {
  background: rgba(240, 147, 251, 0.1);
  color: #f093fb;
  border: 1px solid rgba(240, 147, 251, 0.2);
}

.portal-card.admin:hover .card-action {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(240, 147, 251, 0.3);
}

.portal-card:hover .card-action svg {
  transform: translateX(4px);
}

/* Responsive */
@media (max-width: 900px) {
  .portal-cards {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
  }

  .brand-title {
    font-size: 2.5rem;
  }

  .brand {
    margin-bottom: 2.5rem;
  }

  .portal-card {
    padding: 2rem 1.5rem;
  }
}
</style>
