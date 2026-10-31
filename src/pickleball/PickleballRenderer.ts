// ============================================================================
// PICKLEBALL RENDERER - In-Match Scoreboard HUD, Shot Buttons & Mobile Controls
// ============================================================================

import { PickleballEngine, PointResult } from './PickleballEngine';

interface PickleballHUDCache {
  host: HTMLElement;
  playerScoreEl: HTMLElement | null;
  aiScoreEl: HTMLElement | null;
  aiNameEl: HTMLElement | null;
  aiEmojiEl: HTMLElement | null;
  serverIndicatorEl: HTMLElement | null;
  rallyCountEl: HTMLElement | null;
  pointBannerEl: HTMLElement | null;
  speechBubbleEl: HTMLElement | null;
  speechSpeakerEl: HTMLElement | null;
  speechTextEl: HTMLElement | null;
  timingBadgeEl: HTMLElement | null;
}

let pbCache: PickleballHUDCache | null = null;
let lastPScore = -1;
let lastAiScore = -1;
let lastRally = -1;
let lastServer = '';
let bannerTimeout: number | null = null;
let speechTimeout: number | null = null;

export function mountPickleballHUD(host: HTMLElement, engine: PickleballEngine): void {
  const opp = engine.opponent;

  host.innerHTML = `
    <!-- Top Match Scoreboard Ribbon -->
    <!-- Top Utility Bar: Tournament Stage Pill + Quick Actions -->
    <div class="pbTopUtilityBar">
      <div class="pbMatchModeBadge" id="pbMatchModeBadge">
        ${engine.tournament.active ? `🏆 ${engine.tournament.rounds[engine.tournament.currentRound].stageName} · ĐẤU ${engine.settings.targetScore} ĐIỂM` : `🎯 ĐẤU ${engine.settings.targetScore} ĐIỂM`}
      </div>
      <div class="pbHeadActions">
        <button class="pbHeadBtn btnTourney" data-act="open_pb_tournament" type="button" title="Giải Đấu Cúp Doanh Nghiệp">🏆 Giải Đấu</button>
        <button class="pbHeadBtn" data-act="open_pb_settings" type="button" title="Cài đặt trận đấu">⚙️</button>
        <button class="pbHeadBtn" data-act="exit_pb" type="button" title="Rời sân về ca trực">🚪</button>
      </div>
    </div>

    <!-- Match Scoreboard Ribbon -->
    <header class="pbScoreboardRibbon">
      <!-- Player Badge (Left) -->
      <div class="pbPlayerScoreCard">
        <span class="pbAvatar" style="background:#2563eb">🧑‍💻</span>
        <div class="pbInfo">
          <div class="pbName">Bạn</div>
          <div class="pbPaddleTag">${engine.paddle.emoji} ${engine.paddle.name.slice(0, 10)}</div>
          <div class="pbStaminaBar" title="Thể lực: 100%">
            <div class="pbStaminaFill" id="pbPlayerStamina" style="width:${engine.playerStamina}%"></div>
          </div>
        </div>
        <div class="pbScoreDigit" id="pbPlayerScore">0</div>
      </div>

      <!-- Center Server / Rally Status -->
      <div class="pbCenterMatchInfo">
        <div class="pbServerBadge" id="pbServerIndicator">
          🎾 Giao: <b id="pbServerText">Bạn</b>
        </div>
        <div class="pbRallyCounter" id="pbRallyCounter" style="display:none">
          🔥 Rally: <span id="pbRallyVal">0</span>
        </div>
      </div>

      <!-- Opponent Badge (Right) -->
      <div class="pbOpponentScoreCard">
        <div class="pbScoreDigit" id="pbAiScore">0</div>
        <div class="pbInfo" style="text-align:right">
          <div class="pbName" id="pbAiName">${opp.name}</div>
          <div class="pbRoleTag">${opp.role}</div>
          <div class="pbStaminaBar" title="Thể lực đối thủ">
            <div class="pbStaminaFill ai" id="pbAiStamina" style="width:${engine.aiStamina}%"></div>
          </div>
        </div>
        <span class="pbAvatar" id="pbAiEmoji" style="background:${opp.avatarBg}">${opp.emoji}</span>
      </div>
    </header>

    <!-- Real-Time Tactical Hint Banner -->
    <div class="pbTacticalHint" id="pbTacticalHint">
      💡 <span id="pbTacticalText">${engine.tacticalHint}</span>
    </div>

    <!-- Floating Point / Fault Banner -->
    <div class="pbCenterBanner" id="pbPointBanner" style="display:none">
      <div class="bannerText" id="pbBannerText">ACE!</div>
      <div class="bannerSubtext" id="pbBannerSubtext">Cú giao bóng hiểm hóc!</div>
    </div>

    <!-- Colleague Speech Dialogue Bubble -->
    <div class="pbDialogueBubble" id="pbSpeechBubble" style="display:none">
      <div class="bubbleTail"></div>
      <div class="bubbleContent">
        <b id="pbSpeechSpeaker">${opp.name}:</b>
        <span id="pbSpeechText">Tập trung nào em ơi!</span>
      </div>
    </div>

    <!-- Timing Quality Hit Popup -->
    <div class="pbTimingBadge" id="pbTimingBadge" style="display:none">
      ⭐ PERFECT!
    </div>

    <!-- Prominent Serve Cue Banner -->
    <div class="pbServeCue" id="pbServeCue" style="display:none">
      🎾 LƯỢT BẠN GIAO BÓNG — Chạm sân hoặc bấm nút để giao!
    </div>

    <!-- Bottom Controls Rail (Desktop & Mobile Optimized) -->
    <footer class="pbBottomControlRail">
      <!-- Mobile Swipe-to-Hit & Tap-to-Run Ergonomics Guide Pill -->
      <div class="pbSwipeGuidePill">
        👆 <b>Vuốt ⬆️</b>: Smash · <b>Vuốt ngắn</b>: Bỏ nhỏ · <b>Vuốt ↗️</b>: Xoáy góc
      </div>

      <!-- Horizontal Paddle Position Slider for Mobile Touch -->
      <div class="pbPositionControlArea">
        <button class="pbMoveBtn pbMoveLeft" id="pbMoveLeftBtn" type="button" title="Di chuyển sang trái">◀</button>
        <div class="pbSliderTrack" id="pbSliderTrack" title="Kéo hoặc chạm để chỉnh vị trí vợt">
          <div class="pbSliderThumb" id="pbSliderThumb">🏓 VỊ TRÍ VỢT</div>
        </div>
        <button class="pbMoveBtn pbMoveRight" id="pbMoveRightBtn" type="button" title="Di chuyển sang phải">▶</button>
      </div>

      <!-- 3 Primary Action Shot Buttons -->
      <div class="pbShotButtonsGroup">
        <!-- Smash / Drive Button -->
        <button class="pbShotBtn btnSmash" data-pb-shot="smash" id="pbBtnSmash" type="button">
          <span class="shotIcon">🚀</span>
          <div class="shotMeta">
            <span class="shotTitle">SMASH</span>
            <span class="shotDesc">Khi bóng bổng · -25% Thể lực</span>
          </div>
          <span class="pbShotStatusBadge" id="pbSmashBadge"></span>
        </button>

        <!-- Dink Drop Button -->
        <button class="pbShotBtn btnDink" data-pb-shot="dink" id="pbBtnDink" type="button">
          <span class="shotIcon">🏓</span>
          <div class="shotMeta">
            <span class="shotTitle">BỎ NHỎ</span>
            <span class="shotDesc">Vào Kitchen · +20% Thể lực</span>
          </div>
          <span class="pbShotStatusBadge" id="pbDinkBadge"></span>
        </button>

        <!-- Curve Spin Button -->
        <button class="pbShotBtn btnCurve" data-pb-shot="curve" id="pbBtnCurve" type="button">
          <span class="shotIcon">🌀</span>
          <div class="shotMeta">
            <span class="shotTitle">XOÁY GÓC</span>
            <span class="shotDesc">Lượn bóng hiểm hóc</span>
          </div>
          <span class="pbShotStatusBadge" id="pbCurveBadge">🎯 SÂN TRỐNG</span>
        </button>
      </div>

      <!-- Helper Keyboard Hint for PC Users -->
      <div class="pbKeyboardHint">
        Phím <b>W / S</b>: Lên lưới / Lùi sân · Phím <b>A / D</b>: Trái / Phải · Phím <b>J</b>: Smash · Phím <b>K</b>: Dink · Phím <b>L</b>: Xoáy góc
      </div>
    </footer>
  `;

  pbCache = {
    host,
    playerScoreEl: host.querySelector('#pbPlayerScore'),
    aiScoreEl: host.querySelector('#pbAiScore'),
    aiNameEl: host.querySelector('#pbAiName'),
    aiEmojiEl: host.querySelector('#pbAiEmoji'),
    serverIndicatorEl: host.querySelector('#pbServerText'),
    rallyCountEl: host.querySelector('#pbRallyCounter'),
    pointBannerEl: host.querySelector('#pbPointBanner'),
    speechBubbleEl: host.querySelector('#pbSpeechBubble'),
    speechSpeakerEl: host.querySelector('#pbSpeechSpeaker'),
    speechTextEl: host.querySelector('#pbSpeechText'),
    timingBadgeEl: host.querySelector('#pbTimingBadge')
  };

  lastPScore = -1;
  lastAiScore = -1;
  lastRally = -1;
  lastServer = '';

  // Setup Mobile Slider Dragging
  setupSliderControls(host, engine);
}

