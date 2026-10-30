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

  // Calculate Minimap Player Coordinates (Normalized to 0-100%)
  // Bounds: X [-30, 30], Z [-23, 23]
  let pX = 50;
  let pZ = 50;
  let bossX = 25;
  let bossZ = 25;

  if (stage) {
    const pPos = stage.player.getPosition();
    pX = Math.max(5, Math.min(95, ((pPos.x + 30) / 60) * 100));
    pZ = Math.max(5, Math.min(95, ((pPos.z + 23) / 46) * 100));

    if (stage.bossNpc) {
      const bPos = stage.bossNpc.group.position;
      bossX = Math.max(5, Math.min(95, ((bPos.x + 30) / 60) * 100));
      bossZ = Math.max(5, Math.min(95, ((bPos.z + 23) / 46) * 100));
    }
  }

  return `
  <!-- Top 3D Shift Status Bar -->
  <div class="shiftTopHUD">
    <div class="shiftClockBadge">
      <span class="clockIcon">⏰</span>
      <span class="clockTime">${timeStr}</span>
      <span class="shiftDayBadge">NGÀY ${state.day}</span>
    </div>

    <!-- Live Zone Indicator -->
    <div class="shiftZoneTag">
      <span class="zonePin">📍</span>
      <span>${esc(state.currentZone)}</span>
    </div>

    <div class="shiftBars">
      <!-- Energy Bar -->
      <div class="shiftStatItem" title="Năng Lượng Chibi">
        <div class="statHeader">
          <span>⚡ Năng Lượng</span>
          <span>${Math.round(state.energy)}%</span>
        </div>
        <div class="shiftMiniBar">
          <div class="shiftMiniBarFill" style="width:${energyPct}%;background:${energyColor}"></div>
        </div>
      </div>

      <!-- Stress Bar -->
      <div class="shiftStatItem" title="Mức độ Stress / Sếp soi">
        <div class="statHeader">
          <span>😰 Stress</span>
          <span>${Math.round(state.stress)}%</span>
        </div>
        <div class="shiftMiniBar">
          <div class="shiftMiniBarFill" style="width:${stressPct}%;background:${state.stress > 60 ? '#ef4444' : '#fb923c'}"></div>
        </div>
      </div>
    </div>

    <!-- Orders Completed Target -->
    <div class="shiftKpiBadge">
      <span class="kpiIcon">📦</span>
      <div>
        <div class="kpiVal">${state.ordersCompleted}/${state.targetOrders}</div>
        <div class="kpiLabel">XUẤT XƯỞNG</div>
      </div>
    </div>
  </div>

  <!-- Minimap Radar Widget at Top Right -->
  <div class="shiftRadarWidget" title="Bản đồ khuôn viên nhà máy 60x50">
    <div class="radarLabel">BẢN ĐỒ TỔ HỢP</div>
    <div class="radarGrid">
      <div class="radarQuadrant q1">VP</div>
      <div class="radarQuadrant q2">LAB</div>
      <div class="radarQuadrant q3">KHO</div>
      <div class="radarQuadrant q4">CẢNG</div>
      <div class="radarCenter">🧋</div>

      <!-- Player Blinking Dot -->
      <div class="radarPlayerDot" style="left:${pX}%;top:${pZ}%"></div>
      <!-- Boss Red Dot -->
      <div class="radarBossDot" style="left:${bossX}%;top:${bossZ}%"></div>
    </div>
  </div>

  <!-- Mission Objective Card Floating at Top Center -->
  <div class="shiftMissionBanner">
    <div class="missionTargetTag">
      <span class="pulseDot"></span>
      <span>${esc(state.currentTask.orderName)}</span>
      <span class="missionZoneHint">(${esc(state.currentTask.targetZone)})</span>
    </div>
    <div class="missionStepText">${esc(state.currentTask.stepDescription)}</div>
  </div>

  <!-- Floating Active Action Pill (When near workstation) -->
  ${state.activePrompt ? `
    <div class="shiftActionPill">
      ${esc(state.activePrompt)}
    </div>
  ` : ''}
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
  <section class="panel shiftClearPanel" style="text-align:center;padding:24px 20px">
    <div style="font-size:52px;margin-bottom:6px">🌆🏢🚢✨</div>
    <div class="eyebrow" style="color:#16a34a">ĐỒNG HỒ ĐIỂM 17:00 · HOÀN THÀNH CA TRỰC TOÀN KHU!</div>
    <h1 style="font-size:30px;margin:2px 0 8px">KẾT QUẢ NGÀY ${state.day}</h1>

    <!-- Grade Stamp -->
    <div class="shiftGradeBadge" style="border-color:${badgeColor};color:${badgeColor}">
      <span>XẾP LOẠI KPI TOÀN CA</span>
      <strong style="font-size:56px;line-height:1">${state.grade || 'A'}</strong>
    </div>

    <p class="shiftQuoteBox">"${quote}"</p>

    <!-- Stats Grid -->
    <div class="summaryGrid" style="margin:16px 0">
      <div class="summaryBox">Đơn hàng xuất xưởng<strong>${state.ordersCompleted} / ${state.targetOrders} cont</strong></div>
      <div class="summaryBox">Tiền thưởng KPI kiếm được<strong>+${state.score} đ</strong></div>
      <div class="summaryBox">Năng lượng còn lại<strong>${Math.round(state.energy)}%</strong></div>
      <div class="summaryBox">Áp lực stress<strong>${Math.round(state.stress)}%</strong></div>
    </div>

    <div class="buttons" style="margin-top:18px">
      <button class="primary" data-act="shift_next_day" style="width:100%;padding:14px;font-size:16px;background:linear-gradient(135deg, #16a34a, #059669)">
        ☀️ BƯỚC VÀO CA TRỰC NGÀY TIẾP THEO →
      </button>
      <button class="secondary" data-act="shift_to_menu" style="width:100%;padding:11px">
        ↩ Về sảnh chính &amp; Cốt truyện
      </button>
    </div>
  </section>
  `;
}
