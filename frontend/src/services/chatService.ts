/**
 * Chat Service
 * Handles real-time chat communication via Socket.io /chat namespace
 */

import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  sessionId?: string;
  conversationId?: string;
  metadata?: {
    intent?: {
      matched: boolean;
      confidence: number;
      pattern?: any;
      fallbackToAI: boolean;
    };
    uiConfig?: {
      type: string;
      title: string;
      description: string;
      icon?: string;
      serviceBackend: string;
      endpoint?: string;
    };
    patternId?: string;
    serviceBackend?: string;
    endpoint?: string;
    error?: boolean;
  };
}

export interface ChatSession {
  sessionId: string;
  conversationId: string;
  status: 'active' | 'paused' | 'ended';
  timestamp: string;
}

export interface IntentDetection {
  sessionId: string;
  userMessage: string;
  intent: {
    matched: boolean;
    confidence: number;
    pattern?: any;
    fallbackToAI: boolean;
  };
  uiConfig: {
    type: string;
    toolId?: string;
    title: string;
    description: string;
    icon?: string;
    serviceBackend: string;
    endpoint?: string;
    metadata?: Record<string, any>;
  };
  timestamp: string;
}

type ConnectionState = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface HistoryData {
  sessionId: string;
  conversationId: string;
  messages: ChatMessage[];
}

export interface ConversationUpdate {
  conversationId: string;
  title?: string;
  timestamp: string;
}

// Streaming event types for ChatGPT-like real-time responses
export interface StreamStart {
  messageId: string;
  sessionId: string;
  model: string;
  timestamp: string;
}

export interface StreamChunk {
  messageId: string;
  sessionId: string;
  chunk: string;
  timestamp: string;
}

export interface StreamEnd {
  messageId: string;
  persistedId?: string; // Real database UUID (for Thread/branching features)
  sessionId: string;
  fullContent: string;
  suggestedTools?: Array<{
    toolId: string;
    title: string;
    description: string;
    category: string;
    type: string;
    icon: string;
  }>; // Tools that LLM was made aware of - for inline clickable mentions
  timestamp: string;
}

// App Builder events for real-time generation/deployment progress
export interface AppBuilderEvent {
  sessionId: string;
  step?: string;
  status?: string;
  message?: string;
  appId?: string;
  appName?: string;
  appType?: string;
  appDescription?: string;
  backendUrl?: string;
  frontendUrl?: string;
  mobileUrl?: string;
  apiDocsUrl?: string;
  outputPath?: string;
  features?: string[];
  stats?: any;
  success?: boolean;
  error?: string;
  timestamp: string;
  // Flags indicating which code types were generated (regardless of deployment)
  hasBackendCode?: boolean;
  hasFrontendCode?: boolean;
  hasMobileCode?: boolean;
}

export type AppBuilderEventType = 'started' | 'progress' | 'completed' | 'error';

// App builder state stored in sessionStorage for persistence across reconnects
interface PendingAppBuild {
  sessionId: string;
  appName?: string;
  appType?: string;
  startedAt: string;
}

