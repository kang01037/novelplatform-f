# NovelHub - 小说阅读平台

> 冰雪书阁 - 基于 Vue 3 + Vite + Element Plus 构建的小说阅读平台，支持读者阅读、作者创作、管理员后台三大角色功能。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 构建工具 | Vite 7 |
| UI 组件库 | Element Plus |
| 路由 | Vue Router 4（路由懒加载、导航守卫） |
| HTTP 客户端 | Axios（双 Token 刷新机制） |
| 开发工具 | vite-plugin-vue-devtools |
| Node 版本 | `^20.19.0` 或 `>=22.12.0` |

## 项目结构

```
novelplatform-f/
├── public/
│   ├── favicon.ico
│   ├── batch-import.html     # 批量导入工具（离线页面）
│   └── novels_sample.json     # 示例小说数据
├── src/
│   ├── api/
│   │   └── index.js          # Axios 实例 + 模块化 API 接口
│   ├── components/           # 公共组件
│   │   ├── SvgIcon.vue      # SVG 图标组件
│   │   └── management/       # 管理端组件
│   │       ├── SearchBar.vue     # 搜索栏组件
│   │       ├── NovelCard.vue     # 小说卡片组件
│   │       └── Pagination.vue    # 分页组件
│   ├── router/
│   │   └── index.js          # 路由配置 + 角色权限守卫
│   ├── utils/
│   │   └── index.js          # 工具函数（防抖、响应处理）
│   ├── views/
│   │   ├── PortalHome.vue        # 入口页（角色选择）
│   │   ├── Unauthorized.vue      # 403 无权限页面
│   │   ├── bookshelf/
│   │   │   └── Bookshelf.vue    # 我的书架
│   │   ├── chapter/
│   │   │   ├── ChapterList.vue  # 章节列表
│   │   │   └── ChapterRead.vue  # 章节阅读
│   │   ├── comment/
│   │   │   └── CommentList.vue  # 评论列表
│   │   ├── management/
│   │   │   ├── AdminManage.vue  # 管理员后台主页面
│   │   │   ├── UserTable.vue    # 用户表格组件
│   │   │   └── CommentTable.vue # 评论表格组件
│   │   ├── novel/
│   │   │   ├── CategoryBrowse.vue   # 分类浏览
│   │   │   ├── CompletedNovels.vue  # 已完结小说
│   │   │   ├── NovelDetail.vue      # 小说详情
│   │   │   ├── NovelHot.vue         # 热门推荐
│   │   │   ├── NovelList.vue        # 小说库
│   │   │   └── NovelSearch.vue      # 小说搜索
│   │   ├── user/
│   │   │   ├── Login.vue            # 读者登录
│   │   │   ├── Register.vue         # 读者注册
│   │   │   ├── AdminLogin.vue       # 管理员登录
│   │   │   ├── AdminRegister.vue    # 管理员注册
│   │   │   ├── UserComments.vue     # 我的评论
│   │   │   ├── UserProfile.vue      # 个人中心
│   │   │   └── WriterRegister.vue   # 作者注册
│   │   └── writer/
│   │       ├── ChapterEdit.vue      # 章节编写/编辑
│   │       ├── ChapterManage.vue    # 章节管理
│   │       ├── NovelCreate.vue       # 创建小说
│   │       └── NovelManage.vue      # 我的作品管理
│   ├── App.vue                  # 根组件（导航栏、雪花特效、页脚）
│   └── main.js                  # 入口文件
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
- **后端服务** 运行在 `http://localhost:8080`

### 安装与运行

```bash
# 克隆项目后安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

> 开发模式下 Vite 代理会自动将 `/api` 前缀的请求转发到 `http://localhost:8080`

## 功能模块

### 读者端

- 浏览小说库、热门推荐、完结小说
- 分类浏览、关键词搜索
- 阅读章节、发表评论
- 收藏小说到书架
- 查看和管理个人评论

### 作者端

- 注册成为作者
- 创建和管理小说作品
- 编写和编辑章节
- 查看读者评论

### 管理员端

- 管理员账户注册与登录
- 用户管理（查看、删除）
- 小说管理（卡片式展示、搜索、删除）
- 评论管理（查看、删除）

## 角色权限

| 角色 | userStatus | 权限说明 |
|------|-----------|---------|
| 读者 | 1 | 阅读小说、收藏、评论 |
| 作者 | 2 | 读者权限 + 创作作品、管理章节 |
| 管理员 | 3 | 全部权限 + 管理后台 |

## 路由一览

| 路径 | 页面 | 访问要求 |
|------|------|---------|
| `/` | 入口页 | 公开 |
| `/login` | 读者登录 | 公开 |
| `/login/admin` | 管理员登录 | 公开 |
| `/register` | 读者注册 | 公开 |
| `/register/writer` | 作者注册 | 公开 |
| `/register/admin` | 管理员注册 | 公开（需密钥） |
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

- **双 Token 机制**：登录后获取 `accessToken`（30分钟）和 `refreshToken`（7天）
- **自动刷新**：Axios 拦截器自动附加 Token，401 时静默刷新
- **存储位置**：`localStorage`

## 批量导入工具

平台提供离线批量导入工具，用于快速导入小说数据。

**使用方式：**

1. 启动前端服务后访问 `http://localhost:5173/batch-import.html`
2. 配置后端 API 地址
3. 上传 JSON 格式的小说数据文件
4. 点击导入，系统会自动逐条创建小说

**JSON 格式示例：**

```json
{
  "novels": [
    {
      "novelName": "斗破苍穹",
      "authorId": 1,
      "categoryId": 1,
      "coverImage": "",
      "content": "小说简介...",
      "novelStatus": 1
    }
  ]
}
```

**字段说明：**

- `novelName`：小说名称（必填）
- `authorId`：作者 ID（必填）
- `categoryId`：分类 ID（必填）
  - 1-玄幻奇幻，2-武侠仙侠，3-都市言情
  - 4-科幻灵异，5-历史军事，6-游戏竞技
- `coverImage`：封面 URL（可选）
- `content`：简介（可选）
- `novelStatus`：状态（0-连载中，1-已完结，2-暂停）

## 组件设计

管理端采用组件化设计，拆分如下：

| 组件 | 路径 | 说明 |
|------|------|------|
| SearchBar | `components/management/SearchBar.vue` | 通用搜索栏，支持 v-model |
| NovelCard | `components/management/NovelCard.vue` | 小说卡片，展示完整小说信息 |
| Pagination | `components/management/Pagination.vue` | 通用分页组件 |
| UserTable | `views/management/UserTable.vue` | 用户数据表格 |
| CommentTable | `views/management/CommentTable.vue` | 评论数据表格 |

## 设计风格

- **冰雪主题**：深色渐变背景 + 毛玻璃卡片效果
- **粒子动画**：动态飘雪特效
- **响应式布局**：适配多种屏幕尺寸
- **卡片式管理**：小说管理采用卡片布局，信息展示更完整

## 后端依赖

需配合 [novelplatform-v](https://github.com) 后端服务使用。

- API 文档：[接口文档.md](./接口文档.md)
- 数据库脚本：[数据库.sql](./数据库.sql)
