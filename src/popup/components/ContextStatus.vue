<script setup lang="ts">
/**
 * ContextStatus.vue — 当前 Tab 状态卡
 *
 * 通过 chrome.tabs.query + chrome.tabs.sendMessage 探测当前页:
 *   - 是否在 web.telegram.org
 *   - 是否在搜索结果页(可批量)
 *   - 当前 Tab 是否激活 stories
 *   - 当前 Tab 是否有未读 Toast
 *
 * 给用户一个"现在能用啥功能"的清晰反馈。
 */
import { ref, onMounted } from 'vue';

interface TabStatus {
  isTg: boolean;
  hasSearch: boolean;
}

const status = ref<TabStatus>({ isTg: false, hasSearch: false });
const loading = ref(true);

async function detect() {
  loading.value = true;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) {
      status.value = { isTg: false, hasSearch: false };
      return;
    }
    const isTg = /https:\/\/web\.telegram\.org\/(a|k)\//.test(tab.url);
    if (!isTg) {
      status.value = { isTg: false, hasSearch: false };
      return;
    }
    // 探测内容状态(content script 暴露一个 PING 接口)
    try {
      const res = await chrome.tabs.sendMessage(tab.id!, { type: 'TGDown_PING' });
      status.value = {
        isTg: true,
        hasSearch: !!res?.hasSearch,
      };
    } catch {
      status.value = { isTg: true, hasSearch: false };
    }
  } finally {
    loading.value = false;
  }
}

onMounted(detect);
</script>

<template>
  <section class="ctx">
    <div class="ctx__row">
      <div class="ctx__dot" :class="status.isTg ? 'ctx__dot--on' : 'ctx__dot--off'" />
      <div class="ctx__label">
        <template v-if="loading">检测中…</template>
        <template v-else-if="!status.isTg">
          未在 Telegram Web 页
        </template>
        <template v-else>
          Telegram Web · 已激活
        </template>
      </div>
    </div>
    <div v-if="status.isTg" class="ctx__features">
      <div class="ctx__feature" :class="{ 'ctx__feature--on': status.hasSearch }">
        <div class="ctx__feature-header">
          <span class="ctx__feature-icon">📦</span>
          <span class="ctx__feature-title">批量下载</span>
        </div>
        <span v-if="!status.hasSearch" class="ctx__feature-hint">在右侧边栏搜索媒体后可用</span>
        <span v-else class="ctx__feature-hint ctx__feature-hint--active">已就绪，可以在聊天列表中进行批量下载</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ctx {
  margin: 14px 18px 0;
  padding: 12px 14px;
  background: var(--tg-bg-elev);
  border: 1px solid var(--tg-border);
  border-radius: 12px;
  box-shadow: var(--tg-shadow);
}
.ctx__row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ctx__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.ctx__dot--on { background: var(--tg-success); box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.18); }
.ctx__dot--off { background: #475569; }
.ctx__label {
  font-size: 12.5px;
  color: var(--tg-text-dim);
  font-weight: 500;
}

.ctx__features {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
}
.ctx__feature {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: rgba(148, 163, 184, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 9px;
  font-size: 12px;
  color: var(--tg-text-dim);
  transition: all 0.15s;
}
.ctx__feature--on {
  background: rgba(34, 197, 94, 0.06);
  border-color: rgba(34, 197, 94, 0.25);
  color: var(--tg-text);
}
.ctx__feature-header {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ctx__feature-title {
  font-weight: 600;
}
.ctx__feature-icon {
  font-size: 14px;
}
.ctx__feature-hint {
  font-size: 11px;
  opacity: 0.8;
}
.ctx__feature-hint--active {
  color: var(--tg-success);
}
</style>
