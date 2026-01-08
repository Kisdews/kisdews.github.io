# 数据文件说明

此目录用于存储网站的数据文件，通过 GitHub API 进行读写。

## 文件结构

```
data/
├── games.json          # 游戏数据
├── ideas.json          # 灵感数据
├── games-order.json    # 游戏顺序
└── ideas-order-{gameId}.json  # 每个游戏的想法顺序
```

## 数据格式

### games.json
```json
[
  {
    "id": "game-001",
    "name": "游戏名称",
    "description": "游戏描述",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### ideas.json
```json
[
  {
    "id": "idea-001",
    "gameId": "game-001",
    "title": "想法标题",
    "content": "想法内容",
    "tags": ["标签1", "标签2"],
    "status": "草稿",
    "priority": "中",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## 注意事项

- 这些文件通过 GitHub API 自动管理
- 首次使用时，文件会在保存数据时自动创建
- 不要手动编辑这些文件，除非你知道自己在做什么

