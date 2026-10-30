import { ShiftState } from '../3d/ShiftGameEngine';
import { OfficeStage } from '../3d/OfficeStage';

const stationCoords: Record<string, [number, number]> = {
  desk: [-10.5, -13.0],
  printer: [-4.0, -12.0],
  lab: [12.0, -9.5],
  fabric: [-14.0, 12.0],
  shipping: [13.0, 15.0],
  coffee: [-1.2, 1.5],
  altar: [-14.0, -18.4],
  water: [-2.8, -1.8],
  server: [-21.25, 10.0],
  lamp: [2.4, 4.3],
  sofa: [0.0, 4.7],
  whiteboard: [-18.0, -13.5],
  mirror: [-21.0, 1.0],
  boss_desk: [-18.0, -19.5]
};

interface HUDElementCache {
  host: HTMLElement;
  clock: HTMLElement | null;
  day: HTMLElement | null;
  energyVal: HTMLElement | null;
  energyFill: HTMLElement | null;
  stressVal: HTMLElement | null;
  stressFill: HTMLElement | null;
  orders: HTMLElement | null;
  zoneBadge: HTMLElement | null;
  orderName: HTMLElement | null;
  questText: HTMLElement | null;
  playerDot: HTMLElement | null;
  bossDot: HTMLElement | null;
  targetDot: HTMLElement | null;
  camBtn: HTMLElement | null;
  modeBtn: HTMLElement | null;
  speechBubble: HTMLElement | null;
  speechAvatar: HTMLElement | null;
  speechSpeaker: HTMLElement | null;
  speechRole: HTMLElement | null;
  speechText: HTMLElement | null;
}

let hudCache: HUDElementCache | null = null;
let lastTimeStr = '';
let lastDay = -1;
let lastEnergy = -1;
let lastStress = -1;
let lastOrdersStr = '';
let lastZone = '';
let lastOrderName = '';
let lastQuestText = '';
let lastCamMode = '';
let lastInteractionMode = '';
let lastPX = -999;
let lastPZ = -999;
let lastBossX = -999;
let lastBossZ = -999;
let lastEnergyColor = '';
let lastTargetStation = '';
let cachedInteractionMode = '';

export function getCachedInteractionMode(): 'auto_work' | 'card' {
  if (!cachedInteractionMode) {
    cachedInteractionMode = localStorage.getItem('os_interaction_mode') || 'auto_work';
  }
  return cachedInteractionMode as 'auto_work' | 'card';
}

export function setCachedInteractionMode(mode: 'auto_work' | 'card'): void {
  cachedInteractionMode = mode;
  try {
    localStorage.setItem('os_interaction_mode', mode);
  } catch {}
}

export function mountShiftHUD(host: HTMLElement): void {
  // Reset dirty tracking cache
  lastTimeStr = '';
  lastDay = -1;
  lastEnergy = -1;
  lastStress = -1;
  lastOrdersStr = '';
  lastZone = '';
  lastOrderName = '';
  lastQuestText = '';
  lastCamMode = '';
  lastInteractionMode = '';
  lastPX = -999;
  lastPZ = -999;
  lastBossX = -999;
  lastBossZ = -999;
  lastEnergyColor = '';
  lastTargetStation = '';

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

    <!-- Interaction Mode Switcher Button (Auto-Run vs Confirmation Card) -->
    <button class="shiftModeToggleBtn" id="hudModeToggleBtn" data-act="toggle_interaction_mode" type="button" title="Chuyển chế độ thao tác: Tự Chạy Làm Ngay hoặc Hiện Thẻ Xác Nhận">
      ⚡ Chạy Làm Ngay
    </button>

    <!-- Station Action Confirmation Card (Popover) -->
    <div class="stationActionCard" id="hudActionCard" style="display:none">
      <button class="actionCardCloseBtn" id="cardCloseBtn" data-act="close_action_card" type="button" aria-label="Đóng thẻ">✕</button>
      <div class="actionCardHeader">
        <span class="actionCardEmoji" id="cardEmoji">💻</span>
        <div class="actionCardTitles">
          <div class="actionCardTitle" id="cardTitle">Bàn Merchandiser</div>
          <div class="actionCardSubtitle" id="cardSubtitle">🏢 Văn Phòng Điều Hành</div>
        </div>
      </div>
      <div class="actionCardDesc" id="cardDesc">
        Nhận đơn hàng mới & Ký hợp đồng xuất khẩu.
      </div>
      <div class="actionCardActions">
        <button class="primary actionCardConfirmBtn" id="cardConfirmBtn" data-act="confirm_action_card" type="button">
          🚀 LÀM VIỆC NGAY
        </button>
      </div>
    </div>

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

  hudCache = {
    host,
    clock: host.querySelector('#hudClock'),
    day: host.querySelector('#hudDay'),
    energyVal: host.querySelector('#hudEnergyVal'),
    energyFill: host.querySelector('#hudEnergyFill'),
    stressVal: host.querySelector('#hudStressVal'),
    stressFill: host.querySelector('#hudStressFill'),
    orders: host.querySelector('#hudOrders'),
    zoneBadge: host.querySelector('#hudZoneBadge'),
    orderName: host.querySelector('#hudOrderName'),
    questText: host.querySelector('#hudQuestText'),
    playerDot: host.querySelector('#hudPlayerDot'),
    bossDot: host.querySelector('#hudBossDot'),
    targetDot: host.querySelector('#hudTargetDot'),
    camBtn: host.querySelector('#hudCamBtn'),
    modeBtn: host.querySelector('#hudModeToggleBtn'),
    speechBubble: host.querySelector('#hudSpeechBubble'),
    speechAvatar: host.querySelector('#speechAvatar'),
    speechSpeaker: host.querySelector('#speechSpeaker'),
    speechRole: host.querySelector('#speechRole'),
    speechText: host.querySelector('#speechText')
  };
}

