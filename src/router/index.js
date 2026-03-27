import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/novel/NovelList.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/user/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/user/Register.vue')
  },
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import('../views/user/UserProfile.vue')
  },
  {
    path: '/novel/list',
    name: 'NovelList',
    component: () => import('../views/novel/NovelList.vue')
  },
  {
    path: '/novel/detail/:novelId',
    name: 'NovelDetail',
    component: () => import('../views/novel/NovelDetail.vue')
  },
  {
    path: '/novel/search',
    name: 'NovelSearch',
    component: () => import('../views/novel/NovelSearch.vue')
  },
  {
    path: '/novel/hot',
    name: 'NovelHot',
    component: () => import('../views/novel/NovelHot.vue')
  },
  {
    path: '/chapter/list/:novelId',
    name: 'ChapterList',
    component: () => import('../views/chapter/ChapterList.vue')
  },
  {
    path: '/chapter/read/:chapterId',
    name: 'ChapterRead',
    component: () => import('../views/chapter/ChapterRead.vue')
  },
  {
    path: '/bookshelf',
    name: 'Bookshelf',
    component: () => import('../views/bookshelf/Bookshelf.vue')
  },
  {
    path: '/comment/list/:novelId',
    name: 'CommentList',
    component: () => import('../views/comment/CommentList.vue')
  }
]

// 添加路由过渡效果
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router