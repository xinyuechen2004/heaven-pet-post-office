# 天堂宠物邮局

一个面向宠物告别场景的情感化 H5 产品。用户可以为离开的宠物建档，把想念写成星星纸条存入星星瓶，并收到来自远方的温柔明信片。

## 项目状态

这个版本已经从腾讯吐司导出的 H5 环境中脱离，改造成普通 Vue/Vite 项目：

- 移除了吐司专用 Vite 配置和 H5 runtime。
- 移除了腾讯内部图片选择依赖，改为浏览器原生图片选择。
- 前端不再直连吐司/豆包代理接口。
- 新增 Node/Vercel API 层，用于安全接入 Google Gemini。
- 没有配置 `GEMINI_API_KEY` 时，接口会返回兜底结果，保证基础流程不被卡死。

## 技术栈

- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- Tailwind CSS
- Express
- Vercel Serverless Functions
- Google Gen AI SDK

## 本地运行

安装依赖：

```bash
npm install
```

启动后端 API：

```bash
npm run api
```

另开一个终端启动前端：

```bash
npm run dev
```

打开 Vite 输出的本地地址即可体验。

## Gemini 配置

复制环境变量模板：

```bash
cp .env.example .env
```

填写：

```bash
GEMINI_API_KEY=你的 Gemini API Key
GEMINI_TEXT_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-3-pro-image-preview
```

注意：API Key 只放在后端 `.env`，不要写进前端代码。

## Vercel 部署

1. 把项目上传到 GitHub 仓库。
2. 在 Vercel 中选择 `Add New` → `Project`，导入这个 GitHub 仓库。
3. Framework Preset 选择 `Vite`。
4. Build Command 使用：

```bash
pnpm run build-only
```

5. Output Directory 使用：

```bash
dist
```

6. 在 Vercel 的 Environment Variables 中添加：

```bash
GEMINI_API_KEY=你的 Gemini API Key
GEMINI_TEXT_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-3-pro-image-preview
```

7. 点击 Deploy。部署完成后，用 Vercel 给出的 `vercel.app` 链接访问。

上线后先打开：

```txt
https://你的域名/api/health
```

如果返回 `"gemini": true`，说明 key 已经配置成功。

## 构建

```bash
npm run build-only
```

## 核心功能

- 宠物建档：上传宠物照片，填写名字、类型和性格标签。
- 宠物画像：通过后端代理接入 Gemini 图像模型，生成纪念头像；无 key 时使用兜底流程。
- 星星纸条：用户把想念写成星星，放入星星瓶。
- 星星盒：折叠态保存用户写过的纸条，点击后展开查看。
- 远方明信片：宠物以远方来信的形式慢慢回应。
- 旅行日记：保存和回看收到过的明信片。

## 简历表述参考

天堂宠物邮局｜AI 情感化产品 / 宠物告别 H5

- 基于 Vue 3 + TypeScript 构建移动端 H5，设计宠物建档、星星纸条、明信片回应等完整情感化交互闭环。
- 将吐司平台原型迁移为独立 Web 项目，移除平台专用 runtime、私有 npm 包和代理接口依赖。
- 设计前后端分离的 AI 接入方案，通过 API 层代理调用 Gemini，避免在前端暴露模型密钥。
- 实现图片本地预览、压缩、异步生成、失败兜底和本地持久化，提升发布后普通用户访问的稳定性。
