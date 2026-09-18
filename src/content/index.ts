/**
 * content/index.ts — Content Script 入口(重构版,借鉴竞品架构)
 *
 * 关键改造:
 *   1. 在 document_start 注入 <script src=public-injection.js> 到 page world
 *   2. 把按钮点击 → 转译为 dispatchEvent('video_download', {detail})
 *   3. 监听 page world 的 'xxx_video_download_done' 事件，记录成功次数并弹 Toast
 *   4. 用 waitForSelector 替代持续 MutationObserver(性能大幅提升)
 *   5. 补充 K 版专属选择器: video.media-video, img.media-photo
 */

import { injectDownloadButton, type ButtonController } from './button';
import { Interceptor } from './interceptor';
import { startStoriesDetection } from './stories';
import { startBatchDetection } from './batch';
import {
  type DownloadSessionMeta,
  getDownloadTask,
  removeDownloadTask,
  resetCaptureStateOnReload,
  setDownloadTask,
} from './download-task-sync';
import {
  type MediaItem,
  LOCALE_STORAGE_KEY,
  MESSAGE_TYPES,
  REVIEW_INVITE_URL,
  REVIEW_INVITE_THRESHOLD,
  buildShareUrl,
  initContentLocale,
  t,
} from './_inline';
// 引入 CSS,Vite 会提取为独立的 content.css
import './styles.css';

// ============= 顶层 try/catch 防止任何错误杀死脚本 =============
// 关键: 整个启动流程包在 setTimeout(0) 里
// 因为 Vite/Rollup 打包后,模块级 const 声明 (如 V/Q/$) 会被
// 放在 boot() 调用的"下面",直接同步调用会触发 TDZ 错误
// (Cannot access 'V' before initialization)。
// 延后到下一个 tick 让模块顶层 const 全部初始化完,再调用 boot()
try {
  // ---- 诊断: 记录 content script 加载瞬间的页面状态 ----
  const _diagT0 = performance.now();
  const _diagReadyState = document.readyState;
  const _diagTgRoot = !!document.querySelector('#app, #root, .application, [id*="telegram"]');
  const _diagTgReact = !!document.querySelector('[data-reactroot], [data-reactid]');
  const _diagOnline = navigator.onLine;
  const _diagConnection = (navigator as any).connection
    ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt,
      }
    : null;
  console.info('[TGDown/Diag] Content script loaded', {
    readyState: _diagReadyState,
    tgRootExists: _diagTgRoot,
    tgReactExists: _diagTgReact,
    online: _diagOnline,
    connection: _diagConnection,
    perfNow: Math.round(_diagT0),
    url: location.href,
  });

  // 不安装全局事件/CSS 绕过。内容脚本仅做版本专属的局部媒体处理。
  // page-world 脚本也只作为下载桥，不得改写 Telegram 的全局对象。
  injectPageWorld();

  // ---------- 防重入 + 延后启动 ----------
  if (!(window as any).__TGDown_INSTALLED__) {
    (window as any).__TGDown_INSTALLED__ = true;
    // 关键: setTimeout(0) 让模块顶层 const 先完成初始化
    setTimeout(() => {
      boot()
        .then(() => console.info('[TGDown] content script loaded'))
        .catch((e) => console.error('[TGDown] boot() failed', e));
    }, 0);
  }
} catch (e) {
  console.error('[TGDown] content script boot failed', e);
}

let downloadSession: DownloadSessionMeta | null = null;

async function initDownloadSession(): Promise<DownloadSessionMeta> {
  await resetCaptureStateOnReload();

  const sessionId = crypto.randomUUID();
  let tabId: number | undefined;
  try {
    const tab = await chrome.tabs.getCurrent();
    tabId = tab?.id ?? undefined;
  } catch {
    /* ignore */
  }
  const session = { sessionId, tabId };
  downloadSession = session;
  return session;
}

async function boot(): Promise<void> {
  const bootStart = performance.now();
  console.info('[TGDown/Diag] boot() started', {
    readyState: document.readyState,
    perfNow: Math.round(bootStart),
    tgApp: !!document.querySelector('#app, .application'),
    tgColumns: !!document.querySelector('#column-center, .columns-container'),
  });

  // ---- Phase 1: locale ----
  const t1 = performance.now();
  await initContentLocale();
  console.info('[TGDown/Diag] initContentLocale done', { ms: Math.round(performance.now() - t1) });

  // ---- Phase 2: session init ----
  const t2 = performance.now();
  await initDownloadSession();
  console.info('[TGDown/Diag] initDownloadSession done', { ms: Math.round(performance.now() - t2) });

  // ---- Phase 3: modal host injection (关键 DOM 操作) ----
  const t3 = performance.now();
  const readyStateBeforeModal = document.readyState;
  const tgStateBeforeModal = {
    tgApp: !!document.querySelector('#app, .application'),
    tgColumns: !!document.querySelector('#column-center, .columns-container'),
    tgMessages: !!document.querySelector('.bubbles-inner, .messages-container'),
    bodyChildCount: document.body?.childElementCount ?? -1,
    htmlChildCount: document.documentElement?.childElementCount ?? -1,
  };
  console.info('[TGDown/Diag] Before loadModalHost', {
    readyState: readyStateBeforeModal,
    ...tgStateBeforeModal,
  });

  // 加载 Shadow DOM Modal 资源
  const modalApi = loadModalHost();
  const modalMs = Math.round(performance.now() - t3);
  console.info('[TGDown/Diag] loadModalHost done', {
    ms: modalMs,
    readyState: document.readyState,
    modalRootExists: !!document.getElementById('TGDown-modal-root'),
  });

  let interceptor: Interceptor;
  interceptor = new Interceptor(
    (e) => {
      if (e.kind === 'open') modalApi.open(e.scene, e.payload);
      else if (e.kind === 'toast') modalApi.toast(e.text);
      else modalApi.close();
    },
    (item) => executeDownload(item, interceptor),
  );

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[LOCALE_STORAGE_KEY]) {
      void initContentLocale();
    }
  });

  // 监听 background / popup 消息
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    const senderTabId = sender.tab?.id;
    if (msg?.type === 'TGDown_PING') {
      // Popup 探测:返回当前 tab 的功能可用性
      sendResponse({
        hasSearch: !!document.querySelector(
          '#column-right .search-super, .search-super-container-media.active, .search-super-container-stories.active',
        ),
        url: location.href,
      });
      return true;
    }
    if (msg?.type === 'TGDown_DOWNLOAD_CACHED_ITEM') {
      const cachedItem = msg.item;
      const cacheId = msg.cacheId as string | undefined;
      if (cachedItem && cacheId) {
        console.log('[TGDown] Triggering download for cached item:', cacheId, cachedItem);
        void handleCachedItemDownload(cachedItem, cacheId, interceptor, senderTabId);
      }
      sendResponse({ ok: true });
      return true;
    }
    if (msg?.type === 'TGDown_CANCEL_DOWNLOAD') {
      const cacheId = msg.cacheId as string | undefined;
      if (cacheId) void cancelCachedItemDownload(cacheId);
      sendResponse({ ok: true });
      return true;
    }
    interceptor.handleBgMessage(msg);
  });

  // ---------- 4. 监听 page-world 上报的事件 ----------
  // 下载完成 -> 记录成功次数 -> 按 background 的判定弹评价邀请或分享提示。
  // 两条邀请链路共用同一个下载计数, background 保证同一次下载最多出一个(评价邀请优先)。
  //
  // 原先这里紧接着还会调一次 modalApi.toast(t('content.downloadDoneToast')),
  // 但那条文案在 en/zh 里都是空串、toast() 遇空串直接 return ——
  // 这是个从来没渲染过的空槽, 位置正好留给分享提示。
  document.addEventListener('TGDown_video_download_done', (ev: Event) => {
    const detail = (ev as CustomEvent).detail;
    if (!detail) return;
    if (detail.ok) {
      chrome.runtime
        .sendMessage({ type: MESSAGE_TYPES.RECORD_DOWNLOAD_SUCCESS })
        .then((res) => {
          if (res?.showReviewInvite) {
            modalApi.open('REVIEW_INVITE', { downloadCount: res.downloadCount });
            return;
          }
          if (res?.showShareInvite) {
            modalApi.shareInvite({
              title: t('content.shareInvite.title'),
              pitch: t('content.shareInvite.pitch'),
              url: buildShareUrl(),
            });
          }
        })
        .catch(() => {});
    } else {
      console.error('[TGDown] download error', detail.error);
      const errStr = String(detail.error || '');
      if (!errStr.includes('AbortError') && !errStr.includes('Aborted')) {
        modalApi.toast(t('content.networkError'));
      }
    }
  });

  // 批量下载进度
  document.addEventListener('TGDown_batch_progress', (ev: Event) => {
    const d = (ev as CustomEvent).detail;
    if (d) {
      document.title = t('content.batchProgress', { current: d.current, total: d.total });
    }
  });
  document.addEventListener('TGDown_batch_done', () => {
    document.title = document.title.replace(/\[批量 [^\]]+\]\s*/, '');
  });

  // 与竞品一致，等待 Telegram SPA 完成首个消息视图提交后才绑定观察器。
  // 否则 K 版可能先绑定到过渡用的空 bubbles-inner，导致首屏媒体漏检。
  setTimeout(() => {
    startMediaDetection((item, container) => {
      cacheDetectedMediaIfNeeded(item, container);
      injectButton(container, item, (it) => interceptor.handleDownload(it), interceptor);
    });
  }, 2000);

  // ---- boot() 完成 ----
  const bootMs = Math.round(performance.now() - bootStart);
  console.info('[TGDown/Diag] boot() complete', {
    totalMs: bootMs,
    readyState: document.readyState,
    tgApp: !!document.querySelector('#app, .application'),
    tgColumns: !!document.querySelector('#column-center, .columns-container'),
    tgMessages: !!document.querySelector('.bubbles-inner, .messages-container'),
    tgLogin: !!document.querySelector('.login, .auth-page, .qr-container'),
    htmlChildren: document.documentElement.childElementCount,
    bodyChildren: document.body?.childElementCount ?? -1,
  });

  // ---------- 6. 启动 stories + 批量 + 全局视频侦测 ----------
  // startStoriesDetection();
  // 批量和全局 video 扫描不能跨越 A/K 的消息树；待各自适配器接入后再启动。
}

