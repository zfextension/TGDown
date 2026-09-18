/**
 * stories.ts — Telegram Web Stories 下载支持
 *
 * Telegram Web K 版 (web.telegram.org/k) 的 stories viewer:
 *   - 容器: #stories-viewer
 *   - 顶部工具栏: .media-viewer-topbar 或 stories 专属类
 *   - 当前 story 的资源: <video> 或 <img>
 *
 * 竞品做法:
 *   - 找到 .btn-icon 的下载按钮后调用 .click()
 *   - 或直接拿当前 media 元素的 src
 *
 * 我们的做法:
 *   - 注入一个 stories 专属的下载按钮到 viewer 顶部
 *   - 点击 -> dispatchEvent('tgdesk_story_download', { detail: { url, id } })
 *   - page-injection 接管下载
 */

import { watchSelector } from './dom-watcher';
import { t } from './_inline';

const STORIES_SELECTORS = [
  '#stories-viewer',
  // K 版专属
  '.stories-viewer',
  // 兜底
  '[class*="stories-viewer"]',
];

const STORIES_MEDIA_SELECTORS = [
  '#stories-viewer video',
  '#stories-viewer img',
  '.stories-viewer video',
  '.stories-viewer img',
];

const TOPBAR_SELECTORS = [
  '#stories-viewer .media-viewer-topbar',
  '#stories-viewer .topbar',
  '.stories-viewer .topbar',
  '#stories-viewer .btn-icon',
];

const ICON_SVG_DOWNLOAD = `
<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
  <path fill="currentColor" d="M5 20h14v-2H5v2zm7-18l-5.5 5.5 1.4 1.4L11 5.83V16h2V5.83l3.1 3.07 1.4-1.4L12 2z"/>
</svg>`;

export function startStoriesDetection(): void {
  for (const sel of STORIES_SELECTORS) {
    watchSelector(sel, () => injectStoriesButton());
  }
}

function injectStoriesButton() {
  // 防重复
  if (document.getElementById('tgdesk-stories-btn')) return;

  const viewer = document.querySelector(STORIES_SELECTORS.join(','));
  if (!viewer) return;

  const btn = document.createElement('div');
  btn.id = 'tgdesk-stories-btn';
  btn.title = t('stories.downloadTitle');
  btn.style.cssText = `
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 2147483646;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: rgba(15, 23, 42, 0.82);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    pointer-events: auto;
    transition: transform 0.15s, background 0.15s;
  `;
  btn.innerHTML = ICON_SVG_DOWNLOAD;
  btn.addEventListener('mouseenter', () => {
    btn.style.background = 'rgba(37, 99, 235, 0.95)';
    btn.style.transform = 'scale(1.06)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.background = 'rgba(15, 23, 42, 0.82)';
    btn.style.transform = 'scale(1)';
  });

  btn.addEventListener('click', async (e) => {
    e.stopPropagation();
    e.preventDefault();
    await downloadCurrentStory();
  });

  // 放在 shadow host 之外,作为 page world 的兄弟节点
  document.body.appendChild(btn);

  // 监听 stories 关闭,清理按钮
  const obs = new MutationObserver(() => {
    if (!document.body.contains(viewer) || viewer.getClientRects().length === 0) {
      btn.remove();
      obs.disconnect();
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

/**
 * 抓取当前 story 的媒体 URL 并派发下载事件
 */
async function downloadCurrentStory(): Promise<void> {
  // 1) 先找 video,再找 img
  const media = document.querySelector<HTMLMediaElement | HTMLImageElement>(
    STORIES_MEDIA_SELECTORS.join(','),
  );
  if (!media) {
    console.warn('[TGDesk] no story media found');
    return;
  }

  let url: string | null = null;
  if (media instanceof HTMLImageElement) {
    url = media.currentSrc || media.src;
  } else {
    // 优先 source,再 video.src
    const source = media.querySelector('source');
    url = (source?.src as string) || media.currentSrc || (media as HTMLVideoElement).src;
  }

  if (!url) {
    console.warn('[TGDesk] story media has no src');
    return;
  }

  document.dispatchEvent(
    new CustomEvent('tgdesk_story_download', {
      detail: { url, id: 'tgdesk_story_' + Date.now() },
    }),
  );
}
