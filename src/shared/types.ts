// 跨 content / background / modal / popup 共享的类型定义

/** 媒体类型 */
export type MediaKind = 'video' | 'image' | 'file';

/** 嗅探到的可下载媒体 */
export interface MediaItem {
  kind: MediaKind;
  /** 直接可下载的 URL(blob: / https: / data:) */
  url: string;
  /** 建议的文件名 */
  filename: string;
  /** 视频时长(秒,可选) */
  duration?: number;
  /** 预估字节数(可选,影响大文件拦截) */
  size?: number;
  /** 用于在 DOM 上唯一定位的 selector path(可选) */
  domPath?: string;
  videoId?: string;
  downloadId?: string;
  thumbnailUrl?: string;
  /** 缩略图源图像素面积 (naturalWidth×naturalHeight)，用于看板清晰度升级 */
  thumbnailPixels?: number;
  /** Popup 已捕获列表项 id，用于面板进度同步 */
  cacheId?: string;
  /** 内部标记：已由面板进度流程接管，直接 dispatch 下载 */
  panelDispatch?: boolean;
}

/** content -> background 消息 */
export type ContentToBg =
  | { type: 'RECORD_DOWNLOAD_SUCCESS' }
  | { type: 'SHOW_MODAL'; scene: InterceptScene; payload?: Record<string, unknown> }
  | { type: 'DOWNLOAD'; dataUrl: string; filename: string }
  | { type: 'SHOW_TOAST'; text: string };

/** background -> content 消息 */
export type BgToContent =
  | { type: 'PROCEED_DOWNLOAD' }
  | { type: 'BLOCK_DOWNLOAD'; scene: InterceptScene };

/** 拦截场景 */
export type InterceptScene = 'LARGE_FILE' | 'PLAYBACK_BLACK';
export type ModalScene = 'LARGE_FILE' | 'REVIEW_INVITE';
