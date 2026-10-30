import { Card, GameState, QueuedCard, StatDelta } from '../types/game';
import { CARDS, FINALE_CARD_IDS, RARE_CARD_IDS, REGULAR_CARD_IDS } from '../data/cards';
import { ALL_PERKS } from '../data/perks';
import { MODIFIERS } from '../data/modifiers';
import { RNG } from './RNG';
import { createInitialState, markCardDiscovered, saveGameState, saveHighScoreRecord, unlockAchievement } from './GameState';
import { sounds } from '../audio/SoundManager';
import { showToast } from '../ui/Toast';

export const TIMES = ['09:00', '09:45', '10:30', '11:30', '13:30', '15:00', '16:30', '17:59'];

export class GameEngine {
  private state: GameState;
  private rng: RNG;
  private onStateChange: (state: GameState) => void;

  constructor(initial?: GameState, onStateChange: (state: GameState) => void = () => {}) {
    this.state = initial || createInitialState();
    this.rng = new RNG(this.state.seed);
    this.onStateChange = onStateChange;
  }

  getState(): GameState {
    return this.state;
  }

  setState(newState: GameState): void {
    this.state = newState;
    this.rng.setSeed(this.state.seed);
    this.sync();
  }

  hasPerk(perkId: string): boolean {
    return Array.isArray(this.state.perks) && this.state.perks.includes(perkId);
  }

  private sync(): void {
    this.state.seed = this.rng.getSeed();
    saveGameState(this.state);
    this.onStateChange(this.state);
  }

  newRun(): void {
    this.state = createInitialState();
    this.rng.setSeed(this.state.seed);
    this.prepare();
  }

  private weighted(ids: string[]): string {
    const recent = this.state.last.slice(-Math.min(3, Math.max(1, ids.length - 1)));
    let list = ids.filter(id => !recent.includes(id));
    if (!list.length) list = ids;
    const weights = list.map(id => Math.max(1, 8 - Math.min(7, (this.state.seen[id] || 0) * 3)));
    const sum = weights.reduce((a, b) => a + b, 0);
    let n = this.rng.next() * sum;
    for (let i = 0; i < list.length; i++) {
      n -= weights[i];
      if (n <= 0) return list[i];
    }
    return list[list.length - 1];
  }

  chooseCard(): string {
    // Turn 7 is the 8th and final card of the day (17:59)
    if (this.state.turn === 7) {
      if (this.state.flag.printerBoss && this.state.day > 1 && this.state.total % 3 === 1) {
        return 'end_printer';
      }
      const a = FINALE_CARD_IDS.filter(x => x !== 'end_printer');
      return this.weighted(a);
    }
    if (this.state.turn === 0 && this.state.day === 1) {
      return 'urgent';
    }
    const due = this.state.pending.filter(x => x.due <= this.state.total && CARDS[x.id]);
    if (due.length) {
      due.sort((a, b) => a.due - b.due);
      const selected = due[0];
      this.state.pending.splice(this.state.pending.indexOf(selected), 1);
      return selected.id;
    }
    if ((this.state.e <= 2 || this.state.b >= 6 || this.state.r <= 1) && this.rng.next() < 0.54) {
      if (this.state.e <= 2) return 'energy_crisis';
      if (this.state.b >= 6) return 'backlog_crisis';
      return 'rep_crisis';
    }
    const rareChance = this.state.modifier === 'wifi' ? 0.26 : 0.11;
    if (this.state.day >= 2 && this.rng.next() < rareChance) {
      return this.weighted(RARE_CARD_IDS);
    }
    return this.weighted(REGULAR_CARD_IDS);
  }

  prepare(): void {
    this.state.current = this.chooseCard();
    markCardDiscovered(this.state.current);
    this.state.seen[this.state.current] = (this.state.seen[this.state.current] || 0) + 1;
    this.state.last.push(this.state.current);
    if (this.state.last.length > 12) this.state.last.shift();

    // Stress ball perk effect
    if (CARDS[this.state.current]?.type === 'crisis' && this.hasPerk('stress_ball')) {
      this.state.e = Math.min(10, this.state.e + 1);
    }

    this.state.stage = 'play';
    sounds.card();
    this.sync();
  }

