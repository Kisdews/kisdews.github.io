# 数据文件 Git 配置说明

## 问题

每次通过网页保存数据时，GitHub API 会自动创建一个 commit。这会导致：
- 产生大量的 commit 历史
- 收到很多构建邮件（虽然我们已经配置了忽略 data 目录的构建）

## 解决方案

### 1. 将 data/ 目录添加到 .gitignore

✅ 已完成：已创建 `.gitignore` 文件，包含 `data/` 目录

### 2. 如果 data/ 目录已经被 git 跟踪

如果 `data/` 目录之前已经被 git 跟踪，需要先从 git 中移除（但保留本地文件）：

```bash
# 从 git 跟踪中移除 data/ 目录（但保留本地文件）
git rm -r --cached data/

# 提交这个更改
git commit -m "停止跟踪 data/ 目录，改为通过 API 管理"

# 推送到 GitHub
git push
```

### 3. 工作原理

- **本地 git**：不会跟踪 `data/` 目录中的文件
- **GitHub 仓库**：通过 GitHub API 保存的文件仍然会出现在仓库中
- **GitHub API**：每次保存仍然会创建 commit，但这是 GitHub 的正常行为

### 4. 注意事项

⚠️ **重要**：通过 GitHub API 保存文件时，GitHub 仍然会创建 commit。这是 GitHub API 的工作机制，无法避免。

但是：
- 本地 git 不会看到这些更改（因为 data/ 在 .gitignore 中）
- GitHub Pages 构建不会触发（因为我们已经配置了忽略 data/ 目录）
- 数据文件仍然正常保存在 GitHub 上

### 5. 查看数据文件

即使 `data/` 在 .gitignore 中，你仍然可以：
- 在 GitHub 网页上直接查看 `data/` 目录中的文件
- 通过 GitHub API 读取和写入数据
- 在其他设备上通过网页访问数据

### 6. 如果需要手动管理数据文件

如果将来需要手动编辑数据文件并提交到 git：

```bash
# 临时移除 .gitignore 中的 data/（编辑 .gitignore 文件）
# 然后正常 git add、commit、push
```

但建议始终通过网页界面管理数据，保持一致性。

