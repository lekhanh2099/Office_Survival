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

  // Animation cycle
  private walkCycle = 0;
  private idleTime = 0;
  public isMoving = false;
  public moveSpeed = 4.8; // units per second
  public carriedItem: CarriedItemType = 'none';

  // Customization
  public skinColor: string;
  public shirtColor: string;

  constructor(skinColor = '#fed7aa', shirtColor = '#4f46e5', isNpc = false) {
    this.skinColor = skinColor;
    this.shirtColor = shirtColor;
    this.group = new THREE.Group();
    this.initMeshes(isNpc);
  }

  private initMeshes(isNpc: boolean): void {
    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.skinColor),
      roughness: 0.4,
      metalness: 0.05
    });

    const shirtMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.shirtColor),
      roughness: 0.5,
      metalness: 0.05
    });

    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.6
    });

    // 1. Torso / Shirt
    const bodyGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.42, 16);
    this.bodyMesh = new THREE.Mesh(bodyGeo, shirtMat);
    this.bodyMesh.position.y = 0.45;
    this.bodyMesh.castShadow = true;
    this.group.add(this.bodyMesh);

    // Collar / Necktie or ID Card
    const tieGeo = new THREE.BoxGeometry(0.08, 0.22, 0.04);
    const tieMat = new THREE.MeshStandardMaterial({ color: isNpc ? 0xb91c1c : 0xf59e0b });
    const tieMesh = new THREE.Mesh(tieGeo, tieMat);
    tieMesh.position.set(0, 0.44, 0.26);
    this.group.add(tieMesh);

    // 2. Head (Large cute chibi proportions)
    const headGeo = new THREE.SphereGeometry(0.36, 24, 24);
    headGeo.scale(1, 0.95, 0.98);
    this.headMesh = new THREE.Mesh(headGeo, skinMat);
    this.headMesh.position.y = 0.92;
    this.headMesh.castShadow = true;
    this.group.add(this.headMesh);

    // Hair / Cap
    const hairGeo = new THREE.SphereGeometry(0.38, 20, 20);
    hairGeo.scale(1.02, 0.8, 1.04);
    const hairMat = new THREE.MeshStandardMaterial({
      color: isNpc ? 0x374151 : 0x1e1b4b,
      roughness: 0.7
    });
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.set(0, 0.16, -0.04);
    this.headMesh.add(hairMesh);

    // Big Cute Eyes
    const eyeGeo = new THREE.SphereGeometry(0.045, 12, 12);
    eyeGeo.scale(0.8, 1.2, 0.6);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.13, 0, 0.32);
    this.headMesh.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.13, 0, 0.32);
    this.headMesh.add(rightEye);

    // Eye Sparkle Reflections
    const sparkleGeo = new THREE.SphereGeometry(0.016, 8, 8);
    const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const leftSparkle = new THREE.Mesh(sparkleGeo, sparkleMat);
    leftSparkle.position.set(-0.115, 0.02, 0.35);
    this.headMesh.add(leftSparkle);

    const rightSparkle = new THREE.Mesh(sparkleGeo, sparkleMat);
    rightSparkle.position.set(0.145, 0.02, 0.35);
    this.headMesh.add(rightSparkle);

    // Cute Cheeks Blush
    const blushGeo = new THREE.CircleGeometry(0.05, 12);
    const blushMat = new THREE.MeshBasicMaterial({
      color: 0xf472b6,
      transparent: true,
      opacity: 0.55
    });

    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.21, -0.08, 0.28);
    leftBlush.rotation.y = -0.3;
    this.headMesh.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.21, -0.08, 0.28);
    rightBlush.rotation.y = 0.3;
    this.headMesh.add(rightBlush);

    // 3. Hands
    const handGeo = new THREE.SphereGeometry(0.08, 12, 12);
    this.leftHand = new THREE.Mesh(handGeo, skinMat);
    this.leftHand.position.set(-0.32, 0.44, 0.05);
    this.group.add(this.leftHand);

    this.rightHand = new THREE.Mesh(handGeo, skinMat);
    this.rightHand.position.set(0.32, 0.44, 0.05);
    this.group.add(this.rightHand);

    // 4. Feet
    const footGeo = new THREE.BoxGeometry(0.12, 0.12, 0.22);
    this.leftFoot = new THREE.Mesh(footGeo, darkMat);
    this.leftFoot.position.set(-0.14, 0.06, 0);
    this.leftFoot.castShadow = true;
    this.group.add(this.leftFoot);

    this.rightFoot = new THREE.Mesh(footGeo, darkMat);
    this.rightFoot.position.set(0.14, 0.06, 0);
    this.rightFoot.castShadow = true;
    this.group.add(this.rightFoot);

    // 5. Item Holder in front of chest
    this.itemHolder = new THREE.Group();
    this.itemHolder.position.set(0, 0.45, 0.36);
    this.group.add(this.itemHolder);

    // Soft Contact Shadow under character
    const shadowGeo = new THREE.CircleGeometry(0.38, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.24
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.01;
    this.group.add(shadowMesh);
  }

  setCarriedItem(type: CarriedItemType): void {
    if (this.carriedItem === type) return;
    this.carriedItem = type;

    // Clear previous item
    while (this.itemHolder.children.length > 0) {
      this.itemHolder.remove(this.itemHolder.children[0]);
    }

    if (type === 'paper_stack') {
      const geo = new THREE.BoxGeometry(0.28, 0.16, 0.34);
      const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      this.itemHolder.add(mesh);

      // Reposition hands to carry
      this.leftHand.position.set(-0.22, 0.48, 0.32);
      this.rightHand.position.set(0.22, 0.48, 0.32);
    } else if (type === 'fabric_roll') {
      const geo = new THREE.CylinderGeometry(0.12, 0.12, 0.48, 16);
      const mat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.5 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.z = Math.PI / 2;
      mesh.castShadow = true;
      this.itemHolder.add(mesh);

      this.leftHand.position.set(-0.24, 0.48, 0.3);
      this.rightHand.position.set(0.24, 0.48, 0.3);
    } else if (type === 'coffee_cup') {
      const geo = new THREE.CylinderGeometry(0.08, 0.06, 0.22, 16);
      const mat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      this.itemHolder.add(mesh);

      this.leftHand.position.set(-0.16, 0.44, 0.28);
      this.rightHand.position.set(0.16, 0.44, 0.28);
    } else {
      // Normal hands
      this.leftHand.position.set(-0.32, 0.44, 0.05);
      this.rightHand.position.set(0.32, 0.44, 0.05);
    }
  }

  update(delta: number, dirX: number, dirZ: number, bounds?: { minX: number; maxX: number; minZ: number; maxZ: number }): void {
    const isMoving = Math.abs(dirX) > 0.01 || Math.abs(dirZ) > 0.01;
    this.isMoving = isMoving;

    if (isMoving) {
      // Speed multiplier (carrying items is slightly heavier)
      const currentSpeed = this.carriedItem === 'none' ? this.moveSpeed : this.moveSpeed * 0.88;

      this.group.position.x += dirX * currentSpeed * delta;
      this.group.position.z += dirZ * currentSpeed * delta;

      // Apply bounds
      if (bounds) {
        this.group.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, this.group.position.x));
        this.group.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, this.group.position.z));
      }

      // Smooth facing rotation
      const targetAngle = Math.atan2(dirX, dirZ);
      let diff = targetAngle - this.group.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.group.rotation.y += diff * 14 * delta;

      // Run animation waddle
      this.walkCycle += delta * 15;
      const legAngle = Math.sin(this.walkCycle) * 0.45;
      this.leftFoot.position.z = legAngle * 0.22;
      this.rightFoot.position.z = -legAngle * 0.22;
      this.leftFoot.position.y = 0.06 + Math.max(0, Math.sin(this.walkCycle) * 0.08);
      this.rightFoot.position.y = 0.06 + Math.max(0, -Math.sin(this.walkCycle) * 0.08);

      // Body waddle tilt & Head bob
      this.group.rotation.z = Math.sin(this.walkCycle) * 0.05;
      this.headMesh.position.y = 0.92 + Math.abs(Math.sin(this.walkCycle)) * 0.04;
    } else {
      // Idle breathing
      this.idleTime += delta * 3;
      this.leftFoot.position.set(-0.14, 0.06, 0);
      this.rightFoot.position.set(0.14, 0.06, 0);
      this.group.rotation.z = 0;
      this.headMesh.position.y = 0.92 + Math.sin(this.idleTime) * 0.015;
      this.bodyMesh.scale.set(1 + Math.sin(this.idleTime) * 0.02, 1, 1 + Math.sin(this.idleTime) * 0.02);
    }
  }

  getPosition(): THREE.Vector3 {
    return this.group.position;
  }
}
