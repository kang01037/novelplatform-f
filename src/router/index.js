import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // ==================== 公共页面 ====================
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
  
  // ==================== 用户端（读者功能）====================
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import('../views/user/UserProfile.vue'),
    meta: { requiresAuth: true, role: 'reader' }
  },
  {
    path: '/user/comments',
    name: 'UserComments',
    component: () => import('../views/user/UserComments.vue'),
    meta: { requiresAuth: true, role: 'reader' }
  },
  {
    path: '/novel/list',
    name: 'NovelList',
    component: () => import('../views/novel/NovelList.vue'),
    meta: { role: 'reader' }
  },
  {
    path: '/novel/detail/:novelId',
    name: 'NovelDetail',
    component: () => import('../views/novel/NovelDetail.vue'),
    meta: { role: 'reader' }
  },
  {
    path: '/novel/search',
    name: 'NovelSearch',
    component: () => import('../views/novel/NovelSearch.vue'),
    meta: { role: 'reader' }
  },
  {
    path: '/novel/hot',
    name: 'NovelHot',
    component: () => import('../views/novel/NovelHot.vue'),
    meta: { role: 'reader' }
  },
  {
    path: '/novel/completed',
    name: 'CompletedNovels',
    component: () => import('../views/novel/CompletedNovels.vue'),
    meta: { role: 'reader' }
  },
  {
    path: '/novel/category',
    name: 'CategoryBrowse',
    component: () => import('../views/novel/CategoryBrowse.vue'),
    meta: { role: 'reader' }
  },
  {
    path: '/chapter/list/:novelId',
    name: 'ChapterList',
    component: () => import('../views/chapter/ChapterList.vue'),
    meta: { role: 'reader' }
  },
  {
    path: '/chapter/read/:chapterId',
    name: 'ChapterRead',
    component: () => import('../views/chapter/ChapterRead.vue'),
    meta: { role: 'reader' }
  },
  {
    path: '/bookshelf',
    name: 'Bookshelf',
    component: () => import('../views/bookshelf/Bookshelf.vue'),
    meta: { requiresAuth: true, role: 'reader' }
  },
  {
    path: '/comment/list/:novelId',
    name: 'CommentList',
    component: () => import('../views/comment/CommentList.vue'),
    meta: { role: 'reader' }
  },
  
  // ==================== 作者端（写书功能）====================
  {
    path: '/writer/novels',
    name: 'NovelManage',
    component: () => import('../views/writer/NovelManage.vue'),
    meta: { requiresAuth: true, role: 'writer' }
  },
  {
    path: '/writer/novel/create',
    name: 'CreateNovel',
    component: () => import('../views/writer/NovelCreate.vue'),
    meta: { requiresAuth: true, role: 'writer' }
  },
  {
    path: '/writer/novel/:novelId/chapters',
    name: 'ChapterManage',
    component: () => import('../views/writer/ChapterManage.vue'),
    meta: { requiresAuth: true, role: 'writer' }
  },
  {
    path: '/writer/chapter/create/:novelId',
    name: 'ChapterCreate',
    component: () => import('../views/writer/ChapterEdit.vue'),
    meta: { requiresAuth: true, role: 'writer' }
  },
  {
    path: '/writer/chapter/edit/:chapterId',
    name: 'ChapterEdit',
    component: () => import('../views/writer/ChapterEdit.vue'),
    meta: { requiresAuth: true, role: 'writer' }
  },
  
  // ==================== 管理者端（管理功能）====================
  {
    path: '/admin/dashboard',
    name: 'AdminManage',
    component: () => import('../views/management/AdminManage.vue'),
    meta: { role: 'admin' }
  },
  
  // 无权限页面
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('../views/Unauthorized.vue')
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

// 路由守卫 - 根据角色控制访问权限
router.beforeEach((to, from, next) => {
  const accessToken = localStorage.getItem('accessToken')
  const userStatus = parseInt(localStorage.getItem('userStatus') || '1')
  const loginRole = localStorage.getItem('loginRole') || 'reader'

  // 需要登录的页面
  if (to.meta.requiresAuth && !accessToken) {
    next('/login')
    return
  }

  // 角色权限检查
  if (to.meta.role) {
    const requiredRole = to.meta.role
    
    // 作者端页面：需要 userStatus >= 2
    if (requiredRole === 'writer' && userStatus < 2) {
      next('/unauthorized')
      return
    }
    
    // 管理者端页面：需要 userStatus >= 3
    if (requiredRole === 'admin' && userStatus < 3) {
      next('/unauthorized')
      return
    }
    
    // 读者端页面：所有用户都可以访问（包括作者和管理员）
    if (requiredRole === 'reader') {
      // 读者页面所有人都可以访问
    }
  }

  next()
})

export default router
