#!/usr/bin/env node
/**
 * pack-extension.mjs
 *
 * 在 vite build 之后把 dist/ 打成可上传 Chrome Web Store 的 zip。
 * 产物名: TGDown-downloader-<version>.zip (与 manifest.json 的 version 同步)
 *
 * 不引入额外依赖: 优先用系统 `zip` (macOS/Linux 自带),
 * 缺失时报错并提示安装。Windows 需先安装 zip (例如 via scoop/choco)。
 */

import { promises as fs } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const distDir = resolve(root, 'dist');
const manifestPath = resolve(distDir, 'manifest.json');

async function main() {
  const manifestRaw = await fs.readFile(manifestPath, 'utf-8').catch((err) => {
    console.error('[pack] 读取 dist/manifest.json 失败, 请先执行 vite build:', err.message);
    process.exit(1);
  });
  const { version } = JSON.parse(manifestRaw);
  const zipName = `TGDown-downloader-v${version}.zip`;
  const zipPath = resolve(root, zipName);

  await fs.rm(zipPath, { force: true });

  const result = spawnSync('zip', ['-r', '-q', '-X', zipPath, '.'], {
    cwd: distDir,
    stdio: 'inherit',
  });

  if (result.error) {
    console.error('[pack] 未找到 `zip` 命令, 请先安装 Info-ZIP。', result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`[pack] zip 失败 (exit ${result.status})`);
    process.exit(result.status ?? 1);
  }

  const stat = await fs.stat(zipPath);
  const kb = (stat.size / 1024).toFixed(1);
  console.info(`[pack] ${basename(zipPath)} (${kb} KiB) 可上传至 Chrome Web Store`);
}

main().catch((err) => {
  console.error('[pack] 打包失败:', err);
  process.exit(1);
});
