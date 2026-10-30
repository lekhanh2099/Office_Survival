import { Card, Choice, QueuedCard } from '../types/game';

function ch(label: string, hint: string, d: Record<string, number> | undefined, message: string, extra: Partial<Choice> = {}): Choice {
  return { label, hint, d, message, ...extra };
}

const q = (id: string, delay: number): QueuedCard => ({ id, delay });

export const CARDS: Record<string, Card> = {};

function addCard(id: string, type: Card['type'], who: string, emoji: string, title: string, body: string, choices: Choice[]) {
  CARDS[id] = { id, type, who, emoji, title, body, choices };
}

// ==================== BASE CARDS ====================
addCard('urgent', 'base', 'Sếp tổng', '👔', 'Cực kỳ đơn giản', '"Em làm hộ anh 30 slide trước trưa nhé. Không gấp đâu, chỉ có CEO đang đợi thôi."', [
  ch('Dạ em nhận ạ!', 'Làm sếp nở mũi nhưng lịch làm việc toang', { e: -2, b: 2, r: 1 }, 'Sếp thả tim. Lịch của bạn thả trôi.', { queue: [q('urgent_follow', 3)] }),
  ch('Xin xác nhận ưu tiên', 'Bảo vệ ranh giới cá nhân, chấp nhận sếp phật ý', { e: -1, b: -1, r: -1 }, 'Sếp trả lời: "Em trưởng thành rồi đó." Bạn chưa biết đây có phải lời khen.', { queue: [q('urgent_negotiated', 3)] }),
  ch('Gửi ảnh mèo thay báo cáo', 'Canh bạc liều lĩnh: Được khen sáng tạo hoặc ăn biên bản', {}, 'Bạn gửi một ảnh mèo mặc vest.', {
    roll: {
      chance: 0.5,
      win: { d: { b: -2, r: 1 }, message: 'CEO trả lời: "Thuyết trình rất sáng tạo." Bạn vừa phát minh ra báo cáo bằng mèo.' },
      lose: { d: { r: -2, b: 2 }, message: 'CEO hỏi: "Mèo này có số liệu Q3 không?" Sếp tag cả công ty.' }
    }
  })
]);

addCard('printer', 'base', 'Máy in tầng 4', '🖨️', 'Máy in đòi quyền công dân', 'Máy in nhả ra một tờ giấy: "TÔI KHÔNG IN NỮA. TÔI MUỐN THĂNG TIẾN."', [
  ch('Phong máy in làm trưởng phòng', 'Tạo ra cấp quản lý vô cơ để xoa dịu cuộc khủng hoảng', { b: 1, r: 1 }, 'HR cập nhật sơ đồ tổ chức. Bạn vừa tạo ra một cấp quản lý không có linh hồn.', { flag: 'printerBoss', queue: [q('printer_promoted', 3)] }),
  ch('Tắt máy rồi bật lại', 'Chiêu thức IT kinh điển: Đơn giản nhưng hiệu quả', { e: -1, b: -1 }, 'Máy in quay lại làm việc nhưng giờ biết bạn sợ nó.'),
  ch('Thương lượng bằng giấy A4', 'Đàm phán hòa bình với thiết bị văn phòng', {}, 'Đại diện công đoàn giấy A4 bước vào phòng.', {
    roll: {
      chance: 0.65,
      win: { d: { e: 2, b: -1 }, message: 'Máy in đồng ý đổi một ngày nghỉ lấy 10 tờ A4.' },
      lose: { d: { e: -2, b: 2 }, message: 'Máy in yêu cầu bảo hiểm, lương tháng 13 và một chỗ đậu xe.' }
    }
  })
]);

addCard('excel', 'base', 'Phòng kế toán', '📊', 'Excel thức tỉnh', 'File báo cáo của bạn bỗng hiện dòng: =IF(SẾP_TỨC_GIẬN,"CHẠY", "CHẠY_NHANH")', [
  ch('Sửa công thức cho đàng hoàng', 'Cặm cụi tìm lỗi tham chiếu vòng để cứu file', { e: -2, b: -2 }, 'Bạn tìm ra lỗi tham chiếu vòng. Excel lặng im như chưa từng biết nói.'),
  ch('Đổi tên file thành FINAL_v99', 'Đùn đẩy vấn đề cho tương lai bằng phép thuật đổi tên', { e: 1, b: 2 }, 'Không ai dám mở bản FINAL_v99 nữa.', { queue: [q('excel_revenge', 4)] }),
  ch('Đề nghị Excel làm CFO', 'Bổ nhiệm Excel làm lãnh đạo tài chính', { r: 1, b: 1 }, 'CFO mới yêu cầu có ngay một bảng lương cho các hàm SUM.')
]);

addCard('meeting', 'base', 'Lịch Outlook', '📅', 'Cuộc họp để lên lịch họp', 'Bạn nhận lời mời họp dài 90 phút, nội dung: "Thảo luận xem khi nào nên họp."', [
  ch('Từ chối kèm agenda đề xuất', 'Đòi hỏi mục tiêu rõ ràng, tự biến mình thành kẻ khó tính', { e: -1, b: -1, r: -1 }, 'Mọi người ghét bạn vì yêu cầu có mục tiêu rõ ràng.'),
  ch('Tham gia và nói "em đồng ý"', 'Gật đầu vô thức để cuộc họp nhanh kết thúc', { e: -2, r: 1 }, 'Bạn không biết mình vừa đồng ý với cái gì.', { queue: [q('meeting_follow', 3)] }),
  ch('Đặt lịch họp để huỷ họp', 'Vòng lặp lịch họp: Giải phóng hoặc nhân ba số cuộc họp', {}, 'Outlook rung lên dữ dội.', {
    roll: {
      chance: 0.45,
      win: { d: { b: -2, r: 1 }, message: 'Vòng lặp lịch họp tự triệt tiêu. Cả công ty được giải thoát.' },
      lose: { d: { e: -2, b: 2 }, message: 'Hệ thống tạo thêm ba cuộc họp tiền-họp.' }
    }
  })
]);

addCard('client', 'base', 'Khách hàng VIP', '📱', 'Khách đổi yêu cầu lần thứ 17', '"Màu tím này hơi tím. Em làm tím kiểu không tím được không?"', [
  ch('Hỏi mã màu cụ thể', 'Đòi mã màu chuẩn xác, khách sẽ thấy bạn hơi cứng nhắc', { e: -1, b: -1, r: -1 }, 'Khách gửi mã #TÍM_VỪA_VỪA.'),
  ch('Bảo "Dạ được" trước đã', 'Nhận lời trước rồi tính sau, tương lai sẽ trả giá', { r: 1, b: 2 }, 'Bạn tự hứa đây là lần cuối hứa suông.', { queue: [q('client_follow', 3)] }),
  ch('Làm hẳn màu trong suốt', 'Gửi bản thiết kế vô hình: Đỉnh cao hoặc ra đường', {}, 'Bạn gửi bản thiết kế vô hình.', {
    roll: {
      chance: 0.55,
      win: { d: { b: -2, r: 1 }, message: 'Khách gọi đây là đỉnh cao minimalism.' },
      lose: { d: { b: 2, r: -1 }, message: 'Khách hỏi liệu logo cũng có thể vô hình như nhân sự không.' }
    }
  })
]);

