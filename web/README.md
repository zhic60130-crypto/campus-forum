# Forum · 校园普通论坛（React）

> 仓库总览、双端启动与 Profile 说明见根目录 [README.md](../README.md)。

React + Vite + TypeScript + Tailwind + shadcn/ui。数据层对接同 monorepo 下的 `server/` Spring Boot API。

## 启动

1. 后端（H2 local profile）：

```bash
cd ../server
./mvnw spring-boot:run
# Windows: mvnw.cmd spring-boot:run
```

2. 前端：

```bash
npm install
npm run dev
```

开发地址默认为 `http://127.0.0.1:5173`（Vite 默认端口 **5173**，本仓库未改 `vite.config.ts` 的 `server.port`）。Vite 将 `/api` 代理到 `http://localhost:8080`（Spring Boot 默认 **8080**）。

演示账号：`admin` / `password123`（另有 `pixel`、`nova`）。

## 结构

- `src/api/` 真实 HTTP 门面
- `src/lib/http.ts` Axios 信封解包与 JWT
- `src/stores/auth.ts` 登录态（localStorage）
- `src/mocks/` / `src/repositories/` 仅作对照，运行时不再使用
