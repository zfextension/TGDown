/**
 * dom-watcher.ts — 借鉴竞品的"等出现一次就断开"模式
 *
 * 比持续 MutationObserver 性能高一个数量级:
 *   - 第一次 querySelectorAll: 已存在 -> 直接回调,无 observer
 *   - 不存在:开 MutationObserver,找到后立即 disconnect
 *
 * 关键: 观察 document.documentElement(永远存在)而不是 document.body
 *       因为我们在 document_start 跑,此时 body 还没创建
 *
 * 用于:
 *   - video.media-video / img.media-photo 等可能在 SPA 切路由后才出现的元素
 *   - 避免对整个 document 持续观察
 */

const seen = new WeakSet<Element>();

/** 永远可用的根元素(document_start 时也能 observe) */
function getObserveRoot(): Element {
  return document.body || document.documentElement;
}

/**
 * 一次性等待选择器匹配的元素出现
 * @returns 找到就 resolve(数组),timeout 后 reject
 */
export function waitForSelectorAll(
  selector: string,
  timeout = 30000,
): Promise<Element[]> {
  return new Promise((resolve, reject) => {
    const found = document.querySelectorAll(selector);
    if (found.length) {
      resolve(Array.from(found));
      return;
    }
    const obs = new MutationObserver(() => {
      const f = document.querySelectorAll(selector);
      if (f.length) {
        obs.disconnect();
        resolve(Array.from(f));
      }
    });
    obs.observe(getObserveRoot(), { childList: true, subtree: true });
    setTimeout(() => {
      obs.disconnect();
      reject(new Error('waitForSelectorAll timeout: ' + selector));
    }, timeout);
  });
}

/**
 * 持续观察选择器(找到一次不停止,用于 SPA 多次出现)
 * 但用 seen 集合去重,避免重复回调
 */
export function watchSelector(
  selector: string,
  callback: (els: Element[]) => void,
): MutationObserver {
  // 首次扫描
  const initial = document.querySelectorAll(selector);
  if (initial.length) {
    const fresh = Array.from(initial).filter((el) => !seen.has(el));
    fresh.forEach((el) => seen.add(el));
    if (fresh.length) callback(fresh);
  }

  // 持续观察(对 SPA 路由切换)
  const obs = new MutationObserver(() => {
    const all = document.querySelectorAll(selector);
    const fresh: Element[] = [];
    all.forEach((el) => {
      if (!seen.has(el)) {
        seen.add(el);
        fresh.push(el);
      }
    });
    if (fresh.length) callback(fresh);
  });
  obs.observe(getObserveRoot(), { childList: true, subtree: true });
  return obs;
}
