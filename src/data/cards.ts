import { Card, Choice, QueuedCard } from '../types/game';

function ch(label: string, hint: string, d: Record<string, number> | undefined, message: string, extra: Partial<Choice> = {}): Choice {
  return { label, hint, d, message, ...extra };
}

const q = (id: string, delay: number): QueuedCard => ({ id, delay });

export const CARDS: Record<string, Card> = {};

function addCard(id: string, type: Card['type'], who: string, emoji: string, title: string, body: string, choices: Choice[]) {
  CARDS[id] = { id, type, who, emoji, title, body, choices };
}

// ==================== BASE CARDS (KIẾP NẠN DỆT MAY & XNK) ====================

addCard('urgent', 'base', 'Buyer New York', '🇺🇸👔', 'Lab-dip lệch màu 0.02', 'Mr. David gửi email khẩn: "Màu Navy Blue này hơi nhiều ánh đỏ dưới ánh đèn D65. Nhuộm lại lab-dip lần 9 gửi DHL sang New York trước trưa mai nhé em."', [
  ch('Dạ vâng, em cho nhuộm test lại ngay!', 'Ép phòng lab làm xuyên đêm, bảo vệ uy tín với Buyer', { e: -2, b: 2, r: 1 }, 'Phòng lab thức trắng đêm. Mắt bạn thâm quầng như gấu trúc.', { queue: [q('lab_dip_follow', 3)] }),
  ch('Gửi phổ quang chứng minh đạt chuẩn', 'Giải thích dung sai màu Delta E < 0.5 là đạt chuẩn quốc tế', { e: -1, b: -1, r: -1 }, 'David nhắn lại: "You are tough." Bạn chưa biết đây là khen hay chuẩn bị huỷ đơn.', { queue: [q('lab_dip_negotiated', 3)] }),
  ch('Đổi bóng đèn phòng test màu', 'Canh bạc đổi đèn: Đổi từ D65 sang bóng đèn vàng dây tóc', {}, 'Bạn chụp ảnh mẫu dưới ánh đèn vàng ấm cúng.', {
    roll: {
      chance: 0.55,
      win: { d: { b: -2, r: 1 }, message: 'David xem ảnh gật đầu: "Perfect Navy!" Bạn vừa phát minh ra thuật thôi miên màu sắc.' },
      lose: { d: { r: -2, b: 2 }, message: 'David phát hiện bóng đèn vàng. Ông CC Giám đốc chuỗi cung ứng vào mắng te tua.' }
    }
  })
]);

addCard('cat_lai_cutoff', 'base', 'Đại lý Cảng Biển', '🚢⚓', 'Đua Cut-off Cảng Cát Lái', '16:15 chiều, cont 40HQ chứa 30.000 áo polo kẹt cứng ở chân cầu Phú Mỹ. Cut-off time hạ bãi của cảng Cát Lái là đúng 17:00!', [
  ch('Bơm "tiền bồi dưỡng" bác tài ép ga', 'Ủng hộ bác tài lách làn khẩn cấp vào cảng', { e: -2, b: -1, r: 1 }, 'Bác tài đạp ga như phim Fast & Furious. Cont vào bãi lúc 16:58!', { queue: [q('cat_lai_follow', 3)] }),
  ch('Cầu cứu hãng tàu gia hạn Closing Time', 'Hạ mình nài nỉ xin hãng tàu dời giờ cắt máng thêm 1 tiếng', { e: -1, r: -1 }, 'Nhân viên hãng tàu thở dài: "Chỉ lần này thôi đấy nhé."', { queue: [q('cat_lai_negotiated', 3)] }),
  ch('Cắm mắt ngồi khấn Tổ nghề Logistics', 'Canh bạc tâm linh: Cầu cho hệ thống quét mã vạch cảng bị lag', {}, 'Bạn thắp nén nhang muỗi cầu may.', {
    roll: {
      chance: 0.5,
      win: { d: { e: 1, b: -2, r: 1 }, message: 'Cổng cảng bị sập mạng 2 tiếng! Toàn bộ xe được gia hạn hạ bãi tự do.' },
      lose: { d: { e: -2, b: 3, r: -2 }, message: 'Trễ đúng 3 phút! Cont bị rớt tàu, phạt lưu bãi và nguy cơ đền hàng Air.' }
    }
  })
]);

addCard('fabric_inventory_leak', 'base', 'Chị Nga Kế Toán Kho', '📊🧮', 'Lệch tồn 500m vải Spandex', 'Chị Nga xách sổ cái đập bàn: "Kiểm kê định kỳ lệch 500 mét vải dệt kim Spandex giá 120k/m! Không tìm ra là Merchandiser bị trừ lương nhé!"', [
  ch('Lật tung từng xấp vải ở góc kho', 'Cùng thủ kho bới tìm trong đống vải vụn và phế liệu', { e: -2, b: -2 }, 'Bụi vải bám đầy phổi nhưng bạn tìm thấy cây vải bị giấu dưới tấm bạt rách.'),
  ch('Đổ lỗi cho độ co rút khi lưu kho', 'Giải thích vải thun để lâu ngày tự co rút và bay hơi', { e: 1, b: 2, r: -1 }, 'Chị Nga trố mắt: "Vải có phải cồn 90 độ đâu mà tự bay hơi?!"', { queue: [q('inventory_follow', 4)] }),
  ch('Xin bù bằng vải tồn kho đơn cũ', 'Đàm phán hoán đổi số liệu nội bộ', {}, 'Bạn lục sổ tìm mã vải tương đương.', {
    roll: {
      chance: 0.6,
      win: { d: { b: -2, r: 1 }, message: 'Sổ sách cân đối kỳ diệu. Chị Nga đóng mộc DUYỆT trong hoài nghi.' },
      lose: { d: { r: -2, b: 2 }, message: 'Kế toán trưởng phát hiện mã vải không khớp, lập biên bản kiểm điểm toàn phòng.' }
    }
  })
]);

