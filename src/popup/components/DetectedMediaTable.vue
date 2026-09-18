<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  DOWNLOAD_TASKS_KEY,
  getDownloadTasks,
  removeDownloadTask,
  type DownloadTaskRecord,
  type DownloadTasksState,
} from '@shared/download-tasks';
import { isTelegramContentUrl, isTelegramWebUrl } from '@shared/telegram-web';
import { useI18n } from '@i18n/vue';

const { t } = useI18n();

interface CachedMediaItem {
  id: string;
  kind: 'image' | 'video';
  url: string;
  filename: string;
  timestamp: number;
  thumbnailUrl?: string;
}

const list = ref<CachedMediaItem[]>([]);
const downloadTasks = ref<DownloadTasksState>({});
const copiedId = ref<string | null>(null);
const brokenImages = ref<Set<string>>(new Set());
const errorMessage = ref('');

// 多选状态管理
const selectedIds = ref<Set<string>>(new Set());
const isAllSelected = ref(false);
const downloadingSelected = ref(false);

async function loadList() {
  try {
    const res = await chrome.storage.local.get('TGDown_detected_media');
    list.value = res.TGDown_detected_media || [];
    downloadTasks.value = await getDownloadTasks();
    syncSelection();
  } catch (e) {
    console.error('[TGDown] Failed to load detected media list', e);
  }
}

function handleStorageChange(changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) {
  if (areaName !== 'local') return;
  if (changes.TGDown_detected_media) {
    list.value = changes.TGDown_detected_media.newValue || [];
    syncSelection();
  }
  if (changes[DOWNLOAD_TASKS_KEY]) {
    downloadTasks.value = (changes[DOWNLOAD_TASKS_KEY].newValue as DownloadTasksState) || {};
  }
}

function getTask(itemId: string): DownloadTaskRecord | undefined {
  return downloadTasks.value[itemId];
}

function isTaskActive(task?: DownloadTaskRecord): boolean {
  return task?.status === 'loading' || task?.status === 'downloading';
}

function isTaskRetriable(task?: DownloadTaskRecord): boolean {
  return task?.status === 'error' || task?.status === 'cancelled';
}

function taskStatusLabel(task?: DownloadTaskRecord): string {
  if (!task) return '';
  if (task.status === 'loading') return t('media.taskLoading');
  if (task.status === 'downloading') {
    return t('media.taskDownloading', { percent: Math.round(task.percent) });
  }
  if (task.status === 'done') return t('media.taskDone');
  if (task.status === 'cancelled') return t('media.taskCancelled');
  if (task.status === 'error') return task.message || t('media.taskError');
  return '';
}

function downloadButtonTitle(item: CachedMediaItem): string {
  const task = getTask(item.id);
  if (isTaskRetriable(task)) return t('media.retryDownload');
  return t('media.download');
}

function syncSelection() {
  const validIds = new Set<string>();
  list.value.forEach((item) => {
    if (selectedIds.value.has(item.id)) {
      validIds.add(item.id);
    }
  });
  selectedIds.value = validIds;
  isAllSelected.value = list.value.length > 0 && selectedIds.value.size === list.value.length;
}

onMounted(() => {
  loadList();
  chrome.storage.onChanged.addListener(handleStorageChange);
});

onUnmounted(() => {
  chrome.storage.onChanged.removeListener(handleStorageChange);
});

async function cancelDownload(item: CachedMediaItem) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'TGDown_CANCEL_DOWNLOAD',
        cacheId: item.id,
      });
    }
  } catch (e) {
    console.error('[TGDown] cancel download error', e);
  }
}

