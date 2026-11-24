import { io, Socket } from 'socket.io-client';
import { BackendSimulationResponse } from '../types/simulation';

type SocketConnectionListener = (connected: boolean) => void;
type SimulationCompletedListener = (data: BackendSimulationResponse) => void;
type VillageStateListener = (data: any) => void;

class SocketService {
  private socket: Socket | null = null;
  private connectionListeners: Set<SocketConnectionListener> = new Set();
  private simulationListeners: Set<SimulationCompletedListener> = new Set();
  private villageListeners: Set<VillageStateListener> = new Set();
  private currentSubscribedVillage: string | null = null;

  /**
   * Initializes or reuses authenticated Socket.IO connection
   */
  connect(): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const token = localStorage.getItem('jalrakshak_token') || 'dev-student-token';

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket.IO Client] Connected to server, ID:', this.socket?.id);
      this.notifyConnection(true);

      // Re-subscribe to active village if reconnected
      if (this.currentSubscribedVillage) {
        this.subscribeVillage(this.currentSubscribedVillage);
      }
    });

    this.socket.on('disconnect', (reason: string) => {
      console.warn('[Socket.IO Client] Disconnected:', reason);
      this.notifyConnection(false);
    });

    this.socket.on('connect_error', (err: Error) => {
      console.warn('[Socket.IO Client] Connection error:', err.message);
      this.notifyConnection(false);
    });

    // Real-time authoritative simulation event handlers
    this.socket.on('simulation:completed', (payload: BackendSimulationResponse) => {
      console.log('[Socket.IO Client] Received simulation:completed event', payload);
      this.simulationListeners.forEach((listener) => listener(payload));
    });

    this.socket.on('village:state:updated', (payload: any) => {
      console.log('[Socket.IO Client] Received village:state:updated event', payload);
      this.villageListeners.forEach((listener) => listener(payload));
    });

    return this.socket;
  }

  /**
   * Subscribe to village-wide real-time groundwater updates
   */
  subscribeVillage(villageId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('village:subscribe', { villageId });
      this.currentSubscribedVillage = villageId;
    }
  }

  /**
   * Unsubscribe from village updates
   */
  unsubscribeVillage(villageId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('village:unsubscribe', { villageId });
      if (this.currentSubscribedVillage === villageId) {
        this.currentSubscribedVillage = null;
      }
    }
  }

  /**
   * Subscribes a listener to simulation:completed events
   */
  onSimulationCompleted(listener: SimulationCompletedListener): () => void {
    this.simulationListeners.add(listener);
    return () => this.simulationListeners.delete(listener);
  }

  /**
   * Subscribes a listener to village:state:updated events
   */
  onVillageUpdated(listener: VillageStateListener): () => void {
    this.villageListeners.add(listener);
    return () => this.villageListeners.delete(listener);
  }

  /**
   * Subscribes a listener to connection state changes
   */
  onConnectionChange(listener: SocketConnectionListener): () => void {
    this.connectionListeners.add(listener);
    if (this.socket) {
      listener(this.socket.connected);
    }
    return () => this.connectionListeners.delete(listener);
  }

  private notifyConnection(connected: boolean) {
    this.connectionListeners.forEach((listener) => listener(connected));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return Boolean(this.socket?.connected);
  }
}

export const socketService = new SocketService();
export default socketService;
