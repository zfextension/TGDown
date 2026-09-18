/** Popup 面板与 content / background 共享的下载任务状态（chrome.storage.local） */
export const DOWNLOAD_TASKS_KEY = 'tgdesk_download_tasks';

/** Popup「已捕获媒体」列表（chrome.storage.local） */
export const DETECTED_MEDIA_KEY = 'tgdesk_detected_media';

export type DownloadTaskStatus = 'loading' | 'downloading' | 'done' | 'error' | 'cancelled';

export interface DownloadTaskRecord {
  status: DownloadTaskStatus;
  percent: number;
  videoId?: string;
  downloadId?: string;
  message?: string;
  updatedAt: number;
  /** content 脚本每次注入的唯一会话 */
  sessionId?: string;
  tabId?: number;
}

export type DownloadTasksState = Record<string, DownloadTaskRecord>;

export async function getDownloadTasks(): Promise<DownloadTasksState> {
  const res = await chrome.storage.local.get(DOWNLOAD_TASKS_KEY);
  return (res[DOWNLOAD_TASKS_KEY] as DownloadTasksState) || {};
}

export async function setDownloadTask(
  cacheId: string,
  patch: Partial<DownloadTaskRecord> & Pick<DownloadTaskRecord, 'status'>,
): Promise<void> {
  const all = await getDownloadTasks();
  const prev = all[cacheId];
  all[cacheId] = {
    status: patch.status,
    percent: patch.percent ?? prev?.percent ?? 0,
    videoId: patch.videoId ?? prev?.videoId,
    downloadId: patch.downloadId ?? prev?.downloadId,
    message: patch.message ?? prev?.message,
    sessionId: patch.sessionId ?? prev?.sessionId,
    tabId: patch.tabId ?? prev?.tabId,
    updatedAt: Date.now(),
  };
  await chrome.storage.local.set({ [DOWNLOAD_TASKS_KEY]: all });
}

export async function removeDownloadTask(cacheId: string): Promise<void> {
  const all = await getDownloadTasks();
  if (!all[cacheId]) return;
  delete all[cacheId];
  await chrome.storage.local.set({ [DOWNLOAD_TASKS_KEY]: all });
}

/** 清空捕获列表与面板下载状态 */
export async function resetCaptureStateOnReload(): Promise<void> {
  await chrome.storage.local.set({
    [DETECTED_MEDIA_KEY]: [],
    [DOWNLOAD_TASKS_KEY]: {},
  });
}

export type DownloadSessionMeta = {
  sessionId: string;
  tabId?: number;
};
