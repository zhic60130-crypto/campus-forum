# campus-forum

面向校园场景的**普通论坛**全栈项目（前后端分离 monorepo）：用户可浏览广场、发帖评论、点赞收藏与举报；管理员可维护用户、帖子、标签、轮播、公告并处理举报。对齐常见 JWT 论坛方案，**不含**教务、天气等扩展业务。

| 端 | 亮点 |
|---|---|
| **用户端** | 注册登录、广场/帖详情、标签筛选、图文发帖、评论回复、点赞/收藏、举报、个人资料与改密 |
| **管理端** (`/admin`) | 帖子管理、举报审核、标签、用户角色、首页轮播、站点公告 |

---

## 技术栈

版本以仓库内 `pom.xml` / `package.json` 为准。

| 层级 | 技术 | 版本 / 说明 |
|---|---|---|
| 运行时 | Java | 17 |
| 后端框架 | Spring Boot | 3.4.4 |
| 安全 | Spring Security + JJWT | 0.12.6 |
| 持久化 | MyBatis-Plus | 3.5.12 |
| 数据库 | H2（默认 `local`）/ MySQL 8（`mysql` profile） | Connector/J runtime |
| 缓存 | Spring Data Redis | `mysql` profile 下用于互动与 JWT 黑名单 |
| 对象存储 | MinIO Java SDK | 8.5.17；`mysql` profile 默认 `upload.mode=minio` |
| 前端 | React | ^19.2.8 |
| 构建 | Vite | ^8.3.0 |
| 语言 | TypeScript | ~6.0.2 |
| 路由 / 请求 | React Router、Axios | ^7.18.4、^1.20.0 |
| 状态 | Zustand | ^5.0.15 |
| 样式 / UI | Tailwind CSS、Radix UI、shadcn | ^4.3.3 等 |

---

## 仓库结构

```
campus-forum/
├── README.md           # 本文件：总览与启动说明
├── web/                # React + Vite 前端
│   ├── package.json
│   ├── vite.config.ts  # 开发环境 /api → localhost:8080
│   └── src/
└── server/             # Spring Boot 后端 API
    ├── pom.xml
    ├── mvnw / mvnw.cmd
    ├── docker-compose.yml   # MySQL / Redis / MinIO（仅基础设施）
    ├── sql/                 # MySQL 初始化脚本
    └── src/main/resources/application.yml
```

