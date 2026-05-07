# novelplatform-f

小说阅读平台前端应用（NovelHub / 冰雪书阁），基于 Vue 3 + Vite + Element Plus 构建的 SPA，支持读者阅读、作者创作、管理员后台三大角色功能。

## 技术栈

| 层次 | 技术 |
|------|------|
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 构建工具 | Vite 7 |
| UI 组件库 | Element Plus |
| 图标 | @element-plus/icons-vue |
| 路由 | Vue Router 4（懒加载） |
| HTTP 客户端 | Axios（请求拦截、自动 Token 刷新） |
| 开发工具 | vite-plugin-vue-devtools |
| Node 版本 | `^20.19.0` 或 `>=22.12.0` |

## 项目结构

```
novelplatform-f/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/
│   │   └── index.js              # Axios 实例 + 所有 API 接口定义
│   ├── router/
│   │   └── index.js              # 路由配置 + 导航守卫（角色鉴权）
│   ├── utils/
│   │   └── index.js              # 工具函数（防抖、节流）
│   ├── views/
│   │   ├── PortalHome.vue        # 入口页（角色选择）
│   │   ├── Unauthorized.vue      # 403 无权限页
│   │   ├── bookshelf/
│   │   │   └── Bookshelf.vue     # 书架 / 收藏
│   │   ├── chapter/
│   │   │   ├── ChapterList.vue   # 章节列表
│   │   │   └── ChapterRead.vue   # 章节阅读
│   │   ├── comment/
│   │   │   └── CommentList.vue   # 评论列表
│   │   ├── management/
│   │   │   └── AdminManage.vue   # 管理员后台
│   │   ├── novel/
│   │   │   ├── CategoryBrowse.vue    # 分类浏览
│   │   │   ├── CompletedNovels.vue   # 已完结小说
│   │   │   ├── NovelDetail.vue       # 小说详情
│   │   │   ├── NovelHot.vue          # 热门推荐
│   │   │   ├── NovelList.vue         # 小说库
│   │   │   └── NovelSearch.vue       # 小说搜索
│   │   ├── user/
│   │   │   ├── Login.vue             # 登录
│   │   │   ├── Register.vue          # 注册
│   │   │   ├── UserComments.vue      # 我的评论
│   │   │   ├── UserProfile.vue       # 个人中心
│   │   │   └── WriterRegister.vue    # 作者注册
│   │   └── writer/
│   │       ├── ChapterEdit.vue       # 章节编写 / 编辑
│   │       ├── ChapterManage.vue     # 章节管理
│   │       ├── NovelCreate.vue       # 创建小说
│   │       └── NovelManage.vue       # 我的作品管理
│   ├── App.vue                  # 根组件（导航栏、雪花特效、页脚）
│   └── main.js                  # 入口文件（挂载 Vue、注册插件）
├── index.html                   # HTML 入口
├── vite.config.js               # Vite 配置（代理、别名）
├── jsconfig.json                # 路径别名配置
├── package.json
├── 接口文档.md                   # API 接口文档
└── 数据库.sql                    # 数据库建表脚本
```

## 快速开始

### 环境要求

- **Node.js** `^20.19.0` 或 `>=22.12.0`
- **后端服务** 运行在 `http://localhost:8080`（见 [novelplatform-v](https://github.com)）

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器（热更新）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

开发模式下 Vite 代理会自动将 `/api` 前缀的请求转发到 `http://localhost:8080`。

## 角色系统

| 角色 | userStatus | 权限 |
|------|-----------|------|
| 读者 | 1 | 阅读小说、收藏、评论 |
| 作者 | 2 | 读者权限 + 创建/管理作品和章节 |
| 管理员 | 3 | 全部权限 + 管理后台 |

路由守卫按 `requiresAuth` 和 `minRole` 元数据自动鉴权，无权限时跳转到 `/unauthorized`。

## 路由一览

| 路径 | 页面 | 访问 |
|------|------|------|
| `/` | 入口页 | 公开 |
| `/login` | 登录 | 公开 |
| `/register` | 注册 | 公开 |
| `/register/writer` | 作者注册 | 公开 |
| `/user/profile` | 个人中心 | 需登录 |
| `/user/comments` | 我的评论 | 需登录 |
| `/novel/list` | 小说库 | 公开 |
| `/novel/detail/:novelId` | 小说详情 | 公开 |
| `/novel/search` | 搜索 | 公开 |
| `/novel/hot` | 热门推荐 | 公开 |
| `/novel/completed` | 已完结 | 公开 |
| `/novel/category` | 分类浏览 | 公开 |
| `/chapter/list/:novelId` | 章节列表 | 公开 |
| `/chapter/read/:chapterId` | 阅读 | 公开 |
| `/bookshelf` | 书架 | 需登录 |
| `/comment/list/:novelId` | 评论 | 公开 |
| `/writer/novels` | 我的作品 | 作者+ |
| `/writer/novel/create` | 创建小说 | 作者+ |
| `/writer/novel/:novelId/chapters` | 章节管理 | 作者+ |
| `/writer/chapter/create/:novelId` | 写章节 | 作者+ |
| `/writer/chapter/edit/:chapterId` | 编辑章节 | 作者+ |
| `/admin/dashboard` | 管理后台 | 管理员 |
| `/unauthorized` | 无权限 | 公开 |

## 认证机制

- 登录后后端返回 `accessToken` 和 `refreshToken`，存储在 `localStorage`
- Axios 请求拦截器自动附加 `Authorization: Bearer <accessToken>`
- 响应拦截器在收到 401 时自动用 refreshToken 静默续期
- 续期失败跳转 `/login`

## 设计风格

全局统一冰雪主题：深色渐变背景 + 毛玻璃卡片效果 + 动态飘雪粒子动画。

## 后端依赖

本前端需配合 [novelplatform-v](https://github.com) 后端服务使用。API 文档详见 [接口文档.md](./接口文档.md)，数据库建表脚本为 [数据库.sql](./数据库.sql)。