addCard('techpack_inch_cm', 'base', 'Tổ Trưởng Rập Bàn Cắt', '📐✂️', 'Thảm họa Techpack Inch sang Cm', 'Thợ rập nhìn nhầm thông số vòng eo Techpack 32 Inch thành 32 Cm! Bàn cắt đã xén xong 2.000 cái quần đùi cho... người tí hon!', [
  ch('Cho may lót nới sườn cấp tốc', 'Chắp vá thêm vải sườn biến thành quần thun co giãn', { e: -3, b: -1 }, 'Quần mặc vào vừa vặn lạ kỳ. Bạn gọi đó là thiết kế "ôm sát Body".', { queue: [q('techpack_follow', 3)] }),
  ch('Nhận lỗi thành thật xin cắt lại', 'Hạ mình xin mua vải mới cắt lại, tốn chi phí nhưng chuẩn form', { e: -2, b: 2, r: 1 }, 'Sếp xót tiền nhưng khen bạn dũng cảm không giấu dốt.'),
  ch('Gạ khách đổi sang dòng đồ sơ sinh', 'Thuyết phục Buyer đây là dòng thời trang Baby cao cấp', {}, 'Bạn gửi email chào hàng bộ sưu tập mới.', {
    roll: {
      chance: 0.4,
      win: { d: { r: 2, b: -2 }, message: 'Buyer bật cười thích thú: "Ý tưởng táo bạo! Bọn tao mua luôn cho dòng Kids!"' },
      lose: { d: { r: -3, b: 3 }, message: 'Buyer đòi phạt hợp đồng và yêu cầu bồi thường tiền nhãn mác.' }
    }
  })
]);

addCard('air_freight_warning', 'base', 'Giám Đốc Xuất Khẩu', '✈️💸', 'Bóng ma đền hàng Air $25.000', 'Đơn hàng 20.000 áo hoodie bị trễ ngày On-board 3 ngày. Khách dọa: "Không lên kệ đúng Black Friday thì đền 25.000$ vé máy bay chở hàng!"', [
  ch('Huy động 3 xưởng may phụ tăng ca đêm', 'Thuê xưởng vệ tinh may phụ xuyên màn đêm', { e: -3, b: -2, r: 1 }, 'Tiếng máy may rào rào thâu đêm. Hàng kịp đóng thùng lúc rạng sáng.', { queue: [q('air_freight_follow', 3)] }),
  ch('Xin chuyển đi tàu nhanh (Fast Boat)', 'Thuyết phục khách đi tàu nhanh 11 ngày cập cảng Long Beach', { e: -1, b: -1, r: -1 }, 'Khách miễn cưỡng đồng ý nhưng bắt phạt 3.000$ tiền trễ hạn.', { queue: [q('air_freight_sea', 3)] }),
  ch('Thách khách huỷ đơn để ăn tiền cọc', 'Đòn tâm lý liều mạng: Khách huỷ đơn thì trắng tay', {}, 'Bạn khoanh tay nhìn thẳng vào camera Zoom.', {
    roll: {
      chance: 0.45,
      win: { d: { r: 2, b: -2 }, message: 'Khách rén vì sợ không có hàng bán Tết! Tự gia hạn ngày giao thêm 5 ngày.' },
      lose: { d: { r: -3, b: 3 }, message: 'Khách đập bàn huỷ L/C thật! Sếp tổng triệu tập cuộc họp sa thải khẩn cấp.' }
    }
  })
]);

addCard('buyer_aql_inspection', 'base', 'QC Buyer Quốc Tế', '🔍👀', 'Soi kính lúp AQL 2.5', 'QC của Buyer xách thước dây và bảng kiểm AQL bước vào kho thành phẩm. Ông soi từng mũi kim, độ lệch sườn 1mm và chỉ thừa gấu áo.', [
  ch('Cho đội đóng gói chạy theo cắt chỉ thừa', 'Cắt cử 10 công nhân cầm bấm chỉ đi sau lưng QC', { e: -2, b: -1, r: 1 }, 'Tay bấm chỉ thoăn thoắt, QC soi đến đâu thì sạch bóng đến đó.'),
  ch('Mời QC đi ăn trưa buffet hải sản', 'Ngoại giao ẩm thực làm mềm lòng thanh tra chất lượng', { e: 1, r: 1 }, 'QC ăn no cua biển, mắt mờ đi đôi chút khi đo độ đối xứng túi áo.'),
  ch('Tự tin để QC kiểm ngẫu nhiên 315 thùng', 'Canh bạc chất lượng chuyền may nhà', {}, 'QC rút dao rạch ngẫu nhiên 5 thùng giữa đống hàng.', {
    roll: {
      chance: 0.55,
      win: { d: { r: 2, b: -2 }, message: 'PASS AQL 2.5 xuất sắc! QC ký biên bản nghiệm thu mộc xanh lè.' },
      lose: { d: { r: -2, b: 2 }, message: 'Phát hiện vết dầu máy dính nách áo! Đơn hàng bị REJECT toàn bộ phải tái chế.' }
    }
  })
]);

addCard('sewing_line_strike', 'base', 'Tổ Trưởng Chuyền 3', '🧵⚡', 'Chuyền may đình công đòi tăng giá', 'Công nhân chuyền 3 đồng loạt tắt máy may: "Áo polo này may nẹp cổ đôi khó gấp ba lần, công ty không tăng 2.500đ/áo thì bọn em ngồi chơi!"', [
  ch('Đề xuất thưởng bánh mì sữa + tăng nhẹ 1k', 'Thỏa hiệp mềm dẻo tiếp tế đồ ăn ngọt cho công nhân', { e: -1, b: -1, r: 1 }, 'Bánh mì ngọt thơm lừng xoa dịu căng thẳng. Tiếng máy may lại rộn rã.'),
  ch('Báo cáo sếp dùng biện pháp kỷ luật', 'Cứng rắn với tổ sản xuất để giữ định mức chi phí', { b: 2, r: -1 }, 'Không khí xưởng may căng thẳng như dây đàn, tiến độ chậm 2 ngày.'),
  ch('Tự mình ngồi vào máy may nẹp mẫu', 'Thị phạm kỹ năng may nẹp thần sầu giải quyết vướng mắc', {}, 'Bạn xắn tay áo ngồi vào máy 1 kim.', {
    roll: {
      chance: 0.5,
      win: { d: { e: 1, r: 2, b: -2 }, message: 'Đường may đều tăm tắp! Cả chuyền vỗ tay thán phục Merchandiser đa tài.' },
      lose: { d: { e: -2, r: -1 }, message: 'Đứt chỉ 4 lần, gãy 2 cây kim. Tổ trưởng cười tủm tỉm thương hại.' }
    }
  })
]);

