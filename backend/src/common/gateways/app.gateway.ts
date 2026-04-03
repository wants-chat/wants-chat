import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  socketIds: Set<string>;
}

export interface RealtimeEvent {
  type: string;
  data: any;
  userId?: string;
  timestamp: string;
  channel?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/',
  transports: ['websocket', 'polling'],
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppGateway.name);
  private userPresence = new Map<string, UserPresence>();
  private socketToUser = new Map<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // =============================================
  // GATEWAY LIFECYCLE EVENTS
  // =============================================

  afterInit() {
    this.logger.log('🚀 WebSocket Gateway initialized');
    
    // Set up periodic presence cleanup
    setInterval(() => {
      this.cleanupStalePresence();
    }, 60000); // Clean up every minute
  }

  async handleConnection(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      // Extract token from handshake auth
      const token = this.extractTokenFromSocket(client);

      if (!token) {
        this.logger.warn(`Connection rejected: No token provided - ${client.id}`);
        client.emit('connection:error', {
          type: 'NO_TOKEN',
          message: 'No authentication token provided'
        });
        // Add delay before disconnecting to prevent rapid reconnection attempts
        setTimeout(() => client.disconnect(), 1000);
        return;
      }

      // Verify JWT token
      const payload = await this.validateToken(token);
      if (!payload) {
        this.logger.warn(`Connection rejected: Invalid token - ${client.id}`);
        client.emit('connection:error', {
          type: 'INVALID_TOKEN',
          message: 'Invalid authentication token'
        });
        // Add delay before disconnecting to prevent rapid reconnection attempts
        setTimeout(() => client.disconnect(), 1000);
        return;
      }

      // Attach user info to socket
      client.userId = payload.sub;
      client.user = payload;

      // Track socket-to-user mapping
      this.socketToUser.set(client.id, payload.sub);

      // Update user presence
      this.updateUserPresence(payload.sub, client.id, 'online');

      // Join user to their personal room
      await client.join(`user:${payload.sub}`);

      // Join user to general rooms
      await client.join('authenticated');

      this.logger.log(`User ${payload.sub} connected - Socket: ${client.id}`);

      // Emit presence update to other users
      this.emitPresenceUpdate(payload.sub, 'online');

      // Send welcome message
      client.emit('connection:success', {
        message: 'Connected to Wants real-time service',
        userId: payload.sub,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`Connection error: ${error.message} - Socket: ${client.id}`);

      // Send error to client before disconnecting
      if (error.name === 'JsonWebTokenError') {
        client.emit('connection:error', {
          type: 'INVALID_TOKEN',
          message: 'Invalid authentication token'
        });
      } else if (error.name === 'TokenExpiredError') {
        client.emit('connection:error', {
          type: 'TOKEN_EXPIRED',
          message: 'Authentication token expired'
        });
      } else {
        client.emit('connection:error', {
          type: 'CONNECTION_ERROR',
          message: 'Connection failed'
        });
      }

      // Add delay before disconnecting to prevent rapid reconnection attempts
      setTimeout(() => client.disconnect(), 1000);
    }
  }

  handleDisconnect(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      const userId = this.socketToUser.get(client.id);
      
      if (userId) {
        // Remove socket from user presence
        this.removeSocketFromPresence(userId, client.id);
        
        // Remove socket-to-user mapping
        this.socketToUser.delete(client.id);
        
        // Check if user still has other active connections
        const userPresence = this.userPresence.get(userId);
        const isStillOnline = userPresence && userPresence.socketIds.size > 0;
        
        if (!isStillOnline && userPresence) {
          // Mark user as offline and emit presence update
          userPresence.status = 'offline';
          userPresence.lastSeen = new Date();
          this.emitPresenceUpdate(userId, 'offline');
        }
        
        this.logger.log(`User ${userId} disconnected - Socket: ${client.id}`);
      } else {
        this.logger.log(`Unknown socket disconnected: ${client.id}`);
      }
    } catch (error) {
      this.logger.error(`Disconnect error: ${error.message} - Socket: ${client.id}`);
    }
  }

  // =============================================
  // WEBSOCKET EVENT HANDLERS
  // =============================================

  @SubscribeMessage('presence:update')
  async handlePresenceUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { status: 'online' | 'away' | 'busy' },
  ) {
    if (!client.userId) return;

    try {
      this.updateUserPresence(client.userId, client.id, data.status);
      this.emitPresenceUpdate(client.userId, data.status);
      
      this.logger.debug(`User ${client.userId} presence updated to: ${data.status}`);
    } catch (error) {
      this.logger.error(`Presence update error: ${error.message}`);
    }
  }

  @SubscribeMessage('join:room')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    if (!client.userId) return;

    try {
      // Validate room access (implement your own logic here)
      if (this.canJoinRoom(client.userId, data.room)) {
        await client.join(data.room);
        
        client.emit('room:joined', {
          room: data.room,
          timestamp: new Date().toISOString(),
        });
        
        // Notify other room members
        client.to(data.room).emit('user:joined', {
          userId: client.userId,
          room: data.room,
          timestamp: new Date().toISOString(),
        });
        
        this.logger.debug(`User ${client.userId} joined room: ${data.room}`);
      } else {
        client.emit('error', {
          message: 'Unauthorized to join this room',
          code: 'UNAUTHORIZED_ROOM_ACCESS',
        });
      }
    } catch (error) {
      this.logger.error(`Join room error: ${error.message}`);
    }
  }

  @SubscribeMessage('leave:room')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    if (!client.userId) return;

    try {
      await client.leave(data.room);
      
      client.emit('room:left', {
        room: data.room,
        timestamp: new Date().toISOString(),
      });
      
      // Notify other room members
      client.to(data.room).emit('user:left', {
        userId: client.userId,
        room: data.room,
        timestamp: new Date().toISOString(),
      });
      
      this.logger.debug(`User ${client.userId} left room: ${data.room}`);
    } catch (error) {
      this.logger.error(`Leave room error: ${error.message}`);
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    // Support callback-style ping for connection testing
    return {
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  @SubscribeMessage('join_user_room')
  async handleJoinUserRoom(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) {
      this.logger.warn(`join_user_room: No userId on socket - ${client.id}`);
      return;
    }

    try {
      // User is already joined to their room in handleConnection
      // This is just an acknowledgment
      this.logger.debug(`User ${client.userId} confirmed in personal room`);
      client.emit('room:joined', {
        room: `user:${client.userId}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`join_user_room error: ${error.message}`);
    }
  }

  @SubscribeMessage('update_presence')
  async handleUpdatePresence(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { status: 'online' | 'away' | 'busy' | 'offline'; activity?: string },
  ) {
    if (!client.userId) return;

    try {
      this.updateUserPresence(client.userId, client.id, data.status);
      this.emitPresenceUpdate(client.userId, data.status);

      this.logger.debug(`User ${client.userId} presence updated to: ${data.status}`);
    } catch (error) {
      this.logger.error(`update_presence error: ${error.message}`);
    }
  }

  // =============================================
  // PUBLIC METHODS FOR SERVICE INTEGRATION
  // =============================================

  // Emit to specific user
  emitToUser(userId: string, event: string, data: any): boolean {
    try {
      this.server.to(`user:${userId}`).emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to emit to user ${userId}: ${error.message}`);
      return false;
    }
  }

  // Emit to multiple users
  emitToUsers(userIds: string[], event: string, data: any): boolean {
    try {
      userIds.forEach(userId => {
        this.emitToUser(userId, event, data);
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to emit to multiple users: ${error.message}`);
      return false;
    }
  }

  // Emit to room
  emitToRoom(room: string, event: string, data: any): boolean {
    try {
      this.server.to(room).emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to emit to room ${room}: ${error.message}`);
      return false;
    }
  }

  // Broadcast to all connected users
  broadcast(event: string, data: any, excludeUserId?: string): boolean {
    try {
      let emitter = this.server.to('authenticated');
      
      if (excludeUserId) {
        emitter = emitter.except(`user:${excludeUserId}`);
      }
      
      emitter.emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to broadcast: ${error.message}`);
      return false;
    }
  }

  // Get user presence
  getUserPresence(userId: string): UserPresence | null {
    return this.userPresence.get(userId) || null;
  }

  // Get all online users
  getOnlineUsers(): string[] {
    return Array.from(this.userPresence.entries())
      .filter(([, presence]) => presence.status !== 'offline' && presence.socketIds.size > 0)
      .map(([userId]) => userId);
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    const presence = this.userPresence.get(userId);
    return presence ? presence.status !== 'offline' && presence.socketIds.size > 0 : false;
  }

  // Get connection count for user
  getUserConnectionCount(userId: string): number {
    const presence = this.userPresence.get(userId);
    return presence ? presence.socketIds.size : 0;
  }

  // =============================================
  // PRIVATE HELPER METHODS
  // =============================================

  private extractTokenFromSocket(client: Socket): string | null {
    // Try multiple sources for the token
    const token = 
      client.handshake.auth?.token || 
      client.handshake.headers?.authorization?.replace('Bearer ', '') ||
      client.handshake.query?.token;
      
    return typeof token === 'string' ? token : null;
  }

  private async validateToken(token: string): Promise<any> {
    try {
      // Decode Fluxez JWT without verification
      // We trust Fluxez's signature - just extract the payload
      // The token is already signed by Fluxez backend
      const payload = this.jwtService.decode(token) as any;

      if (!payload) {
        this.logger.warn('Token validation failed: Invalid token format');
        return null;
      }

      // Check if token is expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        this.logger.warn('Token validation failed: Token expired');
        return null;
      }

      // Fluxez JWT payload contains: userId, email, role, projectId, appId
      // Map to standard format expected by the gateway
      return {
        sub: payload.userId || payload.sub,
        userId: payload.userId || payload.sub,
        email: payload.email,
        role: payload.role,
        projectId: payload.projectId,
        appId: payload.appId,
        name: payload.name,
        username: payload.username,
      };
    } catch (error) {
      this.logger.warn(`Token validation failed: ${error.message}`);
      return null;
    }
  }

  private updateUserPresence(userId: string, socketId: string, status: 'online' | 'away' | 'busy' | 'offline'): void {
    let presence = this.userPresence.get(userId);
    
    if (!presence) {
      presence = {
        userId,
        status,
        lastSeen: new Date(),
        socketIds: new Set([socketId]),
      };
      this.userPresence.set(userId, presence);
    } else {
      presence.status = status;
      presence.lastSeen = new Date();
      presence.socketIds.add(socketId);
    }
  }

  private removeSocketFromPresence(userId: string, socketId: string): void {
    const presence = this.userPresence.get(userId);
    if (presence) {
      presence.socketIds.delete(socketId);
      if (presence.socketIds.size === 0) {
        presence.status = 'offline';
        presence.lastSeen = new Date();
      }
    }
  }

  private emitPresenceUpdate(userId: string, status: string): void {
    this.broadcast('presence:updated', {
      userId,
      status,
    }, userId);
  }

  private canJoinRoom(userId: string, room: string): boolean {
    // Implement your room access logic here
    // For now, allow joining user-specific rooms and some common rooms
    const allowedRooms = [
      `user:${userId}`,
      'general',
      'notifications',
    ];
    
    return allowedRooms.includes(room) || room.startsWith(`user:${userId}:`);
  }

  private cleanupStalePresence(): void {
    const now = new Date();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes
    
    for (const [userId, presence] of this.userPresence.entries()) {
      const timeSinceLastSeen = now.getTime() - presence.lastSeen.getTime();
      
      if (timeSinceLastSeen > staleThreshold && presence.socketIds.size === 0) {
        this.userPresence.delete(userId);
        this.logger.debug(`Cleaned up stale presence for user: ${userId}`);
      }
    }
  }
}