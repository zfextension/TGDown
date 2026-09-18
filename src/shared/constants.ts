// 全局常量
/** 是否启用大文件下载拦截；false 时不弹大文件预警 */
export const LARGE_FILE_INTERCEPT_ENABLED = false;
export const LARGE_FILE_BYTES = 500 * 1024 * 1024; // 500MB
export const LARGE_FILE_DURATION = 60 * 10;    // 10 分钟视为大视频
export const REVIEW_INVITE_THRESHOLD = 10;
export const REVIEW_INVITE_URL =
  'https://chromewebstore.google.com/detail/pobheilhkabfglljggbjlcphpcmdmdbn/reviews';

// ---------- 分享提示(下载完成提示条) ----------
/** 第几次成功下载时首次展示分享提示 */
export const SHARE_INVITE_THRESHOLD = 3;
/** 首次之后的再次提醒间隔(以成功下载次数计) */
export const SHARE_INVITE_INTERVAL = 30;
/**
 * 分享链接的站点根地址。
 * 用正式域名 tgdown.wadesk.io: 走 locale 自动重定向, 让收链接的人看到自己的语言;
 * 旧域名 tgdown.wadesk.io 是 OSS 跳转页, 会丢掉 query(UTM 全无)。
 */
export const SHARE_PAGE_URL = 'https://tgdown.wadesk.io/';

export const STORAGE_KEYS = {
  INSTALL_TIME: 'TGDown.installedAt',
  DOWNLOAD_SUCCESS_COUNT: 'TGDown.downloadSuccessCount',
  REVIEW_INVITE_HANDLED: 'TGDown.reviewInviteHandled',
  /** 上次展示分享提示时的成功下载次数, 用于算间隔 */
  SHARE_INVITE_LAST_AT: 'TGDown.shareInviteLastAt',
} as const;

export const MESSAGE_TYPES = {
  RECORD_DOWNLOAD_SUCCESS: 'RECORD_DOWNLOAD_SUCCESS',
  SHOW_MODAL: 'SHOW_MODAL',
  SHOW_TOAST: 'SHOW_TOAST',
  DOWNLOAD: 'DOWNLOAD',
  PROCEED_DOWNLOAD: 'PROCEED_DOWNLOAD',
  BLOCK_DOWNLOAD: 'BLOCK_DOWNLOAD',
} as const;
