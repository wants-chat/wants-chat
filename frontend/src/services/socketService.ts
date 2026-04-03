/**
 * Socket Service
 * Handles real-time communication via Socket.io
 * Based on Deskive's working implementation
 */

import { io, Socket } from 'socket.io-client';

// Types
export type ConnectionState = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface ConnectionStateInfo {
  state: ConnectionState;
  isConnected: boolean;
}

interface RealTimeNotification {
  id: string;
  type: 'reminder' | 'achievement' | 'system' | 'social' | 'health' | 'fitness' | 'finance' | 'travel' | 'meditation';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data?: Record<string, any>;
  createdAt: string;
}

interface LiveDataUpdate {
  type: 'health_metric' | 'fitness_activity' | 'expense' | 'meditation_session' | 'travel_update';
  data: any;
  userId: string;
  timestamp: string;
}

interface SystemMessage {
  type: 'maintenance' | 'update' | 'announcement' | 'alert';
  title: string;
  message: string;
  level: 'info' | 'warning' | 'error' | 'success';
  affectedModules?: string[];
  timestamp: string;
}

// WebSocket Service (Socket.IO Implementation) - Matching Deskive's approach
class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private token: string | null = null;
  private connectionStateCallbacks: Array<(state: ConnectionStateInfo) => void> = [];
  private pendingListeners: Map<string, Set<(data: any) => void>> = new Map();

  // Subscribe to connection state changes
  onConnectionStateChange(callback: (state: ConnectionStateInfo) => void): () => void {
    this.connectionStateCallbacks.push(callback);
    return () => {
      this.connectionStateCallbacks = this.connectionStateCallbacks.filter(cb => cb !== callback);
    };
  }

  // Notify all subscribers of state change
  private notifyConnectionStateChange(): void {
    const state = this.getConnectionState();
    this.connectionStateCallbacks.forEach(callback => callback(state));
  }

  connect(token?: string): void {
    if (this.socket?.connected) {
      console.log('🔌 Socket already connected');
      return;
    }

    // Get token from parameter, stored token, or localStorage
    const authToken = token || this.token || localStorage.getItem('accessToken') || '';
    if (token) {
      this.token = token;
    }

    if (!authToken) {
      console.warn('🔌 No authentication token available for socket connection');
      return;
    }

    console.log('🔌 Connecting to Socket.IO server...');

    // Get socket URL from env - use same URL as API (like Deskive does)
    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Create Socket.IO connection (matching Deskive's config)
    this.socket = io(socketUrl, {
      auth: {
        token: authToken
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // Apply any pending listeners
    this.applyPendingListeners();

    // Socket.IO event handlers
    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected');
      this.reconnectAttempts = 0;
      this.notifyConnectionStateChange();

      // Join user's personal room for targeted notifications
      this.socket?.emit('join_user_room');

      // Set user as online
      this.updatePresence('online');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
      this.notifyConnectionStateChange();
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket.IO connection error:', error.message);
      this.notifyConnectionStateChange();
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Reconnection attempt ${attempt}...`);
    });

    this.socket.on('reconnect', (attempt) => {
      console.log(`✅ Reconnected after ${attempt} attempts`);
      this.notifyConnectionStateChange();
    });

    // Backend specific events
    this.socket.on('authenticated', () => {
      console.log('✅ Socket authenticated');
    });

    this.socket.on('unauthorized', (error: any) => {
      console.error('❌ Socket unauthorized:', error);
      this.disconnect();
    });

    // Real-time data events
    this.socket.on('notification', (notification: RealTimeNotification) => {
      this.handleNotification(notification);
    });

    this.socket.on('live_data_update', (update: LiveDataUpdate) => {
      this.handleLiveDataUpdate(update);
    });

    this.socket.on('system_message', (message: SystemMessage) => {
      this.handleSystemMessage(message);
    });

    this.socket.on('achievement_unlocked', (achievement: any) => {
      this.handleAchievementUnlocked(achievement);
    });

    this.socket.on('reminder_triggered', (reminder: any) => {
      this.handleReminderTriggered(reminder);
    });

    // Notify initial state
    this.notifyConnectionStateChange();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.notifyConnectionStateChange();
  }

  // Store pending listeners that will be registered when socket connects
  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      // Queue listener for when socket connects
      if (!this.pendingListeners.has(event)) {
        this.pendingListeners.set(event, new Set());
      }
      this.pendingListeners.get(event)!.add(callback);
    }
  }

  off(event: string, callback?: (data: any) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
    // Also remove from pending listeners
    if (callback) {
      const pending = this.pendingListeners.get(event);
      if (pending) {
        pending.delete(callback);
      }
    } else {
      this.pendingListeners.delete(event);
    }
  }

  // Apply any pending listeners after socket is created
  private applyPendingListeners(): void {
    if (!this.socket) return;

    for (const [event, callbacks] of this.pendingListeners.entries()) {
      for (const callback of callbacks) {
        this.socket.on(event, callback);
      }
    }
    this.pendingListeners.clear();
  }

  getConnectionState(): ConnectionStateInfo {
    const isConnected = this.socket?.connected ?? false;
    const state: ConnectionState = isConnected ? 'connected' :
                                    this.socket?.disconnected ? 'disconnected' :
                                    'connecting';

    return {
      state,
      isConnected
    };
  }

  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  updatePresence(status: 'online' | 'away' | 'busy' | 'offline', activity?: string): void {
    if (this.socket?.connected) {
      this.emit('update_presence', { status, activity });
    }
  }

  joinRoom(roomId: string): void {
    if (this.socket?.connected) {
      this.emit('join_room', { roomId });
    }
  }

  leaveRoom(roomId: string): void {
    if (this.socket?.connected) {
      this.emit('leave_room', { roomId });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    transportType?: string;
  } {
    return {
      connected: this.socket?.connected || false,
      reconnectAttempts: this.reconnectAttempts,
      transportType: (this.socket?.io as any)?.engine?.transport?.name || 'unknown',
    };
  }

  testConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isConnected()) {
        resolve(false);
        return;
      }

      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000);

      this.socket?.emit('ping', { timestamp: Date.now() }, (response: any) => {
        clearTimeout(timeout);
        resolve(response?.success === true);
      });
    });
  }

  // Event handlers
  private handleNotification(notification: RealTimeNotification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
      });
    }
    window.dispatchEvent(new CustomEvent('realtime-notification', { detail: notification }));
  }

  private handleLiveDataUpdate(update: LiveDataUpdate): void {
    window.dispatchEvent(new CustomEvent('live-data-update', { detail: update }));
  }

  private handleSystemMessage(message: SystemMessage): void {
    window.dispatchEvent(new CustomEvent('system-message', { detail: message }));
  }

  private handleAchievementUnlocked(achievement: any): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Achievement Unlocked! 🏆', {
        body: achievement.name,
        icon: '/favicon.ico',
        tag: `achievement_${achievement.id}`,
      });
    }
    window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: achievement }));
  }

  private handleReminderTriggered(reminder: any): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Reminder: ' + reminder.title, {
        body: reminder.description || 'You have a scheduled reminder',
        icon: '/favicon.ico',
        tag: `reminder_${reminder.id}`,
      });
    }
    window.dispatchEvent(new CustomEvent('reminder-triggered', { detail: reminder }));
  }

  static async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }
    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  }
}

// Create and export singleton instance
export const socketService = new SocketService();
