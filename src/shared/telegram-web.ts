/** Telegram Web K 版默认入口（content script 匹配 /k/*） */
export const TELEGRAM_WEB_K_URL = 'https://web.telegram.org/k/';

/** content script 注入的 Telegram Web 路径（与 manifest 一致） */
export const TELEGRAM_CONTENT_TAB_URLS = [
  'https://web.telegram.org/a/*',
  'https://web.telegram.org/k/*',
] as const;

/** 是否为已注入 content script 的 Telegram Web 页面（/a、/k） */
export function isTelegramContentUrl(url: string | undefined): boolean {
  if (!url) return false;
  return /^https:\/\/web\.telegram\.org\/(a|k)(?:\/|$)/i.test(url);
}

export type TelegramWebVersion = 'A' | 'K';

export function getTelegramWebVersion(url: string | undefined): TelegramWebVersion | null {
  if (!url) return null;
  const match = url.match(/^https:\/\/web\.telegram\.org\/(a|k)(?:\/|$)/i);
  return match ? (match[1].toUpperCase() as TelegramWebVersion) : null;
}

/** 是否为 Telegram Web 任意路径（含 /a、/k 及其它版本路径） */
export function isTelegramWebUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    return new URL(url).hostname === 'web.telegram.org';
  } catch {
    return false;
  }
}

/**
 * 激活扩展所依赖的 Telegram Web 环境：
 * - 当前 tab 是 Telegram Web 页面 → 刷新该页
 * - 当前 tab 不是 Telegram Web 页面 → 新开 K 版页面
 */
export async function activateTelegramWebTab(options: { active?: boolean } = {}): Promise<void> {
  const active = options.active ?? true;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id != null && isTelegramWebUrl(tab.url)) {
    await chrome.tabs.reload(tab.id);
    return;
  }
  await chrome.tabs.create({ url: TELEGRAM_WEB_K_URL, active });
}
