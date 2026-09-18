<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '@i18n/vue';

const { t } = useI18n();
const demoKey = ref(0);

function replay() {
  demoKey.value += 1;
}

function openTelegram() {
  chrome.tabs.create({ url: 'https://web.telegram.org/k/' });
}
</script>

<template>
  <div class="tutorial-page">
    <header class="hero">
      <div>
        <div class="hero__eyebrow">Telegram</div>
        <h1>{{ t('tutorial.title') }}</h1>
        <p>{{ t('tutorial.subtitle') }}</p>
      </div>
      <div class="hero__actions">
        <button class="btn btn--ghost" type="button" @click="replay">
          {{ t('tutorial.replay') }}
        </button>
        <button class="btn btn--primary" type="button" @click="openTelegram">
          {{ t('tutorial.openTelegram') }}
        </button>
      </div>
    </header>

    <main class="layout">
      <section class="demo-card" aria-label="Download demo">
        <div :key="demoKey" class="telegram-demo">
          <div class="telegram-demo__topbar">
            <span class="dot dot--red" />
            <span class="dot dot--yellow" />
            <span class="dot dot--green" />
            <div>
              <strong>{{ t('tutorial.fakeChatTitle') }}</strong>
              <small>{{ t('tutorial.fakeChatSubtitle') }}</small>
            </div>
          </div>

          <div class="chat">
            <div class="message">
              <div class="message__avatar">TG</div>
              <div class="message__body">
                <div class="message__meta">{{ t('tutorial.fakeSender') }}</div>
                <div class="media-card">
                  <div class="media-card__image">
                    <div class="mountain mountain--back" />
                    <div class="mountain mountain--front" />
                    <div class="sun" />
                    <div class="play">
                      <svg viewBox="0 0 24 24" width="28" height="28">
                        <path fill="currentColor" d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  <button class="injected-btn" type="button" aria-label="Download">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                    </svg>
                    <span class="injected-btn__ring" />
                    <span class="injected-btn__check">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                      </svg>
                    </span>
                  </button>

                  <div class="cursor" />
                </div>
                <div class="file-row">
                  <span>{{ t('tutorial.fakeFilename') }}</span>
                  <strong class="file-row__status">{{ t('tutorial.fakeProgress', { percent: 78 }) }}</strong>
                </div>
              </div>
            </div>
          </div>

          <aside class="capture-panel">
            <div class="capture-panel__title">
              {{ t('media.title') }}
              <span>1</span>
            </div>
            <div class="capture-item">
              <div class="capture-thumb" />
              <div class="capture-info">
                <strong>{{ t('tutorial.fakeFilename') }}</strong>
                <div class="capture-progress">
                  <span />
                </div>
                <small>{{ t('tutorial.done') }}</small>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section class="steps">
        <article>
          <span>01</span>
          <h2>{{ t('tutorial.stepDetect') }}</h2>
          <p>{{ t('tutorial.stepDetectDesc') }}</p>
        </article>
        <article>
          <span>02</span>
          <h2>{{ t('tutorial.stepButton') }}</h2>
          <p>{{ t('tutorial.stepButtonDesc') }}</p>
        </article>
        <article>
          <span>03</span>
          <h2>{{ t('tutorial.stepClick') }}</h2>
          <p>{{ t('tutorial.stepClickDesc') }}</p>
        </article>
        <article>
          <span>04</span>
          <h2>{{ t('tutorial.stepProgress') }}</h2>
          <p>{{ t('tutorial.stepProgressDesc') }}</p>
        </article>
        <article>
          <span>05</span>
          <h2>{{ t('tutorial.stepDone') }}</h2>
          <p>{{ t('tutorial.stepDoneDesc') }}</p>
        </article>
      </section>
    </main>

    <section class="tips">
      <h2>{{ t('tutorial.tipTitle') }}</h2>
      <ul>
        <li>{{ t('tutorial.tip1') }}</li>
        <li>{{ t('tutorial.tip2') }}</li>
        <li>{{ t('tutorial.tip3') }}</li>
      </ul>
    </section>
  </div>
</template>
