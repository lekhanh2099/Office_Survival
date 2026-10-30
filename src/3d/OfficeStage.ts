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
}

export class OfficeStage {
  public container: HTMLElement;
  public scene!: THREE.Scene;
  public camera!: THREE.OrthographicCamera;
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
  public readonly bounds = { minX: -6.5, maxX: 6.5, minZ: -4.8, maxZ: 5.2 };

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init(): void {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene & Isometric Orthographic Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#ede9fe');

    const aspect = width / height;
    const d = 6.2;
    this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 100);
    this.camera.position.set(14, 15, 14);
    this.camera.lookAt(0, 0.5, 0);

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

    // 6. Player Chibi
    this.player = new ChibiCharacter('#fed7aa', '#3b82f6', false);
    this.player.group.position.set(-3.5, 0, -1.2);
    this.scene.add(this.player.group);

    // 7. Boss Sếp Hùng NPC
    this.setupBoss();

    // 8. Handle Resize
    window.addEventListener('resize', this.onResize);
  }

  private setupLighting(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 0.92);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff5ea, 1.4);
    sun.position.set(12, 18, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 40;
    const shadowD = 10;
    sun.shadow.camera.left = -shadowD;
    sun.shadow.camera.right = shadowD;
    sun.shadow.camera.top = shadowD;
    sun.shadow.camera.bottom = -shadowD;
    sun.shadow.bias = -0.001;
    this.scene.add(sun);

    // Cozy interior light
    const lamp = new THREE.PointLight(0xa78bfa, 1.2, 14);
    lamp.position.set(0, 4, 0);
    this.scene.add(lamp);
  }

  private setupRoom(): void {
    // Floor
    const floorGeo = new THREE.PlaneGeometry(15, 12);
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const fCtx = floorCanvas.getContext('2d')!;
    fCtx.fillStyle = '#f8fafc';
    fCtx.fillRect(0, 0, 512, 512);

    // Subtle checkered parquet lines
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
      roughness: 0.6,
      metalness: 0.05
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Walls (Cutaway low walls for isometric clarity)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xdbeafe, roughness: 0.7 });
    const skirtingMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd });

    // Back Wall
    const backWallGeo = new THREE.BoxGeometry(15, 2.5, 0.4);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 1.25, -6.2);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    const backSkirtGeo = new THREE.BoxGeometry(15, 0.25, 0.46);
    const backSkirt = new THREE.Mesh(backSkirtGeo, skirtingMat);
    backSkirt.position.set(0, 0.125, -6.18);
    this.scene.add(backSkirt);

    // Left Wall
    const leftWallGeo = new THREE.BoxGeometry(0.4, 2.5, 12);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-7.7, 1.25, 0);
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);

    // Motivational Poster on Back Wall
    const posterCanvas = document.createElement('canvas');
    posterCanvas.width = 400;
    posterCanvas.height = 200;
    const pCtx = posterCanvas.getContext('2d')!;
    pCtx.fillStyle = '#4f46e5';
    pCtx.fillRect(0, 0, 400, 200);
    pCtx.fillStyle = '#ffffff';
    pCtx.font = 'bold 28px sans-serif';
    pCtx.textAlign = 'center';
    pCtx.fillText('CÒN THỞ LÀ CÒN KPI ⚡', 200, 90);
    pCtx.font = '20px sans-serif';
    pCtx.fillText('XNK Dệt May Không Sợ Deadline!', 200, 140);

    const posterTex = new THREE.CanvasTexture(posterCanvas);
    const posterGeo = new THREE.PlaneGeometry(3.2, 1.6);
    const posterMat = new THREE.MeshBasicMaterial({ map: posterTex });
    const poster = new THREE.Mesh(posterGeo, posterMat);
    poster.position.set(0, 1.4, -5.98);
    this.scene.add(poster);

    // Potted Plants (Decor)
    this.createPlant(-6.8, -4.8);
    this.createPlant(6.8, -4.8);
  }

  private createPlant(x: number, z: number): void {
    const plantGroup = new THREE.Group();
    plantGroup.position.set(x, 0, z);

    // Pot
    const potGeo = new THREE.CylinderGeometry(0.35, 0.25, 0.55, 16);
    const potMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = 0.275;
    pot.castShadow = true;
    plantGroup.add(pot);

    // Foliage (Cute rounded cartoon leaves)
    const leafGeo = new THREE.SphereGeometry(0.45, 12, 12);
    leafGeo.scale(1, 1.4, 1);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });
    const leaves = new THREE.Mesh(leafGeo, leafMat);
    leaves.position.y = 0.9;
    leaves.castShadow = true;
    plantGroup.add(leaves);

    this.scene.add(plantGroup);
  }

  private setupWorkstations(): void {
    // 1. My Desk (Nhận đơn & Gõ máy tính)
    const deskGroup = this.createDeskMesh();
    deskGroup.position.set(-3.8, 0, -3.2);
    this.scene.add(deskGroup);
    this.addStation('desk', 'Bàn Làm Việc', '💻', deskGroup.position, 1.8, deskGroup);

    // 2. Printer Station (Máy in Techpack)
    const printerGroup = this.createPrinterMesh();
    printerGroup.position.set(3.8, 0, -3.2);
    this.scene.add(printerGroup);
    this.addStation('printer', 'Máy In Techpack', '🖨️', printerGroup.position, 1.8, printerGroup);

    // 3. Fabric Warehouse Shelf (Kệ Vải & Phụ Liệu)
    const shelfGroup = this.createShelfMesh();
    shelfGroup.position.set(-4.6, 0, 1.8);
    this.scene.add(shelfGroup);
    this.addStation('fabric', 'Kho Vải & Phụ Liệu', '🧵', shelfGroup.position, 1.9, shelfGroup);

    // 4. Pantry & Coffee Bar (Góc Trà Sữa & Cà Phê)
    const pantryGroup = this.createPantryMesh();
    pantryGroup.position.set(4.6, 0, 1.8);
    this.scene.add(pantryGroup);
    this.addStation('coffee', 'Quầy Trà Sữa & Cà Phê', '🧋', pantryGroup.position, 1.9, pantryGroup);

    // 5. Shipping Bay / Exit (Cửa Cảng Xuất Hàng Cont)
    const shipGroup = this.createShippingBayMesh();
    shipGroup.position.set(0, 0, 4.6);
    this.scene.add(shipGroup);
    this.addStation('shipping', 'Cửa Cảng Xuất Hàng Cont', '🚢', shipGroup.position, 2.2, shipGroup);
  }

  private addStation(
    type: Workstation['type'],
    name: string,
    emoji: string,
    pos: THREE.Vector3,
    radius: number,
    mesh: THREE.Group
  ): void {
    // Floating Floor Indicator Ring
    const ringGeo = new THREE.RingGeometry(radius * 0.7, radius * 0.85, 24);
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

    this.stations.push({
      id: type,
      name,
      emoji,
      position: pos.clone(),
      radius,
      type,
      mesh,
      indicatorMesh
    });
  }

  private createDeskMesh(): THREE.Group {
    const g = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.4 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 1.2), woodMat);
    top.position.y = 0.8;
    top.castShadow = true;
    g.add(top);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1f2937 });
    const positions = [[-0.9, 0.4, -0.5], [0.9, 0.4, -0.5], [-0.9, 0.4, 0.5], [0.9, 0.4, 0.5]];
    for (const [x, y, z] of positions) {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, y, z);
      g.add(leg);
    }

    // Laptop
    const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.03, 0.36), legMat);
    laptopBase.position.set(0, 0.88, 0);
    g.add(laptopBase);

    const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.34, 0.03), screenMat);
    screen.position.set(0, 1.04, -0.16);
    screen.rotation.x = 0.18;
    g.add(screen);

    return g;
  }

  private createPrinterMesh(): THREE.Group {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 1.0), bodyMat);
    body.position.y = 0.55;
    body.castShadow = true;
    g.add(body);

    // Paper tray & Screen
    const trayMat = new THREE.MeshStandardMaterial({ color: 0x1f2937 });
    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.5), trayMat);
    tray.position.set(0, 1.14, 0.1);
    g.add(tray);

    const ledMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), ledMat);
    led.position.set(0.4, 1.15, 0.4);
    g.add(led);

    return g;
  }

  private createShelfMesh(): THREE.Group {
    const g = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 0.8), frameMat);
    frame.position.y = 0.8;
    frame.castShadow = true;
    g.add(frame);

    // Colorful Fabric Rolls on shelves
    const colors = [0x3b82f6, 0xef4444, 0xf59e0b, 0x10b981];
    for (let i = 0; i < 4; i++) {
      const rollGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.65, 12);
      const rollMat = new THREE.MeshStandardMaterial({ color: colors[i % colors.length] });
      const roll = new THREE.Mesh(rollGeo, rollMat);
      roll.rotation.z = Math.PI / 2;
      roll.position.set(-0.45 + (i % 2) * 0.9, 0.5 + Math.floor(i / 2) * 0.65, 0);
      g.add(roll);
    }

    return g;
  }

  private createPantryMesh(): THREE.Group {
    const g = new THREE.Group();
    const counterMat = new THREE.MeshStandardMaterial({ color: 0xe0e7ff, roughness: 0.4 });
    const counter = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.9), counterMat);
    counter.position.y = 0.45;
    counter.castShadow = true;
    g.add(counter);

    // Coffee machine
    const coffeeGeo = new THREE.BoxGeometry(0.45, 0.5, 0.4);
    const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x9333ea });
    const coffeeMachine = new THREE.Mesh(coffeeGeo, coffeeMat);
    coffeeMachine.position.set(-0.35, 1.15, 0);
    g.add(coffeeMachine);

    // Boba cup
    const cupGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.28, 12);
    const cupMat = new THREE.MeshStandardMaterial({ color: 0xfef08a });
    const cup = new THREE.Mesh(cupGeo, cupMat);
    cup.position.set(0.35, 1.04, 0);
    g.add(cup);

    return g;
  }

  private createShippingBayMesh(): THREE.Group {
    const g = new THREE.Group();

    // Wooden Pallet
    const palletGeo = new THREE.BoxGeometry(2.4, 0.16, 1.4);
    const palletMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
    const pallet = new THREE.Mesh(palletGeo, palletMat);
    pallet.position.y = 0.08;
    g.add(pallet);

    // Shipping Container Box
    const boxGeo = new THREE.BoxGeometry(1.8, 1.2, 1.0);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 0.76, 0);
    box.castShadow = true;
    g.add(box);

    return g;
  }

  private setupBoss(): void {
    // Sếp Hùng with gray hair and red tie
    this.bossNpc = new ChibiCharacter('#ffedd5', '#475569', true);
    this.bossNpc.group.position.set(0, 0, 0);
    this.bossNpc.moveSpeed = 1.9; // Slow authoritative walk
    this.scene.add(this.bossNpc.group);

    // Boss Waypoints Patrol
    this.bossWaypoints = [
      new THREE.Vector3(-1.8, 0, -1.2),
      new THREE.Vector3(1.8, 0, -1.2),
      new THREE.Vector3(2.2, 0, 2.2),
      new THREE.Vector3(-2.2, 0, 2.2)
    ];

    // Boss Vision Cone Area
    const visionGeo = new THREE.RingGeometry(0.3, 2.4, 24);
    const visionMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    });
    this.bossVisionMesh = new THREE.Mesh(visionGeo, visionMat);
    this.bossVisionMesh.rotation.x = -Math.PI / 2;
    this.bossVisionMesh.position.y = 0.03;
    this.bossNpc.group.add(this.bossVisionMesh);
  }

  private onResize = (): void => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const aspect = width / height;
    const d = 6.2;

    this.camera.left = -d * aspect;
    this.camera.right = d * aspect;
    this.camera.top = d;
    this.camera.bottom = -d;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  };

  update(delta: number, playerDirX: number, playerDirZ: number): void {
    // 1. Update Player
    this.player.update(delta, playerDirX, playerDirZ, this.bounds);

    // Smooth Camera Follow
    const targetCamX = 14 + this.player.group.position.x * 0.45;
    const targetCamZ = 14 + this.player.group.position.z * 0.45;
    this.camera.position.x += (targetCamX - this.camera.position.x) * 4 * delta;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 4 * delta;

    // 2. Update Boss AI Patrol
    this.updateBossAI(delta);

    // 3. Check Workstations Distance
    const pPos = this.player.getPosition();
    let closestStation: Workstation | null = null;
    let minDist = Infinity;

    for (const st of this.stations) {
      const dist = pPos.distanceTo(st.position);
      if (dist < st.radius && dist < minDist) {
        minDist = dist;
        closestStation = st;
      }

      // Pulse Indicator
      if (st === closestStation) {
        st.indicatorMesh.scale.setScalar(1 + Math.sin(Date.now() * 0.006) * 0.08);
        (st.indicatorMesh.material as THREE.MeshBasicMaterial).opacity = 0.65;
      } else {
        st.indicatorMesh.scale.set(1, 1, 1);
        (st.indicatorMesh.material as THREE.MeshBasicMaterial).opacity = 0.25;
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
    return dist < 2.3;
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