addCard('customs_red_lane', 'base', 'Chi Cục Hải Quan', '🛃🚨', 'Tờ khai dính Luồng Đỏ', 'Hệ thống VNACCS báo màu Đỏ chót! Hải quan cửa khẩu yêu cầu hạ container xuống bãi kiểm hóa, bốc dỡ 500 thùng carton để kiểm tra nhãn mác.', [
  ch('Hợp tác kéo hàng vào bãi kiểm hóa ngay', 'Cùng nhân viên hiện trường túc trực kiểm hóa đàng hoàng', { e: -2, b: 1, r: 1 }, 'Mồ hôi nhễ nhại giữa bãi cont trưa nắng, tờ khai được thông quan hợp lệ.', { queue: [q('red_lane_follow', 3)] }),
  ch('Nộp công văn giải trình xin luồng Vàng', 'Làm đơn xin sửa phân luồng vì hàng may mặc xuất khẩu FOB', { e: -1, b: -1 }, 'Hải quan ngâm công văn mất 4 tiếng, nhưng giữ được hàng trên xe.'),
  ch('Bốc ngẫu nhiên thùng mẫu đẹp nhất cho xem', 'Canh bạc kiểm hóa nhanh', {}, 'Hải quan chỉ tay vào một thùng hàng bất kỳ.', {
    roll: {
      chance: 0.6,
      win: { d: { b: -2, r: 1 }, message: 'Tem phụ đầy đủ, đường may chuẩn chỉnh. Cán bộ ký thông quan ngay tại chỗ.' },
      lose: { d: { r: -2, b: 2 }, message: 'Phát hiện nhãn ghi nhầm "100% Cotton" thành "Polyester"! Bị phạt hành chính vì sai mã HS.' }
    }
  })
]);

addCard('zipper_color_mismatch', 'base', 'Xưởng Nhuộm Phụ Liệu', '🟡🧥', 'Khóa kéo lệch tone màu', '10.000 con dây kéo YKK giao đến xưởng lại là màu vàng chanh, trong khi áo khoác là màu rêu quân đội trầm!', [
  ch('Cho gửi đi nhuộm hấp màu lại khẩn cấp', 'Đưa vào lò nhuộm hấp màu nhiệt cao', { e: -2, b: 1 }, 'Dây kéo ngả màu rêu 80%, tạm thời qua được mắt người thường.'),
  ch('Chào khách đây là "Phong cách tương phản"', 'Gửi mẫu thuyết trình phong cách thời trang Color Block', { r: -1, b: -1 }, 'Khách thấy kỳ dị nhưng chấp nhận chiết khấu 5% đơn hàng.'),
  ch('Tạt qua Chợ Tân Bình gom hàng tồn', 'Phóng xe máy ra chợ phụ liệu vét sạch sạp hàng', {}, 'Bạn lao xe máy ra chợ Tân Bình.', {
    roll: {
      chance: 0.55,
      win: { d: { e: -1, b: -2, r: 1 }, message: 'Gom đủ 10.000 con dây kéo đúng mã màu từ 4 sạp khác nhau! Cứu nguy ngoạn mục.' },
      lose: { d: { e: -2, b: 2, r: -2 }, message: 'Dây kéo mua ngoài chợ bị kẹt răng và gãy khóa khi tra vào áo. Khách phát hiện.' }
    }
  })
]);

addCard('consumption_deficit', 'base', 'Bàn Cắt Vải', '✂️📉', 'Hụt định mức bàn cắt', 'Thợ giác sơ đồ tính thiếu 3% hao hụt đầu cây. Cắt đến 800 cái áo cuối cùng thì kho báo: "Hết sạch vải chính!"', [
  ch('Tận dụng mép vải vụn ghép chi tiết', 'Tận dụng vải đầu thừa đuôi thẹo may chi tiết lót trong', { e: -2, b: -1, r: 1 }, 'Đầu óc tính toán siêu việt ghép vừa khít từng mảnh áo.'),
  ch('Báo khách hụt sản lượng xuất 5%', 'Khai báo dung sai hợp đồng cho phép xuất thiếu ±5%', { e: -1, r: -1 }, 'Khách càu nhàu nhưng điều khoản hợp đồng bảo vệ bạn.'),
  ch('Bắt xưởng nhuộm dệt bù vải thần tốc', 'Ép nhà máy dệt chạy bù 300 mét vải trong 24h', {}, 'Bạn gọi điện réo xưởng dệt liên hồi.', {
    roll: {
      chance: 0.5,
      win: { d: { b: -2, e: 1 }, message: 'Xưởng dệt nể mặt giao bù vải ngay trong đêm. Đơn hàng hoàn tất nguyên vẹn.' },
      lose: { d: { b: 2, r: -1 }, message: 'Vải dệt vội bị lệch ánh màu so với lô trước, không thể may chung lô.' }
    }
  })
]);

addCard('washing_shrinkage', 'base', 'Phòng Giặt Test Lab', '🫧👕', 'Áo giặt xong co rút 15%', 'Sau mẻ giặt Wash Test mẫu tại phòng thí nghiệm, chiếc áo phông size L co rút lại vừa vặn cho... học sinh lớp 3!', [
  ch('Cho ủi kéo giãn định hình lại trên form', 'Dùng máy ủi hơi nước công nghiệp kéo giãn thông số', { e: -2, b: -1 }, 'Áo dài ra được 3cm, may mắn lọt vào ngưỡng dung sai cho phép.'),
  ch('Sửa bảng thông số thành "Form Ôm Slim-fit"', 'Biến nhược điểm thành tính năng thời trang cao cấp', { r: 1, b: 1 }, 'Marketing Buyer duyệt luôn chiến dịch "Slim-fit quyến rũ tôn dáng".'),
  ch('Test lại bằng chế độ giặt nước lạnh 20°C', 'Canh bạc quy trình giặt mẫu', {}, 'Bạn tự tay cài lại máy giặt phòng lab.', {
    roll: {
      chance: 0.65,
      win: { d: { b: -2, r: 1 }, message: 'Độ co rút chỉ còn 2.5%! Đạt chuẩn xuất khẩu vào thị trường EU.' },
      lose: { d: { e: -1, b: 2, r: -2 }, message: 'Áo không những co mà còn xù lông vón cục. Phòng lab lắc đầu ngao ngán.' }
    }
  })
]);