  private maybeQueue(items?: QueuedCard[]): void {
    (items || []).forEach(x => {
      if (CARDS[x.id] && !this.state.pending.some(p => p.id === x.id)) {
        this.state.pending.push({ id: x.id, due: this.state.total + x.delay });
      }
    });
  }

  private applyDelta(d: StatDelta, cardObj: Card): StatDelta {
    const x: StatDelta = { ...d };
    if (this.state.modifier === 'nocoffee' && (x.e ?? 0) > 0) {
      x.e = Math.max(0, (x.e ?? 0) - 1);
    }
    if (this.state.modifier === 'kpi' && (x.b ?? 0) > 0) {
      x.b = (x.b ?? 0) + 1;
    }
    // Headphones perk reduces energy drain in meetings
    if (this.hasPerk('headphones') && (x.e ?? 0) < 0 && (cardObj.id.includes('meeting') || cardObj.title.toLowerCase().includes('họp'))) {
      x.e = Math.min(0, (x.e ?? 0) + 1);
    }
    // Cactus perk prevents reputation from falling below 1
    if (this.hasPerk('cactus') && (x.r ?? 0) < 0 && (this.state.r + (x.r ?? 0)) < 1) {
      x.r = Math.max(x.r ?? 0, 1 - this.state.r);
    }

    this.state.e = Math.min(10, this.state.e + (x.e || 0));
    this.state.b = Math.max(0, this.state.b + (x.b || 0));
    this.state.r = Math.min(5, Math.max(0, this.state.r + (x.r || 0)));
    return x;
  }

  private statChange(before: { e: number; b: number; r: number; lives: number }, after: { e: number; b: number; r: number; lives: number }) {
    const ret: { name: string; label: string; good: boolean }[] = [];
    const iconFor: Record<string, string> = { e: '⚡', b: '📋', r: '⭐' };
    const labelFor: Record<string, string> = { e: 'Năng lượng', b: 'Việc tồn', r: 'Uy tín' };

    for (const k of ['e', 'b', 'r'] as const) {
      const diff = after[k] - before[k];
      if (diff) {
        ret.push({
          name: labelFor[k],
          label: `${iconFor[k]} ${diff > 0 ? '+' : ''}${diff}`,
          good: k === 'b' ? diff < 0 : diff > 0
        });
      }
    }
    const dl = after.lives - before.lives;
    if (dl) {
      ret.push({ name: 'Mạng', label: `❤️ ${dl}`, good: dl > 0 });
    }
    return ret;
  }

  titleEnd(): string {
    if (this.state.day >= 12) return 'HUYỀN THOẠI TĂNG CA';
    if (this.state.day >= 7) return 'BẤT TỬ VĂN PHÒNG';
    if (this.state.day >= 4) return 'CỪU CHIẾN CÔNG SỞ';
    if (this.state.day >= 2) return 'NHÂN VIÊN TIỀM NĂNG';
    return 'THỰC TẬP SINH CỦA ĐỊNH MỆNH';
  }

