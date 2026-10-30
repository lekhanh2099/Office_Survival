import { ShiftState } from '../3d/ShiftGameEngine';
import { OfficeStage } from '../3d/OfficeStage';

const stationCoords: Record<string, [number, number]> = {
  desk: [-10.5, -13.0],
  printer: [-4, -12],
  lab: [12, -9.5],
  fabric: [-14, 12],
  shipping: [13, 15],
  coffee: [0, 2.6],
  altar: [-14, -18.4]
};

export function mountShiftHUD(host: HTMLElement): void {
  host.innerHTML = `
    <!-- Top Status Ribbon (Single sleek integrated row across top) -->
    <header class="shiftTopRibbon">
      <div class="ribbonClock">
        <span class="clockIcon">⏰</span>
        <span class="clockTime" id="hudClock">09:00</span>
        <span class="ribbonDay" id="hudDay">N1</span>
      </div>

      <div class="ribbonMeters">
        <div class="meterGroup" title="Năng lượng">
          <span class="meterIcon">⚡</span>
          <span class="meterVal" id="hudEnergyVal">100%</span>
          <div class="meterTrack">
            <div class="meterFill" id="hudEnergyFill" style="width:100%;background:#22c55e"></div>
          </div>
        </div>

        <div class="meterGroup" title="Áp lực stress">
          <span class="meterIcon">🔥</span>
          <span class="meterVal" id="hudStressVal">10%</span>
          <div class="meterTrack">
            <div class="meterFill" id="hudStressFill" style="width:10%;background:#fb923c"></div>
          </div>
        </div>
      </div>

      <div class="ribbonOrders" title="Đơn hàng đã xuất">
        <span class="orderIcon">📦</span>
        <span class="orderCount" id="hudOrders">0/3</span>
      </div>
    </header>

    <!-- Quest Banner (Floats left beneath ribbon, ends before radar) -->
    <div class="shiftQuestBanner">
      <div class="questPulseIcon">🎯</div>
      <div class="questContent">
        <div class="questTagRow">
          <span class="questZoneBadge" id="hudZoneBadge">🏢 VĂN PHÒNG</span>
          <span class="questOrderName" id="hudOrderName">ĐƠN HÀNG</span>
        </div>
        <div class="questInstruction" id="hudQuestText">Nhiệm vụ đang tải...</div>
      </div>
    </div>

    <!-- Circular Mini Radar (Floats right beneath ribbon, NO OVERLAP) -->
    <div class="shiftMiniRadar" title="Radar khuôn viên dệt may">
      <div class="radarQuadrant q1" title="Văn Phòng">VP</div>
      <div class="radarQuadrant q2" title="Lab Màu">LAB</div>
      <div class="radarQuadrant q3" title="Kho Vải">KHO</div>
      <div class="radarQuadrant q4" title="Cảng Cont">CẢNG</div>
      <div class="radarPantryIcon">🧋</div>

      <!-- Target Objective Blinking Gold Star -->
      <div class="radarTargetDot" id="hudTargetDot" title="Mục tiêu tiếp theo">⭐</div>

      <!-- Player Dot (Cyan) -->
      <div class="radarPlayerDot" id="hudPlayerDot"></div>

      <!-- Boss Dot (Red) -->
      <div class="radarBossDot" id="hudBossDot"></div>
    </div>

    <!-- Camera Diorama Switcher Button -->
    <button class="shiftCamToggleBtn" id="hudCamBtn" data-act="toggle_camera" type="button" title="Chuyển đổi góc máy Toàn Cảnh / Theo Dõi Chibi">
      🎥 Toàn Cảnh
    </button>

    <!-- Active Colleague Speech Bubble (Comic dialogue in world projection) -->
    <div class="colleagueSpeechBubble" id="hudSpeechBubble" style="display:none">
      <div class="bubbleTail"></div>
      <div class="bubbleHeader">
        <span class="bubbleAvatar" id="speechAvatar">👔</span>
        <span class="bubbleSpeaker" id="speechSpeaker">Sếp Hùng</span>
        <span class="bubbleRole" id="speechRole">· GĐ</span>
      </div>
      <div class="bubbleText" id="speechText"></div>
    </div>
  `;
}