async function triggerDownload(item: CachedMediaItem) {
  errorMessage.value = '';
  const task = getTask(item.id);
  if (isTaskActive(task)) return;

  if (isTaskRetriable(task)) {
    try {
      await removeDownloadTask(item.id);
      const { [item.id]: _removed, ...rest } = downloadTasks.value;
      downloadTasks.value = rest;
    } catch (e) {
      console.error('[TGDown] clear failed task error', e);
    }
  }

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const isTg = isTelegramContentUrl(tab?.url);
    const isUnsupportedTg = isTelegramWebUrl(tab?.url) && !isTg;

    if (isUnsupportedTg) {
      errorMessage.value = t('media.unsupportedTelegramPage');
      return;
    }

    if (tab?.id && isTg) {
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'TGDown_DOWNLOAD_CACHED_ITEM',
        cacheId: item.id,
        item: {
          kind: item.kind,
          url: item.url,
          filename: item.filename,
          thumbnailUrl: item.thumbnailUrl,
        },
      });
      if (!response?.ok) {
        errorMessage.value = response?.error || t('media.downloadTriggerError');
      }
    } else {
      if (item.url && !item.url.startsWith('blob:')) {
        const response = await chrome.runtime.sendMessage({
          type: 'DOWNLOAD',
          dataUrl: item.url,
          filename: item.filename
        });
        if (!response?.ok) {
          errorMessage.value = response?.error || t('media.downloadTriggerError');
        }
      } else {
        errorMessage.value = t('media.blobAlert');
      }
    }
  } catch (e) {
    console.error('[TGDown] download trigger error', e);
    errorMessage.value = t('media.downloadTriggerError');
  }
}

function copyLink(item: CachedMediaItem) {
  navigator.clipboard.writeText(item.url).then(() => {
    copiedId.value = item.id;
    setTimeout(() => {
      if (copiedId.value === item.id) copiedId.value = null;
    }, 1500);
  }).catch((err) => {
    console.error('Copy failed', err);
  });
}

async function clearList() {
  if (confirm(t('media.clearConfirm'))) {
    try {
      await chrome.storage.local.set({ TGDown_detected_media: [] });
      list.value = [];
      selectedIds.value.clear();
      isAllSelected.value = false;
      brokenImages.value.clear();
    } catch (e) {
      console.error(e);
    }
  }
}

function toggleSelectItem(id: string) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id);
  } else {
    selectedIds.value.add(id);
  }
  isAllSelected.value = list.value.length > 0 && selectedIds.value.size === list.value.length;
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value.clear();
    isAllSelected.value = false;
  } else {
    list.value.forEach((item) => selectedIds.value.add(item.id));
    isAllSelected.value = true;
  }
}

async function downloadSelected() {
  const selectedItems = list.value.filter(x => selectedIds.value.has(x.id));
  if (!selectedItems.length || downloadingSelected.value) return;

  downloadingSelected.value = true;
  try {
    for (const item of selectedItems) {
      await triggerDownload(item);
      await new Promise(r => setTimeout(r, 400));
    }
    selectedIds.value.clear();
    isAllSelected.value = false;
  } finally {
    downloadingSelected.value = false;
  }
}

