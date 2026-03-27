# 智能头盔 uni-app 项目使用说明

## ✅ 已完成的工作

我已经在 `intelligent-helmet-app` 项目中创建了所有业务代码：

### 创建的文件：

1. **WebSocket 连接**
   - `composables/useWebSocket.js` - WebSocket 实时通信逻辑

2. **页面文件**
   - `pages/index/index.vue` - 首页（传感器数据展示）
   - `pages/twin/twin.vue` - 数字孪生（2D 可视化）
   - `pages/data/data.vue` - 数据监控（历史记录）

3. **配置文件**
   - `pages-helmet.json` - 简化的页面配置

## 🚀 如何运行

### 方法一：使用新配置（推荐）

1. **备份原配置**
   - 在 HBuilderX 中，将 `pages.json` 重命名为 `pages.json.bak`

2. **使用新配置**
   - 将 `pages-helmet.json` 重命名为 `pages.json`

3. **运行项目**
   - 点击 HBuilderX 工具栏的运行按钮
   - 选择：`运行` → `运行到浏览器` → `Chrome`

### 方法二：手动修改配置

在 HBuilderX 中打开 `pages.json`，替换为以下内容：

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "智能头盔"
      }
    },
    {
      "path": "pages/twin/twin",
      "style": {
        "navigationBarTitleText": "数字孪生"
      }
    },
    {
      "path": "pages/data/data",
      "style": {
        "navigationBarTitleText": "数据监控"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "white",
    "navigationBarTitleText": "智能头盔",
    "navigationBarBackgroundColor": "#1a1a2e",
    "backgroundColor": "#0f0f1e"
  },
  "tabBar": {
    "color": "#7A7E83",
    "selectedColor": "#00D9FF",
    "borderStyle": "black",
    "backgroundColor": "#1a1a2e",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页"
      },
      {
        "pagePath": "pages/twin/twin",
        "text": "数字孪生"
      },
      {
        "pagePath": "pages/data/data",
        "text": "数据"
      }
    ]
  }
}
```

## 📋 运行步骤总结

1. ✅ 打开 HBuilderX
2. ✅ 打开项目：`D:\嵌入式\1\amqp-demo\intelligent-helmet-app`
3. ⬜ 修改 `pages.json`（使用上面的配置）
4. ⬜ 点击运行 → 运行到浏览器 → Chrome
5. ⬜ 查看效果

## 🔧 配置 WebSocket 地址

如果你的后端服务不在 `localhost:8082`，需要修改以下文件中的 `WS_URL`：

- `pages/index/index.vue` (第 17 行)
- `pages/twin/twin.vue` (第 17 行)
- `pages/data/data.vue` (第 17 行)

将：
```javascript
const WS_URL = 'ws://localhost:8082/ws/sensor-data'
```

改为你的实际地址。

## 📱 预期效果

运行成功后，你会看到：

- **底部导航栏**：三个标签（首页、数字孪生、数据）
- **首页**：
  - 连接状态指示器
  - 温度、湿度卡片
  - GPS 位置显示
  - 姿态角度（Roll、Pitch、Yaw）
  - 跌倒警告（如果检测到）
  - 实时地图

- **数字孪生**：
  - 头盔状态卡片
  - 温度计可视化
  - 湿度计可视化
  - 姿态角度进度条
  - GPS 地图

- **数据监控**：
  - 实时数据流列表
  - 历史记录
  - 清空按钮

## ❓ 常见问题

### 1. 运行时报错找不到页面

**原因**：`pages.json` 配置未更新

**解决**：按照上面的方法修改 `pages.json`

### 2. WebSocket 连接失败

**原因**：后端服务未启动或地址不正确

**解决**：
- 确保后端服务运行在 `localhost:8082`
- 或修改 `WS_URL` 为正确的地址

### 3. 地图不显示

**原因**：需要配置地图 key（仅 App 端）

**解决**：H5 端不需要配置，直接可用

## 🎯 下一步

1. 修改 `pages.json`
2. 运行项目
3. 查看效果
4. 如果有问题，告诉我具体的错误信息

祝你成功运行！🎉