export function updateShiftHUD(host: HTMLElement, state: ShiftState, stage?: OfficeStage): void {
  // If not mounted yet, mount initial DOM
  if (!host.querySelector('#hudClock')) {
    mountShiftHUD(host);
  }

  const timeStr = `${String(state.timeHour).padStart(2, '0')}:${String(state.timeMinute).padStart(2, '0')}`;
  const energyPct = Math.max(0, Math.min(100, state.energy));
  const stressPct = Math.max(0, Math.min(100, state.stress));

  let energyColor = '#22c55e';
  if (state.energy < 30) energyColor = '#ef4444';
  else if (state.energy < 60) energyColor = '#f59e0b';

  // Ribbon
  const clockEl = host.querySelector('#hudClock');
  if (clockEl) clockEl.textContent = timeStr;

  const dayEl = host.querySelector('#hudDay');
  if (dayEl) dayEl.textContent = `N${state.day}`;

  const energyVal = host.querySelector('#hudEnergyVal');
  if (energyVal) energyVal.textContent = `${Math.round(state.energy)}%`;

  const energyFill = host.querySelector('#hudEnergyFill') as HTMLElement;
  if (energyFill) {
    energyFill.style.width = `${energyPct}%`;
    energyFill.style.background = energyColor;
  }

  const stressVal = host.querySelector('#hudStressVal');
  if (stressVal) stressVal.textContent = `${Math.round(state.stress)}%`;

  const stressFill = host.querySelector('#hudStressFill') as HTMLElement;
  if (stressFill) {
    stressFill.style.width = `${stressPct}%`;
    stressFill.style.background = state.stress > 60 ? '#ef4444' : '#fb923c';
  }

  const ordersEl = host.querySelector('#hudOrders');
  if (ordersEl) ordersEl.textContent = `${state.ordersCompleted}/${state.targetOrders}`;

  // Quest Banner
  const zoneBadge = host.querySelector('#hudZoneBadge');
  if (zoneBadge) zoneBadge.textContent = state.currentZone;

  const orderName = host.querySelector('#hudOrderName');
  if (orderName) orderName.textContent = state.currentTask.orderName;

  const questText = host.querySelector('#hudQuestText');
  if (questText) questText.textContent = state.currentTask.stepDescription;

  // Radar Normalized Coordinates (Bounds: X [-30, 30], Z [-23, 23])
  let pX = 50;
  let pZ = 50;
  let bossX = 25;
  let bossZ = 25;

  if (stage) {
    const pPos = stage.player.getPosition();
    pX = Math.max(8, Math.min(92, ((pPos.x + 30) / 60) * 100));
    pZ = Math.max(8, Math.min(92, ((pPos.z + 23) / 46) * 100));

    if (stage.bossNpc) {
      const bPos = stage.bossNpc.group.position;
      bossX = Math.max(8, Math.min(92, ((bPos.x + 30) / 60) * 100));
      bossZ = Math.max(8, Math.min(92, ((bPos.z + 23) / 46) * 100));
    }
  }

  const targetC = stationCoords[state.currentTask.targetStation] || [-10.5, -13.0];
  const tgtX = Math.max(10, Math.min(90, ((targetC[0] + 30) / 60) * 100));
  const tgtZ = Math.max(10, Math.min(90, ((targetC[1] + 23) / 46) * 100));

  const pDot = host.querySelector('#hudPlayerDot') as HTMLElement;
  if (pDot) {
    pDot.style.left = `${pX}%`;
    pDot.style.top = `${pZ}%`;
  }

  const bDot = host.querySelector('#hudBossDot') as HTMLElement;
  if (bDot) {
    bDot.style.left = `${bossX}%`;
    bDot.style.top = `${bossZ}%`;
  }

  const tgtDot = host.querySelector('#hudTargetDot') as HTMLElement;
  if (tgtDot) {
    tgtDot.style.left = `${tgtX}%`;
    tgtDot.style.top = `${tgtZ}%`;
  }

  // Camera Toggle Button
  const camBtn = host.querySelector('#hudCamBtn');
  if (camBtn) {
    camBtn.textContent = stage?.cameraMode === 'overview' ? '🏃 Bám Sát' : '🎥 Toàn Cảnh';
  }

  // Speech Bubble
  const bubble = host.querySelector('#hudSpeechBubble') as HTMLElement;
  if (bubble && stage) {
    const speech = stage.getActiveSpeechScreenData();
    if (speech) {
      bubble.style.display = 'block';
      bubble.style.left = `${speech.x}px`;
      bubble.style.top = `${speech.y}px`;

      const avatar = host.querySelector('#speechAvatar') as HTMLElement;
      if (avatar) {
        avatar.textContent = speech.emoji;
        avatar.style.background = speech.avatarBg;
      }

      const spk = host.querySelector('#speechSpeaker');
      if (spk) spk.textContent = speech.speaker;

      const role = host.querySelector('#speechRole');
      if (role) role.textContent = `· ${speech.role}`;

      const txt = host.querySelector('#speechText');
      if (txt) txt.textContent = speech.text;
    } else {
      bubble.style.display = 'none';
    }
  }
}

