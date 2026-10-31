// ============================================================================
// PICKLEBALL ENGINE - Real-Time 3D Physics & Match State Machine
// ============================================================================

export type ShotType = 'drive' | 'dink' | 'smash' | 'curve';
export type ShotQuality = 'perfect' | 'good' | 'late' | 'early';
export type ColleagueId = 'linh' | 'hoang' | 'nga' | 'tuan' | 'boss';

export interface ColleagueProfile {
  id: ColleagueId;
  name: string;
  role: string;
  emoji: string;
  avatarBg: string;
  difficultyLabel: string;
  difficultyStars: number;
  speed: number;
  power: number;
  accuracy: number;
  dinkTendency: number;
  smashTendency: number;
  spinTendency: number;
  errorRate: number;
  taunts: string[];
  praises: string[];
}

export const PICKLEBALL_COLLEAGUES: Record<ColleagueId, ColleagueProfile> = {
  linh: {
    id: 'linh',
    name: 'Em Linh',
    role: 'Thực Tập Sinh',
    emoji: '👧',
    avatarBg: '#06b6d4',
    difficultyLabel: 'Dễ (Tân thủ)',
    difficultyStars: 1,
    speed: 3.8,
    power: 0.75,
    accuracy: 0.78,
    dinkTendency: 0.15,
    smashTendency: 0.10,
    spinTendency: 0.05,
    errorRate: 0.22,
    taunts: ['Em mới tập thôi, anh/chị nương tay xíu nha!', 'U là trời banh bay nhanh quá!', 'Huhu em suýt chạm được rồi!'],
    praises: ['Anh/chị đánh hay quá trời luôn!', 'Đỉnh nóc kịch trần luôn sốp ơi!']
  },
  hoang: {
    id: 'hoang',
    name: 'Anh Hoàng',
    role: 'IT Support',
    emoji: '🖥️',
    avatarBg: '#4f46e5',
    difficultyLabel: 'Vừa (Bóng xoáy)',
    difficultyStars: 2,
    speed: 4.5,
    power: 0.90,
    accuracy: 0.88,
    dinkTendency: 0.25,
    smashTendency: 0.20,
    spinTendency: 0.55,
    errorRate: 0.12,
    taunts: ['Banh này có thuật toán xoáy 60fps đó em!', 'Đã ping cao lại còn gặp banh gắt!', 'Đang debug đường banh...'],
    praises: ['Phản xạ chuẩn 1ms luôn!', 'Quả vừa rồi xịn như code production!']
  },
  nga: {
    id: 'nga',
    name: 'Chị Nga',
    role: 'Kế Toán Kho',
    emoji: '📊',
    avatarBg: '#ef4444',
    difficultyLabel: 'Vừa (Dink Master)',
    difficultyStars: 2,
    speed: 4.2,
    power: 0.82,
    accuracy: 0.94,
    dinkTendency: 0.65,
    smashTendency: 0.15,
    spinTendency: 0.20,
    errorRate: 0.07,
    taunts: ['Bỏ nhỏ một quả vào Kitchen coi em đỡ được không!', 'Cân đối sổ sách còn khó hơn quả này!', 'Thủ kín kẽ không hở 1 xu!'],
    praises: ['Gớm, tay nghề dạo này lên dữ ha!', 'Được của nó đấy, chiều chị khao trà sữa!']
  },
  tuan: {
    id: 'tuan',
    name: 'Anh Tuấn',
    role: 'Tài Xế Cont Cát Lái',
    emoji: '🚚',
    avatarBg: '#10b981',
    difficultyLabel: 'Khó (Power Smasher)',
    difficultyStars: 3,
    speed: 5.1,
    power: 1.25,
    accuracy: 0.82,
    dinkTendency: 0.10,
    smashTendency: 0.60,
    spinTendency: 0.15,
    errorRate: 0.15,
    taunts: ['Cont 40HQ anh còn lùi ngọt, quả banh này xi-nhê gì!', 'Né ra kẻo banh bay rách áo!', 'Lực tay vác cont nó phải thế!'],
    praises: ['Khá lắm em trai! Cứng tay đấy!', 'Pha đập vừa rồi chuẩn tải trọng luôn!']
  },
  boss: {
    id: 'boss',
    name: 'Sếp Hùng',
    role: 'Tổng Giám Đốc',
    emoji: '👔',
    avatarBg: '#f59e0b',
    difficultyLabel: 'Cực Khó (Chiến Thần)',
    difficultyStars: 4,
    speed: 5.6,
    power: 1.15,
    accuracy: 0.96,
    dinkTendency: 0.40,
    smashTendency: 0.45,
    spinTendency: 0.35,
    errorRate: 0.03,
    taunts: ['Chơi Pickleball cũng như chạy KPI: Không có chỗ cho chần chừ!', 'Tập trung vào đường banh nào!', 'Pha này anh bắt bài từ trước rồi!'],
    praises: ['Tốt! Tinh thần chiến binh công sở đáng khen!', 'Thắng được anh séc này anh duyệt tăng thưởng KPI!']
  }
};

