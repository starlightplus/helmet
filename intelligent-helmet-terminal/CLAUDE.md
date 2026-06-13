# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在本仓库中处理代码时提供指引。

## 仓库布局

本仓库为单体仓库（monorepo），包含 `D:\嵌入式\1\amqp-demo\` 下的三个子项目：

| 目录 | 角色 | 端口 |
|---|---|---|
| `intelligent-helmet-terminal/` | Spring Boot 后端（当前目录） | 8082 |
| `intelligent-helmet-vue/` | Vue 3 Web 前端 | 5173 |
| `intelligent-helmet-app/` | uni-app 移动客户端 | — |

---

## 后端（`intelligent-helmet-terminal/`）

### 命令

```bash
mvn spring-boot:run          # 在 8082 端口启动开发服务器
mvn clean package            # 构建 JAR 包
mvn test                     # 运行所有测试
mvn test -Dtest=ClassName    # 运行单个测试类
```

### 架构

**数据流：** 华为 IoT 云（通过 Qpid JMS 的 AMQP 1.0）→ `ApplicationAMQPJavaDemo.java`（消息监听器）→ `SensorDataService`（内存缓存）→ WebSocket 广播至客户端 + 每 10 秒异步写入数据库。

**内存缓存**（`SensorDataService`）：
- `latestDataMap`：每个 deviceId 仅保留一条最新记录
- `deviceDataMap`：环形缓冲区，每个设备最多 1000 条记录
- 通过 `SensorDataPersistService` 中的 `@Async` 对数据库写入进行限流（10 秒防抖）

**跌倒检测流程：** `SensorDataService` 检测到 `fallFlag=1` → `EmailAlertService`（5 分钟冷却期）→ 获取紧急联系人 → 反向地理编码 GPS → 通过阿里云 SMTP 发送包含严重程度和静态地图链接的邮件。

**主要包：**
- `config/` — JWT 过滤器、Spring Security、WebSocket 端点注册
- `controller/` — REST 端点（认证、传感器、设备状态、导航、用户数据、聊天）
- `service/` — 业务逻辑；`ClaudeService` 集成了 DeepSeek AI 用于聊天
- `websocket/SensorDataWebSocketHandler.java` — 向所有已连接的 WebSocket 客户端广播 JSON 帧

**数据库：** MySQL `intelligent_helmet`（开发环境也支持 H2）。JPA/Hibernate 管理 schema。核心表：`sensor_data`、`device_status`、`user`、`user_profile`、`emergency_contact`、`ride_session`、`chat_message`。

**认证：** Spring Security + JWT（有效期 24 小时，前端存储在 `sessionStorage` 中）。GitHub OAuth2 由 `GitHubOAuthController` 处理。

**SensorData 字段：** `deviceId, temperature, humidity, longitude, latitude, roll, pitch, yaw, avm, gvm, fallFlag, slowFlag, receiveTime`

---

## 前端（`intelligent-helmet-vue/`）

### 命令

```bash
npm install      # 安装依赖
npm run dev      # 开发服务器 → http://localhost:5173
npm run build    # 生产构建 → dist/
npm run lint     # ESLint + 自动修复
npm run format   # Prettier 格式化
```

### 架构

**代理**（vite.config.js）：`/api` → `http://localhost:8082`，以及 `/baidumap`、`/gaodemap`、`/qweather` 到外部 API。所有 axios 请求都通过 `src/utils/request.js`，它会从 `sessionStorage` 中注入 JWT 头。

**状态管理：** `src/stores/` 中的 Pinia store — `user.js`、`userProfile.js`、`rideplan.js`、`rideHistory.js`、`planHistory.js`。

**实时数据：** `src/composables/useWebSocket.js` 连接到 `ws://localhost:8082/ws/sensor-data` 并接收传感器更新。`src/composables/useRideTracking.js` 累积 GPS 点。

**数字孪生**（`src/components/HelmetTwin.vue`）：全屏高德 3D 地图，包含三层轨迹线（发光层/主轨迹层/方向箭头层）、姿态仪表（用 canvas 绘制的 Roll/Pitch/AVM/GVM 仪表），地图旋转与 `yaw` 同步。地图俯仰角固定为 62°。

**路由**（`src/router/index.js`）：11 条路由，由 `src/router/guards.js` 守卫（JWT 校验）。未认证用户重定向到 `/auth`。

**API 基础 URL：** `http://localhost:8082` 定义在 `src/utils/request.js` 中。

---

## 环境变量 / 凭证

凭证位于 `src/main/resources/application.properties` 中 — 不要提交会暴露它们的变更。主要外部服务：
- **华为 IoT 云** — 用于接收设备遥测数据的 AMQP 端点
- **阿里云 SMTP** — 跌倒检测时的邮件警报
- **DeepSeek API** — AI 聊天后端（`ClaudeService`）
- **GitHub OAuth** — 社交登录
- **高德地图 key：** `9f6c5a83a18e12a03b675b63877fb8e2`（Web JS API 平台）
- **百度地图 key：** `C81uBynkCqbFp9suE5SZF50pEzlsCyNM`