@echo off
chcp 65001 >nul
echo ======================================
echo 复制业务代码到 HBuilderX 项目
echo ======================================
echo.

set SOURCE=D:\嵌入式\1\amqp-demo\intelligent-helmet-mobile\src
set TARGET=D:\嵌入式\1\amqp-demo\intelligent-helmet-app

echo 正在复制文件...
echo.

REM 复制页面
echo [1/6] 复制首页...
xcopy "%SOURCE%\pages\index\index.vue" "%TARGET%\pages\index\" /Y /I

echo [2/6] 复制数字孪生页面...
if not exist "%TARGET%\pages\twin" mkdir "%TARGET%\pages\twin"
xcopy "%SOURCE%\pages\twin\twin.vue" "%TARGET%\pages\twin\" /Y /I

echo [3/6] 复制数据监控页面...
if not exist "%TARGET%\pages\data" mkdir "%TARGET%\pages\data"
xcopy "%SOURCE%\pages\data\data.vue" "%TARGET%\pages\data\" /Y /I

REM 复制 composables
echo [4/6] 复制 WebSocket 逻辑...
if not exist "%TARGET%\composables" mkdir "%TARGET%\composables"
xcopy "%SOURCE%\composables\useWebSocket.js" "%TARGET%\composables\" /Y /I

REM 复制配置文件
echo [5/6] 复制配置文件...
xcopy "%SOURCE%\pages.json" "%TARGET%\" /Y
xcopy "%SOURCE%\manifest.json" "%TARGET%\" /Y
xcopy "%SOURCE%\uni.scss" "%TARGET%\" /Y

REM 复制 App.vue
echo [6/6] 复制 App.vue...
xcopy "%SOURCE%\App.vue" "%TARGET%\" /Y

echo.
echo ======================================
echo 复制完成！
echo ======================================
echo.
echo 下一步：
echo 1. 在 HBuilderX 中打开项目：intelligent-helmet-app
echo 2. 点击 运行 → 运行到浏览器 → Chrome
echo.
pause
