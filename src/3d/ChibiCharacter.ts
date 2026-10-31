import * as THREE from 'three';
import { PlayerCustomProfile, getSavedPlayerProfile } from '../data/playerProfile';

export type CarriedItemType = 'none' | 'paper_stack' | 'fabric_roll' | 'coffee_cup' | 'box' | 'sample_shirt';

export class ChibiCharacter {
  public group: THREE.Group;
  private headMesh!: THREE.Mesh;
  private hairMesh!: THREE.Mesh;
  private bang1!: THREE.Mesh;
  private bang2!: THREE.Mesh;
  private bodyMesh!: THREE.Mesh;
  private idCardMesh!: THREE.Mesh;
  private leftFoot!: THREE.Mesh;
  private rightFoot!: THREE.Mesh;
  private leftHand!: THREE.Mesh;
  private rightHand!: THREE.Mesh;
  private itemHolder!: THREE.Group;
  private accessoryHolder!: THREE.Group;
  private nametagMesh!: THREE.Sprite;
  private emoteSprite!: THREE.Sprite;
  private groundRingMesh!: THREE.Mesh;
  private leftEyeMesh!: THREE.Mesh;
  private rightEyeMesh!: THREE.Mesh;

  // Animation cycle, Eye blink & Emote timer
  private walkCycle = 0;
  private idleTime = 0;
  private blinkTimer = 0;
  private emoteTimer = 0;
  public isMoving = false;
  public moveSpeed = 5.4; // units per second
  public carriedItem: CarriedItemType = 'none';

  // Customization
  public skinColor: string;
  public shirtColor: string;
  public hairColor: string;
  public isPlayer: boolean;
  public currentName: string;
  public currentTitle: string;

  constructor(skinColor = '#fed7aa', shirtColor = '#4f46e5', isNpc = false, name = 'BẠN (MERCHANDISER)') {
    this.skinColor = skinColor;
    this.shirtColor = shirtColor;
    this.hairColor = isNpc ? '#475569' : '#1e1b4b';
    this.isPlayer = !isNpc;
    this.currentName = name;
    this.currentTitle = 'Chiến Thần Merchandiser';
    this.group = new THREE.Group();

    if (this.isPlayer) {
      const saved = getSavedPlayerProfile();
      this.currentName = saved.name || name;
      this.currentTitle = saved.title || 'Chiến Thần Merchandiser';
      this.shirtColor = saved.shirtColor || shirtColor;
      this.hairColor = saved.hairColor || '#1e1b4b';
    }

    this.initMeshes(isNpc);
  }

