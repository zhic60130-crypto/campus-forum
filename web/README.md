# Forum · 校园普通论坛（React）

React + Vite + TypeScript + Tailwind + shadcn/ui。数据层对接 Spring Boot 后端 `campus-forum-server`。

## 启动

1. 后端（默认 `dev` profile / MySQL 栈，需先 `docker compose up -d`，见仓库根目录 README）：

```bash
cd ../server
./mvnw spring-boot:run
# Windows: mvnw.cmd spring-boot:run
# 无 Docker：mvnw spring-boot:run -Dspring-boot.run.profiles=local
# 生产：SPRING_PROFILES_ACTIVE=prod（见 server/README.md 环境变量）
```

2. 前端：

```bash
npm install
npm run dev
```

Vite 将 `/api` 代理到 `http://localhost:8080`。

演示账号：`admin` / `password123`（另有 `pixel`、`nova`）。

## 结构

- `src/api/` 真实 HTTP 门面
- `src/lib/http.ts` Axios 信封解包与 JWT
- `src/stores/auth.ts` 登录态（localStorage）
- `src/mocks/` / `src/repositories/` 仅作对照，运行时不再使用
