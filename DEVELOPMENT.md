# SoloMusic Server 开发文档

## 1. 项目概述

SoloMusic Server 是一个基于 Node.js 的音乐播放器后端服务，为 Electron 桌面客户端提供音乐库管理、元数据解析、播放列表管理、搜索、收藏、播放历史、歌词等核心能力。

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 16+ | 运行时 |
| TypeScript | 6.x | 开发语言 |
| Express | 5.x | Web 框架 |
| Prisma | 5.x | ORM |
| SQLite | - | 嵌入式数据库 |
| music-metadata | 7.x | 音频元数据解析 |

---

## 2. 项目结构

```
soloMusicServer/
├── prisma/
│   ├── schema.prisma          # 数据模型定义
│   ├── dev.db                 # SQLite 数据库文件
│   └── migrations/            # 数据库迁移记录
├── covers/                    # 专辑封面存储目录（运行时生成）
├── src/
│   ├── config/
│   │   └── database.ts        # Prisma 数据库连接单例
│   ├── routes/
│   │   ├── index.ts           # 路由总入口，注册所有模块
│   │   ├── song.routes.ts     # 曲目路由
│   │   ├── library.routes.ts  # 音乐库路由
│   │   ├── album.routes.ts    # 专辑路由
│   │   ├── artist.routes.ts   # 艺术家路由
│   │   ├── playlist.routes.ts # 播放列表路由
│   │   ├── favorite.routes.ts # 收藏路由
│   │   ├── playHistory.routes.ts # 播放历史路由
│   │   ├── lyrics.routes.ts   # 歌词路由
│   │   ├── stream.routes.ts   # 音频流路由
│   │   └── search.routes.ts   # 搜索路由
│   ├── controllers/           # 控制器层：请求处理与响应
│   ├── services/              # 服务层：业务逻辑
│   ├── repositories/          # 数据访问层：数据库操作
│   ├── middlewares/
│   │   ├── errorHandler.ts    # 统一错误处理中间件
│   │   └── logger.ts          # 请求日志中间件
│   ├── utils/
│   │   └── response.ts        # 统一响应格式工具
│   └── app.ts                 # 应用入口
├── .eslintrc.json             # ESLint 配置
├── .prettierrc                # Prettier 配置
├── tsconfig.json              # TypeScript 配置
├── package.json               # 项目依赖与脚本
└── .env                       # 环境变量（DATABASE_URL）
```

---

## 3. 架构设计

### 3.1 分层架构

项目采用 **四层分层架构**，职责清晰，便于维护和扩展：

```
请求 → Route → Controller → Service → Repository → Database
                                            ↓
                                      Prisma Client
```

| 层级 | 目录 | 职责 |
|------|------|------|
| **路由层** | `routes/` | 定义 API 端点，将请求映射到控制器方法 |
| **控制器层** | `controllers/` | 解析请求参数，调用服务层，返回统一响应 |
| **服务层** | `services/` | 封装业务逻辑，处理错误（抛出 AppError） |
| **数据访问层** | `repositories/` | 封装 Prisma 数据库操作，提供 CRUD 方法 |

### 3.2 请求处理流程

1. 请求进入 Express，经过 `cors` → `json解析` → `logger` 中间件
2. 路由匹配，进入对应 Controller 方法
3. Controller 解析参数，调用 Service
4. Service 执行业务逻辑，调用 Repository
5. Repository 通过 Prisma Client 操作数据库
6. 结果逐层返回，Controller 使用 `success()` 包装响应
7. 如有异常，`errorHandler` 中间件捕获并返回统一错误格式

### 3.3 中间件链

```
cors → express.json → express.urlencoded → logger → 路由处理 → 404兜底 → errorHandler
```

---

## 4. 数据模型

### 4.1 ER 关系图

```
Artist ──1:N── Album ──1:N── Song ──1:1── Lyrics
   │                        │
   └────────1:N─────────────┘
                            │
                   ┌────────┼────────┐
                   │        │        │
               Favorite  PlayHistory  PlaylistSong ──N:1── Playlist
```

### 4.2 模型详情

#### Song（曲目）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | 自增主键 |
| title | String | 曲目标题 |
| filePath | String (Unique) | 文件绝对路径，用于去重 |
| duration | Float | 时长（秒） |
| bitrate | Int | 比特率（kbps） |
| sampleRate | Int | 采样率（Hz） |
| format | String | 音频格式（mp3/flac等） |
| fileSize | Int | 文件大小（字节） |
| coverPath | String | 封面图路径 |
| albumId | Int? (FK) | 关联专辑 |
| artistId | Int? (FK) | 关联艺术家 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

**索引**：title、albumId、artistId

