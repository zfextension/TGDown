import type { MessageTree } from '../types';

const ar: MessageTree = {
  brand: {
    name: 'tgdown',
    subtitle: 'مجاني · تنزيلات غير محدودة · بلا حساب إضافي',
    statusActivating: 'جارٍ التفعيل…',
    statusActive: 'نشط',
    statusInactive: 'غير نشط',
    statusActivatingTitle: 'جارٍ المعالجة…',
    statusActiveTitle: 'Telegram Web نشط. انقر لتحديث الصفحة.',
    statusInactiveTitle:
      'غير نشط. انقر لفتح Telegram Web (K) أو تحديث علامة تبويب Telegram الحالية.',
    activateHint: 'انقر على «غير نشط» في الزاوية العلوية اليمنى لفتح Telegram Web',
  },
  media: {
    title: 'الوسائط الملتقطة',
    empty: 'لا توجد التقاطات بعد',
    emptyHint: 'تصفّح الصور أو شغّل الفيديوهات في Telegram لجمعها هنا',
    clear: 'مسح',
    clearConfirm: 'مسح جميع سجلات الوسائط الملتقطة؟',
    downloadSelected: 'تنزيل المحدد ({count})',
    downloadingSelected: 'جارٍ التنزيل…',
    thumbAlt: 'صورة مصغّرة',
    cancelDownload: 'إلغاء التنزيل',
    copyLink: 'نسخ رابط التنزيل',
    download: 'تنزيل',
    retryDownload: 'إعادة التنزيل',
    taskLoading: 'جارٍ التحضير…',
    taskDownloading: 'جارٍ التنزيل {percent}%',
    taskDone: 'تم',
    taskCancelled: 'أُلغي — انقر لإعادة المحاولة',
    taskError: 'فشل التنزيل — انقر لإعادة المحاولة',
    blobAlert:
      'تتطلب روابط Blob بقاء علامة تبويب Telegram مفتوحة ونشطة للتنزيل.',
  },
  footer: {
    howToUse: 'طريقة الاستخدام',
    contact: 'اتصل بنا',
  },
  tabs: {
    label: 'طريقة التنزيل',
    batch: 'تنزيل دفعي',
    manual: 'تنزيل يدوي',
  },
  manualGuide: {
    eyebrow: 'تنزيل يدوي',
    title: 'نزّل صورة أو فيديو',
    subtitle: 'استخدم زر التنزيل الذي يظهر مباشرة على رسائل وسائط Telegram.',
    exampleButton: 'تنزيل الفيديو',
    stepOneTitle: 'افتح دردشة Telegram',
    stepOneDesc: 'اعثر على رسالة الصورة أو الفيديو التي تريد حفظها.',
    stepTwoTitle: 'اعرض الوسائط',
    stepTwoDesc: 'مرّر فوق الصورة أو شغّل الفيديو لإظهار زر التنزيل.',
    stepThreeTitle: 'انقر تنزيل',
    stepThreeDesc: 'سيُحفظ الملف في مجلد تنزيلات المتصفح.',
    cta: 'عرض دليل الاستخدام الكامل',
  },
  settings: {
    language: 'اللغة',
    languageAuto: 'تلقائي (المتصفّح)',
  },
  context: {
    detecting: 'جارٍ الكشف…',
    notOnTg: 'ليس على Telegram Web',
    active: 'Telegram Web · نشط',
    batchTitle: 'تنزيل دفعة',
    batchHint: 'ابحث عن الوسائط في الشريط الجانبي للتفعيل',
    batchReady: 'جاهز — التنزيل الدفعي متاح في قائمة المحادثات',
  },
  modal: {
    close: 'إغلاق',
    largeFile: {
      title: 'تم اكتشاف ملف كبير',
      sizeMB: 'حوالي {size} ميغابايت',
      durationMin: 'حوالي {minutes} دقيقة',
      desc:
        '{meta}<br />قد تكون الملفات الكبيرة بطيئة أو تفشل في المتصفح.<br />هل تريد المتابعة؟',
      noRemind: 'لا تذكرني مرة أخرى',
      browserDownload: 'متابعة التنزيل',
    },
    reviewInvite: {
      title: 'هل يمكنك ترك تقييم لطيف لنا؟',
      desc:
        'لقد أكملت <strong>{count}</strong> تنزيلات باستخدام tgdown. إذا كان قد وفّر عليك الوقت، فسيعني لنا تقييم صادق الكثير ويساعدنا على مواصلة تحسين هذه الأداة المجانية. 🙏',
      rateNow: 'ترك تقييم',
      noThanks: 'ليس الآن',
    },
    toast: {
      done: 'اكتمل التنزيل!',
    },
  },
  content: {
    downloadDoneToast: '',
    networkError: 'خطأ في الشبكة — تحقق من الاتصال وأعد المحاولة.',
    downloadFailed: 'فشل التنزيل',
    noDownloadUrl: 'تعذّر الحصول على رابط التنزيل',
    handleDownloadFailed: 'فشل معالجة التنزيل',
    cannotOpenVideo: 'تعذّر فتح الفيديو',
    noVideoUrl: 'تعذّر الحصول على رابط الفيديو — شغّله أولاً في المحادثة',
    batchSelected: 'تم تحديد {count}',
  },
  button: {
    downloadTitle: 'تنزيل',
    waiting: 'في الانتظار…',
    fetching: 'جارٍ جلب الفيديو…',
    downloading: 'جارٍ التنزيل {percent}%',
    done: 'اكتمل التنزيل',
    failed: 'فشل التنزيل',
  },
  stories: {
    downloadTitle: 'تنزيل Story الحالية',
  },
};

export default ar;
