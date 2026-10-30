import { BattlerCard, BattlerState } from '../types/battler';

function esc(t?: string | number | null): string {
  return String(t ?? '').replace(/[&<>"']/g, x => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[x] || x));
}

function hearts(lives: number): string {
  return '<span class="heartFull">' + ('♥'.repeat(Math.max(0, lives))) + '</span><span class="heartEmpty">' + ('♡'.repeat(Math.max(0, 3 - lives))) + '</span>';
}

function meter(val: number, max: number, color: string): string {
  const pct = Math.max(0, Math.min(100, (val / max) * 100));
  return `<div class="miniBar"><div class="miniBarInner" style="width:${pct}%;background:${color}"></div></div>`;
}

export function renderBattlerHUD(state: BattlerState): string {
  return `<div class="screenHeader">
    <div>
      <div class="eyebrow" style="display:flex;align-items:center;gap:6px">
        <span>Office Survival · Slay The Deadline</span>
        <span style="background:#fef08a;color:#854d0e;font-weight:900;padding:1px 6px;border-radius:4px;font-size:10px">🃏 DECK-BUILDER</span>
      </div>
      <div class="dayName">NGÀY ${String(state.day).padStart(2, '0')}</div>
      <div class="daySub">Kiếp nạn ${state.encounterIndex + 1}/4 hôm nay · Điểm: <b>${state.score.toLocaleString('vi-VN')}</b></div>
    </div>
    <div class="clock" style="font-size:12px;background:#fff;padding:4px 8px;border:2px solid var(--ink);border-radius:8px">
      📥 Rút: ${state.drawPile.length} | 🗑️ Bỏ: ${state.discardPile.length}
    </div>
  </div>
  <div class="progress" aria-label="Tiến độ trong ngày">
    <div class="progressFill" style="width:${((state.encounterIndex) / 4) * 100}%"></div>
  </div>
  <div class="hud">
    <div class="hudItem">
      <div class="hudLabel">❤️ Mạng</div>
      <div class="hudValue">${hearts(state.lives)}</div>
      <div class="smallcaps" style="margin-top:7px;color:#6b697d">${state.lives}/3 còn lại</div>
    </div>
    <div class="hudItem" style="background:#f0fdf4;border-color:#16a34a">
      <div class="hudLabel" style="color:#15803d">⚡ Năng Lượng</div>
      <div class="hudValue" style="color:#15803d">${state.energy}/${state.maxEnergy}</div>
      ${meter(state.energy, state.maxEnergy, '#22c55e')}
    </div>
    <div class="hudItem" style="background:#fff7ed;border-color:#ea580c">
      <div class="hudLabel" style="color:#c2410c">📋 Việc Tồn</div>
      <div class="hudValue" style="color:#c2410c">${state.backlog}/8</div>
      ${meter(state.backlog, 8, '#f97316')}
    </div>
  </div>
  <div class="wideStatus">
    <div style="border-radius:6px;padding:2px 4px;min-width:98px">⭐ Uy tín ${state.rep}/5 ${meter(state.rep, 5, '#a18cf5')}</div>
    <span>🃏 Tổng bộ bài: <b>${state.deck.length}</b> lá</span>
  </div>`;
}

export function renderCrisisArena(state: BattlerState): string {
  const c = state.currentCrisis;
  const pct = Math.min(100, (state.crisisProgress / c.targetProgress) * 100);

  return `<section class="crisisArena card" id="crisisTargetArea">
    <div class="cardTop crisis">
      <span>🚨 KIẾP NẠN #${state.encounterIndex + 1}: ${esc(c.sender)}</span>
      <span>Mục tiêu: ${c.targetProgress} điểm</span>
    </div>
    <div class="cardBody" style="padding:14px">
      <div style="display:flex;gap:12px;align-items:center">
        <!-- Animated Cat GIF -->
        <div class="memeGifBox" style="width:110px;height:110px;flex-shrink:0;border:2.5px solid var(--ink);border-radius:12px;overflow:hidden;background:#000;box-shadow:3px 3px 0 var(--ink)">
          <img src="${c.gif}" alt="${esc(c.title)}" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.outerHTML='<div style=\\'font-size:48px;display:grid;place-items:center;height:100%\\'>${c.fallbackEmoji}</div>'">
        </div>
        <div>
          <div style="font-size:11px;font-weight:900;color:#e11d48;text-transform:uppercase;letter-spacing:0.5px">${esc(c.sender)}</div>
          <h2 style="font-size:18px;margin:2px 0 6px;line-height:1.3">${esc(c.title)}</h2>
          <div style="font-size:12px;color:#47445e;line-height:1.45;font-style:italic">${esc(c.body)}</div>
        </div>
      </div>

      <!-- Target Progress Gauge -->
      <div style="margin-top:14px;background:#f8fafc;border:2px solid var(--ink);border-radius:10px;padding:8px 12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;font-weight:800;font-size:12px">
          <span>📋 TIẾN ĐỘ XỬ LÝ VIỆC:</span>
          <span style="font-size:13px;color:#4f46e5"><b>${state.crisisProgress}</b> / ${c.targetProgress}</span>
        </div>
        <div class="miniBar" style="height:14px;border-radius:6px">
          <div class="miniBarInner" style="width:${pct}%;background:linear-gradient(90deg, #6366f1, #10b981);transition:width 0.25s"></div>
        </div>
      </div>

      <!-- Threat Info -->
      <div style="margin-top:10px;display:flex;align-items:center;justify-content:space-between;background:${state.threatBlocked ? '#ecfdf5' : '#fff1f2'};border:1.5px dashed ${state.threatBlocked ? '#059669' : '#e11d48'};padding:7px 10px;border-radius:8px;font-size:11.5px">
        <div>
          <b style="color:${state.threatBlocked ? '#059669' : '#be123c'}">${state.threatBlocked ? '🛡️ ĐÃ AN TOÀN:' : '⚠️ NẾU BỎ QUA:'}</b>
          <span style="color:#333;margin-left:4px">${state.threatBlocked ? 'Toàn bộ hậu quả đã bị chặn đứng!' : esc(c.threat.desc)}</span>
        </div>
        <span style="font-size:11px;font-weight:800;color:#6b7280">+${c.rewardScore}đ</span>
      </div>
    </div>
  </section>`;
}

export function renderHand(state: BattlerState): string {
  return `<div class="handSection">
    <div style="display:flex;justify-content:space-between;align-items:center;margin:10px 0 8px">
      <span class="eyebrow" style="margin:0">🃏 BÀI TRÊN TAY (${state.hand.length}/4)</span>
      <span style="font-size:11px;color:#6b6782;font-weight:700">Chạm hoặc kéo thẻ bài vào kiếp nạn</span>
    </div>

    <!-- Hand Cards Grid -->
    <div class="handGrid" id="handCardsContainer">
      ${state.hand.map((card, idx) => renderCard(card, idx, state.energy)).join('')}
    </div>

    <!-- Turn Controls -->
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="secondary" data-act="end_turn" style="flex:1;padding:12px;font-weight:900;background:#fff;border-color:var(--ink)">
        ⏭️ KẾT THÚC LƯỢT / CHỊU TRẬN
      </button>
    </div>
  </div>`;
}

export function renderCard(card: BattlerCard, index: number, currentEnergy: number): string {
  const canAfford = currentEnergy >= card.cost;
  const rarityBorder = card.rarity === 'legendary' ? '#f59e0b' : card.rarity === 'rare' ? '#8b5cf6' : 'var(--ink)';
  const rarityBg = card.rarity === 'legendary' ? '#fffbeb' : card.rarity === 'rare' ? '#f5f3ff' : '#ffffff';

  return `<div class="battlerCard ${canAfford ? 'playable' : 'unplayable'}" data-hand-index="${index}" draggable="true" style="background:${rarityBg};border:2.5px solid ${rarityBorder};box-shadow:3px 3px 0 ${rarityBorder}">
    <!-- Cost gem -->
    <div class="cardCostGem" style="background:${canAfford ? '#22c55e' : '#94a3b8'}">
      <span>${card.cost}</span>⚡
    </div>

    <!-- GIF thumbnail -->
    <div class="cardGifContainer">
      <img src="${card.gif}" alt="${esc(card.name)}" class="cardGifImg" loading="lazy" onerror="this.outerHTML='<div class=\\'cardFallbackEmoji\\'>${card.fallbackEmoji}</div>'">
    </div>

    <!-- Title & Desc -->
    <div class="cardContent">
      <div class="cardTitleText">${esc(card.name)}</div>
      <div class="cardDescText">${esc(card.desc)}</div>
    </div>
  </div>`;
}

export function renderRewardModal(state: BattlerState): string {
  return `<section class="panel" style="text-align:center">
    <div style="font-size:52px;margin:8px 0">🎉🏆✨</div>
    <div class="eyebrow" style="color:#16a34a">CHIẾN THẮNG KIẾP NẠN!</div>
    <h1 style="font-size:28px;margin:4px 0 10px">XỬ LÝ THÀNH CÔNG!</h1>
    <p class="note" style="margin-bottom:14px">Bạn nhận được <b>+${state.currentCrisis.rewardScore} điểm</b>. Hãy chọn 1 lá bài mới bổ sung vào bộ bài của bạn:</p>

    <div class="draftGrid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:10px;margin-bottom:16px">
      ${state.rewardChoices.map((c, i) => `
        <div class="rewardCardItem" data-reward-index="${i}" style="border:2.5px solid var(--ink);border-radius:12px;background:#fff;padding:8px;box-shadow:3px 3px 0 var(--ink);cursor:pointer;text-align:center">
          <div style="height:90px;border-radius:8px;overflow:hidden;background:#000;margin-bottom:6px">
            <img src="${c.gif}" alt="${esc(c.name)}" style="width:100%;height:100%;object-fit:cover" onerror="this.outerHTML='<div style=\\'font-size:36px;padding-top:16px\\'>${c.fallbackEmoji}</div>'">
          </div>
          <div style="font-weight:900;font-size:13px;margin-bottom:4px">${esc(c.name)}</div>
          <div style="font-size:11px;color:#555;line-height:1.35;margin-bottom:8px">${esc(c.desc)}</div>
          <button class="primary" data-pick-reward="${i}" style="width:100%;padding:6px 8px;font-size:11px">CHỌN THẺ NÀY</button>
        </div>
      `).join('')}
    </div>

    <button class="secondary" data-act="skip_reward" style="width:100%">BỎ QUA KHÔNG CHỌN</button>
  </section>`;
}

export function renderDayClear(state: BattlerState): string {
  return `<section class="panel" style="text-align:center;background:#f0fdf4">
    <div style="font-size:64px;margin:12px 0">☀️🏢🏆</div>
    <div class="eyebrow" style="color:#15803d">SỐNG SÓT QUA NGÀY!</div>
    <h1 style="font-size:32px;margin:4px 0 10px">HOÀN THÀNH NGÀY ${state.day}</h1>
    <div class="badgeText" style="transform:none;margin-bottom:14px">CHIẾN THẦN CÔNG SỞ</div>
    <p class="note">Bạn đã dọn dẹp sạch sẽ 4 kiếp nạn hôm nay. Hồi phục toàn bộ Năng Lượng và chuẩn bị tinh thần cho ngày mai!</p>

    <div class="summaryGrid" style="margin:16px 0">
      <div class="summaryBox">Điểm hiện tại<strong>${state.score.toLocaleString('vi-VN')}</strong></div>
      <div class="summaryBox">Mạng còn<strong>${state.lives}/3</strong></div>
      <div class="summaryBox">Bộ bài<strong>${state.deck.length} lá</strong></div>
      <div class="summaryBox">Việc tồn<strong>${state.backlog}/8</strong></div>
    </div>

    <button class="primary" data-act="battler_next_day" style="width:100%;padding:14px;font-size:15px">
      ☀️ ĐI LÀM NGÀY TIẾP THEO →
    </button>
  </section>`;
}