#### Album（专辑）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | 自增主键 |
| name | String | 专辑名称 |
| coverPath | String | 封面路径 |
| releaseYear | Int? | 发行年份 |
| artistId | Int? (FK) | 关联艺术家 |

**索引**：name、artistId

#### Artist（艺术家）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | 自增主键 |
| name | String | 艺术家名称 |
| avatar | String | 头像路径 |
| bio | String | 简介 |

**索引**：name

#### Playlist（播放列表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | 自增主键 |
| name | String | 列表名称 |
| description | String | 描述 |
| coverPath | String | 封面路径 |

#### PlaylistSong（播放列表-曲目关联）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | 自增主键 |
| playlistId | Int (FK) | 播放列表ID，级联删除 |
| songId | Int (FK) | 曲目ID，级联删除 |
| order | Int | 排序序号 |
| addedAt | DateTime | 添加时间 |

**唯一约束**：`[playlistId, songId]`

#### Favorite（收藏）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | 自增主键 |
| songId | Int (FK, Unique) | 曲目ID，级联删除 |
| createdAt | DateTime | 收藏时间 |

#### PlayHistory（播放历史）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | 自增主键 |
| songId | Int (FK) | 曲目ID，级联删除 |
| playedAt | DateTime | 播放时间 |

**索引**：songId、playedAt

#### Lyrics（歌词）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | 自增主键 |
| songId | Int (FK, Unique) | 曲目ID，级联删除 |
| content | String | 歌词内容（LRC格式） |
| offset | Int | 时间偏移量（毫秒） |

---

## 5. API 接口文档

所有接口统一前缀 `/api/v1`。

### 5.1 统一响应格式

**成功响应**：
```json
{
  "code": 0,
  "data": { ... },
  "message": "success"
}
```

**错误响应**：
```json
{
  "code": 404,
  "data": null,
  "message": "Song not found"
}
```

### 5.2 健康检查

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/health` | 服务状态检查 |

### 5.3 曲目管理

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/songs` | 曲目列表 | `page`, `pageSize`, `albumId`, `artistId` |
| GET | `/api/v1/songs/:id` | 曲目详情 | - |
| DELETE | `/api/v1/songs/:id` | 删除曲目 | - |

**分页响应示例**：
```json
{
  "code": 0,
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20
  },
  "message": "success"
}
```

### 5.4 音乐库扫描

| 方法 | 路径 | 说明 | 请求体 |
|------|------|------|--------|
| POST | `/api/v1/library/scan` | 扫描目录导入音乐 | `{ "path": "D:/Music" }` |

**扫描响应示例**：
```json
{
  "code": 0,
  "data": {
    "total": 50,
    "added": 45,
    "skipped": 3,
    "errors": 2
  },
  "message": "success"
}
```

支持的音频格式：`.mp3`、`.flac`、`.wav`、`.ogg`、`.aac`、`.m4a`

### 5.5 专辑

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/albums` | 专辑列表 | `page`, `pageSize`, `artistId` |
| GET | `/api/v1/albums/:id` | 专辑详情（含曲目列表） | - |

### 5.6 艺术家

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/artists` | 艺术家列表 | `page`, `pageSize` |
| GET | `/api/v1/artists/:id` | 艺术家详情（含专辑和曲目） | - |

### 5.7 音频流播放

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/songs/:id/stream` | 流式播放曲目 |

支持 `Range` 请求头实现断点续传和拖动播放：
- 无 Range 头：返回 200 + 完整文件流
- 有 Range 头（如 `bytes=0-1023`）：返回 206 Partial Content

**MIME 类型映射**：

| 格式 | Content-Type |
|------|-------------|
| .mp3 | audio/mpeg |
| .flac | audio/flac |
| .wav | audio/wav |
| .ogg | audio/ogg |
| .aac | audio/aac |
| .m4a | audio/mp4 |

### 5.8 播放列表

| 方法 | 路径 | 说明 | 请求体 |
|------|------|------|--------|
| GET | `/api/v1/playlists` | 获取所有播放列表 | - |
| GET | `/api/v1/playlists/:id` | 获取播放列表详情 | - |
| POST | `/api/v1/playlists` | 创建播放列表 | `{ "name": "", "description?": "", "coverPath?": "" }` |
| PUT | `/api/v1/playlists/:id` | 更新播放列表 | `{ "name?": "", "description?": "", "coverPath?": "" }` |
| DELETE | `/api/v1/playlists/:id` | 删除播放列表 | - |
| POST | `/api/v1/playlists/:id/songs` | 添加曲目 | `{ "songId": 1 }` |
| DELETE | `/api/v1/playlists/:id/songs/:songId` | 移除曲目 | - |
| PUT | `/api/v1/playlists/:id/songs/reorder` | 调整顺序 | `{ "songs": [{ "songId": 1, "order": 0 }] }` |

### 5.9 搜索

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/search` | 全局搜索 | `q`（关键词，必填）, `type`（song/album/artist，可选） |