addCard('coffee', 'base', 'Máy cà phê', '☕', 'Cà phê có lời tiên tri', 'Máy cà phê báo: "Hôm nay bạn sẽ gặp một người có rất nhiều task." Trong phòng chỉ có bạn.', [
  ch('Uống ngay hai ly', 'Nạp caffein liều cao để chạy deadline tốc độ', { e: 3, b: 1 }, 'Bạn tỉnh như sáo. Mắt cũng giật như sáo.', { queue: [q('coffee_follow', 3)] }),
  ch('Bỏ cà phê, làm việc tiếp', 'Từ chối cám dỗ, làm việc bằng ý chí thuần khiết', { e: -1, b: -1 }, 'Bạn mạnh mẽ vượt qua cám dỗ của hạt cà phê.'),
  ch('Xin máy cà phê nghỉ phép hộ', 'Nhờ máy cà phê gửi đơn xin nghỉ phép hộ', {}, 'Máy cà phê gõ một email đầy caffein.', {
    roll: {
      chance: 0.4,
      win: { d: { b: -3 }, message: 'HR chấp nhận đơn do máy cà phê gửi. Công ty chưa biết nó không phải người.' },
      lose: { d: { r: -1, b: 1 }, message: 'HR yêu cầu giấy xác nhận hạt cà phê có thẩm quyền.' }
    }
  })
]);

addCard('coworker', 'base', 'Đồng nghiệp bàn bên', '🤓', '"Giúp tí thôi"', 'Bạn được nhờ giúp một việc "5 phút", nhưng file đính kèm nặng 2 GB.', [
  ch('Giúp đồng nghiệp', 'Giúp đỡ nhiệt tình, tích luỹ ân tình văn phòng', { e: -2, r: 1 }, 'Đồng nghiệp cảm động và hứa sẽ trả ơn.', { queue: [q('coworker_help', 3)] }),
  ch('Từ chối lịch sự', 'Từ chối thẳng thắn để bảo vệ to-do list', { b: -1, r: -1 }, 'Đồng nghiệp bảo bạn "tự lập quá".'),
  ch('Giao lại việc cho con vịt cao su', 'Giao lại công việc cho con vịt cao su trên bàn', { e: 1, b: 1 }, 'Con vịt được cấp một tài khoản Jira.')
]);

addCard('wifi', 'base', 'Bộ phận IT', '📡', 'Wi-Fi xin nghỉ phép', 'Toàn bộ mạng văn phòng chuyển tên thành "Anh_Em_Dung_Tim_Nhau_Nua".', [
  ch('Chuyển sang làm offline', 'Tắt 47 tab trình duyệt, tập trung làm việc offline', { e: -1, b: -2 }, 'Bạn phát hiện máy vẫn có thể làm việc nếu không mở 47 tab.'),
  ch('Dùng 4G cá nhân cứu công ty', 'Bật 4G cá nhân cứu nguy cho cả phòng', { e: -2, r: 1 }, 'Cả phòng gọi bạn là trạm phát sóng sống.'),
  ch('Mời router tham gia team building', 'Gắn kết tình cảm với thiết bị phát sóng mạng', {}, 'Router muốn được lắng nghe.', {
    roll: {
      chance: 0.6,
      win: { d: { e: 2, b: -1 }, message: 'Router thấy mình thuộc về nơi này. Wi-Fi phục hồi.' },
      lose: { d: { b: 2, r: -1 }, message: 'Router bỏ đi cùng máy in.' }
    }
  })
]);

addCard('chat', 'base', 'Nhóm chat công ty', '💬', 'Sticker nhầm người', 'Bạn định gửi sticker con gấu ngủ vào nhóm bạn bè nhưng lại gửi vào nhóm có CEO.', [
  ch('Thu hồi trong 2 giây', 'Thu hồi sticker trong 2 giây chớp nhoáng', { e: -1 }, 'CEO hỏi: "Sao lại thu hồi? Tôi chưa lưu."'),
  ch('Nói đó là linh vật công ty', 'Nhận bừa con gấu là linh vật chiến dịch thương hiệu mới', { r: 1 }, 'Phòng Marketing chuẩn bị chiến dịch thương hiệu.', { queue: [q('sticker_viral', 4)] }),
  ch('Thả tiếp 37 sticker', 'Spam tiếp 37 sticker: Được lên chức hoặc kỷ luật', {}, 'Nhóm chat biến thành vườn thú.', {
    roll: {
      chance: 0.45,
      win: { d: { r: 2, b: -1 }, message: 'CEO đổi ảnh đại diện thành gấu ngủ và ban hành ngày "Không họp thứ Sáu".' },
      lose: { d: { r: -2, b: 1 }, message: 'HR mời bạn giải trình về "hành vi gấu hoá tập thể".' }
    }
  })
]);

addCard('deadline', 'base', 'Hệ thống task', '⏰', 'Deadline mọc thêm chân', 'Task ghi hạn thứ Sáu đột nhiên tự chạy về hôm nay.', [
  ch('Chốt phạm vi, làm phần quan trọng', 'Chốt phạm vi cốt lõi, hoàn thành phần quan trọng', { e: -2, b: -2 }, 'Bạn thắng được deadline trong hiệp một.'),
  ch('Đổi múi giờ máy tính', 'Đổi múi giờ máy tính để lùi hạn chót', { e: 1, b: 2 }, 'Deadline vẫn tới. Lần này nó nói tiếng Nhật.'),
  ch('Gửi task đi nghỉ dưỡng', 'Gửi task đi nghỉ dưỡng homestay ở Đà Lạt', {}, 'Bạn mua vé đi Đà Lạt cho task.', {
    roll: {
      chance: 0.5,
      win: { d: { b: -3 }, message: 'Task quyết định nghỉ việc và mở homestay.' },
      lose: { d: { b: 2, e: -1 }, message: 'Task quay về cùng hai task con.' }
    }
  })
]);

addCard('payroll', 'base', 'Phòng nhân sự', '💸', 'Lương về... bằng điểm kinh nghiệm', 'HR thông báo tháng này sẽ trả thưởng bằng huy hiệu "Chiến binh công sở cấp S".', [
  ch('Yêu cầu quy đổi huy hiệu ra tiền', 'Đòi quy đổi huy hiệu tinh thần ra tiền mặt thực tế', { e: -1, r: -1, b: -1 }, 'HR trả lời: "Em thực dụng quá." Nhưng khối việc đã được xem xét lại.'),
  ch('Nhận huy hiệu và mỉm cười', 'Vui vẻ nhận huy hiệu danh giá làm bằng Excel', { r: 1, e: -1 }, 'Bạn nhận được huy hiệu làm bằng Excel.'),
  ch('Dùng huy hiệu mua công ty', 'Dùng huy hiệu để mua quyền tắt thông báo 15 phút', {}, 'Một cuộc giao dịch siêu thực diễn ra.', {
    roll: {
      chance: 0.3,
      win: { d: { r: 2, b: -3 }, message: 'Bạn mua được quyền tắt thông báo trong 15 phút. Đáng giá.' },
      lose: { d: { b: 2, r: -1 }, message: 'Bạn bị tính thêm phí quản lý huy hiệu.' }
    }
  })
]);

addCard('intern', 'base', 'Thực tập sinh', '🐣', 'Intern hỏi câu nguy hiểm', '"Anh/chị ơi, tại sao mình không xoá hết các task cho đỡ quá tải?"', [
  ch('Giải thích backlog và độ ưu tiên', 'Kiên nhẫn giải thích backlog và độ ưu tiên task', { e: -1, b: -1, r: 1 }, 'Intern hiểu ra. Một người trẻ được cứu khỏi Jira.'),
  ch('Cho intern quyền admin', 'Cấp quyền admin cho intern: Xoá sạch mọi vấn đề', { b: -2 }, 'Tất cả task biến mất. Không ai biết đây có phải chiến thắng.', { queue: [q('intern_admin', 3)] }),
  ch('Mời intern giữ chức CTO', 'Bổ nhiệm intern làm CTO đổi toàn bộ mật khẩu', { r: 1, b: 1 }, 'Intern đổi toàn bộ mật khẩu thành 1234567.')
]);

