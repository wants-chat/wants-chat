import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type * as puppeteer from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';

// Lazy-loaded puppeteer to avoid slow startup
let puppeteerModule: typeof import('puppeteer') | null = null;
async function getPuppeteer(): Promise<typeof import('puppeteer')> {
  if (!puppeteerModule) {
    puppeteerModule = await import('puppeteer');
  }
  return puppeteerModule;
}
import {
  BrowserType,
  SessionStatus,
  CreateSessionDto,
  SessionResponseDto,
} from './dto';

export interface BrowserSession {
  id: string;
  browser: puppeteer.Browser;
  page: puppeteer.Page;
  status: SessionStatus;
  browserType: BrowserType;
  createdAt: Date;
  lastActivityAt: Date;
  viewportWidth: number;
  viewportHeight: number;
  userId?: string;
}

interface SessionPoolConfig {
  maxSessions: number;
  idleTimeoutMs: number;
  cleanupIntervalMs: number;
}

@Injectable()
export class SessionManagerService implements OnModuleDestroy {
  private readonly logger = new Logger(SessionManagerService.name);
  private readonly sessions = new Map<string, BrowserSession>();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly poolConfig: SessionPoolConfig;

  constructor(private readonly configService: ConfigService) {
    this.poolConfig = {
      maxSessions: this.configService.get<number>('BROWSER_MAX_SESSIONS', 10),
      idleTimeoutMs: this.configService.get<number>('BROWSER_IDLE_TIMEOUT', 300000), // 5 minutes
      cleanupIntervalMs: this.configService.get<number>('BROWSER_CLEANUP_INTERVAL', 60000), // 1 minute
    };

    // Start cleanup interval
    this.startCleanupInterval();
    this.logger.log(`Session manager initialized with max ${this.poolConfig.maxSessions} sessions`);
  }