export function renderShiftFinishModal(state: ShiftState): string {
  let quote = 'Mr. David (Buyer New York): "Outstanding! 3 đơn hàng may chuẩn form, lab-dip màu D65 xuất sắc, cont hàng lên tàu đúng hạn!"';
  let badgeColor = '#22c55e';

  if (state.grade === 'S') {
    quote = 'Sếp Hùng: "Chiến thần Merchandiser thực thụ! Xuyên suốt cả xưởng cắt lẫn kho vải không phạm một sai lầm nào!"';
    badgeColor = '#eab308';
  } else if (state.grade === 'C' || state.grade === 'F') {
    quote = 'Chị Nga Kế Toán: "Suýt nữa là trễ Closing time cảng Cát Lái và thất thoát vải thun nhé! Mai phải chạy việc nhanh hơn!"';
    badgeColor = '#f97316';
  }

  return `
  <section class="panel shiftClearPanel">
    <div class="clearEmoji">🌆🏢🚢✨</div>
    <div class="eyebrow" style="color:#16a34a">ĐỒNG HỒ ĐIỂM 17:00 · HOÀN THÀNH CA TRỰC TOÀN KHU!</div>
    <h1 class="clearTitle">KẾT QUẢ NGÀY ${state.day}</h1>

    <!-- Grade Stamp -->
    <div class="shiftGradeBadge" style="border-color:${badgeColor};color:${badgeColor}">
      <span>XẾP LOẠI KPI TOÀN CA</span>
      <strong>${state.grade || 'A'}</strong>
    </div>

    <p class="shiftQuoteBox">"${quote}"</p>

    <!-- Stats Grid -->
    <div class="summaryGrid shiftSummaryGrid">
      <div class="summaryBox">Đơn hàng xuất xưởng<strong>${state.ordersCompleted} / ${state.targetOrders} cont</strong></div>
      <div class="summaryBox">Tiền thưởng KPI<strong>+${state.score} đ</strong></div>
      <div class="summaryBox">Năng lượng còn lại<strong>${Math.round(state.energy)}%</strong></div>
      <div class="summaryBox">Áp lực stress<strong>${Math.round(state.stress)}%</strong></div>
    </div>

    <div class="buttons" style="margin-top:14px;gap:8px">
      <button class="primary btnNextShift" data-act="shift_next_day">
        ☀️ BƯỚC VÀO CA TRỰC NGÀY TIẾP THEO →
      </button>
      <button class="secondary" data-act="shift_to_menu" style="width:100%;padding:10px;font-size:12px;margin-top:4px">
        ↩ Về Sảnh Chính & Cốt Truyện
      </button>
    </div>
  </section>
  `;
}
