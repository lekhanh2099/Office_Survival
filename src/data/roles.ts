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
    name: 'Merchandiser Quản Lý Đơn',
    title: 'CHIẾN THẦN TECHPACK & LAB-DIP',
    emoji: '🧵',
    memeAvatar: '🐱📱',
    motto: '"Khách US đổi màu phút chót, xưởng đòi tăng đơn giá, em ở giữa gánh hết!"',
    desc: 'Cầu nối chịu đấm ăn xôi giữa Buyer ngoại quốc và xưởng may. Thức trắng đêm canh Lab-dip và mẫu Proto.',
    passiveName: 'Caffein Đơn Hàng',
    passiveDesc: 'Mỗi sáng hồi tối đa 5 Năng Lượng (thay vì 4). Khởi đầu với 9 Năng Lượng.',
    initE: 9,
    initB: 2,
    initR: 2
  },
  senior: {
    id: 'senior',
    name: 'Kế Toán Kho & Giá Thành Vải',
    title: 'ÁM ẢNH LỆCH TỒN KHO',
    emoji: '📊',
    memeAvatar: '🐶🔥',
    motto: '"Kiểm kê cuối quý lệch 3000 mét vải thun và 5 vạn cúc, ai ký phiếu xuất?!"',
    desc: 'Chai sạn trước núi cuộn vải mộc, soi từng milimet định mức tiêu hao (consumption) và hóa đơn GTGT.',
    passiveName: 'Lưng Thép Kho Vải',
    passiveDesc: 'Chịu được tới 9 Việc Tồn mới mất mạng (bình thường là 8).',
    initE: 7,
    initB: 1,
    initR: 4,
    maxB: 9
  },
  sales: {
    id: 'sales',
    name: 'Chứng Từ & Giao Nhận Cảng (Logistics)',
    title: 'THÁNH ĐUA CUT-OFF CÁT LÁI',
    emoji: '🚢',
    memeAvatar: '🐸👔',
    motto: '"17:00 Cut-off cảng mà cont còn kẹt ở cầu Phú Mỹ, anh em cứu em!"',
    desc: 'Bậc thầy luồn lách qua các luồng Xanh - Vàng - Đỏ, đàm phán với hãng tàu dời Closing Time và nài nỉ Hải quan.',
    passiveName: 'Mồm Mép Cảng Biển',
    passiveDesc: 'Tất cả các lựa chọn xúc xắc May Rủi (🎲) được +15% tỉ lệ thắng.',
    initE: 8,
    initB: 2,
    initR: 4,
    rollBonus: 0.15
  },
  introvert: {
    id: 'introvert',
    name: 'Trưởng Nhóm QA/QC (KCS)',
    title: 'SÁT THỦ THƯỚC DÂY & ĐƯỜNG MAY',
    emoji: '🔍',
    memeAvatar: '🐟💤',
    motto: '"Lệch sườn 2mm, loang màu nách áo, AQL 2.5 rớt đài, đình chỉ xuất hàng!"',
    desc: 'Thước dây bất ly thân, soi kính lúp từng mũi kim mũi chỉ, nỗi khiếp sợ tột cùng của mọi chuyền may gia công.',
    passiveName: 'Soi Lỗi Tàng Hình',
    passiveDesc: 'Bắt đầu với chỉ 1 việc tồn, uy tín cao và ít bị cuốn vào drama xưởng may.',
    initE: 8,
    initB: 1,
    initR: 3
  }
};

export const ALL_ROLES = Object.values(ROLES);
