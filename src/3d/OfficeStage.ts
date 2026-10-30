import * as THREE from 'three';
import { ChibiCharacter } from './ChibiCharacter';

export interface Workstation {
  id: string;
  name: string;
  zone: string;
  emoji: string;
  position: THREE.Vector3;
  radius: number;
  type: 'desk' | 'printer' | 'fabric' | 'coffee' | 'shipping' | 'lab' | 'qc';
  mesh: THREE.Group;
  indicatorMesh: THREE.Mesh;
  billboardSprite?: THREE.Sprite;
}

export interface MapPickup {
  id: string;
  type: 'boba' | 'coffee' | 'bonus_cash';
  position: THREE.Vector3;
  mesh: THREE.Group;
  collected: boolean;
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
  public accountantNpc!: ChibiCharacter;
  public truckerNpc!: ChibiCharacter;

  // Stations & Pickups
  public stations: Workstation[] = [];
  public activeStation: Workstation | null = null;
  public pickups: MapPickup[] = [];

  // NPC Patrol Waypoints
  private bossWaypoints: THREE.Vector3[] = [];
  private currentBossWpIdx = 0;
  private bossVisionMesh!: THREE.Mesh;

  // Expansive World Bounds (64 x 50 units - 16x larger than before!)
  public readonly bounds = { minX: -30, maxX: 30, minZ: -23, maxZ: 23 };

  // Current Zone tracking
  public currentZoneName = 'Văn Phòng Điều Hành';

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init(): void {
    const width = Math.max(300, this.container.clientWidth || window.innerWidth);
    const height = Math.max(240, this.container.clientHeight || window.innerHeight);

    // 1. Scene & Cinematic Perspective Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#cbd5e1');
    this.scene.fog = new THREE.FogExp2('#cbd5e1', 0.018);

    const aspect = width / height;
    const initFov = aspect < 0.8 ? 52 : (aspect < 1.1 ? 46 : 42);
    this.camera = new THREE.PerspectiveCamera(initFov, aspect, 0.1, 150);
    this.camera.position.set(0, 14, 13);
    this.camera.lookAt(0, 0.8, 0);

    // 2. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 3. Lighting (Sunlight + Department Lamps)
    this.setupLighting();

    // 4. Large Multi-Zone World
    this.setupGrandCampus();

    // 5. Workstations across departments
    this.setupDepartmentWorkstations();

    // 6. Scattered Collectibles (Trà sữa, Tiền thưởng, Cà phê)
    this.setupPickups();

    // 7. Player Chibi (Spawns at Central Desk)
    this.player = new ChibiCharacter('#fed7aa', '#4f46e5', false, 'BẠN (MERCHANDISER)');
    this.player.group.position.set(-10, 0, -8);
    this.scene.add(this.player.group);

    // 8. NPC Colleagues
    this.setupColleagues();

    // 9. Resize Handling
    window.addEventListener('resize', this.onResize);
  }