// ============================================================
//  page-world 注入器 — 借鉴竞品:
//   const s = document.createElement('script');
//   s.src = chrome.runtime.getURL('public-injection.js');
//   s.onload = function(){ this.remove() };
//   document.head.appendChild(s);
// ============================================================
function injectPageWorld(): void {
  // Telegram 的 load 事件早于其 SPA 首次稳定；再延迟一小段时间，且脚本仅
  // 注册下载事件，避免进入官方应用初始化链路。
  const doInject = () => {
    const injectTime = performance.now();
    console.info('[TGDown/Diag] doInject called', {
      ms: Math.round(injectTime),
      headExists: !!document.head,
      readyState: document.readyState,
      tgApp: !!document.querySelector('#app, .application'),
      tgColumns: !!document.querySelector('#column-center, .columns-container'),
    });
    if (!document.head) return;
    // 防重入
    if (document.getElementById('__TGDown_page_injected__')) return;
    const marker = document.createElement('meta');
    marker.id = '__TGDown_page_injected__';
    document.head.appendChild(marker);

    const s = document.createElement('script');
    s.src = chrome.runtime.getURL('page-injection.js');
    s.async = false;
    s.onload = () => {
      console.info('[TGDown/Diag] page-injection.js loaded', {
        ms: Math.round(performance.now() - injectTime),
        readyState: document.readyState,
      });
      s.remove();
    };
    s.onerror = () => {
      console.error('[TGDown] page-injection load failed');
      s.remove();
    };
    document.head.appendChild(s);
  };

  if (document.readyState === 'complete') {
    console.info('[TGDown/Diag] injectPageWorld: already complete, scheduling doInject +2s', {
      perfNow: Math.round(performance.now()),
    });
    setTimeout(doInject, 2000);
  } else {
    console.info('[TGDown/Diag] injectPageWorld: waiting for load event', {
      readyState: document.readyState,
      perfNow: Math.round(performance.now()),
    });
    window.addEventListener('load', () => {
      console.info('[TGDown/Diag] load event fired, scheduling doInject +2s', {
        perfNow: Math.round(performance.now()),
        readyState: document.readyState,
      });
      setTimeout(doInject, 2000);
    });
  }
}

// ============================================================
//  DOM 监测 — waitForSelector 模式(竞品做法,非持续 MutationObserver)
// ============================================================
//  媒体嗅探 — 精准限定在消息列表内部
//
//  监听目标:
//    #column-center .chats-container .bubbles-scrollable
//  触发条件:
//    该列表内出现新的 .bubbles-group 子元素(SPA 滚动加载 / 切日期)
//  进一步检测:
//    .bubbles-group 内 .attachment.media-container
//  类型判断:
//    - 视频: 容器内含 <button class="btn-circle video-play position-center">
//    - 图片: 否则,容器内 <img.media-photo> 的 src 即是真实图
//
//  严格遵循用户指定的 scope,避免误匹配到:
//    - media-viewer 内部(打开图片/视频后才出现)
//    - stories viewer 内部
//    - reply-media 缩略图(嵌套在 .reply-media.media-container 里)
// ============================================================

// ============================================================
//  媒体嗅探 — 基于真实 DOM 结构精准识别
//
//  真实 DOM 结论(来自用户提供的实际消息列表 HTML):
//
//  【单视频消息】
//    .bubble.video > .bubble-content-wrapper > .bubble-content
//      > .attachment.media-container          ← 实际视频容器
//        > span.video-time                    ← 视频时长标识
//        > button.btn-circle.video-play       ← 播放按钮
//        > img.media-photo                   ← 缩略图
//
//  【单图片消息】
//    .bubble.photo > .bubble-content-wrapper > .bubble-content
//      > .attachment.media-container          ← 实际图片容器
//        > img.media-photo
//
//  【相册消息(图+视频混合)】
//    .bubble.is-album > .bubble-content-wrapper > .bubble-content
//      > .attachment                          ← 相册外层容器(无 media-container class)
//        > .album-item.grouped-item           ← 每张独立图/视频
//          > .album-item-media.media-container ← 真正的媒体容器(注入点)
//
//  【必须排除: 回复引用缩略图】
//    .reply > .reply-content > .reply-media.media-container  ← 绝对不处理
//
//  注入策略: 将按钮作为 position:absolute 子节点直接注入到媒体容器内
//  彻底抛弃 position:fixed + RAF 跟随方案
// ============================================================

type TelegramAdapter = { list: string; group: string; bubble: string; media: string };

/** A/K 的 DOM 合约独立维护；版本只由 URL 决定。 */
const TELEGRAM_ADAPTER: TelegramAdapter | null = location.pathname.startsWith('/a')
  ? { list: '.messages-container', group: '.sender-group-container, .message-date-group', bubble: '.Message', media: '.media-inner, img.full-media, img.thumbnail, video' }
  : location.pathname.startsWith('/k')
    ? { list: '.bubbles-inner', group: '.bubbles-group', bubble: '.bubble:not(.service)', media: '.attachment.media-container, .album-item-media, img.media-photo, video' }
    : null;

// ============================================================
//  版本检测工具
//
//  Web A 版 (web.telegram.org/a/)
//    - 消息气泡根节点: .Message
//    - 媒体容器:       .media-inner
//    - 图片元素:       img.full-media  (已加载好的完整图)
//    - 视频缩略图:     img.thumbnail   (blob:, 视频帧)
//    - 视频播放:       video[src="https://web.telegram.org/a/progressive/..."] 预加载
//    - 视频标志:       .dark class + .icon-large-play + .message-media-duration
//
//  Web K 版 (web.telegram.org/k/)
//    - 消息气泡根节点: .bubble
//    - 媒体容器:       .album-item-media.media-container  /  .attachment.media-container
//    - 图片/视频预览:  img.media-photo (blob:, 仅低质预览)
//    - 视频播放:       无 <video> 元素；需点击才出现
//    - 视频标志:       .video-time + button.btn-circle.video-play
//    - 相册条目身份:   .album-item[data-mid][data-peer-id]
//
//  ⚠️ 修改时请严格遵守:
//     - A 版专用逻辑必须在 isWebA() 守护下或容器选择器精确限定
//     - K 版专用逻辑必须在 isWebK() 守护下或容器选择器精确限定
//     - 两版公用的逻辑在公共段，不要把 A 版假设带入 K 版，反之亦然
// ============================================================

/**
 * 是否运行在 Web A 版 (web.telegram.org/a/)
 * 通过 URL pathname 判断，优先于 DOM 检测，因为 DOM 可能还未渲染。
 */
function isWebA(): boolean {
  return location.pathname.startsWith('/a');
}

/**
 * 是否运行在 Web K 版 (web.telegram.org/k/)
 */
function isWebK(): boolean {
  return location.pathname.startsWith('/k');
}

/** 已处理 of 容器(去重，防止重复注入) */
const seenContainers = new WeakSet<HTMLElement>();

/** 图片清晰度未达标、正在等待 load / src 升级 */
const imageCapturePending = new WeakSet<HTMLElement>();

const MIN_CAPTURE_IMAGE_WIDTH = 96;
const IMAGE_CAPTURE_WAIT_MS = 5000;
const PANEL_THUMB_MAX_PX = 96;

/** 图片元素优先级: A 版 full-media > K/A media-photo > thumbnail(多为低清) */
function pickPrimaryImageEl(container: HTMLElement): HTMLImageElement | null {
  return (
    container.querySelector<HTMLImageElement>('img.full-media') ??
    container.querySelector<HTMLImageElement>('img.media-photo') ??
    container.querySelector<HTMLImageElement>('img.thumbnail')
  );
}

function imagePixelArea(img: HTMLImageElement): number {
  const w = img.naturalWidth || 0;
  const h = img.naturalHeight || 0;
  return w * h;
}

function minAcceptableImageWidth(img: HTMLImageElement): number {
  const cw = img.clientWidth || img.width || 0;
  const dpr = window.devicePixelRatio || 1;
  if (cw > 0) {
    return Math.max(MIN_CAPTURE_IMAGE_WIDTH, Math.floor(cw * dpr * 0.8));
  }
  return MIN_CAPTURE_IMAGE_WIDTH;
}

function isImageReadyForCapture(img: HTMLImageElement): boolean {
  if (!img.complete) return false;
  const url = img.currentSrc || img.src;
  if (!url || url.startsWith('data:image/svg')) return false;
  return (img.naturalWidth || 0) >= minAcceptableImageWidth(img);
}

