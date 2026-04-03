import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type * as puppeteer from 'puppeteer';
import { SessionManagerService, BrowserSession } from './session-manager.service';
import { StagehandService } from './stagehand.service';
import {
  CreateSessionDto,
  SessionResponseDto,
  NavigateDto,
  NavigateResponseDto,
  ClickDto,
  TypeDto,
  SelectDto,
  HoverDto,
  ScrollDto,
  WaitDto,
  InteractionResponseDto,
  BrowserScreenshotDto,
  BrowserScreenshotResponseDto,
  EvaluateDto,
  EvaluateResponseDto,
  StagehandActDto,
  StagehandExtractDto,
  StagehandObserveDto,
  StagehandActResponseDto,
  StagehandExtractResponseDto,
  StagehandObserveResponseDto,
  BatchActionsDto,
  BatchActionsResponseDto,
  ActionResultDto,
  ActionType,
  SetCookiesDto,
  GetCookiesResponseDto,
  SetStorageDto,
  CookieDto,
  SessionStatus,
} from './dto';

@Injectable()
export class BrowserService {
  private readonly logger = new Logger(BrowserService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly sessionManager: SessionManagerService,
    private readonly stagehandService: StagehandService,
  ) {}

  // ============================================
  // SESSION MANAGEMENT
  // ============================================

  /**
   * Launch a new browser session
   */
  async launchBrowser(
    options: CreateSessionDto = {},
    userId?: string,
  ): Promise<SessionResponseDto> {
    const session = await this.sessionManager.createSession(options, userId);
    return this.sessionToResponse(session);
  }

  /**
   * Get session info
   */
  async getSession(sessionId: string): Promise<SessionResponseDto> {
    const session = this.sessionManager.getActiveSession(sessionId);
    return this.sessionToResponse(session);
  }

  /**
   * List all sessions (optionally filtered by user)
   */
  listSessions(userId?: string): SessionResponseDto[] {
    return this.sessionManager.listSessions(userId);
  }

  /**
   * Close a browser session
   */
  async closeBrowser(sessionId: string): Promise<{ success: boolean; message: string }> {
    const closed = await this.sessionManager.closeSession(sessionId);
    return {
      success: closed,
      message: closed ? 'Session closed successfully' : 'Session not found',
    };
  }

  /**
   * Get session statistics
   */
  getStats(): {
    totalSessions: number;
    activeSessions: number;
    idleSessions: number;
    maxSessions: number;
  } {
    return this.sessionManager.getStats();
  }

  // ============================================
  // NAVIGATION
  // ============================================

  /**
   * Navigate to a URL
   */
  async navigateTo(
    sessionId: string,
    dto: NavigateDto,
  ): Promise<NavigateResponseDto> {
    const session = this.sessionManager.getActiveSession(sessionId);
    const startTime = Date.now();

    this.logger.log(`Navigating to: ${dto.url}`);

    try {
      const response = await session.page.goto(dto.url, {
        waitUntil: dto.waitUntil || 'networkidle2',
        timeout: dto.timeout || 30000,
      });

      const title = await session.page.title();
      const loadTime = Date.now() - startTime;

      return {
        success: true,
        url: session.page.url(),
        title,
        statusCode: response?.status(),
        loadTime,
      };
    } catch (error: any) {
      this.logger.error(`Navigation failed: ${error.message}`);
      throw new Error(`Navigation failed: ${error.message}`);
    }
  }

  // ============================================
  // INTERACTIONS
  // ============================================

