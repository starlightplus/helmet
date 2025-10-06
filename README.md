# 一、项目简介
## 1.项目介绍
灵盔佑驰终端是一个基于物联网技术的数据监控系统，专门用于实时收集、处理和展示智能头盔设备的传感器数据。该系统通过ESP01S WiFi模块将单片机采集的环境数据和状态信息通过MQTT协议上传至华为云IoTDA平台，再通过AMQP协议将数据转发到后端服务进行处理，最终通过现代化的Web界面实时展示给用户。
## 2.技术架构
### (1)硬件层
数据采集设备：智能头盔内置传感器（温度、湿度、GPS）
通信模块：ESP01S WiFi模块
通信协议：MQTT协议
### (2)云平台层
IoT平台：华为云IoTDA
数据转发协议：AMQP协议
### (3)后端技术栈
开发框架：Spring Boot 2.7.18
消息处理：Apache Qpid JMS Client（用于接收AMQP消息）
数据处理：Jackson（JSON数据解析）
实时通信：WebSocket（向Web前端实时推送数据）
构建工具：Maven
运行环境：Java 8+
### (4)前端技术栈
核心语言：HTML5, CSS3, JavaScript (ES6+)
UI框架：原生CSS，无额外框架依赖
地图服务：百度地图API
实时通信：WebSocket（接收后端实时数据）
数据可视化：原生JavaScript图表展示
### (5)系统工作流程
- 数据采集
智能头盔上的传感器实时采集环境数据（温度、湿度、GPS）和状态信息（跌倒、减速、左转、右转）
- 数据上传
通过ESP01S WiFi模块使用MQTT协议将数据上传到华为云IoTDA平台
- 云端处理
华为云IoTDA平台接收并处理设备数据
数据转发：通过配置的AMQP协议将数据转发到后端Spring Boot应用
- 后端处理
Spring Boot应用接收AMQP消息，解析数据并存储
- 实时推送
通过WebSocket将处理后的数据实时推送到Web前端
- 前端展示
Web界面实时显示传感器数据、设备状态和位置信息
# 二、编译与运行
## 1.运行后端WebSocket服务
### 1.1 停止当前服务
```powershell
Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*AmqpDemo*"} | Stop-Process -Force
```
### 1.2 进入项目目录
```powershell
cd intelligent-helmet-terminal
```
### 1.3 清理并编译项目
```powershell
mvn clean compile
```
### 1.4 运行项目
```powershell
mvn spring-boot:run
```

## 2.运行前端Vue应用
### 2.1 进入Vue项目目录
```powershell
cd intelligent-helmet-vue
```
### 2.2 安装依赖（可选）
```powershell
npm install
```
### 2.3 启动服务
```powershell
npm run dev
```
### 2.4 打开浏览器
按照提示信息打开对应浏览器
# 三、退出程序
### 1.终端中终止 Spring Boot 进程
直接`Ctrl+C`或者终端输入:
```powershell
Get-Process -Name "java" | Where-Object {$_.CommandLine -like "*AmqpDemo*"} | Stop-Process -Force
```
### 2.确认端口已释放
```powershell
netstat -ano | findstr :8081
```
markdown
# 四、Gitee基础操作

## 1. 从Gitee拉取项目

### 1.1 删除本地项目（可选）
如果本地已存在同名项目，需要先删除：
```powershell   
Remove-Item -Recurse -Force intelligent-helmet-terminal
```
### 1.2 克隆项目到本地
```powershell 
git clone https://gitee.com/h_starlight/intelligent-helmet-terminal.git
```

## 2. 项目上传到Gitee

### 2.1 删除旧的远程仓库（可选）
```powershell
git remote remove "远程仓库名称"
```
示例：
`git remote remove origin`
### 2.2 清空暂存区（可选）
```powershell
git reset
```
### 2.3 添加远程仓库
```powershell
git remote add origin https://gitee.com/h_starlight/intelligent-helmet-terminal.git
```

### 2.4 验证远程仓库配置
```powershell
git remote -v
```
正常显示结果：
```powershell

origin https://gitee.com/h_starlight/intelligent-helmet-terminal.git (fetch)
origin https://gitee.com/h_starlight/intelligent-helmet-terminal.git (push)

```

### 2.5 添加文件到暂存区
```powershell
git add .
```
### 2.6 提交到本地仓库
```powershell
git commit -m "提交说明"
```

### 2.7 推送到远程仓库
```powershell
git push -u origin main
```
### 2.8 推送冲突解决方案
如果出现以下错误：
```powershell
! [rejected] main -> main (non-fast-forward)
error: failed to push some refs to 'https://gitee.com/h_starlight/intelligent-helmet-terminal.git'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. If you want to integrate the remote changes,
hint: use 'git pull' before pushing again.
```
- **问题原因**
远程仓库的main分支已有内容，本地分支落后于远程分支。

- **解决方案**
强制推送（用本地内容覆盖远程）
`git push -u origin main --force`

