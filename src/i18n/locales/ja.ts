import type { MessageTree } from '../types';

const ja: MessageTree = {
  brand: {
    name: 'tgdown',
    subtitle: '無料 · 回数無制限 · 追加アカウント不要',
    statusActivating: '有効化中…',
    statusActive: '有効',
    statusInactive: '無効',
    statusActivatingTitle: '処理中…',
    statusActiveTitle: 'Telegram Web は有効です。クリックしてページを更新してください。',
    statusInactiveTitle:
      '無効です。クリックして Telegram Web (K) を開くか、現在の Telegram タブを更新してください。',
    activateHint: '右上の「無効」をクリックして Telegram Web を開いてください',
  },
  media: {
    title: 'キャプチャしたメディア',
    empty: 'まだキャプチャがありません',
    emptyHint: 'Telegram で画像を閲覧したり動画を再生すると、ここに自動的に収集されます',
    clear: 'クリア',
    clearConfirm: 'キャプチャしたメディアの記録をすべて削除しますか？',
    downloadSelected: '選択項目をダウンロード ({count})',
    downloadingSelected: 'ダウンロード中…',
    thumbAlt: 'サムネイル',
    cancelDownload: 'ダウンロードをキャンセル',
    copyLink: 'ダウンロードリンクをコピー',
    download: 'ダウンロード',
    retryDownload: '再ダウンロード',
    taskLoading: '準備中…',
    taskDownloading: 'ダウンロード中 {percent}%',
    taskDone: '完了',
    taskCancelled: 'キャンセル済み — タップして再試行',
    taskError: 'ダウンロード失敗 — タップして再試行',
    blobAlert:
      'Blob リンクのダウンロードには、Telegram タブを開いたままアクティブにしておく必要があります。',
  },
  footer: {
    howToUse: '使い方',
    contact: 'お問い合わせ',
  },
  tabs: {
    label: 'ダウンロード方法',
    batch: '一括ダウンロード',
    manual: '手動ダウンロード',
  },
  manualGuide: {
    eyebrow: '手動ダウンロード',
    title: '写真や動画をダウンロード',
    subtitle: 'Telegram のメディアメッセージ上に表示されるダウンロードボタンを使います。',
    exampleButton: '動画をダウンロード',
    stepOneTitle: 'Telegram チャットを開く',
    stepOneDesc: '保存したい写真または動画のメッセージを見つけます。',
    stepTwoTitle: 'メディアを表示する',
    stepTwoDesc: '写真にカーソルを置くか、動画を再生してボタンを表示します。',
    stepThreeTitle: 'ダウンロードをクリック',
    stepThreeDesc: 'ファイルはブラウザのダウンロードフォルダに保存されます。',
    cta: '完全な使い方ガイドを見る',
  },
  settings: {
    language: '言語',
    languageAuto: '自動（ブラウザ）',
  },
  context: {
    detecting: '検出中…',
    notOnTg: 'Telegram Web ではありません',
    active: 'Telegram Web · 有効',
    batchTitle: '一括ダウンロード',
    batchHint: 'サイドバーでメディアを検索すると利用できます',
    batchReady: '準備完了 — チャット一覧で一括ダウンロードが利用できます',
  },
  modal: {
    close: '閉じる',
    largeFile: {
      title: '大容量ファイルを検出',
      sizeMB: '約 {size} MB',
      durationMin: '約 {minutes} 分',
      desc:
        '{meta}<br />大容量ファイルはブラウザでのダウンロードが遅くなったり失敗しやすい場合があります。<br />続行しますか？',
      noRemind: '今後表示しない',
      browserDownload: 'ダウンロードを続行',
    },
    reviewInvite: {
      title: 'よろしければレビューをお願いできますか？',
      desc:
        'tgdown で <strong>{count}</strong> 回のダウンロードが完了しました。もし時間の節約に役立っていたら、率直なレビューをいただけると本当に励みになり、この無料ツールの改善を続ける力になります。🙏',
      rateNow: 'レビューを書く',
      noThanks: '今はしない',
    },
    toast: {
      done: 'ダウンロード完了！',
    },
  },
  content: {
    downloadDoneToast: '',
    networkError: 'ネットワークエラー — 接続を確認して再試行してください。',
    downloadFailed: 'ダウンロード失敗',
    noDownloadUrl: 'ダウンロード URL を取得できませんでした',
    handleDownloadFailed: 'ダウンロード処理に失敗しました',
    cannotOpenVideo: '動画を開けませんでした',
    noVideoUrl: '動画 URL を取得できませんでした — まずチャットで再生してください',
    batchSelected: '{count} 件選択',
  },
  button: {
    downloadTitle: 'ダウンロード',
    waiting: '待機中…',
    fetching: '動画を取得中…',
    downloading: 'ダウンロード中 {percent}%',
    done: 'ダウンロード完了',
    failed: 'ダウンロード失敗',
  },
  stories: {
    downloadTitle: '現在の Story をダウンロード',
  },
};

export default ja;
