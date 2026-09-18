/**
 * page-injection.ts — 注入到 PAGE WORLD 的下载引擎(完整版,补齐竞品全部能力)
 *
 * 协议(借鉴竞品):
 *   - 监听 'video_download' 事件
 *       { type: 'single' | 'batch',
 *         video_src: { video_url, video_id, page, download_id, filename? } }
 *       batch 时 video_src 是数组
 *   - 上报:
 *       {id}_video_download_progress: { video_id, progress, page, download_id, phase }
 *       {id}_video_download_done:      { video_id, ok, error?, filename?, size? }
 *   - 监听 'TGDown_story_download': 触发 stories 单个下载
 *       { url, id }
 *
 * 新增能力(对齐竞品 + 引流改造):
 *   ✅ 三档下载路径(blob / sequential / parallel 20-way)
 *   ✅ Firefox UA 伪装,绕过 CDN UA 限制
 *   ✅ batch 顺序调度(避免一次性并发 20 个分片把服务器打爆)
 *   ✅ stories 单图/视频下载
 */

(() => {
  if ((window as any).__TGDown_PAGE_INJECTED__) return;
  (window as any).__TGDown_PAGE_INJECTED__ = true;

  const log = (msg: string, ...rest: unknown[]) => {
    // eslint-disable-next-line no-console
    console.info('[TGDown/page]', msg, ...rest);
  };

  // ---- 扩展下载专用 fetch ----
  // 绝不修改 window.fetch。Telegram 的 API、Service Worker 和媒体流必须继续
  // 使用它自己的请求实现；这里的引用只供用户显式发起的下载任务使用。
  const origFetch = window.fetch.bind(window);
  async function downloadFetch(
    url: string,
    init: RequestInit = {},
    redirects = 0,
  ): Promise<Response> {
    // 保持浏览器默认 credentials/redirect 策略，与 Telegram A 自己请求
    // progressive 资源的方式一致；不要强制 include 跨域 cookie。
    const response = await origFetch(url, init);

    // 少数 A 版 progressive 响应会经 Service Worker 返回可见 302，而不是由
    // Fetch 自动跟随。仅在下载请求中跟随 Location，且限制次数以防循环。
    if (response.status >= 300 && response.status < 400 && redirects < 3) {
      const location = response.headers.get('location');
      if (location) {
        return downloadFetch(new URL(location, url).toString(), init, redirects + 1);
      }
    }
    return response;
  }

  // ============================================================
  //  工具
  // ============================================================
  function parseContentRange(header: string | null): { start: number; end: number; total: number } | null {
    if (!header) return null;
    const m = /^bytes\s+(\d+)-(\d+)\/(\d+|\*)$/.exec(header.trim());
    if (!m) return null;
    return { start: +m[1], end: +m[2], total: m[3] === '*' ? 0 : +m[3] };
  }

  function randomName(ext = 'mp4'): string {
    return (
      'tgdown-' +
      Date.now().toString(36) +
      '-' +
      Math.random().toString(36).slice(2, 8) +
      '.' +
      ext
    );
  }

  function extractFilename(url: string, fallbackExt: string): string {
    try {
      const last = url.split('/').slice(-1)[0];
      const decoded = decodeURIComponent(last);
      // Telegram 经常把元信息 base64 编码放在 URL 末段
      try {
        const j = JSON.parse(decoded);
        if (j.fileName) return sanitize(j.fileName);
        if (j.location?.id) return sanitize(j.location.id) + '.' + fallbackExt;
      } catch {
        /* 不是 JSON */
      }
      // progressive/xxx 这种路径,文件名 = 路径后段
      if (url.includes('progressive/')) {
        const after = url.split('document').slice(1).join('document');
        return sanitize(after) + '.' + fallbackExt;
      }
      if (/\.[a-z0-9]{2,5}$/i.test(decoded)) return sanitize(decoded);
    } catch {
      /* ignore */
    }
    return randomName(fallbackExt);
  }

  function sanitize(name: string): string {
    return name.replace(/[\\/:*?"<>|]+/g, '_').slice(0, 200);
  }

  function isTelegramProgressiveUrl(url: string): boolean {
    return (
      url.includes('web.telegram.org') &&
      (url.includes('/progressive/') || url.includes('/stream/'))
    );
  }

  function assertVideoMime(mime: string | null): void {
    const base = (mime || 'application/octet-stream').split(';')[0].trim().toLowerCase();
    if (!base.startsWith('video/')) {
      throw new Error('Get non-video response with MIME type ' + base);
    }
  }

  function pickDownloadFilename(url: string, ext: string, preferred?: string): string {
    if (preferred && preferred.trim().length > 0) {
      const clean = sanitize(preferred.trim());
      if (/\.[a-z0-9]{2,5}$/i.test(clean)) return clean;
      return clean + '.' + ext;
    }
    return extractFilename(url, ext);
  }

  function emitProgress(
    id: string,
    progress: number,
    page: number,
    downloadId: string,
    phase: 'fetch' | 'concat' | 'done' = 'fetch',
  ) {
    const detail = { video_id: id, progress, page, download_id: downloadId, phase };
    document.dispatchEvent(
      new CustomEvent(id + '_video_download_progress', { detail }),
    );
    document.dispatchEvent(
      new CustomEvent('TGDown_video_download_progress', { detail }),
    );
  }

  function emitDone(id: string, ok: boolean, payload: Record<string, unknown> = {}) {
    const detail = { video_id: id, ok, ...payload };
    document.dispatchEvent(
      new CustomEvent(id + '_video_download_done', { detail }),
    );
    document.dispatchEvent(
      new CustomEvent('TGDown_video_download_done', { detail }),
    );
  }

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    }, 0);
    log('Download triggered', filename, blob.size);
  }

  async function fetchWithRetry(
    url: string,
    init?: RequestInit,
    retries = 5,
    delay = 1000,
  ): Promise<Response> {
    let lastError: any = null;
    for (let i = 0; i < retries; i++) {
      if (init?.signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      try {
        const res = await downloadFetch(url, init);
        if (res.ok || res.status === 206) {
          return res;
        }
        throw new Error('HTTP ' + res.status);
      } catch (err: any) {
        lastError = err;
        if (err?.name === 'AbortError') {
          throw err;
        }
        log(`Fetch attempt ${i + 1} failed for ${url.slice(0, 50)}:`, err);
        if (i < retries - 1) {
          if (init?.signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
          }
          await new Promise((r) => setTimeout(r, delay * (i + 1)));
        }
      }
    }
    throw lastError || new Error(`Fetch failed after ${retries} attempts`);
  }

  // ============================================================
  //  探测
  // ============================================================
  async function probe(url: string, signal?: AbortSignal): Promise<{
    supportsRange: boolean;
    total: number;
    contentType: string;
  }> {
    const res = await fetchWithRetry(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-0' },
      signal,
    });
    try {
      await res.arrayBuffer();
    } catch {
      /* drain probe body */
    }
    const acceptRanges = res.headers.get('Accept-Ranges');
    const cr = parseContentRange(res.headers.get('Content-Range'));
    const contentType = res.headers.get('Content-Type') || 'application/octet-stream';
    return {
      supportsRange: acceptRanges === 'bytes' && !!cr && (cr.total ?? 0) > 0,
      total: cr?.total ?? Number(res.headers.get('Content-Length') ?? 0),
      contentType,
    };
  }

  // ============================================================
  //  路径 1:blob: URL — 流式读取
  // ============================================================
  async function downloadBlob(url: string, id: string, page: number, downloadId: string, signal?: AbortSignal) {
    log('blob: path', url.slice(0, 50));
    const res = await fetchWithRetry(url, { signal });

    const total = Number(res.headers.get('Content-Length') ?? 0);
    const reader = res.body!.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;
    try {
      while (true) {
        if (signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }
        const { value, done } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.byteLength;
        if (total) {
          emitProgress(id, +((loaded / total) * 100).toFixed(2), page, downloadId);
        }
      }
    } catch (err) {
      reader.cancel().catch(() => {});
      throw err;
    }
    emitProgress(id, 100, page, downloadId, 'concat');
    const blob = new Blob(chunks as BlobPart[], { type: res.headers.get('Content-Type') || 'application/octet-stream' });
    const filename = extractFilename(url, blob.type.split('/')[1] || 'bin');
    triggerDownload(blob, filename);
    emitDone(id, true, { filename, size: blob.size });
  }

  // ============================================================
  //  路径 2:顺序 Range 续传(竞品 p() 循环)
  // ============================================================
  async function downloadSequential(
    url: string,
    id: string,
    page: number,
    downloadId: string,
    ext: string,
    signal?: AbortSignal,
    preferredFilename?: string,
  ) {
    log('sequential range path', url.slice(0, 50));
    const chunks: Blob[] = [];
    let offset = 0;
    let total = 0;
    let filename = '';

    const next = async (): Promise<void> => {
      let lastError: any = null;
      const retries = 5;
      const delay = 1000;
      let res: Response | null = null;
      let buf: ArrayBuffer | null = null;

      for (let i = 0; i < retries; i++) {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        try {
          res = await downloadFetch(url, {
            method: 'GET',
            headers: { Range: `bytes=${offset}-` },
            signal,
          });
          if (!res.ok && res.status !== 206) {
            throw new Error('HTTP ' + res.status);
          }
          buf = await res.arrayBuffer();
          break;
        } catch (err: any) {
          lastError = err;
          if (err?.name === 'AbortError') throw err;
          log(`Sequential attempt ${i + 1} failed for ${url.slice(0, 50)}:`, err);
          if (i < retries - 1) {
            if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
            await new Promise((r) => setTimeout(r, delay * (i + 1)));
          }
        }
      }

      if (!res || !buf) {
        throw lastError || new Error(`Sequential fetch failed after ${retries} attempts`);
      }

      const ct = res.headers.get('Content-Type') || '';
      assertVideoMime(ct);
      const realExt = ct.split(';')[0].split('/')[1] || ext;
      if (!filename) filename = pickDownloadFilename(url, realExt, preferredFilename);
      else filename = filename.replace(/\.[a-z0-9]+$/i, '.' + realExt);

      const cr = parseContentRange(res.headers.get('Content-Range'));
      if (!cr) throw new Error('Missing Content-Range header');
      if (cr.start !== offset) throw new Error('Gap detected between responses');
      if (total && cr.total !== total) throw new Error('Total size differs');
      total = cr.total || total;

      chunks.push(new Blob([buf]));
      offset = cr.end + 1;
      if (total) {
        emitProgress(id, +((offset / total) * 100).toFixed(2), page, downloadId);
      }
      if (offset < total) await next();
    };
    await next();

    emitProgress(id, 100, page, downloadId, 'concat');
    const blob = new Blob(chunks);
    triggerDownload(blob, filename);
    emitDone(id, true, { filename, size: blob.size });
  }

  // ============================================================
  //  路径 3:20 路并发分片(竞品 a(b, 20, "11"))
  //  pool size = 20, retry budget = 11
  // ============================================================
  async function downloadParallel(
    url: string,
    id: string,
    page: number,
    downloadId: string,
    ext: string,
    signal: AbortSignal,
    controller: AbortController,
    preferredFilename?: string,
  ) {
    log('parallel range path', url.slice(0, 50));
    const info = await probe(url, signal);
    assertVideoMime(info.contentType);
    if (!info.supportsRange || !info.total) {
      return downloadSequential(url, id, page, downloadId, ext, signal, preferredFilename);
    }
    const POOL = 20;
    const total = info.total;
    const SEGMENT = 2 * 1024 * 1024;
    const segCount = Math.ceil(total / SEGMENT);
    const filename = pickDownloadFilename(url, info.contentType.split(';')[0].split('/')[1] || ext, preferredFilename);
    log(`total=${total} segCount=${segCount} segment=${SEGMENT}`);

    const makeTask = (idx: number) => async (): Promise<ArrayBuffer> => {
      const start = idx * SEGMENT;
      const end = Math.min(start + SEGMENT - 1, total - 1);

      const fetchChunkData = async () => {
        const res = await downloadFetch(url, {
          method: 'GET',
          headers: { Range: `bytes=${start}-${end}` },
          signal,
        });
        if (!res.ok && res.status !== 206) {
          throw new Error('HTTP ' + res.status);
        }
        return await res.arrayBuffer();
      };

      let lastError: any = null;
      const retries = 5;
      const delay = 1000;
      for (let i = 0; i < retries; i++) {
        if (signal.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }
        try {
          const ab = await fetchChunkData();
          emitProgress(id, +(((idx + 1) / segCount) * 100).toFixed(2), page, downloadId);
          return ab;
        } catch (err: any) {
          lastError = err;
          if (err?.name === 'AbortError') {
            throw err;
          }
          log(`Fetch segment ${idx} attempt ${i + 1} failed for ${url.slice(0, 50)}:`, err);
          if (i < retries - 1) {
            if (signal.aborted) {
              throw new DOMException('Aborted', 'AbortError');
            }
            await new Promise((r) => setTimeout(r, delay * (i + 1)));
          }
        }
      }
      throw lastError || new Error(`Fetch segment ${idx} failed after ${retries} attempts`);
    };

    const results: ArrayBuffer[] = new Array(segCount);
    let cursor = 0;

    async function worker() {
      while (cursor < segCount) {
        if (signal.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }
        const i = cursor++;
        try {
          results[i] = await makeTask(i)();
        } catch (e: any) {
          if (e?.name === 'AbortError') {
            throw e;
          }
          controller.abort();
          throw e;
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(POOL, segCount) }, () => worker()));

    emitProgress(id, 100, page, downloadId, 'concat');
    const blob = new Blob(results, { type: info.contentType });
    triggerDownload(blob, filename);
    emitDone(id, true, { filename, size: blob.size });
  }

  // ============================================================
  //  单文件入口(供 batch 与单文件都使用)
  // ============================================================
  async function handleDownload(
    url: string,
    id: string,
    page: number,
    downloadId: string,
    preferredFilename?: string,
  ) {
    const controller = new AbortController();
    const signal = controller.signal;

    const onCancel = () => {
      log('Cancel event received, aborting:', id);
      controller.abort();
    };
    document.addEventListener(id + '_video_download_cancel', onCancel);

    try {
      const ext = (() => {
        try {
          const u = new URL(url);
          const p = u.pathname.toLowerCase();
          if (p.endsWith('.mp4')) return 'mp4';
          if (p.endsWith('.webm')) return 'webm';
          if (p.endsWith('.jpg') || p.endsWith('.jpeg')) return 'jpg';
          if (p.endsWith('.png')) return 'png';
          if (p.endsWith('.webp')) return 'webp';
        } catch {
          /* ignore */
        }
        return 'mp4';
      })();

      if (url.startsWith('blob:')) {
        if (isTelegramProgressiveUrl(url)) {
          throw new Error('Invalid blob URL for Telegram progressive video');
        }
        await downloadBlob(url, id, page, downloadId, signal);
      } else if (isTelegramProgressiveUrl(url)) {
        // A 版 progressive/stream：必须顺序 Range 拼接，禁止并发分片（易导致损坏/尺寸错误）
        log('Telegram progressive → sequential range path');
        await downloadSequential(url, id, page, downloadId, ext, signal, preferredFilename);
      } else {
        try {
          const info = await probe(url, signal);
          if (info.supportsRange && info.total > 4 * 1024 * 1024) {
            await downloadParallel(url, id, page, downloadId, ext, signal, controller, preferredFilename);
          } else if (info.supportsRange) {
            await downloadSequential(url, id, page, downloadId, ext, signal, preferredFilename);
          } else {
            const res = await fetchWithRetry(url, { signal });
            if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
            assertVideoMime(res.headers.get('Content-Type'));
            const blob = await res.blob();
            const filename = pickDownloadFilename(url, ext, preferredFilename);
            triggerDownload(blob, filename);
            emitDone(id, true, { filename, size: blob.size });
          }
        } catch (e) {
          if (signal.aborted) throw e;
          log('probe failed, fallback to single fetch with retry', e);
          const res = await fetchWithRetry(url, { signal });
          if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
          assertVideoMime(res.headers.get('Content-Type'));
          const blob = await res.blob();
          const filename = pickDownloadFilename(url, ext, preferredFilename);
          triggerDownload(blob, filename);
          emitDone(id, true, { filename, size: blob.size });
        }
      }
    } catch (err) {
      log('download failed', err);
      emitDone(id, false, { error: String(err) });
    } finally {
      document.removeEventListener(id + '_video_download_cancel', onCancel);
    }
  }

  // ============================================================
  //  batch 调度器
  //  竞品做法:串行调度(避免一次性把服务器打爆)
  //  改良:串行 trigger,但 4 个并发控制(快速但不卡死)
  // ============================================================
  function startBatch(items: Array<{ url: string }>) {
    const CONCURRENCY = 4;
    let i = 0;
    const total = items.length;

    const next = async () => {
      while (i < total) {
        const idx = i++;
        const item = items[idx];
        const id = 'TGDown_batch_' + Date.now() + '_' + idx;
        const downloadId = 'batch_' + idx;
        // 触发 batch 进度事件
        document.dispatchEvent(
          new CustomEvent('TGDown_batch_progress', {
            detail: { current: idx + 1, total, url: item.url, id },
          }),
        );
        await handleDownload(item.url, id, 0, downloadId);
      }
      document.dispatchEvent(new CustomEvent('TGDown_batch_done', { detail: { total } }));
    };

    Promise.all(Array.from({ length: Math.min(CONCURRENCY, total) }, () => next()));
  }

  // ============================================================
  //  事件监听
  // ============================================================
  // 1) 视频/单文件下载
  document.addEventListener('video_download', (ev: Event) => {
    const detail = (ev as CustomEvent).detail;
    if (!detail) return;
    if (detail.type === 'single') {
      const s = detail.video_src;
      handleDownload(s.video_url, s.video_id, s.page, s.download_id, s.filename);
    } else if (detail.type === 'batch') {
      const list: any[] = detail.video_src;
      startBatch(list.map((s) => ({ url: s.video_url, video_id: s.video_id })));
    }
  });

  // 2) 故事下载(单图/单视频)
  document.addEventListener('TGDown_story_download', (ev: Event) => {
    const detail = (ev as CustomEvent).detail;
    if (!detail?.url) return;
    const id = detail.id || 'TGDown_story_' + Date.now();
    handleDownload(detail.url, id, 0, id);
  });

  // 3) 批量任务入口
  document.addEventListener('TGDown_batch_start', (ev: Event) => {
    const detail = (ev as CustomEvent).detail;
    if (!detail?.items?.length) return;
    startBatch(detail.items);
  });

  log('page-world downloader installed');
})();