addCard('officeplant', 'base', 'Cây trầu bà', '🪴', 'Cây cảnh biết đọc KPI', 'Cây trầu bà ở góc phòng bỗng nộp báo cáo hiệu suất tốt hơn bạn.', [
  ch('Học cách tập trung của cây', 'Học phương pháp ngồi yên quang hợp có mục đích', { e: 1, b: -1 }, 'Cây dạy bạn phương pháp ngồi yên nhưng có mục đích.'),
  ch('Đề cử cây làm nhân viên tháng', 'Đề cử cây trầu bà làm nhân viên xuất sắc của tháng', { r: 1 }, 'Cây được cấp email nội bộ.', { queue: [q('plant_promoted', 3)] }),
  ch('Nói cây là đối thủ cạnh tranh', 'Tuyên chiến lạnh với chậu cây cảnh cùng phòng', { e: -1, r: -1 }, 'Cây không phản hồi. Chiến tranh lạnh bắt đầu.')
]);

addCard('lunch', 'base', 'Căn-tin tầng trệt', '🍜', 'Bữa trưa cuối cùng', 'Căn-tin chỉ còn một suất cơm. Bảy phòng ban đang đấu thầu.', [
  ch('Đổi task lấy suất cơm', 'Nhận thêm việc vặt để đổi lấy suất cơm trưa', { e: 3, b: 1 }, 'Bạn ăn no và được giao thêm một việc vặt.'),
  ch('Ăn bánh mì đem theo', 'Ăn bánh mì đem theo, giữ vững thế chủ động', { e: 2 }, 'Bữa trưa khiêm tốn, tinh thần chiến lược.'),
  ch('Tổ chức đấu giá bằng KPI', 'Đấu giá suất cơm cuối cùng bằng chỉ số KPI', {}, 'Tất cả bắt đầu tranh luận về KPI của nước mắm.', {
    roll: {
      chance: 0.5,
      win: { d: { e: 4, r: 1 }, message: 'Bạn giành được suất cơm và sự kính trọng của căn-tin.' },
      lose: { d: { e: -1, r: -1 }, message: 'Bạn mất suất cơm và được bổ nhiệm trưởng ban đấu giá.' }
    }
  })
]);

addCard('calendar', 'base', 'Trợ lý AI nội bộ', '🤖', 'AI đã viết mail thay bạn', 'AI gửi cho CEO một email 2.000 chữ kết thúc bằng: "Trân trọng, người máy có tâm hồn."', [
  ch('Thu hồi và viết lại', 'Rút lại email 2.000 chữ của AI trước khi sếp đọc', { e: -2, r: 1 }, 'CEO cảm ơn vì email đã ngắn hơn 1.800 chữ.'),
  ch('Giả vờ AI là nhân sự mới', 'Giả vờ AI là nhân sự mới đang thử việc', { b: 1 }, 'HR bắt đầu chuẩn bị hợp đồng lao động cho AI.', { queue: [q('ai_contract', 3)] }),
  ch('Yêu cầu AI tự giải thích', 'Để AI tự viết email giải trình xin lỗi sếp', {}, 'AI tạo thêm một email xin lỗi.', {
    roll: {
      chance: 0.5,
      win: { d: { b: -1, r: 1 }, message: 'CEO thích sự trung thực của AI. Bạn được cộng điểm quản lý.' },
      lose: { d: { r: -2, b: 1 }, message: 'AI CC cả công ty vào bản kiểm điểm 13 trang.' }
    }
  })
]);

addCard('aircon', 'base', 'Điều hoà văn phòng', '🥶', 'Nhiệt độ gây chia rẽ', 'Một nửa phòng muốn 16°C, nửa còn lại muốn 30°C. Remote nằm trong tay CEO.', [
  ch('Đề xuất 25°C và làm việc tiếp', 'Thỏa hiệp ở mức 25°C: Không ai vui nhưng chấp nhận', { e: -1, b: -1 }, 'Không ai vui. Nghĩa là bạn đã đạt thỏa hiệp.'),
  ch('Mặc thêm áo khoác', 'Mặc áo khoác mùa đông giữa mùa hè văn phòng', { e: 1, r: -1 }, 'Bạn trông như chuẩn bị đi Bắc Cực, trong mắt CEO.'),
  ch('Bầu điều hoà làm quản lý', 'Bầu điều hoà nhiệt độ làm quản lý chấm công', { r: 1, b: 1 }, 'Điều hoà lập tức yêu cầu bảng chấm công.')
]);

// NEW Base Cards
addCard('boba', 'base', 'Hội mê trà sữa', '🧋', 'Kèo trà sữa 15:00', 'Đồng nghiệp gọi to: "Ai trà sữa không? 5 ly freeship, ai đứng ra ứng tiền trước lát mọi người bank lại nè!"', [
  ch('Dạ em ứng tiền trước cho cả phòng!', 'Đứng ra ứng tiền trước: Thành thiên thần của cả phòng', { b: 1, r: 1 }, 'Mọi người tung hô bạn là thiên thần. Ví tiền của bạn khóc thầm.', { queue: [q('boba_debt', 3)] }),
  ch('Em đang cai đường, xin miễn', 'Cai đường giữ ví, nuốt nước mắt nhìn đồng nghiệp uống', { e: -1 }, 'Bạn giữ được ví nhưng nhìn mọi người cắm ống hút lòng quặn thắt.'),
  ch('Xin sếp tài trợ quỹ gắn kết', 'Tag sếp vào đơn hàng xin tài trợ quỹ gắn kết', {}, 'Bạn tag sếp vào đơn đặt 8 ly full topping.', {
    roll: {
      chance: 0.5,
      win: { d: { e: 2, r: 1 }, message: 'Sếp duyệt và khen bạn biết khơi dậy tinh thần đồng đội.' },
      lose: { d: { r: -1, b: 1 }, message: 'Sếp hỏi: "Thế KPI tháng này đã ngọt ngào như trà sữa chưa?"' }
    }
  })
]);

addCard('sunday_call', 'base', 'Sếp tổng', '📱', 'Tin nhắn lúc 21:00 Chủ Nhật', 'Màn hình điện thoại sáng lên dòng chữ quen thuộc: "Alo em, rảnh không anh nhờ tí xíu..."', [
  ch('Xem và trả lời "Dạ em nghe sếp"', 'Rep sếp ngay trong đêm: Tận tụy nhưng mất ngủ', { e: -2, r: 1 }, 'Sếp cảm kích vì sự cống hiến không ngừng nghỉ của bạn.', { queue: [q('sunday_task', 3)] }),
  ch('Giả vờ đang ở vùng mất sóng', 'Giả vờ mất sóng: Giữ tối Chủ Nhật, lo sáng thứ Hai', { e: 1, r: -1 }, 'Bạn bảo vệ được giấc ngủ, nhưng sáng thứ Hai bước vào công ty hơi rụt rè.'),
  ch('Cài tin nhắn tự động đòi phí ngoài giờ', 'Bật tin nhắn tự động thu phí ngoài giờ 500k', {}, 'Hệ thống tự gửi: "Tin nhắn hỗ trợ ngoài giờ có phí 500k."', {
    roll: {
      chance: 0.4,
      win: { d: { b: -1, r: 1 }, message: 'Sếp tưởng tin nhắn nhà mạng Viettel nên tự giác tắt máy đi ngủ.' },
      lose: { d: { r: -2, b: 2 }, message: 'Sếp chụp màn hình gửi vào nhóm ban giám đốc: "Nhân sự dạo này hài hước quá." Khối lượng việc tăng gấp đôi.' }
    }
  })
]);