### 5.10 收藏

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/favorites` | 收藏列表 | `page`, `pageSize` |
| POST | `/api/v1/favorites/:songId` | 收藏曲目（幂等） | - |
| DELETE | `/api/v1/favorites/:songId` | 取消收藏 | - |

### 5.11 播放历史

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/v1/history` | 播放历史 | `page`, `pageSize` |
| POST | `/api/v1/history/:songId` | 记录播放 | - |

### 5.12 歌词

| 方法 | 路径 | 说明 | 请求体 |
|------|------|------|--------|
| GET | `/api/v1/songs/:id/lyrics` | 获取歌词 | - |
| PUT | `/api/v1/songs/:id/lyrics` | 更新/创建歌词 | `{ "content": "", "offset?": 0 }` |

---

## 6. 模块详解

### 6.1 音乐库管理模块

**核心文件**：
- [metadata.service.ts](src/services/metadata.service.ts) — 元数据提取
- [library.service.ts](src/services/library.service.ts) — 目录扫描与导入

**工作流程**：
1. 客户端调用 `POST /api/v1/library/scan`，传入目录路径
2. `libraryService.scan()` 递归扫描目录下所有音频文件
3. 对每个文件检查 `filePath` 是否已存在（去重）
4. 调用 `metadataService.extract()` 使用 `music-metadata` 解析元数据
5. 自动 `findOrCreate` 艺术家和专辑
6. 创建 Song 记录并保存封面到 `covers/` 目录

**元数据提取**：
- 使用 `music-metadata` 的 `parseFile` 方法
- 提取字段：title、artist、album、duration、bitrate、sampleRate、format、fileSize
- 封面图片保存到项目根目录 `covers/` 文件夹，文件名使用 MD5 哈希

### 6.2 音频流式传输模块

**核心文件**：
- [stream.service.ts](src/services/stream.service.ts) — 流信息计算
- [stream.controller.ts](src/controllers/stream.controller.ts) — 流管道传输

**Range 请求处理**：
1. 解析 `Range: bytes=start-end` 请求头
2. 计算 Content-Length 和 Content-Range
3. 使用 `fs.createReadStream(filePath, { start, end })` 创建部分读取流
4. 返回 206 状态码，pipe 到响应

### 6.3 播放列表模块

**核心文件**：
- [playlist.repository.ts](src/repositories/playlist.repository.ts) — 播放列表 CRUD
- [playlistSong.repository.ts](src/repositories/playlistSong.repository.ts) — 列表-曲目关联
- [playlist.service.ts](src/services/playlist.service.ts) — 业务逻辑

**排序机制**：
- 每个曲目在列表中有 `order` 字段
- 添加曲目时自动计算 `order = max(order) + 1`
- 调整顺序通过 `PUT /playlists/:id/songs/reorder` 批量更新，使用 `$transaction` 保证原子性

### 6.4 搜索模块

**核心文件**：
- [search.service.ts](src/services/search.service.ts)

**搜索策略**：
- 使用 Prisma 的 `contains` 过滤器（SQLite 下默认大小写不敏感）
- 支持按类型过滤：`type=song` 只搜曲目，不传则搜全部
- 曲目搜 `title`，专辑搜 `name`，艺术家搜 `name`

### 6.5 收藏模块

**幂等设计**：收藏操作是幂等的，重复收藏同一曲目不会报错，直接返回已有记录。

### 6.6 播放历史模块

每次播放都创建新记录（不合并），按 `playedAt` 降序排列。

### 6.7 歌词模块

支持 LRC 格式歌词，使用 `upsert` 操作实现创建或更新。`offset` 字段用于 LRC 歌词的全局时间偏移（毫秒）。

---

## 7. 错误处理

### 7.1 AppError 类

```typescript
class AppError extends Error {
  statusCode: number;  // HTTP 状态码
  code: number;        // 业务错误码
  message: string;     // 错误描述
}
```

### 7.2 常见错误码

| HTTP 状态码 | 业务码 | 说明 |
|------------|--------|------|
| 400 | 400 | 请求参数错误 |
| 404 | 404 | 资源不存在 |
| 409 | 409 | 资源冲突（如曲目已在播放列表中） |
| 500 | 500 | 服务器内部错误 |
| 500 | 5001 | 播放历史记录失败 |

### 7.3 Express 5.x 异步错误处理

Express 5.x 自动捕获 async 路由处理器中的异常并转发给错误中间件，无需手动 try/catch。但需要自定义错误处理（如 404）时仍需手动抛出 `AppError`。

---

## 8. 开发与维护指南

### 8.1 环境准备

