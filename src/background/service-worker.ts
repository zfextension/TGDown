/**
 * service-worker.ts — 后台 Service Worker
 *
 * 责任:
 *   - 处理来自 content / popup 的消息
 *   - 调 chrome.downloads 下载大文件(data: URL)
 *   - 安装时初始化数据
 */

import {
  MESSAGE_TYPES,
  STORAGE_KEYS,
  REVIEW_INVITE_THRESHOLD,
  SHARE_INVITE_THRESHOLD,
  SHARE_INVITE_INTERVAL,
} from '@shared/constants';
import { DETECTED_MEDIA_KEY, resetCaptureStateOnReload } from '@shared/download-tasks';
import { TELEGRAM_CONTENT_TAB_URLS } from '@shared/telegram-web';
import { type ContentToBg } from '@shared/types';

// ---------- 1. 安装时初始化 + 跳转引导页 ----------
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.local.set({
      [STORAGE_KEYS.INSTALL_TIME]: Date.now(),
    });

    // 跳转安装引导页
    const guideUrl = buildTrackingUrl(
      `${import.meta.env.VITE_BASE_URL}/ext-telegram-install-guide`,
      'install',
      'guide',
    );
    chrome.tabs.create({ url: guideUrl, active: true });

    console.info('[TGDesk] installed');
  }
});

// ---------- 1.1 设置卸载跳转链接 ----------
(async () => {
  const feedbackUrl = new URL(
    buildTrackingUrl(
      `${import.meta.env.VITE_BASE_URL}/ext-feedback`,
      'uninstall',
      'feedback',
    ),
  );
  feedbackUrl.searchParams.set('ext', 'telegram');
  feedbackUrl.searchParams.set('appId', 'pobheilhkabfglljggbjlcphpcmdmdbn');
  feedbackUrl.searchParams.set('install_time', String(await getInstallTimeSeconds()));
  chrome.runtime.setUninstallURL(feedbackUrl.toString());
})();

// ---------- 2. 消息路由 ----------
chrome.runtime.onMessage.addListener((msg: ContentToBg, _sender, sendResponse) => {
  handleMessage(msg)
    .then((res) => sendResponse(res))
    .catch((err) => {
      console.error('[TGDesk] bg handler error', err);
      sendResponse({ ok: false, error: String(err) });
    });
  return true; // 保持消息通道打开
});

async function handleMessage(msg: ContentToBg): Promise<any> {
  switch (msg.type) {
    case MESSAGE_TYPES.RECORD_DOWNLOAD_SUCCESS: {
      const reviewInvite = await recordCompletedDownload();
      return { ok: true, ...reviewInvite };
    }

    case MESSAGE_TYPES.DOWNLOAD: {
      const { dataUrl, filename } = msg;
      const id = await chrome.downloads.download({
        url: dataUrl,
        filename: sanitize(filename),
        saveAs: false,
        conflictAction: 'uniquify',
      });
      return { ok: true, id };
    }

    default:
      return { ok: false, error: 'UNKNOWN_MESSAGE' };
  }
}

function sanitize(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, '_').slice(0, 200);
}

/**
 * 记录一次成功下载, 并决定这一次要不要弹邀请。
 *
 * 两条邀请链路共用同一个"成功下载次数", 但同一次下载最多只出一次:
 *   - 评价邀请: 只在第 10 次(REVIEW_INVITE_THRESHOLD)触发一次, 优先
 *   - 分享提示: 第 3 次首次出现, 之后每 30 次提醒一次
 */
async function recordCompletedDownload(): Promise<{
  showReviewInvite: boolean;
  showShareInvite: boolean;
  downloadCount: number;
}> {
  const res = await chrome.storage.local.get([
    STORAGE_KEYS.DOWNLOAD_SUCCESS_COUNT,
    STORAGE_KEYS.REVIEW_INVITE_HANDLED,
    STORAGE_KEYS.SHARE_INVITE_LAST_AT,
  ]);
  const prev = Number(res[STORAGE_KEYS.DOWNLOAD_SUCCESS_COUNT] || 0);
  const downloadCount = prev + 1;
  const alreadyHandled = res[STORAGE_KEYS.REVIEW_INVITE_HANDLED] === true;
  const showReviewInvite = !alreadyHandled && downloadCount >= REVIEW_INVITE_THRESHOLD;

  // lastShareAt 为 0 表示从未展示过 -> 到达首展阈值就出; 之后按间隔算。
  // 老用户(装了这个版本时已有几十次下载)lastShareAt 同样是 0, 下一次下载补一次提示。
  const lastShareAt = Number(res[STORAGE_KEYS.SHARE_INVITE_LAST_AT] || 0);
  const showShareInvite =
    !showReviewInvite &&
    (lastShareAt === 0
      ? downloadCount >= SHARE_INVITE_THRESHOLD
      : downloadCount - lastShareAt >= SHARE_INVITE_INTERVAL);

  await chrome.storage.local.set({
    [STORAGE_KEYS.DOWNLOAD_SUCCESS_COUNT]: downloadCount,
    ...(showReviewInvite ? { [STORAGE_KEYS.REVIEW_INVITE_HANDLED]: true } : {}),
    ...(showShareInvite ? { [STORAGE_KEYS.SHARE_INVITE_LAST_AT]: downloadCount } : {}),
  });

  return { showReviewInvite, showShareInvite, downloadCount };
}

