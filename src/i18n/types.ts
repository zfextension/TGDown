/** 应用内 UI 语言（与 Chrome _locales 目录名通过 normalize 映射） */
export type AppLocale =
  | 'en'
  | 'zh-CN'
  | 'zh-TW'
  | 'ru'
  | 'de'
  | 'es'
  | 'fr'
  | 'pt-BR'
  | 'ja'
  | 'ko'
  | 'ar'
  | 'id'
  | 'tr'
  | 'uk'
  | 'vi'
  | 'it'
  | 'pl';

export const SUPPORTED_LOCALES: AppLocale[] = [
  'en',
  'zh-CN',
  'zh-TW',
  'ru',
  'de',
  'es',
  'fr',
  'pt-BR',
  'ja',
  'ko',
  'ar',
  'id',
  'tr',
  'uk',
  'vi',
  'it',
  'pl',
];

export const DEFAULT_LOCALE: AppLocale = 'en';

export const LOCALE_STORAGE_KEY = 'tgdesk_locale';

/** 语言选择器展示名（不经过 i18n，避免循环） */
export const LOCALE_DISPLAY_NAMES: Record<AppLocale, string> = {
  en: 'English',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  ru: 'Русский',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  'pt-BR': 'Português (BR)',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
  id: 'Bahasa Indonesia',
  tr: 'Türkçe',
  uk: 'Українська',
  vi: 'Tiếng Việt',
  it: 'Italiano',
  pl: 'Polski',
};

export type MessageTree = {
  [key: string]: string | MessageTree;
};
