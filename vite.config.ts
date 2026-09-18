import { defineConfig, type PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import { promises as fs } from 'node:fs';
import manifest from './manifest.json';

/**
 * 极简 Chrome 扩展构建配置
 *
 * 教训: @crxjs/vite-plugin 内部 Rollup 通道无法识别 TS 语法(`as` / `import type`),
 *       强行绕过的成本太高。改用 Vite 原生 MPA 构建 + 自定义 plugin 复制 manifest/icons。
 *
 * 入口:
 *   - popup.html         → popup.js
 *   - tutorial.html      → tutorial.js
 *   - content/index.ts   → content.js
 *   - page-injection.ts  → page-injection.js
 *   - service-worker.ts  → background.js
 */
export default defineConfig({
  plugins: [vue(), copyExtensionAssets()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@i18n': resolve(__dirname, 'src/i18n'),
    },
  },
  build: {
    // MPA 模式,不要 SPA fallback
    target: 'es2022',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        tutorial: resolve(__dirname, 'src/tutorial/index.html'),
        content: resolve(__dirname, 'src/content/index.ts'),
        'page-injection': resolve(__dirname, 'src/content/page-injection.ts'),
        background: resolve(__dirname, 'src/background/service-worker.ts'),
      },
      output: {
        // 显式指定 entry 文件名,与 manifest.json 对齐
        entryFileNames: (chunk) => {
          if (chunk.name === 'content') return 'content.js';
          if (chunk.name === 'page-injection') return 'page-injection.js';
          if (chunk.name === 'background') return 'background.js';
          return '[name].js';
        },
        // 默认 ES 格式(popup/modal 用)
        format: 'es',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (asset) =>
          asset.name?.endsWith('.css') ? '[name][extname]' : 'assets/[name][extname]',
        // 关键:content.js 是 content script,不能依赖外部 chunk
        // 把 src/shared/ 单独打到 chunks/(只 popup/modal 用)
        // content 已通过 _inline.ts 内联了常量(见 src/content/_inline.ts)
        manualChunks(id: string) {
          if (id.includes('src/shared/')) {
            return 'shared-chunk';
          }
          return undefined;
        },
      },
    },
  },
  esbuild: {
    target: 'es2022',
    legalComments: 'none',
  },
});

/**
 * copyExtensionAssets — 构建结束后,把 manifest.json + icons 复制到 dist/
 * 替代 @crxjs 的 manifest 处理逻辑
 */
function copyExtensionAssets(): PluginOption {
  return {
    name: 'copy-extension-assets',
    enforce: 'post',
    async closeBundle() {
      const dist = resolve(__dirname, 'dist');
      // 1. 写 manifest.json
      await fs.writeFile(
        resolve(dist, 'manifest.json'),
        JSON.stringify(manifest, null, 2),
        'utf-8',
      );
      // 2. 复制 _locales（Chrome 商店 / 浏览器 UI 语言）
      const localesSrc = resolve(__dirname, '_locales');
      const localesDst = resolve(dist, '_locales');
      await fs.cp(localesSrc, localesDst, { recursive: true }).catch(() => {
        console.warn('[TGDesk] _locales copy skipped (folder missing?)');
      });
      // 3. 复制 icons 目录
      const iconsSrc = resolve(__dirname, 'public/icons');
      const iconsDst = resolve(dist, 'icons');
      await fs.mkdir(iconsDst, { recursive: true });
      const entries = await fs.readdir(iconsSrc).catch(() => []);
      await Promise.all(
        entries.map(async (name) => {
          const src = resolve(iconsSrc, name);
          const dst = resolve(iconsDst, name);
          await fs.copyFile(src, dst);
        }),
      );
      // 4. 把 HTML 文件从 dist/src/... 提到 dist/ 根,并重写资源路径
      //    Vite 默认 base='/': HTML 里写 '/popup.js',放到 dist 根后
      //    必须改成 './popup.js' 才能在 chrome-extension:// 协议下解析
      const htmlMoves: Array<[string, string]> = [
        [resolve(dist, 'src/popup/index.html'), resolve(dist, 'popup.html')],
        [resolve(dist, 'src/tutorial/index.html'), resolve(dist, 'tutorial.html')],
      ];
      for (const [src, dst] of htmlMoves) {
        try {
          let html = await fs.readFile(src, 'utf-8');
          // 把绝对路径改成相对路径
          html = html
            .replace(/src="\//g, 'src="./')
            .replace(/href="\//g, 'href="./');
          await fs.writeFile(dst, html, 'utf-8');
          await fs.unlink(src);
        } catch {
          /* 文件不存在,忽略 */
        }
      }
      // 5. 清理空的 src 目录
      await fs.rm(resolve(dist, 'src'), { recursive: true, force: true });
      console.info('[TGDesk] manifest.json + icons + HTML flattened to dist/');
    },
  };
}
