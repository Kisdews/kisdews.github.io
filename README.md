# kisdews.github.io

个人网站项目，基于 GitHub Pages 构建的简洁响应式网站。

## 📋 项目简介

这是一个结构清晰、易于维护的个人网站，采用按页面划分的资源组织方式。网站包含首页、游戏展示页、博客文章页和游戏设计灵感管理页，所有页面共享通用的样式和脚本资源。支持 GitHub API 数据同步，实现跨设备访问和编辑。

## ✨ 功能特性

### 核心功能
- 🏠 **首页**：功能入口卡片、天数倒计时、GitHub Token 配置
- 🎮 **游戏页面**：展示游戏项目列表
- 📝 **博客页面**：展示博客文章列表
- 💡 **设计灵感页**：游戏设计灵感管理系统
  - 游戏项目管理（创建、编辑、删除）
  - 灵感卡片管理（创建、编辑、删除、标签筛选）
  - 拖拽排序（游戏列表、灵感卡片）
  - 标签筛选和搜索
  - 状态和优先级管理

### 技术特性
- 📅 **天数计数器**：可复用的日期倒计时工具
- 🔐 **GitHub Token 认证**：基于 Token 的编辑权限控制
- ☁️ **数据同步**：本地优先 + 手动同步到 GitHub
  - 本地快速保存（localStorage）
  - 批量提交（一次同步创建一个 commit）
  - 自动合并冲突处理
  - 跨设备数据同步
- 🎨 **响应式设计**：适配各种设备屏幕
- 📦 **模块化结构**：按页面划分，易于维护和扩展

## 🏗️ 项目结构

```
kisdews.github.io/
├── index.html                    # 首页
├── index.css                     # 首页专用样式
├── index.js                      # 首页专用脚本
├── games/                        # 游戏页面目录
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── blogs/                        # 博客页面目录
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── design/                       # 设计灵感页面目录
│   ├── index.html
│   ├── styles.css
│   └── script.js                 # 灵感管理核心逻辑
├── shared/                       # 共享资源目录
│   ├── styles/
│   │   └── common.css            # 通用样式（header, nav, footer, modal等）
│   └── scripts/
│       ├── common.js             # 通用工具函数（天数计数器等）
│       ├── auth.js               # 认证管理（GitHub Token）
│       └── github-api.js        # GitHub API 封装（数据同步）
├── data/                         # 数据文件目录（通过 GitHub API 管理）
│   ├── games.json                # 游戏数据
│   ├── ideas.json                # 灵感数据
│   ├── games-order.json          # 游戏顺序
│   └── ideas-order-*.json        # 各游戏的灵感顺序
├── .github/
│   └── workflows/
│       └── pages.yml             # GitHub Pages 部署配置
├── SETUP.md                      # GitHub Token 配置指南
├── DATA_GIT_SETUP.md             # 数据文件 Git 配置说明
└── README.md                     # 项目说明文档
```

## 🛠️ 技术栈

- **HTML5**：语义化标签
- **CSS3**：原生 CSS，无框架依赖
- **JavaScript (ES6+)**：原生 JavaScript，无外部依赖
- **GitHub Pages**：静态网站托管
- **GitHub API**：数据存储和同步
- **localStorage**：本地数据缓存
- **Git Data API**：批量提交（一次同步一个 commit）

## 📁 目录说明

### 根目录文件
- `index.html`：网站首页（功能入口、天数计数器、设置）
- `index.css`：首页专用样式
- `index.js`：首页专用脚本（初始化天数计数器、设置弹窗）

### 页面目录
每个页面目录（`games/`、`blogs/`、`design/`）包含：
- `index.html`：页面 HTML 文件
- `styles.css`：页面专用样式
- `script.js`：页面专用脚本

