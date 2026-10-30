import * as THREE from 'three';
import { ChibiCharacter } from './ChibiCharacter';

export interface Workstation {
  id: string;
  name: string;
  emoji: string;
  position: THREE.Vector3;
  radius: number;
  type: 'desk' | 'printer' | 'fabric' | 'coffee' | 'shipping';
  mesh: THREE.Group;
  indicatorMesh: THREE.Mesh;
  billboardSprite?: THREE.Sprite;
}

export class OfficeStage {
  public container: HTMLElement;
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public renderer!: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private isDestroyed = false;

  // Characters
  public player!: ChibiCharacter;
  public bossNpc!: ChibiCharacter;

  // Stations
  public stations: Workstation[] = [];
  public activeStation: Workstation | null = null;

  // Boss Patrol
  private bossWaypoints: THREE.Vector3[] = [];
  private currentWaypointIdx = 0;
  private bossVisionMesh!: THREE.Mesh;

  // Room Bounds
  public readonly bounds = { minX: -6.8, maxX: 6.8, minZ: -5.2, maxZ: 5.6 };

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init(): void {
    const width = Math.max(300, this.container.clientWidth || window.innerWidth);
    const height = Math.max(240, this.container.clientHeight || window.innerHeight);

    // 1. Scene & Perspective Camera (Smooth Isometric Feel)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#ede9fe');

    const aspect = width / height;
    this.camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
    this.camera.position.set(8.5, 11, 8.5);
    this.camera.lookAt(0, 0.8, 0);

    // 2. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 3. Lighting
    this.setupLighting();

    // 4. Room Floor, Walls, Decor
    this.setupRoom();

    // 5. Workstations
    this.setupWorkstations();

    // 6. Player Chibi (Spawns at center desk)
    this.player = new ChibiCharacter('#fed7aa', '#4f46e5', false, 'BẠN (MERCHANDISER)');
    this.player.group.position.set(-2.5, 0, -1.0);
    this.scene.add(this.player.group);

    // 7. Boss Sếp Hùng NPC
    this.setupBoss();

    // 8. Handle Resize
    window.addEventListener('resize', this.onResize);
  }