addCard('salary_review', 'base', 'Phòng nhân sự', '📈', 'Đánh giá tăng lương 6 tháng', 'HR hẹn bạn vào phòng họp kính: "Em hãy chứng minh vì sao công ty nên tăng cho em 5% lương?"', [
  ch('Thuyết trình slide 40 trang cống hiến', 'Chuẩn bị slide 40 trang chứng minh cống hiến', { e: -2, r: 1 }, 'HR ghi nhận bạn là nhân tố cày cuốc gương mẫu.', { queue: [q('salary_outcome', 3)] }),
  ch('Kể khổ tiền trọ tăng, giá xăng tăng', 'Kể khổ tiền trọ, khơi gợi lòng trắc ẩn của HR', { b: -1, r: -1 }, 'HR mỉm cười: "Công ty là gia đình, đừng quá nặng lòng vì vật chất em nhé."'),
  ch('Khoe khéo có offer công ty đối thủ', 'Đặt danh thiếp đối thủ lên bàn để ép tăng lương', {}, 'Bạn đặt nhẹ chiếc danh thiếp của đối thủ lên bàn.', {
    roll: {
      chance: 0.5,
      win: { d: { e: 2, r: 2, b: -1 }, message: 'Công ty lập tức duyệt tăng 15% để giữ chân người tài!' },
      lose: { d: { r: -2, b: 2 }, message: 'HR chúc em lên đường may mắn và giao thêm 10 task bàn giao gấp.' }
    }
  })
]);

addCard('fire_drill', 'base', 'Toà nhà văn phòng', '🚨', 'Báo cháy giả tầng 18', 'Còi báo cháy hú vang trời lúc 14:00. Khói không thấy đâu nhưng cả toà nhà xôn xao.', [
  ch('Chạy bộ 18 tầng thang thoát hiểm', 'Chạy bộ 18 tầng thang thoát hiểm cho an toàn', { e: -2, b: -1 }, 'Chân run lẩy bẩy nhưng an toàn là trên hết. Task tạm thời hoãn lại.'),
  ch('Ngồi lại ráng lưu nốt file Excel', 'Ráng ngồi lại lưu nốt file Excel đang làm dở', { e: -1, b: -2 }, 'Đúng là tinh thần thép của dân công sở. Báo cáo hoàn tất.'),
  ch('Mang theo cây trầu bà và máy in', 'Ôm theo máy in và cây cảnh cùng tháo chạy', {}, 'Bạn ôm tài sản chạy xuống sảnh.', {
    roll: {
      chance: 0.5,
      win: { d: { r: 2, e: 1 }, message: 'Ban quản lý toà nhà khen ngợi ý thức bảo vệ tài sản công cộng.' },
      lose: { d: { e: -2, r: -1 }, message: 'Máy in kẹt ở góc cầu thang. Bạn bị bảo vệ lập biên bản cản trở lối thoát.' }
    }
  })
]);

addCard('group_drama', 'base', 'Hội bồ câu ẩn danh', '🦜', 'Drama bùng nổ trong group kín', 'Group chat không có sếp bỗng leak ảnh sếp đang ngủ ngáy giữa giờ họp hội đồng.', [
  ch('Thả icon haha trong vô thức', 'Lỡ tay thả icon haha vào ảnh dìm của sếp', { r: -1 }, 'Bạn lỡ tay bấm thả cảm xúc. Một vết gợn lịch sử.', { queue: [q('group_caught', 3)] }),
  ch('Lặng lẽ out group bảo toàn tính mạng', 'Lặng lẽ out group kín để bảo toàn tính mạng', { e: -1, r: 1 }, 'Đồng nghiệp bảo bạn chảnh, nhưng bạn sống dai nhất toà nhà.'),
  ch('Đổi chủ đề sang nhắc deadline KPI', 'Đổi chủ đề sang KPI để dập tắt cuộc vui', { b: 1, r: 1 }, 'Cả nhóm im bặt. Bạn chính là kẻ dập tắt cuộc vui chuyên nghiệp.')
]);

addCard('blackout', 'base', 'Điện lực toà nhà', '🕯️', 'Mất điện đột ngột', 'Điều hoà tắt phụt. Căn phòng 50 người biến thành lò bánh mì, laptop còn 8% pin.', [
  ch('Gập máy, chuồn về sớm đi uống bia', 'Gập máy chuồn về sớm đi giải nhiệt cốc bia', { e: 2, b: 1 }, 'Trời sập cũng không ngăn được bước chân tan ca.'),
  ch('Cắm sạc dự phòng bật 4G làm tiếp', 'Bật 4G cắm sạc dự phòng cày cuốc trong bóng tối', { e: -2, b: -2, r: 1 }, 'Mồ hôi ướt đẫm bàn phím nhưng task vẫn về đích đúng hẹn.'),
  ch('Tụ tập cả phòng kể chuyện ma', 'Thắp đèn flash tụ tập kể chuyện ma văn phòng', {}, 'Cả phòng thắp đèn flash điện thoại kể chuyện.', {
    roll: {
      chance: 0.65,
      win: { d: { e: 2, r: 1 }, message: 'Không khí gắn kết kỳ lạ. Tinh thần đồng đội lên cao vút.' },
      lose: { d: { e: -1, r: -1 }, message: 'Đang đến đoạn rùng rợn thì sếp xuất hiện lù lù sau lưng áo.' }
    }
  })
]);

addCard('chair_broken', 'base', 'Phòng hành chính', '🪑', 'Ghế công thái học Shopee 299k', 'Công ty vừa trang bị loạt ghế mới. Bạn ngồi xuống thì gãy bánh xe kêu cái "rắc".', [
  ch('Đứng làm việc như dân Thung Lũng', 'Đứng làm việc theo phong cách Silicon Valley', { e: -1, b: -1 }, 'Cột sống cảm ơn bạn. Bắp chuối thì đang biểu tình.'),
  ch('Lén tráo ghế với phòng Giám đốc', 'Lén tráo ghế da êm ái của phòng Giám đốc', { e: 1, r: -1 }, 'Ghế da êm ái vô cùng, trừ ánh mắt của chị lao công.'),
  ch('Lấy băng dính vàng sửa bánh xe', 'Dùng băng dính vàng trổ tài kỹ sư cơ khí', {}, 'Bạn trổ tài kỹ sư cơ khí văn phòng.', {
    roll: {
      chance: 0.5,
      win: { d: { e: 1, b: -1 }, message: 'Ghế vững chãi lạ kỳ. Kỹ năng sinh tồn đạt đỉnh cao.' },
      lose: { d: { e: -2, b: 1 }, message: 'Ghế sụp lần hai. Bạn ngã bật ngửa trước mặt toàn thể đồng nghiệp.' }
    }
  })
]);

addCard('teambuilding_beach', 'base', 'Công đoàn công ty', '🏖️', 'Teambuilding giữa trưa nắng 39°C', 'HR cầm loa gào: "12:00 trưa nay cả công ty ra bãi cát kéo co để thể hiện tinh thần máu lửa!"', [
  ch('Xông pha kéo co hết mình', 'Kéo co hết mình giữa trưa nắng cháy da 39°C', { e: -3, r: 2 }, 'Bạn cháy hết mình vì màu cờ sắc áo. Da bạn cũng cháy nắng theo.'),
  ch('Giả say nắng trốn trong phòng máy lạnh', 'Giả say nắng ngủ ngon 3 tiếng trong phòng máy lạnh', { e: 2, r: -1 }, 'Bạn đánh một giấc ngon lành 3 tiếng giữa trưa hè.'),
  ch('Đề xuất chơi ma sói trong nhà', 'Thuyết phục cả đoàn chuyển sang chơi ma sói trong nhà', {}, 'Bạn đứng lên phản biện bằng khoa học.', {
    roll: {
      chance: 0.5,
      win: { d: { e: 1, r: 1 }, message: 'Cả công ty vỗ tay rầm rộ. Bạn vừa cứu 50 mạng người khỏi say nắng.' },
      lose: { d: { r: -2, b: 1 }, message: 'HR phê bình bạn thiếu tinh thần dấn thân vì tập thể.' }
    }
  })
]);

