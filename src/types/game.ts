export type CardType = 'base' | 'callback' | 'crisis' | 'rare' | 'finale';

export interface StatDelta {
  e?: number; // Energy
  b?: number; // Backlog
  r?: number; // Reputation
}

export interface QueuedCard {
  id: string;
  delay: number;
}

export interface RollOutcome {
  chance: number;
  win: {
    d?: StatDelta;
    message: string;
    queue?: QueuedCard[];
  };
  lose: {
    d?: StatDelta;
    message: string;
    queue?: QueuedCard[];
  };
}

export interface Choice {
  label: string;
  hint: string;
  d?: StatDelta;
  message: string;
  flag?: string;
  queue?: QueuedCard[];
  roll?: RollOutcome;
}

export interface Card {
  id: string;
  type: CardType;
  who: string;
  emoji: string;
  title: string;
  body: string;
  choices: Choice[];
}

export interface Perk {
  id: string;
  name: string;
  emoji: string;
  desc: string;
}

export interface Modifier {
  id: string;
  name: string;
  desc: string;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

export interface HighScoreRecord {
  score: number;
  day: number;
  total: number;
  triggerCount: number;
  title: string;
  date: string;
}

export interface HistoryItem {
  day: number;
  time: string;
  card: string;
  choice: string;
}

export interface LastResult {
  title: string;
  choice: string;
  message: string;
  delta: { name: string; label: string; good: boolean }[];
  queued: string[];
  failureNotes: string[];
  callback?: boolean;
  bonus?: number;
}

export interface DayEndSummary {
  day: number;
  notes: string[];
  delta: { name: string; label: string; good: boolean }[];
  daysurvived: boolean;
  scoreGained: number;
  callbackCount: number;
}

export type GameStage = 'welcome' | 'play' | 'result' | 'day' | 'over';

export interface GameState {
  version: number;
  stage: GameStage;
  seed: number;
  day: number;
  turn: number;
  total: number;
  lives: number;
  e: number;
  b: number;
  r: number;
  score: number;
  cleanBonus: number;
  flag: Record<string, boolean>;
  pending: { id: string; due: number }[];
  seen: Record<string, number>;
  last: string[];
  current: string | null;
  lastResult: LastResult | null;
  dailyStart: { lives: number; e: number; b: number; r: number; score: number };
  modifier: string;
  dayEnd: DayEndSummary | null;
  history: HistoryItem[];
  maxDay: number;
  triggerCount: number;
  perks: string[];
  deathReason: string;
  lastTurnLostLife?: boolean;
}
