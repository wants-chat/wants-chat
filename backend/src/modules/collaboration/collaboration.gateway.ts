import {
  WebSocketGateway,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { AuthenticatedSocket } from '../../common/gateways/app.gateway';
import { CollaborationService } from './collaboration.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/collab',
  transports: ['websocket', 'polling'],
})
export class CollaborationGateway {
  private readonly logger = new Logger(CollaborationGateway.name);

  constructor(private readonly collaborationService: CollaborationService) {}

  @SubscribeMessage('collab:join')
  async handleCollabJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    if (!client.userId) return;

    try {
      const room = `collab:${data.sessionId}`;
      await client.join(room);

      // Notify the room
      client.to(room).emit('collab:participants', {
        action: 'connected',
        userId: client.userId,
        sessionId: data.sessionId,
        timestamp: new Date().toISOString(),
      });

      // Send current state to the joining user
      const state = await this.collaborationService.getSessionState(data.sessionId);
      client.emit('collab:state-update', {
        sessionId: data.sessionId,
        userId: 'system',
        stateUpdate: state,
        type: 'full_state',
        timestamp: new Date().toISOString(),
      });

      // Send participant list
      const participants = await this.collaborationService.getSessionParticipants(data.sessionId);
      client.emit('collab:participants', {
        action: 'list',
        participants,
        sessionId: data.sessionId,
        timestamp: new Date().toISOString(),
      });

      this.logger.debug(`User ${client.userId} joined collab room: ${room}`);
    } catch (error) {
      client.emit('error', {
        message: 'Failed to join collaboration session',
        code: 'COLLAB_JOIN_ERROR',
      });
      this.logger.error(`collab:join error: ${error.message}`);
    }
  }

  @SubscribeMessage('collab:leave')
  async handleCollabLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    if (!client.userId) return;

    try {
      const room = `collab:${data.sessionId}`;
      await client.leave(room);

      client.to(room).emit('collab:participants', {
        action: 'disconnected',
        userId: client.userId,
        sessionId: data.sessionId,
        timestamp: new Date().toISOString(),
      });

      this.logger.debug(`User ${client.userId} left collab room: ${room}`);
    } catch (error) {
      this.logger.error(`collab:leave error: ${error.message}`);
    }
  }

  @SubscribeMessage('collab:state-update')
  async handleStateUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string; stateUpdate: Record<string, any> },
  ) {
    if (!client.userId) return;

    try {
      await this.collaborationService.broadcastState(
        data.sessionId,
        client.userId,
        data.stateUpdate,
      );
    } catch (error) {
      client.emit('error', {
        message: 'Failed to update state',
        code: 'COLLAB_STATE_ERROR',
      });
      this.logger.error(`collab:state-update error: ${error.message}`);
    }
  }

  @SubscribeMessage('collab:cursor-move')
  async handleCursorMove(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string; cursor: { x: number; y: number; element?: string } },
  ) {
    if (!client.userId) return;

    // Broadcast cursor position to all other participants (no persistence needed)
    const room = `collab:${data.sessionId}`;
    client.to(room).emit('collab:cursor-move', {
      userId: client.userId,
      cursor: data.cursor,
      sessionId: data.sessionId,
      timestamp: new Date().toISOString(),
    });
  }
}