addCard('standup_talkshow', 'base', 'Team dự án', '🎙️', 'Daily Standup biến thành Talkshow', 'Cuộc họp cập nhật tiến độ 15 phút bỗng kéo dài sang tiếng thứ hai với chủ đề "Ý nghĩa cuộc đời".', [
  ch('Gật đầu chăm chú và ghi chép', 'Gật đầu ghi chép nhiệt tình triết lý nhân sinh của sếp', { e: -2, r: 1 }, 'Sếp rất thích vì thấy bạn biết lắng nghe triết lý kinh doanh.'),
  ch('Lén mở điện thoại chơi game', 'Lén đeo tai nghe cày game trong im lặng', { e: 1, b: 1 }, 'Bạn qua được 3 màn Candy Crush trong im lặng.'),
  ch('Dũng cảm giơ tay xin chốt to-do list', 'Dũng cảm ngắt lời xin chốt to-do list hành động', {}, 'Bạn cất lời giữa bài diễn thuyết của trưởng nhóm.', {
    roll: {
      chance: 0.6,
      win: { d: { b: -2, r: 1 }, message: 'Cả phòng thở phào nhẹ nhõm. Bạn là vị cứu tinh của buổi sáng.' },
      lose: { d: { r: -2, b: 2 }, message: 'Trưởng nhóm bảo bạn nôn nóng, giao thêm 2 biên bản cuộc họp.' }
    }
  })
]);

addCard('keyboard_spill', 'base', 'Bàn làm việc', '☕', 'Đổ trà sữa vào bàn phím cơ', 'Cốc trà sữa nghiêng đổ trúng bàn phím cơ xanh đỏ. Các phím bắt đầu tự nhảy liên tục dòng "ssssssss".', [
  ch('Rút dây ngay, tháo keycap sấy khô', 'Rút dây khẩn cấp, tháo keycap sấy khô bàn phím', { e: -2, b: -1 }, 'Bàn phím được cứu sau 40 phút phẫu thuật khẩn cấp.'),
  ch('Dùng bàn phím dự phòng cùi bắp', 'Dùng bàn phím cao su dự phòng gõ sai chính tả', { e: -1, b: 1 }, 'Bàn phím cao su mờ chữ khiến bạn gõ sai 40% chính tả.'),
  ch('Bảo khách "sssss" là phong cách mới', 'Giải thích "sssss" là phong cách giao tiếp sáng tạo mới', {}, 'Email gửi cho đối tác có 40 chữ sssss.', {
    roll: {
      chance: 0.45,
      win: { d: { r: 2, b: -1 }, message: 'Khách khen công ty có phong cách giao tiếp sáng tạo độc lạ!' },
      lose: { d: { r: -2, b: 2 }, message: 'Khách hỏi bạn đang nuôi rắn hổ mang trong văn phòng à?' }
    }
  })
]);

addCard('birthday_fund', 'base', 'Thủ quỹ văn phòng', '🎂', 'Góp quỹ sinh nhật tháng này', 'Thủ quỹ ghé bàn: "Tháng này có 6 người sinh nhật, mỗi bạn góp 200k mua quà và bánh kem nhé!"', [
  ch('Vui vẻ chuyển khoản, ăn bánh trừ cơm', 'Chuyển khoản 200k vui vẻ, ăn bánh kem trừ cơm', { e: 1, b: 1 }, 'Đường huyết tăng cao, tạm thời quên đi nỗi đau ví tiền.'),
  ch('Khai man sinh nhật mình vào tuần sau', 'Khai man sinh nhật tuần sau để thu hồi vốn', { r: -1 }, 'Bạn tính kế thu hồi vốn bằng một ngày sinh nhật giả.', { queue: [q('birthday_revival', 3)] }),
  ch('Tặng tranh tự vẽ thay tiền mặt', 'Tự vẽ tranh chân dung sếp làm quà sinh nhật', { e: -1, r: 1 }, 'Bức tranh vẽ sếp được treo ngay lối ra vào phòng họp.')
]);

addCard('boss_singing', 'base', 'Quán Karaoke gần công ty', '🎤', 'Sếp rủ đi Karaoke sau giờ làm', 'Sếp bảo: "Hôm nay ai không đi hát là không tôn trọng tình anh em công ty nhé!"', [
  ch('Đi quẩy hết mình, vỗ tay sếp hát 10 bài', 'Đi quẩy hết mình, vỗ tay sếp hát 10 bài bolero', { e: -3, r: 2 }, 'Sếp xúc động gọi bạn là cánh tay phải đắc lực.'),
  ch('Nói dối nhà bị ngập nước để về', 'Nói dối nhà ngập nước để trốn về ngủ sớm', { e: 1, r: -1 }, 'Bạn thoát được màn tra tấn màng nhĩ, ngủ một giấc đẫy đà.'),
  ch('Xung phong lên song ca bài tủ với sếp', 'Xung phong song ca nốt cao bùng nổ cùng sếp', {}, 'Bạn cầm micro nốt cao.', {
    roll: {
      chance: 0.55,
      win: { d: { r: 2, e: 1 }, message: 'Hai thầy trò song ca bùng nổ quán hát! Cả công ty quẩy tưng bừng.' },
      lose: { d: { r: -2, e: -2 }, message: 'Bạn vô tình giật mic đúng đoạn ngân của sếp. Không khí chùng xuống.' }
    }
  })
]);

// ==================== CALLBACK CARDS ====================
addCard('urgent_follow', 'callback', 'Sếp tổng', '👔', 'Báo cáo 30 slide quay lại', 'Sếp hỏi: "Em xong chưa? Anh cần thêm 40 slide phụ lục, nhưng vẫn đúng hạn cũ."', [
  ch('Chọn 10 slide quan trọng nhất', 'Chắt lọc phần cốt lõi, bảo vệ chất lượng bài thuyết trình', { e: -2, b: -2, r: -1 }, 'Bạn cứu bản trình bày bằng kỹ năng ưu tiên.'),
  ch('Bảo đã hoàn thành 110%', 'Hứa hẹn vượt mức mong đợi, rước thêm lịch kiểm tra', { b: 2, r: 1 }, 'Sếp vui. Calendar âm thầm tạo một cuộc họp kiểm thử.', { queue: [q('boss_audit', 3)] })
]);

addCard('urgent_negotiated', 'callback', 'Sếp tổng', '👔', 'Cái giá của ranh giới', 'Sếp gửi một tin: "Anh nghĩ lại rồi, ưu tiên em nói hôm trước rất hợp lý."', [
  ch('Chốt phạm vi bằng email', 'Xác lập ranh giới bằng văn bản, tạo tiền lệ chuẩn mực', { e: -1, b: -2, r: 1 }, 'Từ đó, cụm từ "phạm vi công việc" trở thành truyền thuyết.'),
  ch('Nhận thêm 1 yêu cầu nhỏ', 'Nhượng bộ một chút xíu, Jira lập tức mọc thêm việc', { r: 1, b: 2 }, 'Một yêu cầu nhỏ sinh đôi trong Jira.')
]);

addCard('printer_promoted', 'callback', 'Trưởng phòng Máy In', '🖨️', 'Máy in mở họp 1:1', 'Trưởng phòng Máy In yêu cầu bạn trình bày KPI "số tờ được cứu".', [
  ch('Chuẩn bị báo cáo KPI cho máy', 'Tôn trọng quyền lực của máy móc để được phê duyệt', { e: -2, r: 1 }, 'Máy in đóng dấu APPROVED bằng mực hồng.', { queue: [q('printer_audit', 3)] }),
  ch('Rút dây nguồn phòng họp', 'Giải quyết xung đột bằng cách cắt đứt nguồn năng lượng', { b: -2, r: -1 }, 'Cuộc họp kết thúc. Bộ phận Pháp chế thiết bị đang điều tra.', { flag: 'printerDispute' })
]);