export interface PaddleGear {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  powerBonus: number;
  controlBonus: number;
  unlocked: boolean;
}

export const PICKLEBALL_PADDLES: PaddleGear[] = [
  {
    id: 'carton',
    name: 'Vợt Bìa Carton Tái Chế',
    emoji: '📦',
    desc: 'Tự cắt từ thùng carton kho dệt may. Độ nảy bình dân nhưng tình cảm.',
    powerBonus: 1.0,
    controlBonus: 1.0,
    unlocked: true
  },
  {
    id: 'wood_sewing',
    name: 'Vợt Gỗ Xưởng Cắt Rập',
    emoji: '🪵',
    desc: 'Gỗ sồi melamine ép dày dặn. Tăng 12% lực đánh đập bóng.',
    powerBonus: 1.12,
    controlBonus: 0.95,
    unlocked: true
  },
  {
    id: 'carbon_genz',
    name: 'Vợt Carbon T700 GenZ',
    emoji: '⚡',
    desc: 'Mặt carbon nhám T700 chuẩn thi đấu. Tăng 20% khả năng kiểm soát và xoáy bóng.',
    powerBonus: 1.08,
    controlBonus: 1.20,
    unlocked: true
  },
  {
    id: 'gold_boss',
    name: 'Vợt Mạ Vàng Sếp Hùng',
    emoji: '👑',
    desc: 'Hàng quà tặng đối tác New York mạ vàng 18K. Tăng 25% uy lực và vệt sáng vàng kim.',
    powerBonus: 1.25,
    controlBonus: 1.15,
    unlocked: true
  }
];

export interface PickleballSettings {
  opponentId: ColleagueId;
  targetScore: 5 | 7 | 11;
  ballSpeedFactor: number; // 1.0 (standard) or 1.25 (fast)
  autoPositionAssist: boolean;
  selectedPaddleId: string;
  betAmount: number; // 0, 35000, 50000 (VND or fun currency)
}

export interface MatchStats {
  aces: number;
  smashes: number;
  dinks: number;
  longestRally: number;
  perfectHits: number;
}

export interface PointResult {
  winner: 'player' | 'ai';
  reason: 'out' | 'net' | 'double_bounce' | 'ace' | 'kitchen_violation';
  message: string;
  speech?: { speaker: string; text: string };
}

export class PickleballEngine {
  // Court Dimensions
  public readonly courtWidth = 6.0;      // X: [-3.0, 3.0]
  public readonly courtLength = 13.0;    // Z: [-6.5, 6.5]
  public readonly kitchenSize = 2.1;     // NVZ: Z between [-2.1, 2.1]
  public readonly netHeight = 0.88;      // Height at net (Z = 0)
  public readonly netWidth = 6.4;

  // Settings
  public settings: PickleballSettings;
  public opponent: ColleagueProfile;
  public paddle: PaddleGear;

  // Match State
  public playerScore = 0;
  public aiScore = 0;
  public currentServer: 'player' | 'ai' = 'player';
  public serverQuadrant: 'right' | 'left' = 'right'; // Serve alternates right/left box
  public isMatchOver = false;
  public matchWinner: 'player' | 'ai' | null = null;
  public isServing = true;
  public serveTimer = 1.0;
  public rallyCount = 0;

  // Positions
  public playerPos = { x: 1.2, z: 5.8 };
  public aiPos = { x: -1.2, z: -5.8 };
  public playerPaddleAnim = 0; // 0: idle, >0: swinging
  public aiPaddleAnim = 0;

