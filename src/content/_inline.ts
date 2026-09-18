/**
 * _inline.ts — content script 专用的 inline 共享常量
 *
 * 为什么有这个文件:
 *   Chrome content script 不能使用 ESM import 外部 chunk
 *   (会报 "Cannot use import statement outside a module")
 *   所以 content script 不能 import '@shared/constants'
 *   把 content 真正用到的常量全部在这里内联一份
 *
 * 保持与 src/shared/constants.ts 的值同步
 */

/** 与 src/shared/constants.ts 同步 */
export const LARGE_FILE_INTERCEPT_ENABLED = false;
export const LARGE_FILE_BYTES = 500 * 1024 * 1024;
export const LARGE_FILE_DURATION = 60 * 10;
export const REVIEW_INVITE_URL =
  'https://chromewebstore.google.com/detail/pobheilhkabfglljggbjlcphpcmdmdbn/reviews';
export const REVIEW_INVITE_THRESHOLD = 10;

/** 与 src/shared/constants.ts 同步 */
export const SHARE_INVITE_THRESHOLD = 3;
export const SHARE_INVITE_INTERVAL = 30;
export const SHARE_PAGE_URL = 'https://tgdown.wadesk.io/';

export const STORAGE_KEYS = {
  INSTALL_TIME: 'tgdesk.installedAt',
} as const;

export const MESSAGE_TYPES = {
  RECORD_DOWNLOAD_SUCCESS: 'RECORD_DOWNLOAD_SUCCESS',
  SHOW_MODAL: 'SHOW_MODAL',
  SHOW_TOAST: 'SHOW_TOAST',
  DOWNLOAD: 'DOWNLOAD',
  PROCEED_DOWNLOAD: 'PROCEED_DOWNLOAD',
  BLOCK_DOWNLOAD: 'BLOCK_DOWNLOAD',
} as const;

// ---------- Content Script 内联 i18n ----------
// Content Script 不能依赖外部 chunk，因此只内联页面注入按钮/提示所需文案。
export const LOCALE_STORAGE_KEY = 'tgdesk_locale';

type InlineLocale = 'en' | 'zh';

let inlineLocale: InlineLocale = 'en';

const inlineMessages: Record<InlineLocale, Record<string, string>> = {
  en: {
    'content.downloadDoneToast': '',
    'content.networkError': 'Network error — check your connection and try again.',
    'content.downloadFailed': 'Download failed',
    'content.noDownloadUrl': 'Could not get download URL',
    'content.handleDownloadFailed': 'Download handling failed',
    'content.cannotOpenVideo': 'Could not open video',
    'content.noVideoUrl': 'Could not get video URL — play the video in chat first',
    'content.batchSelected': 'Selected {count}',
    'content.batchProgress': '[Batch {current}/{total}] Downloading…',
    // 分享提示条(下载完成后出现)
    'content.shareInvite.title': 'Find it useful? Share it with a friend',
    'content.shareInvite.action': 'Copy link',
    'content.shareInvite.copied': 'Copied — paste it anywhere',
    'content.shareInvite.copyFailed': 'Could not copy, please copy manually',
    'content.shareInvite.pitch': 'TGDown — free, unlimited Telegram video downloads',
    // 评价邀请弹窗
    'reviewInvite.title': 'Enjoying TGDown?',
    'reviewInvite.desc': 'You have saved {count} files so far. A short review helps more people find it.',
    'reviewInvite.noThanks': 'Not now',
    'reviewInvite.rateNow': 'Rate it',
    'button.downloadTitle': 'Download',
    'button.waiting': 'Waiting…',
    'button.fetching': 'Fetching video…',
    'button.downloading': 'Downloading {percent}%',
    'button.done': 'Download complete',
    'button.failed': 'Download failed',
    'stories.downloadTitle': 'Download current Story',
  },
  zh: {
    'content.downloadDoneToast': '',
    'content.networkError': '网络异常，请检查网络重试',
    'content.downloadFailed': '下载失败',
    'content.noDownloadUrl': '无法获取下载地址',
    'content.handleDownloadFailed': '处理下载失败',
    'content.cannotOpenVideo': '无法打开视频',
    'content.noVideoUrl': '无法获取视频地址，请先在聊天中播放该视频',
    'content.batchSelected': '已选 {count}',
    'content.batchProgress': '[批量 {current}/{total}] 正在下载...',
    // 分享提示条(下载完成后出现)
    'content.shareInvite.title': '用得上？分享给朋友',
    'content.shareInvite.action': '复制链接',
    'content.shareInvite.copied': '已复制，去粘贴给朋友',
    'content.shareInvite.copyFailed': '复制失败，请手动复制',
    'content.shareInvite.pitch': 'TGDown —— 免费不限次数的 Telegram 视频下载插件',
    // 评价邀请弹窗
    'reviewInvite.title': '用着还顺手吗？',
    'reviewInvite.desc': '你已成功保存 {count} 个文件。一条评价能让更多人找到它。',
    'reviewInvite.noThanks': '暂不',
    'reviewInvite.rateNow': '去评价',
    'button.downloadTitle': '下载',
    'button.waiting': '等待下载...',
    'button.fetching': '正在获取视频...',
    'button.downloading': '下载中 {percent}%',
    'button.done': '下载完成',
    'button.failed': '下载失败',
    'stories.downloadTitle': '下载当前 Story',
  },
};

