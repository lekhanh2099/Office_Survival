import { GameState } from '../types/game';
import { CARDS } from '../data/cards';
import { ALL_PERKS } from '../data/perks';
import { MODIFIERS } from '../data/modifiers';
import { ROLES } from '../data/roles';
import { ALL_TRAITS } from '../data/traits';
import { TIMES } from '../core/GameEngine';
import { getDiscoveredCards, getHighScores, loadGameState } from '../core/GameState';

function esc(t?: string | number | null): string {
  return String(t ?? '').replace(/[&<>"']/g, x => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[x] || x));
}

function hearts(lives: number): string {
  return '<span class="heartFull">' + ('♥'.repeat(Math.max(0, lives))) + '</span><span class="heartEmpty">' + ('♡'.repeat(Math.max(0, 3 - lives))) + '</span>';
}

function meter(val: number, max: number, color: string): string {
  return `<div class="miniBar"><div class="miniBarInner" style="width:${Math.max(0, Math.min(100, (val / max) * 100))}%;background:${color}"></div></div>`;
}

export function renderHUD(state: GameState): string {
  const m = MODIFIERS.find(mod => mod.id === state.modifier) || MODIFIERS[0];
  const role = ROLES[state.role || 'genz'] || ROLES.genz;
  const trait = ALL_TRAITS.find(t => t.id === state.trait) || ALL_TRAITS[0];
  const maxB = state.role === 'senior' ? 9 : 8;
  const eDanger = state.e <= 2 ? ' dangerPulse' : '';
  const bDanger = state.b >= (maxB - 2) ? ' dangerPulse' : '';
  const rDanger = state.r <= 1 ? ' dangerPulse' : '';

  const perkBadges = (state.perks || []).map(pid => {
    const p = ALL_PERKS.find(x => x.id === pid);
    return p ? `<span class="perkBadge" title="${esc(p.desc)}">${p.emoji} ${esc(p.name)}</span>` : '';
  }).join('');

  return `<div class="screenHeader">
    <div>
      <div class="eyebrow" style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">
        <span>Sinh tồn Dệt May &amp; XNK</span>
        <span style="background:#e0dcfe;color:#433299;font-weight:900;padding:1px 6px;border-radius:4px;font-size:10px">${role.emoji} ${esc(role.name)}</span>
        <span style="background:#fef3c7;color:#b45309;font-weight:900;padding:1px 6px;border-radius:4px;font-size:10px" title="${esc(trait.buff)}">${trait.emoji} ${esc(trait.name)}</span>
      </div>
      <div class="dayName">NGÀY ${String(state.day).padStart(2, '0')}</div>
      <div class="daySub">Lượt ${Math.min(state.turn + 1, 8)}/8 · Trụ càng lâu điểm càng cao</div>
    </div>
    <div class="clock">🕒 ${TIMES[Math.min(state.turn, 7)]}</div>
  </div>
  <div class="progress" aria-label="Tiến độ trong ngày">
    <div class="progressFill" style="width:${(state.turn / 8) * 100}%"></div>
  </div>
  <div class="hud">
    <div class="hudItem">
      <div class="hudLabel">❤️ Mạng</div>
      <div class="hudValue">${hearts(state.lives)}</div>
      <div class="smallcaps" style="margin-top:7px;color:#6b697d">${state.lives}/3 còn lại</div>
    </div>
    <div class="hudItem${eDanger}" data-stat="e">
      <div class="hudLabel">⚡ Năng lượng</div>
      <div class="hudValue">${state.e}/10</div>
      ${meter(state.e, 10, '#57cfa0')}
    </div>
    <div class="hudItem${bDanger}" data-stat="b">
      <div class="hudLabel">📋 Việc tồn</div>
      <div class="hudValue">${state.b}/${maxB}</div>
      ${meter(state.b, maxB, '#ff8c69')}
    </div>
  </div>
  <div class="wideStatus">
    <div class="${rDanger}" data-stat="r" style="border-radius:6px;padding:2px 4px;min-width:98px">⭐ Uy tín ${state.r}/5 ${meter(state.r, 5, '#a18cf5')}</div>
    <span>🏆 <b>${state.score.toLocaleString('vi-VN')}</b> điểm</span>
  </div>
  ${perkBadges ? `<div class="perkBar">${perkBadges}</div>` : ''}
  ${state.day > 2 ? `<div class="modifier">🗓️ MODIFIER: <b>${esc(m.name)}</b> — ${esc(m.desc)}</div>` : ''}`;
}

export function renderWelcome(): string {
  const topScore = getHighScores()[0];
  const totalDisc = getDiscoveredCards().length;

  return `<section class="panel intro">
    <span class="stamp">BUYER ĐANG THEO DÕI 👀</span>
    <div class="emojiLarge" aria-hidden="true">🧵 🚢 📦</div>
    <div class="eyebrow">Sinh Tồn Ngành Dệt May &amp; Xuất Nhập Khẩu</div>
    <h1>ĐI LÀM<br>HAY ĐI<br>SINH TỒN?</h1>
    <div class="visualBadge3D">✨ ĐỒ HOẠ THẺ BÀI 3D THREE.JS SỐNG ĐỘNG ✨</div>
    <p class="introBlurb">Mục tiêu: Còn thở khi Buyer New York nhắn tin! Vượt kiếp nạn lệch màu Lab-dip, cont kẹt cảng Cát Lái, lệch kho vải và bóng ma đền hàng Air.</p>
    
    <div class="introGuide">
      <div class="guideStep"><span>🎴</span> Nghiêng thẻ 3D</div>
      <div class="guideStep"><span>⚡</span> Quyết định nhanh</div>
      <div class="guideStep"><span>🏆</span> Sống sót 5 ngày</div>
    </div>

    <div class="introFeatures">
      <div class="feature"><span>❤️</span>3 mạng</div>
      <div class="feature"><span>🎭</span>4 Class nghề</div>
      <div class="feature"><span>🃏</span>65 thẻ sự kiện</div>
    </div>
    ${topScore ? `<p class="note" style="margin-bottom:12px">🏆 Kỷ lục cá nhân: <b>${topScore.score.toLocaleString('vi-VN')} điểm</b> (Ngày ${topScore.day} · ${esc(topScore.title)})</p>` : ''}
    <div class="buttons">
      <button class="primary" data-act="start">🚀 CHỌN HỆ TƯ TƯỞNG &amp; NHẬN VIỆC (3D) <span>→</span></button>
      ${loadGameState() ? '<button class="secondary" data-act="continue">↩ Tiếp tục run đã lưu</button>' : ''}
    </div>
    <p class="note" style="margin:16px 0 0">Chơi hoàn toàn không cần mạng. Đã khám phá: <b>${totalDisc}/65</b> sự kiện.</p>
  </section>
  <p class="footerHelp">💡 Mẹo: Giữ Năng Lượng ⚡ > 0 và Việc Tồn 📋 &lt; 8 để không bị sa thải!</p>`;
}

export function renderPlay(state: GameState): string {
  if (!state.current || !CARDS[state.current]) return renderWelcome();
  const x = CARDS[state.current];

  return `${renderHUD(state)}
  <div class="card3DWrapper">
    <div id="card3DHost" class="card3DHost" aria-label="${esc(x.title)}"></div>
  </div>

  <div class="choicesTitle">
    <span>⚡ CHỌN CÁCH SỐNG SÓT</span>
    <span class="choiceCountTag">${x.choices.length} phương án</span>
  </div>
  <div id="choiceHost">
    ${x.choices.map((c, i) => {
      const statBadges: string[] = [];
      if (c.d?.e !== undefined) {
        const val = c.d.e;
        statBadges.push(`<span class="statBadge ${val >= 0 ? 'pos' : 'neg'}">${val > 0 ? '+' : ''}${val}⚡</span>`);
      }
      if (c.d?.b !== undefined) {
        const val = c.d.b;
        // In backlog: negative is good (reducing backlog), positive is bad
        statBadges.push(`<span class="statBadge ${val <= 0 ? 'pos' : 'neg'}">${val > 0 ? '+' : ''}${val}📋</span>`);
      }
      if (c.d?.r !== undefined) {
        const val = c.d.r;
        statBadges.push(`<span class="statBadge ${val >= 0 ? 'pos' : 'neg'}">${val > 0 ? '+' : ''}${val}⭐</span>`);
      }
      if (c.roll) {
        const rate = Math.round(c.roll.chance * 100);
        statBadges.push(`<span class="statBadge roll">🎲 May rủi ${rate}%</span>`);
      }
      if (c.queue?.length) {
        statBadges.push(`<span class="statBadge queue">⏳ Nghiệp quật</span>`);
      }

      // Punchy teaser: 1 short clause
      const shortHint = c.hint ? c.hint.split('.')[0] : '';

      return `<button type="button" class="choice choiceBtn" data-choice="${i}">
        <div class="choiceTopRow">
          <div class="choiceKeyBadge">${String.fromCharCode(65 + i)}</div>
          <div class="choiceLabel">${esc(c.label)}</div>
        </div>
        <div class="choiceBottomRow">
          <div class="statBadges">${statBadges.join('')}</div>
          ${shortHint ? `<div class="choiceTeaser">${esc(shortHint)}</div>` : ''}
        </div>
      </button>`;
    }).join('')}
  </div>
  <div class="utility">
    <span class="note">💡 Nhìn huy hiệu chỉ số bên trên để chọn nhanh, không cần đọc dài dòng!</span>
    <button class="outline" data-act="history">📖 Nhật ký</button>
  </div>
  <p class="footerHelp">Bấm phím 1 / 2 / 3 hoặc A / B / C để chọn nhanh</p>`;
}

export function renderResult(state: GameState): string {
  const z = state.lastResult;
  if (!z) return renderWelcome();

  const deltasHtml = z.delta.length
    ? `<div class="deltaList">${z.delta.map(x => `<span class="delta ${x.good ? 'good' : 'bad'}" title="${esc(x.name)}">${esc(x.label)}</span>`).join('')}</div>`
    : '<p class="note">Chỉ số không đổi.</p>';

  return `<section class="panel">
    <div class="tape">BIÊN BẢN SỰ CỐ #${String(state.total).padStart(3, '0')}</div>
    <div class="resultHeader">
      <span class="resultIcon">📣</span>
      <h2 style="margin:0">Chuyện đã xảy ra...</h2>
    </div>
    <div class="eyebrow">Bạn chọn: ${esc(z.choice)}</div>
    <p class="resultBody" style="white-space:pre-line;margin:13px 0">${esc(z.message)}</p>
    ${deltasHtml}
    ${(z.failureNotes || []).map(s => `<div class="alertNote">${esc(s)}</div>`).join('')}
    ${z.callback ? '<div class="nextNote">🔁 Bạn vừa giải quyết một hậu quả quá khứ: +15 điểm.</div>' : ''}
    ${(z.queued || []).map(s => `<div class="nextNote">${esc(s)}</div>`).join('')}
    <div class="divider"></div>
    <div class="statusBrief">
      ❤️ ${state.lives}/3 mạng &nbsp; · &nbsp; ⚡ ${state.e}/10 năng lượng &nbsp; · &nbsp; 📋 ${state.b}/8 việc tồn &nbsp; · &nbsp; ⭐ ${state.r}/5 uy tín
      <div style="margin-top:6px"><b>🏆 ${state.score.toLocaleString('vi-VN')} điểm</b></div>
    </div>
    <div style="height:17px"></div>
    <button class="primary" data-act="proceed">${state.turn >= 8 ? '📋 TỔNG KẾT NGÀY' : '➡️ SỰ KIỆN TIẾP THEO'}</button>
  </section>
  <button class="secondary" data-act="history">📖 Xem nhật ký sự kiện</button>`;
}

export function renderDay(state: GameState): string {
  const z = state.dayEnd;
  if (!z) return renderWelcome();

  const ownedPerks = state.perks || [];
  const availablePerks = ALL_PERKS.filter(p => !ownedPerks.includes(p.id));
  let perkChoices = availablePerks.slice(0, 3);

  const hasThermos = ownedPerks.includes('thermos');

  return `<section class="panel">
    <div class="eyebrow" style="color:#15803d">🎉 SỐNG SÓT QUA NGÀY ${state.day}!</div>
    <div class="emojiLarge" style="font-size:64px;text-align:center;margin:4px 0">🏃‍♂️🚢✨</div>
    <h2 style="margin:2px 0 6px">HẠ BÃI THÀNH CÔNG.<br>NGÀY MAI CHIẾN TIẾP!</h2>
    <div class="badgeText" style="transform:none;margin-bottom:10px">🏆 CHIẾN THẦN XUẤT NHẬP KHẨU</div>
    <div class="summaryGrid">
      <div class="summaryBox">Đã vượt qua<strong>${state.day} ngày</strong></div>
      <div class="summaryBox">Điểm run<strong>${state.score.toLocaleString('vi-VN')}</strong></div>
      <div class="summaryBox">Mạng còn<strong>${state.lives}/3</strong></div>
      <div class="summaryBox">Việc tồn<strong>${state.b}/${state.role === 'senior' ? 9 : 8}</strong></div>
    </div>
    <div class="statusBrief">
      ${z.notes.map(t => `<div>• ${esc(t)}</div>`).join('')}
      <div>• Sang ngày mới: hồi tối đa ${hasThermos ? '5' : '4'} năng lượng.</div>
    </div>
    ${perkChoices.length ? `
      <div class="divider"></div>
      <div class="eyebrow" style="margin-bottom:8px;color:#b45309">🎁 THƯỞNG NÓNG PHÚC LỢI (CHỌN 1 MANG THEO):</div>
      <div class="perkSelection">
        ${perkChoices.map(p => `
          <button class="perkCard" type="button" data-perk="${esc(p.id)}">
            <div class="perkCardTitle">${p.emoji} ${esc(p.name)}</div>
            <div class="perkCardDesc">${esc(p.desc)}</div>
          </button>
        `).join('')}
      </div>
      <button class="secondary" data-act="nextday" style="margin-top:6px">Bỏ qua &amp; Đi làm ngay ☀️</button>
    ` : `
      <div style="height:17px"></div>
      <button class="primary" data-act="nextday">☀️ ĐI LÀM NGÀY TIẾP THEO →</button>
    `}
  </section>
  <button class="secondary" data-act="history">📖 Xem nhật ký run</button>`;
}

export function renderGameOver(state: GameState): string {
  const z = state.lastResult;

  function titleEnd() {
    if (state.day >= 12) return 'BÀ TRÙM MERCHANDISER QUỐC TẾ';
    if (state.day >= 7) return 'CHIẾN THẦN CẢNG BIỂN CÁT LÁI';
    if (state.day >= 4) return 'CHUYÊN VIÊN XỬ LÝ LỆCH TỒN KHO';
    if (state.day >= 2) return 'THỰC TẬP SINH ĐO THƯỚC DÂY';
    return 'TÂN BINH HỌC VIỆC XUẤT NHẬP KHẨU';
  }

  return `<section class="panel" style="background:#fff0f1">
    <div class="eyebrow">HỒ SƠ NHÂN SỰ ĐÃ ĐÓNG</div>
    <div style="font-size:74px;text-align:center;margin:12px 0">💀📎</div>
    <h1 style="font-size:42px;text-align:center;margin-bottom:8px">GAME<br>OVER!</h1>
    <div style="text-align:center"><div class="badgeText">${titleEnd()}</div></div>
    ${state.deathReason ? `<div class="alertNote" style="text-align:center"><b>Nguyên nhân thất bại:</b> ${esc(state.deathReason)}</div>` : ''}
    ${z ? `<p class="note" style="margin-top:10px">Sự kiện cuối: <b>${esc(z.title)}</b><br>${esc((z.message || '').slice(-220))}</p>` : ''}
    <div class="summaryGrid">
      <div class="summaryBox">Ngày đạt tới<strong>${state.day}</strong></div>
      <div class="summaryBox">Điểm cuối<strong>${state.score.toLocaleString('vi-VN')}</strong></div>
      <div class="summaryBox">Lượt xử lý<strong>${state.total}</strong></div>
      <div class="summaryBox">Nghiệp đã trả<strong>${state.triggerCount || 0}</strong></div>
    </div>
    <div class="buttons">
      <button class="primary" data-act="certificate" style="background:linear-gradient(135deg, #e11d48, #be123c);border-color:#881337;box-shadow:3px 3px 0 #881337;font-weight:900">📜 XUẤT BIÊN BẢN SA THẢI (KHOE STORY)</button>
      <button class="primary" data-act="restart">🔄 ỨNG TUYỂN LẠI TỪ ĐẦU</button>
      <button class="secondary" data-act="share">📤 Chia sẻ thành tích</button>
      <button class="secondary" data-act="donate" style="background:#fff8d6;border-color:#f59e0b;color:#854d0e;font-weight:900">🧋 Tiếp tế trà sữa cứu đói Dev</button>
      <button class="secondary" data-act="highscores">🏆 Xem bảng vàng kỷ lục</button>
      <button class="secondary" data-act="history">📖 Nhật ký tai nạn</button>
    </div>
  </section>`;
}
