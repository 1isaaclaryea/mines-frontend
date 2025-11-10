/**
 * Socket.IO Service for real-time equipment notifications
 * Handles connection, authentication, and event listening
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'http://localhost:5000';

export interface EquipmentAlert {
  id: string;
  tag: string;
  equipmentName: string;
  status: 'down' | 'up';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface NotificationAcknowledged {
  id: string;
  acknowledgedBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  acknowledgedAt: string;
}

export interface AuthenticatedData {
  userId: string;
  role: string;
  canReceiveAlerts: boolean;
}

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to Socket.IO server and authenticate
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    console.log('Connecting to Socket.IO server:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket.IO connected, authenticating...');
      this.reconnectAttempts = 0;
      this.socket?.emit('authenticate', token);
    });

    this.socket.on('authenticated', (data: AuthenticatedData) => {
      console.log('Socket.IO authenticated:', data);
    });

    this.socket.on('auth-error', (error: { message: string }) => {
      console.error('Socket.IO authentication error:', error);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Socket.IO disconnected:', reason);
    });

    this.socket.on('connect_error', (error: Error) => {
      this.reconnectAttempts++;
      console.error(`Socket.IO connection error (attempt ${this.reconnectAttempts}):`, error.message);
    });

    this.socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`Socket.IO reconnection attempt ${attemptNumber}...`);
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log(`Socket.IO reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket.IO reconnection failed after maximum attempts');
    });
  }

  /**
   * Listen for equipment alert events
   */
  onEquipmentAlert(callback: (alert: EquipmentAlert) => void): void {
    this.socket?.on('equipment-alert', callback);
  }

  /**
   * Listen for notification acknowledged events
   */
  onNotificationAcknowledged(callback: (data: NotificationAcknowledged) => void): void {
    this.socket?.on('notification-acknowledged', callback);
  }

  /**
   * Listen for authenticated event
   */
  onAuthenticated(callback: (data: AuthenticatedData) => void): void {
    this.socket?.on('authenticated', callback);
  }

  /**
   * Listen for auth error event
   */
  onAuthError(callback: (error: { message: string }) => void): void {
    this.socket?.on('auth-error', callback);
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(): void {
    this.socket?.removeAllListeners();
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('Disconnecting Socket.IO...');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket instance (for debugging)
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

export default new SocketService();
