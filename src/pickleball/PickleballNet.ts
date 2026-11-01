// ============================================================================
// PICKLEBALL NET - WebRTC P2P Multiplayer Networking (Host-Authoritative)
// ============================================================================

import Peer, { DataConnection } from 'peerjs';
import { ShotType, WorldSnapshot } from './PickleballEngine';

export type NetRole = 'host' | 'guest' | 'none';
export type NetStatus = 'disconnected' | 'connecting' | 'waiting_for_guest' | 'connected' | 'error';

export type NetPacket =
  | { type: 'JOIN'; playerName: string; paddleId: string; emoji: string }
  | { type: 'ACCEPT'; hostName: string; paddleId: string; emoji: string; targetScore: number }
  | { type: 'START' }
  | WorldSnapshot
  | { type: 'MOVE'; x: number; z: number }
  | { type: 'SHOT'; shotType: ShotType; explicitAimX?: number; explicitAimZ?: number }
  | { type: 'SERVE'; aimX?: number }
  | { type: 'HIT_EVENT'; hitter: 'host' | 'guest'; shot: ShotType; quality: 'perfect' | 'good' | 'late' | 'early' }
  | { type: 'POINT_EVENT'; winner: 'host' | 'guest'; reason: string; message: string }
  | { type: 'EMOJI'; sender: 'host' | 'guest'; emoji: string }
  | { type: 'PING'; timestamp: number }
  | { type: 'PONG'; timestamp: number };

export interface NetCallbacks {
  onStatusChange?: (status: NetStatus, message?: string) => void;
  onGuestJoined?: (guestInfo: { name: string; paddleId: string; emoji: string }) => void;
  onConnectedToHost?: (hostInfo: { name: string; paddleId: string; emoji: string; targetScore: number }) => void;
  onGameStart?: () => void;
  onSnapshotReceived?: (snapshot: WorldSnapshot) => void;
  onGuestMove?: (pos: { x: number; z: number }) => void;
  onGuestShot?: (shot: { shotType: ShotType; explicitAimX?: number; explicitAimZ?: number }) => void;
  onGuestServe?: (aimX?: number) => void;
  onHitEvent?: (event: { hitter: 'host' | 'guest'; shot: ShotType; quality: 'perfect' | 'good' | 'late' | 'early' }) => void;
  onPointEvent?: (event: { winner: 'host' | 'guest'; reason: string; message: string }) => void;
  onEmojiReceived?: (emoji: string, sender: 'host' | 'guest') => void;
  onPingUpdated?: (pingMs: number) => void;
  onDisconnected?: (reason?: string) => void;
}

export class PickleballNet {
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  public role: NetRole = 'none';
  public status: NetStatus = 'disconnected';
  public roomCode = '';
  public pingMs = 0;
  private pingInterval: number | null = null;
  private callbacks: NetCallbacks = {};

  public localPlayer = {
    name: 'Bạn',
    paddleId: 'carbon',
    emoji: '🧑‍💻'
  };

  public remotePlayer = {
    name: 'Đối thủ',
    paddleId: 'carbon',
    emoji: '🏓'
  };

