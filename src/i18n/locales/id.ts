import type { MessageTree } from '../types';

const id: MessageTree = {
  brand: {
    name: 'tgdown',
    subtitle: 'Gratis · Tanpa batas · Tanpa akun tambahan',
    statusActivating: 'Mengaktifkan…',
    statusActive: 'Aktif',
    statusInactive: 'Tidak aktif',
    statusActivatingTitle: 'Memproses…',
    statusActiveTitle: 'Telegram Web aktif. Klik untuk memuat ulang halaman.',
    statusInactiveTitle:
      'Tidak aktif. Klik untuk membuka Telegram Web (K) atau memuat ulang tab Telegram saat ini.',
    activateHint: 'Klik「Tidak aktif」di kanan atas untuk membuka Telegram Web',
  },
  media: {
    title: 'Media yang ditangkap',
    empty: 'Belum ada tangkapan',
    emptyHint: 'Jelajahi gambar atau putar video di Telegram untuk mengumpulkannya di sini',
    clear: 'Hapus',
    clearConfirm: 'Hapus semua catatan media yang ditangkap?',
    downloadSelected: 'Unduh yang dipilih ({count})',
    downloadingSelected: 'Mengunduh…',
    thumbAlt: 'Thumbnail',
    cancelDownload: 'Batalkan unduhan',
    copyLink: 'Salin tautan unduhan',
    download: 'Unduh',
    retryDownload: 'Coba unduh lagi',
    taskLoading: 'Menyiapkan…',
    taskDownloading: 'Mengunduh {percent}%',
    taskDone: 'Selesai',
    taskCancelled: 'Dibatalkan — ketuk untuk coba lagi',
    taskError: 'Unduhan gagal — ketuk untuk coba lagi',
    blobAlert:
      'Tautan blob memerlukan tab Telegram tetap terbuka dan aktif untuk unduhan.',
  },
  footer: {
    howToUse: 'Cara menggunakan',
    contact: 'Hubungi kami',
  },
  tabs: {
    label: 'Mode unduhan',
    batch: 'Unduh batch',
    manual: 'Unduh manual',
  },
  manualGuide: {
    eyebrow: 'Unduh manual',
    title: 'Unduh foto atau video',
    subtitle: 'Gunakan tombol unduh yang muncul langsung pada pesan media Telegram.',
    exampleButton: 'Unduh video',
    stepOneTitle: 'Buka chat Telegram',
    stepOneDesc: 'Temukan pesan foto atau video yang ingin disimpan.',
    stepTwoTitle: 'Lihat media',
    stepTwoDesc: 'Arahkan kursor ke foto atau putar video untuk menampilkan tombol unduh.',
    stepThreeTitle: 'Klik Unduh',
    stepThreeDesc: 'File akan disimpan ke folder unduhan browser.',
    cta: 'Lihat panduan lengkap',
  },
  settings: {
    language: 'Bahasa',
    languageAuto: 'Otomatis (browser)',
  },
  context: {
    detecting: 'Mendeteksi…',
    notOnTg: 'Tidak di Telegram Web',
    active: 'Telegram Web · Aktif',
    batchTitle: 'Unduh batch',
    batchHint: 'Cari media di bilah samping untuk mengaktifkan',
    batchReady: 'Siap — unduh batch tersedia di daftar chat',
  },
  modal: {
    close: 'Tutup',
    largeFile: {
      title: 'File besar terdeteksi',
      sizeMB: 'Sekitar {size} MB',
      durationMin: 'Sekitar {minutes} menit',
      desc:
        '{meta}<br />File besar mungkin lambat atau gagal di browser.<br />Lanjutkan?',
      noRemind: 'Jangan ingatkan lagi',
      browserDownload: 'Lanjutkan unduhan',
    },
    reviewInvite: {
      title: 'Boleh bantu tinggalkan ulasan baik?',
      desc:
        'Anda sudah menyelesaikan <strong>{count}</strong> unduhan dengan tgdown. Jika alat ini menghemat waktu Anda, ulasan yang tulus akan sangat berarti dan membantu kami terus memperbaiki alat gratis ini. 🙏',
      rateNow: 'Beri ulasan',
      noThanks: 'Nanti saja',
    },
    toast: {
      done: 'Unduhan selesai!',
    },
  },
  content: {
    downloadDoneToast: '',
    networkError: 'Kesalahan jaringan — periksa koneksi dan coba lagi.',
    downloadFailed: 'Unduhan gagal',
    noDownloadUrl: 'Tidak dapat mendapatkan URL unduhan',
    handleDownloadFailed: 'Gagal memproses unduhan',
    cannotOpenVideo: 'Tidak dapat membuka video',
    noVideoUrl: 'Tidak dapat mendapatkan URL video — putar dulu di chat',
    batchSelected: '{count} dipilih',
  },
  button: {
    downloadTitle: 'Unduh',
    waiting: 'Menunggu…',
    fetching: 'Mengambil video…',
    downloading: 'Mengunduh {percent}%',
    done: 'Unduhan selesai',
    failed: 'Unduhan gagal',
  },
  stories: {
    downloadTitle: 'Unduh Story saat ini',
  },
};

export default id;
