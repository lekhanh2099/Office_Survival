import './styles/main.css';
import { GameEngine } from './core/GameEngine';
import { BattlerEngine } from './core/BattlerEngine';
import { loadGameState } from './core/GameState';
import { renderDay, renderGameOver, renderPlay, renderResult, renderWelcome } from './ui/Renderer';
import { Card3DCanvas } from './ui/Card3DCanvas';
import { OfficeStage, Workstation } from './3d/OfficeStage';
import { VirtualJoystick } from './3d/VirtualJoystick';
import { ShiftGameEngine } from './3d/ShiftGameEngine';
import {
  mountShiftHUD,
  updateShiftHUD,
  renderShiftFinishModal,
  showStationActionCard,
  hideStationActionCard,
  getCachedInteractionMode,
  setCachedInteractionMode
} from './ui/ShiftRenderer';
import {
  renderBattlerHUD,
  renderCrisisArena,
  renderHand,
  renderRewardModal,
  renderDayClear
} from './ui/BattlerRenderer';
import {
  burstHearts,
  openCertificateModal,
  openCompendiumModal,
  openDonateModal,
  openHelpModal,
  openShiftHelpModal,
  openCampusMapModal,
  openColleagueModal,
  openDilemmaModal,
  openHistoryModal,
  openRankingsModal,
  openRoleSelectionModal,
  openPlayerProfileModal,
  openApplianceModal
} from './ui/Modals';
import { sounds } from './audio/SoundManager';
import { showToast } from './ui/Toast';
import { CARDS } from './data/cards';
import { ALL_PERKS } from './data/perks';
import { PickleballEngine, ShotType } from './pickleball/PickleballEngine';
import { PickleballStage } from './pickleball/PickleballStage';
import {
  mountPickleballHUD,
  updatePickleballHUD,
  showPickleballPointBanner,
  showPickleballTimingBadge
} from './pickleball/PickleballRenderer';
import {
  renderPickleballSettingsModal,
  renderPickleballMatchOverModal
} from './pickleball/PickleballModals';

const ROOT = document.getElementById('root') as HTMLElement;
const HOST = document.getElementById('dialogHost') as HTMLElement;
const APPROOT = document.getElementById('appRoot') as HTMLElement;
const audioToggleBtn = document.getElementById('audioToggle') as HTMLButtonElement;
const modeSwitchBtn = document.getElementById('modeSwitchBtn') as HTMLButtonElement | null;

let currentMode: 'shift' | 'story' | 'battler' | 'pickleball' = 'shift';
let shiftDay = 1;
let engine: GameEngine;
let battlerEngine: BattlerEngine;
let active3DCard: Card3DCanvas | null = null;

// Pickleball Mode Lifecycle
let pbEngine: PickleballEngine | null = null;
let pbStage: PickleballStage | null = null;
let pbAnimFrameId: number | null = null;
let pbPlayerDirX = 0;
let pbLastFrameTime = performance.now();

// 3D Shift Mode Lifecycle
let shiftStage: OfficeStage | null = null;
let shiftJoystick: VirtualJoystick | null = null;
let shiftEngine: ShiftGameEngine | null = null;
let shiftAnimFrameId: number | null = null;
let selectedStationForCard: Workstation | null = null;
let lastFrameTime = performance.now();

function cleanupShift(): void {
  selectedStationForCard = null;
  if (shiftAnimFrameId) {
    cancelAnimationFrame(shiftAnimFrameId);
    shiftAnimFrameId = null;
  }
  shiftJoystick?.destroy();
  shiftJoystick = null;
  shiftStage?.destroy();
  shiftStage = null;
  shiftEngine = null;
}

