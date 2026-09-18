import { inject, onMounted, onUnmounted, ref, type InjectionKey, type Ref } from 'vue';
import { getLocale, initLocale, saveLocalePreference, setLocale, subscribeLocale, t as translate } from './core';
import type { AppLocale } from './types';
import { LOCALE_DISPLAY_NAMES, SUPPORTED_LOCALES } from './types';

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

const I18nTickKey: InjectionKey<Ref<number>> = Symbol('TGDown-i18n-tick');

export function createI18nPlugin() {
  const tick = ref(0);
  return {
    install(app: { provide: (k: unknown, v: unknown) => void; config: { globalProperties: Record<string, unknown> } }) {
      app.provide(I18nTickKey, tick);
      subscribeLocale(() => {
        tick.value += 1;
      });
      app.config.globalProperties.$t = (key: string, params?: Record<string, string | number>) => translate(key, params);
    },
  };
}

export function useI18n() {
  const tick = inject(I18nTickKey, ref(0));

  const tr: TranslateFn = (key, params) => {
    void tick.value;
    return translate(key, params);
  };

  return {
    t: tr,
    locale: () => getLocale(),
    localeLabels: LOCALE_DISPLAY_NAMES,
    supportedLocales: SUPPORTED_LOCALES,
    async setLocale(locale: AppLocale | 'auto') {
      await saveLocalePreference(locale);
      if (locale === 'auto') {
        await initLocale();
      } else {
        setLocale(locale);
      }
    },
    initLocale,
  };
}

/** Popup / Modal 启动时调用 */
export async function setupAppLocale(): Promise<AppLocale> {
  return initLocale();
}

export function useLocaleReactive() {
  const tick = ref(0);
  onMounted(() => {
    const unsub = subscribeLocale(() => {
      tick.value += 1;
    });
    onUnmounted(unsub);
  });
  return tick;
}
