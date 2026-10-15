# campus-forum-server

普通论坛后端（Spring Boot 3 + JWT + MyBatis-Plus + Redis/MinIO）。对齐柏码 JWT 论坛方案，**不含**教务/天气等扩展。

## 本地快速启动（默认 MySQL）

默认 `mysql` profile：连接本机 MySQL、Redis，图片上传走 MinIO。请先启动依赖：

```bash
cd server
docker compose up -d
./mvnw spring-boot:run
# Windows: mvnw.cmd spring-boot:run
```

服务：`http://localhost:8080`

演示账号（由 `sql/data.sql` 或 H2 种子写入，密码均为 `password123`）：

| 用户名 | 密码 | 角色 |
|---|---|---|
| admin | password123 | ADMIN |
| pixel / nova | password123 | USER |

### 开发用连接信息（仅本地）

`application.yml` 中 `mysql` profile 默认：

- JDBC：`jdbc:mysql://127.0.0.1:3306/campus_forum`（用户 `forum` / `forum123`，与 `docker-compose.yml` 一致）
- Redis：`127.0.0.1:6379`
- MinIO：`http://127.0.0.1:9000`，`minioadmin` / `minioadmin`，桶 `campus-forum`

生产环境请通过环境变量或外部配置覆盖，勿将真实密钥提交仓库。

### 回退：H2 本地模式（无 Docker）

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

`local` profile：H2 文件库（`./data/campus_forum`）、禁用 Redis 自动配置、互动走内存、上传走 `./uploads`。

### 冒烟验证

```bash
curl -s http://localhost:8080/api/topics | head
curl -s http://localhost:8080/api/meta/categories | head
```

## 主要 API

- `POST /api/auth/login` `POST /api/auth/register` `GET /api/auth/me`
- `GET /api/topics` `POST /api/topics` `GET /api/topics/{id}`
- `GET|POST /api/topics/{id}/comments`
- `POST /api/interact/topic/{id}/like|favorite`
- `GET /api/banners` / `CRUD /api/admin/banners`
- `POST /api/image/upload`

统一响应：`{ success, code, message, data }`
