# kisdews.github.io

个人网站项目，基于 GitHub Pages 构建的简洁响应式网站。

## 📋 项目简介

这是一个结构清晰、易于维护的个人网站，采用按页面划分的资源组织方式。网站包含首页、游戏展示页和博客文章页，所有页面共享通用的样式和脚本资源。

## ✨ 功能特性

- 🏠 **首页**：展示个人介绍和天数倒计时功能
- 🎮 **游戏页面**：展示游戏项目列表（待完善）
- 📝 **博客页面**：展示博客文章列表（待完善）
- 📅 **天数计数器**：可复用的日期倒计时工具
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
│   ├── styles.css                # 游戏页面专用样式
│   └── script.js                 # 游戏页面专用脚本
├── blogs/                        # 博客页面目录
│   ├── index.html
│   ├── styles.css                # 博客页面专用样式
│   └── script.js                 # 博客页面专用脚本
└── shared/                       # 共享资源目录
    ├── styles/
    │   └── common.css            # 通用样式（header, nav, footer等）
    └── scripts/
        └── common.js             # 通用工具函数（天数计数器等）
```

## 🛠️ 技术栈

- **HTML5**：语义化标签
- **CSS3**：原生 CSS，无框架依赖
- **JavaScript (ES6+)**：原生 JavaScript，无外部依赖
- **GitHub Pages**：静态网站托管

## 📁 目录说明

### 根目录文件
- `index.html`：网站首页
- `index.css`：首页专用样式
- `index.js`：首页专用脚本（初始化天数计数器）

### 页面目录
每个页面目录（`games/`、`blogs/`）包含：
- `index.html`：页面 HTML 文件
- `styles.css`：页面专用样式
- `script.js`：页面专用脚本

### 共享资源
- `shared/styles/common.css`：所有页面共享的通用样式
  - 基础样式重置
  - Header、导航栏、Footer 样式
  - 主内容区域布局
- `shared/scripts/common.js`：所有页面共享的通用工具函数
  - `createDayCounter()`：创建天数计数器函数
  - `initDayCounters()`：初始化多个天数计数器

## 🚀 本地开发

### 前置要求
- 无需安装任何依赖，纯静态网站

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

## 📦 部署

项目部署在 GitHub Pages，只需将代码推送到 `main` 分支即可自动部署：

```bash
git add .
git commit -m "更新网站内容"
git push origin main
```

部署完成后，网站将在以下地址可访问：
```
https://kisdews.github.io
```

## 🔧 使用说明

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

## 📝 待完善功能

- [ ] 完善游戏页面，添加游戏列表和详情
- [ ] 完善博客页面，实现 Markdown 文章加载
- [ ] 添加博客文章详情页
- [ ] 优化移动端体验
- [ ] 添加深色主题切换
- [ ] 添加搜索功能

## 📄 许可证

MIT License

## 👤 作者

Kisdews

---

如有问题或建议，欢迎提交 Issue 或 Pull Request！
