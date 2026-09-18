/**
 * Popup 下载进度同步（content 专用，须打进 content.js，不可 import @shared chunk）
 * 逻辑与 src/shared/download-tasks.ts 保持同步
 */
export const DOWNLOAD_TASKS_KEY = 'TGDown_download_tasks';
export const DETECTED_MEDIA_KEY = 'TGDown_detected_media';

export type DownloadTaskStatus = 'loading' | 'downloading' | 'done' | 'error' | 'cancelled';

export interface DownloadTaskRecord {
  status: DownloadTaskStatus;
  percent: number;
  videoId?: string;
  downloadId?: string;
  message?: string;
  updatedAt: number;
  sessionId?: string;
  tabId?: number;
}

export type DownloadSessionMeta = {
  sessionId: string;
  tabId?: number;
};

type DownloadTasksState = Record<string, DownloadTaskRecord>;

async function getDownloadTasks(): Promise<DownloadTasksState> {
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

export async function getDownloadTask(cacheId: string): Promise<DownloadTaskRecord | null> {
  const all = await getDownloadTasks();
  return all[cacheId] ?? null;
}

/** 与 shared/download-tasks.ts 中 resetCaptureStateOnReload 保持一致 */
export async function resetCaptureStateOnReload(): Promise<void> {
  await chrome.storage.local.set({
    [DETECTED_MEDIA_KEY]: [],
    [DOWNLOAD_TASKS_KEY]: {},
  });
}
