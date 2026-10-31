// ============================================================================
// PICKLEBALL STAGE - 3D Court, Visual Aesthetics, Dynamic Ball & Chibi Avatars
// ============================================================================

import * as THREE from 'three';
import { PickleballEngine, type ShotType, type ShotQuality } from './PickleballEngine';

export class PickleballStage {
  private container: HTMLElement;
  private engine: PickleballEngine;

  // Three.js Core
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public renderer!: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private isDestroyed = false;

  // Court Meshes
  private courtGroup!: THREE.Group;
  private netMesh!: THREE.Mesh;

  // Ball & Visuals
  private ballMesh!: THREE.Mesh;
  private ballShadowMesh!: THREE.Mesh;
  private ballTrailPoints: THREE.Vector3[] = [];
  private ballTrailMesh!: THREE.Line;
  private hitParticles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];

  // Characters
  private playerGroup!: THREE.Group;
  private playerPaddleMesh!: THREE.Mesh;
  private opponentGroup!: THREE.Group;
  private opponentPaddleMesh!: THREE.Mesh;

  // Camera tracking
  private cameraLookAt = new THREE.Vector3(0, 0.9, -0.8);
  private targetCameraPos = new THREE.Vector3(0, 4.3, 9.6);

  constructor(container: HTMLElement, engine: PickleballEngine) {
    this.container = container;
    this.engine = engine;
    this.init();
  }

  private init(): void {
    const width = Math.max(320, this.container.clientWidth || window.innerWidth);
    const height = Math.max(240, this.container.clientHeight || window.innerHeight);

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);
    this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.016);

    // 2. Camera: Positioned behind player looking toward opponent
    const aspect = width / height;
    this.camera = new THREE.PerspectiveCamera(aspect < 0.8 ? 54 : 46, aspect, 0.1, 100);
    this.camera.position.copy(this.targetCameraPos);
    this.camera.lookAt(this.cameraLookAt);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting
    this.setupLighting();

    // 5. 3D Pickleball Court
    this.createPickleballCourt();

    // 6. Ball & Shadows
    this.createBallAndTrail();

    // 7. Chibi Players
    this.createChibiAvatars();

    // Resize listener
    window.addEventListener('resize', this.onResize);

    // Register engine hit events for visual particle bursts
    this.engine.onBallHit = this.onHit.bind(this);
    this.engine.onBallBounce = this.onBounce.bind(this);
  }

  public onHit(hitter: 'player' | 'ai', _shot: ShotType, quality: ShotQuality): void {
    this.spawnHitBurst(
      this.engine.ball.x,
      this.engine.ball.y,
      this.engine.ball.z,
      quality === 'perfect' ? 0xfacc15 : (hitter === 'player' ? 0x38bdf8 : 0xef4444)
    );
  }

  public onBounce(x: number, z: number, isFault: boolean): void {
    this.spawnBouncePuff(x, 0.04, z, isFault ? 0xef4444 : 0xffffff);
  }

  private setupLighting(): void {
    // Ambient stadium lighting
    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x0f172a, 1.2);
    this.scene.add(hemi);

    // Main stadium floodlight sun
    const sun = new THREE.DirectionalLight(0xfffbeb, 1.6);
    sun.position.set(12, 18, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 40;
    const d = 12;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.bias = -0.0005;
    this.scene.add(sun);

    // Subtle cyan accent court edge light
    const lAccent = new THREE.PointLight(0x38bdf8, 1.0, 24);
    lAccent.position.set(0, 5, 0);
    this.scene.add(lAccent);
  }

  private createPickleballCourt(): void {
    this.courtGroup = new THREE.Group();

    // 1. Stadium Rooftop Ground Base (Dark Slate Paving)
    const baseGeo = new THREE.PlaneGeometry(24, 30);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.rotation.x = -Math.PI / 2;
    base.receiveShadow = true;
    this.courtGroup.add(base);

    // 2. Outer Court Perimeter (Deep Navy Blue Acrylic Apron)
    const apronGeo = new THREE.PlaneGeometry(9.0, 16.5);
    const apronMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4 });
    const apron = new THREE.Mesh(apronGeo, apronMat);
    apron.rotation.x = -Math.PI / 2;
    apron.position.y = 0.01;
    apron.receiveShadow = true;
    this.courtGroup.add(apron);

    // 3. High-Contrast Inner Court Playing Area (Teal / Ocean Blue Acrylic Canvas)
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;

    // Background: Vibrant Ocean Blue (#0284c7)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, 1024, 2048);

    // Non-Volley Zone (The Kitchen) in Center: Emerald Green (#059669)
    // Court length 13.0m, Kitchen extends 2.1m on each side = 4.2m / 13.0m = ~32.3% of height
    const kTop = 2048 * (0.5 - 2.1 / 13.0);
    const kHeight = 2048 * (4.2 / 13.0);
    ctx.fillStyle = '#059669';
    ctx.fillRect(40, kTop, 944, kHeight);

    // Boundary Lines (Pure White, 2 inch thick equivalent)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 14;

    // Outer Court Perimeter Box
    ctx.strokeRect(40, 40, 944, 1968);

    // Kitchen Lines
    ctx.beginPath();
    ctx.moveTo(40, kTop);
    ctx.lineTo(984, kTop);
    ctx.moveTo(40, kTop + kHeight);
    ctx.lineTo(984, kTop + kHeight);
    ctx.stroke();

    // Center Service Lines (from Baseline to Kitchen Line on both sides)
    ctx.beginPath();
    ctx.moveTo(512, 40);
    ctx.lineTo(512, kTop);
    ctx.moveTo(512, kTop + kHeight);
    ctx.lineTo(512, 2008);
    ctx.stroke();

    // Centerline Net Guide Marks
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(40, 1024);
    ctx.lineTo(984, 1024);
    ctx.stroke();

    // Stenciled Text in Kitchen
    ctx.save();
    ctx.fillStyle = '#facc15';
    ctx.font = '900 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NON-VOLLEY ZONE · THE KITCHEN', 512, 940);
    ctx.fillText('KHÔNG ĐẬP BÓNG SỐNG TRONG BẾP', 512, 1120);
    ctx.restore();

    const courtTex = new THREE.CanvasTexture(canvas);
    courtTex.anisotropy = 8;
    const courtMat = new THREE.MeshStandardMaterial({
      map: courtTex,
      roughness: 0.35,
      metalness: 0.05
    });

    const courtGeo = new THREE.PlaneGeometry(6.0, 13.0);
    const court = new THREE.Mesh(courtGeo, courtMat);
    court.rotation.x = -Math.PI / 2;
    court.position.y = 0.015;
    court.receiveShadow = true;
    this.courtGroup.add(court);

    // 4. Heavy Steel Net Posts & Pickleball Net
    const postMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8, roughness: 0.2 });
    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.05, 14);

    const postL = new THREE.Mesh(postGeo, postMat);
    postL.position.set(-3.25, 0.525, 0);
    postL.castShadow = true;
    this.courtGroup.add(postL);

    const postR = postL.clone();
    postR.position.x = 3.25;
    this.courtGroup.add(postR);

    // Net Mesh Texture (Semi-transparent black wire grid)
    const netCanvas = document.createElement('canvas');
    netCanvas.width = 256;
    netCanvas.height = 128;
    const nctx = netCanvas.getContext('2d')!;
    nctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    nctx.fillRect(0, 0, 256, 128);
    nctx.strokeStyle = '#ffffff';
    nctx.lineWidth = 1.2;
    for (let x = 0; x <= 256; x += 16) {
      nctx.moveTo(x, 0); nctx.lineTo(x, 128);
    }
    for (let y = 0; y <= 128; y += 16) {
      nctx.moveTo(0, y); nctx.lineTo(256, y);
    }
    nctx.stroke();

    const netTex = new THREE.CanvasTexture(netCanvas);
    netTex.wrapS = THREE.RepeatWrapping;
    netTex.wrapT = THREE.RepeatWrapping;
    netTex.repeat.set(16, 4);

    const netMat = new THREE.MeshStandardMaterial({
      map: netTex,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });

    const netGeo = new THREE.PlaneGeometry(6.4, 0.88);
    this.netMesh = new THREE.Mesh(netGeo, netMat);
    this.netMesh.position.set(0, 0.44, 0);
    this.courtGroup.add(this.netMesh);

    // White Top Cable Tape
    const topTape = new THREE.Mesh(
      new THREE.BoxGeometry(6.45, 0.06, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
    );
    topTape.position.set(0, 0.88, 0);
    this.courtGroup.add(topTape);

    // Center Strap (pulls center down to 34 inches = 0.86m)
    const centerStrap = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.9, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    centerStrap.position.set(0, 0.44, 0);
    this.courtGroup.add(centerStrap);

    // 5. Surrounding Chainlink Sports Fence & Sideline Benches
    this.createCourtSurroundings();

    this.scene.add(this.courtGroup);
  }

  private createCourtSurroundings(): void {
    // Chainlink Fence at Back and Sides
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, wireframe: true });
    const fenceH = 2.4;

    // Back Fence (AI side)
    const backFence = new THREE.Mesh(new THREE.PlaneGeometry(16, fenceH), fenceMat);
    backFence.position.set(0, fenceH / 2, -10.5);
    this.courtGroup.add(backFence);

    // Sideline Player Benches
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });

    const bench = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 2.4), benchMat);
    bench.position.set(-4.2, 0.225, 0);
    bench.castShadow = true;
    this.courtGroup.add(bench);

    // Sports Bag & Water Bottles
    const bag = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.65, 12), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    bag.rotation.x = Math.PI / 2;
    bag.position.set(-4.2, 0.6, 0.4);
    this.courtGroup.add(bag);

    const bobaCup = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.22, 10), new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.2 }));
    bobaCup.position.set(-4.2, 0.55, -0.6);
    this.courtGroup.add(bobaCup);

    // Decorative Floodlight Poles with Glowing LED Panels
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    for (const [px, pz] of [[-4.8, -7.0], [4.8, -7.0], [-4.8, 7.0], [4.8, 7.0]]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 5.5, 10), poleMat);
      pole.position.set(px, 2.75, pz);
      this.courtGroup.add(pole);

      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.15, 0.25), lampMat);
      lamp.position.set(px, 5.4, pz);
      this.courtGroup.add(lamp);
    }
  }

  private createBallAndTrail(): void {
    // 1. Neon Yellow Wiffle Ball with Airflow Perforations
    const ballGeo = new THREE.SphereGeometry(this.engine.courtWidth * 0.018, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.25,
      metalness: 0.1,
      emissive: 0xeab308,
      emissiveIntensity: 0.4
    });
    this.ballMesh = new THREE.Mesh(ballGeo, ballMat);
    this.ballMesh.castShadow = true;
    this.scene.add(this.ballMesh);

    // 2. Projected Ground Ball Shadow (Tack-sharp depth perception)
    const shadowGeo = new THREE.CircleGeometry(0.18, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    this.ballShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.ballShadowMesh.rotation.x = -Math.PI / 2;
    this.ballShadowMesh.position.y = 0.02;
    this.scene.add(this.ballShadowMesh);

    // 3. Glowing Motion Trail Line
    const maxTrail = 18;
    for (let i = 0; i < maxTrail; i++) {
      this.ballTrailPoints.push(new THREE.Vector3(0, 0, 0));
    }
    const trailGeo = new THREE.BufferGeometry().setFromPoints(this.ballTrailPoints);
    const trailMat = new THREE.LineBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.65,
      linewidth: 3
    });
    this.ballTrailMesh = new THREE.Line(trailGeo, trailMat);
    this.scene.add(this.ballTrailMesh);
  }

  private createChibiAvatars(): void {
    // ==================== PLAYER CHIBI (Near Side) ====================
    this.playerGroup = new THREE.Group();
    this.playerGroup.position.set(this.engine.playerPos.x, 0, this.engine.playerPos.z);

    // Shadow circle
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.42, 16),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    this.playerGroup.add(shadow);

    // Chibi Head
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.4 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), skinMat);
    head.position.y = 1.35;
    this.playerGroup.add(head);

    // Hair (Dark Spiky / GenZ Style)
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.41, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.8 })
    );
    hair.position.y = 1.38;
    this.playerGroup.add(hair);

    // Sports Headband
    const headband = new THREE.Mesh(
      new THREE.TorusGeometry(0.385, 0.04, 8, 20),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 })
    );
    headband.rotation.x = Math.PI / 2;
    headband.position.y = 1.45;
    this.playerGroup.add(headband);

    // Sports Polo Shirt Body
    const poloMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.6 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.58, 14), poloMat);
    body.position.y = 0.78;
    body.castShadow = true;
    this.playerGroup.add(body);

    // White Sports Shorts
    const shorts = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.26, 12), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    shorts.position.y = 0.44;
    this.playerGroup.add(shorts);

    // Sneaker Shoes
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    for (const sx of [-0.14, 0.14]) {
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.24), shoeMat);
      shoe.position.set(sx, 0.06, 0.04);
      this.playerGroup.add(shoe);
    }

    // Right Arm & Pickleball Paddle
    const paddleGroup = new THREE.Group();
    paddleGroup.position.set(0.35, 0.8, -0.15);

    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.35, 8), skinMat);
    arm.rotation.x = -Math.PI / 3;
    paddleGroup.add(arm);

    // Paddle Blade
    const pBlade = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.38, 0.025),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.3, roughness: 0.2 })
    );
    pBlade.position.set(0.08, 0.26, -0.18);
    pBlade.rotation.x = -Math.PI / 6;
    paddleGroup.add(pBlade);

    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.18, 8),
      new THREE.MeshStandardMaterial({ color: 0x0f172a })
    );
    handle.position.set(0.08, 0.06, -0.09);
    handle.rotation.x = -Math.PI / 6;
    paddleGroup.add(handle);

    this.playerPaddleMesh = paddleGroup as any;
    this.playerGroup.add(paddleGroup);
    this.scene.add(this.playerGroup);

    // ==================== OPPONENT CHIBI (Far Side) ====================
    this.opponentGroup = new THREE.Group();
    this.opponentGroup.position.set(this.engine.aiPos.x, 0, this.engine.aiPos.z);
    this.opponentGroup.rotation.y = Math.PI; // Face towards player

    const oppShadow = shadow.clone();
    this.opponentGroup.add(oppShadow);

    const oppHead = head.clone();
    this.opponentGroup.add(oppHead);

    // Opponent styling based on selected colleague
    const oppHair = hair.clone();
    (oppHair.material as THREE.MeshStandardMaterial).color.setHex(
      this.engine.settings.opponentId === 'linh' ? 0x9333ea : (this.engine.settings.opponentId === 'boss' ? 0x64748b : 0x1e293b)
    );
    this.opponentGroup.add(oppHair);

    const oppBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.28, 0.58, 14),
      new THREE.MeshStandardMaterial({ color: this.getOpponentShirtColor() })
    );
    oppBody.position.y = 0.78;
    oppBody.castShadow = true;
    this.opponentGroup.add(oppBody);

    const oppShorts = shorts.clone();
    this.opponentGroup.add(oppShorts);

    for (const sx of [-0.14, 0.14]) {
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.24), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
      shoe.position.set(sx, 0.06, 0.04);
      this.opponentGroup.add(shoe);
    }

    // Opponent Paddle
    const oppPaddleGroup = paddleGroup.clone();
    this.opponentPaddleMesh = oppPaddleGroup as any;
    this.opponentGroup.add(oppPaddleGroup);

    this.scene.add(this.opponentGroup);
  }

  private getOpponentShirtColor(): number {
    switch (this.engine.settings.opponentId) {
      case 'boss': return 0xf59e0b; // Gold
      case 'nga': return 0xef4444;  // Red
      case 'tuan': return 0x10b981; // Emerald
      case 'linh': return 0x06b6d4; // Cyan
      case 'hoang': return 0x6366f1;// Indigo
      default: return 0xef4444;
    }
  }

  public updateOpponentVisuals(): void {
    if (this.playerGroup) this.scene.remove(this.playerGroup);
    if (this.opponentGroup) this.scene.remove(this.opponentGroup);
    this.createChibiAvatars();
  }

  private spawnHitBurst(x: number, y: number, z: number, colorHex: number): void {
    const geo = new THREE.SphereGeometry(0.045, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: colorHex });

    for (let i = 0; i < 10; i++) {
      const p = new THREE.Mesh(geo, mat);
      p.position.set(x, y, z);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 3 + 1,
        (Math.random() - 0.5) * 4
      );
      this.scene.add(p);
      this.hitParticles.push({ mesh: p, vel, life: 0.35 });
    }
  }

  private spawnBouncePuff(x: number, y: number, z: number, colorHex: number): void {
    const geo = new THREE.RingGeometry(0.08, 0.18, 12);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.8 });
    const ring = new THREE.Mesh(geo, mat);
    ring.position.set(x, y, z);
    this.scene.add(ring);
    this.hitParticles.push({ mesh: ring, vel: new THREE.Vector3(0, 0.6, 0), life: 0.25 });
  }

  public update(delta: number): void {
    if (this.isDestroyed) return;

    // 1. Update Ball Position & Rotation
    this.ballMesh.position.set(this.engine.ball.x, this.engine.ball.y, this.engine.ball.z);
    this.ballMesh.rotation.x += this.engine.ball.vz * delta * 4;
    this.ballMesh.rotation.z -= this.engine.ball.vx * delta * 4;

    // 2. Projected Ground Ball Shadow
    this.ballShadowMesh.position.set(this.engine.ball.x, 0.02, this.engine.ball.z);
    const heightFactor = Math.max(0.1, 1 - (this.engine.ball.y / 3.5));
    const shadowScale = 0.8 + (this.engine.ball.y * 0.25);
    this.ballShadowMesh.scale.set(shadowScale, shadowScale, 1);
    (this.ballShadowMesh.material as THREE.MeshBasicMaterial).opacity = 0.45 * heightFactor;

    // 3. Motion Ribbon Trail
    this.ballTrailPoints.pop();
    this.ballTrailPoints.unshift(this.ballMesh.position.clone());
    this.ballTrailMesh.geometry.setFromPoints(this.ballTrailPoints);

    // 4. Update Chibi Avatar Positions
    const lerpSpeed = 1 - Math.exp(-24 * delta);
    this.playerGroup.position.x += (this.engine.playerPos.x - this.playerGroup.position.x) * lerpSpeed;
    this.playerGroup.position.z += (this.engine.playerPos.z - this.playerGroup.position.z) * lerpSpeed;

    this.opponentGroup.position.x += (this.engine.aiPos.x - this.opponentGroup.position.x) * lerpSpeed;
    this.opponentGroup.position.z += (this.engine.aiPos.z - this.opponentGroup.position.z) * lerpSpeed;

    // Paddle Swing Animation Rotation
    if (this.playerPaddleMesh) {
      if (this.engine.playerPaddleAnim > 0) {
        this.playerPaddleMesh.rotation.y = Math.sin(this.engine.playerPaddleAnim * 16) * 1.2;
      } else {
        this.playerPaddleMesh.rotation.y = 0;
      }
    }

    if (this.opponentPaddleMesh) {
      if (this.engine.aiPaddleAnim > 0) {
        this.opponentPaddleMesh.rotation.y = Math.sin(this.engine.aiPaddleAnim * 16) * 1.2;
      } else {
        this.opponentPaddleMesh.rotation.y = 0;
      }
    }

    // 5. Dynamic Camera Smooth Tracking
    const camTargetX = this.engine.playerPos.x * 0.4;
    this.targetCameraPos.set(camTargetX, 4.3, 9.6);
    this.camera.position.x += (this.targetCameraPos.x - this.camera.position.x) * Math.min(1, 12 * delta);
    this.cameraLookAt.x += (this.engine.ball.x * 0.2 - this.cameraLookAt.x) * Math.min(1, 10 * delta);
    this.camera.lookAt(this.cameraLookAt);

    // 6. Update Hit & Bounce Particles
    for (let i = this.hitParticles.length - 1; i >= 0; i--) {
      const p = this.hitParticles[i];
      p.life -= delta;
      p.mesh.position.addScaledVector(p.vel, delta);
      if (p.mesh.material && 'opacity' in p.mesh.material) {
        (p.mesh.material as any).opacity = Math.max(0, p.life * 3);
      }
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.hitParticles.splice(i, 1);
      }
    }
  }

  public render(): void {
    if (this.isDestroyed || !this.renderer) return;
    this.renderer.render(this.scene, this.camera);
  }

  private onResize = (): void => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = Math.max(320, this.container.clientWidth || window.innerWidth);
    const height = Math.max(240, this.container.clientHeight || window.innerHeight);

    const aspect = width / height;
    this.camera.aspect = aspect;
    this.camera.fov = aspect < 0.8 ? 54 : 46;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public destroy(): void {
    this.isDestroyed = true;
    window.removeEventListener('resize', this.onResize);
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.renderer?.dispose();
    this.container.innerHTML = '';
  }
}
