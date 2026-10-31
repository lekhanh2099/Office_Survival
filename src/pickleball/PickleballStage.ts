// ============================================================================
// PICKLEBALL STAGE - 3D Court, Visual Aesthetics, Dynamic Ball & Chibi Avatars
// ============================================================================

import * as THREE from 'three';
import { PickleballEngine, type ShotType, type ShotQuality } from './PickleballEngine';

export interface ChibiRig {
  group: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  paddleGroup: THREE.Group;
  lastPos: { x: number; z: number };
  runCycle: number;
}

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
  private landingTargetMesh!: THREE.Mesh;
  private timingRingMesh!: THREE.Mesh;
  private ballTrailPoints: THREE.Vector3[] = [];
  private ballTrailMesh!: THREE.Line;
  private hitParticles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];
  public cameraShake = 0;

  // Characters
  public playerRig!: ChibiRig;
  public opponentRig!: ChibiRig;
  public playerGroup!: THREE.Group;
  public opponentGroup!: THREE.Group;

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

    // 2. Camera: Full 100% court broadcast framing for both Desktop & Mobile Portrait
    const aspect = width / height;
    const isPortrait = aspect < 0.85;
    this.camera = new THREE.PerspectiveCamera(isPortrait ? 62 : 44, aspect, 0.1, 100);
    this.targetCameraPos.set(0, isPortrait ? 7.6 : 5.8, isPortrait ? 13.6 : 12.0);
    this.cameraLookAt.set(0, 0.6, isPortrait ? -0.6 : 0.8);
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

  public triggerScreenShake(intensity = 0.28): void {
    this.cameraShake = Math.max(this.cameraShake, intensity);
  }

  public onHit(hitter: 'player' | 'ai', shot: ShotType, quality: ShotQuality): void {
    const isSmash = shot === 'smash';
    const isPerfect = quality === 'perfect';

    // 1. Particle Explosion
    const burstColor = isSmash ? 0xf97316 : (isPerfect ? 0xfacc15 : (hitter === 'player' ? 0x38bdf8 : 0xef4444));
    this.spawnHitBurst(this.engine.ball.x, this.engine.ball.y, this.engine.ball.z, burstColor);
    if (isSmash || isPerfect) {
      this.spawnHitBurst(this.engine.ball.x, this.engine.ball.y + 0.12, this.engine.ball.z, 0xfacc15);
    }

    // 2. Smash Comet Trail Color Shift
    if (this.ballTrailMesh) {
      const trailMat = this.ballTrailMesh.material as THREE.LineBasicMaterial;
      if (isSmash) {
        trailMat.color.setHex(0xf97316); // Electric flame orange!
        trailMat.opacity = 0.95;
      } else if (shot === 'dink') {
        trailMat.color.setHex(0x10b981); // Emerald drop!
        trailMat.opacity = 0.75;
      } else {
        trailMat.color.setHex(0xfef08a); // Crisp optic yellow
        trailMat.opacity = 0.65;
      }
    }

    // 3. Punchy Screen Shake
    if (isSmash || isPerfect) {
      this.triggerScreenShake(isPerfect ? 0.36 : 0.26);
    }
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
    // 1. Authentic Neon Optic Yellow Wiffle Ball with 40 Airflow Perforations
    const ballTexture = generatePickleballTexture();
    const ballGeo = new THREE.SphereGeometry(this.engine.courtWidth * 0.019, 32, 24);
    const ballMat = new THREE.MeshStandardMaterial({
      map: ballTexture,
      roughness: 0.38,
      metalness: 0.05,
      bumpMap: ballTexture,
      bumpScale: 0.025
    });
    this.ballMesh = new THREE.Mesh(ballGeo, ballMat);
    this.ballMesh.castShadow = true;
    this.scene.add(this.ballMesh);

    // 2. Projected Ground Ball Shadow (Sharp depth perception)
    const shadowGeo = new THREE.CircleGeometry(0.19, 20);
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
    this.ballTrailPoints = [];
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

    // 4. Tactical Landing Target Marker (Shows where ball is projected to land)
    const targetGeo = new THREE.RingGeometry(0.24, 0.32, 24);
    const targetMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.landingTargetMesh = new THREE.Mesh(targetGeo, targetMat);
    this.landingTargetMesh.rotation.x = -Math.PI / 2;
    this.landingTargetMesh.position.y = 0.025;
    this.landingTargetMesh.visible = false;
    this.scene.add(this.landingTargetMesh);

    // 5. Dynamic Sweet Spot Timing Ring (Shows shrinking perfect hit timing)
    const ringGeo = new THREE.RingGeometry(0.18, 0.22, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.timingRingMesh = new THREE.Mesh(ringGeo, ringMat);
    this.timingRingMesh.visible = false;
    this.scene.add(this.timingRingMesh);
  }

  private createChibiAvatars(): void {
    // ==================== PLAYER CHIBI (Near Side, facing net) ====================
    this.playerRig = this.createDetailedChibiRig('player', 0x2563eb, true);
    this.playerRig.group.position.set(this.engine.playerPos.x, 0, this.engine.playerPos.z);
    this.playerRig.group.rotation.y = Math.PI; // Face towards net
    this.playerRig.lastPos = { x: this.engine.playerPos.x, z: this.engine.playerPos.z };
    this.playerGroup = this.playerRig.group;
    this.scene.add(this.playerGroup);

    // ==================== OPPONENT CHIBI (Far Side, facing player) ====================
    const oppColor = this.getOpponentShirtColor();
    this.opponentRig = this.createDetailedChibiRig(this.engine.settings.opponentId, oppColor, false);
    this.opponentRig.group.position.set(this.engine.aiPos.x, 0, this.engine.aiPos.z);
    this.opponentRig.group.rotation.y = 0; // Face forward towards player and camera
    this.opponentRig.lastPos = { x: this.engine.aiPos.x, z: this.engine.aiPos.z };
    this.opponentGroup = this.opponentRig.group;
    this.scene.add(this.opponentGroup);
  }

  private createDetailedChibiRig(
    colleagueId: string,
    shirtColorHex: number,
    isPlayer: boolean
  ): ChibiRig {
    const group = new THREE.Group();
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.45 });

    // Ground shadow
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.44, 20),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.38, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    group.add(shadow);

    // ==================== TORSO GROUP ====================
    const torso = new THREE.Group();
    torso.position.y = 0.78;

    // Athletic Polo Shirt
    const poloMat = new THREE.MeshStandardMaterial({ color: shirtColorHex, roughness: 0.55 });
    const bodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.56, 16), poloMat);
    bodyMesh.castShadow = true;
    torso.add(bodyMesh);

    // Folded Shirt Collar Flaps
    const collarMat = new THREE.MeshStandardMaterial({ color: isPlayer ? 0x1e3a8a : 0x0f172a, roughness: 0.5 });
    for (const [cx, rotZ] of [[-0.12, 0.25], [0.12, -0.25]]) {
      const flap = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.16), collarMat);
      flap.position.set(cx, 0.26, 0.12);
      flap.rotation.z = rotZ;
      flap.rotation.x = 0.3;
      torso.add(flap);
    }

    // V-neck Placket & Buttons (facing front +Z)
    const buttonMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    for (const by of [0.18, 0.08, -0.02]) {
      const btn = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), buttonMat);
      btn.position.set(0, by, 0.27);
      torso.add(btn);
    }

    // Shoulder Athletic Racing Stripes
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    for (const sx of [-0.25, 0.25]) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.24, 0.14), stripeMat);
      stripe.position.set(sx, 0.12, 0);
      torso.add(stripe);
    }

    // White Sports Shorts
    const shortsMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
    const shorts = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.24, 14), shortsMat);
    shorts.position.y = -0.28;
    torso.add(shorts);

    group.add(torso);

    // ==================== HEAD GROUP ====================
    const head = new THREE.Group();
    head.position.y = 1.34;

    // Head Sphere with Procedural Anime/Chibi Eyes, Eyebrows & Blush
    const faceTex = generateChibiFaceTexture(colleagueId);
    const headMat = new THREE.MeshStandardMaterial({
      map: faceTex,
      roughness: 0.42,
      metalness: 0.05
    });
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.38, 32, 24), headMat);
    // Align texture center (u=0.5) to point directly along +Z (front)
    headMesh.rotation.y = -Math.PI / 2;
    headMesh.castShadow = true;
    head.add(headMesh);

    // 3D Ears (Left & Right)
    for (const ex of [-0.38, 0.38]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), skinMat);
      ear.scale.set(0.6, 1.2, 0.8);
      ear.position.set(ex, 0, 0);
      head.add(ear);
    }

    // 3D Hair & Accessories per Colleague (unobstructed front face)
    this.attachColleagueHairAndGear(head, colleagueId, isPlayer);

    group.add(head);

    // ==================== LEFT ARM (Balance Arm, local +X) ====================
    const leftArm = new THREE.Group();
    leftArm.position.set(0.32, 0.98, 0);

    const lUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.22, 10), poloMat);
    lUpper.position.y = -0.10;
    leftArm.add(lUpper);

    const lFore = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.048, 0.22, 10), skinMat);
    lFore.position.set(0, -0.26, 0.04);
    lFore.rotation.x = -0.3;
    leftArm.add(lFore);

    const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), skinMat);
    lHand.position.set(0, -0.38, 0.09);
    leftArm.add(lHand);

    group.add(leftArm);

    // ==================== RIGHT ARM (Paddle Arm, local -X) ====================
    const rightArm = new THREE.Group();
    rightArm.position.set(-0.32, 0.98, 0);

    const rUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.22, 10), poloMat);
    rUpper.position.y = -0.10;
    rightArm.add(rUpper);

    const rFore = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.048, 0.22, 10), skinMat);
    rFore.position.set(0, -0.26, 0.04);
    rFore.rotation.x = -0.25;
    rightArm.add(rFore);

    const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), skinMat);
    rHand.position.set(0, -0.38, 0.08);
    rightArm.add(rHand);

    // Attach Detailed Pickleball Paddle to Right Hand
    const accentCol = isPlayer ? '#06b6d4' : (colleagueId === 'boss' ? '#f59e0b' : '#ef4444');
    const paddleGroup = createDetailedPaddle(isPlayer, isPlayer ? this.engine.settings.selectedPaddleId : 'carbon_genz', accentCol);
    paddleGroup.position.set(-0.04, -0.34, 0.12);
    paddleGroup.rotation.x = Math.PI / 6;
    rightArm.add(paddleGroup);

    group.add(rightArm);

    // ==================== LEGS & TENNIS SNEAKERS ====================
    const leftLeg = this.createLegWithSneaker(0.13, isPlayer ? 0x0284c7 : 0xef4444);
    const rightLeg = this.createLegWithSneaker(-0.13, isPlayer ? 0x0284c7 : 0xef4444);

    group.add(leftLeg);
    group.add(rightLeg);

    return {
      group,
      torso,
      head,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      paddleGroup,
      lastPos: { x: 0, z: 0 },
      runCycle: 0
    };
  }

  private createLegWithSneaker(posX: number, shoeColorHex: number): THREE.Group {
    const legGroup = new THREE.Group();
    legGroup.position.set(posX, 0.44, 0);

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.45 });

    // Thigh / Leg
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.055, 0.32, 10), skinMat);
    shin.position.y = -0.16;
    legGroup.add(shin);

    // Athletic Tennis Sneaker
    const shoeGroup = new THREE.Group();
    shoeGroup.position.set(0, -0.38, 0.04);

    // Midsole (White EVA cushion)
    const midsole = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, 0.055, 0.24),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    midsole.position.y = 0.03;
    shoeGroup.add(midsole);

    // Outsole (Gum rubber tread)
    const outsole = new THREE.Mesh(
      new THREE.BoxGeometry(0.134, 0.02, 0.244),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 })
    );
    outsole.position.y = 0.01;
    shoeGroup.add(outsole);

    // Upper
    const upper = new THREE.Mesh(
      new THREE.BoxGeometry(0.124, 0.08, 0.22),
      new THREE.MeshStandardMaterial({ color: shoeColorHex, roughness: 0.5 })
    );
    upper.position.set(0, 0.08, 0);
    shoeGroup.add(upper);

    // White Shoelaces
    const laces = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.015, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    laces.position.set(0, 0.125, 0.03);
    shoeGroup.add(laces);

    legGroup.add(shoeGroup);
    return legGroup;
  }

  private attachColleagueHairAndGear(head: THREE.Group, colleagueId: string, isPlayer: boolean): void {
    // 1. Determine hair color
    let hairColor = 0x18181b; // default black
    if (isPlayer) hairColor = 0x1e1b4b; // Dark navy GenZ
    else if (colleagueId === 'linh') hairColor = 0x6b21a8; // Purple for Linh
    else if (colleagueId === 'tuan') hairColor = 0x1f2937; // Charcoal
    else if (colleagueId === 'boss') hairColor = 0x334155; // Slate with silver temples
    else if (colleagueId === 'hoang') hairColor = 0x1e293b;

    const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.75 });

    // 2. Base Back Hair Hemisphere (Covers back of head Z <= 0, completely leaves front Z > 0 face clear!)
    const backGeo = new THREE.SphereGeometry(0.392, 18, 14, Math.PI, Math.PI, 0, Math.PI * 0.72);
    const backHair = new THREE.Mesh(backGeo, hairMat);
    backHair.position.y = 0.02;
    head.add(backHair);

    // 3. Top Crown Dome (Covers top of head down to hairline, well above eyebrows)
    const crownGeo = new THREE.SphereGeometry(0.392, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.32);
    const crownHair = new THREE.Mesh(crownGeo, hairMat);
    crownHair.position.set(0, 0.03, -0.04);
    head.add(crownHair);

    // 4. Character-Specific 3D Styles & Gear
    if (isPlayer) {
      // Player: Cyan sports headband encircling the forehead + front bangs tips
      const bandMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 });
      const headband = new THREE.Mesh(new THREE.TorusGeometry(0.388, 0.032, 8, 28), bandMat);
      headband.rotation.x = Math.PI / 2 + 0.15;
      headband.position.set(0, 0.19, 0.04);
      head.add(headband);

      // Spiky Anime Bangs sitting above the headband
      for (const [bx, bz, rotZ] of [[-0.12, 0.28, 0.25], [0, 0.30, 0], [0.12, 0.28, -0.25]]) {
        const bang = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.16, 6), hairMat);
        bang.position.set(bx, 0.26, bz);
        bang.rotation.z = rotZ;
        bang.rotation.x = 2.8;
        head.add(bang);
      }
    } else if (colleagueId === 'nga') {
      // Chị Nga: Chic Bob Haircut with side strands framing cheeks
      for (const sx of [-0.36, 0.36]) {
        const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.035, 0.30, 8), hairMat);
        strand.position.set(sx, -0.06, 0.04);
        strand.rotation.z = sx > 0 ? -0.15 : 0.15;
        head.add(strand);
      }
    } else if (colleagueId === 'linh') {
      // Em Linh: High Bouncy Ponytail with Hot-Pink Scrunchie
      const scrunchie = new THREE.Mesh(
        new THREE.TorusGeometry(0.08, 0.035, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.4 })
      );
      scrunchie.position.set(0, 0.34, -0.24);
      scrunchie.rotation.x = -0.5;
      head.add(scrunchie);

      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.46, 8), hairMat);
      tail.position.set(0, 0.20, -0.40);
      tail.rotation.x = -0.7;
      head.add(tail);

      // Cute wispy bangs at temples
      for (const sx of [-0.28, 0.28]) {
        const wisp = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.18, 6), hairMat);
        wisp.position.set(sx, 0.10, 0.22);
        wisp.rotation.x = 2.9;
        head.add(wisp);
      }
    } else if (colleagueId === 'tuan') {
      // Anh Tuấn: Backward Snapback Trucker Cap in Emerald Green
      const capMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.45 });
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.398, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.38),
        capMat
      );
      cap.position.set(0, 0.08, -0.03);
      head.add(cap);

      // Backwards Cap Visor
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.022, 0.18), capMat);
      visor.position.set(0, 0.14, -0.34);
      visor.rotation.x = 0.2;
      head.add(visor);
    } else if (colleagueId === 'boss') {
      // Sếp Hùng: Executive Undercut with Silver Streaks at Temples
      const silverMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.5 });
      for (const sx of [-0.36, 0.36]) {
        const streak = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.14, 0.20), silverMat);
        streak.position.set(sx, 0.10, -0.02);
        head.add(streak);
      }
    }
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
    if (this.playerRig?.group) this.scene.remove(this.playerRig.group);
    if (this.opponentRig?.group) this.scene.remove(this.opponentRig.group);
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

  private updateChibiAnimation(
    rig: ChibiRig,
    targetPos: { x: number; z: number },
    paddleAnim: number,
    isDiving: boolean,
    delta: number,
    isOpponent = false
  ): void {
    // 1. Position Lerp
    const lerpSpeed = 1 - Math.exp(-24 * delta);
    rig.group.position.x += (targetPos.x - rig.group.position.x) * lerpSpeed;
    rig.group.position.z += (targetPos.z - rig.group.position.z) * lerpSpeed;

    // 2. Velocity & Movement Kinematics
    const dx = targetPos.x - rig.lastPos.x;
    const dz = targetPos.z - rig.lastPos.z;
    const dist = Math.hypot(dx, dz);
    rig.lastPos.x = targetPos.x;
    rig.lastPos.z = targetPos.z;

    if (dist > 0.003) {
      const speed = dist / Math.max(0.001, delta);
      rig.runCycle += delta * Math.min(26, 8 + speed * 2.4);
      const legAngle = Math.sin(rig.runCycle) * 0.55;
      rig.leftLeg.rotation.x = legAngle;
      rig.rightLeg.rotation.x = -legAngle;
      rig.leftArm.rotation.x = -legAngle * 0.8;
      rig.torso.position.y = 0.78 + Math.abs(Math.sin(rig.runCycle)) * 0.05;

      // Realistic Inertial Lean into movement direction
      const tiltX = (dx / Math.max(0.01, delta)) * 0.025;
      const tiltZ = (dz / Math.max(0.01, delta)) * 0.025;
      rig.torso.rotation.z = isOpponent ? -tiltX : tiltX;
      rig.torso.rotation.x = isOpponent ? tiltZ : -tiltZ;
    } else {
      // Idle recovery & breathing
      rig.leftLeg.rotation.x *= 0.82;
      rig.rightLeg.rotation.x *= 0.82;
      rig.leftArm.rotation.x *= 0.82;
      rig.torso.position.y += (0.78 - rig.torso.position.y) * 0.15;
      rig.torso.rotation.z *= 0.82;
      rig.torso.rotation.x *= 0.82;
    }

    // 3. Full-Body Kinetic Swing Animation
    if (paddleAnim > 0) {
      const p = 1 - (paddleAnim / 0.28); // 0 -> 1 progress
      // Torso uncoils and drives through
      rig.torso.rotation.y = (p - 0.35) * (isOpponent ? 0.85 : -0.85);
      // Arm whips forward across body with natural follow-through
      rig.rightArm.rotation.x = -0.35 - Math.sin(p * Math.PI) * 1.15;
      rig.rightArm.rotation.y = -0.5 + p * 1.6;
      rig.rightArm.rotation.z = Math.sin(p * Math.PI) * 0.45;
    } else {
      rig.torso.rotation.y *= 0.82;
      rig.rightArm.rotation.x += (-Math.PI / 4 - rig.rightArm.rotation.x) * 0.2;
      rig.rightArm.rotation.y += (-0.2 - rig.rightArm.rotation.y) * 0.2;
      rig.rightArm.rotation.z *= 0.82;
    }

    // 4. Head tracks the ball naturally (in character's local space)
    const rawDx = this.engine.ball.x - rig.group.position.x;
    const rawDz = this.engine.ball.z - rig.group.position.z;
    const localBallX = isOpponent ? rawDx : -rawDx;
    const localBallZ = isOpponent ? rawDz : -rawDz;
    const trackAngle = Math.atan2(localBallX, Math.max(0.1, localBallZ));
    rig.head.rotation.y = Math.max(-0.55, Math.min(0.55, trackAngle * 0.45));

    // 5. Heroic Diving Slide Pose
    if (isDiving) {
      rig.group.rotation.x = isOpponent ? -0.82 : 0.82;
      rig.group.position.y = -0.22;
      rig.rightArm.rotation.x = -1.25;
      rig.leftLeg.rotation.x = 0.6;
      rig.rightLeg.rotation.x = -0.8;
    } else {
      rig.group.rotation.x = 0;
      if (rig.group.position.y < 0) rig.group.position.y = 0;
    }
  }

  public update(delta: number): void {
    if (this.isDestroyed) return;

    // 1. Update Ball Position & Natural Physical Rotation
    this.ballMesh.position.set(this.engine.ball.x, this.engine.ball.y, this.engine.ball.z);
    this.ballMesh.rotation.x += this.engine.ball.vz * delta * 5.2;
    this.ballMesh.rotation.z -= this.engine.ball.vx * delta * 5.2;
    this.ballMesh.rotation.y += this.engine.ball.spinX * delta * 2.8;

    // Ball Squash & Stretch Deformation
    const squashY = this.engine.ball.squashY;
    const hSpeed = Math.hypot(this.engine.ball.vx, this.engine.ball.vy, this.engine.ball.vz);
    const stretch = 1.0 + Math.min(0.24, hSpeed * 0.012);
    const squashComp = Math.sqrt(1 / stretch);

    if (squashY < 0.98) {
      // Ground bounce squash dominates
      const xz = 1.0 + (1.0 - squashY) * 0.65;
      this.ballMesh.scale.set(xz, squashY, xz);
    } else {
      // Aerodynamic flight elongation
      this.ballMesh.scale.set(squashComp, squashComp * stretch, squashComp);
    }

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

    // 3b. Tactical Landing Target Marker Update
    if (this.engine.targetLanding && this.engine.ball.inPlay) {
      this.landingTargetMesh.visible = true;
      this.landingTargetMesh.position.x = this.engine.targetLanding.x;
      this.landingTargetMesh.position.z = this.engine.targetLanding.z;
      this.landingTargetMesh.rotation.z += delta * 3.5;
      const targetMat = this.landingTargetMesh.material as THREE.MeshBasicMaterial;
      if (this.engine.targetLanding.type === 'smash') {
        targetMat.color.setHex(0xef4444); // Red for Smash
      } else if (this.engine.targetLanding.type === 'dink') {
        targetMat.color.setHex(0x10b981); // Emerald green for Dink
      } else {
        targetMat.color.setHex(0x38bdf8); // Cyan for Curve/Drive
      }
    } else {
      this.landingTargetMesh.visible = false;
    }

    // 3c. Dynamic Sweet Spot Timing Ring (Guides player to strike at the exact right moment!)
    if (this.timingRingMesh) {
      if (this.engine.ball.inPlay && this.engine.ball.vz > 0 && this.engine.ball.z > 1.2 && this.engine.ball.z < 6.0) {
        this.timingRingMesh.visible = true;
        this.timingRingMesh.position.set(this.engine.ball.x, this.engine.ball.y, this.engine.ball.z);
        this.timingRingMesh.lookAt(this.camera.position);

        const distToPlayer = Math.abs((this.engine.playerPos.z - 0.4) - this.engine.ball.z);
        // Scale contracts from 2.5 down to 0.7 as ball approaches paddle
        const ringScale = Math.max(0.65, Math.min(2.4, distToPlayer * 0.95));
        this.timingRingMesh.scale.set(ringScale, ringScale, 1);

        const ringMat = this.timingRingMesh.material as THREE.MeshBasicMaterial;
        if (ringScale < 1.15) {
          // Sweet spot window: Golden glow!
          ringMat.color.setHex(0xfacc15);
          ringMat.opacity = 0.95;
        } else {
          // Approaching: Clean cyan guide
          ringMat.color.setHex(0x38bdf8);
          ringMat.opacity = 0.65;
        }
      } else {
        this.timingRingMesh.visible = false;
      }
    }

    // 4. Update Chibi Avatars Kinematics & Full-Body Swing Animations
    if (this.playerRig) {
      this.updateChibiAnimation(
        this.playerRig,
        this.engine.playerPos,
        this.engine.playerPaddleAnim,
        this.engine.isDiving,
        delta,
        false
      );
    }

    if (this.opponentRig) {
      this.updateChibiAnimation(
        this.opponentRig,
        this.engine.aiPos,
        this.engine.aiPaddleAnim,
        false,
        delta,
        true
      );
    }

    // 5. Dynamic Camera Smooth Tracking & Portrait Multi-Aspect Ratio Adaptation
    const isPortrait = this.camera.aspect < 0.85;
    const camTargetX = this.engine.playerPos.x * (isPortrait ? 0.22 : 0.3);
    const targetY = isPortrait ? 7.6 : 5.8;
    const targetZ = (isPortrait ? 13.6 : 12.0) + (this.engine.playerPos.z - 5.2) * 0.25;
    const targetLookAtZ = isPortrait ? -0.6 : 0.8;

    this.targetCameraPos.set(camTargetX, targetY, targetZ);
    this.camera.position.x += (this.targetCameraPos.x - this.camera.position.x) * Math.min(1, 12 * delta);
    this.camera.position.y += (this.targetCameraPos.y - this.camera.position.y) * Math.min(1, 10 * delta);
    this.camera.position.z += (this.targetCameraPos.z - this.camera.position.z) * Math.min(1, 8 * delta);

    // Dynamic 3D Camera Shake Impact Punch
    if (this.cameraShake > 0.005) {
      const shakeX = (Math.random() - 0.5) * this.cameraShake * 0.45;
      const shakeY = (Math.random() - 0.5) * this.cameraShake * 0.35;
      this.camera.position.x += shakeX;
      this.camera.position.y += shakeY;
      this.cameraShake *= Math.exp(-14 * delta);
    }

    this.cameraLookAt.x += (this.engine.ball.x * 0.18 - this.cameraLookAt.x) * Math.min(1, 10 * delta);
    this.cameraLookAt.z += (targetLookAtZ - this.cameraLookAt.z) * Math.min(1, 8 * delta);
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
    this.camera.fov = aspect < 0.85 ? 62 : 44;
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

// ============================================================================
// PROCEDURAL TEXTURE & MESH GENERATORS (WIFFLE BALL, CARBON PADDLE & CHIBI FACES)
// ============================================================================

function generatePickleballTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // 1. Vibrant Neon Optic Yellow Wiffle Ball Surface
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#eab308');
  grad.addColorStop(0.2, '#facc15');
  grad.addColorStop(0.5, '#dfff00');
  grad.addColorStop(0.8, '#facc15');
  grad.addColorStop(1, '#ca8a04');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // 2. Equatorial Mold Seam Line
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.14)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 128);
  ctx.lineTo(512, 128);
  ctx.stroke();

  // 3. 40 Airflow Wiffle Holes (Rows of perforated circular apertures with hollow depth)
  const rows = [
    { y: 32, count: 6, r: 10 },
    { y: 64, count: 8, r: 12 },
    { y: 96, count: 9, r: 13 },
    { y: 160, count: 9, r: 13 },
    { y: 192, count: 8, r: 12 },
    { y: 224, count: 6, r: 10 }
  ];

  rows.forEach((row, rowIdx) => {
    const spacing = 512 / row.count;
    const offset = rowIdx % 2 === 0 ? 0 : spacing / 2;
    for (let i = 0; i < row.count; i++) {
      const cx = (i * spacing + offset) % 512;
      const cy = row.y;

      // Dark hole interior gradient (looks like hollow 3D interior!)
      const holeGrad = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy, row.r);
      holeGrad.addColorStop(0, '#020617');
      holeGrad.addColorStop(0.65, '#0f172a');
      holeGrad.addColorStop(0.88, '#1e293b');
      holeGrad.addColorStop(1, '#475569');

      ctx.fillStyle = holeGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, row.r, 0, Math.PI * 2);
      ctx.fill();

      // Lower rim specular crescent
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy + 1, row.r, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
    }
  });

  // 4. Official USAPA Imprint
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('USA PB 40', 256, 124);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const hx = x + r * Math.cos(angle);
    const hy = y + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.stroke();
}

