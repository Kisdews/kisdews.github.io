# GitHub Token 配置指南

## 功能说明

本系统实现了：
- ✅ **Token 权限控制**：配置了 Token 可以编辑内容，未配置只能查看
- ✅ **GitHub 数据同步**：数据保存到 GitHub，实现跨设备访问
- ✅ **简单易用**：只需配置 Token 即可开始编辑

## 首次配置步骤

### 1. 创建 GitHub Personal Access Token

**推荐使用 Classic Token（经典令牌）**

1. 登录 GitHub
2. 进入 **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. 点击 **Generate new token (classic)**
4. 填写信息：
   - **Note**: `Kisdews Website Editor`（备注）
   - **Expiration**: 选择过期时间（建议 90 天或 No expiration）
   - **权限**: 勾选 `repo`（完整仓库权限）
     - 这会授予对仓库的读写权限，包括读取和更新文件
5. 点击 **Generate token**
6. **重要**：复制生成的 token（只显示一次，请保存好）

**如果使用 Fine-grained Token（细粒度令牌）**：
- 进入 **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
- 点击 **Generate new token**
- 填写信息：
  - **Token name**: `Kisdews Website Editor`
  - **Expiration**: 选择过期时间
  - **Repository access**: 选择 `Only select repositories`，然后选择你的仓库
  - **Permissions** → **Repository permissions** → **Contents**: 选择 `Read and write`
- 点击 **Generate token**
- 复制生成的 token

**两种 Token 的区别**：
- **Classic Token**：更简单，权限范围更广，推荐使用
- **Fine-grained Token**：权限更精确，安全性更高，但配置稍复杂

### 2. 配置仓库信息

编辑 `shared/scripts/github-api.js`，修改以下信息：

```javascript
this.owner = 'Kisdews';        // 你的 GitHub 用户名
this.repo = 'kisdews.github.io';  // 你的仓库名
this.branch = 'main';          // 分支名（通常是 main 或 master）
```

### 3. 配置 Token

1. 访问首页
2. 点击 **"配置 Token"** 按钮
3. 输入 GitHub Token
4. 点击 **"保存"**

完成！现在你可以编辑内容了。

## 使用说明

### 已配置 Token

- ✅ 可以看到所有编辑按钮（+ 新游戏、+ 新灵感、编辑、删除）
- ✅ 创建/编辑的内容会自动保存到 GitHub
- ✅ 数据可以在任何设备上访问和编辑

### 未配置 Token

- ❌ 编辑按钮被隐藏
- ✅ 可以查看所有数据（从 GitHub 读取）
- ❌ 无法创建、编辑或删除内容

### 多设备配置

**重要**：每个设备都需要单独配置 token，因为配置存储在浏览器的本地存储中。

**推荐方式：使用配置导出/导入功能**

1. **在第一个设备上配置完成后**：
   - 打开设置弹窗
   - 点击 **"📤 导出配置"** 按钮
   - 保存下载的 JSON 文件（请妥善保管，不要分享给他人）

2. **在其他设备上**：
   - 打开设置弹窗
   - 点击 **"📥 导入配置"** 按钮
   - 选择之前导出的 JSON 文件
   - 刷新页面使配置生效

这样就不需要在每个设备上重复输入 token 和仓库信息了！

**注意**：
- 配置文件包含敏感的 token 信息，请妥善保管
- 不要将配置文件提交到 Git 仓库
- 如果 token 泄露，请立即在 GitHub 上撤销并重新生成

### 数据同步

- **自动同步**：登录后，每次保存都会自动同步到 GitHub
- **手动同步**：在设置中点击"立即同步到 GitHub"
- **读取数据**：所有用户（登录/未登录）都从 GitHub 读取最新数据

## 数据存储位置

数据文件存储在仓库的 `data/` 目录：

```
data/
├── games.json              # 游戏数据
├── ideas.json              # 灵感数据
├── games-order.json        # 游戏顺序
└── ideas-order-{gameId}.json  # 每个游戏的想法顺序
```

## 安全说明

1. **密码安全**：
   - 密码使用 SHA-256 哈希存储
   - 首次登录时自动设置密码
   - 密码存储在浏览器 localStorage

2. **Token 安全**：
   - Token 存储在浏览器 localStorage
   - 仅用于 API 调用，不会显示在页面上
   - 可以随时在 GitHub 撤销

3. **权限控制**：
   - 只有登录用户才能编辑
   - 未登录用户只能查看
   - 数据通过 GitHub API 验证权限

## 故障排除

### 无法保存到 GitHub

1. 检查是否已登录
2. 检查 GitHub Token 是否正确
3. 检查 Token 是否有 `repo` 权限
4. 检查仓库信息配置是否正确

### 无法读取数据

1. 检查网络连接
2. 检查仓库是否为公开仓库
3. 检查 `data/` 目录是否存在（首次使用时会自动创建）

### 配置 Token 后仍无法编辑

1. 刷新页面
2. 检查 Token 是否正确配置（在设置中查看）
3. 检查 Token 是否有效（在 GitHub 上验证）

## 注意事项

- ⚠️ GitHub Token 有 API 速率限制（个人使用通常足够）
- ⚠️ 首次使用时，`data/` 目录会在首次保存时自动创建
- ⚠️ 建议定期备份数据（Git 会自动保存历史版本）
- ⚠️ 如果 Token 过期，需要重新创建并更新