function handleImgError(id: string) {
  brokenImages.value.add(id);
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
</script>

<template>
  <section class="media-cache">
    <div v-if="errorMessage" class="media-cache__error" role="alert">
      <span>{{ errorMessage }}</span>
      <button type="button" :aria-label="t('media.dismissError')" @click="errorMessage = ''">×</button>
    </div>
    <div class="media-cache__header">
      <div class="media-cache__title">
        <label v-if="list.length" class="media-cache__checkbox-label media-cache__checkbox-label--master">
          <input
            type="checkbox"
            :checked="isAllSelected"
            @change="toggleSelectAll"
            class="media-cache__checkbox"
          />
        </label>
        <span>{{ t('media.title') }}</span>
        <span v-if="list.length" class="media-cache__badge">{{ list.length }}</span>
      </div>

      <div class="media-cache__header-actions">
        <button
          v-if="selectedIds.size"
          class="media-cache__download-selected-btn"
          :disabled="downloadingSelected"
          @click="downloadSelected"
        >
          <template v-if="downloadingSelected">{{ t('media.downloadingSelected') }}</template>
          <template v-else>{{ t('media.downloadSelected', { count: selectedIds.size }) }}</template>
        </button>
        <button v-if="list.length" class="media-cache__clear-btn" @click="clearList">
          {{ t('media.clear') }}
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!list.length" class="media-cache__empty">
      <div class="media-cache__empty-icon">📁</div>
      <div class="media-cache__empty-text">{{ t('media.empty') }}</div>
      <div class="media-cache__empty-sub">{{ t('media.emptyHint') }}</div>
    </div>

    <!-- 列表数据 -->
    <div v-else class="media-cache__list">
      <div
        v-for="item in list"
        :key="item.id"
        class="media-cache__item"
        :class="{ 'media-cache__item--selected': selectedIds.has(item.id) }"
        @click="toggleSelectItem(item.id)"
      >
        <!-- 单选框 -->
        <div class="media-cache__select-col" @click.stop>
          <input
            type="checkbox"
            :checked="selectedIds.has(item.id)"
            @change="toggleSelectItem(item.id)"
            class="media-cache__checkbox"
          />
        </div>

        <!-- 缩略图列 -->
        <div class="media-cache__thumb-col">
          <img
            v-if="item.thumbnailUrl && !brokenImages.has(item.id)"
            :src="item.thumbnailUrl"
            class="media-cache__thumb-img"
            @error="handleImgError(item.id)"
            :alt="t('media.thumbAlt')"
            loading="lazy"
          />
          <div v-else class="media-cache__thumb-placeholder" :class="`media-cache__thumb-placeholder--${item.kind}`">
            <svg v-if="item.kind === 'image'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </div>
        </div>

        <!-- 信息区 -->
        <div class="media-cache__info">
          <div class="media-cache__filename" :title="item.filename">
            {{ item.filename }}
          </div>
          <div class="media-cache__meta">
            <span class="media-cache__time">{{ formatTime(item.timestamp) }}</span>
            <template v-if="getTask(item.id)">
              <span class="media-cache__sep">·</span>
              <span
                class="media-cache__task-status"
                :class="{
                  'media-cache__task-status--active': isTaskActive(getTask(item.id)),
                  'media-cache__task-status--error': getTask(item.id)?.status === 'error',
                  'media-cache__task-status--done': getTask(item.id)?.status === 'done',
                }"
              >
                {{ taskStatusLabel(getTask(item.id)) }}
              </span>
            </template>
          </div>
          <div
            v-if="isTaskActive(getTask(item.id))"
            class="media-cache__progress"
          >
            <div
              class="media-cache__progress-bar"
              :style="{ width: `${Math.round(getTask(item.id)?.percent ?? 0)}%` }"
            />
          </div>
        </div>

        <!-- 操作区 -->
        <div class="media-cache__actions" @click.stop>
          <template v-if="isTaskActive(getTask(item.id))">
            <button
              class="media-cache__action-btn media-cache__action-btn--cancel"
              :title="t('media.cancelDownload')"
              @click="cancelDownload(item)"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </template>
          <template v-else>
            <!-- 下载按钮 -->
            <button
              class="media-cache__action-btn media-cache__action-btn--download"
              :class="{ 'media-cache__action-btn--retry': isTaskRetriable(getTask(item.id)) }"
              :title="downloadButtonTitle(item)"
              @click="triggerDownload(item)"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.media-cache {
  margin: 14px 18px 8px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.media-cache__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-shrink: 0;
}
.media-cache__error {
  margin-bottom: 8px;
  padding: 8px 10px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 9px;
  color: #b91c1c;
  background: rgba(254, 226, 226, 0.68);
  font-size: 10.5px;
  line-height: 1.4;
}
.media-cache__error button { color: inherit; font-size: 15px; line-height: 1; }
.media-cache__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--tg-text);
}
.media-cache__badge {
  font-size: 10.5px;
  font-weight: 700;
  padding: 1px 6px;
  background: var(--tg-primary);
  color: #ffffff;
  border-radius: 999px;
  line-height: 1.2;
}

.media-cache__header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.media-cache__clear-btn {
  font-size: 11.5px;
  color: var(--tg-text-dim);
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.15s;
}
.media-cache__clear-btn:hover {
  color: var(--tg-danger);
  background: rgba(220, 38, 38, 0.05);
}

