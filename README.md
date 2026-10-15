# campus-forum

校园普通论坛 monorepo。

| 目录 | 说明 | 原仓库 |
|---|---|---|
| `web/` | React + Vite 前端 | [campus-forum-web](https://github.com/zhic60130-crypto/campus-forum-web) |
| `server/` | Spring Boot 后端 | [campus-forum-server](https://github.com/zhic60130-crypto/campus-forum-server) |

## 本地启动

### 1. 依赖服务（MySQL + Redis + MinIO）

后端默认使用 **`dev`** profile（对接本机 Docker 中的 MySQL、Redis、MinIO）。请先启动：

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

#### Spring Profile 一键切换

| Profile | 用途 |
|---|---|
| `dev`（默认） | 开发栈：MySQL + Redis + MinIO（`application-dev.yml`） |
| `prod` | 生产部署：配置项由环境变量注入（`application-prod.yml`） |
| `local` | 免 Docker：H2 文件库 + 内存互动 + 本地上传 |
| `mysql` | **兼容别名**，通过 profile 组等价于 `dev` |

```bash
# 默认即为 dev，无需额外参数
./mvnw spring-boot:run

# 生产配置（需设置环境变量，见 server/README.md）
SPRING_PROFILES_ACTIVE=prod ./mvnw spring-boot:run

# H2 快捷模式
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
# 或：SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run

# 仍可使用旧名称 mysql（与 dev 相同）
./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql
```

也可在运行前设置环境变量：`export SPRING_PROFILES_ACTIVE=dev|prod|local`

### 3. 前端

```bash
cd web
npm install
npm run dev
```

Vite 将 `/api` 代理到 `http://localhost:8080`。

更多 API 与配置说明见 [server/README.md](server/README.md)。
