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
  renderPickleballMatchOverModal,
  renderPickleballTournamentModal,
  renderPickleballPvPModal,
  PvPModalProps
} from './pickleball/PickleballModals';
import { PickleballNet } from './pickleball/PickleballNet';

const ROOT = document.getElementById('root') as HTMLElement;
const HOST = document.getElementById('dialogHost') as HTMLElement;
const APPROOT = document.getElementById('appRoot') as HTMLElement;
const audioToggleBtn = document.getElementById('audioToggle') as HTMLButtonElement;
const modeSwitchBtn = document.getElementById('modeSwitchBtn') as HTMLButtonElement | null;

const urlParams = new URLSearchParams(window.location.search);
const initialModeParam = urlParams.get('mode');
let currentMode: 'shift' | 'story' | 'battler' | 'pickleball' =
  initialModeParam === 'pickleball' ? 'pickleball' : 'shift';
let shiftDay = 1;
let engine: GameEngine;
let battlerEngine: BattlerEngine;
let active3DCard: Card3DCanvas | null = null;

// Pickleball Mode Lifecycle
let pbEngine: PickleballEngine | null = null;
let pbStage: PickleballStage | null = null;
let pbAnimFrameId: number | null = null;
let pbPlayerDirX = 0;
let pbPlayerDirZ = 0;
let pbLastFrameTime = performance.now();

// PvP Multiplayer Net & Modal State
let pbNet: PickleballNet | null = null;
let pvpModalProps: PvPModalProps = {
  view: 'menu',
  playerName: 'Bạn',
  targetScore: 5
};

function updatePvPModal(props: Partial<PvPModalProps>): void {
  pvpModalProps = { ...pvpModalProps, ...props };
  HOST.innerHTML = renderPickleballPvPModal(pvpModalProps);
}

function initPickleballNet(): PickleballNet {
  if (pbNet) return pbNet;

  pbNet = new PickleballNet({
    onGuestJoined: (guest) => {
      sounds.perk();
      updatePvPModal({
        view: 'connected',
        guestName: guest.name,
        guestEmoji: guest.emoji,
        hostName: pbNet?.localPlayer.name || 'Bạn',
        hostEmoji: pbNet?.localPlayer.emoji || '🧑‍💻'
      });
      showToast(`🎉 Đối thủ ${guest.name} đã vào phòng!`);
    },
    onConnectedToHost: (hostInfo) => {
      sounds.perk();
      updatePvPModal({
        view: 'connected',
        hostName: hostInfo.name,
        hostEmoji: hostInfo.emoji,
        guestName: pbNet?.localPlayer.name || 'Bạn',
        guestEmoji: pbNet?.localPlayer.emoji || '🧑‍💻',
        targetScore: hostInfo.targetScore as 3 | 5 | 11
      });
      showToast(`🎉 Đã kết nối với chủ phòng ${hostInfo.name}!`);
    },
    onGameStart: () => {
      sounds.success();
      HOST.innerHTML = '';
      if (pbEngine && pbNet) {
        pbEngine.setPvPMode('guest', pbNet.remotePlayer, pvpModalProps.targetScore || 5);
        pbStage?.updateOpponentVisuals();
        const uiHostEl = document.getElementById('pbUIHost');
        if (uiHostEl) mountPickleballHUD(uiHostEl, pbEngine);
        showToast('🔥 Trận đấu Solo 1v1 BẮT ĐẦU!');
      }
    },
    onSnapshotReceived: (snapshot) => {
      if (pbEngine && pbEngine.pvpRole === 'guest') {
        pbEngine.applyWorldSnapshot(snapshot);
      }
    },
    onGuestMove: (pos) => {
      if (pbEngine && pbEngine.pvpRole === 'host') {
        pbEngine.applyGuestInput(pos);
      }
    },
    onGuestShot: (shot) => {
      if (pbEngine && pbEngine.pvpRole === 'host') {
        pbEngine.guestHitBall(shot.shotType, shot.explicitAimX, shot.explicitAimZ);
      }
    },
    onGuestServe: (aimX) => {
      if (pbEngine && pbEngine.pvpRole === 'host') {
        pbEngine.guestExecuteServe(aimX);
      }
    },
    onDisconnected: (reason) => {
      showToast(reason || 'Đối thủ đã ngắt kết nối');
      if (pbEngine && pbEngine.isPvP) {
        pbEngine.setPvPMode('none');
        const uiHostEl = document.getElementById('pbUIHost');
        if (uiHostEl) mountPickleballHUD(uiHostEl, pbEngine);
      }
    }
  });

  return pbNet;
}

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
  document.body.classList.remove('isPickleballMode');
  if (pbAnimFrameId) {
    cancelAnimationFrame(pbAnimFrameId);
    pbAnimFrameId = null;
  }
  pbStage?.destroy();
  pbStage = null;
  pbEngine = null;
  pbPlayerDirX = 0;
  pbPlayerDirZ = 0;
}

