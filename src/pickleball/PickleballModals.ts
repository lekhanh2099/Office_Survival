// ============================================================================
// PICKLEBALL MODALS - Settings, Colleague Selection & Match Summary
// ============================================================================

import {
  PickleballEngine,
  PICKLEBALL_COLLEAGUES,
  PICKLEBALL_PADDLES,
  ColleagueId,
  MatchStats
} from './PickleballEngine';

function esc(t?: string | number | null): string {
  return String(t ?? '').replace(/[&<>"']/g, x => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[x] || x));
}

export function renderPickleballSettingsModal(engine: PickleballEngine): string {
  const currentOpponent = engine.settings.opponentId;
  const currentTarget = engine.settings.targetScore;
  const currentPaddle = engine.settings.selectedPaddleId;
  const currentSpeed = engine.settings.ballSpeedFactor;
  const isAutoAssist = engine.settings.autoPositionAssist;

  return `
    <div class="dialogShade" role="presentation">
      <section class="dialog pbSettingsModal" role="dialog" aria-modal="true" style="max-width:500px;max-height:90vh;overflow-y:auto">
        <div class="dialogHeader" style="background:#0284c7;color:#ffffff;padding:14px;border-bottom:2px solid var(--ink)">
          <div style="font-size:32px;margin-bottom:4px">🎾⚙️</div>
          <h2 style="font-size:18px;font-weight:900;margin:0 0 4px">CÀI ĐẶT SÂN PICKLEBALL CÔNG SỞ</h2>
          <p class="note" style="margin:0;font-size:12px;color:#e0f2fe;font-weight:700">Chọn đối thủ đồng nghiệp, thể thức thi đấu &amp; trang bị vợt</p>
        </div>

        <div class="dialogBody" style="padding:14px;display:flex;flex-direction:column;gap:14px">
          <!-- 1. Opponent Colleague Selection -->
          <div>
            <label style="font-size:12px;font-weight:900;color:#1e1b4b;display:block;margin-bottom:8px">
              1. CHỌN ĐỐI THỦ ĐỒNG NGHIỆP:
            </label>
            <div class="pbOpponentGrid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(80px, 1fr));gap:8px">
              ${(Object.keys(PICKLEBALL_COLLEAGUES) as ColleagueId[]).map(cid => {
                const c = PICKLEBALL_COLLEAGUES[cid];
                const active = cid === currentOpponent ? 'active' : '';
                return `
                  <button class="pbOpponentCard ${active}" data-pb-opponent="${c.id}" type="button" style="padding:8px 4px;display:flex;flex-direction:column;align-items:center;border-radius:10px;border:2px solid ${active ? '#0284c7' : '#cbd5e1'};background:${active ? '#eff6ff' : '#f8fafc'};cursor:pointer">
                    <span style="font-size:24px;background:${c.avatarBg};border-radius:50%;width:38px;height:38px;display:grid;place-items:center">${c.emoji}</span>
                    <span style="font-size:11px;font-weight:900;margin-top:4px;color:#0f172a">${esc(c.name)}</span>
                    <span style="font-size:9px;color:#64748b;font-weight:700">${esc(c.role)}</span>
                    <span style="font-size:9px;color:#d97706;font-weight:900;margin-top:2px">${'★'.repeat(c.difficultyStars)}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 2. Target Score Selection -->
          <div>
            <label style="font-size:12px;font-weight:900;color:#1e1b4b;display:block;margin-bottom:8px">
              2. THỂ THỨC ĐIỂM SỐ:
            </label>
            <div style="display:flex;gap:8px">
              ${[5, 7, 11].map(pts => `
                <button class="pbTargetBtn ${pts === currentTarget ? 'active' : ''}" data-pb-target="${pts}" type="button" style="flex:1;padding:8px 4px;border-radius:8px;font-size:12px;font-weight:900;border:2px solid ${pts === currentTarget ? '#0284c7' : '#cbd5e1'};background:${pts === currentTarget ? '#0284c7' : '#ffffff'};color:${pts === currentTarget ? '#ffffff' : '#334155'};cursor:pointer">
                  ${pts} Điểm ${pts === 5 ? '(Nhanh)' : (pts === 7 ? '(Tiêu chuẩn)' : '(Giải đấu)')}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- 3. Paddle Selection -->
          <div>
            <label style="font-size:12px;font-weight:900;color:#1e1b4b;display:block;margin-bottom:8px">
              3. CHỌN VỢT THI ĐẤU:
            </label>
            <div style="display:flex;flex-direction:column;gap:6px">
              ${PICKLEBALL_PADDLES.map(pad => {
                const isSelected = pad.id === currentPaddle;
                return `
                  <button class="pbPaddleCard ${isSelected ? 'active' : ''}" data-pb-paddle="${pad.id}" type="button" style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;border:2px solid ${isSelected ? '#10b981' : '#cbd5e1'};background:${isSelected ? '#f0fdf4' : '#ffffff'};cursor:pointer;text-align:left">
                    <span style="font-size:26px">${pad.emoji}</span>
                    <div style="flex:1">
                      <div style="font-size:12px;font-weight:900;color:#0f172a">${esc(pad.name)}</div>
                      <div style="font-size:10px;color:#64748b">${esc(pad.desc)}</div>
                    </div>
                    <span style="font-size:11px;font-weight:900;color:#059669">${pad.powerBonus > 1 ? `+${Math.round((pad.powerBonus - 1) * 100)}% Lực` : 'Tiêu chuẩn'}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 4. Play Assists -->
          <div style="background:#f8fafc;border:1.5px solid #cbd5e1;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px">
            <label style="display:flex;align-items:center;justify-content:space-between;cursor:pointer">
              <span style="font-size:12px;font-weight:800;color:#334155">🏃 Hỗ trợ Chibi tự động bám vị trí bóng:</span>
              <input type="checkbox" id="pbAutoAssistCheck" ${isAutoAssist ? 'checked' : ''} style="width:18px;height:18px;cursor:pointer">
            </label>
            <label style="display:flex;align-items:center;justify-content:space-between;cursor:pointer">
              <span style="font-size:12px;font-weight:800;color:#334155">⚡ Tốc độ bóng Chuyên Nghiệp (+25% tốc độ):</span>
              <input type="checkbox" id="pbFastSpeedCheck" ${currentSpeed > 1 ? 'checked' : ''} style="width:18px;height:18px;cursor:pointer">
            </label>
          </div>
        </div>

        <div class="dialogFooter" style="padding:10px 14px 14px;display:flex;gap:10px">
          <button class="primary" data-act="save_pb_settings" type="button" style="flex:1;padding:12px;font-size:13px;font-weight:900">
            🚀 VÀO SÂN THI ĐẤU NGAY!
          </button>
          <button class="secondary" data-act="close_pb_settings" type="button" style="padding:12px 18px;font-size:13px;font-weight:800">
            Đóng
          </button>
        </div>
      </section>
    </div>
  `;
}

export function renderPickleballTournamentModal(engine: PickleballEngine): string {
  const t = engine.tournament;
  const curIdx = t.currentRound;

  return `
    <div class="dialogShade" role="presentation">
      <section class="dialog pbTournamentModal" role="dialog" aria-modal="true" style="max-width:520px;max-height:90vh;overflow-y:auto">
        <div class="dialogHeader" style="background:linear-gradient(135deg, #f59e0b, #b45309);color:#ffffff;padding:16px;border-bottom:2px solid var(--ink);text-align:center">
          <div style="font-size:36px;margin-bottom:4px">🏆🥇</div>
          <h2 style="font-size:18px;font-weight:900;margin:0 0 4px">CÚP PICKLEBALL DOANH NGHIỆP 2026</h2>
          <p class="note" style="margin:0;font-size:12px;color:#fef08a;font-weight:700">
            Vượt qua 4 vòng đấu loại trực tiếp để đoạt Cúp Vô Địch &amp; mở khóa Vợt Vàng Sếp Hùng!
          </p>
        </div>

        <div class="dialogBody" style="padding:14px;display:flex;flex-direction:column;gap:12px">
          <!-- 4 Tournament Ladder Rounds -->
          <div style="display:flex;flex-direction:column;gap:8px">
            ${t.rounds.map((r, idx) => {
              const opp = PICKLEBALL_COLLEAGUES[r.opponentId];
              const isCurrent = t.active && idx === curIdx;
              const isPassed = r.completed && r.winner === 'player';
              const isLocked = !r.unlocked && !isPassed;

              let cardBg = '#f8fafc';
              let borderColor = '#cbd5e1';
              let statusBadge = `<span style="font-size:10px;font-weight:800;color:#64748b;background:#e2e8f0;padding:2px 8px;border-radius:100px">🔒 Khóa</span>`;

              if (isPassed) {
                cardBg = '#f0fdf4';
                borderColor = '#22c55e';
                statusBadge = `<span style="font-size:10px;font-weight:900;color:#15803d;background:#dcfce7;padding:2px 8px;border-radius:100px">✅ Đã Vượt Qua (${r.playerScore} - ${r.aiScore})</span>`;
              } else if (isCurrent) {
                cardBg = '#fffbeb';
                borderColor = '#f59e0b';
                statusBadge = `<span style="font-size:10px;font-weight:900;color:#b45309;background:#fef3c7;padding:2px 8px;border-radius:100px;animation:pulse 1.2s infinite">⚔️ ĐANG THI ĐẤU</span>`;
              } else if (r.unlocked) {
                cardBg = '#eff6ff';
                borderColor = '#0284c7';
                statusBadge = `<span style="font-size:10px;font-weight:800;color:#0369a1;background:#e0f2fe;padding:2px 8px;border-radius:100px">🎯 Sẵn Sàng</span>`;
              }

              return `
                <div style="background:${cardBg};border:2px solid ${borderColor};border-radius:12px;padding:10px 12px;display:flex;align-items:center;gap:12px;opacity:${isLocked ? 0.6 : 1}">
                  <span style="font-size:32px;background:${opp.avatarBg};border-radius:50%;width:44px;height:44px;display:grid;place-items:center;flex-shrink:0">${opp.emoji}</span>
                  <div style="flex:1">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">
                      <span style="font-size:11px;font-weight:900;color:#0284c7">${esc(r.stageName)} · Đấu ${r.targetScore} điểm</span>
                      ${statusBadge}
                    </div>
                    <div style="font-size:13px;font-weight:900;color:#0f172a">${esc(r.title)}</div>
                    <div style="font-size:10px;color:#64748b;font-weight:600">${esc(r.desc)}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Cup Rewards Info -->
          <div style="background:#fef3c7;border:1.5px solid #f59e0b;border-radius:10px;padding:10px;font-size:11px;color:#78350f">
            <b style="color:#92400e">🎁 PHẦN THƯỞNG KHI NÂNG CÚP:</b> Mở khóa độc quyền <b>Vợt Mạ Vàng Sếp Hùng 👑</b> (+25% lực đập), nhận <b>500.000đ Quỹ Đen</b> và xóa sạch <b>50% Stress</b>!
          </div>
        </div>

        <div class="dialogFooter" style="padding:10px 14px 14px;display:flex;gap:10px">
          <button class="primary" data-act="pb_start_tourney_match" type="button" style="flex:1;padding:12px;font-size:13px;font-weight:900;background:linear-gradient(135deg, #f59e0b, #b45309)">
            🚀 ${t.active ? `VÀO TRẬN ${esc(t.rounds[curIdx].stageName.toUpperCase())} NGAY!` : 'BẮT ĐẦU GIẢI ĐẤU (VÒNG 1)'}
          </button>
          <button class="secondary" data-act="close_dialog" type="button" style="padding:12px 16px;font-size:13px;font-weight:800">
            Đóng
          </button>
        </div>
      </section>
    </div>
  `;
}

export function renderPickleballMatchOverModal(
  winner: 'player' | 'ai',
  engine: PickleballEngine,
  stats: MatchStats
): string {
  const isWin = winner === 'player';
  const opp = engine.opponent;
  const isTourney = engine.tournament.active;
  const t = engine.tournament;
  const curRound = isTourney ? t.rounds[t.currentRound] : null;
  const isGrandFinal = isTourney && t.currentRound >= 3 && isWin;

  let headerBg = isWin ? '#22c55e' : '#ef4444';
  let headerIcon = isWin ? '🏆🎉' : '💔😅';
  let titleText = isWin ? 'CHIẾN THẮNG TUYỆT VỜI!' : 'SUÝT NỮA THÌ THẮNG!';
  let subText = `Tỉ Số Chung Cuộc: ${engine.playerScore} - ${engine.aiScore}`;

  if (isTourney) {
    if (isGrandFinal) {
      headerBg = 'linear-gradient(135deg, #f59e0b, #b45309)';
      headerIcon = '👑🏆🥇';
      titleText = 'VÔ ĐỊCH CÚP DOANH NGHIỆP 2026!';
      subText = `Chiến thắng đỉnh cao trước Sếp Hùng (${engine.playerScore} - ${engine.aiScore})!`;
    } else if (isWin && curRound) {
      headerBg = '#22c55e';
      headerIcon = '🎯🎉';
      titleText = `VƯỢT QUA ${curRound.stageName.toUpperCase()}!`;
      subText = `Đã hạ gục ${opp.name} (${engine.playerScore} - ${engine.aiScore})! Tiến vào vòng kế tiếp!`;
    } else if (!isWin && curRound) {
      headerBg = '#ef4444';
      headerIcon = '💔';
      titleText = `DỪNG BƯỚC Ở ${curRound.stageName.toUpperCase()}!`;
      subText = `${opp.name} thi đấu quá bản lĩnh (${engine.playerScore} - ${engine.aiScore})!`;
    }
  }

  return `
    <div class="dialogShade" role="presentation">
      <section class="dialog pbMatchOverModal" role="dialog" aria-modal="true" style="max-width:440px;text-align:center">
        <div class="dialogHeader" style="background:${headerBg};color:#ffffff;padding:18px 14px">
          <div style="font-size:42px;margin-bottom:6px">${headerIcon}</div>
          <h2 style="font-size:22px;font-weight:900;margin:0 0 4px">
            ${titleText}
          </h2>
          <div style="font-size:14px;font-weight:800">
            ${subText}
          </div>
        </div>

        <div class="dialogBody" style="padding:16px 14px;display:flex;flex-direction:column;gap:12px">
          <!-- Colleague Reaction Dialogue -->
          <div style="background:#f8fafc;border:2px solid #cbd5e1;border-radius:12px;padding:12px;display:flex;align-items:center;gap:12px;text-align:left">
            <span style="font-size:32px;background:${opp.avatarBg};border-radius:50%;width:48px;height:48px;display:grid;place-items:center;flex-shrink:0">${opp.emoji}</span>
            <div>
              <div style="font-size:12px;font-weight:900;color:#0f172a">${esc(opp.name)} (${esc(opp.role)}):</div>
              <div style="font-size:12px;color:#334155;font-style:italic">
                "${isWin ? esc(opp.praises[0]) : esc(opp.taunts[0])}"
              </div>
            </div>
          </div>

          <!-- Match Highlights Stats -->
          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px">
            <div style="background:#f1f5f9;border-radius:8px;padding:8px">
              <div style="font-size:16px;font-weight:900;color:#0284c7">${stats.longestRally}</div>
              <div style="font-size:10px;font-weight:800;color:#64748b">Pha bóng dài nhất</div>
            </div>
            <div style="background:#f1f5f9;border-radius:8px;padding:8px">
              <div style="font-size:16px;font-weight:900;color:#f59e0b">${stats.smashes}</div>
              <div style="font-size:10px;font-weight:800;color:#64748b">Cú đập Smash</div>
            </div>
            <div style="background:#f1f5f9;border-radius:8px;padding:8px">
              <div style="font-size:16px;font-weight:900;color:#10b981">${stats.dinks}</div>
              <div style="font-size:10px;font-weight:800;color:#64748b">Bỏ nhỏ Kitchen</div>
            </div>
          </div>

          <!-- Workplace Rewards -->
          <div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:12px;padding:10px;text-align:left">
            <div style="font-size:12px;font-weight:900;color:#92400e;margin-bottom:4px">🎁 PHẦN THƯỞNG SINH TỒN CÔNG SỞ:</div>
            <div style="font-size:12px;color:#78350f;display:flex;flex-direction:column;gap:3px">
              ${isGrandFinal ? '<div>👑 <b>ĐÃ MỞ KHÓA VỢT MẠ VÀNG SẾP HÙNG 18K!</b></div>' : ''}
              <div>🧘 Giảm Stress: <b>-${isWin ? (isGrandFinal ? 50 : 35) : 20}% Stress</b></div>
              <div>🤝 Thân thiết đồng nghiệp: <b>+${isWin ? 30 : 15}% Favor với ${esc(opp.name)}</b></div>
              ${isWin ? '<div>🧋 Được đối thủ khao <b>1 Ly Trà Sữa Boba</b> tiếp sức!</div>' : ''}
            </div>
          </div>
        </div>

        <div class="dialogFooter" style="padding:10px 14px 16px;display:flex;gap:8px">
          ${isTourney && isWin && !isGrandFinal ? `
            <button class="primary" data-act="pb_tourney_next_round" type="button" style="flex:1;padding:11px;font-size:13px;font-weight:900;background:linear-gradient(135deg, #f59e0b, #b45309)">
              ⏩ ĐẤU TIẾP VÒNG KẾ TIẾP
            </button>
          ` : (isTourney && !isWin ? `
            <button class="primary" data-act="pb_tourney_retry" type="button" style="flex:1;padding:11px;font-size:13px;font-weight:900">
              🔄 THỬ LẠI VÒNG NÀY
            </button>
          ` : `
            <button class="primary" data-act="pb_play_again" type="button" style="flex:1;padding:11px;font-size:13px;font-weight:900">
              🔄 ĐẤU LẠI TRẬN NỮA
            </button>
          `)}
          <button class="secondary" data-act="pb_exit_to_campus" type="button" style="padding:11px 16px;font-size:13px;font-weight:800">
            🏢 Về Ca Trực
          </button>
        </div>
      </section>
    </div>
  `;
}
