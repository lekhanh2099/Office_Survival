export class RNG {
  private seed: number;

  constructor(seed?: number) {
    this.seed = (seed !== undefined && seed !== 0) ? (seed >>> 0) : ((Date.now() >>> 0) || 123456789);
    if (this.seed === 0) this.seed = 123456789;
  }

  getSeed(): number {
    return this.seed;
  }

  setSeed(seed: number): void {
    this.seed = (seed >>> 0) || 123456789;
  }

  // Deterministic xorshift32 PRNG
  next(): number {
    if (!this.seed || this.seed === 0) {
      this.seed = (Date.now() >>> 0) || 123456789;
    }
    let x = this.seed | 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.seed = x >>> 0;
    if (this.seed === 0) this.seed = 123456789;
    return this.seed / 4294967296;
  }

  pick<T>(items: T[]): T {
    return items[Math.floor(this.next() * items.length)];
  }
}
