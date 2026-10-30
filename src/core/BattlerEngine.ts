import { BattlerCard, BattlerState } from '../types/battler';
import { ALL_BATTLER_CARDS, STARTER_DECK_IDS } from '../data/memeCards';
import { ALL_CRISES } from '../data/memeCrises';
import { sounds } from '../audio/SoundManager';
import { showToast } from '../ui/Toast';

export class BattlerEngine {
  private state: BattlerState;
  private onStateChange: (state: BattlerState) => void;

  constructor(onStateChange: (state: BattlerState) => void = () => {}) {
    this.onStateChange = onStateChange;
    this.state = this.initInitialState();
  }

  private initInitialState(): BattlerState {
    const starterDeck = STARTER_DECK_IDS.map(id => {
      const c = ALL_BATTLER_CARDS.find(card => card.id === id);
      return c ? { ...c } : { ...ALL_BATTLER_CARDS[0] };
    });

    const shuffledDeck = this.shuffle([...starterDeck]);
    const firstCrisis = { ...ALL_CRISES[0] };

    const s: BattlerState = {
      stage: 'battle',
      day: 1,
      encounterIndex: 0,
      lives: 3,
      energy: 3,
      maxEnergy: 3,
      backlog: 2,
      rep: 3,
      score: 0,
      deck: starterDeck,
      drawPile: shuffledDeck,
      hand: [],
      discardPile: [],
      currentCrisis: firstCrisis,
      crisisProgress: 0,
      threatBlocked: false,
      rewardChoices: [],
      lastTurnNotes: []
    };

    return s;
  }

  getState(): BattlerState {
    return this.state;
  }

