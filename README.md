## getip

一个轻量的 Cloudflare Workers 开源项目：返回访问者的 IPv4/IPv6，并提供多种简洁 API，包括纯文本输出、请求头回显与健康检查。适合自建 IP 回显服务或作为示例 Worker 起点。

### 功能
- **JSON 输出**: 返回 `{ "IPv4": "", "IPv6": "" }`
- **纯文本输出**: 仅输出 IP，支持 v4/v6 指定
- **扩展信息**: 返回 UA、国家、Ray、ASN 等来自 Cloudflare 的请求元数据
- **请求头回显**: 方便调试代理/边缘网络
- **健康检查**: `200 OK` 轻量探活

### 在线演示
`https://getip.onm.workers.dev/`

### API 列表
- `GET /`：JSON 基础信息
  - 响应示例：
    ```json
    { "IPv4": "1.2.3.4", "IPv6": "" }
    ```
- `GET /plain?v=4|6`：纯文本，按查询参数返回 v4 或 v6；未指定时优先返回可用的 IP
- `GET /json`：带扩展元数据（`userAgent`, `country`, `ray`, `asn`, `app`）
- `GET /headers`：回显请求头（JSON）
- `GET /health`：健康检查

### 本地开发
1. 安装依赖
   ```bash
   npm i
   ```
2. 启动本地开发（使用 Miniflare）
   ```bash
   npm run dev
   ```

### 部署到 Cloudflare Workers
1. 安装 `wrangler`
   ```bash
   npm i -g wrangler
   ```
2. 配置 `wrangler.toml` 中的 `name` 和 `main`（默认已就绪）
3. 登录并部署
   ```bash
   wrangler login
   npm run deploy
   ```

### 端点返回示例
- `GET /json`
  ```json
  {
    "IPv4": "1.2.3.4",
    "IPv6": "",
    "userAgent": "Mozilla/5.0 ...",
    "country": "US",
    "ray": "abc",
    "asn": "13335",
    "app": "getip"
  }
  ```

### 配置
- `wrangler.toml`：Workers 配置
- `src/worker.ts`：主逻辑（TypeScript）
- `tests/worker.test.ts`：Vitest 单测

### 贡献
欢迎 issue/PR！请在提交前运行：
```bash
npm run lint && npx prettier --check . && npm test
```

### 许可证
MIT