function getImageThumbnailFromEl(img: HTMLImageElement): string {
  const url = img.currentSrc || img.src;
  if (url && !url.startsWith('data:image/svg')) return url;
  return '';
}

/**
 * 等待图片加载到可接受清晰度后再写入捕获列表，避免首帧低清 blob 导致看板模糊。
 * 若 Telegram 后续替换 src，会通过更高 thumbnailPixels 升级已有条目。
 */
function scheduleImageCapture(
  container: HTMLElement,
  bubble: HTMLElement,
  img: HTMLImageElement,
  onMedia: (item: MediaItem, container: HTMLElement) => void,
): void {
  if (seenContainers.has(container) || imageCapturePending.has(container)) return;
  imageCapturePending.add(container);

  let disposed = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let bestArea = 0;

  const cleanup = () => {
    disposed = true;
    mo.disconnect();
    img.removeEventListener('load', onAttempt);
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    imageCapturePending.delete(container);
  };

  const emitCapture = (force: boolean) => {
    if (disposed || seenContainers.has(container)) return;

    const url = img.currentSrc || img.src;
    if (!url || url.startsWith('data:image/svg')) return;

    const area = imagePixelArea(img);
    if (!force && area > 0 && area < bestArea) return;
    if (area > bestArea) bestArea = area;

    const albumItem = container.closest<HTMLElement>('.album-item[data-mid], [data-mid]');
    const mid = albumItem?.getAttribute('data-mid') || '';
    const stableFilename = isWebK() && mid
      ? `tg_k_image_${mid}.jpg`
      : generateFilename(bubble, 'jpg', container, url);
    const thumb = getImageThumbnailFromEl(img) || url;
    const pixels = area || imagePixelArea(img);

    seenContainers.add(container);
    const capturedLowRes = force || !isImageReadyForCapture(img);
    cleanup();

    onMedia(
      {
        kind: 'image',
        url,
        filename: stableFilename,
        domPath: '',
        thumbnailUrl: thumb,
        thumbnailPixels: pixels,
      },
      container,
    );

    if (capturedLowRes) {
      watchImageCaptureUpgrade(container, bubble, img, stableFilename, pixels);
    }
  };

  const onAttempt = () => {
    if (disposed || seenContainers.has(container)) return;
    const area = imagePixelArea(img);
    if (area > bestArea) bestArea = area;
    if (isImageReadyForCapture(img)) {
      emitCapture(false);
    }
  };

  const mo = new MutationObserver(onAttempt);
  mo.observe(img, { attributes: true, attributeFilter: ['src'] });
  img.addEventListener('load', onAttempt);

  onAttempt();
  if (!isImageReadyForCapture(img)) {
    timeoutId = setTimeout(() => {
      if (!disposed && !seenContainers.has(container)) {
        emitCapture(true);
      } else {
        cleanup();
      }
    }, IMAGE_CAPTURE_WAIT_MS);
  }
}

/** 首次以低清入库后，继续监听 src/load，用更高清版本升级看板缩略图 */
function watchImageCaptureUpgrade(
  _container: HTMLElement,
  _bubble: HTMLElement,
  img: HTMLImageElement,
  filename: string,
  lastPixels: number,
): void {
  let bestPixels = lastPixels;
  let stopped = false;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    mo.disconnect();
    img.removeEventListener('load', onUpgrade);
    clearTimeout(stopTimer);
  };

  const onUpgrade = () => {
    if (stopped || !isImageReadyForCapture(img)) return;
    const area = imagePixelArea(img);
    if (area <= bestPixels) return;
    bestPixels = area;
    const url = img.currentSrc || img.src;
    if (!url || url.startsWith('data:image/svg')) return;
    void addMediaToCache({
      kind: 'image',
      url,
      filename,
      domPath: '',
      thumbnailUrl: getImageThumbnailFromEl(img) || url,
      thumbnailPixels: area,
    });
    stop();
  };

  const mo = new MutationObserver(onUpgrade);
  mo.observe(img, { attributes: true, attributeFilter: ['src'] });
  img.addEventListener('load', onUpgrade);
  const stopTimer = setTimeout(stop, IMAGE_CAPTURE_WAIT_MS * 2);
}

/**
 * 判断一个媒体容器是否是视频容器
 *
 * Web A 版视频特征: .dark class、<video> 元素、.icon-large-play、.message-media-duration
 * Web K 版视频特征: span.video-time、button.btn-circle.video-play（无 <video> 元素！）
 *
 * ⚠️ 两版判断条件已合并在同一函数内，勿随意增删，增改前请确认对哪个版本有影响。
 */
function isVideoContainer(el: HTMLElement): boolean {
  return !!(
    // ── Web A 版 ──────────────────────────────────────────
    el.classList.contains('dark') ||          // A版: 视频容器必有 .dark class
    el.querySelector('video') ||              // A版: 预加载的 <video> 元素
    el.querySelector('.message-media-duration') || // A版: 视频时长标签
    el.querySelector('.icon-large-play') ||   // A版: 大播放图标
    // ── Web K 版 ──────────────────────────────────────────
    el.querySelector('.video-time') ||        // K版: 视频时长 span
    el.querySelector('button.btn-circle.video-play') || // K版: 播放按钮
    el.querySelector('button.video-play')    // K版兼容(旧结构)
  );
}

/** K 版相册条目是否带视频播放控件（封面为 img.media-photo，非独立图片） */
function isKAlbumVideoItem(container: HTMLElement): boolean {
  if (!isWebK()) return false;
  return !!(
    container.querySelector('.video-time') ||
    container.querySelector('button.video-play, button.btn-circle.video-play')
  );
}

function isInsideMediaViewer(el: Element | null): boolean {
  if (!el) return false;
  return !!el.closest(
    '.media-viewer, .media-viewer-container, .media-viewer-mover, .media-viewer-aspecter, #media-viewer',
  );
}

/**
 * 是否将嗅探结果写入 Popup「已捕获媒体」列表
 * - K 版图片：有 img.media-photo 的 blob/https 即可（真实可回显 URL）
 * - K 版视频：浏览阶段不入库（无下载地址）；仅 https 预加载或点击下载流程单独写入
 */
function shouldCacheDetectedMedia(item: MediaItem, container?: HTMLElement | null): boolean {
  if (!item.url || item.url.startsWith('data:image/svg')) return false;

  if (item.kind === 'image') {
    if (container && (isVideoContainer(container) || isKAlbumVideoItem(container))) {
      return false;
    }
    return true;
  }

  if (item.kind === 'video') {
    if (isWebK()) {
      return item.url.startsWith('https://');
    }
    if (isWebA()) {
      return isAVideoDownloadUrl(item.url);
    }
    return item.url.startsWith('https://');
  }

  return false;
}

function cacheDetectedMediaIfNeeded(item: MediaItem, container?: HTMLElement | null): void {
  if (shouldCacheDetectedMedia(item, container)) {
    void addMediaToCache(item);
  }
}

/** A 版可下载视频：仅 progressive/stream 的 https（排除 blob 预览与缩略图） */
function isAVideoDownloadUrl(url: string): boolean {
  if (!url.startsWith('https://')) return false;
  try {
    const u = new URL(url);
    if (!u.hostname.includes('telegram.org')) return false;
    return u.pathname.includes('/progressive/') || u.pathname.includes('/stream/');
  } catch {
    return url.includes('/progressive/') || url.includes('/stream/');
  }
}

function pickBestVideoSrc(video: HTMLVideoElement | null): string {
  if (!video) return '';
  const fromSources = Array.from(video.querySelectorAll('source'))
    .map((s) => s.src)
    .filter(Boolean);
  const candidates = [video.currentSrc, video.src, ...fromSources].filter(Boolean);
  const httpsVideo = candidates.find((u) => isAVideoDownloadUrl(u));
  if (httpsVideo) return httpsVideo;
  const httpsAny = candidates.find((u) => u.startsWith('https://'));
  if (httpsAny) return httpsAny;
  return candidates.find((u) => u.startsWith('blob:')) || '';
}

/** 下载前从 DOM 解析最新视频地址（A 版必须 https progressive/stream） */
async function resolveVideoDownloadUrl(
  container: HTMLElement | null,
  fallbackUrl: string,
): Promise<{ url: string; duration?: number } | null> {
  const readFromContainer = (): { url: string; duration?: number } | null => {
    const video = container?.querySelector<HTMLVideoElement>('video') ?? null;
    const url = pickBestVideoSrc(video);
    if (!url) return null;
    if (isWebA()) {
      if (!isAVideoDownloadUrl(url)) return null;
      return { url, duration: video?.duration };
    }
    if (isWebK() && !url.startsWith('https://')) return null;
    if (!url.startsWith('https://') && !url.startsWith('blob:')) return null;
    return { url, duration: video?.duration };
  };

  const immediate = readFromContainer();
  if (immediate) return immediate;

  if (isWebA() && container) {
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 200));
      const next = readFromContainer();
      if (next) return next;
    }
  }

  if (isWebA()) {
    return isAVideoDownloadUrl(fallbackUrl) ? { url: fallbackUrl } : null;
  }
  if (fallbackUrl.startsWith('https://') || fallbackUrl.startsWith('blob:')) {
    return { url: fallbackUrl };
  }
  return null;
}

