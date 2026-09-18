<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from '@i18n/vue';
import type { AppLocale } from '@i18n/types';
import { LOCALE_DISPLAY_NAMES, SUPPORTED_LOCALES } from '@i18n/types';
import { loadStoredLocale } from '@i18n/core';

const { t, setLocale } = useI18n();
const selected = ref<string>('auto');

onMounted(async () => {
  selected.value = await loadStoredLocale();
});

async function onChange(ev: Event) {
  const value = (ev.target as HTMLSelectElement).value as AppLocale | 'auto';
  selected.value = value;
  await setLocale(value);
}
</script>

<template>
  <label class="lang-select">
    <span class="lang-select__label">{{ t('settings.language') }}</span>
    <select class="lang-select__control" :value="selected" @change="onChange">
      <option value="auto">{{ t('settings.languageAuto') }}</option>
      <option v-for="loc in SUPPORTED_LOCALES" :key="loc" :value="loc">
        {{ LOCALE_DISPLAY_NAMES[loc] }}
      </option>
    </select>
  </label>
</template>

<style scoped>
.lang-select {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--tg-text-dim);
}
.lang-select__label {
  white-space: nowrap;
}
.lang-select__control {
  font-size: 11px;
  padding: 3px 6px;
  border-radius: 6px;
  border: 1px solid var(--tg-border);
  background: var(--tg-bg-elev);
  color: var(--tg-text);
  max-width: 140px;
  cursor: pointer;
  font-family: inherit;
}
.lang-select__control:focus {
  outline: 2px solid rgba(37, 99, 235, 0.35);
  outline-offset: 1px;
}
</style>
