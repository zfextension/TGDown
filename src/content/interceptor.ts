/**
 * interceptor.ts — 拦截协同层
 *
 * 流程:
 *   1. 用户点击下载按钮 -> 调 handleDownload(item)
 *   2. 检查大文件(本地判定)
 *   3. 命中拦截场景 -> 通知 content/index 弹出 Shadow DOM Modal
 *   4. 用户在 Modal 选择继续后执行下载
 */

import { type MediaItem, type BgToContent, MESSAGE_TYPES, LARGE_FILE_BYTES, LARGE_FILE_DURATION, LARGE_FILE_INTERCEPT_ENABLED } from './_inline';

export type ModalScene = 'LARGE_FILE';

export type ModalEvent =
  | { kind: 'open'; scene: ModalScene; payload?: Record<string, unknown> }
  | { kind: 'close' }
  | { kind: 'toast'; text: string };

type ModalEmitter = (e: ModalEvent) => void;
type DownloadExecutor = (item: MediaItem) => Promise<void> | void;

export class Interceptor {
  private emit: ModalEmitter;
  private execute: DownloadExecutor;
  private proceedResolve: ((val: boolean) => void) | null = null;

  constructor(emit: ModalEmitter, execute: DownloadExecutor) {
    this.emit = emit;
    this.execute = execute;
  }

  /** 由 background 推送: 是否允许下载 / 触发弹窗 */
  handleBgMessage(msg: BgToContent): void {
    if (msg.type === 'BLOCK_DOWNLOAD') {
      // PLAYBACK_BLACK 是 Toast 场景,不走 modal
      if (msg.scene !== 'PLAYBACK_BLACK') {
        this.emit({ kind: 'open', scene: msg.scene });
      }
    } else if (msg.type === 'PROCEED_DOWNLOAD') {
      this.proceedResolve?.(true);
      this.proceedResolve = null;
    }
  }

  /**
   * 拦截处理入口
   * @returns true  表示拦截(没下载),需要等用户后续动作
   *          false 表示放行,已交由 execute
   */
  async handleDownload(item: MediaItem): Promise<boolean> {
    // 1) 预检:大文件拦截
    if (LARGE_FILE_INTERCEPT_ENABLED) {
      const isLarge =
        (item.size != null && item.size > LARGE_FILE_BYTES) ||
        (item.duration != null && item.duration > LARGE_FILE_DURATION);
      if (isLarge) {
        const storage = await new Promise<Record<string, any>>((resolve) => {
          chrome.storage.local.get(
            ['TGDown_disable_large_file_reminder', 'TGDown_last_large_file_reminder_time'],
            (res) => resolve(res || {}),
          );
        });

        const disableReminder = storage.TGDown_disable_large_file_reminder === true;
        const lastTime = storage.TGDown_last_large_file_reminder_time || 0;
        const oneDayMs = 24 * 60 * 60 * 1000;
        const isWithinOneDay = Date.now() - lastTime < oneDayMs;

        if (!disableReminder && !isWithinOneDay) {
          const proceed = await this.askLargeFile(item);
          if (!proceed) return true; // 用户在 Modal 选了关闭
        }
      }
    }

    // 2) 真正执行下载(交给 index.ts 注入的 execute)
    try {
      await this.execute(item);
    } catch (err) {
      console.error('[TGDown] download failed', err);
    }
    return false;
  }

  private askLargeFile(item: MediaItem): Promise<boolean> {
    return new Promise((resolve) => {
      const handleProceed = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        const dontRemind = detail?.dontRemind === true;

        chrome.storage.local.set({
          TGDown_last_large_file_reminder_time: Date.now(),
          TGDown_disable_large_file_reminder: dontRemind,
        });

        cleanup();
        resolve(true);
      };
      const handleCancel = () => {
        cleanup();
        resolve(false);
      };
      const cleanup = () => {
        document.removeEventListener('TGDown_proceed_download', handleProceed);
        document.removeEventListener('TGDown_cancel_download', handleCancel);
        this.proceedResolve = null;
      };

      this.proceedResolve = (val: boolean) => {
        if (val) {
          // 兜底保存
          chrome.storage.local.set({
            TGDown_last_large_file_reminder_time: Date.now(),
          });
        }
        cleanup();
        resolve(val);
      };

      document.addEventListener('TGDown_proceed_download', handleProceed);
      document.addEventListener('TGDown_cancel_download', handleCancel);

      this.emit({
        kind: 'open',
        scene: 'LARGE_FILE',
        payload: {
          sizeMB: item.size ? Math.round(item.size / 1024 / 1024) : undefined,
          durationSec: item.duration,
        },
      });
    });
  }
}
