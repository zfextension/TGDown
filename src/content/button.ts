/**
 * button.ts — 下载按钮注入器 v3 (进度状态机版)
 *
 * 状态:
 *   idle       → 下载图标，默认态
 *   loading    → 旋转圆圈，正在获取 video src
 *   downloading→ 进度环 + 百分比，正在下载
 *   done       → 勾图标，2s 后自动恢复 idle
 *   error      → × 图标，2s 后自动恢复 idle
 */

import { type MediaItem, t } from './_inline';

export type ButtonState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'downloading'; percent: number }
  | { kind: 'done' }
  | { kind: 'error'; message?: string };

export interface ButtonController {
  setState(state: ButtonState): void;
  remove(): void;
  currentVideoId?: string | null;
  currentDownloadId?: string | null;
}

/** 确保媒体容器拥有相对定位 */
function ensureRelativePosition(el: HTMLElement): void {
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
}

const R = 13; // 进度环半径
const CIRC = 2 * Math.PI * R; // 周长 ≈ 81.7

function buildShadow(shadow: ShadowRoot): {
  btn: HTMLElement;
  icon: HTMLElement;
  ring: SVGCircleElement | null;
  ringBg: SVGCircleElement | null;
  label: HTMLElement;
} {
  const style = document.createElement('style');
  style.textContent = `
    :host { all: initial; display: block; }

    .btn {
      all: initial;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 9px;
      background: rgba(37, 99, 235, 0.9);
      color: #fff;
      cursor: pointer;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 2px 12px rgba(0,0,0,0.35);
      transition: transform 0.15s ease, background 0.15s ease;
      opacity: 0.95;
      overflow: visible;
    }
    .btn:hover  { background: rgba(29, 78, 216, 1); transform: scale(1.07); opacity: 1; }
    .btn:active { transform: scale(0.93); }
    .btn[data-state="done"]  { background: rgba(22,163,74,0.85); opacity:1; cursor:default; }
    .btn[data-state="error"] { background: rgba(220,38,38,0.85); opacity:1; cursor:default; }
    .btn[data-state="loading"], .btn[data-state="downloading"] { cursor: default; }

    /* 图标层 */
    .icon { display: flex; align-items: center; justify-content: center; }
    .icon svg { display: block; pointer-events: none; }

    /* 进度环 SVG (绝对覆盖整个按钮) */
    .ring-svg {
      position: absolute;
      inset: 0;
      width: 34px;
      height: 34px;
      transform: rotate(-90deg);
      pointer-events: none;
      display: none;
    }
    .btn[data-state="downloading"] .ring-svg { display: block; }
    .ring-bg { stroke: rgba(255,255,255,0.2); fill: none; stroke-width: 2.5; }
    .ring-bar {
      stroke: #60a5fa;
      fill: none;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-dasharray: ${CIRC};
      stroke-dashoffset: ${CIRC};
      transition: stroke-dashoffset 0.35s ease;
    }

    /* 百分比标签 */
    .pct {
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      font: 600 9px/1 system-ui, sans-serif;
      color: #fff;
      text-shadow: 0 1px 3px rgba(0,0,0,0.8);
      white-space: nowrap;
      pointer-events: none;
      display: none;
    }
    .btn[data-state="loading"] .pct,
    .btn[data-state="downloading"] .pct { display: block; }

    /* 旋转动画(loading态) */
    @keyframes spin { to { transform: rotate(270deg); } }
    .spin-svg {
      display: none;
      animation: spin 0.8s linear infinite;
    }
    .btn[data-state="loading"] .icon svg { display: none; }
    .btn[data-state="loading"] .spin-svg  { display: block; }
  `;

  const btn = document.createElement('div');
  btn.className = 'btn';
  btn.dataset.state = 'idle';
  btn.title = t('button.downloadTitle');

  // 图标层
  const icon = document.createElement('div');
  icon.className = 'icon';
  icon.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
  </svg>`;

  // 旋转圆圈 (loading)
  const spinSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  spinSvg.setAttribute('viewBox', '0 0 24 24');
  spinSvg.setAttribute('width', '18');
  spinSvg.setAttribute('height', '18');
  spinSvg.classList.add('spin-svg');
  spinSvg.style.display = 'none';
  spinSvg.innerHTML = `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.5"
    stroke-dasharray="20 42" stroke-linecap="round"/>`;
  icon.appendChild(spinSvg);

  // 进度环 SVG
  const ringSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  ringSvg.classList.add('ring-svg');
  ringSvg.setAttribute('viewBox', '0 0 34 34');
  const ringBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  ringBg.setAttribute('cx', '17'); ringBg.setAttribute('cy', '17'); ringBg.setAttribute('r', String(R));
  ringBg.classList.add('ring-bg');
  const ringBar = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  ringBar.setAttribute('cx', '17'); ringBar.setAttribute('cy', '17'); ringBar.setAttribute('r', String(R));
  ringBar.classList.add('ring-bar');
  ringSvg.append(ringBg, ringBar);

  // 百分比标签
  const pct = document.createElement('div');
  pct.className = 'pct';
  pct.textContent = '0%';

  btn.append(icon, ringSvg, pct);
  shadow.append(style, btn);

  return { btn, icon, ring: ringBar, ringBg, label: pct };
}

/** 向媒体容器内注入下载按钮，返回 ButtonController */
export function injectDownloadButton(
  container: HTMLElement,
  item: MediaItem,
  onClick: (item: MediaItem) => void,
): { host: HTMLElement; ctrl: ButtonController } {
  ensureRelativePosition(container);

  const host = document.createElement('div');
  host.className = 'TGDown-btn-host';
  host.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 999;
    width: 34px;
    height: 34px;
    pointer-events: auto;
  `;

  const shadow = host.attachShadow({ mode: 'open' });
  const { btn, icon, ring, label } = buildShadow(shadow);

  let resetTimer: ReturnType<typeof setTimeout> | null = null;

  const ctrl: ButtonController = {
    setState(state) {
      if (resetTimer) { clearTimeout(resetTimer); resetTimer = null; }

      btn.dataset.state = state.kind;

      const normalSvg = icon.querySelector<SVGElement>('svg:not(.spin-svg)')!;
      const spinSvgEl = icon.querySelector<SVGElement>('.spin-svg')!;

      if (state.kind === 'idle') {
        normalSvg.style.display = '';
        spinSvgEl.style.display = 'none';
        if (ring) ring.style.strokeDashoffset = String(CIRC);
        label.textContent = '';
        btn.title = t('button.downloadTitle');

      } else if (state.kind === 'loading') {
        normalSvg.style.display = 'none';
        spinSvgEl.style.display = '';
        label.textContent = t('button.waiting');
        btn.title = t('button.fetching');

      } else if (state.kind === 'downloading') {
        normalSvg.style.display = 'none';
        spinSvgEl.style.display = 'none';
        const pct = Math.max(0, Math.min(100, state.percent));
        const offset = CIRC * (1 - pct / 100);
        if (ring) ring.style.strokeDashoffset = String(offset);
        label.textContent = pct + '%';
        btn.title = t('button.downloading', { percent: pct });

      } else if (state.kind === 'done') {
        normalSvg.style.display = '';
        spinSvgEl.style.display = 'none';
        normalSvg.innerHTML =
          '<path fill="currentColor" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>';
        btn.title = t('button.done');
        resetTimer = setTimeout(() => ctrl.setState({ kind: 'idle' }), 2500);

      } else if (state.kind === 'error') {
        normalSvg.style.display = '';
        spinSvgEl.style.display = 'none';
        normalSvg.innerHTML =
          '<path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>';
        btn.title = state.message ?? t('button.failed');
        resetTimer = setTimeout(() => ctrl.setState({ kind: 'idle' }), 2500);
      }
    },
    remove() {
      if (resetTimer) clearTimeout(resetTimer);
      host.remove();
    },
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    const cur = btn.dataset.state;
    if (cur === 'loading' || cur === 'downloading') {
      if (ctrl.currentVideoId) {
        document.dispatchEvent(
          new CustomEvent('TGDown_button_cancel', {
            detail: { videoId: ctrl.currentVideoId, downloadId: ctrl.currentDownloadId },
          }),
        );
      }
      ctrl.setState({ kind: 'idle' });
      return;
    }
    if (cur === 'done') return;
    onClick(item);
  });

  container.appendChild(host);
  return { host, ctrl };
}