function generatePaddleFaceTexture(paddleId: string, accentColorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. Carbon Fiber Twill Weave Background
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, 512, 512);

  // Micro-twill carbon pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1.8;
  for (let i = -512; i < 1024; i += 8) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 512, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i + 512, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
  }

  // 2. High-Tech Dynamic Chevron / Speed Stripe
  const grad = ctx.createLinearGradient(60, 180, 450, 280);
  grad.addColorStop(0, accentColorHex);
  grad.addColorStop(1, '#0284c7');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(60, 190);
  ctx.lineTo(452, 240);
  ctx.lineTo(452, 290);
  ctx.lineTo(60, 240);
  ctx.closePath();
  ctx.fill();

  // White pinstripe border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(60, 186);
  ctx.lineTo(452, 236);
  ctx.stroke();

  // 3. Honeycomb Polymer Core Outline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  for (let hx = 160; hx <= 360; hx += 38) {
    for (let hy = 320; hy <= 430; hy += 34) {
      drawHexagon(ctx, hx, hy, 16);
    }
  }

  // 4. Specs & Typography
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(paddleId.toUpperCase().replace('_', ' '), 256, 140);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 13px monospace';
  ctx.fillText('RAW CARBON T700 · 16MM THERMOFORMED', 256, 465);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

function generateHandleGripTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dark charcoal overgrip wrap
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 256, 256);

  // Spiral tape wrap seam lines
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4;
  for (let y = -256; y < 512; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y + 64);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y + 4);
    ctx.lineTo(256, y + 68);
    ctx.stroke();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
  }

  // Grip micro-perforations
  ctx.fillStyle = '#0f172a';
  for (let x = 16; x < 256; x += 32) {
    for (let y = 16; y < 256; y += 24) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function generateChibiFaceTexture(colleagueId: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base peach skin
  ctx.fillStyle = '#ffedd5';
  ctx.fillRect(0, 0, 512, 512);

  // Soft Rosy Cheeks
  const drawBlush = (cx: number, cy: number) => {
    const blush = ctx.createRadialGradient(cx, cy, 2, cx, cy, 38);
    blush.addColorStop(0, 'rgba(244, 63, 94, 0.45)');
    blush.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = blush;
    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, Math.PI * 2);
    ctx.fill();
  };
  drawBlush(150, 310);
  drawBlush(362, 310);

  // Big Expressive Chibi Eyes
  const drawEye = (cx: number, cy: number, isRight: boolean) => {
    // White sclera
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 42, 54, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Iris color per colleague
    let irisColor = '#0284c7'; // default cyan blue
    if (colleagueId === 'linh') irisColor = '#a855f7'; // Purple for Linh
    else if (colleagueId === 'nga') irisColor = '#dc2626'; // Red for Nga
    else if (colleagueId === 'tuan') irisColor = '#059669'; // Emerald for Tuan
    else if (colleagueId === 'boss') irisColor = '#d97706'; // Amber for Boss

    const irisGrad = ctx.createLinearGradient(cx, cy - 35, cx, cy + 45);
    irisGrad.addColorStop(0, '#0f172a');
    irisGrad.addColorStop(0.5, irisColor);
    irisGrad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 30, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark Pupil
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 6, 16, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Primary Specular Catchlight (Large Glossy Reflection)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(isRight ? cx - 8 : cx - 10, cy - 12, 10, 14, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Secondary Specular Catchlight (Small sparkling dot)
    ctx.beginPath();
    ctx.arc(isRight ? cx + 10 : cx + 8, cy + 16, 5, 0, Math.PI * 2);
    ctx.fill();

    // Eyelashes & Upper Lid Line
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.arc(cx, cy - 10, 44, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  };

  drawEye(170, 240, false);
  drawEye(342, 240, true);

  // Eyebrows per personality
  ctx.strokeStyle = '#1e1b4b';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';

  if (colleagueId === 'boss') {
    // Sharp commanding arch
    ctx.beginPath();
    ctx.moveTo(125, 175);
    ctx.quadraticCurveTo(175, 145, 215, 175);
    ctx.moveTo(387, 175);
    ctx.quadraticCurveTo(337, 145, 297, 175);
    ctx.stroke();
  } else if (colleagueId === 'tuan') {
    // Thick bold confident brows
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(130, 165);
    ctx.lineTo(215, 160);
    ctx.moveTo(382, 165);
    ctx.lineTo(297, 160);
    ctx.stroke();
  } else if (colleagueId === 'nga') {
    // Sharp analytical brows
    ctx.beginPath();
    ctx.moveTo(130, 175);
    ctx.lineTo(215, 160);
    ctx.moveTo(382, 175);
    ctx.lineTo(297, 160);
    ctx.stroke();
    // Chic Red Glasses frames for Accountant Nga!
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 5;
    ctx.strokeRect(120, 200, 100, 75);
    ctx.strokeRect(292, 200, 100, 75);
    ctx.beginPath();
    ctx.moveTo(220, 235);
    ctx.lineTo(292, 235);
    ctx.stroke();
  } else if (colleagueId === 'linh') {
    // Cheerful cute gentle curve
    ctx.beginPath();
    ctx.moveTo(130, 165);
    ctx.quadraticCurveTo(175, 145, 215, 160);
    ctx.moveTo(382, 165);
    ctx.quadraticCurveTo(337, 145, 297, 160);
    ctx.stroke();
  } else {
    // Player: Determined sports focus
    ctx.beginPath();
    ctx.moveTo(135, 170);
    ctx.lineTo(215, 162);
    ctx.moveTo(377, 170);
    ctx.lineTo(297, 162);
    ctx.stroke();
  }

  // Anime Mouth (Smug / Cheerful sports grin)
  ctx.strokeStyle = '#0f172a';
  ctx.fillStyle = '#f43f5e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(256, 320, 24, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.fill();
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

function createDetailedPaddle(isPlayer: boolean, paddleId: string, accentColorHex: string): THREE.Group {
  const paddleGroup = new THREE.Group();

  // 1. Rounded Rectangle Blade
  const width = 0.28;
  const height = 0.38;
  const radius = 0.045;
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y + radius, x + radius, y);

  const extrudeSettings = {
    depth: 0.022,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.006,
    bevelThickness: 0.005
  };
  const bladeGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  bladeGeo.center();

  const faceTexture = generatePaddleFaceTexture(paddleId, accentColorHex);
  const faceMat = new THREE.MeshStandardMaterial({
    map: faceTexture,
    roughness: 0.32,
    metalness: 0.28,
    bumpMap: faceTexture,
    bumpScale: 0.015
  });
  const edgeGuardMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.85,
    metalness: 0.1
  });

  const bladeMesh = new THREE.Mesh(bladeGeo, [faceMat, edgeGuardMat]);
  bladeMesh.position.y = 0.26;
  paddleGroup.add(bladeMesh);

  // 2. Tapered Throat Neck
  const throatGeo = new THREE.CylinderGeometry(0.042, 0.028, 0.06, 12);
  const throatMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
  const throatMesh = new THREE.Mesh(throatGeo, throatMat);
  throatMesh.position.y = 0.06;
  paddleGroup.add(throatMesh);

  // 3. Handle with Perforated Overgrip Tape
  const handleGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.20, 16);
  const handleTexture = generateHandleGripTexture();
  const handleMat = new THREE.MeshStandardMaterial({
    map: handleTexture,
    roughness: 0.65,
    metalness: 0.15
  });
  const handleMesh = new THREE.Mesh(handleGeo, handleMat);
  handleMesh.position.y = -0.07;
  paddleGroup.add(handleMesh);

  // 4. Accent Finishing Band (Gold or Cyan Ring Tape)
  const bandGeo = new THREE.TorusGeometry(0.028, 0.005, 8, 16);
  const bandMat = new THREE.MeshStandardMaterial({
    color: isPlayer ? 0x38bdf8 : 0xfacc15,
    metalness: 0.8,
    roughness: 0.2
  });
  const bandMesh = new THREE.Mesh(bandGeo, bandMat);
  bandMesh.rotation.x = Math.PI / 2;
  bandMesh.position.y = 0.025;
  paddleGroup.add(bandMesh);

  // 5. Flared Rubber Butt Cap at Handle Base
  const buttGeo = new THREE.CylinderGeometry(0.034, 0.026, 0.03, 16);
  const buttMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9 });
  const buttMesh = new THREE.Mesh(buttGeo, buttMat);
  buttMesh.position.y = -0.175;
  paddleGroup.add(buttMesh);

  return paddleGroup;
}
