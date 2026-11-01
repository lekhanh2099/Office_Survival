// ============================================================================
// PICKLEBALL ENGINE - Real-Time 3D Physics & Match State Machine
// ============================================================================

export type ShotType = 'drive' | 'dink' | 'smash' | 'curve' | 'volley' | 'drop';
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
    difficultyLabel: 'Tân Thủ (1★)',
    difficultyStars: 1,
    speed: 4.6,
    power: 0.90,
    accuracy: 0.88,
    dinkTendency: 0.20,
    smashTendency: 0.20,
    spinTendency: 0.10,
    errorRate: 0.09,
    taunts: ['Em mới tập thôi, anh/chị nương tay xíu nha!', 'U là trời banh bay nhanh quá!', 'Huhu em suýt chạm được rồi!'],
    praises: ['Anh/chị đánh hay quá trời luôn!', 'Đỉnh nóc kịch trần luôn sốp ơi!']
  },
  hoang: {
    id: 'hoang',
    name: 'Anh Hoàng',
    role: 'IT Support',
    emoji: '🖥️',
    avatarBg: '#4f46e5',
    difficultyLabel: 'Xoáy Góc Ma Thuật (3★)',
    difficultyStars: 3,
    speed: 5.4,
    power: 1.10,
    accuracy: 0.93,
    dinkTendency: 0.25,
    smashTendency: 0.35,
    spinTendency: 0.75, // Extreme sidespin curves!
    errorRate: 0.04,
    taunts: ['Banh này có thuật toán xoáy 60fps đó em!', 'Đã ping cao lại còn gặp banh gắt!', 'Đang debug đường banh...'],
    praises: ['Phản xạ chuẩn 1ms luôn!', 'Quả vừa rồi xịn như code production!']
  },
  nga: {
    id: 'nga',
    name: 'Chị Nga',
    role: 'Kế Toán Kho',
    emoji: '📊',
    avatarBg: '#ef4444',
    difficultyLabel: 'Bức Tường Kitchen (3★)',
    difficultyStars: 3,
    speed: 5.2,
    power: 0.95,
    accuracy: 0.96,
    dinkTendency: 0.65, // Master of soft drops & Kitchen warfare!
    smashTendency: 0.25,
    spinTendency: 0.25,
    errorRate: 0.03, // Ultra steady defense!
    taunts: ['Bỏ nhỏ một quả vào Kitchen coi em đỡ được không!', 'Cân đối sổ sách còn khó hơn quả này!', 'Thủ kín kẽ không hở 1 xu!'],
    praises: ['Gớm, tay nghề dạo này lên dữ ha!', 'Được của nó đấy, chiều chị khao trà sữa!']
  },
  tuan: {
    id: 'tuan',
    name: 'Anh Tuấn',
    role: 'Tài Xế Cont Cát Lái',
    emoji: '🚚',
    avatarBg: '#10b981',
    difficultyLabel: 'Smash Sấm Sét (4★)',
    difficultyStars: 4,
    speed: 5.8,
    power: 1.35, // High kinetic power!
    accuracy: 0.91,
    dinkTendency: 0.15,
    smashTendency: 0.68, // Aggressive baseline & Kitchen smasher!
    spinTendency: 0.20,
    errorRate: 0.04,
    taunts: ['Cont 40HQ anh còn lùi ngọt, quả banh này xi-nhê gì!', 'Né ra kẻo banh bay rách áo!', 'Lực tay vác cont nó phải thế!'],
    praises: ['Khá lắm em trai! Cứng tay đấy!', 'Pha đập vừa rồi chuẩn tải trọng luôn!']
  },
  boss: {
    id: 'boss',
    name: 'Sếp Hùng',
    role: 'Tổng Giám Đốc',
    emoji: '👔',
    avatarBg: '#f59e0b',
    difficultyLabel: 'Chiến Thần Công Sở (5★)',
    difficultyStars: 5,
    speed: 6.4, // Fast athletic coverage!
    power: 1.25,
    accuracy: 0.98,
    dinkTendency: 0.45,
    smashTendency: 0.52,
    spinTendency: 0.48,
    errorRate: 0.015, // Grandmaster precision!
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
  reason: 'out' | 'net' | 'double_bounce' | 'ace' | 'kitchen_violation' | 'winner';
  message: string;
  speech?: { speaker: string; text: string };
}

export interface TournamentRound {
  index: number;
  stageName: string;
  title: string;
  desc: string;
  opponentId: ColleagueId;
  targetScore: 5 | 7;
  unlocked: boolean;
  completed: boolean;
  winner?: 'player' | 'ai';
  playerScore?: number;
  aiScore?: number;
}

export interface TournamentState {
  active: boolean;
  currentRound: number; // 0..3
  rounds: TournamentRound[];
  isChampion: boolean;
}