addCard('price_bargain_bangladesh', 'base', 'Phòng Thu Mua Buyer', '📉💼', 'Khách ép giảm giá 12 Cent', 'Buyer nhắn tin: "Bên nhà máy Bangladesh chào giá CMT rẻ hơn em 12 cent/áo. Không giảm giá thì hợp đồng 50.000 cái này chuyển sang Nam Á nhé."', [
  ch('Phân tích chi phí chất lượng và tốc độ', 'Chứng minh nhà máy Việt Nam giao hàng nhanh hơn 15 ngày', { e: -2, r: 2 }, 'Buyer công nhận hàng Việt Nam đường kim mũi chỉ xịn hơn, giữ nguyên giá!'),
  ch('Cắn răng giảm 6 cent, bớt phụ liệu lót', 'Bớt chút đường viền gân cổ áo để bù trừ chi phí', { e: -1, b: 1 }, 'Giữ được đơn hàng nhưng biên lợi nhuận mỏng như tờ giấy A4.'),
  ch('Chào thêm mẫu thiết kế độc quyền mới', 'Đổi thế cờ bằng sự sáng tạo', {}, 'Bạn rút ra 3 mẫu thiết kế mới chuẩn bị sẵn.', {
    roll: {
      chance: 0.55,
      win: { d: { e: 1, r: 2, b: -1 }, message: 'Buyer mê mẩn mẫu mới! Đặt thêm 20.000 cái với đơn giá cao hơn.' },
      lose: { d: { r: -1, b: 2 }, message: 'Buyer bảo mẫu xấu, vẫn khăng khăng đòi hạ giá 12 cent mới ký.' }
    }
  })
]);

addCard('roll_booking_nightmare', 'base', 'Hãng Tàu Ngoại Quốc', '🚢📦', 'Hãng tàu huỷ booking phút chót', 'Hãng tàu gửi thông báo lạnh lùng: "Tàu bỏ ghé cảng (Blank sailing), container của bạn bị Roll booking sang chuyến tuần sau."', [
  ch('Chạy đôn đáo mua slot của Forwarder khác', 'Chấp nhận trả chênh lệch cước lấy chỗ tàu gấp', { e: -2, b: -1, r: 1 }, 'Tìm được chỗ trên tàu Maersk khởi hành sáng mai. Hú hồn!'),
  ch('Thông báo khách xin lùi ngày ETD', 'Giải thích nguyên nhân bất khả kháng do thời tiết biển', { e: -1, r: -1 }, 'Khách thông cảm nhưng ghi vào sổ theo dõi KPI giao hàng.'),
  ch('Trực tiếp lên văn phòng hãng tàu làm loạn', 'Canh bạc tạo áp lực lên bộ phận Booking', {}, 'Bạn đến tận văn phòng hãng tàu gõ bàn.', {
    roll: {
      chance: 0.5,
      win: { d: { r: 1, b: -2 }, message: 'Trưởng phòng hãng tàu nhượng lại 1 slot huỷ của khách khác cho bạn!' },
      lose: { d: { e: -2, r: -1 }, message: 'Bảo vệ mời bạn ra ngoài. Cont vẫn nằm dài ở bãi chờ tuần sau.' }
    }
  })
]);

addCard('sample_room_overtime', 'base', 'Chị Bảy Phòng Mẫu', '📐👗', 'Phòng mẫu đình công kéo sắt', 'Chị Bảy rập gõ cây kéo sắt 3 tạ xuống bàn: "1 ngày bắt may 8 cái áo Proto mẫu gửi đi Đức, tụi bay coi tao là máy khâu tự động à?!"', [
  ch('Mua trà sữa trân châu full topping dỗ dành', 'Chiến thuật ngọt ngào xoa dịu đôi bàn tay vàng của chị Bảy', { e: 1, b: -1, r: 1 }, 'Chị Bảy hút rột rột ly trà sữa, cười tươi: "Thôi để tao ráng may cho mày."', { queue: [q('sample_follow', 3)] }),
  ch('Tự mình ngồi ráp phụ đường may sườn', 'San sẻ công việc may vá cùng các thợ rập', { e: -2, b: -2 }, 'Mũi may của bạn hơi xiêu vẹo nhưng tinh thần đồng đội lên cao vút.'),
  ch('Thương lượng cắt giảm 3 mẫu không cần thiết', 'Canh bạc sàng lọc mẫu', {}, 'Bạn xem lại danh sách yêu cầu của khách.', {
    roll: {
      chance: 0.6,
      win: { d: { b: -2, r: 1 }, message: 'Khách đồng ý chỉ cần 5 mẫu cốt lõi. Chị Bảy vui vẻ hoàn thành sớm.' },
      lose: { d: { r: -2, b: 2 }, message: 'Khách đòi đủ cả 8 mẫu không thiếu cái nào. Chị Bảy giận dỗi nghỉ ngang.' }
    }
  })
]);

addCard('tan_binh_salvation', 'base', 'Chợ Phụ Liệu Tân Bình', '🛵🧵', 'Chuyến xe cứu net chợ Tân Bình', 'Kiểm đếm phụ liệu phát hiện thiếu 400 cái cúc bấm dập logo cho lô áo gió xuất Hàn. 1 tiếng nữa xe cont đến lấy hàng!', [
  ch('Lái xe máy phóng bạt mạng ra chợ Tân Bình', 'Chạy đua với thời gian săn lùng cúc bấm', { e: -2, b: -2, r: 1 }, 'Lạng lách qua các hẻm vải, bạn tìm đúng sạp bán mẫu cúc bấm giống hệt.', { queue: [q('tan_binh_follow', 3)] }),
  ch('Bấm cúc trơn không logo thay thế', 'Dùng cúc trơn có sẵn trong kho, hy vọng khách không để ý', { e: -1, r: -1 }, 'Hàng đóng xong kịp giờ xe cont, nhưng lòng bạn bất an lo lắng.'),
  ch('Thử dùng máy khắc laser khắc logo lên cúc trơn', 'Giải pháp công nghệ tại chỗ', {}, 'Bạn đưa cúc trơn vào máy khắc laser thử việc.', {
    roll: {
      chance: 0.45,
      win: { d: { e: 1, b: -2, r: 2 }, message: 'Khắc sắc nét như hàng chính hãng YKK! QC soi cũng không nhận ra.' },
      lose: { d: { e: -2, b: 2, r: -1 }, message: 'Cúc bị cháy xém khét lẹt. Không thể sử dụng được.' }
    }
  })
]);