class ChatService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private currentSession: ChatSession | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private pendingSessionRestore: string | null = null; // Session to restore on reconnect
  private isReconnecting: boolean = false;

  // Callbacks
  private messageCallbacks: Array<(message: ChatMessage) => void> = [];
  private historyCallbacks: Array<(data: HistoryData) => void> = [];
  private typingCallbacks: Array<(data: { sessionId: string; sender: string; isTyping: boolean }) => void> = [];
  private intentCallbacks: Array<(intent: IntentDetection) => void> = [];
  private sessionCallbacks: Array<(session: ChatSession | null) => void> = [];
  private connectionCallbacks: Array<(state: ConnectionState) => void> = [];
  private errorCallbacks: Array<(error: { message: string }) => void> = [];
  private conversationUpdateCallbacks: Array<(update: ConversationUpdate) => void> = [];
  // Streaming callbacks for real-time token delivery (ChatGPT-like)
  private streamStartCallbacks: Array<(data: StreamStart) => void> = [];
  private streamChunkCallbacks: Array<(data: StreamChunk) => void> = [];
  private streamEndCallbacks: Array<(data: StreamEnd) => void> = [];
  // App Builder callbacks for generation/deployment progress
  private appBuilderCallbacks: Array<(type: AppBuilderEventType, data: AppBuilderEvent) => void> = [];

  // Persist app builder state to sessionStorage for recovery on reconnect
  private savePendingAppBuild(build: PendingAppBuild | null): void {
    if (build) {
      sessionStorage.setItem('wants_pending_app_build', JSON.stringify(build));
    } else {
      sessionStorage.removeItem('wants_pending_app_build');
    }
  }

  private getPendingAppBuild(): PendingAppBuild | null {
    try {
      const data = sessionStorage.getItem('wants_pending_app_build');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  connect(token?: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.socket?.connected) {
        console.log('Chat socket already connected');
        resolve(true);
        return;
      }

      const authToken = token || this.token || localStorage.getItem('accessToken') || '';
      if (token) {
        this.token = token;
      }

      if (!authToken) {
        console.warn('No authentication token for chat socket');
        resolve(false);
        return;
      }

      this.setConnectionState('connecting');

      const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3188';

      console.log('Connecting to chat socket:', socketUrl + '/chat');

      this.socket = io(socketUrl + '/chat', {
        auth: { token: authToken },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 600000, // 10 minutes connection timeout (for long app builds)
      });

      // Connection events
      this.socket.on('connect', () => {
        console.log('Chat socket connected');
        this.setConnectionState('connected');
        resolve(true);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Chat socket disconnected:', reason);
        // Store session info for restoration on reconnect
        if (this.currentSession) {
          this.pendingSessionRestore = this.currentSession.sessionId;
          console.log('📌 Saved session for restore:', this.pendingSessionRestore);
        }
        this.isReconnecting = true;
        this.setConnectionState('disconnected');
      });

      // Handle successful reconnection
      this.socket.on('reconnect', () => {
        console.log('🔄 Chat socket reconnected');
        this.isReconnecting = false;
        this.setConnectionState('connected');

        // Rejoin user room and restore session if we had one
        if (this.pendingSessionRestore) {
          console.log('🔄 Restoring session after reconnect:', this.pendingSessionRestore);
          // Re-emit join_user_room to rejoin our personal room
          this.socket?.emit('session:start', {});
        }

        // Check for pending app build completion that might have been missed
        const pendingBuild = this.getPendingAppBuild();
        if (pendingBuild) {
          console.log('🔄 Checking for missed app build completion...');
          this.socket?.emit('app-builder:check-pending', {});
        }
      });

      // Handle pending build recovery response
      this.socket.on('app-builder:pending', (data: { hasPending: boolean; recovered?: boolean }) => {
        console.log('📬 App builder pending status:', data);
        if (data.recovered) {
          console.log('✅ Successfully recovered pending build completion!');
        } else if (!data.hasPending) {
          // No pending completion - clear the sessionStorage flag
          const pendingBuild = this.getPendingAppBuild();
          if (pendingBuild) {
            // Build might have completed already, give it another moment
            // This is a safety mechanism - the completion might still arrive via user room
            console.log('⏳ No pending build found on server, waiting for completion via user room...');
          }
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('Chat socket connection error:', error.message);
        this.setConnectionState('error');
        resolve(false);
      });

      // Auth events
      this.socket.on('auth:success', (data) => {
        console.log('Chat authenticated:', data);
      });

      this.socket.on('auth:error', (data) => {
        console.error('Chat auth error:', data);
        this.notifyError(data);
      });

      // Session events
      this.socket.on('session:started', (data: ChatSession) => {
        console.log('Chat session started:', data);
        this.currentSession = data;
        this.notifySession(data);
      });

      this.socket.on('session:ended', (data) => {
        console.log('Chat session ended:', data);
        this.currentSession = null;
        this.notifySession(null);
      });

      this.socket.on('session:error', (data) => {
        console.error('Session error:', data);
        this.notifyError(data);
      });

      // Message events
      this.socket.on('message:received', (message: ChatMessage) => {
        console.log('Message received:', message);
        this.notifyMessage(message);
      });

      this.socket.on('message:typing', (data) => {
        this.notifyTyping(data);
      });

      this.socket.on('message:error', (data) => {
        console.error('Message error:', data);
        this.notifyError(data);
      });

      // Intent events
      this.socket.on('intent:detected', (intent: IntentDetection) => {
        console.log('Intent detected:', intent);
        this.notifyIntent(intent);
      });

      // History events - use dedicated callback instead of message callback
      this.socket.on('messages:history', (data) => {
        console.log('History received:', data);
        this.notifyHistory({
          sessionId: data.sessionId,
          conversationId: data.conversationId,
          messages: data.messages || [],
        });
      });

      this.socket.on('messages:error', (data) => {
        console.error('History error:', data);
        this.notifyError(data);
      });

      // Conversation update events (e.g., title change)
      this.socket.on('conversation:updated', (update: ConversationUpdate) => {
        console.log('Conversation updated:', update);
        this.notifyConversationUpdate(update);
      });

      // Streaming events for real-time token delivery (ChatGPT-like experience)
      this.socket.on('message:stream:start', (data: StreamStart) => {
        console.log('Stream started:', data.messageId);
        this.notifyStreamStart(data);
      });

      this.socket.on('message:stream:chunk', (data: StreamChunk) => {
        // Don't log every chunk (too noisy), just notify
        this.notifyStreamChunk(data);
      });

      this.socket.on('message:stream:end', (data: StreamEnd) => {
        console.log('Stream ended:', data.messageId);
        this.notifyStreamEnd(data);
      });

      // App Builder events - for real-time progress during generation/deployment
      this.socket.on('app-builder:started', (data: AppBuilderEvent) => {
        console.log('🚀 App Builder started:', data);
        // Persist pending build state for recovery on reconnect
        this.savePendingAppBuild({
          sessionId: data.sessionId,
          appName: data.appName,
          appType: data.appType,
          startedAt: data.timestamp,
        });
        this.notifyAppBuilder('started', data);
      });

      this.socket.on('app-builder:progress', (data: AppBuilderEvent) => {
        console.log('⏳ App Builder progress:', data.step, data.message);
        this.notifyAppBuilder('progress', data);
      });

      this.socket.on('app-builder:completed', (data: AppBuilderEvent) => {
        console.log('✅ App Builder completed:', data);
        // Clear pending build state - build is done
        this.savePendingAppBuild(null);
        this.notifyAppBuilder('completed', data);
      });

      this.socket.on('app-builder:error', (data: AppBuilderEvent) => {
        console.error('❌ App Builder error:', data);
        // Clear pending build state - build failed
        this.savePendingAppBuild(null);
        this.notifyAppBuilder('error', data);
      });

      // Listen for credit updates after messages
      this.socket.on('credits:updated', (data: { balance: number; balanceFormatted: string }) => {
        console.log('💰 Credits updated:', data.balanceFormatted);
        // Dispatch a custom event that any component can listen to
        window.dispatchEvent(new CustomEvent('credits:updated', { detail: data }));
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentSession = null;
    this.setConnectionState('disconnected');
  }

  startSession(conversationId?: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot start session');
      return;
    }
    console.log('Starting chat session...');
    this.socket.emit('session:start', { conversationId });
  }

  endSession(): void {
    if (!this.socket?.connected || !this.currentSession) {
      return;
    }
    this.socket.emit('session:end', { sessionId: this.currentSession.sessionId });
  }

  sendMessage(message: string, metadata?: any): void {
    console.log('📤 [chatService.sendMessage] Called with:', {
      messagePreview: message?.substring(0, 50),
      hasMetadata: !!metadata,
      socketConnected: this.socket?.connected,
      hasSession: !!this.currentSession,
      sessionId: this.currentSession?.sessionId
    });

    if (!this.socket?.connected) {
      console.error('❌ [chatService.sendMessage] Socket not connected, cannot send message');
      return;
    }

    if (!this.currentSession) {
      console.warn('⏳ [chatService.sendMessage] No active session, starting one first...');
      // Auto-start session then send message
      this.socket.once('session:started', (session) => {
        console.log('✅ [chatService.sendMessage] Session started after wait:', session?.sessionId);
        this.doSendMessage(message, metadata);
      });
      this.startSession();
      return;
    }

    this.doSendMessage(message, metadata);
  }

  private doSendMessage(message: string, metadata?: any, skipUserMessage?: boolean): void {
    if (!this.currentSession) {
      console.error('❌ [doSendMessage] No session - cannot send');
      return;
    }

    console.log('🚀 [doSendMessage] Emitting message:send', {
      sessionId: this.currentSession.sessionId,
      messagePreview: message?.substring(0, 50),
      skipUserMessage,
    });
    this.socket?.emit('message:send', {
      sessionId: this.currentSession.sessionId,
      message,
      metadata,
      skipUserMessage,
    });
  }

  /**
   * Send a message and regenerate AI response without creating a new user message
   * Used when editing an existing message
   */
  sendMessageForRegeneration(message: string, metadata?: any): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot send message');
      return;
    }

    if (!this.currentSession) {
      console.warn('No active session for regeneration');
      return;
    }

    this.doSendMessage(message, metadata, true);
  }

  sendTyping(isTyping: boolean): void {
    if (!this.socket?.connected || !this.currentSession) return;

    this.socket.emit('message:typing', {
      sessionId: this.currentSession.sessionId,
      isTyping,
    });
  }

  loadHistory(conversationId?: string, limit?: number): void {
    if (!this.socket?.connected || !this.currentSession) return;

    this.socket.emit('messages:history', {
      sessionId: this.currentSession.sessionId,
      conversationId,
      limit,
    });
  }

  // Subscribe methods
  onMessage(callback: (message: ChatMessage) => void): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  onHistory(callback: (data: HistoryData) => void): () => void {
    this.historyCallbacks.push(callback);
    return () => {
      this.historyCallbacks = this.historyCallbacks.filter(cb => cb !== callback);
    };
  }

  onTyping(callback: (data: { sessionId: string; sender: string; isTyping: boolean }) => void): () => void {
    this.typingCallbacks.push(callback);
    return () => {
      this.typingCallbacks = this.typingCallbacks.filter(cb => cb !== callback);
    };
  }

  onIntent(callback: (intent: IntentDetection) => void): () => void {
    this.intentCallbacks.push(callback);
    return () => {
      this.intentCallbacks = this.intentCallbacks.filter(cb => cb !== callback);
    };
  }

  onSession(callback: (session: ChatSession | null) => void): () => void {
    this.sessionCallbacks.push(callback);
    return () => {
      this.sessionCallbacks = this.sessionCallbacks.filter(cb => cb !== callback);
    };
  }

  onConnectionChange(callback: (state: ConnectionState) => void): () => void {
    this.connectionCallbacks.push(callback);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
    };
  }

  onError(callback: (error: { message: string }) => void): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    };
  }

  onConversationUpdate(callback: (update: ConversationUpdate) => void): () => void {
    this.conversationUpdateCallbacks.push(callback);
    return () => {
      this.conversationUpdateCallbacks = this.conversationUpdateCallbacks.filter(cb => cb !== callback);
    };
  }

  // Streaming subscription methods for ChatGPT-like experience
  onStreamStart(callback: (data: StreamStart) => void): () => void {
    this.streamStartCallbacks.push(callback);
    return () => {
      this.streamStartCallbacks = this.streamStartCallbacks.filter(cb => cb !== callback);
    };
  }

  onStreamChunk(callback: (data: StreamChunk) => void): () => void {
    this.streamChunkCallbacks.push(callback);
    return () => {
      this.streamChunkCallbacks = this.streamChunkCallbacks.filter(cb => cb !== callback);
    };
  }

  onStreamEnd(callback: (data: StreamEnd) => void): () => void {
    this.streamEndCallbacks.push(callback);
    return () => {
      this.streamEndCallbacks = this.streamEndCallbacks.filter(cb => cb !== callback);
    };
  }

  // App Builder subscription for generation/deployment progress
  onAppBuilder(callback: (type: AppBuilderEventType, data: AppBuilderEvent) => void): () => void {
    this.appBuilderCallbacks.push(callback);
    return () => {
      this.appBuilderCallbacks = this.appBuilderCallbacks.filter(cb => cb !== callback);
    };
  }

  // Notify methods
  private notifyMessage(message: ChatMessage): void {
    this.messageCallbacks.forEach(cb => cb(message));
  }

  private notifyHistory(data: HistoryData): void {
    this.historyCallbacks.forEach(cb => cb(data));
  }

  private notifyTyping(data: { sessionId: string; sender: string; isTyping: boolean }): void {
    this.typingCallbacks.forEach(cb => cb(data));
  }

  private notifyIntent(intent: IntentDetection): void {
    this.intentCallbacks.forEach(cb => cb(intent));
  }

  private notifySession(session: ChatSession | null): void {
    this.sessionCallbacks.forEach(cb => cb(session));
  }

  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    this.connectionCallbacks.forEach(cb => cb(state));
  }

  private notifyError(error: { message: string }): void {
    this.errorCallbacks.forEach(cb => cb(error));
  }

  private notifyConversationUpdate(update: ConversationUpdate): void {
    this.conversationUpdateCallbacks.forEach(cb => cb(update));
  }

  // Streaming notify methods
  private notifyStreamStart(data: StreamStart): void {
    this.streamStartCallbacks.forEach(cb => cb(data));
  }

  private notifyStreamChunk(data: StreamChunk): void {
    this.streamChunkCallbacks.forEach(cb => cb(data));
  }

  private notifyStreamEnd(data: StreamEnd): void {
    this.streamEndCallbacks.forEach(cb => cb(data));
  }

  private notifyAppBuilder(type: AppBuilderEventType, data: AppBuilderEvent): void {
    this.appBuilderCallbacks.forEach(cb => cb(type, data));
  }

  // Getters
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  getCurrentSession(): ChatSession | null {
    return this.currentSession;
  }

  /**
   * Get the socket instance for direct event handling
   * Used for code modification and other features that need direct socket access
   */
  getSocket(): typeof this.socket {
    return this.socket;
  }
}

export const chatService = new ChatService();