function normalizeInlineLocale(value: unknown): InlineLocale {
  const tag = String(value || '').toLowerCase().replace(/_/g, '-');
  return tag.startsWith('zh') ? 'zh' : 'en';
}

export async function initContentLocale(): Promise<void> {
  try {
    const res = await chrome.storage.local.get(LOCALE_STORAGE_KEY);
    const stored = res[LOCALE_STORAGE_KEY];
    if (stored && stored !== 'auto') {
      inlineLocale = normalizeInlineLocale(stored);
      return;
    }
  } catch {
    /* ignore */
  }

  try {
    inlineLocale = normalizeInlineLocale(chrome.i18n?.getUILanguage?.() || navigator.language);
  } catch {
    inlineLocale = normalizeInlineLocale(navigator.language);
  }
}

export function t(key: string, params?: Record<string, string | number>): string {
  const template = inlineMessages[inlineLocale][key] ?? inlineMessages.en[key] ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = params[name];
    return value === undefined ? `{${name}}` : String(value);
  });
}

/**
 * 生成分享链接。
 *
 * zh 用户直接给 /zh/ 路径: 站点开着 detectBrowserLanguage + redirectOn:'root',
 * 让根路径 `/` 去重定向会有把 query 丢掉的风险, 而带参丢 UTM 等于这次分享白做。
 * 其余语言走根路径, 由站点按收链接人的浏览器语言决定落到哪个 locale。
 */
export function buildShareUrl(): string {
  const url = new URL(inlineLocale === 'zh' ? '/zh/' : '/', SHARE_PAGE_URL);
  url.searchParams.set('utm_source', 'chrome_extension');
  url.searchParams.set('utm_medium', 'plugin_share');
  url.searchParams.set('utm_campaign', 'user_share');
  url.searchParams.set('hl', inlineLocale);
  return url.toString();
}

// ---------- 类型(纯 type,运行时无开销) ----------
export type MediaKind = 'video' | 'image' | 'file';

export interface MediaItem {
  kind: MediaKind;
  url: string;
  filename: string;
  duration?: number;
  size?: number;
  domPath?: string;
  videoId?: string;
  downloadId?: string;
  thumbnailUrl?: string;
  thumbnailPixels?: number;
  cacheId?: string;
  panelDispatch?: boolean;
}

export type InterceptScene = 'LARGE_FILE' | 'PLAYBACK_BLACK';

export type BgToContent =
  | { type: 'PROCEED_DOWNLOAD' }
  | { type: 'BLOCK_DOWNLOAD'; scene: InterceptScene };
