# campus-forum-server

> 仓库总览、双端启动与 Profile 说明见根目录 [README.md](../README.md)。

普通论坛后端（Spring Boot 3 + JWT + MyBatis-Plus + Redis/MinIO）。对齐柏码 JWT 论坛方案，**不含**教务/天气等扩展。

## 本地快速启动（推荐）

默认 `local` 配置：H2 文件库 + 内存互动存储 + 本地上传目录，无需 Docker。

```bash
cd server
./mvnw spring-boot:run
# Windows: mvnw.cmd spring-boot:run
```

服务：`http://localhost:8080`（Spring Boot 默认端口 **8080**，见 `application.yml` 的 `server.port`）

演示账号：

| 用户名 | 密码 | 角色 |
|---|---|---|
| admin | password123 | ADMIN |
| pixel / nova | password123 | USER |

## MySQL + Redis + MinIO

```bash
docker compose up -d
./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql
```

## 主要 API

- `POST /api/auth/login` `POST /api/auth/register` `GET /api/auth/me`
- `GET /api/topics` `POST /api/topics` `GET /api/topics/{id}`
- `GET|POST /api/topics/{id}/comments`
- `POST /api/interact/topic/{id}/like|favorite`
- `GET /api/banners` / `CRUD /api/admin/banners`
- `POST /api/image/upload`

统一响应：`{ success, code, message, data }`
