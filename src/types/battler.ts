export type BattlerCardRarity = 'common' | 'rare' | 'legendary';
export type BattlerCardType = 'work' | 'defend' | 'buff' | 'troll';

export interface BattlerCard {
  id: string;
  name: string;
  type: BattlerCardType;
  cost: number;
  rarity: BattlerCardRarity;
  gif: string;
  fallbackEmoji: string;
  desc: string;
  progress?: number;       // Deals work progress to crisis
  energyDelta?: number;    // Heals or costs extra energy
  backlogDelta?: number;   // Clears backlog
  repDelta?: number;       // Changes reputation
  blockThreat?: boolean;   // Negates crisis penalty for this turn
  drawCards?: number;      // Draws extra cards from draw pile
  reduceTarget?: number;   // Lowers target progress required
  rewardScore?: number;    // Extra score gained
  instantClear?: boolean;  // Instantly clears crisis
}

export interface CrisisEncounter {
  id: string;
  sender: string;
  title: string;
  body: string;
  gif: string;
  fallbackEmoji: string;
  targetProgress: number;
  threat: {
    energy?: number;
    backlog?: number;
    rep?: number;
    desc: string;
  };
  rewardScore: number;
}

export interface BattlerState {
  stage: 'battle' | 'reward' | 'day_clear' | 'game_over';
  day: number;
  encounterIndex: number; // 0 to 5 per day
  lives: number;
  energy: number;
  maxEnergy: number;
  backlog: number;
  rep: number;
  score: number;
  deck: BattlerCard[];
  drawPile: BattlerCard[];
  hand: BattlerCard[];
  discardPile: BattlerCard[];
  currentCrisis: CrisisEncounter;
  crisisProgress: number;
  threatBlocked: boolean;
  rewardChoices: BattlerCard[];
  lastTurnNotes: string[];
  deathReason?: string;
}