export function updateShiftHUD(host: HTMLElement, state: ShiftState, stage?: OfficeStage): void {
  // If not mounted yet, mount initial DOM
  if (!hudCache || hudCache.host !== host || !hudCache.clock) {
    mountShiftHUD(host);
  }
  if (!hudCache) return;

  const timeStr = `${String(state.timeHour).padStart(2, '0')}:${String(state.timeMinute).padStart(2, '0')}`;
  if (timeStr !== lastTimeStr) {
    lastTimeStr = timeStr;
    if (hudCache.clock) hudCache.clock.textContent = timeStr;
  }

  if (state.day !== lastDay) {
    lastDay = state.day;
    if (hudCache.day) hudCache.day.textContent = `N${state.day}`;
  }

  const roundedEnergy = Math.round(state.energy);
  if (roundedEnergy !== lastEnergy) {
    lastEnergy = roundedEnergy;
    if (hudCache.energyVal) hudCache.energyVal.textContent = `${roundedEnergy}%`;
    if (hudCache.energyFill) {
      hudCache.energyFill.style.width = `${Math.max(0, Math.min(100, state.energy))}%`;
      const color = roundedEnergy < 30 ? '#ef4444' : (roundedEnergy < 60 ? '#f59e0b' : '#22c55e');
      if (color !== lastEnergyColor) {
        lastEnergyColor = color;
        hudCache.energyFill.style.background = color;
      }
    }
  }

  const roundedStress = Math.round(state.stress);
  if (roundedStress !== lastStress) {
    lastStress = roundedStress;
    if (hudCache.stressVal) hudCache.stressVal.textContent = `${roundedStress}%`;
    if (hudCache.stressFill) {
      hudCache.stressFill.style.width = `${Math.max(0, Math.min(100, state.stress))}%`;
      hudCache.stressFill.style.background = roundedStress > 60 ? '#ef4444' : '#fb923c';
    }
  }

  const ordersStr = `${state.ordersCompleted}/${state.targetOrders}`;
  if (ordersStr !== lastOrdersStr) {
    lastOrdersStr = ordersStr;
    if (hudCache.orders) hudCache.orders.textContent = ordersStr;
  }

  if (state.currentZone !== lastZone) {
    lastZone = state.currentZone;
    if (hudCache.zoneBadge) hudCache.zoneBadge.textContent = state.currentZone;
  }

  if (state.currentTask.orderName !== lastOrderName) {
    lastOrderName = state.currentTask.orderName;
    if (hudCache.orderName) hudCache.orderName.textContent = state.currentTask.orderName;
  }

  if (state.currentTask.stepDescription !== lastQuestText) {
    lastQuestText = state.currentTask.stepDescription;
    if (hudCache.questText) hudCache.questText.textContent = state.currentTask.stepDescription;
  }

  // Camera toggle text
  const camMode = stage?.cameraMode || 'follow';
  if (camMode !== lastCamMode) {
    lastCamMode = camMode;
    if (hudCache.camBtn) hudCache.camBtn.textContent = camMode === 'overview' ? '🏃 Bám Sát' : '🎥 Toàn Cảnh';
  }

  // Mode toggle text
  const intMode = getCachedInteractionMode();
  if (intMode !== lastInteractionMode) {
    lastInteractionMode = intMode;
    if (hudCache.modeBtn) {
      hudCache.modeBtn.textContent = intMode === 'auto_work' ? '⚡ Chạy Làm Ngay' : '📋 Hiện Thẻ Xác Nhận';
      hudCache.modeBtn.setAttribute('title', intMode === 'auto_work' ? 'Chế độ hiện tại: Chạm là Chibi tự chạy đến làm việc ngay (Bấm để đổi)' : 'Chế độ hiện tại: Chạm sẽ hiện Thẻ xác nhận công việc (Bấm để đổi)');
    }
  }

  // Radar Normalized Coordinates (Bounds: X [-30, 30], Z [-23, 23])
  if (stage) {
    const pPos = stage.player.getPosition();
    const pX = Math.round(Math.max(8, Math.min(92, ((pPos.x + 30) / 60) * 100)));
    const pZ = Math.round(Math.max(8, Math.min(92, ((pPos.z + 23) / 46) * 100)));

    if (Math.abs(pX - lastPX) >= 1 || Math.abs(pZ - lastPZ) >= 1) {
      lastPX = pX;
      lastPZ = pZ;
      if (hudCache.playerDot) {
        hudCache.playerDot.style.left = `${pX}%`;
        hudCache.playerDot.style.top = `${pZ}%`;
      }
    }

    if (stage.bossNpc) {
      const bPos = stage.bossNpc.group.position;
      const bossX = Math.round(Math.max(8, Math.min(92, ((bPos.x + 30) / 60) * 100)));
      const bossZ = Math.round(Math.max(8, Math.min(92, ((bPos.z + 23) / 46) * 100)));
      if (Math.abs(bossX - lastBossX) >= 1 || Math.abs(bossZ - lastBossZ) >= 1) {
        lastBossX = bossX;
        lastBossZ = bossZ;
        if (hudCache.bossDot) {
          hudCache.bossDot.style.left = `${bossX}%`;
          hudCache.bossDot.style.top = `${bossZ}%`;
        }
      }
    }
  }

  const tgtStation = state.currentTask.targetStation;
  if (tgtStation !== lastTargetStation) {
    lastTargetStation = tgtStation;
    const targetC = stationCoords[tgtStation] || [-10.5, -13.0];
    const tgtX = Math.round(Math.max(10, Math.min(90, ((targetC[0] + 30) / 60) * 100)));
    const tgtZ = Math.round(Math.max(10, Math.min(90, ((targetC[1] + 23) / 46) * 100)));
    if (hudCache.targetDot) {
      hudCache.targetDot.style.left = `${tgtX}%`;
      hudCache.targetDot.style.top = `${tgtZ}%`;
    }
  }

  // Speech Bubble
  if (hudCache.speechBubble && stage) {
    const speech = stage.getActiveSpeechScreenData();
    if (speech) {
      hudCache.speechBubble.style.display = 'block';
      hudCache.speechBubble.style.left = `${speech.x}px`;
      hudCache.speechBubble.style.top = `${speech.y}px`;

      if (hudCache.speechAvatar) {
        hudCache.speechAvatar.textContent = speech.emoji;
        hudCache.speechAvatar.style.background = speech.avatarBg;
      }
      if (hudCache.speechSpeaker) hudCache.speechSpeaker.textContent = speech.speaker;
      if (hudCache.speechRole) hudCache.speechRole.textContent = `· ${speech.role}`;
      if (hudCache.speechText) hudCache.speechText.textContent = speech.text;
    } else {
      hudCache.speechBubble.style.display = 'none';
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

export function showStationActionCard(
  host: HTMLElement,
  data: { emoji: string; title: string; subtitle: string; desc: string; buttonText: string }
): void {
  const card = host.querySelector('#hudActionCard') as HTMLElement;
  if (!card) return;

  const emojiEl = card.querySelector('#cardEmoji');
  if (emojiEl) emojiEl.textContent = data.emoji;

  const titleEl = card.querySelector('#cardTitle');
  if (titleEl) titleEl.textContent = data.title;

  const subEl = card.querySelector('#cardSubtitle');
  if (subEl) subEl.textContent = data.subtitle;

  const descEl = card.querySelector('#cardDesc');
  if (descEl) descEl.textContent = data.desc;

  const btnEl = card.querySelector('#cardConfirmBtn');
  if (btnEl) btnEl.textContent = data.buttonText;

  card.style.display = 'block';
}

export function hideStationActionCard(host: HTMLElement): void {
  const card = host.querySelector('#hudActionCard') as HTMLElement;
  if (card) {
    card.style.display = 'none';
  }
}
