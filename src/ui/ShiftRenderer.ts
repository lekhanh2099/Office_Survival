import { ShiftState } from '../3d/ShiftGameEngine';

function esc(t?: string | number | null): string {
  return String(t ?? '').replace(/[&<>"']/g, x => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[x] || x));
}

export function renderShiftHUD(state: ShiftState): string {
  const timeStr = `${String(state.timeHour).padStart(2, '0')}:${String(state.timeMinute).padStart(2, '0')}`;
  const energyPct = Math.max(0, Math.min(100, state.energy));
  const stressPct = Math.max(0, Math.min(100, state.stress));

  let energyColor = '#22c55e';
  if (state.energy < 30) energyColor = '#ef4444';
  else if (state.energy < 60) energyColor = '#f59e0b';

  return `
  <!-- Top 3D Shift Status Bar -->
  <div class="shiftTopHUD">
    <div class="shiftClockBadge">
      <span class="clockIcon">⏰</span>
      <span class="clockTime">${timeStr}</span>
      <span class="shiftDayBadge">NGÀY ${state.day}</span>
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

  <!-- Mission Objective Card Floating at Top Center -->
  <div class="shiftMissionBanner">
    <div class="missionTargetTag">
      <span class="pulseDot"></span>
      <span>${esc(state.currentTask.orderName)}</span>
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
  let quote = 'Mr. David (Buyer New York): "Perfect execution! Mẫu vải kiểm định đạt chuẩn, cont hàng lên tàu đúng hạn!"';
  let badgeColor = '#22c55e';

  if (state.grade === 'S') {
    quote = 'Sếp Hùng: "Tuyệt đỉnh Merchandiser! Đơn hàng xong trước 17:00, không bị dính một lỗi nào!"';
    badgeColor = '#eab308';
  } else if (state.grade === 'C' || state.grade === 'F') {
    quote = 'Chị Nga Kế Toán: "Suýt nữa là trễ Closing time của cảng Cát Lái rồi nhé! Mai phải tập trung hơn đấy!"';
    badgeColor = '#f97316';
  }

  return `
  <section class="panel shiftClearPanel" style="text-align:center;padding:22px 18px">
    <div style="font-size:48px;margin-bottom:6px">🌆🏢✨</div>
    <div class="eyebrow" style="color:#16a34a">ĐỒNG HỒ ĐIỂM 17:00 · HOÀN THÀNH CA TRỰC!</div>
    <h1 style="font-size:28px;margin:2px 0 8px">KẾT QUẢ NGÀY ${state.day}</h1>

    <!-- Grade Stamp -->
    <div class="shiftGradeBadge" style="border-color:${badgeColor};color:${badgeColor}">
      <span>HẠNG KPI</span>
      <strong style="font-size:52px;line-height:1">${state.grade || 'A'}</strong>
    </div>

    <p class="shiftQuoteBox">"${quote}"</p>

    <!-- Stats Grid -->
    <div class="summaryGrid" style="margin:14px 0">
      <div class="summaryBox">Đơn hàng xuất xưởng<strong>${state.ordersCompleted} / ${state.targetOrders}</strong></div>
      <div class="summaryBox">Điểm KPI kiếm được<strong>+${state.score} đ</strong></div>
      <div class="summaryBox">Năng lượng còn lại<strong>${Math.round(state.energy)}%</strong></div>
      <div class="summaryBox">Mức độ stress<strong>${Math.round(state.stress)}%</strong></div>
    </div>

    <div class="buttons" style="margin-top:16px">
      <button class="primary" data-act="shift_next_day" style="width:100%;padding:14px;font-size:15px">
        ☀️ BƯỚC VÀO NGÀY LÀM VIỆC TIẾP THEO →
      </button>
      <button class="secondary" data-act="shift_to_menu" style="width:100%;padding:11px">
        ↩ Về sảnh chính
      </button>
    </div>
  </section>
  `;
}