  doChoice(index: number): void {
    if (this.state.stage !== 'play' || !this.state.current) return;
    const cardObj = CARDS[this.state.current];
    if (!cardObj) return;
    const choice = cardObj.choices[index];
    if (!choice) return;

    if (navigator.vibrate) navigator.vibrate(35);
    sounds.click();

    const before = { e: this.state.e, b: this.state.b, r: this.state.r, lives: this.state.lives };
    const allMessages: string[] = [choice.message];
    const queued: string[] = [];
    const failureNotes: string[] = [];

    this.state.total++;
    this.state.turn++;
    this.state.score += 10;

    if (choice.flag) this.state.flag[choice.flag] = true;
    this.applyDelta(choice.d || {}, cardObj);
    this.maybeQueue(choice.queue);
    if (choice.queue?.length) queued.push('Quyết định này có thể quay lại vào một lượt sau.');

    if (choice.roll) {
      const bonus = this.hasPerk('power_strip') ? 0.15 : 0;
      const chance = Math.min(0.95, choice.roll.chance + bonus);
      const win = this.rng.next() < chance;
      const part = win ? choice.roll.win : choice.roll.lose;
      allMessages.push((win ? '✨ THÀNH CÔNG: ' : '💥 XUI RỦI: ') + part.message);
      this.applyDelta(part.d || {}, cardObj);
      this.maybeQueue(part.queue);
      if (part.queue?.length) queued.push('Một hậu quả mới đã được ghi vào lịch.');
      if (win) {
        unlockAchievement('gambler');
        sounds.success();
      } else {
        sounds.fail();
      }
    }

    if (cardObj.type === 'callback') {
      this.state.score += 15;
      this.state.triggerCount++;
    }

    // Backlog reduction rewards
    const backlogBeforeSafety = this.state.b;
    const cleared = Math.max(0, before.b - backlogBeforeSafety);
    let reward = Math.min(20 - this.state.cleanBonus, cleared * 5);
    if (this.hasPerk('boba_card') && cleared > 0) reward += 5;
    if (reward > 0) {
      this.state.score += reward;
      this.state.cleanBonus += reward;
    }
    if (this.state.modifier === 'bonus' && cleared > 0 && !this.state.flag['bonus_' + this.state.day]) {
      this.state.score += 5;
      this.state.flag['bonus_' + this.state.day] = true;
    }

    // Achievements check
    if (this.state.r >= 5) unlockAchievement('max_rep');
    if (this.state.b === 0) unlockAchievement('clean_sheet');
    if (this.state.score >= 500) unlockAchievement('score500');

    // Crisis / Failure conditions
    const failures: string[] = [];
    if (this.state.e <= 0) {
      if (this.hasPerk('sunglasses')) {
        this.state.perks = this.state.perks.filter(p => p !== 'sunglasses');
        this.state.e = 3;
        failureNotes.push('🕶️ Kính râm ngủ gật phát huy tác dụng! Sếp tưởng bạn đang suy tư sâu sắc. Thoát kiệt sức!');
      } else {
        failures.push('Kiệt sức');
        this.state.e = 3;
        unlockAchievement('crisis_champ');
      }
    }
    if (this.state.b >= 8) {
      if (this.hasPerk('leave_form')) {
        this.state.perks = this.state.perks.filter(p => p !== 'leave_form');
        this.state.b = Math.max(0, this.state.b - 3);
        failureNotes.push('📑 Mẫu đơn nghỉ phép tự động kích hoạt! Tránh được khủng hoảng quá tải.');
      } else {
        failures.push('Backlog vượt ngưỡng');
        this.state.b = 5;
        unlockAchievement('crisis_champ');
      }
    }

    this.state.lastTurnLostLife = failures.length > 0;
    if (failures.length) {
      this.state.lives--;
      sounds.damage();
      if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
      failureNotes.push('🚨 ' + failures.join(' + ') + ': mất 1 mạng. Hệ thống đã hỗ trợ phục hồi tạm thời.');
    }

    if (this.state.r === 0) {
      queued.push('Uy tín đã chạm 0. Nếu không hồi phục trước cuối ngày, bạn sẽ mất 1 mạng.');
    }

    const delta = this.statChange(before, { e: this.state.e, b: this.state.b, r: this.state.r, lives: this.state.lives });
    const fullMessage = allMessages.join('\n\n');

    this.state.history.unshift({
      day: this.state.day,
      time: TIMES[Math.max(0, this.state.turn - 1)],
      card: cardObj.title,
      choice: choice.label
    });
    this.state.history = this.state.history.slice(0, 15);

    if (this.state.lives <= 0) {
      this.state.stage = 'over';
      this.state.maxDay = this.state.day;
      this.state.deathReason = failures.join(' + ') || 'Hết mạng làm việc';
      this.state.lastResult = {
        title: cardObj.title,
        choice: choice.label,
        message: fullMessage,
        delta,
        queued,
        failureNotes
      };
      saveHighScoreRecord(this.state.score, this.state.day, this.state.total, this.state.triggerCount, this.titleEnd());
      sounds.over();
      this.sync();
      return;
    }

    this.state.lastResult = {
      title: cardObj.title,
      choice: choice.label,
      message: fullMessage,
      delta,
      queued,
      failureNotes,
      callback: cardObj.type === 'callback',
      bonus: reward
    };
    this.state.stage = 'result';
    this.sync();
  }

