import type { AppLocale, MessageTree } from './types';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from './types';
import { localeMessages } from './locales';

let currentLocale: AppLocale = DEFAULT_LOCALE;
const listeners = new Set<() => void>();

function getNested(tree: MessageTree | undefined, key: string): string | undefined {
  const parts = key.split('.');
  let node: string | MessageTree | undefined = tree;
  for (const part of parts) {
    if (!node || typeof node === 'string') return undefined;
    node = node[part];
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const v = params[name];
    return v === undefined ? `{${name}}` : String(v);
  });
}

/** 将 chrome.i18n / navigator 语言标签映射为 AppLocale */
export function normalizeLocaleTag(tag: string): AppLocale {
  const raw = (tag || '').trim().replace(/_/g, '-');
  const lower = raw.toLowerCase();

  const direct = SUPPORTED_LOCALES.find((l) => l.toLowerCase() === lower);
  if (direct) return direct;

  if (lower.startsWith('zh')) {
    if (lower.includes('tw') || lower.includes('hk') || lower.includes('hant')) return 'zh-TW';
    return 'zh-CN';
  }
  if (lower.startsWith('pt')) return 'pt-BR';

  const base = lower.split('-')[0];
  const baseMap: Record<string, AppLocale> = {
    en: 'en',
    ru: 'ru',
    de: 'de',
    es: 'es',
    fr: 'fr',
    ja: 'ja',
    ko: 'ko',
    ar: 'ar',
    id: 'id',
    tr: 'tr',
    uk: 'uk',
    vi: 'vi',
    it: 'it',
    pl: 'pl',
  };
  return baseMap[base] ?? DEFAULT_LOCALE;
}

export function getBrowserLocale(): AppLocale {
  try {
    if (typeof chrome !== 'undefined' && chrome.i18n?.getUILanguage) {
      return normalizeLocaleTag(chrome.i18n.getUILanguage());
    }
  } catch {
    /* ignore */
  }
  return normalizeLocaleTag(typeof navigator !== 'undefined' ? navigator.language : DEFAULT_LOCALE);
}

export function getLocale(): AppLocale {
  return currentLocale;
}

export function setLocale(locale: AppLocale): void {
  if (!SUPPORTED_LOCALES.includes(locale)) return;
  if (currentLocale === locale) return;
  currentLocale = locale;
  listeners.forEach((fn) => fn());
}

export function subscribeLocale(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function loadStoredLocale(): Promise<AppLocale | 'auto'> {
  try {
    const res = await chrome.storage.local.get(LOCALE_STORAGE_KEY);
    const stored = res[LOCALE_STORAGE_KEY];
    if (stored === 'auto' || stored === undefined || stored === null) return 'auto';
    if (SUPPORTED_LOCALES.includes(stored as AppLocale)) return stored as AppLocale;
  } catch {
    /* ignore */
  }
  return 'auto';
}

export async function saveLocalePreference(value: AppLocale | 'auto'): Promise<void> {
  await chrome.storage.local.set({ [LOCALE_STORAGE_KEY]: value });
}

/** 读取用户偏好并设置 currentLocale */
export async function initLocale(): Promise<AppLocale> {
  const pref = await loadStoredLocale();
  const resolved = pref === 'auto' ? getBrowserLocale() : pref;
  currentLocale = resolved;
  return resolved;
}

export function t(key: string, params?: Record<string, string | number>): string {
  const primary = getNested(localeMessages[currentLocale], key);
  const fallback = getNested(localeMessages[DEFAULT_LOCALE], key);
  const raw = primary ?? fallback ?? key;
  return interpolate(raw, params);
}
