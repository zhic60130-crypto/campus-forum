# campus-forum

校园普通论坛 monorepo。

| 目录 | 说明 | 原仓库 |
|---|---|---|
| `web/` | React + Vite 前端 | [campus-forum-web](https://github.com/zhic60130-crypto/campus-forum-web) |
| `server/` | Spring Boot 后端 | [campus-forum-server](https://github.com/zhic60130-crypto/campus-forum-server) |

## 前置条件

- Docker（Compose v2）
- JDK 17
- Node.js 20.19+ 或 22.12+

## 推荐启动（MySQL + Redis + MinIO）

默认 Spring profile 是 `mysql`。冷启动按下面顺序：先起中间件，再起后端，再开前端。

### 1. 中间件

在仓库根目录：

```bash
cd server
docker compose up -d
```

MySQL 首次启动会执行 `server/sql/schema.sql` 与 `server/sql/data.sql`。等 `campus-forum-mysql` 健康后再启动后端。

对象存储镜像是 `pgsty/silo:RELEASE.2026-09-16T00-00-00Z`。Docker Hub 已拒绝匿名拉取 `minio/minio`；Silo 兼容原有启动命令、`MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`，以及 API `9000`、控制台 `9001`。

### 2. 后端

仍在 `server/`：

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql
```

Windows：`mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql`

`server/src/main/resources/application.yml` 中 `spring.profiles.active` 已是 `mysql`，省略 `-Dspring-boot.run.profiles=mysql` 时同样使用该 profile。

服务：`http://localhost:8080`

### 3. 前端

另开终端，在仓库根目录：

```bash
cd web
npm install
npm run dev
```

Vite 将 `/api` 代理到 `http://localhost:8080`。

### 端口与凭据

凭据与 `server/docker-compose.yml`、`application.yml` 一致。

| 组件 | 地址 | 凭据 |
|---|---|---|
| MySQL | `127.0.0.1:3306`，库 `campus_forum` | 应用用户 `forum` / `forum123`；root / `root` |
| Redis | `127.0.0.1:6379` | 无密码 |
| MinIO | API `http://127.0.0.1:9000`，控制台 `http://127.0.0.1:9001` | `minioadmin` / `minioadmin`，桶 `campus-forum` |
| 后端 | `http://localhost:8080` | |
| 前端 | `http://localhost:5173`（Vite 默认） | `/api` → `http://localhost:8080` |

### 演示账号

| 用户名 | 密码 | 角色 |
|---|---|---|
| admin | 123456 | ADMIN |
| pixel / nova | 123456 | USER |

## 可选：H2（`local` profile）

无 Docker 时仍可使用 `local`：H2 文件库、内存互动存储、本地上传目录。该 profile 关闭 Redis 自动配置。

在 `server/`：

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Windows：`mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local`

- H2：`jdbc:h2:file:./data/campus_forum`，用户 `sa`，密码为空；控制台 `http://localhost:8080/h2-console`
- 上传目录：`server/uploads`（相对进程工作目录为 `./uploads`）

前端步骤与上面相同。
