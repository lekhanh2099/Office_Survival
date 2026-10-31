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
    | 'boss_desk'
    | 'showroom'
    | 'balcony';
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
  public internNpc!: ChibiCharacter;
  public itNpc!: ChibiCharacter;

  // Stations & Pickups
  public stations: Workstation[] = [];
  public activeStation: Workstation | null = null;
  public pickups: MapPickup[] = [];

  // Raycasting & Tap to Interact
  public interactiveHitObjects: THREE.Mesh[] = [];
  public onStationClickCallback: ((station: Workstation, screenPos: { x: number; y: number }) => void) | null = null;
  public onColleagueClickCallback: ((colleagueId: string) => void) | null = null;
  public onPlayerClickCallback: (() => void) | null = null;
  public onFloorTapCallback: ((pos: THREE.Vector3) => void) | null = null;
  public autoWalkTarget: { pos: THREE.Vector3; station?: Workstation | null; onReach?: () => void; stopDist?: number } | null = null;
  private autoWalkMarkerMesh!: THREE.Mesh;

  // 3D Visual Guidance System (Target Beacon & Compass Arrow)
  public targetBeaconGroup!: THREE.Group;
  private beaconBeamMesh!: THREE.Mesh;
  private beaconRing1!: THREE.Mesh;
  private beaconRing2!: THREE.Mesh;
  private guideCompassArrow!: THREE.Group;
  public currentTargetStationPos: THREE.Vector3 | null = null;

  // Solid Collision Obstacles
  public obstacles: ObstacleAABB[] = [];

  // Interactive Lamp Light Reference
  public floorLampLight!: THREE.PointLight;
  public isFloorLampOn = true;

  // Cached viewport dimensions for Zero-Layout-Thrashing Screen Projections
  private cachedWidth = 800;
  private cachedHeight = 600;

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

  // Camera & Touch Gestures Orbit / Pan / Zoom State
  public cameraMode: 'follow' | 'overview' = 'follow';
  public dragMode: 'orbit' | 'pan' = 'orbit';

  public camAzimuth = 0.76;      // Horizontal angle (~43.5 deg isometric)
  public camPitch = 0.66;        // Vertical elevation angle (~38 deg)
  public camDistance = 17.5;     // Camera distance from target
  private targetAzimuth = 0.76;
  private targetPitch = 0.66;
  private targetDistance = 17.5;

  private velocityAzimuth = 0;
  private velocityPitch = 0;

  private camPanOffset = new THREE.Vector2(0, 0); // Panning offset on floor (X, Z)
  private currentLookAt = new THREE.Vector3(-10.5, 0.9, -11.5);

  // Multi-Touch Pointer Tracking
  private activePointers = new Map<number, {
    x: number;
    y: number;
    startX: number;
    startY: number;
    startTime: number;
    lastX: number;
    lastY: number;
    moved: boolean;
  }>();
  // Native Multi-Touch Tracking for Mobile (iOS Safari & Android)
  private isTouchGestureActive = false;
  private touch1Start = { x: 0, y: 0, time: 0 };
  private touch1Last = { x: 0, y: 0 };
  private touch1Moved = false;
  private touchPinchDist = 0;
  private touchStartCamDist = 17.5;
  private touchMidPoint = { x: 0, y: 0 };

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
    },
    {
      speaker: 'Em Linh',
      role: 'Thực Tập QC Lab',
      emoji: '🔬',
      avatarBg: '#06b6d4',
      text: 'Anh ơi, mẫu áo Polo Navy soi dưới tủ đèn D65 ra màu chuẩn Delta E 0.29 đẹp lắm!'
    },
    {
      speaker: 'Anh Hoàng',
      role: 'Kỹ Sư IT',
      emoji: '🖥️',
      avatarBg: '#4f46e5',
      text: 'Server ERP đã backup xong toàn bộ dữ liệu, mạng cáp quang thông suốt 1Gbps!'
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
    this.scene.fog = new THREE.FogExp2('#0c101c', 0.012);

    const aspect = width / height;
    const initFov = aspect < 0.8 ? 52 : (aspect < 1.1 ? 46 : 42);
    this.camera = new THREE.PerspectiveCamera(initFov, aspect, 0.1, 150);
    this.camera.position.set(0, 14, 13);
    this.camera.lookAt(0, 0.8, 0);

    // 2. WebGL Renderer with High-Fidelity Tone Mapping & Performance Balancing
    this.cachedWidth = width;
    this.cachedHeight = height;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.domElement.style.touchAction = 'none';
    this.container.appendChild(this.renderer.domElement);

    // 3. Realistic Layered Lighting
    this.setupLighting();

    // 4. Detailed Architectural World
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

    // 9. Auto-Walk Destination Marker & Pointer Raycaster
    this.setupAutoWalkMarker();
    this.setupVisualGuidanceSystem();
    this.setupPointerRaycaster();

    // 10. Resize Handling
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
      this.floorLampLight.intensity = this.isFloorLampOn ? 2.5 : 0.0;
    }
    return this.isFloorLampOn;
  }

  private setupLighting(): void {
    const hemi = new THREE.HemisphereLight(0xfff5eb, 0x0f172a, 1.45);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffeedb, 1.5);
    sun.position.set(22, 34, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 80;
    const sD = 35;
    sun.shadow.camera.left = -sD;
    sun.shadow.camera.right = sD;
    sun.shadow.camera.top = sD;
    sun.shadow.camera.bottom = -sD;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
    this.scene.add(sun);

    // Consolidated Department Accent Lights (Warm Golden Office & Cool Cyan Industrial)
    const lOffice = new THREE.PointLight(0xfbbf24, 1.5, 35);
    lOffice.position.set(-10, 6.0, -10);
    this.scene.add(lOffice);

    const lIndustrial = new THREE.PointLight(0x38bdf8, 1.5, 38);
    lIndustrial.position.set(10, 6.0, 10);
    this.scene.add(lIndustrial);
  }

  private setupGrandCampus(): void {
    // 1. Dark Exterior Base Foundation
    const baseGeo = new THREE.PlaneGeometry(64, 52);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.rotation.x = -Math.PI / 2;
    base.position.y = 0.0;
    base.receiveShadow = true;
    this.scene.add(base);

    // 2. Department-specific Non-overlapping Quadrant Floorings (at Y = 0.01):
    // Zone 1: NW (-28 to 0, -22 to 0) -> center (-14, -11), width 28, depth 22
    this.createWoodParquetFloor(-14, -11, 28, 22);

    // Zone 2: NE (0 to 28, -22 to 0) -> center (14, -11), width 28, depth 22
    this.createCleanroomFloor(14, -11, 28, 22);

    // Zone 3: SW (-28 to 0, 0 to 22) -> center (-14, 11), width 28, depth 22
    this.createEpoxyWarehouseFloor(-14, 11, 28, 22);

    // Zone 4: SE (0 to 28, 0 to 22) -> center (14, 11), width 28, depth 22
    this.createPortDockFloor(14, 11, 28, 22);

    // Zone 5 (Pantry & Executive Lounge): Raised White Marble Hexagon Mat at Y = 0.02
    this.createTileFloor(0, 1.5, 12, 10, '#f8fafc', '#cbd5e1', 0.02);

    // Boardroom & Boss Office Acoustic Carpet: Raised Carpet at Y = 0.02
    this.createCarpetFloor(-17, -14, 16, 16, '#1e1b4b', '#2e1065');

    // Restroom Tile Floor: Raised Tiles at Y = 0.02
    this.createTileFloor(-22, 0, 8, 8, '#e2e8f0', '#94a3b8', 0.02);

    // ==================== ZONE 1: CORPORATE OFFICE (VĂN PHÒNG ĐIỀU HÀNH) ====================
    this.createZoneSign(-14, 3.8, -21.5, '🏢 VĂN PHÒNG ĐIỀU HÀNH & MERCHANDISER', '#4f46e5');

    // Desks Pods with dual monitors, keyboards, desk dividers, chairs
    for (let i = 0; i < 3; i++) {
      const dx = -18 + i * 5;
      this.createColleagueDesk(dx, -14);
      this.addObstacle(`desk_r1_${i}`, dx, -14, 2.6, 1.4);

      this.createColleagueDesk(dx, -9);
      this.addObstacle(`desk_r2_${i}`, dx, -9, 2.6, 1.4);
    }

    // Modern Slim Water Dispenser
    this.createWaterCooler(-2.8, -1.8);
    this.addObstacle('water_cooler', -2.8, -1.8, 0.8, 0.8);

    // Refined Potted Indoor Plants
    this.createPlant(-24, -20);
    this.addObstacle('plant_1', -24, -20, 0.8, 0.8);
    this.createPlant(-4, -20);
    this.addObstacle('plant_2', -4, -20, 0.8, 0.8);
    this.createPlant(4, -20);
    this.addObstacle('plant_3', 4, -20, 0.8, 0.8);

    // Boardroom (Phòng Họp Kính VIP with Racetrack Oval Table)
    this.createBoardroom(-18, -16, 8, 6);

    // Executive Suite (Phòng Tổng Giám Đốc Hùng)
    this.createBossOffice(-18, -21);

    // IT Datacenter Room
    this.createServerRacks(-22, 10);
    this.addObstacle('server_racks', -21.25, 10, 3.2, 1.1);

    // Restroom / WC
    this.createRestroom(-22, 0);

    // ==================== ZONE 2: COLOR LAB & CUTTING (PHÒNG LAB & XƯỞNG CẮT) ====================
    this.createZoneSign(14, 3.2, -21.5, '✂️ XƯỞNG CẮT RẬP & PHÒNG LAB MÀU D65', '#059669');

    this.createCuttingTable(8, -12);
    this.addObstacle('cut_table_1', 8, -12, 4.4, 2.0);

    this.createCuttingTable(16, -12);
    this.addObstacle('cut_table_2', 16, -12, 4.4, 2.0);

    this.createCuttingTable(8, -7);
    this.addObstacle('cut_table_3', 8, -7, 4.4, 2.0);

    this.createCuttingTable(16, -7);
    this.addObstacle('cut_table_4', 16, -7, 4.4, 2.0);

    // Mannequin Dress Forms
    this.createMannequin(3.5, -12, '#1e3a8a');
    this.createMannequin(3.5, -7, '#b91c1c');

    // ==================== ZONE 3: MEGA FABRIC WAREHOUSE (KHO VẢI ĐẠI NGÀN) ====================
    this.createZoneSign(-14, 3.2, 2.5, '🧵 KHO VẢI CUỘN & NGUYÊN PHỤ LIỆU', '#d97706');

    for (let r = 0; r < 3; r++) {
      const rx = -22 + r * 7;
      this.createWarehouseRack(rx, 8, r);
      this.addObstacle(`rack_row1_${r}`, rx, 8, 2.4, 1.3);

      this.createWarehouseRack(rx, 16, r + 3);
      this.addObstacle(`rack_row2_${r}`, rx, 16, 2.4, 1.3);
    }

    // Heavy-duty Toyota Forklift with Hoisted Pallet
    this.createForklift(-5, 14);
    this.addObstacle('forklift', -5, 14, 2.2, 1.4);

    // Hydraulic Manual Pallet Jack
    this.createPalletJack(-8, 9);
    this.addObstacle('pallet_jack', -8, 9, 1.4, 0.9);

    // ==================== ZONE 4: LOGISTICS PORT & DOCK (CẢNG BIỂN & XUẤT CONT) ====================
    this.createZoneSign(14, 3.2, 2.5, '🚢 CẢNG XUẤT HÀNG & BÃI CONT 40HQ', '#0284c7');

    // Container 1: Cát Lái Logistics 40HQ (Ocean Blue)
    this.createShippingContainer(8, 12, '#0284c7', 'CÁT LÁI LOGISTICS', 'SGP-40HQ #9012', 0);
    this.addObstacle('container_1', 8, 12, 5.4, 2.6);

    // Container 2: Maersk Line (Deep Maritime Blue)
    this.createShippingContainer(18, 12, '#002444', 'MAERSK LINE', 'MSKU 89210-4', 0);
    this.addObstacle('container_2', 18, 12, 5.4, 2.6);

    // Container 2B (Stacked on top of Maersk at y=2.62, slightly offset): ONE Magenta
    this.createShippingContainer(18, 12.15, '#e11481', 'ONE NETWORK', 'ONEU 40918-0', 1);

    // Container 3: Evergreen Line (Forest Green)
    this.createShippingContainer(14, 18, '#046a38', 'EVERGREEN 40HQ', 'EMCU 73091-2', 0);
    this.addObstacle('container_3', 14, 18, 5.4, 2.6);

    // Dock Stadium Floodlight Mast (4 high-power LED floodlights)
    this.createPortFloodlightTower(26, 20);

    // Stacked EUR-Pallets with Export Cardboard Cartons
    this.createPalletWithCartons(8, 17.5);

    // ==================== ZONE 5: REAL DESIGNER PANTRY & LOUNGE ====================
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
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Warm Scandinavian natural oak base gradient
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, '#c28340');
    grad.addColorStop(0.5, '#b97735');
    grad.addColorStop(1, '#ad6c2c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Parquet herringbone planks with subtle wood grain fibers
    const plankW = 128;
    const plankH = 32;

    for (let y = 0; y < 1024; y += plankH) {
      const rowIdx = y / plankH;
      const offset = rowIdx % 2 === 0 ? 0 : plankW / 2;
      for (let x = -plankW; x < 1024 + plankW; x += plankW) {
        const px = x + offset;
        const grainTint = Math.sin(px * 0.05 + y * 0.1) * 0.5 + 0.5;
        const r = Math.round(185 + grainTint * 20);
        const g = Math.round(115 + grainTint * 18);
        const b = Math.round(50 + grainTint * 12);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(px + 1, y + 1, plankW - 2, plankH - 2);

        // Delicate wood grain lines
        ctx.strokeStyle = `rgba(130, 75, 25, 0.22)`;
        ctx.beginPath();
        ctx.moveTo(px + 10, y + 10);
        ctx.lineTo(px + plankW - 10, y + 10);
        ctx.moveTo(px + 20, y + 20);
        ctx.lineTo(px + plankW - 5, y + 20);
        ctx.stroke();

        // Soft bevel seam shadow
        ctx.strokeStyle = 'rgba(70, 35, 10, 0.40)';
        ctx.strokeRect(px + 0.5, y + 0.5, plankW - 1, plankH - 1);

        // Subtle top highlight
        ctx.strokeStyle = 'rgba(255, 220, 170, 0.22)';
        ctx.beginPath();
        ctx.moveTo(px + 1, y + 1.5);
        ctx.lineTo(px + plankW - 2, y + 1.5);
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(w / 5, h / 5);
    tex.anisotropy = 8;

    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.35,
      metalness: 0.05
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(cx, 0.01, cz);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  private createTileFloor(cx: number, cz: number, w: number, h: number, c1: string, c2: string, yPos = 0.02): void {
    const geo = new THREE.PlaneGeometry(w, h);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = c1;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = c2;
    ctx.lineWidth = 2.5;
    const step = 64;
    for (let x = 0; x <= 512; x += step) {
      ctx.moveTo(x, 0); ctx.lineTo(x, 512);
      ctx.moveTo(0, x); ctx.lineTo(512, x);
    }
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(w / 2.5, h / 2.5);

    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.25 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(cx, yPos, cz);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  private createCarpetFloor(cx: number, cz: number, w: number, h: number, c1: string, c2: string): void {
    const geo = new THREE.PlaneGeometry(w, h);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = c1;
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = c2;
    for (let y = 0; y < 512; y += 32) {
      for (let x = 0; x < 512; x += 32) {
        if ((x + y) % 64 === 0) ctx.fillRect(x + 4, y + 4, 24, 24);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(w / 3.5, h / 3.5);

    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(cx, 0.02, cz);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  private createCleanroomFloor(cx: number, cz: number, w: number, h: number): void {
    const geo = new THREE.PlaneGeometry(w, h);
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Cleanroom medical-grade anti-static vinyl tiles
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, 1024, 1024);

    const tileSize = 128;
    for (let y = 0; y < 1024; y += tileSize) {
      for (let x = 0; x < 1024; x += tileSize) {
        // Tile subtle tint
        const tint = (Math.sin(x * 0.05) + Math.cos(y * 0.05)) * 0.5 + 0.5;
        const g = Math.round(242 + tint * 10);
        const b = Math.round(248 + tint * 7);
        ctx.fillStyle = `rgb(238,${g},${b})`;
        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

        // Anti-static conductive carbon filament veins
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x + 15, y + 25);
        ctx.lineTo(x + 65, y + 50);
        ctx.lineTo(x + 110, y + 95);
        ctx.stroke();

        // Tile bevel seam
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.85)';
        ctx.strokeRect(x + 0.5, y + 0.5, tileSize - 1, tileSize - 1);
      }
    }

    // High-visibility yellow safety boundary stripes
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 22;
    ctx.strokeRect(11, 11, 1002, 1002);

    // Hazard hash lines on border
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 8;
    for (let i = 0; i < 1024; i += 32) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 16, 22); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i, 1002); ctx.lineTo(i + 16, 1024); ctx.stroke();
    }

    // Cleanroom ESD stencil
    ctx.save();
    ctx.fillStyle = '#0284c7';
    ctx.font = '900 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ESD CLEANROOM AREA · ISO 105 TEXTILE LAB', 512, 60);
    ctx.fillText('PHÒNG LAB SOI MÀU D65 & XƯỞNG CẮT RẬP', 512, 975);
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(w / 8, h / 8);
    tex.anisotropy = 8;

    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.25, metalness: 0.05 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(cx, 0.01, cz);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  private createEpoxyWarehouseFloor(cx: number, cz: number, w: number, h: number): void {
    const geo = new THREE.PlaneGeometry(w, h);
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Industrial gloss emerald epoxy base
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, '#064e3b');
    grad.addColorStop(0.5, '#047857');
    grad.addColorStop(1, '#065f46');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle expansion joints
    ctx.strokeStyle = 'rgba(2, 44, 34, 0.6)';
    ctx.lineWidth = 3;
    for (let x = 0; x <= 1024; x += 256) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1024); ctx.stroke();
    }
    for (let y = 0; y <= 1024; y += 256) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
    }

    // Yellow safety perimeter
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 18;
    ctx.strokeRect(10, 10, 1004, 1004);

    // Forklift central lane (yellow dashed lines)
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 10;
    ctx.setLineDash([36, 24]);
    ctx.beginPath();
    ctx.moveTo(340, 40); ctx.lineTo(340, 984);
    ctx.moveTo(684, 40); ctx.lineTo(684, 984);
    ctx.stroke();
    ctx.setLineDash([]);

    // Stenciled traffic text
    ctx.save();
    ctx.fillStyle = '#facc15';
    ctx.font = '900 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚜 FORKLIFT ONLY · XE NÂNG ƯU TIÊN', 512, 180);
    ctx.fillText('⚡ LỐI VẬN CHUYỂN VẢI CUỘN', 512, 850);

    // Pallet staging bay markings
    ctx.font = '700 24px monospace';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 240, 220, 260);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('BAY 01 · COTTON', 170, 380);

    ctx.strokeRect(60, 540, 220, 260);
    ctx.fillText('BAY 02 · SPANDEX', 170, 680);

    ctx.strokeRect(740, 240, 220, 260);
    ctx.fillText('BAY 03 · POLY', 850, 380);

    ctx.strokeRect(740, 540, 220, 260);
    ctx.fillText('BAY 04 · XUẤT XƯỞNG', 850, 680);
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;

    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.28,
      metalness: 0.1
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(cx, 0.01, cz);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  private createPortDockFloor(cx: number, cz: number, w: number, h: number): void {
    const geo = new THREE.PlaneGeometry(w, h);
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Heavy reinforced concrete slabs (quayside paving)
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 1024, 1024);

    // Concrete slab grid with mastic expansion seams
    const slab = 256;
    for (let y = 0; y < 1024; y += slab) {
      for (let x = 0; x < 1024; x += slab) {
        const noise = (Math.sin(x * 0.1) + Math.cos(y * 0.1)) * 12;
        const c = Math.round(58 + noise);
        ctx.fillStyle = `rgb(${c}, ${c + 4}, ${c + 10})`;
        ctx.fillRect(x + 2, y + 2, slab - 4, slab - 4);

        // Dark bitumen expansion joint
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, slab, slab);
      }
    }

    // Heavy crane rail steel tracks running vertically
    for (const rx of [200, 824]) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(rx - 24, 0, 48, 1024);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(rx - 8, 0, 16, 1024);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(rx - 2, 0, 4, 1024);
    }

    // Yellow hazard perimeter stripes
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 20;
    ctx.strokeRect(10, 10, 1004, 1004);

    // Hazard chevrons on border
    ctx.fillStyle = '#0f172a';
    for (let i = 0; i < 1024; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0); ctx.lineTo(i + 20, 20); ctx.lineTo(i + 10, 20); ctx.lineTo(i - 10, 0);
      ctx.fill();
    }

    // Container locating corner marks
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 6;
    ctx.strokeRect(260, 160, 500, 300);
    ctx.strokeRect(260, 560, 500, 300);

    ctx.save();
    ctx.fillStyle = '#facc15';
    ctx.font = '900 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🚢 BÃI TẬP KẾT CONT 40HQ · CẢNG CÁT LÁI', 512, 110);
    ctx.fillText('[ KHU VỰC HẢI QUAN KIỂM HÓA ]', 512, 510);
    ctx.fillText('CRANE TRACK · KHÔNG ĐỨNG DƯỚI TẦM CẨU', 512, 920);
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;

    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.65,
      metalness: 0.15
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(cx, 0.01, cz);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  private createZoneSign(cx: number, cy: number, cz: number, text: string, color: string): void {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 200;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(16, 16, 992, 168, 48);
    ctx.fill();

    ctx.lineWidth = 8;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 50px Nunito, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 512, 102);

    const tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(4.6, 0.9, 1);
    sprite.position.set(cx, cy, cz);
    this.scene.add(sprite);
  }

  private createColleagueDesk(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    // Warm wood table top with beveled finish
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.09, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.35, metalness: 0.05 })
    );
    top.position.y = 0.75;
    top.castShadow = true;
    g.add(top);

    // Sleek angled matte-black trestle loop legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.7, roughness: 0.3 });
    for (const lx of [-1.05, 1.05]) {
      const loop = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.72, 1.08), legMat);
      loop.position.set(lx, 0.36, 0);
      g.add(loop);
    }

    // Fabric Acoustic Privacy Divider Panel with pinned post-its
    const partMat = new THREE.MeshStandardMaterial({ color: 0x4338ca, roughness: 0.8 });
    const part = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.52, 0.04), partMat);
    part.position.set(0, 1.04, -0.58);
    g.add(part);

    // Sticky notes pinned to divider
    const noteMat1 = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const note1 = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.14), noteMat1);
    note1.position.set(-0.6, 1.05, -0.55);
    g.add(note1);

    const noteMat2 = new THREE.MeshBasicMaterial({ color: 0xf472b6 });
    const note2 = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.14), noteMat2);
    note2.position.set(0.6, 1.12, -0.55);
    g.add(note2);

    // Dual Ultra-wide Monitors on Articulated Arm
    const mon1 = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.42, 0.03), new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
    mon1.position.set(-0.36, 1.06, -0.22);
    mon1.rotation.y = 0.1;
    g.add(mon1);

    const mon2 = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.42, 0.03), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    mon2.position.set(0.36, 1.06, -0.22);
    mon2.rotation.y = -0.1;
    g.add(mon2);

    // Keyboard & Mouse on Leather Desk Blotter
    const blotter = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.01, 0.55), new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.6 }));
    blotter.position.set(0, 0.80, 0.12);
    g.add(blotter);

    const kb = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.02, 0.16), new THREE.MeshStandardMaterial({ color: 0x312e81 }));
    kb.position.set(-0.1, 0.815, 0.12);
    g.add(kb);

    const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.12), new THREE.MeshStandardMaterial({ color: 0x818cf8 }));
    mouse.position.set(0.32, 0.815, 0.12);
    g.add(mouse);

    // Arched Brass Desk Lamp with warm glow
    const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8 }));
    lampArm.position.set(0.85, 1.0, -0.2);
    lampArm.rotation.z = -0.25;
    g.add(lampArm);

    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.14, 12), new THREE.MeshStandardMaterial({ color: 0xfef08a }));
    lampShade.position.set(0.76, 1.18, -0.2);
    g.add(lampShade);

    // Coffee mug
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 10), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    mug.position.set(-0.85, 0.86, 0.12);
    g.add(mug);

    // Under-desk Mini PC Tower with glowing fan
    const pcTower = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.48, 0.48), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 }));
    pcTower.position.set(0.85, 0.24, -0.15);
    g.add(pcTower);

    // Ergonomic Swivel Chair with 5-Star Base
    this.createErgonomicChair(g, 0, 0.65, 0);

    this.scene.add(g);
  }

  private createErgonomicChair(parent: THREE.Group, x: number, z: number, rotY: number): void {
    const cg = new THREE.Group();
    cg.position.set(x, 0, z);
    cg.rotation.y = rotY;

    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.15 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });

    // 5-Star Spoke Base
    for (let s = 0; s < 5; s++) {
      const angle = (s * Math.PI * 2) / 5;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.32), chromeMat);
      spoke.rotation.y = angle;
      spoke.position.set(Math.sin(angle) * 0.16, 0.06, Math.cos(angle) * 0.16);
      cg.add(spoke);

      // Caster wheel
      const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), seatMat);
      wheel.position.set(Math.sin(angle) * 0.30, 0.035, Math.cos(angle) * 0.30);
      cg.add(wheel);
    }

    // Gas-lift cylinder
    const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 10), chromeMat);
    cylinder.position.y = 0.22;
    cg.add(cylinder);

    // Contoured Seat Cushion
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.52), seatMat);
    seat.position.y = 0.42;
    cg.add(seat);

    // Curved Mesh Backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.54, 0.06), seatMat);
    back.position.set(0, 0.70, -0.24);
    back.rotation.x = -0.1;
    cg.add(back);

    // Armrests
    for (const side of [-0.28, 0.28]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.28), seatMat);
      arm.position.set(side, 0.58, 0);
      cg.add(arm);
    }

    parent.add(cg);
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

    // North Glass Wall with Mullions
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

    // Racetrack-Oval Walnut Conference Table
    const tableTop = new THREE.Mesh(
      new THREE.CylinderGeometry(w * 0.35, w * 0.35, 0.12, 32),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.35 })
    );
    tableTop.scale.set(1.4, 1, 0.8);
    tableTop.position.y = 0.82;
    tableTop.castShadow = true;
    g.add(tableTop);

    // Brushed metal power hub in center of table
    const hub = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.02, 0.3), new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8 }));
    hub.position.set(0, 0.89, 0);
    g.add(hub);

    // 6 Leather Swivel Conference Chairs
    const chairOffsets = [
      [-w * 0.25, -h * 0.28, Math.PI],
      [0, -h * 0.30, Math.PI],
      [w * 0.25, -h * 0.28, Math.PI],
      [-w * 0.25, h * 0.28, 0],
      [0, h * 0.30, 0],
      [w * 0.25, h * 0.28, 0]
    ];
    for (const [cx, cz, rot] of chairOffsets) {
      this.createErgonomicChair(g, cx, cz, rot);
    }

    // High-Resolution Frameless Whiteboard
    this.createWhiteboard(g, 0, 1.6, -h / 2 + 0.1);

    // Minimalist Linear LED Pendant Light
    const penBar = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.06, 0.12), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    penBar.position.set(0, 2.4, 0);
    g.add(penBar);

    this.scene.add(g);

    this.addObstacle('boardroom_wall_n', x, z - h / 2, w, 0.35);
    this.addObstacle('boardroom_wall_w', x - w / 2, z, 0.35, h);
    this.addObstacle('boardroom_table', x, z, w * 0.74, h * 0.50);
  }

  private createWhiteboard(parent: THREE.Group, x: number, y: number, z: number): void {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Clean glossy glass whiteboard
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1024, 512);

    // Subtle header gradient
    const grad = ctx.createLinearGradient(0, 0, 1024, 0);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(1, '#3b82f6');
    ctx.fillStyle = grad;
    ctx.font = 'bold 36px Nunito, sans-serif';
    ctx.fillText('📊 KẾ HOẠCH XUẤT KHẨU Q4 · THỊ TRƯỜNG US & EU', 40, 65);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(40, 88); ctx.lineTo(984, 88);
    ctx.stroke();

    // Draw Bar Chart
    const categories = [
      { label: 'Polo US', value: 85, color: '#22c55e' },
      { label: 'Khaki EU', value: 65, color: '#3b82f6' },
      { label: 'Hoodie Seoul', value: 92, color: '#f59e0b' },
      { label: 'Spandex Tokyo', value: 78, color: '#a855f7' }
    ];

    const chartX = 80;
    const chartY = 420;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(chartX, 130); ctx.lineTo(chartX, chartY); ctx.lineTo(940, chartY);
    ctx.stroke();

    categories.forEach((cat, idx) => {
      const bx = chartX + 60 + idx * 210;
      const barH = (cat.value / 100) * 240;
      ctx.fillStyle = cat.color;
      ctx.fillRect(bx, chartY - barH, 90, barH);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 24px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${cat.value}%`, bx + 45, chartY - barH - 12);
      ctx.fillText(cat.label, bx + 45, chartY + 32);
    });

    // Stamp
    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 28px Nunito, sans-serif';
    ctx.fillText('✅ CHUẨN AQL 2.5: PASS 100%', 650, 150);

    const tex = new THREE.CanvasTexture(canvas);
    const boardGeo = new THREE.BoxGeometry(3.6, 1.8, 0.04);
    const boardMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.2 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(x, y, z);
    parent.add(board);
  }

  private createBossOffice(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    // Heavy Executive Mahogany L-Desk
    const desk = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.15, 1.4), new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.3 }));
    desk.position.y = 0.8;
    desk.castShadow = true;
    g.add(desk);

    // Leather blotter with gold stitching
    const blotter = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.02, 0.6), new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.6 }));
    blotter.position.set(0, 0.88, 0.1);
    g.add(blotter);

    // Open MacBook Pro
    const macBase = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.02, 0.26), new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9 }));
    macBase.position.set(0, 0.895, 0.1);
    g.add(macBase);

    const macScreen = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.26, 0.02), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    macScreen.position.set(0, 1.02, -0.03);
    macScreen.rotation.x = -0.2;
    g.add(macScreen);

    // Gold Nameplate "GĐ. TRẦN VĂN HÙNG"
    const np = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9 }));
    np.position.set(0.8, 0.92, -0.35);
    g.add(np);

    // High-back Executive Armchair with headrest
    this.createErgonomicChair(g, 0, -0.75, Math.PI);

    // Bookshelf filled with leather binders and golden trophy
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 0.45), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 }));
    shelf.position.set(0, 1.3, -1.8);
    g.add(shelf);

    // Golden Trophy with marble pedestal
    const trophy = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.42, 12), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.95, roughness: 0.1 }));
    trophy.position.set(0.65, 1.62, -1.6);
    g.add(trophy);

    // Safe Deposit Box
    const safe = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.7), new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8 }));
    safe.position.set(-1.8, 0.45, -1.6);
    g.add(safe);

    this.scene.add(g);
    this.addObstacle('boss_desk', x, z, 3.2, 1.8);
  }

  private createDetailedPantryAndLounge(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    // 1. Kitchen Waterfall Quartz Island Counter
    const counterMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
    const topMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.15, metalness: 0.05 });

    const c1 = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.95, 1.1), counterMat);
    c1.position.set(0, 0.475, 0);
    g.add(c1);

    const c1Top = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.08, 1.2), topMat);
    c1Top.position.set(0, 0.98, 0);
    g.add(c1Top);

    // Commercial Espresso Coffee Machine
    const coffeeMach = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.6, 0.6), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 }));
    coffeeMach.position.set(-1.2, 1.32, 0);
    g.add(coffeeMach);

    const portafilter = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.32, 8), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    portafilter.rotation.z = Math.PI / 2;
    portafilter.position.set(-1.2, 1.2, 0.36);
    g.add(portafilter);

    // Retro Curved Mint Refrigerator (Smeg style)
    const fridgeMat = new THREE.MeshStandardMaterial({ color: 0xa7f3d0, roughness: 0.25 });
    const fridge = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.1, 1.0), fridgeMat);
    fridge.position.set(-2.8, 1.05, 0);
    g.add(fridge);

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8), new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9 }));
    handle.position.set(-2.25, 1.15, 0.52);
    g.add(handle);

    // Bar Stools along counter
    const stoolMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
    for (const sx of [-0.9, 0.3, 1.5]) {
      const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.65, 16), stoolMat);
      stool.position.set(sx, 0.325, 1.05);
      g.add(stool);
    }

    // 2. Scandinavian Modern Camel Fabric Sofa with Throw Pillows
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.46, 1.1), sofaMat);
    sofaBase.position.set(0, 0.23, 3.4);
    sofaBase.castShadow = true;
    g.add(sofaBase);

    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.65, 0.36), sofaMat);
    sofaBack.position.set(0, 0.68, 3.8);
    g.add(sofaBack);

    // Throw pillows
    const pillowMat1 = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    const pillow1 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.14), pillowMat1);
    pillow1.position.set(-0.9, 0.65, 3.5);
    pillow1.rotation.z = 0.2;
    g.add(pillow1);

    const pillowMat2 = new THREE.MeshStandardMaterial({ color: 0xfef08a });
    const pillow2 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.14), pillowMat2);
    pillow2.position.set(0.9, 0.65, 3.5);
    pillow2.rotation.z = -0.2;
    g.add(pillow2);

    // Round Nordic Coffee Table with succulent and magazine
    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.08, 24), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 }));
    tableTop.position.set(0, 0.42, 2.1);
    g.add(tableTop);

    // Succulent Pot
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.14, 12), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
    pot.position.set(0, 0.53, 2.1);
    g.add(pot);

    const plantLeaves = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
    plantLeaves.position.set(0, 0.64, 2.1);
    g.add(plantLeaves);

    // 3. Arched Brass Floor Lamp (Interactive on/off!)
    const lampG = new THREE.Group();
    lampG.position.set(2.4, 0, 3.2);

    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 16), new THREE.MeshStandardMaterial({ color: 0x1f2937 }));
    lampBase.position.y = 0.03;
    lampG.add(lampBase);

    const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.4, 10), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85, roughness: 0.2 }));
    lampPole.position.y = 1.2;
    lampG.add(lampPole);

    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.38, 16), new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.2 }));
    lampShade.position.set(0, 2.3, 0);
    lampG.add(lampShade);

    this.floorLampLight = new THREE.PointLight(0xfef08a, 2.5, 14);
    this.floorLampLight.position.set(0, 2.1, 0);
    lampG.add(this.floorLampLight);

    g.add(lampG);

    this.scene.add(g);

    this.addObstacle('pantry_counter', x, z, 4.6, 1.4);
    this.addObstacle('pantry_fridge', x - 2.8, z, 1.2, 1.2);
    this.addObstacle('lounge_sofa', x, z + 3.4, 3.0, 1.3);
    this.addObstacle('lounge_table', x, z + 2.1, 1.6, 1.6);
  }

  private createRestroom(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const cubMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const wall1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 2.4), cubMat);
    wall1.position.set(0, 1.1, 0);
    g.add(wall1);

    // Washbasin vanity
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

    this.scene.add(g);
  }

  public createThanTaiAltar(x: number, z: number): THREE.Group {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const redMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.35 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85, roughness: 0.2 });
    const darkRedMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.45 });

    // Multi-tiered pedestal
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.22, 1.2), darkRedMat);
    base.position.y = 0.11;
    base.castShadow = true;
    g.add(base);

    const back = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.5, 0.08), redMat);
    back.position.set(0, 0.85, -0.5);
    g.add(back);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.5, 1.0), redMat);
    leftWall.position.set(-0.68, 0.85, 0);
    g.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.5, 1.0), redMat);
    rightWall.position.set(0.68, 0.85, 0);
    g.add(rightWall);

    // Traditional pagoda curved eaves with golden crest
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.18, 1.3), redMat);
    roof.position.set(0, 1.6, 0);
    g.add(roof);

    const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.08, 1.36), goldMat);
    goldTrim.position.set(0, 1.68, 0);
    g.add(goldTrim);

    // Ornate Golden Statues (Thần Tài with gold sycee & Thổ Địa with palm fan)
    const thanTai = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.44, 14), goldMat);
    thanTai.position.set(-0.35, 0.44, -0.2);
    g.add(thanTai);

    const thoDia = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 0.40, 14), goldMat);
    thoDia.position.set(0.35, 0.42, -0.2);
    g.add(thoDia);

    // Brass Incense Burner (Bát Hương) with 3 glowing incense sticks
    const incenseBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.14, 14), goldMat);
    incenseBowl.position.set(0, 0.29, 0.08);
    g.add(incenseBowl);

    const stickMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    for (let i = -1; i <= 1; i++) {
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 6), stickMat);
      stick.position.set(i * 0.04, 0.48, 0.08);
      stick.rotation.z = i * 0.08;
      g.add(stick);
    }

    // Golden Thiềm Thừ (Three-legged money toad with ancient coin)
    const toad = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), goldMat);
    toad.scale.set(1.25, 0.75, 1);
    toad.position.set(-0.55, 0.28, 0.36);
    g.add(toad);

    // Offering Tray with 5 Oranges
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.04, 14), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    plate.position.set(0.44, 0.24, 0.32);
    g.add(plate);

    const fruitMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });
    const fruit1 = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), fruitMat);
    fruit1.position.set(0.44, 0.30, 0.32);
    g.add(fruit1);

    this.scene.add(g);
    this.addObstacle('altar', x, z, 1.7, 1.4);
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

    const head = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.4, 10), poleMat);
    head.position.set(1.2, 4.7, 0);
    g.add(head);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    bulb.position.set(1.2, 4.5, 0);
    g.add(bulb);

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

    const tableW = 4.4;
    const tableH = 0.86;
    const tableD = 2.0;

    // 1. Industrial Steel Legs (6 sturdy legs with leveling feet)
    const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });
    const footMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const legGeo = new THREE.BoxGeometry(0.08, tableH - 0.08, 0.08);

    const legXs = [-tableW / 2 + 0.15, 0, tableW / 2 - 0.15];
    const legZs = [-tableD / 2 + 0.15, tableD / 2 - 0.15];

    for (const lx of legXs) {
      for (const lz of legZs) {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, (tableH - 0.08) / 2, lz);
        g.add(leg);

        const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 10), footMat);
        foot.position.set(lx, 0.02, lz);
        g.add(foot);
      }
    }

    // Horizontal Steel Perimeter Stretchers
    const stretcherX = new THREE.Mesh(new THREE.BoxGeometry(tableW - 0.3, 0.06, 0.04), legMat);
    stretcherX.position.set(0, 0.25, -tableD / 2 + 0.15);
    g.add(stretcherX);
    const stretcherX2 = stretcherX.clone();
    stretcherX2.position.z = tableD / 2 - 0.15;
    g.add(stretcherX2);

    // 2. Lower Storage Shelf holding paper rolls
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(tableW - 0.35, 0.03, tableD - 0.35),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 })
    );
    shelf.position.set(0, 0.25, 0);
    g.add(shelf);

    // Kraft paper rolls on bottom shelf
    const paperRollMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });
    for (let i = 0; i < 2; i++) {
      const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.2, 12), paperRollMat);
      roll.rotateZ(Math.PI / 2);
      roll.position.set(0, 0.38, -0.4 + i * 0.8);
      g.add(roll);
    }

    // 3. Thick Laminated Melamine Tabletop
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(tableW, 0.08, tableD),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
    );
    top.position.y = tableH;
    top.castShadow = true;
    top.receiveShadow = true;
    g.add(top);

    // 4. Large Self-Healing Metric Cutting Mat (Green #059669 with printed grid)
    const matCanvas = document.createElement('canvas');
    matCanvas.width = 512; matCanvas.height = 256;
    const mctx = matCanvas.getContext('2d')!;
    mctx.fillStyle = '#059669';
    mctx.fillRect(0, 0, 512, 256);
    // CM Grid
    mctx.strokeStyle = '#34d399';
    mctx.lineWidth = 1.5;
    for (let x = 0; x <= 512; x += 32) {
      mctx.beginPath(); mctx.moveTo(x, 0); mctx.lineTo(x, 256); mctx.stroke();
    }
    for (let y = 0; y <= 256; y += 32) {
      mctx.beginPath(); mctx.moveTo(0, y); mctx.lineTo(512, y); mctx.stroke();
    }
    // 45 degree angle bias lines
    mctx.strokeStyle = '#a7f3d0';
    mctx.lineWidth = 2;
    mctx.beginPath();
    mctx.moveTo(0, 0); mctx.lineTo(256, 256);
    mctx.moveTo(256, 0); mctx.lineTo(512, 256);
    mctx.stroke();

    const matTex = new THREE.CanvasTexture(matCanvas);
    const cutMat = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 1.6),
      new THREE.MeshStandardMaterial({ map: matTex, roughness: 0.4 })
    );
    cutMat.rotation.x = -Math.PI / 2;
    cutMat.position.set(0, tableH + 0.042, 0);
    g.add(cutMat);

    // 5. Multi-ply Knitted Fabric Lay (Navy Blue Plies)
    const fabricLay = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.09, 1.3),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7 })
    );
    fabricLay.position.set(-0.15, tableH + 0.088, 0);
    g.add(fabricLay);

    // 6. CAD Marker Plotter Paper on top of fabric with printed garment patterns
    const cadCanvas = document.createElement('canvas');
    cadCanvas.width = 512; cadCanvas.height = 256;
    const cctx = cadCanvas.getContext('2d')!;
    cctx.fillStyle = '#ffffff';
    cctx.fillRect(0, 0, 512, 256);
    cctx.strokeStyle = '#0284c7';
    cctx.lineWidth = 3;
    cctx.strokeRect(20, 20, 110, 45);
    cctx.strokeRect(150, 20, 110, 45);
    cctx.beginPath();
    cctx.arc(80, 160, 55, 0, Math.PI, true);
    cctx.closePath();
    cctx.stroke();
    cctx.strokeRect(300, 30, 180, 200);
    cctx.fillStyle = '#0284c7';
    cctx.font = '700 14px monospace';
    cctx.fillText('POLO SHIRT 2026 · SIZE L', 315, 60);
    cctx.fillText('MARKER: 500 PCS USA', 315, 85);

    const cadTex = new THREE.CanvasTexture(cadCanvas);
    const markerPaper = new THREE.Mesh(
      new THREE.PlaneGeometry(3.18, 1.28),
      new THREE.MeshStandardMaterial({ map: cadTex, roughness: 0.6 })
    );
    markerPaper.rotation.x = -Math.PI / 2;
    markerPaper.position.set(-0.15, tableH + 0.135, 0);
    g.add(markerPaper);

    // 7. Eastman Straight-Knife Cloth Cutting Machine
    const cutterG = new THREE.Group();
    cutterG.position.set(0.9, tableH + 0.09, 0.2);

    const footplate = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.015, 0.15),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 })
    );
    footplate.position.y = 0.01;
    cutterG.add(footplate);

    const knife = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.45, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.1 })
    );
    knife.position.set(0, 0.24, 0);
    cutterG.add(knife);

    const motor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.25, 14),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.3 })
    );
    motor.position.set(0, 0.52, 0);
    cutterG.add(motor);

    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.14, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
    );
    handle.position.set(-0.08, 0.52, 0);
    cutterG.add(handle);

    g.add(cutterG);

    // 8. Tailor Shears (Golden Brass)
    const shearMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 });
    const shearBlade = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 0.04), shearMat);
    shearBlade.position.set(-1.6, tableH + 0.05, -0.6);
    shearBlade.rotation.y = 0.4;
    g.add(shearBlade);

    this.scene.add(g);
  }

  private createWarehouseRack(x: number, z: number, rackIdx: number = 0): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const W = 2.4;
    const H = 3.4;
    const D = 1.2;

    // 1. Upright Steel Posts (4 slotted columns in Safety Blue #0284c7)
    const uprightMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.35 });
    const postGeo = new THREE.BoxGeometry(0.09, H, 0.09);
    for (const px of [-W / 2 + 0.05, W / 2 - 0.05]) {
      for (const pz of [-D / 2 + 0.05, D / 2 - 0.05]) {
        const post = new THREE.Mesh(postGeo, uprightMat);
        post.position.set(px, H / 2, pz);
        g.add(post);

        const foot = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, 0.03, 0.18),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8 })
        );
        foot.position.set(px, 0.015, pz);
        g.add(foot);
      }
    }

    // 2. Zigzag Steel Diagonal Cross-Trusses (connecting front & back uprights)
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.4 });
    const strutGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.35, 8);
    strutGeo.rotateZ(Math.PI / 4);

    for (const px of [-W / 2 + 0.05, W / 2 - 0.05]) {
      for (let level = 0; level < 3; level++) {
        const strut = new THREE.Mesh(strutGeo, trussMat);
        strut.position.set(px, 0.6 + level * 1.1, 0);
        strut.rotation.y = (level % 2 === 0 ? 1 : -1) * 0.2;
        g.add(strut);
      }
    }

    // 3. Three Tiers of Heavy Safety Orange Box Beams (#ea580c)
    const beamMat = new THREE.MeshStandardMaterial({ color: 0xea580c, metalness: 0.4, roughness: 0.3 });
    const levels = [0.2, 1.35, 2.45];
    const beamXGeo = new THREE.BoxGeometry(W, 0.11, 0.07);
    const beamZGeo = new THREE.BoxGeometry(0.07, 0.11, D);
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x64748b, wireframe: true });

    for (const y of levels) {
      for (const bz of [-D / 2 + 0.04, D / 2 - 0.04]) {
        const b = new THREE.Mesh(beamXGeo, beamMat);
        b.position.set(0, y, bz);
        g.add(b);
      }
      for (const bx of [-W / 2 + 0.04, W / 2 - 0.04]) {
        const b = new THREE.Mesh(beamZGeo, beamMat);
        b.position.set(bx, y, 0);
        g.add(b);
      }

      const deck = new THREE.Mesh(new THREE.BoxGeometry(W - 0.1, 0.02, D - 0.1), wireMat);
      deck.position.set(0, y + 0.05, 0);
      g.add(deck);
    }

    // 4. Stored Goods & Realistic Wrapped Fabric Rolls
    const fabricColors = [0x1e3a8a, 0x991b1b, 0x15803d, 0x374151, 0xd97706, 0x7c3aed, 0x0284c7, 0xbe123c];
    const rollGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.02, 16);
    rollGeo.rotateX(Math.PI / 2);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const tagMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Level 1: Pallets with heavy rolls
    const palMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 });
    for (const palX of [-0.55, 0.55]) {
      const pal = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.12, 1.05), palMat);
      pal.position.set(palX, 0.28, 0);
      g.add(pal);

      const c = fabricColors[(rackIdx * 2 + (palX > 0 ? 1 : 0)) % fabricColors.length];
      const rollMat = new THREE.MeshStandardMaterial({ color: c, roughness: 0.35, metalness: 0.1 });
      const roll = new THREE.Mesh(rollGeo, rollMat);
      roll.position.set(palX, 0.52, 0);
      g.add(roll);

      const core = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.04, 12), coreMat);
      core.rotateX(Math.PI / 2);
      core.position.set(palX, 0.52, 0);
      g.add(core);

      const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.12), tagMat);
      tag.position.set(palX, 0.52, 0.53);
      g.add(tag);
    }

    // Level 2: 5 stacked fabric rolls
    const rollOffsets = [-0.8, -0.4, 0.0, 0.4, 0.8];
    for (let i = 0; i < rollOffsets.length; i++) {
      const rx = rollOffsets[i];
      const c = fabricColors[(rackIdx * 3 + i + 2) % fabricColors.length];
      const rollMat = new THREE.MeshStandardMaterial({
        color: c,
        roughness: 0.25,
        metalness: 0.15,
        transparent: true,
        opacity: 0.95
      });
      const roll = new THREE.Mesh(rollGeo, rollMat);
      roll.position.set(rx, 1.58, 0);
      g.add(roll);

      const core = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.04, 12), coreMat);
      core.rotateX(Math.PI / 2);
      core.position.set(rx, 1.58, 0);
      g.add(core);

      const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.12), tagMat);
      tag.position.set(rx, 1.58, 0.53);
      g.add(tag);
    }

    // Level 3 (Top tier): 4 cardboard cartons of yarn cones
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
    for (let i = 0; i < 4; i++) {
      const bx = -0.75 + i * 0.5;
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.45, 0.8), boxMat);
      box.position.set(bx, 2.75, 0);
      g.add(box);

      const tape = new THREE.Mesh(
        new THREE.BoxGeometry(0.442, 0.06, 0.802),
        new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.4 })
      );
      tape.position.set(bx, 2.75, 0);
      g.add(tape);
    }

    // Aisle Rack Stencil Label
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 80;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 80);
    ctx.strokeStyle = '#facc15'; ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 252, 76);
    ctx.fillStyle = '#facc15'; ctx.font = '900 32px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`KỆ VẢI K${rackIdx + 1}`, 128, 40);

    const signTex = new THREE.CanvasTexture(canvas);
    const signSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: signTex }));
    signSprite.scale.set(1.4, 0.45, 1);
    signSprite.position.set(0, H + 0.35, 0);
    g.add(signSprite);

    this.scene.add(g);
  }

  private createCorrugatedContainerTexture(baseColor: string, label: string, code: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base coat
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 1024, 512);

    // Corrugation ribs (vertical groove rhythm)
    const ribStep = 32;
    for (let x = 0; x < 1024; x += ribStep) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
      ctx.fillRect(x, 0, ribStep * 0.45, 512);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.fillRect(x + ribStep * 0.45, 0, ribStep * 0.55, 512);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, 512);
      ctx.stroke();
    }

    // Weathered bottom grime
    const grime = ctx.createLinearGradient(0, 420, 0, 512);
    grime.addColorStop(0, 'rgba(30, 20, 10, 0)');
    grime.addColorStop(1, 'rgba(30, 20, 10, 0.55)');
    ctx.fillStyle = grime;
    ctx.fillRect(0, 420, 1024, 92);

    // Steel perimeter border
    ctx.lineWidth = 14;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.strokeRect(7, 7, 1010, 498);

    // Bold Shipping Line Livery Decal
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 62px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 8;
    ctx.fillText(label, 512, 220);

    // Serial & ISO Type code
    ctx.font = '900 32px monospace';
    ctx.fillStyle = '#facc15';
    ctx.fillText(code, 512, 290);

    // Technical specifications plate in lower right corner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(680, 360, 310, 125);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(680, 360, 310, 125);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('MAX GROSS: 32,500 KG', 695, 388);
    ctx.fillText('TARE WT:    3,840 KG', 695, 414);
    ctx.fillText('PAYLOAD:   28,660 KG', 695, 440);
    ctx.fillText('CUBE:        76.4 CBM', 695, 466);
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    return tex;
  }

  private createShippingContainer(
    x: number,
    z: number,
    color: string,
    label: string,
    code: string = 'VN-40HQ',
    stackLevel: number = 0,
    rotY: number = 0
  ): void {
    const g = new THREE.Group();
    const yBase = stackLevel * 2.62;
    g.position.set(x, yBase, z);
    if (rotY !== 0) g.rotation.y = rotY;

    const L = 5.4;
    const H = 2.6;
    const W = 2.4;

    const texSide = this.createCorrugatedContainerTexture(color, label, code);

    const bodyMatSide = new THREE.MeshStandardMaterial({
      map: texSide,
      roughness: 0.5,
      metalness: 0.25
    });
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.5
    });
    const baseColorMat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.5,
      metalness: 0.2
    });

    const materials = [
      baseColorMat,  // +X (Door face)
      baseColorMat,  // -X
      darkMetalMat,  // +Y (Roof)
      darkMetalMat,  // -Y (Bottom)
      bodyMatSide,   // +Z (Front side)
      bodyMatSide    // -Z (Back side)
    ];

    const body = new THREE.Mesh(new THREE.BoxGeometry(L, H, W), materials);
    body.position.y = H / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);

    // Corner Steel Posts
    const postMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.5 });
    const postGeo = new THREE.BoxGeometry(0.18, H + 0.04, 0.18);
    for (const px of [-L / 2 + 0.09, L / 2 - 0.09]) {
      for (const pz of [-W / 2 + 0.09, W / 2 - 0.09]) {
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(px, H / 2, pz);
        g.add(post);
      }
    }

    // Top and Bottom Longitudinal Rails
    const topRailGeo = new THREE.BoxGeometry(L, 0.12, 0.12);
    for (const rz of [-W / 2 + 0.06, W / 2 - 0.06]) {
      const topR = new THREE.Mesh(topRailGeo, postMat);
      topR.position.set(0, H - 0.06, rz);
      g.add(topR);

      const botR = new THREE.Mesh(topRailGeo, postMat);
      botR.position.set(0, 0.06, rz);
      g.add(botR);
    }

    // ISO Corner Castings (8 heavy corner blocks with oval lock holes)
    const cornerMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
    const cornerHoleMat = new THREE.MeshBasicMaterial({ color: 0x020617 });
    const cBoxGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
    const cHoleGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.23, 12);
    cHoleGeo.rotateX(Math.PI / 2);

    for (const cx of [-L / 2 + 0.1, L / 2 - 0.1]) {
      for (const cy of [0.11, H - 0.11]) {
        for (const cz of [-W / 2 + 0.1, W / 2 - 0.1]) {
          const cornerBox = new THREE.Mesh(cBoxGeo, cornerMat);
          cornerBox.position.set(cx, cy, cz);
          g.add(cornerBox);

          const hole = new THREE.Mesh(cHoleGeo, cornerHoleMat);
          hole.position.set(cx, cy, cz);
          g.add(hole);
        }
      }
    }

    // Realistic End Double Doors on (+X) end
    const doorX = L / 2 + 0.02;
    const doorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, H - 0.2, W - 0.2),
      new THREE.MeshStandardMaterial({ color, roughness: 0.4 })
    );
    doorFrame.position.set(doorX, H / 2, 0);
    g.add(doorFrame);

    // Door Center Gasket Seam
    const gasket = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, H - 0.2, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
    );
    gasket.position.set(doorX + 0.01, H / 2, 0);
    g.add(gasket);

    // 4 Vertical Stainless Steel Locking Rods
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.85, roughness: 0.2 });
    const rodGeo = new THREE.CylinderGeometry(0.028, 0.028, H - 0.3, 12);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.5 });
    const rodZPositions = [-0.75, -0.28, 0.28, 0.75];

    for (const rz of rodZPositions) {
      const rod = new THREE.Mesh(rodGeo, rodMat);
      rod.position.set(doorX + 0.035, H / 2, rz);
      g.add(rod);

      const topKeeper = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.08), postMat);
      topKeeper.position.set(doorX + 0.035, H - 0.22, rz);
      g.add(topKeeper);

      const botKeeper = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.08), postMat);
      botKeeper.position.set(doorX + 0.035, 0.22, rz);
      g.add(botKeeper);

      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.04), handleMat);
      handle.position.set(doorX + 0.05, H * 0.45, rz);
      g.add(handle);
    }

    // Red Customs Bolt Seal
    const seal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.14, 8),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
    );
    seal.position.set(doorX + 0.06, H * 0.45, 0.28);
    g.add(seal);

    // Twistlocks if this container is stacked
    if (stackLevel > 0) {
      const twistMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8 });
      for (const tx of [-L / 2 + 0.1, L / 2 - 0.1]) {
        for (const tz of [-W / 2 + 0.1, W / 2 - 0.1]) {
          const twistlock = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 8), twistMat);
          twistlock.position.set(tx, -0.06, tz);
          g.add(twistlock);
        }
      }
    }

    this.scene.add(g);
  }

  private createForklift(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    // 1. Industrial Yellow / Orange Counterbalanced Chassis
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.25 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.4 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.65, 1.2), bodyMat);
    body.position.set(-0.1, 0.45, 0);
    body.castShadow = true;
    g.add(body);

    const counterweight = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.65, 16, 1, false, 0, Math.PI), bodyMat);
    counterweight.position.set(-1.0, 0.45, 0);
    counterweight.rotation.y = Math.PI / 2;
    g.add(counterweight);

    const grill = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.7), darkMat);
    grill.position.set(-1.02, 0.45, 0);
    g.add(grill);

    // 2. Heavy Black Rubber Industrial Wheels
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.3 });
    const tireGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 16);
    tireGeo.rotateX(Math.PI / 2);
    const rimGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.23, 12);
    rimGeo.rotateX(Math.PI / 2);

    const wheelPos = [
      [-0.7, 0.32, -0.62],
      [-0.7, 0.32, 0.62],
      [0.6, 0.32, -0.62],
      [0.6, 0.32, 0.62]
    ];
    for (const [wx, wy, wz] of wheelPos) {
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.position.set(wx, wy, wz);
      g.add(tire);

      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.position.set(wx, wy, wz);
      g.add(rim);
    }

    // 3. Overhead Driver Protection Roll Cage
    const cageMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.6, roughness: 0.35 });
    const postGeo = new THREE.BoxGeometry(0.06, 1.4, 0.06);
    for (const px of [-0.6, 0.3]) {
      for (const pz of [-0.48, 0.48]) {
        const post = new THREE.Mesh(postGeo, cageMat);
        post.position.set(px, 1.45, pz);
        g.add(post);
      }
    }
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.05, 1.08), cageMat);
    roof.position.set(-0.15, 2.15, 0);
    g.add(roof);

    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.14, 10),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.8 })
    );
    beacon.position.set(-0.15, 2.25, 0);
    g.add(beacon);

    // 4. Cockpit: Seat & Steering Wheel
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), darkMat);
    seat.position.set(-0.35, 0.95, 0);
    g.add(seat);

    const steerCol = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), darkMat);
    steerCol.position.set(0.12, 1.0, 0);
    steerCol.rotation.z = -Math.PI / 6;
    g.add(steerCol);

    const steerWheel = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 16), darkMat);
    steerWheel.position.set(0.22, 1.22, 0);
    steerWheel.rotation.y = Math.PI / 2;
    steerWheel.rotation.x = Math.PI / 6;
    g.add(steerWheel);

    // 5. Dual-Stage Lift Mast
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
    const mastIBeam = new THREE.BoxGeometry(0.08, 2.4, 0.1);
    for (const mz of [-0.38, 0.38]) {
      const mast = new THREE.Mesh(mastIBeam, mastMat);
      mast.position.set(0.85, 1.25, mz);
      g.add(mast);
    }
    const hydroRam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 2.0, 12),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 })
    );
    hydroRam.position.set(0.85, 1.1, 0);
    g.add(hydroRam);

    // 6. Fork Carriage & Forged Steel Lifting Forks
    const carriage = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.85), darkMat);
    carriage.position.set(0.92, 0.6, 0);
    g.add(carriage);

    const forkMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    for (const fz of [-0.26, 0.26]) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.04, 0.1), forkMat);
      blade.position.set(1.42, 0.45, fz);
      g.add(blade);
      const heel = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.1), forkMat);
      heel.position.set(0.96, 0.58, fz);
      g.add(heel);
    }

    // 7. Hoisted Pallet on Forks
    const pallet = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.1, 0.9),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 })
    );
    pallet.position.set(1.42, 0.52, 0);
    g.add(pallet);

    const hoistedRoll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.85, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.35 })
    );
    hoistedRoll.rotateX(Math.PI / 2);
    hoistedRoll.position.set(1.42, 0.72, 0);
    g.add(hoistedRoll);

    this.scene.add(g);
  }

  private createPortFloodlightTower(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const mastMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.24, 6.8, 8), mastMat);
    mast.position.y = 3.4;
    mast.castShadow = true;
    g.add(mast);

    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.15), mastMat);
    bar.position.y = 6.8;
    g.add(bar);

    const lampMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });

    for (let i = 0; i < 4; i++) {
      const lx = -0.6 + i * 0.4;
      const fixture = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.25), lampMat);
      fixture.position.set(lx, 6.85, 0.1);
      fixture.rotation.x = Math.PI / 6;
      g.add(fixture);

      const bulb = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.16), bulbMat);
      bulb.position.set(lx, 6.8, 0.23);
      bulb.rotation.x = Math.PI / 6;
      g.add(bulb);
    }

    this.scene.add(g);
  }

  private createPalletWithCartons(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const palMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 });
    const pallet = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.14, 1.0), palMat);
    pallet.position.y = 0.07;
    pallet.castShadow = true;
    g.add(pallet);

    const boxMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.65 });
    const boxGeo = new THREE.BoxGeometry(0.55, 0.48, 0.45);

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        for (let tier = 0; tier < 2; tier++) {
          const bx = -0.28 + col * 0.56;
          const bz = -0.22 + row * 0.46;
          const by = 0.14 + tier * 0.48 + 0.24;

          const box = new THREE.Mesh(boxGeo, boxMat);
          box.position.set(bx, by, bz);
          g.add(box);
        }
      }
    }

    const wrap = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 1.0, 0.95),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.25,
        roughness: 0.1,
        metalness: 0.1
      })
    );
    wrap.position.set(0, 0.65, 0);
    g.add(wrap);

    this.scene.add(g);
  }

  private createPalletJack(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const jackMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4, metalness: 0.3 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

    const forkL = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 0.14), jackMat);
    forkL.position.set(0.5, 0.1, -0.18);
    g.add(forkL);
    const forkR = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 0.14), jackMat);
    forkR.position.set(0.5, 0.1, 0.18);
    g.add(forkR);

    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45, 10), jackMat);
    tower.position.set(-0.1, 0.32, 0);
    g.add(tower);

    const tiller = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.85, 8), jackMat);
    tiller.position.set(-0.35, 0.65, 0);
    tiller.rotation.z = Math.PI / 4;
    g.add(tiller);

    for (const wz of [-0.14, 0.14]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 12), wheelMat);
      w.rotateX(Math.PI / 2);
      w.position.set(-0.1, 0.1, wz);
      g.add(w);
    }

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

    // Fluted ceramic cylindrical planter
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.32, 0.68, 16), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 }));
    pot.position.y = 0.34;
    g.add(pot);

    // Soil
    const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.40, 0.05, 14), new THREE.MeshStandardMaterial({ color: 0x3f2e1e, roughness: 0.9 }));
    soil.position.y = 0.68;
    g.add(soil);

    // Natural curved Monstera stems and broad leaves
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4, side: THREE.DoubleSide });
    for (let l = 0; l < 5; l++) {
      const angle = (l * Math.PI * 2) / 5;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.65, 8), leafMat);
      stem.position.set(Math.sin(angle) * 0.14, 0.9, Math.cos(angle) * 0.14);
      stem.rotation.z = Math.sin(angle) * 0.35;
      stem.rotation.x = Math.cos(angle) * 0.35;
      g.add(stem);

      const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.58), leafMat);
      leaf.position.set(Math.sin(angle) * 0.32, 1.25, Math.cos(angle) * 0.32);
      leaf.rotation.x = Math.PI / 3;
      leaf.rotation.y = angle;
      g.add(leaf);
    }

    this.scene.add(g);
  }

  private createWaterCooler(x: number, z: number): void {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.05, 0.55), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }));
    base.position.y = 0.525;
    g.add(base);

    // Faucets
    const hotF = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    hotF.position.set(-0.1, 0.72, 0.29);
    g.add(hotF);

    const coldF = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
    coldF.position.set(0.1, 0.72, 0.29);
    g.add(coldF);

    // Polycarbonate 20L Water Bottle
    const bottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.65, 16),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65, roughness: 0.1 })
    );
    bottle.position.y = 1.38;
    g.add(bottle);

    this.scene.add(g);
  }

  private createMerchandiserStation(g: THREE.Group): void {
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.3, metalness: 0.05 });
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });

    // Main desk surface
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 1.1), deskMat);
    top.position.set(0, 0.74, 0);
    top.castShadow = true;
    g.add(top);

    // L-return side table
    const sideReturn = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 1.2), deskMat);
    sideReturn.position.set(-1.1, 0.74, -0.6);
    g.add(sideReturn);

    // Matte black steel trestle legs
    for (const lx of [-1.05, 1.05]) {
      for (const lz of [-0.45, 0.45]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.06), legMat);
        leg.position.set(lx, 0.35, lz);
        g.add(leg);
      }
    }

    // Dual 27" monitors on curved monitor stand
    const monMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.7 });
    for (const [mx, rotY, isCAD] of [[-0.45, 0.12, false], [0.45, -0.12, true]] as [number, number, boolean][]) {
      const mon = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.42, 0.04), monMat);
      mon.position.set(mx, 1.14, -0.3);
      mon.rotation.y = rotY;
      g.add(mon);

      const screenCanvas = document.createElement('canvas');
      screenCanvas.width = 256; screenCanvas.height = 144;
      const sctx = screenCanvas.getContext('2d')!;
      if (isCAD) {
        sctx.fillStyle = '#0f172a'; sctx.fillRect(0, 0, 256, 144);
        sctx.strokeStyle = '#38bdf8'; sctx.lineWidth = 3;
        sctx.strokeRect(40, 20, 176, 100);
        sctx.fillStyle = '#38bdf8'; sctx.font = '700 14px monospace';
        sctx.fillText('CLO 3D: POLO SHIRT', 50, 45);
        sctx.fillText('COLOR: NAVY 19-4010', 50, 70);
      } else {
        sctx.fillStyle = '#1e1b4b'; sctx.fillRect(0, 0, 256, 144);
        sctx.fillStyle = '#4ade80'; sctx.font = '700 13px monospace';
        sctx.fillText('ERP MERCHANDISING SYSTEM', 20, 30);
        sctx.fillText('PO #PO-98214 · US BUYER', 20, 55);
        sctx.fillText('QTY: 500 PCS · STATUS: IN PROD', 20, 80);
      }
      const sTex = new THREE.CanvasTexture(screenCanvas);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.38), new THREE.MeshBasicMaterial({ map: sTex }));
      screen.position.set(mx, 1.14, -0.278);
      screen.rotation.y = rotY;
      g.add(screen);
    }

    // Keyboard & Mouse
    const kb = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.015, 0.15), monMat);
    kb.position.set(0, 0.79, 0.12);
    g.add(kb);

    // Pantone Cotton Passport Swatch Fan Book
    const pantoneG = new THREE.Group();
    pantoneG.position.set(-0.85, 0.79, 0.15);
    const swColors = [0xef4444, 0xf97316, 0xfacc15, 0x22c55e, 0x06b6d4, 0x3b82f6, 0x8b5cf6, 0xec4899];
    for (let i = 0; i < swColors.length; i++) {
      const sw = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.008, 0.05),
        new THREE.MeshStandardMaterial({ color: swColors[i], roughness: 0.4 })
      );
      sw.rotation.y = (i - 4) * 0.15;
      sw.position.set(0, i * 0.003, 0);
      pantoneG.add(sw);
    }
    g.add(pantoneG);

    // Techpack Binder
    const tpBinder = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.04, 0.24),
      new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5 })
    );
    tpBinder.position.set(0.85, 0.8, 0.1);
    g.add(tpBinder);

    // Brass engraved Merchandiser Nameplate
    const np = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.03, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 })
    );
    np.position.set(0.6, 0.79, 0.35);
    g.add(np);

    // Ergonomic Mesh Swivel Chair
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.48), chairMat);
    seat.position.set(0, 0.48, 0.7);
    g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.55, 0.06), chairMat);
    back.position.set(0, 0.82, 0.92);
    g.add(back);
  }

  private createCentralPrinter(g: THREE.Group): void {
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.4 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.15, 0.85), bodyMat);
    body.position.set(0, 0.575, 0);
    body.castShadow = true;
    g.add(body);

    for (let i = 0; i < 4; i++) {
      const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.16, 0.04), darkMat);
      drawer.position.set(0, 0.18 + i * 0.2, 0.43);
      g.add(drawer);
      const h = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.03), bodyMat);
      h.position.set(0, 0.18 + i * 0.2, 0.45);
      g.add(h);
    }

    const adf = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.18, 0.78), bodyMat);
    adf.position.set(0, 1.24, 0);
    g.add(adf);

    const screenG = new THREE.Group();
    screenG.position.set(0.42, 1.25, 0.42);
    screenG.rotation.x = -Math.PI / 6;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.03), darkMat);
    screenG.add(panel);
    const scr = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.14),
      new THREE.MeshBasicMaterial({ color: 0x22c55e })
    );
    scr.position.z = 0.016;
    screenG.add(scr);
    g.add(screenG);

    const paperCatch = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.04, 0.35),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
    );
    paperCatch.position.set(-0.35, 1.0, 0);
    paperCatch.rotation.z = -0.1;
    g.add(paperCatch);

    const boxMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 });
    for (let i = 0; i < 2; i++) {
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.26, 0.48), boxMat);
      box.position.set(0.72, 0.13 + i * 0.26, 0);
      g.add(box);
    }
  }

  private createLabStation(g: THREE.Group): void {
    const boothMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });
    const innerMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });

    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 0.8), boothMat);
    cabinet.position.set(0, 1.45, 0);
    cabinet.castShadow = true;
    g.add(cabinet);

    const cavity = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.85, 0.7), innerMat);
    cavity.position.set(0, 1.4, 0.08);
    g.add(cavity);

    const lamp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1.0, 10),
      new THREE.MeshBasicMaterial({ color: 0xf0fdf4 })
    );
    lamp.rotateZ(Math.PI / 2);
    lamp.position.set(0, 1.78, 0.1);
    g.add(lamp);

    const easel = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.03, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x334155 })
    );
    easel.position.set(0, 1.15, 0.1);
    easel.rotation.x = Math.PI / 4;
    g.add(easel);

    const dipColors = [0x1e3a8a, 0x1e40af, 0x172554];
    for (let i = 0; i < 3; i++) {
      const sw = new THREE.Mesh(
        new THREE.PlaneGeometry(0.16, 0.18),
        new THREE.MeshStandardMaterial({ color: dipColors[i], roughness: 0.4 })
      );
      sw.position.set(-0.24 + i * 0.24, 1.18, 0.08);
      sw.rotation.x = -Math.PI / 4;
      g.add(sw);
    }

    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.88, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35 })
    );
    bench.position.set(0, 0.44, 0);
    bench.castShadow = true;
    g.add(bench);

    const spec = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.32, 0.38),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 })
    );
    spec.position.set(0.95, 0.98, 0);
    g.add(spec);

    const specScr = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.12),
      new THREE.MeshBasicMaterial({ color: 0x22c55e })
    );
    specScr.position.set(0.95, 1.05, 0.192);
    g.add(specScr);

    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6, roughness: 0.1 });
    for (let i = 0; i < 2; i++) {
      const beaker = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.14, 10), glassMat);
      beaker.position.set(-0.95 + i * 0.18, 0.95, 0.2);
      g.add(beaker);
    }
  }

  private createFabricWarehouseStation(g: THREE.Group): void {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.35 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 });

    const stand = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 1.1), frameMat);
    stand.position.set(0, 0.4, 0);
    stand.castShadow = true;
    g.add(stand);

    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 0.8), frameMat);
    bed.position.set(0, 1.1, 0.1);
    bed.rotation.x = Math.PI / 4;
    g.add(bed);

    const glassPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 0.65),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    glassPanel.position.set(0, 1.15, 0.08);
    glassPanel.rotation.x = -Math.PI / 4;
    g.add(glassPanel);

    const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.1, 12), steelMat);
    spindle.rotateZ(Math.PI / 2);
    spindle.position.set(0, 0.55, 0.45);
    g.add(spindle);

    const fabricRoll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 1.9, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 })
    );
    fabricRoll.rotateZ(Math.PI / 2);
    fabricRoll.position.set(0, 0.55, 0.45);
    g.add(fabricRoll);

    const topRoller = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 12), steelMat);
    topRoller.rotateZ(Math.PI / 2);
    topRoller.position.set(0, 1.45, -0.2);
    g.add(topRoller);

    const cart = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.75, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7 })
    );
    cart.position.set(1.4, 0.38, 0);
    g.add(cart);

    const scanner = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.16, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 })
    );
    scanner.position.set(1.4, 0.84, 0);
    g.add(scanner);

    const clip = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.02, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 })
    );
    clip.position.set(1.4, 0.8, -0.15);
    g.add(clip);
  }

  private createShippingPortStation(g: THREE.Group): void {
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.35 });
    const curbMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });

    const platform = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 2.2), bridgeMat);
    platform.position.set(0, 0.06, 0);
    platform.receiveShadow = true;
    g.add(platform);

    for (const cz of [-1.12, 1.12]) {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.18, 0.08), curbMat);
      curb.position.set(0, 0.09, cz);
      g.add(curb);
    }

    const boothG = new THREE.Group();
    boothG.position.set(-1.4, 0, 1.6);

    const boothBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 2.2, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
    );
    boothBody.position.y = 1.1;
    boothBody.castShadow = true;
    boothG.add(boothBody);

    const win = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.65, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6, roughness: 0.1 })
    );
    win.position.set(0, 1.4, -0.56);
    boothG.add(win);

    const ac = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.25, 0.35),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
    );
    ac.position.set(0, 2.32, 0);
    boothG.add(ac);
    g.add(boothG);

    const pedestal = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.95, 0.32),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 })
    );
    pedestal.position.set(0, 0.48, 1.1);
    g.add(pedestal);

    const armCanvas = document.createElement('canvas');
    armCanvas.width = 256; armCanvas.height = 32;
    const actx = armCanvas.getContext('2d')!;
    for (let x = 0; x < 256; x += 32) {
      actx.fillStyle = (x / 32) % 2 === 0 ? '#dc2626' : '#ffffff';
      actx.fillRect(x, 0, 32, 32);
    }
    const armTex = new THREE.CanvasTexture(armCanvas);
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.08, 2.4),
      new THREE.MeshStandardMaterial({ map: armTex, roughness: 0.3 })
    );
    arm.position.set(0, 0.85, -0.1);
    g.add(arm);

    const signalLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0x22c55e })
    );
    signalLight.position.set(0, 1.05, 1.1);
    g.add(signalLight);

    const scorePost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 2.6, 10),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 })
    );
    scorePost.position.set(1.5, 1.3, 1.1);
    g.add(scorePost);

    const boardCanvas = document.createElement('canvas');
    boardCanvas.width = 512; boardCanvas.height = 200;
    const bctx = boardCanvas.getContext('2d')!;
    bctx.fillStyle = '#020617';
    bctx.fillRect(0, 0, 512, 200);
    bctx.strokeStyle = '#38bdf8';
    bctx.lineWidth = 6;
    bctx.strokeRect(4, 4, 504, 192);

    bctx.fillStyle = '#38bdf8';
    bctx.font = '900 24px monospace';
    bctx.textAlign = 'center';
    bctx.fillText('CẢNG CÁT LÁI · CỔNG 02', 256, 45);

    bctx.fillStyle = '#facc15';
    bctx.font = '900 48px monospace';
    bctx.fillText('32,480 KG', 256, 110);

    bctx.fillStyle = '#4ade80';
    bctx.font = '700 22px monospace';
    bctx.fillText('THÔNG QUAN ĐẠT CHUẨN [PASS]', 256, 165);

    const boardTex = new THREE.CanvasTexture(boardCanvas);
    const scoreboard = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 0.65),
      new THREE.MeshBasicMaterial({ map: boardTex })
    );
    scoreboard.position.set(1.5, 2.6, 1.1);
    scoreboard.rotation.y = Math.PI;
    g.add(scoreboard);
  }

  private setupDepartmentWorkstations(): void {
    // 1. My Desk (Văn phòng)
    const deskG = new THREE.Group();
    deskG.position.set(-10.5, 0, -13.0);
    this.createMerchandiserStation(deskG);
    this.scene.add(deskG);
    this.addObstacle('station_desk', -10.5, -13.3, 2.4, 1.0);
    this.addStation('desk', 'Bàn Làm Việc Merchandiser', 'Văn Phòng Điều Hành', '💻', deskG.position, 2.5, deskG);

    // 2. Central Printer (Văn phòng)
    const printerG = new THREE.Group();
    printerG.position.set(-4, 0, -12);
    this.createCentralPrinter(printerG);
    this.scene.add(printerG);
    this.addObstacle('station_printer', -4, -12, 1.2, 1.0);
    this.addStation('printer', 'Máy In Techpack & Hợp Đồng', 'Văn Phòng Điều Hành', '🖨️', printerG.position, 2.3, printerG);

    // 3. Cutting & Lab Station (Xưởng cắt & Lab)
    const labG = new THREE.Group();
    labG.position.set(12, 0, -9.5);
    this.createLabStation(labG);
    this.scene.add(labG);
    this.addObstacle('station_lab', 12, -9.5, 2.6, 1.2);
    this.addStation('lab', 'Phòng Lab Soi Màu D65', 'Xưởng Cắt & Lab', '🔬', labG.position, 2.5, labG);

    // 4. Warehouse Fabric Racks (Kho vải)
    const fabricG = new THREE.Group();
    fabricG.position.set(-14, 0, 12);
    this.createFabricWarehouseStation(fabricG);
    this.scene.add(fabricG);
    this.addObstacle('station_fabric', -14, 12, 2.4, 1.2);
    this.addStation('fabric', 'Kệ Vải Thun & Phụ Liệu Spandex', 'Kho Vải Đại Ngàn', '🧵', fabricG.position, 2.6, fabricG);

    // 5. Canteen Espresso Coffee Machine (Quầy Pantry)
    const coffeeG = new THREE.Group();
    coffeeG.position.set(-1.2, 0, 1.5);
    this.addStation('coffee', 'Máy Pha Cà Phê & Trà Sữa', 'Căn Tin Trung Tâm', '☕', coffeeG.position, 2.2, coffeeG);

    // 6. Logistics Shipping Port (Cảng Cont Cát Lái)
    const shipG = new THREE.Group();
    shipG.position.set(13, 0, 15);
    this.createShippingPortStation(shipG);
    this.scene.add(shipG);
    this.addObstacle('station_shipping_booth', 11.6, 16.6, 1.4, 1.3);
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

    // 15. Showroom Mẫu & Fitting Studio
    const showroomG = this.createShowroomFitting(-3.5, -17.5);
    this.addStation('showroom', 'Showroom Mẫu & Fitting', 'Phòng Trưng Bày', '👗', new THREE.Vector3(-3.5, 0, -17.5), 2.5, showroomG);

    // 16. Ban Công Hóng Gió & Lounge
    const balconyG = this.createBalconyLounge(19.0, 0.0);
    this.addStation('balcony', 'Ban Công Hóng Gió & Lounge', 'Ban Công Ngoài Trời', '🌿', new THREE.Vector3(19.0, 0, 0.0), 2.6, balconyG);
  }

  private createShowroomFitting(x: number, z: number): THREE.Group {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    // Parquet Floor Mat
    const matMesh = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.05, 3.2),
      new THREE.MeshStandardMaterial({ color: 0xd7c4b7, roughness: 0.4 })
    );
    matMesh.position.y = 0.025;
    matMesh.receiveShadow = true;
    g.add(matMesh);

    // Fashion Moodboard Billboard
    const boardStand1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.8, 0.08), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    boardStand1.position.set(-1.6, 0.9, 1.0);
    g.add(boardStand1);
    const boardStand2 = boardStand1.clone();
    boardStand2.position.set(1.6, 0.9, 1.0);
    g.add(boardStand2);

    const corkBoard = new THREE.Mesh(
      new THREE.BoxGeometry(3.3, 1.4, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 })
    );
    corkBoard.position.set(0, 1.3, 1.0);
    g.add(corkBoard);

    // Swatches on board
    const swatchColors = [0xef4444, 0x3b82f6, 0x10b981, 0xfacc15, 0xa855f7];
    swatchColors.forEach((col, idx) => {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.02), new THREE.MeshStandardMaterial({ color: col }));
      sw.position.set(-1.2 + idx * 0.6, 1.3, 1.04);
      g.add(sw);
    });

    // Mannequin 1 (Navy Polo)
    const base1 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.05, 16), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
    base1.position.set(-0.8, 0.025, -0.4);
    g.add(base1);
    const pole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.2, 8), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 }));
    pole1.position.set(-0.8, 0.6, -0.4);
    g.add(pole1);
    const torso1 = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.75, 14), new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 }));
    torso1.position.set(-0.8, 1.25, -0.4);
    torso1.castShadow = true;
    g.add(torso1);

    // Mannequin 2 (Coral Dress)
    const base2 = base1.clone();
    base2.position.set(0.8, 0.025, -0.4);
    g.add(base2);
    const pole2 = pole1.clone();
    pole2.position.set(0.8, 0.6, -0.4);
    g.add(pole2);
    const torso2 = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.8, 14), new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5 }));
    torso2.position.set(0.8, 1.25, -0.4);
    torso2.castShadow = true;
    g.add(torso2);

    // Clothes Rack
    const rackBar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 8), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85 }));
    rackBar.rotation.z = Math.PI / 2;
    rackBar.position.set(0, 1.35, -1.0);
    g.add(rackBar);
    const rackLeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.35, 8), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85 }));
    rackLeg1.position.set(-0.7, 0.675, -1.0);
    g.add(rackLeg1);
    const rackLeg2 = rackLeg1.clone();
    rackLeg2.position.set(0.7, 0.675, -1.0);
    g.add(rackLeg2);

    this.scene.add(g);
    return g;
  }

  private createBalconyLounge(x: number, z: number): THREE.Group {
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    // Composite Outdoor Deck
    const deckMesh = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 0.08, 4.0),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 })
    );
    deckMesh.position.y = 0.04;
    deckMesh.receiveShadow = true;
    g.add(deckMesh);

    // Glass Railing
    const railPost1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 0.06), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 }));
    railPost1.position.set(2.2, 0.55, -1.8);
    g.add(railPost1);
    const railPost2 = railPost1.clone();
    railPost2.position.set(2.2, 0.55, 1.8);
    g.add(railPost2);

    const glassRailing = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.95, 3.6),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4, roughness: 0.1 })
    );
    glassRailing.position.set(2.2, 0.55, 0);
    g.add(glassRailing);

    const handRail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 3.8), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95 }));
    handRail.position.set(2.2, 1.05, 0);
    g.add(handRail);

    // 2 Potted Ficus Plants
    const potGeo = new THREE.CylinderGeometry(0.28, 0.22, 0.55, 14);
    const potMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const pot1 = new THREE.Mesh(potGeo, potMat);
    pot1.position.set(-1.6, 0.275, -1.4);
    g.add(pot1);
    const bush1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.48), new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 }));
    bush1.position.set(-1.6, 0.85, -1.4);
    g.add(bush1);

    const pot2 = pot1.clone();
    pot2.position.set(-1.6, 0.275, 1.4);
    g.add(pot2);
    const bush2 = bush1.clone();
    bush2.position.set(-1.6, 0.85, 1.4);
    g.add(bush2);

    // Coffee Table & Armchairs
    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.05, 20), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 }));
    tableTop.position.set(0.2, 0.5, 0);
    g.add(tableTop);
    const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 12), new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 }));
    tableLeg.position.set(0.2, 0.25, 0);
    g.add(tableLeg);

    const chairMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
    const chair1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.55), chairMat);
    chair1.position.set(0.2, 0.35, -1.0);
    g.add(chair1);
    const chair2 = chair1.clone();
    chair2.position.set(0.2, 0.35, 1.0);
    g.add(chair2);

    this.scene.add(g);
    return g;
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
    canvas.width = 720;
    canvas.height = 160;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = type === 'altar' ? 'rgba(127, 29, 29, 0.95)' : 'rgba(15, 23, 42, 0.95)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 700, 140, 32);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = type === 'altar' ? '#ef4444' : '#facc15';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 46px Nunito, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${emoji} ${name}`, 360, 80);

    const tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: tex, depthTest: true });
    const billboardSprite = new THREE.Sprite(spriteMat);
    billboardSprite.scale.set(2.3, 0.52, 1);
    billboardSprite.position.set(pos.x, 2.5, pos.z);
    this.scene.add(billboardSprite);

    const hitGeo = new THREE.CylinderGeometry(radius * 0.95, radius * 0.95, 3.2, 12);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.set(pos.x, 1.6, pos.z);
    this.scene.add(hitMesh);
    this.interactiveHitObjects.push(hitMesh);

    const st: Workstation = {
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
    };
    hitMesh.userData = { station: st };
    this.stations.push(st);
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
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.45, 14), new THREE.MeshStandardMaterial({ color: p.type === 'boba' ? 0xf472b6 : 0xfbbf24 }));
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

    // 4. Em Linh Thực Tập QC Lab
    this.internNpc = new ChibiCharacter('#fed7aa', '#06b6d4', true, 'EM LINH (THỰC TẬP LAB)');
    this.internNpc.group.position.set(14, 0, -9.5);
    this.scene.add(this.internNpc.group);

    // 5. Anh Hoàng Kỹ Sư IT
    this.itNpc = new ChibiCharacter('#ffedd5', '#4f46e5', true, 'ANH HOÀNG (IT SUPPORT)');
    this.itNpc.group.position.set(-19.5, 0, 10);
    this.scene.add(this.itNpc.group);
  }

  public toggleCameraMode(): 'follow' | 'overview' {
    if (this.cameraMode === 'follow') {
      this.cameraMode = 'overview';
      this.targetDistance = 35.0;
      this.targetPitch = 0.95;
      this.targetAzimuth = 0.76;
    } else {
      this.cameraMode = 'follow';
      this.targetDistance = 17.5;
      this.targetPitch = 0.66;
      this.targetAzimuth = 0.76;
      this.camPanOffset.set(0, 0);
    }
    return this.cameraMode;
  }

  public toggleDragMode(): 'orbit' | 'pan' {
    this.dragMode = this.dragMode === 'orbit' ? 'pan' : 'orbit';
    return this.dragMode;
  }

  public recenterCamera(): void {
    this.targetAzimuth = 0.76;
    this.targetPitch = this.cameraMode === 'overview' ? 0.95 : 0.66;
    this.targetDistance = this.cameraMode === 'overview' ? 35.0 : 17.5;
    this.camPanOffset.set(0, 0);
    this.velocityAzimuth = 0;
    this.velocityPitch = 0;
  }

  public zoomIn(amount = 6.0): void {
    this.targetDistance = Math.max(6.5, this.targetDistance - amount);
  }

  public zoomOut(amount = 6.0): void {
    this.targetDistance = Math.min(42.0, this.targetDistance + amount);
  }

  public getActiveSpeechScreenData(): { speaker: string; role: string; emoji: string; text: string; avatarBg: string; x: number; y: number } | null {
    if (!this.activeSpeech || !this.camera || !this.container) return null;

    const width = this.cachedWidth;
    const height = this.cachedHeight;
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
    this.cachedWidth = width;
    this.cachedHeight = height;

    const aspect = width / height;
    this.camera.aspect = aspect;
    this.camera.fov = aspect < 0.8 ? 52 : (aspect < 1.1 ? 46 : 42);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  // Native Mobile Multi-Touch Gestures (100% Reliable on iOS Safari & Android WebKit)
  private onTouchStart = (e: TouchEvent): void => {
    const target = e.target as HTMLElement;
    if (target.closest('#joyPadArea, #joyActionBtn, .shiftTopRibbon, .shiftQuestBanner, .shiftMiniRadar, .shiftRightRail, #hudActionCard, #hudGestureTip, .dialog, .dialogShade')) {
      return;
    }

    this.isTouchGestureActive = true;
    if (e.touches.length === 1) {
      const t = e.touches[0];
      this.touch1Start = { x: t.clientX, y: t.clientY, time: performance.now() };
      this.touch1Last = { x: t.clientX, y: t.clientY };
      this.touch1Moved = false;
      this.velocityAzimuth = 0;
      this.velocityPitch = 0;
    } else if (e.touches.length >= 2) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      this.touchPinchDist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      this.touchStartCamDist = this.targetDistance;
      this.touchMidPoint = { x: (t0.clientX + t1.clientX) / 2, y: (t0.clientY + t1.clientY) / 2 };
      this.touch1Moved = true;
    }
  };

  private onTouchMove = (e: TouchEvent): void => {
    const target = e.target as HTMLElement;
    if (target.closest('#joyPadArea, #joyActionBtn, .shiftTopRibbon, .shiftQuestBanner, .shiftMiniRadar, .shiftRightRail, #hudActionCard, #hudGestureTip, .dialog, .dialogShade')) {
      return;
    }

    if (e.touches.length >= 2 && this.touchPinchDist > 0) {
      e.preventDefault();
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const curDist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);

      // Pinch to Zoom
      const ratio = curDist / this.touchPinchDist;
      this.targetDistance = Math.max(6.5, Math.min(42.0, this.touchStartCamDist / ratio));

      // 2-Finger Pan on Floor
      const midX = (t0.clientX + t1.clientX) / 2;
      const midY = (t0.clientY + t1.clientY) / 2;
      const dMidX = midX - this.touchMidPoint.x;
      const dMidY = midY - this.touchMidPoint.y;
      this.touchMidPoint = { x: midX, y: midY };

      const panSpeed = (this.camDistance / 18.0) * 0.045;
      const cosA = Math.cos(this.camAzimuth);
      const sinA = Math.sin(this.camAzimuth);
      this.camPanOffset.x -= (dMidX * cosA + dMidY * sinA) * panSpeed;
      this.camPanOffset.y += (dMidX * sinA - dMidY * cosA) * panSpeed;
      this.camPanOffset.x = Math.max(-28, Math.min(28, this.camPanOffset.x));
      this.camPanOffset.y = Math.max(-22, Math.min(22, this.camPanOffset.y));
    } else if (e.touches.length === 1) {
      const t = e.touches[0];
      const dx = t.clientX - this.touch1Last.x;
      const dy = t.clientY - this.touch1Last.y;
      const totalDist = Math.hypot(t.clientX - this.touch1Start.x, t.clientY - this.touch1Start.y);

      if (totalDist > 7) {
        this.touch1Moved = true;
      }

      this.touch1Last = { x: t.clientX, y: t.clientY };

      if (this.touch1Moved) {
        e.preventDefault();
        if (this.dragMode === 'orbit') {
          this.targetAzimuth -= dx * 0.009;
          this.targetPitch = Math.max(0.18, Math.min(1.42, this.targetPitch + dy * 0.006));
          this.velocityAzimuth = -dx * 0.007;
          this.velocityPitch = dy * 0.005;
        } else {
          const panSpeed = (this.camDistance / 18.0) * 0.045;
          const cosA = Math.cos(this.camAzimuth);
          const sinA = Math.sin(this.camAzimuth);
          this.camPanOffset.x -= (dx * cosA + dy * sinA) * panSpeed;
          this.camPanOffset.y += (dx * sinA - dy * cosA) * panSpeed;
          this.camPanOffset.x = Math.max(-28, Math.min(28, this.camPanOffset.x));
          this.camPanOffset.y = Math.max(-22, Math.min(22, this.camPanOffset.y));
        }
      }
    }
  };

  private onTouchEnd = (e: TouchEvent): void => {
    if (e.touches.length === 0) {
      this.isTouchGestureActive = false;
      const dt = performance.now() - this.touch1Start.time;
      const dist = Math.hypot(this.touch1Last.x - this.touch1Start.x, this.touch1Last.y - this.touch1Start.y);

      if (!this.touch1Moved && dist < 12 && dt < 450) {
        this.handlePointerTap(this.touch1Start.x, this.touch1Start.y);
      }
      this.touchPinchDist = 0;
    } else if (e.touches.length === 1) {
      this.touch1Moved = true;
      this.touchPinchDist = 0;
      const t = e.touches[0];
      this.touch1Last = { x: t.clientX, y: t.clientY };
    }
  };

  private onTouchCancel = (): void => {
    this.touchPinchDist = 0;
    this.touch1Moved = true;
    this.isTouchGestureActive = false;
  };

  // Pointer Handlers (Works seamlessly for Mouse, Trackpad, Pen, and Hybrid screens)
  private onPointerDownHandler = (e: PointerEvent): void => {
    if (this.isTouchGestureActive) return;
    if ((e.target as HTMLElement).closest('#joyPadArea, #joyActionBtn, .shiftTopRibbon, .shiftQuestBanner, .shiftMiniRadar, .shiftRightRail, #hudActionCard, #hudGestureTip, .dialog, .dialogShade')) {
      return;
    }

    this.activePointers.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      startTime: performance.now(),
      lastX: e.clientX,
      lastY: e.clientY,
      moved: false
    });

    this.velocityAzimuth = 0;
    this.velocityPitch = 0;
  };

  private onPointerMoveHandler = (e: PointerEvent): void => {
    if (this.isTouchGestureActive) return;
    if (!this.activePointers.has(e.pointerId)) return;
    const ptr = this.activePointers.get(e.pointerId)!;

    const dx = e.clientX - ptr.lastX;
    const dy = e.clientY - ptr.lastY;
    const totalDist = Math.hypot(e.clientX - ptr.startX, e.clientY - ptr.startY);
    if (totalDist > 6) {
      ptr.moved = true;
    }

    ptr.lastX = e.clientX;
    ptr.lastY = e.clientY;
    ptr.x = e.clientX;
    ptr.y = e.clientY;

    if (ptr.moved) {
      if (this.dragMode === 'orbit') {
        this.targetAzimuth -= dx * 0.009;
        this.targetPitch = Math.max(0.18, Math.min(1.42, this.targetPitch + dy * 0.006));
        this.velocityAzimuth = -dx * 0.007;
        this.velocityPitch = dy * 0.005;
      } else {
        const panSpeed = (this.camDistance / 18.0) * 0.045;
        const cosA = Math.cos(this.camAzimuth);
        const sinA = Math.sin(this.camAzimuth);
        this.camPanOffset.x -= (dx * cosA + dy * sinA) * panSpeed;
        this.camPanOffset.y += (dx * sinA - dy * cosA) * panSpeed;
        this.camPanOffset.x = Math.max(-28, Math.min(28, this.camPanOffset.x));
        this.camPanOffset.y = Math.max(-22, Math.min(22, this.camPanOffset.y));
      }
    }
  };

  private onPointerUpHandler = (e: PointerEvent): void => {
    if (this.isTouchGestureActive) return;
    if (!this.activePointers.has(e.pointerId)) return;
    const ptr = this.activePointers.get(e.pointerId)!;
    const dt = performance.now() - ptr.startTime;
    const totalDist = Math.hypot(e.clientX - ptr.startX, e.clientY - ptr.startY);

    if (!ptr.moved && totalDist < 8 && dt < 400) {
      this.handlePointerTap(e.clientX, e.clientY);
    }

    this.activePointers.delete(e.pointerId);
  };

  private onPointerCancelHandler = (e: PointerEvent): void => {
    this.activePointers.delete(e.pointerId);
  };

  // Mouse Wheel & Laptop Trackpad Pinch-to-Zoom
  private onWheelHandler = (e: WheelEvent): void => {
    e.preventDefault();
    let delta = 0;
    if (e.ctrlKey) {
      // Trackpad pinch-to-zoom (deltaY typically small 1-5)
      delta = e.deltaY * 0.18;
    } else if (Math.abs(e.deltaY) < 40) {
      // Smooth 2-finger trackpad scroll
      delta = e.deltaY * 0.08;
    } else {
      // Discrete mouse scroll wheel step
      delta = Math.sign(e.deltaY) * 2.5;
    }
    this.targetDistance = Math.max(6.5, Math.min(42.0, this.targetDistance + delta));
  };

  private setupPointerRaycaster(): void {
    const el = this.renderer?.domElement || this.container;
    this.container.style.touchAction = 'none';
    if (this.renderer?.domElement) {
      this.renderer.domElement.style.touchAction = 'none';
    }

    // Native mobile touch events
    el.addEventListener('touchstart', this.onTouchStart, { passive: false });
    el.addEventListener('touchmove', this.onTouchMove, { passive: false });
    el.addEventListener('touchend', this.onTouchEnd, { passive: false });
    el.addEventListener('touchcancel', this.onTouchCancel, { passive: false });

    // Desktop pointer events
    this.container.addEventListener('pointerdown', this.onPointerDownHandler);
    window.addEventListener('pointermove', this.onPointerMoveHandler);
    window.addEventListener('pointerup', this.onPointerUpHandler);
    window.addEventListener('pointercancel', this.onPointerCancelHandler);

    // Mouse wheel & trackpad zoom
    this.container.addEventListener('wheel', this.onWheelHandler, { passive: false });
  }

  private handlePointerTap(clientX: number, clientY: number): void {
    if (!this.camera || !this.renderer) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // 0. Player Tap check (Open Profile & Customization)
    if (this.onPlayerClickCallback && this.player?.group?.position) {
      if (raycaster.ray.distanceToPoint(this.player.group.position) < 1.6) {
        this.onPlayerClickCallback();
        return;
      }
    }

    // 0. Colleague NPC Tap check (Sếp Hùng, Chị Nga, Anh Tuấn, Em Linh, Anh Hoàng)
    if (this.onColleagueClickCallback) {
      const colleagues = [
        { id: 'boss', pos: this.bossNpc?.group.position },
        { id: 'nga', pos: this.accountantNpc?.group.position },
        { id: 'tuan', pos: this.truckerNpc?.group.position },
        { id: 'linh', pos: this.internNpc?.group.position },
        { id: 'hoang', pos: this.itNpc?.group.position }
      ];
      for (const col of colleagues) {
        if (col.pos && raycaster.ray.distanceToPoint(col.pos) < 2.0) {
          this.onColleagueClickCallback(col.id);
          return;
        }
      }
    }

    // 1. Direct interactive workstations tap check
    const hits = raycaster.intersectObjects(this.interactiveHitObjects, false);
    if (hits.length > 0) {
      const st = hits[0].object.userData.station as Workstation;
      if (st && this.onStationClickCallback) {
        this.onStationClickCallback(st, { x: clientX - rect.left, y: clientY - rect.top });
        return;
      }
    }

    // 2. Direct Tap-To-Walk anywhere on the floor!
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const groundHit = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(groundPlane, groundHit)) {
      const clampedX = Math.max(-28, Math.min(28, groundHit.x));
      const clampedZ = Math.max(-22, Math.min(22, groundHit.z));
      const targetPos = new THREE.Vector3(clampedX, 0, clampedZ);

      // Check if tap was near any workstation
      const nearbyStation = this.stations.find(s => targetPos.distanceTo(s.position) <= s.radius * 1.15);
      if (nearbyStation && this.onStationClickCallback) {
        this.onStationClickCallback(nearbyStation, { x: clientX - rect.left, y: clientY - rect.top });
      } else {
        this.startWalkToPoint(targetPos);
        if (this.onFloorTapCallback) {
          this.onFloorTapCallback(targetPos);
        }
      }
    }
  }

  private setupAutoWalkMarker(): void {
    const geo = new THREE.RingGeometry(0.7, 0.95, 28);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    this.autoWalkMarkerMesh = new THREE.Mesh(geo, mat);
    this.autoWalkMarkerMesh.rotation.x = -Math.PI / 2;
    this.autoWalkMarkerMesh.position.y = 0.04;
    this.autoWalkMarkerMesh.visible = false;
    this.scene.add(this.autoWalkMarkerMesh);
  }

  public updateTargetGuidance(stationType: string): void {
    const st = this.stations.find(s => s.type === stationType);
    if (!st) return;
    this.currentTargetStationPos = st.position.clone();
    if (this.targetBeaconGroup) {
      this.targetBeaconGroup.position.set(st.position.x, 0, st.position.z);
      this.targetBeaconGroup.visible = true;
    }
  }

  private setupVisualGuidanceSystem(): void {
    // 1. Target Beacon Group (Placed at target workstation)
    this.targetBeaconGroup = new THREE.Group();

    // Vertical translucent light cylinder
    const beamGeo = new THREE.CylinderGeometry(0.85, 1.35, 7.0, 20, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.beaconBeamMesh = new THREE.Mesh(beamGeo, beamMat);
    this.beaconBeamMesh.position.y = 3.5;
    this.targetBeaconGroup.add(this.beaconBeamMesh);

    // Inner rotating ring
    const ring1Geo = new THREE.RingGeometry(0.85, 1.15, 32);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    this.beaconRing1 = new THREE.Mesh(ring1Geo, ring1Mat);
    this.beaconRing1.rotation.x = -Math.PI / 2;
    this.beaconRing1.position.y = 0.05;
    this.targetBeaconGroup.add(this.beaconRing1);

    // Outer rotating ring
    const ring2Geo = new THREE.RingGeometry(1.25, 1.5, 32);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    this.beaconRing2 = new THREE.Mesh(ring2Geo, ring2Mat);
    this.beaconRing2.rotation.x = -Math.PI / 2;
    this.beaconRing2.position.y = 0.05;
    this.targetBeaconGroup.add(this.beaconRing2);

    // Floating 3D Target Billboard Sprite
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 160;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#4f46e5';
    ctx.beginPath();
    ctx.roundRect(10, 10, 620, 140, 40);
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#facc15';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px Nunito, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎯 MỤC TIÊU TIẾP THEO', 320, 80);

    const tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
    const beaconSprite = new THREE.Sprite(spriteMat);
    beaconSprite.scale.set(3.4, 0.85, 1);
    beaconSprite.position.set(0, 3.8, 0);
    this.targetBeaconGroup.add(beaconSprite);

    this.targetBeaconGroup.position.set(-10.5, 0, -13.0);
    this.scene.add(this.targetBeaconGroup);

    // 2. 3D Floor Guidance Compass Arrow (Hovering near Chibi pointing towards target)
    this.guideCompassArrow = new THREE.Group();

    // Outer cyan chevron arrow shape
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.75);
    shape.lineTo(0.42, -0.25);
    shape.lineTo(0.16, -0.14);
    shape.lineTo(0.16, -0.45);
    shape.lineTo(-0.16, -0.45);
    shape.lineTo(-0.16, -0.14);
    shape.lineTo(-0.42, -0.25);
    shape.closePath();

    const arrowGeo = new THREE.ShapeGeometry(shape);
    arrowGeo.rotateX(Math.PI / 2); // Rotate so tip (+Y in 2D) points to +Z on ground plane

    const arrowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthTest: false
    });
    const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
    this.guideCompassArrow.add(arrowMesh);

    // Inner bright gold accent chevron
    const innerShape = new THREE.Shape();
    innerShape.moveTo(0, 0.60);
    innerShape.lineTo(0.26, -0.16);
    innerShape.lineTo(0.09, -0.09);
    innerShape.lineTo(0.09, -0.32);
    innerShape.lineTo(-0.09, -0.32);
    innerShape.lineTo(-0.09, -0.09);
    innerShape.lineTo(-0.26, -0.16);
    innerShape.closePath();

    const innerGeo = new THREE.ShapeGeometry(innerShape);
    innerGeo.rotateX(Math.PI / 2);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthTest: false
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    innerMesh.position.y = 0.005;
    this.guideCompassArrow.add(innerMesh);

    this.scene.add(this.guideCompassArrow);
  }

  public startWalkToPoint(pos: THREE.Vector3, onReach?: () => void): void {
    this.autoWalkTarget = {
      pos: pos.clone(),
      station: null,
      onReach,
      stopDist: 0.35
    };
    if (this.autoWalkMarkerMesh) {
      this.autoWalkMarkerMesh.position.set(pos.x, 0.04, pos.z);
      this.autoWalkMarkerMesh.scale.set(0.65, 0.65, 0.65);
      this.autoWalkMarkerMesh.visible = true;
    }
  }

  public startAutoWalkTo(station: Workstation, onReach?: () => void): void {
    this.autoWalkTarget = {
      pos: station.position.clone(),
      station,
      onReach,
      stopDist: Math.max(1.2, station.radius * 0.75)
    };
    if (this.autoWalkMarkerMesh) {
      this.autoWalkMarkerMesh.position.set(station.position.x, 0.04, station.position.z);
      this.autoWalkMarkerMesh.scale.set(1.0, 1.0, 1.0);
      this.autoWalkMarkerMesh.visible = true;
    }
  }

  public cancelAutoWalk(): void {
    this.autoWalkTarget = null;
    if (this.autoWalkMarkerMesh) {
      this.autoWalkMarkerMesh.visible = false;
    }
  }

  private movePlayerWithCollision(delta: number, dirX: number, dirZ: number): void {
    const currentSpeed = this.player.carriedItem === 'none' ? this.player.moveSpeed : this.player.moveSpeed * 0.9;
    const moveDist = currentSpeed * delta;
    const stepX = dirX * moveDist;
    const stepZ = dirZ * moveDist;

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
  }

  update(delta: number, playerDirX: number, playerDirZ: number): void {
    // 1. Solid Sliding Collision Movement (Manual Joystick or Auto-Walk)
    const hasManualInput = Math.abs(playerDirX) > 0.01 || Math.abs(playerDirZ) > 0.01;
    if (hasManualInput) {
      this.cancelAutoWalk();
    }

    if (this.autoWalkTarget && !hasManualInput) {
      const curPos = this.player.getPosition();
      const dx = this.autoWalkTarget.pos.x - curPos.x;
      const dz = this.autoWalkTarget.pos.z - curPos.z;
      const dist = Math.hypot(dx, dz);
      const stopDist = this.autoWalkTarget.stopDist ?? (this.autoWalkTarget.station ? Math.max(1.2, this.autoWalkTarget.station.radius * 0.75) : 0.4);

      if (dist <= stopDist) {
        const target = this.autoWalkTarget;
        this.cancelAutoWalk();
        this.player.updateAnimation(delta, 0, 0, false);
        target.onReach?.();
      } else {
        const dirX = dx / dist;
        const dirZ = dz / dist;
        this.movePlayerWithCollision(delta, dirX, dirZ);
        this.player.updateAnimation(delta, dirX, dirZ, true);
        if (this.autoWalkMarkerMesh) {
          this.autoWalkMarkerMesh.rotation.z += delta * 2.5;
        }
      }
    } else if (hasManualInput) {
      this.movePlayerWithCollision(delta, playerDirX, playerDirZ);
      this.player.updateAnimation(delta, playerDirX, playerDirZ, true);
    } else {
      this.player.updateAnimation(delta, 0, 0, false);
    }

    // 2. Camera Dynamic Orbit, Pan, Zoom & Follow
    // Inertia damping
    if (Math.abs(this.velocityAzimuth) > 0.0001) {
      this.targetAzimuth += this.velocityAzimuth * delta * 40;
      this.velocityAzimuth *= 0.91;
    }
    if (Math.abs(this.velocityPitch) > 0.0001) {
      this.targetPitch = Math.max(0.18, Math.min(1.42, this.targetPitch + this.velocityPitch * delta * 40));
      this.velocityPitch *= 0.91;
    }

    // Smooth Lerp Spherical Angles and Distance with Frame-Rate Independent Exponential Smoothing
    const angleSmooth = 1 - Math.exp(-16 * delta);
    this.camAzimuth += (this.targetAzimuth - this.camAzimuth) * angleSmooth;
    this.camPitch += (this.targetPitch - this.camPitch) * angleSmooth;
    this.camDistance += (this.targetDistance - this.camDistance) * angleSmooth;

    // Target Focus Point
    let desiredTargetX = 0;
    let desiredTargetY = 0.9;
    let desiredTargetZ = 0;

    if (this.cameraMode === 'overview') {
      desiredTargetX = this.camPanOffset.x;
      desiredTargetY = 0.5;
      desiredTargetZ = this.camPanOffset.y;
    } else {
      const pPos = this.player.getPosition();
      // If moving with joystick, gently ease pan offset back so player stays in focus
      if (hasManualInput) {
        this.camPanOffset.x *= Math.max(0, 1 - 2.0 * delta);
        this.camPanOffset.y *= Math.max(0, 1 - 2.0 * delta);
      }
      desiredTargetX = pPos.x + this.camPanOffset.x;
      desiredTargetY = 0.9;
      desiredTargetZ = pPos.z + this.camPanOffset.y;
    }

    // High-precision smooth camera tracking without spring oscillation or rubber-banding
    const camSmooth = 1 - Math.exp(-22 * delta);
    this.currentLookAt.x += (desiredTargetX - this.currentLookAt.x) * camSmooth;
    this.currentLookAt.y += (desiredTargetY - this.currentLookAt.y) * camSmooth;
    this.currentLookAt.z += (desiredTargetZ - this.currentLookAt.z) * camSmooth;

    // Calculate Eye Position from Spherical Coordinates
    const rHoriz = this.camDistance * Math.cos(this.camPitch);
    const eyeX = this.currentLookAt.x + rHoriz * Math.sin(this.camAzimuth);
    const eyeY = this.currentLookAt.y + this.camDistance * Math.sin(this.camPitch);
    const eyeZ = this.currentLookAt.z + rHoriz * Math.cos(this.camAzimuth);

    this.camera.position.x = eyeX;
    this.camera.position.y = eyeY;
    this.camera.position.z = eyeZ;

    this.camera.lookAt(this.currentLookAt);

    // 3. Update Zone by Player Coordinates
    const pPos = this.player.getPosition();
    if (pPos.x < 0 && pPos.z < 0) this.currentZoneName = '🏢 Văn Phòng Điều Hành';
    else if (pPos.x >= 0 && pPos.z < 0) this.currentZoneName = '✂️ Xưởng Cắt & Phòng Lab';
    else if (pPos.x < 0 && pPos.z >= 0) this.currentZoneName = '🧵 Kho Vải Đại Ngàn';
    else this.currentZoneName = '🚢 Cảng Cont Cát Lái';

    // 4. Update Boss AI Patrol
    this.updateBossAI(delta);

    // 5. Workstations Proximity (Optimized Single Pulse - Zero Frame Drops)
    let closestStation: Workstation | null = null;
    let minDist = Infinity;

    for (let i = 0; i < this.stations.length; i++) {
      const st = this.stations[i];
      const dist = pPos.distanceTo(st.position);
      if (dist < st.radius && dist < minDist) {
        minDist = dist;
        closestStation = st;
      }
    }

    if (closestStation !== this.activeStation) {
      if (this.activeStation) {
        this.activeStation.indicatorMesh.scale.set(1, 1, 1);
        (this.activeStation.indicatorMesh.material as THREE.MeshBasicMaterial).opacity = 0.35;
      }
      this.activeStation = closestStation;
    }

    if (closestStation) {
      const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.12;
      closestStation.indicatorMesh.scale.set(pulse, pulse, 1);
      (closestStation.indicatorMesh.material as THREE.MeshBasicMaterial).opacity = 0.85;
    }

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

    // 8. Visual Guidance: Pulsing Beacon Rings & Directional Compass Arrow
    if (this.targetBeaconGroup && this.targetBeaconGroup.visible) {
      this.beaconRing1.rotation.z += delta * 1.8;
      this.beaconRing2.rotation.z -= delta * 1.3;
      const pulse = 1.0 + Math.sin(Date.now() * 0.007) * 0.12;
      this.beaconRing1.scale.set(pulse, pulse, 1);
      this.beaconBeamMesh.rotation.y += delta * 0.5;
    }

    if (this.currentTargetStationPos && this.guideCompassArrow) {
      const pPos = this.player.getPosition();
      const tPos = this.currentTargetStationPos;
      const dx = tPos.x - pPos.x;
      const dz = tPos.z - pPos.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 1.6) {
        this.guideCompassArrow.visible = false;
      } else {
        this.guideCompassArrow.visible = true;
        const nx = dx / dist;
        const nz = dz / dist;
        const pulse = Math.sin(Date.now() * 0.008) * 0.15;
        const offsetDist = 1.35 + pulse;

        this.guideCompassArrow.position.set(
          pPos.x + nx * offsetDist,
          0.08,
          pPos.z + nz * offsetDist
        );
        this.guideCompassArrow.lookAt(tPos.x, 0.08, tPos.z);
      }
    }

    // 9. Dynamic Colleague Speech Bubble System
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
        } else if (item.speaker === 'Em Linh' && this.internNpc) {
          worldPos = this.internNpc.group.position.clone().add(new THREE.Vector3(0, 1.8, 0));
        } else if (item.speaker === 'Anh Hoàng' && this.itNpc) {
          worldPos = this.itNpc.group.position.clone().add(new THREE.Vector3(0, 1.8, 0));
        } else {
          worldPos = new THREE.Vector3(-14, 2.2, -20);
        }
        this.activeSpeech = { ...item, worldPos };
        this.speechTimer = 5.5;
      }
    }

    // 10. Idle Animation for Stationary Colleagues
    if (this.accountantNpc) this.accountantNpc.updateAnimation(delta, 0, 0, false);
    if (this.truckerNpc) this.truckerNpc.updateAnimation(delta, 0, 0, false);
    if (this.internNpc) this.internNpc.updateAnimation(delta, 0, 0, false);
    if (this.itNpc) this.itNpc.updateAnimation(delta, 0, 0, false);
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

    const el = this.renderer?.domElement || this.container;
    el.removeEventListener('touchstart', this.onTouchStart);
    el.removeEventListener('touchmove', this.onTouchMove);
    el.removeEventListener('touchend', this.onTouchEnd);
    el.removeEventListener('touchcancel', this.onTouchCancel);

    this.container.removeEventListener('pointerdown', this.onPointerDownHandler);
    window.removeEventListener('pointermove', this.onPointerMoveHandler);
    window.removeEventListener('pointerup', this.onPointerUpHandler);
    window.removeEventListener('pointercancel', this.onPointerCancelHandler);
    this.container.removeEventListener('wheel', this.onWheelHandler);
    this.renderer?.dispose();
    this.container.innerHTML = '';
  }
}
