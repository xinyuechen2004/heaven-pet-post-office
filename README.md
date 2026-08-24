# 天堂宠物邮局

天堂宠物邮局是一款面向宠物告别场景的情感化 Web 应用。用户可以为离开的宠物建立档案，把想念写成星星纸条放进星星瓶，并收到来自远方的温柔明信片。

产品不做实时聊天，也不模拟宠物复活，而是用「写下想念」和「偶尔收到来信」的方式，帮助用户把持续存在的情感慢慢安放。

## 核心功能

- 宠物建档：填写宠物昵称、类型和性格，并上传照片生成专属宠物形象。
- 星星纸条：用户可以写下想对宠物说的话，把纸条折成星星。
- 星星瓶：首页展示星星瓶，写下的星星会被保存在瓶中。
- 星星盒：用户可以查看自己写过的星星，星星默认折叠，点击后展开完整内容。
- 远方明信片：宠物会以远方来信的形式，偶尔寄回温柔的图文明信片。
- 明信片盒：用户可以回看收到过的明信片，保存这段共同记忆。

## 产品特点

- 有回应，但不打扰：不做高频对话，用明信片的节奏保留距离感。
- 有情感，但有边界：回应温柔克制，不制造依赖，也不强化悲伤。
- 有仪式感：写下纸条、折成星星、放入瓶中，让一次想念有完整动作。
- 可持续个性化：用户写下的星星和上传的照片，会逐渐丰富宠物形象与来信内容。

## 技术栈

- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- Tailwind CSS
- Vercel Serverless Functions
- Google Gemini API

## 本地运行

安装依赖：

```bash
pnpm install
```

启动后端 API：

```bash
pnpm run api
```

另开一个终端启动前端：

```bash
pnpm run dev
```

## 环境变量

复制环境变量模板：

```bash
cp .env.example .env
```

填写：

```bash
GEMINI_API_KEY=你的 Gemini API Key
GEMINI_TEXT_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
```

注意：`.env` 只用于本地运行，不要提交到 GitHub。

## 构建

```bash
pnpm run build-only
```

## 部署

推荐部署到 Vercel。

部署配置：

```txt
Framework Preset: Vite
Build Command: pnpm run build-only
Output Directory: dist
```

需要在 Vercel 的 Environment Variables 中配置：

```txt
GEMINI_API_KEY
GEMINI_TEXT_MODEL
GEMINI_IMAGE_MODEL
```

部署完成后，可以访问：

```txt
https://你的域名/api/health
```

如果返回 `"gemini": true`，说明线上 AI 接口配置成功。

## 项目说明

这是一个围绕「宠物离别后的情感归宿」设计的 AI 产品原型。它将宠物建档、星星纸条、星星瓶和远方明信片串联成一个完整的告别体验，重点探索 AI 在情感陪伴场景中如何做到温柔、有边界、可保存。
