# AI 对话助手

一个类似豆包风格的 AI 对话页面，支持移动端适配，使用 LinkAI API。

## 功能特点

- 🎨 简洁美观的 UI 设计，参考豆包风格
- 📱 完美适配移动端
- 💬 支持多轮对话，自动保存历史记录
- ⚙️ 可配置 API Key、App Code 和模型选择
- 🚀 纯前端实现，可直接部署到 GitHub Pages

## 部署步骤

1. Fork 或克隆此仓库
2. 进入仓库设置 Settings -> Pages
3. Source 选择 "GitHub Actions"
4. 推送代码到 main 分支，自动触发部署

## 使用方法

1. 打开部署后的页面
2. 点击左下角"设置"按钮
3. 输入你的 LinkAI API Key
4. 可选：填写 App Code 和选择模型
5. 开始对话！

## 获取 API Key

访问 [LinkAI](https://link-ai.tech) 注册账号并获取 API Key。

## 本地开发

直接用浏览器打开 `index.html` 即可，或使用任意静态服务器：

```bash
# 使用 Python
python -m http.server 8080

# 使用 Node.js
npx serve
```

## 技术栈

- 纯 HTML/CSS/JavaScript
- LinkAI Chat Completions API
- LocalStorage 本地存储
