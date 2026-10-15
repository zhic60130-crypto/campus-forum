# campus-forum-server

普通论坛后端（Spring Boot 3 + JWT + MyBatis-Plus + Redis/MinIO）。对齐柏码 JWT 论坛方案，**不含**教务/天气等扩展。

## 配置与 Profile

| 文件 | Profile | 说明 |
|---|---|---|
| `application.yml` | （公共） | 应用名、端口、MyBatis 公共项；默认 `spring.profiles.active=dev` |
| `application-dev.yml` | `dev` | 本地开发：MySQL + Redis + MinIO（与 `docker-compose.yml` 默认账号一致） |
| `application-prod.yml` | `prod` | 生产：敏感项仅 `${ENV}`，日志收敛，关闭 H2 console |
| `application.yml`（`---` 段） | `local` | H2 文件库，无需 Docker |

**兼容**：`mysql` 为 profile 组别名，激活时自动包含 `dev`（与原先默认 `mysql` 行为一致）。

### 本地快速启动（默认 dev）

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

### 切换 Profile

```bash
# dev（默认）
./mvnw spring-boot:run

# prod
SPRING_PROFILES_ACTIVE=prod ./mvnw spring-boot:run
# 或 Maven：
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod

# local（无 Docker）
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# 兼容旧文档中的 mysql
./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql
```

环境变量方式：`export SPRING_PROFILES_ACTIVE=dev|prod|local|mysql`

### 开发用连接信息（dev / mysql）

`application-dev.yml` 默认（仅本地，勿用于生产）：

- JDBC：`jdbc:mysql://127.0.0.1:3306/campus_forum`（用户 `forum` / `forum123`）
- Redis：`127.0.0.1:6379`
- MinIO：`http://127.0.0.1:9000`，`minioadmin` / `minioadmin`，桶 `campus-forum`

### 生产环境变量（`prod` profile 必填）

| 变量 | 说明 |
|---|---|
| `SPRING_DATASOURCE_URL` | MySQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | 数据库用户 |
| `SPRING_DATASOURCE_PASSWORD` | 数据库密码 |
| `REDIS_HOST` | Redis 主机 |
| `FORUM_JWT_SECRET` | JWT 签名密钥（建议 ≥32 字节） |
| `FORUM_CORS_ALLOWED_ORIGINS` | 允许的前端 Origin（逗号分隔） |
| `FORUM_UPLOAD_PUBLIC_BASE_URL` | 上传文件对外访问基址 |
| `FORUM_MINIO_ENDPOINT` | MinIO API 地址 |
| `FORUM_MINIO_ACCESS_KEY` | MinIO access key |
| `FORUM_MINIO_SECRET_KEY` | MinIO secret key |
| `FORUM_MINIO_BUCKET` | MinIO 桶名 |

可选：

| 变量 | 默认 |
|---|---|
| `REDIS_PORT` | `6379` |
| `REDIS_PASSWORD` | 空 |
| `FORUM_JWT_EXPIRE_HOURS` | `24` |
| `FORUM_UPLOAD_MODE` | `minio` |
| `FORUM_UPLOAD_LOCAL_DIR` | `./uploads` |

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