  private setupLighting(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 0.95);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffedd5, 1.3);
    sun.position.set(24, 35, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 80;
    const sD = 35;
    sun.shadow.camera.left = -sD;
    sun.shadow.camera.right = sD;
    sun.shadow.camera.top = sD;
    sun.shadow.camera.bottom = -sD;
    sun.shadow.bias = -0.0008;
    this.scene.add(sun);

    // Warm zone lights
    const l1 = new THREE.PointLight(0xa78bfa, 1.2, 22);
    l1.position.set(-10, 5, -8);
    this.scene.add(l1);

    const l2 = new THREE.PointLight(0x38bdf8, 1.2, 24);
    l2.position.set(12, 5, -8);
    this.scene.add(l2);

    const l3 = new THREE.PointLight(0xf59e0b, 1.2, 24);
    l3.position.set(-12, 5, 10);
    this.scene.add(l3);
  }

  private setupGrandCampus(): void {
    // Huge Campus Ground
    const groundGeo = new THREE.PlaneGeometry(64, 50);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // ==================== ZONE 1: CORPORATE OFFICE (VĂN PHÒNG ĐIỀU HÀNH) ====================
    // Top-Left: [-26 to -2, -22 to -2]
    this.createZoneFloor(-14, -12, 24, 20, '#f8fafc', '#e2e8f0');
    this.createZoneSign(-14, 3.8, -21.5, '🏢 VĂN PHÒNG ĐIỀU HÀNH & MERCHANDISER', '#4f46e5');

    // Desks, Office Partitions & Potted Plants
    for (let i = 0; i < 3; i++) {
      this.createColleagueDesk(-18 + i * 5, -14);
      this.createColleagueDesk(-18 + i * 5, -9);
    }
    this.createWaterCooler(-3, -18);
    this.createPlant(-24, -20);
    this.createPlant(-4, -20);

    // Glass Meeting Room for Boss
    this.createMeetingRoom(-20, -18, 7, 5);

    // ==================== ZONE 2: COLOR LAB & CUTTING (PHÒNG LAB & XƯỞNG CẮT) ====================
    // Top-Right: [2 to 26, -22 to -2]
    this.createZoneFloor(14, -12, 24, 20, '#ecfdf5', '#a7f3d0');
    this.createZoneSign(14, 3.2, -21.5, '✂️ XƯỞNG CẮT RẬP & PHÒNG LAB MÀU D65', '#059669');

    // Cutting Tables
    this.createCuttingTable(8, -12);
    this.createCuttingTable(16, -12);
    this.createCuttingTable(8, -7);
    this.createCuttingTable(16, -7);

    // ==================== ZONE 3: MEGA FABRIC WAREHOUSE (KHO VẢI ĐẠI NGÀN) ====================
    // Bottom-Left: [-26 to -2, 2 to 22]
    this.createZoneFloor(-14, 12, 24, 20, '#fffbeb', '#fde68a');
    this.createZoneSign(-14, 3.2, 2.5, '🧵 KHO VẢI CUỘN & NGUYÊN PHỤ LIỆU', '#d97706');

    // Massive Storage Racks
    for (let r = 0; r < 3; r++) {
      this.createWarehouseRack(-22 + r * 7, 8);
      this.createWarehouseRack(-22 + r * 7, 16);
    }
    this.createForklift(-5, 14);

    // ==================== ZONE 4: LOGISTICS PORT & DOCK (CẢNG BIỂN & XUẤT CONT) ====================
    // Bottom-Right: [2 to 26, 2 to 22]
    this.createZoneFloor(14, 12, 24, 20, '#1e293b', '#334155');
    this.createZoneSign(14, 3.2, 2.5, '🚢 CẢNG XUẤT HÀNG & BÃI CONT 40HQ', '#0284c7');

    // 2 Giant Shipping Containers
    this.createShippingContainer(8, 12, '#0284c7', 'CÁT LÁI EXPRESS');
    this.createShippingContainer(18, 12, '#e11d48', 'MAERSK LINE 40HQ');
    this.createShippingContainer(14, 18, '#16a34a', 'ONE OCEAN NETWORK');

    // ==================== ZONE 5: CENTRAL PANTRY & CANTEEN LOUNGE ====================
    // Center: [-4 to 4, -4 to 4]
    this.createZoneFloor(0, 0, 10, 8, '#fdf4ff', '#f5d0fe');
    this.createZoneSign(0, 2.8, -3.6, '🧋 CĂN TIN TRÀ SỮA & PANTRY THƯ GIÃN', '#9333ea');
    this.createLoungeCoffeeBar(0, 0);

    // Perimeter Fences / Boundary Walls
    this.createPerimeterWalls();
  }

  private createZoneFloor(cx: number, cz: number, w: number, h: number, color1: string, color2: string): void {
    const geo = new THREE.PlaneGeometry(w, h);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = color2;
    ctx.lineWidth = 4;
    const step = 64;
    for (let x = 0; x <= 256; x += step) {
      ctx.moveTo(x, 0); ctx.lineTo(x, 256);
      ctx.moveTo(0, x); ctx.lineTo(256, x);
    }
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(w / 4, h / 4);

    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(cx, 0.01, cz);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  private createZoneSign(cx: number, cy: number, cz: number, text: string, color: string): void {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 80, 24);
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, 256, 58);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(4.2, 0.85, 1);
    sprite.position.set(cx, cy, cz);
    this.scene.add(sprite);
  }

  private createColleagueDesk(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.2), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
    top.position.y = 0.75;
    top.castShadow = true;
    g.add(top);

    // Partition Screen
    const part = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 0.05), new THREE.MeshStandardMaterial({ color: 0x818cf8 }));
    part.position.set(0, 1.05, -0.58);
    g.add(part);

    // Laptop & Monitor
    const mon = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.04), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    mon.position.set(0, 1.05, -0.2);
    g.add(mon);

    // Chair
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    chair.position.set(0, 0.35, 0.6);
    g.add(chair);

    this.scene.add(g);
  }

  private createMeetingRoom(x: number, z: number, w: number, h: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    // Glass walls
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1
    });

    const wall1 = new THREE.Mesh(new THREE.BoxGeometry(w, 2.4, 0.1), glassMat);
    wall1.position.set(0, 1.2, -h / 2);
    g.add(wall1);

    const wall2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.4, h), glassMat);
    wall2.position.set(-w / 2, 1.2, 0);
    g.add(wall2);

    // Meeting Table
    const table = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, 0.12, h * 0.5), new THREE.MeshStandardMaterial({ color: 0x92400e }));
    table.position.y = 0.8;
    g.add(table);

    this.scene.add(g);
  }

  private createCuttingTable(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const table = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.15, 1.8), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
    table.position.y = 0.85;
    table.castShadow = true;
    g.add(table);

    // Cloth layers on table
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 1.4), new THREE.MeshStandardMaterial({ color: 0xf43f5e }));
    cloth.position.set(0, 0.96, 0);
    g.add(cloth);

    this.scene.add(g);
  }

  private createWarehouseRack(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.3 });
    const rack = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.2, 1.2), frameMat);
    rack.position.y = 1.6;
    rack.castShadow = true;
    g.add(rack);

    // Shelves with rolls of fabric
    const colors = [0x3b82f6, 0xef4444, 0xf59e0b, 0x10b981, 0x8b5cf6, 0xec4899];
    for (let level = 0; level < 3; level++) {
      for (let i = 0; i < 3; i++) {
        const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.9, 12), new THREE.MeshStandardMaterial({ color: colors[(level * 3 + i) % colors.length] }));
        roll.rotation.z = Math.PI / 2;
        roll.position.set(-0.6 + i * 0.6, 0.7 + level * 0.95, 0);
        g.add(roll);
      }
    }

    this.scene.add(g);
  }

  private createShippingContainer(x: number, z: number, color: string, label: string): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const contGeo = new THREE.BoxGeometry(5.2, 2.6, 2.4);
    const contMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.2 });
    const cont = new THREE.Mesh(contGeo, contMat);
    cont.position.y = 1.3;
    cont.castShadow = true;
    g.add(cont);

    // Label Sprite
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 70;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 150, 45);

    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
    sprite.scale.set(3.2, 0.8, 1);
    sprite.position.set(0, 1.5, 1.25);
    g.add(sprite);

    this.scene.add(g);
  }

  private createForklift(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 1.1), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    body.position.y = 0.6;
    g.add(body);

    const forks = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.9), new THREE.MeshStandardMaterial({ color: 0x1f2937 }));
    forks.position.set(1.0, 0.8, 0);
    g.add(forks);

    this.scene.add(g);
  }

  private createLoungeCoffeeBar(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const bar = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.9, 20), new THREE.MeshStandardMaterial({ color: 0xa855f7 }));
    bar.position.y = 0.45;
    g.add(bar);

    // Giant Boba Mascot in center of Lounge
    const bobaCup = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.32, 1.0, 16), new THREE.MeshStandardMaterial({ color: 0xfef08a }));
    bobaCup.position.set(0, 1.4, 0);
    g.add(bobaCup);

    const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    straw.position.set(0.12, 1.9, 0);
    straw.rotation.z = -0.2;
    g.add(straw);

    this.scene.add(g);
  }

  private createPerimeterWalls(): void {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const h = 2.4;

    // North Wall
    const nw = new THREE.Mesh(new THREE.BoxGeometry(64, h, 0.6), wallMat);
    nw.position.set(0, h / 2, -25);
    this.scene.add(nw);

    // South Wall
    const sw = new THREE.Mesh(new THREE.BoxGeometry(64, h, 0.6), wallMat);
    sw.position.set(0, h / 2, 25);
    this.scene.add(sw);

    // West Wall
    const ww = new THREE.Mesh(new THREE.BoxGeometry(0.6, h, 50), wallMat);
    ww.position.set(-32, h / 2, 0);
    this.scene.add(ww);

    // East Wall
    const ew = new THREE.Mesh(new THREE.BoxGeometry(0.6, h, 50), wallMat);
    ew.position.set(32, h / 2, 0);
    this.scene.add(ew);
  }

  private createPlant(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.28, 0.6, 16), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
    pot.position.y = 0.3;
    g.add(pot);
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 12), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
    leaves.scale.set(1, 1.5, 1);
    leaves.position.y = 1.0;
    g.add(leaves);
    this.scene.add(g);
  }

  private createWaterCooler(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.1, 0.6), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    base.position.y = 0.55;
    g.add(base);
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.6, 12), new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 }));
    bottle.position.y = 1.35;
    g.add(bottle);
    this.scene.add(g);
  }

  private setupDepartmentWorkstations(): void {
    // 1. My Desk (Văn phòng)
    const deskG = new THREE.Group();
    deskG.position.set(-10, 0, -8);
    this.addStation('desk', 'Bàn Làm Việc Merchandiser', 'Văn Phòng Điều Hành', '💻', deskG.position, 2.2, deskG);

    // 2. Central Printer (Văn phòng)
    const printerG = new THREE.Group();
    printerG.position.set(-4, 0, -12);
    this.addStation('printer', 'Máy In Techpack & Hợp Đồng', 'Văn Phòng Điều Hành', '🖨️', printerG.position, 2.2, printerG);

    // 3. Cutting & Lab Station (Xưởng cắt & Lab)
    const labG = new THREE.Group();
    labG.position.set(12, 0, -10);
    this.addStation('lab', 'Phòng Lab Soi Màu D65', 'Xưởng Cắt & Lab', '🔬', labG.position, 2.4, labG);

    // 4. Warehouse Fabric Racks (Kho vải)
    const fabricG = new THREE.Group();
    fabricG.position.set(-14, 0, 10);
    this.addStation('fabric', 'Kệ Vải Thun & Phụ Liệu Spandex', 'Kho Vải Đại Ngàn', '🧵', fabricG.position, 2.5, fabricG);

    // 5. Canteen Boba Lounge (Khu Pantry trung tâm)
    const coffeeG = new THREE.Group();
    coffeeG.position.set(0, 0, 0);
    this.addStation('coffee', 'Quầy Trà Sữa & Cà Phê Năng Lượng', 'Căn Tin Trung Tâm', '🧋', coffeeG.position, 2.4, coffeeG);

    // 6. Logistics Shipping Port (Cảng Cont Cát Lái)
    const shipG = new THREE.Group();
    shipG.position.set(14, 0, 14);
    this.addStation('shipping', 'Cổng Xuất Cont Cát Lái', 'Cảng Biển & Xuất Khẩu', '🚢', shipG.position, 2.8, shipG);
  }

  private addStation(
    type: Workstation['type'],
    name: string,
    zone: string,
    emoji: string,
    pos: THREE.Vector3,
    radius: number,
    mesh: THREE.Group
  ): void {
    const ringGeo = new THREE.RingGeometry(radius * 0.65, radius * 0.82, 28);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const indicatorMesh = new THREE.Mesh(ringGeo, ringMat);
    indicatorMesh.rotation.x = -Math.PI / 2;
    indicatorMesh.position.set(pos.x, 0.03, pos.z);
    this.scene.add(indicatorMesh);

    // 3D Billboard Floating Tag
    const canvas = document.createElement('canvas');
    canvas.width = 340;
    canvas.height = 80;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.roundRect(8, 8, 324, 64, 20);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#facc15';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${emoji} ${name}`, 170, 48);

    const tex = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: tex, depthTest: true });
    const billboardSprite = new THREE.Sprite(spriteMat);
    billboardSprite.scale.set(1.9, 0.45, 1);
    billboardSprite.position.set(pos.x, 2.5, pos.z);
    this.scene.add(billboardSprite);

    this.stations.push({
      id: type,
      name,
      zone,
      emoji,
      position: pos.clone(),
      radius,
      type,
      mesh,
      indicatorMesh,
      billboardSprite
    });
  }

  private setupPickups(): void {
    const spawnPoints = [
      { x: -20, z: -10, type: 'boba' as const },
      { x: -8, z: 14, type: 'boba' as const },
      { x: 18, z: -8, type: 'coffee' as const },
      { x: 8, z: 8, type: 'bonus_cash' as const },
      { x: -22, z: 18, type: 'bonus_cash' as const },
      { x: 22, z: 16, type: 'boba' as const }
    ];

    for (let i = 0; i < spawnPoints.length; i++) {
      const p = spawnPoints[i];
      const g = new THREE.Group();
      g.position.set(p.x, 0.5, p.z);

      if (p.type === 'boba' || p.type === 'coffee') {
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.45, 12), new THREE.MeshStandardMaterial({ color: p.type === 'boba' ? 0xf472b6 : 0xfbbf24 }));
        g.add(cup);
      } else {
        const cash = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.25), new THREE.MeshStandardMaterial({ color: 0x22c55e }));
        g.add(cash);
      }

      this.scene.add(g);
      this.pickups.push({
        id: `pickup_${i}`,
        type: p.type,
        position: new THREE.Vector3(p.x, 0.5, p.z),
        mesh: g,
        collected: false
      });
    }
  }

  private setupColleagues(): void {
    // 1. Sếp Hùng (Patrols Executive Boardroom Corridor, away from player desk)
    this.bossNpc = new ChibiCharacter('#ffedd5', '#475569', true, 'SẾP HÙNG (ĐI TUẦN)');
    this.bossNpc.group.position.set(-20, 0, -16);
    this.bossNpc.moveSpeed = 1.9;
    this.scene.add(this.bossNpc.group);

    this.bossWaypoints = [
      new THREE.Vector3(-22, 0, -18),
      new THREE.Vector3(-16, 0, -18),
      new THREE.Vector3(-16, 0, -14),
      new THREE.Vector3(-22, 0, -14)
    ];

    const visionGeo = new THREE.RingGeometry(0.4, 2.6, 24);
    const visionMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
    this.bossVisionMesh = new THREE.Mesh(visionGeo, visionMat);
    this.bossVisionMesh.rotation.x = -Math.PI / 2;
    this.bossVisionMesh.position.y = 0.03;
    this.bossNpc.group.add(this.bossVisionMesh);

    // 2. Chị Nga Kế Toán (Stationed in Fabric Warehouse)
    this.accountantNpc = new ChibiCharacter('#fed7aa', '#dc2626', true, 'CHỊ NGA (KẾ TOÁN KHO)');
    this.accountantNpc.group.position.set(-12, 0, 10);
    this.scene.add(this.accountantNpc.group);

    // 3. Anh Tuấn Logistics (Stationed at Port Dock)
    this.truckerNpc = new ChibiCharacter('#fde047', '#0284c7', true, 'ANH TUẤN (TÀI XẾ CONT)');
    this.truckerNpc.group.position.set(12, 0, 12);
    this.scene.add(this.truckerNpc.group);
  }

  private onResize = (): void => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = Math.max(300, this.container.clientWidth || window.innerWidth);
    const height = Math.max(240, this.container.clientHeight || window.innerHeight);

    const aspect = width / height;
    this.camera.aspect = aspect;
    // On vertical portrait screens (aspect < 1.0), slightly widen FOV for a broader view
    this.camera.fov = aspect < 0.8 ? 52 : (aspect < 1.1 ? 46 : 42);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  update(delta: number, playerDirX: number, playerDirZ: number): void {
    // 1. Update Player
    this.player.update(delta, playerDirX, playerDirZ, this.bounds);

    // 2. Camera Smooth Follow (Dynamic Isometric Zoom)
    const pPos = this.player.getPosition();
    const targetCamX = pPos.x + 9.5;
    const targetCamY = 12.0;
    const targetCamZ = pPos.z + 10.0;

    this.camera.position.x += (targetCamX - this.camera.position.x) * 6 * delta;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 6 * delta;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 6 * delta;
    this.camera.lookAt(pPos.x, 0.9, pPos.z);

    // 3. Update Zone by Player Coordinates
    if (pPos.x < 0 && pPos.z < 0) this.currentZoneName = '🏢 Văn Phòng Điều Hành';
    else if (pPos.x >= 0 && pPos.z < 0) this.currentZoneName = '✂️ Xưởng Cắt & Phòng Lab';
    else if (pPos.x < 0 && pPos.z >= 0) this.currentZoneName = '🧵 Kho Vải Đại Ngàn';
    else this.currentZoneName = '🚢 Cảng Cont Cát Lái';

    // 4. Update Boss AI Patrol
    this.updateBossAI(delta);

    // 5. Workstations Proximity
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
        (st.indicatorMesh.material as THREE.MeshBasicMaterial).opacity = 0.85;
      } else {
        st.indicatorMesh.scale.set(1, 1, 1);
        (st.indicatorMesh.material as THREE.MeshBasicMaterial).opacity = 0.35;
      }
    }
    this.activeStation = closestStation;

    // 6. Floating Bobbing for Pickups
    for (const pu of this.pickups) {
      if (!pu.collected) {
        pu.mesh.rotation.y += delta * 2;
        pu.mesh.position.y = 0.5 + Math.sin(Date.now() * 0.005 + pu.position.x) * 0.1;
      }
    }
  }

  private updateBossAI(delta: number): void {
    if (!this.bossNpc || this.bossWaypoints.length === 0) return;

    const targetWp = this.bossWaypoints[this.currentBossWpIdx];
    const bPos = this.bossNpc.group.position;
    const dx = targetWp.x - bPos.x;
    const dz = targetWp.z - bPos.z;
    const dist = Math.hypot(dx, dz);

    if (dist < 0.3) {
      this.currentBossWpIdx = (this.currentBossWpIdx + 1) % this.bossWaypoints.length;
    } else {
      const dirX = dx / dist;
      const dirZ = dz / dist;
      this.bossNpc.update(delta, dirX, dirZ);
    }
  }

  isPlayerCaughtByBoss(): boolean {
    const pPos = this.player.getPosition();
    const bPos = this.bossNpc.group.position;
    return pPos.distanceTo(bPos) < 2.6;
  }

  checkPickupCollision(callback: (type: MapPickup['type']) => void): void {
    const pPos = this.player.getPosition();
    for (const pu of this.pickups) {
      if (!pu.collected && pPos.distanceTo(pu.position) < 1.4) {
        pu.collected = true;
        this.scene.remove(pu.mesh);
        callback(pu.type);
      }
    }
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
