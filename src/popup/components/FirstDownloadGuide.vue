<script setup lang="ts">
import { useI18n } from '@i18n/vue';

defineEmits<{ start: []; dismiss: [] }>();
const { t } = useI18n();
</script>

<template>
  <section class="first-guide" aria-labelledby="first-guide-title">
    <button class="first-guide__close" type="button" :aria-label="t('firstGuide.dismiss')" @click="$emit('dismiss')">×</button>
    <div class="first-guide__icon" aria-hidden="true">↓</div>
    <div class="first-guide__content">
      <strong id="first-guide-title">{{ t('firstGuide.title') }}</strong>
      <p>{{ t('firstGuide.steps') }}</p>
    </div>
    <button class="first-guide__action" type="button" @click="$emit('start')">{{ t('firstGuide.start') }}</button>
  </section>
</template>

<style scoped>
.first-guide {
  position: relative;
  margin: 12px 18px 0;
  padding: 12px 34px 12px 12px;
  display: grid;
  grid-template-columns: 34px 1fr auto;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(37, 99, 235, 0.18);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(219, 234, 254, 0.7), rgba(236, 254, 255, 0.9));
}
.first-guide__icon { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; color: white; background: var(--tg-primary); font-size: 20px; font-weight: 800; }
.first-guide__content { min-width: 0; }
.first-guide__content strong { display: block; font-size: 12px; }
.first-guide__content p { margin: 3px 0 0; color: var(--tg-text-dim); font-size: 10.5px; line-height: 1.35; }
.first-guide__action { padding: 7px 10px; border-radius: 8px; color: white; background: var(--tg-primary); font-size: 10.5px; font-weight: 700; white-space: nowrap; }
.first-guide__close { position: absolute; top: 3px; right: 5px; color: var(--tg-text-dim); font-size: 17px; line-height: 1; }
</style>
