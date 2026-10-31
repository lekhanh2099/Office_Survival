const KEY_MUTED = 'office-survival-muted';

export class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean;

  constructor() {
    try {
      this.muted = localStorage.getItem(KEY_MUTED) === '1';
    } catch {
      this.muted = false;
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private tone(freq: number, type: OscillatorType, dur: number, gStart: number, gEnd = 0.001, delay = 0) {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(gStart, t);
      gain.gain.exponentialRampToValueAtTime(gEnd, t + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
    } catch (_) {}
  }

  isMuted(): boolean {
    return this.muted;
  }

  toggle(): boolean {
    this.muted = !this.muted;
    try {
      localStorage.setItem(KEY_MUTED, this.muted ? '1' : '0');
    } catch {}
    return this.muted;
  }

  click(): void {
    this.tone(750, 'sine', 0.04, 0.12, 0.01);
  }

  card(): void {
    this.tone(320, 'triangle', 0.06, 0.1, 0.01);
    this.tone(480, 'triangle', 0.07, 0.09, 0.01, 0.03);
  }

  success(): void {
    this.tone(523.25, 'sine', 0.09, 0.14, 0.01, 0);
    this.tone(659.25, 'sine', 0.09, 0.14, 0.01, 0.06);
    this.tone(783.99, 'sine', 0.18, 0.16, 0.01, 0.12);
  }

  fail(): void {
    this.tone(240, 'sawtooth', 0.1, 0.14, 0.01, 0);
    this.tone(160, 'sawtooth', 0.2, 0.16, 0.01, 0.07);
  }

  damage(): void {
    this.tone(140, 'square', 0.16, 0.22, 0.01, 0);
    this.tone(80, 'sawtooth', 0.24, 0.24, 0.01, 0.05);
  }

  dayClear(): void {
    this.tone(392, 'sine', 0.1, 0.15, 0.01, 0);
    this.tone(523.25, 'sine', 0.1, 0.15, 0.01, 0.08);
    this.tone(659.25, 'sine', 0.12, 0.18, 0.01, 0.16);
    this.tone(783.99, 'triangle', 0.32, 0.22, 0.01, 0.25);
  }

  over(): void {
    this.tone(329.63, 'sawtooth', 0.18, 0.16, 0.01, 0);
    this.tone(293.66, 'sawtooth', 0.22, 0.16, 0.01, 0.14);
    this.tone(246.94, 'sawtooth', 0.4, 0.18, 0.01, 0.29);
  }

  perk(): void {
    this.tone(440, 'triangle', 0.09, 0.15, 0.01, 0);
    this.tone(554.37, 'triangle', 0.1, 0.16, 0.01, 0.07);
    this.tone(659.25, 'sine', 0.22, 0.18, 0.01, 0.14);
  }

  pickleballPaddleHit(isSmash = false): void {
    if (isSmash) {
      this.tone(480, 'sine', 0.06, 0.35, 0.01);
      this.tone(200, 'triangle', 0.08, 0.28, 0.01, 0.02);
      this.tone(110, 'square', 0.1, 0.22, 0.01, 0.03);
    } else {
      this.tone(360, 'sine', 0.05, 0.28, 0.01);
      this.tone(220, 'triangle', 0.07, 0.2, 0.01, 0.02);
    }
  }

  pickleballBounce(): void {
    this.tone(260, 'sine', 0.04, 0.16, 0.01);
  }
}

export const sounds = new SoundManager();