function renderPickleballMode(): void {
  cleanupPickleball();
  document.body.classList.add('isPickleballMode');

  ROOT.innerHTML = `
    <div class="pbContainer" id="pbContainer">
      <div id="pbCanvasHost"></div>
      <canvas id="pbSwipeCanvas"></canvas>
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
    autoPositionAssist: false
  });

  pbStage = new PickleballStage(canvasHost, pbEngine);

  mountPickleballHUD(uiHost, pbEngine);

  // Setup direct court touch / click steering & mobile swipe-to-hit (Tennis Clash Style)
  const container = document.getElementById('pbContainer');
  const swipeCanvas = document.getElementById('pbSwipeCanvas') as HTMLCanvasElement | null;
  if (container) {
    const sctx = swipeCanvas?.getContext('2d');
    const resizeSwipeCanvas = () => {
      if (swipeCanvas && container) {
        swipeCanvas.width = container.clientWidth;
        swipeCanvas.height = container.clientHeight;
      }
    };
    resizeSwipeCanvas();
    window.addEventListener('resize', resizeSwipeCanvas);

    let isTouching = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let swipePoints: { x: number; y: number }[] = [];

    const drawSwipeTrail = () => {
      if (!sctx || !swipeCanvas || swipePoints.length < 2) return;
      sctx.clearRect(0, 0, swipeCanvas.width, swipeCanvas.height);
      const start = swipePoints[0];
      const end = swipePoints[swipePoints.length - 1];
      const dx = end.x - start.x;
      const dy = end.y - start.y;

      sctx.beginPath();
      sctx.moveTo(start.x, start.y);
      for (let i = 1; i < swipePoints.length; i++) {
        sctx.lineTo(swipePoints[i].x, swipePoints[i].y);
      }

      // Dynamic color & glow based on swipe gesture skill
      let color = 'rgba(56, 189, 248, 0.9)';
      let glow = '#0284c7';
      if (dy < -45) {
        color = 'rgba(249, 115, 22, 0.95)'; // Smash: Fire orange
        glow = '#ea580c';
      } else if (dy >= -35 && Math.hypot(dx, dy) < 60) {
        color = 'rgba(16, 185, 129, 0.95)'; // Dink: Emerald green
        glow = '#059669';
      } else if (Math.abs(dx) > 35) {
        color = 'rgba(168, 85, 247, 0.95)'; // Curve: Purple
        glow = '#9333ea';
      }

      sctx.strokeStyle = color;
      sctx.lineWidth = 5;
      sctx.lineCap = 'round';
      sctx.lineJoin = 'round';
      sctx.shadowColor = glow;
      sctx.shadowBlur = 12;
      sctx.stroke();

      // Directional arrowhead at the tip showing exact aim trajectory
      const angle = Math.atan2(dy, dx);
      const headLen = 12;
      sctx.fillStyle = color;
      sctx.beginPath();
      sctx.moveTo(end.x, end.y);
      sctx.lineTo(end.x - headLen * Math.cos(angle - Math.PI / 6), end.y - headLen * Math.sin(angle - Math.PI / 6));
      sctx.lineTo(end.x - headLen * Math.cos(angle + Math.PI / 6), end.y - headLen * Math.sin(angle + Math.PI / 6));
      sctx.closePath();
      sctx.fill();
    };

    const clearSwipeTrail = () => {
      if (sctx && swipeCanvas) {
        sctx.clearRect(0, 0, swipeCanvas.width, swipeCanvas.height);
      }
      swipePoints = [];
    };

    container.addEventListener('pointerdown', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.pbShotBtn, .pbHeadBtn, .dialog, #pbSliderTrack, .pbMoveBtn, .pbScoreboardRibbon, .pbDialogueBubble')) {
        return;
      }

      // If serving, immediate single tap anywhere on screen serves!
      if (pbEngine && pbEngine.isServing && pbEngine.currentServer === 'player') {
        pbEngine.executeServe();
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate(18); } catch (_) {}
        }
        return;
      }

      isTouching = true;
      touchStartX = e.clientX;
      touchStartY = e.clientY;
      touchStartTime = performance.now();
      swipePoints = [{ x: e.offsetX, y: e.offsetY }];
      try { container.setPointerCapture(e.pointerId); } catch (_) {}

      // Direct, instantaneous touch steering (No lag, 100% responsive!):
      if (pbEngine) {
        const rect = container.getBoundingClientRect();
        const ratioX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const ratioY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        const targetX = (ratioX - 0.5) * 5.4;
        const targetZ = 2.2 + Math.max(0, Math.min(1, (ratioY - 0.28) / 0.58)) * 3.6;
        pbEngine.setPlayerPos(targetX, targetZ);
      }
    });

    container.addEventListener('pointermove', (e) => {
      if (!isTouching) return;
      swipePoints.push({ x: e.offsetX, y: e.offsetY });
      if (swipePoints.length > 10) swipePoints.shift();
      drawSwipeTrail();

      // Fluid continuous drag-steering across the court
      if (pbEngine) {
        const rect = container.getBoundingClientRect();
        const ratioX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const ratioY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        const targetX = (ratioX - 0.5) * 5.4;
        const targetZ = 2.2 + Math.max(0, Math.min(1, (ratioY - 0.28) / 0.58)) * 3.6;
        pbEngine.setPlayerPos(targetX, targetZ);

        if (pbNet && pbNet.status === 'connected' && pbEngine.pvpRole === 'guest') {
          pbNet.send({ type: 'MOVE', x: targetX, z: targetZ });
        }
      }
    });

    const stopTouch = (e: PointerEvent) => {
      if (!isTouching) return;
      isTouching = false;
      try { container.releasePointerCapture(e.pointerId); } catch (_) {}

      const dx = e.clientX - touchStartX;
      const dy = e.clientY - touchStartY;
      const dt = Math.max(1, performance.now() - touchStartTime);
      const speed = Math.hypot(dx, dy) / dt;

      setTimeout(clearSwipeTrail, 120);

      if (pbEngine) {
        // Handle Serve (Player or Guest)
        if (pbEngine.isServing && pbEngine.currentServer === 'player') {
          const angleRatio = dx / Math.max(30, Math.abs(dy) * 0.9);
          const aimX = Math.abs(dx) > 16 ? Math.max(-2.4, Math.min(2.4, angleRatio * 2.4)) : undefined;

          if (pbEngine.isPvP && pbEngine.pvpRole === 'guest') {
            pbNet?.send({ type: 'SERVE', aimX: aimX !== undefined ? -aimX : undefined });
          } else {
            pbEngine.executeServe(aimX);
          }
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try { navigator.vibrate(18); } catch (_) {}
          }
          return;
        }

        // SWIPE-TO-HIT GESTURE (Direct Swipe Aiming + Skill Recognition)
        const dist = Math.hypot(dx, dy);
        const isSwipeGesture = dist >= 16 || dy < -14 || Math.abs(dx) >= 16;
        if (isSwipeGesture) {
          if (pbEngine.isPvP && pbEngine.pvpRole === 'guest') {
            const angleRatio = dx / Math.max(26, Math.abs(dy) * 0.85);
            const explicitAimX = Math.max(-2.55, Math.min(2.55, angleRatio * 2.5));
            let shotType: ShotType = 'drive';
            let explicitAimZ = 4.8;

            if (Math.abs(dx) > 38 && Math.abs(dx) > Math.abs(dy) * 0.72) {
              shotType = 'curve';
              explicitAimZ = 4.7;
            } else if ((speed > 0.44 && dy < -38) || dy < -65 || (dist > 70 && speed > 0.36)) {
              shotType = 'smash';
              explicitAimZ = 5.35;
            } else if (dist < 46 && speed < 0.38) {
              shotType = 'dink';
              explicitAimZ = 1.85;
            } else {
              shotType = 'drive';
              explicitAimZ = 4.8;
            }

            // Invert coordinates for Host
            pbNet?.send({
              type: 'SHOT',
              shotType,
              explicitAimX: -explicitAimX,
              explicitAimZ: explicitAimZ
            });
            sounds.pickleballPaddleHit(shotType === 'smash');
            return;
          }

          const res = pbEngine.triggerPlayerShotWithGesture(dx, dy, dt, speed);
          if (res.success) {
            if (res.shotType === 'smash') {
              sounds.pickleballPaddleHit(true);
              pbStage?.triggerScreenShake(0.35);
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                try { navigator.vibrate([30, 20, 50]); } catch (_) {}
              }
            } else {
              sounds.pickleballPaddleHit(false);
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                try { navigator.vibrate(18); } catch (_) {}
              }
            }
          }
        } else if (dt < 220 && dist < 16) {
          // Stationary tap
          const bDx = Math.abs(pbEngine.ball.x - pbEngine.playerPos.x);
          const bDz = Math.abs(pbEngine.ball.z - (pbEngine.playerPos.z - 0.45));
          if (pbEngine.ball.inPlay && pbEngine.ball.vz > 0 && bDx <= 1.8 && bDz <= 1.8) {
            const chosen = pbEngine.ball.y > 1.05 ? 'smash' : (pbEngine.ball.y < 0.62 ? 'dink' : 'curve');
            if (pbEngine.isPvP && pbEngine.pvpRole === 'guest') {
              pbNet?.send({
                type: 'SHOT',
                shotType: chosen,
                explicitAimX: 0,
                explicitAimZ: chosen === 'dink' ? 1.85 : 4.8
              });
              sounds.pickleballPaddleHit(chosen === 'smash');
            } else {
              const res = pbEngine.triggerPlayerShot(chosen);
              if (res.success) {
                sounds.pickleballPaddleHit(chosen === 'smash');
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                  try { navigator.vibrate(18); } catch (_) {}
                }
              }
            }
          }
        }
      }
    };

    container.addEventListener('pointerup', stopTouch);
    container.addEventListener('pointercancel', stopTouch);
  }

  pbEngine.onPointScored = (result) => {
    sounds.perk();
    showPickleballPointBanner(result);
  };

  pbEngine.onPvPSnapshotReady = (snapshot) => {
    if (pbNet && pbNet.status === 'connected' && pbEngine?.pvpRole === 'host') {
      pbNet.send(snapshot);
    }
  };

  // Auto-join PvP room if "?mode=pickleball&join=1234" is present
  const joinParam = urlParams.get('join');
  if (joinParam) {
    setTimeout(() => {
      const net = initPickleballNet();
      pvpModalProps = {
        view: 'guest_joining',
        roomCode: joinParam,
        playerName: 'Đồng Nghiệp',
        targetScore: 5
      };
      HOST.innerHTML = renderPickleballPvPModal(pvpModalProps);
      net.joinRoom(joinParam, 'Đồng Nghiệp', pbEngine?.settings.selectedPaddleId || 'carbon', '🏓').catch(() => {
        updatePvPModal({
          view: 'menu',
          errorMessage: 'Phòng không tồn tại hoặc chủ phòng đã rời!'
        });
      });
    }, 400);
  }

  pbEngine.onBallHit = (hitter, shot, quality) => {
    pbStage?.onHit(hitter, shot, quality);
    sounds.pickleballPaddleHit(shot === 'smash');
    showPickleballTimingBadge(quality, shot);

    // Dynamic Juice: Screen Shake & Mobile Haptics Vibration
    if (shot === 'smash' || quality === 'perfect' || pbEngine?.isDiving) {
      const cont = document.getElementById('pbContainer');
      if (cont) {
        cont.classList.remove('screenShake');
        void cont.offsetWidth; // trigger reflow
        cont.classList.add('screenShake');
        setTimeout(() => cont.classList.remove('screenShake'), 240);
      }
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([25, 35, 45]);
        } catch (_) {}
      }
    }
  };

  pbEngine.onBallBounce = (x, z, isFault) => {
    pbStage?.onBounce(x, z, isFault);
    sounds.pickleballBounce();
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

    pbEngine.update(delta, pbPlayerDirX, pbPlayerDirZ);
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

    try {
      const search = currentMode === 'shift' ? '' : `?mode=${currentMode}`;
      if (window.location.search !== search) {
        window.history.replaceState(null, '', window.location.pathname + search);
      }
    } catch (_) {}

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
    if (pbEngine.isPvP && pbEngine.pvpRole === 'guest') {
      if (pbEngine.isServing && pbEngine.currentServer === 'player') {
        pbNet?.send({ type: 'SERVE' });
      } else {
        pbNet?.send({
          type: 'SHOT',
          shotType: shot,
          explicitAimX: (Math.random() - 0.5) * 1.5,
          explicitAimZ: shot === 'dink' ? 1.85 : 5.0
        });
      }
      sounds.pickleballPaddleHit(shot === 'smash');
    } else {
      pbEngine.triggerPlayerShot(shot);
    }
    return;
  }

  // Pickleball PvP Score Selection in Modal
  const pvpScoreBtn = target.closest('.pbPvpScoreBtn') as HTMLElement | null;
  if (pvpScoreBtn) {
    sounds.click();
    const t = Number(pvpScoreBtn.dataset.pvpTarget) as 3 | 5 | 11;
    pvpModalProps.targetScore = t;
    HOST.querySelectorAll('.pbPvpScoreBtn').forEach(b => {
      const isCur = Number((b as HTMLElement).dataset.pvpTarget) === t;
      (b as HTMLElement).style.background = isCur ? '#10b981' : '#ffffff';
      (b as HTMLElement).style.color = isCur ? '#ffffff' : '#000';
    });
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
    case 'open_pb_pvp': {
      if (pbEngine) {
        sounds.click();
        const net = initPickleballNet();
        pvpModalProps = {
          view: 'menu',
          playerName: net.localPlayer.name || 'Bạn',
          targetScore: 5
        };
        HOST.innerHTML = renderPickleballPvPModal(pvpModalProps);
      }
      break;
    }
    case 'pvp_create_room': {
      sounds.click();
      const nameInput = document.getElementById('pvpHostNameInput') as HTMLInputElement | null;
      const hostName = nameInput?.value.trim() || 'Bạn';
      const code = PickleballNet.generateRoomCode();
      const shareUrl = `${window.location.origin}${window.location.pathname}?mode=pickleball&join=${code}`;

      updatePvPModal({
        view: 'host_waiting',
        roomCode: code,
        shareUrl,
        playerName: hostName
      });

      const net = initPickleballNet();
      net.createRoom(code, hostName, pbEngine?.settings.selectedPaddleId || 'carbon', '🧑‍💻').catch((err) => {
        updatePvPModal({
          view: 'menu',
          errorMessage: err.message
        });
      });
      break;
    }
    case 'pvp_join_room': {
      sounds.click();
      const nameInput = document.getElementById('pvpGuestNameInput') as HTMLInputElement | null;
      const codeInput = document.getElementById('pvpJoinCodeInput') as HTMLInputElement | null;
      const guestName = nameInput?.value.trim() || 'Đồng Nghiệp';
      const code = codeInput?.value.trim();

      if (!code || code.length < 3) {
        showToast('⚠️ Vui lòng nhập đúng mã phòng!');
        return;
      }

      updatePvPModal({
        view: 'guest_joining',
        roomCode: code,
        playerName: guestName
      });

      const net = initPickleballNet();
      net.joinRoom(code, guestName, pbEngine?.settings.selectedPaddleId || 'carbon', '🏓').catch((err) => {
        updatePvPModal({
          view: 'menu',
          errorMessage: err.message || 'Không thể kết nối tới phòng này'
        });
      });
      break;
    }
    case 'pvp_copy_link': {
      sounds.click();
      if (pvpModalProps.shareUrl) {
        try {
          navigator.clipboard.writeText(pvpModalProps.shareUrl);
          showToast('📋 Đã sao chép link mời vào bộ nhớ tạm!');
        } catch (_) {
          showToast('📋 Link: ' + pvpModalProps.shareUrl);
        }
      }
      break;
    }
    case 'pvp_start_match': {
      sounds.success();
      HOST.innerHTML = '';
      if (pbEngine && pbNet) {
        pbNet.send({ type: 'START' });
        pbEngine.setPvPMode('host', pbNet.remotePlayer, pvpModalProps.targetScore || 5);
        pbStage?.updateOpponentVisuals();
        const uiHostEl = document.getElementById('pbUIHost');
        if (uiHostEl) mountPickleballHUD(uiHostEl, pbEngine);
        showToast('🔥 Trận đấu Solo 1v1 BẮT ĐẦU!');
      }
      break;
    }
    case 'pvp_cancel': {
      sounds.click();
      pbNet?.disconnect();
      updatePvPModal({
        view: 'menu',
        errorMessage: undefined
      });
      break;
    }
    case 'open_pb_tournament': {
      if (pbEngine) {
        sounds.click();
        HOST.innerHTML = renderPickleballTournamentModal(pbEngine);
      }
      break;
    }
    case 'pb_start_tourney_match': {
      if (pbEngine) {
        sounds.success();
        HOST.innerHTML = '';
        if (!pbEngine.tournament.active) {
          pbEngine.startTournament(0);
        } else {
          pbEngine.startTournament(pbEngine.tournament.currentRound);
        }
        pbStage?.updateOpponentVisuals();
        const uiHostEl = document.getElementById('pbUIHost');
        if (uiHostEl) mountPickleballHUD(uiHostEl, pbEngine);
        const cur = pbEngine.tournament.rounds[pbEngine.tournament.currentRound];
        showToast(`🏆 Khởi tranh ${cur.stageName}: Đấu với ${pbEngine.opponent.name}!`);
      }
      break;
    }
    case 'pb_tourney_next_round': {
      if (pbEngine) {
        sounds.perk();
        HOST.innerHTML = '';
        const wonGrandFinal = pbEngine.advanceTournament();
        if (wonGrandFinal) {
          showToast('👑 Chúc mừng BẠN đã VÔ ĐỊCH CÚP DOANH NGHIỆP 2026! Đã mở khóa Vợt Mạ Vàng Sếp Hùng!');
        } else {
          const cur = pbEngine.tournament.rounds[pbEngine.tournament.currentRound];
          showToast(`⚔️ Bước vào ${cur.stageName}: Gặp đối thủ ${pbEngine.opponent.name}!`);
        }
        pbStage?.updateOpponentVisuals();
        const uiHostEl = document.getElementById('pbUIHost');
        if (uiHostEl) mountPickleballHUD(uiHostEl, pbEngine);
      }
      break;
    }
    case 'pb_tourney_retry': {
      if (pbEngine) {
        sounds.click();
        HOST.innerHTML = '';
        pbEngine.retryTournamentRound();
        const cur = pbEngine.tournament.rounds[pbEngine.tournament.currentRound];
        showToast(`🔄 Thử lại ${cur.stageName} cùng ${pbEngine.opponent.name}! Cố lên!`);
        const uiHostEl = document.getElementById('pbUIHost');
        if (uiHostEl) mountPickleballHUD(uiHostEl, pbEngine);
      }
      break;
    }
    case 'open_pb_settings':
      if (pbEngine) {
        sounds.click();
        HOST.innerHTML = renderPickleballSettingsModal(pbEngine);
      }
      break;
    case 'close_dialog':
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
        const isChamp = pbEngine?.tournament?.isChampion;
        s.stress = Math.max(0, s.stress - (isChamp ? 50 : 35));
        s.energy = Math.min(100, s.energy + (isChamp ? 30 : 15));
        s.score += isChamp ? 500 : 150;
        const oppId = pbEngine?.opponent.id;
        if (oppId && s.colleagueFavors[oppId] !== undefined) {
          s.colleagueFavors[oppId] = Math.min(100, s.colleagueFavors[oppId] + (isChamp ? 40 : 20));
        }
        if (isChamp) {
          showToast('👑 VÔ ĐỊCH CÚP PICKLEBALL: +500 Điểm cống hiến, +30% Năng lượng & -50% Stress!');
        } else {
          showToast('🧘 Tinh thần sảng khoái: -35% Stress 🔥 và +20% Thân thiết đồng nghiệp!');
        }
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
    pbEngine?.stepPlayer(-1, 0.75);
    pbPlayerDirX = -1;
  } else if (target.closest('#pbMoveRightBtn')) {
    pbEngine?.stepPlayer(1, 0.75);
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
      pbEngine.stepPlayer(-1, 0.4);
    } else if (key === 'arrowright' || key === 'd') {
      pbPlayerDirX = 1;
      pbEngine.stepPlayer(1, 0.4);
    } else if (key === 'arrowup' || key === 'w') {
      pbPlayerDirZ = -1;
      pbEngine.stepPlayerZ(-1, 0.45);
    } else if (key === 'arrowdown' || key === 's') {
      pbPlayerDirZ = 1;
      pbEngine.stepPlayerZ(1, 0.45);
    } else if (key === 'j') {
      pbEngine.triggerPlayerShot('smash');
    } else if (key === 'k') {
      pbEngine.triggerPlayerShot('dink');
    } else if (key === 'l') {
      pbEngine.triggerPlayerShot('curve');
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      pbEngine.triggerPlayerShot('smash');
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
    if ((key === 'arrowup' || key === 'w') && pbPlayerDirZ < 0) {
      pbPlayerDirZ = 0;
    } else if ((key === 'arrowdown' || key === 's') && pbPlayerDirZ > 0) {
      pbPlayerDirZ = 0;
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
