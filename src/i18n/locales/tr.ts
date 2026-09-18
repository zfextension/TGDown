import type { MessageTree } from '../types';

const tr: MessageTree = {
  brand: {
    name: 'tgdown',
    subtitle: 'Ücretsiz · Sınırsız · Ek hesap gerekmez',
    statusActivating: 'Etkinleştiriliyor…',
    statusActive: 'Etkin',
    statusInactive: 'Etkin değil',
    statusActivatingTitle: 'İşleniyor…',
    statusActiveTitle: 'Telegram Web etkin. Sayfayı yenilemek için tıklayın.',
    statusInactiveTitle:
      'Etkin değil. Telegram Web (K) açmak veya mevcut Telegram sekmesini yenilemek için tıklayın.',
    activateHint: 'Telegram Web\'i açmak için sağ üstteki「Etkin değil」düğmesine tıklayın',
  },
  media: {
    title: 'Yakalanan medya',
    empty: 'Henüz yakalama yok',
    emptyHint: 'Burada toplamak için Telegram\'da görsel gezin veya video oynat',
    clear: 'Temizle',
    clearConfirm: 'Tüm yakalanan medya kayıtları silinsin mi?',
    downloadSelected: 'Seçilenleri indir ({count})',
    downloadingSelected: 'İndiriliyor…',
    thumbAlt: 'Küçük resim',
    cancelDownload: 'İndirmeyi iptal et',
    copyLink: 'İndirme bağlantısını kopyala',
    download: 'İndir',
    retryDownload: 'Yeniden indir',
    taskLoading: 'Hazırlanıyor…',
    taskDownloading: 'İndiriliyor {percent}%',
    taskDone: 'Tamamlandı',
    taskCancelled: 'İptal edildi — yeniden denemek için dokunun',
    taskError: 'İndirme başarısız — yeniden denemek için dokunun',
    blobAlert:
      'Blob bağlantıları için indirme sırasında Telegram sekmesinin açık ve etkin kalması gerekir.',
  },
  footer: {
    howToUse: 'Nasıl kullanılır',
    contact: 'Bize ulaşın',
  },
  tabs: {
    label: 'İndirme modu',
    batch: 'Toplu indirme',
    manual: 'Manuel indirme',
  },
  manualGuide: {
    eyebrow: 'Manuel indirme',
    title: 'Fotoğraf veya video indirin',
    subtitle: 'Telegram medya mesajlarında doğrudan görünen indirme düğmesini kullanın.',
    exampleButton: 'Videoyu indir',
    stepOneTitle: 'Telegram sohbetini açın',
    stepOneDesc: 'Kaydetmek istediğiniz fotoğraf veya video mesajını bulun.',
    stepTwoTitle: 'Medyayı görüntüleyin',
    stepTwoDesc: 'Düğmeyi göstermek için fotoğrafın üzerine gelin veya videoyu oynatın.',
    stepThreeTitle: 'İndir’e tıklayın',
    stepThreeDesc: 'Dosya tarayıcınızın indirme klasörüne kaydedilir.',
    cta: 'Tam kullanım kılavuzunu görüntüle',
  },
  settings: {
    language: 'Dil',
    languageAuto: 'Otomatik (tarayıcı)',
  },
  context: {
    detecting: 'Algılanıyor…',
    notOnTg: 'Telegram Web\'de değil',
    active: 'Telegram Web · Etkin',
    batchTitle: 'Toplu indirme',
    batchHint: 'Etkinleştirmek için kenar çubuğunda medya arayın',
    batchReady: 'Hazır — sohbet listesinde toplu indirme kullanılabilir',
  },
  modal: {
    close: 'Kapat',
    largeFile: {
      title: 'Büyük dosya algılandı',
      sizeMB: 'Yaklaşık {size} MB',
      durationMin: 'Yaklaşık {minutes} dk',
      desc:
        '{meta}<br />Büyük dosyalar tarayıcıda yavaş veya başarısız olabilir.<br />Devam edilsin mi?',
      noRemind: 'Bir daha hatırlatma',
      browserDownload: 'İndirmeye devam et',
    },
    reviewInvite: {
      title: 'Bize içten bir yorum bırakır mısınız?',
      desc:
        'tgdown ile <strong>{count}</strong> indirmeyi tamamladınız. Zaman kazandırdıysa, samimi bir yorum bizim için çok değerli olur ve bu ücretsiz aracı geliştirmeye devam etmemize yardımcı olur. 🙏',
      rateNow: 'Yorum bırak',
      noThanks: 'Şimdi değil',
    },
    toast: {
      done: 'İndirme tamamlandı!',
    },
  },
  content: {
    downloadDoneToast: '',
    networkError: 'Ağ hatası — bağlantınızı kontrol edip tekrar deneyin.',
    downloadFailed: 'İndirme başarısız',
    noDownloadUrl: 'İndirme URL\'si alınamadı',
    handleDownloadFailed: 'İndirme işleme başarısız',
    cannotOpenVideo: 'Video açılamadı',
    noVideoUrl: 'Video URL\'si alınamadı — önce sohbette oynatın',
    batchSelected: '{count} seçildi',
  },
  button: {
    downloadTitle: 'İndir',
    waiting: 'Bekleniyor…',
    fetching: 'Video alınıyor…',
    downloading: 'İndiriliyor {percent}%',
    done: 'İndirme tamamlandı',
    failed: 'İndirme başarısız',
  },
  stories: {
    downloadTitle: 'Mevcut Story\'yi indir',
  },
};

export default tr;