addCard('interlining_bubble', 'base', 'Máy Ép Keo Băng Chuyền', '♨️👔', 'Keo ép cổ áo bị rộp bọt khí', 'Toàn bộ 1.500 cổ áo sơ mi sau khi qua máy ép keo dán dựng (interlining) bị phồng rộp lấm tấm như bánh tráng nướng!', [
  ch('Chỉnh lại nhiệt độ và áp suất máy ép lại', 'Tăng áp lực trục lăn đè bẹp bọt khí', { e: -2, b: -1 }, 'Nhiệt độ chuẩn 140°C ép phẳng lỳ mọi nếp nhăn. Cổ áo đứng form đẹp mắt.'),
  ch('Đổi loại keo dệt thoi cao cấp hơn', 'Thay nguyên liệu keo ép chất lượng cao', { e: -1, b: 1, r: 1 }, 'Tốn thêm ít chi phí nhưng chất lượng hoàn hảo không tì vết.'),
  ch('Ủi thủ công từng chiếc cổ áo bằng bàn là hơi', 'Canh bạc kiên trì', {}, 'Bạn cùng 3 công nhân cầm bàn là tay.', {
    roll: {
      chance: 0.55,
      win: { d: { e: -2, b: -2, r: 1 }, message: 'Khéo ăn khéo co, 1.500 cổ áo phẳng phiu xuất xưởng đúng giờ.' },
      lose: { d: { e: -3, b: 2 }, message: 'Vải bị bóng cháy xém một mảng lớn. Phải thay vải cắt lại toàn bộ cổ.' }
    }
  })
]);

addCard('audit_social_compliance', 'base', 'Đoàn Audit Trách Nhiệm Xã Hội', '📋🏢', 'Thanh tra trách nhiệm xã hội bất ngờ', 'Đoàn kiểm toán quốc tế (Wrap / BSCI) bước vào cổng nhà máy. Họ đòi kiểm tra bảng chấm công, lối thoát hiểm và phỏng vấn ngẫu nhiên công nhân!', [
  ch('Đưa đoàn đi tham quan căn tin và trạm y tế', 'Ngoại giao thiện chí, phô diễn các điểm mạnh phúc lợi', { e: -2, r: 2 }, 'Đoàn audit khen ngợi suất cơm công nhân có sữa chua tráng miệng! Đạt chuẩn Green.'),
  ch('Hướng dẫn công nhân trả lời đúng quy chuẩn', 'Nhắc nhở công nhân không khai tăng ca quá 40 giờ/tháng', { e: -1, b: -1 }, 'Các anh chị công nhân trả lời trơn tru như học sinh thuộc bài.'),
  ch('Để đoàn audit phỏng vấn tự do không can thiệp', 'Canh bạc minh bạch', {}, 'Auditor chọn ngẫu nhiên một bác phụ việc lớn tuổi.', {
    roll: {
      chance: 0.5,
      win: { d: { r: 2, b: -1 }, message: 'Bác khen công ty cấp đồ bảo hộ chu đáo! Nhà máy đạt chứng chỉ Gold.' },
      lose: { d: { r: -3, b: 2 }, message: 'Bác khai thật: "Tối qua tôi mới tăng ca tới 2h sáng." Nhà máy bị dính lỗi Minor!' }
    }
  })
]);

addCard('boba_mer_fuel', 'base', 'Team Merchandiser', '🧋⚡', 'Trà sữa cứu rỗi Merchandiser', '15:00 chiều, cả phòng mắt lờ đờ, màn hình Excel nhảy nhót lung tung. Ai đó hô to: "Ghé app đặt trà sữa 70% đường 100% đá đi anh em ơi!"', [
  ch('Đứng ra ứng tiền bao cả phòng 1 chầu', 'Làm thiên thần của cả phòng xuất nhập khẩu', { e: 2, r: 1, b: 1 }, 'Đường huyết tăng vọt, cả phòng gõ phím như gảy đàn tranh.', { queue: [q('boba_mer_follow', 3)] }),
  ch('Uống cà phê đen đá không đường tự pha', 'Giữ vững kỷ luật tài chính, tỉnh táo bằng vị đắng cuộc đời', { e: 1, b: -1 }, 'Vị đắng cà phê ngấm vào tim nhắc bạn về deadline sắp tới.'),
  ch('Gạ sếp thanh toán bằng quỹ tiếp khách ngoại', 'Canh bạc tài chính nội bộ', {}, 'Bạn gửi link thanh toán vào Zalo của sếp.', {
    roll: {
      chance: 0.5,
      win: { d: { e: 3, r: 1 }, message: 'Sếp duyệt chi ngay: "Uống đi rồi tăng ca xuất cho xong cont hàng!"' },
      lose: { d: { r: -1, b: 1 }, message: 'Sếp nhắn lại: "Tồn kho chưa giải quyết xong mà sữa với chả trà?"' }
    }
  })
]);

// ==================== CALLBACK CARDS (HỆ QUẢ CỦA CÁC QUYẾT ĐỊNH) ====================

addCard('lab_dip_follow', 'callback', 'Buyer New York', '🇺🇸✨', 'Hồi âm Lab-dip lần 9', 'David gửi email sau khi soi mẫu lab-dip bạn thức trắng đêm nhuộm: "This is exactly what we need!"', [
  ch('Bắt tay chốt đơn vải chính thức', 'Lập tức ký hợp đồng dệt 30.000 mét vải chính', { e: -1, b: -2, r: 2 }, 'Đơn hàng vào guồng sản xuất trơn tru.'),
  ch('Xin tạm ứng 30% tiền cọc vải', 'Tăng cường dòng tiền cho công ty', { r: 1, b: -1 }, 'Khách chuyển tiền cọc ngay trong ngày.')
]);

addCard('lab_dip_negotiated', 'callback', 'Buyer New York', '🇺🇸📉', 'Cái giá của ranh giới màu sắc', 'David đồng ý nhận màu cũ với điều kiện: "Phải chiết khấu 1.5% trên tổng giá trị FOB đơn hàng."', [
  ch('Chấp nhận chiết khấu để giữ hòa khí', 'Bớt chút lợi nhuận để xuất hàng êm đẹp', { e: -1, b: -2, r: 1 }, 'Hợp đồng được ký kết, giữ chân khách hàng lớn.'),
  ch('Bù đắp bằng việc tặng kèm 200 túi tote', 'Dùng phụ kiện khuyến mãi thay vì giảm tiền mặt', { e: -1, r: 1 }, 'Khách thích thú với quà tặng kèm mang đậm tính thương hiệu.')
]);

addCard('cat_lai_follow', 'callback', 'Tài Xế Xe Đầu Kéo', '🚛💨', 'Hạ bãi phút 89', 'Bác tài xe cont gọi điện: "Hạ bãi Cát Lái xong lúc 16:59:30 giây nhé em! Tàu đang cẩu cont lên boong rồi!"', [
  ch('Thưởng nóng bác tài 500k', 'Biết ơn người hùng xa lộ đã cứu mạng đơn hàng', { e: 1, r: 1 }, 'Bác tài hứa lần sau có cont gấp cứ gọi bác!'),
  ch('Nộp chứng từ hải quan lên hệ thống', 'Hoàn tất thủ tục xuất khẩu điện tử', { e: -1, b: -2 }, 'B/L đã được phát hành, thở phào nhẹ nhõm.')
]);

