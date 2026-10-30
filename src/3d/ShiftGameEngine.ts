import { OfficeStage, Workstation } from './OfficeStage';
import { sounds } from '../audio/SoundManager';
import { showToast } from '../ui/Toast';
import {
  OfficeWeather,
  OFFICE_WEATHERS,
  StationDilemma,
  STATION_DILEMMAS
} from '../data/officeDilemmas';
import {
  ORDER_ARCHETYPES,
  OrderArchetype
} from '../data/shiftOrders';
import {
  COLLEAGUES_DATA
} from '../data/colleagues';
import {
  SHIFT_ENDINGS,
  ShiftEnding
} from '../data/shiftEndings';

export interface ShiftTask {
  id: string;
  orderName: string;
  client: string;
  step: string;
  stepDescription: string;
  targetStation: string;
  targetZone: string;
  isCrisis?: boolean;
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
  activeOrderArchetype: OrderArchetype;
  currentOrderStepIndex: number;
  colleagueFavors: Record<'boss' | 'nga' | 'tuan' | 'linh' | 'hoang', number>;
  ending?: ShiftEnding;
  altarPrayCount: number;
  confrontBossCount: number;
  activePrompt: string | null;
  currentZone: string;
  grade?: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  weather: OfficeWeather;
  dilemmasResolved: number;
  choicesLog: string[];
}

export class ShiftGameEngine {
  private stage: OfficeStage;
  private state: ShiftState;
  private onStateChange: (state: ShiftState) => void;

  public onTriggerDilemma?: (dilemma: StationDilemma, onResolve: (choice: 'A' | 'B') => void) => void;
  private pendingDilemmaStation: string | null = null;
  private triggeredDilemmaIds = new Set<string>();

  private clockTimer = 0;
  private bossCooldown = 0;
  private graceTimer = 15.0; // 15s starting grace period
  private speedBoostTimer = 0;

  constructor(stage: OfficeStage, day = 1, onStateChange: (state: ShiftState) => void = () => {}) {
    this.stage = stage;
    this.onStateChange = onStateChange;

    const weather = OFFICE_WEATHERS[Math.floor(Math.random() * OFFICE_WEATHERS.length)];
    const initialArchetype = ORDER_ARCHETYPES[0];
    const initialTask = this.createTaskFromArchetype(initialArchetype, 0);

    this.state = {
      day,
      timeHour: 9,
      timeMinute: 0,
      isFinished: false,
      energy: 100,
      stress: 10,
      ordersCompleted: 0,
      targetOrders: 5,
      score: 0,
      currentTask: initialTask,
      activeOrderArchetype: initialArchetype,
      currentOrderStepIndex: 0,
      colleagueFavors: {
        boss: 20,
        nga: 25,
        tuan: 20,
        linh: 30,
        hoang: 25
      },
      altarPrayCount: 0,
      confrontBossCount: 0,
      activePrompt: null,
      currentZone: stage.currentZoneName,
      weather,
      dilemmasResolved: 0,
      choicesLog: []
    };

    // Point directional guide arrow to first station
    const initialStation = this.stage.stations.find(s => s.type === initialTask.targetStation);
    if (initialStation) {
      this.stage.currentTargetStationPos = initialStation.position.clone();
    }
  }

  private createTaskFromArchetype(archetype: OrderArchetype, stepIndex: number): ShiftTask {
    const stepDef = archetype.steps[stepIndex] || archetype.steps[0];
    // Random station for potential dilemma during this order
    const candidateStations = ['desk', 'printer', 'lab', 'fabric', 'shipping', 'showroom', 'balcony'];
    this.pendingDilemmaStation = candidateStations[Math.floor(Math.random() * candidateStations.length)];

    return {
      id: `task_${archetype.id}_${Date.now()}`,
      orderName: archetype.title,
      client: archetype.client,
      step: stepDef.stepId,
      stepDescription: stepDef.instruction,
      targetStation: stepDef.targetStation,
      targetZone: stepDef.targetZone,
      isCrisis: false
    };
  }

