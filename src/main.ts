import './styles/main.css';
import { GameEngine } from './core/GameEngine';
import { loadGameState } from './core/GameState';
import { renderDay, renderGameOver, renderPlay, renderResult, renderWelcome } from './ui/Renderer';
import {
  burstHearts,
  openCompendiumModal,
  openDonateModal,
  openHelpModal,
  openHistoryModal,
  openRankingsModal
} from './ui/Modals';
import { sounds } from './audio/SoundManager';
import { showToast } from './ui/Toast';
import { CARDS } from './data/cards';
import { ALL_PERKS } from './data/perks';

const ROOT = document.getElementById('root') as HTMLElement;
const HOST = document.getElementById('dialogHost') as HTMLElement;
const APPROOT = document.getElementById('appRoot') as HTMLElement;
const audioToggleBtn = document.getElementById('audioToggle') as HTMLButtonElement;

let engine: GameEngine;

function render(): void {
  const state = engine.getState();
  if (audioToggleBtn) {
    audioToggleBtn.textContent = sounds.isMuted() ? '🔇' : '🔊';
  }

  if (!state || state.stage === 'welcome') {
    ROOT.innerHTML = renderWelcome();
    return;
  }

  switch (state.stage) {
    case 'play':
      ROOT.innerHTML = renderPlay(state);
      break;
    case 'result':
      ROOT.innerHTML = renderResult(state);
      break;
    case 'day':
      ROOT.innerHTML = renderDay(state);
      break;
    case 'over':
      ROOT.innerHTML = renderGameOver(state);
      break;
    default:
      ROOT.innerHTML = renderWelcome();
  }
}

// Initialize Engine
let hasNudgedDonate = false;
const savedState = loadGameState();
engine = new GameEngine(savedState || undefined, (state) => {
  if (state.lastTurnLostLife && APPROOT) {
    APPROOT.classList.remove('shake');
    void APPROOT.offsetWidth;
    APPROOT.classList.add('shake');
  }

  // GenZ gentle nudge after surviving 2 days
  if (state.day >= 2 && !hasNudgedDonate && state.stage === 'day') {
    hasNudgedDonate = true;
    setTimeout(() => {
      showToast('🧋 Trụ tới ngày này là đỉnh nóc kịch trần rồi! Khiều nhẹ cốc trà sữa tiếp tế dev nha sốp~');
    }, 1200);
  }

  render();
});

// If no saved state, start at welcome
if (!savedState) {
  engine.getState().stage = 'welcome';
}

render();

// Service Worker Registration for PWA
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

