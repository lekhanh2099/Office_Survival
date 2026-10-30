export interface JoystickVector {
  x: number; // -1 to 1 (left to right)
  y: number; // -1 to 1 (up to down)
  active: boolean;
}

export class VirtualJoystick {
  private container: HTMLElement;
  private baseEl!: HTMLElement;
  private thumbEl!: HTMLElement;
  private actionBtn!: HTMLElement;

  private isTouching = false;
  private touchId: number | null = null;
  private startX = 0;
  private startY = 0;
  private currentVector: JoystickVector = { x: 0, y: 0, active: false };

  // Keyboard state
  private keys: Record<string, boolean> = {};
  private onActionCallback: (() => void) | null = null;

  constructor(container: HTMLElement, onAction?: () => void) {
    this.container = container;
    this.onActionCallback = onAction || null;
    this.initDOM();
    this.initEvents();
  }

  private initDOM(): void {
    // Wrapper for touch joystick
    const joyWrapper = document.createElement('div');
    joyWrapper.className = 'virtualJoystickWrapper';
    joyWrapper.innerHTML = `
      <div class="virtualJoyBase" id="joyBase">
        <div class="virtualJoyThumb" id="joyThumb"></div>
      </div>
      <button class="virtualActionBtn" id="joyActionBtn" type="button" aria-label="Tương tác hành động">
        <span class="actionBtnIcon">⚡</span>
        <span class="actionBtnText">LÀM VIỆC</span>
      </button>
    `;
    this.container.appendChild(joyWrapper);

    this.baseEl = joyWrapper.querySelector('#joyBase') as HTMLElement;
    this.thumbEl = joyWrapper.querySelector('#joyThumb') as HTMLElement;
    this.actionBtn = joyWrapper.querySelector('#joyActionBtn') as HTMLElement;
  }

  private initEvents(): void {
    // 1. Touch Joystick Events
    const maxRadius = 45;

    const onTouchStart = (e: TouchEvent) => {
      if (this.isTouching) return;
      const touch = e.changedTouches[0];
      // Only trigger if touch on left 60% of screen and not on action button
      if (touch.clientX > window.innerWidth * 0.65) return;

      this.isTouching = true;
      this.touchId = touch.identifier;
      this.startX = touch.clientX;
      this.startY = touch.clientY;

      this.baseEl.style.display = 'block';
      this.baseEl.style.left = `${this.startX}px`;
      this.baseEl.style.top = `${this.startY}px`;
      this.thumbEl.style.transform = 'translate(-50%, -50%)';

      this.currentVector = { x: 0, y: 0, active: true };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!this.isTouching) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === this.touchId) {
          const dx = t.clientX - this.startX;
          const dy = t.clientY - this.startY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const angle = Math.atan2(dy, dx);
          const clampedDist = Math.min(dist, maxRadius);

          const thumbX = Math.cos(angle) * clampedDist;
          const thumbY = Math.sin(angle) * clampedDist;

          this.thumbEl.style.transform = `translate(calc(-50% + ${thumbX}px), calc(-50% + ${thumbY}px))`;

          this.currentVector = {
            x: clampedDist > 5 ? (thumbX / maxRadius) : 0,
            y: clampedDist > 5 ? (thumbY / maxRadius) : 0,
            active: clampedDist > 5
          };
          break;
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!this.isTouching) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.touchId) {
          this.isTouching = false;
          this.touchId = null;
          this.baseEl.style.display = 'none';
          this.currentVector = { x: 0, y: 0, active: false };
          break;
        }
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });

    // 2. Action Button Click
    this.actionBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onActionCallback?.();
    });
    this.actionBtn.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      this.onActionCallback?.();
    }, { passive: true });

    // 3. Desktop Keyboard Listeners
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space' || e.code === 'KeyE') {
        e.preventDefault();
        this.onActionCallback?.();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  getVector(): JoystickVector {
    // If touch joystick is active, prefer touch
    if (this.currentVector.active) {
      return this.currentVector;
    }

    // Otherwise check keyboard
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

  destroy(): void {
    const parent = this.baseEl?.parentElement;
    parent?.remove();
  }
}
