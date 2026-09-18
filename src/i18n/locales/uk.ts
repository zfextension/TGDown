import type { MessageTree } from '../types';

const uk: MessageTree = {
  brand: {
    name: 'tgdown',
    subtitle: 'Безкоштовно · Без лімітів · Без окремого акаунта',
    statusActivating: 'Активація…',
    statusActive: 'Активний',
    statusInactive: 'Неактивний',
    statusActivatingTitle: 'Обробка…',
    statusActiveTitle: 'Telegram Web активний. Натисніть, щоб оновити сторінку.',
    statusInactiveTitle:
      'Неактивний. Натисніть, щоб відкрити Telegram Web (K) або оновити поточну вкладку Telegram.',
    activateHint: 'Натисніть «Неактивний» у правому верхньому куті, щоб відкрити Telegram Web',
  },
  media: {
    title: 'Захоплені медіа',
    empty: 'Поки немає захоплень',
    emptyHint: 'Переглядайте зображення або відтворюйте відео в Telegram, щоб збирати їх тут',
    clear: 'Очистити',
    clearConfirm: 'Очистити всі записи захоплених медіа?',
    downloadSelected: 'Завантажити вибране ({count})',
    downloadingSelected: 'Завантаження…',
    thumbAlt: 'Мініатюра',
    cancelDownload: 'Скасувати завантаження',
    copyLink: 'Копіювати посилання',
    download: 'Завантажити',
    retryDownload: 'Повторити завантаження',
    taskLoading: 'Підготовка…',
    taskDownloading: 'Завантаження {percent}%',
    taskDone: 'Готово',
    taskCancelled: 'Скасовано — натисніть для повтору',
    taskError: 'Помилка завантаження — натисніть для повтору',
    blobAlert:
      'Для завантаження за blob-посиланнями вкладка Telegram має залишатися відкритою та активною.',
  },
  footer: {
    howToUse: 'Як користуватися',
    contact: 'Зв’язатися з нами',
  },
  tabs: {
    label: 'Режим завантаження',
    batch: 'Пакетне завантаження',
    manual: 'Ручне завантаження',
  },
  manualGuide: {
    eyebrow: 'Ручне завантаження',
    title: 'Завантажте фото або відео',
    subtitle: 'Використовуйте кнопку завантаження, яка з’являється безпосередньо на медіаповідомленнях Telegram.',
    exampleButton: 'Завантажити відео',
    stepOneTitle: 'Відкрийте чат Telegram',
    stepOneDesc: 'Знайдіть повідомлення з фото або відео, яке хочете зберегти.',
    stepTwoTitle: 'Перегляньте медіа',
    stepTwoDesc: 'Наведіть курсор на фото або запустіть відео, щоб побачити кнопку.',
    stepThreeTitle: 'Натисніть «Завантажити»',
    stepThreeDesc: 'Файл буде збережено в папці завантажень браузера.',
    cta: 'Переглянути повний посібник',
  },
  settings: {
    language: 'Мова',
    languageAuto: 'Авто (браузер)',
  },
  context: {
    detecting: 'Визначення…',
    notOnTg: 'Не на Telegram Web',
    active: 'Telegram Web · Активний',
    batchTitle: 'Пакетне завантаження',
    batchHint: 'Знайдіть медіа на бічній панелі, щоб увімкнути',
    batchReady: 'Готово — пакетне завантаження доступне у списку чатів',
  },
  modal: {
    close: 'Закрити',
    largeFile: {
      title: 'Виявлено великий файл',
      sizeMB: 'Близько {size} МБ',
      durationMin: 'Близько {minutes} хв',
      desc:
        '{meta}<br />Великі файли можуть завантажуватися повільно або з помилками в браузері.<br />Продовжити?',
      noRemind: 'Більше не нагадувати',
      browserDownload: 'Продовжити завантаження',
    },
    reviewInvite: {
      title: 'Чи могли б ви залишити нам добрий відгук?',
      desc:
        'Ви вже виконали <strong>{count}</strong> завантажень за допомогою tgdown. Якщо він зекономив вам час, щирий відгук дуже багато для нас означатиме й допоможе далі покращувати цей безкоштовний інструмент. 🙏',
      rateNow: 'Залишити відгук',
      noThanks: 'Не зараз',
    },
    toast: {
      done: 'Завантаження завершено!',
    },
  },
  content: {
    downloadDoneToast: '',
    networkError: 'Помилка мережі — перевірте з’єднання та спробуйте знову.',
    downloadFailed: 'Помилка завантаження',
    noDownloadUrl: 'Не вдалося отримати URL для завантаження',
    handleDownloadFailed: 'Не вдалося обробити завантаження',
    cannotOpenVideo: 'Не вдалося відкрити відео',
    noVideoUrl: 'Не вдалося отримати URL відео — спочатку відтворіть його в чаті',
    batchSelected: 'Вибрано {count}',
  },
  button: {
    downloadTitle: 'Завантажити',
    waiting: 'Очікування…',
    fetching: 'Отримання відео…',
    downloading: 'Завантаження {percent}%',
    done: 'Завантаження завершено',
    failed: 'Помилка завантаження',
  },
  stories: {
    downloadTitle: 'Завантажити поточну Story',
  },
};

export default uk;