function renderShiftMode(): void {
  cleanupShift();

  ROOT.innerHTML = `
    <div class="shiftContainer" id="shiftContainer">
      <div id="shiftCanvasHost"></div>
      <div id="shiftUIHost"></div>
    </div>
  `;

  const canvasHost = document.getElementById('shiftCanvasHost');
  const uiHost = document.getElementById('shiftUIHost');
  const container = document.getElementById('shiftContainer');
  if (!canvasHost || !uiHost || !container) return;

  shiftStage = new OfficeStage(canvasHost);
  shiftEngine = new ShiftGameEngine(shiftStage, shiftDay, (s) => {
    if (s.isFinished && uiHost) {
      shiftJoystick?.setVisible(false);
      uiHost.classList.add('shiftFinishedOverlay');
      uiHost.innerHTML = renderShiftFinishModal(s);
    }
  });

  (window as any).__shiftEngine = shiftEngine;
  (window as any).__shiftStage = shiftStage;

  // Dynamic Situational Dilemmas Modal Trigger
  shiftEngine.onTriggerDilemma = (dilemma, onResolve) => {
    openDilemmaModal(HOST, dilemma, (choice) => {
      onResolve(choice);
    });
  };

  // Direct Floor Tap-to-Walk feedback
  shiftStage.onFloorTapCallback = () => {
    sounds.click();
    showToast('🏃 Chibi đang chạy tới vị trí bạn vừa chạm...');
  };

  // Direct 3D Colleague NPC Tap / Click Handling
  shiftStage.onColleagueClickCallback = (colleagueId) => {
    sounds.click();
    const cid = colleagueId as 'boss' | 'nga' | 'tuan' | 'linh' | 'hoang';
    const curFavor = shiftEngine?.getState().colleagueFavors[cid] ?? 20;
    openColleagueModal(HOST, cid, curFavor, (optionId) => {
      return shiftEngine!.interactWithColleague(cid, optionId);
    });
  };

  // Direct 3D Player Tap / Click Handling -> Open Profile Customization
  shiftStage.onPlayerClickCallback = () => {
    sounds.click();
    if (shiftEngine) {
      openPlayerProfileModal(HOST, shiftEngine.getState().playerProfile, (newProfile) => {
        shiftEngine!.updatePlayerProfile(newProfile);
      });
    }
  };

  // Direct 3D Click / Tap Raycaster Handling (Both Auto-Work and Card confirmation modes!)
  shiftStage.onStationClickCallback = (st) => {
    sounds.click();
    const mode = getCachedInteractionMode();
    if (mode === 'card') {
      selectedStationForCard = st;
      const details = shiftEngine!.getStationActionDetails(st);
      showStationActionCard(uiHost, {
        emoji: st.emoji,
        title: st.name,
        subtitle: `📍 ${st.zone}`,
        desc: details.desc,
        buttonText: details.buttonText,
        hasApplianceActions: details.hasApplianceActions
      });
    } else {
      selectedStationForCard = null;
      hideStationActionCard(uiHost);
      const curPos = shiftStage!.player.getPosition();
      const dist = curPos.distanceTo(st.position);
      if (dist <= st.radius) {
        shiftEngine!.doAction(st);
      } else {
        showToast(`🏃 Đang chạy đến ${st.name}...`);
        shiftStage!.startAutoWalkTo(st, () => {
          shiftEngine?.doAction(st);
        });
      }
    }
  };

  shiftJoystick = new VirtualJoystick(container, () => {
    shiftEngine?.doAction();
  });

  // Mount HUD DOM once
  mountShiftHUD(uiHost);

  // Set initial visual guidance target (Beacon pillar & floor arrow)
  shiftStage.updateTargetGuidance(shiftEngine.getState().currentTask.targetStation);

  // Check first-time onboarding guide
  if (!localStorage.getItem('os_shift_onboarded')) {
    localStorage.setItem('os_shift_onboarded', 'true');
    setTimeout(() => {
      openShiftHelpModal(HOST);
    }, 350);
  }

  lastFrameTime = performance.now();

  const loop = (now: number) => {
    if (!shiftStage || !shiftEngine) return;
    const delta = Math.min((now - lastFrameTime) / 1000, 0.1);
    lastFrameTime = now;

    const vec = shiftJoystick ? shiftJoystick.getVector() : { x: 0, y: 0, active: false };
    shiftStage.update(delta, vec.x, vec.y);
    shiftEngine.update(delta);
    shiftStage.updateTargetGuidance(shiftEngine.getState().currentTask.targetStation);
    shiftStage.renderScene();

    const s = shiftEngine.getState();
    const isModalOpen = Boolean(HOST && HOST.innerHTML.trim() !== '');

    if (s.isFinished) {
      if (!uiHost.classList.contains('shiftFinishedOverlay')) {
        uiHost.classList.add('shiftFinishedOverlay');
        uiHost.innerHTML = renderShiftFinishModal(s);
      }
    } else if (!isModalOpen && uiHost && shiftStage) {
      if (uiHost.classList.contains('shiftFinishedOverlay')) {
        uiHost.classList.remove('shiftFinishedOverlay');
        mountShiftHUD(uiHost);
      }
      updateShiftHUD(uiHost, s, shiftStage);
    }

    shiftAnimFrameId = requestAnimationFrame(loop);
  };

  shiftAnimFrameId = requestAnimationFrame(loop);
}

function cleanupPickleball(): void {
  if (pbAnimFrameId) {
    cancelAnimationFrame(pbAnimFrameId);
    pbAnimFrameId = null;
  }
  pbStage?.destroy();
  pbStage = null;
  pbEngine = null;
  pbPlayerDirX = 0;
}

