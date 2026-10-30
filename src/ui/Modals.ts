import { GameState } from '../types/game';
import { CARDS } from '../data/cards';
import { ALL_ACHS } from '../data/achievements';
import { getDiscoveredCards, getHighScores, getUnlockedAchievements } from '../core/GameState';
import { sounds } from '../audio/SoundManager';
import {
  downloadCertificate,
  MEME_AVATARS,
  renderCertificateToCanvas,
  shareCertificate
} from './CertificateGenerator';
import { ALL_ROLES } from '../data/roles';

function esc(t?: string | number | null): string {
  return String(t ?? '').replace(/[&<>"']/g, x => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[x] || x));
}

export function openHelpModal(host: HTMLElement): void {
  sounds.click();
  host.innerHTML = `<div class="dialogShade" role="presentation">
    <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="helpTitle">
      <h2 id="helpTitle">📎 Sổ tay nhân viên</h2>
      <p><b>Mục tiêu:</b> Sống sót càng nhiều ngày càng tốt. Mỗi ngày có 8 sự kiện; sự kiện cuối là lúc 17:59 trước giờ tan tầm.</p>
      <p><b>❤️ Mạng:</b> Bắt đầu với 3 mạng. Hết mạng là hợp đồng bị chấm dứt (Game Over).</p>
      <p><b>⚡ Năng lượng:</b> Về 0 mất 1 mạng rồi được cấp cứu hồi 3; sang ngày mới hồi tối đa 4 (hoặc 5 nếu có Bình giữ nhiệt).</p>
      <p><b>📋 Việc tồn:</b> Chạm 8 mất 1 mạng rồi giảm về 5. Nếu hết ngày còn ≥6, uy tín bị giảm 1.</p>
      <p><b>⭐ Uy tín:</b> Về 0 ở cuối ngày sẽ mất 1 mạng rồi hồi 2.</p>
      <p><b>🎁 Phúc lợi (Perks):</b> Hoàn thành mỗi ngày bạn được chọn 1 vật phẩm hỗ trợ mang theo suốt run.</p>
      <p><b>🔁 Nghiệp quật:</b> Lựa chọn hôm nay có thể là quả đắng (hoặc quả ngọt) vài lượt sau.</p>
      <p><b>🎲 May rủi:</b> Các lựa chọn có xúc xắc luôn hiển thị tỷ lệ thành công dự kiến.</p>
      <p><b>🏆 Điểm số:</b> +10/lượt, +40/ngày vượt qua, +5/việc xử lý (tối đa 20 điểm/ngày), +15/hậu quả giải quyết.</p>
      <button class="secondary" data-act="close">ĐÃ HIỂU — QUAY LẠI GAME</button>
    </section>
  </div>`;
}

export function openHistoryModal(host: HTMLElement, state: GameState | null): void {
  sounds.click();
  const hist = state?.history || [];
  host.innerHTML = `<div class="dialogShade"><section class="dialog" role="dialog" aria-modal="true">
    <h2>📖 Nhật ký công sở</h2>
    <p class="note">15 sự kiện gần nhất trong run này.</p>
    <div style="border:2px solid var(--ink);border-radius:12px;background:#fff;padding:10px 12px;margin:10px 0;max-height:55vh;overflow:auto">
      ${hist.length ? hist.map(h => `<div style="font-size:12px;line-height:1.5;padding:7px 0;border-bottom:1px solid #dedce7">
        <b>Ngày ${h.day} · ${h.time}</b> — ${esc(h.card)}<br>
        <span style="color:#6a6683">↳ ${esc(h.choice)}</span>
      </div>`).join('') : '<p class="note">Chưa có sự kiện nào.</p>'}
    </div>
    <button class="secondary" data-act="close">ĐÓNG</button>
  </section></div>`;
}

export function openCompendiumModal(host: HTMLElement): void {
  sounds.click();
  const disc = getDiscoveredCards();
  const allCards = Object.values(CARDS);
  const total = allCards.length;
  const count = disc.length;

  host.innerHTML = `<div class="dialogShade"><section class="dialog" role="dialog" aria-modal="true">
    <h2>📚 Sổ tay sự kiện</h2>
    <p class="note">Đã mở khoá: <b>${count}/${total}</b> thẻ (${Math.round((count / total) * 100)}%)</p>
    <div style="max-height:58vh;overflow:auto;padding-right:4px" class="compendiumGrid">
      ${allCards.map(c => {
        const isUnlocked = disc.includes(c.id);
        const tagMap: Record<string, string> = { base: 'Cơ bản', callback: 'Nghiệp quật', crisis: 'Khủng hoảng', rare: 'Hiếm', finale: 'Chốt ngày' };
        if (!isUnlocked) {
          return `<div class="compCard locked">
            <div class="compCardHead"><span>🔒 ???</span><span class="compTag">${tagMap[c.type] || c.type}</span></div>
            <div>Sự kiện này chưa xảy ra với bạn...</div>
          </div>`;
        }
        return `<div class="compCard">
          <div class="compCardHead">
            <span>${c.emoji} <b>${esc(c.title)}</b></span>
            <span class="compTag">${tagMap[c.type] || c.type}</span>
          </div>
          <div style="color:#65627a;font-size:11px;margin-bottom:3px">Từ: ${esc(c.who)}</div>
          <div style="font-style:italic;color:#333146">${esc(c.body.slice(0, 90))}${c.body.length > 90 ? '...' : ''}</div>
        </div>`;
      }).join('')}
    </div>
    <button class="secondary" data-act="close" style="margin-top:12px">ĐÓNG</button>
  </section></div>`;
}

export function openRankingsModal(host: HTMLElement): void {
  sounds.click();
  const scores = getHighScores();
  const achs = getUnlockedAchievements();

  host.innerHTML = `<div class="dialogShade"><section class="dialog" role="dialog" aria-modal="true">
    <h2>🏆 Bảng vàng & Thành tích</h2>
    
    <div class="eyebrow" style="margin:12px 0 6px">🏅 TOP 5 RUN XUẤT SẮC NHẤT</div>
    <div style="border:2px solid var(--ink);border-radius:12px;background:#fff;padding:8px 12px;margin-bottom:14px">
      ${scores.length ? scores.map((s, i) => `
        <div class="scoreRow">
          <div><span class="scoreRank">${i + 1}</span><b>${s.score.toLocaleString('vi-VN')} đ</b> · Ngày ${s.day}</div>
          <div style="font-size:11px;color:#6b6782">${esc(s.date)}</div>
        </div>
      `).join('') : '<p class="note">Chưa có kỷ lục nào được ghi nhận.</p>'}
    </div>

    <div class="eyebrow" style="margin:12px 0 6px">🎖️ HUY HIỆU ĐÃ MỞ KHOÁ (${achs.length}/${ALL_ACHS.length})</div>
    <div style="max-height:35vh;overflow:auto" class="achGrid">
      ${ALL_ACHS.map(a => {
        const isUnlocked = achs.includes(a.id);
        return `<div class="achItem ${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="achIcon">${a.icon}</div>
          <div>
            <div class="achName">${esc(a.name)} ${isUnlocked ? '✓' : ''}</div>
            <div class="achDesc">${esc(a.desc)}</div>
          </div>
        </div>`;
      }).join('')}
    </div>

    <button class="secondary" data-act="close" style="margin-top:14px">ĐÓNG</button>
  </section></div>`;
}

const GENZ_QUOTES = [
  'Sốp chơi cuốn quá thì donate hộp cơm sườn cho dev, chứ dev gặm mì tôm 3 ngày nay rồi 🍜',
  'Ăn xin online nhưng phong thái doanh nhân: 1 ly trà sữa = 10 sự kiện mới ra lò 🧋',
  'Dev không cần người yêu, dev chỉ cần ly trà đào cam sả 50% đường 70% đá 🍑',
  'Ting ting cho dev một cốc trà đá là mai sếp tự động huỷ lịch họp (nghe đồn vậy) 🔮',
  'Cứu vớt một lập trình viên thoát khỏi kiếp deadline nửa đêm và bug tràn bờ đê 🥺',
  'Game không quảng cáo, không hút máu, chỉ xin nhẹ cốc nước mía vỉa hè qua ngày thôi sốp 🎋',
  'Người ta flex lương nghìn đô, còn dev ở đây flex việc bạn chơi game không bị crash 🚀',
  'Ủng hộ 1 cốc nước mía để dev có sức code thêm tính năng "Tát sếp bằng bàn phím cơ" ⌨️'
];

export function burstHearts(): void {
  const emojis = ['🧋', '❤️', '☕', '💖', '✨', '🍜', '🎋', '🥰', '🔥', '🌸'];
  const count = 18;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'floatingHeart';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 160;
    const startY = window.innerHeight * 0.65 + (Math.random() - 0.5) * 60;
    const dx = (Math.random() - 0.5) * 180 + 'px';
    const dx2 = (Math.random() - 0.5) * 260 + 'px';
    const rot = (Math.random() - 0.5) * 60 + 'deg';

    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;
    el.style.setProperty('--dx', dx);
    el.style.setProperty('--dx2', dx2);
    el.style.setProperty('--rot', rot);
    el.style.animationDelay = `${Math.random() * 0.25}s`;

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }
}

export function openDonateModal(host: HTMLElement): void {
  sounds.click();
  const quote = GENZ_QUOTES[Math.floor(Math.random() * GENZ_QUOTES.length)];

  host.innerHTML = `<div class="dialogShade"><section class="dialog" role="dialog" aria-modal="true" style="text-align:center">
    <div style="font-size:52px;margin:6px 0">🧋🍱☕</div>
    <h2 style="margin:4px 0 6px">QUỸ CỨU ĐÓI DEV GAME</h2>
    <div class="badgeText" style="transform:none;margin-bottom:12px">✨ GÓC KHIỀU TRÀ SỮA GEN Z ✨</div>
    
    <div style="background:#f5f2ff;border:2px dashed var(--purple);border-radius:14px;padding:12px;font-size:13px;font-weight:750;line-height:1.55;color:#3f3282;margin-bottom:14px">
      "${quote}"
    </div>

    <div class="eyebrow" style="text-align:left;margin-bottom:8px">🎁 CHỌN MÓN TIẾP TẾ CHO DEV:</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:14px">
      <button class="miniButton donateOption" data-donate="10000" data-label="Cốc nước mía" style="padding:10px 6px;text-align:center;display:block">
        <span style="font-size:20px;display:block">🎋</span>
        <b>Cốc nước mía</b><br><span style="font-size:10px;color:#6b6782">10.000 đ</span>
      </button>
      <button class="miniButton donateOption" data-donate="25000" data-label="Cà phê muối" style="padding:10px 6px;text-align:center;display:block">
        <span style="font-size:20px;display:block">☕</span>
        <b>Cà phê muối</b><br><span style="font-size:10px;color:#6b6782">25.000 đ</span>
      </button>
      <button class="miniButton donateOption active" data-donate="35000" data-label="Trà sữa full top" style="padding:10px 6px;text-align:center;display:block">
        <span style="font-size:20px;display:block">🧋</span>
        <b>Trà sữa full top</b><br><span style="font-size:10px;color:#6b6782">35.000 đ</span>
      </button>
      <button class="miniButton donateOption" data-donate="45000" data-label="Cơm sườn ốp la" style="padding:10px 6px;text-align:center;display:block">
        <span style="font-size:20px;display:block">🍱</span>
        <b>Cơm sườn ốp la</b><br><span style="font-size:10px;color:#6b6782">45.000 đ</span>
      </button>
    </div>

    <div style="background:#fff;border:2px solid var(--ink);border-radius:13px;padding:12px;margin-bottom:12px;text-align:left;font-size:12px">
      <div style="font-weight:900;color:var(--purple);margin-bottom:6px">💳 THÔNG TIN TING TING:</div>
      <div style="line-height:1.6">
        <div>• <b>Ngân hàng:</b> MB Bank (Quân Đội) hoặc MoMo</div>
        <div>• <b>Số tài khoản:</b> <code id="bankAccDisplay" style="background:#eee;padding:2px 6px;border-radius:4px;font-weight:800">0901234567</code></div>
        <div>• <b>Chủ tài khoản:</b> <b id="bankNameDisplay">LE KHANH</b></div>
        <div>• <b>Nội dung:</b> <code id="bankMsgDisplay" style="background:#fef1bd;padding:2px 6px;border-radius:4px;font-weight:800">Office Survival tiep te dev</code></div>
      </div>
      <button class="secondary" data-act="copyBank" style="margin-top:10px;padding:8px 10px;font-size:11px;width:100%">
        📋 Sao chép STK &amp; Lời nhắn (35.000 đ)
      </button>
    </div>

    <button class="primary" data-act="freeHeart" style="margin-bottom:8px">
      ❤️ Tui nghèo nhưng tui có tấm lòng (Bắn tim)
    </button>
    <button class="secondary" data-act="close">ĐÓNG LẠI ĐỂ CÀY GAME TIẾP</button>
  </section></div>`;
}

export function openCertificateModal(host: HTMLElement, state: GameState): void {
  sounds.click();
  let currentAvatarId = MEME_AVATARS[0].id;
  let currentName = state.playerName || 'Nhân Viên Gương Mẫu';

  host.innerHTML = `<div class="dialogShade"><section class="dialog" role="dialog" aria-modal="true" style="text-align:center;max-width:520px">
    <div style="font-size:36px;margin:2px 0">📜🖨️✨</div>
    <h2 style="margin:2px 0 4px">BIÊN BẢN SA THẢI / BẰNG KHEN</h2>
    <p class="note" style="margin-bottom:10px">Tùy chỉnh thông tin để tải ảnh hoặc chia sẻ lên Story / Bạn bè!</p>

    <!-- Custom Name Input -->
    <div style="text-align:left;margin-bottom:10px">
      <label style="font-size:12px;font-weight:800;display:block;margin-bottom:4px">✏️ Tên nhân viên:</label>
      <input id="certNameInput" type="text" maxlength="24" value="${esc(currentName)}" style="width:100%;box-sizing:border-box;padding:8px 12px;border:2px solid var(--ink);border-radius:10px;font-weight:800;font-size:14px;background:#fff" placeholder="Nhập tên của bạn...">
    </div>

    <!-- Meme Avatar Selection -->
    <div style="text-align:left;margin-bottom:12px">
      <label style="font-size:12px;font-weight:800;display:block;margin-bottom:6px">🎭 Chọn Meme Ảnh Thẻ:</label>
      <div id="memeSelectorHost" style="display:grid;grid-template-columns:repeat(3, 1fr);gap:6px">
        ${MEME_AVATARS.map((m, i) => `
          <button type="button" class="miniButton memeAvatarBtn ${i === 0 ? 'active' : ''}" data-avatar="${m.id}" style="padding:6px;font-size:11px;text-align:center">
            <span style="font-size:22px;display:block">${m.emoji}</span>
            <b>${esc(m.name)}</b>
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Canvas Preview -->
    <div style="border:3px solid var(--ink);border-radius:14px;overflow:hidden;box-shadow:3px 3px 0 var(--ink);background:#000;margin-bottom:14px">
      <canvas id="certCanvas" style="width:100%;height:auto;display:block"></canvas>
    </div>

    <!-- Actions -->
    <button class="primary" id="btnDownloadCert" style="margin-bottom:8px">💾 TẢI ẢNH VỀ MÁY (PNG)</button>
    <button class="secondary" id="btnShareCert" style="margin-bottom:8px">📤 CHIA SẺ LÊN STORY / BẠN BÈ</button>
    <button class="secondary" data-act="close">ĐÓNG</button>
  </section></div>`;

  const canvas = document.getElementById('certCanvas') as HTMLCanvasElement;
  const nameInput = document.getElementById('certNameInput') as HTMLInputElement;

  function redraw() {
    if (!canvas) return;
    renderCertificateToCanvas(canvas, state, currentName, currentAvatarId);
  }

  redraw();

  nameInput?.addEventListener('input', () => {
    currentName = nameInput.value.trim() || 'Nhân Viên Gương Mẫu';
    state.playerName = currentName;
    redraw();
  });

  const selectorHost = document.getElementById('memeSelectorHost');
  selectorHost?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.memeAvatarBtn') as HTMLElement | null;
    if (!btn) return;
    sounds.click();
    document.querySelectorAll('.memeAvatarBtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentAvatarId = btn.dataset.avatar || MEME_AVATARS[0].id;
    redraw();
  });

  document.getElementById('btnDownloadCert')?.addEventListener('click', () => {
    downloadCertificate(canvas, `office-survival-${state.day}ngay.png`);
  });

  document.getElementById('btnShareCert')?.addEventListener('click', () => {
    shareCertificate(canvas);
  });
}

export function openRoleSelectionModal(
  host: HTMLElement,
  onSelect: (roleId: string, playerName: string) => void
): void {
  sounds.click();
  let selectedRole = 'genz';

  host.innerHTML = `<div class="dialogShade"><section class="dialog" role="dialog" aria-modal="true" style="text-align:center;max-width:480px">
    <div style="font-size:38px;margin:2px 0">🏢👔✨</div>
    <h2 style="margin:2px 0 4px">CHỌN HỆ TƯ TƯỞNG CÔNG SỞ</h2>
    <p class="note" style="margin-bottom:12px">Mỗi hệ tư tưởng có chỉ số khởi đầu và nội tại sống sót riêng biệt!</p>

    <div style="text-align:left;margin-bottom:12px">
      <label style="font-size:12px;font-weight:800;display:block;margin-bottom:4px">✏️ Tên / Biệt danh của bạn:</label>
      <input id="roleInputName" type="text" maxlength="24" value="Nhân Viên Gương Mẫu" style="width:100%;box-sizing:border-box;padding:8px 12px;border:2px solid var(--ink);border-radius:10px;font-weight:800;font-size:14px;background:#fff" placeholder="Nhập tên hoặc nickname...">
    </div>

    <div class="eyebrow" style="text-align:left;margin-bottom:8px">🎭 CHỌN 1 TRONG 4 CLASS:</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">
      ${ALL_ROLES.map((r, i) => `
        <button type="button" class="roleSelectBtn ${i === 0 ? 'active' : ''}" data-role="${r.id}" style="background:#fff;border:2px solid var(--ink);border-radius:13px;padding:11px;text-align:left;box-shadow:2px 2px 0 var(--ink);cursor:pointer;transition:transform 0.1s">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <span style="font-weight:900;font-size:14px">${r.emoji} ${esc(r.name)}</span>
            <span style="font-size:10px;font-weight:800;background:#f0edff;color:#4f46e5;padding:2px 6px;border-radius:5px;border:1px solid #4f46e5">${esc(r.passiveName)}</span>
          </div>
          <div style="font-size:11px;color:#6b6782;font-style:italic;margin-bottom:4px">${esc(r.motto)}</div>
          <div style="font-size:11px;color:#2e2b44;line-height:1.4"><b>Nội tại:</b> ${esc(r.passiveDesc)}</div>
          <div style="margin-top:5px;display:flex;gap:6px;font-size:10px;font-weight:800">
            <span style="background:#e6fcf0;color:#15693e;padding:1px 5px;border-radius:4px">⚡ Khởi đầu ${r.initE}</span>
            <span style="background:#fff2eb;color:#9c3612;padding:1px 5px;border-radius:4px">📋 Việc ${r.initB}</span>
            <span style="background:#f0edff;color:#4331a8;padding:1px 5px;border-radius:4px">⭐ Uy tín ${r.initR}</span>
          </div>
        </button>
      `).join('')}
    </div>

    <button class="primary" id="btnConfirmRole" style="margin-bottom:8px">🚀 XÁC NHẬN NHẬN VIỆC</button>
    <button class="secondary" data-act="close">HUỶ BỎ</button>
  </section></div>`;

  const btns = host.querySelectorAll('.roleSelectBtn');
  btns.forEach(b => {
    b.addEventListener('click', () => {
      sounds.click();
      btns.forEach(x => {
        x.classList.remove('active');
        (x as HTMLElement).style.borderColor = 'var(--ink)';
        (x as HTMLElement).style.background = '#fff';
      });
      b.classList.add('active');
      (b as HTMLElement).style.borderColor = 'var(--purple)';
      (b as HTMLElement).style.background = '#f5f2ff';
      selectedRole = (b as HTMLElement).dataset.role || 'genz';
    });
  });

  // Highlight first button
  const first = host.querySelector('.roleSelectBtn') as HTMLElement | null;
  if (first) {
    first.style.borderColor = 'var(--purple)';
    first.style.background = '#f5f2ff';
  }

  document.getElementById('btnConfirmRole')?.addEventListener('click', () => {
    sounds.success();
    const nameInput = document.getElementById('roleInputName') as HTMLInputElement;
    const name = nameInput?.value.trim() || 'Nhân Viên Gương Mẫu';
    host.innerHTML = '';
    onSelect(selectedRole, name);
  });
}
