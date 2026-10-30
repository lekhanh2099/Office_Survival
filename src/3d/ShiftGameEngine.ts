import { OfficeStage, Workstation } from './OfficeStage';
import { sounds } from '../audio/SoundManager';
import { showToast } from '../ui/Toast';

export interface ShiftTask {
  id: string;
  orderName: string;
  client: string;
  step: 'desk_receive' | 'printer_techpack' | 'lab_check' | 'fabric_pick' | 'shipping_deliver';
  stepDescription: string;
  targetStation: 'desk' | 'printer' | 'lab' | 'fabric' | 'shipping';
  targetZone: string;
}

export interface ShiftState {
  day: number;
  timeHour: number;
  timeMinute: number;
  isFinished: boolean;
  energy: number; // 0 - 100
  stress: number; // 0 - 100
  ordersCompleted: number;
  targetOrders: number;
  score: number;
  currentTask: ShiftTask;
  activePrompt: string | null;
  currentZone: string;
  grade?: 'S' | 'A' | 'B' | 'C' | 'F';
}

export class ShiftGameEngine {
  private stage: OfficeStage;
  private state: ShiftState;
  private onStateChange: (state: ShiftState) => void;

  private clockTimer = 0;
  private bossCooldown = 0;
  private graceTimer = 15.0; // 15s starting grace period for player to orient
  private speedBoostTimer = 0;

  private sampleOrders = [
    { orderName: '500 Áo Polo Navy Xuất Mỹ', client: 'Mr. David (New York)' },
    { orderName: '1.200 Quần Khaki Xuất EU', client: 'Buyer Hamburg' },
    { orderName: '800 Áo Hoodie Nỉ Bông', client: 'Khách Seoul' },
    { orderName: '3.000 Bộ Đồ Thun Spandex', client: 'Buyer Tokyo' }
  ];

  constructor(stage: OfficeStage, day = 1, onStateChange: (state: ShiftState) => void = () => {}) {
    this.stage = stage;
    this.onStateChange = onStateChange;

    this.state = {
      day,
      timeHour: 9,
      timeMinute: 0,
      isFinished: false,
      energy: 100,
      stress: 10,
      ordersCompleted: 0,
      targetOrders: 3,
      score: 0,
      currentTask: this.createNewTask(0),
      activePrompt: null,
      currentZone: stage.currentZoneName
    };
  }

  private createNewTask(orderIndex: number): ShiftTask {
    const o = this.sampleOrders[orderIndex % this.sampleOrders.length];
    return {
      id: `task_${Date.now()}`,
      orderName: o.orderName,
      client: o.client,
      step: 'desk_receive',
      stepDescription: `Đến BÀN MERCHANDISER nhận hợp đồng: "${o.orderName}"`,
      targetStation: 'desk',
      targetZone: 'Văn Phòng Điều Hành'
    };
  }

  getState(): ShiftState {
    return this.state;
  }