function renderPickleballMode(): void {
  cleanupPickleball();

  ROOT.innerHTML = `
    <div class="pbContainer" id="pbContainer">
      <div id="pbCanvasHost"></div>
      <div id="pbUIHost"></div>
    </div>
  `;

  const canvasHost = document.getElementById('pbCanvasHost');
  const uiHost = document.getElementById('pbUIHost');
  if (!canvasHost || !uiHost) return;

  pbEngine = new PickleballEngine({
    opponentId: 'nga',
    targetScore: 5,
    ballSpeedFactor: 1.0,
    autoPositionAssist: true
  });

  pbStage = new PickleballStage(canvasHost, pbEngine);

  mountPickleballHUD(uiHost, pbEngine);

  pbEngine.onPointScored = (result) => {
    sounds.perk();
    showPickleballPointBanner(result);
  };

  pbEngine.onBallHit = (_hitter, _shot, quality) => {
    sounds.click();
    showPickleballTimingBadge(quality);
  };

  pbEngine.onMatchFinished = (winner, stats) => {
    if (winner === 'player') {
      sounds.success();
      burstHearts();
    } else {
      sounds.click();
    }
    HOST.innerHTML = renderPickleballMatchOverModal(winner, pbEngine!, stats);
  };

  (window as any).__pbEngine = pbEngine;
  (window as any).__pbStage = pbStage;

  pbLastFrameTime = performance.now();

  const loop = (now: number) => {
    if (!pbStage || !pbEngine) return;
    const delta = Math.min((now - pbLastFrameTime) / 1000, 0.05);
    pbLastFrameTime = now;

    pbEngine.update(delta, pbPlayerDirX);
    pbStage.update(delta);
    pbStage.render();

    if (uiHost) {
      updatePickleballHUD(uiHost, pbEngine);
    }

    pbAnimFrameId = requestAnimationFrame(loop);
  };

  pbAnimFrameId = requestAnimationFrame(loop);
}