  /**
   * Click an element
   */
  async click(sessionId: string, dto: ClickDto): Promise<InteractionResponseDto> {
    const session = this.sessionManager.getActiveSession(sessionId);
    const startTime = Date.now();

    this.logger.log(`Clicking: ${dto.selector}`);

    try {
      // Wait for element
      await session.page.waitForSelector(dto.selector, {
        timeout: dto.timeout || 10000,
        visible: true,
      });

      // Perform click
      const clickOptions: puppeteer.ClickOptions = {
        button: dto.button || 'left',
        clickCount: dto.clickCount || 1,
      };

      if (dto.waitForNavigation) {
        await Promise.all([
          session.page.waitForNavigation({ waitUntil: 'networkidle2' }),
          session.page.click(dto.selector, clickOptions),
        ]);
      } else {
        await session.page.click(dto.selector, clickOptions);
      }

      return {
        success: true,
        action: 'click',
        message: `Clicked: ${dto.selector}`,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      this.logger.error(`Click failed: ${error.message}`);
      throw new Error(`Click failed: ${error.message}`);
    }
  }

  /**
   * Type text into an element
   */
  async type(sessionId: string, dto: TypeDto): Promise<InteractionResponseDto> {
    const session = this.sessionManager.getActiveSession(sessionId);
    const startTime = Date.now();

    this.logger.log(`Typing into: ${dto.selector}`);

    try {
      await session.page.waitForSelector(dto.selector, {
        timeout: 10000,
        visible: true,
      });

      // Clear existing content if requested
      if (dto.clear) {
        await session.page.click(dto.selector, { clickCount: 3 });
        await session.page.keyboard.press('Backspace');
      }

      // Type text
      await session.page.type(dto.selector, dto.text, {
        delay: dto.delay || 0,
      });

      // Press Enter if requested
      if (dto.pressEnter) {
        await session.page.keyboard.press('Enter');
      }

      return {
        success: true,
        action: 'type',
        message: `Typed ${dto.text.length} characters into: ${dto.selector}`,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      this.logger.error(`Type failed: ${error.message}`);
      throw new Error(`Type failed: ${error.message}`);
    }
  }

  /**
   * Select option(s) from a dropdown
   */
  async select(sessionId: string, dto: SelectDto): Promise<InteractionResponseDto> {
    const session = this.sessionManager.getActiveSession(sessionId);
    const startTime = Date.now();

    this.logger.log(`Selecting from: ${dto.selector}`);

    try {
      await session.page.waitForSelector(dto.selector, {
        timeout: 10000,
        visible: true,
      });

      await session.page.select(dto.selector, ...dto.values);

      return {
        success: true,
        action: 'select',
        message: `Selected ${dto.values.length} option(s) in: ${dto.selector}`,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      this.logger.error(`Select failed: ${error.message}`);
      throw new Error(`Select failed: ${error.message}`);
    }
  }

  /**
   * Hover over an element
   */
  async hover(sessionId: string, dto: HoverDto): Promise<InteractionResponseDto> {
    const session = this.sessionManager.getActiveSession(sessionId);
    const startTime = Date.now();

    this.logger.log(`Hovering: ${dto.selector}`);

    try {
      await session.page.waitForSelector(dto.selector, {
        timeout: 10000,
        visible: true,
      });

      await session.page.hover(dto.selector);

      return {
        success: true,
        action: 'hover',
        message: `Hovered over: ${dto.selector}`,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      this.logger.error(`Hover failed: ${error.message}`);
      throw new Error(`Hover failed: ${error.message}`);
    }
  }

  /**
   * Scroll the page
   */
  async scroll(sessionId: string, dto: ScrollDto): Promise<InteractionResponseDto> {
    const session = this.sessionManager.getActiveSession(sessionId);
    const startTime = Date.now();

    this.logger.log('Scrolling');

    try {
      if (dto.selector) {
        // Scroll to element
        const element = await session.page.$(dto.selector);
        if (!element) {
          throw new Error(`Element not found: ${dto.selector}`);
        }
        await element.scrollIntoView();
      } else if (dto.x !== undefined || dto.y !== undefined) {
        // Scroll by coordinates
        const behavior = dto.smooth ? 'smooth' : 'auto';
        await session.page.evaluate(
          ({ x, y, behavior }) => {
            window.scrollBy({ left: x || 0, top: y || 0, behavior: behavior as ScrollBehavior });
          },
          { x: dto.x, y: dto.y, behavior },
        );
      } else {
        // Default: scroll down one viewport
        await session.page.evaluate(() => {
          window.scrollBy(0, window.innerHeight);
        });
      }

      return {
        success: true,
        action: 'scroll',
        message: dto.selector ? `Scrolled to: ${dto.selector}` : 'Scrolled page',
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      this.logger.error(`Scroll failed: ${error.message}`);
      throw new Error(`Scroll failed: ${error.message}`);
    }
  }

  /**
   * Wait for conditions
   */
  async wait(sessionId: string, dto: WaitDto): Promise<InteractionResponseDto> {
    const session = this.sessionManager.getActiveSession(sessionId);
    const startTime = Date.now();
    const timeout = dto.timeout || 30000;

    this.logger.log('Waiting');

    try {
      if (dto.selector) {
        // Wait for selector
        await session.page.waitForSelector(dto.selector, {
          timeout,
          visible: true,
        });
      } else if (dto.navigation) {
        // Wait for navigation
        await session.page.waitForNavigation({ timeout, waitUntil: 'networkidle2' });
      } else if (dto.text) {
        // Wait for text to appear
        await session.page.waitForFunction(
          (text) => document.body.innerText.includes(text),
          { timeout },
          dto.text,
        );
      } else if (dto.time) {
        // Fixed wait
        await new Promise((resolve) => setTimeout(resolve, dto.time));
      } else {
        // Default short wait
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      return {
        success: true,
        action: 'wait',
        message: 'Wait completed',
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      this.logger.error(`Wait failed: ${error.message}`);
      throw new Error(`Wait failed: ${error.message}`);
    }
  }

  // ============================================
  // SCREENSHOT
  // ============================================

  /**
   * Take a screenshot
   */
  async screenshot(
    sessionId: string,
    dto: BrowserScreenshotDto = {},
  ): Promise<BrowserScreenshotResponseDto> {
    const session = this.sessionManager.getActiveSession(sessionId);

    this.logger.log('Taking screenshot');

    try {
      const format = dto.format || 'png';
      let buffer: Buffer | string;
      let width: number;
      let height: number;

      const screenshotOptions: puppeteer.ScreenshotOptions = {
        type: format as 'png' | 'jpeg' | 'webp',
        encoding: 'base64',
        fullPage: dto.fullPage || false,
        omitBackground: dto.omitBackground || false,
      };

      if (format !== 'png' && dto.quality) {
        screenshotOptions.quality = dto.quality;
      }

      if (dto.clip) {
        screenshotOptions.clip = dto.clip;
      }

      if (dto.selector) {
        // Screenshot specific element
        const element = await session.page.$(dto.selector);
        if (!element) {
          throw new Error(`Element not found: ${dto.selector}`);
        }
        const screenshotResult = await element.screenshot(screenshotOptions);
        buffer = typeof screenshotResult === 'string'
          ? screenshotResult
          : Buffer.from(screenshotResult).toString('base64');
        const box = await element.boundingBox();
        width = Math.round(box?.width || 0);
        height = Math.round(box?.height || 0);
      } else {
        // Screenshot page
        const screenshotResult = await session.page.screenshot(screenshotOptions);
        buffer = typeof screenshotResult === 'string'
          ? screenshotResult
          : Buffer.from(screenshotResult).toString('base64');
        const viewport = session.page.viewport();
        width = viewport?.width || session.viewportWidth;
        height = dto.fullPage
          ? await session.page.evaluate(() => document.body.scrollHeight)
          : (viewport?.height || session.viewportHeight);
      }

      const url = session.page.url();
      const title = await session.page.title();

      return {
        success: true,
        imageBase64: buffer as string,
        format,
        width,
        height,
        fullPage: dto.fullPage || false,
        url,
        title,
      };
    } catch (error: any) {
      this.logger.error(`Screenshot failed: ${error.message}`);
      throw new Error(`Screenshot failed: ${error.message}`);
    }
  }

  // ============================================
  // JAVASCRIPT EVALUATION
  // ============================================

  /**
   * Evaluate JavaScript in page context
   */
  async evaluate(
    sessionId: string,
    dto: EvaluateDto,
  ): Promise<EvaluateResponseDto> {
    const session = this.sessionManager.getActiveSession(sessionId);
    const startTime = Date.now();

    this.logger.log('Evaluating script');

    try {
      // Create function from script
      const result = await session.page.evaluate(
        new Function(...(dto.args || []).map((_, i) => `arg${i}`), dto.script) as any,
        ...(dto.args || []),
      );

      return {
        success: true,
        result,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      this.logger.error(`Evaluate failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  // ============================================
  // AI-POWERED ACTIONS (STAGEHAND)
  // ============================================

  /**
   * AI-powered action using natural language
   */
  async aiAct(
    sessionId: string,
    dto: StagehandActDto,
  ): Promise<StagehandActResponseDto> {
    const session = this.sessionManager.getActiveSession(sessionId);
    return this.stagehandService.act(session.page, dto);
  }

  /**
   * AI-powered data extraction
   */
  async aiExtract(
    sessionId: string,
    dto: StagehandExtractDto,
  ): Promise<StagehandExtractResponseDto> {
    const session = this.sessionManager.getActiveSession(sessionId);
    return this.stagehandService.extract(session.page, dto);
  }

  /**
   * AI-powered page observation
   */
  async aiObserve(
    sessionId: string,
    dto: StagehandObserveDto = {},
  ): Promise<StagehandObserveResponseDto> {
    const session = this.sessionManager.getActiveSession(sessionId);
    return this.stagehandService.observe(session.page, dto);
  }

  // ============================================
  // BATCH ACTIONS
  // ============================================

  /**
   * Execute multiple actions in sequence
   */
  async batchActions(
    sessionId: string,
    dto: BatchActionsDto,
  ): Promise<BatchActionsResponseDto> {
    const startTime = Date.now();
    const results: ActionResultDto[] = [];
    let successCount = 0;
    let failCount = 0;

    this.logger.log(`Executing ${dto.actions.length} batch actions`);

    for (const action of dto.actions) {
      const actionStart = Date.now();
      let result: ActionResultDto;

      try {
        const actionResult = await this.executeAction(sessionId, action.type, action.params);
        result = {
          type: action.type,
          success: true,
          result: actionResult,
          duration: Date.now() - actionStart,
        };
        successCount++;
      } catch (error: any) {
        result = {
          type: action.type,
          success: false,
          error: error.message,
          duration: Date.now() - actionStart,
        };
        failCount++;

        if (dto.stopOnError) {
          results.push(result);
          break;
        }
      }

      results.push(result);
    }

    return {
      success: failCount === 0,
      totalActions: dto.actions.length,
      successfulActions: successCount,
      failedActions: failCount,
      results,
      totalDuration: Date.now() - startTime,
    };
  }

  /**
   * Execute a single action by type
   */
  private async executeAction(
    sessionId: string,
    type: ActionType,
    params: Record<string, any>,
  ): Promise<any> {
    switch (type) {
      case ActionType.CLICK:
        return this.click(sessionId, params as ClickDto);
      case ActionType.TYPE:
        return this.type(sessionId, params as TypeDto);
      case ActionType.NAVIGATE:
        return this.navigateTo(sessionId, params as NavigateDto);
      case ActionType.SCREENSHOT:
        return this.screenshot(sessionId, params as BrowserScreenshotDto);
      case ActionType.EXTRACT:
        return this.aiExtract(sessionId, params as StagehandExtractDto);
      case ActionType.EVALUATE:
        return this.evaluate(sessionId, params as EvaluateDto);
      case ActionType.WAIT:
        return this.wait(sessionId, params as WaitDto);
      case ActionType.SCROLL:
        return this.scroll(sessionId, params as ScrollDto);
      case ActionType.HOVER:
        return this.hover(sessionId, params as HoverDto);
      case ActionType.SELECT:
        return this.select(sessionId, params as SelectDto);
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }

  // ============================================
  // COOKIES & STORAGE
  // ============================================

  /**
   * Get cookies
   */
  async getCookies(sessionId: string): Promise<GetCookiesResponseDto> {
    const session = this.sessionManager.getActiveSession(sessionId);

    const cookies = await session.page.cookies();

    return {
      cookies: cookies.map((c) => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path,
        expires: c.expires,
        httpOnly: c.httpOnly,
        secure: c.secure,
        sameSite: c.sameSite as 'Strict' | 'Lax' | 'None' | undefined,
      })),
    };
  }

  /**
   * Set cookies
   */
  async setCookies(
    sessionId: string,
    dto: SetCookiesDto,
  ): Promise<{ success: boolean; count: number }> {
    const session = this.sessionManager.getActiveSession(sessionId);

    const cookies = dto.cookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path || '/',
      expires: c.expires,
      httpOnly: c.httpOnly,
      secure: c.secure,
      sameSite: c.sameSite as 'Strict' | 'Lax' | 'None',
    }));

    await session.page.setCookie(...cookies);

    return { success: true, count: cookies.length };
  }

  /**
   * Clear cookies
   */
  async clearCookies(sessionId: string): Promise<{ success: boolean }> {
    const session = this.sessionManager.getActiveSession(sessionId);

    const cookies = await session.page.cookies();
    const cookiesToDelete = cookies.map((c) => ({
      name: c.name,
      url: session.page.url(),
    }));

    await session.page.deleteCookie(...cookiesToDelete);

    return { success: true };
  }

  /**
   * Set local/session storage
   */
  async setStorage(
    sessionId: string,
    dto: SetStorageDto,
  ): Promise<{ success: boolean; count: number }> {
    const session = this.sessionManager.getActiveSession(sessionId);
    const storageType = dto.type || 'local';

    await session.page.evaluate(
      ({ items, type }) => {
        const storage = type === 'session' ? sessionStorage : localStorage;
        for (const item of items) {
          storage.setItem(item.key, item.value);
        }
      },
      { items: dto.items, type: storageType },
    );

    return { success: true, count: dto.items.length };
  }

  /**
   * Get local/session storage
   */
  async getStorage(
    sessionId: string,
    type: 'local' | 'session' = 'local',
  ): Promise<Record<string, string>> {
    const session = this.sessionManager.getActiveSession(sessionId);

    return session.page.evaluate((storageType) => {
      const storage = storageType === 'session' ? sessionStorage : localStorage;
      const result: Record<string, string> = {};
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) {
          result[key] = storage.getItem(key) || '';
        }
      }
      return result;
    }, type);
  }

  /**
   * Clear local/session storage
   */
  async clearStorage(
    sessionId: string,
    type: 'local' | 'session' = 'local',
  ): Promise<{ success: boolean }> {
    const session = this.sessionManager.getActiveSession(sessionId);

    await session.page.evaluate((storageType) => {
      const storage = storageType === 'session' ? sessionStorage : localStorage;
      storage.clear();
    }, type);

    return { success: true };
  }

  // ============================================
  // PAGE INFO
  // ============================================

  /**
   * Get current page info
   */
  async getPageInfo(sessionId: string): Promise<{
    url: string;
    title: string;
    viewport: { width: number; height: number };
  }> {
    const session = this.sessionManager.getActiveSession(sessionId);

    const url = session.page.url();
    const title = await session.page.title();
    const viewport = session.page.viewport();

    return {
      url,
      title,
      viewport: {
        width: viewport?.width || session.viewportWidth,
        height: viewport?.height || session.viewportHeight,
      },
    };
  }

  /**
   * Get page HTML content
   */
  async getPageContent(sessionId: string): Promise<{ html: string; text: string }> {
    const session = this.sessionManager.getActiveSession(sessionId);

    const [html, text] = await Promise.all([
      session.page.content(),
      session.page.evaluate(() => document.body.innerText),
    ]);

    return { html, text };
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Convert session to response DTO
   */
  private async sessionToResponse(session: BrowserSession): Promise<SessionResponseDto> {
    let currentUrl: string | undefined;
    let pageTitle: string | undefined;

    try {
      if (session.page && !session.page.isClosed()) {
        currentUrl = session.page.url();
        pageTitle = await session.page.title();
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
}
