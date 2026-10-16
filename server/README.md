# campus-forum-server

普通论坛后端（Spring Boot 3 + JWT + MyBatis-Plus + MySQL + Redis + MinIO）。对齐柏码 JWT 论坛方案，**不含**教务/天气等扩展。

## 本地快速启动

本机开发固定使用 **MySQL**，请先启动依赖再跑后端：

```bash
cd server
docker compose up -d
./mvnw spring-boot:run
# Windows: mvnw.cmd spring-boot:run
```

服务：`http://localhost:8080`

演示账号（`sql/data.sql` 初始化，密码均为 `password123`）：

| 用户名 | 密码 | 角色 |
|---|---|---|
| admin | password123 | ADMIN |
| pixel / nova | password123 | USER |

### 开发用连接信息（仅本地）

默认在 `application.yml` 中（与 `docker-compose.yml` 一致，可用环境变量覆盖）：

| 项 | 默认值 |
|---|---|
| MySQL | `127.0.0.1:3306` / 库 `campus_forum` / `forum` / `forum123` |
| Redis | `127.0.0.1:6379` |
| MinIO | `http://127.0.0.1:9000`，`minioadmin` / `minioadmin`，桶 `campus-forum` |

生产环境请通过环境变量或外部配置覆盖，勿将真实密钥提交仓库。

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