/**
 * 下载前从 DOM 解析最新图片地址。
 *
 * Popup 多选下载此前误用了 resolveVideoDownloadUrl：Web A 会把图片 blob/https
 * 当作无效视频地址拒绝，导致 A 版图片批量下载全部失败。图片必须走独立解析链路，
 * 并优先读取 Telegram 后续替换出的高清 full-media/currentSrc。
 */
async function resolveImageDownloadUrl(
  container: HTMLElement | null,
  fallbackUrl: string,
): Promise<{ url: string } | null> {
  const readFromContainer = (): string => {
    const img = container ? pickPrimaryImageEl(container) : null;
    const url = img?.currentSrc || img?.src || '';
    if (!url || url.startsWith('data:image/svg')) return '';
    return url;
  };

  const immediate = readFromContainer();
  if (immediate) return { url: immediate };

  // A 版图片可能先渲染占位节点，再异步补上 blob/https 地址。
  if (isWebA() && container) {
    for (let i = 0; i < 20; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const next = readFromContainer();
      if (next) return { url: next };
    }
  }

  if (
    fallbackUrl &&
    !fallbackUrl.startsWith('data:image/svg') &&
    (fallbackUrl.startsWith('https://') ||
      fallbackUrl.startsWith('blob:') ||
      fallbackUrl.startsWith('data:image/'))
  ) {
    return { url: fallbackUrl };
  }

  return null;
}

/** 从 bubble 和 container 拿稳定标识或时间戳生成可读文件名 */
function generateFilename(
  bubble: HTMLElement | null,
  ext: string,
  container?: HTMLElement | null,
  url?: string
): string {
  // 1. 尝试从 URL 提取文件名 (最稳定且唯一)
  if (url && !url.startsWith('blob:') && !url.startsWith('data:')) {
    try {
      const parsed = new URL(url);
      const pathname = parsed.pathname;
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1];
        const cleanName = lastSegment.split('?')[0].split('#')[0];
        if (cleanName && cleanName.length > 5) {
          if (cleanName.endsWith('.' + ext)) {
            return cleanName;
          }
          return `${cleanName}.${ext}`;
        }
      }
    } catch { /* ignore */ }
  }

  // 2. 尝试从 bubble 的 data-timestamp 属性获取
  if (bubble) {
    const ts = bubble.getAttribute('data-timestamp');
    if (ts) {
      try {
        const d = new Date(parseInt(ts, 10) * 1000);
        const pad = (n: number) => String(n).padStart(2, '0');
        // 加入消息 ID 作为后缀防止同一秒内的多媒体冲突
        const bubbleId = bubble.id || bubble.getAttribute('data-message-id') || '';
        const suffix = bubbleId ? '_' + bubbleId.replace(/[^a-zA-Z0-9_-]/g, '_') : '_' + Math.random().toString(36).slice(2, 6);
        return `tg_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(
          d.getHours(),
        )}${pad(d.getMinutes())}${pad(d.getSeconds())}${suffix}.${ext}`;
      } catch {
        /* ignore */
      }
    }
  }

  // 3. 尝试从 container 或 bubble 的 id/data-message-id 属性提取唯一标示
  const idSource = container || bubble;
  if (idSource) {
    const closestId = idSource.closest('[id]')?.id || idSource.id;
    if (closestId) {
      const cleanId = closestId.replace(/[^a-zA-Z0-9_-]/g, '_');
      return `tg_${cleanId}.${ext}`;
    }
    const msgIdAttr = idSource.closest('[data-message-id]')?.getAttribute('data-message-id') ||
                      idSource.getAttribute('data-message-id');
    if (msgIdAttr) {
      return `tg_msg_${msgIdAttr}.${ext}`;
    }
  }

  // 4. 兜底: 时间戳 + 随机数防止文件名完全重合
  const rand = Math.random().toString(36).substring(2, 7);
  return `tgdown-${Date.now()}-${rand}.${ext}`;
}

/** 根据 Popup 缓存项定位页面内媒体容器（K 版相册 data-mid） */
function findContainerForCachedItem(item: MediaItem): HTMLElement | null {
  const midMatch = item.filename.match(/tg_k_(?:image|video)_(\d+)\./);
  if (midMatch) {
    const albumItem = document.querySelector<HTMLElement>(
      `.album-item[data-mid="${midMatch[1]}"], .grouped-item[data-mid="${midMatch[1]}"]`,
    );
    const container = albumItem?.querySelector<HTMLElement>(
      '.album-item-media.media-container, .attachment.media-container, .media-inner',
    );
    if (container) return container;
  }
  if (item.url) {
    const imgs = document.querySelectorAll<HTMLImageElement>(
      'img.media-photo, img.thumbnail, img.full-media',
    );
    for (const img of imgs) {
      const src = img.currentSrc || img.src;
      if (src && src === item.url) {
        return (
          img.closest<HTMLElement>(
            '.album-item-media.media-container, .attachment.media-container, .media-inner',
          ) ?? null
        );
      }
    }
  }
  return null;
}

function attachPanelDownloadListeners(
  videoId: string,
  downloadId: string,
  cacheId: string | undefined,
  ctrl?: ButtonController,
): () => void {
  const session = downloadSession;
  const syncTask = (
    patch: Parameters<typeof setDownloadTask>[1],
  ): void => {
    if (!cacheId) return;
    void setDownloadTask(cacheId, {
      ...patch,
      sessionId: session?.sessionId,
      tabId: session?.tabId,
    });
  };

  syncTask({ status: 'loading', percent: 0, videoId, downloadId });

  const onProgressEvent = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (detail && detail.video_id === videoId) {
      const percent = Math.max(0, Math.min(100, Number(detail.progress) || 0));
      ctrl?.setState({ kind: 'downloading', percent });
      syncTask({ status: 'downloading', percent, videoId, downloadId });
    }
  };

  const onDoneEvent = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (!detail || detail.video_id !== videoId) return;
    cleanup();
    if (detail.ok) {
      ctrl?.setState({ kind: 'done' });
      syncTask({ status: 'done', percent: 100, videoId, downloadId });
      if (cacheId) {
        setTimeout(() => removeDownloadTask(cacheId), 2500);
      }
    } else {
      const errStr = String(detail.error || '');
      if (errStr.includes('AbortError') || errStr.includes('Aborted')) {
        ctrl?.setState({ kind: 'idle' });
        syncTask({ status: 'cancelled', percent: 0, videoId, downloadId });
      } else {
        ctrl?.setState({ kind: 'error', message: detail.error || t('content.downloadFailed') });
        syncTask({
          status: 'error',
          percent: 0,
          videoId,
          downloadId,
          message: detail.error || '下载失败',
        });
      }
    }
  };

  const onCancelClick = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (detail && detail.videoId === videoId) {
      cleanup();
      document.dispatchEvent(
        new CustomEvent(videoId + '_video_download_cancel', {
          detail: { videoId, downloadId },
        }),
      );
      syncTask({ status: 'cancelled', percent: 0, videoId, downloadId });
      if (cacheId) setTimeout(() => removeDownloadTask(cacheId), 500);
    }
  };

  const cleanup = () => {
    document.removeEventListener(videoId + '_video_download_progress', onProgressEvent);
    document.removeEventListener(videoId + '_video_download_done', onDoneEvent);
    document.removeEventListener('TGDown_button_cancel', onCancelClick);
    if (ctrl && ctrl.currentVideoId === videoId) {
      ctrl.currentVideoId = null;
      ctrl.currentDownloadId = null;
    }
  };

  document.addEventListener(videoId + '_video_download_progress', onProgressEvent);
  document.addEventListener(videoId + '_video_download_done', onDoneEvent);
  document.addEventListener('TGDown_button_cancel', onCancelClick);

  return cleanup;
}

async function runDownloadWithPanelProgress(
  item: MediaItem,
  interceptor: Interceptor,
  cacheId: string | undefined,
  ctrl?: ButtonController,
  resolveUrl?: () => Promise<{ url: string; duration?: number } | null>,
): Promise<void> {
  const videoId = 'TGDown_video_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
  const downloadId = crypto.randomUUID();

  if (ctrl) {
    ctrl.currentVideoId = videoId;
    ctrl.currentDownloadId = downloadId;
  }

  const cleanupListeners = attachPanelDownloadListeners(videoId, downloadId, cacheId, ctrl);

  let url = item.url;
  let duration = item.duration;

  if (resolveUrl) {
    const resolved = await resolveUrl();
    if (!resolved?.url) {
      cleanupListeners();
      ctrl?.setState({ kind: 'error', message: t('content.noDownloadUrl') });
      if (cacheId && downloadSession) {
        await setDownloadTask(cacheId, {
          status: 'error',
          percent: 0,
          message: t('content.noDownloadUrl'),
          sessionId: downloadSession.sessionId,
          tabId: downloadSession.tabId,
        });
      }
      return;
    }
    url = resolved.url;
    duration = resolved.duration ?? duration;
  }

  if (!url) {
    cleanupListeners();
    if (cacheId) await removeDownloadTask(cacheId);
    return;
  }

  const newItem: MediaItem = {
    ...item,
    url,
    duration,
    videoId,
    downloadId,
    cacheId,
  };

  try {
    const blocked = await interceptor.handleDownload({ ...newItem, panelDispatch: true });
    if (blocked) {
      cleanupListeners();
      ctrl?.setState({ kind: 'idle' });
      if (cacheId) await removeDownloadTask(cacheId);
    } else if (item.kind === 'video') {
      setTimeout(() => closeMediaViewer(), 400);
    }
  } catch (err) {
    console.error('[TGDown] handleDownload error', err);
    cleanupListeners();
    ctrl?.setState({ kind: 'error', message: t('content.handleDownloadFailed') });
    if (cacheId && downloadSession) {
      await setDownloadTask(cacheId, {
        status: 'error',
        percent: 0,
        message: t('content.handleDownloadFailed'),
        sessionId: downloadSession.sessionId,
        tabId: downloadSession.tabId,
      });
    }
  }
}