  // Ball 3D Physical State
  public ball = {
    x: 1.2,
    y: 0.9,
    z: 5.4,
    vx: 0,
    vy: 0,
    vz: 0,
    spinX: 0,
    spinY: 0,
    spinZ: 0,
    radius: 0.11,
    inPlay: false,
    bouncesSinceHit: 0,
    lastHitter: 'none' as 'none' | 'player' | 'ai',
    serveTargetSide: 'ai' as 'ai' | 'player',
    hasClearedNet: false,
    twoBounceCheck: {
      serverSideBounced: false,
      receiverSideBounced: false
    }
  };

  // Turn stats
  public stats: MatchStats = {
    aces: 0,
    smashes: 0,
    dinks: 0,
    longestRally: 0,
    perfectHits: 0
  };

  // Events & Callbacks
  public onPointScored?: (result: PointResult) => void;
  public onMatchFinished?: (winner: 'player' | 'ai', stats: MatchStats) => void;
  public onBallHit?: (hitter: 'player' | 'ai', shot: ShotType, quality: ShotQuality) => void;
  public onBallBounce?: (x: number, z: number, isFault: boolean) => void;
  public onSpeechTaunt?: (speaker: string, text: string) => void;

  constructor(settings?: Partial<PickleballSettings>) {
    this.settings = {
      opponentId: settings?.opponentId || 'nga',
      targetScore: settings?.targetScore || 5,
      ballSpeedFactor: settings?.ballSpeedFactor || 1.0,
      autoPositionAssist: settings?.autoPositionAssist ?? true,
      selectedPaddleId: settings?.selectedPaddleId || 'carbon_genz',
      betAmount: settings?.betAmount || 0
    };

    this.opponent = PICKLEBALL_COLLEAGUES[this.settings.opponentId] || PICKLEBALL_COLLEAGUES.nga;
    this.paddle = PICKLEBALL_PADDLES.find(p => p.id === this.settings.selectedPaddleId) || PICKLEBALL_PADDLES[0];
    this.resetMatch();
  }

  public setOpponent(colleagueId: ColleagueId): void {
    this.settings.opponentId = colleagueId;
    this.opponent = PICKLEBALL_COLLEAGUES[colleagueId] || PICKLEBALL_COLLEAGUES.nga;
    this.resetMatch();
  }

  public setPaddle(paddleId: string): void {
    this.settings.selectedPaddleId = paddleId;
    this.paddle = PICKLEBALL_PADDLES.find(p => p.id === paddleId) || PICKLEBALL_PADDLES[0];
  }

  public updateSettings(newSettings: Partial<PickleballSettings>): void {
    Object.assign(this.settings, newSettings);
    if (newSettings.opponentId) {
      this.opponent = PICKLEBALL_COLLEAGUES[newSettings.opponentId] || PICKLEBALL_COLLEAGUES.nga;
    }
    if (newSettings.selectedPaddleId) {
      this.paddle = PICKLEBALL_PADDLES.find(p => p.id === newSettings.selectedPaddleId) || PICKLEBALL_PADDLES[0];
    }
    this.resetMatch();
  }

  public setPlayerX(targetX: number): void {
    this.playerPos.x = Math.max(-2.7, Math.min(2.7, targetX));
  }

  public resetMatch(): void {
    this.playerScore = 0;
    this.aiScore = 0;
    this.isMatchOver = false;
    this.matchWinner = null;
    this.currentServer = 'player';
    this.serverQuadrant = 'right';
    this.rallyCount = 0;
    this.stats = {
      aces: 0,
      smashes: 0,
      dinks: 0,
      longestRally: 0,
      perfectHits: 0
    };
    this.setupServe(this.currentServer);
  }