export const DEFAULT_TOURNAMENT_ROUNDS: TournamentRound[] = [
  {
    index: 0,
    stageName: 'Tứ Kết',
    title: 'Vòng 1: Thử Thách Tân Binh',
    desc: 'Đối đầu Em Linh (Thực Tập Sinh GenZ) - Tốc độ nhanh, thích xoáy góc hiểm!',
    opponentId: 'linh',
    targetScore: 5,
    unlocked: true,
    completed: false
  },
  {
    index: 1,
    stageName: 'Bán Kết',
    title: 'Vòng 2: Bức Tường Kitchen',
    desc: 'Đối đầu Chị Nga (Kế Toán Kho) - Bậc thầy Bỏ Nhỏ Kitchen kiên nhẫn số 1!',
    opponentId: 'nga',
    targetScore: 5,
    unlocked: false,
    completed: false
  },
  {
    index: 2,
    stageName: 'Chung Kết Nhánh',
    title: 'Vòng 3: Bão Lửa Cát Lái',
    desc: 'Đối đầu Anh Tuấn (Tài Xế Cont Cát Lái) - Những cú đập sấm sét cắm sâu sàn!',
    opponentId: 'tuan',
    targetScore: 7,
    unlocked: false,
    completed: false
  },
  {
    index: 3,
    stageName: 'Chung Kết Cúp',
    title: 'Đại Chiến Tranh Cúp Vô Địch',
    desc: 'Đối đầu Sếp Hùng (Tổng Giám Đốc) - Chiến Thần Pickleball toàn diện không góc chết!',
    opponentId: 'boss',
    targetScore: 7,
    unlocked: false,
    completed: false
  }
];

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
  public targetPlayerPos = { x: 1.2, z: 5.8 };
  public aiPos = { x: -1.2, z: -5.8 };
  public playerPaddleAnim = 0; // 0: idle, >0: swinging
  public aiPaddleAnim = 0;
  public bufferedShot: { shotType: ShotType; timestamp: number; explicitAimX?: number; explicitAimZ?: number; aimOffset?: number } | null = null;
  public manualInputTimer = 0; // seconds remaining where manual input overrides auto-assist
  public isDiving = false;
  public diveTimer = 0;

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
    squashY: 1.0,
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

  // Tournament Cup Mode State
  public tournament: TournamentState = {
    active: false,
    currentRound: 0,
    rounds: JSON.parse(JSON.stringify(DEFAULT_TOURNAMENT_ROUNDS)),
    isChampion: false
  };

  // Tactical Stamina & Target State
  public playerStamina = 100; // 0..100
  public aiStamina = 100;     // 0..100
  public tacticalHint = '🎾 Giao bóng vào góc xa để chiếm thế chủ động!';
  public shotOpportunity = {
    smashReady: false,
    dinkFavorable: false,
    lowBallRisk: false
  };
  public targetLanding: { x: number; z: number; hitter: 'player' | 'ai'; type: ShotType } | null = null;

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
      autoPositionAssist: settings?.autoPositionAssist ?? false,
      selectedPaddleId: settings?.selectedPaddleId || 'carbon_genz',
      betAmount: settings?.betAmount || 0
    };

    this.opponent = PICKLEBALL_COLLEAGUES[this.settings.opponentId] || PICKLEBALL_COLLEAGUES.nga;
    this.paddle = PICKLEBALL_PADDLES.find(p => p.id === this.settings.selectedPaddleId) || PICKLEBALL_PADDLES[0];
    this.resetMatch();
  }

  public startTournament(roundIndex = 0): void {
    this.tournament.active = true;
    this.tournament.currentRound = Math.max(0, Math.min(3, roundIndex));
    const round = this.tournament.rounds[this.tournament.currentRound];
    round.unlocked = true;
    this.settings.opponentId = round.opponentId;
    this.settings.targetScore = round.targetScore;
    this.opponent = PICKLEBALL_COLLEAGUES[round.opponentId];
    this.resetMatch();
  }

  public advanceTournament(): boolean {
    if (!this.tournament.active) return false;
    const curRound = this.tournament.rounds[this.tournament.currentRound];
    curRound.completed = true;
    curRound.winner = 'player';
    curRound.playerScore = this.playerScore;
    curRound.aiScore = this.aiScore;

    if (this.tournament.currentRound >= 3) {
      this.tournament.isChampion = true;
      const goldPaddle = PICKLEBALL_PADDLES.find(p => p.id === 'gold_boss');
      if (goldPaddle) goldPaddle.unlocked = true;
      return true; // Won Grand Final!
    }

    this.tournament.currentRound++;
    const nextRound = this.tournament.rounds[this.tournament.currentRound];
    nextRound.unlocked = true;
    this.settings.opponentId = nextRound.opponentId;
    this.settings.targetScore = nextRound.targetScore;
    this.opponent = PICKLEBALL_COLLEAGUES[nextRound.opponentId];
    this.resetMatch();
    return false;
  }

  public retryTournamentRound(): void {
    if (!this.tournament.active) return;
    const curRound = this.tournament.rounds[this.tournament.currentRound];
    this.settings.opponentId = curRound.opponentId;
    this.settings.targetScore = curRound.targetScore;
    this.opponent = PICKLEBALL_COLLEAGUES[curRound.opponentId];
    this.resetMatch();
  }

  public exitTournament(): void {
    this.tournament.active = false;
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
    this.targetPlayerPos.x = Math.max(-2.7, Math.min(2.7, targetX));
    this.playerPos.x = this.targetPlayerPos.x;
    this.manualInputTimer = 1.0;
  }

  public setPlayerPos(targetX: number, targetZ?: number, instant = false): void {
    this.targetPlayerPos.x = Math.max(-2.7, Math.min(2.7, targetX));
    if (targetZ !== undefined) {
      this.targetPlayerPos.z = Math.max(2.2, Math.min(5.8, targetZ));
    }
    if (instant) {
      this.playerPos.x = this.targetPlayerPos.x;
      this.playerPos.z = this.targetPlayerPos.z;
    }
    this.manualInputTimer = 1.0;
  }

  public stepPlayer(direction: -1 | 1, distance = 0.75): void {
    this.targetPlayerPos.x = Math.max(-2.7, Math.min(2.7, this.playerPos.x + direction * distance));
    this.playerPos.x = this.targetPlayerPos.x;
    this.manualInputTimer = 1.0;
  }

  public stepPlayerZ(direction: -1 | 1, distance = 0.6): void {
    this.targetPlayerPos.z = Math.max(2.2, Math.min(5.8, this.playerPos.z + direction * distance));
    this.playerPos.z = this.targetPlayerPos.z;
    this.manualInputTimer = 1.0;
  }

  /**
   * Kinematic trajectory calculation that strictly guarantees clearing the net at Z = 0
   */
  public calculateTrajectory(
    startX: number,
    startY: number,
    startZ: number,
    targetX: number,
    targetZ: number,
    flightTime: number,
    desiredNetClearance = 0.35
  ): { vx: number; vy: number; vz: number } {
    // Air drag compensation factor for wiffle ball deceleration
    const dragComp = 1.0 + 0.045 * flightTime;
    const vx = ((targetX - startX) / flightTime) * dragComp;
    const vz = ((targetZ - startZ) / flightTime) * dragComp;

    // Time to reach net plane (Z = 0): startZ + vz * tNet = 0 => tNet = -startZ / vz
    let vy: number;
    const tNet = -startZ / vz;

    if (tNet > 0.04 && tNet < flightTime) {
      const targetNetY = this.netHeight + desiredNetClearance; // e.g. 0.88 + 0.35 = 1.23m
      const gravity = 11.2;
      // Kinematic equation: y(tNet) = startY + vy * tNet - 0.5 * g * tNet^2 = targetNetY
      vy = (targetNetY - startY + 0.5 * gravity * tNet * tNet) / tNet;
      // Safety clamp: keep within healthy range
      vy = Math.max(2.5, Math.min(8.0, vy));
    } else {
      vy = 3.8;
    }

    return { vx, vy, vz };
  }

  public resetMatch(): void {
    this.playerScore = 0;
    this.aiScore = 0;
    this.playerStamina = 100;
    this.aiStamina = 100;
    this.targetLanding = null;
    this.tacticalHint = '🎯 Giao bóng chéo sân sang góc xa để mở thế trận!';
    this.shotOpportunity = { smashReady: false, dinkFavorable: false, lowBallRisk: false };
    this.isMatchOver = false;
    this.matchWinner = null;
    this.currentServer = 'player';
    this.serverQuadrant = 'right';
    this.rallyCount = 0;
    this.bufferedShot = null;
    this.manualInputTimer = 0;
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
    this.serveTimer = server === 'player' ? 999999 : 1.4; // AI serves after 1.4s, player waits indefinitely!
    this.rallyCount = 0;
    this.bufferedShot = null;

    // Alternate quadrant based on server score (Pickleball standard: even score = right, odd score = left)
    const serverScore = server === 'player' ? this.playerScore : this.aiScore;
    this.serverQuadrant = serverScore % 2 === 0 ? 'right' : 'left';
    const serveX = this.serverQuadrant === 'right' ? 1.4 : -1.4;

    if (server === 'player') {
      this.playerPos.x = serveX;
      this.playerPos.z = 5.8;
      this.targetPlayerPos.x = serveX;
      this.targetPlayerPos.z = 5.8;
      this.aiPos.x = -serveX; // AI waits diagonally opposite
      this.aiPos.z = -5.8;

      this.ball.x = this.playerPos.x + 0.3;
      this.ball.y = 0.85;
      this.ball.z = this.playerPos.z - 0.45;
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
      this.ball.z = this.aiPos.z + 0.45;
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

  public executeServe(aimX?: number): boolean {
    if (!this.isServing || this.isMatchOver) return false;

    this.isServing = false;
    this.ball.inPlay = true;
    this.ball.bouncesSinceHit = 0;
    this.ball.hasClearedNet = false;
    this.bufferedShot = null;

    if (this.currentServer === 'player') {
      this.ball.lastHitter = 'player';
      this.ball.serveTargetSide = 'ai';
      this.playerStamina = Math.max(0, this.playerStamina - 8);

      // Aim targetX: if player swiped/aimed, use aimX! Else crosscourt diagonal:
      let targetX: number;
      if (aimX !== undefined) {
        targetX = Math.max(-2.4, Math.min(2.4, aimX));
      } else {
        targetX = this.serverQuadrant === 'right' ? -1.5 : 1.5;
      }
      const targetZ = -4.6;
      const flightTime = 0.96 / this.settings.ballSpeedFactor;

      const traj = this.calculateTrajectory(this.ball.x, this.ball.y, this.ball.z, targetX, targetZ, flightTime, 0.40);
      this.ball.vx = traj.vx;
      this.ball.vy = traj.vy;
      this.ball.vz = traj.vz;
      this.playerPaddleAnim = 0.25;
      this.targetLanding = { x: targetX, z: targetZ, hitter: 'player', type: 'drive' };

      this.onBallHit?.('player', 'drive', 'good');
    } else {
      this.ball.lastHitter = 'ai';
      this.ball.serveTargetSide = 'player';
      this.aiStamina = Math.max(0, this.aiStamina - 4);

      // Dynamic AI Serve based on opponent skill & archetype
      const baseTargetX = this.serverQuadrant === 'right' ? -1.6 : 1.6;
      const targetVariationX = (Math.random() - 0.5) * 0.8;
      const targetX = Math.max(-2.5, Math.min(2.5, baseTargetX + targetVariationX));
      const targetZ = 4.6 + Math.random() * 0.7;
      const flightTime = (1.08 / (this.opponent.power * this.settings.ballSpeedFactor));

      const traj = this.calculateTrajectory(this.ball.x, this.ball.y, this.ball.z, targetX, targetZ, flightTime, 0.38);
      this.ball.vx = traj.vx;
      this.ball.vy = traj.vy;
      this.ball.vz = traj.vz;
      this.ball.spinX = (this.opponent.spinTendency > 0.4) ? (targetX > 0 ? -3.5 : 3.5) : 0;
      this.ball.spinZ = 1.2;
      this.aiPaddleAnim = 0.25;
      this.targetLanding = { x: targetX, z: targetZ, hitter: 'ai', type: 'drive' };

      this.onBallHit?.('ai', 'drive', 'good');
    }

    return true;
  }

  public triggerPlayerShotWithGesture(
    dx: number,
    dy: number,
    _dt: number,
    speed: number
  ): { success: boolean; shotType?: ShotType; quality?: ShotQuality; buffered?: boolean } {
    if (this.isMatchOver) return { success: false };

    // Continuous directional aiming from swipe vector:
    // Swiping left (dx < 0) -> target left side (negative X)
    // Swiping right (dx > 0) -> target right side (positive X)
    // Swiping forward/center -> center
    const angleRatio = dx / Math.max(26, Math.abs(dy) * 0.85);
    const explicitAimX = Math.max(-2.55, Math.min(2.55, angleRatio * 2.5));

    // If serving, immediately execute serve with directional aim!
    if (this.isServing && this.currentServer === 'player') {
      this.executeServe(explicitAimX);
      return { success: true, quality: 'good', shotType: 'drive' };
    }

    if (!this.ball.inPlay || this.ball.lastHitter === 'player') {
      return { success: false };
    }

    const dist = Math.hypot(dx, dy);
    let shotType: ShotType = 'drive';
    let explicitAimZ: number = -4.8;

    const isNearKitchen = this.playerPos.z <= 3.6;
    const isBallInAir = this.ball.bouncesSinceHit === 0;

    // 1. Curve Sidespin: Strong horizontal swipe (|dx| > 38 and dx dominates dy)
    if (Math.abs(dx) > 38 && Math.abs(dx) > Math.abs(dy) * 0.72) {
      shotType = 'curve';
      explicitAimZ = -4.7;
    }
    // 2. Power Smash: Fast, long upward flick (speed > 0.44 or deep upward flick dy < -65)
    else if ((speed > 0.44 && dy < -38) || dy < -65 || (dist > 70 && speed > 0.36)) {
      shotType = 'smash';
      explicitAimZ = -5.35;
    }
    // 3. Volley: Intercepting ball mid-air when positioned up near the Kitchen
    else if (isNearKitchen && isBallInAir) {
      shotType = 'volley';
      explicitAimZ = -4.6;
    }
    // 4. Drop Shot / Dink: Short, gentle flick (Đánh nhẹ / vuốt ngắn)
    else if (dist < 46 && speed < 0.38) {
      shotType = 'dink';
      explicitAimZ = -1.8;
    }
    // 5. Baseline Drive: Solid medium forward drive
    else {
      shotType = 'drive';
      explicitAimZ = -4.8;
    }

    const res = this.triggerPlayerShot(shotType, explicitAimX, explicitAimZ);
    return { ...res, shotType };
  }

  public triggerPlayerShot(
    shotType: ShotType,
    explicitAimX?: number,
    explicitAimZ?: number
  ): { success: boolean; quality?: ShotQuality; buffered?: boolean } {
    if (this.isMatchOver) return { success: false };

    // If serving, immediately serve!
    if (this.isServing && this.currentServer === 'player') {
      this.executeServe(explicitAimX);
      return { success: true, quality: 'good' };
    }

    if (!this.ball.inPlay || this.ball.lastHitter === 'player') {
      return { success: false };
    }

    // Generous player reach check
    const dx = this.ball.x - this.playerPos.x;
    const dz = this.ball.z - (this.playerPos.z - 0.45);
    const dist = Math.hypot(dx, dz);

    if (dist <= 5.2 && this.ball.z >= 0.8 && this.ball.vz > 0) {
      // Step/lunge towards the ball for clean, responsive paddle contact
      this.playerPos.x += (this.ball.x - this.playerPos.x) * 0.78;
      this.playerPos.z = Math.max(2.2, Math.min(5.8, this.playerPos.z + (this.ball.z + 0.45 - this.playerPos.z) * 0.78));
      this.targetPlayerPos.x = this.playerPos.x;
      this.targetPlayerPos.z = this.playerPos.z;
      this.bufferedShot = null;
      return this.playerHitBall(shotType, explicitAimX, explicitAimZ);
    } else if (this.ball.vz > 0 && this.ball.z < 7.2) {
      // Buffer the shot for 1200ms so it fires automatically the moment the ball arrives!
      this.bufferedShot = { shotType, timestamp: performance.now(), explicitAimX, explicitAimZ };
      return { success: true, buffered: true };
    }

    return { success: false, quality: 'early' };
  }

  public playerHitBall(
    shotType: ShotType,
    explicitAimX?: number,
    explicitAimZ?: number
  ): { success: boolean; quality: ShotQuality } {
    if (!this.ball.inPlay || this.ball.lastHitter === 'player' || this.isMatchOver) {
      return { success: false, quality: 'late' };
    }

    const dx = this.ball.x - this.playerPos.x;
    const dz = this.ball.z - (this.playerPos.z - 0.45);
    const dist = Math.hypot(dx, dz);

    if (dist > 5.5 || this.ball.z < 0.5) {
      return { success: false, quality: 'early' };
    }

    // Non-Volley Zone (The Kitchen) rule check:
    // Only strictly fault if player smashed aggressively right inside Kitchen before bounce
    if (this.playerPos.z <= 1.8 && this.ball.bouncesSinceHit === 0 && shotType === 'smash') {
      this.awardPoint('ai', 'kitchen_violation', '⚠️ Bạn phạm luật Kitchen (Đập bóng sống trong vùng cấm)!');
      return { success: false, quality: 'late' };
    }

    // Timing quality evaluation
    let quality: ShotQuality = 'good';
    if (dist < 1.2 && this.ball.y > 0.35 && this.ball.y < 1.6) {
      quality = 'perfect';
      this.stats.perfectHits++;
    } else if (dist > 3.0 || this.ball.y < 0.22) {
      quality = 'late';
    }

    // TACTICAL ADAPTATION: AGGRESSIVE SHOT ON LOW BALL (Speed-up / Rolled Volley)
    // In real pickleball, hitting hard on low ball becomes a rolled topspin drive skimming the net tape.
    if (shotType === 'smash' && this.ball.y < 0.62) {
      if (this.ball.y < 0.12 && dist > 3.0) {
        // Only if ball has essentially scraped the floor does it fault into net
        this.playerStamina = Math.max(0, this.playerStamina - 20);
        this.playerPaddleAnim = 0.28;
        this.ball.lastHitter = 'player';
        this.ball.bouncesSinceHit = 0;
        this.ball.hasClearedNet = false;
        this.ball.vx = (Math.random() - 0.5) * 1.5;
        this.ball.vy = -1.2;
        this.ball.vz = -9.0;
        this.targetLanding = null;
        this.awardPoint('ai', 'net', '🕸️ Rúc lưới! Bóng chạm đất quá sâu!');
        return { success: false, quality: 'late' };
      }
      // Otherwise convert to flat aggressive Speed-Up Drive!
      shotType = 'drive';
    }

    this.rallyCount++;
    this.stats.longestRally = Math.max(this.stats.longestRally, this.rallyCount);
    this.playerPaddleAnim = 0.28;

    // Shot physics calculation based on selected shot type & paddle stats
    const powerMult = this.paddle.powerBonus * this.settings.ballSpeedFactor * (quality === 'perfect' ? 1.15 : 1.0);
    this.ball.lastHitter = 'player';
    this.ball.bouncesSinceHit = 0;
    this.ball.hasClearedNet = false;
    this.ball.squashY = 0.70;
    this.bufferedShot = null;

    let targetX: number;
    let targetZ: number;
    let flightTime: number;
    let desiredClearance: number;

    // 1. Calculate TARGET X: 100% PLAYER DIRECTED IF SWIPED, or smart auto-aim if button clicked
    if (explicitAimX !== undefined) {
      targetX = Math.max(-2.55, Math.min(2.55, explicitAimX));
    } else {
      const openRight = this.aiPos.x < 0;
      if (shotType === 'smash') {
        targetX = openRight ? (1.6 + Math.random() * 0.8) : (-1.6 - Math.random() * 0.8);
      } else if (shotType === 'dink' || shotType === 'drop') {
        targetX = openRight ? (1.1 + Math.random() * 0.6) : (-1.1 - Math.random() * 0.6);
      } else if (shotType === 'curve') {
        targetX = openRight ? (2.2 + Math.random() * 0.3) : (-2.2 - Math.random() * 0.3);
      } else {
        targetX = openRight ? 1.5 : -1.5;
      }
    }

    // 2. Calculate TARGET Z:
    if (explicitAimZ !== undefined) {
      targetZ = explicitAimZ;
    } else {
      if (shotType === 'dink' || shotType === 'drop') {
        targetZ = -1.8 - Math.random() * 0.4;
      } else if (shotType === 'smash') {
        targetZ = -5.35 - Math.random() * 0.3;
      } else if (shotType === 'volley') {
        targetZ = -4.6;
      } else {
        targetZ = -4.8;
      }
    }

    // 3. Distinct Physics & Trajectory for each Skill
    if (shotType === 'smash') {
      const isHighBall = this.ball.y >= 0.85;
      this.playerStamina = Math.max(0, this.playerStamina - 25);
      this.stats.smashes++;
      if (isHighBall) quality = 'perfect';

      flightTime = (isHighBall ? 0.50 : 0.58) / powerMult;
      desiredClearance = 0.28;
      this.ball.spinZ = 3.6; // Heavy topspin dips sharply down into backcourt
      this.ball.spinX = (targetX - this.ball.x) * 0.35;
      this.tacticalHint = '🚀 Cú ĐẬP SMASH sấm sét cắm sâu cuối sân!';
    } else if (shotType === 'dink' || shotType === 'drop') {
      this.playerStamina = Math.min(100, this.playerStamina + 20);
      this.stats.dinks++;

      flightTime = 1.05;
      desiredClearance = 0.42;
      this.ball.spinZ = -2.6; // Gentle backspin float
      this.ball.spinX = 0;
      this.tacticalHint = '🏓 Bỏ nhỏ DINK êm ái vào Kitchen! (+20% Thể Lực)';
    } else if (shotType === 'curve') {
      this.playerStamina = Math.max(0, this.playerStamina - 15);

      flightTime = 0.80 / powerMult;
      desiredClearance = 0.34;
      this.ball.spinX = targetX > 0 ? 5.2 : -5.2; // Heavy curve sidespin
      this.ball.spinZ = 1.0;
      this.tacticalHint = `🌀 Cú XOÁY GÓC lượn hiểm sang ${targetX > 0 ? 'phải' : 'trái'}!`;
    } else if (shotType === 'volley') {
      this.playerStamina = Math.max(0, this.playerStamina - 12);

      flightTime = 0.66 / powerMult;
      desiredClearance = 0.28;
      this.ball.spinZ = 1.8;
      this.ball.spinX = (targetX - this.ball.x) * 0.3;
      this.tacticalHint = '⚡ Cú bắt VOLLEY bóng sống chớp nhoáng trên lưới!';
    } else {
      // Standard Drive
      this.playerStamina = Math.max(0, this.playerStamina - 10);

      flightTime = 0.80 / powerMult;
      desiredClearance = 0.34;
      this.ball.spinZ = 1.2;
      this.ball.spinX = (targetX - this.ball.x) * 0.2;
      this.tacticalHint = '🎾 Đẩy bóng cắm sân!';
    }

    targetX = Math.max(-2.55, Math.min(2.55, targetX));
    this.targetLanding = { x: targetX, z: targetZ, hitter: 'player', type: shotType };

    const traj = this.calculateTrajectory(
      this.ball.x,
      this.ball.y,
      this.ball.z,
      targetX,
      targetZ,
      flightTime,
      desiredClearance
    );

    this.ball.vx = traj.vx;
    this.ball.vy = traj.vy;
    this.ball.vz = traj.vz;

    this.onBallHit?.('player', shotType, quality);
    return { success: true, quality };
  }

  private aiDecideShot(): void {
    if (!this.ball.inPlay || this.ball.lastHitter === 'ai') return;

    // AI reach distance check
    const dx = this.ball.x - this.aiPos.x;
    const dz = this.ball.z - (this.aiPos.z + 0.45);
    const dist = Math.hypot(dx, dz);

    if (dist > 2.4 || this.ball.z > -1.2) return;

    // In Pickleball: if receiving serve, must bounce before hitting
    if (this.rallyCount === 0 && this.ball.bouncesSinceHit === 0) return;

    // SMASH DEFENSE / WINNER RESOLUTION:
    // If incoming ball is a Smash from player:
    if (this.targetLanding?.type === 'smash') {
      const smashDefenseSkill = (this.opponent.accuracy * 0.45) + (this.aiStamina / 100) * 0.45;
      const distFromAi = Math.abs(this.targetLanding.x - this.aiPos.x);
      const anglePenalty = distFromAi > 1.6 ? 0.35 : (distFromAi > 0.8 ? 0.15 : 0);
      const finalReturnChance = Math.max(0.12, Math.min(0.92, smashDefenseSkill - anglePenalty));

      if (Math.random() > finalReturnChance) {
        // AI is overpowered or wrong-footed! Ball zooms past for a clean winner!
        return;
      }
    }

    // SMART TACTICAL AI DECISION MATRIX
    let chosenShot: ShotType = 'drive';
    let targetX = 0;
    let targetZ = 4.8;
    let flightTime = 0.68 / (this.opponent.power * this.settings.ballSpeedFactor);
    let desiredClearance = 0.32;

    // Stamina drain: minimal per hit so AI doesn't burn out after 3 rallies
    const distRun = Math.hypot(this.ball.x - this.aiPos.x, this.ball.z - this.aiPos.z);
    this.aiStamina = Math.max(0, this.aiStamina - Math.min(8, 1.5 + distRun * 1.0));

    // Exhaustion & Mistake calculation:
    // Errors ONLY possible on longer rallies (rally >= 5) and scaled to opponent error rate
    const staminaPenalty = (100 - this.aiStamina) / 100;
    const effectiveErrorRate = this.opponent.errorRate * (1 + staminaPenalty * 1.5);
    const isMistake = (this.rallyCount >= 5) && (Math.random() < effectiveErrorRate);

    if (isMistake) {
      if (Math.random() < 0.25) {
        // AI hits into net
        this.ball.vx = (0 - this.ball.x) / 0.7;
        this.ball.vz = (1.5 - this.ball.z) / 0.7;
        this.ball.vy = 1.3;
        this.targetLanding = null;
      } else if (Math.random() < 0.50) {
        // AI hits out of bounds
        this.ball.vx = (Math.random() > 0.5 ? 3.3 : -3.3);
        this.ball.vz = 7.1;
        this.ball.vy = 4.0;
        this.targetLanding = null;
      } else {
        // AI pops up a weak high floater -> Golden smash chance for player!
        chosenShot = 'drive';
        targetX = (Math.random() - 0.5) * 1.2;
        targetZ = 4.2;
        flightTime = 1.2;
        desiredClearance = 1.1;
        this.tacticalHint = `🔥 ${this.opponent.name} đuối sức trả bóng bổng! ĐẬP SMASH DỨT ĐIỂM!`;
        this.targetLanding = { x: targetX, z: targetZ, hitter: 'ai', type: 'smash' };
      }
      this.ball.lastHitter = 'ai';
      this.ball.bouncesSinceHit = 0;
      this.aiPaddleAnim = 0.28;
      this.onBallHit?.('ai', 'drive', 'late');
      return;
    }

    this.rallyCount++;
    this.stats.longestRally = Math.max(this.stats.longestRally, this.rallyCount);
    this.aiPaddleAnim = 0.28;
    this.ball.lastHitter = 'ai';
    this.ball.bouncesSinceHit = 0;
    this.ball.hasClearedNet = false;

    const playerX = this.playerPos.x;
    const playerZ = this.playerPos.z;
    const isPlayerDeep = playerZ > 5.1;
    const isPlayerNearKitchen = playerZ < 3.2;
    const isPlayerRight = playerX > 0.35;
    const isPlayerLeft = playerX < -0.35;
    // Calculate opposite open corner to exploit:
    const openCornerX = isPlayerRight ? (-2.1 - Math.random() * 0.35) : (isPlayerLeft ? (2.1 + Math.random() * 0.35) : (Math.random() > 0.5 ? 2.1 : -2.1));

    const rand = Math.random();

    // 1. TACTIC: Drop Shot (Dink) into Kitchen
    if (isPlayerDeep && rand < this.opponent.dinkTendency) {
      chosenShot = 'dink';
      targetX = openCornerX * 0.7;
      targetZ = 1.85 + Math.random() * 0.45; // reachable Kitchen drop shot
      flightTime = 1.15;
      desiredClearance = 0.40;
      this.ball.spinZ = -2.8; // Backspin float
      this.ball.spinX = 0;
      this.aiStamina = Math.min(100, this.aiStamina + 10);
      this.tacticalHint = `🏓 ${this.opponent.name} BỎ NHỎ Kitchen! Chạy lên cứu bóng!`;
    }
    // 2. TACTIC: Smash Attack
    else if ((this.ball.y > 0.90 || isPlayerNearKitchen || this.rallyCount >= 3) && rand < this.opponent.smashTendency) {
      chosenShot = 'smash';
      targetX = openCornerX;
      targetZ = 5.2 + Math.random() * 0.3;
      flightTime = 0.82 / (this.opponent.power * this.settings.ballSpeedFactor);
      desiredClearance = 0.28;
      this.ball.spinZ = 3.8;
      this.ball.spinX = (Math.random() - 0.5) * 1.0;
      this.tacticalHint = `🚀 ${this.opponent.name} ĐẬP SMASH! Chuẩn bị đón đỡ!`;
    }
    // 3. TACTIC: Curve Sidespin
    else if (rand < this.opponent.spinTendency) {
      chosenShot = 'curve';
      targetX = openCornerX;
      targetZ = 4.8;
      flightTime = 1.05 / (this.opponent.power * this.settings.ballSpeedFactor);
      desiredClearance = 0.34;
      this.ball.spinX = targetX > 0 ? 4.5 : -4.5;
      this.ball.spinZ = 1.2;
      this.tacticalHint = `🌀 ${this.opponent.name} xoáy bóng cong về mép sân!`;
    }
    // 4. TACTIC: Piercing Baseline Drive
    else {
      chosenShot = 'drive';
      targetX = openCornerX;
      targetZ = 4.9;
      flightTime = 0.98 / (this.opponent.power * this.settings.ballSpeedFactor);
      desiredClearance = 0.32;
      this.ball.spinZ = 1.4;
      this.ball.spinX = 0;
      this.tacticalHint = `🎾 ${this.opponent.name} ép góc hiểm! Di chuyển đón bóng!`;
    }

    targetX = Math.max(-2.55, Math.min(2.55, targetX));
    this.targetLanding = { x: targetX, z: targetZ, hitter: 'ai', type: chosenShot };
    this.ball.squashY = 0.70;

    const traj = this.calculateTrajectory(
      this.ball.x,
      this.ball.y,
      this.ball.z,
      targetX,
      targetZ,
      flightTime,
      desiredClearance
    );

    this.ball.vx = traj.vx;
    this.ball.vy = traj.vy;
    this.ball.vz = traj.vz;

    this.onBallHit?.('ai', chosenShot, 'good');

    // Occasional AI banter during rally
    if (this.rallyCount === 4 && Math.random() < 0.5) {
      const taunt = this.opponent.taunts[Math.floor(Math.random() * this.opponent.taunts.length)];
      this.onSpeechTaunt?.(this.opponent.name, taunt);
    }
  }

  public update(delta: number, playerInputX = 0, playerInputZ = 0): void {
    if (this.isMatchOver) return;

    // Update Paddle Swing & Dive Animation Timers
    if (this.playerPaddleAnim > 0) this.playerPaddleAnim = Math.max(0, this.playerPaddleAnim - delta);
    if (this.aiPaddleAnim > 0) this.aiPaddleAnim = Math.max(0, this.aiPaddleAnim - delta);
    if (this.diveTimer > 0) {
      this.diveTimer -= delta;
      if (this.diveTimer <= 0) this.isDiving = false;
    }

    // Check buffered shot execution
    if (this.bufferedShot && this.ball.inPlay && this.ball.lastHitter !== 'player' && this.ball.vz > 0) {
      if (performance.now() - this.bufferedShot.timestamp < 1200) {
        const dx = this.ball.x - this.playerPos.x;
        const dz = this.ball.z - (this.playerPos.z - 0.45);
        const dist = Math.hypot(dx, dz);
        if (dist <= 5.2 && this.ball.z >= 0.8) {
          // Athletic step to ball
          this.playerPos.x += (this.ball.x - this.playerPos.x) * 0.78;
          this.playerPos.z = Math.max(2.2, Math.min(5.8, this.playerPos.z + (this.ball.z + 0.45 - this.playerPos.z) * 0.78));
          this.targetPlayerPos.x = this.playerPos.x;
          this.targetPlayerPos.z = this.playerPos.z;

          const shot = this.bufferedShot.shotType;
          const aimX = this.bufferedShot.explicitAimX;
          const aimZ = this.bufferedShot.explicitAimZ;
          this.bufferedShot = null;
          this.playerHitBall(shot, aimX, aimZ);
        }
      } else {
        this.bufferedShot = null;
      }
    }

    // 1. Serving countdown & positioning
    if (this.isServing) {
      if (this.currentServer === 'ai') {
        this.serveTimer -= delta;
        if (this.serveTimer <= 0) {
          this.executeServe();
        }
      } else {
        // Player serve: NEVER AUTO-SERVE! The game waits indefinitely for the player to serve!
        const playerSpeed = 5.8;
        if (Math.abs(playerInputX) > 0.05) {
          this.targetPlayerPos.x += playerInputX * playerSpeed * delta;
          this.playerPos.x = this.targetPlayerPos.x;
        }
        if (this.serverQuadrant === 'right') {
          this.playerPos.x = Math.max(0.3, Math.min(2.5, this.playerPos.x));
        } else {
          this.playerPos.x = Math.max(-2.5, Math.min(-0.3, this.playerPos.x));
        }
        this.playerPos.z = 5.8;
        this.targetPlayerPos.z = 5.8;
        // Ball stays in hand/paddle ready to serve
        this.ball.x = this.playerPos.x + (this.serverQuadrant === 'right' ? 0.25 : -0.25);
        this.ball.y = 0.85;
        this.ball.z = this.playerPos.z - 0.45;
      }
      return;
    }

    // 2. Player Movement - 100% Player Controlled with smooth agile interpolation
    const runSpeed = 7.5;
    const dx = this.targetPlayerPos.x - this.playerPos.x;
    const dz = this.targetPlayerPos.z - this.playerPos.z;
    const distToTarget = Math.hypot(dx, dz);

    if (distToTarget > 0.03) {
      const step = Math.min(distToTarget, runSpeed * delta);
      this.playerPos.x += (dx / distToTarget) * step;
      this.playerPos.z += (dz / distToTarget) * step;
    }

    if (Math.abs(playerInputX) > 0.05) {
      this.playerPos.x += playerInputX * runSpeed * delta;
      this.targetPlayerPos.x = this.playerPos.x;
    }
    if (Math.abs(playerInputZ) > 0.05) {
      this.playerPos.z += playerInputZ * runSpeed * delta;
      this.targetPlayerPos.z = this.playerPos.z;
    }

    this.playerPos.x = Math.max(-2.7, Math.min(2.7, this.playerPos.x));
    this.playerPos.z = Math.max(2.2, Math.min(5.8, this.playerPos.z));

    // 3. AI Movement (Predictive & Adaptive with Athletic Speed)
    if (this.ball.inPlay) {
      const staminaFactor = 0.70 + (this.aiStamina / 100) * 0.30;
      if (this.ball.vz < 0) {
        // Ball flying towards AI: calculate arrival intercept
        const timeToAI = Math.max(0.01, (-4.8 - this.ball.z) / this.ball.vz);
        const predictedX = Math.max(-2.55, Math.min(2.55, this.ball.x + this.ball.vx * timeToAI));
        const dx = predictedX - this.aiPos.x;
        const aiSpeed = this.opponent.speed * 1.25 * staminaFactor;
        this.aiPos.x += Math.sign(dx) * Math.min(Math.abs(dx), aiSpeed * delta);

        // AI Z Position: charge kitchen for shallow drop shots, otherwise hold baseline
        const isShallowDrop = (this.targetLanding && this.targetLanding.z > -3.0) || (this.ball.z > -3.2 && this.ball.vz < 0 && this.ball.y < 1.0);
        const targetZ = isShallowDrop ? -2.3 : -5.1;
        const sprintSpeedZ = isShallowDrop ? (aiSpeed * 1.15) : (aiSpeed * 0.9);
        this.aiPos.z += Math.sign(targetZ - this.aiPos.z) * Math.min(Math.abs(targetZ - this.aiPos.z), sprintSpeedZ * delta);
      } else {
        // Ball flying away to player: AI recovers back towards center court
        this.aiPos.x += (0 - this.aiPos.x) * Math.min(1, 3.2 * delta);
        this.aiPos.z += (-5.0 - this.aiPos.z) * Math.min(1, 3.8 * delta);
      }
      this.aiPos.x = Math.max(-2.6, Math.min(2.6, this.aiPos.x));
      this.aiPos.z = Math.max(-5.8, Math.min(-2.2, this.aiPos.z));
    }

    // 3b. Update Tactical Opportunities & Real-Time Advice
    if (this.ball.inPlay && this.ball.vz > 0) {
      const isBallHigh = this.ball.y >= 0.85;
      const isBallLow = this.ball.y < 0.62;
      const isAiDeep = this.aiPos.z <= -4.6;
      const isAiLeft = this.aiPos.x < -0.8;
      const isAiRight = this.aiPos.x > 0.8;

      this.shotOpportunity.smashReady = isBallHigh && this.ball.z >= 2.2;
      this.shotOpportunity.lowBallRisk = isBallLow && this.ball.z >= 2.2;
      this.shotOpportunity.dinkFavorable = isAiDeep;

      if (this.shotOpportunity.smashReady) {
        this.tacticalHint = '🔥 Bóng bổng vừa tầm! Bấm ĐẬP SMASH dứt điểm!';
      } else if (isAiDeep && isBallLow) {
        this.tacticalHint = `💡 ${this.opponent.name} lùi sâu! Bấm BỎ NHỎ DINK vào Kitchen!`;
      } else if (isAiLeft) {
        this.tacticalHint = `🎯 ${this.opponent.name} lệch trái! Bấm ĐỔI GÓC sang phải!`;
      } else if (isAiRight) {
        this.tacticalHint = `🎯 ${this.opponent.name} lệch phải! Bấm ĐỔI GÓC sang trái!`;
      } else if (this.playerStamina < 30) {
        this.tacticalHint = '⚠️ Thể lực hụt hơi! Bỏ nhỏ DINK để hồi sức (+20%)!';
      } else {
        this.tacticalHint = '🎾 Quan sát vị trí đối thủ để tung đòn hiểm!';
      }
    } else if (this.isServing) {
      this.shotOpportunity.smashReady = false;
      this.shotOpportunity.lowBallRisk = false;
      this.shotOpportunity.dinkFavorable = false;
      this.tacticalHint = '🎾 Giao bóng cắm sâu góc chéo để chiếm ưu thế!';
    }

    // 4. Ball 3D Physics Integration
    if (this.ball.inPlay) {
      // Squash & Stretch Recovery
      if (this.ball.squashY < 1.0) {
        this.ball.squashY += (1.0 - this.ball.squashY) * Math.min(1, 16 * delta);
      }

      // Aerodynamic Air Drag for realistic wiffle ball flight deceleration
      const hSpeed = Math.hypot(this.ball.vx, this.ball.vz);
      if (hSpeed > 0.4) {
        const dragFactor = Math.min(0.2, 0.048 * hSpeed * delta);
        this.ball.vx -= this.ball.vx * dragFactor;
        this.ball.vz -= this.ball.vz * dragFactor;
      }

      // Magnus Spin Dynamics:
      // Topspin (spinZ > 0) pulls down sharply; Backspin (spinZ < 0) provides aerodynamic float/lift
      if (Math.abs(this.ball.spinZ) > 0.05) {
        this.ball.vy -= this.ball.spinZ * delta * 1.5;
        this.ball.spinZ *= Math.pow(0.97, delta * 60);
      }

      // Sidespin curves sideways in the air
      if (Math.abs(this.ball.spinX) > 0.05) {
        this.ball.vx += this.ball.spinX * delta * 2.2;
        this.ball.spinX *= Math.pow(0.96, delta * 60);
      }

      const gravity = -11.2;
      this.ball.vy += gravity * delta;

      this.ball.x += this.ball.vx * delta;
      this.ball.y += this.ball.vy * delta;
      this.ball.z += this.ball.vz * delta;

      // Net Collision Detection at Z = 0
      const prevZ = this.ball.z - this.ball.vz * delta;
      const crossedNet = (prevZ < 0 && this.ball.z >= 0) || (prevZ > 0 && this.ball.z <= 0);

      if (crossedNet) {
        const netY = this.netHeight;
        if (this.ball.y < netY - 0.08) {
          // Ball hit solidly into the net mesh!
          this.ball.vx *= 0.15;
          this.ball.vz = -this.ball.vz * 0.2; // slight rebound
          this.ball.vy = Math.min(this.ball.vy, 0.4);
          this.awardPoint(
            this.ball.lastHitter === 'player' ? 'ai' : 'player',
            'net',
            this.ball.lastHitter === 'player' ? '🕸️ Banh rúc lưới!' : `🕸️ ${this.opponent.name} đánh rúc lưới!`
          );
          return;
        } else if (this.ball.y < netY) {
          // Ball grazed the top tape (cord)! Tape deflection: slows down slightly and continues over
          this.ball.vz *= 0.85;
          this.ball.vy = Math.max(0.8, this.ball.vy * 0.7);
          this.ball.hasClearedNet = true;
        } else {
          this.ball.hasClearedNet = true;
        }
      }

      // Ground Bounce Detection (Court surface Y = 0.0)
      if (this.ball.y <= this.ball.radius) {
        this.ball.y = this.ball.radius;
        this.ball.bouncesSinceHit++;
        this.ball.squashY = 0.65; // Elastic squash deformation on impact

        // Check court boundary
        const isOutOfBounds = Math.abs(this.ball.x) > this.courtWidth / 2 || Math.abs(this.ball.z) > this.courtLength / 2;

        if (this.ball.bouncesSinceHit === 1) {
          // FIRST BOUNCE: Must be inside the receiver's court!
          if (isOutOfBounds) {
            this.onBallBounce?.(this.ball.x, this.ball.z, true);
            const winner = this.ball.lastHitter === 'player' ? 'ai' : 'player';
            this.awardPoint(
              winner,
              'out',
              this.ball.lastHitter === 'player' ? '❌ Banh ra ngoài sân (Out)!' : `❌ Banh của ${this.opponent.name} ra ngoài sân!`
            );
            return;
          }

          // Valid first bounce inside the court!
          this.onBallBounce?.(this.ball.x, this.ball.z, false);
          this.targetLanding = null;

          // Rebound velocity with authentic wiffle ball elasticity & generous hang-time
          this.ball.vy = Math.max(5.2, Math.min(6.8, -this.ball.vy * 0.82));
          this.ball.vx *= 0.72;
          this.ball.vz *= 0.72;
        } else {
          // SECOND OR SUBSEQUENT BOUNCE:
          // The ball already bounced legally once! The receiver failed to return it before the 2nd bounce!
          // The hitter wins the point!
          this.onBallBounce?.(this.ball.x, this.ball.z, isOutOfBounds);
          const winner: 'player' | 'ai' = this.ball.lastHitter === 'player' ? 'player' : 'ai';
          this.awardPoint(
            winner,
            'double_bounce',
            winner === 'player' ? '⭐ Bóng nảy 2 lần! Bạn ghi điểm!' : `⚠️ Bóng nảy 2 lần! ${this.opponent.name} ghi điểm!`
          );
          return;
        }
      }

      // Ball flying past baseline after bounce #1 without touching ground again
      if (this.ball.bouncesSinceHit >= 1) {
        if (this.ball.z > 7.6) {
          this.awardPoint('ai', 'winner', `⚡ Cú đánh hiểm hóc của ${this.opponent.name}!`);
          return;
        } else if (this.ball.z < -7.6) {
          this.awardPoint('player', 'winner', '⚡ Bạn tung cú đánh cắm sâu ghi điểm!');
          return;
        }
      }

      // Ball flying completely out of the arena on bounce #0 (never touched court)
      if (this.ball.bouncesSinceHit === 0 && (Math.abs(this.ball.z) > 7.5 || Math.abs(this.ball.x) > 4.2)) {
        const winner = this.ball.lastHitter === 'player' ? 'ai' : 'player';
        this.awardPoint(
          winner,
          'out',
          this.ball.lastHitter === 'player' ? '❌ Banh bay ra ngoài sân!' : `❌ Banh của ${this.opponent.name} bay ra ngoài sân!`
        );
        return;
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
    this.targetLanding = null;
    this.playerStamina = Math.min(100, this.playerStamina + 35);
    this.aiStamina = Math.min(100, this.aiStamina + 35);

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
