# 导航页面全面优化计划

## 目标
将 HelmetTwin.vue 的导航体验从"功能可用"提升到"专业骑行导航"水准，覆盖 7 个优化项。

## 现有架构理解
- `HelmetTwin.vue` 接收 `sensorData` prop（含 GPS、姿态、速度等）
- `useRideTracking.js` 已有 `currentSpeed`、`avgSpeed`、`rideDistance` 等计算
- 但 HelmetTwin 目前未引入 useRideTracking，速度数据未在导航中使用
- 导航路线使用高德 REST API 骑行规划，返回 steps + polyline

## 优化方案

### P0-1: 导航 HUD 卡片重设计
将当前单行 `.nav-instruction-bar` 改为双层卡片布局：
- 上层：大方向图标(28px) + 距离 + 指令文字（两行）
- 下层：目的地名 | 剩余总距离 | 预计时间
- 居中定位，max-width: 420px，圆角毛玻璃背景
- 方向图标用更丰富的 SVG（直行/左转/右转/到达）

### P0-2: 导航模式自动折叠侧面板
- 新增 computed: `navMinimized` = navActive 时为 true
- 侧面板加 transition，navActive 时缩为一个 40x40 的悬浮圆球（显示姿态颜色状态）
- 点击圆球可临时展开查看完整面板
- 给 `.side-panel` 加 `v-if/class` 控制

### P1-1: 底部导航摘要栏
- 新增 `.nav-bottom-bar` 固定在地图底部
- 三格布局：剩余距离 | 预计到达时间(ETA) | 当前速度
- ETA 计算：用 sensorData 实时速度 + 剩余距离估算
- 速度来源：直接从 sensorData 中取（或从 trackPoints 最近两点算）

### P1-2: 导航路线三层 + 已走段灰化
- 导航橙色路线改为三层（同轨迹线做法）：
  - 底层发光：strokeWeight 12, opacity 0.12, #f97316
  - 主线：strokeWeight 4, #f97316, opacity 0.9
  - 方向层：showDir true, 虚线
- 新增 `navPolylinePassed`：已走过的段用灰色半透明显示
- 裁剪逻辑同时更新 passed 和 remaining 两条线

### P2-1: 规划面板改为底部 Sheet
- `.nav-drawer` 从左侧全高改为底部弹出
- position: absolute; bottom: 0; left: 0; right: 0; max-height: 55vh
- 顶部加拖拽条（视觉指示，不需真正拖拽）
- 圆角顶部，内容滚动
- transition 改为从下往上滑入

### P2-2: 状态过渡动画
- 导航开始时：侧面板 0.4s 缩为圆球、HUD 卡片从上淡入下滑、底部栏从下滑入
- 导航结束时：反向动画恢复
- 地图视角过渡：导航开始时 fitView 路线，1.5s 后平滑切回跟随模式

### P3: 接近转弯时自动 Zoom
- watch navRemainDist：< 100m 时 zoom → 20, pitch → 70°
- > 200m 时恢复 zoom 18, pitch 62°
- 用 `amap.setZoom` + `amap.setPitch` 带动画参数

## 实现顺序
1. 修改模板结构（HUD卡片、底部栏、面板改底部sheet、侧面板折叠）
2. 修改 script（ETA计算、速度获取、zoom逻辑、路线三层+灰化）
3. 修改 style（新组件样式、动画、响应式）

## 文件变更
- `intelligent-helmet-vue/src/components/digital-twin/HelmetTwin.vue`（主文件，全部改动集中于此）

## 风险
- 无破坏性变更，所有改动在单文件内
- 不引入新依赖
- 保持现有 props 接口不变
