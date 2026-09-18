import { promises as fs } from 'node:fs';
import path from 'node:path';

const TITLE_LIMIT = 75;
const DESCRIPTION_LIMIT = 132;
const PRODUCT_NAME = 'tgdown';

const messages = {
  ar: {
    title: 'مجاني Telegram Video Downloader - تنزيل دفعي غير محدود',
    description:
      'نزّل فيديو وصور Telegram مجانًا وبلا حدود أو حساب إضافي للإضافة، حتى من القنوات الخاصة والمجموعات التي يمكنك الوصول إليها.',
  },
  de: {
    title: 'Kostenloser Telegram Video Downloader - Unbegrenzt im Batch',
    description:
      'Telegram-Videos und -Fotos gratis und unbegrenzt laden – ohne extra Erweiterungskonto, auch aus zugänglichen privaten Kanälen.',
  },
  en: {
    title: 'Free Telegram Video Downloader - Unlimited Batch Downloads',
    description:
      'Free Telegram video downloader for private channels and groups. Unlimited batch video and photo downloads, no extension account.',
  },
  en_GB: {
    title: 'Free Telegram Video Downloader - Unlimited Batch Downloads',
    description:
      'Free Telegram video downloader for private channels and groups. Unlimited batch video and photo downloads, no extension account.',
  },
  en_US: {
    title: 'Free Telegram Video Downloader - Unlimited Batch Downloads',
    description:
      'Free Telegram video downloader for private channels and groups. Unlimited batch video and photo downloads, no extension account.',
  },
  es: {
    title: 'Gratis Telegram Video Downloader - Lotes ilimitados',
    description:
      'Descarga gratis y sin límites videos y fotos, sin cuenta adicional de la extensión, incluso de canales privados y grupos accesibles.',
  },
  fr: {
    title: 'Gratuit Telegram Video Downloader - Lots illimités',
    description:
      'Téléchargez vidéos et photos gratuitement et sans limite, sans compte d’extension, même depuis vos canaux privés accessibles.',
  },
  id: {
    title: 'Gratis Telegram Video Downloader - Batch Tanpa Batas',
    description:
      'Unduh video dan foto gratis tanpa batas atau akun ekstensi tambahan, termasuk dari channel privat dan grup yang dapat Anda akses.',
  },
  it: {
    title: 'Gratis Telegram Video Downloader - Batch illimitati',
    description:
      'Scarica gratis video e foto senza limiti né account extra per l’estensione, anche da canali privati e gruppi accessibili.',
  },
  ja: {
    title: '無料Telegram動画ダウンローダー - 無制限の一括ダウンロード',
    description:
      '無料・回数無制限・追加の拡張機能アカウント不要。アクセスできる非公開チャンネルや制限付きグループから動画と画像を一括保存。',
  },
  ko: {
    title: '무료 Telegram 동영상 다운로더 - 무제한 일괄 다운로드',
    description:
      '무료·무제한·추가 확장 프로그램 계정 없이 동영상과 사진을 일괄 저장하세요. 접근 가능한 비공개 채널과 그룹도 지원합니다.',
  },
  pl: {
    title: 'Darmowy Telegram Video Downloader - Bez limitu i seryjnie',
    description:
      'Pobieraj filmy i zdjęcia za darmo, bez limitu i dodatkowego konta rozszerzenia — także z dostępnych kanałów prywatnych i grup.',
  },
  pt_BR: {
    title: 'Grátis Telegram Video Downloader - Lotes ilimitados',
    description:
      'Baixe vídeos e fotos grátis, sem limites ou conta extra da extensão, inclusive de canais privados e grupos que você pode acessar.',
  },
  pt_PT: {
    title: 'Grátis Telegram Video Downloader - Lotes ilimitados',
    description:
      'Transfira vídeos e fotos grátis, sem limites nem conta extra da extensão, incluindo canais privados e grupos a que tem acesso.',
  },
  ru: {
    title: 'Бесплатный Telegram Video Downloader - Безлимитно и пакетно',
    description:
      'Скачивайте видео и фото бесплатно, без лимитов и отдельного аккаунта расширения — даже из доступных частных каналов и групп.',
  },
  tr: {
    title: 'Ücretsiz Telegram Video Downloader - Sınırsız toplu indirme',
    description:
      'Video ve fotoğrafları ücretsiz, sınırsız ve ek uzantı hesabı olmadan indirin; erişebildiğiniz özel kanal ve grupları destekler.',
  },
  uk: {
    title: 'Безкоштовний Telegram Video Downloader - Пакетно без лімітів',
    description:
      'Завантажуйте відео й фото безкоштовно, без лімітів та окремого акаунта розширення — із доступних приватних каналів і груп.',
  },
  vi: {
    title: 'Miễn phí Telegram Video Downloader - Tải hàng loạt vô hạn',
    description:
      'Tải video và ảnh miễn phí, không giới hạn, không cần tài khoản tiện ích, kể cả từ kênh riêng tư và nhóm bạn có quyền truy cập.',
  },
  zh_CN: {
    title: '免费Telegram视频下载器 - 无限次数批量下载',
    description:
      'Telegram视频下载器是一款免费工具，可下载私密频道和群组中的视频与图片，支持无限次数批量下载，无需注册扩展账号；使用时仍需登录Telegram Web。',
  },
  zh_TW: {
    title: '免費Telegram影片下載器 - 無限次數批次下載',
    description:
      'Telegram影片下載器是一款免費工具，可下載私人頻道和群組中的影片與圖片，支援無限次數批次下載，無需註冊擴充功能帳號；使用時仍需登入Telegram Web。',
  },
};

const localesDir = path.resolve('_locales');
const localeNames = (await fs.readdir(localesDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const missing = localeNames.filter((name) => !messages[name]);
if (missing.length) {
  throw new Error(`Missing store copy for locale(s): ${missing.join(', ')}`);
}

for (const locale of localeNames) {
  const copy = messages[locale];
  if (copy.title.length > TITLE_LIMIT) {
    throw new Error(`${locale} title is ${copy.title.length}/${TITLE_LIMIT}: ${copy.title}`);
  }
  if (copy.description.length > DESCRIPTION_LIMIT) {
    throw new Error(
      `${locale} description is ${copy.description.length}/${DESCRIPTION_LIMIT}: ${copy.description}`,
    );
  }

  const file = path.join(localesDir, locale, 'messages.json');
  const json = JSON.parse(await fs.readFile(file, 'utf8'));
  json.extensionName = { message: copy.title };
  json.extensionShortName = { message: PRODUCT_NAME };
  json.extensionDescription = { message: copy.description };
  json.actionTitle = { message: PRODUCT_NAME };
  await fs.writeFile(file, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  console.log(
    `${locale}: title ${copy.title.length}/${TITLE_LIMIT}, description ${copy.description.length}/${DESCRIPTION_LIMIT}`,
  );
}
