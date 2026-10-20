# campus-forum

校园普通论坛 monorepo。

| 目录 | 说明 | 原仓库 |
|---|---|---|
| `web/` | React + Vite 前端 | [campus-forum-web](https://github.com/zhic60130-crypto/campus-forum-web) |
| `server/` | Spring Boot 后端 | [campus-forum-server](https://github.com/zhic60130-crypto/campus-forum-server) |

## 本地启动

**Windows 一键启动（开发）：** 在仓库根目录双击 `start.bat`（或 `start.ps1`）。脚本会检查 JDK 17 / Node.js、安装前端依赖，并分别启动 `server`（8080）与 `web`（5173）。仍须先在本机或 Docker 中准备好 MySQL / Redis / MinIO（见下文）。

本机开发统一使用 **MySQL**（配合 Redis、MinIO），无内置 H2 路径。

### 1. 依赖服务

```bash
cd server
docker compose up -d
```

| 服务 | 端口 | 开发默认账号（仅本地，勿用于生产） |
|---|---|---|
| MySQL | 3306 | 库 `campus_forum`，用户 `forum` / `forum123` |
| Redis | 6379 | 无密码 |
| MinIO | 9000（API）、9001（控制台） | `minioadmin` / `minioadmin` |

首次 `docker compose up` 会通过 `server/sql/schema.sql` 与 `data.sql` 初始化库表与演示数据。

若使用本机已安装的 MySQL，请创建同名库与用户（或与 `docker-compose.yml` 一致），并执行上述 SQL 脚本。

连接可通过环境变量覆盖：`MYSQL_HOST`、`MYSQL_PORT`、`MYSQL_DATABASE`、`MYSQL_USER`、`MYSQL_PASSWORD`。

### 2. 后端

```bash
cd server
./mvnw spring-boot:run
# Windows: mvnw.cmd spring-boot:run
```

服务：`http://localhost:8080`

演示账号：`admin` / `password123`

### 3. 前端

```bash
cd web
npm install
npm run dev
```

Vite 将 `/api` 代理到 `http://localhost:8080`。

更多 API 与配置说明见 [server/README.md](server/README.md)。