  update(delta: number): void {
    if (this.state.isFinished) return;

    this.state.currentZone = this.stage.currentZoneName;

    // 1. Clock Progression (9:00 -> 17:00 in ~240s)
    this.clockTimer += delta;
    if (this.clockTimer >= 0.50) {
      this.clockTimer = 0;
      this.state.timeMinute += 1;
      if (this.state.timeMinute >= 60) {
        this.state.timeMinute = 0;
        this.state.timeHour += 1;
      }

      this.state.energy = Math.max(0, this.state.energy - 0.04);

      if (this.state.timeHour >= 17) {
        this.finishShift();
        return;
      }
    }

    // 2. Speed Boost handling
    if (this.speedBoostTimer > 0) {
      this.speedBoostTimer -= delta;
      this.stage.player.moveSpeed = 6.8;
    } else {
      this.stage.player.moveSpeed = this.state.energy < 20 ? 3.4 : 5.4;
    }

    // 3. Check Pickups on Map
    this.stage.checkPickupCollision((type) => {
      sounds.success();
      if (type === 'boba') {
        this.state.energy = Math.min(100, this.state.energy + 35);
        this.speedBoostTimer = 8.0;
        showToast('🧋 Nhặt Cốc Trà Sữa: Hồi +35% Năng Lượng & Bật Tốc Chạy 8s!');
      } else if (type === 'coffee') {
        this.state.energy = Math.min(100, this.state.energy + 25);
        this.state.stress = Math.max(0, this.state.stress - 15);
        showToast('☕ Nhặt Cà Phê: Hồi +25% Năng Lượng, Giảm -15% Stress!');
      } else if (type === 'bonus_cash') {
        this.state.score += 100;
        showToast('💵 Nhặt Tiền Thưởng Nóng: +100 Điểm KPI!');
      }
      this.sync();
    });

    // 4. Sếp Patrol Warning (Only active after initial grace period)
    if (this.graceTimer > 0) {
      this.graceTimer -= delta;
    } else if (this.bossCooldown > 0) {
      this.bossCooldown -= delta;
    } else if (this.stage.isPlayerCaughtByBoss()) {
      if (this.stage.player.carriedItem === 'none') {
        this.bossCooldown = 5.0;
        this.state.stress = Math.min(100, this.state.stress + 10);
        sounds.damage();
        showToast('⚠️ SẾP HÙNG: "Chưa in xong Techpack mà đi dạo à?!" (+10% Stress)');
        this.sync();
      }
    }

    // 5. Update Station Prompt
    const activeSt = this.stage.activeStation;
    if (activeSt) {
      if (activeSt.type === 'coffee') {
        this.state.activePrompt = '☕ PHA CÀ PHÊ / TRÀ SỮA (+40% ⚡ & Tăng Tốc)';
      } else if (activeSt.type === 'altar') {
        this.state.activePrompt = '🙏 THẮP HƯƠNG CẦU MAY (Xả Stress & Tăng KPI)';
      } else if (activeSt.type === 'water') {
        this.state.activePrompt = '🚰 UỐNG NƯỚC HẠ HỎA (-15% Stress, +10% ⚡)';
      } else if (activeSt.type === 'server') {
        this.state.activePrompt = '🖥️ BẢO TRÌ SERVER IT (+50 Điểm KPI)';
      } else if (activeSt.type === 'lamp') {
        this.state.activePrompt = '💡 BẬT/TẮT ĐÈN PHÒNG KHÁCH (Ấm Cúng)';
      } else if (activeSt.type === 'sofa') {
        this.state.activePrompt = '🛋️ NGẢ LƯNG TRÊN SOFA (Hồi 35% ⚡ & Xả Stress)';
      } else if (activeSt.type === 'whiteboard') {
        this.state.activePrompt = '📊 ĐỌC BẢNG CHIẾN LƯỢC XUẤT KHẨU (+50 đ)';
      } else if (activeSt.type === 'mirror') {
        this.state.activePrompt = '🪞 RỬA MẶT SOI GƯƠNG (Tỉnh Táo +20% ⚡)';
      } else if (activeSt.type === 'boss_desk') {
        this.state.activePrompt = '👔 BÁO CÁO TIẾN ĐỘ SẾP HÙNG (+50 đ)';
      } else if (activeSt.type === this.state.currentTask.targetStation) {
        this.state.activePrompt = `⚡ BẤM ĐỂ: ${this.getPromptActionText(activeSt.type)}`;
      } else {
        this.state.activePrompt = `${activeSt.emoji} ${activeSt.name}`;
      }
    } else {
      this.state.activePrompt = null;
    }
  }

  private getPromptActionText(type: Workstation['type']): string {
    switch (type) {
      case 'desk': return 'Nhận Đơn Hàng Mới 💻';
      case 'printer': return 'In Bảng Techpack 🖨️';
      case 'lab': return 'Soi Màu Vải Lab-dip D65 🔬';
      case 'fabric': return 'Bốc Cuộn Vải Spandex 🧵';
      case 'shipping': return 'Giao Hàng Cho Anh Tuấn Lên Cont 🚢';
      case 'altar': return 'Thắp Hương Cầu May 🙏';
      case 'coffee': return 'Pha Cà Phê / Trà Sữa ☕';
      case 'water': return 'Uống Nước Mát 🚰';
      case 'server': return 'Kiểm Tra Server 🖥️';
      case 'lamp': return 'Bật / Tắt Đèn 💡';
      case 'sofa': return 'Nghỉ Ngơi Sofa 🛋️';
      case 'whiteboard': return 'Xem Bảng Chiến Lược 📊';
      case 'mirror': return 'Rửa Mặt Soi Gương 🪞';
      case 'boss_desk': return 'Báo Cáo Sếp Hùng 👔';
      default: return 'Làm Việc';
    }
  }