  public setupServe(server: 'player' | 'ai'): void {
    this.currentServer = server;
    this.isServing = true;
    this.serveTimer = 1.0;
    this.rallyCount = 0;

    // Alternate quadrant based on server score (Pickleball standard: even score = right, odd score = left)
    const serverScore = server === 'player' ? this.playerScore : this.aiScore;
    this.serverQuadrant = serverScore % 2 === 0 ? 'right' : 'left';
    const serveX = this.serverQuadrant === 'right' ? 1.4 : -1.4;

    if (server === 'player') {
      this.playerPos.x = serveX;
      this.playerPos.z = 5.8;
      this.aiPos.x = -serveX; // AI waits diagonally opposite
      this.aiPos.z = -5.8;

      this.ball.x = this.playerPos.x + 0.3;
      this.ball.y = 0.85;
      this.ball.z = this.playerPos.z - 0.4;
      this.ball.vx = 0;
      this.ball.vy = 0;
      this.ball.vz = 0;
      this.ball.inPlay = false;
      this.ball.lastHitter = 'none';
      this.ball.serveTargetSide = 'ai';
      this.ball.bouncesSinceHit = 0;
    } else {
      this.aiPos.x = serveX;
      this.aiPos.z = -5.8;
      this.playerPos.x = -serveX;
      this.playerPos.z = 5.8;

      this.ball.x = this.aiPos.x - 0.3;
      this.ball.y = 0.85;
      this.ball.z = this.aiPos.z + 0.4;
      this.ball.vx = 0;
      this.ball.vy = 0;
      this.ball.vz = 0;
      this.ball.inPlay = false;
      this.ball.lastHitter = 'none';
      this.ball.serveTargetSide = 'player';
      this.ball.bouncesSinceHit = 0;
    }

    this.ball.twoBounceCheck = {
      serverSideBounced: false,
      receiverSideBounced: false
    };
  }

  public executeServe(): boolean {
    if (!this.isServing || this.isMatchOver) return false;

    this.isServing = false;
    this.ball.inPlay = true;
    this.ball.bouncesSinceHit = 0;
    this.ball.hasClearedNet = false;

    if (this.currentServer === 'player') {
      this.ball.lastHitter = 'player';
      this.ball.serveTargetSide = 'ai';

      // Crosscourt serve trajectory into diagonal receiving box (past Kitchen: z < -2.1)
      const targetX = this.serverQuadrant === 'right' ? -1.4 : 1.4;
      const targetZ = -4.5;
      const timeToTarget = 0.85 / this.settings.ballSpeedFactor;

      this.ball.vx = (targetX - this.ball.x) / timeToTarget;
      this.ball.vz = (targetZ - this.ball.z) / timeToTarget;
      this.ball.vy = 3.6; // Upward arc to clear net comfortably
      this.playerPaddleAnim = 0.25;

      this.onBallHit?.('player', 'drive', 'good');
    } else {
      this.ball.lastHitter = 'ai';
      this.ball.serveTargetSide = 'player';

      const targetX = this.serverQuadrant === 'right' ? -1.4 : 1.4;
      const targetZ = 4.5;
      const timeToTarget = 0.90 / this.settings.ballSpeedFactor;

      this.ball.vx = (targetX - this.ball.x) / timeToTarget;
      this.ball.vz = (targetZ - this.ball.z) / timeToTarget;
      this.ball.vy = 3.5;
      this.aiPaddleAnim = 0.25;

      this.onBallHit?.('ai', 'drive', 'good');
    }

    return true;
  }