async function executeDownload(item: MediaItem, interceptor: Interceptor): Promise<void> {
  if (item.panelDispatch) {
    await doDownload(item);
    return;
  }
  if (item.kind === 'video' && item.cacheId) {
    const container = findContainerForCachedItem(item);
    if (container) {
      await downloadVideoFromContainer(container, item, interceptor, undefined, item.cacheId);
      return;
    }
    await runDownloadWithPanelProgress(item, interceptor, item.cacheId, undefined, async () => {
      const c = findContainerForCachedItem(item);
      return resolveVideoDownloadUrl(c, item.url);
    });
    return;
  }
  if (item.kind === 'image' && item.cacheId) {
    await runDownloadWithPanelProgress(item, interceptor, item.cacheId, undefined, async () => {
      const c = findContainerForCachedItem(item);
      return resolveImageDownloadUrl(c, item.url);
    });
    return;
  }
  await doDownload(item);
}

async function handleCachedItemDownload(
  item: MediaItem,
  cacheId: string,
  interceptor: Interceptor,
  senderTabId?: number,
): Promise<void> {
  if (senderTabId != null && downloadSession) {
    downloadSession.tabId = senderTabId;
  }
  await executeDownload({ ...item, cacheId }, interceptor);
}

async function cancelCachedItemDownload(cacheId: string): Promise<void> {
  const task = await getDownloadTask(cacheId);
  if (task?.videoId) {
    document.dispatchEvent(
      new CustomEvent('TGDown_button_cancel', {
        detail: { videoId: task.videoId, downloadId: task.downloadId },
      }),
    );
    document.dispatchEvent(
      new CustomEvent(task.videoId + '_video_download_cancel', {
        detail: { videoId: task.videoId, downloadId: task.downloadId },
      }),
    );
  }
  await setDownloadTask(cacheId, { status: 'cancelled', percent: 0 });
  setTimeout(() => removeDownloadTask(cacheId), 500);
}

async function dispatchDownload(
  url: string,
  filename: string,
  videoId?: string,
  downloadId?: string,
): Promise<void> {
  const vId = videoId || 'TGDown_' + Date.now();
  const dlId = downloadId || crypto.randomUUID();

  document.dispatchEvent(
    new CustomEvent('video_download', {
      detail: {
        type: 'single',
        video_src: {
          video_url: url,
          video_id: vId,
          page: 0,
          download_id: dlId,
          filename,
        },
      },
    }),
  );
}

/**
 * 处理单个媒体容器: 判断类型、去重、回调 onMedia
 *
 * @param container  - .attachment.media-container 或 .media-inner 等媒体宿主
 * @param bubble     - 所在的 .bubble 或 .Message 元素(用于取 data-timestamp)
 * @param onMedia    - 媒体发现回调
 */
function processMediaContainer(
  container: HTMLElement,
  bubble: HTMLElement,
  onMedia: (item: MediaItem, container: HTMLElement) => void,
): void {
  if (seenContainers.has(container)) {
    return;
  }

  // 严格排除回复引用区域内的缩略图
  if (container.closest('.reply, .EmbeddedMessage')) {
    return;
  }

  const isVideo = isVideoContainer(container);
  const primaryImg = pickPrimaryImageEl(container);
  if (isVideo) {
    /** 获取视频缩略图 URL，返回 blob URL 或 canvas data URL */
    const getThumbnail = (): string => {
      // 优先级: A版 img.thumbnail > K版 img.media-photo/full-media > canvas.thumbnail
      const imgEl = container.querySelector<HTMLImageElement>('img.thumbnail, img.media-photo, img.full-media');
      const currentUrl = imgEl?.currentSrc || imgEl?.src || '';
      if (currentUrl && !currentUrl.startsWith('data:image/svg') && !currentUrl.startsWith('data:image/png;base64,iVBOR')) {
        return currentUrl; // 可以是 blob URL，会在 addMediaToCache 中缩放
      }
      const canvas = container.querySelector<HTMLCanvasElement>('canvas.thumbnail');
      if (canvas) {
        try { return canvas.toDataURL('image/jpeg', 0.5); } catch { /* ignore */ }
      }
      return '';
    };

    /**
     * 尝试从容器内的 <video> 元素获取视频 URL 并写入缓存.
     * 对于 Web A 版: 视频元素存在且 src 已解析
     * 对于 Web K 版: 视频元素在点击前不存在
     */
    const processVideo = (): boolean => {
      const videoEl = container.querySelector<HTMLVideoElement>('video');
      const videoUrl = pickBestVideoSrc(videoEl);
      if (videoUrl && (!isWebA() || isAVideoDownloadUrl(videoUrl))) {
        seenContainers.add(container);
        cacheDetectedMediaIfNeeded(
          {
            kind: 'video',
            url: videoUrl,
            filename: generateFilename(bubble, 'mp4', container, videoUrl),
            domPath: '',
            thumbnailUrl: getThumbnail(),
          },
          container,
        );
        return true;
      }
      return false;
    };

    // 1. 立即尝试解析一次
    const resolved = processVideo();

    // 2. 如果未立即解析出 URL，监听动态加载
    if (!resolved) {
      const videoEl = container.querySelector<HTMLVideoElement>('video');
      if (videoEl) {
        videoEl.addEventListener('loadstart', () => processVideo(), { once: true });
        videoEl.addEventListener('loadedmetadata', () => processVideo(), { once: true });
      }

      const observer = new MutationObserver(() => {
        const hasUrl = processVideo();
        if (hasUrl) observer.disconnect();
      });
      observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });

      // K 版无 <video> 时仅注入下载按钮，不把封面 blob 写入捕获列表
      if (!seenContainers.has(container) && isKAlbumVideoItem(container)) {
        seenContainers.add(container);
      }
    }

    // 3. 监听 img 加载，在 A 版缩略图就绪后更新缓存
    const imgEl = container.querySelector<HTMLImageElement>('img.thumbnail, img.media-photo, img.full-media');
    if (imgEl && !imgEl.complete) {
      imgEl.addEventListener('load', () => {
        const videoEl = container.querySelector<HTMLVideoElement>('video');
        const videoUrl = pickBestVideoSrc(videoEl);
        if (videoUrl && (!isWebA() || isAVideoDownloadUrl(videoUrl))) {
          cacheDetectedMediaIfNeeded(
            {
              kind: 'video',
              url: videoUrl,
              filename: generateFilename(bubble, 'mp4', container, videoUrl),
              domPath: '',
              thumbnailUrl: getThumbnail(),
            },
            container,
          );
        }
      }, { once: true });
    }

    const initialVideoEl = container.querySelector<HTMLVideoElement>('video');
    const initialVideoUrl = pickBestVideoSrc(initialVideoEl);
    if (initialVideoUrl && !seenContainers.has(container)) {
      seenContainers.add(container);
    }

    const mediaUrl =
      !initialVideoUrl || (isWebA() && !isAVideoDownloadUrl(initialVideoUrl))
        ? ''
        : initialVideoUrl;
    onMedia(
      {
        kind: 'video',
        url: mediaUrl,
        filename: generateFilename(bubble, 'mp4', container, mediaUrl || undefined),
        domPath: '',
        thumbnailUrl: getThumbnail(),
      },
      container,
    );
  } else if (primaryImg) {
    if (isKAlbumVideoItem(container)) {
      return;
    }
    scheduleImageCapture(container, bubble, primaryImg, onMedia);
  }
}

/**
 * 处理单个 .bubble 或 .Message 节点内的媒体容器
 *
 * 版本差异对照:
 *   Web A: 气泡为 .Message，内容区 .message-content-wrapper > .message-content
 *           - 单媒体容器: .media-inner（直接子级）
 *           - 相册容器:   .Album .media-inner
 *   Web K: 气泡为 .bubble，内容区 .bubble-content-wrapper > .bubble-content
 *           - 单媒体容器: :scope > .attachment.media-container
 *           - 相册容器:   .album-item-media.media-container
 */
function scanBubble(
  bubble: HTMLElement,
  onMedia: (item: MediaItem, container: HTMLElement) => void,
): void {
  // A 版服务消息: .ActionMessage | K 版服务消息: .service
  if (bubble.classList.contains('service') || bubble.classList.contains('ActionMessage')) return;

  // ── 定位内容区 ────────────────────────────────────────────────────
  // Web A: .message-content-wrapper > .message-content
  // Web K: .bubble-content-wrapper  > .bubble-content
  const bubbleContent = bubble.querySelector<HTMLElement>(
    ':scope > .bubble-content-wrapper > .bubble-content, :scope > .message-content-wrapper > .message-content, .message-content',
  );
  if (!bubbleContent) {
    return;
  }

  // ── 找媒体容器 ────────────────────────────────────────────────────
  // 路径1 — 单媒体:
  //   Web K: :scope > .attachment.media-container（直接子级）
  //   Web A: .media-inner（可能嵌套在 .message-content 内）
  const singleContainers = bubbleContent.querySelectorAll<HTMLElement>(
    ':scope > .attachment.media-container, .media-inner',
  );
  // 路径2 — 相册:
  //   Web K: .album-item-media.media-container
  //   Web A: .Album .media-inner
  const albumContainers = bubbleContent.querySelectorAll<HTMLElement>(
    '.album-item-media.media-container, .Album .media-inner',
  );

  const containers = new Set<HTMLElement>();
  singleContainers.forEach((c) => containers.add(c));
  albumContainers.forEach((c) => containers.add(c));

  for (const container of containers) {
    processMediaContainer(container, bubble, onMedia);
  }
}