.media-cache__download-selected-btn {
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  background: var(--tg-primary);
  border-radius: 5px;
  padding: 3.5px 9px;
  border: 0;
  cursor: pointer;
  transition: background 0.15s;
}
.media-cache__download-selected-btn:hover:not(:disabled) {
  background: #1d4ed8;
}
.media-cache__download-selected-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 空状态 */
.media-cache__empty {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 24px 16px;
  background: var(--tg-bg-elev);
  border: 1px dashed var(--tg-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.media-cache__empty-icon {
  font-size: 24px;
  margin-bottom: 8px;
  opacity: 0.8;
}
.media-cache__empty-text {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--tg-text);
  margin-bottom: 3px;
}
.media-cache__empty-sub {
  font-size: 11px;
  color: var(--tg-text-dim);
  line-height: 1.4;
}

/* 复选框美化 */
.media-cache__checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.media-cache__checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 15px;
  height: 15px;
  border: 1.5px solid var(--tg-border);
  border-radius: 4px;
  outline: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tg-bg-elev);
  transition: all 0.15s;
  flex-shrink: 0;
  margin: 0;
}
.media-cache__checkbox:hover {
  border-color: var(--tg-primary);
}
.media-cache__checkbox:checked {
  background: var(--tg-primary);
  border-color: var(--tg-primary);
}
.media-cache__checkbox:checked::after {
  content: '';
  width: 7px;
  height: 3.5px;
  border-left: 1.5px solid #ffffff;
  border-bottom: 1.5px solid #ffffff;
  transform: rotate(-45deg) translate(0.5px, -0.5px);
}

.media-cache__select-col {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* 缩略图样式 */
.media-cache__thumb-col {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: #f1f5f9;
  border: 1px solid var(--tg-border);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
}
.media-cache__thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.media-cache__thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.media-cache__thumb-placeholder--image {
  background: rgba(37, 99, 235, 0.05);
  color: var(--tg-primary);
}
.media-cache__thumb-placeholder--video {
  background: rgba(8, 145, 178, 0.05);
  color: var(--tg-primary-2);
}

/* 列表区 */
.media-cache__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
}
/* 自定义滚动条 */
.media-cache__list::-webkit-scrollbar {
  width: 4px;
}
.media-cache__list::-webkit-scrollbar-track {
  background: transparent;
}
.media-cache__list::-webkit-scrollbar-thumb {
  background: var(--tg-border);
  border-radius: 99px;
}
.media-cache__list::-webkit-scrollbar-thumb:hover {
  background: var(--tg-text-dim);
}

.media-cache__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: var(--tg-bg-elev);
  border: 1px solid var(--tg-border);
  border-radius: 10px;
  box-shadow: var(--tg-shadow);
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s, background 0.15s;
}
.media-cache__item:hover {
  border-color: rgba(37, 99, 235, 0.25);
  transform: translateY(-0.5px);
}
.media-cache__item--selected {
  border-color: rgba(37, 99, 235, 0.35) !important;
  background: rgba(37, 99, 235, 0.02) !important;
}

.media-cache__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.media-cache__filename {
  font-size: 12px;
  font-weight: 600;
  color: var(--tg-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.media-cache__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  font-size: 10.5px;
  color: var(--tg-text-dim);
}
.media-cache__sep {
  opacity: 0.5;
}
.media-cache__task-status--active {
  color: var(--tg-primary);
  font-weight: 600;
}
.media-cache__task-status--error {
  color: var(--tg-danger);
}
.media-cache__task-status--done {
  color: var(--tg-success);
}
.media-cache__progress {
  margin-top: 4px;
  height: 4px;
  width: 100%;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 99px;
  overflow: hidden;
}
.media-cache__progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--tg-primary), #06b6d4);
  border-radius: 99px;
  transition: width 0.25s ease;
}
.media-cache__url-type {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}

.media-cache__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.media-cache__action-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--tg-text-dim);
  background: rgba(148, 163, 184, 0.08);
  border: 0;
  cursor: pointer;
  transition: all 0.15s;
}
.media-cache__action-btn:hover {
  color: var(--tg-primary);
  background: rgba(37, 99, 235, 0.1);
}
.media-cache__action-btn--copied {
  color: var(--tg-success) !important;
  background: rgba(22, 163, 74, 0.1) !important;
}
.media-cache__action-btn--download:hover {
  color: #ffffff;
  background: var(--tg-primary);
}
.media-cache__action-btn--retry {
  color: var(--tg-danger);
  background: rgba(220, 38, 38, 0.08);
}
.media-cache__action-btn--retry:hover {
  color: #ffffff;
  background: var(--tg-danger);
}
.media-cache__action-btn--cancel:hover {
  color: #ffffff;
  background: var(--tg-danger);
}
</style>
