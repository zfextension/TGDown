import type { MessageTree } from '../types';

const de: MessageTree = {
  brand: {
    name: 'tgdown',
    subtitle: 'Kostenlos · Unbegrenzt · Kein Extra-Konto',
    statusActivating: 'Aktivierung…',
    statusActive: 'Aktiv',
    statusInactive: 'Inaktiv',
    statusActivatingTitle: 'Verarbeitung…',
    statusActiveTitle: 'Telegram Web ist aktiv. Klicken Sie, um die Seite zu aktualisieren.',
    statusInactiveTitle:
      'Nicht aktiv. Klicken Sie, um Telegram Web (K) zu öffnen oder den aktuellen Telegram-Tab zu aktualisieren.',
    activateHint: 'Klicken Sie oben rechts auf „Nicht aktiv“, um Telegram Web zu öffnen',
  },
  media: {
    title: 'Erfasste Medien',
    empty: 'Noch keine Erfassungen',
    emptyHint: 'Durchsuchen Sie Bilder oder spielen Sie Videos in Telegram ab, um sie hier zu sammeln',
    clear: 'Leeren',
    clearConfirm: 'Alle erfassten Medien-Einträge löschen?',
    downloadSelected: 'Auswahl herunterladen ({count})',
    downloadingSelected: 'Download läuft…',
    thumbAlt: 'Miniaturansicht',
    cancelDownload: 'Download abbrechen',
    copyLink: 'Download-Link kopieren',
    download: 'Herunterladen',
    retryDownload: 'Download wiederholen',
    taskLoading: 'Vorbereitung…',
    taskDownloading: 'Download {percent}%',
    taskDone: 'Fertig',
    taskCancelled: 'Abgebrochen — tippen zum Wiederholen',
    taskError: 'Download fehlgeschlagen — tippen zum Wiederholen',
    blobAlert:
      'Für Blob-Links muss der Telegram-Tab geöffnet und aktiv bleiben.',
  },
  footer: {
    howToUse: 'So funktioniert’s',
    contact: 'Kontakt',
  },
  tabs: {
    label: 'Downloadmodus',
    batch: 'Stapel-Download',
    manual: 'Manueller Download',
  },
  manualGuide: {
    eyebrow: 'Manueller Download',
    title: 'Foto oder Video herunterladen',
    subtitle: 'Nutzen Sie die Download-Schaltfläche direkt in Telegram-Mediennachrichten.',
    exampleButton: 'Video herunterladen',
    stepOneTitle: 'Telegram-Chat öffnen',
    stepOneDesc: 'Suchen Sie das Foto oder Video, das Sie speichern möchten.',
    stepTwoTitle: 'Medien anzeigen',
    stepTwoDesc: 'Fahren Sie über ein Foto oder spielen Sie ein Video ab, damit die Schaltfläche erscheint.',
    stepThreeTitle: 'Auf Herunterladen klicken',
    stepThreeDesc: 'Die Datei wird im Download-Ordner Ihres Browsers gespeichert.',
    cta: 'Vollständige Anleitung öffnen',
  },
  settings: {
    language: 'Sprache',
    languageAuto: 'Automatisch (Browser)',
  },
  context: {
    detecting: 'Erkennung…',
    notOnTg: 'Nicht auf Telegram Web',
    active: 'Telegram Web · Aktiv',
    batchTitle: 'Stapel-Download',
    batchHint: 'Medien in der Seitenleiste suchen, um zu aktivieren',
    batchReady: 'Bereit — Stapel-Download in der Chatliste verfügbar',
  },
  modal: {
    close: 'Schließen',
    largeFile: {
      title: 'Große Datei erkannt',
      sizeMB: 'Etwa {size} MB',
      durationMin: 'Etwa {minutes} Min.',
      desc:
        '{meta}<br />Große Dateien können im Browser langsam oder fehlerhaft heruntergeladen werden.<br />Trotzdem fortfahren?',
      noRemind: 'Nicht mehr erinnern',
      browserDownload: 'Download fortsetzen',
    },
    reviewInvite: {
      title: 'Könnten Sie uns eine freundliche Bewertung hinterlassen?',
      desc:
        'Sie haben mit tgdown bereits <strong>{count}</strong> Downloads abgeschlossen. Wenn Ihnen das Tool Zeit gespart hat, würde uns eine ehrliche Bewertung sehr viel bedeuten und uns helfen, dieses kostenlose Tool weiter zu verbessern. 🙏',
      rateNow: 'Bewertung abgeben',
      noThanks: 'Nicht jetzt',
    },
    toast: {
      done: 'Download abgeschlossen!',
    },
  },
  content: {
    downloadDoneToast: '',
    networkError: 'Netzwerkfehler — Verbindung prüfen und erneut versuchen.',
    downloadFailed: 'Download fehlgeschlagen',
    noDownloadUrl: 'Download-URL konnte nicht abgerufen werden',
    handleDownloadFailed: 'Download-Verarbeitung fehlgeschlagen',
    cannotOpenVideo: 'Video konnte nicht geöffnet werden',
    noVideoUrl: 'Video-URL konnte nicht abgerufen werden — Video zuerst im Chat abspielen',
    batchSelected: '{count} ausgewählt',
  },
  button: {
    downloadTitle: 'Herunterladen',
    waiting: 'Warten…',
    fetching: 'Video wird abgerufen…',
    downloading: 'Download {percent}%',
    done: 'Download abgeschlossen',
    failed: 'Download fehlgeschlagen',
  },
  stories: {
    downloadTitle: 'Aktuelle Story herunterladen',
  },
};

export default de;