  private createCrisisTask(id: string, orderName: string, targetStation: string, targetZone: string, stepDescription: string): ShiftTask {
    return {
      id,
      orderName,
      client: 'SỰ CỐ KHẨN CẤP',
      step: 'emergency_crisis',
      stepDescription,
      targetStation,
      targetZone,
      isCrisis: true
    };
  }

  getState(): ShiftState {
    return this.state;
  }

  update(delta: number): void {
    if (this.state.isFinished) return;

    this.state.currentZone = this.stage.currentZoneName;

    // 0. Burnout check: If stress reaches 100%, trigger Burnout ending!
    if (this.state.stress >= 100) {
      this.finishShift('burnout');
      return;
    }

    // 1. Clock Progression (9:00 -> 17:00 in ~336s, approx 5.6 mins)
    this.clockTimer += delta;
    if (this.clockTimer >= 0.70) {
      this.clockTimer = 0;
      this.state.timeMinute += 1;
      if (this.state.timeMinute >= 60) {
        this.state.timeMinute = 0;
        this.state.timeHour += 1;
      }

      // Natural energy/stress decay per in-game minute
      this.state.energy = Math.max(0, this.state.energy - 0.12 * this.state.weather.energyDrainMultiplier);
      this.state.stress = Math.min(100, this.state.stress + 0.10 * this.state.weather.stressDrainMultiplier);

      // End of day at 17:00
      if (this.state.timeHour >= 17) {
        this.finishShift();
        return;
      }
      this.sync();
    }

    // 2. Speed Boost Countdown
    if (this.speedBoostTimer > 0) {
      this.speedBoostTimer -= delta;
      this.stage.player.moveSpeed = 6.2;
    } else {
      this.stage.player.moveSpeed = 4.2;
    }

    // 3. Boss Patrol Proximity & Collision
    if (this.graceTimer > 0) {
      this.graceTimer -= delta;
    } else {
      if (this.bossCooldown > 0) {
        this.bossCooldown -= delta;
      } else {
        if (this.stage.isPlayerCaughtByBoss()) {
          // If boss favor is high (>= 50), boss gives encouraging praise instead of penalizing!
          if (this.state.colleagueFavors.boss >= 50) {
            sounds.perk();
            this.state.score += 30;
            this.state.stress = Math.max(0, this.state.stress - 5);
            showToast('👔 Sếp Hùng gật đầu hài lòng: "Phong độ tốt lắm em, tiếp tục phát huy nhé!" (+30 KPI)');
          } else {
            sounds.damage();
            const stressD = Math.round(18 * this.state.weather.stressDrainMultiplier);
            const scoreD = 60;
            this.state.stress = Math.min(100, this.state.stress + stressD);
            this.state.score = Math.max(0, this.state.score - scoreD);
            showToast(`👔 Sếp Hùng bắt gặp bạn đi chậm: Bị phê bình! (+${stressD}% Stress, -${scoreD} đ KPI)`);
          }
          this.bossCooldown = 6.0;
          this.sync();
        }
      }
    }

    // 4. Map Pickups Collision
    this.stage.checkPickupCollision((type) => {
      sounds.perk();
      if (type === 'boba') {
        this.state.energy = Math.min(100, this.state.energy + 25);
        this.state.stress = Math.max(0, this.state.stress - 15);
        showToast('🧋 Nhặt được Ly Trà Sữa Phúc Long: Hồi phục +25% Năng Lượng, giảm 15% Stress!');
      } else if (type === 'coffee') {
        this.state.energy = Math.min(100, this.state.energy + 20);
        this.speedBoostTimer = 7.0;
        showToast('☕ Nhặt được Lon Cà Phê Đá: Tăng tốc chạy thần tốc 7s!');
      } else if (type === 'bonus_cash') {
        const bonus = Math.round(100 * this.state.weather.kpiMultiplier);
        this.state.score += bonus;
        showToast(`💵 Nhặt được Tiền Thưởng Nóng: +${bonus} điểm KPI!`);
      }
      this.sync();
    });

    // 5. Update Proximity Action Prompts & Direction Guidance
    this.updateProximityPrompts();
  }

