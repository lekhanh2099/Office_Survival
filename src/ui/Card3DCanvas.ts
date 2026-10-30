import * as THREE from 'three';

export interface Card3DOptions {
  container: HTMLElement;
  emoji: string;
  sender: string;
  title: string;
  subtitle: string;
  themeColor?: string;
  cardType?: string;
  badgeText?: string;
}

export class Card3DCanvas {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private cardGroup!: THREE.Group;
  private cardMesh!: THREE.Mesh;
  private particleSystem!: THREE.Points;
  private animFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private isDestroyed = false;

  private targetRotX = 0;
  private targetRotY = 0;
  private currentRotX = 0;
  private currentRotY = 0;
  private floatTime = 0;

  constructor(options: Card3DOptions) {
    this.container = options.container;
    this.init(options);
  }

  private init(options: Card3DOptions): void {
    const width = Math.max(300, this.container.clientWidth || 360);
    const height = Math.max(240, this.container.clientHeight || 270);

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.z = 4.0;

    // 2. WebGL Renderer with Alpha
    try {
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setClearColor(0x000000, 0);
      this.container.appendChild(this.renderer.domElement);
    } catch (e) {
      console.warn('WebGL init failed, using fallback:', e);
      return;
    }

    // 3. Dynamic Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.05);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight.position.set(2.5, 3.5, 4.0);
    this.scene.add(dirLight);

    const rimLight = new THREE.PointLight(0xa855f7, 2.0, 10);
    rimLight.position.set(-2, -2, 2.5);
    this.scene.add(rimLight);

    // 4. Card 3D Group
    this.cardGroup = new THREE.Group();
    this.scene.add(this.cardGroup);

    // Front Card Face
    const cardTex = this.createCardTexture(options);
    const cardGeo = new THREE.PlaneGeometry(3.3, 2.28, 16, 16);
    const cardMat = new THREE.MeshStandardMaterial({
      map: cardTex,
      roughness: 0.28,
      metalness: 0.08,
      side: THREE.FrontSide
    });
    this.cardMesh = new THREE.Mesh(cardGeo, cardMat);
    this.cardGroup.add(this.cardMesh);

    // Collectible Card Backplate Face
    const backTex = this.createCardBackTexture();
    const backGeo = new THREE.PlaneGeometry(3.3, 2.28);
    const backMat = new THREE.MeshStandardMaterial({
      map: backTex,
      roughness: 0.35,
      metalness: 0.1,
      side: THREE.BackSide
    });
    const backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.position.z = -0.005;
    this.cardGroup.add(backMesh);

    // Dark comic rim
    const rimGeo = new THREE.BoxGeometry(3.34, 2.32, 0.04);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x17172b });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.z = -0.02;
    this.cardGroup.add(rimMesh);

    // 5. 3D Floating Particles
    this.createGlowingParticles(options.cardType);

    // 6. Interactive Gyroscopic Tilt & Drag
    this.setupInteraction();

    // 7. Auto-Resize Observer
    this.setupResizeObserver();

    // 8. Animation Loop
    this.animate();
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined' && this.container) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 0 && h > 0 && this.renderer && this.camera) {
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
          }
        }
      });
      this.resizeObserver.observe(this.container);
    }
  }

  private createCardTexture(options: Card3DOptions): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 690;
    const ctx = canvas.getContext('2d')!;

    const r = 36;

    // Base White Card Body
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(0, 0, 1000, 690, r);
    ctx.fill();

    // Top Header Banner Color
    let headerColor = '#ddd6fe';
    if (options.cardType === 'crisis') headerColor = '#fecaca';
    else if (options.cardType === 'callback') headerColor = '#bbf7d0';
    else if (options.cardType === 'rare') headerColor = '#fef08a';
    else if (options.cardType === 'finale') headerColor = '#fbcfe8';

    ctx.fillStyle = options.themeColor || headerColor;
    ctx.beginPath();
    ctx.roundRect(0, 0, 1000, 120, [r, r, 0, 0]);
    ctx.fill();

    // Outer Thick Comic Border
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#17172b';
    ctx.beginPath();
    ctx.roundRect(7, 7, 986, 676, r);
    ctx.stroke();

    // Header bottom line
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(0, 120);
    ctx.lineTo(1000, 120);
    ctx.stroke();

    // Header: Sender Name with Avatar
    ctx.textAlign = 'left';
    ctx.fillStyle = '#17172b';
    ctx.font = '900 36px Nunito, system-ui, sans-serif';
    const senderTitle = `${options.emoji}  ${options.sender.toUpperCase()}`;
    ctx.fillText(senderTitle.length > 24 ? senderTitle.slice(0, 22) + '...' : senderTitle, 36, 78);

    // Header: Type Badge on Right
    if (options.badgeText) {
      ctx.textAlign = 'right';
      ctx.fillStyle = options.cardType === 'crisis' ? '#b91c1c' : '#4338ca';
      ctx.font = '900 28px Nunito, system-ui, sans-serif';
      ctx.fillText(options.badgeText, 960, 78);
    }

    // Center Spotlight Circle
    ctx.fillStyle = '#f8f5ff';
    ctx.beginPath();
    ctx.arc(500, 280, 105, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#17172b';
    ctx.stroke();

    // Big Visual Center Emoji
    ctx.textAlign = 'center';
    ctx.font = '112px sans-serif';
    ctx.fillText(options.emoji, 500, 320);

    // Comic Sparkles around Spotlight
    ctx.fillStyle = '#f59e0b';
    ctx.font = '32px sans-serif';
    ctx.fillText('✨', 350, 220);
    ctx.fillText('⚡', 650, 225);

    // Bold Title Headline
    ctx.fillStyle = '#17172b';
    ctx.font = '900 44px Nunito, system-ui, sans-serif';
    const titleText = options.title.length > 32 ? options.title.slice(0, 31) + '...' : options.title;
    ctx.fillText(titleText, 500, 442);

    // Punchy 1-line Quote Speech Box
    ctx.fillStyle = '#f5f3ff';
    ctx.beginPath();
    ctx.roundRect(50, 485, 900, 92, 22);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#7c3aed';
    ctx.stroke();

    // Small comic speech tail
    ctx.fillStyle = '#f5f3ff';
    ctx.beginPath();
    ctx.moveTo(500, 485);
    ctx.lineTo(485, 465);
    ctx.lineTo(515, 485);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Quote content (shortened, high readability)
    ctx.fillStyle = '#312e81';
    ctx.font = 'bold 30px Nunito, system-ui, sans-serif';
    let sub = options.subtitle.replace(/^["'\s]+|["'\s]+$/g, '');
    if (sub.length > 52) sub = sub.slice(0, 50) + '...';
    ctx.fillText(`"${sub}"`, 500, 542);

    // Interactive Hint / Swipe Prompt
    ctx.fillStyle = '#6b7280';
    ctx.font = '800 24px Nunito, system-ui, sans-serif';
    ctx.fillText('🎴 Chạm & Nghiêng thẻ 3D · Chọn cách sống sót bên dưới', 500, 638);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    return texture;
  }

  private createCardBackTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 690;
    const ctx = canvas.getContext('2d')!;

    const r = 36;
    // Dark Retro Backplate
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.roundRect(0, 0, 1000, 690, r);
    ctx.fill();

    // Comic Border
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#facc15';
    ctx.beginPath();
    ctx.roundRect(10, 10, 980, 670, r);
    ctx.stroke();

    // Center Emblem
    ctx.fillStyle = '#312e81';
    ctx.beginPath();
    ctx.arc(500, 345, 170, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#f43f5e';
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 52px Nunito, system-ui, sans-serif';
    ctx.fillText('OFFICE', 500, 325);
    ctx.fillStyle = '#facc15';
    ctx.fillText('SURVIVAL', 500, 390);

    ctx.font = '80px sans-serif';
    ctx.fillText('🎴', 500, 220);

    ctx.font = '800 24px Nunito, system-ui, sans-serif';
    ctx.fillStyle = '#a5b4fc';
    ctx.fillText('THẺ BÀI SỰ CỐ DỆT MAY & XNK', 500, 460);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    return texture;
  }

  private createGlowingParticles(cardType?: string): void {
    const count = 48;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    let palette = [
      new THREE.Color('#a855f7'),
      new THREE.Color('#38bdf8'),
      new THREE.Color('#f59e0b'),
      new THREE.Color('#22c55e'),
      new THREE.Color('#ec4899')
    ];

    if (cardType === 'crisis') {
      palette = [new THREE.Color('#ef4444'), new THREE.Color('#f97316'), new THREE.Color('#fbbf24')];
    } else if (cardType === 'rare') {
      palette = [new THREE.Color('#fbbf24'), new THREE.Color('#f59e0b'), new THREE.Color('#fef08a')];
    } else if (cardType === 'callback') {
      palette = [new THREE.Color('#10b981'), new THREE.Color('#34d399'), new THREE.Color('#6ee7b7')];
    }

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 5.8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4.0;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2.5;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Create Soft Glow Circle Particle Texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d')!;
    const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.7)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 32, 32);

    const pTex = new THREE.CanvasTexture(pCanvas);

    const material = new THREE.PointsMaterial({
      size: 0.22,
      map: pTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }

  private setupInteraction(): void {
    const onMove = (clientX: number, clientY: number) => {
      if (!this.container) return;
      const rect = this.container.getBoundingClientRect();
      const x = clientX - rect.left - rect.width / 2;
      const y = clientY - rect.top - rect.height / 2;

      this.targetRotY = (x / rect.width) * 0.52;
      this.targetRotX = -(y / rect.height) * 0.42;
    };

    this.container.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    this.container.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    const onLeave = () => {
      this.targetRotX = 0;
      this.targetRotY = 0;
    };
    this.container.addEventListener('mouseleave', onLeave);
    this.container.addEventListener('touchend', onLeave);
  }

  triggerFlipAnimation(onComplete?: () => void): void {
    let progress = 0;
    const duration = 20; // ~320ms at 60fps

    const flipAnim = () => {
      progress++;
      const t = progress / duration;
      // 360 degree spin
      this.cardGroup.rotation.y += (Math.PI * 2) / duration;
      // Pulse scale
      this.cardGroup.scale.setScalar(1 + Math.sin(t * Math.PI) * 0.18);

      if (progress < duration) {
        requestAnimationFrame(flipAnim);
      } else {
        this.cardGroup.rotation.y = 0;
        this.cardGroup.scale.set(1, 1, 1);
        onComplete?.();
      }
    };
    flipAnim();
  }

  private animate = (): void => {
    if (this.isDestroyed) return;

    this.floatTime += 0.038;

    // Smooth tilt dampening
    this.currentRotX += (this.targetRotX - this.currentRotX) * 0.09;
    this.currentRotY += (this.targetRotY - this.currentRotY) * 0.09;

    // Gentle floating breathing oscillation
    this.cardGroup.rotation.x = this.currentRotX + Math.sin(this.floatTime * 0.8) * 0.04;
    this.cardGroup.rotation.y = this.currentRotY + Math.cos(this.floatTime * 0.6) * 0.04;
    this.cardGroup.position.y = Math.sin(this.floatTime) * 0.07;

    // Rotate particles
    if (this.particleSystem) {
      this.particleSystem.rotation.y += 0.0035;
      this.particleSystem.rotation.x += 0.0015;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
    this.animFrameId = requestAnimationFrame(this.animate);
  };

  destroy(): void {
    this.isDestroyed = true;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.container.innerHTML = '';
    }
  }
}
