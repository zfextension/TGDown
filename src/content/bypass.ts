/**
 * bypass.ts — 解除 Telegram Web 的下载限制(保守版)
 *
 * 历史教训:
 *   之前激进版在 document_start 注入 CSS + MutationObserver,
 *   干扰了 TG 的初始化流程,导致整页空白。
 *
 * 现在的策略:
 *   - document_start 阶段: 只安装最基础的事件 capture 监听
 *     (TG 自己的事件还没绑,我们的优先级最高,但只 stopPropagation 不 preventDefault)
 *   - window load 之后: 注入 CSS 解除 user-select(用户主动触发下载时才需要)
 *   - 不再 monkey-patch Object.defineProperty(破坏性太大)
 *   - 不再强制 video.controls = true(会破坏 TG 自定义播放器)
 *   - 不再使用 MutationObserver 全量监听(性能 + 干扰初始化)
 *
 * 核心思路: 我们是观察者,不是修改者。最小干预。
 */

/**
 * 通用事件 capture 监听器
 * 目标: 让我们的下载按钮能收到 click(不被 TG 的 capture 阶段吞掉)
 *
 * 关键: 只 stopPropagation,不 preventDefault!
 *   - stopPropagation: 阻止事件继续向上传播到 TG 自己的 capture handler
 *   - 不 preventDefault: 保留浏览器的默认行为(右键菜单等)
 */
function installEventCapture(): void {
  const HANDLED = [
    'contextmenu',
    'dragstart',
    'selectstart',
    'copy',
    'cut',
    'paste',
  ] as const;

  for (const evtName of HANDLED) {
    document.addEventListener(
      evtName,
      (e) => {
        const t = e.target as HTMLElement | null;
        if (!t) return;
        // 只对"我们关心的目标"阻断冒泡
        if (
          t.tagName === 'VIDEO' ||
          t.tagName === 'IMG' ||
          t.classList?.contains('TGDown-btn-host')
        ) {
          e.stopPropagation();
        }
      },
      { capture: true },
    );
  }
}

/**
 * 解除 user-select 限制 — 延迟到页面完全加载后
 *
 * 之前的问题: 用 !important 强制改 body * 的 user-select / pointer-events,
 * 把 TG 的 modal/overlay 系统也搞坏了。
 *
 * 现在: 用最窄的选择器,只针对可能被 TG 锁定的具体元素类型
 */
function unlockUserSelect(): void {
  if (document.getElementById('TGDown-unlock')) return;
  const style = document.createElement('style');
  style.id = 'TGDown-unlock';
  style.textContent = `
    /* 只解除媒体元素的用户选择限制,不影响其他 UI */
    video, img {
      -webkit-user-select: auto !important;
      user-select: auto !important;
      -webkit-user-drag: auto !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * 安装绕过
 *
 * 关键: 分两阶段
 *   - 立即(document_start): 只装事件 capture(无副作用,只是优先级)
 *   - 延迟(load 完成后): 注入解锁 CSS
 */
export function installBypass(): void {
  // === 阶段 1: 立即执行,只做事件 capture(纯观察,无副作用) ===
  installEventCapture();

  // === 阶段 2: 页面完全加载后再注入 CSS(不干扰初始化) ===
  const runUnlock = () => unlockUserSelect();
  if (document.readyState === 'complete') {
    // 页面已经 load 完毕,直接执行
    runUnlock();
  } else {
    // 等 load 事件(TG 已经完成首次渲染)
    window.addEventListener('load', () => {
      // 再加一个 RAF,确保 React 完成所有 commit
      requestAnimationFrame(runUnlock);
    });
  }
}
