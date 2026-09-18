/**
 * batch.ts — Telegram Web 搜索结果批量下载
 *
 * 竞品做法(从 2.0.2_0 逆向):
 *   - 容器: #column-right .search-super / .search-super-container-media.active
 *   - 列表项: .media-container(单个媒体)
 *   - 月份分组: .search-super-month
 *   - 故事: .search-super-container-stories.active
 *
 * 我们的实现:
 *   1. 监听搜索结果容器出现
 *   2. 在每个 .media-container 上覆盖一个 checkbox
 *   3. 顶部注入一个工具栏:
 *      - [全选] [取消全选] [下载选中 N 项] [本月全部下载] [全部下载]
 *   4. 工具栏明确标记批量下载免费
 *   5. 用户点批量 -> 派发 TGDown_batch_start 事件,page-injection 接管
 *
 * 所有批量入口均免费且不限制选择数量。
 */

import { watchSelector } from './dom-watcher';
import { t } from './_inline';

/** 在搜索结果及媒体视图中启用免费批量下载工具栏。 */
const BATCH_DETECTION_ENABLED = true;

const SEARCH_SELECTORS = [
  '#column-right .search-super',
  '.search-super-container-media.active',
  '.search-super-container-stories.active',
];

const MEDIA_CONTAINER_SELECTOR = '.search-super-container-media.active .media-container';
const STORY_CONTAINER_SELECTOR = '.search-super-container-stories.active .media-container';
const MONTH_SELECTOR = '.search-super-container-media.active .search-super-month';

const ICON_SVG_BATCH = `
<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
  <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
</svg>`;

export function startBatchDetection(): void {
  if (!BATCH_DETECTION_ENABLED) return;

  for (const sel of SEARCH_SELECTORS) {
    watchSelector(sel, () => {
      // 重新挂载工具栏(每次搜索内容变化可能需要刷新)
      if (!document.getElementById('TGDown-batch-toolbar')) {
        injectToolbar();
      }
      // 给每个新出现的 media-container 加 checkbox
      bindCheckboxes();
    });
  }
}

let toolbar: HTMLElement | null = null;

function injectToolbar() {
  const anchor =
    document.querySelector('#column-right .search-super') ||
    document.querySelector('.search-super-container-media.active') ||
    document.querySelector('.search-super-container-stories.active');
  if (!anchor) return;

  // 防重
  if (document.getElementById('TGDown-batch-toolbar')) return;

  toolbar = document.createElement('div');
  toolbar.id = 'TGDown-batch-toolbar';
  toolbar.style.cssText = `
    position: sticky;
    top: 0;
    z-index: 1000;
    margin: 8px 12px;
    padding: 10px 12px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(6, 182, 212, 0.95) 100%);
    color: #fff;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
    font-size: 13px;
  `;
  toolbar.innerHTML = `
    <span style="font-weight:600;letter-spacing:0.3px;">📦 Batch download</span>
    <button id="TGDown-batch-all" style="${btnStyle('ghost')}">全选</button>
    <button id="TGDown-batch-none" style="${btnStyle('ghost')}">取消</button>
    <span id="TGDown-batch-count" style="opacity:0.85;font-variant-numeric:tabular-nums;">已选 0</span>
    <span style="flex:1"></span>
    <button id="TGDown-batch-selected" style="${btnStyle('solid')}">
      ${ICON_SVG_BATCH}
      <span style="margin-left:4px;">下载选中</span>
    </button>
    <button id="TGDown-batch-month" style="${btnStyle('outline')}">本月全部</button>
    <button id="TGDown-batch-everything" style="${btnStyle('outline')}">全部下载</button>
  `;

  // 找好插入点
  const target = anchor.querySelector('.search-super-container-media.active') || anchor;
  target.prepend(toolbar);

  // 绑定按钮
  toolbar.querySelector('#TGDown-batch-all')!.addEventListener('click', () => toggleAll(true));
  toolbar.querySelector('#TGDown-batch-none')!.addEventListener('click', () => toggleAll(false));
  toolbar.querySelector('#TGDown-batch-selected')!.addEventListener('click', () => downloadSelected());
  toolbar.querySelector('#TGDown-batch-month')!.addEventListener('click', () => downloadMonth());
  toolbar.querySelector('#TGDown-batch-everything')!.addEventListener('click', () => downloadEverything());
}