  getStationActionDetails(st: Workstation): { title: string; subtitle: string; desc: string; buttonText: string; isTarget: boolean } {
    const isTarget = st.type === this.state.currentTask.targetStation;
    const title = `${st.emoji} ${st.name}`;
    const subtitle = `📍 ${st.zone}`;
    let desc = '';
    let buttonText = '🚀 LÀM VIỆC NGAY';

    if (st.type === 'coffee') {
      desc = 'Pha 1 ly cà phê phin hoặc trà sữa trân châu full topping: Hồi phục +50% Năng Lượng ⚡, xả -15% Stress 🔥 và bật tốc chạy trong 9 giây!';
      buttonText = '☕ PHA CÀ PHÊ (+50% ⚡)';
    } else if (st.type === 'altar') {
      desc = 'Thắp 3 nén hương lên Bàn Thờ Thần Tài - Thổ Địa: Cầu may mắn tài lộc, giải tỏa -25% Stress 🔥, hồi +25% Năng Lượng ⚡ và cộng +100 điểm KPI!';
      buttonText = '🙏 THẮP HƯƠNG (+100 đ)';
    } else if (st.type === 'water') {
      desc = 'Rót cốc nước khoáng Lavie mát lạnh tinh khiết: Hạ nhiệt căng thẳng, giảm ngay -15% Stress 🔥 và tăng +10% Năng Lượng ⚡.';
      buttonText = '🚰 UỐNG NƯỚC MÁT (-15% 🔥)';
    } else if (st.type === 'server') {
      desc = 'Kiểm tra hệ thống Datacenter Server: CI/CD Pipeline ổn định không có lỗi phát sinh. Tích lũy ngay +50 điểm KPI ca trực!';
      buttonText = '🖥️ CHECK SERVER (+50 đ)';
    } else if (st.type === 'lamp') {
      desc = 'Bật / Tắt trực tiếp chiếc đèn sàn đồng thau kiểu Bắc Âu trong phòng khách, đổi ánh sáng ấm cúng cho văn phòng!';
      buttonText = '💡 BẬT/TẮT ĐÈN SÀN';
    } else if (st.type === 'sofa') {
      desc = 'Ngả lưng thư giãn trên chiếc ghế sofa da êm ái: Nạp lại nhanh +35% Năng Lượng ⚡ và xả -25% áp lực Stress 🔥.';
      buttonText = '🛋️ NGHỈ TRƯA (+35% ⚡)';
    } else if (st.type === 'whiteboard') {
      desc = 'Đọc kế hoạch xuất khẩu Q4 trên bảng họp kính VIP: Nắm vững quy trình tiêu chuẩn may mẫu AQL 2.5 và nhận +50 điểm KPI!';
      buttonText = '📊 ĐỌC KẾ HOẠCH (+50 đ)';
    } else if (st.type === 'mirror') {
      desc = 'Rửa mặt với dòng nước mát trước gương phòng vệ sinh WC: Lấy lại sự tỉnh táo 100%, hồi phục ngay +20% Năng Lượng ⚡.';
      buttonText = '🪞 RỬA MẶT TỈNH TÁO (+20% ⚡)';
    } else if (st.type === 'boss_desk') {
      desc = 'Báo cáo trực tiếp tiến độ đơn hàng với Giám Đốc Hùng: Nhận lời khen ngợi từ Sếp và được thưởng ngay +50 điểm KPI!';
      buttonText = '👔 BÁO CÁO TIẾN ĐỘ (+50 đ)';
    } else if (isTarget) {
      desc = `Nhiệm vụ đơn hàng: ${this.state.currentTask.stepDescription}. Thực hiện để tiến tới xuất xưởng container!`;
      buttonText = `⚡ ${this.getPromptActionText(st.type)}`;
    } else {
      desc = `Trạm làm việc: ${st.name} thuộc khu vực ${st.zone}.`;
      buttonText = '⚡ ĐẾN TRẠM NÀY';
    }

    return { title, subtitle, desc, buttonText, isTarget };
  }