  public playerHitBall(shotType: ShotType, aimOffset = 0): { success: boolean; quality: ShotQuality } {
    if (!this.ball.inPlay || this.ball.lastHitter === 'player' || this.isMatchOver) {
      return { success: false, quality: 'late' };
    }

    // Distance to ball check (Player hitbox reach ~1.6m)
    const dx = this.ball.x - this.playerPos.x;
    const dz = this.ball.z - (this.playerPos.z - 0.45);
    const dist = Math.hypot(dx, dz);

    if (dist > 1.8 || this.ball.z < 1.0) {
      // Ball too far or already past player
      return { success: false, quality: 'early' };
    }

    // Non-Volley Zone (The Kitchen) rule check:
    // If player is inside Kitchen (z <= 2.1) and ball hasn't bounced on player side yet -> FAULT!
    if (this.playerPos.z <= this.kitchenSize + 0.1 && this.ball.bouncesSinceHit === 0) {
      this.awardPoint('ai', 'kitchen_violation', '⚠️ Bạn phạm luật Kitchen (Đập bóng sống trong vùng cấm)!');
      return { success: false, quality: 'late' };
    }

    // Two-bounce rule on serve reception check
    if (this.rallyCount === 0 && this.ball.bouncesSinceHit === 0) {
      this.awardPoint('ai', 'kitchen_violation', '⚠️ Phạm luật 2 nảy (Bóng giao phải nảy 1 lần trước khi đỡ)!');
      return { success: false, quality: 'late' };
    }

    // Timing quality evaluation
    let quality: ShotQuality = 'good';
    if (dist < 0.65 && this.ball.y > 0.4 && this.ball.y < 1.4) {
      quality = 'perfect';
      this.stats.perfectHits++;
    } else if (dist > 1.35 || this.ball.y < 0.25) {
      quality = 'late';
    }

    this.rallyCount++;
    this.stats.longestRally = Math.max(this.stats.longestRally, this.rallyCount);
    this.playerPaddleAnim = 0.28;

    // Shot physics calculation based on selected shot type & paddle stats
    const powerMult = this.paddle.powerBonus * this.settings.ballSpeedFactor * (quality === 'perfect' ? 1.15 : 1.0);
    this.ball.lastHitter = 'player';
    this.ball.bouncesSinceHit = 0;
    this.ball.hasClearedNet = false;

    // Target position calculation on AI side
    let targetX = (Math.random() - 0.5) * 4.2 + aimOffset * 1.5;
    targetX = Math.max(-2.5, Math.min(2.5, targetX));
    let targetZ = -4.8;
    let targetVy = 3.8;
    let flightTime = 0.85 / powerMult;

    if (shotType === 'dink') {
      // Soft drop into AI kitchen (between -0.6 and -1.8)
      targetZ = -1.3 - Math.random() * 0.6;
      targetVy = 2.9;
      flightTime = 0.88;
      this.stats.dinks++;
    } else if (shotType === 'smash') {
      // High-speed downward smash if ball is high enough
      targetZ = -5.5;
      targetVy = 1.6;
      flightTime = 0.52 / powerMult;
      this.stats.smashes++;
    } else if (shotType === 'curve') {
      // Curve spin to corner
      targetX = aimOffset > 0 ? 2.3 : -2.3;
      targetZ = -4.6;
      targetVy = 3.4;
      this.ball.spinX = aimOffset > 0 ? 3.5 : -3.5;
      flightTime = 0.78 / powerMult;
    }

    this.ball.vx = (targetX - this.ball.x) / flightTime;
    this.ball.vz = (targetZ - this.ball.z) / flightTime;
    this.ball.vy = targetVy;

    this.onBallHit?.('player', shotType, quality);
    return { success: true, quality };
  }

  private aiDecideShot(): void {
    if (!this.ball.inPlay || this.ball.lastHitter === 'ai') return;

    // AI reach distance check
    const dx = this.ball.x - this.aiPos.x;
    const dz = this.ball.z - (this.aiPos.z + 0.45);
    const dist = Math.hypot(dx, dz);

    if (dist > 1.65 || this.ball.z > -1.0) return;

    // AI Mistake calculation
    const isMistake = Math.random() < this.opponent.errorRate;
    if (isMistake) {
      if (Math.random() < 0.5) {
        // AI hits into net
        this.ball.vx = (0 - this.ball.x) / 0.7;
        this.ball.vz = (1.5 - this.ball.z) / 0.7;
        this.ball.vy = 1.4; // Too low -> hits net!
      } else {
        // AI hits out of bounds
        this.ball.vx = (Math.random() > 0.5 ? 3.6 : -3.6);
        this.ball.vz = 8.0;
        this.ball.vy = 4.2;
      }
      this.ball.lastHitter = 'ai';
      this.ball.bouncesSinceHit = 0;
      this.aiPaddleAnim = 0.25;
      this.onBallHit?.('ai', 'drive', 'late');
      return;
    }

    // AI Strategy Selection
    let chosenShot: ShotType = 'drive';
    const rand = Math.random();

    if (this.ball.y > 1.2 && rand < this.opponent.smashTendency) {
      chosenShot = 'smash';
    } else if (rand < this.opponent.dinkTendency && Math.abs(this.aiPos.z) < 3.0) {
      chosenShot = 'dink';
    } else if (rand < this.opponent.dinkTendency + this.opponent.spinTendency) {
      chosenShot = 'curve';
    }

    this.rallyCount++;
    this.stats.longestRally = Math.max(this.stats.longestRally, this.rallyCount);
    this.aiPaddleAnim = 0.28;

    this.ball.lastHitter = 'ai';
    this.ball.bouncesSinceHit = 0;
    this.ball.hasClearedNet = false;

    // AI targets player's open court
    const openX = this.playerPos.x > 0 ? -1.8 : 1.8;
    let targetX = openX + (Math.random() - 0.5) * (1.2 - this.opponent.accuracy * 0.6);
    targetX = Math.max(-2.5, Math.min(2.5, targetX));
    let targetZ = 4.8;
    let targetVy = 3.6;
    let flightTime = 0.90 / (this.opponent.power * this.settings.ballSpeedFactor);

    if (chosenShot === 'dink') {
      targetZ = 1.3 + Math.random() * 0.6;
      targetVy = 2.8;
      flightTime = 0.92;
    } else if (chosenShot === 'smash') {
      targetZ = 5.6;
      targetVy = 1.8;
      flightTime = 0.55 / (this.opponent.power * this.settings.ballSpeedFactor);
    } else if (chosenShot === 'curve') {
      targetX = (Math.random() > 0.5 ? 2.4 : -2.4);
      targetVy = 3.5;
      this.ball.spinX = targetX > 0 ? -3.0 : 3.0;
    }

    this.ball.vx = (targetX - this.ball.x) / flightTime;
    this.ball.vz = (targetZ - this.ball.z) / flightTime;
    this.ball.vy = targetVy;

    this.onBallHit?.('ai', chosenShot, 'good');

    // Occasional AI banter during rally
    if (this.rallyCount === 4 && Math.random() < 0.4) {
      const taunt = this.opponent.taunts[Math.floor(Math.random() * this.opponent.taunts.length)];
      this.onSpeechTaunt?.(this.opponent.name, taunt);
    }
  }