addCard('printer_audit', 'callback', 'Ban kiểm toán Máy In', '📎', 'Kiểm toán giấy tờ bất ngờ', 'Trưởng phòng Máy In phát hiện bạn từng in một mặt và viết email khi chưa xin phép.', [
  ch('Nộp bản tự kiểm điểm A4', 'Hạ mình xin lỗi để xoa dịu lòng tự ái của máy in', { e: -1, r: 1 }, 'Máy in nức nở in một lá thư tha thứ.'),
  ch('Tố máy in làm thất thoát mực', 'Phản công kiểm toán: Tố giác ngược máy in lãng phí', {}, 'Cả văn phòng dõi theo bạn.', {
    roll: {
      chance: 0.55,
      win: { d: { b: -3, r: 1 }, message: 'Máy in xin nghỉ phép. Bạn được ân xá toàn bộ ticket in ấn.' },
      lose: { d: { b: 2, r: -2 }, message: 'Máy in gọi bảo vệ là chiếc máy scan.' }
    }
  })
]);

addCard('excel_revenge', 'callback', 'File FINAL_v99', '📊', 'Bản FINAL nổi loạn', 'Có 23 file FINAL mới trong thư mục. Một file tự nhận là file gốc.', [
  ch('Dọn version, đặt quy tắc đặt tên', 'Lập lại trật tự cho thư mục file đang hỗn loạn', { e: -2, b: -2 }, 'Công ty bình yên. Trong 4 phút.'),
  ch('Để Excel tự bầu trưởng file', 'Mặc kệ số phận, để các phiên bản tự sinh tự diệt', { e: 1, b: 2 }, 'FINAL_v99_FINAL_REAL bắt đầu họp hội đồng.')
]);

addCard('meeting_follow', 'callback', 'Lịch Outlook', '📅', 'Cái gật đầu định mệnh', 'Bạn được ghi tên làm chủ trì "Diễn đàn chiến lược thảo luận họp quý".', [
  ch('Gửi biên bản 3 dòng và huỷ', 'Gọn gàng súc tích, giải phóng đồng nghiệp khỏi cuộc họp', { e: -1, b: -2 }, 'Ba dòng của bạn giải phóng toàn bộ tầng 7.'),
  ch('Mở thêm một nhóm điều phối', 'Thêm người thêm việc, bộ máy hành chính phình to', { r: 1, b: 2 }, 'Hội đồng đã bầu ra ban thư ký của ban thư ký.')
]);

addCard('client_follow', 'callback', 'Khách hàng VIP', '📱', 'Màu tím phiên bản 18', 'Khách nhắn: "Em ơi, anh nghĩ màu tím không còn hợp. Đổi sang màu không có màu nhé."', [
  ch('Chốt lại phạm vi bằng văn bản', 'Ký cam kết ranh giới, giữ hình ảnh chuyên nghiệp', { e: -2, b: -2, r: -1 }, 'Khách gọi bạn là người khó tính nhưng chuyên nghiệp.'),
  ch('Dạ để em thử tiếp ạ', 'Tiếp tục chiều chuộng khách hàng vô điều kiện', { b: 2, r: 1 }, 'Ngày mai khách có thể muốn dùng màu của âm thanh.')
]);

addCard('coffee_follow', 'callback', 'Máy cà phê', '☕', 'Cà phê đòi tiền bản quyền', 'Hai ly cà phê sáng nay gửi hóa đơn "Phí tăng năng suất tâm hồn".', [
  ch('Tự pha, dứt điểm cuộc tranh cãi', 'Chấm dứt phụ thuộc vào máy cà phê thương mại', { e: -1, b: -1 }, 'Máy cà phê chấp nhận tách khỏi bộ máy kế toán.'),
  ch('Ký hợp đồng nhượng quyền', 'Nhận thêm việc bán hàng để đổi lấy caffein miễn phí', { e: 2, b: 2 }, 'Cà phê cấp thêm năng lượng và 2 nhiệm vụ bán hàng.')
]);

addCard('coworker_help', 'callback', 'Đồng nghiệp bàn bên', '🤓', 'Đến lúc trả ơn', 'Đồng nghiệp bạn từng giúp nói: "Để tui gánh hộ một phần việc cho!"', [
  ch('Nhờ xử lý hai task khó', 'Nhờ đồng nghiệp gánh việc để giải phóng backlog', { b: -2, r: 1 }, 'Đồng nghiệp xử lý gọn. Tình người vẫn còn.'),
  ch('Cảm ơn, tự làm nốt', 'Tự mình gánh vác, tích lũy kinh nghiệm xử lý vấn đề', { e: -1, b: -1 }, 'Bạn giữ lại niềm vui giải quyết vấn đề.')
]);

addCard('sticker_viral', 'callback', 'Phòng Marketing', '🐻', 'Con gấu thành bộ nhận diện', 'CEO muốn tung merch con gấu ngủ. Bạn bị đưa vào ban chỉ đạo.', [
  ch('Đưa ra bộ sticker mẫu rồi rút', 'Bàn giao thành quả sáng tạo rồi rút lui an toàn', { e: -1, b: -2, r: 1 }, 'Con gấu được bảo vệ bản quyền. Bạn giữ được giờ nghỉ trưa.'),
  ch('Nhận chức Giám đốc Gấu', 'Thăng tiến vượt bậc nhưng gánh thêm trách nhiệm thương hiệu', { b: 2, r: 2 }, 'Email của bạn giờ có đuôi @bear.')
]);

addCard('intern_admin', 'callback', 'Thực tập sinh', '🐣', 'Toàn bộ task biến mất lần nữa', 'Intern xóa cả nút "Khôi phục". Công ty vẫn yêu cầu báo cáo tiến độ.', [
  ch('Phục hồi từ backup', 'Cứu vãn dữ liệu kịp thời, dạy bài học cho người trẻ', { e: -2, b: -2 }, 'Backup cứu bạn. Intern học được giá trị của nút Undo.'),
  ch('Thông báo đây là chuyển đổi số', 'Vẽ ra câu chuyện chuyển đổi số để che đậy thảm họa', { r: 1, b: 2 }, 'CEO trình bày case study tại hội thảo. Bạn toát mồ hôi.')
]);

addCard('plant_promoted', 'callback', 'Cây trầu bà', '🪴', 'Cây gọi bạn họp hiệu suất', 'Trưởng nhóm Cây Trầu Bà muốn nâng KPI "số lá xanh/nhân viên".', [
  ch('Tưới cây, chốt KPI hợp lý', 'Chăm sóc cây cối, giải quyết êm đẹp khối lượng việc', { e: -1, b: -2 }, 'Cây ra lá mới. Bạn giải quyết xong 2 việc.'),
  ch('Đăng ký thi đua quang hợp', 'Làm việc hết mình dưới nắng để gây ấn tượng với cây', { e: -2, r: 1 }, 'Bạn làm việc dưới nắng. Cây rất ấn tượng.')
]);

addCard('ai_contract', 'callback', 'Phòng nhân sự', '🤖', 'AI đòi nghỉ phép có lương', 'HR trình đơn xin nghỉ của AI để "đi tìm bản ngã giữa các token".', [
  ch('Cho AI nghỉ, viết email thủ công', 'Tập quay về phương pháp truyền thống gõ phím bằng tay', { e: -1, b: -1 }, 'Bạn hít thở sâu, học lại gõ bàn phím.'),
  ch('Yêu cầu AI đào tạo nhân sự mới', 'Tận dụng năng lực của AI để đào tạo nhân viên', { b: -2, r: -1 }, 'AI tổ chức khoá học "Làm sao để xin nghỉ phép từ chính mình".')
]);

