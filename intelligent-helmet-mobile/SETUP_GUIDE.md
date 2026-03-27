# uni-app 项目创建和运行指南

## 当前状态

我已经创建了一个 uni-app 项目的基础结构，包含了所有的业务代码：
- ✅ WebSocket 连接逻辑
- ✅ 三个页面（首页、数字孪生、数据监控）
- ✅ 传感器数据展示
- ✅ GPS 地图集成

但是由于缺少 uni-app 的核心依赖文件，无法直接通过命令行启动。

## 推荐方案：使用 HBuilderX（最简单）

### 步骤 1：下载 HBuilderX

访问：https://www.dcloud.io/hbuilderx.html

下载 **标准版**（包含 uni-app 插件）

### 步骤 2：创建新项目

1. 打开 HBuilderX
2. 文件 → 新建 → 项目
3. 选择 **uni-app**
4. 选择 **默认模板（Vue 3）**
5. 项目名称：`intelligent-helmet-app`
6. 点击创建

### 步骤 3：复制业务代码

将我创建的以下文件复制到新项目中：

```bash
# 从 intelligent-helmet-mobile 复制到 intelligent-helmet-app

# 1. 复制页面
src/pages/index/index.vue  → pages/index/index.vue
src/pages/twin/twin.vue    → pages/twin/twin.vue
src/pages/data/data.vue    → pages/data/data.vue

# 2. 复制 WebSocket 逻辑
src/composables/useWebSocket.js → composables/useWebSocket.js

# 3. 复制配置文件
src/pages.json    → pages.json
src/manifest.json → manifest.json
src/uni.scss      → uni.scss

# 4. 更新 App.vue
src/App.vue → App.vue
```

### 步骤 4：运行项目

在 HBuilderX 中：
- 运行 → 运行到浏览器 → Chrome（H5 版本）
- 运行 → 运行到手机或模拟器（App 版本）

## 备选方案：修复当前项目

如果你想继续使用命令行方式，需要补充缺失的文件：

### 方法 1：使用官方 CLI 工具

```bash
# 安装 uni-app CLI
npm install -g @dcloudio/uvm
uvm

# 创建项目
npx degit dcloudio/uni-preset-vue#vite intelligent-helmet-app
cd intelligent-helmet-app
npm install

# 然后复制业务代码
```

### 方法 2：手动补充文件

需要从 uni-app 官方仓库下载以下文件：
- `node_modules/@dcloudio/vite-plugin-uni/lib/ssr/entry-server.js`
- 其他核心依赖文件

这个过程比较复杂，不推荐。

## 快速对比

| 方式 | 难度 | 时间 | 推荐度 |
|------|------|------|--------|
| HBuilderX | ⭐ 简单 | 10 分钟 | ⭐⭐⭐⭐⭐ |
| 官方 CLI | ⭐⭐ 中等 | 20 分钟 | ⭐⭐⭐ |
| 手动修复 | ⭐⭐⭐⭐ 困难 | 1 小时+ | ⭐ |

## 我的建议

**强烈推荐使用 HBuilderX**，原因：
1. 开箱即用，无需配置
2. 内置模拟器和真机调试
3. 云打包功能（无需配置 Android/iOS 环境）
4. 可视化界面，适合开发
5. 官方支持，稳定性好

## 已创建的文件位置

所有业务代码都在：
```
D:\嵌入式\1\amqp-demo\intelligent-helmet-mobile\src\
```

你可以直接复制这些文件到 HBuilderX 创建的新项目中。

## 下一步

1. 下载并安装 HBuilderX
2. 创建新的 uni-app 项目
3. 复制我创建的业务代码
4. 运行项目

如果你需要我帮助你完成任何步骤，请告诉我！