  public update(delta: number, playerInputX = 0): void {
    if (this.isMatchOver) return;

    // Update Paddle Swing Animation Timers
    if (this.playerPaddleAnim > 0) this.playerPaddleAnim = Math.max(0, this.playerPaddleAnim - delta);
    if (this.aiPaddleAnim > 0) this.aiPaddleAnim = Math.max(0, this.aiPaddleAnim - delta);

    // 1. Serving countdown
    if (this.isServing) {
      this.serveTimer -= delta;
      if (this.serveTimer <= 0) {
        this.executeServe();
      }
      return;
    }

    // 2. Player Movement (Manual or Assisted)
    const playerSpeed = 5.8;
    if (Math.abs(playerInputX) > 0.05) {
      this.playerPos.x += playerInputX * playerSpeed * delta;
    } else if (this.settings.autoPositionAssist && this.ball.inPlay && this.ball.vz > 0) {
      // Gently glide towards predicted ball X position
      const diffX = this.ball.x - this.playerPos.x;
      this.playerPos.x += Math.sign(diffX) * Math.min(Math.abs(diffX), playerSpeed * 0.75 * delta);
    }
    this.playerPos.x = Math.max(-2.7, Math.min(2.7, this.playerPos.x));

    // 3. AI Movement (Tracks Ball with Reaction Latency)
    if (this.ball.inPlay) {
      const aiTargetX = this.ball.vz < 0 ? this.ball.x : 0;
      const dx = aiTargetX - this.aiPos.x;
      this.aiPos.x += Math.sign(dx) * Math.min(Math.abs(dx), this.opponent.speed * delta);
      this.aiPos.x = Math.max(-2.7, Math.min(2.7, this.aiPos.x));

      // AI Position Z: stays back near baseline unless ball is dropping in kitchen
      if (this.ball.vz < 0 && this.ball.z > -3.0 && this.ball.y < 1.0) {
        // Move forward to handle dink
        const targetZ = Math.max(-2.4, this.ball.z - 0.5);
        this.aiPos.z += (targetZ - this.aiPos.z) * Math.min(1, 4 * delta);
      } else {
        // Recover to baseline
        this.aiPos.z += (-5.8 - this.aiPos.z) * Math.min(1, 3 * delta);
      }
    }

    // 4. Ball 3D Physics Integration
    if (this.ball.inPlay) {
      const gravity = -11.5;
      const drag = 0.993;

      this.ball.vx *= drag;
      this.ball.vz *= drag;
      this.ball.vy += gravity * delta;

      // Apply Spin Curve Deflection
      if (Math.abs(this.ball.spinX) > 0.01) {
        this.ball.vx += this.ball.spinX * delta * 2.2;
        this.ball.spinX *= 0.96;
      }

      this.ball.x += this.ball.vx * delta;
      this.ball.y += this.ball.vy * delta;
      this.ball.z += this.ball.vz * delta;

      // Net Collision Detection at Z = 0
      const prevZ = this.ball.z - this.ball.vz * delta;
      const crossedNet = (prevZ < 0 && this.ball.z >= 0) || (prevZ > 0 && this.ball.z <= 0);

      if (crossedNet) {
        const netY = this.netHeight;
        if (this.ball.y < netY) {
          // Ball hit the net!
          this.ball.vx *= 0.15;
          this.ball.vz = -this.ball.vz * 0.2; // slight rebound
          this.ball.vy = Math.min(this.ball.vy, 0.4);
          this.awardPoint(
            this.ball.lastHitter === 'player' ? 'ai' : 'player',
            'net',
            this.ball.lastHitter === 'player' ? '🕸️ Banh rúc lưới!' : `🕸️ ${this.opponent.name} đánh rúc lưới!`
          );
          return;
        } else {
          this.ball.hasClearedNet = true;
        }
      }

      // Ground Bounce Detection (Court surface Y = 0.0)
      if (this.ball.y <= this.ball.radius) {
        this.ball.y = this.ball.radius;
        this.ball.bouncesSinceHit++;

        // Check if bounce was out of bounds
        const isOutOfBounds = Math.abs(this.ball.x) > this.courtWidth / 2 || Math.abs(this.ball.z) > this.courtLength / 2;

        if (isOutOfBounds) {
          this.onBallBounce?.(this.ball.x, this.ball.z, true);
          const winner = this.ball.lastHitter === 'player' ? 'ai' : 'player';
          this.awardPoint(
            winner,
            'out',
            this.ball.lastHitter === 'player' ? '❌ Banh ra ngoài sân (Out)!' : `❌ Banh của ${this.opponent.name} ra ngoài!`
          );
          return;
        }

        // Valid court bounce
        this.onBallBounce?.(this.ball.x, this.ball.z, false);

        if (this.ball.bouncesSinceHit >= 2) {
          // Double bounce: person on this side failed to return
          const sideWithDoubleBounce = this.ball.z > 0 ? 'player' : 'ai';
          const winner = sideWithDoubleBounce === 'player' ? 'ai' : 'player';
          this.awardPoint(
            winner,
            'double_bounce',
            sideWithDoubleBounce === 'player' ? '⚠️ Bóng nảy 2 lần!' : `⭐ Bóng nảy 2 lần trên sân ${this.opponent.name}!`
          );
          return;
        }

        // Rebound velocity with surface elasticity
        this.ball.vy = -this.ball.vy * 0.72;
        this.ball.vx *= 0.94;
        this.ball.vz *= 0.94;
      }

      // Check AI hit opportunity
      if (this.ball.vz < 0 && this.ball.z < -2.0) {
        this.aiDecideShot();
      }
    }
  }

