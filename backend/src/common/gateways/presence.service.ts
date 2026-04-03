import { Injectable, Logger } from '@nestjs/common';
import { AppGateway, UserPresence } from './app.gateway';

export interface PresenceStatus {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  connectionCount: number;
  devices: {
    web?: Date;
    mobile?: Date;
    desktop?: Date;
  };
}

export interface ActivitySession {
  userId: string;
  sessionId: string;
  startTime: Date;
  lastActivity: Date;
  deviceType: 'web' | 'mobile' | 'desktop';
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);
  private activitySessions = new Map<string, ActivitySession>();
  private userActivityTimers = new Map<string, NodeJS.Timeout>();

  constructor(private readonly socketGateway: AppGateway) {
    // Set up periodic cleanup for inactive sessions
    setInterval(() => {
      this.cleanupInactiveSessions();
    }, 60000); // Every minute
  }

  // =============================================
  // USER PRESENCE MANAGEMENT
  // =============================================

  /**
   * Get current presence status for a user
   */
  getUserPresence(userId: string): PresenceStatus | null {
    const presence = this.socketGateway.getUserPresence(userId);
    if (!presence) return null;

    return {
      userId: presence.userId,
      status: presence.status,
      lastSeen: presence.lastSeen,
      connectionCount: presence.socketIds.size,
      devices: this.getUserDevices(userId),
    };
  }

  /**
   * Get presence status for multiple users
   */
  getMultipleUserPresence(userIds: string[]): PresenceStatus[] {
    return userIds
      .map(userId => this.getUserPresence(userId))
      .filter((presence): presence is PresenceStatus => presence !== null);
  }

  /**
   * Get all currently online users
   */
  getOnlineUsers(): PresenceStatus[] {
    const onlineUserIds = this.socketGateway.getOnlineUsers();
    return this.getMultipleUserPresence(onlineUserIds);
  }

  /**
   * Check if a user is currently online
   */
  isUserOnline(userId: string): boolean {
    return this.socketGateway.isUserOnline(userId);
  }

  /**
   * Get user connection count
   */
  getUserConnectionCount(userId: string): number {
    return this.socketGateway.getUserConnectionCount(userId);
  }

  /**
   * Update user status manually (e.g., from API call)
   */
  async updateUserStatus(userId: string, status: 'online' | 'away' | 'busy'): Promise<boolean> {
    try {
      // Emit status update to user's sockets
      this.socketGateway.emitToUser(userId, 'presence:status_updated', {
        status,
        timestamp: new Date().toISOString(),
      });

      // Broadcast to other users
      this.socketGateway.broadcast('presence:updated', {
        userId,
        status,
      }, userId);

      this.logger.debug(`User ${userId} status updated to: ${status}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to update user status: ${error.message}`);
      return false;
    }
  }

  // =============================================
  // ACTIVITY TRACKING
  // =============================================

  /**
   * Start tracking user activity session
   */
  startActivitySession(
    userId: string,
    socketId: string,
    deviceType: 'web' | 'mobile' | 'desktop' = 'web',
    userAgent?: string,
    ipAddress?: string,
  ): void {
    const session: ActivitySession = {
      userId,
      sessionId: socketId,
      startTime: new Date(),
      lastActivity: new Date(),
      deviceType,
      userAgent,
      ipAddress,
    };

    this.activitySessions.set(socketId, session);
    this.resetActivityTimer(userId);
    
    this.logger.debug(`Activity session started for user ${userId} on ${deviceType}`);
  }

  /**
   * Update user's last activity time
   */
  updateUserActivity(userId: string, socketId: string): void {
    const session = this.activitySessions.get(socketId);
    if (session) {
      session.lastActivity = new Date();
      this.resetActivityTimer(userId);
    }
  }

  /**
   * End activity session
   */
  endActivitySession(socketId: string): void {
    const session = this.activitySessions.get(socketId);
    if (session) {
      this.activitySessions.delete(socketId);
      this.logger.debug(`Activity session ended for socket ${socketId}`);
    }
  }

  /**
   * Get user's active sessions
   */
  getUserSessions(userId: string): ActivitySession[] {
    return Array.from(this.activitySessions.values()).filter(
      session => session.userId === userId,
    );
  }

  /**
   * Get session details by socket ID
   */
  getSession(socketId: string): ActivitySession | undefined {
    return this.activitySessions.get(socketId);
  }

  // =============================================
  // USER ACTIVITY ANALYSIS
  // =============================================

  /**
   * Get user's active devices
   */
  getUserDevices(userId: string): { web?: Date; mobile?: Date; desktop?: Date } {
    const sessions = this.getUserSessions(userId);
    const devices: { web?: Date; mobile?: Date; desktop?: Date } = {};

    sessions.forEach(session => {
      if (!devices[session.deviceType] || session.lastActivity > devices[session.deviceType]!) {
        devices[session.deviceType] = session.lastActivity;
      }
    });

    return devices;
  }

  /**
   * Get user's session duration
   */
  getUserSessionDuration(userId: string): number {
    const sessions = this.getUserSessions(userId);
    if (sessions.length === 0) return 0;

    const earliestSession = sessions.reduce((earliest, session) => 
      session.startTime < earliest.startTime ? session : earliest
    );

    return Date.now() - earliestSession.startTime.getTime();
  }

  /**
   * Check if user has been idle
   */
  isUserIdle(userId: string, idleThresholdMinutes: number = 5): boolean {
    const sessions = this.getUserSessions(userId);
    if (sessions.length === 0) return true;

    const latestActivity = sessions.reduce((latest, session) =>
      session.lastActivity > latest ? session.lastActivity : latest,
      new Date(0),
    );

    const idleThreshold = idleThresholdMinutes * 60 * 1000;
    return Date.now() - latestActivity.getTime() > idleThreshold;
  }

  // =============================================
  // PRESENCE EVENTS
  // =============================================

  /**
   * Broadcast user came online
   */
  broadcastUserOnline(userId: string): void {
    this.socketGateway.broadcast('presence:user_online', {
      userId,
      timestamp: new Date().toISOString(),
    }, userId);
  }

  /**
   * Broadcast user went offline
   */
  broadcastUserOffline(userId: string, lastSeen: Date): void {
    this.socketGateway.broadcast('presence:user_offline', {
      userId,
      lastSeen: lastSeen.toISOString(),
      timestamp: new Date().toISOString(),
    }, userId);
  }

  /**
   * Broadcast user status change
   */
  broadcastStatusChange(userId: string, status: string, oldStatus?: string): void {
    this.socketGateway.broadcast('presence:status_changed', {
      userId,
      status,
      oldStatus,
      timestamp: new Date().toISOString(),
    }, userId);
  }

  // =============================================
  // ADMIN METHODS
  // =============================================

  /**
   * Get system-wide presence statistics
   */
  getPresenceStats(): {
    totalOnline: number;
    byStatus: Record<string, number>;
    byDevice: Record<string, number>;
    averageSessionDuration: number;
  } {
    const onlineUsers = this.getOnlineUsers();
    const byStatus: Record<string, number> = {
      online: 0,
      away: 0,
      busy: 0,
      offline: 0,
    };

    const byDevice: Record<string, number> = {
      web: 0,
      mobile: 0,
      desktop: 0,
    };

    let totalSessionDuration = 0;

    onlineUsers.forEach(user => {
      byStatus[user.status]++;
      
      Object.keys(user.devices).forEach(device => {
        byDevice[device]++;
      });

      totalSessionDuration += this.getUserSessionDuration(user.userId);
    });

    return {
      totalOnline: onlineUsers.length,
      byStatus,
      byDevice,
      averageSessionDuration: onlineUsers.length > 0 ? totalSessionDuration / onlineUsers.length : 0,
    };
  }

  /**
   * Force disconnect user
   */
  async forceDisconnectUser(userId: string, reason?: string): Promise<void> {
    try {
      this.socketGateway.emitToUser(userId, 'connection:force_disconnect', {
        reason: reason || 'Administrative action',
        timestamp: new Date().toISOString(),
      });

      // Give client time to handle the disconnect message
      setTimeout(() => {
        // Remove all sessions for this user
        const sessions = this.getUserSessions(userId);
        sessions.forEach(session => {
          this.endActivitySession(session.sessionId);
        });
      }, 1000);

      this.logger.log(`Force disconnected user ${userId}: ${reason}`);
    } catch (error) {
      this.logger.error(`Failed to force disconnect user ${userId}: ${error.message}`);
    }
  }

  // =============================================
  // PRIVATE HELPER METHODS
  // =============================================

  private resetActivityTimer(userId: string): void {
    // Clear existing timer
    const existingTimer = this.userActivityTimers.get(userId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer to mark user as away after 10 minutes of inactivity
    const timer = setTimeout(() => {
      if (this.isUserIdle(userId, 10)) {
        this.updateUserStatus(userId, 'away');
      }
    }, 10 * 60 * 1000); // 10 minutes

    this.userActivityTimers.set(userId, timer);
  }

  private cleanupInactiveSessions(): void {
    const now = new Date();
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [socketId, session] of this.activitySessions.entries()) {
      const sessionAge = now.getTime() - session.startTime.getTime();
      const inactiveTime = now.getTime() - session.lastActivity.getTime();

      // Remove sessions older than 24 hours or inactive for more than 1 hour
      if (sessionAge > maxSessionAge || inactiveTime > 60 * 60 * 1000) {
        this.activitySessions.delete(socketId);
        this.logger.debug(`Cleaned up inactive session for user ${session.userId}`);
      }
    }
  }
}