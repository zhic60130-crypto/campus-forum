# campus-forum

校园普通论坛 monorepo。

| 目录 | 说明 | 原仓库 |
|---|---|---|
| `web/` | React + Vite 前端 | [campus-forum-web](https://github.com/zhic60130-crypto/campus-forum-web) |
| `server/` | Spring Boot 后端 | [campus-forum-server](https://github.com/zhic60130-crypto/campus-forum-server) |

## 本地启动

### 后端（H2 local）

```bash
cd server
./mvnw spring-boot:run
# Windows: mvnw.cmd spring-boot:run
```

服务：`http://localhost:8080`

演示账号：`admin` / `password123`

### 前端

```bash
cd web
npm install
npm run dev
```

Vite 将 `/api` 代理到 `http://localhost:8080`。