/**
 * 扫描 .bubbles-group 或 .sender-group-container 内全部消息气泡
 */
function scanGroup(
  group: HTMLElement,
  onMedia: (item: MediaItem, container: HTMLElement) => void,
): void {
  group.querySelectorAll<HTMLElement>(':scope > .bubble, :scope > .Message, .bubble, .Message').forEach((bubble) => {
    scanBubble(bubble, onMedia);
  });
}

/**
 * 启动媒体嗅探 — 针对 TG 虚拟列表的完整覆盖
 *
 * TG 消息列表是虚拟列表，只渲染视口内的节点。
 * 滚动时旧节点被移除、新节点被插入，三种插入模式都需覆盖:
 *
 *   【模式 A】整个 .bubbles-group 被插入
 *     → 滚动加载 / SPA 切换对话时最常见
 *     → 直接 scanGroup(node)
 *
 *   【模式 B】包含多个 .bubbles-group 的容器被插入 (e.g. .bubbles-date-group)
 *     → 跳日期段时发生
 *     → querySelectorAll('.bubbles-group') 再逐个 scanGroup
 *
 *   【模式 C】单条 .bubble 被插入到已有 .bubbles-group
 *     → 实时新消息到达时发生
 *     → 直接 scanBubble(node)
 *
 * 注意: TG 虚拟列表移除旧节点时不需要任何操作。
 * 当用户滚回该位置时，TG 会创建全新 DOM 元素，
 * 新元素不在 seenContainers 中，MO 触发后会重新注入。✅
 */
function startMediaDetection(
  onMedia: (item: MediaItem, container: HTMLElement) => void,
): void {
  const adapter = TELEGRAM_ADAPTER;
  if (!adapter) return;
  let observerRoot: HTMLElement | null = null;
  let groupObserver: MutationObserver | null = null;
  const scanCurrentBubbles = (root: HTMLElement) => {
    root.querySelectorAll<HTMLElement>(adapter.bubble).forEach((bubble) => {
      scanBubble(bubble, onMedia);
    });
  };

  const setupObserver = (root: HTMLElement) => {
    if (observerRoot === root) return;
    // 旧的 observerRoot 已断开连接(TG 切换对话替换了元素)，或者是第一次 attach
    observerRoot = root;
    // 初始扫描已渲染的节点
    const initialGroups = root.querySelectorAll<HTMLElement>(adapter.group);
    initialGroups.forEach((g) => {
      scanGroup(g, onMedia);
    });
    // K 的虚拟列表在部分频道视图中会直接把 .bubble 挂到列表下，
    // 不经过 .bubbles-group；A 也有类似的过渡结构。初次挂载必须补扫本版气泡。
    scanCurrentBubbles(root);

    groupObserver?.disconnect();
    groupObserver = new MutationObserver((muts) => {
      for (const m of muts) {
        for (const node of m.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;

          // 1. 模式 A & B: 如果插入的是分组或包含分组的容器，扫描整个分组
          if (node.matches(adapter.group)) {
            scanGroup(node, onMedia);
            continue;
          }

          const nestedGroups = node.querySelectorAll<HTMLElement>(adapter.group);
          if (nestedGroups.length > 0) {
            nestedGroups.forEach((g) => scanGroup(g, onMedia));
            continue;
          }

          // 2. 模式 C & 延迟加载/动态子元素节点追加:
          // 查找该节点自身或其最近的父级气泡元素。这能捕捉到懒加载的 img, video 等被异步添加到已有气泡中的情况。
          if (!node.matches(adapter.media) && !node.querySelector(adapter.media)) continue;
          const bubble = node.closest(adapter.bubble) as HTMLElement | null;
          if (bubble) {
            scanBubble(bubble, onMedia);
          }
        }
      }
    });
    groupObserver.observe(root, { childList: true, subtree: true });
  };

  const tryFind = () => {
    // K 在动画切换时会同时保留一个 .bubbles-remover 空列表；不能用
    // querySelector 的第一个结果，否则观察器会永久绑在占位节点上。
    const candidates = document.querySelectorAll<HTMLElement>(adapter.list);
    const list = Array.from(candidates).find((el) => !el.classList.contains('bubbles-remover')) ?? null;

    if (list) {
      setupObserver(list);
    }
    setTimeout(tryFind, 1000);
  };
  tryFind();
}

/**
 * 监听全局 video 播放，确保在全屏播放器 (Media Viewer) 中播放时也能自动捕获视频
 */
function startGlobalVideoDetection(): void {
  const handleGlobalVideo = (videoEl: HTMLVideoElement) => {
    const processGlobalVideo = () => {
      const videoUrl = videoEl.currentSrc || videoEl.src || '';
      if (videoUrl && !videoUrl.startsWith('data:')) {
        if (isWebK() && !isInsideMediaViewer(videoEl) && !videoUrl.startsWith('https://')) {
          return;
        }

        console.log('[TGDown] Global video observer captured URL:', videoUrl.slice(0, 60));

        // 查找最关联的气泡以获取文件名和缩略图
        // 优先从视频本身所在的媒体容器内取缩略图，而非在整个 bubble 范围内查找（避免误取头像）
        const mediaContainer = videoEl.closest<HTMLElement>('.media-inner, .attachment.media-container, .album-item-media');
        const activeBubble = videoEl.closest<HTMLElement>('.bubble, .Message');
        let thumbnailUrl = '';
        const thumbScope = mediaContainer || activeBubble;
        if (thumbScope) {
          // 精确选择器: A版 img.thumbnail, K版 img.media-photo/full-media
          const img = thumbScope.querySelector<HTMLImageElement>('img.thumbnail, img.media-photo, img.full-media');
          thumbnailUrl = img?.currentSrc || img?.src || '';
          if (!thumbnailUrl || thumbnailUrl.startsWith('data:image/svg')) {
            const canvas = thumbScope.querySelector<HTMLCanvasElement>('canvas.thumbnail');
            if (canvas) {
              try {
                thumbnailUrl = canvas.toDataURL('image/jpeg', 0.5);
              } catch { /* ignore */ }
            }
          }
        }

        cacheDetectedMediaIfNeeded(
          {
            kind: 'video',
            url: videoUrl,
            filename: generateFilename(activeBubble, 'mp4', null, videoUrl),
            domPath: '',
            thumbnailUrl,
          },
          mediaContainer ?? undefined,
        );
      }
    };

    const videoUrl = videoEl.currentSrc || videoEl.src || '';
    if (videoUrl) {
      processGlobalVideo();
    } else {
      videoEl.addEventListener('loadstart', processGlobalVideo, { once: true });
      videoEl.addEventListener('loadedmetadata', processGlobalVideo, { once: true });
    }
  };

  // 初始扫描 body 内的 video
  document.querySelectorAll('video').forEach(handleGlobalVideo);

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node instanceof HTMLVideoElement) {
          handleGlobalVideo(node);
        } else if (node instanceof HTMLElement) {
          node.querySelectorAll('video').forEach(handleGlobalVideo);
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * 缓存捕获到的媒体文件到 chrome.storage.local
 */
/**
 * 将 blob URL 图片缩放为最大 maxSize 像素的 JPEG 缩略图 (data URL).
 * 避免存储全尺寸图片导致 chrome.storage.local 超过 10MB 配额限制。
 * 适用于所有 kind 的缩略图 (image/video) 。
 */
async function createSmallThumbnail(blobUrl: string, maxSize = PANEL_THUMB_MAX_PX): Promise<string> {
  if (!blobUrl || !blobUrl.startsWith('blob:')) return blobUrl;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.naturalWidth || img.width || maxSize;
      let h = img.naturalHeight || img.height || maxSize;
      if (w > h) { h = Math.max(1, Math.round(h * maxSize / w)); w = maxSize; }
      else { w = Math.max(1, Math.round(w * maxSize / h)); h = maxSize; }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      resolve(dataUrl && dataUrl !== 'data:,' ? dataUrl : '');
    };
    img.onerror = () => resolve('');
    img.src = blobUrl;
  });
}

/**
 * 全局串行写入队列 — 防止并发读-改-写竞态条件导致条目丢失
 * 场景: 扫描相册时，图片和视频几乎同时调用 addMediaToCache，
 * 两次异步读取均读到相同的存储状态，后写抚盖前写，导致前一个条目丢失。
 */
let cacheWriteQueue: Promise<void> = Promise.resolve();

async function addMediaToCache(item: MediaItem): Promise<void> {
  // 将每次调用排队，确保每次写入完成后才进行下一次
  cacheWriteQueue = cacheWriteQueue
    .then(() => doAddMediaToCache(item))
    .catch((e) => console.error('[TGDown] cacheWriteQueue error', e));
  return cacheWriteQueue;
}