addCard('boss_audit', 'callback', 'Sếp tổng', '👔', 'Kiểm toán 110%', 'Sếp hỏi báo cáo 110% là 110% của cái gì. Bạn không biết.', [
  ch('Thành thật nhận thiếu sót', 'Thành thật nhận lỗi, xin phương án gọn gàng hơn', { e: -1, r: -1, b: -1 }, 'Sếp yêu cầu bản gọn hơn. Bạn thở phào.'),
  ch('Đổi KPI thành 120%', 'Canh bạc số liệu: Thổi phồng tăng trưởng hoặc bị tra hỏi', {}, 'Bạn tăng phần trăm bằng niềm tin.', {
    roll: {
      chance: 0.35,
      win: { d: { r: 2, b: -2 }, message: 'CEO gọi bạn là đại sứ tăng trưởng.' },
      lose: { d: { r: -2, b: 2 }, message: 'Sếp đặt lịch cuộc họp về định nghĩa phần trăm.' }
    }
  })
]);

// NEW Callbacks
addCard('boba_debt', 'callback', 'Ví tiền của bạn', '💸', 'Nợ trà sữa 3 tuần chưa ai trả', 'Tin nhắn "Ê mọi người bank lại tiền trà sữa nha" rơi vào hố đen tĩnh lặng của vũ trụ.', [
  ch('Tag thẳng mặt từng người đòi nợ', 'Đòi nợ công khai, sứt mẻ tình cảm nhưng thu hồi vốn', { r: -1, b: -1 }, 'Đồng nghiệp giả vờ bận, nhưng 2 người đã ngậm ngùi chuyển khoản.'),
  ch('Tự nhủ coi như tiền cúng cô hồn', 'Tâm bất biến giữa dòng đời, chấp nhận mất tiền mua bình yên', { e: -1, r: 1 }, 'Tâm bất biến giữa dòng đời vạn biến. Bạn giác ngộ chân lý.')
]);

addCard('sunday_task', 'callback', 'Email hộp thư đến', '📩', 'Hậu quả của tin nhắn Chủ Nhật', 'File "Phụ lục 60 trang" sếp gửi nửa đêm đang nằm chờ bạn xử lý trước 10:00.', [
  ch('Cày cuốc hết tốc lực', 'Thức trắng đêm gõ báo cáo để nộp đúng hạn sáng sớm', { e: -3, b: -2, r: 1 }, 'Báo cáo nộp đúng hạn. Mắt bạn thâm quầng như gấu trúc.'),
  ch('Nhờ AI viết tóm tắt rồi nộp', 'Canh bạc AI: Tóm tắt thần tốc hoặc để lộ sơ hở', {}, 'Bạn paste toàn bộ vào AI tạo tóm tắt.', {
    roll: {
      chance: 0.6,
      win: { d: { b: -2, e: 1 }, message: 'Tóm tắt súc tích đến kinh ngạc. Sếp khen tư duy chiến lược.' },
      lose: { d: { b: 2, r: -1 }, message: 'AI để lộ câu: "Là một mô hình AI, tôi thấy báo cáo này quá vô lý." Sếp yêu cầu viết tay.' }
    }
  })
]);

addCard('salary_outcome', 'callback', 'Phòng nhân sự', '💌', 'Thư thông báo tăng lương', 'HR gửi thư mật: "Sau khi cân nhắc kỹ lưỡng, công ty quyết định tăng cho em 150.000đ/tháng!"', [
  ch('Mỉm cười nhận mức tăng 150k', 'Vui vẻ chấp nhận thực tế, tự thưởng cốc trà đá mỗi ngày', { e: -1, r: 1 }, 'Mỗi ngày bạn được thêm một cốc trà đá vỉa hè. Động lực tràn trề.'),
  ch('Dùng 150k khao bánh cả phòng', 'Hy sinh tiền tăng lương để mua sự ngưỡng mộ của đồng nghiệp', { r: 2, e: -1 }, 'Cả phòng xúc động trước tấm lòng thảo thơm của bạn.')
]);

addCard('group_caught', 'callback', 'Sếp tổng', '👀', 'Sếp phát hiện group chat kín', 'Sếp gửi thông báo toàn công ty: "Tôi biết các bạn hay thả icon haha sau lưng tôi..."', [
  ch('Dũng cảm nhận lỗi thay cả nhóm', 'Đứng mũi chịu sào, gánh chịu hậu quả vì anh em', { e: -2, r: 2, b: 1 }, 'Cả phòng nợ bạn một món nợ ân tình sâu sắc.'),
  ch('Đổ lỗi cho bot Nga tấn công mạng', 'Đổ lỗi cho thế lực hacker bí ẩn bên ngoài', {}, 'Bạn giải thích đây là lỗi bảo mật mạng.', {
    roll: {
      chance: 0.5,
      win: { d: { b: -2, r: 1 }, message: 'IT xác nhận có dấu hiệu nghẽn mạng. Sếp tha thứ cho tất cả.' },
      lose: { d: { r: -2, b: 2 }, message: 'Sếp mở lịch sử thấy avatar bạn to đùng. Bạn bị trừ điểm thi đua.' }
    }
  })
]);

addCard('birthday_revival', 'callback', 'Cả phòng làm việc', '🎂', 'Bánh kem báo oán', 'Cả phòng bất ngờ ùa vào với chiếc bánh kem mừng "sinh nhật giả" của bạn!', [
  ch('Ăn bánh kem trong sự cắn rứt', 'Bánh ngọt nhưng lương tâm đắng, ăn trong sự hối hận', { e: 2, r: -1 }, 'Bánh ngọt ngào nhưng lương tâm đắng ngắt. Bạn hứa không lừa ai nữa.'),
  ch('Thú nhận sự thật và khao lại trà sữa', 'Thành thật thú tội, dùng trà sữa để chuộc lỗi', { e: -1, r: 2 }, 'Mọi người cười bò vì độ lầy lội của bạn. Tình đồng nghiệp gắn kết.')
]);

// ==================== CRISIS CARDS ====================
addCard('energy_crisis', 'crisis', 'Cơ thể bạn', '😵', 'Não đang cập nhật Windows', 'Năng lượng quá thấp. Bạn nhìn con trỏ chuột và tưởng nó đang nhìn lại.', [
  ch('Đứng dậy, nghỉ ngắn', 'Tạm dừng công việc để hồi phục sinh lực khẩn cấp', { e: 3, b: 1 }, 'Bạn được nghỉ. Công việc vẫn chờ đó.'),
  ch('Cố làm thêm cho xong', 'Cố gắng quá sức trong cơn kiệt sức: Nguy cơ gục ngã', { e: -2, b: -2 }, 'Bạn cố gắng quá sức. Cơ thể có thể phản đối.')
]);

addCard('backlog_crisis', 'crisis', 'Jira', '🧨', 'Backlog sắp lên làm CEO', 'Danh sách việc tồn dài hơn điều lệ công ty. Nó bắt đầu có ý chí riêng.', [
  ch('Cắt bỏ task không còn giá trị', 'Mạnh tay xóa bỏ các ticket vô bổ để cứu hiện tại', { e: -2, b: -3, r: -1 }, 'Có người giận vì ticket của họ bị đóng, nhưng vũ trụ nhẹ hơn.'),
  ch('Chuyển task cho team tương lai', 'Đùn đẩy việc cho tương lai để cứu vãn tức thì', { b: -2, r: -2 }, 'Bạn cứu hiện tại bằng cách thế chấp tương lai.'),
  ch('Đổi backlog thành backlog.txt', 'Dùng pháp thuật đổi tên file để trốn tránh thực tại', {}, 'Bạn thử dùng pháp thuật đổi tên.', {
    roll: {
      chance: 0.5,
      win: { d: { b: -3 }, message: 'Task không tìm thấy đường về. Một chiến thắng đáng ngờ.' },
      lose: { d: { b: 2, e: -1 }, message: 'Backlog.txt tự nhân đôi vì được backup.' }
    }
  })
]);

