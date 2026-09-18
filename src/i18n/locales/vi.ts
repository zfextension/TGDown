import type { MessageTree } from '../types';

const vi: MessageTree = {
  brand: {
    name: 'tgdown',
    subtitle: 'Miễn phí · Không giới hạn · Không cần tài khoản phụ',
    statusActivating: 'Đang kích hoạt…',
    statusActive: 'Đang hoạt động',
    statusInactive: 'Không hoạt động',
    statusActivatingTitle: 'Đang xử lý…',
    statusActiveTitle: 'Telegram Web đang hoạt động. Nhấn để làm mới trang.',
    statusInactiveTitle:
      'Không hoạt động. Nhấn để mở Telegram Web (K) hoặc làm mới tab Telegram hiện tại.',
    activateHint: 'Nhấn「Không hoạt động」ở góc trên bên phải để mở Telegram Web',
  },
  media: {
    title: 'Phương tiện đã thu thập',
    empty: 'Chưa có bản ghi nào',
    emptyHint: 'Duyệt ảnh hoặc phát video trên Telegram để thu thập tại đây',
    clear: 'Xóa',
    clearConfirm: 'Xóa tất cả bản ghi phương tiện đã thu thập?',
    downloadSelected: 'Tải mục đã chọn ({count})',
    downloadingSelected: 'Đang tải…',
    thumbAlt: 'Ảnh thu nhỏ',
    cancelDownload: 'Hủy tải xuống',
    copyLink: 'Sao chép liên kết tải',
    download: 'Tải xuống',
    retryDownload: 'Tải lại',
    taskLoading: 'Đang chuẩn bị…',
    taskDownloading: 'Đang tải {percent}%',
    taskDone: 'Hoàn tất',
    taskCancelled: 'Đã hủy — chạm để thử lại',
    taskError: 'Tải thất bại — chạm để thử lại',
    blobAlert:
      'Liên kết blob yêu cầu tab Telegram phải mở và đang hoạt động để tải xuống.',
  },
  footer: {
    howToUse: 'Cách sử dụng',
    contact: 'Liên hệ',
  },
  tabs: {
    label: 'Chế độ tải xuống',
    batch: 'Tải hàng loạt',
    manual: 'Tải thủ công',
  },
  manualGuide: {
    eyebrow: 'Tải thủ công',
    title: 'Tải ảnh hoặc video',
    subtitle: 'Dùng nút tải xuống xuất hiện trực tiếp trên tin nhắn đa phương tiện Telegram.',
    exampleButton: 'Tải video',
    stepOneTitle: 'Mở cuộc trò chuyện Telegram',
    stepOneDesc: 'Tìm tin nhắn ảnh hoặc video bạn muốn lưu.',
    stepTwoTitle: 'Xem nội dung đa phương tiện',
    stepTwoDesc: 'Di chuột qua ảnh hoặc phát video để hiện nút tải xuống.',
    stepThreeTitle: 'Nhấn Tải xuống',
    stepThreeDesc: 'Tệp sẽ được lưu vào thư mục tải xuống của trình duyệt.',
    cta: 'Xem hướng dẫn đầy đủ',
  },
  settings: {
    language: 'Ngôn ngữ',
    languageAuto: 'Tự động (trình duyệt)',
  },
  context: {
    detecting: 'Đang phát hiện…',
    notOnTg: 'Không ở Telegram Web',
    active: 'Telegram Web · Đang hoạt động',
    batchTitle: 'Tải hàng loạt',
    batchHint: 'Tìm phương tiện ở thanh bên để bật',
    batchReady: 'Sẵn sàng — tải hàng loạt có trong danh sách trò chuyện',
  },
  modal: {
    close: 'Đóng',
    largeFile: {
      title: 'Phát hiện tệp lớn',
      sizeMB: 'Khoảng {size} MB',
      durationMin: 'Khoảng {minutes} phút',
      desc:
        '{meta}<br />Tệp lớn có thể tải chậm hoặc thất bại trong trình duyệt.<br />Tiếp tục?',
      noRemind: 'Không nhắc lại',
      browserDownload: 'Tiếp tục tải',
    },
    reviewInvite: {
      title: 'Bạn có thể để lại một đánh giá tốt không?',
      desc:
        'Bạn đã hoàn tất <strong>{count}</strong> lượt tải bằng tgdown. Nếu công cụ này giúp bạn tiết kiệm thời gian, một đánh giá chân thành sẽ rất có ý nghĩa và giúp chúng tôi tiếp tục cải thiện công cụ miễn phí này. 🙏',
      rateNow: 'Để lại đánh giá',
      noThanks: 'Để sau',
    },
    toast: {
      done: 'Tải xong!',
    },
  },
  content: {
    downloadDoneToast: '',
    networkError: 'Lỗi mạng — kiểm tra kết nối và thử lại.',
    downloadFailed: 'Tải thất bại',
    noDownloadUrl: 'Không lấy được URL tải xuống',
    handleDownloadFailed: 'Xử lý tải xuống thất bại',
    cannotOpenVideo: 'Không mở được video',
    noVideoUrl: 'Không lấy được URL video — hãy phát video trong trò chuyện trước',
    batchSelected: 'Đã chọn {count}',
  },
  button: {
    downloadTitle: 'Tải xuống',
    waiting: 'Đang chờ…',
    fetching: 'Đang lấy video…',
    downloading: 'Đang tải {percent}%',
    done: 'Tải xong',
    failed: 'Tải thất bại',
  },
  stories: {
    downloadTitle: 'Tải Story hiện tại',
  },
};

export default vi;