async function doAddMediaToCache(item: MediaItem): Promise<void> {
  if (!item.url || item.url.startsWith('data:image/svg')) return;
  try {
    const res = await chrome.storage.local.get('TGDown_detected_media');
    let list = res.TGDown_detected_media || [];

    // 检查是否已存在 (相同链接或者类型和名字都相同)
    const existingIndex = list.findIndex(
      (x: any) => x.url === item.url || (x.filename === item.filename && x.kind === item.kind)
    );

    if (existingIndex > -1) {
      const existingItem = list[existingIndex];
      const newPixels = item.thumbnailPixels || 0;
      const oldPixels = existingItem.thumbnailPixels || 0;
      let updated = false;

      const needsThumb =
        (!existingItem.thumbnailUrl || existingItem.thumbnailUrl.startsWith('data:image/svg')) &&
        item.thumbnailUrl;
      const sharperThumb = item.thumbnailUrl && newPixels > oldPixels;

      if (needsThumb || sharperThumb) {
        let finalThumbnailUrl = item.thumbnailUrl!;
        if (finalThumbnailUrl.startsWith('blob:')) {
          finalThumbnailUrl = await createSmallThumbnail(finalThumbnailUrl);
        }
        existingItem.thumbnailUrl = finalThumbnailUrl;
        if (newPixels > 0) existingItem.thumbnailPixels = newPixels;
        updated = true;
        console.info('[TGDown] Updated thumbnail for existing media:', item.kind, item.filename);
      }

      if (
        item.url &&
        item.filename === existingItem.filename &&
        item.url !== existingItem.url &&
        (newPixels > oldPixels ||
          (!String(existingItem.url).startsWith('https://') && item.url.startsWith('https://')))
      ) {
        existingItem.url = item.url;
        updated = true;
      }

      if (updated) {
        await chrome.storage.local.set({ TGDown_detected_media: list });
      }
      return;
    }

    let finalThumbnailUrl = item.thumbnailUrl || '';
    // 所有 blob URL 缩略图统一通过 createSmallThumbnail 缩放为 ≤80px JPEG
    // 避免全尺寸图片转 base64 超出 chrome.storage.local 10MB 配额
    if (finalThumbnailUrl.startsWith('blob:')) {
      finalThumbnailUrl = await createSmallThumbnail(finalThumbnailUrl);
    }

    const newItem: Record<string, unknown> = {
      id: 'TGDown_cache_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9),
      kind: item.kind,
      url: item.url,
      filename: item.filename,
      timestamp: Date.now(),
      thumbnailUrl: finalThumbnailUrl,
    };
    if (item.thumbnailPixels && item.thumbnailPixels > 0) {
      newItem.thumbnailPixels = item.thumbnailPixels;
    }

    list.unshift(newItem);
    if (list.length > 100) {
      list = list.slice(0, 100);
    }
    await chrome.storage.local.set({ TGDown_detected_media: list });
    console.info('[TGDown] Media item cached:', item.kind, item.filename);
  } catch (e) {
    console.error('[TGDown] Failed to cache media item', e);
  }
}

// ============================================================
//  按钮注入 + 点击 → dispatchEvent 到 page world
// ============================================================
const buttonRegistry = new WeakMap<Element, { host: HTMLElement; ctrl: ButtonController }>();

/**
 * 视频下载:
 *   1. 容器内已有 <video> → 直接下载
 *   2. 依次尝试多个候选 click 目标, 用 MO 监听 <video> 出现
 *      候选顺序: .album-item(data-mid) → img.media-photo → button.video-play → container
 */
async function downloadVideoFromContainer(
  container: HTMLElement,
  item: MediaItem,
  interceptor: Interceptor,
  ctrl?: ButtonController,
  cacheId?: string,
): Promise<void> {
  const startWithUrl = async (url: string, duration?: number) => {
    ctrl?.setState({ kind: 'loading' });
    await runDownloadWithPanelProgress(
      { ...item, url, duration: item.duration ?? duration, cacheId },
      interceptor,
      cacheId,
      ctrl,
    );
    void addMediaToCache({
      kind: 'video',
      url,
      filename: item.filename,
      duration: item.duration ?? duration,
      thumbnailUrl: item.thumbnailUrl,
    });
  };

  // ── 策略1: 容器内已存在 <video> ──
  const resolvedEarly = await resolveVideoDownloadUrl(container, item.url);
  if (resolvedEarly?.url) {
    console.log('[TGDown] 策略1: 容器内已有可下载 video URL');
    await startWithUrl(resolvedEarly.url, resolvedEarly.duration);
    return;
  }

  // ── 策略2: 依次尝试多个候选目标, MO 监听 <video> 出现 ──
  ctrl?.setState({ kind: 'loading' });
  const albumItem = container.closest<HTMLElement>('.album-item, .grouped-item, .album-item-select-wrapper');
  const mediaImg  = container.querySelector<HTMLElement>('img.media-photo, img.full-media, img, canvas.thumbnail, canvas');
  const playBtn   = container.querySelector<HTMLElement>('button.video-play, button.btn-circle.video-play, .icon-large-play, .icon-play');

  const candidates = [albumItem, mediaImg, playBtn, container].filter(
    (el): el is HTMLElement => el != null,
  );

  const resolver = { resolve: (_v: HTMLVideoElement | null) => {} };
  const videoPromise = new Promise<HTMLVideoElement | null>((resolve) => {
    resolver.resolve = resolve;
    const check = () => {
      const v = document.querySelector<HTMLVideoElement>(
        [
          '.media-viewer-mover video',
          '.media-viewer-aspecter video',
          '.media-viewer video',
          'video.media-video',
          '.media-viewer-container video',
          '.media-inner video',
        ].join(','),
      ) ?? container.querySelector<HTMLVideoElement>('video');
      if (v && (v.currentSrc || v.src)) {
        mo.disconnect();
        resolve(v);
      }
    };
    const mo = new MutationObserver(check);
    mo.observe(document.body, { childList: true, subtree: true });
    // 8s 超时后放弃
    setTimeout(() => { mo.disconnect(); resolve(null); }, 8000);
  });

  for (const target of candidates) {
    const rect = target.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const init: MouseEventInit = {
      bubbles: true, cancelable: true, view: window,
      clientX: cx, clientY: cy, screenX: cx, screenY: cy,
    };
    console.log('[TGDown] 尝试点击:', target.tagName, target.className.substring(0, 60));
    for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'] as const) {
      target.dispatchEvent(
        new (type.startsWith('pointer') ? PointerEvent : MouseEvent)(type, init),
      );
    }

    await new Promise((r) => setTimeout(r, 600));

    const quick = document.querySelector<HTMLVideoElement>(
      '.media-viewer-mover video, .media-viewer video, video.media-video, .media-inner video',
    ) ?? container.querySelector<HTMLVideoElement>('video');
    if (quick && (quick.currentSrc || quick.src)) {
      console.log('[TGDown] ✅ 点击 [' + target.tagName + '.' + target.className.split(' ')[0] + '] 成功触发 viewer');
      resolver.resolve(quick);
      break;
    }
  }

  const video = await videoPromise;

  if (!video) {
    console.error('[TGDown] ❌ 所有点击目标均无法触发 viewer');
    ctrl?.setState({ kind: 'error', message: t('content.cannotOpenVideo') });
    return;
  }

  const resolved = await resolveVideoDownloadUrl(container, pickBestVideoSrc(video) || item.url);
  if (!resolved?.url) {
    console.error('[TGDown] video 无有效下载链接');
    ctrl?.setState({ kind: 'error', message: t('content.noVideoUrl') });
    return;
  }

  console.log('[TGDown] 获取到 video src, 开始下载');
  await startWithUrl(resolved.url, resolved.duration ?? video.duration);
}


/**
 * 关闭 TG 的 media viewer
 * 优先级:
 *   1. 顶栏关闭按钮(.media-viewer-topbar 内的 btn-icon,通常是右上角 X)
 *   2. Esc 键(TG 默认 Esc 关闭 viewer)
 */
function closeMediaViewer(): boolean {
  // 策略 1: 找顶栏 of 关闭按钮
  // TG 的 .media-viewer-topbar 里有多个 btn-icon,关闭按钮通常是最后一个
  const topbar = document.querySelector('.media-viewer-topbar');
  if (topbar) {
    const buttons = topbar.querySelectorAll<HTMLElement>('button.btn-icon');
    if (buttons.length) {
      // 最后一个 btn-icon 通常是关闭
      const lastBtn = buttons[buttons.length - 1];
      lastBtn.click();
      return true;
    }
  }

  // 仅在发现大图/大视频查看器开启时,再发送 Esc 键
  const hasViewer = !!document.querySelector(
    '.media-viewer, .media-viewer-mover, .media-viewer-container'
  );
  if (hasViewer) {
    // 策略 2: 按 Esc
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }),
    );
    return true;
  }
  return false;
}

function injectButton(
  container: HTMLElement,
  item: MediaItem,
  onClick: (i: MediaItem) => void,
  interceptor: Interceptor,
) {
  if (buttonRegistry.has(container)) {
    return;
  }

  const hostEl = injectDownloadButton(container, item, (it) => {
    if (it.kind === 'video') {
      void downloadVideoFromContainer(container, it, interceptor, hostEl.ctrl);
    } else if (it.kind === 'image') {
      onClick(it);
    }
  });
  buttonRegistry.set(container, hostEl);
}

