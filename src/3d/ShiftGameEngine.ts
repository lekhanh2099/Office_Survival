import { OfficeStage, Workstation } from './OfficeStage';
import { sounds } from '../audio/SoundManager';
import { showToast } from '../ui/Toast';

export interface ShiftTask {
  id: string;
  orderName: string;
  client: string;
  step: 'desk_receive' | 'printer_techpack' | 'fabric_pick' | 'shipping_deliver';
  stepDescription: string;
  targetStation: 'desk' | 'printer' | 'fabric' | 'shipping';
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
  grade?: 'S' | 'A' | 'B' | 'C' | 'F';
}

export class ShiftGameEngine {
  private stage: OfficeStage;
  private state: ShiftState;
  private onStateChange: (state: ShiftState) => void;

  private clockTimer = 0;
  private bossCooldown = 0;
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
      activePrompt: null
    };
  }

  private createNewTask(orderIndex: number): ShiftTask {
    const o = this.sampleOrders[orderIndex % this.sampleOrders.length];
    return {
      id: `task_${Date.now()}`,
      orderName: o.orderName,
      client: o.client,
      step: 'desk_receive',
      stepDescription: `Đến BÀN LÀM VIỆC nhận hợp đồng: "${o.orderName}"`,
      targetStation: 'desk'
    };
  }

  getState(): ShiftState {
    return this.state;
  }

  update(delta: number): void {
    if (this.state.isFinished) return;

    // 1. Clock Progression (9:00 -> 17:00 in ~140 seconds)
    this.clockTimer += delta;
    if (this.clockTimer >= 0.28) {
      this.clockTimer = 0;
      this.state.timeMinute += 1;
      if (this.state.timeMinute >= 60) {
        this.state.timeMinute = 0;
        this.state.timeHour += 1;
      }

      // Natural energy decay
      this.state.energy = Math.max(0, this.state.energy - 0.08);

      // Check Shift End at 17:00
      if (this.state.timeHour >= 17) {
        this.finishShift();
        return;
      }
    }

    // 2. Speed Boost handling
    if (this.speedBoostTimer > 0) {
      this.speedBoostTimer -= delta;
      this.stage.player.moveSpeed = 6.2;
    } else {
      // Slower if exhausted
      this.stage.player.moveSpeed = this.state.energy < 20 ? 3.0 : 4.8;
    }

    // 3. Sếp Patrol Warning Check
    if (this.bossCooldown > 0) {
      this.bossCooldown -= delta;
    } else if (this.stage.isPlayerCaughtByBoss()) {
      // If caught while empty handed, boss scolds!
      if (this.stage.player.carriedItem === 'none') {
        this.bossCooldown = 4.0;
        this.state.stress = Math.min(100, this.state.stress + 15);
        sounds.damage();
        showToast('⚠️ SẾP HÙNG: "Chưa in xong Techpack mà đi dạo à?!" (+15% Stress)');
        this.sync();
      }
    }

    // 4. Update Station Interaction Prompt
    const activeSt = this.stage.activeStation;
    if (activeSt) {
      if (activeSt.type === 'coffee') {
        this.state.activePrompt = '🧋 UỐNG TRÀ SỮA (Hồi Năng Lượng & Tăng Tốc)';
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
      case 'fabric': return 'Bốc Cuộn Vải Chuẩn Màu 🧵';
      case 'shipping': return 'Nộp Kiện Hàng Vào Cont 🚢';
      default: return 'Làm Việc';
    }
  }

  doAction(): void {
    if (this.state.isFinished) return;
    const activeSt = this.stage.activeStation;
    if (!activeSt) return;

    // Coffee / Boba station
    if (activeSt.type === 'coffee') {
      if (this.state.energy >= 95) {
        showToast('🧋 Bụng no căng trà sữa rồi, chạy việc tiếp thôi!');
        return;
      }
      sounds.success();
      this.state.energy = Math.min(100, this.state.energy + 45);
      this.state.stress = Math.max(0, this.state.stress - 10);
      this.speedBoostTimer = 7.0;
      this.stage.player.setCarriedItem('coffee_cup');
      setTimeout(() => {
        if (this.stage.player.carriedItem === 'coffee_cup') {
          this.stage.player.setCarriedItem('none');
        }
      }, 3500);

      showToast('🧋 Nạp Trà Sữa Full Top: Hồi phục +45% Năng Lượng & Bật Tốc Chạy ⚡');
      this.sync();
      return;
    }

    // Task progression check
    const task = this.state.currentTask;
    if (activeSt.type !== task.targetStation) {
      sounds.click();
      showToast(`⚠️ Cần đến: ${task.targetStation.toUpperCase()} trước!`);
      return;
    }

    // Handle Task Step Transitions
    if (task.step === 'desk_receive') {
      sounds.click();
      this.stage.player.setCarriedItem('paper_stack');
      task.step = 'printer_techpack';
      task.targetStation = 'printer';
      task.stepDescription = 'Mang hồ sơ tới MÁY IN 🖨️ in Techpack & Bảng màu';
      showToast('📄 Đã nhận hồ sơ! Mau chạy qua Máy In.');
    } else if (task.step === 'printer_techpack') {
      sounds.success();
      task.step = 'fabric_pick';
      task.targetStation = 'fabric';
      task.stepDescription = 'Đến KHO VẢI 🧵 bốc cuộn vải chuẩn màu Spandex';
      showToast('🖨️ Đã in xong Techpack! Chạy qua Kho Vải lấy mẫu.');
    } else if (task.step === 'fabric_pick') {
      sounds.click();
      this.stage.player.setCarriedItem('fabric_roll');
      task.step = 'shipping_deliver';
      task.targetStation = 'shipping';
      task.stepDescription = 'Vác cuộn vải tới CỔNG CONT 🚢 xuất hàng trước Cut-off!';
      showToast('🧵 Đã bốc cuộn vải! Chạy ngay ra Cổng Cảng xuất hàng.');
    } else if (task.step === 'shipping_deliver') {
      // Completed 1 order!
      sounds.success();
      this.stage.player.setCarriedItem('none');
      this.state.ordersCompleted += 1;
      this.state.score += 150;
      this.state.stress = Math.max(0, this.state.stress - 15);

      showToast(`🎉 XUẤT XƯỞNG THÀNH CÔNG ĐƠN HÀNG #${this.state.ordersCompleted}! (+150 điểm)`);

      // Check if target reached
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

    // Calculate Grade
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
