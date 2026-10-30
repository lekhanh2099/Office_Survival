export interface OfficeWeather {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  badgeText: string;
  kpiMultiplier: number;
  energyDrainMultiplier: number;
  stressDrainMultiplier: number;
  speedMultiplier: number;
}

export interface DilemmaChoice {
  text: string;
  preview: string;
  kpi: number;
  stress: number;
  energy: number;
  resultMsg: string;
}

export interface StationDilemma {
  id: string;
  stationType: string;
  title: string;
  npcName: string;
  npcAvatar: string;
  situation: string;
  optionA: DilemmaChoice;
  optionB: DilemmaChoice;
}

export const OFFICE_WEATHERS: OfficeWeather[] = [
  {
    id: 'sunny_boss',
    emoji: '☀️',
    name: 'Sếp Hùng Vui Tính',
    badgeText: '☀️ Sếp Vui Tính · KPI x1.5',
    desc: 'Sếp vừa ký được deal triệu đô! Toàn bộ điểm thưởng KPI x1.5, áp lực Stress giảm 30%!',
    kpiMultiplier: 1.5,
    energyDrainMultiplier: 0.9,
    stressDrainMultiplier: 0.7,
    speedMultiplier: 1.0
  },
  {
    id: 'boba_party',
    emoji: '🧋',
    name: 'Tiệc Trà Sữa Bao Trọn',
    badgeText: '🧋 Tiệc Trà Sữa · Tốc Độ x1.25',
    desc: 'Căn tin tiếp tế trà sữa trân châu full topping miễn phí: Năng lượng tràn trề, Chibi chạy cực nhanh!',
    kpiMultiplier: 1.2,
    energyDrainMultiplier: 0.65,
    stressDrainMultiplier: 0.6,
    speedMultiplier: 1.25
  },
  {
    id: 'rainy_port',
    emoji: '🌧️',
    name: 'Mưa Ngập Cát Lái',
    badgeText: '🌧️ Mưa Cát Lái · Cont Gia Hạn',
    desc: 'Cảng cont Cát Lái ngập nước kẹt xe, tàu dời giờ kéo còi closing time thêm 40 phút!',
    kpiMultiplier: 1.1,
    energyDrainMultiplier: 1.0,
    stressDrainMultiplier: 0.9,
    speedMultiplier: 0.95
  },
  {
    id: 'deadline_sprint',
    emoji: '⚡',
    name: 'Siêu Bão Deadline Gấp',
    badgeText: '⚡ Bão Deadline · Thưởng Khủng',
    desc: 'Năng lượng tiêu hao nhanh hơn nhưng mỗi đơn hàng xuất xưởng hoàn thành thưởng nóng +250 điểm KPI!',
    kpiMultiplier: 1.6,
    energyDrainMultiplier: 1.25,
    stressDrainMultiplier: 1.15,
    speedMultiplier: 1.1
  },
  {
    id: 'aql_audit',
    emoji: '🔬',
    name: 'Đoàn Thanh Tra AQL',
    badgeText: '🔬 Thanh Tra AQL · Chuẩn Quốc Tế',
    desc: 'Khách Buyer quốc tế soi từng đường kim mũi chỉ! Lựa chọn chính xác nhận điểm thưởng vinh danh!',
    kpiMultiplier: 1.4,
    energyDrainMultiplier: 1.0,
    stressDrainMultiplier: 1.1,
    speedMultiplier: 1.0
  },
  {
    id: 'lucky_shrine',
    emoji: '🙏',
    name: 'Ngày Rằm Thần Tài',
    badgeText: '🙏 Thần Tài Ban Lộc · May Mắn',
    desc: 'Bàn thờ Thần Tài đỏ đèn nghi ngút hương hoa: May mắn ngập tràn, việc tồn đọng giải quyết trơn tru!',
    kpiMultiplier: 1.35,
    energyDrainMultiplier: 0.8,
    stressDrainMultiplier: 0.7,
    speedMultiplier: 1.05
  }
];

