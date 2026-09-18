import type { MessageTree } from '../types';

const ru: MessageTree = {
  brand: {
    name: 'tgdown',
    subtitle: 'Бесплатно · Без лимитов · Без отдельного аккаунта',
    statusActivating: 'Активация…',
    statusActive: 'Активен',
    statusInactive: 'Неактивен',
    statusActivatingTitle: 'Обработка…',
    statusActiveTitle: 'Telegram Web активен. Нажмите, чтобы обновить страницу.',
    statusInactiveTitle:
      'Неактивен. Нажмите, чтобы открыть Telegram Web (K) или обновить текущую вкладку Telegram.',
    activateHint: 'Нажмите «Неактивен» в правом верхнем углу, чтобы открыть Telegram Web',
  },
  media: {
    title: 'Захваченные медиа',
    empty: 'Пока нет захватов',
    emptyHint: 'Просматривайте изображения или воспроизводите видео в Telegram, чтобы собирать их здесь',
    clear: 'Очистить',
    clearConfirm: 'Очистить все записи захваченных медиа?',
    downloadSelected: 'Скачать выбранное ({count})',
    downloadingSelected: 'Скачивание…',
    thumbAlt: 'Миниатюра',
    cancelDownload: 'Отменить скачивание',
    copyLink: 'Копировать ссылку',
    download: 'Скачать',
    retryDownload: 'Повторить скачивание',
    taskLoading: 'Подготовка…',
    taskDownloading: 'Скачивание {percent}%',
    taskDone: 'Готово',
    taskCancelled: 'Отменено — нажмите для повтора',
    taskError: 'Ошибка скачивания — нажмите для повтора',
    blobAlert:
      'Для скачивания по blob-ссылкам вкладка Telegram должна оставаться открытой и активной.',
  },
  footer: {
    howToUse: 'Как пользоваться',
    contact: 'Связаться с нами',
  },
  tabs: {
    label: 'Режим скачивания',
    batch: 'Пакетное скачивание',
    manual: 'Ручное скачивание',
  },
  manualGuide: {
    eyebrow: 'Ручное скачивание',
    title: 'Скачайте фото или видео',
    subtitle: 'Используйте кнопку скачивания, которая появляется прямо на медиа-сообщениях Telegram.',
    exampleButton: 'Скачать видео',
    stepOneTitle: 'Откройте чат Telegram',
    stepOneDesc: 'Найдите сообщение с фото или видео, которое хотите сохранить.',
    stepTwoTitle: 'Откройте медиа',
    stepTwoDesc: 'Наведите курсор на фото или включите видео, чтобы появилась кнопка.',
    stepThreeTitle: 'Нажмите «Скачать»',
    stepThreeDesc: 'Файл будет сохранён в папке загрузок браузера.',
    cta: 'Открыть полное руководство',
  },
  settings: {
    language: 'Язык',
    languageAuto: 'Авто (браузер)',
  },
  context: {
    detecting: 'Определение…',
    notOnTg: 'Не на Telegram Web',
    active: 'Telegram Web · Активен',
    batchTitle: 'Пакетное скачивание',
    batchHint: 'Найдите медиа в боковой панели, чтобы включить',
    batchReady: 'Готово — пакетное скачивание доступно в списке чатов',
  },
  modal: {
    close: 'Закрыть',
    largeFile: {
      title: 'Обнаружен большой файл',
      sizeMB: 'Около {size} МБ',
      durationMin: 'Около {minutes} мин',
      desc:
        '{meta}<br />Большие файлы могут скачиваться медленно или с ошибками в браузере.<br />Продолжить?',
      noRemind: 'Больше не напоминать',
      browserDownload: 'Продолжить скачивание',
    },
    reviewInvite: {
      title: 'Не могли бы вы оставить нам добрый отзыв?',
      desc:
        'Вы уже выполнили <strong>{count}</strong> загрузок с помощью tgdown. Если он сэкономил вам время, искренний отзыв будет очень важен для нас и поможет дальше улучшать этот бесплатный инструмент. 🙏',
      rateNow: 'Оставить отзыв',
      noThanks: 'Не сейчас',
    },
    toast: {
      done: 'Скачивание завершено!',
    },
  },
  content: {
    downloadDoneToast: '',
    networkError: 'Ошибка сети — проверьте подключение и повторите.',
    downloadFailed: 'Ошибка скачивания',
    noDownloadUrl: 'Не удалось получить URL для скачивания',
    handleDownloadFailed: 'Не удалось обработать скачивание',
    cannotOpenVideo: 'Не удалось открыть видео',
    noVideoUrl: 'Не удалось получить URL видео — сначала воспроизведите его в чате',
    batchSelected: 'Выбрано {count}',
  },
  button: {
    downloadTitle: 'Скачать',
    waiting: 'Ожидание…',
    fetching: 'Получение видео…',
    downloading: 'Скачивание {percent}%',
    done: 'Скачивание завершено',
    failed: 'Ошибка скачивания',
  },
  stories: {
    downloadTitle: 'Скачать текущую Story',
  },
};

export default ru;
