import * as THREE from 'three';
import { ChibiCharacter } from './ChibiCharacter';

export interface Workstation {
  id: string;
  name: string;
  zone: string;
  emoji: string;
  position: THREE.Vector3;
  radius: number;
  type:
    | 'desk'
    | 'printer'
    | 'fabric'
    | 'coffee'
    | 'shipping'
    | 'lab'
    | 'qc'
    | 'altar'
    | 'water'
    | 'server'
    | 'lamp'
    | 'sofa'
    | 'whiteboard'
    | 'mirror'
    | 'boss_desk';
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

export interface ColleagueSpeech {
  speaker: string;
  role: string;
  emoji: string;
  text: string;
  avatarBg: string;
  worldPos: THREE.Vector3;
}

export interface ObstacleAABB {
  name: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
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

  // Solid Collision Obstacles
  public obstacles: ObstacleAABB[] = [];

  // Interactive Lamp Light Reference
  public floorLampLight!: THREE.PointLight;
  public isFloorLampOn = true;

  // NPC Patrol Waypoints
  private bossWaypoints: THREE.Vector3[] = [];
  private currentBossWpIdx = 0;
  private bossVisionMesh!: THREE.Mesh;

  // Animated Server LEDs
  private ledMeshes: { mesh: THREE.Mesh; baseColor: number; speed: number; offset: number }[] = [];

  // Campus bounds
  public readonly bounds = { minX: -28.5, maxX: 28.5, minZ: -23.5, maxZ: 23.5 };

  // Current Zone tracking
  public currentZoneName = 'Văn Phòng Điều Hành';

  // Camera Mode: 'follow' (action camera) or 'overview' (panoramic diorama)
  public cameraMode: 'follow' | 'overview' = 'follow';

  // Dynamic Colleague Speech Bubble System
  public activeSpeech: ColleagueSpeech | null = null;
  private speechTimer = 3.0;
  private speechLibrary: Omit<ColleagueSpeech, 'worldPos'>[] = [
    {
      speaker: 'Sếp Hùng',
      role: 'Giám Đốc Điều Hành',
      emoji: '👔',
      avatarBg: '#475569',
      text: 'Đơn 500 áo Polo đi New York tuyệt đối không được rớt AQL 2.5 nhé!'
    },
    {
      speaker: 'Sếp Hùng',
      role: 'Giám Đốc Điều Hành',
      emoji: '👔',
      avatarBg: '#475569',
      text: 'Server pipeline đang test tự động, ai push code lỗi là trực đêm đấy!'
    },
    {
      speaker: 'Chị Nga',
      role: 'Kế Toán Kho',
      emoji: '🧮',
      avatarBg: '#dc2626',
      text: 'Cuối quý lệch 3000m vải thun, ai ký phiếu xuất mang qua chị duyệt!'
    },
    {
      speaker: 'Chị Nga',
      role: 'Kế Toán Kho',
      emoji: '🧋',
      avatarBg: '#dc2626',
      text: 'Ai order trà sữa Phúc Long không? Chị đang ghép đơn freeship này!'
    },
    {
      speaker: 'Anh Tuấn',
      role: 'Tài Xế Cont Cát Lái',
      emoji: '🚛',
      avatarBg: '#0284c7',
      text: 'Cầu Phú Mỹ kẹt xe cont dài 3 cây số, chuẩn bị bốc hàng thần tốc!'
    },
    {
      speaker: 'Anh Tuấn',
      role: 'Tài Xế Cont Cát Lái',
      emoji: '🚢',
      avatarBg: '#0284c7',
      text: 'Cont 40HQ cập cảng Cát Lái rồi, giấy tờ xuất khẩu xong chưa em?!'
    },
    {
      speaker: 'Thần Tài Thổ Địa',
      role: 'Tâm Linh Công Sở',
      emoji: '🙏',
      avatarBg: '#b91c1c',
      text: 'Vía may tài lộc, đơn hàng hanh thông! Nhớ thắp hương xả stress nhé!'
    }
  ];

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init(): void {
    const width = Math.max(300, this.container.clientWidth || window.innerWidth);
    const height = Math.max(240, this.container.clientHeight || window.innerHeight);

    // 1. Scene with Deep Atmospheric Midnight Ambiance
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0c101c');
    this.scene.fog = new THREE.FogExp2('#0c101c', 0.013);

    const aspect = width / height;
    const initFov = aspect < 0.8 ? 52 : (aspect < 1.1 ? 46 : 42);
    this.camera = new THREE.PerspectiveCamera(initFov, aspect, 0.1, 150);
    this.camera.position.set(0, 14, 13);
    this.camera.lookAt(0, 0.8, 0);

    // 2. WebGL Renderer with Tone Mapping (Cozy Night Diorama Look)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    // 3. Lighting
    this.setupLighting();

    // 4. Large Multi-Zone World & Real Architectural Rooms
    this.setupGrandCampus();

    // 5. Workstations & Interactive Stations Across the Office
    this.setupDepartmentWorkstations();

    // 6. Scattered Collectibles
    this.setupPickups();

    // 7. Player Chibi (Spawns in clear walkway aisle)
    this.player = new ChibiCharacter('#fed7aa', '#4f46e5', false, 'BẠN (MERCHANDISER)');
    this.player.group.position.set(-10.5, 0, -11.5);
    this.scene.add(this.player.group);

    // 8. NPC Colleagues
    this.setupColleagues();

    // 9. Resize Handling
    window.addEventListener('resize', this.onResize);
  }

  public addObstacle(name: string, cx: number, cz: number, width: number, depth: number): void {
    this.obstacles.push({
      name,
      minX: cx - width / 2,
      maxX: cx + width / 2,
      minZ: cz - depth / 2,
      maxZ: cz + depth / 2
    });
  }

  public isColliding(x: number, z: number, radius = 0.40): boolean {
    if (x - radius < this.bounds.minX || x + radius > this.bounds.maxX) return true;
    if (z - radius < this.bounds.minZ || z + radius > this.bounds.maxZ) return true;

    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];
      const closestX = Math.max(obs.minX, Math.min(x, obs.maxX));
      const closestZ = Math.max(obs.minZ, Math.min(z, obs.maxZ));