function render(): void {
  try {
    // Cleanup any active 3D card
    if (active3DCard) {
      active3DCard.destroy();
      active3DCard = null;
    }
    // Cleanup shift if we're not in shift mode
    if (currentMode !== 'shift') {
      cleanupShift();
    }
    // Cleanup pickleball if we're not in pickleball mode
    if (currentMode !== 'pickleball') {
      cleanupPickleball();
    }

    if (audioToggleBtn) {
      audioToggleBtn.textContent = sounds.isMuted() ? '🔇' : '🔊';
    }
    if (modeSwitchBtn) {
      if (currentMode === 'shift') {
        modeSwitchBtn.innerHTML = '<span class="btnIcon">🏢</span><span class="btnText">Ca Trực 3D</span>';
      } else if (currentMode === 'pickleball') {
        modeSwitchBtn.innerHTML = '<span class="btnIcon">🎾</span><span class="btnText">Pickleball</span>';
      } else if (currentMode === 'story') {
        modeSwitchBtn.innerHTML = '<span class="btnIcon">🎴</span><span class="btnText">Thẻ 3D</span>';
      } else {
        modeSwitchBtn.innerHTML = '<span class="btnIcon">🃏</span><span class="btnText">Đấu Bài</span>';
      }
    }

    if (currentMode === 'shift') {
      renderShiftMode();
      return;
    }

    if (currentMode === 'pickleball') {
      renderPickleballMode();
      return;
    }

    if (currentMode === 'battler') {
      renderBattlerMode();
      return;
    }

    // Classic / Enhanced 3D Story Mode
    const state = engine.getState();
    if (!state || state.stage === 'welcome') {
      ROOT.innerHTML = renderWelcome();
      return;
    }

    switch (state.stage) {
      case 'play': {
        ROOT.innerHTML = renderPlay(state);
        const cardHost = document.getElementById('card3DHost');
        if (cardHost && state.current && CARDS[state.current]) {
          const card = CARDS[state.current];
          let badge = '📨 THẺ SỰ CỐ';
          if (card.type === 'crisis') badge = '🚨 KHẨN CẤP';
          else if (card.type === 'callback') badge = '🔁 NGHIỆP QUẬT';
          else if (card.type === 'rare') badge = '✨ HIẾM GẶP';
          else if (card.type === 'finale') badge = '🌆 CHỐT NGÀY';

          const shortBody = card.body.split(/[.!?;]/)[0] || card.body;

          active3DCard = new Card3DCanvas({
            container: cardHost,
            emoji: card.emoji,
            sender: card.who,
            title: card.title,
            subtitle: shortBody,
            cardType: card.type,
            badgeText: badge
          });
        }
        break;
      }
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
  } catch (err) {
    console.error('Render error:', err);
    if (ROOT) {
      ROOT.innerHTML = `<section class="panel" style="text-align:center;padding:24px">
        <div style="font-size:48px;margin-bottom:8px">⚠️</div>
        <h2 style="margin:4px 0 8px">Đã cập nhật phiên bản mới!</h2>
        <p class="note" style="margin-bottom:14px">Dữ liệu lưu tạm cần làm mới để đồng bộ với tính năng mới nhất.</p>
        <button class="primary" id="btnResetCache" style="width:100%">🔄 Làm mới và chơi ngay</button>
      </section>`;
      document.getElementById('btnResetCache')?.addEventListener('click', () => {
        try { localStorage.clear(); } catch {}
        window.location.reload();
      });
    }
  }
}

function renderBattlerMode(): void {
  const bState = battlerEngine.getState();

  switch (bState.stage) {
    case 'battle':
      ROOT.innerHTML = renderBattlerHUD(bState) + renderCrisisArena(bState) + renderHand(bState);
      break;
    case 'reward':
      ROOT.innerHTML = renderRewardModal(bState);
      break;
    case 'day_clear':
      ROOT.innerHTML = renderDayClear(bState);
      break;
    case 'game_over': {
      ROOT.innerHTML = `<section class="panel" style="background:#fff0f1;text-align:center">
        <div class="eyebrow" style="color:#e11d48">HỒ SƠ NHÂN SỰ ĐÃ ĐÓNG</div>
        <div style="font-size:74px;margin:12px 0">💀😿</div>
        <h1 style="font-size:42px;margin-bottom:8px">GAME<br>OVER!</h1>
        <div class="badgeText" style="transform:none">CHIẾN THẦN ĐẤU THẺ BÀI</div>
        <div class="alertNote" style="text-align:center;margin:12px 0"><b>Nguyên nhân thất bại:</b> ${bState.deathReason || 'Gục ngã trước bão táp công sở'}</div>
        <div class="summaryGrid">
          <div class="summaryBox">Ngày đạt tới<strong>${bState.day}</strong></div>
          <div class="summaryBox">Điểm cuối<strong>${bState.score.toLocaleString('vi-VN')}</strong></div>
          <div class="summaryBox">Số thẻ thu thập<strong>${bState.deck.length}</strong></div>
          <div class="summaryBox">Kiếp nạn vượt qua<strong>${(bState.day - 1) * 4 + bState.encounterIndex}</strong></div>
        </div>
        <div class="buttons">
          <button class="primary" data-act="certificate" style="background:linear-gradient(135deg, #e11d48, #be123c);border-color:#881337;box-shadow:3px 3px 0 #881337;font-weight:900">📜 XUẤT BIÊN BẢN SA THẢI (KHOE STORY)</button>
          <button class="primary" data-act="battler_restart">🔄 ỨNG TUYỂN LẠI TỪ ĐẦU</button>
          <button class="secondary" data-act="donate" style="background:#fff8d6;border-color:#f59e0b;color:#854d0e;font-weight:900">🧋 Tiếp tế trà sữa cứu đói Dev</button>
        </div>
      </section>`;
      break;
    }
  }
}

// Initialize Engines
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

battlerEngine = new BattlerEngine(() => {
  render();
});
battlerEngine.startNewGame();

// If no saved state, start at welcome for story mode
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

  // Battler Card click to play
  const battlerCardEl = target.closest('.battlerCard') as HTMLElement | null;
  if (battlerCardEl && currentMode === 'battler') {
    const handIdx = battlerCardEl.dataset.handIndex;
    if (handIdx !== undefined) {
      battlerEngine.playCard(Number(handIdx));
      return;
    }
  }

  // Pick reward card
  const pickBtn = target.closest('[data-pick-reward]') as HTMLElement | null;
  if (pickBtn && currentMode === 'battler') {
    const rIdx = Number(pickBtn.dataset.pickReward);
    const card = battlerEngine.getState().rewardChoices[rIdx];
    if (card) battlerEngine.pickRewardCard(card);
    return;
  }

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

  // Colleague Quick Bar chip click
  const colleagueBtn = target.closest('[data-colleague]') as HTMLElement | null;
  if (colleagueBtn && currentMode === 'shift' && shiftEngine) {
    const cid = colleagueBtn.dataset.colleague as 'boss' | 'nga' | 'tuan' | 'linh' | 'hoang';
    if (cid) {
      sounds.click();
      const curFavor = shiftEngine.getState().colleagueFavors[cid] ?? 20;
      openColleagueModal(HOST, cid, curFavor, (optionId) => {
        return shiftEngine!.interactWithColleague(cid, optionId);
      });
      return;
    }
  }

  // Pickleball Shot Buttons
  const pbShotBtn = target.closest('[data-pb-shot]') as HTMLElement | null;
  if (pbShotBtn && currentMode === 'pickleball' && pbEngine) {
    const shot = pbShotBtn.dataset.pbShot as ShotType;
    if (pbEngine.isServing && pbEngine.currentServer === 'player') {
      pbEngine.executeServe();
    } else {
      pbEngine.playerHitBall(shot);
    }
    return;
  }

  // Pickleball Settings Modal Item Selection
  const pbOppBtn = target.closest('[data-pb-opponent]') as HTMLElement | null;
  if (pbOppBtn) {
    sounds.click();
    document.querySelectorAll('.pbOpponentCard').forEach(el => {
      el.classList.remove('active');
      (el as HTMLElement).style.borderColor = '#cbd5e1';
      (el as HTMLElement).style.background = '#f8fafc';
    });
    pbOppBtn.classList.add('active');
    pbOppBtn.style.borderColor = '#0284c7';
    pbOppBtn.style.background = '#eff6ff';
    return;
  }

  const pbTargetBtn = target.closest('[data-pb-target]') as HTMLElement | null;
  if (pbTargetBtn) {
    sounds.click();
    document.querySelectorAll('.pbTargetBtn').forEach(el => {
      el.classList.remove('active');
      (el as HTMLElement).style.background = '#ffffff';
      (el as HTMLElement).style.color = '#334155';
      (el as HTMLElement).style.borderColor = '#cbd5e1';
    });
    pbTargetBtn.classList.add('active');
    pbTargetBtn.style.background = '#0284c7';
    pbTargetBtn.style.color = '#ffffff';
    pbTargetBtn.style.borderColor = '#0284c7';
    return;
  }

  const pbPadBtn = target.closest('[data-pb-paddle]') as HTMLElement | null;
  if (pbPadBtn) {
    sounds.click();
    document.querySelectorAll('.pbPaddleCard').forEach(el => {
      el.classList.remove('active');
      (el as HTMLElement).style.borderColor = '#cbd5e1';
      (el as HTMLElement).style.background = '#ffffff';
    });
    pbPadBtn.classList.add('active');
    pbPadBtn.style.borderColor = '#10b981';
    pbPadBtn.style.background = '#f0fdf4';
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
    sounds.click();
    const idx = +choice;
    if (active3DCard) {
      active3DCard.triggerFlipAnimation(() => {
        engine.doChoice(idx);
      });
    } else {
      engine.doChoice(idx);
    }
    return;
  }

  switch (btn.dataset.act) {
    case 'open_pb_settings':
      if (pbEngine) {
        sounds.click();
        HOST.innerHTML = renderPickleballSettingsModal(pbEngine);
      }
      break;
    case 'close_pb_settings':
      sounds.click();
      HOST.innerHTML = '';
      break;
    case 'save_pb_settings': {
      sounds.success();
      if (pbEngine) {
        const oppCard = HOST.querySelector('.pbOpponentCard.active') as HTMLElement | null;
        const oppId = (oppCard?.dataset.pbOpponent || 'nga') as any;
        const tgtBtn = HOST.querySelector('.pbTargetBtn.active') as HTMLElement | null;
        const targetScore = Number(tgtBtn?.dataset.pbTarget || 5) as 5 | 7 | 11;
        const padCard = HOST.querySelector('.pbPaddleCard.active') as HTMLElement | null;
        const paddleId = padCard?.dataset.pbPaddle || 'carbon_genz';
        const autoAssist = (document.getElementById('pbAutoAssistCheck') as HTMLInputElement)?.checked ?? true;
        const fastSpeed = (document.getElementById('pbFastSpeedCheck') as HTMLInputElement)?.checked ?? false;

        pbEngine.updateSettings({
          opponentId: oppId,
          targetScore: targetScore,
          selectedPaddleId: paddleId,
          autoPositionAssist: autoAssist,
          ballSpeedFactor: fastSpeed ? 1.25 : 1.0
        });
        pbStage?.updateOpponentVisuals();
        const uiHostEl = document.getElementById('pbUIHost');
        if (uiHostEl) mountPickleballHUD(uiHostEl, pbEngine);
        HOST.innerHTML = '';
        showToast(`🎾 Đã sẵn sàng thi đấu cùng ${pbEngine.opponent.name}!`);
      }
      break;
    }
    case 'exit_pb':
      sounds.click();
      currentMode = 'shift';
      render();
      break;
    case 'pb_play_again':
      sounds.success();
      HOST.innerHTML = '';
      pbEngine?.resetMatch();
      break;
    case 'pb_exit_to_campus':
      sounds.click();
      HOST.innerHTML = '';
      if (shiftEngine) {
        const s = shiftEngine.getState();
        s.stress = Math.max(0, s.stress - 35);
        const oppId = pbEngine?.opponent.id;
        if (oppId && s.colleagueFavors[oppId] !== undefined) {
          s.colleagueFavors[oppId] = Math.min(100, s.colleagueFavors[oppId] + 20);
        }
        showToast('🧘 Tinh thần sảng khoái: -35% Stress 🔥 và +20% Thân thiết đồng nghiệp!');
      }
      currentMode = 'shift';
      render();
      break;
    case 'shift_play_pickleball':
      sounds.success();
      HOST.innerHTML = '';
      currentMode = 'pickleball';
      render();
      break;
    case 'start_shift':
      sounds.click();
      currentMode = 'shift';
      shiftDay = 1;
      render();
      break;
    case 'shift_next_day':
      sounds.click();
      shiftDay += 1;
      render();
      break;
    case 'shift_to_menu':
      sounds.click();
      currentMode = 'story';
      engine.getState().stage = 'welcome';
      render();
      break;
    case 'toggle_camera':
      if (shiftStage) {
        sounds.click();
        const mode = shiftStage.toggleCameraMode();
        showToast(mode === 'overview' ? '🎥 Góc máy Toàn Cảnh (Diorama Overview)!' : '🏃 Góc máy Bám Sát Chibi!');
        const uiHostEl = document.getElementById('shiftUIHost');
        if (uiHostEl && shiftEngine) {
          updateShiftHUD(uiHostEl, shiftEngine.getState(), shiftStage);
        }
      }
      break;
    case 'toggle_drag_mode':
      if (shiftStage) {
        sounds.click();
        const mode = shiftStage.toggleDragMode();
        showToast(mode === 'orbit' ? '🔄 Vuốt 1 ngón: Xoay 360° tự do!' : '✋ Vuốt 1 ngón: Kéo trượt bản đồ!');
        const uiHostEl = document.getElementById('shiftUIHost');
        if (uiHostEl && shiftEngine) {
          updateShiftHUD(uiHostEl, shiftEngine.getState(), shiftStage);
        }
      }
      break;
    case 'open_campus_map': {
      if (shiftEngine && shiftStage) {
        sounds.click();
        const curTask = shiftEngine.getState().currentTask;
        const curZone = shiftStage.currentZoneName;
        openCampusMapModal(HOST, curZone, curTask.targetStation, (chosenStationType) => {
          const targetSt = shiftStage?.stations.find(s => s.type === chosenStationType);
          if (targetSt) {
            showToast(`🏃 Đang tự động chạy tới: ${targetSt.name}...`);
            shiftStage?.startAutoWalkTo(targetSt, () => {
              const intMode = getCachedInteractionMode();
              if (intMode === 'auto_work') {
                shiftEngine?.doAction(targetSt);
              } else {
                selectedStationForCard = targetSt;
                const hostEl = document.getElementById('shiftUIHost');
                if (hostEl) {
                  showStationActionCard(hostEl, shiftEngine!.getStationActionDetails(targetSt));
                }
              }
            });
          }
        });
      }
      break;
    }
    case 'recenter_camera':
      if (shiftStage) {
        sounds.click();
        shiftStage.recenterCamera();
        showToast('🎯 Đã căn lại góc máy chuẩn trên Chibi!');
      }
      break;
    case 'zoom_in':
      if (shiftStage) {
        sounds.click();
        shiftStage.zoomIn(6.0);
        showToast('🔍 Đã phóng to camera (gần hơn)!');
      }
      break;
    case 'zoom_out':
      if (shiftStage) {
        sounds.click();
        shiftStage.zoomOut(6.0);
        showToast('🔍 Đã thu nhỏ camera (toàn cảnh)!');
      }
      break;
    case 'toggle_quest_collapse': {
      sounds.click();
      const banner = document.getElementById('hudQuestBanner');
      const arrow = document.getElementById('questCollapseArrow');
      if (banner) {
        const isCollapsed = banner.classList.toggle('isCollapsed');
        if (arrow) {
          arrow.textContent = isCollapsed ? '▼' : '▲';
        }
        showToast(isCollapsed ? 'Thu gọn bảng nhiệm vụ (rộng màn hình 3D)' : 'Mở rộng bảng nhiệm vụ');
      }
      break;
    }
    case 'open_weather_info': {
      if (shiftEngine) {
        sounds.click();
        const w = shiftEngine.getState().weather;
        if (w) {
          showToast(`${w.badgeText} — ${w.desc}`);
        }
      }
      break;
    }
    case 'toggle_interaction_mode': {
      sounds.click();
      const current = getCachedInteractionMode();
      const next = current === 'auto_work' ? 'card' : 'auto_work';
      setCachedInteractionMode(next);
      showToast(next === 'auto_work' ? '⚡ Đã chuyển sang: Chạm là Chibi tự chạy đến làm việc ngay!' : '📋 Đã chuyển sang: Chạm mở Thẻ xác nhận công việc!');
      const uiHostEl = document.getElementById('shiftUIHost');
      if (uiHostEl && shiftEngine && shiftStage) {
        updateShiftHUD(uiHostEl, shiftEngine.getState(), shiftStage);
      }
      break;
    }
    case 'auto_walk_to_quest': {
      if (shiftStage && shiftEngine) {
        sounds.click();
        const curTask = shiftEngine.getState().currentTask;
        const targetSt = shiftStage.stations.find(s => s.type === curTask.targetStation);
        if (targetSt) {
          showToast(`🏃 Đang tự động chạy tới: ${targetSt.name}...`);
          shiftStage.startAutoWalkTo(targetSt, () => {
            const intMode = getCachedInteractionMode();
            if (intMode === 'auto_work') {
              shiftEngine?.doAction(targetSt);
            } else {
              selectedStationForCard = targetSt;
              const hostEl = document.getElementById('shiftUIHost');
              if (hostEl) {
                showStationActionCard(hostEl, shiftEngine!.getStationActionDetails(targetSt));
              }
            }
          });
        }
      }
      break;
    }
    case 'open_player_profile': {
      if (shiftEngine) {
        sounds.click();
        openPlayerProfileModal(HOST, shiftEngine.getState().playerProfile, (newProfile) => {
          shiftEngine!.updatePlayerProfile(newProfile);
        });
      }
      break;
    }
    case 'open_appliance_menu': {
      if (selectedStationForCard && shiftEngine) {
        sounds.click();
        const stationType = selectedStationForCard.type;
        const uiHostEl = document.getElementById('shiftUIHost');
        if (uiHostEl) hideStationActionCard(uiHostEl);
        openApplianceModal(HOST, stationType, (actId) => {
          const toast = shiftEngine!.executeApplianceAction(stationType, actId);
          showToast(toast);
        });
      }
      break;
    }
    case 'open_shift_help': {
      openShiftHelpModal(HOST);
      break;
    }
    case 'confirm_action_card': {
      sounds.click();
      const uiHostEl = document.getElementById('shiftUIHost');
      if (uiHostEl) hideStationActionCard(uiHostEl);
      if (selectedStationForCard && shiftStage && shiftEngine) {
        const targetSt = selectedStationForCard;
        selectedStationForCard = null;
        const curPos = shiftStage.player.getPosition();
        const dist = curPos.distanceTo(targetSt.position);
        if (dist <= targetSt.radius) {
          shiftEngine.doAction(targetSt);
        } else {
          showToast(`🏃 Đang chạy đến ${targetSt.name}...`);
          shiftStage.startAutoWalkTo(targetSt, () => {
            shiftEngine?.doAction(targetSt);
          });
        }
      }
      break;
    }
    case 'close_action_card': {
      sounds.click();
      selectedStationForCard = null;
      const uiHostEl = document.getElementById('shiftUIHost');
      if (uiHostEl) hideStationActionCard(uiHostEl);
      break;
    }
    case 'start':
      if (loadGameState() && !confirm('Bắt đầu run mới? Tiến trình cũ sẽ bị thay thế.')) return;
      sounds.click();
      openRoleSelectionModal(HOST, (roleId, name, traitId) => {
        engine.newRun(roleId, name, '🐱📱', traitId);
      });
      break;
    case 'continue': {
      const saved = loadGameState();
      sounds.click();
      if (saved) {
        engine.setState(saved);
      } else {
        openRoleSelectionModal(HOST, (roleId, name, traitId) => {
          engine.newRun(roleId, name, '🐱📱', traitId);
        });
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
      openRoleSelectionModal(HOST, (roleId, name, traitId) => {
        engine.newRun(roleId, name, '🐱📱', traitId);
      });
      break;
    case 'end_turn':
      battlerEngine.endTurn();
      break;
    case 'skip_reward':
      battlerEngine.skipReward();
      break;
    case 'battler_next_day':
      battlerEngine.nextDay();
      break;
    case 'battler_restart':
      battlerEngine.startNewGame();
      break;
    case 'certificate':
      if (currentMode === 'battler') {
        const b = battlerEngine.getState();
        const fakeState: any = {
          day: b.day,
          total: (b.day - 1) * 4 + b.encounterIndex,
          lives: b.lives,
          score: b.score,
          b: b.backlog,
          r: b.rep,
          triggerCount: Math.max(0, b.deck.length - 8),
          deathReason: b.deathReason || 'Ngã gục trước deadline và meme mèo',
          role: 'genz',
          playerName: 'Chiến Thần Đấu Thẻ'
        };
        openCertificateModal(HOST, fakeState);
      } else {
        openCertificateModal(HOST, engine.getState());
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
modeSwitchBtn?.addEventListener('click', () => {
  sounds.click();
  if (currentMode === 'shift') {
    currentMode = 'pickleball';
    showToast('🎾 Đã bật Sân Pickleball Công Sở!');
  } else if (currentMode === 'pickleball') {
    currentMode = 'story';
    showToast('🎴 Đã bật chế độ Cốt Truyện Thẻ Bài 3D!');
  } else if (currentMode === 'story') {
    currentMode = 'battler';
    showToast('🃏 Đã bật chế độ Đấu Thẻ Bài Meme!');
  } else {
    currentMode = 'shift';
    showToast('🏢 Đã bật chế độ Ca Trực 3D Chibi!');
  }
  render();
});

// Custom Event to enter Pickleball directly from Campus workstation or ending
window.addEventListener('enter-pickleball-mode', () => {
  sounds.perk();
  showToast('🎾 Đang bước vào Sân Pickleball Công Sở...');
  currentMode = 'pickleball';
  render();
});

// Pointer down/up for Mobile left/right paddle nudge buttons
document.addEventListener('pointerdown', (e) => {
  const target = e.target as HTMLElement;
  if (target.closest('#pbMoveLeftBtn')) {
    pbPlayerDirX = -1;
  } else if (target.closest('#pbMoveRightBtn')) {
    pbPlayerDirX = 1;
  }
});

document.addEventListener('pointerup', () => {
  if (currentMode === 'pickleball' && pbPlayerDirX !== 0) {
    pbPlayerDirX = 0;
  }
});

audioToggleBtn.addEventListener('click', () => {
  const isMuted = sounds.toggle();
  audioToggleBtn.textContent = isMuted ? '🔇' : '🔊';
  showToast(isMuted ? 'Đã tắt âm thanh' : 'Đã bật âm thanh');
});

document.getElementById('compBtn')?.addEventListener('click', () => openCompendiumModal(HOST));
document.getElementById('rankBtn')?.addEventListener('click', () => openRankingsModal(HOST));
document.getElementById('donateBtn')?.addEventListener('click', () => openDonateModal(HOST));
document.getElementById('help')?.addEventListener('click', () => {
  if (currentMode === 'shift') {
    openShiftHelpModal(HOST);
  } else {
    openHelpModal(HOST);
  }
});

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

// Drag & Drop for Battler Cards
document.addEventListener('dragstart', (e) => {
  const cardEl = (e.target as HTMLElement).closest('.battlerCard') as HTMLElement | null;
  if (!cardEl) return;
  const index = cardEl.dataset.handIndex;
  if (index !== undefined && e.dataTransfer) {
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
  }
});

document.addEventListener('dragover', (e) => {
  const target = (e.target as HTMLElement).closest('#crisisTargetArea') as HTMLElement | null;
  if (target) {
    e.preventDefault();
    target.classList.add('dragOverTarget');
  }
});

document.addEventListener('dragleave', (e) => {
  const target = (e.target as HTMLElement).closest('#crisisTargetArea') as HTMLElement | null;
  if (target) {
    target.classList.remove('dragOverTarget');
  }
});

document.addEventListener('drop', (e) => {
  const target = (e.target as HTMLElement).closest('#crisisTargetArea') as HTMLElement | null;
  if (target && e.dataTransfer) {
    e.preventDefault();
    target.classList.remove('dragOverTarget');
    const idx = e.dataTransfer.getData('text/plain');
    if (idx !== '') {
      battlerEngine.playCard(Number(idx));
    }
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (HOST.innerHTML) {
    if (e.key === 'Escape') HOST.innerHTML = '';
    return;
  }
  const key = e.key.toLowerCase();
  const state = engine.getState();

  // Pickleball Controls
  if (currentMode === 'pickleball' && pbEngine) {
    if (key === 'arrowleft' || key === 'a') {
      pbPlayerDirX = -1;
    } else if (key === 'arrowright' || key === 'd') {
      pbPlayerDirX = 1;
    } else if (key === 'j') {
      if (pbEngine.isServing && pbEngine.currentServer === 'player') {
        pbEngine.executeServe();
      } else {
        pbEngine.playerHitBall('smash');
      }
    } else if (key === 'k') {
      if (pbEngine.isServing && pbEngine.currentServer === 'player') {
        pbEngine.executeServe();
      } else {
        pbEngine.playerHitBall('dink');
      }
    } else if (key === 'l') {
      if (pbEngine.isServing && pbEngine.currentServer === 'player') {
        pbEngine.executeServe();
      } else {
        pbEngine.playerHitBall('curve');
      }
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (pbEngine.isServing && pbEngine.currentServer === 'player') {
        pbEngine.executeServe();
      } else {
        pbEngine.playerHitBall('smash');
      }
    }
    return;
  }

  if (state.stage === 'play') {
    let choiceIdx = -1;
    if (/^[123]$/.test(key)) choiceIdx = Number(key) - 1;
    else if (key === 'a') choiceIdx = 0;
    else if (key === 'b') choiceIdx = 1;
    else if (key === 'c') choiceIdx = 2;

    if (choiceIdx >= 0) {
      sounds.click();
      if (active3DCard) {
        active3DCard.triggerFlipAnimation(() => engine.doChoice(choiceIdx));
      } else {
        engine.doChoice(choiceIdx);
      }
    }
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

document.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  if (currentMode === 'pickleball') {
    if ((key === 'arrowleft' || key === 'a') && pbPlayerDirX < 0) {
      pbPlayerDirX = 0;
    } else if ((key === 'arrowright' || key === 'd') && pbPlayerDirX > 0) {
      pbPlayerDirX = 0;
    }
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
