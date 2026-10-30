import { Workstation } from '../3d/OfficeStage';

export interface OrderStepDef {
  stepId: string;
  stepName: string;
  targetStation: Workstation['type'];
  targetZone: string;
  instruction: string;
  carriedItem: 'none' | 'paper_stack' | 'fabric_roll' | 'coffee_cup' | 'sample_shirt';
  kpiReward: number;
  energyCost: number;
  stressDelta: number;
}

export interface OrderArchetype {
  id: string;
  type: 'standard' | 'express' | 'eco_recycled' | 'crisis_salvage' | 'vip_audit';
  title: string;
  client: string;
  description: string;
  badge: string;
  badgeColor: string;
  steps: OrderStepDef[];
}

export const ORDER_ARCHETYPES: OrderArchetype[] = [
  {
    id: 'ord_express_ny',
    type: 'express',
    title: '500 Áo Polo Navy Siêu Tốc (Tuần Lễ Thời Trang NY)',
    client: 'David Miller — Tommy USA (New York)',
    description: 'Đơn hàng hỏa tốc chạy đua closing time tàu biển! Cần lấy áo mẫu tại Showroom duyệt gấp trước khi đóng cont.',
    badge: '🚀 SIÊU TỐC',
    badgeColor: '#ef4444',
    steps: [
      {
        stepId: 'desk_receive',
        stepName: '1. Nhận Đơn',
        targetStation: 'desk',
        targetZone: 'Văn Phòng Điều Hành',
        instruction: 'Đến BÀN MERCHANDISER 💻 ký hợp đồng đơn hỏa tốc đi New York!',
        carriedItem: 'paper_stack',
        kpiReward: 60,
        energyCost: 5,
        stressDelta: 5
      },
      {
        stepId: 'printer_techpack',
        stepName: '2. In Techpack',
        targetStation: 'printer',
        targetZone: 'Văn Phòng Điều Hành',
        instruction: 'Chạy qua MÁY IN 🖨️ in bộ thông số kỹ thuật Techpack chuẩn USA',
        carriedItem: 'paper_stack',
        kpiReward: 60,
        energyCost: 4,
        stressDelta: 4
      },
      {
        stepId: 'showroom_fitting',
        stepName: '3. Lấy Áo Mẫu',
        targetStation: 'showroom',
        targetZone: 'Showroom & Fitting Studio',
        instruction: 'Sang SHOWROOM 👗 bốc mẫu áo Polo fitting trên Mannequin đối chiếu!',
        carriedItem: 'sample_shirt',
        kpiReward: 90,
        energyCost: 6,
        stressDelta: -5
      },
      {
        stepId: 'lab_verify',
        stepName: '4. Soi Lab Nhanh',
        targetStation: 'lab',
        targetZone: 'Xưởng Cắt & Phòng Lab',
        instruction: 'Đem áo mẫu vào PHÒNG LAB 🔬 soi quang phổ D65 với Em Linh!',
        carriedItem: 'sample_shirt',
        kpiReward: 90,
        energyCost: 5,
        stressDelta: 5
      },
      {
        stepId: 'shipping_port',
        stepName: '5. Cảng Cont Gấp',
        targetStation: 'shipping',
        targetZone: 'Cảng Biển Cát Lái',
        instruction: 'Chạy thần tốc ra CỔNG CONT 🚢 bàn giao cho Anh Tuấn lên tàu!',
        carriedItem: 'none',
        kpiReward: 240,
        energyCost: 8,
        stressDelta: -15
      }
    ]
  },
  {
    id: 'ord_eco_eu',
    type: 'eco_recycled',
    title: '1.500 Áo Sợi Tre Tái Chế GRS Xuất Khẩu Châu Âu',
    client: 'EcoThread GmbH (Hamburg, Đức)',
    description: 'Đơn hàng xanh tiêu chuẩn khắt khe: kiểm định sợi vải bền vững, ký cam kết tiêu chuẩn ISO với Giám Đốc!',
    badge: '🌿 CHÂU ÂU ECO',
    badgeColor: '#10b981',
    steps: [
      {
        stepId: 'desk_receive',
        stepName: '1. Ký Dự Án',
        targetStation: 'desk',
        targetZone: 'Văn Phòng Điều Hành',
        instruction: 'Nhận hồ sơ tiêu chuẩn sợi tre GRS tại BÀN MERCHANDISER 💻',
        carriedItem: 'paper_stack',
        kpiReward: 50,
        energyCost: 4,
        stressDelta: 3
      },
      {
        stepId: 'fabric_inspect',
        stepName: '2. Kiểm Tra Sợi',
        targetStation: 'fabric',
        targetZone: 'Kho Vải Đại Ngàn',
        instruction: 'Xuống KHO VẢI 🧵 gặp Chị Nga đối chiếu mã cuộn vải tái chế',
        carriedItem: 'fabric_roll',
        kpiReward: 80,
        energyCost: 7,
        stressDelta: 6
      },
      {
        stepId: 'lab_certify',
        stepName: '3. Kiểm Định Co Giãn',
        targetStation: 'lab',
        targetZone: 'Xưởng Cắt & Phòng Lab',
        instruction: 'Đưa mẫu vải vào PHÒNG LAB 🔬 kiểm tra độ co giãn 4 chiều & wash test',
        carriedItem: 'sample_shirt',
        kpiReward: 100,
        energyCost: 5,
        stressDelta: 4
      },
      {
        stepId: 'boss_sign',
        stepName: '4. Trình Sếp Ký',
        targetStation: 'boss_desk',
        targetZone: 'Phòng Tổng Giám Đốc',
        instruction: 'Vào PHÒNG SẾP HÙNG 👔 trình Giám Đốc ký xác nhận tiêu chuẩn ISO!',
        carriedItem: 'paper_stack',
        kpiReward: 120,
        energyCost: 4,
        stressDelta: 8
      },
      {
        stepId: 'shipping_port',
        stepName: '5. Xuất Cảng Xanh',
        targetStation: 'shipping',
        targetZone: 'Cảng Biển Cát Lái',
        instruction: 'Ra CẢNG CONT CÁT LÁI 🚢 dán tem ECO và bàn giao cont cho Anh Tuấn',
        carriedItem: 'none',
        kpiReward: 250,
        energyCost: 6,
        stressDelta: -20
      }
    ]
  },
  {
    id: 'ord_crisis_salvage',
    type: 'crisis_salvage',
    title: 'Cứu Hỏa Đơn 3.000 Áo Khoác Gió (Lỗi Loang Màu Sợi)',
    client: 'Zara Global Sourcing (Madrid, Tây Ban Nha)',
    description: 'Sự cố khẩn cấp: Mẻ vải bị lỗi loang màu! Cần họp Boardroom đàm phán, khôi phục file Server IT và cứu đơn hàng.',
    badge: '🚒 CỨU HỎA KHẨN',
    badgeColor: '#f59e0b',
    steps: [
      {
        stepId: 'desk_receive',
        stepName: '1. Tiếp Nhận Lỗi',
        targetStation: 'desk',
        targetZone: 'Văn Phòng Điều Hành',
        instruction: 'Mở BÀN LÀM VIỆC 💻 đọc email khiếu nại chất lượng từ đại diện Zara!',
        carriedItem: 'paper_stack',
        kpiReward: 50,
        energyCost: 4,
        stressDelta: 12
      },
      {
        stepId: 'showroom_compare',
        stepName: '2. So Mẫu Gốc',
        targetStation: 'showroom',
        targetZone: 'Showroom & Fitting Studio',
        instruction: 'Chạy gấp vào SHOWROOM 👗 lấy mẫu gốc (Golden Sample) để đối chứng!',
        carriedItem: 'sample_shirt',
        kpiReward: 80,
        energyCost: 6,
        stressDelta: -4
      },
      {
        stepId: 'boardroom_negotiate',
        stepName: '3. Họp VIP Boardroom',
        targetStation: 'whiteboard',
        targetZone: 'Phòng Họp VIP',
        instruction: 'Vào PHÒNG HỌP VIP 📊 đàm phán phương án chiết khấu bù đắp cùng Buyer!',
        carriedItem: 'paper_stack',
        kpiReward: 130,
        energyCost: 7,
        stressDelta: 10
      },
      {
        stepId: 'server_recovery',
        stepName: '4. Cứu File Server IT',
        targetStation: 'server',
        targetZone: 'Khu Vực Kỹ Thuật',
        instruction: 'Chạy đến TỦ SERVER IT 🖥️ nhờ Anh Hoàng xuất phụ lục hợp đồng đã chỉnh sửa!',
        carriedItem: 'paper_stack',
        kpiReward: 110,
        energyCost: 5,
        stressDelta: -6
      },
      {
        stepId: 'shipping_port',
        stepName: '5. Xuất Cứu Nguy',
        targetStation: 'shipping',
        targetZone: 'Cảng Biển Cát Lái',
        instruction: 'Bàn giao cont cứu nguy tại CỔNG CẢNG 🚢, khách hàng đồng ý nhận hàng!',
        carriedItem: 'none',
        kpiReward: 280,
        energyCost: 8,
        stressDelta: -25
      }
    ]
  },
  {
    id: 'ord_vip_audit',
    type: 'vip_audit',
    title: 'Tiếp Đón Đoàn Buyer Nhật Bản Thanh Tra Xưởng May',
    client: 'Uniqlo Fast Retailing (Tokyo, Nhật Bản)',
    description: 'Đoàn kiểm định chất lượng Nhật Bản viếng thăm toàn diện: khâu tiếp khách, thiết bị lab, kho bãi và phong thủy tài lộc!',
    badge: '🎌 THANH TRA VIP',
    badgeColor: '#8b5cf6',
    steps: [
      {
        stepId: 'pantry_welcome',
        stepName: '1. Pha Trà Đón Khách',
        targetStation: 'coffee',
        targetZone: 'Căn Tin Trung Tâm',
        instruction: 'Đến QUẦY PANTRY ☕ pha trà ô long & cà phê cao cấp tiếp đón đoàn khách!',
        carriedItem: 'coffee_cup',
        kpiReward: 70,
        energyCost: 4,
        stressDelta: -10
      },
      {
        stepId: 'lab_inspect',
        stepName: '2. Thị Sát Phòng Lab',
        targetStation: 'lab',
        targetZone: 'Xưởng Cắt & Phòng Lab',
        instruction: 'Dẫn đoàn sang PHÒNG LAB 🔬 kiểm tra tủ đèn D65 và máy đo Delta E!',
        carriedItem: 'none',
        kpiReward: 90,
        energyCost: 5,
        stressDelta: 6
      },
      {
        stepId: 'fabric_audit',
        stepName: '3. Kiểm Kê Kho Vải',
        targetStation: 'fabric',
        targetZone: 'Kho Vải Đại Ngàn',
        instruction: 'Đưa đoàn xuống KHO VẢI 🧵 kiểm tra quy trình 5S chống ẩm mốc cùng Chị Nga!',
        carriedItem: 'fabric_roll',
        kpiReward: 90,
        energyCost: 6,
        stressDelta: 5
      },
      {
        stepId: 'altar_pray',
        stepName: '4. Thắp Nhang Cầu May',
        targetStation: 'altar',
        targetZone: 'Văn Phòng Điều Hành',
        instruction: 'Dẫn khách thắp nhang tại BÀN THỜ THẦN TÀI 🙏 giới thiệu nét văn hóa may mắn!',
        carriedItem: 'none',
        kpiReward: 120,
        energyCost: 3,
        stressDelta: -20
      },
      {
        stepId: 'desk_sign',
        stepName: '5. Ký Hợp Đồng Năm',
        targetStation: 'desk',
        targetZone: 'Văn Phòng Điều Hành',
        instruction: 'Về BÀN LÀM VIỆC 💻 ký hợp đồng đối tác chiến lược trị giá 20 tỷ đồng!',
        carriedItem: 'paper_stack',
        kpiReward: 300,
        energyCost: 5,
        stressDelta: -20
      }
    ]
  },
  {
    id: 'ord_uniform_corp',
    type: 'standard',
    title: '2.000 Áo Thun Đồng Phục Doanh Nghiệp (In Thêu Logo Gấp)',
    client: 'Tập Đoàn Công Nghệ FPT (Hà Nội)',
    description: 'Đơn hàng đồng phục toàn quốc số lượng lớn: in thêu sắc nét, thư giãn ban công lấy lại năng lượng trước khi xuất xưởng.',
    badge: '📦 ĐỒNG PHỤC',
    badgeColor: '#3b82f6',
    steps: [
      {
        stepId: 'desk_receive',
        stepName: '1. Nhận Đơn Hàng',
        targetStation: 'desk',
        targetZone: 'Văn Phòng Điều Hành',
        instruction: 'Mở BÀN LÀM VIỆC 💻 chốt mẫu thiết kế logo áo thun cam doanh nghiệp!',
        carriedItem: 'paper_stack',
        kpiReward: 50,
        energyCost: 4,
        stressDelta: 3
      },
      {
        stepId: 'balcony_rest',
        stepName: '2. Lên Ban Công Hóng Gió',
        targetStation: 'balcony',
        targetZone: 'Ban Công Hóng Gió & Lounge',
        instruction: 'Ra BAN CÔNG 🌿 hít thở không khí, hạ hỏa stress và nạp năng lượng!',
        carriedItem: 'none',
        kpiReward: 60,
        energyCost: -15,
        stressDelta: -25
      },
      {
        stepId: 'fabric_pick',
        stepName: '3. Lấy Vải Cotton',
        targetStation: 'fabric',
        targetZone: 'Kho Vải Đại Ngàn',
        instruction: 'Xuống KHO VẢI 🧵 bốc cây vải Cotton cá sấu 4 chiều co giãn!',
        carriedItem: 'fabric_roll',
        kpiReward: 80,
        energyCost: 6,
        stressDelta: 5
      },
      {
        stepId: 'printer_labels',
        stepName: '4. In Tem Nhãn',
        targetStation: 'printer',
        targetZone: 'Văn Phòng Điều Hành',
        instruction: 'Qua MÁY IN 🖨️ in 2.000 tem nhãn hướng dẫn giặt ủi Oeko-Tex!',
        carriedItem: 'paper_stack',
        kpiReward: 80,
        energyCost: 4,
        stressDelta: 3
      },
      {
        stepId: 'shipping_port',
        stepName: '5. Bàn Giao Xe Tải',
        targetStation: 'shipping',
        targetZone: 'Cảng Biển Cát Lái',
        instruction: 'Đóng kiện và chuyển hàng ra CỔNG CẢNG 🚢 cho đội xe giao hàng liên tỉnh!',
        carriedItem: 'none',
        kpiReward: 220,
        energyCost: 7,
        stressDelta: -15
      }
    ]
  }
];