export const STATION_DILEMMAS: StationDilemma[] = [
  // 1. Merchandiser Desk
  {
    id: 'dilemma_desk_1',
    stationType: 'desk',
    title: 'Khách Đòi Thêm Logo Thêu Miễn Phí!',
    npcName: 'Mr. David (Buyer NY)',
    npcAvatar: '👔',
    situation: '"Email gửi lúc 11:30 đòi thêu thêm logo ngực áo cho 500 áo Polo mà từ chối chi thêm phí làm mẫu!"',
    optionA: {
      text: 'Khéo léo đàm phán dời sang đơn sau',
      preview: '+120 KPI · -15% Stress',
      kpi: 120,
      stress: -15,
      energy: 0,
      resultMsg: '💬 Đàm phán thành công mỹ mãn! Khách đồng ý giữ nguyên mẫu để kịp đóng cont xuất xưởng.'
    },
    optionB: {
      text: 'Nhận làm luôn để lấy lòng Buyer',
      preview: '+250 KPI · +20% Stress · -10% ⚡',
      kpi: 250,
      stress: 20,
      energy: -10,
      resultMsg: '🔥 Khách cảm kích thưởng lớn, nhưng xưởng may cằn nhằn vì phát sinh tăng ca đột xuất!'
    }
  },
  {
    id: 'dilemma_desk_2',
    stationType: 'desk',
    title: 'Khách Ép Giảm 5% Giá Đơn Hàng!',
    npcName: 'Buyer Hamburg (EU)',
    npcAvatar: '💼',
    situation: '"Buyer dọa nếu không giảm 5% giá 1.200 quần Khaki thì sẽ hủy hợp đồng chuyển sang nhà máy khác!"',
    optionA: {
      text: 'Tặng kèm túi vải Eco thay vì giảm tiền',
      preview: '+160 KPI · Bảo toàn lợi nhuận',
      kpi: 160,
      stress: -10,
      energy: 0,
      resultMsg: '🌱 Buyer châu Âu cực kỳ thích thú với túi Eco thân thiện môi trường, ký hợp đồng ngay tắp lự!'
    },
    optionB: {
      text: 'Cứng rắn: Cam kết AQL 2.5 không đổi giá',
      preview: '+200 KPI · Sếp Hùng khen',
      kpi: 200,
      stress: 10,
      energy: 0,
      resultMsg: '👔 Sếp Hùng vỗ đùi khen: "Merchandiser bản lĩnh phải thế chứ! Giữ vững biên lợi nhuận cho cty!"'
    }
  },

  // 2. Printer Station
  {
    id: 'dilemma_printer_1',
    stationType: 'printer',
    title: 'Máy In Nuốt Kẹt 10 Tờ Techpack!',
    npcName: 'Máy In Canon Tầng 2',
    npcAvatar: '🖨️',
    situation: 'Máy in nhấp nháy đèn đỏ báo "Paper Jam Error 404" và phì khói nhẹ khi in bảng thông số kỹ thuật áo!',
    optionA: {
      text: 'Tự tay tháo khay kéo giấy khéo léo',
      preview: '+90 KPI · Nhanh gọn',
      kpi: 90,
      stress: -5,
      energy: -5,
      resultMsg: '🛠️ Khéo tay gỡ giấy ra nguyên vẹn! Máy in tiếp tục nhả 10 bộ Techpack bóng bẩy.'
    },
    optionB: {
      text: 'Gọi IT & Hối lộ cốc trà sữa',
      preview: '+170 KPI · -20% Stress · In thêm bản phụ',
      kpi: 170,
      stress: -20,
      energy: 10,
      resultMsg: '🧋 Anh IT được bao trà sữa sướng rơn, lau sạch đầu phun và in sẵn 3 bản dự phòng chống ướt!'
    }
  },
  {
    id: 'dilemma_printer_2',
    stationType: 'printer',
    title: 'Máy In Hết Hộp Mực Màu Xanh Navy!',
    npcName: 'Mực In Hóa Chất',
    npcAvatar: '🎨',
    situation: 'Đang in bảng màu Pantone thì khay mực Cyan cạn đáy, chỉ còn mực đen trắng!',
    optionA: {
      text: 'Lắc mạnh hộp mực in thêm 3 tờ',
      preview: '+100 KPI · Tiết kiệm chi phí',
      kpi: 100,
      stress: -5,
      energy: 0,
      resultMsg: '💡 Mẹo dân văn phòng thần thánh: Lắc nhẹ là mực ra đều tăm tắp, đủ in xong đơn hàng!'
    },
    optionB: {
      text: 'Lấy hộp mực dự phòng mới tinh',
      preview: '+180 KPI · Bản in nét căng AQL',
      kpi: 180,
      stress: -10,
      energy: -5,
      resultMsg: '✨ Bản in nét căng từng hạt mực, Kỹ sư phòng Lab nhìn là duyệt ngay không cần soi kính lúp!'
    }
  },

  // 3. Lab Station
  {
    id: 'dilemma_lab_1',
    stationType: 'lab',
    title: 'Độ Lệch Màu Delta E = 1.2 Dưới Đèn D65!',
    npcName: 'Kỹ Sư Lab Màu',
    npcAvatar: '🔬',
    situation: 'Mẫu nhuộm áo hoodie hơi lệch ánh vàng so với mẫu gốc của Buyer (Ngưỡng tối đa cho phép là 1.0).',
    optionA: {
      text: 'Bắt xưởng nhuộm lại đạt Delta E < 0.3',
      preview: '+220 KPI · -20% ⚡ · Chuẩn AQL 100%',
      kpi: 220,
      stress: -15,
      energy: -20,
      resultMsg: '🔬 Cực kỳ chỉn chu! Nhuộm lại đạt Delta E 0.25, Buyer gật đầu tán thưởng hết lời!'
    },
    optionB: {
      text: 'Ký biên bản dung sai chấp nhận mắt thường',
      preview: '+120 KPI · Giữ nguyên Năng Lượng',
      kpi: 120,
      stress: 10,
      energy: 0,
      resultMsg: '📝 Mắt thường không nhận ra sự khác biệt, hồ sơ được duyệt thông quan kịp chuyến xe cont!'
    }
  },

  // 4. Fabric Warehouse
  {
    id: 'dilemma_fabric_1',
    stationType: 'fabric',
    title: 'Line May Khác Tranh Cây Vải Cuối Cùng!',
    npcName: 'Chị Nga Kế Toán Kho',
    npcAvatar: '👩‍💼',
    situation: 'Chị Nga bảo cuộn vải Spandex co giãn 4 chiều này vừa bị line áo khoác xin lấy, giờ kho chỉ còn đúng 1 cây!',
    optionA: {
      text: 'Dùng biệt tài nịnh: "Chị Nga hôm nay mặc đẹp thế!"',
      preview: '-25% Stress · +140 KPI',
      kpi: 140,
      stress: -25,
      energy: 0,
      resultMsg: '🥰 Chị Nga cười tít mắt: "Nể cậu ăn nói dễ thương, chị ký xuất kho cho đơn Mỹ trước đấy!"'
    },
    optionB: {
      text: 'Lấy uy Sếp Hùng: "Đơn này Sếp chỉ đạo trực tiếp!"',
      preview: '+200 KPI · +15% Stress',
      kpi: 200,
      stress: 15,
      energy: 0,
      resultMsg: '👔 Lấy được vải ngay nhưng bị chị Nga lườm nguýt: "Lần sau nhớ làm phiếu xin trước nhé!"'
    }
  },
  {
    id: 'dilemma_fabric_2',
    stationType: 'fabric',
    title: 'Cuộn Vải Có Vết Xước 4cm Ở Đầu Mép!',
    npcName: 'KCS Kho Vải',
    npcAvatar: '🧵',
    situation: 'KCS phát hiện cuộn vải dệt kim bị xước nhẹ ở mép biên 1 mét đầu tiên do móc xe cẩu.',
    optionA: {
      text: 'Cắt bỏ 1 mét đầu biên xước để an toàn',
      preview: '+180 KPI · -10% ⚡ · AQL 100%',
      kpi: 180,
      stress: -10,
      energy: -10,
      resultMsg: '✂️ Cắt bỏ phần lỗi, toàn bộ phần thân áo may ra đều trơn tru không tì vết!'
    },
    optionB: {
      text: 'Dời phần xước vào may nẹp cổ áo lót',
      preview: '+150 KPI · Tiết kiệm vải tối đa',
      kpi: 150,
      stress: 5,
      energy: 0,
      resultMsg: '💡 Khéo léo tận dụng vải thừa, vừa không hao hụt định mức vừa đạt chuẩn thẩm mỹ!'
    }
  },

  // 5. Shipping Container
  {
    id: 'dilemma_shipping_1',
    stationType: 'shipping',
    title: 'Xe Cẩu Chuẩn Bị Bấm Chì Niêm Phong!',
    npcName: 'Anh Tuấn Tài Xế Xe Tải',
    npcAvatar: '🚚',
    situation: 'Anh Tuấn bấm còi inh ỏi: "5 phút nữa tàu bốc dỡ là anh khóa cửa cont đấy nhé, chạy nhanh lên!"',
    optionA: {
      text: 'Mời bác tài ly cà phê phin mát lạnh',
      preview: '+160 KPI · Bác tài xếp khoang VIP',
      kpi: 160,
      stress: -20,
      energy: 0,
      resultMsg: '☕ Uống ly cà phê mát ruột, anh Tuấn đợi thêm 10 phút và xếp hàng ở khoang khô ráo nhất tàu!'
    },
    optionB: {
      text: 'Tự tay dốc sức bốc hàng chạy nước rút',
      preview: '+280 KPI · Tốn 20% Năng Lượng',
      kpi: 280,
      stress: -10,
      energy: -20,
      resultMsg: '💪 Bốc hàng thần tốc kịp trước 45 giây! Toàn bộ anh em bến cảng vỗ tay thán phục!'
    }
  },
  {
    id: 'dilemma_shipping_2',
    stationType: 'shipping',
    title: 'Hải Quan Kiểm Tra Ngẫu Nhiên 3 Thùng!',
    npcName: 'Cán Bộ Hải Quan Cát Lái',
    npcAvatar: '🚢',
    situation: 'Cán bộ hải quan yêu cầu rạch ngẫu nhiên 3 thùng carton kiểm tra tem nhãn xuất xứ "Made in Vietnam".',
    optionA: {
      text: 'Mở thùng tự tin & Xuất trình đủ CO/CQ',
      preview: '+210 KPI · Thông quan luồng xanh',
      kpi: 210,
      stress: -15,
      energy: 0,
      resultMsg: '📋 Giấy tờ chuẩn từng milimet! Hải quan đóng dấu xanh thông quan nhanh như chớp!'
    },
    optionB: {
      text: 'Mời kiểm tra thùng mẫu đặc biệt chuẩn nhất',
      preview: '+180 KPI · Tặng mẫu lưu niệm',
      kpi: 180,
      stress: -10,
      energy: 0,
      resultMsg: '🎁 Cán bộ khen chất vải Polo mềm mịn, đóng dấu thông quan vui vẻ!'
    }
  },

  // 6. Boss Desk
  {
    id: 'dilemma_boss_1',
    stationType: 'boss_desk',
    title: 'Sếp Hùng Bất Ngờ Gọi Lên Phòng!',
    npcName: 'Sếp Tổng Trần Văn Hùng',
    npcAvatar: '👔',
    situation: 'Sếp Hùng ngẩng đầu khỏi laptop: "Này em, đơn hàng đi Mỹ hôm nay thế nào rồi? Kịp tiến độ không đấy?"',
    optionA: {
      text: 'Báo cáo số liệu lưu loát, tự tin 100%',
      preview: '+200 KPI · Sếp thưởng nóng',
      kpi: 200,
      stress: -25,
      energy: 10,
      resultMsg: '🌟 Sếp gật đầu tâm đắc: "Rất chuyên nghiệp! Đợt đánh giá cuối năm anh đề bạt lên Senior!"'
    },
    optionB: {
      text: 'Kể khổ một chút để xin thêm chỉ tiêu phụ',
      preview: '-20% Stress · Giảm áp lực ca trực',
      kpi: 100,
      stress: -20,
      energy: 0,
      resultMsg: '☕ Sếp thông cảm rót cho tách trà sen: "Cố lên em, chạy xong ca này cty bao đi ăn buffet!"'
    }
  },

  // 7. Pantry / Boba
  {
    id: 'dilemma_pantry_1',
    stationType: 'coffee',
    title: 'Bắt Gặp Hội Buôn Chuyện Văn Phòng!',
    npcName: 'Hội Hóng Hớt Căn Tin',
    npcAvatar: '🧋',
    situation: 'Mấy chị phòng kế toán đang bàn tán sôi nổi về tin đồn công ty sắp tăng lương 20% và đi du lịch Đà Nẵng.',
    optionA: {
      text: 'Sà vào góp vui buôn chuyện 5 phút',
      preview: '+50% ⚡ · -30% Stress',
      kpi: 60,
      stress: -30,
      energy: 50,
      resultMsg: '😂 Cười ngả nghiêng xả sạch stress, hồi phục 50% Năng Lượng và biết thêm nhiều bí mật nội bộ!'
    },
    optionB: {
      text: 'Cầm ly trà sữa rồi quay lại cày deadline',
      preview: '+150 KPI · Chạy siêu tốc',
      kpi: 150,
      stress: -10,
      energy: 30,
      resultMsg: '🏃 Quyết tâm sắt đá! Vừa uống trà sữa vừa chạy việc năng suất tăng vọt 200%!'
    }
  }
];