  /**
   * Create a new browser session
   */
  async createSession(
    options: CreateSessionDto = {},
    userId?: string
  ): Promise<BrowserSession> {
    // Check if max sessions reached
    const activeSessions = this.getActiveSessions();
    if (activeSessions.length >= this.poolConfig.maxSessions) {
      // Try to close oldest idle session
      const oldestIdle = this.findOldestIdleSession();
      if (oldestIdle) {
        await this.closeSession(oldestIdle.id);
      } else {
        throw new Error(`Maximum sessions (${this.poolConfig.maxSessions}) reached. Please close an existing session.`);
      }
    }

    const sessionId = uuidv4();
    const browserType = options.browserType || BrowserType.CHROMIUM;
    const headless = options.headless !== false;
    const viewportWidth = options.viewportWidth || 1280;
    const viewportHeight = options.viewportHeight || 800;

    this.logger.log(`Creating new browser session: ${sessionId}`);

    try {
      const launchArgs: string[] = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        `--window-size=${viewportWidth},${viewportHeight}`,
      ];

      if (options.proxy) {
        launchArgs.push(`--proxy-server=${options.proxy}`);
      }

      const pptr = await getPuppeteer();
      const browser = await pptr.launch({
        headless: headless ? 'shell' : false,
        args: launchArgs,
        timeout: options.timeout || 30000,
      });

      const page = await browser.newPage();

      // Set viewport
      await page.setViewport({
        width: viewportWidth,
        height: viewportHeight,
      });

      // Set user agent
      const userAgent = options.userAgent ||
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      await page.setUserAgent(userAgent);

      // Enable/disable JavaScript
      if (options.javaScriptEnabled === false) {
        await page.setJavaScriptEnabled(false);
      }

      // Block images if requested
      if (options.blockImages) {
        await page.setRequestInterception(true);
        page.on('request', (request) => {
          if (request.resourceType() === 'image') {
            request.abort();
          } else {
            request.continue();
          }
        });
      }

      const session: BrowserSession = {
        id: sessionId,
        browser,
        page,
        status: SessionStatus.ACTIVE,
        browserType,
        createdAt: new Date(),
        lastActivityAt: new Date(),
        viewportWidth,
        viewportHeight,
        userId,
      };

      this.sessions.set(sessionId, session);

      // Setup disconnect handler
      browser.on('disconnected', () => {
        this.handleDisconnect(sessionId);
      });

      this.logger.log(`Session created successfully: ${sessionId}`);
      return session;
    } catch (error: any) {
      this.logger.error(`Failed to create session: ${error.message}`);
      throw new Error(`Failed to create browser session: ${error.message}`);
    }
  }

  /**
   * Get an existing session by ID
   */
  getSession(sessionId: string): BrowserSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivityAt = new Date();
    }
    return session;
  }

  /**
   * Get session and validate it's active
   */
  getActiveSession(sessionId: string): BrowserSession {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    if (session.status !== SessionStatus.ACTIVE) {
      throw new Error(`Session is not active: ${sessionId} (status: ${session.status})`);
    }
    return session;
  }

  /**
   * Get or create a session for a user
   */
  async getOrCreateSession(
    userId: string,
    options: CreateSessionDto = {}
  ): Promise<BrowserSession> {
    // Find existing active session for user
    const existingSession = Array.from(this.sessions.values()).find(
      (s) => s.userId === userId && s.status === SessionStatus.ACTIVE
    );

    if (existingSession) {
      existingSession.lastActivityAt = new Date();
      return existingSession;
    }

    // Create new session
    return this.createSession(options, userId);
  }

  /**
   * List all sessions
   */
  listSessions(userId?: string): SessionResponseDto[] {
    const sessions = Array.from(this.sessions.values());
    const filtered = userId
      ? sessions.filter((s) => s.userId === userId)
      : sessions;

    return filtered.map((session) => this.toResponseDto(session));
  }

  /**
   * Get active sessions
   */
  getActiveSessions(): BrowserSession[] {
    return Array.from(this.sessions.values()).filter(
      (s) => s.status === SessionStatus.ACTIVE
    );
  }

  /**
   * Close a session
   */
  async closeSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    this.logger.log(`Closing session: ${sessionId}`);

    try {
      session.status = SessionStatus.CLOSED;

      if (session.page && !session.page.isClosed()) {
        await session.page.close().catch(() => {});
      }

      if (session.browser.connected) {
        await session.browser.close().catch(() => {});
      }

      this.sessions.delete(sessionId);
      this.logger.log(`Session closed: ${sessionId}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Error closing session ${sessionId}: ${error.message}`);
      this.sessions.delete(sessionId);
      return false;
    }
  }

  /**
   * Close all sessions for a user
   */
  async closeUserSessions(userId: string): Promise<number> {
    const userSessions = Array.from(this.sessions.values()).filter(
      (s) => s.userId === userId
    );

    let closed = 0;
    for (const session of userSessions) {
      if (await this.closeSession(session.id)) {
        closed++;
      }
    }

    return closed;
  }

  /**
   * Update session activity timestamp
   */
  touchSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivityAt = new Date();
    }
  }

  /**
   * Mark session as idle
   */
  markIdle(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session && session.status === SessionStatus.ACTIVE) {
      session.status = SessionStatus.IDLE;
    }
  }

  /**
   * Reactivate an idle session
   */
  reactivateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session && session.status === SessionStatus.IDLE) {
      session.status = SessionStatus.ACTIVE;
      session.lastActivityAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Get session stats
   */
  getStats(): {
    totalSessions: number;
    activeSessions: number;
    idleSessions: number;
    maxSessions: number;
  } {
    const sessions = Array.from(this.sessions.values());
    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter((s) => s.status === SessionStatus.ACTIVE).length,
      idleSessions: sessions.filter((s) => s.status === SessionStatus.IDLE).length,
      maxSessions: this.poolConfig.maxSessions,
    };
  }

  /**
   * Convert session to response DTO
   */
  private toResponseDto(session: BrowserSession): SessionResponseDto {
    let currentUrl: string | undefined;
    let pageTitle: string | undefined;

    // Try to get current URL and title synchronously if available
    try {
      if (session.page && !session.page.isClosed()) {
        currentUrl = session.page.url();
      }
    } catch {
      // Ignore errors
    }

    return {
      sessionId: session.id,
      status: session.status,
      browserType: session.browserType,
      createdAt: session.createdAt.toISOString(),
      currentUrl,
      pageTitle,
      viewportWidth: session.viewportWidth,
      viewportHeight: session.viewportHeight,
    };
  }

  /**
   * Find the oldest idle session
   */
  private findOldestIdleSession(): BrowserSession | undefined {
    const idleSessions = Array.from(this.sessions.values())
      .filter((s) => s.status === SessionStatus.IDLE)
      .sort((a, b) => a.lastActivityAt.getTime() - b.lastActivityAt.getTime());

    return idleSessions[0];
  }

  /**
   * Handle browser disconnection
   */
  private handleDisconnect(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.logger.warn(`Browser disconnected for session: ${sessionId}`);
      session.status = SessionStatus.CLOSED;
      this.sessions.delete(sessionId);
    }
  }

  /**
   * Start the cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleSessions();
    }, this.poolConfig.cleanupIntervalMs);
  }

  /**
   * Cleanup idle sessions that have exceeded timeout
   */
  private async cleanupIdleSessions(): Promise<void> {
    const now = Date.now();
    const sessionsToClose: string[] = [];

    for (const [sessionId, session] of this.sessions) {
      const idleTime = now - session.lastActivityAt.getTime();

      // Check if session has been idle too long
      if (idleTime > this.poolConfig.idleTimeoutMs) {
        sessionsToClose.push(sessionId);
      }
    }

    if (sessionsToClose.length > 0) {
      this.logger.log(`Cleaning up ${sessionsToClose.length} idle sessions`);
      for (const sessionId of sessionsToClose) {
        await this.closeSession(sessionId);
      }
    }
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('Shutting down session manager...');

    // Stop cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Close all sessions
    const sessionIds = Array.from(this.sessions.keys());
    for (const sessionId of sessionIds) {
      await this.closeSession(sessionId);
    }

    this.logger.log('Session manager shut down complete');
  }
}