  public awardPoint(winner: 'player' | 'ai', reason: PointResult['reason'], message: string): void {
    if (this.isMatchOver) return;

    this.ball.inPlay = false;

    if (winner === 'player') {
      this.playerScore++;
    } else {
      this.aiScore++;
    }

    let speech: { speaker: string; text: string } | undefined;
    if (winner === 'player' && Math.random() < 0.5) {
      speech = {
        speaker: this.opponent.name,
        text: this.opponent.praises[Math.floor(Math.random() * this.opponent.praises.length)]
      };
    } else if (winner === 'ai' && Math.random() < 0.5) {
      speech = {
        speaker: this.opponent.name,
        text: this.opponent.taunts[Math.floor(Math.random() * this.opponent.taunts.length)]
      };
    }

    this.onPointScored?.({ winner, reason, message, speech });

    // Check match victory condition (Pickleball standard: reach target with >= 2 points lead)
    const target = this.settings.targetScore;
    const isPlayerWin = this.playerScore >= target && (this.playerScore - this.aiScore >= 2);
    const isAiWin = this.aiScore >= target && (this.aiScore - this.playerScore >= 2);

    if (isPlayerWin || isAiWin) {
      this.isMatchOver = true;
      this.matchWinner = isPlayerWin ? 'player' : 'ai';
      this.onMatchFinished?.(this.matchWinner, this.stats);
    } else {
      // Continue next serve after 1.4s delay
      setTimeout(() => {
        if (!this.isMatchOver) {
          // In rally scoring or side-out, winner of point serves next
          this.setupServe(winner);
        }
      }, 1400);
    }
  }
}