  private updateProximityPrompts(): void {
    const activeSt = this.stage.activeStation;
    const task = this.state.currentTask;

    // Update 3D Beacon Group & Compass Direction Arrow position
    const targetStationObj = this.stage.stations.find(s => s.type === task.targetStation);
    if (targetStationObj) {
      this.stage.currentTargetStationPos = targetStationObj.position.clone();
      if (this.stage.targetBeaconGroup) {
        this.stage.targetBeaconGroup.position.copy(targetStationObj.position);
        this.stage.targetBeaconGroup.visible = true;
      }
    } else {
      if (this.stage.targetBeaconGroup) {
        this.stage.targetBeaconGroup.visible = false;
      }
    }

    if (activeSt) {
      const isTarget = activeSt.type === task.targetStation;
      if (isTarget) {
        this.state.activePrompt = `🎯 ${this.getPromptActionText(activeSt.type)}`;
      } else {
        this.state.activePrompt = `${activeSt.emoji} ${activeSt.name}`;
      }
    } else {
      this.state.activePrompt = null;
    }
  }

  private getPromptActionText(type: Workstation['type']): string {
    if (this.state.currentTask.isCrisis && type === this.state.currentTask.targetStation) {
      if (type === 'server') return 'Khởi Động Lại Server IT 🖥️';
      if (type === 'lab') return 'Hiệu Chỉnh Màu Vải Lab 🔬';
      if (type === 'whiteboard') return 'Báo Cáo Đoàn VIP Boardroom 📊';
      if (type === 'fabric') return 'Đối Chiếu Sổ Sách Kho Vải 📑';
    }
    switch (type) {
      case 'desk': return 'Nhận Đơn / Ký Hợp Đồng 💻';
      case 'printer': return 'In Techpack & Tem Nhãn 🖨️';
      case 'lab': return 'Soi Màu Quang Phổ D65 🔬';
      case 'fabric': return 'Bốc Cuộn Vải / Kiểm Kê 🧵';
      case 'shipping': return 'Bàn Giao Cảng Cát Lái 🚢';
      case 'showroom': return 'Lấy Áo Mẫu / So Mẫu Gốc 👗';
      case 'balcony': return 'Ban Công Hóng Gió Xả Stress 🌿';
      case 'altar': return 'Thắp Hương Cầu May 🙏';
      case 'coffee': return 'Pha Cà Phê / Trà Sữa ☕';
      case 'water': return 'Uống Nước Mát 🚰';
      case 'server': return 'Kiểm Tra Server IT 🖥️';
      case 'lamp': return 'Bật / Tắt Đèn 💡';
      case 'sofa': return 'Nghỉ Ngơi Sofa 🛋️';
      case 'whiteboard': return 'Họp Chiến Lược VIP 📊';
      case 'mirror': return 'Rửa Mặt Soi Gương 🪞';
      case 'boss_desk': return 'Trình Sếp Ký Duyệt 👔';
      default: return 'Làm Việc';
    }
  }

