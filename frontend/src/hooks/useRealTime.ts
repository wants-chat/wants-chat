/**
 * Real-time hooks for socket integration
 */

import { useEffect, useRef, useCallback } from 'react';
import { socketService } from '../services';

interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data?: Record<string, any>;
  createdAt: string;
}

interface LiveDataUpdate {
  type: string;
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

/**
 * Hook for handling real-time notifications
 */
export const useRealTimeNotifications = (
  onNotification?: (notification: NotificationData) => void
) => {
  const handlerRef = useRef(onNotification);
  handlerRef.current = onNotification;

  useEffect(() => {
    const handleRealtimeEvent = (event: CustomEvent) => {
      handlerRef.current?.(event.detail);
    };

    // Listen to custom events from socket service
    window.addEventListener('realtime-notification', handleRealtimeEvent as EventListener);

    return () => {
      window.removeEventListener('realtime-notification', handleRealtimeEvent as EventListener);
    };
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }, []);

  return { requestPermission };
};

/**
 * Hook for handling live data updates
 */
export const useLiveDataUpdates = (
  onUpdate?: (update: LiveDataUpdate) => void,
  filterTypes?: string[]
) => {
  const handlerRef = useRef(onUpdate);
  const filterRef = useRef(filterTypes);
  
  handlerRef.current = onUpdate;
  filterRef.current = filterTypes;

  useEffect(() => {
    const handleUpdate = (event: any) => {
      const update = event.detail as LiveDataUpdate;
      
      // Apply filter if specified
      if (filterRef.current && !filterRef.current.includes(update.type)) {
        return;
      }
      
      handlerRef.current?.(update);
    };

    window.addEventListener('live-data-update', handleUpdate);

    return () => {
      window.removeEventListener('live-data-update', handleUpdate);
    };
  }, []);
};

/**
 * Hook for handling system messages
 */
export const useSystemMessages = (
  onMessage?: (message: SystemMessage) => void
) => {
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    const handleMessage = (event: any) => {
      handlerRef.current?.(event.detail);
    };

    window.addEventListener('system-message', handleMessage);

    return () => {
      window.removeEventListener('system-message', handleMessage);
    };
  }, []);
};

/**
 * Hook for handling achievements
 */
export const useAchievementNotifications = (
  onAchievement?: (achievement: any) => void
) => {
  const handlerRef = useRef(onAchievement);
  handlerRef.current = onAchievement;

  useEffect(() => {
    const handleAchievement = (event: any) => {
      handlerRef.current?.(event.detail);
    };

    window.addEventListener('achievement-unlocked', handleAchievement);

    return () => {
      window.removeEventListener('achievement-unlocked', handleAchievement);
    };
  }, []);
};

/**
 * Hook for handling reminder notifications
 */
export const useReminderNotifications = (
  onReminder?: (reminder: any) => void
) => {
  const handlerRef = useRef(onReminder);
  handlerRef.current = onReminder;

  useEffect(() => {
    const handleReminder = (event: any) => {
      handlerRef.current?.(event.detail);
    };

    window.addEventListener('reminder-triggered', handleReminder);

    return () => {
      window.removeEventListener('reminder-triggered', handleReminder);
    };
  }, []);
};

/**
 * Hook for managing socket connection
 */
export const useSocket = () => {
  const connect = useCallback(async () => {
    await socketService.connect();
  }, []);

  const disconnect = useCallback(() => {
    socketService.disconnect();
  }, []);

  const updatePresence = useCallback((
    status: 'online' | 'away' | 'busy' | 'offline',
    activity?: string
  ) => {
    socketService.updatePresence(status, activity);
  }, []);

  const getConnectionStatus = useCallback(() => {
    return socketService.getConnectionStatus();
  }, []);

  const testConnection = useCallback(async () => {
    return await socketService.testConnection();
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    socketService.emit(event, data);
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    socketService.joinRoom(roomId);
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    socketService.leaveRoom(roomId);
  }, []);

  return {
    connect,
    disconnect,
    updatePresence,
    getConnectionStatus,
    testConnection,
    emit,
    joinRoom,
    leaveRoom,
    isConnected: socketService.isConnected(),
  };
};

/**
 * Comprehensive real-time hook that combines all real-time features
 */
export const useRealTime = (options?: {
  onNotification?: (notification: NotificationData) => void;
  onDataUpdate?: (update: LiveDataUpdate) => void;
  onSystemMessage?: (message: SystemMessage) => void;
  onAchievement?: (achievement: any) => void;
  onReminder?: (reminder: any) => void;
  dataUpdateFilter?: string[];
  autoConnect?: boolean;
}) => {
  const {
    onNotification,
    onDataUpdate,
    onSystemMessage,
    onAchievement,
    onReminder,
    dataUpdateFilter,
    autoConnect = true,
  } = options || {};

  // Use individual hooks
  useRealTimeNotifications(onNotification);
  useLiveDataUpdates(onDataUpdate, dataUpdateFilter);
  useSystemMessages(onSystemMessage);
  useAchievementNotifications(onAchievement);
  useReminderNotifications(onReminder);

  const socket = useSocket();

  // Socket connection disabled - causing timeout issues
  // TODO: Fix socket server configuration before re-enabling
  // useEffect(() => {
  //   if (autoConnect) {
  //     socketService.connect();
  //   }
  // }, [autoConnect]);

  return socket;
};