// ---------- 4. Telegram Web 标签页生命周期：刷新 / 关闭 / 离开 ----------
async function clearCaptureStateIfNoTelegramTabs(): Promise<void> {
  const tabs = await chrome.tabs.query({ url: [...TELEGRAM_CONTENT_TAB_URLS] });
  if (tabs.length === 0) {
    await resetCaptureStateOnReload();
  }
}

chrome.tabs.onRemoved.addListener(() => {
  void clearCaptureStateIfNoTelegramTabs();
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url?.startsWith('https://web.telegram.org/')) {
    void resetCaptureStateOnReload();
    return;
  }
  if (changeInfo.url) {
    void clearCaptureStateIfNoTelegramTabs();
  }
});

// ---------- 5. 徽章角标管理 ----------
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes[DETECTED_MEDIA_KEY]) {
    const list = changes[DETECTED_MEDIA_KEY].newValue || [];
    updateBadge(list.length);
  }
});

// 初始化启动时读取已有缓存并展示角标数
chrome.storage.local.get(DETECTED_MEDIA_KEY).then((res) => {
  const list = res[DETECTED_MEDIA_KEY] || [];
  updateBadge(list.length);
}).catch(() => {});

function updateBadge(count: number) {
  const text = count > 0 ? String(count) : '';
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color: '#2563eb' });
}

// ---------- 6. 追踪 URL 构建 ----------

/** 构建带 UTM 参数的追踪 URL */
function buildTrackingUrl(
  baseUrl: string,
  trigger: 'install' | 'uninstall',
  type: 'guide' | 'feedback',
): string {
  const manifest = chrome.runtime.getManifest();
  const version = manifest.version;
  const locale = chrome.i18n.getUILanguage();

  const url = new URL(baseUrl);
  const siteLocale = mapSiteLocale(locale);
  if (siteLocale !== 'en') {
    url.pathname = `/${siteLocale}${url.pathname.startsWith('/') ? url.pathname : `/${url.pathname}`}`;
  }
  url.searchParams.set('utm_source', 'chrome_extension');
  url.searchParams.set('utm_medium', `plugin_${trigger}`);
  url.searchParams.set('utm_campaign', type);
  url.searchParams.set('version', version);
  url.searchParams.set('hl', locale);

  return url.toString();
}

/**
 * 将 Chrome UI 语言映射到独立站的路由前缀。
 *
 * 独立站只发布 en + zh 两个 locale（见官网 nuxt.config.ts 的 i18n.locales），
 * 其余语言没有对应的预渲染页面，加前缀只会落进 404 —— 一律回落到英文根路径。
 * 原始语言码仍由 buildTrackingUrl 的 `hl` 参数原样上报，归因统计不受影响。
 */
function mapSiteLocale(locale: string): 'en' | 'zh' {
  const tag = locale.toLowerCase().replace('_', '-');
  // 覆盖 zh-CN / zh-TW / zh-HK / zh-Hant：繁体用户读简体页，也好过读英文
  if (tag.startsWith('zh')) return 'zh';
  return 'en';
}

/** 读取真实安装时间（秒级），回退为当前时间 */
async function getInstallTimeSeconds(): Promise<number> {
  try {
    const res = await chrome.storage.local.get(STORAGE_KEYS.INSTALL_TIME);
    const ts = res?.[STORAGE_KEYS.INSTALL_TIME];
    if (typeof ts === 'number' && ts > 0) return Math.floor(ts / 1000);
  } catch {
    // 忽略错误，回退到当前时间
  }
  return Math.floor(Date.now() / 1000);
}
