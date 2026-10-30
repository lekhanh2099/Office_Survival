export interface ShiftEnding {
  id: 'legend' | 'social_butterfly' | 'rage_quit' | 'burnout' | 'aql_disaster' | 'lotto_luck' | 'hardworking';
  title: string;
  badge: string;
  icon: string;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  quote: string;
  narrative: string;
  careerOutcome: string;
  salaryBonus: string;
  unlockedTitle: string;
  bgGradient: string;
}

export const SHIFT_ENDINGS: Record<string, ShiftEnding> = {
  legend: {
    id: 'legend',
    title: 'HUYỀN THOẠI MERCHANDISER',
    badge: '🏆 HUYỀN THOẠI XUẤT SẮC (S-RANK)',
    icon: '👑',
    grade: 'S',
    quote: '"Không một đơn hàng nào có thể làm khó được cậu ấy! Một tài năng trăm năm có một của ngành dệt may!"',
    narrative: 'Bạn hoàn thành toàn bộ các đơn hàng khó nhất mà không để xảy ra bất kỳ lỗi kỹ thuật nào. Độ chính xác quang phổ tuyệt đối, container cập cảng đúng từng giây trước giờ đóng máng tàu. Ban Giám Đốc và các Buyer quốc tế đồng loạt đứng dậy vỗ tay tán thưởng!',
    careerOutcome: 'Được thăng chức đặc cách lên TRƯỞNG PHÒNG XUẤT NHẬP KHẨU KIÊM CỐ VẤN CHIẾN LƯỢC.',
    salaryBonus: '+300% Thưởng Nóng Cuối Năm & Chuyến Du Lịch New York',
    unlockedTitle: 'Danh Hiệu: Bàn Tay Vàng Làng Merchandiser 🌟',
    bgGradient: 'linear-gradient(135deg, #4338ca, #312e81, #1e1b4b)'
  },
  social_butterfly: {
    id: 'social_butterfly',
    title: 'CHÚA TỂ CĂN TIN & NGOẠI GIAO VĂN PHÒNG',
    badge: '🧋 TRÙM NGOẠI GIAO (FAVOR MAX)',
    icon: '🧋',
    grade: 'A',
    quote: '"Ở cái công ty này, từ bác bảo vệ đến Tổng Giám Đốc, không ai là không mê ly trà sữa của em!"',
    narrative: 'Với khả năng đối nhân xử thế bậc thầy, bạn biến văn phòng từ một chiến trường áp lực thành một đại gia đình ấm áp. Chị Nga sẵn sàng bốc vải ngay cả khi chưa đến giờ làm, Anh Tuấn phóng xe bạt mạng vượt kẹt xe vì bạn, và Sếp Hùng lúc nào cũng cười tươi mỗi khi gặp bạn ở quầy cà phê.',
    careerOutcome: 'Trở thành ĐẠI SỨ VĂN HÓA DOANH NGHIỆP & CHỦ TỊCH HỘI ĐỒNG TRÀ SỮA TOÀN CÔNG TY.',
    salaryBonus: 'Miễn Phí 1 Năm Trà Sữa Phúc Long & Quỹ Tiếp Tế Đồng Nghiệp Vô Hạn',
    unlockedTitle: 'Danh Hiệu: Chúa Tể Ngoại Giao Công Sở 💖',
    bgGradient: 'linear-gradient(135deg, #a855f7, #7e22ce, #3b0764)'
  },
  rage_quit: {
    id: 'rage_quit',
    title: 'BẬT SẾP & NỘP ĐƠN NGHỈ VIỆC TRONG TỰ DO',
    badge: '🚪 BẬT SẾP TỰ DO (RAGE QUIT)',
    icon: '🏃',
    grade: 'D',
    quote: '"Lương 8 triệu mà bắt gánh đơn 20 tỷ giữa trời mưa bão? Giờ thì sếp tự đi mà bốc vải nhé!"',
    narrative: 'Sau khi bị ép deadline vô lý và nghe Sếp Hùng càm ràm cả buổi, bạn đứng thẳng lưng, đập tập hồ sơ Techpack xuống bàn làm việc và rút sẵn lá đơn xin thôi việc đã in sẵn từ sáng. Toàn thể đồng nghiệp lặng người rồi đồng loạt vỗ tay tán thưởng bước chân tự do của bạn bước ra khỏi cổng công ty!',
    careerOutcome: 'Thoát khỏi vòng xoáy tăng ca 996, tự do làm chủ cuộc đời và mở tiệm cà phê chill chill.',
    salaryBonus: '0đ Tiền Thưởng nhưng Đổi Lấy 100% Sức Khỏe Tinh Thần Bình Yên',
    unlockedTitle: 'Danh Hiệu: Dũng Sĩ Bật Sếp Không Sợ Trừ Lương 💥',
    bgGradient: 'linear-gradient(135deg, #ea580c, #9a3412, #431407)'
  },
  burnout: {
    id: 'burnout',
    title: 'KIỆT SỨC NHẬP VIỆN TRUYỀN NƯỚC BIỂN',
    badge: '🚑 QUÁ TẢI KIỆT SỨC (BURNOUT)',
    icon: '🚑',
    grade: 'F',
    quote: '"Bác sĩ bảo bệnh nhân bị ngộ độc caffeine và suy nhược thần kinh vì chạy KPI quá 12 tiếng liên tục..."',
    narrative: 'Căng thẳng chạm đỉnh 100%, mắt hoa lên và chân tay run rẩy. Bạn ngã gục ngay cạnh chiếc máy in Techpack đang chạy xè xè. Chị Nga hoảng hốt gọi xe cấp cứu 115 đưa bạn vào Bệnh viện Chợ Rẫy. Tỉnh dậy trên giường bệnh với chai nước biển đang nhỏ giọt, bạn nhận ra không có chiếc container nào quý giá hơn tính mạng của mình.',
    careerOutcome: 'Nghỉ dưỡng bệnh 2 tuần bắt buộc có hưởng bảo hiểm y tế.',
    salaryBonus: 'Hóa Đơn Viện Phí & Một Lời Nhắc Nhở Đắt Giá Về Cân Bằng Cuộc Sống',
    unlockedTitle: 'Danh Hiệu: Chiến Thần Tăng Ca Đột Quỵ 💤',
    bgGradient: 'linear-gradient(135deg, #dc2626, #991b1b, #450a0a)'
  },
  aql_disaster: {
    id: 'aql_disaster',
    title: 'BỒI THƯỜNG TOÀN BỘ LÔ HÀNG BỊ TRẢ VỀ',
    badge: '📦 RỚT CHUẨN AQL (THẢM HỌA)',
    icon: '📦',
    grade: 'C',
    quote: '"Khách hàng Mỹ mở cont phát hiện toàn bộ áo bị lem màu loang lổ... Ai là người ký duyệt xuất xưởng?!"',
    narrative: 'Vì quá vội vàng xuất xưởng cho kịp giờ tàu chạy, bạn đã bỏ qua khâu kiểm tra độ bền màu giặt và ánh sáng quang phổ D65. Khi tàu cập cảng Los Angeles, đơn vị kiểm định quốc tế phát hiện lỗi Delta E vượt ngưỡng 3.0. Lô hàng 5.000 áo bị trả về nguyên trạng kèm biên bản phạt vi phạm hợp đồng!',
    careerOutcome: 'Bị giáng chức xuống làm nhân viên dán tem phụ tại kho vải.',
    salaryBonus: 'Trừ 50% Lương Hàng Tháng Để Khắc Phục Chi Phí Vận Chuyển',
    unlockedTitle: 'Danh Hiệu: Cẩu Thả Xuất Khẩu ⚠️',
    bgGradient: 'linear-gradient(135deg, #78716c, #44403c, #1c1917)'
  },
  lotto_luck: {
    id: 'lotto_luck',
    title: 'THẦN TÀI ĐỘ - TRÚNG VÉ SỐ 2 TỶ ĐỒNG',
    badge: '🍀 THẦN TÀI ĐỘ (JACKPOT LUCK)',
    icon: '💰',
    grade: 'S',
    quote: '"Sáng thắp 3 nén nhang thành tâm cầu may, chiều dò vé số trúng ngay giải độc đắc!"',
    narrative: 'Nhờ sự thành tâm ngày nào cũng lau dọn bàn thờ Thần Tài - Thổ Địa và thắp nhang hướng thiện, vận may bất ngờ gõ cửa! Tờ vé số bạn mua ủng hộ cụ già trước cổng công ty sáng nay trùng khớp hoàn toàn 6 con số giải Đặc Biệt! Bạn mời toàn bộ công ty một bữa buffet hải sản 5 sao rồi vui vẻ xin nghỉ việc để làm cổ đông lớn!',
    careerOutcome: 'Trở thành NHÀ ĐẦU TƯ THIÊN THẦN VÀ CHỦ XƯỞNG MAY THỜI TRANG RIÊNG.',
    salaryBonus: '2.000.000.000 VNĐ Tiền Mặt Rủng Rỉnh Vào Tài Khoản MBBank',
    unlockedTitle: 'Danh Hiệu: Con Cưng Của Thần Tài 🧧',
    bgGradient: 'linear-gradient(135deg, #eab308, #ca8a04, #713f12)'
  },
  hardworking: {
    id: 'hardworking',
    title: 'NHÂN VIÊN MẪN CÁN HOÀN THÀNH CA TRỰC',
    badge: '👔 CA TRỰC AN TOÀN (B-RANK)',
    icon: '⭐',
    grade: 'B',
    quote: '"Một ngày làm việc ổn định, không có sóng gió lớn, tan ca đúng giờ về ăn cơm mẹ nấu!"',
    narrative: 'Bạn khéo léo cân bằng giữa tiến độ công việc và áp lực thời gian. Mọi đơn hàng đều được xử lý gọn gàng, container xuất bến đúng lịch trình, và bạn không để bản thân bị cuốn vào những căng thẳng độc hại chốn công sở.',
    careerOutcome: 'Giữ vững vị trí Merchandiser kỳ cựu được đồng nghiệp tin cậy.',
    salaryBonus: '+100% Lương Ca Trực & Phụ Cấp Chuyên Cần Đầy Đủ',
    unlockedTitle: 'Danh Hiệu: Cột Trụ Vững Vàng Của Công Ty 🏢',
    bgGradient: 'linear-gradient(135deg, #2563eb, #1d4ed8, #172554)'
  }
};
