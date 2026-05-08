import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// ---- 双 Token 刷新逻辑 ----
let isRefreshing = false
let pendingRequests = []

// 请求拦截器：自动注入 accessToken
api.interceptors.request.use(config => {
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
}, error => Promise.reject(error))

// 响应拦截器：401 时静默刷新 token
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // 仅对需要认证的请求且非刷新请求本身做自动续签
    if (error.response?.status === 401
      && !originalRequest._retry
      && !originalRequest.url?.includes('/auth/refresh')
      && originalRequest.headers?.Authorization) {

      if (isRefreshing) {
        // 正在刷新中，排队等待
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')

        const res = await axios.post('/api/auth/refresh', { refreshToken })
        const { accessToken, refreshToken: newRefreshToken } = res.data.data

        localStorage.setItem('accessToken', accessToken)
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken)
        }

        // 重放排队的请求
        pendingRequests.forEach(p => p.resolve())
        pendingRequests = []

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (e) {
        pendingRequests.forEach(p => p.reject(e))
        pendingRequests = []
        // 刷新失败，清除登录态，但不跳转页面
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('username')
        localStorage.removeItem('userId')
        localStorage.removeItem('userStatus')
        localStorage.removeItem('userInfo')
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ---- 认证模块 ----
export const authApi = {
  refresh: (refreshToken) => axios.post('/api/auth/refresh', { refreshToken }),
  logout: (refreshToken) => axios.post('/api/auth/logout', { refreshToken })
}

// ---- 用户模块 ----
export const userApi = {
  getUser: (userId) => api.get(`/user/${userId}`),
  getUserByUsername: (username) => api.get(`/user/username/${username}`),
  getUsers: () => api.get('/user/list'),
  register: (data) => api.post('/user/register', data),
  updateUser: (data) => api.put('/user/update', data),
  deleteUser: (userId) => api.delete(`/user/delete/${userId}`),
  login: (data) => api.post('/user/login', data),
  uploadAvatar: (formData) => api.post('/user/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAvatar: (userId) => api.delete(`/user/avatar/${userId}`)
}

// ---- 小说模块 ----
export const novelApi = {
  getNovel: (novelId) => api.get(`/novel/${novelId}`),
  getNovels: () => api.get('/novel/list'),
  getNovelsByAuthor: (authorId) => api.get(`/novel/author/${authorId}`),
  getNovelsByCategory: (categoryId) => api.get(`/novel/category/${categoryId}`),
  createNovel: (data) => api.post('/novel/create', data),
  updateNovel: (data) => api.put('/novel/update', data),
  deleteNovel: (novelId) => api.delete(`/novel/delete/${novelId}`),
  addClick: (novelId) => api.post(`/novel/${novelId}/click`),
  addCollect: (novelId) => api.post(`/novel/${novelId}/collect`),
  addRecommend: (novelId) => api.post(`/novel/${novelId}/recommend`),
  rateNovel: (novelId, data) => api.post(`/novel/${novelId}/rate`, data),
  getHotNovels: (limit = 10) => api.get(`/novel/hot?limit=${limit}`),
  getLatestNovels: (limit = 10) => api.get(`/novel/latest?limit=${limit}`),
  searchNovels: (novelName) => api.get(`/novel/search?novelName=${novelName}`),
  uploadCover: (formData) => api.post('/novel/upload/cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// ---- 章节模块 ----
export const chapterApi = {
  getChapter: (chapterId) => api.get(`/chapter/${chapterId}`),
  getChaptersByNovel: (novelId) => api.get(`/chapter/novel/${novelId}`),
  getChapterByNovelAndNum: (novelId, chapterNum) => api.get(`/chapter/novel/${novelId}/num/${chapterNum}`),
  getLatestChapter: (novelId) => api.get(`/chapter/novel/${novelId}/latest`),
  getChapterCount: (novelId) => api.get(`/chapter/novel/${novelId}/count`),
  createChapter: (data) => api.post('/chapter/create', data),
  updateChapter: (data) => api.put('/chapter/update', data),
  deleteChapter: (chapterId) => api.delete(`/chapter/delete/${chapterId}`),
  batchDeleteChapters: (ids) => api.delete('/chapter/delete/batch', { data: ids })
}

// ---- 书架模块 ----
export const bookshelfApi = {
  getBookshelf: (id) => api.get(`/bookshelf/${id}`),
  getBookshelfByUser: (userId) => api.get(`/bookshelf/user/${userId}`),
  getBookshelfByUserAndNovel: (userId, novelId) => api.get(`/bookshelf/user/${userId}/novel/${novelId}`),
  checkBookshelf: (userId, novelId) => api.get(`/bookshelf/check?userId=${userId}&novelId=${novelId}`),
  getBookshelfCount: (userId) => api.get(`/bookshelf/user/${userId}/count`),
  addToBookshelf: (data) => api.post('/bookshelf/add', data),
  removeFromBookshelf: (data) => api.delete('/bookshelf/remove', { data }),
  batchRemoveFromBookshelf: (data) => api.delete('/bookshelf/remove/batch', { data }),
  updateReadingProgress: (data) => api.put('/bookshelf/reading-progress', data)
}

// ---- 评论模块 ----
export const commentApi = {
  getComment: (commentId) => api.get(`/comment/${commentId}`),
  getCommentsByNovel: (novelId, page = 1, size = 20) => api.get(`/comment/novel/${novelId}?page=${page}&size=${size}`),
  getCommentsByChapter: (chapterId, page = 1, size = 20) => api.get(`/comment/chapter/${chapterId}?page=${page}&size=${size}`),
  getCommentsByUser: (userId, page = 1, size = 20) => api.get(`/comment/user/${userId}?page=${page}&size=${size}`),
  getReplies: (parentId) => api.get(`/comment/replies/${parentId}`),
  getCommentCountByNovel: (novelId) => api.get(`/comment/novel/${novelId}/count`),
  getCommentCountByUser: (userId) => api.get(`/comment/user/${userId}/count`),
  createComment: (data) => api.post('/comment/create', data),
  updateComment: (data) => api.put('/comment/update', data),
  deleteComment: (commentId) => api.delete(`/comment/delete/${commentId}`),
  batchDeleteComments: (ids) => api.delete('/comment/delete/batch', { data: ids }),
  likeComment: (commentId) => api.post(`/comment/${commentId}/like`),
  unlikeComment: (commentId) => api.post(`/comment/${commentId}/unlike`),
  getAllComments: (page = 1, size = 20) => api.get(`/comment/all?page=${page}&size=${size}`),
}

export default api
