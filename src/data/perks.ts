import { Perk } from '../types/game';

export const ALL_PERKS: Perk[] = [
  { id: 'headphones', name: 'Tai nghe chống ồn', emoji: '🎧', desc: 'Giảm 1 năng lượng tiêu hao trong các cuộc họp.' },
  { id: 'thermos', name: 'Bình giữ nhiệt 1.5L', emoji: '☕', desc: 'Sang ngày mới được hồi thêm +1 Năng lượng (tổng +5).' },
  { id: 'leave_form', name: 'Mẫu đơn nghỉ phép', emoji: '📑', desc: 'Bảo hiểm: Tự động hoá giải 1 lần khủng hoảng Backlog (giảm 3 việc).' },
  { id: 'sunglasses', name: 'Kính râm ngủ gật', emoji: '🕶️', desc: 'Bảo hiểm: Miễn nhiễm mất mạng lần đầu tiên khi năng lượng về 0.' },
  { id: 'boba_card', name: 'Thẻ tích điểm Phúc Long', emoji: '🧋', desc: 'Mỗi lần giảm việc tồn được cộng thêm +5 điểm thưởng.' },
  { id: 'power_strip', name: 'Ổ cắm đa năng', emoji: '🔌', desc: 'Tăng 15% tỷ lệ thành công của các lựa chọn may rủi 🎲.' },
  { id: 'cactus', name: 'Xương rồng để bàn', emoji: '🪴', desc: 'Uy tín không bao giờ giảm xuống dưới 1 từ các lựa chọn thông thường.' },
  { id: 'stress_ball', name: 'Bóng xả stress', emoji: '🎾', desc: 'Mỗi khi gặp thẻ Khủng hoảng, tự động hồi +1 Năng lượng.' }
];