  constructor(callbacks: NetCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public setCallbacks(callbacks: Partial<NetCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Generate 4-digit numeric room code (e.g. "8264")
  public static generateRoomCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  private getFullPeerId(code: string): string {
    return `os-pickleball-${code}`;
  }

  // 1. HOST: Create Room
  public async createRoom(
    roomCode: string,
    playerName: string,
    paddleId: string,
    emoji: string
  ): Promise<string> {
    this.disconnect();
    this.role = 'host';
    this.roomCode = roomCode;
    this.localPlayer = { name: playerName, paddleId, emoji };
    this.updateStatus('connecting', 'Đang tạo phòng đấu...');

    return new Promise((resolve, reject) => {
      try {
        const fullId = this.getFullPeerId(roomCode);
        this.peer = new Peer(fullId, {
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        });

        this.peer.on('open', () => {
          this.updateStatus('waiting_for_guest', `Phòng ${roomCode} đã sẵn sàng. Chờ đối thủ vào...`);
          resolve(roomCode);
        });

        this.peer.on('connection', (connection) => {
          if (this.conn) {
            // Already connected to a player, reject extra spectators
            connection.close();
            return;
          }
          this.setupConnection(connection);
        });

        this.peer.on('error', (err) => {
          const msg = (err as any).type === 'unavailable-id'
            ? 'Mã phòng này đang có người dùng, vui lòng thử mã khác!'
            : `Lỗi kết nối: ${err.message}`;
          this.updateStatus('error', msg);
          reject(new Error(msg));
        });
      } catch (err: any) {
        this.updateStatus('error', err.message);
        reject(err);
      }
    });
  }

  // 2. GUEST: Join Room
  public async joinRoom(
    roomCode: string,
    playerName: string,
    paddleId: string,
    emoji: string
  ): Promise<void> {
    this.disconnect();
    this.role = 'guest';
    this.roomCode = roomCode;
    this.localPlayer = { name: playerName, paddleId, emoji };
    this.updateStatus('connecting', `Đang kết nối tới phòng ${roomCode}...`);

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer({
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        });

        this.peer.on('open', () => {
          const targetId = this.getFullPeerId(roomCode);
          const connection = this.peer!.connect(targetId, {
            reliable: false // Ultra low-latency UDP mode for real-time gaming
          });

          this.setupConnection(connection);

          // Connection open timeout
          const timeout = setTimeout(() => {
            if (this.status !== 'connected') {
              this.updateStatus('error', 'Không tìm thấy phòng hoặc chủ phòng chưa sẵn sàng!');
              reject(new Error('Timeout'));
            }
          }, 9000);

          connection.on('open', () => {
            clearTimeout(timeout);
            // Send JOIN handshake
            this.send({
              type: 'JOIN',
              playerName: this.localPlayer.name,
              paddleId: this.localPlayer.paddleId,
              emoji: this.localPlayer.emoji
            });
            resolve();
          });
        });

        this.peer.on('error', (err) => {
          this.updateStatus('error', `Lỗi kết nối: ${err.message}`);
          reject(err);
        });
      } catch (err: any) {
        this.updateStatus('error', err.message);
        reject(err);
      }
    });
  }

  private setupConnection(connection: DataConnection): void {
    this.conn = connection;

    this.conn.on('open', () => {
      this.updateStatus('connected', 'Đã kết nối thành công!');
      this.startPingLoop();
    });

    this.conn.on('data', (raw: any) => {
      this.handlePacket(raw as NetPacket);
    });

    this.conn.on('close', () => {
      this.updateStatus('disconnected', 'Đối thủ đã ngắt kết nối');
      this.callbacks.onDisconnected?.('Đối thủ đã rời trận đấu');
      this.disconnect();
    });

    this.conn.on('error', (err) => {
      this.callbacks.onDisconnected?.(err.message);
    });
  }

  private handlePacket(pkt: NetPacket): void {
    if (!pkt || !pkt.type) return;

    switch (pkt.type) {
      case 'JOIN': {
        // Host received Guest join request
        this.remotePlayer = {
          name: pkt.playerName,
          paddleId: pkt.paddleId,
          emoji: pkt.emoji
        };
        this.callbacks.onGuestJoined?.(this.remotePlayer);
        // Reply with ACCEPT
        this.send({
          type: 'ACCEPT',
          hostName: this.localPlayer.name,
          paddleId: this.localPlayer.paddleId,
          emoji: this.localPlayer.emoji,
          targetScore: 5
        });
        break;
      }

      case 'ACCEPT': {
        // Guest received Host accept
        this.remotePlayer = {
          name: pkt.hostName,
          paddleId: pkt.paddleId,
          emoji: pkt.emoji
        };
        this.callbacks.onConnectedToHost?.({
          name: pkt.hostName,
          paddleId: pkt.paddleId,
          emoji: pkt.emoji,
          targetScore: pkt.targetScore
        });
        break;
      }

      case 'START': {
        this.callbacks.onGameStart?.();
        break;
      }

      case 'TICK': {
        if (this.role === 'guest') {
          this.callbacks.onSnapshotReceived?.(pkt);
        }
        break;
      }

      case 'MOVE': {
        if (this.role === 'host') {
          this.callbacks.onGuestMove?.({ x: pkt.x, z: pkt.z });
        }
        break;
      }

      case 'SHOT': {
        if (this.role === 'host') {
          this.callbacks.onGuestShot?.({
            shotType: pkt.shotType,
            explicitAimX: pkt.explicitAimX,
            explicitAimZ: pkt.explicitAimZ
          });
        }
        break;
      }

      case 'SERVE': {
        if (this.role === 'host') {
          this.callbacks.onGuestServe?.(pkt.aimX);
        }
        break;
      }

      case 'HIT_EVENT': {
        this.callbacks.onHitEvent?.({
          hitter: pkt.hitter,
          shot: pkt.shot,
          quality: pkt.quality
        });
        break;
      }

      case 'POINT_EVENT': {
        this.callbacks.onPointEvent?.({
          winner: pkt.winner,
          reason: pkt.reason,
          message: pkt.message
        });
        break;
      }

      case 'EMOJI': {
        this.callbacks.onEmojiReceived?.(pkt.emoji, pkt.sender);
        break;
      }

      case 'PING': {
        this.send({ type: 'PONG', timestamp: pkt.timestamp });
        break;
      }

      case 'PONG': {
        const roundTrip = performance.now() - pkt.timestamp;
        this.pingMs = Math.round(roundTrip / 2);
        this.callbacks.onPingUpdated?.(this.pingMs);
        break;
      }
    }
  }

  public send(pkt: NetPacket): void {
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(pkt);
      } catch (_) {}
    }
  }

  private startPingLoop(): void {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = window.setInterval(() => {
      if (this.conn && this.conn.open) {
        this.send({ type: 'PING', timestamp: performance.now() });
      }
    }, 2000);
  }

  private updateStatus(status: NetStatus, message?: string): void {
    this.status = status;
    this.callbacks.onStatusChange?.(status, message);
  }

  public disconnect(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.conn) {
      try { this.conn.close(); } catch (_) {}
      this.conn = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch (_) {}
      this.peer = null;
    }
    this.role = 'none';
    this.status = 'disconnected';
    this.pingMs = 0;
  }
}
