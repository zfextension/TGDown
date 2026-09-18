import type { MessageTree } from '../types';

const es: MessageTree = {
  brand: {
    name: 'tgdown',
    subtitle: 'Gratis · Sin límites · Sin cuenta adicional',
    statusActivating: 'Activando…',
    statusActive: 'Activo',
    statusInactive: 'Inactivo',
    statusActivatingTitle: 'Procesando…',
    statusActiveTitle: 'Telegram Web está activo. Haz clic para actualizar la página.',
    statusInactiveTitle:
      'Inactivo. Haz clic para abrir Telegram Web (K) o actualizar la pestaña actual de Telegram.',
    activateHint: 'Haz clic en «Inactivo» arriba a la derecha para abrir Telegram Web',
  },
  media: {
    title: 'Medios capturados',
    empty: 'Aún no hay capturas',
    emptyHint: 'Explora imágenes o reproduce videos en Telegram para recopilarlos aquí',
    clear: 'Vaciar',
    clearConfirm: '¿Borrar todos los registros de medios capturados?',
    downloadSelected: 'Descargar seleccionados ({count})',
    downloadingSelected: 'Descargando…',
    thumbAlt: 'Miniatura',
    cancelDownload: 'Cancelar descarga',
    copyLink: 'Copiar enlace de descarga',
    download: 'Descargar',
    retryDownload: 'Reintentar descarga',
    taskLoading: 'Preparando…',
    taskDownloading: 'Descargando {percent}%',
    taskDone: 'Listo',
    taskCancelled: 'Cancelado — toca para reintentar',
    taskError: 'Error de descarga — toca para reintentar',
    blobAlert:
      'Los enlaces blob requieren que la pestaña de Telegram permanezca abierta y activa.',
  },
  footer: {
    howToUse: 'Cómo usarlo',
    contact: 'Contáctanos',
  },
  tabs: {
    label: 'Modo de descarga',
    batch: 'Descarga por lotes',
    manual: 'Descarga manual',
  },
  manualGuide: {
    eyebrow: 'Descarga manual',
    title: 'Descarga una foto o video',
    subtitle: 'Usa el botón de descarga que aparece directamente en los mensajes multimedia de Telegram.',
    exampleButton: 'Descargar video',
    stepOneTitle: 'Abre un chat de Telegram',
    stepOneDesc: 'Busca el mensaje de foto o video que quieres guardar.',
    stepTwoTitle: 'Visualiza el contenido',
    stepTwoDesc: 'Pasa el cursor sobre una foto o reproduce un video para mostrar el botón.',
    stepThreeTitle: 'Haz clic en Descargar',
    stepThreeDesc: 'El archivo se guardará en la carpeta de descargas del navegador.',
    cta: 'Ver guía de uso completa',
  },
  settings: {
    language: 'Idioma',
    languageAuto: 'Automático (navegador)',
  },
  context: {
    detecting: 'Detectando…',
    notOnTg: 'No estás en Telegram Web',
    active: 'Telegram Web · Activo',
    batchTitle: 'Descarga por lotes',
    batchHint: 'Busca medios en la barra lateral para activar',
    batchReady: 'Listo — la descarga por lotes está disponible en la lista de chats',
  },
  modal: {
    close: 'Cerrar',
    largeFile: {
      title: 'Archivo grande detectado',
      sizeMB: 'Aproximadamente {size} MB',
      durationMin: 'Aproximadamente {minutes} min',
      desc:
        '{meta}<br />Los archivos grandes pueden descargarse lentamente o fallar en el navegador.<br />¿Continuar?',
      noRemind: 'No volver a recordar',
      browserDownload: 'Continuar descarga',
    },
    reviewInvite: {
      title: '¿Podrías dejarnos una reseña amable?',
      desc:
        'Ya completaste <strong>{count}</strong> descargas con tgdown. Si te ha ahorrado tiempo, una reseña sincera significaría mucho para nosotros y nos ayuda a seguir mejorando esta herramienta gratuita. 🙏',
      rateNow: 'Dejar reseña',
      noThanks: 'Ahora no',
    },
    toast: {
      done: '¡Descarga completada!',
    },
  },
  content: {
    downloadDoneToast: '',
    networkError: 'Error de red — comprueba tu conexión e inténtalo de nuevo.',
    downloadFailed: 'Error de descarga',
    noDownloadUrl: 'No se pudo obtener la URL de descarga',
    handleDownloadFailed: 'Error al procesar la descarga',
    cannotOpenVideo: 'No se pudo abrir el video',
    noVideoUrl: 'No se pudo obtener la URL del video — reprodúcelo primero en el chat',
    batchSelected: '{count} seleccionados',
  },
  button: {
    downloadTitle: 'Descargar',
    waiting: 'Esperando…',
    fetching: 'Obteniendo video…',
    downloading: 'Descargando {percent}%',
    done: 'Descarga completada',
    failed: 'Error de descarga',
  },
  stories: {
    downloadTitle: 'Descargar Story actual',
  },
};

export default es;