addCard('cat_lai_negotiated', 'callback', 'Hãng Tàu Cát Lái', '⚓🎫', 'Hậu quả xin dời giờ Closing', 'Hãng tàu gửi giấy báo phí gia hạn hạ bãi muộn (Late CY fee) trị giá 1.200.000đ.', [
  ch('Ký duyệt thanh toán nhanh gọn', 'Chi phí nhỏ cứu nguy cho đơn hàng lớn', { e: -1, b: -1 }, 'Mọi thủ tục êm đẹp, cont lên tàu an toàn.'),
  ch('Kẹp biên bản giải trình kẹt xe', 'Chứng minh bất khả kháng để xin miễn giảm phí', { e: -1, r: 1 }, 'Hãng tàu duyệt miễn 50% phí hỗ trợ.')
]);

addCard('inventory_follow', 'callback', 'Kế Toán Trưởng', '📊💼', 'Đại hội giải trình tồn kho', 'Kế toán trưởng mở cuộc họp liên phòng ban: "Vải Spandex không thể tự bay hơi được, Merchandiser giải trình thế nào?"', [
  ch('Trình biên bản kiểm tra tỷ lệ hao hụt bàn cắt', 'Chứng minh số liệu hao hụt thực tế có căn cứ', { e: -2, b: -2, r: 1 }, 'Kế toán gật đầu chấp thuận điều chỉnh định mức kỹ thuật.'),
  ch('Đề xuất trích quỹ dự phòng rủi ro', 'Giải quyết êm thấm theo quy chế tài chính', { b: -1, r: -1 }, 'Sổ sách được đóng lại, nhưng bạn bị ghi nhớ trong danh sách soi.')
]);

addCard('air_freight_follow', 'callback', 'Bộ Phận Logistics Hãng', '✈️📦', 'Đơn hàng cất cánh an toàn', 'Chuyến bay chở hàng xuất khẩu đã hạ cánh an toàn tại sân bay JFK New York đúng hạn trưng bày!', [
  ch('Chia sẻ niềm vui cùng cả team may', 'Tuyên dương tinh thần tăng ca bền bỉ', { e: 2, r: 2 }, 'Cả phòng mở tiệc ăn mừng chiến thắng nghẹt thở.'),
  ch('Đúc kết bài học quản lý tiến độ', 'Lập quy trình kiểm soát mốc thời gian (Time & Action)', { e: -1, b: -2 }, 'Từ nay các đơn hàng sau không còn lo trễ hạn.')
]);

addCard('air_freight_sea', 'callback', 'Buyer New York', '🚢🏷️', 'Tàu nhanh cập bến Long Beach', 'Tàu nhanh cập cảng sớm hơn dự kiến 2 ngày, khách hàng kịp phân phối hàng về các trung tâm thương mại!', [
  ch('Khách hàng gửi thư cảm ơn và đặt thêm đơn mới', 'Uy tín phục hồi mạnh mẽ sau sóng gió', { r: 2, b: -1 }, 'Đơn hàng mùa Xuân Hè trị giá 200.000$ được giao cho bạn.'),
  ch('Tự thưởng cho bản thân 1 giấc ngủ trọn vẹn', 'Hồi phục sinh lực sau chuỗi ngày căng thẳng', { e: 3 }, 'Giấc ngủ ngon lành không mộng mị về container.')
]);

addCard('tan_binh_follow', 'callback', 'Phòng Kiểm Nghiệm Muối', '🧪🧂', 'Cúc áo chợ Tân Bình lên tiếng', 'Khách hàng lấy mẫu áo gửi viện kiểm nghiệm thử độ bền kéo và phun sương muối chống rỉ sét!', [
  ch('Hồi hộp chờ kết quả phân tích kim loại', 'Cầu trời khấn phật cho cúc đạt chuẩn Lead-free', {}, 'Bản kết quả kiểm nghiệm hiện lên.', {
    roll: {
      chance: 0.6,
      win: { d: { r: 2, b: -2 }, message: 'Hàm lượng chì và độ bền muối PASS 100%! Cúc chợ Tân Bình chất lượng quốc tế.' },
      lose: { d: { r: -2, b: 2 }, message: 'Cúc bị sùi bọt rỉ sét! Phải cử công nhân sang Mỹ dập lại cúc tại kho khách.' }
    }
  }),
  ch('Chủ động báo khách xin test mẫu mới', 'Đón đầu rủi ro bằng sự minh bạch', { e: -1, r: 1 }, 'Khách đánh giá cao tinh thần trách nhiệm.')
]);

addCard('red_lane_follow', 'callback', 'Đội Kiểm Hóa Cửa Khẩu', '🛃📦', 'Biên bản kiểm tra thực tế hàng', 'Hải quan đã kiểm tra xong 500 thùng carton hàng may mặc xuất khẩu.', [
  ch('Bấm seal mới và hoàn thành thủ tục', 'Niêm phong kẹp chì mới của hải quan', { e: -1, b: -2, r: 1 }, 'Tờ khai thông quan chính thức, xe cont lăn bánh lên tàu.'),
  ch('Ký biên bản xác nhận sai sót nhỏ nhãn mác', 'Nộp phạt hành chính khắc phục tại chỗ', { e: -1, b: -1 }, 'Mọi thứ giải quyết êm đẹp trong buổi chiều.')
]);

addCard('techpack_follow', 'callback', 'Cửa Hàng Thú Cưng', '🐶🩳', 'Bộ sưu tập quần đùi Corgi', '2.000 cái quần người tí hon cắt nhầm thông số được một chuỗi cửa hàng thú cưng mua sạch với giá cao!', [
  ch('Thu hồi toàn bộ tiền vải và có lãi', 'Biến thảm họa cắt nhầm thành cơ hội kinh doanh', { e: 1, b: -2, r: 2 }, 'Sếp tổng cười tít mắt: "Em quả là thiên tài xoay chuyển tình thế!"'),
  ch('Tặng cho nhân viên công ty nuôi mèo', 'Lan tỏa tình yêu thương động vật trong văn phòng', { r: 2 }, 'Văn phòng ngập tràn ảnh chó mèo mặc quần đùi thời thượng.')
]);

