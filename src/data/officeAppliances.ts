import { Workstation } from '../3d/OfficeStage';

export interface ApplianceAction {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  costDesc: string;
  energyDelta: number;
  stressDelta: number;
  kpiDelta: number;
  speedBoostSeconds?: number;
  carriedItem?: 'none' | 'paper_stack' | 'fabric_roll' | 'coffee_cup' | 'box' | 'sample_shirt';
  resultToast: string;
}

export interface ApplianceProfile {
  stationType: Workstation['type'];
  name: string;
  zone: string;
  emoji: string;
  description: string;
  actions: ApplianceAction[];
}

export const OFFICE_APPLIANCES: Record<string, ApplianceProfile> = {
  coffee: {
    stationType: 'coffee',
    name: 'Quầy Trà Sữa & Cà Phê Pha Máy',
    zone: 'Căn Tin Trung Tâm',
    emoji: '☕',
    description: 'Trạm nạp năng lượng số 1 của công ty với máy pha cà phê công nghiệp và trà sữa trân châu full topping.',
    actions: [
      {
        id: 'boba_milktea',
        name: 'Pha Ly Trà Sữa Phúc Long Full Topping',
        emoji: '🧋',
        desc: '70% đường 30% đá cùng thạch củ năng giòn rụm.',
        costDesc: '+45% ⚡ · -20% 🔥',
        energyDelta: +45,
        stressDelta: -20,
        kpiDelta: +20,
        carriedItem: 'coffee_cup',
        resultToast: '🧋 Ngon đỉnh nóc kịch trần! Trà sữa hồi +45% ⚡ và xả -20% Stress!'
      },
      {
        id: 'bac_xiu',
        name: 'Pha Ly Bạc Xỉu Sài Gòn Nhiều Sữa',
        emoji: '☕',
        desc: 'Vị béo ngọt của sữa đặc hòa quyện hương cà phê nồng ấm.',
        costDesc: '+35% ⚡ · Bứt tốc 9s',
        energyDelta: +35,
        stressDelta: -15,
        kpiDelta: +30,
        speedBoostSeconds: 9.0,
        carriedItem: 'coffee_cup',
        resultToast: '☕ Bạc xỉu thơm ngậy! Bật tốc chạy thần tốc trong 9 giây!'
      },
      {
        id: 'espresso_shot',
        name: 'Nốc Cạn Shot Espresso Double Đậm Đặc',
        emoji: '⚡',
        desc: 'Cà phê nguyên chất đắng nghét, bừng tỉnh mọi tế bào thần kinh!',
        costDesc: '+60% ⚡ · Bứt tốc 14s',
        energyDelta: +60,
        stressDelta: +5,
        kpiDelta: +40,
        speedBoostSeconds: 14.0,
        carriedItem: 'coffee_cup',
        resultToast: '⚡ Năng lượng bùng nổ! Chạy như tia chớp trong 14 giây (+60% ⚡)!'
      },
      {
        id: 'cam_sa_tea',
        name: 'Uống Ly Trà Đào Cam Sả Hạ Nhiệt',
        emoji: '🍑',
        desc: 'Mát lạnh sảng khoái, triệt tiêu mọi cơn bực bội công sở.',
        costDesc: '-35% 🔥 Stress Cực Mạnh',
        energyDelta: +20,
        stressDelta: -35,
        kpiDelta: +20,
        carriedItem: 'coffee_cup',
        resultToast: '🍑 Trà đào mát rượi: Hạ hỏa tức thì, giảm ngay -35% Stress!'
      }
    ]
  },
  printer: {
    stationType: 'printer',
    name: 'Máy In Kỹ Thuật Số & Scan Đa Năng',
    zone: 'Văn Phòng Điều Hành',
    emoji: '🖨️',
    description: 'Chiếc máy in công suất lớn chuyên in Techpack xuất khẩu, bảng màu và tem nhãn may mặc.',
    actions: [
      {
        id: 'print_meme',
        name: 'In Trộm Bộ Ảnh Meme Mèo Hài Hước',
        emoji: '🐱',
        desc: 'Dán ảnh mèo lên góc bàn để tự động cười mỗi khi mệt mỏi.',
        costDesc: '-20% 🔥 Stress · +40 KPI',
        energyDelta: -5,
        stressDelta: -20,
        kpiDelta: +40,
        carriedItem: 'paper_stack',
        resultToast: '🐱 Tiếng máy in xè xè nhả ra ảnh mèo cute: Xả -20% Stress!'
      },
      {
        id: 'print_resignation',
        name: 'In Sẵn Đơn Xin Thôi Việc (Để Dằn Mặt Sếp)',
        emoji: '📑',
        desc: 'Cầm sẵn tờ đơn thôi việc trong tay, tinh thần tự do dâng trào!',
        costDesc: 'Tự do tinh thần 100%',
        energyDelta: 0,
        stressDelta: -25,
        kpiDelta: +20,
        carriedItem: 'paper_stack',
        resultToast: '📑 Đã in sẵn đơn xin nghỉ việc: Trong lòng cảm thấy thanh thản lạ kỳ (-25% 🔥)!'
      },
      {
        id: 'refill_paper',
        name: 'Tiếp Thêm 500 Tờ Giấy A4 & Căn Chỉnh Trống Mực',
        emoji: '📦',
        desc: 'Hỗ trợ các phòng ban khác in ấn trơn tru không bị kẹt giấy.',
        costDesc: '+60 KPI · -8% ⚡',
        energyDelta: -8,
        stressDelta: -5,
        kpiDelta: +60,
        resultToast: '🖨️ Nạp giấy thành công: Máy in sẵn sàng phục vụ toàn xưởng (+60 KPI)!'
      }
    ]
  },
  water: {
    stationType: 'water',
    name: 'Cây Nước Nóng Lạnh Lavie Tinh Khiết',
    zone: 'Căn Tin Trung Tâm',
    emoji: '🚰',
    description: 'Nguồn nước uống mát lành và nước nóng pha trà, mì gói cho anh chị em công nhân viên.',
    actions: [
      {
        id: 'cold_water',
        name: 'Rót Ly Nước Đá Mát Lạnh',
        emoji: '🧊',
        desc: 'Hạ nhiệt tức thì giữa cái nóng gay gắt của xưởng may.',
        costDesc: '-18% 🔥 · +12% ⚡',
        energyDelta: +12,
        stressDelta: -18,
        kpiDelta: +10,
        resultToast: '🧊 Nước khoáng mát lạnh: Căng thẳng tan biến ngay (-18% Stress)!'
      },
      {
        id: 'cup_noodle',
        name: 'Chế Nước Sôi Nấu Ly Mì Hảo Hảo Chua Cay',
        emoji: '🍜',
        desc: 'Hương vị tôm chua cay quen thuộc lót dạ giữa ca làm việc.',
        costDesc: '+35% ⚡ · -15% 🔥',
        energyDelta: +35,
        stressDelta: -15,
        kpiDelta: +30,
        resultToast: '🍜 Mì tôm nóng hổi thơm phức: Nạp lại +35% Năng lượng và ấm bụng!'
      }
    ]
  },
  mirror: {
    stationType: 'mirror',
    name: 'Gương Soi Toàn Thân & Bồn Rửa WC',
    zone: 'Khu Vực Vệ Sinh',
    emoji: '🪞',
    description: 'Nơi tút tát lại nhan sắc và lấy lại sự tự tin trước những buổi đàm phán quan trọng.',
    actions: [
      {
        id: 'wash_face',
        name: 'Rửa Mặt Bằng Nước Lạnh Tỉnh Táo',
        emoji: '💦',
        desc: 'Xua tan mọi cơn buồn ngủ và mệt mỏi sau hàng giờ nhìn màn hình.',
        costDesc: '+25% ⚡ · Tỉnh táo 100%',
        energyDelta: +25,
        stressDelta: -10,
        kpiDelta: +20,
        resultToast: '💦 Dòng nước mát lạnh đánh thức mọi giác quan: Hồi phục +25% ⚡!'
      },
      {
        id: 'pep_talk',
        name: 'Tự Động Viên Trước Gương: "Hôm Nay Tôi Sẽ Tỏa Sáng!"',
        emoji: '✨',
        desc: 'Liệu pháp tâm lý tích cực giúp xua tan áp lực công việc.',
        costDesc: '-20% 🔥 · +50 KPI',
        energyDelta: +10,
        stressDelta: -20,
        kpiDelta: +50,
        resultToast: '✨ Tự tin ngút ngàn: Tinh thần chiến binh dâng cao (+50 KPI, -20% 🔥)!'
      }
    ]
  },
  sofa: {
    stationType: 'sofa',
    name: 'Bộ Sofa Da Thư Giãn',
    zone: 'Căn Tin Trung Tâm',
    emoji: '🛋️',
    description: 'Chiếc ghế sofa êm ái là nơi lý tưởng để chợp mắt hoặc ngả lưng nghỉ ngơi.',
    actions: [
      {
        id: 'power_nap',
        name: 'Chợp Mắt Ngủ Trưa Nhanh 15 Phút',
        emoji: '😴',
        desc: 'Giấc ngủ ngắn tái tạo năng lượng hoàn hảo cho buổi chiều.',
        costDesc: '+40% ⚡ · -25% 🔥',
        energyDelta: +40,
        stressDelta: -25,
        kpiDelta: +20,
        resultToast: '😴 Giấc ngủ trưa êm ái: Nạp lại đầy pin +40% ⚡ và xả -25% Stress!'
      },
      {
        id: 'scroll_tiktok',
        name: 'Nằm Dài Lướt TikTok Xem Video Mèo Hài',
        emoji: '📱',
        desc: 'Giải trí nhẹ nhàng không cần suy nghĩ về deadline.',
        costDesc: '-30% 🔥 Stress',
        energyDelta: +10,
        stressDelta: -30,
        kpiDelta: +15,
        resultToast: '📱 Cười sảng khoái với video mèo: Áp lực công việc tan biến (-30% 🔥)!'
      }
    ]
  },
  balcony: {
    stationType: 'balcony',
    name: 'Ban Công Hóng Gió & Lounge Ngoài Trời',
    zone: 'Ban Công Ngoài Trời',
    emoji: '🌿',
    description: 'Không gian mở thoáng đãng nhìn ra bầu trời thành phố, nơi ngắm gió ngắm mây hạ nhiệt.',
    actions: [
      {
        id: 'deep_breath',
        name: 'Đứng Hít Thở Không Khí Tự Do & Ngắm Mây Trời',
        emoji: '🌬️',
        desc: 'Hít sâu thở chậm, buông bỏ mọi căng thẳng đè nặng trên vai.',
        costDesc: '-35% 🔥 · +30% ⚡',
        energyDelta: +30,
        stressDelta: -35,
        kpiDelta: +30,
        resultToast: '🌬️ Gió trời lồng lộng: Tâm trí nhẹ bẫng (-35% Stress, +30% ⚡)!'
      },
      {
        id: 'water_plants',
        name: 'Tưới Nước Và Tỉa Lá Sâu Cho Chậu Cây Ficus',
        emoji: '🪴',
        desc: 'Chăm sóc mầm xanh mang lại cảm giác bình yên thư thái.',
        costDesc: '+60 KPI · -20% 🔥',
        energyDelta: -5,
        stressDelta: -20,
        kpiDelta: +60,
        resultToast: '🪴 Cây xanh mơn mởn: Không gian văn phòng thêm tràn đầy sức sống (+60 KPI)!'
      }
    ]
  },
  showroom: {
    stationType: 'showroom',
    name: 'Showroom Mẫu & Fitting Studio',
    zone: 'Phòng Trưng Bày Mẫu',
    emoji: '👗',
    description: 'Nơi trưng bày các thiết kế xuất sắc nhất và mannequin thử phom áo xuất khẩu.',
    actions: [
      {
        id: 'inspect_garment',
        name: 'Soi Từng Đường Kim Mũi Chỉ Của Áo Mẫu Mannequin',
        emoji: '🔍',
        desc: 'Kiểm tra mật độ mũi may 12 SPI đạt chuẩn xuất khẩu Mỹ.',
        costDesc: '+70 KPI · -10% 🔥',
        energyDelta: -5,
        stressDelta: -10,
        kpiDelta: +70,
        carriedItem: 'sample_shirt',
        resultToast: '🔍 Áo mẫu đạt chuẩn may quốc tế: Không có chỉ thừa (+70 KPI)!'
      },
      {
        id: 'style_mannequin',
        name: 'Chỉnh Cà Vạt & Ủi Phẳng Nếp Gấp Áo Mannequin',
        emoji: '👔',
        desc: 'Tạo diện mạo hoàn hảo để chuẩn bị đón các Buyer quốc tế.',
        costDesc: '+60 KPI · -15% 🔥',
        energyDelta: -5,
        stressDelta: -15,
        kpiDelta: +60,
        resultToast: '👔 Mannequin form dáng sang trọng: Sẵn sàng cho buổi audit (+60 KPI)!'
      }
    ]
  },
  altar: {
    stationType: 'altar',
    name: 'Bàn Thờ Thần Tài & Thổ Địa',
    zone: 'Văn Phòng Điều Hành',
    emoji: '🙏',
    description: 'Nơi gửi gắm niềm tin tâm linh, cầu may mắn tài lộc và hanh thông cho các lô hàng container.',
    actions: [
      {
        id: 'burn_incense',
        name: 'Thắp 3 Nén Nhang Thành Tâm Hướng Thiện',
        emoji: '🙏',
        desc: 'Cầu mong đơn hàng xuất xưởng suôn sẻ, tàu chạy đúng lịch.',
        costDesc: '+25% ⚡ · -25% 🔥 · +100 KPI',
        energyDelta: +25,
        stressDelta: -25,
        kpiDelta: +100,
        resultToast: '🙏 Thần Tài phù hộ: Vía lành tài lộc, hanh thông mọi nẻo đường (+100 KPI)!'
      },
      {
        id: 'offer_fruit',
        name: 'Dâng Đĩa Hoa Quả Tươi Lên Ban Thần Tài',
        emoji: '🍊',
        desc: 'Lòng thành kính dâng trái cây tươi đón nhận vận may gấp bội.',
        costDesc: '+150 KPI · -30% 🔥',
        energyDelta: -5,
        stressDelta: -30,
        kpiDelta: +150,
        resultToast: '🍊 Thần Tài mỉm cười gia hộ: Tài lộc gõ cửa rộn ràng (+150 KPI)!'
      }
    ]
  },
  server: {
    stationType: 'server',
    name: 'Tủ Server IT & Datacenter',
    zone: 'Khu Vực Kỹ Thuật',
    emoji: '🖥️',
    description: 'Trái tim công nghệ quản lý toàn bộ hệ sinh thái ERP, chuỗi cung ứng và dữ liệu đơn hàng.',
    actions: [
      {
        id: 'check_uptime',
        name: 'Kiểm Tra Tốc Độ Mạng & Uptime Hệ Thống ERP',
        emoji: '📊',
        desc: 'Đảm bảo dữ liệu đơn hàng đồng bộ thời gian thực sang chi nhánh New York.',
        costDesc: '+60 KPI · An toàn dữ liệu',
        energyDelta: -5,
        stressDelta: -10,
        kpiDelta: +60,
        resultToast: '📊 ERP Uptime 99.99%: Hệ thống mạng thông suốt 1Gbps (+60 KPI)!'
      },
      {
        id: 'reboot_router',
        name: 'Restart Dịch Vụ Mạng Cáp Quang Thông Suốt',
        emoji: '🔄',
        desc: 'Tối ưu hóa đường truyền, giảm ping xuống mức tối thiểu.',
        costDesc: '+80 KPI · -15% 🔥',
        energyDelta: -5,
        stressDelta: -15,
        kpiDelta: +80,
        resultToast: '🔄 Tối ưu đường truyền thành công: Mạng chạy vèo vèo (+80 KPI)!'
      }
    ]
  },
  whiteboard: {
    stationType: 'whiteboard',
    name: 'Bảng Kính Chiến Lược VIP Boardroom',
    zone: 'Phòng Họp VIP',
    emoji: '📊',
    description: 'Bảng kính ghi nhận kế hoạch doanh thu Q4, lộ trình xuất khẩu và mục tiêu AQL 2.5.',
    actions: [
      {
        id: 'review_kpi',
        name: 'Nghiên Cứu Biểu Đồ Doanh Thu & Mục Tiêu Q4',
        emoji: '📈',
        desc: 'Nắm vững chiến lược kinh doanh để tư vấn giải pháp cho khách hàng.',
        costDesc: '+70 KPI · +10% ⚡',
        energyDelta: +10,
        stressDelta: -10,
        kpiDelta: +70,
        resultToast: '📈 Đã nắm vững chiến lược: Tự tin thuyết trình trước Buyer (+70 KPI)!'
      },
      {
        id: 'draw_meme',
        name: 'Vẽ Trộm Bức Tranh Meme Động Viên Đồng Nghiệp',
        emoji: '🎨',
        desc: 'Nét vẽ ngộ nghĩnh mang lại nụ cười sảng khoái cho cả phòng họp.',
        costDesc: '-20% 🔥 Stress',
        energyDelta: -4,
        stressDelta: -20,
        kpiDelta: +30,
        resultToast: '🎨 Bức tranh meme khiến ai đi qua cũng bật cười: Giảm -20% Stress!'
      }
    ]
  }
};