      const distX = x - closestX;
      const distZ = z - closestZ;
      if (distX * distX + distZ * distZ < radius * radius) {
        return true;
      }
    }
    return false;
  }

  public toggleFloorLamp(): boolean {
    this.isFloorLampOn = !this.isFloorLampOn;
    if (this.floorLampLight) {
      this.floorLampLight.intensity = this.isFloorLampOn ? 2.4 : 0.0;
    }
    return this.isFloorLampOn;
  }

  private setupLighting(): void {
    const hemi = new THREE.HemisphereLight(0xfff1e6, 0x0f172a, 1.15);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffedd5, 1.5);
    sun.position.set(22, 34, 18);
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

    // Warm Pools of Light across rooms
    // 1. Office Center Warm Chandelier
    const lOffice = new THREE.PointLight(0xfbbf24, 2.2, 24);
    lOffice.position.set(-14, 5.5, -12);
    this.scene.add(lOffice);

    // 2. Lounge Warm Overhead Chandelier
    const lLounge = new THREE.PointLight(0xfef08a, 1.9, 20);
    lLounge.position.set(0, 5.0, 2);
    this.scene.add(lLounge);

    // 3. Lab D65 Color Grading Light
    const lLab = new THREE.PointLight(0x38bdf8, 2.0, 22);
    lLab.position.set(14, 5.5, -10);
    this.scene.add(lLab);

    // 4. Warehouse Amber Industrial Lamp
    const lWarehouse = new THREE.PointLight(0xf59e0b, 1.9, 24);
    lWarehouse.position.set(-14, 5.5, 12);
    this.scene.add(lWarehouse);

    // 5. Port Logistics Floodlight
    const lPort = new THREE.PointLight(0x60a5fa, 2.2, 26);
    lPort.position.set(14, 5.5, 14);
    this.scene.add(lPort);
  }

  private setupGrandCampus(): void {
    // 1. Base Campus Floor (Outdoor concrete base)
    const baseGeo = new THREE.PlaneGeometry(64, 52);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.rotation.x = -Math.PI / 2;
    base.receiveShadow = true;
    this.scene.add(base);

    // 2. Oak Parquet Wood Floor for Main Office & Central Corridor (Warm cozy diorama!)
    this.createWoodParquetFloor(0, 0, 56, 44);

    // 3. Ceramic Hex Tile Floor for Pantry & Kitchen
    this.createTileFloor(0, 2, 14, 12, '#f8fafc', '#cbd5e1');

    // 4. Dark Patterned Carpet for Boardroom & Boss Office
    this.createCarpetFloor(-17, -14, 16, 16, '#1e1b4b', '#312e81');

    // 5. Polished Industrial Concrete Floor for Warehouse & Shipping
    this.createIndustrialFloor(14, 11, 22, 20);

    // 6. Restroom Tile Floor
    this.createTileFloor(-22, 0, 8, 8, '#e2e8f0', '#94a3b8');

    // ==================== ZONE 1: CORPORATE OFFICE (VĂN PHÒNG ĐIỀU HÀNH) ====================
    this.createZoneSign(-14, 3.8, -21.5, '🏢 VĂN PHÒNG ĐIỀU HÀNH & MERCHANDISER', '#4f46e5');

    // Desks Pods with dual monitors, keyboards, desk dividers, chairs
    for (let i = 0; i < 3; i++) {
      const dx = -18 + i * 5;
      this.createColleagueDesk(dx, -14);
      this.addObstacle(`desk_r1_${i}`, dx, -14, 2.5, 1.3);

      this.createColleagueDesk(dx, -9);
      this.addObstacle(`desk_r2_${i}`, dx, -9, 2.5, 1.3);
    }

    // Water Cooler Station
    this.createWaterCooler(-2.8, -1.8);
    this.addObstacle('water_cooler', -2.8, -1.8, 0.8, 0.8);

    // Potted Plants
    this.createPlant(-24, -20);
    this.addObstacle('plant_1', -24, -20, 0.8, 0.8);
    this.createPlant(-4, -20);
    this.addObstacle('plant_2', -4, -20, 0.8, 0.8);
    this.createPlant(4, -20);
    this.addObstacle('plant_3', 4, -20, 0.8, 0.8);

    // Boardroom (Phòng Họp Kính VIP with Whiteboard & Glass Partitions)
    this.createBoardroom(-18, -16, 8, 6);

    // Boss Office (Phòng Sếp Hùng)
    this.createBossOffice(-18, -21);

    // IT Server Room
    this.createServerRacks(-22, 10);
    this.addObstacle('server_racks', -21.25, 10, 3.2, 1.1);

    // Restroom / WC
    this.createRestroom(-22, 0);

    // ==================== ZONE 2: COLOR LAB & CUTTING (PHÒNG LAB & XƯỞNG CẮT) ====================
    this.createZoneSign(14, 3.2, -21.5, '✂️ XƯỞNG CẮT RẬP & PHÒNG LAB MÀU D65', '#059669');

    this.createCuttingTable(8, -12);
    this.addObstacle('cut_table_1', 8, -12, 4.3, 1.9);

    this.createCuttingTable(16, -12);
    this.addObstacle('cut_table_2', 16, -12, 4.3, 1.9);

    this.createCuttingTable(8, -7);
    this.addObstacle('cut_table_3', 8, -7, 4.3, 1.9);

    this.createCuttingTable(16, -7);
    this.addObstacle('cut_table_4', 16, -7, 4.3, 1.9);

    // Dress Form Mannequins
    this.createMannequin(3.5, -12, '#3b82f6');
    this.createMannequin(3.5, -7, '#ef4444');

    // ==================== ZONE 3: MEGA FABRIC WAREHOUSE (KHO VẢI ĐẠI NGÀN) ====================
    this.createZoneSign(-14, 3.2, 2.5, '🧵 KHO VẢI CUỘN & NGUYÊN PHỤ LIỆU', '#d97706');

    for (let r = 0; r < 3; r++) {
      const rx = -22 + r * 7;
      this.createWarehouseRack(rx, 8);
      this.addObstacle(`rack_row1_${r}`, rx, 8, 2.2, 1.4);

      this.createWarehouseRack(rx, 16);
      this.addObstacle(`rack_row2_${r}`, rx, 16, 2.2, 1.4);
    }

    this.createForklift(-5, 14);
    this.addObstacle('forklift', -5, 14, 1.8, 1.3);

    // ==================== ZONE 4: LOGISTICS PORT & DOCK (CẢNG BIỂN & XUẤT CONT) ====================
    this.createZoneSign(14, 3.2, 2.5, '🚢 CẢNG XUẤT HÀNG & BÃI CONT 40HQ', '#0284c7');

    this.createShippingContainer(8, 12, '#0284c7', 'CÁT LÁI EXPRESS');
    this.addObstacle('container_1', 8, 12, 5.4, 2.6);

    this.createShippingContainer(18, 12, '#e11d48', 'MAERSK LINE 40HQ');
    this.addObstacle('container_2', 18, 12, 5.4, 2.6);

    this.createShippingContainer(14, 18, '#16a34a', 'ONE OCEAN NETWORK');
    this.addObstacle('container_3', 14, 18, 5.4, 2.6);

    // ==================== ZONE 5: REAL PANTRY KITCHEN & LOUNGE ====================
    this.createZoneSign(0, 3.2, -4.5, '🧋 PANTRY CÀ PHÊ & LOUNGE NGHỈ NGƠI', '#9333ea');
    this.createDetailedPantryAndLounge(0, 1.5);

    // Fairy String Lights hanging along corridor
    this.createFairyLights();

    // Perimeter Fences / Boundary Walls
    this.createPerimeterWalls();

    // Street, Zebra Crossings, Parked Scooters & City Skyline
    this.createStreetAndVehicles();
  }

  private createWoodParquetFloor(cx: number, cz: number, w: number, h: number): void {
    const geo = new THREE.PlaneGeometry(w, h);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Warm amber wood parquet
    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, 0, 512, 512);

    const plankH = 32;
    const plankW = 128;
    for (let y = 0; y < 512; y += plankH) {
      const offset = (y / plankH) % 2 === 0 ? 0 : 64;
      for (let x = -64; x < 512; x += plankW) {
        const shade = Math.sin(x * 12 + y * 7) > 0 ? '#92400e' : '#d97706';
        ctx.fillStyle = shade;
        ctx.fillRect(x + offset + 2, y + 2, plankW - 4, plankH - 4);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(w / 4, h / 4);

    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(cx, 0.01, cz);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  private createTileFloor(cx: number, cz: number, w: number, h: number, c1: string, c2: string): void {
    const geo = new THREE.PlaneGeometry(w, h);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = c1;
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = c2;
    ctx.lineWidth = 3;
    const step = 64;
    for (let x = 0; x <= 256; x += step) {
      ctx.moveTo(x, 0); ctx.lineTo(x, 256);
      ctx.moveTo(0, x); ctx.lineTo(256, x);
    }
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(w / 2, h / 2);

    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(cx, 0.015, cz);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  private createCarpetFloor(cx: number, cz: number, w: number, h: number, c1: string, c2: string): void {
    const geo = new THREE.PlaneGeometry(w, h);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = c1;
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = c2;
    for (let y = 0; y < 256; y += 32) {
      for (let x = 0; x < 256; x += 32) {
        if ((x + y) % 64 === 0) ctx.fillRect(x + 4, y + 4, 24, 24);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(w / 3, h / 3);

    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(cx, 0.018, cz);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  private createIndustrialFloor(cx: number, cz: number, w: number, h: number): void {
    const geo = new THREE.PlaneGeometry(w, h);
    const mat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(cx, 0.012, cz);
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

    // Warm wood table top
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.2), new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.4 }));
    top.position.y = 0.75;
    top.castShadow = true;
    g.add(top);

    // Metal table legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });
    for (const lx of [-1.0, 1.0]) {
      for (const lz of [-0.45, 0.45]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8), legMat);
        leg.position.set(lx, 0.35, lz);
        g.add(leg);
      }
    }

    // Partition Screen
    const part = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 0.05), new THREE.MeshStandardMaterial({ color: 0x4f46e5 }));
    part.position.set(0, 1.05, -0.58);
    g.add(part);

    // Dual Monitors on Arm
    const mon1 = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.42, 0.04), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    mon1.position.set(-0.35, 1.05, -0.2);
    g.add(mon1);

    const mon2 = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.42, 0.04), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
    mon2.position.set(0.35, 1.05, -0.2);
    g.add(mon2);

    // Keyboard & Mouse
    const kb = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.02, 0.16), new THREE.MeshStandardMaterial({ color: 0x1e1b4b }));
    kb.position.set(-0.1, 0.81, 0.1);
    g.add(kb);

    const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.12), new THREE.MeshStandardMaterial({ color: 0x6366f1 }));
    mouse.position.set(0.35, 0.81, 0.1);
    g.add(mouse);

    // Arched metal desk lamp
    const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), legMat);
    lampArm.position.set(0.8, 1.0, -0.2);
    lampArm.rotation.z = -0.3;
    g.add(lampArm);

    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.14, 8), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
    lampShade.position.set(0.7, 1.15, -0.2);
    g.add(lampShade);

    // Coffee mug
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 10), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    mug.position.set(-0.8, 0.86, 0.1);
    g.add(mug);

    // Mesh Swivel Chair
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    chair.position.set(0, 0.35, 0.6);
    g.add(chair);

    this.scene.add(g);
  }

  private createBoardroom(x: number, z: number, w: number, h: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1
    });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.8 });

    // North Glass Wall
    const wallN = new THREE.Mesh(new THREE.BoxGeometry(w, 2.6, 0.08), glassMat);
    wallN.position.set(0, 1.3, -h / 2);
    g.add(wallN);

    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, 0.12), frameMat);
    frameTop.position.set(0, 2.56, -h / 2);
    g.add(frameTop);

    // West Glass Wall
    const wallW = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.6, h), glassMat);
    wallW.position.set(-w / 2, 1.3, 0);
    g.add(wallW);

    // Mahogany Conference Table
    const table = new THREE.Mesh(new THREE.BoxGeometry(w * 0.72, 0.14, h * 0.48), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 }));
    table.position.y = 0.82;
    table.castShadow = true;
    g.add(table);

    // Swivel chairs
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const chairOffsets = [
      [-w * 0.24, -h * 0.32],
      [0, -h * 0.32],
      [w * 0.24, -h * 0.32],
      [-w * 0.24, h * 0.32],
      [0, h * 0.32],
      [w * 0.24, h * 0.32]
    ];
    for (const [cx, cz] of chairOffsets) {
      const chair = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.5), chairMat);
      chair.position.set(cx, 0.4, cz);
      g.add(chair);
    }

    // Whiteboard
    this.createWhiteboard(g, 0, 1.6, -h / 2 + 0.1);

    // Warm overhead pendant light
    const pLight = new THREE.PointLight(0xffedd5, 1.8, 12);
    pLight.position.set(0, 2.4, 0);
    g.add(pLight);

    this.scene.add(g);

    this.addObstacle('boardroom_wall_n', x, z - h / 2, w, 0.35);
    this.addObstacle('boardroom_wall_w', x - w / 2, z, 0.35, h);
    this.addObstacle('boardroom_table', x, z, w * 0.74, h * 0.50);
  }

  private createWhiteboard(parent: THREE.Group, x: number, y: number, z: number): void {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 22px Nunito, sans-serif';
    ctx.fillText('📊 KẾ HOẠCH XUẤT KHẨU Q4 · THỊ TRƯỜNG US & EU', 20, 36);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, 48); ctx.lineTo(492, 48);
    ctx.stroke();

    const categories = [
      { label: 'Polo US', value: 85, color: '#22c55e' },
      { label: 'Khaki EU', value: 65, color: '#3b82f6' },
      { label: 'Hoodie Seoul', value: 92, color: '#f59e0b' },
      { label: 'Spandex Tokyo', value: 78, color: '#a855f7' }
    ];

    const chartX = 40;
    const chartY = 210;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(chartX, 70); ctx.lineTo(chartX, chartY); ctx.lineTo(470, chartY);
    ctx.stroke();

    categories.forEach((cat, idx) => {
      const bx = chartX + 30 + idx * 100;
      const barH = (cat.value / 100) * 120;
      ctx.fillStyle = cat.color;
      ctx.fillRect(bx, chartY - barH, 44, barH);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 13px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${cat.value}%`, bx + 22, chartY - barH - 6);
      ctx.fillText(cat.label, bx + 22, chartY + 18);
    });

    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 15px Nunito, sans-serif';
    ctx.fillText('✅ CHUẨN AQL 2.5: ĐẠT 100%', 320, 80);

    const tex = new THREE.CanvasTexture(canvas);
    const boardGeo = new THREE.BoxGeometry(3.2, 1.6, 0.05);
    const boardMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.2 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(x, y, z);
    parent.add(board);
  }

  private createBossOffice(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    // Executive Desk
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.15, 1.4), new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.3 }));
    desk.position.y = 0.8;
    g.add(desk);

    // Gold Nameplate
    const np = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8 }));
    np.position.set(0, 0.92, -0.4);
    g.add(np);

    // Laptop & Executive Chair
    const lap = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.35), new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8 }));
    lap.position.set(0, 0.9, 0);
    g.add(lap);

    const bossChair = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.7), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    bossChair.position.set(0, 0.45, -0.8);
    g.add(bossChair);

    // Bookshelf with trophies
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 0.5), new THREE.MeshStandardMaterial({ color: 0x78350f }));
    shelf.position.set(0, 1.3, -1.8);
    g.add(shelf);

    // Golden Trophy
    const trophy = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.4, 12), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9 }));
    trophy.position.set(0.6, 1.6, -1.6);
    g.add(trophy);

    this.scene.add(g);
    this.addObstacle('boss_desk', x, z, 3.0, 1.8);
  }

  private createDetailedPantryAndLounge(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    // 1. Kitchen Bar Counter (L-shaped luxury counter)
    const counterMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 });
    const topMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });

    const c1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.95, 1.1), counterMat);
    c1.position.set(0, 0.475, 0);
    g.add(c1);

    const c1Top = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.08, 1.2), topMat);
    c1Top.position.set(0, 0.98, 0);
    g.add(c1Top);

    // Professional Espresso Coffee Machine
    const coffeeMach = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.6), new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8 }));
    coffeeMach.position.set(-1.2, 1.32, 0);
    g.add(coffeeMach);

    const portafilter = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), new THREE.MeshStandardMaterial({ color: 0x1f2937 }));
    portafilter.rotation.z = Math.PI / 2;
    portafilter.position.set(-1.2, 1.2, 0.35);
    g.add(portafilter);

    // Microwave Oven
    const micro = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.5), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    micro.position.set(1.1, 1.25, 0);
    g.add(micro);

    // Bar Stools
    const stoolMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
    for (const sx of [-1.2, 0, 1.2]) {
      const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.65, 12), stoolMat);
      stool.position.set(sx, 0.325, 1.1);
      g.add(stool);
    }

    // 2. Comfortable Leather Sofa (Khu Lounge Nghỉ Ngơi)
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.6 });
    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.45, 1.1), sofaMat);
    sofaBase.position.set(0, 0.225, 3.2);
    g.add(sofaBase);

    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.65, 0.35), sofaMat);
    sofaBack.position.set(0, 0.65, 3.6);
    g.add(sofaBack);

    // Coffee Glass Table
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
    const cTable = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 0.8), tableMat);
    cTable.position.set(0, 0.175, 2.0);
    g.add(cTable);

    // Boba Cup on table
    const bobaCup = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.3, 12), new THREE.MeshStandardMaterial({ color: 0xfef08a }));
    bobaCup.position.set(0.3, 0.5, 2.0);
    g.add(bobaCup);

    // 3. Arched Brass Floor Lamp (Interactive on/off!)
    const lampG = new THREE.Group();
    lampG.position.set(2.4, 0, 2.8);

    const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 8), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8 }));
    lampPole.position.y = 1.2;
    lampG.add(lampPole);

    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.4, 12), new THREE.MeshStandardMaterial({ color: 0xfef08a }));
    lampShade.position.set(0, 2.3, 0);
    lampG.add(lampShade);

    this.floorLampLight = new THREE.PointLight(0xfef08a, 2.4, 14);
    this.floorLampLight.position.set(0, 2.1, 0);
    lampG.add(this.floorLampLight);

    g.add(lampG);

    this.scene.add(g);

    // Register colliders
    this.addObstacle('pantry_counter', x, z, 4.4, 1.4);
    this.addObstacle('lounge_sofa', x, z + 3.2, 2.8, 1.3);
    this.addObstacle('lounge_table', x, z + 2.0, 1.8, 0.9);
  }

  private createRestroom(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    // Partition cubicle walls
    const cubMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const wall1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 2.4), cubMat);
    wall1.position.set(0, 1.1, 0);
    g.add(wall1);

    // Washbasin
    const basin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.6), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }));
    basin.position.set(1.0, 0.4, 1.0);
    g.add(basin);

    // Mirror on wall
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 0.04), new THREE.MeshStandardMaterial({ color: 0x93c5fd, metalness: 0.9, roughness: 0.05 }));
    mirror.position.set(1.0, 1.6, 1.28);
    g.add(mirror);

    this.scene.add(g);
    this.addObstacle('restroom_counter', x + 1.0, z + 1.0, 1.4, 0.8);
  }

  private createMannequin(x: number, z: number, color: string): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.05, 12), new THREE.MeshStandardMaterial({ color: 0x1f2937 }));
    base.position.y = 0.025;
    g.add(base);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8), new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8 }));
    pole.position.y = 0.45;
    g.add(pole);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.6, 14), new THREE.MeshStandardMaterial({ color, roughness: 0.5 }));
    torso.position.y = 1.05;
    g.add(torso);

    this.scene.add(g);
  }

  private createServerRacks(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const rackMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.6, roughness: 0.4 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, transparent: true, opacity: 0.45, roughness: 0.2 });

    for (let rackIdx = 0; rackIdx < 2; rackIdx++) {
      const rx = rackIdx * 1.5;
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.6, 0.9), rackMat);
      body.position.set(rx, 1.3, 0);
      body.castShadow = true;
      g.add(body);

      const glassDoor = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.5, 0.04), glassMat);
      glassDoor.position.set(rx, 1.3, 0.46);
      g.add(glassDoor);

      const ledColors = [0x22c55e, 0x10b981, 0xef4444, 0xf59e0b, 0x38bdf8];
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 4; col++) {
          const color = ledColors[(row + col * 2 + rackIdx) % ledColors.length];
          const ledGeo = new THREE.BoxGeometry(0.06, 0.04, 0.02);
          const ledMat = new THREE.MeshBasicMaterial({ color });
          const led = new THREE.Mesh(ledGeo, ledMat);
          led.position.set(rx - 0.35 + col * 0.23, 0.5 + row * 0.45, 0.44);
          g.add(led);

          this.ledMeshes.push({
            mesh: led,
            baseColor: color,
            speed: 1.5 + (row * 0.7 + col * 1.1),
            offset: row + col
          });
        }
      }
    }

    const srvLight = new THREE.PointLight(0x06b6d4, 1.6, 9);
    srvLight.position.set(0.75, 1.8, 0.6);
    g.add(srvLight);

    this.scene.add(g);
  }

  public createThanTaiAltar(x: number, z: number): THREE.Group {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const redMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.4 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7, roughness: 0.3 });
    const darkRedMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.5 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 1.1), darkRedMat);
    base.position.y = 0.11;
    base.castShadow = true;
    g.add(base);

    const back = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.4, 0.08), redMat);
    back.position.set(0, 0.8, -0.45);
    g.add(back);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.4, 0.9), redMat);
    leftWall.position.set(-0.62, 0.8, 0);
    g.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.4, 0.9), redMat);
    rightWall.position.set(0.62, 0.8, 0);
    g.add(rightWall);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.18, 1.2), redMat);
    roof.position.set(0, 1.5, 0);
    g.add(roof);

    const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.06, 1.26), goldMat);
    goldTrim.position.set(0, 1.58, 0);
    g.add(goldTrim);

    const thanTai = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.42, 12), goldMat);
    thanTai.position.set(-0.3, 0.42, -0.2);
    g.add(thanTai);

    const thoDia = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.38, 12), goldMat);
    thoDia.position.set(0.3, 0.40, -0.2);
    g.add(thoDia);

    const incenseBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.12, 12), goldMat);
    incenseBowl.position.set(0, 0.28, 0.05);
    g.add(incenseBowl);

    const stickMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    for (let i = -1; i <= 1; i++) {
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.32, 6), stickMat);
      stick.position.set(i * 0.04, 0.45, 0.05);
      stick.rotation.z = i * 0.08;
      g.add(stick);
    }

    const toad = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), goldMat);
    toad.scale.set(1.2, 0.7, 1);
    toad.position.set(-0.52, 0.28, 0.35);
    g.add(toad);

    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.04, 12), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    plate.position.set(0.42, 0.24, 0.3);
    g.add(plate);

    const fruitMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
    const fruit1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), fruitMat);
    fruit1.position.set(0.42, 0.30, 0.3);
    g.add(fruit1);

    const altarLight = new THREE.PointLight(0xef4444, 2.2, 8);
    altarLight.position.set(0, 0.8, 0.2);
    g.add(altarLight);

    this.scene.add(g);
    this.addObstacle('altar', x, z, 1.6, 1.3);
    return g;
  }

  private createFairyLights(): void {
    const g = new THREE.Group();
    const bulbGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const bulbColors = [0xfef08a, 0xfde047, 0xfbbf24, 0xf472b6, 0x38bdf8];

    for (let x = -24; x <= 24; x += 1.6) {
      const sag = Math.sin((x + 24) * 0.8) * 0.18;
      const color = bulbColors[Math.abs(Math.round(x)) % bulbColors.length];
      const bulbMat = new THREE.MeshBasicMaterial({ color });
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(x, 2.3 + sag, -2.0);
      g.add(bulb);
    }
    this.scene.add(g);
  }

  private createStreetAndVehicles(): void {
    const roadGeo = new THREE.PlaneGeometry(70, 10);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.005, -29);
    road.receiveShadow = true;
    this.scene.add(road);

    const stripeGeo = new THREE.PlaneGeometry(0.8, 3.8);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
    for (let i = -4; i <= 4; i++) {
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(i * 1.6, 0.015, -29);
      this.scene.add(stripe);
    }

    const curbGeo = new THREE.BoxGeometry(70, 0.16, 0.6);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.set(0, 0.08, -24.4);
    this.scene.add(curb);

    this.createStreetlamp(-20, -26);
    this.createStreetlamp(0, -26);
    this.createStreetlamp(20, -26);

    this.createScooterMesh(-16, -24.8, 0.2, 0x0284c7);
    this.createScooterMesh(-13.5, -24.8, -0.15, 0xe11d48);
    this.createScooterMesh(14, -24.8, 0.3, 0x10b981);

    this.createCitySkyline();
  }

  private createStreetlamp(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 5.0, 10), poleMat);
    pole.position.y = 2.5;
    g.add(pole);

    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 8), poleMat);
    arm.rotateZ(Math.PI / 2);
    arm.position.set(0.6, 4.9, 0);
    g.add(arm);

    const head = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.4, 8), poleMat);
    head.position.set(1.2, 4.7, 0);
    g.add(head);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    bulb.position.set(1.2, 4.5, 0);
    g.add(bulb);

    const lampLight = new THREE.PointLight(0xfef08a, 2.2, 18);
    lampLight.position.set(1.2, 4.4, 0);
    g.add(lampLight);

    this.scene.add(g);
  }

  private createScooterMesh(x: number, z: number, rotationY: number, color: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rotationY;

    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.2 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8, roughness: 0.2 });

    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.14, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wFront = new THREE.Mesh(wheelGeo, darkMat);
    wFront.position.set(0, 0.28, 0.7);
    g.add(wFront);

    const wRear = new THREE.Mesh(wheelGeo, darkMat);
    wRear.position.set(0, 0.28, -0.7);
    g.add(wRear);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.9), bodyMat);
    deck.position.set(0, 0.25, 0);
    g.add(deck);

    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.55, 0.16), bodyMat);
    apron.position.set(0, 0.52, 0.6);
    apron.rotation.x = -0.15;
    g.add(apron);

    const light = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 12), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    light.rotateX(Math.PI / 2);
    light.position.set(0, 0.72, 0.68);
    g.add(light);

    const bars = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.65, 8), chromeMat);
    bars.rotateZ(Math.PI / 2);
    bars.position.set(0, 0.78, 0.55);
    g.add(bars);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.65), new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 }));
    seat.position.set(0, 0.52, -0.25);
    g.add(seat);

    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    helmet.scale.set(1, 0.85, 1);
    helmet.position.set(0, 0.68, -0.15);
    g.add(helmet);

    this.scene.add(g);
  }

  private createCitySkyline(): void {
    const g = new THREE.Group();
    const bldgMat = new THREE.MeshStandardMaterial({ color: 0x070b14, roughness: 0.9 });
    const winMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    const bldgData = [
      { x: -32, w: 7, h: 18, z: -42 },
      { x: -22, w: 9, h: 26, z: -45 },
      { x: -10, w: 6, h: 16, z: -40 },
      { x: 2, w: 10, h: 30, z: -46 },
      { x: 15, w: 8, h: 22, z: -42 },
      { x: 26, w: 7, h: 19, z: -44 },
      { x: 35, w: 9, h: 28, z: -48 }
    ];

    for (const b of bldgData) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, 6), bldgMat);
      mesh.position.set(b.x, b.h / 2, b.z);
      g.add(mesh);

      for (let wy = 3; wy < b.h - 2; wy += 3.2) {
        for (let wx = -b.w / 2 + 1.2; wx < b.w / 2 - 1.0; wx += 2.0) {
          if (Math.sin(b.x + wy + wx) > -0.2) {
            const win = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.2), winMat);
            win.position.set(b.x + wx, wy, b.z + 3.02);
            g.add(win);
          }
        }
      }
    }

    this.scene.add(g);
  }

  private createCuttingTable(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const table = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.15, 1.8), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
    table.position.y = 0.85;
    table.castShadow = true;
    g.add(table);

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

  private createPerimeterWalls(): void {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const h = 2.4;

    const nw = new THREE.Mesh(new THREE.BoxGeometry(64, h, 0.6), wallMat);
    nw.position.set(0, h / 2, -23.5);
    this.scene.add(nw);

    const sw = new THREE.Mesh(new THREE.BoxGeometry(64, h, 0.6), wallMat);
    sw.position.set(0, h / 2, 23.5);
    this.scene.add(sw);

    const ww = new THREE.Mesh(new THREE.BoxGeometry(0.6, h, 48), wallMat);
    ww.position.set(-29.5, h / 2, 0);
    this.scene.add(ww);

    const ew = new THREE.Mesh(new THREE.BoxGeometry(0.6, h, 48), wallMat);
    ew.position.set(29.5, h / 2, 0);
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
    deskG.position.set(-10.5, 0, -13.0);
    this.addStation('desk', 'Bàn Làm Việc Merchandiser', 'Văn Phòng Điều Hành', '💻', deskG.position, 2.5, deskG);

    // 2. Central Printer (Văn phòng)
    const printerG = new THREE.Group();
    printerG.position.set(-4, 0, -12);
    this.addStation('printer', 'Máy In Techpack & Hợp Đồng', 'Văn Phòng Điều Hành', '🖨️', printerG.position, 2.3, printerG);

    // 3. Cutting & Lab Station (Xưởng cắt & Lab)
    const labG = new THREE.Group();
    labG.position.set(12, 0, -9.5);
    this.addStation('lab', 'Phòng Lab Soi Màu D65', 'Xưởng Cắt & Lab', '🔬', labG.position, 2.5, labG);

    // 4. Warehouse Fabric Racks (Kho vải)
    const fabricG = new THREE.Group();
    fabricG.position.set(-14, 0, 12);
    this.addStation('fabric', 'Kệ Vải Thun & Phụ Liệu Spandex', 'Kho Vải Đại Ngàn', '🧵', fabricG.position, 2.6, fabricG);

    // 5. Canteen Espresso Coffee Machine (Quầy Pantry)
    const coffeeG = new THREE.Group();
    coffeeG.position.set(-1.2, 0, 1.5);
    this.addStation('coffee', 'Máy Pha Cà Phê & Trà Sữa', 'Căn Tin Trung Tâm', '☕', coffeeG.position, 2.2, coffeeG);

    // 6. Logistics Shipping Port (Cảng Cont Cát Lái)
    const shipG = new THREE.Group();
    shipG.position.set(13, 0, 15);
    this.addStation('shipping', 'Cổng Xuất Cont Cát Lái', 'Cảng Biển & Xuất Khẩu', '🚢', shipG.position, 2.8, shipG);

    // 7. Bàn Thờ Thần Tài & Thổ Địa (Altar of Fortune)
    const altarG = this.createThanTaiAltar(-14, -20);
    this.addStation('altar', 'Bàn Thờ Thần Tài - Thổ Địa', 'Văn Phòng Điều Hành', '🙏', new THREE.Vector3(-14, 0, -18.4), 2.4, altarG);

    // 8. Cây Nước Nóng Lạnh (Water Dispenser)
    const waterG = new THREE.Group();
    waterG.position.set(-2.8, 0, -1.8);
    this.addStation('water', 'Cây Nước Nóng Lạnh Văn Phòng', 'Căn Tin Trung Tâm', '🚰', waterG.position, 2.2, waterG);

    // 9. Tủ Server IT (Datacenter Rack)
    const serverG = new THREE.Group();
    serverG.position.set(-21.25, 0, 10);
    this.addStation('server', 'Tủ Server & Hệ Thống IT', 'Khu Vực Kỹ Thuật', '🖥️', serverG.position, 2.4, serverG);

    // 10. Đèn Sàn Phòng Khách (Toggleable Lamp)
    const lampG = new THREE.Group();
    lampG.position.set(2.4, 0, 4.3);
    this.addStation('lamp', 'Đèn Sàn Phòng Khách', 'Lounge Thư Giãn', '💡', lampG.position, 2.2, lampG);

    // 11. Sofa Nghỉ Trưa (Lounge Sofa)
    const sofaG = new THREE.Group();
    sofaG.position.set(0, 0, 4.7);
    this.addStation('sofa', 'Sofa Nghỉ Trưa Thư Giãn', 'Lounge Thư Giãn', '🛋️', sofaG.position, 2.3, sofaG);

    // 12. Bảng Chiến Lược Boardroom
    const wbG = new THREE.Group();
    wbG.position.set(-18, 0, -13.5);
    this.addStation('whiteboard', 'Bảng Chiến Lược Xuất Khẩu', 'Phòng Họp VIP', '📊', wbG.position, 2.4, wbG);

    // 13. Gương Soi & Bồn Rửa WC
    const mirrorG = new THREE.Group();
    mirrorG.position.set(-21, 0, 1.0);
    this.addStation('mirror', 'Gương Rửa Mặt Tỉnh Táo', 'Nhà Vệ Sinh Văn Phòng', '🪞', mirrorG.position, 2.2, mirrorG);

    // 14. Bàn Làm Việc Sếp Hùng
    const bossDeskG = new THREE.Group();
    bossDeskG.position.set(-18, 0, -19.5);
    this.addStation('boss_desk', 'Bàn Làm Việc Giám Đốc Hùng', 'Phòng Tổng Giám Đốc', '👔', bossDeskG.position, 2.4, bossDeskG);
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
    const ringColor = type === 'altar' ? 0xef4444 : (type === 'coffee' || type === 'water' ? 0x10b981 : 0x6366f1);
    const ringMat = new THREE.MeshBasicMaterial({
      color: ringColor,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const indicatorMesh = new THREE.Mesh(ringGeo, ringMat);
    indicatorMesh.rotation.x = -Math.PI / 2;
    indicatorMesh.position.set(pos.x, 0.03, pos.z);
    this.scene.add(indicatorMesh);

    const canvas = document.createElement('canvas');
    canvas.width = 340;
    canvas.height = 80;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = type === 'altar' ? '#7f1d1d' : '#1e1b4b';
    ctx.beginPath();
    ctx.roundRect(8, 8, 324, 64, 20);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = type === 'altar' ? '#ef4444' : '#facc15';
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
      { x: -20, z: -11.5, type: 'boba' as const },
      { x: -8, z: 12, type: 'boba' as const },
      { x: 12, z: -7, type: 'coffee' as const },
      { x: 8, z: 8, type: 'bonus_cash' as const },
      { x: -15, z: 12, type: 'bonus_cash' as const },
      { x: 22, z: 14, type: 'boba' as const }
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
    // 1. Sếp Hùng
    this.bossNpc = new ChibiCharacter('#ffedd5', '#475569', true, 'SẾP HÙNG (ĐI TUẦN)');
    this.bossNpc.group.position.set(-20, 0, -16);
    this.bossNpc.moveSpeed = 1.9;
    this.scene.add(this.bossNpc.group);

    this.bossWaypoints = [
      new THREE.Vector3(-22, 0, -16),
      new THREE.Vector3(-16, 0, -16),
      new THREE.Vector3(-16, 0, -11.5),
      new THREE.Vector3(-22, 0, -11.5)
    ];

    const visionGeo = new THREE.RingGeometry(0.4, 2.6, 24);
    const visionMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
    this.bossVisionMesh = new THREE.Mesh(visionGeo, visionMat);
    this.bossVisionMesh.rotation.x = -Math.PI / 2;
    this.bossVisionMesh.position.y = 0.03;
    this.bossNpc.group.add(this.bossVisionMesh);

    // 2. Chị Nga Kế Toán
    this.accountantNpc = new ChibiCharacter('#fed7aa', '#dc2626', true, 'CHỊ NGA (KẾ TOÁN KHO)');
    this.accountantNpc.group.position.set(-11, 0, 12);
    this.scene.add(this.accountantNpc.group);

    // 3. Anh Tuấn Logistics
    this.truckerNpc = new ChibiCharacter('#fde047', '#0284c7', true, 'ANH TUẤN (TÀI XẾ CONT)');
    this.truckerNpc.group.position.set(12, 0, 15);
    this.scene.add(this.truckerNpc.group);
  }

  public toggleCameraMode(): 'follow' | 'overview' {
    this.cameraMode = this.cameraMode === 'follow' ? 'overview' : 'follow';
    return this.cameraMode;
  }

  public getActiveSpeechScreenData(): { speaker: string; role: string; emoji: string; text: string; avatarBg: string; x: number; y: number } | null {
    if (!this.activeSpeech || !this.camera || !this.container) return null;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (!width || !height) return null;

    const p = this.activeSpeech.worldPos.clone().project(this.camera);
    if (p.z > 1 || p.z < -1) return null;

    const sx = ((p.x + 1) * width) / 2;
    const sy = ((-p.y + 1) * height) / 2;

    const clampedX = Math.max(130, Math.min(width - 130, sx));
    const clampedY = Math.max(70, Math.min(height - 110, sy));

    return {
      speaker: this.activeSpeech.speaker,
      role: this.activeSpeech.role,
      emoji: this.activeSpeech.emoji,
      text: this.activeSpeech.text,
      avatarBg: this.activeSpeech.avatarBg,
      x: clampedX,
      y: clampedY
    };
  }

  private onResize = (): void => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = Math.max(300, this.container.clientWidth || window.innerWidth);
    const height = Math.max(240, this.container.clientHeight || window.innerHeight);

    const aspect = width / height;
    this.camera.aspect = aspect;
    this.camera.fov = aspect < 0.8 ? 52 : (aspect < 1.1 ? 46 : 42);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  update(delta: number, playerDirX: number, playerDirZ: number): void {
    // 1. Solid Sliding Collision Movement
    const isMoving = Math.abs(playerDirX) > 0.01 || Math.abs(playerDirZ) > 0.01;
    if (isMoving) {
      const currentSpeed = this.player.carriedItem === 'none' ? this.player.moveSpeed : this.player.moveSpeed * 0.9;
      const moveDist = currentSpeed * delta;
      const stepX = playerDirX * moveDist;
      const stepZ = playerDirZ * moveDist;

      const curPos = this.player.getPosition();
      const radius = 0.38;

      let targetX = curPos.x;
      if (Math.abs(stepX) > 0.0001) {
        if (!this.isColliding(curPos.x + stepX, curPos.z, radius)) {
          targetX = curPos.x + stepX;
        }
      }

      let targetZ = curPos.z;
      if (Math.abs(stepZ) > 0.0001) {
        if (!this.isColliding(targetX, curPos.z + stepZ, radius)) {
          targetZ = curPos.z + stepZ;
        }
      }

      curPos.x = targetX;
      curPos.z = targetZ;

      this.player.updateAnimation(delta, playerDirX, playerDirZ, true);
    } else {
      this.player.updateAnimation(delta, 0, 0, false);
    }

    // 2. Camera Smooth Follow or Overview Diorama Lerp
    if (this.cameraMode === 'overview') {
      const targetCamX = 0;
      const targetCamY = 32.0;
      const targetCamZ = 28.0;
      this.camera.position.x += (targetCamX - this.camera.position.x) * 3.5 * delta;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 3.5 * delta;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 3.5 * delta;
      this.camera.lookAt(0, 0, 0);
    } else {
      const pPos = this.player.getPosition();
      const targetCamX = pPos.x + 9.5;
      const targetCamY = 12.0;
      const targetCamZ = pPos.z + 10.0;
      this.camera.position.x += (targetCamX - this.camera.position.x) * 6 * delta;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 6 * delta;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 6 * delta;
      this.camera.lookAt(pPos.x, 0.9, pPos.z);
    }

    // 3. Update Zone by Player Coordinates
    const pPos = this.player.getPosition();
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

    // 7. Blinking Server LEDs Animation
    const now = Date.now() * 0.001;
    for (const item of this.ledMeshes) {
      const isLit = Math.sin(now * item.speed + item.offset) > -0.15;
      (item.mesh.material as THREE.MeshBasicMaterial).color.setHex(isLit ? item.baseColor : 0x050505);
    }

    // 8. Dynamic Colleague Speech Bubble System
    this.speechTimer -= delta;
    if (this.speechTimer <= 0) {
      if (this.activeSpeech) {
        this.activeSpeech = null;
        this.speechTimer = 3.0;
      } else {
        const item = this.speechLibrary[Math.floor(Math.random() * this.speechLibrary.length)];
        let worldPos: THREE.Vector3;
        if (item.speaker === 'Sếp Hùng' && this.bossNpc) {
          worldPos = this.bossNpc.group.position.clone().add(new THREE.Vector3(0, 1.8, 0));
        } else if (item.speaker === 'Chị Nga' && this.accountantNpc) {
          worldPos = this.accountantNpc.group.position.clone().add(new THREE.Vector3(0, 1.8, 0));
        } else if (item.speaker === 'Anh Tuấn' && this.truckerNpc) {
          worldPos = this.truckerNpc.group.position.clone().add(new THREE.Vector3(0, 1.8, 0));
        } else {
          worldPos = new THREE.Vector3(-14, 2.2, -20);
        }
        this.activeSpeech = { ...item, worldPos };
        this.speechTimer = 5.5;
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
      bPos.x += dirX * this.bossNpc.moveSpeed * delta;
      bPos.z += dirZ * this.bossNpc.moveSpeed * delta;
      this.bossNpc.updateAnimation(delta, dirX, dirZ, true);
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
