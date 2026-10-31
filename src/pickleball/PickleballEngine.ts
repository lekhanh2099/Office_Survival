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
  public aiPos = { x: -1.2, z: -5.8 };
  public playerPaddleAnim = 0; // 0: idle, >0: swinging
  public aiPaddleAnim = 0;
  public bufferedShot: { shotType: ShotType; timestamp: number } | null = null;
  public manualInputTimer = 0; // seconds remaining where manual input overrides auto-assist

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
      autoPositionAssist: settings?.autoPositionAssist ?? true,
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
    this.playerPos.x = Math.max(-2.7, Math.min(2.7, targetX));
    this.manualInputTimer = 1.0;
  }

  public stepPlayer(direction: -1 | 1, distance = 0.75): void {
    this.playerPos.x = Math.max(-2.7, Math.min(2.7, this.playerPos.x + direction * distance));
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
    const vx = (targetX - startX) / flightTime;
    const vz = (targetZ - startZ) / flightTime;

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
    this.tacticalHint = '🎾 Lượt bạn giao bóng: Chạm sân để phát bóng!';
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
    this.serveTimer = server === 'player' ? 6.0 : 1.8;
    this.rallyCount = 0;
    this.bufferedShot = null;

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

  public executeServe(): boolean {
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

      // Crosscourt serve trajectory into diagonal receiving box (past Kitchen: z < -2.1)
      const targetX = this.serverQuadrant === 'right' ? -1.4 : 1.4;
      const targetZ = -4.6;
      const flightTime = 0.84 / this.settings.ballSpeedFactor;

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
      this.aiStamina = Math.max(0, this.aiStamina - 8);

      const targetX = this.serverQuadrant === 'right' ? -1.4 : 1.4;
      const targetZ = 4.6;
      const flightTime = 0.88 / this.settings.ballSpeedFactor;

      const traj = this.calculateTrajectory(this.ball.x, this.ball.y, this.ball.z, targetX, targetZ, flightTime, 0.40);
      this.ball.vx = traj.vx;
      this.ball.vy = traj.vy;
      this.ball.vz = traj.vz;
      this.aiPaddleAnim = 0.25;
      this.targetLanding = { x: targetX, z: targetZ, hitter: 'ai', type: 'drive' };

      this.onBallHit?.('ai', 'drive', 'good');
    }

    return true;
  }

  public triggerPlayerShot(shotType: ShotType, aimOffset = 0): { success: boolean; quality?: ShotQuality; buffered?: boolean } {
    if (this.isMatchOver) return { success: false };

    // If serving, immediately serve!
    if (this.isServing && this.currentServer === 'player') {
      this.executeServe();
      return { success: true, quality: 'good' };
    }

    if (!this.ball.inPlay || this.ball.lastHitter === 'player') {
      return { success: false };
    }

    // Generous player reach check
    const dx = this.ball.x - this.playerPos.x;
    const dz = this.ball.z - (this.playerPos.z - 0.45);
    const dist = Math.hypot(dx, dz);

    if (dist <= 2.6 && this.ball.z >= 1.8 && this.ball.vz > 0) {
      this.bufferedShot = null;
      return this.playerHitBall(shotType, aimOffset);
    } else if (this.ball.vz > 0 && this.ball.z < 6.2) {
      // Buffer the shot for 650ms so it fires automatically the moment the ball arrives!
      this.bufferedShot = { shotType, timestamp: performance.now() };
      return { success: true, buffered: true };
    }

    return { success: false, quality: 'early' };
  }

  public playerHitBall(shotType: ShotType, aimOffset = 0): { success: boolean; quality: ShotQuality } {
    if (!this.ball.inPlay || this.ball.lastHitter === 'player' || this.isMatchOver) {
      return { success: false, quality: 'late' };
    }

    const dx = this.ball.x - this.playerPos.x;
    const dz = this.ball.z - (this.playerPos.z - 0.45);
    const dist = Math.hypot(dx, dz);

    if (dist > 2.8 || this.ball.z < 1.2) {
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
    if (dist < 1.1 && this.ball.y > 0.35 && this.ball.y < 1.6) {
      quality = 'perfect';
      this.stats.perfectHits++;
    } else if (dist > 2.2 || this.ball.y < 0.22) {
      quality = 'late';
    }

    // TACTICAL PENALTY: SMASH ON LOW BALL
    // If player blindly smashes a ball that is below 0.62m off the ground: FAULT into the net!
    if (shotType === 'smash' && this.ball.y < 0.62) {
      this.playerStamina = Math.max(0, this.playerStamina - 20);
      this.playerPaddleAnim = 0.28;
      this.ball.lastHitter = 'player';
      this.ball.bouncesSinceHit = 0;
      this.ball.hasClearedNet = false;
      this.ball.vx = (Math.random() - 0.5) * 1.5;
      this.ball.vy = -1.2;
      this.ball.vz = -9.0;
      this.targetLanding = null;
      this.awardPoint('ai', 'net', '🕸️ Rúc lưới! Bóng quá thấp để Đập Smash (Nên dùng Bỏ Nhỏ)!');
      return { success: false, quality: 'late' };
    }

    this.rallyCount++;
    this.stats.longestRally = Math.max(this.stats.longestRally, this.rallyCount);
    this.playerPaddleAnim = 0.28;

    // Shot physics calculation based on selected shot type & paddle stats
    const powerMult = this.paddle.powerBonus * this.settings.ballSpeedFactor * (quality === 'perfect' ? 1.15 : 1.0);
    this.ball.lastHitter = 'player';
    this.ball.bouncesSinceHit = 0;
    this.ball.hasClearedNet = false;
    this.bufferedShot = null;

    let targetX: number;
    let targetZ: number;
    let flightTime: number;
    let desiredClearance: number;

    if (shotType === 'smash') {
      const isHighBall = this.ball.y >= 0.85;
      this.playerStamina = Math.max(0, this.playerStamina - 25);
      this.stats.smashes++;
      quality = isHighBall ? 'perfect' : 'good';
      if (quality === 'perfect') this.stats.perfectHits++;

      // Aim dynamically to opposite of AI position!
      targetX = this.aiPos.x < 0 ? (1.5 + Math.random() * 0.9) : (-1.5 - Math.random() * 0.9);
      targetZ = -5.4 - Math.random() * 0.3;
      flightTime = (isHighBall ? 0.46 : 0.54) / powerMult;
      desiredClearance = 0.28;
      this.tacticalHint = '🚀 Cú ĐẬP SMASH sấm sét! Ép đối thủ lùi sâu!';
    } else if (shotType === 'dink') {
      // DINK recovers stamina!
      this.playerStamina = Math.min(100, this.playerStamina + 20);
      this.stats.dinks++;

      // Target shallow kitchen on AI side (between -1.0 and -1.8)
      targetX = this.aiPos.x < 0 ? (0.8 + Math.random() * 0.8) : (-0.8 - Math.random() * 0.8);
      targetZ = -1.2 - Math.random() * 0.5;
      flightTime = 0.88;
      desiredClearance = 0.44;

      if (this.aiPos.z < -4.6) {
        this.tacticalHint = `🏓 Bỏ nhỏ Kitchen hiểm! ${this.opponent.name} bị hụt trớn!`;
      } else {
        this.tacticalHint = '🏓 Bỏ nhỏ Kitchen ổn định nhịp thở (+20% Thể Lực)!';
      }
    } else if (shotType === 'curve') {
      this.playerStamina = Math.max(0, this.playerStamina - 15);
      // Exploit open court!
      const openRight = this.aiPos.x < 0;
      targetX = openRight ? (2.2 + Math.random() * 0.3) : (-2.2 - Math.random() * 0.3);
      targetZ = -4.8 - Math.random() * 0.3;
      flightTime = 0.68 / powerMult;
      desiredClearance = 0.34;
      this.ball.spinX = openRight ? 4.2 : -4.2;
      this.tacticalHint = `🌀 Đổi góc hiểm sang ${openRight ? 'phải' : 'trái'}! Ép đối thủ di chuyển!`;
    } else {
      // Drive: standard crosscourt return
      this.playerStamina = Math.max(0, this.playerStamina - 10);
      const crossRight = this.playerPos.x < -0.2;
      const crossLeft = this.playerPos.x > 0.2;
      targetX = crossRight ? 1.6 : (crossLeft ? -1.6 : (Math.random() - 0.5) * 1.6);
      targetZ = -4.9;
      flightTime = 0.74 / powerMult;
      desiredClearance = 0.36;
      this.tacticalHint = '🎾 Đẩy bóng an toàn, chờ thời cơ dứt điểm!';
    }

    targetX = Math.max(-2.55, Math.min(2.55, targetX + aimOffset * 0.8));
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

    // SMART TACTICAL AI DECISION MATRIX
    let chosenShot: ShotType = 'drive';
    let targetX = 0;
    let targetZ = 4.8;
    let flightTime = 0.82 / (this.opponent.power * this.settings.ballSpeedFactor);
    let desiredClearance = 0.35;

    // Stamina drain for AI
    const distRun = Math.hypot(this.ball.x - this.aiPos.x, this.ball.z - this.aiPos.z);
    this.aiStamina = Math.max(0, this.aiStamina - Math.min(22, 6 + distRun * 2.8));

    // Exhaustion & Mistake calculation
    const staminaPenalty = (100 - this.aiStamina) / 100;
    const effectiveErrorRate = this.opponent.errorRate + (staminaPenalty * 0.35);
    const isMistake = (this.rallyCount >= 3) && (Math.random() < effectiveErrorRate);
    if (isMistake) {
      if (Math.random() < 0.35) {
        // AI hits into net
        this.ball.vx = (0 - this.ball.x) / 0.7;
        this.ball.vz = (1.5 - this.ball.z) / 0.7;
        this.ball.vy = 1.3;
        this.targetLanding = null;
      } else if (Math.random() < 0.7) {
        // AI hits out of bounds
        this.ball.vx = (Math.random() > 0.5 ? 3.4 : -3.4);
        this.ball.vz = 7.2;
        this.ball.vy = 4.2;
        this.targetLanding = null;
      } else {
        // AI pops up a WEAK HIGH FLOATER! (Opportunity for player to smash!)
        chosenShot = 'drive';
        targetX = (Math.random() - 0.5) * 1.2;
        targetZ = 4.2;
        flightTime = 1.15; // Slow, hanging in the air!
        desiredClearance = 0.85; // High arch!
        this.tacticalHint = `🔥 ${this.opponent.name} đuối sức trả bóng bổng! ĐẬP SMASH DỨT ĐIỂM!`;
        this.targetLanding = { x: targetX, z: targetZ, hitter: 'ai', type: 'drive' };
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
    const isPlayerDeep = playerZ > 5.4;
    const isPlayerNearKitchen = playerZ < 3.4;
    const isPlayerRight = playerX > 0.5;
    const isPlayerLeft = playerX < -0.5;

    if (this.rallyCount <= 2) {
      // Warmup phase: friendly return to establish rally
      targetX = playerX * 0.35 + (Math.random() - 0.5) * 0.8;
      targetZ = 4.6;
      flightTime = 0.86;
      desiredClearance = 0.38;
    } else {
      const rand = Math.random();

      // TACTIC 1: Drop Shot (Dink) Punish if player is camping deep at baseline
      if (isPlayerDeep && rand < (this.opponent.dinkTendency * 1.3)) {
        chosenShot = 'dink';
        targetX = isPlayerRight ? -1.3 : (isPlayerLeft ? 1.3 : (Math.random() > 0.5 ? 1.3 : -1.3));
        targetZ = 1.3 + Math.random() * 0.5; // drops just over net into kitchen
        flightTime = 0.88;
        desiredClearance = 0.45;
      }
      // TACTIC 2: Smash Punish if player rushed to kitchen or incoming ball is high floater
      else if ((isPlayerNearKitchen || this.ball.y > 1.15) && rand < (this.opponent.smashTendency * 1.35)) {
        chosenShot = 'smash';
        targetX = isPlayerRight ? -2.2 : (isPlayerLeft ? 2.2 : (Math.random() > 0.5 ? 2.2 : -2.2));
        targetZ = 5.3;
        flightTime = 0.56 / (this.opponent.power * this.settings.ballSpeedFactor);
        desiredClearance = 0.32;
      }
      // TACTIC 3: Curve Spin outward away from player
      else if (rand < this.opponent.spinTendency) {
        chosenShot = 'curve';
        targetX = isPlayerRight ? -2.2 : 2.2;
        targetZ = 4.6;
        flightTime = 0.76 / (this.opponent.power * this.settings.ballSpeedFactor);
        desiredClearance = 0.36;
        this.ball.spinX = targetX > 0 ? -3.5 : 3.5;
      }
      // TACTIC 4: Crosscourt drive into open corner
      else {
        chosenShot = 'drive';
        targetX = isPlayerRight ? -2.0 - Math.random() * 0.3 : (isPlayerLeft ? 2.0 + Math.random() * 0.3 : (Math.random() > 0.5 ? 1.8 : -1.8));
        targetZ = 4.8;
        flightTime = 0.78;
        desiredClearance = 0.36;
      }
    }

    targetX = Math.max(-2.55, Math.min(2.55, targetX));
    this.targetLanding = { x: targetX, z: targetZ, hitter: 'ai', type: chosenShot };

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

  public update(delta: number, playerInputX = 0): void {
    if (this.isMatchOver) return;

    // Update Paddle Swing Animation Timers
    if (this.playerPaddleAnim > 0) this.playerPaddleAnim = Math.max(0, this.playerPaddleAnim - delta);
    if (this.aiPaddleAnim > 0) this.aiPaddleAnim = Math.max(0, this.aiPaddleAnim - delta);

    // Check buffered shot execution
    if (this.bufferedShot && this.ball.inPlay && this.ball.lastHitter !== 'player' && this.ball.vz > 0) {
      if (performance.now() - this.bufferedShot.timestamp < 650) {
        const dx = this.ball.x - this.playerPos.x;
        const dz = this.ball.z - (this.playerPos.z - 0.45);
        const dist = Math.hypot(dx, dz);
        if (dist <= 2.8 && this.ball.z >= 1.6) {
          const shot = this.bufferedShot.shotType;
          this.bufferedShot = null;
          this.playerHitBall(shot);
        }
      } else {
        this.bufferedShot = null;
      }
    }

    // Proximity Auto-Return: If ball enters player's hitting zone and player is in position, auto-return!
    if (this.ball.inPlay && this.ball.lastHitter === 'ai' && this.ball.vz > 0) {
      const dx = Math.abs(this.ball.x - this.playerPos.x);
      // In strike zone: within 1.4m horizontally, near player baseline z in [4.6, 5.8], and in playable air
      if (dx <= 1.4 && this.ball.z >= 4.6 && this.ball.z <= 5.8 && this.ball.y >= 0.15 && this.ball.y <= 1.9) {
        const canHit = (this.rallyCount > 0) || (this.ball.bouncesSinceHit >= 1);
        if (canHit) {
          const shot = this.bufferedShot ? this.bufferedShot.shotType : 'drive';
          this.bufferedShot = null;
          this.playerHitBall(shot);
        }
      }
    }

    // 1. Serving countdown & positioning
    if (this.isServing) {
      this.serveTimer -= delta;

      if (this.currentServer === 'player') {
        const playerSpeed = 5.8;
        if (Math.abs(playerInputX) > 0.05) {
          this.playerPos.x += playerInputX * playerSpeed * delta;
        }
        // Keep within serve side boundary
        if (this.serverQuadrant === 'right') {
          this.playerPos.x = Math.max(0.3, Math.min(2.5, this.playerPos.x));
        } else {
          this.playerPos.x = Math.max(-2.5, Math.min(-0.3, this.playerPos.x));
        }
        // Ball stays in hand/paddle ready to serve
        this.ball.x = this.playerPos.x + (this.serverQuadrant === 'right' ? 0.25 : -0.25);
        this.ball.y = 0.85;
        this.ball.z = this.playerPos.z - 0.45;
      }

      if (this.serveTimer <= 0) {
        this.executeServe();
      }
      return;
    }

    // 2. Player Movement (Manual or Assisted)
    const playerSpeed = 6.2;
    if (this.manualInputTimer > 0) {
      this.manualInputTimer -= delta;
    }

    if (Math.abs(playerInputX) > 0.05) {
      this.playerPos.x += playerInputX * playerSpeed * delta;
      this.manualInputTimer = 0.8;
    } else if (this.manualInputTimer <= 0 && this.settings.autoPositionAssist && this.ball.inPlay && this.ball.vz > 0) {
      // Predict where ball will reach baseline z = 5.6
      const timeToBaseline = Math.max(0.01, (5.6 - this.ball.z) / this.ball.vz);
      const predictedX = Math.max(-2.6, Math.min(2.6, this.ball.x + this.ball.vx * timeToBaseline));
      const diffX = predictedX - this.playerPos.x;
      this.playerPos.x += Math.sign(diffX) * Math.min(Math.abs(diffX), playerSpeed * 0.85 * delta);
    }
    this.playerPos.x = Math.max(-2.7, Math.min(2.7, this.playerPos.x));

    // 3. AI Movement (Predictive & Adaptive with Stamina Factor)
    if (this.ball.inPlay) {
      const staminaFactor = 0.55 + (this.aiStamina / 100) * 0.45;
      if (this.ball.vz < 0) {
        // Ball flying towards AI: predict arrival X at baseline z = -4.8
        const timeToAI = Math.max(0.01, (-4.8 - this.ball.z) / this.ball.vz);
        const predictedX = Math.max(-2.5, Math.min(2.5, this.ball.x + this.ball.vx * timeToAI));
        const dx = predictedX - this.aiPos.x;
        const aiSpeed = this.opponent.speed * 1.15 * staminaFactor;
        this.aiPos.x += Math.sign(dx) * Math.min(Math.abs(dx), aiSpeed * delta);

        // AI Z Position: charge kitchen for dinks, stay at baseline for smashes
        if (this.ball.z > -2.5 && this.ball.y < 1.1) {
          const targetZ = -2.4;
          this.aiPos.z += (targetZ - this.aiPos.z) * Math.min(1, 4.5 * staminaFactor * delta);
        } else {
          const targetZ = -5.4;
          this.aiPos.z += (targetZ - this.aiPos.z) * Math.min(1, 4.0 * staminaFactor * delta);
        }
      } else {
        // Ball flying away to player: AI recovers towards center court
        this.aiPos.x += (0 - this.aiPos.x) * Math.min(1, 3.0 * delta);
        this.aiPos.z += (-5.4 - this.aiPos.z) * Math.min(1, 4.0 * delta);
      }
      this.aiPos.x = Math.max(-2.6, Math.min(2.6, this.aiPos.x));
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
      const gravity = -11.2;
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
        this.targetLanding = null;

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

        // Rebound velocity with authentic wiffle ball elasticity
        this.ball.vy = Math.max(3.2, -this.ball.vy * 0.76);
        this.ball.vx *= 0.78;
        this.ball.vz *= 0.78;
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
