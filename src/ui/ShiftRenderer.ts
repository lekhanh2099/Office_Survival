import { ShiftState } from '../3d/ShiftGameEngine';
import { OfficeStage } from '../3d/OfficeStage';
import { PLAYER_PERSONALITIES } from '../data/playerProfile';

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
  boss_desk: [-18.0, -19.5],
  showroom: [-3.5, -17.5],
  balcony: [19.0, 0.0],
  pickleball: [22.0, -16.0]
};

function esc(t?: string | number | null): string {
  return String(t ?? '').replace(/[&<>"']/g, x => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[x] || x));
}

interface HUDElementCache {
  host: HTMLElement;
  clock: HTMLElement | null;
  day: HTMLElement | null;
  energyVal: HTMLElement | null;
  energyFill: HTMLElement | null;
  stressVal: HTMLElement | null;
  stressFill: HTMLElement | null;
  orders: HTMLElement | null;
  weather: HTMLElement | null;
  zoneBadge: HTMLElement | null;
  orderName: HTMLElement | null;
  questText: HTMLElement | null;
  questStepper: HTMLElement | null;
  questBanner: HTMLElement | null;
  playerDot: HTMLElement | null;
  bossDot: HTMLElement | null;
  targetDot: HTMLElement | null;
  camBtn: HTMLElement | null;
  dragModeBtn: HTMLElement | null;
  modeBtn: HTMLElement | null;
  speechBubble: HTMLElement | null;
  speechAvatar: HTMLElement | null;
  speechSpeaker: HTMLElement | null;
  speechRole: HTMLElement | null;
  speechText: HTMLElement | null;
  favorEls: Record<string, HTMLElement | null>;
  profName: HTMLElement | null;
  profRibbon: HTMLElement | null;
  profTrait: HTMLElement | null;
  profEmoji: HTMLElement | null;
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
let lastSpeechX = -9999;
let lastSpeechY = -9999;
let lastProfName = '';
let lastProfTrait = '';
let lastProfEmoji = '';
let lastFavors: Record<string, number> = {};
let lastTaskStep = '';
let lastOrderArchetypeId = '';
let lastOrderStepIndex = -1;
let lastCamMode = '';
let lastDragMode = '';
let lastInteractionMode = '';
let lastPX = -999;
let lastPZ = -999;
let lastBossX = -999;
let lastBossZ = -999;
let lastEnergyColor = '';
let lastTargetStation = '';
let cachedInteractionMode = '';
let lastTaskIsCrisis = false;

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
  lastTaskStep = '';
  lastOrderArchetypeId = '';
  lastOrderStepIndex = -1;
  lastCamMode = '';
  lastDragMode = '';
  lastInteractionMode = '';
  lastPX = -999;
  lastPZ = -999;
  lastBossX = -999;
  lastBossZ = -999;
  lastEnergyColor = '';
  lastTargetStation = '';
  lastTaskIsCrisis = false;

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
        <span class="orderCount" id="hudOrders">0/5</span>
      </div>

      <!-- Character Profile & Traits Button -->
      <button class="ribbonProfileBtn" id="hudProfileBtn" data-act="open_player_profile" type="button" title="👤 Tùy biến Hồ Sơ & Tính Cách 3D">
        👤 <span id="hudRibbonPlayerName">Bạn</span>
      </button>

      <!-- Daily Weather & Office Modifier Badge -->
      <div class="ribbonWeather" id="hudWeather" data-act="open_weather_info" title="Thời tiết & Biến số ca trực hôm nay">
        ☀️ Sếp Vui Tính
      </div>

      <!-- Quick Shift Help Guide Button -->
      <button class="ribbonHelpBtn" id="hudHelpBtn" data-act="open_shift_help" type="button" title="Mở hướng dẫn quy trình ca trực 3D">
        ❓
      </button>
    </header>

    <!-- Main Header Stack: Quest Banner + Colleague Relationships Quick Bar -->
    <div class="shiftHeaderStack">
      <div class="shiftQuestBanner" id="hudQuestBanner">
        <div class="questBannerTop">
          <div class="questTagRow" data-act="auto_walk_to_quest" title="Bấm để Chibi tự chạy đến mục tiêu">
            <span class="questZoneBadge" id="hudZoneBadge">🏢 VĂN PHÒNG</span>
            <span class="questOrderName" id="hudOrderName">ĐƠN HÀNG</span>
          </div>
          <div class="questTopRightActions">
            <button class="questAutoNavBadge" id="hudAutoNavBtn" data-act="auto_walk_to_quest" type="button" title="Chibi tự chạy đến mục tiêu">
              ⚡ Tự chạy ➔
            </button>
            <button class="questCollapseBtn" id="hudQuestCollapseBtn" data-act="toggle_quest_collapse" type="button" title="Thu gọn / Mở rộng bảng nhiệm vụ">
              <span id="questCollapseArrow">▲</span>
            </button>
          </div>
        </div>

        <!-- Collapsible Body (Step Stepper + Instruction Text) -->
        <div class="questCollapsibleBody" id="hudQuestCollapsibleBody" data-act="auto_walk_to_quest" title="Bấm để Chibi tự chạy đến mục tiêu">
          <!-- Supply Chain Flow Stepper -->
          <div class="questFlowStepper" id="hudQuestStepper">
            <div class="flowStepItem" data-step="desk_receive"><span class="stepIcon">💻</span>1. Nhận Đơn</div>
            <div class="flowArrow">›</div>
            <div class="flowStepItem" data-step="printer_techpack"><span class="stepIcon">🖨️</span>2. In Techpack</div>
            <div class="flowArrow">›</div>
            <div class="flowStepItem" data-step="lab_check"><span class="stepIcon">🔬</span>3. Soi Lab</div>
            <div class="flowArrow">›</div>
            <div class="flowStepItem" data-step="fabric_pick"><span class="stepIcon">🧵</span>4. Lấy Vải</div>
            <div class="flowArrow">›</div>
            <div class="flowStepItem" data-step="shipping_deliver"><span class="stepIcon">🚢</span>5. Xuất Cảng</div>
          </div>

          <div class="questInstruction" id="hudQuestText">Nhiệm vụ đang tải...</div>
        </div>
      </div>

      <!-- Colleague Relationships Quick Bar (Interactive 5 Colleagues + My Profile) -->
      <div class="shiftColleaguesBar" id="hudColleaguesBar">
        <button class="colleagueChip myProfileChip" data-act="open_player_profile" type="button" title="Bấm để tùy biến Hồ Sơ & Tính Cách Nhân Viên">
          <span class="chipEmoji" id="hudPlayerProfEmoji" style="background:linear-gradient(135deg, #4f46e5, #ec4899)">☕</span>
          <span class="chipName" id="hudPlayerProfName">Bạn</span>
          <span class="chipFavor" id="hudPlayerProfTrait" style="background:#f59e0b;color:#1e1b4b;font-weight:900">HỒ SƠ</span>
        </button>
        <button class="colleagueChip" data-colleague="boss" type="button" title="Sếp Hùng (Tổng Giám Đốc) · Bấm để mở tương tác">
          <span class="chipEmoji" style="background:#334155">👔</span>
          <span class="chipName">Sếp Hùng</span>
          <span class="chipFavor" id="chipFavor_boss">20%</span>
        </button>
        <button class="colleagueChip" data-colleague="nga" type="button" title="Chị Nga (Kế Toán Kho) · Bấm để mở tương tác">
          <span class="chipEmoji" style="background:#b91c1c">🧮</span>
          <span class="chipName">Chị Nga</span>
          <span class="chipFavor" id="chipFavor_nga">25%</span>
        </button>
        <button class="colleagueChip" data-colleague="tuan" type="button" title="Anh Tuấn (Tài Xế Cont) · Bấm để mở tương tác">
          <span class="chipEmoji" style="background:#0284c7">🚛</span>
          <span class="chipName">Anh Tuấn</span>
          <span class="chipFavor" id="chipFavor_tuan">20%</span>
        </button>
        <button class="colleagueChip" data-colleague="linh" type="button" title="Em Linh (Thực Tập Lab) · Bấm để mở tương tác">
          <span class="chipEmoji" style="background:#06b6d4">🔬</span>
          <span class="chipName">Em Linh</span>
          <span class="chipFavor" id="chipFavor_linh">30%</span>
        </button>
        <button class="colleagueChip" data-colleague="hoang" type="button" title="Anh Hoàng (IT Support) · Bấm để mở tương tác">
          <span class="chipEmoji" style="background:#4f46e5">🖥️</span>
          <span class="chipName">Anh Hoàng</span>
          <span class="chipFavor" id="chipFavor_hoang">25%</span>
        </button>
      </div>
    </div>

    <!-- Right Control Rail: Radar + Sleek Vertical Icon Action Tools (Zero Overlap!) -->
    <aside class="shiftRightRail">
      <!-- Circular Mini Radar (Interactive Map & Fast Travel) -->
      <div class="shiftMiniRadar" id="hudMiniRadar" data-act="open_campus_map" title="🗺️ Chạm để mở Bản Đồ Toàn Khu & Fast Travel">
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

        <div class="radarTapLabel">🗺️ BẢN ĐỒ</div>
      </div>

      <!-- Vertical Icon Tool Stack (32px circular buttons) -->
      <div class="shiftToolStack">
        <!-- Campus Map & Fast Travel Modal Button -->
        <button class="shiftRailBtn" id="hudMapBtn" data-act="open_campus_map" type="button" title="Mở bản đồ toàn khu dệt may (Fast Travel)">
          🗺️
        </button>

        <!-- Camera Toggle: Bám Sát / Toàn Cảnh -->
        <button class="shiftRailBtn" id="hudCamBtn" data-act="toggle_camera" type="button" title="Chuyển đổi góc máy: Bám Sát Chibi / Toàn Cảnh">
          🎥
        </button>

        <!-- Recenter Camera on Chibi -->
        <button class="shiftRailBtn" id="hudRecenterBtn" data-act="recenter_camera" type="button" title="Căn lại camera vào Chibi">
          🎯
        </button>

        <!-- 1-Finger Gesture Action Toggle: Xoay 360° / Kéo Trượt -->
        <button class="shiftRailBtn" id="hudDragModeBtn" data-act="toggle_drag_mode" type="button" title="Chuyển thao tác vuốt 1 ngón tay: Xoay 3D hoặc Kéo Trượt">
          🔄
        </button>

        <!-- Interaction Mode Toggle: Chạy Làm Ngay / Hiện Thẻ Xác Nhận -->
        <button class="shiftRailBtn" id="hudModeToggleBtn" data-act="toggle_interaction_mode" type="button" title="Chế độ chạm: Tự Làm (⚡) hoặc Hiện Thẻ Xác Nhận (📋)">
          ⚡
        </button>

        <!-- Zoom In & Zoom Out -->
        <button class="shiftRailBtn" id="hudZoomInBtn" data-act="zoom_in" type="button" title="Phóng to">
          ➕
        </button>
        <button class="shiftRailBtn" id="hudZoomOutBtn" data-act="zoom_out" type="button" title="Thu nhỏ">
          ➖
        </button>
      </div>
    </aside>

    <!-- Mobile Touch Gestures Helper Tip (Fades out automatically) -->
    <div class="shiftGestureTip" id="hudGestureTip">
      👆 Kéo 1 ngón để xoay 3D · 2 ngón chụm phóng to / trượt bản đồ
    </div>

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
        <button class="secondary actionCardApplianceBtn" id="cardApplianceBtn" data-act="open_appliance_menu" type="button" style="display:none">
          🛠️ DÙNG ĐỒ DÙNG NÀY
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
    weather: host.querySelector('#hudWeather'),
    zoneBadge: host.querySelector('#hudZoneBadge'),
    orderName: host.querySelector('#hudOrderName'),
    questText: host.querySelector('#hudQuestText'),
    questStepper: host.querySelector('#hudQuestStepper'),
    questBanner: host.querySelector('#hudQuestBanner'),
    playerDot: host.querySelector('#hudPlayerDot'),
    bossDot: host.querySelector('#hudBossDot'),
    targetDot: host.querySelector('#hudTargetDot'),
    camBtn: host.querySelector('#hudCamBtn'),
    dragModeBtn: host.querySelector('#hudDragModeBtn'),
    modeBtn: host.querySelector('#hudModeToggleBtn'),
    speechBubble: host.querySelector('#hudSpeechBubble'),
    speechAvatar: host.querySelector('#speechAvatar'),
    speechSpeaker: host.querySelector('#speechSpeaker'),
    speechRole: host.querySelector('#speechRole'),
    speechText: host.querySelector('#speechText'),
    favorEls: {
      boss: host.querySelector('#chipFavor_boss'),
      nga: host.querySelector('#chipFavor_nga'),
      tuan: host.querySelector('#chipFavor_tuan'),
      linh: host.querySelector('#chipFavor_linh'),
      hoang: host.querySelector('#chipFavor_hoang')
    },
    profName: host.querySelector('#hudPlayerProfName'),
    profRibbon: host.querySelector('#hudRibbonPlayerName'),
    profTrait: host.querySelector('#hudPlayerProfTrait'),
    profEmoji: host.querySelector('#hudPlayerProfEmoji')
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

  if (hudCache.weather && state.weather) {
    hudCache.weather.textContent = state.weather.badgeText;
    hudCache.weather.setAttribute('title', `${state.weather.name}: ${state.weather.desc}`);
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

  const isCrisis = Boolean(state.currentTask.isCrisis);
  const curStepIdx = state.currentOrderStepIndex ?? 0;
  const archetypeId = state.activeOrderArchetype?.id || '';

  if (state.currentTask.step !== lastTaskStep || isCrisis !== lastTaskIsCrisis || curStepIdx !== lastOrderStepIndex || archetypeId !== lastOrderArchetypeId) {
    lastTaskStep = state.currentTask.step;
    lastTaskIsCrisis = isCrisis;
    lastOrderStepIndex = curStepIdx;
    lastOrderArchetypeId = archetypeId;

    const bannerEl = hudCache.questBanner;
    if (bannerEl) {
      if (isCrisis) {
        bannerEl.classList.add('isCrisis');
      } else {
        bannerEl.classList.remove('isCrisis');
      }
    }

    if (hudCache.zoneBadge) {
      if (isCrisis) {
        hudCache.zoneBadge.textContent = '🚨 KHẨN CẤP';
        hudCache.zoneBadge.style.background = '#ef4444';
      } else {
        hudCache.zoneBadge.textContent = state.activeOrderArchetype?.badge || '🏢 VĂN PHÒNG';
        hudCache.zoneBadge.style.background = state.activeOrderArchetype?.badgeColor || '#3b82f6';
      }
    }

    if (hudCache.questStepper) {
      if (isCrisis) {
        hudCache.questStepper.innerHTML = `
          <div class="flowStepItem crisisActive"><span class="stepIcon">🚨</span>Khủng Hoảng Khẩn Cấp: Khắc Phục Ngay!</div>
        `;
      } else {
        const steps = state.activeOrderArchetype?.steps || [];
        hudCache.questStepper.innerHTML = steps.map((step, idx) => {
          let stateClass = 'flowStepItem stepUpcoming';
          if (idx < curStepIdx) stateClass = 'flowStepItem stepCompleted';
          else if (idx === curStepIdx) stateClass = 'flowStepItem stepActive';
          const icon = step.carriedItem === 'sample_shirt' ? '👗' :
                       step.carriedItem === 'fabric_roll' ? '🧵' :
                       step.carriedItem === 'paper_stack' ? '📄' :
                       step.carriedItem === 'coffee_cup' ? '☕' :
                       (step.targetStation === 'showroom' ? '👗' :
                        step.targetStation === 'balcony' ? '🌿' :
                        step.targetStation === 'altar' ? '🙏' :
                        step.targetStation === 'boss_desk' ? '👔' : '💻');
          return `<div class="${stateClass}" data-step="${step.stepId}"><span class="stepIcon">${icon}</span>${step.stepName}</div>`;
        }).join('<div class="flowArrow">›</div>');
      }
    }
  }

  // Update Colleague Favors in HUD quick bar (Zero-Query Cached)
  if (state.colleagueFavors) {
    const cidList: Array<'boss' | 'nga' | 'tuan' | 'linh' | 'hoang'> = ['boss', 'nga', 'tuan', 'linh', 'hoang'];
    for (const cid of cidList) {
      const el = hudCache.favorEls[cid];
      if (el) {
        const favor = Math.round(state.colleagueFavors[cid] ?? 20);
        if (lastFavors[cid] !== favor) {
          lastFavors[cid] = favor;
          el.textContent = `${favor}%`;
          if (favor >= 50) {
            el.style.color = '#4ade80';
            el.style.fontWeight = '900';
          } else {
            el.style.color = '#cbd5e1';
            el.style.fontWeight = '700';
          }
        }
      }
    }
  }

  // Update Player Profile in HUD (Zero-Query Cached)
  if (state.playerProfile) {
    const profName = state.playerProfile.name || 'Bạn';
    if (profName !== lastProfName) {
      lastProfName = profName;
      if (hudCache.profName) hudCache.profName.textContent = profName;
      if (hudCache.profRibbon) hudCache.profRibbon.textContent = profName;
    }
    const pers = PLAYER_PERSONALITIES.find(p => p.id === state.playerProfile.personality);
    if (pers) {
      const trait = pers.name.slice(0, 10).toUpperCase();
      if (trait !== lastProfTrait) {
        lastProfTrait = trait;
        if (hudCache.profTrait) hudCache.profTrait.textContent = trait;
      }
      if (pers.emoji !== lastProfEmoji) {
        lastProfEmoji = pers.emoji;
        if (hudCache.profEmoji) hudCache.profEmoji.textContent = pers.emoji;
      }
    }
  }

  // Camera toggle button state
  const camMode = stage?.cameraMode || 'follow';
  if (camMode !== lastCamMode) {
    lastCamMode = camMode;
    if (hudCache.camBtn) {
      hudCache.camBtn.textContent = camMode === 'overview' ? '🏃' : '🎥';
      hudCache.camBtn.className = camMode === 'overview' ? 'shiftRailBtn active' : 'shiftRailBtn';
      hudCache.camBtn.setAttribute('title', camMode === 'overview' ? 'Đang ở Toàn Cảnh (Bấm để Bám Sát Chibi)' : 'Đang Bám Sát Chibi (Bấm để xem Toàn Cảnh)');
    }
  }

  // Drag Mode toggle button state
  const dragMode = stage?.dragMode || 'orbit';
  if (dragMode !== lastDragMode) {
    lastDragMode = dragMode;
    if (hudCache.dragModeBtn) {
      hudCache.dragModeBtn.textContent = dragMode === 'orbit' ? '🔄' : '✋';
      hudCache.dragModeBtn.className = dragMode === 'pan' ? 'shiftRailBtn active' : 'shiftRailBtn';
      hudCache.dragModeBtn.setAttribute('title', dragMode === 'orbit' ? '1 ngón: Xoay 360° (Bấm để đổi thành Kéo Trượt)' : '1 ngón: Kéo Trượt (Bấm để đổi thành Xoay 360°)');
    }
  }

  // Mode toggle button state
  const intMode = getCachedInteractionMode();
  if (intMode !== lastInteractionMode) {
    lastInteractionMode = intMode;
    if (hudCache.modeBtn) {
      hudCache.modeBtn.textContent = intMode === 'auto_work' ? '⚡' : '📋';
      hudCache.modeBtn.className = intMode === 'auto_work' ? 'shiftRailBtn active' : 'shiftRailBtn';
      hudCache.modeBtn.setAttribute('title', intMode === 'auto_work' ? 'Chế độ: Chạy Làm Ngay ⚡ (Bấm để đổi Hiện Thẻ 📋)' : 'Chế độ: Hiện Thẻ Xác Nhận 📋 (Bấm để đổi Tự Làm ⚡)');
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

  // Speech Bubble (Throttled sub-pixel layout caching)
  if (hudCache.speechBubble && stage) {
    const speech = stage.getActiveSpeechScreenData();
    if (speech) {
      const curX = Math.round(speech.x);
      const curY = Math.round(speech.y);
      if (curX !== lastSpeechX || curY !== lastSpeechY) {
        lastSpeechX = curX;
        lastSpeechY = curY;
        hudCache.speechBubble.style.left = `${curX}px`;
        hudCache.speechBubble.style.top = `${curY}px`;
      }
      hudCache.speechBubble.style.display = 'block';

      if (hudCache.speechAvatar) {
        hudCache.speechAvatar.textContent = speech.emoji;
        hudCache.speechAvatar.style.background = speech.avatarBg;
      }
      if (hudCache.speechSpeaker) hudCache.speechSpeaker.textContent = speech.speaker;
      if (hudCache.speechRole) hudCache.speechRole.textContent = `· ${speech.role}`;
      if (hudCache.speechText) hudCache.speechText.textContent = speech.text;
    } else {
      if (hudCache.speechBubble.style.display !== 'none') {
        hudCache.speechBubble.style.display = 'none';
        lastSpeechX = -9999;
        lastSpeechY = -9999;
      }
    }
  }
}

export function renderShiftFinishModal(state: ShiftState): string {
  const ending = state.ending;
  const grade = state.grade || ending?.grade || 'B';
  const badge = ending?.badge || `🎖️ KẾT QUẢ CA TRỰC (${grade}-RANK)`;
  const quote = ending?.quote || 'Mr. David (Buyer New York): "Đơn hàng may chuẩn form, xuất xưởng đúng hạn!"';
  const narrative = ending?.narrative || 'Bạn đã hoàn thành ca trực và phối hợp cùng đồng nghiệp đưa hàng ra cảng an toàn.';
  const outcome = ending?.careerOutcome || 'Tiếp tục giữ vững vị trí Merchandiser được đồng nghiệp tin cậy.';
  const salary = ending?.salaryBonus || `+${state.score} đ Tiền thưởng KPI ca trực`;
  const title = ending?.unlockedTitle || 'Danh Hiệu: Merchandiser Tiêu Biểu 📦';
  const bg = ending?.bgGradient || 'linear-gradient(135deg, #1e1b4b, #312e81)';
  const icon = ending?.icon || '🏢';

  let badgeColor = '#22c55e';
  if (grade === 'S') badgeColor = '#eab308';
  else if (grade === 'A') badgeColor = '#a855f7';
  else if (grade === 'B') badgeColor = '#3b82f6';
  else if (grade === 'C') badgeColor = '#f97316';
  else if (grade === 'D' || grade === 'F') badgeColor = '#ef4444';

  return `
  <section class="panel shiftClearPanel" style="max-width:540px;max-height:92vh;overflow-y:auto;padding:16px 18px;border-radius:20px;background:#0f172a;border:2.5px solid ${badgeColor};box-shadow:0 18px 50px rgba(0,0,0,0.7)">
    <div style="font-size:36px;margin:0 0 4px">${icon}🌆✨</div>
    <div class="eyebrow" style="color:#38bdf8;font-weight:900;letter-spacing:0.5px">ĐỒNG HỒ ĐIỂM 17:00 · KẾT THÚC CA TRỰC</div>
    <h1 class="clearTitle" style="font-size:20px;font-weight:900;margin:2px 0 8px;color:#ffffff">${ending ? esc(ending.title) : `KẾT QUẢ NGÀY ${state.day}`}</h1>

    <!-- Grade Stamp & Narrative Badge -->
    <div class="shiftGradeBadge" style="border-color:${badgeColor};color:${badgeColor};background:rgba(255,255,255,0.04);margin-bottom:10px">
      <span style="font-size:10.5px;letter-spacing:1px">${badge}</span>
      <strong style="font-size:42px;line-height:1;margin:4px 0">${grade}</strong>
      <div style="font-size:11.5px;font-weight:900;color:#facc15">${title}</div>
    </div>

    <!-- Dramatic Narrative Quote & Story -->
    <div style="background:${bg};border:1.5px solid rgba(255,255,255,0.2);border-radius:12px;padding:12px 14px;margin-bottom:12px;text-align:left">
      <p class="shiftQuoteBox" style="font-style:italic;color:#fef08a;margin:0 0 8px;font-size:12px;line-height:1.4">
        ${esc(quote)}
      </p>
      <div style="font-size:11.5px;color:#f8fafc;line-height:1.45;border-top:1px solid rgba(255,255,255,0.15);padding-top:8px">
        ${esc(narrative)}
      </div>
    </div>

    <!-- Career Outcome & Salary Bonus Cards -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;text-align:left">
      <div style="background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.12);border-radius:10px;padding:8px 10px">
        <div style="font-size:10px;font-weight:900;color:#94a3b8">💼 TƯƠNG LAI SỰ NGHIỆP:</div>
        <div style="font-size:11px;font-weight:800;color:#38bdf8;margin-top:2px;line-height:1.35">${esc(outcome)}</div>
      </div>
      <div style="background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.12);border-radius:10px;padding:8px 10px">
        <div style="font-size:10px;font-weight:900;color:#94a3b8">💰 THƯỞNG & PHÚC LỢI:</div>
        <div style="font-size:11px;font-weight:800;color:#4ade80;margin-top:2px;line-height:1.35">${esc(salary)}</div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="summaryGrid shiftSummaryGrid" style="grid-template-columns:repeat(3, 1fr);gap:6px">
      <div class="summaryBox" style="padding:6px 8px;font-size:10px">Container Xuất<strong>${state.ordersCompleted}/${state.targetOrders}</strong></div>
      <div class="summaryBox" style="padding:6px 8px;font-size:10px">Điểm KPI<strong>+${state.score}</strong></div>
      <div class="summaryBox" style="padding:6px 8px;font-size:10px">Biến Cố Đã Xử Lý<strong>${state.dilemmasResolved || 0}</strong></div>
      <div class="summaryBox" style="padding:6px 8px;font-size:10px">Năng Lượng<strong>${Math.round(state.energy)}%</strong></div>
      <div class="summaryBox" style="padding:6px 8px;font-size:10px">Căng Thẳng<strong>${Math.round(state.stress)}%</strong></div>
      <div class="summaryBox" style="padding:6px 8px;font-size:10px">Thần Tài Độ<strong>${state.altarPrayCount || 0} lần</strong></div>
    </div>

    <!-- Colleague Favors Summary Row -->
    <div style="display:flex;justify-content:center;gap:6px;margin-top:10px;flex-wrap:wrap">
      <span style="font-size:10px;background:rgba(255,255,255,0.08);padding:3px 6px;border-radius:6px">👔 Sếp: ${state.colleagueFavors?.boss || 20}%</span>
      <span style="font-size:10px;background:rgba(255,255,255,0.08);padding:3px 6px;border-radius:6px">🧮 Nga: ${state.colleagueFavors?.nga || 25}%</span>
      <span style="font-size:10px;background:rgba(255,255,255,0.08);padding:3px 6px;border-radius:6px">🚛 Tuấn: ${state.colleagueFavors?.tuan || 20}%</span>
      <span style="font-size:10px;background:rgba(255,255,255,0.08);padding:3px 6px;border-radius:6px">🔬 Linh: ${state.colleagueFavors?.linh || 30}%</span>
      <span style="font-size:10px;background:rgba(255,255,255,0.08);padding:3px 6px;border-radius:6px">🖥️ Hoàng: ${state.colleagueFavors?.hoang || 25}%</span>
    </div>

    ${state.choicesLog && state.choicesLog.length > 0 ? `
      <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:8px 10px;margin-top:10px;text-align:left;font-size:11px">
        <div style="font-weight:900;color:#fde047;margin-bottom:4px">📝 LỊCH SỬ QUYẾT ĐỊNH CỦA BẠN:</div>
        <div style="display:flex;flex-direction:column;gap:3px;color:#cbd5e1">
          ${state.choicesLog.map(c => `<div>• ${esc(c)}</div>`).join('')}
        </div>
      </div>
    ` : ''}

    <div class="buttons" style="margin-top:14px;gap:8px">
      <button class="accent" data-act="shift_play_pickleball" type="button" style="width:100%;padding:12px;font-size:13px;font-weight:900;background:linear-gradient(135deg, #0284c7, #0369a1);color:#ffffff;border:none;border-radius:12px;cursor:pointer;margin-bottom:6px;box-shadow:0 4px 14px rgba(2,132,199,0.4)">
        🎾 Tan Ca Đi Đánh Pickleball Với Đồng Nghiệp (-35% Stress)
      </button>
      <button class="primary btnNextShift" data-act="shift_next_day" style="padding:11px 16px;font-weight:900;font-size:13px">
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
  data: { emoji: string; title: string; subtitle: string; desc: string; buttonText: string; hasApplianceActions?: boolean }
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

  const applianceBtn = card.querySelector('#cardApplianceBtn') as HTMLElement | null;
  if (applianceBtn) {
    applianceBtn.style.display = data.hasApplianceActions ? 'block' : 'none';
  }

  card.style.display = 'block';
}

export function hideStationActionCard(host: HTMLElement): void {
  const card = host.querySelector('#hudActionCard') as HTMLElement;
  if (card) {
    card.style.display = 'none';
  }
}
