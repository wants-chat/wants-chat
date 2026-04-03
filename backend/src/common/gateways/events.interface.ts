// Import types from app.gateway
import type { RealtimeEvent, UserPresence, AuthenticatedSocket } from './app.gateway';

// Re-export for convenience
export type { RealtimeEvent, UserPresence, AuthenticatedSocket };

// Connection Events
export interface ConnectionEvent extends RealtimeEvent {
  type: 'connection:success' | 'connection:error' | 'connection:ping' | 'connection:pong';
  data: {
    message?: string;
    userId?: string;
    error?: string;
    code?: string;
  };
}

// Presence Events
export interface PresenceEvent extends RealtimeEvent {
  type: 'presence:updated' | 'presence:online' | 'presence:offline';
  data: {
    userId: string;
    status: 'online' | 'away' | 'busy' | 'offline';
    lastSeen?: string;
  };
}

// Chat Events
export interface ChatEvent extends RealtimeEvent {
  type: 'message:sent' | 'message:received' | 'message:streaming' | 'typing:start' | 'typing:stop';
  data: {
    conversationId?: string;
    messageId?: string;
    senderId?: string;
    content?: string;
    role?: 'user' | 'assistant' | 'system';
    isStreaming?: boolean;
    metadata?: any;
  };
}

// Conversation Events
export interface ConversationEvent extends RealtimeEvent {
  type: 'conversation:created' | 'conversation:updated' | 'conversation:deleted';
  data: {
    conversationId: string;
    title?: string;
    userId: string;
  };
}

// App Builder Events
export interface AppBuilderEvent extends RealtimeEvent {
  type: 'app-builder:started' | 'app-builder:completed' | 'app-builder:error';
  data: {
    sessionId: string;
    appDescription?: string;
    appType?: string;
    appId?: string;
    appName?: string;
    backendUrl?: string;
    frontendUrl?: string;
    success?: boolean;
    error?: string;
  };
}

// Union type for all possible events
export type WantsChatEvent =
  | ConnectionEvent
  | PresenceEvent
  | ChatEvent
  | ConversationEvent
  | AppBuilderEvent;

// Event emission options
export interface EmissionOptions {
  userId?: string;
  userIds?: string[];
  room?: string;
  broadcast?: boolean;
  excludeUserId?: string;
  metadata?: Record<string, any>;
}

// WebSocket response wrapper
export interface WebSocketResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId?: string;
}

// Room types
export type RoomType =
  | `user:${string}`                    // Personal user room
  | `conversation:${string}`            // Chat conversations
  | 'authenticated'                     // All authenticated users
  | string;                             // Custom room names
