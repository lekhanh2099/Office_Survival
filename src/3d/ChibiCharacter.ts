import * as THREE from 'three';

export type CarriedItemType = 'none' | 'paper_stack' | 'fabric_roll' | 'coffee_cup' | 'box';

export class ChibiCharacter {
  public group: THREE.Group;
  private headMesh!: THREE.Mesh;
  private bodyMesh!: THREE.Mesh;
  private leftFoot!: THREE.Mesh;
  private rightFoot!: THREE.Mesh;
  private leftHand!: THREE.Mesh;
  private rightHand!: THREE.Mesh;
  private itemHolder!: THREE.Group;
  private nametagMesh!: THREE.Sprite;
  private groundRingMesh!: THREE.Mesh;

  // Animation cycle
  private walkCycle = 0;
  private idleTime = 0;
  public isMoving = false;
  public moveSpeed = 5.4; // units per second
  public carriedItem: CarriedItemType = 'none';

  // Customization
  public skinColor: string;
  public shirtColor: string;
  public isPlayer: boolean;

  constructor(skinColor = '#fed7aa', shirtColor = '#4f46e5', isNpc = false, name = 'BẠN (MERCHANDISER)') {
    this.skinColor = skinColor;
    this.shirtColor = shirtColor;
    this.isPlayer = !isNpc;
    this.group = new THREE.Group();
    this.initMeshes(isNpc, name);
  }

