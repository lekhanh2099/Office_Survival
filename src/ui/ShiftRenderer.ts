import { ShiftState } from '../3d/ShiftGameEngine';
import { OfficeStage } from '../3d/OfficeStage';

function esc(t?: string | number | null): string {
  return String(t ?? '').replace(/[&<>"']/g, x => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[x] || x));
}

export function renderShiftHUD(state: ShiftState, stage?: OfficeStage): string {
  const timeStr = `${String(state.timeHour).padStart(2, '0')}:${String(state.timeMinute).padStart(2, '0')}`;
  const energyPct = Math.max(0, Math.min(100, state.energy));
  const stressPct = Math.max(0, Math.min(100, state.stress));

  let energyColor = '#22c55e';
  if (state.energy < 30) energyColor = '#ef4444';
  else if (state.energy < 60) energyColor = '#f59e0b';

  // Calculate Minimap Coordinates (Normalized 0-100%)
  // Bounds: X [-30, 30], Z [-23, 23]
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

  // Calculate Target Station Beacon position for radar
  const stationCoords: Record<string, [number, number]> = {
    desk: [-10, -8],
    printer: [-4, -12],
    lab: [12, -10],
    fabric: [-14, 10],
    shipping: [14, 14],
    coffee: [0, 0],
    altar: [-14, -20]
  };
  const targetC = stationCoords[state.currentTask.targetStation] || [-10, -8];
  const tgtX = Math.max(10, Math.min(90, ((targetC[0] + 30) / 60) * 100));
  const tgtZ = Math.max(10, Math.min(90, ((targetC[1] + 23) / 46) * 100));

  let speechBubbleHTML = '';
  if (stage) {
    const speech = stage.getActiveSpeechScreenData();
    if (speech) {
      speechBubbleHTML = `
      <div class="colleagueSpeechBubble" style="left:${speech.x}px;top:${speech.y}px">
        <div class="bubbleTail"></div>
        <div class="bubbleHeader">
          <span class="bubbleAvatar" style="background:${speech.avatarBg}">${speech.emoji}</span>
          <span class="bubbleSpeaker">${esc(speech.speaker)}</span>
          <span class="bubbleRole">· ${esc(speech.role)}</span>
        </div>
        <div class="bubbleText">${esc(speech.text)}</div>
      </div>
      `;
    }
  }

  const camLabel = stage?.cameraMode === 'overview' ? '🏃 Bám Sát' : '🎥 Toàn Cảnh';
  const camBtnHTML = `
  <button class="shiftCamToggleBtn" data-act="toggle_camera" title="Chuyển đổi góc máy Toàn Cảnh / Theo Dõi Chibi">
    ${camLabel}
  </button>
  `;

  return `
  <!-- Top Status Ribbon (Single sleek integrated row across top) -->
  <header class="shiftTopRibbon">
    <div class="ribbonClock">
      <span class="clockIcon">⏰</span>
      <span class="clockTime">${timeStr}</span>
      <span class="ribbonDay">N${state.day}</span>
    </div>

    <div class="ribbonMeters">
      <div class="meterGroup" title="Năng lượng">
        <span class="meterIcon">⚡</span>
        <span class="meterVal">${Math.round(state.energy)}%</span>
        <div class="meterTrack">
          <div class="meterFill" style="width:${energyPct}%;background:${energyColor}"></div>
        </div>
      </div>

      <div class="meterGroup" title="Áp lực stress">
        <span class="meterIcon">🔥</span>
        <span class="meterVal">${Math.round(state.stress)}%</span>
        <div class="meterTrack">
          <div class="meterFill" style="width:${stressPct}%;background:${state.stress > 60 ? '#ef4444' : '#fb923c'}"></div>
        </div>
      </div>
    </div>

    <div class="ribbonOrders" title="Đơn hàng đã xuất">
      <span class="orderIcon">📦</span>
      <span class="orderCount">${state.ordersCompleted}/${state.targetOrders}</span>
    </div>
  </header>

  <!-- Quest Banner (Floats left beneath ribbon, ends before radar) -->
  <div class="shiftQuestBanner">
    <div class="questPulseIcon">🎯</div>
    <div class="questContent">
      <div class="questTagRow">
        <span class="questZoneBadge">${esc(state.currentZone)}</span>
        <span class="questOrderName">${esc(state.currentTask.orderName)}</span>
      </div>
      <div class="questInstruction">${esc(state.currentTask.stepDescription)}</div>
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
    <div class="radarTargetDot" style="left:${tgtX}%;top:${tgtZ}%" title="Mục tiêu tiếp theo">⭐</div>

    <!-- Player Dot (Cyan) -->
    <div class="radarPlayerDot" style="left:${pX}%;top:${pZ}%"></div>

    <!-- Boss Dot (Red) -->
    <div class="radarBossDot" style="left:${bossX}%;top:${bossZ}%"></div>
  </div>

  <!-- Camera Diorama Switcher Button -->
  ${camBtnHTML}

  <!-- Active Colleague Speech Bubble (Comic dialogue in world projection) -->
  ${speechBubbleHTML}
  `;
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
