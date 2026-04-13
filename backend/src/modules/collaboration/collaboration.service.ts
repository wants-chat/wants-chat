import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  OnModuleInit,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AppGateway } from '../../common/gateways/app.gateway';
import * as crypto from 'crypto';

// ── Interfaces ──────────────────────────────────────────────

export interface CollabSession {
  id: string;
  creatorId: string;
  toolId: string;
  sessionCode: string;
  conversationId: string | null;
  state: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
}

export interface CollabParticipant {
  id: string;
  sessionId: string;
  userId: string;
  joinedAt: Date;
  leftAt: Date | null;
}

export interface CreateSessionDto {
  toolId: string;
  conversationId?: string;
}

export interface JoinSessionDto {
  sessionCode: string;
}

export interface StateUpdateDto {
  sessionId: string;
  stateUpdate: Record<string, any>;
}

// ── Service ─────────────────────────────────────────────────

@Injectable()
export class CollaborationService implements OnModuleInit {
  private readonly logger = new Logger(CollaborationService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly gateway: AppGateway,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS collab_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          creator_id VARCHAR(255) NOT NULL,
          tool_id VARCHAR(255) NOT NULL,
          session_code VARCHAR(6) NOT NULL UNIQUE,
          conversation_id UUID,
          state JSONB DEFAULT '{}',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      await this.db.query(`
        CREATE INDEX IF NOT EXISTS idx_collab_sessions_code
        ON collab_sessions(session_code)
      `);

      await this.db.query(`
        CREATE INDEX IF NOT EXISTS idx_collab_sessions_creator
        ON collab_sessions(creator_id)
      `);

      await this.db.query(`
        CREATE TABLE IF NOT EXISTS collab_participants (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id UUID NOT NULL REFERENCES collab_sessions(id) ON DELETE CASCADE,
          user_id VARCHAR(255) NOT NULL,
          joined_at TIMESTAMPTZ DEFAULT NOW(),
          left_at TIMESTAMPTZ
        )
      `);

      await this.db.query(`
        CREATE INDEX IF NOT EXISTS idx_collab_participants_session
        ON collab_participants(session_id)
      `);

      await this.db.query(`
        CREATE INDEX IF NOT EXISTS idx_collab_participants_user
        ON collab_participants(user_id)
      `);

      this.logger.log('Collaboration tables ready');
    } catch (error) {
      this.logger.warn(`Failed to ensure collaboration tables: ${error.message}`);
    }
  }

  // ── Session Management ──────────────────────────────────

  async createSession(userId: string, dto: CreateSessionDto): Promise<CollabSession> {
    const sessionCode = this.generateSessionCode();

    const session = await this.db.insert<any>('collab_sessions', {
      creator_id: userId,
      tool_id: dto.toolId,
      session_code: sessionCode,
      conversation_id: dto.conversationId || null,
      state: JSON.stringify({}),
      is_active: true,
      created_at: new Date(),
    });

    // Automatically add creator as a participant
    await this.db.insert('collab_participants', {
      session_id: session.id,
      user_id: userId,
      joined_at: new Date(),
    });

    this.logger.log(`Collaboration session created: ${session.id} (code: ${sessionCode})`);
    return this.mapSession(session);
  }

  async joinSession(userId: string, dto: JoinSessionDto): Promise<CollabSession> {
    const session = await this.db.findOne<any>('collab_sessions', {
      session_code: dto.sessionCode.toUpperCase(),
    });

    if (!session) {
      throw new NotFoundException('Session not found. Check the code and try again.');
    }

    if (!session.is_active) {
      throw new BadRequestException('This session is no longer active');
    }

    // Check if user is already a participant
    const existing = await this.db.findOne<any>('collab_participants', {
      session_id: session.id,
      user_id: userId,
    });

    if (existing && !existing.left_at) {
      // Already in the session, just return it
      return this.mapSession(session);
    }

    if (existing && existing.left_at) {
      // Rejoin: clear left_at
      await this.db.update('collab_participants', { id: existing.id }, {
        left_at: null,
        joined_at: new Date(),
      });
    } else {
      // New participant
      await this.db.insert('collab_participants', {
        session_id: session.id,
        user_id: userId,
        joined_at: new Date(),
      });
    }

    // Notify other participants via WebSocket
    this.gateway.emitToRoom(`collab:${session.id}`, 'collab:participants', {
      action: 'joined',
      userId,
      sessionId: session.id,
    });

    this.logger.log(`User ${userId} joined session ${session.id}`);
    return this.mapSession(session);
  }

  async leaveSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.db.findOne<any>('collab_sessions', { id: sessionId });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const participant = await this.db.findOne<any>('collab_participants', {
      session_id: sessionId,
      user_id: userId,
    });

    if (!participant || participant.left_at) {
      throw new BadRequestException('You are not in this session');
    }

    await this.db.update('collab_participants', { id: participant.id }, {
      left_at: new Date(),
    });

    // Notify other participants
    this.gateway.emitToRoom(`collab:${sessionId}`, 'collab:participants', {
      action: 'left',
      userId,
      sessionId,
    });

    // If creator leaves, deactivate the session
    if (session.creator_id === userId) {
      await this.db.update('collab_sessions', { id: sessionId }, { is_active: false });
      this.gateway.emitToRoom(`collab:${sessionId}`, 'collab:state-update', {
        type: 'session_ended',
        sessionId,
      });
    }

    this.logger.log(`User ${userId} left session ${sessionId}`);
  }

  async getSessionParticipants(sessionId: string): Promise<CollabParticipant[]> {
    const rows = await this.db.findMany<any>('collab_participants', {
      session_id: sessionId,
    }, { orderBy: 'joined_at', order: 'ASC' });

    // Filter to only active participants (no left_at)
    return rows
      .filter((r: any) => !r.left_at)
      .map((r: any) => this.mapParticipant(r));
  }

  async getSession(sessionId: string, userId: string): Promise<{
    session: CollabSession;
    participants: CollabParticipant[];
  }> {
    const session = await this.db.findOne<any>('collab_sessions', { id: sessionId });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Verify user is a participant
    const participant = await this.db.findOne<any>('collab_participants', {
      session_id: sessionId,
      user_id: userId,
    });

    if (!participant || participant.left_at) {
      throw new ForbiddenException('You are not a participant in this session');
    }

    const participants = await this.getSessionParticipants(sessionId);

    return {
      session: this.mapSession(session),
      participants,
    };
  }

  // ── State Management ────────────────────────────────────

  async broadcastState(
    sessionId: string,
    userId: string,
    stateUpdate: Record<string, any>,
  ): Promise<void> {
    const session = await this.db.findOne<any>('collab_sessions', { id: sessionId });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (!session.is_active) {
      throw new BadRequestException('Session is no longer active');
    }

    // Merge state update into session state
    const currentState = typeof session.state === 'string' ? JSON.parse(session.state) : (session.state || {});
    const mergedState = { ...currentState, ...stateUpdate };

    await this.db.update('collab_sessions', { id: sessionId }, {
      state: JSON.stringify(mergedState),
    });

    // Broadcast to all participants in the room
    this.gateway.emitToRoom(`collab:${sessionId}`, 'collab:state-update', {
      sessionId,
      userId,
      stateUpdate,
      timestamp: new Date().toISOString(),
    });
  }

  async getSessionState(sessionId: string): Promise<Record<string, any>> {
    const session = await this.db.findOne<any>('collab_sessions', { id: sessionId });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return typeof session.state === 'string' ? JSON.parse(session.state) : (session.state || {});
  }

  // ── Private Helpers ─────────────────────────────────────

  private generateSessionCode(): string {
    return crypto.randomBytes(3).toString('hex').toUpperCase().substring(0, 6);
  }

  private mapSession(row: any): CollabSession {
    return {
      id: row.id,
      creatorId: row.creator_id,
      toolId: row.tool_id,
      sessionCode: row.session_code,
      conversationId: row.conversation_id || null,
      state: typeof row.state === 'string' ? JSON.parse(row.state) : (row.state || {}),
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
    };
  }

  private mapParticipant(row: any): CollabParticipant {
    return {
      id: row.id,
      sessionId: row.session_id,
      userId: row.user_id,
      joinedAt: new Date(row.joined_at),
      leftAt: row.left_at ? new Date(row.left_at) : null,
    };
  }
}
