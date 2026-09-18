import type { MessageTree } from '../types';

const it: MessageTree = {
  brand: {
    name: 'tgdown',
    subtitle: 'Gratis · Senza limiti · Nessun account extra',
    statusActivating: 'Attivazione…',
    statusActive: 'Attivo',
    statusInactive: 'Inattivo',
    statusActivatingTitle: 'Elaborazione…',
    statusActiveTitle: 'Telegram Web è attivo. Clicca per aggiornare la pagina.',
    statusInactiveTitle:
      'Inattivo. Clicca per aprire Telegram Web (K) o aggiornare la scheda Telegram corrente.',
    activateHint: 'Clicca「Inattivo」in alto a destra per aprire Telegram Web',
  },
  media: {
    title: 'Media acquisiti',
    empty: 'Nessuna acquisizione',
    emptyHint: 'Sfoglia immagini o riproduci video in Telegram per raccoglierli qui',
    clear: 'Svuota',
    clearConfirm: 'Cancellare tutti i record dei media acquisiti?',
    downloadSelected: 'Scarica selezionati ({count})',
    downloadingSelected: 'Download in corso…',
    thumbAlt: 'Miniatura',
    cancelDownload: 'Annulla download',
    copyLink: 'Copia link di download',
    download: 'Scarica',
    retryDownload: 'Riprova download',
    taskLoading: 'Preparazione…',
    taskDownloading: 'Download {percent}%',
    taskDone: 'Completato',
    taskCancelled: 'Annullato — tocca per riprovare',
    taskError: 'Download non riuscito — tocca per riprovare',
    blobAlert:
      'I link blob richiedono che la scheda Telegram resti aperta e attiva per il download.',
  },
  footer: {
    howToUse: 'Come si usa',
    contact: 'Contattaci',
  },
  tabs: {
    label: 'Modalità di download',
    batch: 'Download in batch',
    manual: 'Download manuale',
  },
  manualGuide: {
    eyebrow: 'Download manuale',
    title: 'Scarica una foto o un video',
    subtitle: 'Usa il pulsante di download visualizzato direttamente nei messaggi multimediali Telegram.',
    exampleButton: 'Scarica video',
    stepOneTitle: 'Apri una chat Telegram',
    stepOneDesc: 'Trova il messaggio con la foto o il video che vuoi salvare.',
    stepTwoTitle: 'Visualizza il contenuto',
    stepTwoDesc: 'Passa sopra una foto o riproduci un video per visualizzare il pulsante.',
    stepThreeTitle: 'Fai clic su Scarica',
    stepThreeDesc: 'Il file verrà salvato nella cartella Download del browser.',
    cta: 'Visualizza la guida completa',
  },
  settings: {
    language: 'Lingua',
    languageAuto: 'Automatico (browser)',
  },
  context: {
    detecting: 'Rilevamento…',
    notOnTg: 'Non su Telegram Web',
    active: 'Telegram Web · Attivo',
    batchTitle: 'Download in batch',
    batchHint: 'Cerca media nella barra laterale per abilitare',
    batchReady: 'Pronto — download in batch disponibile nell’elenco chat',
  },
  modal: {
    close: 'Chiudi',
    largeFile: {
      title: 'File di grandi dimensioni rilevato',
      sizeMB: 'Circa {size} MB',
      durationMin: 'Circa {minutes} min',
      desc:
        '{meta}<br />I file grandi possono essere lenti o fallire nel browser.<br />Continuare?',
      noRemind: 'Non ricordare più',
      browserDownload: 'Continua download',
    },
    reviewInvite: {
      title: 'Potresti lasciarci una recensione gentile?',
      desc:
        'Hai completato <strong>{count}</strong> download con tgdown. Se ti ha fatto risparmiare tempo, una recensione sincera per noi varrebbe moltissimo e ci aiuta a migliorare questo strumento gratuito. 🙏',
      rateNow: 'Lascia una recensione',
      noThanks: 'Non ora',
    },
    toast: {
      done: 'Download completato!',
    },
  },
  content: {
    downloadDoneToast: '',
    networkError: 'Errore di rete — controlla la connessione e riprova.',
    downloadFailed: 'Download non riuscito',
    noDownloadUrl: 'Impossibile ottenere l’URL di download',
    handleDownloadFailed: 'Elaborazione download non riuscita',
    cannotOpenVideo: 'Impossibile aprire il video',
    noVideoUrl: 'Impossibile ottenere l’URL del video — riproducilo prima nella chat',
    batchSelected: '{count} selezionati',
  },
  button: {
    downloadTitle: 'Scarica',
    waiting: 'In attesa…',
    fetching: 'Recupero video…',
    downloading: 'Download {percent}%',
    done: 'Download completato',
    failed: 'Download non riuscito',
  },
  stories: {
    downloadTitle: 'Scarica Story attuale',
  },
};

export default it;