  proceed(): void {
    if (this.state.stage !== 'result') return;
    sounds.click();
    if (this.state.turn >= 8) {
      this.finishDay();
    } else {
      this.prepare();
    }
  }

  finishDay(): void {
    const before = { e: this.state.e, b: this.state.b, r: this.state.r, lives: this.state.lives };
    const notes: string[] = [];

    if (this.state.b >= 6) {
      this.state.r = Math.max(0, this.state.r - 1);
      notes.push('Backlog cao (≥6): uy tín −1.');
    }
    if (this.state.r <= 0) {
      if (!this.state.lastTurnLostLife) {
        this.state.lives--;
        notes.push('Uy tín về 0 lúc tổng kết: mất 1 mạng.');
      } else {
        notes.push('Uy tín về 0, nhưng lượt cuối đã mất mạng nên không trừ mạng lần thứ hai.');
      }
      this.state.r = 2;
    }
    this.state.maxDay = this.state.day;

    if (this.state.lives > 0) {
      this.state.score += 40;
      notes.push('Hoàn thành ngày làm việc: +40 điểm.');
      if (this.state.day >= 3) unlockAchievement('day3');
      if (this.state.day >= 7) unlockAchievement('day7');
      if (this.state.day >= 10) unlockAchievement('day10');
    }

    const breakdown = this.statChange(before, { e: this.state.e, b: this.state.b, r: this.state.r, lives: this.state.lives });
    this.state.dayEnd = {
      day: this.state.day,
      notes,
      delta: breakdown,
      daysurvived: this.state.lives > 0,
      scoreGained: this.state.score - this.state.dailyStart.score,
      callbackCount: this.state.triggerCount
    };

    if (this.state.lives <= 0) {
      this.state.stage = 'over';
      this.state.deathReason = 'Mất hết uy tín lúc tổng kết ngày';
      saveHighScoreRecord(this.state.score, this.state.day, this.state.total, this.state.triggerCount, this.titleEnd());
      sounds.over();
      this.sync();
      return;
    }

    this.state.stage = 'day';
    sounds.dayClear();
    this.sync();
  }

  pickPerk(perkId: string): void {
    if (!Array.isArray(this.state.perks)) this.state.perks = [];
    if (!this.state.perks.includes(perkId)) {
      this.state.perks.push(perkId);
      if (this.state.perks.length >= 3) unlockAchievement('perk_buff');
      const p = ALL_PERKS.find(x => x.id === perkId);
      showToast(`Đã nhận phúc lợi: ${p?.emoji || '🎁'} ${p?.name || perkId}`);
      sounds.perk();
    }
    this.nextDay();
  }

  nextDay(): void {
    if (this.state.stage !== 'day') return;
    sounds.click();
    this.state.day++;
    this.state.turn = 0;
    this.state.lastTurnLostLife = false;
    this.state.cleanBonus = 0;
    const energyRecover = this.hasPerk('thermos') ? 5 : 4;
    this.state.e = Math.min(10, this.state.e + energyRecover);
    this.state.modifier = this.state.day <= 2 ? 'normal' : this.rng.pick(MODIFIERS).id;
    this.state.dailyStart = { lives: this.state.lives, e: this.state.e, b: this.state.b, r: this.state.r, score: this.state.score };
    this.prepare();
  }
}
