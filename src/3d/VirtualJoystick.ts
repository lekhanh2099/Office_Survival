export interface JoystickVector {
  x: number; // -1 to 1
  y: number; // -1 to 1
  active: boolean;
}

export class VirtualJoystick {
  private container: HTMLElement;
  private joyContainer!: HTMLElement;
  private joyBase!: HTMLElement;
  private joyThumb!: HTMLElement;
  private actionBtn!: HTMLElement;

  private isDragging = false;
  private activePointerId: number | null = null;
  private baseCenterX = 0;
  private baseCenterY = 0;
  private maxRadius = 42; // pixels

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
    this.joyContainer = document.createElement('div');
    this.joyContainer.className = 'virtualControlsOverlay';
    this.joyContainer.innerHTML = `
      <!-- Visible Virtual Joystick in bottom-left -->
      <div class="virtualJoyPad" id="joyPadArea">
        <div class="virtualJoyBase" id="joyBase">
          <div class="virtualJoyArrow up">▲</div>
          <div class="virtualJoyArrow down">▼</div>
          <div class="virtualJoyArrow left">◀</div>
          <div class="virtualJoyArrow right">▶</div>
          <div class="virtualJoyThumb" id="joyThumb"></div>
        </div>
        <div class="joyHelperText">KÉO ĐỂ DI CHUYỂN</div>
      </div>

      <!-- Action Button in bottom-right -->
      <button class="virtualActionBtn" id="joyActionBtn" type="button" aria-label="Tương tác làm việc">
        <span class="actionBtnIcon">⚡</span>
        <span class="actionBtnText">LÀM VIỆC</span>
      </button>

      <!-- Desktop keyboard hint -->
      <div class="desktopKeyHint">Phím WASD / Mũi tên để chạy · Phím Space để làm việc</div>
    `;

    this.container.appendChild(this.joyContainer);

    this.joyBase = this.joyContainer.querySelector('#joyBase') as HTMLElement;
    this.joyThumb = this.joyContainer.querySelector('#joyThumb') as HTMLElement;
    this.actionBtn = this.joyContainer.querySelector('#joyActionBtn') as HTMLElement;
  }

  private initEvents(): void {
    const padArea = this.joyContainer.querySelector('#joyPadArea') as HTMLElement;

    // Use PointerEvents (works seamlessly for BOTH mouse clicks/drags and finger touches!)
    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      this.isDragging = true;
      this.activePointerId = e.pointerId;
      padArea.setPointerCapture(e.pointerId);

      const rect = this.joyBase.getBoundingClientRect();
      this.baseCenterX = rect.left + rect.width / 2;
      this.baseCenterY = rect.top + rect.height / 2;

      this.updateFromPointer(e.clientX, e.clientY);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this.isDragging || e.pointerId !== this.activePointerId) return;
      e.preventDefault();
      this.updateFromPointer(e.clientX, e.clientY);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== this.activePointerId) return;
      this.isDragging = false;
      this.activePointerId = null;
      try {
        padArea.releasePointerCapture(e.pointerId);
      } catch {}

      // Reset thumb to center
      this.joyThumb.style.transform = 'translate(-50%, -50%)';
      this.currentVector = { x: 0, y: 0, active: false };
    };

    padArea.addEventListener('pointerdown', onPointerDown);
    padArea.addEventListener('pointermove', onPointerMove);
    padArea.addEventListener('pointerup', onPointerUp);
    padArea.addEventListener('pointercancel', onPointerUp);

    // Also support touching anywhere on the left half of container
    this.joyContainer.addEventListener('pointerdown', (e) => {
      // If clicking action button or joypad area, let them handle it
      if ((e.target as HTMLElement).closest('#joyPadArea, #joyActionBtn')) return;
      // If on left 55% of container
      const containerRect = this.container.getBoundingClientRect();
      if (e.clientX - containerRect.left < containerRect.width * 0.55) {
        onPointerDown(e);
      }
    });

    // Action button
    const triggerAction = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      this.onActionCallback?.();
    };

    this.actionBtn.addEventListener('pointerdown', triggerAction);

    // Keyboard support (WASD and Arrows)
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

  private updateFromPointer(clientX: number, clientY: number): void {
    const dx = clientX - this.baseCenterX;
    const dy = clientY - this.baseCenterY;
    const dist = Math.hypot(dx, dy);

    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, this.maxRadius);

    const thumbX = Math.cos(angle) * clampedDist;
    const thumbY = Math.sin(angle) * clampedDist;

    this.joyThumb.style.transform = `translate(calc(-50% + ${thumbX}px), calc(-50% + ${thumbY}px))`;

    if (clampedDist > 4) {
      this.currentVector = {
        x: thumbX / this.maxRadius,
        y: thumbY / this.maxRadius,
        active: true
      };
    } else {
      this.currentVector = { x: 0, y: 0, active: false };
    }
  }

  getVector(): JoystickVector {
    if (this.currentVector.active) {
      return this.currentVector;
    }

    // Keyboard fallback
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
    this.joyContainer?.remove();
  }
}