function shareScore(): void {
  const s = engine.getState();
  const msg = `Tui sống sót đến Ngày ${s.day} trong OFFICE SURVIVAL 🧑‍💻💥\n🏆 ${s.score.toLocaleString('vi-VN')} điểm | 🃏 ${s.total} sự kiện | 🔁 ${s.triggerCount || 0} lần nghiệp quật\nDanh hiệu: ${engine.titleEnd()}`;
  if (navigator.share) {
    navigator.share({ title: 'Office Survival', text: msg }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(msg).then(() => showToast('Đã sao chép kết quả vào bộ nhớ tạm!')).catch(() => showToast('Không thể sao chép trên trình duyệt này.'));
  } else {
    showToast('Chia sẻ không khả dụng trên trình duyệt này.');
  }
}

function copyBankInfo(note = 'tiep te dev'): void {
  const text = `MBBank: 0901234567 | LE KHANH | ND: ${note}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      sounds.success();
      showToast('🎉 Đã copy STK! Cảm ơn sốp nhiều nha, dev sẽ sống sót qua hôm nay! 🧋');
    }).catch(() => {
      showToast('MBBank: 0901234567 - LE KHANH');
    });
  } else {
    showToast('MBBank: 0901234567 - LE KHANH');
  }
}

// Event Listeners
document.addEventListener('click', (ev) => {
  const target = ev.target as HTMLElement;

  // Donate Option click
  const donateOpt = target.closest('.donateOption') as HTMLElement | null;
  if (donateOpt) {
    sounds.click();
    document.querySelectorAll('.donateOption').forEach(el => el.classList.remove('active'));
    donateOpt.classList.add('active');
    const donateAmount = donateOpt.dataset.donate || '35000';
    const donateLabel = donateOpt.dataset.label || 'Trà sữa';
    const copyBtn = document.querySelector('[data-act="copyBank"]') as HTMLElement | null;
    const msgCode = document.getElementById('bankMsgDisplay');
    if (copyBtn) {
      copyBtn.innerHTML = `📋 Sao chép STK &amp; Lời nhắn (${Number(donateAmount).toLocaleString('vi-VN')} đ)`;
    }
    if (msgCode) {
      msgCode.textContent = `Office Survival ${donateAmount} ${donateLabel}`;
    }
    showToast(`Đã chọn ${donateLabel} (${Number(donateAmount).toLocaleString('vi-VN')} đ)!`);
    return;
  }

  const btn = target.closest('[data-act],[data-choice],[data-perk]') as HTMLElement | null;
  if (!btn) return;

  const perkId = btn.getAttribute('data-perk');
  if (perkId) {
    engine.pickPerk(perkId);
    return;
  }

  const choice = btn.getAttribute('data-choice');
  if (choice !== null) {
    engine.doChoice(+choice);
    return;
  }

  switch (btn.dataset.act) {
    case 'start':
      if (loadGameState() && !confirm('Bắt đầu run mới? Tiến trình cũ sẽ bị thay thế.')) return;
      sounds.click();
      engine.newRun();
      break;
    case 'continue': {
      const saved = loadGameState();
      sounds.click();
      if (saved) {
        engine.setState(saved);
      } else {
        engine.newRun();
      }
      break;
    }
    case 'proceed':
      engine.proceed();
      break;
    case 'nextday':
      engine.nextDay();
      break;
    case 'restart':
      sounds.click();
      if (confirm('Chơi lại từ Ngày 1? Tiến trình hiện tại sẽ bị xoá.')) {
        engine.newRun();
      }
      break;
    case 'history':
      openHistoryModal(HOST, engine.getState());
      break;
    case 'highscores':
      openRankingsModal(HOST);
      break;
    case 'donate':
      openDonateModal(HOST);
      break;
    case 'freeHeart':
      burstHearts();
      sounds.perk();
      showToast('❤️ Dev xúc động đậy! Cảm ơn tấm lòng của sốp (+999 Aura may mắn)!');
      break;
    case 'copyBank': {
      const msg = document.getElementById('bankMsgDisplay')?.textContent || 'Office Survival tiep te dev';
      copyBankInfo(msg);
      break;
    }
    case 'close':
      sounds.click();
      HOST.innerHTML = '';
      break;
    case 'share':
      shareScore();
      break;
  }
});

// Header Buttons
audioToggleBtn.addEventListener('click', () => {
  const isMuted = sounds.toggle();
  audioToggleBtn.textContent = isMuted ? '🔇' : '🔊';
  showToast(isMuted ? 'Đã tắt âm thanh' : 'Đã bật âm thanh');
});

document.getElementById('compBtn')?.addEventListener('click', () => openCompendiumModal(HOST));
document.getElementById('rankBtn')?.addEventListener('click', () => openRankingsModal(HOST));
document.getElementById('donateBtn')?.addEventListener('click', () => openDonateModal(HOST));
document.getElementById('help')?.addEventListener('click', () => openHelpModal(HOST));

// HUD Interactive Indicators (Reigns style preview)
function highlightHUD(affects: string[]): void {
  clearHUDHighlights();
  affects.forEach(stat => {
    const el = document.querySelector(`[data-stat="${stat}"]`);
    if (el) el.classList.add('hudHighlight');
  });
}

function clearHUDHighlights(): void {
  document.querySelectorAll('.hudHighlight').forEach(el => el.classList.remove('hudHighlight'));
}

document.addEventListener('mouseover', (e) => {
  const target = (e.target as HTMLElement).closest('.choice') as HTMLElement | null;
  if (!target) return;
  const affects = (target.dataset.affects || '').split(',').filter(Boolean);
  highlightHUD(affects);
});

document.addEventListener('mouseout', (e) => {
  const target = (e.target as HTMLElement).closest('.choice');
  if (target) clearHUDHighlights();
});

document.addEventListener('touchstart', (e) => {
  const target = (e.target as HTMLElement).closest('.choice') as HTMLElement | null;
  if (!target) return;
  const affects = (target.dataset.affects || '').split(',').filter(Boolean);
  highlightHUD(affects);
}, { passive: true });

document.addEventListener('touchend', () => {
  clearHUDHighlights();
}, { passive: true });

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (HOST.innerHTML) {
    if (e.key === 'Escape') HOST.innerHTML = '';
    return;
  }
  const key = e.key.toLowerCase();
  const state = engine.getState();

  if (state.stage === 'play') {
    if (/^[123]$/.test(key)) engine.doChoice(Number(key) - 1);
    else if (key === 'a') engine.doChoice(0);
    else if (key === 'b') engine.doChoice(1);
    else if (key === 'c') engine.doChoice(2);
  } else if ((e.key === 'Enter' || e.key === ' ') && state.stage === 'result') {
    e.preventDefault();
    engine.proceed();
  } else if ((e.key === 'Enter' || e.key === ' ') && state.stage === 'day') {
    e.preventDefault();
    engine.nextDay();
  }

  if (key === 'h' && !HOST.innerHTML) openHistoryModal(HOST, state);
  if (key === 'm') {
    const isMuted = sounds.toggle();
    audioToggleBtn.textContent = isMuted ? '🔇' : '🔊';
    showToast(isMuted ? 'Đã tắt âm thanh' : 'Đã bật âm thanh');
  }
});

// Testing / Debug API
(window as unknown as { OfficeSurvivalTest: unknown }).OfficeSurvivalTest = {
  getEngine: () => engine,
  getState: () => engine.getState(),
  setState: (s: typeof savedState) => { if (s) engine.setState(s); },
  getCards: () => CARDS,
  getPerks: () => ALL_PERKS,
  newRun: () => engine.newRun(),
  choose: (i: number) => engine.doChoice(i),
  next: () => engine.proceed(),
  finishDay: () => engine.finishDay(),
  nextDay: () => engine.nextDay(),
  pickPerk: (id: string) => engine.pickPerk(id),
  openCompendium: () => openCompendiumModal(HOST),
  openRankings: () => openRankingsModal(HOST)
};