function setupSliderControls(host: HTMLElement, engine: PickleballEngine): void {
  const track = host.querySelector('#pbSliderTrack') as HTMLElement;
  const thumb = host.querySelector('#pbSliderThumb') as HTMLElement;
  if (!track || !thumb) return;

  let isDragging = false;

  const updatePos = (clientX: number) => {
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    thumb.style.left = `${ratio * 100}%`;
    // Map ratio [0, 1] to court X [-2.6, 2.6]
    engine.setPlayerX((ratio - 0.5) * 5.4);
  };

  track.addEventListener('pointerdown', (e) => {
    isDragging = true;
    updatePos(e.clientX);
    track.setPointerCapture(e.pointerId);
  });

  track.addEventListener('pointermove', (e) => {
    if (isDragging) {
      updatePos(e.clientX);
    }
  });

  const onUp = () => { isDragging = false; };
  track.addEventListener('pointerup', onUp);
  track.addEventListener('pointercancel', onUp);
}

export function updatePickleballHUD(host: HTMLElement, engine: PickleballEngine): void {
  if (!pbCache || pbCache.host !== host || !pbCache.playerScoreEl) {
    mountPickleballHUD(host, engine);
  }
  if (!pbCache) return;

  // 1. Update Scores
  if (engine.playerScore !== lastPScore) {
    lastPScore = engine.playerScore;
    if (pbCache.playerScoreEl) pbCache.playerScoreEl.textContent = String(lastPScore);
  }

  if (engine.aiScore !== lastAiScore) {
    lastAiScore = engine.aiScore;
    if (pbCache.aiScoreEl) pbCache.aiScoreEl.textContent = String(lastAiScore);
  }

  // 2. Server indicator
  const srv = engine.currentServer === 'player' ? 'Bạn' : engine.opponent.name;
  if (srv !== lastServer) {
    lastServer = srv;
    if (pbCache.serverIndicatorEl) pbCache.serverIndicatorEl.textContent = srv;
  }

  // Opponent name & avatar sync
  if (pbCache.aiNameEl && pbCache.aiNameEl.textContent !== engine.opponent.name) {
    pbCache.aiNameEl.textContent = engine.opponent.name;
    if (pbCache.aiEmojiEl) {
      pbCache.aiEmojiEl.textContent = engine.opponent.emoji;
      pbCache.aiEmojiEl.style.background = engine.opponent.avatarBg;
    }
  }

  // 3. Rally counter
  if (engine.rallyCount !== lastRally) {
    lastRally = engine.rallyCount;
    if (pbCache.rallyCountEl) {
      if (lastRally >= 2) {
        pbCache.rallyCountEl.style.display = 'block';
        const valEl = pbCache.rallyCountEl.querySelector('#pbRallyVal');
        if (valEl) valEl.textContent = String(lastRally);
      } else {
        pbCache.rallyCountEl.style.display = 'none';
      }
    }
  }

  // 3b. Update Match Mode / Tournament Badge
  const modeBadge = host.querySelector('#pbMatchModeBadge');
  if (modeBadge) {
    const tourneyText = engine.tournament.active
      ? `🏆 ${engine.tournament.rounds[engine.tournament.currentRound].stageName} · ĐẤU ${engine.settings.targetScore} ĐIỂM`
      : `🎯 ĐẤU ${engine.settings.targetScore} ĐIỂM`;
    if (modeBadge.textContent !== tourneyText) {
      modeBadge.textContent = tourneyText;
    }
  }

  // 4. Update Slider thumb position to match live playerPos.x
  const thumbEl = host.querySelector('#pbSliderThumb') as HTMLElement | null;
  if (thumbEl) {
    const ratio = Math.max(0, Math.min(1, (engine.playerPos.x / 5.4) + 0.5));
    thumbEl.style.left = `${ratio * 100}%`;
  }

  // 5. Update Smash button state when serving vs during rally
  const smashBtn = host.querySelector('[data-pb-shot="smash"]') as HTMLElement | null;
  const serveCueEl = host.querySelector('#pbServeCue') as HTMLElement | null;

  if (engine.isServing && engine.currentServer === 'player') {
    if (serveCueEl) serveCueEl.style.display = 'block';
    if (smashBtn && !smashBtn.classList.contains('isServeState')) {
      smashBtn.classList.add('isServeState');
      smashBtn.innerHTML = `
        <span class="shotIcon" style="animation:spinPulse 1.2s infinite">🎾</span>
        <div class="shotMeta">
          <span class="shotTitle">GIAO BÓNG</span>
          <span class="shotDesc">Chạm sân hoặc bấm</span>
        </div>
      `;
    }
  } else {
    if (serveCueEl) serveCueEl.style.display = 'none';
    if (smashBtn && smashBtn.classList.contains('isServeState')) {
      smashBtn.classList.remove('isServeState');
      smashBtn.innerHTML = `
        <span class="shotIcon">🚀</span>
        <div class="shotMeta">
          <span class="shotTitle">SMASH</span>
          <span class="shotDesc">Khi bóng bổng · -25% Thể lực</span>
        </div>
        <span class="pbShotStatusBadge" id="pbSmashBadge"></span>
      `;
    }
  }

  // 6. Update Stamina Bars
  const playerStaminaEl = host.querySelector('#pbPlayerStamina') as HTMLElement | null;
  if (playerStaminaEl) {
    playerStaminaEl.style.width = `${Math.max(0, Math.min(100, engine.playerStamina))}%`;
    if (engine.playerStamina < 30) {
      playerStaminaEl.classList.add('low');
    } else {
      playerStaminaEl.classList.remove('low');
    }
  }

  const aiStaminaEl = host.querySelector('#pbAiStamina') as HTMLElement | null;
  if (aiStaminaEl) {
    aiStaminaEl.style.width = `${Math.max(0, Math.min(100, engine.aiStamina))}%`;
    if (engine.aiStamina < 30) {
      aiStaminaEl.classList.add('low');
    } else {
      aiStaminaEl.classList.remove('low');
    }
  }

  // 7. Update Tactical Hint Text
  const tacticalTextEl = host.querySelector('#pbTacticalText') as HTMLElement | null;
  if (tacticalTextEl && tacticalTextEl.textContent !== engine.tacticalHint) {
    tacticalTextEl.textContent = engine.tacticalHint;
  }

  // 8. Dynamic Tactical Button Badges & Highlights
  const btnSmash = host.querySelector('#pbBtnSmash') as HTMLElement | null;
  const smashBadge = host.querySelector('#pbSmashBadge') as HTMLElement | null;
  if (btnSmash && !engine.isServing) {
    if (engine.shotOpportunity.smashReady) {
      btnSmash.classList.add('readyToSmash');
      btnSmash.classList.remove('lowBallRisk');
      if (smashBadge) {
        smashBadge.className = 'pbShotStatusBadge visible badgeReady';
        smashBadge.textContent = '🔥 CƠ HỘI!';
      }
    } else if (engine.shotOpportunity.lowBallRisk) {
      btnSmash.classList.add('lowBallRisk');
      btnSmash.classList.remove('readyToSmash');
      if (smashBadge) {
        smashBadge.className = 'pbShotStatusBadge visible badgeWarn';
        smashBadge.textContent = '⚠️ BÓNG THẤP';
      }
    } else {
      btnSmash.classList.remove('readyToSmash', 'lowBallRisk');
      if (smashBadge) smashBadge.className = 'pbShotStatusBadge';
    }
  }

  const btnDink = host.querySelector('#pbBtnDink') as HTMLElement | null;
  const dinkBadge = host.querySelector('#pbDinkBadge') as HTMLElement | null;
  if (btnDink && !engine.isServing) {
    if (engine.shotOpportunity.dinkFavorable) {
      btnDink.classList.add('dinkFavorable');
      if (dinkBadge) {
        dinkBadge.className = 'pbShotStatusBadge visible badgeReady';
        dinkBadge.textContent = '🎯 BỎ NHỎ ĂN!';
      }
    } else {
      btnDink.classList.remove('dinkFavorable');
      if (dinkBadge) dinkBadge.className = 'pbShotStatusBadge';
    }
  }
}

