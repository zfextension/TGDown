import type { MessageTree } from '../types';

const fr: MessageTree = {
  brand: {
    name: 'tgdown',
    subtitle: 'Gratuit · Illimité · Sans compte supplémentaire',
    statusActivating: 'Activation…',
    statusActive: 'Actif',
    statusInactive: 'Inactif',
    statusActivatingTitle: 'Traitement…',
    statusActiveTitle: 'Telegram Web est actif. Cliquez pour actualiser la page.',
    statusInactiveTitle:
      'Inactif. Cliquez pour ouvrir Telegram Web (K) ou actualiser l’onglet Telegram actuel.',
    activateHint: 'Cliquez sur « Inactif » en haut à droite pour ouvrir Telegram Web',
  },
  media: {
    title: 'Médias capturés',
    empty: 'Aucune capture pour l’instant',
    emptyHint: 'Parcourez des images ou lisez des vidéos dans Telegram pour les collecter ici',
    clear: 'Effacer',
    clearConfirm: 'Effacer tous les enregistrements de médias capturés ?',
    downloadSelected: 'Télécharger la sélection ({count})',
    downloadingSelected: 'Téléchargement…',
    thumbAlt: 'Miniature',
    cancelDownload: 'Annuler le téléchargement',
    copyLink: 'Copier le lien de téléchargement',
    download: 'Télécharger',
    retryDownload: 'Réessayer le téléchargement',
    taskLoading: 'Préparation…',
    taskDownloading: 'Téléchargement {percent}%',
    taskDone: 'Terminé',
    taskCancelled: 'Annulé — appuyez pour réessayer',
    taskError: 'Échec du téléchargement — appuyez pour réessayer',
    blobAlert:
      'Les liens blob nécessitent que l’onglet Telegram reste ouvert et actif.',
  },
  footer: {
    howToUse: 'Mode d’emploi',
    contact: 'Nous contacter',
  },
  tabs: {
    label: 'Mode de téléchargement',
    batch: 'Téléchargement par lot',
    manual: 'Téléchargement manuel',
  },
  manualGuide: {
    eyebrow: 'Téléchargement manuel',
    title: 'Télécharger une photo ou vidéo',
    subtitle: 'Utilisez le bouton de téléchargement affiché directement sur les messages médias Telegram.',
    exampleButton: 'Télécharger la vidéo',
    stepOneTitle: 'Ouvrez un chat Telegram',
    stepOneDesc: 'Trouvez le message photo ou vidéo à enregistrer.',
    stepTwoTitle: 'Affichez le média',
    stepTwoDesc: 'Survolez une photo ou lancez une vidéo pour afficher le bouton.',
    stepThreeTitle: 'Cliquez sur Télécharger',
    stepThreeDesc: 'Le fichier sera enregistré dans le dossier Téléchargements du navigateur.',
    cta: 'Voir le guide complet',
  },
  settings: {
    language: 'Langue',
    languageAuto: 'Auto (navigateur)',
  },
  context: {
    detecting: 'Détection…',
    notOnTg: 'Pas sur Telegram Web',
    active: 'Telegram Web · Actif',
    batchTitle: 'Téléchargement par lot',
    batchHint: 'Recherchez des médias dans la barre latérale pour activer',
    batchReady: 'Prêt — le téléchargement par lot est disponible dans la liste des chats',
  },
  modal: {
    close: 'Fermer',
    largeFile: {
      title: 'Fichier volumineux détecté',
      sizeMB: 'Environ {size} Mo',
      durationMin: 'Environ {minutes} min',
      desc:
        '{meta}<br />Les gros fichiers peuvent être lents ou échouer dans le navigateur.<br />Continuer ?',
      noRemind: 'Ne plus rappeler',
      browserDownload: 'Continuer le téléchargement',
    },
    reviewInvite: {
      title: 'Pourriez-vous nous laisser un avis bienveillant ?',
      desc:
        'Vous avez déjà terminé <strong>{count}</strong> téléchargements avec tgdown. Si l’outil vous a fait gagner du temps, un avis sincère compterait beaucoup pour nous et nous aide à continuer d’améliorer cet outil gratuit. 🙏',
      rateNow: 'Laisser un avis',
      noThanks: 'Pas maintenant',
    },
    toast: {
      done: 'Téléchargement terminé !',
    },
  },
  content: {
    downloadDoneToast: '',
    networkError: 'Erreur réseau — vérifiez votre connexion et réessayez.',
    downloadFailed: 'Échec du téléchargement',
    noDownloadUrl: 'Impossible d’obtenir l’URL de téléchargement',
    handleDownloadFailed: 'Échec du traitement du téléchargement',
    cannotOpenVideo: 'Impossible d’ouvrir la vidéo',
    noVideoUrl: 'Impossible d’obtenir l’URL de la vidéo — lisez-la d’abord dans le chat',
    batchSelected: '{count} sélectionnés',
  },
  button: {
    downloadTitle: 'Télécharger',
    waiting: 'En attente…',
    fetching: 'Récupération de la vidéo…',
    downloading: 'Téléchargement {percent}%',
    done: 'Téléchargement terminé',
    failed: 'Échec du téléchargement',
  },
  stories: {
    downloadTitle: 'Télécharger la Story actuelle',
  },
};

export default fr;