**design/** 目录特别说明：
- 游戏设计灵感管理系统
- 支持拖拽排序、标签筛选、状态管理

### 共享资源
- `shared/styles/common.css`：所有页面共享的通用样式
  - 基础样式重置
  - Header、导航栏、Footer 样式
  - 主内容区域布局
  - Modal 弹窗样式
  - 表单和按钮样式

- `shared/scripts/common.js`：通用工具函数
  - `createDayCounter()`：创建天数计数器函数
  - `initDayCounters()`：初始化多个天数计数器

- `shared/scripts/auth.js`：认证管理
  - `AuthManager` 类：GitHub Token 存储和管理
  - `hasToken()`：检查是否已配置 Token

- `shared/scripts/github-api.js`：GitHub API 封装
  - `GitHubAPI` 类：数据读写、批量提交
  - `saveFilesBatch()`：批量保存文件（一次创建一个 commit）
  - `loadGames()` / `saveGames()`：游戏数据管理
  - `loadIdeas()` / `saveIdeas()`：灵感数据管理

### 数据目录
- `data/`：通过 GitHub API 管理的数据文件
  - `games.json`：游戏数据
  - `ideas.json`：灵感数据
  - `games-order.json`：游戏显示顺序
  - `ideas-order-*.json`：各游戏的灵感显示顺序
  - ⚠️ 注意：此目录在 `.gitignore` 中，不通过 Git 跟踪

## 🚀 本地开发

### 前置要求
- 无需安装任何依赖，纯静态网站
- 现代浏览器（支持 ES6+、localStorage、Fetch API）

### 运行步骤

1. **克隆仓库**
```bash
git clone https://github.com/Kisdews/kisdews.github.io.git
cd kisdews.github.io
```

2. **启动本地服务器**

使用 Python（推荐）：
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

或使用 Node.js：
```bash
npx http-server -p 8000
```

或使用 PHP：
```bash
php -S localhost:8000
```

3. **访问网站**
```
http://localhost:8000
```

### 配置 GitHub Token（可选）

如果需要使用数据同步功能，需要配置 GitHub Token：

1. 创建 GitHub Personal Access Token（Classic Token）
   - 进入 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - 生成新 Token，勾选 `repo` 权限
   
2. 在首页点击"⚙️ 设置"按钮
3. 输入 Token、仓库信息（owner、repo、branch）
4. 保存配置

详细配置说明请参考 [SETUP.md](./SETUP.md)

## 📦 部署

项目部署在 GitHub Pages，通过 GitHub Actions 自动部署。

### 自动部署

只需将代码推送到 `master` 分支（或 `main` 分支）即可自动部署：

```bash
git add .
git commit -m "更新网站内容"
git push origin master
```

⚠️ **注意**：`data/` 目录的更改不会触发 GitHub Pages 重新构建（已配置 `paths-ignore`），避免频繁构建。

### 部署配置

- 部署工作流：`.github/workflows/pages.yml`
- 忽略目录：`data/**`（数据文件通过 API 管理，不需要触发构建）
- 部署完成后，网站将在以下地址可访问：
```
https://kisdews.github.io
```

## 🔧 使用说明

### 设计灵感管理

1. **访问设计页面**：点击首页的"Design"卡片
2. **创建游戏**：点击"新游戏"按钮，填写游戏信息
3. **添加灵感**：
   - 点击游戏卡片进入游戏详情页
   - 点击"新灵感"按钮
   - 填写灵感信息（标题、内容、标签、状态、优先级）
4. **管理灵感**：
   - 拖拽卡片调整顺序
   - 使用标签筛选
   - 编辑或删除灵感
5. **同步数据**：
   - 所有操作先保存到本地（localStorage）
   - 点击"🔄 同步到服务器"手动同步到 GitHub
   - 一次同步创建一个 commit，包含所有文件更改

### 添加天数计数器

在页面中使用天数计数器：

1. 引入共享脚本：
```html
<script src="./shared/scripts/common.js"></script>
```

2. 在 HTML 中添加显示元素：
```html
<p id="counter-1">正在计算天数...</p>
```

3. 在页面脚本中初始化：
```javascript
document.addEventListener('DOMContentLoaded', () => {
    initDayCounters([
        {
            id: 'counter-1',
            targetDate: '2025-12-31',
            displayText: '2025年12月31日'
        }
    ]);
});
```

### 添加新页面

1. 在根目录创建新目录（如 `projects/`）
2. 创建 `index.html`、`styles.css`、`script.js`
3. 在 HTML 中引入共享资源：
```html
<link rel="stylesheet" href="../shared/styles/common.css">
<script src="../shared/scripts/common.js"></script>
```

### 修改通用样式

编辑 `shared/styles/common.css` 文件，所有页面会自动应用更改。

### 数据同步机制

- **本地优先**：所有编辑操作先保存到 `localStorage`，快速响应
- **手动同步**：点击"同步到服务器"按钮，批量提交到 GitHub
- **自动合并**：同步前自动获取服务器最新数据，智能合并冲突
- **批量提交**：一次同步创建一个 commit，包含所有文件更改

## 📝 功能状态

### ✅ 已实现
- [x] 首页功能入口卡片
- [x] 天数倒计时功能
- [x] 游戏设计灵感管理系统
- [x] GitHub Token 认证
- [x] 数据本地存储 + GitHub 同步
- [x] 拖拽排序功能
- [x] 标签筛选和搜索
- [x] 批量提交（一次同步一个 commit）
- [x] 冲突自动合并

### 🚧 待完善
- [ ] 完善游戏页面，添加游戏列表和详情
- [ ] 完善博客页面，实现 Markdown 文章加载
- [ ] 添加博客文章详情页
- [ ] 优化移动端体验
- [ ] 添加深色主题切换
- [ ] 设计灵感页面：思维导图视图（可选）

## 📚 相关文档

- [SETUP.md](./SETUP.md) - GitHub Token 配置指南
- [DATA_GIT_SETUP.md](./DATA_GIT_SETUP.md) - 数据文件 Git 配置说明
- [data/README.md](./data/README.md) - 数据文件结构说明

## 🔒 权限说明

- **未配置 Token**：只能查看内容，无法编辑
- **已配置 Token**：可以编辑和同步数据到 GitHub
- **数据存储**：本地优先（localStorage）+ GitHub 同步
- **跨设备访问**：通过 GitHub API 实现数据同步

## ⚠️ 注意事项

1. **数据文件**：`data/` 目录通过 GitHub API 管理，不在 Git 中跟踪
2. **GitHub Pages 构建**：`data/` 目录的更改不会触发重新构建
3. **Token 安全**：GitHub Token 存储在浏览器 localStorage 中，请妥善保管
4. **批量提交**：一次同步操作创建一个 commit，减少 commit 历史

## 📄 许可证

MIT License

## 👤 作者

Kisdews

---

如有问题或建议，欢迎提交 Issue 或 Pull Request！
