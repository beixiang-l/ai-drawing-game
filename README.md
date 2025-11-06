# AI 你画我猜网页游戏

这是一个基于 React + TypeScript + Node.js + Express + 阿里云百炼平台(Qwen-VL) 构建的你画我猜游戏。

## 功能特性

- HTML5 Canvas 绘图功能
- 阿里云百炼平台(Qwen-VL) 图像识别
- 响应式设计和现代化 UI
- 前后端分离架构

## 技术栈

- 前端：React + TypeScript + Vite
- 后端：Node.js + Express + TypeScript
- AI 集成：阿里云百炼平台(Qwen-VL)
- 画布：HTML5 Canvas

## 项目结构

```
ai-drawing-game/
├── client/          # 前端应用
│   ├── src/         # 源代码
│   │   ├── components/  # React 组件
│   │   ├── services/    # API 服务
│   │   └── ...
│   ├── package.json # 前端依赖
│   └── ...
└── server/          # 后端服务
    ├── src/         # 源代码
    ├── package.json # 后端依赖
    └── ...
```

## 安装和运行

### 环境要求

- Node.js >= 16
- npm 或 yarn
- 阿里云百炼平台 API Key

### 设置环境变量

在 `server/.env` 文件中设置你的阿里云百炼平台 API Key：

```
DASHSCOPE_API_KEY=your_dashscope_api_key_here
```

### 安装依赖

```bash
# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install
```

### 运行开发服务器

```bash
# 启动后端服务
cd server
npm run dev

# 启动前端应用 (在另一个终端)
cd client
npm run dev
```

### 构建生产版本

```bash
# 构建前端
cd client
npm run build

# 构建后端
cd ../server
npm run build
```

## 使用说明

1. 在浏览器中打开前端应用 (默认: http://localhost:5173)
2. 使用鼠标在画布上绘制图形
3. 点击 "AI识别" 按钮让 AI 猜测你画的内容
4. 查看 AI 的猜测结果

## API 接口

- `POST /api/guess` - 发送图像数据进行识别

## 注意事项

- 需要有效的阿里云百炼平台 API Key 才能使用 AI 识别功能
- 图像识别可能需要几秒钟时间
- 请确保遵守阿里云百炼平台的使用政策