  getStationActionDetails(st: Workstation): { emoji: string; title: string; subtitle: string; desc: string; buttonText: string; isTarget: boolean } {
    const isTarget = st.type === this.state.currentTask.targetStation;
    const title = `${st.emoji} ${st.name}`;
    const subtitle = `📍 ${st.zone}`;
    let desc = '';
    let buttonText = '🚀 LÀM VIỆC NGAY';

    if (this.state.currentTask.isCrisis && isTarget) {
      desc = `🚨 SỰ CỐ KHẨN CẤP: ${this.state.currentTask.stepDescription}. Hãy xử lý ngay để giữ tiến độ xuất hàng!`;
      buttonText = `🚨 KHẮC PHỤC NGAY (+180 đ)`;
    } else if (st.type === 'coffee') {
      desc = 'Pha 1 ly cà phê phin hoặc trà sữa trân châu full topping: Hồi phục +50% Năng Lượng ⚡, xả -15% Stress 🔥 và bật tốc chạy trong 9 giây!';
      buttonText = '☕ PHA CÀ PHÊ (+50% ⚡)';
    } else if (st.type === 'altar') {
      desc = 'Thắp 3 nén hương lên Bàn Thờ Thần Tài - Thổ Địa: Cầu may mắn tài lộc, giải tỏa -25% Stress 🔥, hồi +25% Năng Lượng ⚡ và cộng +100 điểm KPI! (Thắp nhiều lần có thể kích hoạt vận may vé số 2 tỷ!)';
      buttonText = '🙏 THẮP HƯƠNG (+100 đ)';
    } else if (st.type === 'showroom') {
      desc = 'Showroom Mẫu & Fitting Studio: Trưng bày Golden Sample chuẩn và mannequin thời trang xuất khẩu. Kiểm tra form dáng chuẩn quốc tế (-15% Stress, +40 KPI)!';
      buttonText = '👗 KIỂM TRA MẪU (+40 đ)';
    } else if (st.type === 'balcony') {
      desc = 'Ban Công Hóng Gió & Lounge ngoài trời: Ngắm nhìn thành phố và hít thở gió mát giúp xua tan hoàn toàn áp lực công việc (+35% ⚡, -30% Stress)!';
      buttonText = '🌿 HÓNG GIÓ (-30% 🔥)';
    } else if (st.type === 'water') {
      desc = 'Rót cốc nước khoáng Lavie mát lạnh tinh khiết: Hạ nhiệt căng thẳng, giảm ngay -15% Stress 🔥 và tăng +10% Năng Lượng ⚡.';
      buttonText = '🚰 UỐNG NƯỚC MÁT (-15% 🔥)';
    } else if (st.type === 'server') {
      desc = 'Kiểm tra hệ thống Datacenter Server IT cùng Kỹ sư Hoàng: Uptime 99.99%, dữ liệu đơn hàng an toàn. Tích lũy ngay +50 điểm KPI ca trực!';
      buttonText = '🖥️ CHECK SERVER (+50 đ)';
    } else if (st.type === 'lamp') {
      desc = 'Bật / Tắt trực tiếp chiếc đèn sàn đồng thau kiểu Bắc Âu trong phòng khách, đổi ánh sáng ấm cúng cho văn phòng!';
      buttonText = '💡 BẬT/TẮT ĐÈN SÀN';
    } else if (st.type === 'sofa') {
      desc = 'Ngả lưng thư giãn trên chiếc ghế sofa da êm ái: Nạp lại nhanh +35% Năng Lượng ⚡ và xả -25% áp lực Stress 🔥.';
      buttonText = '🛋️ NGHỈ TRƯA (+35% ⚡)';
    } else if (st.type === 'whiteboard') {
      desc = 'Họp chiến lược tại bảng kính VIP Boardroom: Nắm vững quy trình tiêu chuẩn may mẫu AQL 2.5 và nhận +50 điểm KPI!';
      buttonText = '📊 HỌP CHIẾN LƯỢC (+50 đ)';
    } else if (st.type === 'mirror') {
      desc = 'Rửa mặt với dòng nước mát trước gương phòng vệ sinh WC: Lấy lại sự tỉnh táo 100%, hồi phục ngay +20% Năng Lượng ⚡.';
      buttonText = '🪞 RỬA MẶT TỈNH TÁO (+20% ⚡)';
    } else if (st.type === 'boss_desk') {
      desc = 'Báo cáo trực tiếp tiến độ đơn hàng với Giám Đốc Hùng: Trình ký xác nhận hồ sơ và nhận +50 điểm KPI!';
      buttonText = '👔 BÁO CÁO TIẾN ĐỘ (+50 đ)';
    } else if (isTarget) {
      desc = `Nhiệm vụ đơn hàng: ${this.state.currentTask.stepDescription}.`;
      buttonText = `⚡ ${this.getPromptActionText(st.type)}`;
    } else {
      desc = `Trạm làm việc: ${st.name} thuộc khu vực ${st.zone}.`;
      buttonText = '👀 KIỂM TRA TRẠM';
    }

    return { emoji: st.emoji, title, subtitle, desc, buttonText, isTarget };
  }