  private setupLighting(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 0.95);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff7ed, 1.35);
    sun.position.set(10, 16, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 35;
    const shadowD = 9;
    sun.shadow.camera.left = -shadowD;
    sun.shadow.camera.right = shadowD;
    sun.shadow.camera.top = shadowD;
    sun.shadow.camera.bottom = -shadowD;
    sun.shadow.bias = -0.001;
    this.scene.add(sun);

    const warmLight = new THREE.PointLight(0xa78bfa, 1.4, 16);
    warmLight.position.set(0, 4.5, 0);
    this.scene.add(warmLight);
  }

  private setupRoom(): void {
    // Floor
    const floorGeo = new THREE.PlaneGeometry(16, 13);
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const fCtx = floorCanvas.getContext('2d')!;
    fCtx.fillStyle = '#f8fafc';
    fCtx.fillRect(0, 0, 512, 512);

    fCtx.strokeStyle = '#e2e8f0';
    fCtx.lineWidth = 4;
    const step = 64;
    for (let x = 0; x <= 512; x += step) {
      fCtx.moveTo(x, 0); fCtx.lineTo(x, 512);
      fCtx.moveTo(0, x); fCtx.lineTo(512, x);
    }
    fCtx.stroke();

    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(5, 4);

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.55,
      metalness: 0.05
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xdbeafe, roughness: 0.7 });
    const skirtingMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd });

    // Back Wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(16, 2.6, 0.4), wallMat);
    backWall.position.set(0, 1.3, -6.6);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    const backSkirt = new THREE.Mesh(new THREE.BoxGeometry(16, 0.25, 0.46), skirtingMat);
    backSkirt.position.set(0, 0.125, -6.58);
    this.scene.add(backSkirt);

    // Left Wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.6, 13), wallMat);
    leftWall.position.set(-8.1, 1.3, 0);
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);

    // Motivational Poster
    const posterCanvas = document.createElement('canvas');
    posterCanvas.width = 440;
    posterCanvas.height = 200;
    const pCtx = posterCanvas.getContext('2d')!;
    pCtx.fillStyle = '#4f46e5';
    pCtx.fillRect(0, 0, 440, 200);
    pCtx.fillStyle = '#facc15';
    pCtx.font = 'bold 30px Nunito, sans-serif';
    pCtx.textAlign = 'center';
    pCtx.fillText('CÒN THỞ LÀ CÒN KPI ⚡', 220, 85);
    pCtx.fillStyle = '#ffffff';
    pCtx.font = 'bold 20px Nunito, sans-serif';
    pCtx.fillText('Dệt May & XNK Vững Bước Thành Công!', 220, 140);

    const posterTex = new THREE.CanvasTexture(posterCanvas);
    const poster = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.6), new THREE.MeshBasicMaterial({ map: posterTex }));
    poster.position.set(0, 1.45, -6.38);
    this.scene.add(poster);

    // Plants
    this.createPlant(-7.2, -5.2);
    this.createPlant(7.2, -5.2);
  }

  private createPlant(x: number, z: number): void {
    const plantGroup = new THREE.Group();
    plantGroup.position.set(x, 0, z);

    const potMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.26, 0.58, 16), potMat);
    pot.position.y = 0.29;
    pot.castShadow = true;
    plantGroup.add(pot);

    const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.48, 14, 14), leafMat);
    leaves.scale.set(1, 1.45, 1);
    leaves.position.y = 0.95;
    leaves.castShadow = true;
    plantGroup.add(leaves);

    this.scene.add(plantGroup);
  }

  private setupWorkstations(): void {
    // 1. My Desk
    const deskGroup = this.createDeskMesh();
    deskGroup.position.set(-3.6, 0, -3.0);
    this.scene.add(deskGroup);
    this.addStation('desk', 'Bàn Làm Việc', '💻', deskGroup.position, 2.0, deskGroup);

    // 2. Printer Station
    const printerGroup = this.createPrinterMesh();
    printerGroup.position.set(3.6, 0, -3.0);
    this.scene.add(printerGroup);
    this.addStation('printer', 'Máy In Techpack', '🖨️', printerGroup.position, 2.0, printerGroup);

    // 3. Fabric Warehouse Shelf
    const shelfGroup = this.createShelfMesh();
    shelfGroup.position.set(-4.8, 0, 1.8);
    this.scene.add(shelfGroup);
    this.addStation('fabric', 'Kho Vải & Phụ Liệu', '🧵', shelfGroup.position, 2.1, shelfGroup);

    // 4. Pantry & Boba Bar
    const pantryGroup = this.createPantryMesh();
    pantryGroup.position.set(4.8, 0, 1.8);
    this.scene.add(pantryGroup);
    this.addStation('coffee', 'Quầy Trà Sữa & Cà Phê', '🧋', pantryGroup.position, 2.1, pantryGroup);

    // 5. Shipping Bay
    const shipGroup = this.createShippingBayMesh();
    shipGroup.position.set(0, 0, 4.8);
    this.scene.add(shipGroup);
    this.addStation('shipping', 'Cửa Cảng Xuất Hàng Cont', '🚢', shipGroup.position, 2.4, shipGroup);
  }

  private addStation(
    type: Workstation['type'],
    name: string,
    emoji: string,
    pos: THREE.Vector3,
    radius: number,
    mesh: THREE.Group
  ): void {
    // Floor Ring Indicator
    const ringGeo = new THREE.RingGeometry(radius * 0.65, radius * 0.82, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const indicatorMesh = new THREE.Mesh(ringGeo, ringMat);
    indicatorMesh.rotation.x = -Math.PI / 2;
    indicatorMesh.position.set(pos.x, 0.02, pos.z);
    this.scene.add(indicatorMesh);

    // Floating 3D Billboard Label
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 70;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.roundRect(8, 8, 264, 54, 20);
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#facc15';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${emoji} ${name}`, 140, 44);

    const tex = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
    const billboardSprite = new THREE.Sprite(spriteMat);
    billboardSprite.scale.set(1.5, 0.38, 1);
    billboardSprite.position.set(pos.x, 1.85, pos.z);
    this.scene.add(billboardSprite);

    this.stations.push({
      id: type,
      name,
      emoji,
      position: pos.clone(),
      radius,
      type,
      mesh,
      indicatorMesh,
      billboardSprite
    });
  }

  private createDeskMesh(): THREE.Group {
    const g = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.4 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.12, 1.2), woodMat);
    top.position.y = 0.8;
    top.castShadow = true;
    g.add(top);

    const legMat = new THREE.MeshStandardMaterial({ color: 0x1f2937 });
    const positions = [[-0.95, 0.4, -0.5], [0.95, 0.4, -0.5], [-0.95, 0.4, 0.5], [0.95, 0.4, 0.5]];
    for (const [x, y, z] of positions) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.1), legMat);
      leg.position.set(x, y, z);
      g.add(leg);
    }

    // Laptop
    const laptop = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.38), legMat);
    laptop.position.set(0, 0.88, 0);
    g.add(laptop);

    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.03), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    screen.position.set(0, 1.05, -0.17);
    screen.rotation.x = 0.18;
    g.add(screen);

    return g;
  }

  private createPrinterMesh(): THREE.Group {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 1.0), bodyMat);
    body.position.y = 0.55;
    body.castShadow = true;
    g.add(body);

    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.5), new THREE.MeshStandardMaterial({ color: 0x1f2937 }));
    tray.position.set(0, 1.14, 0.1);
    g.add(tray);

    const led = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
    led.position.set(0.4, 1.15, 0.4);
    g.add(led);

    return g;
  }

  private createShelfMesh(): THREE.Group {
    const g = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 0.8), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    frame.position.y = 0.8;
    frame.castShadow = true;
    g.add(frame);

    const colors = [0x3b82f6, 0xef4444, 0xf59e0b, 0x10b981];
    for (let i = 0; i < 4; i++) {
      const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.65, 12), new THREE.MeshStandardMaterial({ color: colors[i % colors.length] }));
      roll.rotation.z = Math.PI / 2;
      roll.position.set(-0.45 + (i % 2) * 0.9, 0.5 + Math.floor(i / 2) * 0.65, 0);
      g.add(roll);
    }
    return g;
  }

  private createPantryMesh(): THREE.Group {
    const g = new THREE.Group();
    const counter = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.9), new THREE.MeshStandardMaterial({ color: 0xe0e7ff }));
    counter.position.y = 0.45;
    counter.castShadow = true;
    g.add(counter);

    const coffeeMachine = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, 0.4), new THREE.MeshStandardMaterial({ color: 0x9333ea }));
    coffeeMachine.position.set(-0.35, 1.15, 0);
    g.add(coffeeMachine);

    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.28, 12), new THREE.MeshStandardMaterial({ color: 0xfef08a }));
    cup.position.set(0.35, 1.04, 0);
    g.add(cup);

    return g;
  }

  private createShippingBayMesh(): THREE.Group {
    const g = new THREE.Group();
    const pallet = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.16, 1.4), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
    pallet.position.y = 0.08;
    g.add(pallet);

    const box = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 1.0), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
    box.position.set(0, 0.76, 0);
    box.castShadow = true;
    g.add(box);

    return g;
  }

  private setupBoss(): void {
    this.bossNpc = new ChibiCharacter('#ffedd5', '#475569', true, 'SẾP HÙNG (ĐI TUẦN)');
    this.bossNpc.group.position.set(1.5, 0, 0);
    this.bossNpc.moveSpeed = 2.0;
    this.scene.add(this.bossNpc.group);

    this.bossWaypoints = [
      new THREE.Vector3(-1.8, 0, -1.0),
      new THREE.Vector3(1.8, 0, -1.0),
      new THREE.Vector3(2.2, 0, 2.4),
      new THREE.Vector3(-2.2, 0, 2.4)
    ];

    const visionGeo = new THREE.RingGeometry(0.3, 2.3, 24);
    const visionMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    });
    this.bossVisionMesh = new THREE.Mesh(visionGeo, visionMat);
    this.bossVisionMesh.rotation.x = -Math.PI / 2;
    this.bossVisionMesh.position.y = 0.03;
    this.bossNpc.group.add(this.bossVisionMesh);
  }

  private onResize = (): void => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = Math.max(300, this.container.clientWidth || window.innerWidth);
    const height = Math.max(240, this.container.clientHeight || window.innerHeight);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  update(delta: number, playerDirX: number, playerDirZ: number): void {
    // 1. Update Player
    this.player.update(delta, playerDirX, playerDirZ, this.bounds);

    // 2. Camera Follows Player Smoothly (Player is ALWAYS in center)
    const targetCamX = this.player.group.position.x + 8.2;
    const targetCamY = 10.5;
    const targetCamZ = this.player.group.position.z + 8.2;
    this.camera.position.x += (targetCamX - this.camera.position.x) * 6 * delta;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 6 * delta;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 6 * delta;
    this.camera.lookAt(this.player.group.position.x, 0.8, this.player.group.position.z);

    // 3. Update Boss AI Patrol
    this.updateBossAI(delta);

    // 4. Check Workstations Distance
    const pPos = this.player.getPosition();
    let closestStation: Workstation | null = null;
    let minDist = Infinity;

    for (const st of this.stations) {
      const dist = pPos.distanceTo(st.position);
      if (dist < st.radius && dist < minDist) {
        minDist = dist;
        closestStation = st;
      }

      if (st === closestStation) {
        st.indicatorMesh.scale.setScalar(1 + Math.sin(Date.now() * 0.008) * 0.12);
        (st.indicatorMesh.material as THREE.MeshBasicMaterial).opacity = 0.8;
        if (st.billboardSprite) {
          st.billboardSprite.scale.set(1.7, 0.43, 1);
        }
      } else {
        st.indicatorMesh.scale.set(1, 1, 1);
        (st.indicatorMesh.material as THREE.MeshBasicMaterial).opacity = 0.25;
        if (st.billboardSprite) {
          st.billboardSprite.scale.set(1.4, 0.35, 1);
        }
      }
    }
    this.activeStation = closestStation;
  }

  private updateBossAI(delta: number): void {
    if (!this.bossNpc || this.bossWaypoints.length === 0) return;

    const targetWp = this.bossWaypoints[this.currentWaypointIdx];
    const bPos = this.bossNpc.group.position;
    const dx = targetWp.x - bPos.x;
    const dz = targetWp.z - bPos.z;
    const dist = Math.hypot(dx, dz);

    if (dist < 0.25) {
      this.currentWaypointIdx = (this.currentWaypointIdx + 1) % this.bossWaypoints.length;
    } else {
      const dirX = dx / dist;
      const dirZ = dz / dist;
      this.bossNpc.update(delta, dirX, dirZ);
    }
  }

  isPlayerCaughtByBoss(): boolean {
    const pPos = this.player.getPosition();
    const bPos = this.bossNpc.group.position;
    const dist = pPos.distanceTo(bPos);
    return dist < 2.2;
  }

  renderScene(): void {
    if (this.isDestroyed || !this.renderer) return;
    this.renderer.render(this.scene, this.camera);
  }

  destroy(): void {
    this.isDestroyed = true;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onResize);
    this.renderer?.dispose();
    this.container.innerHTML = '';
  }
}