addCard('sample_follow', 'callback', 'Mr. David Buyer', '👗✨', 'Mẫu Proto làm say lòng nước Đức', 'Khách hàng Đức gửi video đập hộp mẫu áo khoác chị Bảy may: "May quá chuẩn, mũi chỉ sắc sảo như hàng may đo Savile Row!"', [
  ch('Mua tặng chị Bảy phòng mẫu hộp yến sào', 'Tri ân nghệ nhân may mẫu cứu tinh của cty', { e: 1, r: 2 }, 'Chị Bảy xúc động hứa: "Lần sau có mẫu khó cứ mang qua chị!"'),
  ch('Nhận đơn hàng sản xuất đại trà 50.000 cái', 'Gặt hái quả ngọt từ mẫu thử hoàn hảo', { b: 2, r: 2 }, 'Nhà máy kín chuyền may suốt cả quý 4.')
]);

addCard('boba_mer_follow', 'callback', 'Màn Hình Báo Cáo', '🧋💡', 'Cú lóe sáng lúc 16:30', 'Nhờ năng lượng trà sữa, bạn chợt phát hiện ra thợ rập quên cộng 2cm đường may gấu áo trong file gửi xưởng dệt!', [
  ch('Chặn đứng bàn cắt kịp thời trước khi bấm nút', 'Cứu công ty bàn thua trị giá 500 triệu tiền vải', { e: 2, b: -3, r: 2 }, 'Sếp tổng khen ngợi trước toàn thể công ty: "Trà sữa này đáng đồng tiền bát gạo!"'),
  ch('Lặng lẽ gọi điện nhắc thợ sửa file', 'Giải quyết vấn đề trong im lặng giữ thể diện cho thợ', { e: -1, b: -2, r: 1 }, 'Thợ rập nể phục và mang ơn bạn suốt đời.')
]);

// ==================== CRISIS CARDS (KHỦNG HOẢNG SINH TỬ) ====================

addCard('energy_crisis', 'crisis', 'Cơ Thể Merchandiser', '😵🪫', 'Sập nguồn sau 3 đêm canh chuyền', 'Năng lượng chạm đáy. Bạn nhìn cuộn vải thun mà ngỡ là chiếc gối êm ái nhất trần đời, hai mắt díp lại không thể mở nổi.', [
  ch('Ngủ gục 20 phút trên xấp vải mẫu', 'Chợp mắt khẩn cấp phục hồi chút sinh lực', { e: 3, b: 1 }, 'Mùi vải mộc vỗ về giấc ngủ ngắn ngủi của bạn.'),
  ch('Nốc cạn lon bò húc thứ 4 làm tiếp', 'Cưỡng ép cơ thể chạy nốt bảng kê Packing List', { e: -2, b: -2 }, 'Tim đập thình thịch như tiếng máy dập nút. Rất nguy hiểm!')
]);

addCard('backlog_crisis', 'crisis', 'Hòm Thư Outlook & Hóa Đơn', '🧨📨', 'Bão Deadline đè bẹp Merchandiser', '10 đơn hàng xuất khẩu cùng lúc réo đòi ngày giao, hóa đơn phụ liệu trễ hạn, hãng tàu đòi số seal cont chất cao như núi.', [
  ch('Họp khẩn xin gia hạn các đơn nhỏ', 'Tập trung dồn toàn lực cứu các đơn hàng lớn trước', { e: -2, b: -3, r: -1 }, 'Cắt bớt việc râu ria, giải phóng hơi thở cho bản thân.'),
  ch('Ủy quyền bớt cho thực tập sinh phụ việc', 'Chia việc nhập số liệu cho cấp dưới', { b: -2, r: -1 }, 'Bớt việc nhưng phải lo thót tim canh chừng các em nhập sai.'),
  ch('Cầu cứu sếp tổng can thiệp lùi ngày giao', 'Đòn tối hậu giải cứu', {}, 'Bạn bước vào phòng sếp tổng.', {
    roll: {
      chance: 0.5,
      win: { d: { b: -3, r: 1 }, message: 'Sếp đích thân gọi điện cho đối tác xin hoãn 3 ngày thành công!' },
      lose: { d: { b: 2, r: -2 }, message: 'Sếp mắng một trận vì để việc ứ đọng và bắt tự chịu trách nhiệm.' }
    }
  })
]);

addCard('rep_crisis', 'crisis', 'Thị Trường Dệt May', '📣📉', 'Nguy cơ bị Buyer Blacklist', 'Tin đồn nhà máy của bạn làm ăn chậm trễ, trễ hẹn liên miên đang lan truyền giữa các văn phòng đại diện Buyer quốc tế.', [
  ch('Tự tay kiểm tra và đóng dấu bảo đảm từng thùng', 'Lấy chất lượng thực tế đập tan mọi lời đồn thất thiệt', { e: -2, r: 2 }, 'Khách hàng nhận hàng đẹp không tì vết, tin đồn tự tan biến.'),
  ch('Mời đại diện Buyer đến dự tiệc tất niên nhà máy', 'Ngoại giao gắn kết tình thân bằng rượu vang và quà quê', { e: 1, r: 1, b: 1 }, 'Tình cảm thắt chặt, Buyer ký cam kết đồng hành lâu dài.')
]);

// ==================== RARE CARDS (SỰ KIỆN KỲ THÚ) ====================

addCard('dev_begging', 'rare', 'Dev Game Đói Lả', '🧑‍💻🧋', 'Bẻ gãy bức tường thứ tư', 'Một lập trình viên phờ phạc hiện lên: "Ê sốp ơi, tui thức đến 3h sáng code toàn bộ thuật ngữ ngành Dệt May & Xuất Nhập Khẩu này, đói lả rồi... Khiều nhẹ ly trà sữa hay cốc nước mía tiếp tế dev được hong?"', [
  ch('Tiếp tế cốc nước mía 10k', 'Ủng hộ cốc nước mía giải cứu thể xác dev', { e: 1, r: 1 }, 'Dev mừng rơi nước mắt: "Đa tạ đại hiệp! Xin hồi cho bạn 1 Năng lượng và 1 Uy tín tâm linh!"'),
  ch('Bắn tim ủng hộ tinh thần', 'Tình cảm dạt dào, nghèo tiền nhưng giàu lòng', { r: 1 }, 'Dev rơm rớm: "Chúc sốp không bao giờ bị rớt tàu Cát Lái hay đền hàng Air!"'),
  ch('Dí deadline ngược: "Thêm 10 thẻ nữa!"', 'Bắt dev tăng ca cày thêm tính năng', { b: -1 }, 'Dev sợ hãi quay về gõ phím: "Dạ dạ em làm liền, em dọn bớt 1 việc tồn cho sốp tha cho em!"')
]);