  private shuffle<T>(array: T[]): T[] {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  startNewGame(): void {
    sounds.click();
    this.state = this.initInitialState();
    this.drawHand(4);
    this.sync();
  }

  private sync(): void {
    this.onStateChange(this.state);
  }

  drawHand(count = 4): void {
    while (this.state.hand.length < count) {
      if (this.state.drawPile.length === 0) {
        if (this.state.discardPile.length === 0) break;
        this.state.drawPile = this.shuffle([...this.state.discardPile]);
        this.state.discardPile = [];
      }
      const card = this.state.drawPile.pop();
      if (card) this.state.hand.push(card);
    }
  }

  playCard(handIndex: number): boolean {
    const card = this.state.hand[handIndex];
    if (!card) return false;

    if (this.state.energy < card.cost) {
      sounds.fail();
      showToast('⚡ Không đủ Năng Lượng để chơi lá bài này!');
      return false;
    }

    // Spend energy
    this.state.energy -= card.cost;
    this.state.hand.splice(handIndex, 1);
    this.state.discardPile.push(card);

    sounds.card();

    // Apply effects
    if (card.progress) {
      this.state.crisisProgress += card.progress;
    }
    if (card.reduceTarget) {
      this.state.currentCrisis.targetProgress = Math.max(1, this.state.currentCrisis.targetProgress - card.reduceTarget);
    }
    if (card.energyDelta) {
      this.state.energy = Math.min(10, this.state.energy + card.energyDelta);
    }
    if (card.backlogDelta) {
      this.state.backlog = Math.max(0, this.state.backlog + card.backlogDelta);
    }
    if (card.repDelta) {
      this.state.rep = Math.max(0, Math.min(5, this.state.rep + card.repDelta));
    }
    if (card.blockThreat) {
      this.state.threatBlocked = true;
      showToast('🛡️ Đã chặn toàn bộ hậu quả lượt này!');
    }
    if (card.rewardScore) {
      this.state.score += card.rewardScore;
    }
    if (card.drawCards) {
      this.drawHand(this.state.hand.length + card.drawCards);
    }
    if (card.instantClear) {
      this.state.crisisProgress = this.state.currentCrisis.targetProgress;
    }

    // Check crisis completion
    if (this.state.crisisProgress >= this.state.currentCrisis.targetProgress) {
      this.onCrisisCleared();
      return true;
    }

    this.sync();
    return true;
  }

  private onCrisisCleared(): void {
    sounds.success();
    this.state.score += this.state.currentCrisis.rewardScore;

    // Pick 3 random cards for drafting
    const available = ALL_BATTLER_CARDS;
    const shuffled = this.shuffle([...available]);
    this.state.rewardChoices = shuffled.slice(0, 3);
    this.state.stage = 'reward';
    this.sync();
  }

  pickRewardCard(card: BattlerCard): void {
    sounds.perk();
    this.state.deck.push({ ...card });
    showToast(`🎁 Đã thêm thẻ "${card.name}" vào bộ bài!`);
    this.nextEncounter();
  }

  skipReward(): void {
    sounds.click();
    this.nextEncounter();
  }

  private nextEncounter(): void {
    this.state.encounterIndex++;

    if (this.state.encounterIndex >= 4) {
      // Day Complete!
      sounds.dayClear();
      this.state.stage = 'day_clear';
      this.state.score += 50;
      this.sync();
      return;
    }

    // Next crisis
    const nextCrisisIndex = (this.state.day * 3 + this.state.encounterIndex) % ALL_CRISES.length;
    this.state.currentCrisis = { ...ALL_CRISES[nextCrisisIndex] };
    this.state.crisisProgress = 0;
    this.state.threatBlocked = false;
    this.state.energy = this.state.maxEnergy;

    // Reset hand
    this.state.discardPile.push(...this.state.hand);
    this.state.hand = [];
    this.drawHand(4);

    this.state.stage = 'battle';
    this.sync();
  }

  nextDay(): void {
    sounds.click();
    this.state.day++;
    this.state.encounterIndex = 0;
    this.state.energy = this.state.maxEnergy;
    this.state.currentCrisis = { ...ALL_CRISES[(this.state.day * 2) % ALL_CRISES.length] };
    this.state.crisisProgress = 0;
    this.state.threatBlocked = false;

    // Re-shuffle whole deck into draw pile
    this.state.drawPile = this.shuffle([...this.state.deck]);
    this.state.discardPile = [];
    this.state.hand = [];
    this.drawHand(4);

    this.state.stage = 'battle';
    this.sync();
  }

  endTurn(): void {
    sounds.click();

    // If threat not blocked, suffer penalty
    if (!this.state.threatBlocked) {
      const threat = this.state.currentCrisis.threat;
      if (threat.energy) {
        this.state.energy = Math.max(0, this.state.energy + threat.energy);
      }
      if (threat.backlog) {
        this.state.backlog += threat.backlog;
      }
      if (threat.rep) {
        this.state.rep = Math.max(0, this.state.rep + threat.rep);
      }

      showToast(`💥 Hậu quả: ${threat.desc}`);

      // Check life loss
      if (this.state.energy <= 0) {
        this.state.lives--;
        this.state.energy = 2;
        sounds.damage();
        showToast('💀 Kiệt sức! Mất 1 Mạng.');
      }
      if (this.state.backlog >= 8) {
        this.state.lives--;
        this.state.backlog = 5;
        sounds.damage();
        showToast('💀 Quá tải việc tồn! Mất 1 Mạng.');
      }
      if (this.state.rep <= 0) {
        this.state.lives--;
        this.state.rep = 2;
        sounds.damage();
        showToast('💀 Uy tín chạm đáy! Mất 1 Mạng.');
      }

      if (this.state.lives <= 0) {
        this.state.stage = 'game_over';
        this.state.deathReason = `Ngã gục trước: ${this.state.currentCrisis.title}`;
        sounds.over();
        this.sync();
        return;
      }
    }

    // Reset turn
    this.state.threatBlocked = false;
    this.state.energy = this.state.maxEnergy;

    // Discard hand and draw new
    this.state.discardPile.push(...this.state.hand);
    this.state.hand = [];
    this.drawHand(4);

    this.sync();
  }
}