  private initMeshes(isNpc: boolean): void {
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
    this.idCardMesh = new THREE.Mesh(idCardGeo, idCardMat);
    this.idCardMesh.position.set(0, 0.46, 0.28);
    this.group.add(this.idCardMesh);

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
      color: new THREE.Color(this.hairColor),
      roughness: 0.6
    });
    this.hairMesh = new THREE.Mesh(hairGeo, hairMat);
    this.hairMesh.position.set(0, 0.16, -0.05);
    this.headMesh.add(this.hairMesh);

    // Front Bangs
    const bangGeo = new THREE.BoxGeometry(0.18, 0.14, 0.08);
    this.bang1 = new THREE.Mesh(bangGeo, hairMat);
    this.bang1.position.set(-0.16, 0.28, 0.32);
    this.bang1.rotation.z = -0.2;
    this.headMesh.add(this.bang1);

    this.bang2 = new THREE.Mesh(bangGeo, hairMat);
    this.bang2.position.set(0.16, 0.28, 0.32);
    this.bang2.rotation.z = 0.2;
    this.headMesh.add(this.bang2);

    // Big Anime Eyes
    const eyeGeo = new THREE.SphereGeometry(0.052, 14, 14);
    eyeGeo.scale(0.8, 1.25, 0.5);
    const eyeMat = new THREE.MeshBasicMaterial({ color: isNpc ? 0x0f172a : 0x1e1b4b });

    this.leftEyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
    this.leftEyeMesh.position.set(-0.14, -0.02, 0.34);
    this.headMesh.add(this.leftEyeMesh);

    this.rightEyeMesh = new THREE.Mesh(eyeGeo.clone(), eyeMat);
    this.rightEyeMesh.position.set(0.14, -0.02, 0.34);
    this.headMesh.add(this.rightEyeMesh);

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

    // 4. Feet / Sneakers with Rubber Soles
    const footGeo = new THREE.BoxGeometry(0.14, 0.12, 0.24);
    this.leftFoot = new THREE.Mesh(footGeo, shoeMat);
    this.leftFoot.position.set(-0.15, 0.06, 0);
    this.leftFoot.castShadow = true;
    this.group.add(this.leftFoot);

    this.rightFoot = new THREE.Mesh(footGeo, shoeMat);
    this.rightFoot.position.set(0.15, 0.06, 0);
    this.rightFoot.castShadow = true;
    this.group.add(this.rightFoot);

    const soleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const soleGeo = new THREE.BoxGeometry(0.145, 0.035, 0.245);
    const leftSole = new THREE.Mesh(soleGeo, soleMat);
    leftSole.position.set(0, -0.045, 0);
    this.leftFoot.add(leftSole);

    const rightSole = new THREE.Mesh(soleGeo.clone(), soleMat);
    rightSole.position.set(0, -0.045, 0);
    this.rightFoot.add(rightSole);

    // 5. Item Holder in front of chest
    this.itemHolder = new THREE.Group();
    this.itemHolder.position.set(0, 0.48, 0.38);
    this.group.add(this.itemHolder);

    // 6. Accessories Holder
    this.accessoryHolder = new THREE.Group();
    this.group.add(this.accessoryHolder);

    if (this.isPlayer) {
      const saved = getSavedPlayerProfile();
      this.rebuildAccessories(saved.accessory);
    }

    // 7. Ground Ring / Selection Indicator (Player only)
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

    // 8. Floating 3D Nametag
    this.createNametag(this.currentName, isNpc, this.currentTitle);

    // 9. Floating Emote Sprite (Initially hidden)
    this.createEmoteSprite();
  }

  private rebuildAccessories(type: PlayerCustomProfile['accessory']): void {
    while (this.accessoryHolder.children.length > 0) {
      this.accessoryHolder.remove(this.accessoryHolder.children[0]);
    }

    if (type === 'glasses') {
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
      // Left rim
      const rimGeo = new THREE.TorusGeometry(0.09, 0.014, 8, 18);
      const rimLeft = new THREE.Mesh(rimGeo, frameMat);
      rimLeft.position.set(-0.14, 0.98, 0.34);
      this.accessoryHolder.add(rimLeft);
      // Right rim
      const rimRight = new THREE.Mesh(rimGeo, frameMat);
      rimRight.position.set(0.14, 0.98, 0.34);
      this.accessoryHolder.add(rimRight);
      // Bridge
      const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.10, 8), frameMat);
      bridge.rotation.z = Math.PI / 2;
      bridge.position.set(0, 0.99, 0.35);
      this.accessoryHolder.add(bridge);
    } else if (type === 'headphone') {
      const headsetMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25, metalness: 0.85 });
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.035, 8, 24, Math.PI), headsetMat);
      band.position.set(0, 0.72, 0.02);
      band.rotation.x = Math.PI * 0.45;
      this.accessoryHolder.add(band);

      const earCupMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.2 });
      const earLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.06, 14), earCupMat);
      earLeft.position.set(-0.31, 0.72, 0.07);
      earLeft.rotation.z = Math.PI / 2;
      this.accessoryHolder.add(earLeft);

      const earRight = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.06, 14), earCupMat);
      earRight.position.set(0.31, 0.72, 0.07);
      earRight.rotation.z = Math.PI / 2;
      this.accessoryHolder.add(earRight);
    } else if (type === 'gold_badge') {
      // Golden VIP Lanyard & Badge
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
      const badgePlate = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.035), goldMat);
      badgePlate.position.set(0, 0.46, 0.30);
      this.accessoryHolder.add(badgePlate);

      // Gold Ribbon
      const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
      const ribbon = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.02, 6, 20, Math.PI), ribbonMat);
      ribbon.position.set(0, 0.68, 0.02);
      ribbon.rotation.x = Math.PI * 0.45;
      this.accessoryHolder.add(ribbon);
    } else if (type === 'coffee_thermos') {
      // Thermos Tumbler on hip belt
      const cupMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3, metalness: 0.4 });
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.28, 14), cupMat);
      cup.position.set(0.28, 0.38, 0.12);
      cup.rotation.z = -0.15;
      this.accessoryHolder.add(cup);
    }
  }

  private createNametag(name: string, isNpc: boolean, title?: string): void {
    if (this.nametagMesh) {
      this.group.remove(this.nametagMesh);
    }

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 220;
    const ctx = canvas.getContext('2d')!;

    // Rounded Box background
    if (isNpc) {
      ctx.fillStyle = '#b91c1c';
      ctx.strokeStyle = '#fca5a5';
    } else {
      const grad = ctx.createLinearGradient(0, 0, 800, 220);
      grad.addColorStop(0, '#312e81');
      grad.addColorStop(0.5, '#4f46e5');
      grad.addColorStop(1, '#6366f1');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#facc15';
    }

    ctx.beginPath();
    ctx.roundRect(16, 16, 768, 188, 48);
    ctx.fill();

    ctx.lineWidth = isNpc ? 8 : 10;
    ctx.stroke();

    // Name Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 52px Nunito, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (isNpc) {
      ctx.fillText(`🚨 ${name.toUpperCase()}`, 400, 110);
    } else {
      ctx.fillText(`✨ ${name.toUpperCase()}`, 400, 82);
      // Title Subtitle
      ctx.fillStyle = '#fde047';
      ctx.font = '800 36px Nunito, -apple-system, sans-serif';
      ctx.fillText(`★ ${title || 'Chiến Thần Merchandiser'} ★`, 400, 148);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    this.nametagMesh = new THREE.Sprite(spriteMat);
    this.nametagMesh.scale.set(1.65, 0.45, 1);
    this.nametagMesh.position.set(0, 1.78, 0);
    this.group.add(this.nametagMesh);
  }

  private createEmoteSprite(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 160;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.arc(80, 80, 72, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 6;
    ctx.strokeStyle = '#facc15';
    ctx.stroke();

    ctx.font = '80px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨', 80, 85);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0, depthTest: false });
    this.emoteSprite = new THREE.Sprite(spriteMat);
    this.emoteSprite.scale.set(0.65, 0.65, 1);
    this.emoteSprite.position.set(0, 2.3, 0);
    this.group.add(this.emoteSprite);
  }

  public showEmote(emoji: string, duration = 2.4): void {
    if (!this.emoteSprite) return;

    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 160;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.beginPath();
    ctx.arc(80, 80, 72, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 6;
    ctx.strokeStyle = '#facc15';
    ctx.stroke();

    ctx.font = '80px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 80, 85);

    const texture = new THREE.CanvasTexture(canvas);
    this.emoteSprite.material.map = texture;
    this.emoteSprite.material.opacity = 1.0;
    this.emoteSprite.position.set(0, 2.3, 0);
    this.emoteTimer = duration;
  }

  public updateProfile(profile: PlayerCustomProfile): void {
    this.currentName = profile.name || 'Bạn';
    this.currentTitle = profile.title || 'Chiến Thần Merchandiser';
    this.shirtColor = profile.shirtColor || '#4f46e5';
    this.hairColor = profile.hairColor || '#1e1b4b';

    // Update body shirt color
    if (this.bodyMesh) {
      (this.bodyMesh.material as THREE.MeshStandardMaterial).color.set(this.shirtColor);
    }

    // Update hair color
    if (this.hairMesh) {
      (this.hairMesh.material as THREE.MeshStandardMaterial).color.set(this.hairColor);
      (this.bang1.material as THREE.MeshStandardMaterial).color.set(this.hairColor);
      (this.bang2.material as THREE.MeshStandardMaterial).color.set(this.hairColor);
    }

    // Rebuild accessories
    this.rebuildAccessories(profile.accessory);

    // Re-create nametag
    this.createNametag(this.currentName, !this.isPlayer, this.currentTitle);

    // Celebrate with star emote
    this.showEmote('✨', 2.8);
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
    } else if (type === 'sample_shirt') {
      const geo = new THREE.BoxGeometry(0.36, 0.12, 0.42);
      const mat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.6 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      const collar = new THREE.Mesh(
        new THREE.BoxGeometry(0.20, 0.05, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x0891b2, roughness: 0.4 })
      );
      collar.position.set(0, 0.08, -0.12);
      mesh.add(collar);
      this.itemHolder.add(mesh);

      this.leftHand.position.set(-0.25, 0.52, 0.35);
      this.rightHand.position.set(0.25, 0.52, 0.35);
    } else {
      this.leftHand.position.set(-0.34, 0.46, 0.06);
      this.rightHand.position.set(0.34, 0.46, 0.06);
    }
  }

  updateAnimation(delta: number, dirX: number, dirZ: number, isMoving: boolean): void {
    this.isMoving = isMoving;

    // Animated Eye Blinking (Natural Anime blink cycle every 3.8s)
    this.blinkTimer += delta;
    if (this.blinkTimer > 3.8) {
      this.leftEyeMesh.scale.y = 0.15;
      this.rightEyeMesh.scale.y = 0.15;
      if (this.blinkTimer > 3.94) {
        this.leftEyeMesh.scale.y = 1.25;
        this.rightEyeMesh.scale.y = 1.25;
        this.blinkTimer = 0;
      }
    } else {
      this.leftEyeMesh.scale.y = 1.25;
      this.rightEyeMesh.scale.y = 1.25;
    }

    // Emote float and fade
    if (this.emoteTimer > 0) {
      this.emoteTimer -= delta;
      this.emoteSprite.position.y += delta * 0.12;
      this.emoteSprite.material.opacity = Math.max(0, Math.min(1, this.emoteTimer));
    } else if (this.emoteSprite && this.emoteSprite.material.opacity > 0) {
      this.emoteSprite.material.opacity = 0;
    }

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
