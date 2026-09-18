# manifest.json 字段说明

> manifest.json 必须是**严格 JSON**(Vite/esbuild 不支持注释),
> 设计说明放在本文件,方便维护。

## background
- `service_worker: "background.js"` — 后台脚本,负责限额/下载/消息路由
- `type: "module"` — ES Module 形式,支持 `import` 共享层代码

## content_scripts
- `matches: ["https://web.telegram.org/a/*", "https://web.telegram.org/k/*"]` — 只注入 Telegram Web A/K 版
- `run_at: "document_start"` — 必须在 TG 自己脚本前注入绕过代码
- `all_frames: false` — K 版媒体在主 frame,不需要监听子 frame(竞品是 true,我们关掉以省性能)
- `js: ["content.js"]` + `css: ["content.css"]` — 入口

## action
- `default_popup: "popup.html"` — 浏览器右上角弹窗
- `default_icon` — 4 个尺寸全部指向 `logo_128.png`,Chrome 会自动缩放

## permissions(最小化)
- `storage` — 限额数据持久化
- `downloads` — 调用 chrome.downloads
- `activeTab` — Popup 与当前页通信

## host_permissions
- 只放开 `https://web.telegram.org/*`

## web_accessible_resources
- `page-injection.js` — 通过 `<script>` 注入到 page world 的下载引擎
- `icons/*` — 图标资源

## content_security_policy
- `script-src 'self'` — 禁止内联脚本(安全)

## icons
- 全部指向 `logo_128.png`,Chrome 自动缩放
