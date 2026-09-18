<div align="center">

<img src="./public/icons/logo_128.png" width="120" height="120" alt="TGDown logo" />

# TGDown — Telegram Web Media Downloader

A Chrome extension (Manifest V3) that sniffs and downloads videos and photos on
Telegram Web, including private channels and groups.

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Install-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/free-telegram-video-downl/pobheilhkabfglljggbjlcphpcmdmdbn)
[![Website](https://img.shields.io/badge/Website-tgdown.wadesk.io-000000)](https://tgdown.wadesk.io/)

[简体中文](./README.zh-CN.md)

</div>

## Features

- Auto-detects videos and large photos as you browse Telegram Web (`web.telegram.org/a/*` and `/k/*`)
- One-click download, plus batch download of everything detected on the page
- Bypasses Telegram Web's right-click / selection / overlay download restrictions
- No extension account required — just sign in to Telegram Web as usual
- 17 UI languages

## Install

Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/free-telegram-video-downl/pobheilhkabfglljggbjlcphpcmdmdbn) —
recommended, and you get updates automatically.

To build from source instead:

```bash
npm install
npm run build
```

Then open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the `dist/` folder.

> `npm run dev` only starts the Vite dev server; it does not install the extension. Load `dist/` manually after building.

## Links

- [Official website](https://tgdown.wadesk.io/)
- [Chrome Web Store](https://chromewebstore.google.com/detail/free-telegram-video-downl/pobheilhkabfglljggbjlcphpcmdmdbn)

## Development

```bash
npm run dev          # vite dev server
npm run build        # type-check + build + pack extension
npm run type-check   # vue-tsc --noEmit only
npm run build:watch  # vite build --watch
```

## Project layout

- `manifest.json` — Manifest V3 manifest
- `src/content/` — content script injected into Telegram Web (sniffing, bypass, buttons, batch download)
- `src/popup/` — browser toolbar popup (Vue 3)
- `src/background/` — service worker (storage, downloads, messaging)
- `src/shared/` — types and constants shared across scripts
- `_locales/` — Chrome i18n messages

## Roadmap

- Download other media types beyond videos and photos (documents, audio, and more)
- Support downloading Stories — media in user profiles

## License

[MIT](./LICENSE)
