import type { MessageTree } from '../types';

const ko: MessageTree = {
  brand: {
    name: 'tgdown',
    subtitle: '무료 · 횟수 무제한 · 추가 계정 불필요',
    statusActivating: '활성화 중…',
    statusActive: '활성',
    statusInactive: '비활성',
    statusActivatingTitle: '처리 중…',
    statusActiveTitle: 'Telegram Web이 활성화되었습니다. 클릭하여 페이지를 새로고침하세요.',
    statusInactiveTitle:
      '비활성 상태입니다. 클릭하여 Telegram Web(K)을 열거나 현재 Telegram 탭을 새로고침하세요.',
    activateHint: '오른쪽 상단의「비활성」을 클릭하여 Telegram Web을 여세요',
  },
  media: {
    title: '캡처된 미디어',
    empty: '아직 캡처 없음',
    emptyHint: 'Telegram에서 이미지를 보거나 동영상을 재생하면 여기에 수집됩니다',
    clear: '지우기',
    clearConfirm: '캡처된 모든 미디어 기록을 지울까요?',
    downloadSelected: '선택 항목 다운로드 ({count})',
    downloadingSelected: '다운로드 중…',
    thumbAlt: '썸네일',
    cancelDownload: '다운로드 취소',
    copyLink: '다운로드 링크 복사',
    download: '다운로드',
    retryDownload: '다시 다운로드',
    taskLoading: '준비 중…',
    taskDownloading: '다운로드 중 {percent}%',
    taskDone: '완료',
    taskCancelled: '취소됨 — 탭하여 재시도',
    taskError: '다운로드 실패 — 탭하여 재시도',
    blobAlert:
      'Blob 링크 다운로드를 위해 Telegram 탭을 열어 두고 활성 상태를 유지해야 합니다.',
  },
  footer: {
    howToUse: '사용 방법',
    contact: '문의하기',
  },
  tabs: {
    label: '다운로드 방식',
    batch: '일괄 다운로드',
    manual: '수동 다운로드',
  },
  manualGuide: {
    eyebrow: '수동 다운로드',
    title: '사진 또는 동영상 다운로드',
    subtitle: 'Telegram 미디어 메시지에 직접 표시되는 다운로드 버튼을 사용하세요.',
    exampleButton: '동영상 다운로드',
    stepOneTitle: 'Telegram 채팅 열기',
    stepOneDesc: '저장하려는 사진 또는 동영상 메시지를 찾으세요.',
    stepTwoTitle: '미디어 보기',
    stepTwoDesc: '사진 위에 마우스를 올리거나 동영상을 재생해 버튼을 표시하세요.',
    stepThreeTitle: '다운로드 클릭',
    stepThreeDesc: '파일이 브라우저 다운로드 폴더에 저장됩니다.',
    cta: '전체 사용 가이드 보기',
  },
  settings: {
    language: '언어',
    languageAuto: '자동(브라우저)',
  },
  context: {
    detecting: '감지 중…',
    notOnTg: 'Telegram Web이 아님',
    active: 'Telegram Web · 활성',
    batchTitle: '일괄 다운로드',
    batchHint: '사이드바에서 미디어를 검색하면 사용 가능',
    batchReady: '준비 완료 — 채팅 목록에서 일괄 다운로드 가능',
  },
  modal: {
    close: '닫기',
    largeFile: {
      title: '대용량 파일 감지',
      sizeMB: '약 {size} MB',
      durationMin: '약 {minutes}분',
      desc:
        '{meta}<br />대용량 파일은 브라우저에서 다운로드가 느리거나 실패할 수 있습니다.<br />계속하시겠습니까?',
      noRemind: '다시 알리지 않음',
      browserDownload: '다운로드 계속',
    },
    reviewInvite: {
      title: '따뜻한 리뷰를 남겨주실 수 있을까요?',
      desc:
        'tgdown로 <strong>{count}</strong>번의 다운로드를 완료하셨습니다. 이 도구가 시간을 아껴 드렸다면, 진심 어린 리뷰 하나가 저희에게 큰 힘이 되고 이 무료 도구를 계속 개선하는 데 도움이 됩니다. 🙏',
      rateNow: '리뷰 남기기',
      noThanks: '나중에',
    },
    toast: {
      done: '다운로드 완료!',
    },
  },
  content: {
    downloadDoneToast: '',
    networkError: '네트워크 오류 — 연결을 확인하고 다시 시도하세요.',
    downloadFailed: '다운로드 실패',
    noDownloadUrl: '다운로드 URL을 가져올 수 없습니다',
    handleDownloadFailed: '다운로드 처리 실패',
    cannotOpenVideo: '동영상을 열 수 없습니다',
    noVideoUrl: '동영상 URL을 가져올 수 없습니다 — 먼저 채팅에서 재생하세요',
    batchSelected: '{count}개 선택',
  },
  button: {
    downloadTitle: '다운로드',
    waiting: '대기 중…',
    fetching: '동영상 가져오는 중…',
    downloading: '다운로드 중 {percent}%',
    done: '다운로드 완료',
    failed: '다운로드 실패',
  },
  stories: {
    downloadTitle: '현재 Story 다운로드',
  },
};

export default ko;
