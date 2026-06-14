# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供在本仓库中处理代码时的指引。

## 命令

```bash
npm run dev       # 启动开发服务器（Vite，端口 5173）
npm run build     # 生产环境构建 → dist/
npm run preview   # 预览生产构建
npm run lint      # ESLint 自动修复
npm run format    # Prettier 格式化 src/
```

本项目未配置测试运行器。

## 架构概览

这是**智能骑行头盔系统**的 **Vue 3 前端**。通过 REST 和 WebSocket 连接 Java Spring Boot 后端（`http://localhost:8082`）。

### 数据流

```
后端（端口 8082）
  ├── REST /api/*         ← axios（src/utils/request.js，由 Vite 代理）
  └── WS /ws/sensor-data  ← useWebSocket.js（自动重连 + 心跳）
        └── SensorData：deviceId， temperature， humidity， longitude， latitude，
                        roll， pitch， yaw， avm， gvm， fallFlag， slowFlag， receiveTime
```

外部 API 也通过 Vite 代理：`/qweather`、`/baidumap`、`/gaodemap`。

### 关键架构模式

**Store（Pinia，`src/stores/`）** — 所有 store 均以用户为键（localStorage/sessionStorage 中使用用户名前缀），防止切换账户时数据泄露：
- `user.js` — 认证状态，sessionStorage 中的 token
- `userProfile.js` — 与 `/api/user/profile` 同步的个人资料；localStorage 作为回退
- `rideHistory.js` — 与 `/api/user/rides` 同步的骑行记录；最多 200 条骑行记录，每条最多 500 个轨迹点
- `rideplan.js` — 当前骑行计划 + 饮食限制
- `planHistory.js` — 仅存于 localStorage 的计划版本快照（最多 10 个）

**组合式函数（`src/composables/`）**：
- `useWebSocket.js` — 单例 WebSocket 连接；调用 `setOnSensorData()` / `setOnDeviceStatus()` 进行订阅
- `useRideTracking.js` — Haversine 距离、MET 卡路里、安全评分；速度 >100 km/h 被过滤为 GPS 漂移；零速度持续 1 分钟后自动结束骑行
- `useWeather.js` — 和风天气并行获取（当前/24小时/3天/预警/指数/分钟级）；30 分钟缓存

**HTTP（`src/utils/request.js`）** — 空的 baseURL（依赖代理）；自动注入 Bearer token；仅当响应体中包含“token”/“expired”时，401 重定向到 `/auth`。

### 路由（`src/router/index.js`）

需要认证的路由使用 `setupRouterGuards()`。管理员路由（`/admin`）还会检查 `admin` 角色。入口点 `/` 重定向到 `/auth`。

### HelmetTwin 组件（`src/components/HelmetTwin.vue`）

数字孪生是最复杂的组件 — 全屏高德（AMap）3D 地图，包含：
- 三层轨迹线（发光 + 主轨迹 + 方向箭头）
- 地图旋转锁定头盔偏航角（`amap.setRotation(-yaw)`）
- 浮动姿态仪表（通过 canvas 显示 Roll/Pitch/AVM/GVM）
- `loadInitialPosition()` 从 `/api/sensor/latest` 获取初始位置，设定地图中心

在实例化 AMap 插件之前，请使用 `AMap.plugin(['AMap.Buildings', ...])` — 直接 `new AMap.Buildings()` 而未事先加载插件会失败。

### 样式

Tailwind CSS + `clsx`/`tailwind-merge` 用于条件类。全局样式在 `src/style.css` 中。组件作用域样式使用 `<style scoped>`。

### 认证

JWT token 存储在 `sessionStorage` 中（非 localStorage — 关闭标签页即清除）。角色值：`"admin"` 可访问管理后台。