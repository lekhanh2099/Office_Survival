export interface JoystickVector {
  x: number; // -1 to 1
  y: number; // -1 to 1
  active: boolean;
}

/**
 * Lightweight Keyboard & Input Controller (WASD, Arrow keys, Spacebar)
 * On-screen visual buttons are removed for an unobstructed, modern tap-to-move 3D gameplay experience.
 */
export class VirtualJoystick {
  private keys: Record<string, boolean> = {};
  private onActionCallback: (() => void) | null = null;
  private onKeyDown: (e: KeyboardEvent) => void;
  private onKeyUp: (e: KeyboardEvent) => void;

  constructor(_container: HTMLElement, onAction?: () => void) {
    this.onActionCallback = onAction || null;

    this.onKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      this.keys[e.code] = true;
      if (e.code === 'Space' || e.code === 'KeyE') {
        e.preventDefault();
        this.onActionCallback?.();
      }
    };

    this.onKeyUp = (e: KeyboardEvent) => {
      this.keys[e.code] = false;
    };

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  getVector(): JoystickVector {
    let kx = 0;
    let ky = 0;

    if (this.keys['KeyA'] || this.keys['ArrowLeft']) kx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) kx += 1;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) ky -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) ky += 1;

    if (kx !== 0 || ky !== 0) {
      const len = Math.hypot(kx, ky);
      return {
        x: kx / len,
        y: ky / len,
        active: true
      };
    }

    return { x: 0, y: 0, active: false };
  }

  setVisible(_visible: boolean): void {
    // Visual buttons removed; no-op
  }

  updateActionState(_prompt: string | null): void {
    // Visual action button removed; no-op
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
