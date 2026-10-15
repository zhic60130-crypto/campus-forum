# campus-forum

校园普通论坛 monorepo。

| 目录 | 说明 | 原仓库 |
|---|---|---|
| `web/` | React + Vite 前端 | [campus-forum-web](https://github.com/zhic60130-crypto/campus-forum-web) |
| `server/` | Spring Boot 后端 | [campus-forum-server](https://github.com/zhic60130-crypto/campus-forum-server) |

## 本地启动

### 1. 依赖服务（MySQL + Redis + MinIO）

后端默认使用 `mysql` profile，需要先启动 Docker 中的基础设施（仅本地开发用默认账号，勿用于生产）：

```bash
cd server
docker compose up -d
```

| 服务 | 端口 | 开发默认账号 |
|---|---|---|
| MySQL | 3306 | 库 `campus_forum`，用户 `forum` / `forum123` |
| Redis | 6379 | 无密码 |
| MinIO | 9000（API）、9001（控制台） | `minioadmin` / `minioadmin` |

首次 `docker compose up` 会通过 `server/sql/schema.sql` 与 `data.sql` 初始化库表与演示数据。

### 2. 后端

```bash
cd server
chmod +x mvnw   # 若尚未可执行
./mvnw spring-boot:run
# Windows: mvnw.cmd spring-boot:run
```

服务：`http://localhost:8080`

演示账号：`admin` / `password123`

**临时使用 H2 文件库（无需 Docker）**：内存互动 + 本地上传，适合快速试跑：

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
# 或环境变量：SPRING_PROFILES_ACTIVE=local
```

### 3. 前端

```bash
cd web
npm install
npm run dev
```

Vite 将 `/api` 代理到 `http://localhost:8080`。

更多 API 与配置说明见 [server/README.md](server/README.md)。