addCard('godfather_cutter', 'rare', 'Bác Ba Thợ Cắt Lão Thành', '✂️👴', 'Bàn tay vàng làng giác sơ đồ', 'Bác Ba 35 năm cầm kéo bước vào xưởng. Bác nhìn sơ đồ máy tính lắc đầu, tự tay cầm phấn vẽ lại sơ đồ cắt bằng mắt thường.', [
  ch('Để bác Ba tự do trổ tài nghệ', 'Tin tưởng tuyệt đối vào kinh nghiệm lão làng', {}, 'Bác Ba hạ kéo thoăn thoắt.', {
    roll: {
      chance: 0.85,
      win: { d: { b: -3, r: 2 }, message: 'Tiết kiệm được hẳn 350 mét vải chính! Định mức tiêu hao giảm kỷ lục.' },
      lose: { d: { b: 1 }, message: 'Bác cắt lẹm mất 2 mép vải áo, nhưng vẫn xử lý gọn gàng.' }
    }
  }),
  ch('Mời bác ly trà đặc và biếu tút thuốc lá', 'Tôn trọng bậc tiền bối ngành may', { e: 1, r: 1 }, 'Bác Ba vui vẻ chia sẻ bí kíp nhìn thấu chiều tuyết sợi vải.')
]);

addCard('container_miracle', 'rare', 'Hãng Tàu Viễn Dương', '📦✨', 'Vỏ container từ trên trời rơi xuống', 'Giữa cơn khủng hoảng khan hiếm vỏ container rỗng toàn cầu, một chiếc cont 40HQ sạch bong kin kít bất ngờ được phân cho bạn mà không mất phí bôi trơn!', [
  ch('Đóng hàng ngay trước khi hãng tàu đổi ý', 'Hối hả chất 600 thùng hàng vào cont ngay lập tức', { e: -1, b: -3, r: 1 }, 'Container lăn bánh ra cảng trong ánh mắt thèm thuồng của các công ty bên cạnh.'),
  ch('Bán lại vỏ cont cho công ty hàng xóm', 'Kiếm món hời chênh lệch bất ngờ', { e: 2, r: -1 }, 'Ví rủng rỉnh tiền nhưng phải chạy đôn đáo tìm cont khác thay thế.')
]);

// ==================== FINALE CARDS (17:59 PHÚT CHÓT MỖI NGÀY) ====================

addCard('end_cat_lai', 'finale', 'Bác Tài Xe Cont', '🚛🌇', '17:59 — "Em ơi, cont đã hạ bãi an toàn!"', 'Đúng lúc bạn thu dọn đồ chuẩn bị ra về, điện thoại rung lên: "Cont hàng FOB của em đã vào bãi Cát Lái, số seal nguyên vẹn!"', [
  ch('Tắt máy tính, nhẹ nhõm tan ca về nhà', 'Kết thúc một ngày chiến đấu kiên cường', { e: 1, b: -1 }, 'Bạn hòa vào dòng người tan tầm với nụ cười chiến thắng trên môi.'),
  ch('Gửi email xác nhận B/L cho khách trước khi về', 'Sự chu đáo chuyên nghiệp đến phút cuối cùng', { e: -1, b: -2, r: 1 }, 'Khách bên kia bán cầu khen ngợi tinh thần trách nhiệm tuyệt vời.')
]);

addCard('end_buyer_zoom', 'finale', 'Buyer New York', '💻🇺🇸', '17:59 — Mr. David mở cuộc gọi Zoom', 'Vừa với tay lấy áo khoác thì màn hình laptop hiện thông báo Zoom Call từ New York: "Quick sync 5 minutes about Spring order!"', [
  ch('Ngồi lại nghe máy 10 phút chốt deal', 'Chớp lấy cơ hội đơn hàng mới cho công ty', { e: -2, b: -1, r: 2 }, 'David chốt luôn đơn hàng áo len mùa thu trị giá 80.000$!'),
  ch('Lịch sự hẹn lại sáng mai trả lời email', 'Bảo vệ ranh giới tan ca sau một ngày dài', { e: 1, r: -1 }, 'David tiếc nuối nhưng bạn được về nhà ăn cơm tối cùng gia đình.')
]);

addCard('end_warehouse_lock', 'finale', 'Bác Bảo Vệ Kho', '🔑🌙', '17:59 — Bác bảo vệ chuẩn bị khóa xưởng', 'Bác bảo vệ xách chùm chìa khóa to đùng: "Mấy đứa Merchandiser còn ai ở lại đếm vải không để bác khóa cửa kéo cầu dao?"', [
  ch('Thu dọn thước dây, chào bác về thôi', 'Cất đồ nghề, giải phóng bản thân khỏi xưởng may', { e: 1, b: -1 }, 'Tiếng ổ khóa lách cách khóa lại một ngày làm việc đầy cam go.'),
  ch('Ráng ở lại 15 phút dán nhãn nốt kệ phụ liệu', 'Chuẩn bị chu đáo cho ca làm việc sáng mai', { e: -1, b: -2, r: 1 }, 'Kho phụ liệu ngăn nắp sạch sẽ, sẵn sàng cho ngày mới.')
]);

addCard('end_qc_seal', 'finale', 'Trưởng Phòng QA/QC', '🏷️🔒', '17:59 — Bấm chì niêm phong xuất xưởng', 'Chiếc kẹp chì (Seal) kim loại cuối cùng kêu cái "tách". Lô hàng 40.000 cái áo jacket chính thức hoàn tất thủ tục xuất xưởng!', [
  ch('Ký biên bản bàn giao thành phẩm', 'Đặt dấu chấm hoàn hảo cho một ngày cày cuốc', { e: 1, b: -2, r: 1 }, 'Chiếc xe container từ từ lăn bánh ra cổng nhà máy trong hoàng hôn.'),
  ch('Chụp tấm ảnh kỷ niệm cùng anh em tổ đóng gói', 'Ghi lại khoảnh khắc gắn kết của những người thầm lặng', { e: 2, r: 1 }, 'Bức ảnh ngập tràn nụ cười rạng rỡ của những người thợ may áo cho đời.')
]);

export const REGULAR_CARD_IDS = Object.values(CARDS).filter(x => x.type === 'base').map(x => x.id);
export const RARE_CARD_IDS = Object.values(CARDS).filter(x => x.type === 'rare').map(x => x.id);
export const FINALE_CARD_IDS = Object.values(CARDS).filter(x => x.type === 'finale').map(x => x.id);