  doAction(stationOverride?: Workstation): void {
    if (this.state.isFinished) return;
    const activeSt = stationOverride || this.stage.activeStation;
    if (!activeSt) return;

    // Coffee pantry
    if (activeSt.type === 'coffee') {
      if (this.state.energy >= 95 && this.state.stress <= 5) {
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

    // Altar
    if (activeSt.type === 'altar') {
      this.state.altarPrayCount += 1;
      sounds.perk();
      this.state.energy = Math.min(100, this.state.energy + 25);
      this.state.stress = Math.max(0, this.state.stress - 25);
      this.state.score += 100;

      // Lucky jackpot easter egg trigger: Prayed 3+ times
      if (this.state.altarPrayCount >= 3 && Math.random() < 0.3) {
        showToast('🧧 THẦN TÀI MỈM CƯỜI! Bạn vừa trúng số độc đắc 2 tỷ đồng! 🎉');
        this.finishShift('lotto_luck');
        return;
      }

      showToast(`🙏 Thần Tài phù hộ lần #${this.state.altarPrayCount}: Vía lành tài lộc! (+25% ⚡, -25% 🔥, +100 đ)`);
      this.sync();
      return;
    }

    // Showroom Mẫu (Free inspection)
    if (activeSt.type === 'showroom' && activeSt.type !== this.state.currentTask.targetStation) {
      sounds.success();
      this.state.score += 40;
      this.state.stress = Math.max(0, this.state.stress - 15);
      showToast('👗 Kiểm tra mẫu áo showroom: Đường kim mũi chỉ sắc nét, form dáng chuẩn mẫu! (+40 đ, -15% 🔥)');
      this.sync();
      return;
    }

    // Balcony Lounge (Free rest)
    if (activeSt.type === 'balcony' && activeSt.type !== this.state.currentTask.targetStation) {
      sounds.success();
      this.state.energy = Math.min(100, this.state.energy + 35);
      this.state.stress = Math.max(0, this.state.stress - 30);
      showToast('🌿 Hóng gió ban công: Không khí trong lành, xua tan mọi áp lực! (+35% ⚡, -30% 🔥)');
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
    if (activeSt.type === 'server' && activeSt.type !== this.state.currentTask.targetStation) {
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
    if (activeSt.type === 'whiteboard' && activeSt.type !== this.state.currentTask.targetStation) {
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
    if (activeSt.type === 'boss_desk' && activeSt.type !== this.state.currentTask.targetStation) {
      sounds.perk();
      this.state.score += 50;
      showToast('👔 Sếp Hùng: "Làm việc chăm chỉ lắm em, ráng chạy kịp cont cuối năm có thưởng lớn!" (+50 đ)');
      this.sync();
      return;
    }

    // Target task progression
    const task = this.state.currentTask;

    // Handle Active Emergency Crisis
    if (task.isCrisis && task.step === 'emergency_crisis') {
      if (activeSt.type === task.targetStation) {
        sounds.success();
        this.state.score += 180;
        this.state.stress = Math.max(0, this.state.stress - 25);
        this.state.energy = Math.min(100, this.state.energy + 20);

        let resMsg = '🎉 ĐÃ XỬ LÝ SỰ CỐ KHẨN CẤP THÀNH CÔNG! (+180 điểm KPI, -25% Stress)';
        if (task.id === 'crisis_server') {
          resMsg = '🟢 ĐÃ KHỞI ĐỘNG LẠI SERVER IT CÙNG ANH HOÀNG! ERP hoạt động ổn định! (+180 đ)';
        } else if (task.id === 'crisis_lab') {
          resMsg = '🔬 ĐÃ HIỆU CHỈNH CÔNG THỨC NHUỘM VỚI EM LINH! Chuẩn màu Delta E 0.2! (+180 đ)';
        } else if (task.id === 'crisis_boardroom') {
          resMsg = '📊 THUYẾT TRÌNH XUẤT SẮC TẠI BOARDROOM! Buyer quốc tế tán thưởng! (+180 đ)';
        } else if (task.id === 'crisis_inventory') {
          resMsg = '📑 ĐÃ ĐỐI CHIẾU SỔ SÁCH CÙNG CHỊ NGA! Tìm thấy đủ vải trong kho dự phòng! (+180 đ)';
        }

        showToast(resMsg);
        this.startNextOrder(this.state.ordersCompleted);
        this.sync();
        return;
      } else {
        sounds.click();
        showToast(`🚨 ĐANG CÓ SỰ CỐ KHẨN CẤP! Cần đến: ${task.targetZone.toUpperCase()} (${task.targetStation.toUpperCase()}) trước!`);
        return;
      }
    }

    if (activeSt.type !== task.targetStation) {
      sounds.click();
      showToast(`⚠️ Cần đến: ${task.targetZone.toUpperCase()} (${task.targetStation.toUpperCase()}) trước!`);
      return;
    }

    // Check if this station triggers an unexpected office dilemma!
    if (this.pendingDilemmaStation === activeSt.type && this.onTriggerDilemma) {
      const candidates = STATION_DILEMMAS.filter(d => d.stationType === activeSt.type && !this.triggeredDilemmaIds.has(d.id));
      const dilemma = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : STATION_DILEMMAS.find(d => d.stationType === activeSt.type);

      if (dilemma) {
        this.pendingDilemmaStation = null;
        this.triggeredDilemmaIds.add(dilemma.id);
        this.onTriggerDilemma(dilemma, (choice) => {
          const opt = choice === 'A' ? dilemma.optionA : dilemma.optionB;
          const kpiGain = Math.round(opt.kpi * this.state.weather.kpiMultiplier);
          this.state.score += kpiGain;
          this.state.stress = Math.max(0, Math.min(100, this.state.stress + Math.round(opt.stress * this.state.weather.stressDrainMultiplier)));
          this.state.energy = Math.max(0, Math.min(100, this.state.energy + Math.round(opt.energy * this.state.weather.energyDrainMultiplier)));
          this.state.dilemmasResolved += 1;
          this.state.choicesLog.push(`${dilemma.title}: ${opt.text}`);

          showToast(`${opt.resultMsg} (+${kpiGain} KPI)`);
          this.executeStepProgression();
        });
        return;
      }
    }

    this.executeStepProgression();
  }

  private executeStepProgression(): void {
    const archetype = this.state.activeOrderArchetype;
    const currentStep = archetype.steps[this.state.currentOrderStepIndex];

    if (!currentStep) return;

    // Apply step delta stats
    const kpiGain = Math.round(currentStep.kpiReward * this.state.weather.kpiMultiplier);
    this.state.score += kpiGain;
    this.state.energy = Math.max(0, Math.min(100, this.state.energy - currentStep.energyCost * this.state.weather.energyDrainMultiplier));
    this.state.stress = Math.max(0, Math.min(100, this.state.stress + currentStep.stressDelta * this.state.weather.stressDrainMultiplier));

    // Update carried item on player
    this.stage.player.setCarriedItem(currentStep.carriedItem);

    // Is there a next step in this archetype?
    const nextStepIndex = this.state.currentOrderStepIndex + 1;
    if (nextStepIndex < archetype.steps.length) {
      sounds.success();
      this.state.currentOrderStepIndex = nextStepIndex;
      const nextStep = archetype.steps[nextStepIndex];

      this.state.currentTask = {
        id: `task_${archetype.id}_step_${nextStepIndex}`,
        orderName: archetype.title,
        client: archetype.client,
        step: nextStep.stepId,
        stepDescription: nextStep.instruction,
        targetStation: nextStep.targetStation,
        targetZone: nextStep.targetZone,
        isCrisis: false
      };

      showToast(`✅ Đã xong bước: ${currentStep.stepName}! Tiếp tục qua ${nextStep.targetZone} (${nextStep.targetStation.toUpperCase()})`);
      this.sync();
    } else {
      // Completed all steps in this Order Archetype!
      sounds.success();
      this.stage.player.setCarriedItem('none');
      this.state.ordersCompleted += 1;
      const orderBonus = Math.round(250 * this.state.weather.kpiMultiplier);
      this.state.score += orderBonus;
      this.state.stress = Math.max(0, this.state.stress - 20);

      showToast(`🎉 XUẤT XƯỞNG THÀNH CÔNG: "${archetype.title}"! (#${this.state.ordersCompleted}/${this.state.targetOrders} cont, +${orderBonus} KPI)`);

      if (this.state.ordersCompleted >= this.state.targetOrders) {
        this.finishShift();
        return;
      }

      // Trigger one of the 4 Emergency Crises between orders!
      const crisisIndex = this.state.ordersCompleted - 1; // 0, 1, 2, 3
      if (crisisIndex === 0) {
        this.state.currentTask = this.createCrisisTask(
          'crisis_server',
          '🚨 SẬP MẠNG NỘI BỘ IT',
          'server',
          'Khu Vực Kỹ Thuật',
          '🚨 Máy chủ Server ERP quá tải! Chạy gấp đến TỦ SERVER (-19.5, 10) cùng Anh Hoàng khôi phục!'
        );
        sounds.perk();
        showToast('🚨 BÁO ĐỘNG ĐỎ: Máy chủ ERP phòng IT sập! Chạy ngay đến phòng Server khắc phục!');
      } else if (crisisIndex === 1) {
        this.state.currentTask = this.createCrisisTask(
          'crisis_lab',
          '⚠️ LỆCH MÀU LAB DELTA E > 1.5',
          'lab',
          'Xưởng Cắt & Lab',
          '⚠️ Mẫu vải nhuộm bị ánh vàng lệch D65! Chạy ngay đến PHÒNG LAB cùng Em Linh hiệu chỉnh!'
        );
        sounds.perk();
        showToast('⚠️ CẢNH BÁO: Mẫu vải nhuộm bị lệch màu! Chạy gấp sang Phòng Lab hiệu chỉnh!');
      } else if (crisisIndex === 2) {
        this.state.currentTask = this.createCrisisTask(
          'crisis_boardroom',
          '👔 SẾP HÙNG GỌI HỌP KHẨN',
          'whiteboard',
          'Phòng Họp VIP',
          '👔 Đoàn Buyer Mỹ & Ban Giám Đốc bất ngờ tới! Chạy ngay vào PHÒNG HỌP báo cáo tiến độ!'
        );
        sounds.perk();
        showToast('👔 SẾP HÙNG GỌI KHẨN: Đoàn Buyer Mỹ đến xưởng! Vào ngay Phòng Họp báo cáo!');
      } else if (crisisIndex === 3) {
        this.state.currentTask = this.createCrisisTask(
          'crisis_inventory',
          '📦 LỆCH TỒN KHO THỰC TẾ',
          'fabric',
          'Kho Vải Đại Ngàn',
          '📦 Kho báo thiếu 500m vải lót! Chạy xuống BÀN KẾ TOÁN KHO VẢI đối chiếu cùng Chị Nga!'
        );
        sounds.perk();
        showToast('📦 CẢNH BÁO: Kho vải lệch số tồn thực tế! Xuống ngay Kho Vải đối chiếu sổ sách!');
      }

      this.sync();
    }
  }

  private startNextOrder(orderIndex: number): void {
    const nextArchetype = ORDER_ARCHETYPES[orderIndex % ORDER_ARCHETYPES.length];
    this.state.activeOrderArchetype = nextArchetype;
    this.state.currentOrderStepIndex = 0;
    this.state.currentTask = this.createTaskFromArchetype(nextArchetype, 0);
  }

  public interactWithColleague(colleagueId: 'boss' | 'nga' | 'tuan' | 'linh' | 'hoang', optionId: string): {
    reply: string;
    favorDelta: number;
    newFavor: number;
    perkUnlocked: boolean;
  } {
    const profile = COLLEAGUES_DATA[colleagueId];
    if (!profile) {
      return { reply: 'Chào bạn nhé!', favorDelta: 0, newFavor: 20, perkUnlocked: false };
    }

    const opt = profile.options.find(o => o.id === optionId) || profile.options[0];

    // Check Rage Quit confrontation condition:
    if (colleagueId === 'boss' && this.state.stress >= 85) {
      this.state.confrontBossCount += 1;
      if (this.state.confrontBossCount >= 2) {
        this.finishShift('rage_quit');
        return {
          reply: 'Đập bàn nộp đơn nghỉ việc! Tôi không thể chịu nổi nữa!',
          favorDelta: -50,
          newFavor: 0,
          perkUnlocked: false
        };
      }
    }

    // Apply favor & stat deltas
    const currentFavor = this.state.colleagueFavors[colleagueId] || 20;
    const newFavor = Math.max(0, Math.min(100, currentFavor + opt.favorDelta));
    this.state.colleagueFavors[colleagueId] = newFavor;

    this.state.energy = Math.max(0, Math.min(100, this.state.energy + opt.energyDelta));
    this.state.stress = Math.max(0, Math.min(100, this.state.stress + opt.stressDelta));
    this.state.score += Math.round(opt.kpiDelta * this.state.weather.kpiMultiplier);

    const perkUnlocked = currentFavor < 50 && newFavor >= 50;

    sounds.perk();
    this.sync();

    return {
      reply: opt.reply,
      favorDelta: opt.favorDelta,
      newFavor,
      perkUnlocked
    };
  }

  public finishShift(forcedEndingId?: ShiftEnding['id']): void {
    this.state.isFinished = true;

    if (forcedEndingId && SHIFT_ENDINGS[forcedEndingId]) {
      this.state.ending = SHIFT_ENDINGS[forcedEndingId];
      this.state.grade = this.state.ending.grade;
      sounds.success();
      this.sync();
      return;
    }

    // Determine narrative ending based on performance, favors, stress, and prayers:
    let chosenId: ShiftEnding['id'] = 'hardworking';

    const avgFavor = (
      this.state.colleagueFavors.boss +
      this.state.colleagueFavors.nga +
      this.state.colleagueFavors.tuan +
      this.state.colleagueFavors.linh +
      this.state.colleagueFavors.hoang
    ) / 5;

    if (this.state.altarPrayCount >= 3 && Math.random() < 0.4) {
      chosenId = 'lotto_luck';
    } else if (avgFavor >= 60) {
      chosenId = 'social_butterfly';
    } else if (this.state.ordersCompleted >= 5 && this.state.score >= 1700 && this.state.stress <= 35) {
      chosenId = 'legend';
    } else if (this.state.ordersCompleted < 3) {
      chosenId = 'aql_disaster';
    } else {
      chosenId = 'hardworking';
    }

    this.state.ending = SHIFT_ENDINGS[chosenId];
    this.state.grade = this.state.ending.grade;

    sounds.success();
    this.sync();
  }

  private sync(): void {
    this.onStateChange(this.state);
  }
}
