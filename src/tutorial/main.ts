import { createApp } from 'vue';
import App from './App.vue';
import './styles.css';
import { createI18nPlugin, setupAppLocale } from '@i18n/vue';

void setupAppLocale().then(() => {
  const app = createApp(App);
  app.use(createI18nPlugin());
  app.mount('#app');
});
