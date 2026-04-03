import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ResearchProgressEvent,
  ResearchCompleteEvent,
  ResearchSession,
} from './interfaces/research.interface';

// ============================================
// Authenticated Socket Interface
// ============================================

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

// ============================================
// Research WebSocket Gateway
// ============================================

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/research',
  transports: ['websocket', 'polling'],
})
export class ResearchGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ResearchGateway.name);
  private userSockets = new Map<string, Set<string>>(); // userId -> socketIds

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ============================================
  // Lifecycle Hooks
  // ============================================

  afterInit() {
    this.logger.log('Research WebSocket Gateway initialized');
  }

  async handleConnection(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      const token = this.extractToken(client);

      if (!token) {
        this.logger.warn(`Research WS: Connection rejected - no token - ${client.id}`);
        client.emit('research:error', { type: 'NO_TOKEN', message: 'Authentication required' });
        setTimeout(() => client.disconnect(), 1000);
        return;
      }

      const payload = this.validateToken(token);
      if (!payload) {
        this.logger.warn(`Research WS: Connection rejected - invalid token - ${client.id}`);
        client.emit('research:error', { type: 'INVALID_TOKEN', message: 'Invalid token' });
        setTimeout(() => client.disconnect(), 1000);
        return;
      }

      // Attach user info
      client.userId = payload.sub || payload.userId;
      client.user = payload;

      // Track socket
      this.trackSocket(client.userId, client.id);

      // Join user room
      await client.join(`research:user:${client.userId}`);

      this.logger.log(`Research WS: User ${client.userId} connected - Socket: ${client.id}`);

      client.emit('research:connected', {
        message: 'Connected to research service',
        userId: client.userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      this.logger.error(`Research WS: Connection error - ${error.message}`);
      client.emit('research:error', { type: 'CONNECTION_ERROR', message: 'Connection failed' });
      setTimeout(() => client.disconnect(), 1000);
    }
  }

  handleDisconnect(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.userId) {
      this.untrackSocket(client.userId, client.id);
      this.logger.log(`Research WS: User ${client.userId} disconnected - Socket: ${client.id}`);
    }
  }

  // ============================================
  // WebSocket Event Handlers
  // ============================================

  @SubscribeMessage('research:subscribe')
  async handleSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    if (!client.userId) {
      return { success: false, message: 'Not authenticated' };
    }

    try {
      // Join session room for updates
      await client.join(`research:session:${data.sessionId}`);

      this.logger.debug(`User ${client.userId} subscribed to session ${data.sessionId}`);

      return {
        success: true,
        message: `Subscribed to session ${data.sessionId}`,
      };
    } catch (error: any) {
      this.logger.error(`Failed to subscribe to session: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('research:unsubscribe')
  async handleUnsubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    if (!client.userId) {
      return { success: false, message: 'Not authenticated' };
    }

    try {
      await client.leave(`research:session:${data.sessionId}`);

      this.logger.debug(`User ${client.userId} unsubscribed from session ${data.sessionId}`);

      return {
        success: true,
        message: `Unsubscribed from session ${data.sessionId}`,
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('research:ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    return {
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================
  // Public Methods for Service Integration
  // ============================================

  /**
   * Emit research progress to user
   */
  emitProgress(userId: string, event: ResearchProgressEvent): void {
    try {
      // Emit to user's room
      this.server.to(`research:user:${userId}`).emit('research:progress', event);

      // Emit to session subscribers
      this.server.to(`research:session:${event.sessionId}`).emit('research:progress', event);

      this.logger.debug(
        `Research progress emitted: session=${event.sessionId}, status=${event.status}, progress=${event.progress}%`,
      );
    } catch (error: any) {
      this.logger.error(`Failed to emit progress: ${error.message}`);
    }
  }

  /**
   * Emit research completion to user
   */
  emitComplete(userId: string, event: ResearchCompleteEvent): void {
    try {
      // Emit to user's room
      this.server.to(`research:user:${userId}`).emit('research:complete', event);

      // Emit to session subscribers
      this.server.to(`research:session:${event.sessionId}`).emit('research:complete', event);

      this.logger.log(
        `Research complete emitted: session=${event.sessionId}, status=${event.status}`,
      );
    } catch (error: any) {
      this.logger.error(`Failed to emit complete: ${error.message}`);
    }
  }

  /**
   * Emit error to user
   */
  emitError(userId: string, sessionId: string, error: string): void {
    try {
      this.server.to(`research:user:${userId}`).emit('research:error', {
        sessionId,
        error,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      this.logger.error(`Failed to emit error: ${err.message}`);
    }
  }

  /**
   * Emit a step update during research
   */
  emitStepUpdate(
    userId: string,
    sessionId: string,
    step: string,
    details?: Record<string, any>,
  ): void {
    try {
      this.server.to(`research:user:${userId}`).emit('research:step', {
        sessionId,
        step,
        details,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      this.logger.error(`Failed to emit step update: ${error.message}`);
    }
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    const sockets = this.userSockets.get(userId);
    return sockets ? sockets.size > 0 : false;
  }

  /**
   * Get connected user count
   */
  getConnectedUserCount(): number {
    return this.userSockets.size;
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private extractToken(client: Socket): string | null {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '') ||
      (client.handshake.query?.token as string);

    return typeof token === 'string' ? token : null;
  }

  private validateToken(token: string): any {
    try {
      const payload = this.jwtService.decode(token) as any;

      if (!payload) {
        return null;
      }

      // Check expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return null;
      }

      return {
        sub: payload.userId || payload.sub,
        userId: payload.userId || payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      return null;
    }
  }

  private trackSocket(userId: string, socketId: string): void {
    let sockets = this.userSockets.get(userId);
    if (!sockets) {
      sockets = new Set();
      this.userSockets.set(userId, sockets);
    }
    sockets.add(socketId);
  }

  private untrackSocket(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }
}