  private initMeshes(isNpc: boolean, name: string): void {
    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.skinColor),
      roughness: 0.35,
      metalness: 0.05
    });

    const shirtMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.shirtColor),
      roughness: 0.5,
      metalness: 0.05
    });

    const shoeMat = new THREE.MeshStandardMaterial({
      color: isNpc ? 0x1f2937 : 0xffffff,
      roughness: 0.4
    });

    // 1. Torso / Shirt
    const bodyGeo = new THREE.CylinderGeometry(0.26, 0.30, 0.46, 16);
    this.bodyMesh = new THREE.Mesh(bodyGeo, shirtMat);
    this.bodyMesh.position.y = 0.48;
    this.bodyMesh.castShadow = true;
    this.group.add(this.bodyMesh);

    // Collar & Lanyard ID Card
    const collarGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.08, 16);
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.y = 0.70;
    this.group.add(collar);

    const idCardGeo = new THREE.BoxGeometry(0.12, 0.18, 0.03);
    const idCardMat = new THREE.MeshStandardMaterial({ color: isNpc ? 0xef4444 : 0x38bdf8 });
    const idCard = new THREE.Mesh(idCardGeo, idCardMat);
    idCard.position.set(0, 0.46, 0.28);
    this.group.add(idCard);

    // 2. Head (Anime Chibi Proportions)
    const headGeo = new THREE.SphereGeometry(0.38, 24, 24);
    headGeo.scale(1, 0.94, 0.96);
    this.headMesh = new THREE.Mesh(headGeo, skinMat);
    this.headMesh.position.y = 0.98;
    this.headMesh.castShadow = true;
    this.group.add(this.headMesh);

    // Anime Hair
    const hairGeo = new THREE.SphereGeometry(0.41, 20, 20);
    hairGeo.scale(1.02, 0.85, 1.05);
    const hairMat = new THREE.MeshStandardMaterial({
      color: isNpc ? 0x475569 : 0x1e1b4b,
      roughness: 0.6
    });
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.set(0, 0.16, -0.05);
    this.headMesh.add(hairMesh);

    // Front Bangs
    const bangGeo = new THREE.BoxGeometry(0.18, 0.14, 0.08);
    const bang1 = new THREE.Mesh(bangGeo, hairMat);
    bang1.position.set(-0.16, 0.28, 0.32);
    bang1.rotation.z = -0.2;
    this.headMesh.add(bang1);

    const bang2 = new THREE.Mesh(bangGeo, hairMat);
    bang2.position.set(0.16, 0.28, 0.32);
    bang2.rotation.z = 0.2;
    this.headMesh.add(bang2);

    // Big Anime Eyes
    const eyeGeo = new THREE.SphereGeometry(0.052, 14, 14);
    eyeGeo.scale(0.8, 1.25, 0.5);
    const eyeMat = new THREE.MeshBasicMaterial({ color: isNpc ? 0x0f172a : 0x1e1b4b });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.14, -0.02, 0.34);
    this.headMesh.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.14, -0.02, 0.34);
    this.headMesh.add(rightEye);

    // Eye Sparkle Reflections
    const sparkleGeo = new THREE.SphereGeometry(0.018, 8, 8);
    const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const leftSparkle = new THREE.Mesh(sparkleGeo, sparkleMat);
    leftSparkle.position.set(-0.125, 0.01, 0.37);
    this.headMesh.add(leftSparkle);

    const rightSparkle = new THREE.Mesh(sparkleGeo, sparkleMat);
    rightSparkle.position.set(0.155, 0.01, 0.37);
    this.headMesh.add(rightSparkle);

    // Cute Cheeks Blush
    const blushGeo = new THREE.CircleGeometry(0.06, 12);
    const blushMat = new THREE.MeshBasicMaterial({
      color: 0xf472b6,
      transparent: true,
      opacity: 0.6
    });

    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.22, -0.10, 0.30);
    leftBlush.rotation.y = -0.3;
    this.headMesh.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.22, -0.10, 0.30);
    rightBlush.rotation.y = 0.3;
    this.headMesh.add(rightBlush);

    // 3. Hands
    const handGeo = new THREE.SphereGeometry(0.09, 12, 12);
    this.leftHand = new THREE.Mesh(handGeo, skinMat);
    this.leftHand.position.set(-0.34, 0.46, 0.06);
    this.group.add(this.leftHand);

    this.rightHand = new THREE.Mesh(handGeo, skinMat);
    this.rightHand.position.set(0.34, 0.46, 0.06);
    this.group.add(this.rightHand);

    // 4. Feet / Sneakers
    const footGeo = new THREE.BoxGeometry(0.14, 0.12, 0.24);
    this.leftFoot = new THREE.Mesh(footGeo, shoeMat);
    this.leftFoot.position.set(-0.15, 0.06, 0);
    this.leftFoot.castShadow = true;
    this.group.add(this.leftFoot);

    this.rightFoot = new THREE.Mesh(footGeo, shoeMat);
    this.rightFoot.position.set(0.15, 0.06, 0);
    this.rightFoot.castShadow = true;
    this.group.add(this.rightFoot);

    // 5. Item Holder in front of chest
    this.itemHolder = new THREE.Group();
    this.itemHolder.position.set(0, 0.48, 0.38);
    this.group.add(this.itemHolder);

    // 6. Ground Ring / Selection Indicator (Player only)
    if (this.isPlayer) {
      const ringCanvas = document.createElement('canvas');
      ringCanvas.width = 128;
      ringCanvas.height = 128;
      const rCtx = ringCanvas.getContext('2d')!;
      rCtx.strokeStyle = '#f59e0b';
      rCtx.lineWidth = 10;
      rCtx.beginPath();
      rCtx.arc(64, 64, 52, 0, Math.PI * 2);
      rCtx.stroke();
      // Arrow pointing forward
      rCtx.fillStyle = '#f59e0b';
      rCtx.beginPath();
      rCtx.moveTo(64, 2);
      rCtx.lineTo(46, 32);
      rCtx.lineTo(82, 32);
      rCtx.closePath();
      rCtx.fill();

      const ringTex = new THREE.CanvasTexture(ringCanvas);
      const ringGeo = new THREE.PlaneGeometry(1.4, 1.4);
      const ringMat = new THREE.MeshBasicMaterial({
        map: ringTex,
        transparent: true,
        opacity: 0.85,
        depthWrite: false
      });
      this.groundRingMesh = new THREE.Mesh(ringGeo, ringMat);
      this.groundRingMesh.rotation.x = -Math.PI / 2;
      this.groundRingMesh.position.y = 0.02;
      this.group.add(this.groundRingMesh);
    } else {
      // Soft shadow for NPCs
      const shadowGeo = new THREE.CircleGeometry(0.42, 16);
      const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 });
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.rotation.x = -Math.PI / 2;
      shadowMesh.position.y = 0.01;
      this.group.add(shadowMesh);
    }

    // 7. Floating 3D Nametag (For NPCs)
    if (isNpc) {
      this.createNametag(name, isNpc);
    }
  }

  private createNametag(name: string, isNpc: boolean): void {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 80;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = isNpc ? '#ef4444' : '#4f46e5';
    ctx.beginPath();
    ctx.roundRect(10, 10, 300, 60, 24);
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${isNpc ? '🚨' : '🟢'} ${name}`, 160, 50);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    this.nametagMesh = new THREE.Sprite(spriteMat);
    this.nametagMesh.scale.set(1.4, 0.35, 1);
    this.nametagMesh.position.set(0, 1.65, 0);
    this.group.add(this.nametagMesh);
  }

  setCarriedItem(type: CarriedItemType): void {
    if (this.carriedItem === type) return;
    this.carriedItem = type;

    while (this.itemHolder.children.length > 0) {
      this.itemHolder.remove(this.itemHolder.children[0]);
    }

    if (type === 'paper_stack') {
      const geo = new THREE.BoxGeometry(0.32, 0.18, 0.36);
      const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      this.itemHolder.add(mesh);

      this.leftHand.position.set(-0.24, 0.52, 0.36);
      this.rightHand.position.set(0.24, 0.52, 0.36);
    } else if (type === 'fabric_roll') {
      const geo = new THREE.CylinderGeometry(0.14, 0.14, 0.54, 16);
      const mat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.z = Math.PI / 2;
      mesh.castShadow = true;
      this.itemHolder.add(mesh);

      this.leftHand.position.set(-0.26, 0.52, 0.34);
      this.rightHand.position.set(0.26, 0.52, 0.34);
    } else if (type === 'coffee_cup') {
      const geo = new THREE.CylinderGeometry(0.1, 0.08, 0.26, 14);
      const mat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      this.itemHolder.add(mesh);

      this.leftHand.position.set(-0.18, 0.48, 0.32);
      this.rightHand.position.set(0.18, 0.48, 0.32);
    } else {
      this.leftHand.position.set(-0.34, 0.46, 0.06);
      this.rightHand.position.set(0.34, 0.46, 0.06);
    }
  }

  updateAnimation(delta: number, dirX: number, dirZ: number, isMoving: boolean): void {
    this.isMoving = isMoving;

    if (isMoving) {
      // Smooth facing rotation
      const targetAngle = Math.atan2(dirX, dirZ);
      let diff = targetAngle - this.group.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.group.rotation.y += diff * 14 * delta;

      // Running animation waddle
      this.walkCycle += delta * 16;
      const legAngle = Math.sin(this.walkCycle) * 0.55;
      this.leftFoot.position.z = legAngle * 0.24;
      this.rightFoot.position.z = -legAngle * 0.24;
      this.leftFoot.position.y = 0.06 + Math.max(0, Math.sin(this.walkCycle) * 0.1);
      this.rightFoot.position.y = 0.06 + Math.max(0, -Math.sin(this.walkCycle) * 0.1);

      this.group.rotation.z = Math.sin(this.walkCycle) * 0.06;
      this.headMesh.position.y = 0.98 + Math.abs(Math.sin(this.walkCycle)) * 0.05;
    } else {
      this.idleTime += delta * 2.8;
      this.leftFoot.position.set(-0.15, 0.06, 0);
      this.rightFoot.position.set(0.15, 0.06, 0);
      this.group.rotation.z = 0;
      this.headMesh.position.y = 0.98 + Math.sin(this.idleTime) * 0.018;
      this.bodyMesh.scale.set(1 + Math.sin(this.idleTime) * 0.02, 1, 1 + Math.sin(this.idleTime) * 0.02);
    }
  }

  // Backwards-compatible update
  update(delta: number, dirX: number, dirZ: number): void {
    const isMoving = Math.abs(dirX) > 0.01 || Math.abs(dirZ) > 0.01;
    this.updateAnimation(delta, dirX, dirZ, isMoving);
  }

  getPosition(): THREE.Vector3 {
    return this.group.position;
  }
}
