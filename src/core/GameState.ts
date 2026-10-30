import { GameState, HighScoreRecord } from '../types/game';
import { ALL_ACHS } from '../data/achievements';
import { CARDS } from '../data/cards';
import { showToast } from '../ui/Toast';
import { sounds } from '../audio/SoundManager';

export const STORAGE_KEYS = {
  STATE: 'office-survival-v03',
  DISCOVERED: 'office-survival-discovered',
  ACHS: 'office-survival-achs',
  SCORES: 'office-survival-highscores'
} as const;

export function getDiscoveredCards(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DISCOVERED) || '[]') || [];
  } catch {
    return [];
  }
}

export function markCardDiscovered(cardId: string): void {
  if (!cardId) return;
  const list = getDiscoveredCards();
  if (!list.includes(cardId)) {
    list.push(cardId);
    try {
      localStorage.setItem(STORAGE_KEYS.DISCOVERED, JSON.stringify(list));
    } catch {}
    if (list.length >= 30) {
      unlockAchievement('scholar');
    }
  }
}

export function getUnlockedAchievements(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACHS) || '[]') || [];
  } catch {
    return [];
  }
}

export function unlockAchievement(id: string): void {
  const list = getUnlockedAchievements();
  if (!list.includes(id)) {
    list.push(id);
    try {
      localStorage.setItem(STORAGE_KEYS.ACHS, JSON.stringify(list));
    } catch {}
    const ach = ALL_ACHS.find(a => a.id === id);
    if (ach) {
      showToast(`🏆 Mở khoá danh hiệu: ${ach.name}!`);
      sounds.success();
    }
  }
}

export function getHighScores(): HighScoreRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SCORES) || '[]') || [];
  } catch {
    return [];
  }
}

export function saveHighScoreRecord(score: number, day: number, total: number, triggerCount: number, title: string): void {
  if (score <= 0) return;
  const list = getHighScores();
  const item: HighScoreRecord = {
    score,
    day,
    total,
    triggerCount,
    title,
    date: new Date().toLocaleDateString('vi-VN')
  };
  list.push(item);
  list.sort((a, b) => b.score - a.score || b.day - a.day);
  const top5 = list.slice(0, 5);
  try {
    localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(top5));
  } catch {}
}

export function createInitialState(seed?: number): GameState {
  const initSeed = seed !== undefined ? seed : ((Date.now() >>> 0) || 1);
  return {
    version: 3,
    stage: 'play',
    seed: initSeed,
    day: 1,
    turn: 0,
    total: 0,
    lives: 3,
    e: 8,
    b: 2,
    r: 3,
    score: 0,
    cleanBonus: 0,
    flag: {},
    pending: [],
    seen: {},
    last: [],
    current: null,
    lastResult: null,
    dailyStart: { lives: 3, e: 8, b: 2, r: 3, score: 0 },
    modifier: 'normal',
    dayEnd: null,
    history: [],
    maxDay: 0,
    triggerCount: 0,
    perks: [],
    deathReason: ''
  };
}

export function saveGameState(state: GameState | null): void {
  if (!state) return;
  try {
    localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(state));
  } catch {}
}

export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATE);
    if (!raw) return null;
    const data = JSON.parse(raw) as GameState;
    if (!data || data.version !== 3 || !['play', 'result', 'day', 'over'].includes(data.stage)) return null;
    if (!Number.isFinite(data.seed) || !Number.isFinite(data.day)) return null;
    if (data.stage === 'play' && (!data.current || !CARDS[data.current])) return null;
    if (!Array.isArray(data.perks)) data.perks = [];
    return data;
  } catch {
    return null;
  }
}
