<script setup lang="ts">
import { useI18n } from '@i18n/vue';

defineEmits<{ openGuide: [] }>();

const { t } = useI18n();
</script>

<template>
  <section class="manual-guide" aria-labelledby="manual-guide-title">
    <header class="manual-guide__header">
      <h2 id="manual-guide-title">{{ t('manualGuide.title') }}</h2>
    </header>

    <div class="manual-guide__preview" aria-hidden="true">
      <img src="/guide/manual-download-telegram.png" alt="" />
    </div>

    <ol class="manual-guide__steps">
      <li>
        <span class="manual-guide__step-number">1</span>
        <div>
          <strong>{{ t('manualGuide.stepOneTitle') }}</strong>
          <p>{{ t('manualGuide.stepOneDesc') }}</p>
        </div>
      </li>
      <li>
        <span class="manual-guide__step-number">2</span>
        <div>
          <strong>{{ t('manualGuide.stepTwoTitle') }}</strong>
          <p>{{ t('manualGuide.stepTwoDesc') }}</p>
        </div>
      </li>
      <li>
        <span class="manual-guide__step-number">3</span>
        <div>
          <strong>{{ t('manualGuide.stepThreeTitle') }}</strong>
          <p>{{ t('manualGuide.stepThreeDesc') }}</p>
        </div>
      </li>
    </ol>

    <button type="button" class="manual-guide__cta" @click="$emit('openGuide')">
      {{ t('manualGuide.cta') }}
      <span aria-hidden="true">↗</span>
    </button>
  </section>
</template>

<style scoped>
.manual-guide {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 18px;
}
.manual-guide__header { text-align: center; }
.manual-guide__header h2 { margin: 0; font-size: 18px; line-height: 1.2; }
.manual-guide__preview {
  margin: 16px 0;
  overflow: hidden;
  border: 1px solid var(--tg-border);
  border-radius: 12px;
  box-shadow: var(--tg-shadow);
}
.manual-guide__preview img { display: block; width: 100%; height: auto; }
.manual-guide__steps { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
.manual-guide__steps li { display: flex; align-items: flex-start; gap: 9px; }
.manual-guide__step-number {
  display: grid;
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  color: var(--tg-primary);
  background: rgba(37, 99, 235, .1);
  font-size: 11px;
  font-weight: 800;
}
.manual-guide__steps strong { display: block; font-size: 11.5px; line-height: 1.25; }
.manual-guide__steps p { margin: 2px 0 0; color: var(--tg-text-dim); font-size: 10.5px; line-height: 1.35; }
.manual-guide__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  margin-top: 16px;
  padding: 10px 14px;
  border-radius: 9px;
  color: #fff;
  background: #5267c9;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 5px 12px rgba(82, 103, 201, .2);
}
.manual-guide__cta:hover { background: #4156b8; }
</style>