  doAction(stationOverride?: Workstation): void {
    if (this.state.isFinished) return;
    const activeSt = stationOverride || this.stage.activeStation;
    if (!activeSt) return;

    // Boba lounge
    if (activeSt.type === 'coffee') {
      if (this.state.energy >= 95) {
        showToast('🧋 Bụng no căng trà sữa rồi, chạy việc tiếp thôi!');
        return;
      }
      sounds.success();
      this.state.energy = Math.min(100, this.state.energy + 50);
      this.state.stress = Math.max(0, this.state.stress - 15);
      this.speedBoostTimer = 9.0;
      this.stage.player.setCarriedItem('coffee_cup');
      setTimeout(() => {
        if (this.stage.player.carriedItem === 'coffee_cup') {
          this.stage.player.setCarriedItem('none');
        }
      }, 3500);

      showToast('☕ Nạp Cà Phê Phin & Trà Sữa: Hồi phục +50% Năng Lượng & Bật Tốc Chạy 9s ⚡');
      this.sync();
      return;
    }

    // Bàn Thờ Thần Tài & Thổ Địa
    if (activeSt.type === 'altar') {
      if (this.state.stress <= 5 && this.state.energy >= 95) {
        showToast('🙏 Tâm tịnh như nước, tài lộc đang đầy ắp! Tiếp tục chiến thôi!');
        return;
      }
      sounds.perk();
      this.state.energy = Math.min(100, this.state.energy + 25);
      this.state.stress = Math.max(0, this.state.stress - 25);
      this.state.score += 100;
      showToast('🙏 Thần Tài - Thổ Địa phù hộ: Vía lành tài lộc, tâm hồn thanh thản! (+25% ⚡, -25% 🔥, +100 đ)');
      this.sync();
      return;
    }

    // Water cooler
    if (activeSt.type === 'water') {
      sounds.success();
      this.state.energy = Math.min(100, this.state.energy + 10);
      this.state.stress = Math.max(0, this.state.stress - 15);
      showToast('🚰 Đã uống ly nước mát lạnh: Hạ nhiệt căng thẳng tức thì! (-15% Stress, +10% ⚡)');
      this.sync();
      return;
    }

    // Server maintenance
    if (activeSt.type === 'server') {
      sounds.success();
      this.state.score += 50;
      showToast('🖥️ Kiểm tra hệ thống IT: CI/CD Pipeline 0 lỗi, Uptime 99.99%! (+50 đ KPI)');
      this.sync();
      return;
    }

    // Floor lamp toggle
    if (activeSt.type === 'lamp') {
      sounds.click();
      const isOn = this.stage.toggleFloorLamp();
      showToast(isOn ? '💡 Đã bật đèn sàn: Không gian vàng ấm lung linh!' : '💡 Đã tắt đèn sàn: Tiết kiệm điện cho công ty!');
      this.sync();
      return;
    }

    // Sofa rest
    if (activeSt.type === 'sofa') {
      sounds.success();
      this.state.energy = Math.min(100, this.state.energy + 35);
      this.state.stress = Math.max(0, this.state.stress - 25);
      showToast('🛋️ Ngả lưng trên sofa êm ái: Nạp lại đầy pin cho ca trực! (+35% ⚡, -25% Stress)');
      this.sync();
      return;
    }

    // Whiteboard study
    if (activeSt.type === 'whiteboard') {
      sounds.perk();
      this.state.score += 50;
      showToast('📊 Đọc kế hoạch xuất khẩu Q4: Nắm vững KPI và chuẩn AQL 2.5! (+50 đ)');
      this.sync();
      return;
    }

    // Restroom mirror wash
    if (activeSt.type === 'mirror') {
      sounds.success();
      this.state.energy = Math.min(100, this.state.energy + 20);
      this.state.stress = Math.max(0, this.state.stress - 10);
      showToast('🪞 Rửa mặt với nước mát: Tỉnh táo 100%, sẵn sàng chạy deadline! (+20% ⚡)');
      this.sync();
      return;
    }

    // Boss desk report
    if (activeSt.type === 'boss_desk') {
      sounds.perk();
      this.state.score += 50;
      showToast('👔 Sếp Hùng: "Làm việc chăm chỉ lắm em, ráng chạy kịp cont cuối năm có thưởng lớn!" (+50 đ)');
      this.sync();
      return;
    }

    // Task progression check
    const task = this.state.currentTask;
    if (activeSt.type !== task.targetStation) {
      sounds.click();
      showToast(`⚠️ Cần đến: ${task.targetZone.toUpperCase()} (${task.targetStation.toUpperCase()}) trước!`);
      return;
    }

    // Step 1: Desk -> Printer
    if (task.step === 'desk_receive') {
      sounds.click();
      this.stage.player.setCarriedItem('paper_stack');
      task.step = 'printer_techpack';
      task.targetStation = 'printer';
      task.targetZone = 'Văn Phòng Điều Hành';
      task.stepDescription = 'Mang hồ sơ tới MÁY IN 🖨️ in Techpack & Bảng màu';
      showToast('📄 Đã nhận hồ sơ! Chạy qua Máy In.');
    }
    // Step 2: Printer -> Lab
    else if (task.step === 'printer_techpack') {
      sounds.success();
      task.step = 'lab_check';
      task.targetStation = 'lab';
      task.targetZone = 'Xưởng Cắt & Lab';
      task.stepDescription = 'Chạy sang PHÒNG LAB 🔬 soi mẫu vải dưới đèn D65';
      showToast('🖨️ Đã in xong Techpack! Chạy qua Phòng Lab soi màu.');
    }
    // Step 3: Lab -> Fabric Warehouse
    else if (task.step === 'lab_check') {
      sounds.success();
      task.step = 'fabric_pick';
      task.targetStation = 'fabric';
      task.targetZone = 'Kho Vải Đại Ngàn';
      task.stepDescription = 'Xuống KHO VẢI 🧵 gặp Chị Nga bốc cuộn vải chuẩn mã';
      showToast('🔬 Mẫu vải đạt chuẩn Delta E! Xuống Kho Vải lấy cây vải.');
    }
    // Step 4: Fabric Warehouse -> Port Dock
    else if (task.step === 'fabric_pick') {
      sounds.click();
      this.stage.player.setCarriedItem('fabric_roll');
      task.step = 'shipping_deliver';
      task.targetStation = 'shipping';
      task.targetZone = 'Cảng Biển & Xuất Khẩu';
      task.stepDescription = 'Vác cuộn vải sang CẢNG CONT 🚢 giao cho Anh Tuấn trước giờ đóng máng!';
      showToast('🧵 Đã bốc cuộn vải! Chạy ngay ra Cảng Cát Lái đóng cont.');
    }
    // Step 5: Deliver to Shipping Container
    else if (task.step === 'shipping_deliver') {
      sounds.success();
      this.stage.player.setCarriedItem('none');
      this.state.ordersCompleted += 1;
      this.state.score += 200;
      this.state.stress = Math.max(0, this.state.stress - 20);

      showToast(`🎉 XUẤT XƯỞNG THÀNH CÔNG ĐƠN HÀNG #${this.state.ordersCompleted}! (+200 điểm)`);

      if (this.state.ordersCompleted >= this.state.targetOrders) {
        this.finishShift();
        return;
      } else {
        this.state.currentTask = this.createNewTask(this.state.ordersCompleted);
      }
    }

    this.sync();
  }

  private finishShift(): void {
    this.state.isFinished = true;

    if (this.state.ordersCompleted >= 3 && this.state.stress <= 30) {
      this.state.grade = 'S';
    } else if (this.state.ordersCompleted >= 2) {
      this.state.grade = 'A';
    } else if (this.state.ordersCompleted >= 1) {
      this.state.grade = 'B';
    } else {
      this.state.grade = 'C';
    }

    sounds.success();
    this.sync();
  }

  private sync(): void {
    this.onStateChange(this.state);
  }
}