历史来源：`web/` 源自 [campus-forum-web](https://github.com/zhic60130-crypto/campus-forum-web)，`server/` 源自 [campus-forum-server](https://github.com/zhic60130-crypto/campus-forum-server)。

---

## 快速开始（默认 local / H2）

**前置**：JDK 17、Node.js 与 npm；本机需能占用下方**框架默认端口**（非本项目自定义端口）。

### 访问地址与默认端口

| 服务 | 默认端口 | 说明 |
|---|---|---|
| 后端 API | **8080** | [Spring Boot](https://docs.spring.io/spring-boot/reference/features/web.html) 默认 `server.port`；本仓库在 `server/src/main/resources/application.yml` 中显式设为 `8080` |
| 前端页面（开发） | **5173** | [Vite](https://vite.dev/config/server-options.html#server-port) `npm run dev` 默认开发端口；`web/vite.config.ts` **未**改写 `server.port` |

开发时典型访问：

- 浏览器打开前端：`http://127.0.0.1:5173`（或 `http://localhost:5173`）
- 直连后端 API：`http://localhost:8080`（前端通过 Vite 把 `/api` 代理到该地址）

若 **5173** 已被占用，Vite 会自动尝试下一可用端口，以 `npm run dev` 终端输出为准。

### 1. 启动后端

默认激活 Spring profile **`local`**：H2 文件库（`server/data/`）、内存互动存储、上传落盘 `./uploads`，**无需 Docker**。

```bash
cd server
./mvnw spring-boot:run
# Windows: mvnw.cmd spring-boot:run
```

- API：`http://localhost:8080`（Spring Boot 默认端口 **8080**）
- H2 控制台（仅 local）：`http://localhost:8080/h2-console`（同上端口；JDBC URL 与账号见 `application.yml` 中 `local` 段）

首次启动且库为空时，`DataSeeder` 会写入演示数据。

### 2. 启动前端

```bash
cd web
npm install
npm run dev
```

- 页面：`http://127.0.0.1:5173`（Vite 默认端口 **5173**；端口冲突时见上文）
- 浏览器请求 `/api/*` 由 Vite 代理到 `http://localhost:8080`（后端默认 **8080**；见 `web/vite.config.ts`）

### 演示账号

| 用户名 | 密码 | 角色 |
|---|---|---|
| `admin` | `password123` | ADMIN（可进 `/admin`） |
| `pixel`、`nova` | `password123` | USER |

也可自行注册新用户（默认 USER）。

---

## 可选：MySQL + Redis + MinIO

需要与生产更接近的栈时，在 `server/` 目录：

```bash
docker compose up -d
./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql
# Windows: mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql
```

| 服务 | 端口 | 说明 |
|---|---|---|
| MySQL | 3306 | 库 `campus_forum`，用户 `forum` / `forum123`（与 `application.yml` 一致） |
| Redis | 6379 | 互动 Set、JWT 登出黑名单 |
| MinIO | 9000（API）、9001（控制台） | 默认账号 `minioadmin` / `minioadmin`，bucket `campus-forum` |

`mysql` profile 下：`spring.sql.init.mode=never`，表与种子数据由 Compose 挂载的 `sql/schema.sql`、`sql/data.sql` 初始化；互动走 Redis（`forum.interact.memory-fallback=false`），上传默认 MinIO。

环境变量（可选覆盖）：`REDIS_HOST`、`REDIS_PORT`。

---

## Spring Profile 说明

配置集中在 **`server/src/main/resources/application.yml`**（无单独的 `application-dev.yml` / `application-prod.yml`）。

| Profile | 数据源 | Redis | 互动存储 | 上传 |
|---|---|---|---|---|
| **`local`**（默认） | H2 文件库 + `classpath:db/schema-h2.sql` 初始化 | 自动配置已排除 | 内存（`memory-fallback: true`） | 本地目录 `./uploads` → `GET /api/files/**` |
| **`mysql`** | MySQL `127.0.0.1:3306/campus_forum` | 启用 | Redis | MinIO（`public-base-url` 指向 `9000/campus-forum`） |

切换方式：`-Dspring-boot.run.profiles=mysql` 或环境变量 `SPRING_PROFILES_ACTIVE=mysql`。

---

## 主要功能与模块对照

| 功能 | 前端路由 / 区域 | 后端（示例） |
|---|---|---|
| 登录 / 注册 / 当前用户 | `/login`、`/register` | `AuthController`：`/api/auth/*` |
| 广场、帖详情、发帖 | `/`、`/post/:id` | `TopicController`：`/api/topics` |
| 评论 | 帖详情页 | `TopicController` 评论接口 |
| 点赞 / 收藏 | 帖详情、收藏页 | `InteractController`：`/api/interact/*` |
| 举报 | 帖详情 | `ReportService` / 管理端审核 |
| 轮播、标签、元数据 | 首页 | `BannerController`、`MetaController` |
| 图片上传 | 发帖 / 设置 | `ImageController`：`POST /api/image/upload` |
| 账号资料 / 改密 | `/settings/*` | `AccountController` |
| 管理：帖 / 举报 / 标签 / 用户 / 轮播 / 公告 | `/admin/*` | `Admin*Controller` |

统一 API 响应信封：`{ success, code, message, data }`。

更细的接口与答辩向说明见各子目录 README 或项目内文档；**以当前源码为准**。

---

## 子项目说明

- [`web/README.md`](web/README.md) — 前端目录结构与 Axios/JWT 约定  
- [`server/README.md`](server/README.md) — 后端 API 摘要与 MySQL 启动命令  
