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

export function renderPickleballMatchOverModal(
  winner: 'player' | 'ai',
  engine: PickleballEngine,
  stats: MatchStats
): string {
  const isWin = winner === 'player';
  const opp = engine.opponent;

  return `
    <div class="dialogShade" role="presentation">
      <section class="dialog pbMatchOverModal" role="dialog" aria-modal="true" style="max-width:440px;text-align:center">
        <div class="dialogHeader" style="background:${isWin ? '#22c55e' : '#ef4444'};color:#ffffff;padding:18px 14px">
          <div style="font-size:42px;margin-bottom:6px">${isWin ? '🏆🎉' : '💔😅'}</div>
          <h2 style="font-size:22px;font-weight:900;margin:0 0 4px">
            ${isWin ? 'CHIẾN THẮNG TUYỆT VỜI!' : 'SUÝT NỮA THÌ THẮNG!'}
          </h2>
          <div style="font-size:14px;font-weight:800">
            Tỉ Số Chung Cuộc: ${engine.playerScore} - ${engine.aiScore}
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
              <div>🧘 Giảm Stress: <b>-${isWin ? 35 : 20}% Stress</b> (Vận động thể thao sảng khoái)</div>
              <div>🤝 Thân thiết đồng nghiệp: <b>+${isWin ? 25 : 15}% Favor với ${esc(opp.name)}</b></div>
              ${isWin ? '<div>🧋 Được đối thủ khao <b>1 Ly Trà Sữa Boba</b> tiếp sức!</div>' : ''}
            </div>
          </div>
        </div>

        <div class="dialogFooter" style="padding:10px 14px 16px;display:flex;gap:8px">
          <button class="primary" data-act="pb_play_again" type="button" style="flex:1;padding:11px;font-size:13px;font-weight:900">
            🔄 ĐẤU LẠI TRẬN NỮA
          </button>
          <button class="secondary" data-act="pb_exit_to_campus" type="button" style="padding:11px 16px;font-size:13px;font-weight:800">
            🏢 Về Ca Trực
          </button>
        </div>
      </section>
    </div>
  `;
}