export function showPickleballPointBanner(result: PointResult): void {
  if (!pbCache || !pbCache.pointBannerEl) return;

  const el = pbCache.pointBannerEl;
  const titleEl = el.querySelector('#pbBannerText');
  const subEl = el.querySelector('#pbBannerSubtext');

  if (bannerTimeout) clearTimeout(bannerTimeout);

  let title = 'GHI ĐIỂM!';
  let color = '#22c55e';

  switch (result.reason) {
    case 'ace':
      title = '⭐ CÚ GIAO BÓNG ACE!';
      color = '#f59e0b';
      break;
    case 'out':
      title = result.winner === 'player' ? '🎉 BÓNG NGOÀI SÂN (OUT)!' : '❌ BẠN ĐÁNH RA NGOÀI!';
      color = result.winner === 'player' ? '#22c55e' : '#ef4444';
      break;
    case 'net':
      title = result.winner === 'player' ? '🎉 ĐỐI THỦ RÚC LƯỚI!' : '🕸️ BÓNG RÚC LƯỚI!';
      color = result.winner === 'player' ? '#22c55e' : '#ef4444';
      break;
    case 'kitchen_violation':
      title = '⚠️ PHẠM QUY KITCHEN!';
      color = '#ef4444';
      break;
    case 'double_bounce':
      title = result.winner === 'player' ? '⭐ GHI ĐIỂM ĐẸP MẮT!' : '⚠️ BÓNG NẢY 2 LẦN!';
      color = result.winner === 'player' ? '#22c55e' : '#ef4444';
      break;
  }

  if (titleEl) titleEl.textContent = title;
  if (subEl) subEl.textContent = result.message;

  el.style.borderColor = color;
  el.style.display = 'flex';
  el.classList.remove('bannerAnimate');
  void el.offsetWidth; // force reflow
  el.classList.add('bannerAnimate');

  bannerTimeout = window.setTimeout(() => {
    el.style.display = 'none';
  }, 1300);

  // If opponent spoke, show comic dialogue bubble
  if (result.speech) {
    showPickleballDialogue(result.speech.speaker, result.speech.text);
  }
}

