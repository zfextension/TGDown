<script setup lang="ts">
/**
 * BrandHeader.vue — 顶部品牌栏
 */
import { computed } from 'vue';
import { useI18n } from '@i18n/vue';
import type { TelegramWebVersion } from '@shared/telegram-web';

const props = defineProps<{
  isTg: boolean;
  telegramVersion: TelegramWebVersion | null;
  isUnsupportedTelegram: boolean;
  activating?: boolean;
}>();

const emit = defineEmits<{
  activate: [];
}>();

const { t } = useI18n();

const statusLabel = computed(() => {
  if (props.activating) return t('brand.statusActivating');
  if (props.telegramVersion) return `Telegram Web ${props.telegramVersion}`;
  if (props.isUnsupportedTelegram) return t('brand.statusUnsupported');
  return t('brand.statusInactive');
});

const statusTitle = computed(() => {
  if (props.activating) return t('brand.statusActivatingTitle');
  if (props.telegramVersion) {
    return t('brand.statusVersionTitle', { version: props.telegramVersion });
  }
  if (props.isUnsupportedTelegram) return t('brand.statusUnsupportedTitle');
  return t('brand.statusInactiveTitle');
});

</script>

<template>
  <div class="brand-header-group">
  <header class="brand-header">
    <div class="brand-header__left">
      <div class="brand-header__logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="tg-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#3b82f6" />
              <stop offset="100%" stop-color="#06b6d4" />
            </linearGradient>
          </defs>
          <path
            d="M21 4L3 11.5L8 13.5L10 19L13 16L18 20.5L21 4Z"
            fill="url(#tg-grad)"
          />
          <path d="M8 13.5L21 4" stroke="url(#tg-grad)" stroke-width="1.5" />
        </svg>
      </div>
      <div>
        <div class="brand-header__name">{{ t('brand.name') }}</div>
        <div class="brand-header__sub">{{ t('brand.subtitle') }}</div>
      </div>
    </div>

    <div class="brand-header__right">
      <button
        type="button"
        class="brand-header__status"
        :disabled="activating"
        :title="statusTitle"
        @click="emit('activate')"
      >
        <span class="brand-header__status-dot" :class="{ 'brand-header__status-dot--active': isTg }"></span>
        <span class="brand-header__status-text">{{ statusLabel }}</span>
      </button>

    </div>
  </header>
  </div>
</template>

<style scoped>
.brand-header-group {
  flex-shrink: 0;
  border-bottom: 1px solid var(--tg-border);
}

.brand-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.brand-header__left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.brand-header__logo {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: rgba(37, 99, 235, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.brand-header__logo svg { width: 16px; height: 16px; }
.brand-header__name {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: var(--tg-text);
  line-height: 1.2;
}
.brand-header__sub {
  font-size: 10px;
  color: var(--tg-text-dim);
  margin-top: 1px;
  line-height: 1.2;
}

.brand-header__right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.brand-header__status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 500;
  padding: 2px 6px;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 99px;
  color: var(--tg-text-dim);
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, border-color 0.15s;
}
.brand-header__status:hover:not(:disabled) {
  background: rgba(37, 99, 235, 0.1);
  border-color: rgba(37, 99, 235, 0.25);
  color: var(--tg-text);
}
.brand-header__status:disabled {
  cursor: wait;
  opacity: 0.7;
}
.brand-header__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #64748b;
}
.brand-header__status-dot--active {
  background: var(--tg-success);
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.2);
}

</style>
