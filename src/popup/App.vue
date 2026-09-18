<script setup lang="ts">
/**
 * App.vue — Popup 根组件
 * 布局: BrandHeader / DetectedMediaTable / Footer
 */
import { ref, onMounted } from 'vue';
import BrandHeader from './components/BrandHeader.vue';
import FirstDownloadGuide from './components/FirstDownloadGuide.vue';
import DetectedMediaTable from './components/DetectedMediaTable.vue';
import ManualDownloadGuide from './components/ManualDownloadGuide.vue';
import LanguageSelect from './components/LanguageSelect.vue';
import { resetCaptureStateOnReload } from '@shared/download-tasks';
import {
  activateTelegramWebTab,
  getTelegramWebVersion,
  isTelegramWebUrl,
  TELEGRAM_CONTENT_TAB_URLS,
  type TelegramWebVersion,
} from '@shared/telegram-web';
import { useI18n } from '@i18n/vue';

const { t } = useI18n();

const version = chrome.runtime.getManifest().version;

const isTg = ref(false);
const isUnsupportedTelegram = ref(false);
const telegramVersion = ref<TelegramWebVersion | null>(null);
const activating = ref(false);
const firstGuideVisible = ref(false);
const activeTab = ref<'batch' | 'manual'>('batch');
const FIRST_GUIDE_KEY = 'tgdesk.firstDownloadGuideSeen';

async function refresh() {
  try {
    const tgTabs = await chrome.tabs.query({ url: [...TELEGRAM_CONTENT_TAB_URLS] });
    if (tgTabs.length === 0) {
      await resetCaptureStateOnReload();
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    telegramVersion.value = getTelegramWebVersion(tab?.url);
    isTg.value = telegramVersion.value !== null;
    isUnsupportedTelegram.value = isTelegramWebUrl(tab?.url) && !isTg.value;

    const guideState = await chrome.storage.local.get(FIRST_GUIDE_KEY);
    firstGuideVisible.value = guideState[FIRST_GUIDE_KEY] !== true;

    if (!isTg.value) {
      void handleActivate();
    }
  } catch (e) {
    console.warn('[TGDesk] popup refresh failed', e);
  }
}

onMounted(refresh);

async function completeFirstGuide() {
  firstGuideVisible.value = false;
  await chrome.storage.local.set({ [FIRST_GUIDE_KEY]: true });
}

async function startFirstDownload() {
  await completeFirstGuide();
  await handleActivate();
}

async function handleActivate(active = true) {
  if (activating.value) return;
  activating.value = true;
  try {
    await activateTelegramWebTab({ active });
  } catch (e) {
    console.warn('[TGDesk] activate telegram failed', e);
  } finally {
    activating.value = false;
  }
}

function openExternal(url: string) {
  chrome.tabs.create({ url });
}

function openTutorial() {
  openExternal('https://tgdown.wadesk.io/how-to-use#guide');
}

function openContact() {
  openExternal('https://tgdown.wadesk.io/contact');
}
</script>

<template>
  <div class="app-shell">
    <div class="app-shell__header">
      <BrandHeader
        :is-tg="isTg"
        :telegram-version="telegramVersion"
        :is-unsupported-telegram="isUnsupportedTelegram"
        :activating="activating"
        @activate="handleActivate"
      />
    </div>

    <FirstDownloadGuide
      v-if="firstGuideVisible && !isTg"
      @start="startFirstDownload"
      @dismiss="completeFirstGuide"
    />

    <main class="app-shell__main">
      <div class="app-tabs" role="tablist" :aria-label="t('tabs.label')">
        <button
          id="batch-tab"
          type="button"
          class="app-tabs__tab"
          :class="{ 'app-tabs__tab--active': activeTab === 'batch' }"
          role="tab"
          :aria-selected="activeTab === 'batch'"
          aria-controls="batch-panel"
          @click="activeTab = 'batch'"
        >
          {{ t('tabs.batch') }}
        </button>
        <button
          id="manual-tab"
          type="button"
          class="app-tabs__tab"
          :class="{ 'app-tabs__tab--active': activeTab === 'manual' }"
          role="tab"
          :aria-selected="activeTab === 'manual'"
          aria-controls="manual-panel"
          @click="activeTab = 'manual'"
        >
          {{ t('tabs.manual') }}
        </button>
      </div>

      <section
        id="batch-panel"
        class="app-shell__panel"
        role="tabpanel"
        aria-labelledby="batch-tab"
        :hidden="activeTab !== 'batch'"
      >
        <DetectedMediaTable />
      </section>
      <section
        id="manual-panel"
        class="app-shell__panel"
        role="tabpanel"
        aria-labelledby="manual-tab"
        :hidden="activeTab !== 'manual'"
      >
        <ManualDownloadGuide @open-guide="openTutorial" />
      </section>
    </main>

    <footer class="footer app-shell__footer">
      <div class="footer__start">
        <LanguageSelect />
        <div class="footer__links">
          <button type="button" class="footer__link footer__link--primary" @click="openTutorial">
            {{ t('footer.howToUse') }}
          </button>
          <span aria-hidden="true" class="footer__separator">·</span>
          <button type="button" class="footer__link" @click="openContact">
            {{ t('footer.contact') }}
          </button>
        </div>
      </div>
      <span class="footer__ver">v{{ version }}</span>
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.app-shell__header,
.app-shell__footer {
  flex-shrink: 0;
}

.app-shell__main {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.app-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  flex-shrink: 0;
  padding: 0 18px;
  border-bottom: 1px solid var(--tg-border);
  background: var(--tg-bg-elev);
}
.app-tabs__tab {
  position: relative;
  padding: 11px 8px 10px;
  color: var(--tg-text-dim);
  font-size: 12px;
  font-weight: 600;
}
.app-tabs__tab::after {
  position: absolute;
  right: 12px;
  bottom: -1px;
  left: 12px;
  height: 2px;
  border-radius: 99px 99px 0 0;
  content: '';
  background: transparent;
}
.app-tabs__tab--active { color: var(--tg-primary); }
.app-tabs__tab--active::after { background: var(--tg-primary); }
.app-shell__panel {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.app-shell__panel[hidden] { display: none; }

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 18px;
  border-top: 1px solid var(--tg-border);
  font-size: 11.5px;
  color: var(--tg-text-dim);
}
.footer__start {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.footer__links {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.footer a { color: var(--tg-text-dim); }
.footer__link {
  padding: 6px 9px;
  border: 1px solid rgba(37, 99, 235, 0.28);
  border-radius: 7px;
  color: var(--tg-primary);
  background: rgba(37, 99, 235, 0.05);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}
.footer__link--primary { color: #fff; background: var(--tg-primary); border-color: var(--tg-primary); }
.footer__separator { display: none; }
.footer a:hover,
.footer__link:hover {
  color: #fff;
  background: #1d4ed8;
  border-color: #1d4ed8;
  text-decoration: none;
}
.footer__ver {
  font-variant-numeric: tabular-nums;
  opacity: 0.6;
  flex-shrink: 0;
}
@media (max-width: 430px) {
  .footer { align-items: flex-start; }
  .footer__start { flex-wrap: wrap; gap: 7px 12px; }
}
</style>
