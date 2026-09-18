import type { MessageTree } from '../types';

const pl: MessageTree = {
  brand: {
    name: 'tgdown',
    subtitle: 'Bezpłatnie · Bez limitu · Bez dodatkowego konta',
    statusActivating: 'Aktywacja…',
    statusActive: 'Aktywny',
    statusInactive: 'Nieaktywny',
    statusActivatingTitle: 'Przetwarzanie…',
    statusActiveTitle: 'Telegram Web jest aktywny. Kliknij, aby odświeżyć stronę.',
    statusInactiveTitle:
      'Nieaktywny. Kliknij, aby otworzyć Telegram Web (K) lub odświeżyć bieżącą kartę Telegram.',
    activateHint: 'Kliknij「Nieaktywny」w prawym górnym rogu, aby otworzyć Telegram Web',
  },
  media: {
    title: 'Przechwycone media',
    empty: 'Brak przechwyceń',
    emptyHint: 'Przeglądaj obrazy lub odtwarzaj filmy w Telegramie, aby zbierać je tutaj',
    clear: 'Wyczyść',
    clearConfirm: 'Wyczyścić wszystkie rekordy przechwyconych mediów?',
    downloadSelected: 'Pobierz zaznaczone ({count})',
    downloadingSelected: 'Pobieranie…',
    thumbAlt: 'Miniatura',
    cancelDownload: 'Anuluj pobieranie',
    copyLink: 'Kopiuj link pobierania',
    download: 'Pobierz',
    retryDownload: 'Ponów pobieranie',
    taskLoading: 'Przygotowanie…',
    taskDownloading: 'Pobieranie {percent}%',
    taskDone: 'Gotowe',
    taskCancelled: 'Anulowano — dotknij, aby ponowić',
    taskError: 'Pobieranie nie powiodło się — dotknij, aby ponowić',
    blobAlert:
      'Linki blob wymagają, aby karta Telegram pozostała otwarta i aktywna podczas pobierania.',
  },
  footer: {
    howToUse: 'Jak używać',
    contact: 'Kontakt',
  },
  tabs: {
    label: 'Tryb pobierania',
    batch: 'Pobieranie wsadowe',
    manual: 'Pobieranie ręczne',
  },
  manualGuide: {
    eyebrow: 'Pobieranie ręczne',
    title: 'Pobierz zdjęcie lub film',
    subtitle: 'Użyj przycisku pobierania wyświetlanego bezpośrednio na wiadomościach multimedialnych Telegram.',
    exampleButton: 'Pobierz film',
    stepOneTitle: 'Otwórz czat Telegram',
    stepOneDesc: 'Znajdź wiadomość ze zdjęciem lub filmem do zapisania.',
    stepTwoTitle: 'Wyświetl multimedia',
    stepTwoDesc: 'Najedź na zdjęcie lub odtwórz film, aby wyświetlić przycisk.',
    stepThreeTitle: 'Kliknij Pobierz',
    stepThreeDesc: 'Plik zostanie zapisany w folderze pobierania przeglądarki.',
    cta: 'Zobacz pełny przewodnik',
  },
  settings: {
    language: 'Język',
    languageAuto: 'Automatycznie (przeglądarka)',
  },
  context: {
    detecting: 'Wykrywanie…',
    notOnTg: 'Nie na Telegram Web',
    active: 'Telegram Web · Aktywny',
    batchTitle: 'Pobieranie wsadowe',
    batchHint: 'Wyszukaj media na pasku bocznym, aby włączyć',
    batchReady: 'Gotowe — pobieranie wsadowe dostępne na liście czatów',
  },
  modal: {
    close: 'Zamknij',
    largeFile: {
      title: 'Wykryto duży plik',
      sizeMB: 'Około {size} MB',
      durationMin: 'Około {minutes} min',
      desc:
        '{meta}<br />Duże pliki mogą pobierać się wolno lub zawieść w przeglądarce.<br />Kontynuować?',
      noRemind: 'Nie przypominaj ponownie',
      browserDownload: 'Kontynuuj pobieranie',
    },
    reviewInvite: {
      title: 'Czy możesz zostawić nam życzliwą opinię?',
      desc:
        'Ukończono już <strong>{count}</strong> pobrań za pomocą tgdown. Jeśli narzędzie oszczędziło Ci czas, szczera opinia bardzo wiele dla nas znaczy i pomaga nam dalej ulepszać to darmowe narzędzie. 🙏',
      rateNow: 'Zostaw opinię',
      noThanks: 'Nie teraz',
    },
    toast: {
      done: 'Pobieranie zakończone!',
    },
  },
  content: {
    downloadDoneToast: '',
    networkError: 'Błąd sieci — sprawdź połączenie i spróbuj ponownie.',
    downloadFailed: 'Pobieranie nie powiodło się',
    noDownloadUrl: 'Nie udało się uzyskać adresu URL pobierania',
    handleDownloadFailed: 'Obsługa pobierania nie powiodła się',
    cannotOpenVideo: 'Nie udało się otworzyć filmu',
    noVideoUrl: 'Nie udało się uzyskać adresu URL filmu — najpierw odtwórz go na czacie',
    batchSelected: 'Wybrano {count}',
  },
  button: {
    downloadTitle: 'Pobierz',
    waiting: 'Oczekiwanie…',
    fetching: 'Pobieranie filmu…',
    downloading: 'Pobieranie {percent}%',
    done: 'Pobieranie zakończone',
    failed: 'Pobieranie nie powiodło się',
  },
  stories: {
    downloadTitle: 'Pobierz bieżącą Story',
  },
};

export default pl;
