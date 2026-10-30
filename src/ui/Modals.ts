import { GameState } from '../types/game';
import { CARDS } from '../data/cards';
import { ALL_ACHS } from '../data/achievements';
import { getDiscoveredCards, getHighScores, getUnlockedAchievements } from '../core/GameState';
import { sounds } from '../audio/SoundManager';

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
