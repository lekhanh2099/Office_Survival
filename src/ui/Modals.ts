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
import { ALL_TRAITS } from '../data/traits';
import { StationDilemma } from '../data/officeDilemmas';

function esc(t?: string | number | null): string {
  return String(t ?? '').replace(/[&<>"']/g, x => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[x] || x));
}

export function openShiftHelpModal(host: HTMLElement): void {
  sounds.click();
  host.innerHTML = `<div class="dialogShade" role="presentation">
    <section class="dialog shiftGuideModal" role="dialog" aria-modal="true" aria-labelledby="shiftHelpTitle" style="max-width:440px;max-height:88vh;overflow-y:auto">
      <div class="dialogHeader" style="background:#dbeafe;border-bottom:2px solid var(--ink);padding:14px">
        <div style="font-size:32px;margin:0 0 2px">🏢🏭📦</div>
        <h2 id="shiftHelpTitle" style="font-size:18px;font-weight:900;margin:0 0 4px">HƯỚNG DẪN DÒNG CHẢY CA TRỰC 3D</h2>
        <p class="note" style="margin:0;font-size:12px;font-weight:700">Quy trình Merchandiser & Chuỗi Cung Ứng Dệt May</p>
      </div>

      <div class="dialogBody" style="padding:14px;font-size:12px;line-height:1.45">
        <!-- Goal Banner -->
        <div style="background:#fef3c7;border:2px solid #b45309;border-radius:10px;padding:10px;margin-bottom:12px">
          <div style="font-weight:900;color:#92400e;font-size:13px;margin-bottom:3px">🎯 MỤC TIÊU CA TRỰC (09:00 - 17:00):</div>
          <div style="color:#78350f">Hoàn thành xuất xưởng <b>3 Container hàng</b> trước giờ tan ca để nhận đầy đủ lương và thưởng KPI!</div>
        </div>

        <!-- 5-Step Supply Chain Flow -->
        <div style="font-weight:900;font-size:13px;margin:8px 0 6px;color:#1e1b4b">🔄 QUY TRÌNH 5 BƯỚC KHÉP KÍN:</div>
        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">
          <div style="display:flex;align-items:flex-start;gap:8px;background:#f8fafc;border:1.5px solid #cbd5e1;border-radius:8px;padding:6px 8px">
            <span style="background:#4f46e5;color:#fff;border-radius:50%;width:20px;height:20px;display:grid;place-items:center;font-weight:900;font-size:11px;flex-shrink:0">1</span>
            <div><b>Bàn Merchandiser 💻:</b> Nhận hợp đồng đơn hàng mới (Ví dụ: 500 Áo Polo đi Mỹ).</div>
          </div>
          <div style="display:flex;align-items:flex-start;gap:8px;background:#f8fafc;border:1.5px solid #cbd5e1;border-radius:8px;padding:6px 8px">
            <span style="background:#4f46e5;color:#fff;border-radius:50%;width:20px;height:20px;display:grid;place-items:center;font-weight:900;font-size:11px;flex-shrink:0">2</span>
            <div><b>Máy In Techpack 🖨️:</b> In bảng thông số kỹ thuật áo và bảng màu cho xưởng.</div>
          </div>
          <div style="display:flex;align-items:flex-start;gap:8px;background:#f8fafc;border:1.5px solid #cbd5e1;border-radius:8px;padding:6px 8px">
            <span style="background:#4f46e5;color:#fff;border-radius:50%;width:20px;height:20px;display:grid;place-items:center;font-weight:900;font-size:11px;flex-shrink:0">3</span>
            <div><b>Phòng Lab Soi Màu 🔬:</b> Kiểm tra mẫu nhuộm dưới đèn chuẩn D65 đạt Delta E.</div>
          </div>
          <div style="display:flex;align-items:flex-start;gap:8px;background:#f8fafc;border:1.5px solid #cbd5e1;border-radius:8px;padding:6px 8px">
            <span style="background:#4f46e5;color:#fff;border-radius:50%;width:20px;height:20px;display:grid;place-items:center;font-weight:900;font-size:11px;flex-shrink:0">4</span>
            <div><b>Kho Vải Đại Ngàn 🧵:</b> Xuống kho gặp Chị Nga Kế toán bốc cuộn vải Spandex.</div>
          </div>
          <div style="display:flex;align-items:flex-start;gap:8px;background:#f8fafc;border:1.5px solid #cbd5e1;border-radius:8px;padding:6px 8px">
            <span style="background:#4f46e5;color:#fff;border-radius:50%;width:20px;height:20px;display:grid;place-items:center;font-weight:900;font-size:11px;flex-shrink:0">5</span>
            <div><b>Cảng Cont Cát Lái 🚢:</b> Vác cây vải giao cho Anh Tuấn tài xế đóng cont xuất xưởng!</div>
          </div>
        </div>

        <!-- Navigation & Survival Tips -->
        <div style="font-weight:900;font-size:13px;margin:8px 0 6px;color:#1e1b4b">💡 MẸO ĐIỀU KHIỂN & SINH TỒN:</div>
        <div style="display:flex;flex-direction:column;gap:5px;color:#334155">
          <div>🧭 <b>Không sợ lạc:</b> Đi theo <b>Mũi tên xanh phát sáng</b> dưới chân và <b>Cột hào quang 🎯</b> ở trạm mục tiêu.</div>
          <div>🏃 <b>Tự động chạy:</b> Chạm thẳng vào <b>Thanh Nhiệm Vụ</b> trên đầu hoặc bàn làm việc để Chibi tự tìm đường!</div>
          <div>☕ <b>Hồi sức:</b> Uống Cà phê / Trà sữa 🧋 để tăng tốc; Thắp hương Thần Tài 🙏 khi quá stress.</div>
          <div>🚨 <b>Né Sếp Hùng:</b> Sếp đi tuần tra khắp văn phòng, cẩn thận kẻo bị bắt gặp trừ KPI.</div>
          <div>👆 <b>Cảm ứng 3D:</b> Vuốt 1 ngón xoay 360°, 2 ngón chụm phóng to thu nhỏ.</div>
        </div>
      </div>

      <div class="dialogFooter" style="padding:10px 14px 14px">
        <button class="primary" data-act="close" style="width:100%;padding:11px;font-size:13px;font-weight:900">🚀 ĐÃ RÕ QUY TRÌNH — CHIẾN THÔI!</button>
      </div>
    </section>
  </div>`;
}

export function openHelpModal(host: HTMLElement): void {
  sounds.click();
  host.innerHTML = `<div class="dialogShade" role="presentation">
    <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="helpTitle">
      <div class="dialogHeader">
        <div style="font-size:32px;margin:0 0 2px">📎🏢✨</div>
        <h2 id="helpTitle">SỔ TAY SINH TỒN XNK</h2>
        <p class="note">Cẩm nang sống sót qua các kiếp nạn Dệt May</p>
      </div>
      <div class="dialogBody">
        <p><b>Mục tiêu:</b> Sống sót càng nhiều ngày càng tốt. Mỗi ngày có 8 sự kiện; sự kiện cuối là lúc 17:59 trước giờ tan tầm.</p>
        <p><b>❤️ Mạng:</b> Bắt đầu với 3 mạng. Hết mạng là bị sa thải & đền hợp đồng (Game Over).</p>
        <p><b>⚡ Năng lượng:</b> Về 0 mất 1 mạng rồi được cấp cứu hồi 3; sang ngày mới hồi tối đa 4 (hoặc 5 nếu có Bình giữ nhiệt / Merchandiser).</p>
        <p><b>📋 Việc tồn:</b> Chạm 8 (hoặc 9 với Kế toán kho) mất 1 mạng rồi giảm về 5. Nếu hết ngày còn ≥6, uy tín bị giảm 1.</p>
        <p><b>⭐ Uy tín:</b> Về 0 ở cuối ngày sẽ mất 1 mạng rồi hồi 2.</p>
        <p><b>🎁 Phúc lợi (Perks):</b> Hoàn thành mỗi ngày bạn được chọn 1 vật phẩm hỗ trợ mang theo suốt run.</p>
        <p><b>✨ Tính cách (Traits):</b> Lựa chọn phong cách sống sót mang lại các buff độc quyền cực vui nhộn.</p>
        <p><b>🔁 Nghiệp quật:</b> Lựa chọn hôm nay có thể kéo theo hậu quả dở khóc dở cười vào các ngày sau.</p>
        <p><b>🎲 May rủi:</b> Các lựa chọn có xúc xắc luôn hiển thị tỷ lệ thành công dự kiến.</p>
        <p><b>🏆 Điểm số:</b> +10/lượt, +40/ngày vượt qua, +5/việc xử lý (tối đa 20 điểm/ngày), +15/hậu quả giải quyết.</p>
      </div>
      <div class="dialogFooter">
        <button class="secondary" data-act="close" style="width:100%">ĐÃ HIỂU — QUAY LẠI GAME</button>
      </div>
    </section>
  </div>`;
}

export function openHistoryModal(host: HTMLElement, state: GameState | null): void {
  sounds.click();
  const hist = state?.history || [];
  host.innerHTML = `<div class="dialogShade"><section class="dialog" role="dialog" aria-modal="true">
    <div class="dialogHeader">
      <h2>📖 Nhật ký sự kiện</h2>
      <p class="note">15 sự kiện gần nhất trong run này</p>
    </div>
    <div class="dialogBody">
      <div style="border:2px solid var(--ink);border-radius:12px;background:#fff;padding:8px 12px">
        ${hist.length ? hist.map(h => `<div style="font-size:12px;line-height:1.5;padding:7px 0;border-bottom:1px solid #dedce7">
          <b>Ngày ${h.day} · ${h.time}</b> — ${esc(h.card)}<br>
          <span style="color:#6a6683">↳ ${esc(h.choice)}</span>
        </div>`).join('') : '<p class="note">Chưa có sự kiện nào.</p>'}
      </div>
    </div>
    <div class="dialogFooter">
      <button class="secondary" data-act="close" style="width:100%">ĐÓNG</button>
    </div>
  </section></div>`;
}

export function openCompendiumModal(host: HTMLElement): void {
  sounds.click();
  const disc = getDiscoveredCards();
  const allCards = Object.values(CARDS);
  const total = allCards.length;
  const count = disc.length;

  host.innerHTML = `<div class="dialogShade"><section class="dialog" role="dialog" aria-modal="true">
    <div class="dialogHeader">
      <h2>📚 Sổ tay sự kiện</h2>
      <p class="note">Đã mở khoá: <b>${count}/${total}</b> thẻ (${Math.round((count / total) * 100)}%)</p>
    </div>
    <div class="dialogBody">
      <div class="compendiumGrid">
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
    </div>
    <div class="dialogFooter">
      <button class="secondary" data-act="close" style="width:100%">ĐÓNG</button>
    </div>
  </section></div>`;
}

export function openRankingsModal(host: HTMLElement): void {
  sounds.click();
  const scores = getHighScores();
  const achs = getUnlockedAchievements();

  host.innerHTML = `<div class="dialogShade"><section class="dialog" role="dialog" aria-modal="true">
    <div class="dialogHeader">
      <h2>🏆 Bảng vàng &amp; Thành tích</h2>
      <p class="note">Kỷ lục các chiến thần sống sót lâu nhất</p>
    </div>
    <div class="dialogBody">
      <div class="eyebrow" style="margin-bottom:6px">🏅 TOP 5 RUN XUẤT SẮC NHẤT</div>
      <div style="border:2px solid var(--ink);border-radius:12px;background:#fff;padding:8px 12px;margin-bottom:14px">
        ${scores.length ? scores.map((s, i) => `
          <div class="scoreRow">
            <div><span class="scoreRank">${i + 1}</span><b>${s.score.toLocaleString('vi-VN')} đ</b> · Ngày ${s.day}</div>
            <div style="font-size:11px;color:#6b6782">${esc(s.date)}</div>
          </div>
        `).join('') : '<p class="note">Chưa có kỷ lục nào được ghi nhận.</p>'}
      </div>

      <div class="eyebrow" style="margin-bottom:6px">🎖️ HUY HIỆU ĐÃ MỞ KHOÁ (${achs.length}/${ALL_ACHS.length})</div>
      <div class="achGrid">
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
    </div>
    <div class="dialogFooter">
      <button class="secondary" data-act="close" style="width:100%">ĐÓNG</button>
    </div>
  </section></div>`;
}

const GENZ_QUOTES = [
  'Sốp chơi cuốn quá thì donate ly trà sữa cho dev, chứ dev thức canh deadline tới sáng rồi 🧋',
  'Ăn xin online nhưng phong thái Merchandiser: 1 ly trà sữa = thêm 10 kiếp nạn dệt may 🧵',
  'Dev không cần người yêu, dev chỉ cần ly trà đào cam sả 50% đường 70% đá 🍑',
  'Ting ting cho dev một cốc nước mía là tàu Cát Lái tự động hạ bãi không lo rớt cont 🚢',
  'Cứu vớt một lập trình viên thoát khỏi kiếp deadline nửa đêm và bug tràn bờ đê 🥺',
  'Game không quảng cáo, không hút máu, chỉ xin nhẹ cốc nước mía vỉa hè qua ngày thôi sốp 🎋',
  'Người ta flex lương nghìn đô, còn dev ở đây flex việc bạn chơi game không bị crash 🚀',
  'Ủng hộ 1 cốc cà phê muối để dev có sức code thêm tính năng "Tát sếp bằng bảng Techpack" 📐'
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
    const dx = `${(Math.random() - 0.5) * 220}px`;
    const dx2 = `${(Math.random() - 0.5) * 360}px`;
    const rot = `${(Math.random() - 0.5) * 45}deg`;

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
    <div class="dialogHeader">
      <div style="font-size:32px;margin:0 0 2px">🧋🍱☕</div>
      <h2>QUỸ CỨU ĐÓI DEV GAME</h2>
      <div class="badgeText" style="transform:none;padding:2px 8px;font-size:10px;margin:2px 0">✨ GÓC KHIỀU TRÀ SỮA GEN Z ✨</div>
    </div>
    
    <div class="dialogBody">
      <div style="background:#f5f2ff;border:2px dashed var(--purple);border-radius:10px;padding:7px 10px;font-size:11.5px;font-weight:750;line-height:1.45;color:#3f3282;margin-bottom:8px">
        "${quote}"
      </div>

      <div class="eyebrow" style="text-align:left;font-size:10.5px;margin-bottom:5px">🎁 CHỌN MÓN TIẾP TẾ CHO DEV:</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
        <button class="miniButton donateOption" data-donate="10000" data-label="Cốc nước mía" style="padding:6px 4px;text-align:center;display:block">
          <span style="font-size:16px;display:block;margin-bottom:1px">🎋</span>
          <b style="font-size:11px">Cốc nước mía</b><br><span style="font-size:9.5px;color:#6b6782">10.000 đ</span>
        </button>
        <button class="miniButton donateOption" data-donate="25000" data-label="Cà phê muối" style="padding:6px 4px;text-align:center;display:block">
          <span style="font-size:16px;display:block;margin-bottom:1px">☕</span>
          <b style="font-size:11px">Cà phê muối</b><br><span style="font-size:9.5px;color:#6b6782">25.000 đ</span>
        </button>
        <button class="miniButton donateOption active" data-donate="35000" data-label="Trà sữa full top" style="padding:6px 4px;text-align:center;display:block">
          <span style="font-size:16px;display:block;margin-bottom:1px">🧋</span>
          <b style="font-size:11px">Trà sữa full top</b><br><span style="font-size:9.5px;color:#6b6782">35.000 đ</span>
        </button>
        <button class="miniButton donateOption" data-donate="45000" data-label="Cơm sườn ốp la" style="padding:6px 4px;text-align:center;display:block">
          <span style="font-size:16px;display:block;margin-bottom:1px">🍱</span>
          <b style="font-size:11px">Cơm sườn ốp la</b><br><span style="font-size:9.5px;color:#6b6782">45.000 đ</span>
        </button>
      </div>

      <div style="background:#fff;border:2px solid var(--ink);border-radius:10px;padding:8px 10px;margin-bottom:6px;text-align:left;font-size:11px">
        <div style="font-weight:900;color:var(--purple);margin-bottom:4px;font-size:11px">💳 THÔNG TIN TING TING:</div>
        <div style="line-height:1.45">
          <div>• <b>Ngân hàng:</b> MB Bank (Quân Đội) hoặc MoMo</div>
          <div>• <b>Số tài khoản:</b> <code id="bankAccDisplay" style="background:#eee;padding:1px 5px;border-radius:4px;font-weight:800">0901234567</code></div>
          <div>• <b>Chủ tài khoản:</b> <b id="bankNameDisplay">LE KHANH</b></div>
          <div>• <b>Nội dung:</b> <code id="bankMsgDisplay" style="background:#fef1bd;padding:1px 5px;border-radius:4px;font-weight:800">Office Survival tiep te dev</code></div>
        </div>
        <button class="secondary" data-act="copyBank" style="margin-top:6px;padding:6px 8px;font-size:11px;width:100%">
          📋 Sao chép STK &amp; Lời nhắn (35.000 đ)
        </button>
      </div>
    </div>

    <div class="dialogFooter">
      <button class="primary" data-act="freeHeart" style="padding:9px 12px;font-size:12px;width:100%">
        ❤️ Tui nghèo nhưng tui có tấm lòng (Bắn tim)
      </button>
      <button class="secondary" data-act="close" style="padding:7px 12px;font-size:11.5px;width:100%">ĐÓNG LẠI ĐỂ CÀY TIẾP</button>
    </div>
  </section></div>`;
}

export function openCertificateModal(host: HTMLElement, state: GameState): void {
  sounds.click();
  let currentAvatarId = MEME_AVATARS[0].id;
  let currentName = state.playerName || 'Nhân Viên Gương Mẫu';

  host.innerHTML = `<div class="dialogShade"><section class="dialog" role="dialog" aria-modal="true" style="text-align:center;max-width:520px">
    <div class="dialogHeader">
      <div style="font-size:32px;margin:0 0 2px">📜🖨️✨</div>
      <h2>BIÊN BẢN SA THẢI / BẰNG KHEN</h2>
      <p class="note">Tùy chỉnh thông tin để tải ảnh hoặc chia sẻ lên Story</p>
    </div>

    <div class="dialogBody">
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
      <div style="border:3px solid var(--ink);border-radius:14px;overflow:hidden;box-shadow:3px 3px 0 var(--ink);background:#000;margin-bottom:6px">
        <canvas id="certCanvas" style="width:100%;height:auto;display:block"></canvas>
      </div>
    </div>

    <div class="dialogFooter">
      <button class="primary" id="btnDownloadCert" style="padding:10px;font-size:13px;font-weight:900;width:100%">💾 TẢI ẢNH VỀ MÁY (PNG)</button>
      <div style="display:flex;gap:7px">
        <button class="secondary" id="btnShareCert" style="flex:1;padding:8px;font-size:12px">📤 Chia sẻ ngay</button>
        <button class="secondary" data-act="close" style="flex:1;padding:8px;font-size:12px">ĐÓNG</button>
      </div>
    </div>
  </section></div>`;

  const canvas = host.querySelector('#certCanvas') as HTMLCanvasElement;
  const nameInput = host.querySelector('#certNameInput') as HTMLInputElement;

  function updateCanvas(): void {
    if (canvas) {
      renderCertificateToCanvas(canvas, state, currentAvatarId, currentName);
    }
  }

  // Initial draw
  setTimeout(updateCanvas, 60);

  // Name change event
  nameInput?.addEventListener('input', () => {
    currentName = nameInput.value.trim() || 'Nhân Viên Gương Mẫu';
    updateCanvas();
  });

  // Avatar pick events
  const avatarBtns = host.querySelectorAll('.memeAvatarBtn');
  avatarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.click();
      avatarBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAvatarId = (btn as HTMLElement).dataset.avatar || MEME_AVATARS[0].id;
      updateCanvas();
    });
  });

  // Download Action
  host.querySelector('#btnDownloadCert')?.addEventListener('click', () => {
    sounds.success();
    if (canvas) {
      downloadCertificate(canvas, `Office_Survival_Bien_Ban_${Date.now()}.png`);
    }
  });

  // Share Action
  host.querySelector('#btnShareCert')?.addEventListener('click', () => {
    sounds.click();
    if (canvas) {
      shareCertificate(canvas);
    }
  });
}

export function openRoleSelectionModal(
  host: HTMLElement,
  onSelect: (roleId: string, playerName: string, traitId: string) => void
): void {
  sounds.click();
  let selectedRole = 'genz';
  let selectedTrait = 'sassy';

  host.innerHTML = `<div class="dialogShade"><section class="dialog" role="dialog" aria-modal="true" style="max-width:490px">
    <div class="dialogHeader">
      <div style="font-size:32px;margin:0 0 2px">🏢🧵✨</div>
      <h2>CHỌN HỒ SƠ ỨNG VIÊN XNK</h2>
      <p class="note">Chọn 1 Chức Danh & 1 Tính Cách Vibe Sinh Tồn!</p>
    </div>

    <div class="dialogBody">
      <!-- Nickname input -->
      <div style="text-align:left;margin-bottom:12px">
        <label style="font-size:12px;font-weight:800;display:block;margin-bottom:4px">✏️ Tên / Biệt danh của bạn:</label>
        <input id="roleInputName" type="text" maxlength="24" value="Nhân Viên Gương Mẫu" style="width:100%;box-sizing:border-box;padding:8px 12px;border:2px solid var(--ink);border-radius:10px;font-weight:800;font-size:14px;background:#fff" placeholder="Nhập tên hoặc nickname...">
      </div>

      <!-- 1. Chức danh Dệt May -->
      <div class="eyebrow" style="text-align:left;margin-bottom:6px">🎭 1. CHỌN 1 TRONG 4 CHỨC DANH DỆT MAY:</div>
      <div style="display:flex;flex-direction:column;gap:7px;margin-bottom:14px">
        ${ALL_ROLES.map((r, i) => `
          <button type="button" class="roleSelectBtn ${i === 0 ? 'active' : ''}" data-role="${r.id}" style="background:${i === 0 ? '#f5f2ff' : '#fff'};border:2px solid ${i === 0 ? 'var(--purple)' : 'var(--ink)'};border-radius:12px;padding:9px 11px;text-align:left;box-shadow:2px 2px 0 var(--ink);cursor:pointer;transition:transform 0.1s">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">
              <span style="font-weight:900;font-size:13.5px">${r.emoji} ${esc(r.name)}</span>
              <span style="font-size:10px;font-weight:800;background:#f0edff;color:#4f46e5;padding:2px 6px;border-radius:5px;border:1px solid #4f46e5">${esc(r.passiveName)}</span>
            </div>
            <div style="font-size:10.5px;color:#6b6782;font-style:italic;margin-bottom:3px">${esc(r.motto)}</div>
            <div style="font-size:11px;color:#2e2b44;line-height:1.35"><b>Nội tại:</b> ${esc(r.passiveDesc)}</div>
            <div style="margin-top:4px;display:flex;gap:6px;font-size:9.5px;font-weight:800">
              <span style="background:#e6fcf0;color:#15693e;padding:1px 5px;border-radius:4px">⚡ Khởi đầu ${r.initE}</span>
              <span style="background:#fff2eb;color:#9c3612;padding:1px 5px;border-radius:4px">📋 Việc ${r.initB}</span>
              <span style="background:#f0edff;color:#4331a8;padding:1px 5px;border-radius:4px">⭐ Uy tín ${r.initR}</span>
            </div>
          </button>
        `).join('')}
      </div>

      <!-- 2. Tính cách Vibe công sở -->
      <div class="eyebrow" style="text-align:left;margin-bottom:6px">✨ 2. CHỌN 1 TÍNH CÁCH / VIBE SINH TỒN:</div>
      <div style="display:flex;flex-direction:column;gap:7px;margin-bottom:6px">
        ${ALL_TRAITS.map((t, i) => `
          <button type="button" class="traitSelectBtn ${i === 0 ? 'active' : ''}" data-trait="${t.id}" style="background:${i === 0 ? '#fffbeb' : '#fff'};border:2px solid ${i === 0 ? '#f59e0b' : 'var(--ink)'};border-radius:12px;padding:9px 11px;text-align:left;box-shadow:2px 2px 0 var(--ink);cursor:pointer;transition:transform 0.1s">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">
              <span style="font-weight:900;font-size:13px">${t.emoji} ${esc(t.name)}</span>
              <span style="font-size:9.5px;font-weight:800;background:#fef3c7;color:#b45309;padding:1px 5px;border-radius:4px;border:1px solid #b45309">Đặc Quyền Vui</span>
            </div>
            <div style="font-size:10.5px;color:#6b6782;font-style:italic;margin-bottom:3px">${esc(t.motto)}</div>
            <div style="font-size:11px;color:#047857;line-height:1.35"><b>Buff:</b> ${esc(t.buff)}</div>
          </button>
        `).join('')}
      </div>
    </div>

    <div class="dialogFooter">
      <button class="primary" id="btnConfirmRole" style="width:100%;padding:11px 14px;font-size:14px;font-weight:900">🚀 XÁC NHẬN NHẬN VIỆC</button>
      <button class="secondary" data-act="close" style="width:100%;padding:8px 14px;font-size:12px">HUỶ BỎ</button>
    </div>
  </section></div>`;

  // Role buttons
  const roleBtns = host.querySelectorAll('.roleSelectBtn');
  roleBtns.forEach(b => {
    b.addEventListener('click', () => {
      sounds.click();
      roleBtns.forEach(x => {
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

  // Trait buttons
  const traitBtns = host.querySelectorAll('.traitSelectBtn');
  traitBtns.forEach(b => {
    b.addEventListener('click', () => {
      sounds.click();
      traitBtns.forEach(x => {
        x.classList.remove('active');
        (x as HTMLElement).style.borderColor = 'var(--ink)';
        (x as HTMLElement).style.background = '#fff';
      });
      b.classList.add('active');
      (b as HTMLElement).style.borderColor = '#f59e0b';
      (b as HTMLElement).style.background = '#fffbeb';
      selectedTrait = (b as HTMLElement).dataset.trait || 'sassy';
    });
  });

  // Confirm button
  document.getElementById('btnConfirmRole')?.addEventListener('click', () => {
    sounds.success();
    const nameInput = document.getElementById('roleInputName') as HTMLInputElement;
    const name = nameInput?.value.trim() || 'Nhân Viên Gương Mẫu';
    host.innerHTML = '';
    onSelect(selectedRole, name, selectedTrait);
  });
}

export function openDilemmaModal(
  host: HTMLElement,
  dilemma: StationDilemma,
  onChoose: (choice: 'A' | 'B') => void
): void {
  sounds.perk();
  host.innerHTML = `
    <div class="dialogShade" role="presentation">
      <section class="dialog shiftDilemmaDialog" role="dialog" aria-modal="true" style="max-width:440px;border-radius:18px;border:2.5px solid #f59e0b;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.4)">
        <div class="dilemmaHeader" style="background:linear-gradient(135deg, #1e1b4b, #312e81);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:12px;border-bottom:2px solid #f59e0b">
          <div style="font-size:36px;background:rgba(255,255,255,0.15);width:52px;height:52px;border-radius:50%;display:grid;place-items:center;flex-shrink:0;box-shadow:0 0 10px rgba(245,158,11,0.5)">
            ${dilemma.npcAvatar}
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:11px;font-weight:900;color:#facc15;text-transform:uppercase;letter-spacing:0.5px">⚡ BIẾN SỐ TÌNH HUỐNG VĂN PHÒNG</div>
            <div style="font-size:16px;font-weight:900;color:#ffffff;line-height:1.2;margin:2px 0 1px">${esc(dilemma.title)}</div>
            <div style="font-size:11px;color:#94a3b8;font-weight:700">Đối thoại cùng: <b style="color:#e2e8f0">${esc(dilemma.npcName)}</b></div>
          </div>
        </div>

        <div class="dilemmaBody" style="padding:16px 14px;background:#0f172a;color:#e2e8f0">
          <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.14);border-radius:10px;padding:10px 12px;font-size:12.5px;line-height:1.45;color:#f1f5f9;margin-bottom:14px;font-weight:700">
            ${esc(dilemma.situation)}
          </div>

          <div style="font-size:11px;font-weight:900;color:#94a3b8;text-transform:uppercase;margin-bottom:8px;letter-spacing:0.4px">
            👉 BẠN CHỌN HƯỚNG GIẢI QUYẾT NÀO?
          </div>

          <div class="dilemmaChoices" style="display:flex;flex-direction:column;gap:10px">
            <button class="dilemmaChoiceBtn choiceA" id="btnDilemmaA" type="button" style="text-align:left;background:linear-gradient(135deg, #1e293b, #334155);border:2px solid #38bdf8;border-radius:12px;padding:10px 12px;cursor:pointer;transition:all 0.15s ease">
              <div style="font-weight:900;font-size:13px;color:#38bdf8;margin-bottom:3px">🅰️ ${esc(dilemma.optionA.text)}</div>
              <div style="font-size:11px;font-weight:800;color:#cbd5e1;background:rgba(56,189,248,0.15);display:inline-block;padding:2px 8px;border-radius:5px">
                ✨ ${esc(dilemma.optionA.preview)}
              </div>
            </button>

            <button class="dilemmaChoiceBtn choiceB" id="btnDilemmaB" type="button" style="text-align:left;background:linear-gradient(135deg, #1e293b, #334155);border:2px solid #f59e0b;border-radius:12px;padding:10px 12px;cursor:pointer;transition:all 0.15s ease">
              <div style="font-weight:900;font-size:13px;color:#facc15;margin-bottom:3px">🅱️ ${esc(dilemma.optionB.text)}</div>
              <div style="font-size:11px;font-weight:800;color:#cbd5e1;background:rgba(245,158,11,0.15);display:inline-block;padding:2px 8px;border-radius:5px">
                🔥 ${esc(dilemma.optionB.preview)}
              </div>
            </button>
          </div>
        </div>
      </section>
    </div>
  `;

  document.getElementById('btnDilemmaA')?.addEventListener('click', () => {
    sounds.success();
    host.innerHTML = '';
    onChoose('A');
  });

  document.getElementById('btnDilemmaB')?.addEventListener('click', () => {
    sounds.success();
    host.innerHTML = '';
    onChoose('B');
  });
}
