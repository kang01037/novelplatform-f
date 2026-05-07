import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/PortalHome.vue')
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
    path: '/register/writer',
    name: 'WriterRegister',
    component: () => import('../views/user/WriterRegister.vue')
  },
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import('../views/user/UserProfile.vue')
  },
  {
    path: '/user/comments',
    name: 'UserComments',
    component: () => import('../views/user/UserComments.vue')
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
    path: '/novel/completed',
    name: 'CompletedNovels',
    component: () => import('../views/novel/CompletedNovels.vue')
  },
  {
    path: '/novel/category',
    name: 'CategoryBrowse',
    component: () => import('../views/novel/CategoryBrowse.vue')
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
  },
  {
    path: '/writer/novels',
    name: 'NovelManage',
    component: () => import('../views/writer/NovelManage.vue'),
    meta: { requiresAuth: true, minRole: 2 }
  },
  {
    path: '/writer/novel/create',
    name: 'CreateNovel',
    component: () => import('../views/writer/NovelCreate.vue'),
    meta: { requiresAuth: true, minRole: 2 }
  },
  {
    path: '/writer/novel/:novelId/chapters',
    name: 'ChapterManage',
    component: () => import('../views/writer/ChapterManage.vue'),
    meta: { requiresAuth: true, minRole: 2 }
  },
  {
    path: '/writer/chapter/create/:novelId',
    name: 'ChapterCreate',
    component: () => import('../views/writer/ChapterEdit.vue'),
    meta: { requiresAuth: true, minRole: 2 }
  },
  {
    path: '/writer/chapter/edit/:chapterId',
    name: 'ChapterEdit',
    component: () => import('../views/writer/ChapterEdit.vue'),
    meta: { requiresAuth: true, minRole: 2 }
  },
  // 无权限页面
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('../views/Unauthorized.vue')
  },
  {
    path: '/admin/dashboard',
    name: 'AdminManage',
    component: () => import('../views/management/AdminManage.vue')
  },
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

// 路由守卫
router.beforeEach((to, from, next) => {
  const accessToken = localStorage.getItem('accessToken')
  const userStatus = parseInt(localStorage.getItem('userStatus') || '1')

  if (to.meta.requiresAuth && !accessToken) {
    next('/login')
  } else if (to.meta.minRole && userStatus < to.meta.minRole) {
    next('/unauthorized')
  } else {
    next()
  }
})

export default router
