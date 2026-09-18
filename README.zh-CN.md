<div align="center">

<img src="./public/icons/logo_128.png" width="120" height="120" alt="TGDown logo" />

# TGDown — Telegram 网页版媒体下载器

一款 Chrome 扩展（Manifest V3），用于嗅探并下载 Telegram 网页版中的视频和照片，支持私密频道与群组。

[![Chrome 应用商店](https://img.shields.io/badge/Chrome%20%E5%BA%94%E7%94%A8%E5%95%86%E5%BA%97-%E5%AE%89%E8%A3%85-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/free-telegram-video-downl/pobheilhkabfglljggbjlcphpcmdmdbn)
[![官网](https://img.shields.io/badge/%E5%AE%98%E7%BD%91-tgdown.wadesk.io-000000)](https://tgdown.wadesk.io/)

[English](./README.md)

</div>

## 功能特性

- 浏览 Telegram 网页版（`web.telegram.org/a/*` 与 `/k/*`）时自动识别视频与大图
- 一键下载，同时支持批量下载页面中检测到的全部内容
- 绕过 Telegram 网页版的右键 / 选中 / 遮罩下载限制
- 无需扩展账号 —— 照常登录 Telegram 网页版即可
- 支持 17 种界面语言

## 安装

推荐从 [Chrome 应用商店安装](https://chromewebstore.google.com/detail/free-telegram-video-downl/pobheilhkabfglljggbjlcphpcmdmdbn)，可自动更新。

如果想自行构建：

```bash
npm install
npm run build
```

然后打开 `chrome://extensions`，开启**开发者模式**，点击**加载已解压的扩展程序**，选择 `dist/` 目录。

> `npm run dev` 只会启动 Vite 开发服务器，并不会安装扩展。构建完成后仍需手动加载 `dist/` 目录。

## 相关链接

- [官网](https://tgdown.wadesk.io/)
- [Chrome 应用商店](https://chromewebstore.google.com/detail/free-telegram-video-downl/pobheilhkabfglljggbjlcphpcmdmdbn)

## 开发

```bash
npm run dev          # vite 开发服务器
npm run build        # 类型检查 + 构建 + 打包扩展
npm run type-check   # 仅执行 vue-tsc --noEmit
npm run build:watch  # vite build --watch
```

## 项目结构

- `manifest.json` — Manifest V3 清单文件
- `src/content/` — 注入到 Telegram 网页版的内容脚本（嗅探、绕过、按钮、批量下载）
- `src/popup/` — 浏览器工具栏弹窗（Vue 3）
- `src/background/` — service worker（存储、下载、消息通信）
- `src/shared/` — 各脚本共享的类型与常量
- `_locales/` — Chrome i18n 文案

## 未来计划

- 在视频与照片之外，支持下载更多媒体类型（文档、音频等）
- 支持下载 Story —— 用户资料页中的媒体

## 许可证

[MIT](./LICENSE)
