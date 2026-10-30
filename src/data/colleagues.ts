export interface ColleagueOption {
  id: string;
  label: string;
  emoji: string;
  costDesc: string;
  favorDelta: number;
  energyDelta: number;
  stressDelta: number;
  kpiDelta: number;
  reply: string;
  perkActive?: boolean;
}

export interface ColleagueProfile {
  id: 'boss' | 'nga' | 'tuan' | 'linh' | 'hoang';
  name: string;
  role: string;
  emoji: string;
  avatarBg: string;
  personality: string;
  likes: string;
  quote: string;
  favorPerkTitle: string;
  favorPerkDesc: string;
  options: ColleagueOption[];
}

export const COLLEAGUES_DATA: Record<string, ColleagueProfile> = {
  boss: {
    id: 'boss',
    name: 'Sếp Hùng',
    role: 'Tổng Giám Đốc Điều Hành',
    emoji: '👔',
    avatarBg: '#334155',
    personality: 'Khó tính, nghiêm nghị nhưng rất trọng người tài. Ghét bao biện, thích nhìn thấy số liệu KPI chuẩn chỉ.',
    likes: 'Báo cáo ngắn gọn, đơn hàng đúng hạn, thắp nhang Thần Tài.',
    quote: 'Đơn hàng đi New York tuyệt đối không được trễ tàu, ai làm lỗi là trực đêm đấy!',
    favorPerkTitle: '🏆 Sự Công Nhận Của Ban Giám Đốc',
    favorPerkDesc: 'Khi Thân thiết ≥ 50: Thưởng +30% KPI cho toàn bộ đơn hàng trong ca trực!',
    options: [
      {
        id: 'report_progress',
        label: 'Báo Cáo Tiến Độ Dự Án Chuẩn Xác',
        emoji: '📊',
        costDesc: '-10% ⚡ Năng Lượng',
        favorDelta: +15,
        energyDelta: -10,
        stressDelta: +5,
        kpiDelta: +80,
        reply: 'Tốt lắm! Tinh thần trách nhiệm cao. Ráng duy trì phong độ cuối quý anh đề xuất thưởng nóng!'
      },
      {
        id: 'gift_coffee',
        label: 'Mời Sếp Ly Cà Phê Espresso Đậm Đặc',
        emoji: '☕',
        costDesc: '-15% ⚡ (Pha chế)',
        favorDelta: +20,
        energyDelta: -15,
        stressDelta: -10,
        kpiDelta: +40,
        reply: 'À, cà phê thơm đấy. Dạo này nhiều việc áp lực, cảm ơn em đã chu đáo. Cứ yên tâm cống hiến nhé!'
      },
      {
        id: 'ask_advice',
        label: 'Xin Lời Khuyên Chiến Lược Xuất Khẩu',
        emoji: '💡',
        costDesc: '-5% ⚡ Năng Lượng',
        favorDelta: +10,
        energyDelta: -5,
        stressDelta: -15,
        kpiDelta: +50,
        reply: 'Thị trường Mỹ gắt AQL 2.5, nhưng chỉ cần khâu Lab soi kỹ là khách hàng không bao giờ bắt bẻ được.'
      }
    ]
  },
  nga: {
    id: 'nga',
    name: 'Chị Nga',
    role: 'Kế Toán Kho Vải',
    emoji: '🧮',
    avatarBg: '#b91c1c',
    personality: 'Tay hòm chìa khóa của kho vải. Miệng nói sắc như dao nhưng tính tình hào sảng, đặc biệt là fan cuồng trà sữa.',
    likes: 'Trà sữa Phúc Long full topping, chứng từ ngay ngắn, chém gió giờ nghỉ trưa.',
    quote: 'Cuối quý lệch một tấc vải thun là chị trừ lương cả tổ, ai ký phiếu xuất mang qua chị duyệt!',
    favorPerkTitle: '⚡ Thông Quan Kho Thần Tốc',
    favorPerkDesc: 'Khi Thân thiết ≥ 50: Bỏ qua mọi thủ tục đối chiếu sổ sách, bốc vải tức thì!',
    options: [
      {
        id: 'gift_boba',
        label: 'Mời Chị Ly Trà Sữa Phúc Long Siêu To',
        emoji: '🧋',
        costDesc: '-10% ⚡ Năng Lượng',
        favorDelta: +30,
        energyDelta: -10,
        stressDelta: -20,
        kpiDelta: +50,
        reply: 'Ối dồi ôi bé cưng! Đúng vị chị thích 70% đường 30% đá! Lát xuống kho chị bốc cho cuộn vải đẹp nhất!'
      },
      {
        id: 'help_paperwork',
        label: 'Hỗ Trợ Chị Sắp Xếp Chứng Từ Nhập Xuất',
        emoji: '📑',
        costDesc: '-15% ⚡ Năng Lượng',
        favorDelta: +20,
        energyDelta: -15,
        stressDelta: +5,
        kpiDelta: +70,
        reply: 'Ngoan lắm! Làm việc ngăn nắp thế này thì kho vải không bao giờ sợ lệch số tồn.'
      },
      {
        id: 'gossip_lunch',
        label: 'Nghe Chị Nga Kể Drama Hậu Trường Công Ty',
        emoji: '🗣️',
        costDesc: '-5% ⚡ Năng Lượng',
        favorDelta: +15,
        energyDelta: -5,
        stressDelta: -25,
        kpiDelta: +30,
        reply: 'Chị kể nghe này, phòng R&D vừa bị khách chê bảng màu tuần trước, may mà bên em xử lý kịp đó nha!'
      }
    ]
  },
  tuan: {
    id: 'tuan',
    name: 'Anh Tuấn',
    role: 'Tài Xế Cont Cát Lái',
    emoji: '🚛',
    avatarBg: '#0284c7',
    personality: 'Bụi bặm phong trần, lái xe cont 40 feet như bay. Cộc tính nhưng rất nghĩa khí với anh em làm việc nhiệt tình.',
    likes: 'Cà phê đen đá không đường, gói thuốc lá, đường không kẹt xe cầu Phú Mỹ.',
    quote: 'Cầu Phú Mỹ kẹt xe cont dài 3 cây số, chuẩn bị bốc hàng thần tốc không là trễ máng tàu!',
    favorPerkTitle: '🚀 Vượt Cầu Phú Mỹ Ưu Tiên',
    favorPerkDesc: 'Khi Thân thiết ≥ 50: Container chạy tuyến ưu tiên, rút ngắn 40% thời gian giao nhận cảng!',
    options: [
      {
        id: 'gift_iced_coffee',
        label: 'Mời Anh Ly Cà Phê Đen Đá Giải Khát',
        emoji: '🧊',
        costDesc: '-10% ⚡ Năng Lượng',
        favorDelta: +25,
        energyDelta: -10,
        stressDelta: -15,
        kpiDelta: +40,
        reply: 'Đúng lúc anh đang buồn ngủ! Cà phê đậm vị phê lòi, cont của em cứ để anh đạp ga phóng thẳng vào cảng!'
      },
      {
        id: 'help_seal_cont',
        label: 'Phụ Anh Kẹp Chì Niêm Phong Container',
        emoji: '🔒',
        costDesc: '-15% ⚡ Năng Lượng',
        favorDelta: +20,
        energyDelta: -15,
        stressDelta: +5,
        kpiDelta: +80,
        reply: 'Nhanh nhẹn đấy chú em! Chì số hiệu chuẩn hải quan rồi, cont này đảm bảo thông quan 100% không bị mở kiểm.'
      },
      {
        id: 'talk_routes',
        label: 'Hỏi Thăm Tình Hình Kẹt Xe Tuyến Vành Đai',
        emoji: '🛣️',
        costDesc: '-5% ⚡ Năng Lượng',
        favorDelta: +10,
        energyDelta: -5,
        stressDelta: -10,
        kpiDelta: +30,
        reply: 'Đường Nguyễn Thị Định đang thông thoáng, lát bốc hàng xong là anh chạy 15 phút tới Cát Lái ngay!'
      }
    ]
  },
  linh: {
    id: 'linh',
    name: 'Em Linh',
    role: 'Thực Tập Sinh Lab QC',
    emoji: '🔬',
    avatarBg: '#06b6d4',
    personality: 'Gen Z nhanh nhẹn, ham học hỏi nhưng hay hồi hộp khi soi màu vải dưới áp lực thời gian.',
    likes: 'Được anh chị chỉ dẫn tận tình, trà đào cam sả, sticker mèo cute.',
    quote: 'Dạ anh ơi, mẫu vải màu Navy này đo Delta E ra 0.35 có đạt chuẩn AQL đi Mỹ không ạ?',
    favorPerkTitle: '🎯 Đo Màu Lab Quang Phổ Chuẩn 100%',
    favorPerkDesc: 'Khi Thân thiết ≥ 50: Khâu Lab-dip tự động đạt độ chính xác hoàn hảo, triệt tiêu 100% lỗi mẻ vải!',
    options: [
      {
        id: 'teach_lab',
        label: 'Hướng Dẫn Linh Kỹ Thuật Đọc Biểu Đồ Delta E',
        emoji: '📖',
        costDesc: '-10% ⚡ Năng Lượng',
        favorDelta: +25,
        energyDelta: -10,
        stressDelta: -5,
        kpiDelta: +70,
        reply: 'Dạ em hiểu rồi ạ! Hóa ra phải nhìn góc nghiêng 45 độ dưới đèn D65! Cảm ơn anh đã chỉ dẫn nhiệt tình!'
      },
      {
        id: 'gift_peach_tea',
        label: 'Tặng Linh Ly Trà Đào Cam Sả Hạ Nhiệt',
        emoji: '🍑',
        costDesc: '-10% ⚡ Năng Lượng',
        favorDelta: +25,
        energyDelta: -10,
        stressDelta: -15,
        kpiDelta: +40,
        reply: 'Oa trà đào ngon quá anh ơi! Em có năng lượng soi thêm 10 mẫu vải nữa cũng không sợ mỏi mắt!'
      },
      {
        id: 'encourage_intern',
        label: 'Động Viên Em Bình Tĩnh Trước Deadline',
        emoji: '✨',
        costDesc: '-5% ⚡ Năng Lượng',
        favorDelta: +15,
        energyDelta: -5,
        stressDelta: -20,
        kpiDelta: +30,
        reply: 'Có anh đồng hành em tự tin hẳn lên! Em sẽ canh đèn kiểm tra thật kỹ từng sợi vải cho anh!'
      }
    ]
  },
  hoang: {
    id: 'hoang',
    name: 'Anh Hoàng',
    role: 'Kỹ Sư Hệ Thống IT',
    emoji: '🖥️',
    avatarBg: '#4f46e5',
    personality: 'Cú đêm IT chính hiệu, người giữ cho hệ thống ERP và máy in toàn xưởng may chạy mượt mà không bao giờ sập.',
    likes: 'Mì ly ăn đêm, cáp quang Gigabit, không ai rút nhầm dây nguồn server.',
    quote: 'Ai vừa gửi file in 500 trang PDF làm nghẽn spooler máy in thế? Để anh restart service lại!',
    favorPerkTitle: '🛡️ Tường Lửa Bảo Vệ Toàn Hệ Thống',
    favorPerkDesc: 'Khi Thân thiết ≥ 50: Server IT tự động sửa lỗi và miễn nhiễm với sự cố sập mạng nội bộ!',
    options: [
      {
        id: 'gift_energy_drink',
        label: 'Mời Anh Lon Bò Húc Red Bull Lấy Lại Tỉnh Táo',
        emoji: '⚡',
        costDesc: '-10% ⚡ Năng Lượng',
        favorDelta: +25,
        energyDelta: -10,
        stressDelta: -10,
        kpiDelta: +50,
        reply: 'Đúng thứ anh đang cần để cày đêm! Mạng ERP của xưởng cứ để anh tối ưu, ping 1ms mượt mà luôn!'
      },
      {
        id: 'clean_datacenter',
        label: 'Phụ Anh Hút Bụi Và Bó Gọn Dây Cáp Rack Server',
        emoji: '🧹',
        costDesc: '-15% ⚡ Năng Lượng',
        favorDelta: +20,
        energyDelta: -15,
        stressDelta: +5,
        kpiDelta: +70,
        reply: 'Gọn gàng sạch sẽ thế này thì luồng gió tản nhiệt cho server lưu thông cực tốt. Cảm ơn em nhiều!'
      },
      {
        id: 'check_backup',
        label: 'Hỏi Thăm Tình Hình Sao Lưu Backup Đơn Hàng',
        emoji: '💾',
        costDesc: '-5% ⚡ Năng Lượng',
        favorDelta: +15,
        energyDelta: -5,
        stressDelta: -15,
        kpiDelta: +40,
        reply: 'Hợp đồng của em đã được tự động backup lên 3 server dự phòng đám mây, không bao giờ lo mất file nhé.'
      }
    ]
  }
};