```bash
# 安装依赖
npm install

# 初始化数据库
npx prisma migrate dev

# 启动开发服务器（热重载）
npm run dev
```

### 8.2 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（ts-node-dev 热重载） |
| `npm run build` | 编译 TypeScript 到 dist/ |
| `npm run start` | 运行编译后的生产代码 |
| `npm run lint` | ESLint 代码检查 |
| `npm run lint:fix` | ESLint 自动修复 |
| `npm run format` | Prettier 格式化 |
| `npx prisma migrate dev` | 创建并应用数据库迁移 |
| `npx prisma studio` | 打开数据库可视化管理界面 |
| `npx prisma generate` | 重新生成 Prisma Client |

### 8.3 数据库迁移

当需要修改数据模型时：

```bash
# 1. 修改 prisma/schema.prisma
# 2. 创建迁移
npx prisma migrate dev --name 描述性名称

# 3. Prisma Client 会自动重新生成
```

### 8.4 添加新模块

按照分层架构添加新模块的步骤：

1. **定义数据模型**：在 `prisma/schema.prisma` 中添加新 model，执行迁移
2. **创建 Repository**：在 `src/repositories/` 中新建文件，封装 Prisma 操作
3. **创建 Service**：在 `src/services/` 中新建文件，实现业务逻辑
4. **创建 Controller**：在 `src/controllers/` 中新建文件，处理请求响应
5. **创建 Route**：在 `src/routes/` 中新建文件，定义路由
6. **注册路由**：在 `src/routes/index.ts` 中导入并注册新路由

**示例**：添加"标签"模块

```typescript
// 1. prisma/schema.prisma 添加 Tag 模型
// 2. src/repositories/tag.repository.ts
import prisma from '../config/database';
export const tagRepository = {
  findAll: () => prisma.tag.findMany(),
  // ...
};

// 3. src/services/tag.service.ts
import { tagRepository } from '../repositories/tag.repository';
export const tagService = {
  getTags: () => tagRepository.findAll(),
  // ...
};

// 4. src/controllers/tag.controller.ts
import { tagService } from '../services/tag.service';
import { success } from '../utils/response';
export const tagController = {
  getTags: async (_req, res) => res.json(success(await tagService.getTags())),
};

// 5. src/routes/tag.routes.ts
import { Router } from 'express';
import { tagController } from '../controllers/tag.controller';
const router = Router();
router.get('/', tagController.getTags);
export default router;

// 6. src/routes/index.ts 添加
import tagRoutes from './tag.routes';
router.use('/tags', tagRoutes);
```

### 8.5 代码规范

- **ESLint**：使用 `@typescript-eslint/recommended` 规则集
- **Prettier**：单引号、分号、2空格缩进、尾逗号、100字符行宽
- **命名规范**：
  - 文件名：camelCase（如 `song.repository.ts`）
  - 导出对象：camelCase（如 `songRepository`、`songService`）
  - 类名：PascalCase（如 `AppError`）
  - 常量：UPPER_SNAKE_CASE（如 `MIME_TYPES`）

### 8.6 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务监听端口 | 3000 |
| `DATABASE_URL` | SQLite 数据库路径 | `file:./dev.db` |

---

## 9. 注意事项与已知限制

### 9.1 Node.js 版本

当前使用 Prisma 5.x，兼容 Node 16+。如需升级到 Prisma 7.x，需要 Node 20.19+。

### 9.2 SQLite 限制

- 不支持并发写入（单写者锁），适合桌面单用户场景
- Prisma 的 `contains` 在 SQLite 下默认大小写不敏感，但 `mode: 'insensitive'` 参数不被支持
- 不支持全文搜索索引，大数据量下搜索性能有限

### 9.3 封面存储

封面图片保存在项目根目录 `covers/` 文件夹，文件名使用 MD5 哈希。注意：
- 删除曲目时不会自动删除封面文件
- 重复扫描同一文件可能产生重复封面（因哈希含时间戳）

### 9.4 分页格式不统一

当前项目中分页响应格式存在两种风格：
- Song/Album/Artist 模块：`{ list, total, page, pageSize }`
- Favorite/PlayHistory 模块：`{ items/pagination: { page, pageSize, total, totalPages } }`

后续维护建议统一为一种格式。

---

## 10. 未来扩展方向

- **用户系统**：添加 User 模型，支持多用户收藏/播放列表隔离
- **智能播放列表**：基于规则自动生成播放列表
- **歌词在线获取**：集成第三方歌词 API
- **音频转码**：服务端转码支持（如 FLAC → MP3）
- **播放统计**：更丰富的播放统计和分析
- **WebSocket**：实时推送扫描进度、播放状态同步
- **配置管理**：支持通过 API 管理服务端配置