function btnStyle(variant: 'solid' | 'outline' | 'ghost'): string {
  const base = `
    border: 0; cursor: pointer; border-radius: 8px; padding: 6px 10px;
    font-size: 12.5px; font-weight: 500; display: inline-flex;
    align-items: center; transition: background 0.15s, transform 0.1s;
  `;
  if (variant === 'solid') {
    return base + 'background:#fff;color:#0f172a;';
  }
  if (variant === 'outline') {
    return base + 'background:rgba(255,255,255,0.18);color:#fff;';
  }
  return base + 'background:rgba(255,255,255,0.1);color:#fff;';
}

// ============================================================
//  Checkbox 注入
// ============================================================
function bindCheckboxes() {
  const containers = [
    ...document.querySelectorAll<HTMLElement>(MEDIA_CONTAINER_SELECTOR),
    ...document.querySelectorAll<HTMLElement>(STORY_CONTAINER_SELECTOR),
  ];
  for (const c of containers) {
    if (c.querySelector('.TGDown-batch-cb')) continue;
    c.style.position ||= 'relative';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'TGDown-batch-cb';
    cb.style.cssText = `
      position: absolute;
      top: 6px;
      left: 6px;
      z-index: 5;
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #3b82f6;
    `;
    cb.addEventListener('change', updateCount);
    c.prepend(cb);
  }
  updateCount();
}

function updateCount() {
  const count = document.querySelectorAll<HTMLInputElement>('.TGDown-batch-cb:checked').length;
  const span = document.getElementById('TGDown-batch-count');
  if (span) span.textContent = t('content.batchSelected', { count });
}

function toggleAll(state: boolean) {
  document.querySelectorAll<HTMLInputElement>('.TGDown-batch-cb').forEach((cb) => {
    cb.checked = state;
  });
  updateCount();
}

// ============================================================
//  收集 URL
// ============================================================
function collectSelectedUrls(): string[] {
  const cbs = document.querySelectorAll<HTMLInputElement>('.TGDown-batch-cb:checked');
  const urls: string[] = [];
  cbs.forEach((cb) => {
    const container = cb.closest('.media-container') as HTMLElement | null;
    if (!container) return;
    // 找 video 优先,再 img
    const v = container.querySelector('video');
    if (v && (v.src || v.currentSrc)) {
      urls.push(v.currentSrc || v.src);
      return;
    }
    const img = container.querySelector('img');
    if (img && (img.src || img.currentSrc)) {
      urls.push(img.currentSrc || img.src);
    }
  });
  return urls;
}

function collectAllUrlsInScope(scope: 'visible' | 'month' | 'all'): string[] {
  const root =
    scope === 'all'
      ? document.body
      : scope === 'month'
        ? (document.querySelector(MEDIA_CONTAINER_SELECTOR) as HTMLElement)
        : (document.querySelector(MEDIA_CONTAINER_SELECTOR) as HTMLElement);
  if (!root) return [];
  const urls: string[] = [];
  root.querySelectorAll<HTMLElement>('.media-container').forEach((c) => {
    const v = c.querySelector('video');
    if (v && (v.src || v.currentSrc)) {
      urls.push(v.currentSrc || v.src);
      return;
    }
    const img = c.querySelector('img');
    if (img && (img.src || img.currentSrc)) {
      urls.push(img.currentSrc || img.src);
    }
  });
  return urls;
}

// ============================================================
//  下载动作(派发到 page-injection)
// ============================================================
function dispatchBatch(urls: string[]) {
  if (!urls.length) return;
  document.dispatchEvent(
    new CustomEvent('TGDown_batch_start', {
      detail: { items: urls.map((u) => ({ url: u })) },
    }),
  );
}

function downloadSelected() {
  const urls = collectSelectedUrls();
  dispatchBatch(urls);
}

function downloadMonth() {
  const urls = collectAllUrlsInScope('month');
  dispatchBatch(urls);
}

function downloadEverything() {
  const urls = collectAllUrlsInScope('all');
  dispatchBatch(urls);
}
