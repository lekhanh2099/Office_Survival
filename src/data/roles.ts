export interface Role {
  id: string;
  name: string;
  title: string;
  emoji: string;
  memeAvatar: string;
  motto: string;
  desc: string;
  passiveName: string;
  passiveDesc: string;
  initE: number;
  initB: number;
  initR: number;
  maxB?: number;
  rollBonus?: number;
}

export const ROLES: Record<string, Role> = {
  genz: {
    id: 'genz',
    name: 'Thực Tập Sinh Gen Z',
    title: 'CHIẾN THẦN 17:30 VỀ ĐÚNG GIỜ',
    emoji: '🐣',
    memeAvatar: '🐱📱',
    motto: '"Hết giờ là em về, sếp đừng giao việc sau 17h nha!"',
    desc: 'Tuổi trẻ tràn trề năng lượng nhưng dị ứng với tăng ca và họp hành vô nghĩa.',
    passiveName: 'Hồi phục Gen Z',
    passiveDesc: 'Mỗi sáng hồi tối đa 5 Năng Lượng (thay vì 4). Khởi đầu với 9 Năng Lượng.',
    initE: 9,
    initB: 2,
    initR: 2
  },
  senior: {
    id: 'senior',
    name: 'Senior Chai Sạn',
    title: 'CỪU VÀNG CÔNG SỞ',
    emoji: '🧟',
    memeAvatar: '🐶🔥',
    motto: '"This is fine. Mọi thứ vẫn ổn dù công ty sắp cháy."',
    desc: 'Chai lì trước deadline, gánh vác mọi task tồn đọng mà không kêu ca một lời.',
    passiveName: 'Lưng Thép',
    passiveDesc: 'Chịu được tới 9 Việc Tồn mới mất mạng (bình thường là 8).',
    initE: 7,
    initB: 1,
    initR: 4,
    maxB: 9
  },
  sales: {
    id: 'sales',
    name: 'Dân Sales Chém Gió',
    title: 'PHÙ THỦY POWERPOINT',
    emoji: '🐸',
    memeAvatar: '🐸👔',
    motto: '"Số liệu tính sau, quan trọng là thần thái và slide đẹp."',
    desc: 'Bậc thầy may rủi, nói hươu nói vượn khiến khách hàng và sếp đều gật đầu.',
    passiveName: 'Mồm Mép Vô Song',
    passiveDesc: 'Tất cả các lựa chọn xúc xắc May Rủi (🎲) được +15% tỉ lệ thắng.',
    initE: 8,
    initB: 2,
    initR: 4,
    rollBonus: 0.15
  },
  introvert: {
    id: 'introvert',
    name: 'Chuyên Viên Hướng Nội',
    title: 'BÓNG MA PHÒNG LÀM VIỆC',
    emoji: '🦥',
    memeAvatar: '🐟💤',
    motto: '"Xin hãy trao đổi qua Slack/Email, đừng bao giờ gọi điện."',
    desc: 'Chuyên gia tàng hình, ít khi bị sếp chú ý và giỏi né các cuộc họp đột xuất.',
    passiveName: 'Tàng Hình Nơi Công Sở',
    passiveDesc: 'Bắt đầu với chỉ 1 việc tồn, ít bị cuốn vào drama đồng nghiệp.',
    initE: 8,
    initB: 1,
    initR: 3
  }
};

export const ALL_ROLES = Object.values(ROLES);