export function showPickleballDialogue(speaker: string, text: string): void {
  if (!pbCache || !pbCache.speechBubbleEl) return;

  const el = pbCache.speechBubbleEl;
  if (pbCache.speechSpeakerEl) pbCache.speechSpeakerEl.textContent = `${speaker}:`;
  if (pbCache.speechTextEl) pbCache.speechTextEl.textContent = text;

  if (speechTimeout) clearTimeout(speechTimeout);

  el.style.display = 'block';
  el.classList.remove('speechPop');
  void el.offsetWidth;
  el.classList.add('speechPop');

  speechTimeout = window.setTimeout(() => {
    el.style.display = 'none';
  }, 2400);
}

export function showPickleballTimingBadge(quality: 'perfect' | 'good' | 'late' | 'early'): void {
  if (!pbCache || !pbCache.timingBadgeEl) return;

  const el = pbCache.timingBadgeEl;
  let text = '✨ GOOD';
  let color = '#22c55e';

  if (quality === 'perfect') {
    text = '⭐ PERFECT!';
    color = '#facc15';
  } else if (quality === 'late') {
    text = '💨 LATE';
    color = '#f97316';
  } else if (quality === 'early') {
    text = '⏳ EARLY';
    color = '#38bdf8';
  }

  el.textContent = text;
  el.style.color = color;
  el.style.display = 'block';
  el.classList.remove('timingPop');
  void el.offsetWidth;
  el.classList.add('timingPop');

  setTimeout(() => {
    el.style.display = 'none';
  }, 600);
}
