# campus-forum-server

普通论坛后端（Spring Boot 3 + JWT + MyBatis-Plus + Redis/MinIO）。对齐柏码 JWT 论坛方案，**不含**教务/天气等扩展。

## 推荐启动（MySQL + Redis + MinIO）

默认 Spring profile 是 `mysql`。在本目录（monorepo 的 `server/`）先起 Compose，再启动应用。

前置条件：Docker（Compose v2）、JDK 17。

```bash
docker compose up -d
./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql
```

Windows：`mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql`

`src/main/resources/application.yml` 中 `spring.profiles.active` 已是 `mysql`，因此 `./mvnw spring-boot:run` 同样使用该 profile。MySQL 首次初始化会装入 `sql/schema.sql` 与 `sql/data.sql`，等容器健康后再启动后端。

服务：`http://localhost:8080`

### 端口与凭据

| 组件 | 地址 | 凭据 |
|---|---|---|
| MySQL | `127.0.0.1:3306`，库 `campus_forum` | 应用用户 `forum` / `forum123`；root / `root` |
| Redis | `127.0.0.1:6379` | 无密码 |
| MinIO | API `http://127.0.0.1:9000`，控制台 `http://127.0.0.1:9001` | `minioadmin` / `minioadmin`，桶 `campus-forum` |

### 演示账号

| 用户名 | 密码 | 角色 |
|---|---|---|
| admin | password123 | ADMIN |
| pixel / nova | password123 | USER |

## 可选：H2（`local` profile）

无 Docker 时使用 H2 文件库、内存互动存储和本地上传目录（`./uploads`）。该 profile 关闭 Redis 自动配置。

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Windows：`mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local`

H2 控制台：`http://localhost:8080/h2-console`（JDBC `jdbc:h2:file:./data/campus_forum`，用户 `sa`，密码为空）。

## 主要 API

- `POST /api/auth/login` `POST /api/auth/register` `GET /api/auth/me`
- `GET /api/topics` `POST /api/topics` `GET /api/topics/{id}`
- `GET|POST /api/topics/{id}/comments`
- `POST /api/interact/topic/{id}/like|favorite`
- `GET /api/banners` / `CRUD /api/admin/banners`
- `POST /api/image/upload`

统一响应：`{ success, code, message, data }`
