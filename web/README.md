# Forum · 校园普通论坛（React）

React + Vite + TypeScript + Tailwind + shadcn/ui。数据层对接 Spring Boot 后端（monorepo 的 `server/`）。

## 启动

后端默认 profile 是 `mysql`（MySQL + Redis + MinIO）。在仓库根目录：

```bash
cd server
docker compose up -d
./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql
```

无 Docker 时，在 `server/` 使用 H2：`./mvnw spring-boot:run -Dspring-boot.run.profiles=local`。端口、凭据与演示账号见仓库根目录 `README.md`。

前端（本目录）：

```bash
npm install
npm run dev
```

Vite 将 `/api` 代理到 `http://localhost:8080`。

演示账号：`admin` / `123456`（另有 `pixel`、`nova`）。

## 结构

- `src/api/` 真实 HTTP 门面
- `src/lib/http.ts` Axios 信封解包与 JWT
- `src/stores/auth.ts` 登录态（localStorage）
- `src/mocks/` / `src/repositories/` 仅作对照，运行时不再使用