addCard('rep_crisis', 'crisis', 'Tin đồn công ty', '📣', 'Uy tín chạm đáy', 'Có lời đồn bạn đã từ chối một cuộc họp mà chưa gửi ba đơn giải trình.', [
  ch('Chủ động giải thích và giúp một việc', 'Hạ mình giúp đỡ mọi người để khôi phục lòng tin', { e: -2, r: 2 }, 'Mọi người thấy bạn vẫn là con người.'),
  ch('Mua trà sữa hoà giải', 'Dùng văn hoá trà sữa để xoa dịu những tin đồn độc hại', { e: 1, r: 1, b: 1 }, 'Cả phòng tha thứ. Đơn đặt trà sữa trở thành task.')
]);

// ==================== RARE CARDS ====================
addCard('ufo', 'rare', 'Người ngoài hành tinh', '👽', 'UFO muốn tuyển bạn', 'Người ngoài hành tinh đỗ phi thuyền ở bãi xe. Họ đề nghị tuyển bạn vì trái đất đã có nhiều kinh nghiệm chịu đựng.', [
  ch('Nhận phỏng vấn bằng tiếng Sao Hoả', 'Tham gia phỏng vấn liên hành tinh để thăm dò cơ hội', { e: 2, r: -1 }, 'Họ khen bạn chịu áp lực cao. Bạn vẫn bị bắt quay về làm việc.'),
  ch('Xin họ bắt cóc backlog', 'Nhờ phi thuyền người ngoài hành tinh hút sạch việc tồn', {}, 'Một tia sáng chiếu vào Jira.', {
    roll: {
      chance: 0.6,
      win: { d: { b: -3 }, message: 'Phi thuyền chở ba task đi khỏi hệ Mặt Trời.' },
      lose: { d: { b: 2 }, message: 'Người ngoài hành tinh clone task để nghiên cứu.' }
    }
  })
]);

addCard('catceo', 'rare', 'CEO mới', '🐈', 'CEO là một con mèo', 'Thông báo nội bộ: "Từ nay CEO sẽ là mèo vì người tiền nhiệm mất ngủ."', [
  ch('Dâng cá khô để xin giảm task', 'Hối lộ lãnh đạo mới bằng đồ ăn vặt khoái khẩu', { b: -2, r: 1 }, 'CEO kêu meo. Ban điều hành phiên dịch là "Approved".'),
  ch('Hỏi về chiến lược 5 năm', 'Hỏi câu hóc búa về định hướng chiến lược tương lai', { e: -1, b: 1 }, 'CEO gạt ly nước xuống đất. Các phòng ban gọi đó là chiến lược tái cấu trúc.')
]);

addCard('timeloop', 'rare', 'Đồng hồ chấm công', '⌛', 'Thứ Hai lặp lại 4 lần', 'Đồng hồ chấm công bảo: "Tôi không công nhận thứ Ba."', [
  ch('Dùng vòng lặp để xử lý backlog', 'Tận dụng 4 bản sao cùng cày cuốc sprint', { e: -2, b: -3 }, 'Bốn bản sao của bạn cùng làm sprint.'),
  ch('Tận hưởng bốn lần nghỉ trưa', 'Ăn bốn bữa trưa no nê, mặc kệ công việc nhân đôi', { e: 3, b: 2 }, 'Bạn ăn bốn bữa cơm nhưng task cũng sinh thêm hai bản.')
]);

addCard('duck', 'rare', 'Con vịt cao su', '🦆', 'Con vịt đòi tăng lương', 'Vịt cao su trên bàn thông báo: "Từ giờ tôi chỉ debug với mức đãi ngộ Senior."', [
  ch('Công nhận vai trò của vịt', 'Tôn trọng năng lực debug của linh vật cao su', { e: 2, r: 1 }, 'Vịt giải quyết vấn đề bằng một tiếng kêu và sự tự tin.'),
  ch('Đề nghị phỏng vấn coding', 'Thử thách phỏng vấn thuật toán với con vịt', {}, 'Vịt nhìn bạn chằm chằm.', {
    roll: {
      chance: 0.5,
      win: { d: { b: -2 }, message: 'Vịt tìm ra bug. Bạn vẫn giữ việc làm.' },
      lose: { d: { r: -1, b: 2 }, message: 'Vịt nhận offer Staff Engineer. Bạn được giao viết tài liệu onboarding.' }
    }
  })
]);

// ==================== FINALE CARDS ====================
addCard('end_normal', 'finale', 'Sếp tổng', '🌇', '17:59 — Em ơi, một chút thôi!', 'Sếp xuất hiện ngay khi bạn đặt tay lên nút tắt máy. Câu "một chút" dài như vũ trụ.', [
  ch('Hẹn xử lý vào sáng mai, có ghi chú', 'Giữ vững ranh giới tan tầm, hẹn sếp sáng mai tính tiếp', { e: -1, b: -1, r: -1 }, 'Sếp tiếc nuối nhưng bạn đã giữ được ranh giới.'),
  ch('Ngồi lại làm đến "một chút"', 'Ngậm ngùi tăng ca thêm "một chút" dài như thế kỷ', { e: -2, b: -2, r: 1 }, 'Bạn rời công ty lúc trời tối. Chiếc ghế tạm biệt bằng tiếng cót két.')
]);

addCard('end_printer', 'finale', 'Trưởng phòng Máy In', '🖨️', '17:59 — Máy in ký lệnh đuổi việc', 'Máy in thông báo sẽ sa thải toàn bộ nhân viên không biết in hai mặt.', [
  ch('Dạy máy in in đảo mặt', 'Khuất phục máy in bằng kỹ năng in ấn hai mặt', { e: -2, b: -2 }, 'Trưởng phòng Máy In rơi một giọt mực cảm động.'),
  ch('Gọi HR hỏi ai ký quyết định này', 'Phản biện pháp lý về quyền hạn sa thải của máy in', { r: -1, b: -1 }, 'HR nhận ra máy in chưa có tư cách ký. Một chiến thắng pháp lý.')
]);

addCard('end_kpi', 'finale', 'Phòng KPI', '📈', '17:59 — Đánh giá hiệu suất phút cuối', 'Hệ thống hỏi: "Hôm nay bạn đã làm được bao nhiêu việc có thể chứng minh bằng 60 slide?"', [
  ch('Nộp bảng kết quả ngắn, rõ ràng', 'Trình bày số liệu súc tích, thuyết phục hội đồng', { e: -1, b: -2 }, 'Thậm chí KPI cũng phải công nhận kết quả.'),
  ch('Tạo một dashboard chớp nhoáng', 'Làm dashboard màu mè che mắt ban giám khảo', { r: 1, b: 2 }, 'Dashboard chạy rất đẹp. Không ai biết nó đo cái gì.')
]);

addCard('end_wfh', 'finale', 'Nhân sự', '🏢', '17:59 — Ngày mai họp toàn công ty', 'HR gửi lời mời họp 7:00 sáng mai với tiêu đề: "Cùng tạo một môi trường không có họp."', [
  ch('Đề nghị khảo sát không đồng bộ', 'Đề xuất làm khảo sát online để cứu cả công ty khỏi cuộc họp', { e: -1, b: -1 }, 'Bạn tạm cứu cả công ty khỏi một cuộc họp vô nghĩa.'),
  ch('Xung phong dẫn chương trình', 'Nhận trọng trách MC kết nối mọi người lúc sáng sớm', { r: 2, b: 2 }, 'Bạn được giao dẫn thêm một chương trình nữa. Vì bạn nói quá hay.')
]);

export const REGULAR_CARD_IDS = Object.values(CARDS).filter(x => x.type === 'base').map(x => x.id);
export const RARE_CARD_IDS = Object.values(CARDS).filter(x => x.type === 'rare').map(x => x.id);
export const FINALE_CARD_IDS = Object.values(CARDS).filter(x => x.type === 'finale').map(x => x.id);
