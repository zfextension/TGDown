export {
  t,
  getLocale,
  setLocale,
  initLocale,
  getBrowserLocale,
  normalizeLocaleTag,
  loadStoredLocale,
  saveLocalePreference,
  subscribeLocale,
} from './core';
export { createI18nPlugin, useI18n, setupAppLocale, useLocaleReactive } from './vue';
export type { AppLocale, MessageTree } from './types';
export {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  LOCALE_DISPLAY_NAMES,
} from './types';