// ============================================================
//  兜底:doDownload — 单文件场景使用(由 interceptor 调)
//  大多数情况下按钮点击已经直接派发了 video_download 事件
//  这里保留作为 Interceptor.execute 的回退入口
// ============================================================
async function doDownload(item: MediaItem): Promise<void> {
  await dispatchDownload(item.url, item.filename, item.videoId, item.downloadId);
}

// ============================================================
//  Modal Host 加载(同前,保持不变)
// ============================================================
interface ShareInvitePayload {
  /** 提示条主文案, 例如「用得上？分享给朋友」 */
  title: string;
  /** 复制进剪贴板的一句话介绍(与链接一起复制) */
  pitch: string;
  /** 带 UTM 的站点链接 */
  url: string;
}

interface ModalApi {
  open(
    scene: 'LARGE_FILE' | 'REVIEW_INVITE',
    payload?: Record<string, unknown>,
  ): void;
  close(): void;
  toast(text: string): void;
  shareInvite(payload: ShareInvitePayload): void;
}

/**
 * 复制文本到剪贴板。
 * navigator.clipboard 在 content script 里要求 https + 文档聚焦, 偶发 NotAllowedError,
 * 所以保留 execCommand 兜底(临时 textarea + 选中)。
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* 落到 execCommand 兜底 */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

function loadModalHost(): ModalApi {
  let host: HTMLDivElement | null = null;
  let surface: HTMLDivElement | null = null;
  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  // An iframe creates a second document canvas. In dark mode that canvas can
  // briefly (or permanently, if its module fails) paint white over Telegram.
  // Use an in-page Shadow DOM instead: CSS remains isolated without another
  // document or any dependency on an iframe/Vue boot sequence.
  const ensureMounted = () => {
    if (surface) return surface;

    host = document.createElement('div');
    host.id = 'TGDown-modal-root';
    host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;background:transparent;';
    document.documentElement.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `
      :host { all: initial; }
      *, *::before, *::after { box-sizing: border-box; }
      .surface { position: fixed; inset: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif; color: #f8fafc; }
      .overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(8, 12, 24, .55); backdrop-filter: blur(6px); pointer-events: auto; }
      .card { width: min(420px, calc(100vw - 32px)); border-radius: 18px; padding: 28px 26px 22px; background: linear-gradient(160deg, #1a2236, #0f172a); box-shadow: 0 24px 64px rgba(0,0,0,.45); }
      h3 { margin: 0 0 8px; font-size: 17px; line-height: 1.4; color: #f1f5f9; }
      p { margin: 0 0 22px; color: #cbd5e1; font-size: 14px; line-height: 1.65; }
      .actions { display: flex; justify-content: flex-end; gap: 10px; }
      .option { display: flex; align-items: center; gap: 8px; margin: 0 0 18px; color: #cbd5e1; font-size: 13px; cursor: pointer; }
      .option input { accent-color: #3b82f6; }
      button { border: 0; border-radius: 10px; padding: 9px 16px; font: inherit; font-size: 13.5px; cursor: pointer; color: #cbd5e1; background: rgba(148,163,184,.12); }
      button.primary { color: #fff; background: linear-gradient(135deg, #3b82f6, #2563eb); }
      .toast { position: absolute; top: 22px; right: 22px; max-width: 360px; padding: 12px 16px; border-radius: 12px; color: #ecfdf5; background: rgba(15, 23, 42, .96); border: 1px solid rgba(74, 222, 128, .35); box-shadow: 0 12px 32px rgba(0,0,0,.35); pointer-events: auto; }
      /* 分享提示条: 比普通 toast 多一行操作, 排版改成两列网格 */
      .toast--share { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px 12px; align-items: start; max-width: 320px; }
      .toast__title { font-size: 13.5px; font-weight: 600; line-height: 1.5; }
      .toast__actions { grid-column: 1 / -1; display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; }
      .toast__btn { border: 0; border-radius: 8px; padding: 7px 13px; font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; color: #05230f; background: linear-gradient(135deg, #4ade80, #22c55e); }
      .toast__btn:disabled { cursor: default; color: #dcfce7; background: rgba(148, 163, 184, .22); }
      .toast__hint { flex: 1 1 auto; min-width: 0; font-size: 12px; color: #86efac; }
      .toast__close { border: 0; background: transparent; padding: 2px 5px; border-radius: 6px; font: inherit; font-size: 14px; line-height: 1; color: #86efac; cursor: pointer; }
      .toast__close:hover { background: rgba(148, 163, 184, .16); }
    `;
    surface = document.createElement('div');
    surface.className = 'surface';
    shadow.append(style, surface);
    return surface;
  };

  const unmount = () => {
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = null;
    host?.remove();
    host = null;
    surface = null;
  };

  /** 重排自动收起定时器 */
  const scheduleUnmount = (ms: number) => {
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(unmount, ms);
  };

  const closeLargeFile = () => {
    unmount();
    document.dispatchEvent(new CustomEvent('TGDown_cancel_download'));
  };

  return {
    open(scene, payload) {
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = null;
      const root = ensureMounted();
      root.replaceChildren();
      const overlay = document.createElement('div');
      overlay.className = 'overlay';
      const card = document.createElement('div');
      card.className = 'card';
      const title = document.createElement('h3');
      const desc = document.createElement('p');
      const actions = document.createElement('div');
      actions.className = 'actions';
      const cancel = document.createElement('button');
      const primary = document.createElement('button');
      primary.className = 'primary';

      if (scene === 'LARGE_FILE') {
        const sizeMB = payload?.sizeMB;
        const durationSec = payload?.durationSec;
        const details = [
          sizeMB ? `${sizeMB} MB` : '',
          durationSec ? `${Math.round(Number(durationSec) / 60)} min` : '',
        ].filter(Boolean).join(' · ');
        title.textContent = 'Large file download';
        desc.textContent = details
          ? `This file may take a while to download (${details}).`
          : 'This file may take a while to download.';
        cancel.textContent = 'Cancel';
        primary.textContent = 'Continue download';
        const option = document.createElement('label');
        option.className = 'option';
        const dontRemind = document.createElement('input');
        dontRemind.type = 'checkbox';
        option.append(dontRemind, 'Do not remind me again');
        cancel.addEventListener('click', closeLargeFile);
        overlay.addEventListener('click', (event) => {
          if (event.target === overlay) closeLargeFile();
        });
        primary.addEventListener('click', () => {
          unmount();
          document.dispatchEvent(new CustomEvent('TGDown_proceed_download', { detail: { dontRemind: dontRemind.checked } }));
          chrome.runtime.sendMessage({ type: MESSAGE_TYPES.PROCEED_DOWNLOAD }).catch(() => {});
        });
        card.append(title, desc, option, actions);
      } else {
        title.textContent = t('reviewInvite.title');
        desc.textContent = t('reviewInvite.desc', {
          count: Number(payload?.downloadCount ?? REVIEW_INVITE_THRESHOLD),
        });
        cancel.textContent = t('reviewInvite.noThanks');
        primary.textContent = t('reviewInvite.rateNow');
        cancel.addEventListener('click', unmount);
        primary.addEventListener('click', () => {
          unmount();
          window.open(REVIEW_INVITE_URL, '_blank', 'noopener,noreferrer');
        });
      }

      actions.append(cancel, primary);
      if (scene !== 'LARGE_FILE') card.append(title, desc, actions);
      overlay.append(card);
      root.append(overlay);
    },
    close() {
      unmount();
    },
    toast(text) {
      // The success message is intentionally empty in the content locale table.
      // Do not create any overlay merely to render an empty toast.
      if (!text.trim()) return;
      const root = ensureMounted();
      root.replaceChildren();
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = text;
      toast.addEventListener('click', unmount);
      root.append(toast);
      scheduleUnmount(4000);
    },
    shareInvite(payload) {
      const root = ensureMounted();
      root.replaceChildren();

      const toast = document.createElement('div');
      toast.className = 'toast toast--share';

      const title = document.createElement('strong');
      title.className = 'toast__title';
      title.textContent = payload.title;

      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'toast__close';
      close.textContent = '×';
      close.setAttribute('aria-label', 'close');
      close.addEventListener('click', (e) => {
        e.stopPropagation();
        unmount();
      });

      const actions = document.createElement('div');
      actions.className = 'toast__actions';
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'toast__btn';
      copy.textContent = t('content.shareInvite.action');
      const hint = document.createElement('span');
      hint.className = 'toast__hint';
      actions.append(copy, hint);

      copy.addEventListener('click', (e) => {
        e.stopPropagation();
        if (copy.disabled) return;
        copy.disabled = true;
        // 文案和链接一起复制: 直接粘进 Telegram / WhatsApp 就是一条完整消息
        void copyToClipboard(`${payload.pitch}\n${payload.url}`).then((ok) => {
          hint.textContent = ok
            ? t('content.shareInvite.copied')
            : t('content.shareInvite.copyFailed');
          // 失败就放开按钮让人再试一次
          if (!ok) copy.disabled = false;
          scheduleUnmount(ok ? 3200 : 6000);
        });
      });

      toast.append(title, close, actions);
      root.append(toast);
      // 9s: 比 4s 的普通 toast 长, 给用户反应 + 点按钮的时间
      scheduleUnmount(9000);
    },
  };
}
