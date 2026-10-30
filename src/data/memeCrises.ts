import { CrisisEncounter } from '../types/battler';

export const ALL_CRISES: CrisisEncounter[] = [
  {
    id: 'urgent_slide',
    sender: 'Sếp Tổng CEO',
    title: 'Gấp Lắm: 30 Slide Trước 12h!',
    body: '"Anh cần 30 slide thuyết trình đối tác ngoại quốc, số liệu tự bịa cho hợp lý nhé em."',
    gif: 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif',
    fallbackEmoji: '👔🐱',
    targetProgress: 5,
    threat: {
      energy: -2,
      backlog: 2,
      desc: 'Mất 2 Năng Lượng & +2 Việc Tồn đọng'
    },
    rewardScore: 40
  },
  {
    id: 'friday_5pm',
    sender: 'Khách Hàng Khó Tính',
    title: 'Đổi Brief Lúc 17:55 Thứ Sáu',
    body: '"Chị thấy tông màu xanh này hơi buồn, em đổi qua đỏ cam dạ quang rồi gửi lại trước 18h nhé."',
    gif: 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif',
    fallbackEmoji: '🙀🎨',
    targetProgress: 6,
    threat: {
      energy: -3,
      backlog: 3,
      desc: 'Mất 3 Năng Lượng & Tăng ca cả đêm (+3 Việc)'
    },
    rewardScore: 50
  },
  {
    id: 'printer_jam',
    sender: 'Máy In Tầng 4',
    title: 'Máy In Kẹt Giấy & Đòi Biểu Tình',
    body: 'Máy in nhả khói đen mịt mù, nuốt trọn 50 tờ hợp đồng quan trọng và từ chối in tiếp.',
    gif: 'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif',
    fallbackEmoji: '🖨️💥',
    targetProgress: 4,
    threat: {
      energy: -1,
      backlog: 2,
      desc: 'Mất 1 Năng Lượng & Hợp đồng trễ hạn (+2 Việc)'
    },
    rewardScore: 30
  },
  {
    id: 'pointless_meeting',
    sender: 'Lịch Outlook',
    title: 'Họp 90 Phút Để Thảo Luận Xem Khi Nào Họp',
    body: 'Cuộc họp dài vô tận không có agenda, mọi người gật gù trong cơn mê sảng.',
    gif: 'https://media.giphy.com/media/unQ3IJU2RG7DO/giphy.gif',
    fallbackEmoji: '📅💤',
    targetProgress: 4,
    threat: {
      energy: -2,
      desc: 'Bị hút cạn 2 Năng Lượng vì chán chường'
    },
    rewardScore: 35
  },
  {
    id: 'boba_drama',
    sender: 'Group Chat Nội Bộ',
    title: 'Drama Chia Tiền Trà Sữa Thiếu 15k',
    body: 'Cả phòng điều tra 3 tiếng đồng hồ xem ai gọi thêm thạch phô mai mà không chịu chuyển khoản.',
    gif: 'https://media.giphy.com/media/VbnUQIRNNGLSpjMlNT/giphy.gif',
    fallbackEmoji: '🧋🐱',
    targetProgress: 3,
    threat: {
      rep: -1,
      desc: 'Bị nghi ngờ quỵt tiền, mất 1 Uy Tín (⭐ -1)'
    },
    rewardScore: 25
  },
  {
    id: 'wifi_outage',
    sender: 'Hạ Tầng Mạng IT',
    title: 'Cá Mập Cắn Cáp, Mạng Quay Tít Mù',
    body: 'File 100MB tải mất 4 tiếng, cuộc gọi Zoom đứng hình ngay khoảnh khắc bạn đang ngáp.',
    gif: 'https://media.giphy.com/media/NTur7XlVDUdqM/giphy.gif',
    fallbackEmoji: '🌐🔥',
    targetProgress: 4,
    threat: {
      energy: -1,
      backlog: 2,
      desc: 'Ức chế mất 1 Năng Lượng, task dồn ứ (+2 Việc)'
    },
    rewardScore: 35
  },
  {
    id: 'surprise_kpi',
    sender: 'Phòng Nhân Sự HR',
    title: 'Đoàn Thanh Tra Hiệu Suất Đột Xuất',
    body: '"Em vui lòng trình bày 5 giá trị cốt lõi em đã đóng góp cho tổ chức trong sáng nay."',
    gif: 'https://media.giphy.com/media/PUBxelPJlRf0cAjs79/giphy.gif',
    fallbackEmoji: '📋👀',
    targetProgress: 6,
    threat: {
      rep: -2,
      energy: -1,
      desc: 'Bị đánh giá không đạt, mất 2 Uy Tín & 1 Năng Lượng'
    },
    rewardScore: 60
  },
  {
    id: 'team_building_sun',
    sender: 'Ban Công Đoàn',
    title: 'Team Building Giữa Trưa 39°C',
    body: '"Chúng ta cùng ra bãi cát chạy tiếp sức để thắt chặt tình đồng chí và tinh thần chiến binh!"',
    gif: 'https://media.giphy.com/media/GeimqsH0TLDt4tScGw/giphy.gif',
    fallbackEmoji: '🏃‍♂️☀️',
    targetProgress: 5,
    threat: {
      energy: -3,
      desc: 'Say nắng kiệt sức, mất 3 Năng Lượng (⚡ -3)'
    },
    rewardScore: 45
  }
];
