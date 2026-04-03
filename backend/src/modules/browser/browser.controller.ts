import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BrowserService } from './browser.service';
import {
  CreateSessionDto,
  SessionResponseDto,
  SessionListResponseDto,
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
  SetCookiesDto,
  GetCookiesResponseDto,
  SetStorageDto,
} from './dto';

interface AuthenticatedRequest extends Request {
  user: { sub: string; userId?: string };
}

@ApiTags('Browser Automation')
@Controller('browser')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BrowserController {
  private readonly logger = new Logger(BrowserController.name);

  constructor(private readonly browserService: BrowserService) {}

  // ============================================
  // SESSION MANAGEMENT
  // ============================================

  @Post('sessions')
  @ApiOperation({ summary: 'Create a new browser session' })
  @ApiResponse({ status: 201, description: 'Session created', type: SessionResponseDto })
  async createSession(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateSessionDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    const session = await this.browserService.launchBrowser(dto, userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Browser session created',
      data: session,
    };
  }

  @Get('sessions')
  @ApiOperation({ summary: 'List all browser sessions' })
  @ApiResponse({ status: 200, type: SessionListResponseDto })
  async listSessions(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub || req.user.userId;
    const sessions = this.browserService.listSessions(userId);
    const stats = this.browserService.getStats();

    return {
      statusCode: HttpStatus.OK,
      message: 'Sessions retrieved',
      data: {
        sessions,
        total: sessions.length,
        active: stats.activeSessions,
      },
    };
  }

  @Get('sessions/stats')
  @ApiOperation({ summary: 'Get session statistics' })
  async getStats() {
    const stats = this.browserService.getStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Stats retrieved',
      data: stats,
    };
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get session details' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, type: SessionResponseDto })
  async getSession(@Param('sessionId') sessionId: string) {
    const session = await this.browserService.getSession(sessionId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Session retrieved',
      data: session,
    };
  }

  @Delete('sessions/:sessionId')
  @ApiOperation({ summary: 'Close a browser session' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @HttpCode(HttpStatus.OK)
  async closeSession(@Param('sessionId') sessionId: string) {
    const result = await this.browserService.closeBrowser(sessionId);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result,
    };
  }

  // ============================================
  // NAVIGATION
  // ============================================

  @Post('sessions/:sessionId/navigate')
  @ApiOperation({ summary: 'Navigate to a URL' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, type: NavigateResponseDto })
  async navigate(
    @Param('sessionId') sessionId: string,
    @Body() dto: NavigateDto,
  ) {
    const result = await this.browserService.navigateTo(sessionId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Navigation completed',
      data: result,
    };
  }

  // ============================================
  // INTERACTIONS
  // ============================================

  @Post('sessions/:sessionId/click')
  @ApiOperation({ summary: 'Click an element' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, type: InteractionResponseDto })
  async click(
    @Param('sessionId') sessionId: string,
    @Body() dto: ClickDto,
  ) {
    const result = await this.browserService.click(sessionId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Click completed',
      data: result,
    };
  }

  @Post('sessions/:sessionId/type')
  @ApiOperation({ summary: 'Type text into an element' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, type: InteractionResponseDto })
  async type(
    @Param('sessionId') sessionId: string,
    @Body() dto: TypeDto,
  ) {
    const result = await this.browserService.type(sessionId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Type completed',
      data: result,
    };
  }

  @Post('sessions/:sessionId/select')
  @ApiOperation({ summary: 'Select option(s) from a dropdown' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, type: InteractionResponseDto })
  async select(
    @Param('sessionId') sessionId: string,
    @Body() dto: SelectDto,
  ) {
    const result = await this.browserService.select(sessionId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Select completed',
      data: result,
    };
  }

  @Post('sessions/:sessionId/hover')
  @ApiOperation({ summary: 'Hover over an element' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, type: InteractionResponseDto })
  async hover(
    @Param('sessionId') sessionId: string,
    @Body() dto: HoverDto,
  ) {
    const result = await this.browserService.hover(sessionId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Hover completed',
      data: result,
    };
  }

  @Post('sessions/:sessionId/scroll')
  @ApiOperation({ summary: 'Scroll the page' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, type: InteractionResponseDto })
  async scroll(
    @Param('sessionId') sessionId: string,
    @Body() dto: ScrollDto,
  ) {
    const result = await this.browserService.scroll(sessionId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Scroll completed',
      data: result,
    };
  }

  @Post('sessions/:sessionId/wait')
  @ApiOperation({ summary: 'Wait for conditions' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, type: InteractionResponseDto })
  async wait(
    @Param('sessionId') sessionId: string,
    @Body() dto: WaitDto,
  ) {
    const result = await this.browserService.wait(sessionId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Wait completed',
      data: result,
    };
  }

  // ============================================
  // SCREENSHOT
  // ============================================

  @Post('sessions/:sessionId/screenshot')
  @ApiOperation({ summary: 'Take a screenshot' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, type: BrowserScreenshotResponseDto })
  async screenshot(
    @Param('sessionId') sessionId: string,
    @Body() dto: BrowserScreenshotDto,
  ) {
    const result = await this.browserService.screenshot(sessionId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Screenshot captured',
      data: result,
    };
  }

  // ============================================
  // EVALUATE
  // ============================================

  @Post('sessions/:sessionId/evaluate')
  @ApiOperation({ summary: 'Evaluate JavaScript in page context' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, type: EvaluateResponseDto })
  async evaluate(
    @Param('sessionId') sessionId: string,
    @Body() dto: EvaluateDto,
  ) {
    const result = await this.browserService.evaluate(sessionId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Script evaluated',
      data: result,
    };
  }

  // ============================================
  // AI-POWERED ACTIONS (STAGEHAND)
  // ============================================

  @Post('sessions/:sessionId/ai/act')
  @ApiOperation({ summary: 'Perform AI-powered action using natural language' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, type: StagehandActResponseDto })
  async aiAct(
    @Param('sessionId') sessionId: string,
    @Body() dto: StagehandActDto,
  ) {
    const result = await this.browserService.aiAct(sessionId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'AI action completed',
      data: result,
    };
  }

  @Post('sessions/:sessionId/ai/extract')
  @ApiOperation({ summary: 'AI-powered data extraction' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, type: StagehandExtractResponseDto })
  async aiExtract(
    @Param('sessionId') sessionId: string,
    @Body() dto: StagehandExtractDto,
  ) {
    const result = await this.browserService.aiExtract(sessionId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'AI extraction completed',
      data: result,
    };
  }

  @Post('sessions/:sessionId/ai/observe')
  @ApiOperation({ summary: 'AI-powered page observation' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, type: StagehandObserveResponseDto })
  async aiObserve(
    @Param('sessionId') sessionId: string,
    @Body() dto: StagehandObserveDto,
  ) {
    const result = await this.browserService.aiObserve(sessionId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'AI observation completed',
      data: result,
    };
  }

  // ============================================
  // BATCH ACTIONS
  // ============================================

  @Post('sessions/:sessionId/batch')
  @ApiOperation({ summary: 'Execute multiple actions in sequence' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, type: BatchActionsResponseDto })
  async batchActions(
    @Param('sessionId') sessionId: string,
    @Body() dto: BatchActionsDto,
  ) {
    const result = await this.browserService.batchActions(sessionId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Batch actions completed',
      data: result,
    };
  }

  // ============================================
  // COOKIES & STORAGE
  // ============================================

  @Get('sessions/:sessionId/cookies')
  @ApiOperation({ summary: 'Get cookies' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, type: GetCookiesResponseDto })
  async getCookies(@Param('sessionId') sessionId: string) {
    const result = await this.browserService.getCookies(sessionId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cookies retrieved',
      data: result,
    };
  }

  @Post('sessions/:sessionId/cookies')
  @ApiOperation({ summary: 'Set cookies' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  async setCookies(
    @Param('sessionId') sessionId: string,
    @Body() dto: SetCookiesDto,
  ) {
    const result = await this.browserService.setCookies(sessionId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cookies set',
      data: result,
    };
  }

  @Delete('sessions/:sessionId/cookies')
  @ApiOperation({ summary: 'Clear cookies' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @HttpCode(HttpStatus.OK)
  async clearCookies(@Param('sessionId') sessionId: string) {
    const result = await this.browserService.clearCookies(sessionId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cookies cleared',
      data: result,
    };
  }

  @Get('sessions/:sessionId/storage/:type')
  @ApiOperation({ summary: 'Get local or session storage' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiParam({ name: 'type', enum: ['local', 'session'], description: 'Storage type' })
  async getStorage(
    @Param('sessionId') sessionId: string,
    @Param('type') type: 'local' | 'session',
  ) {
    const result = await this.browserService.getStorage(sessionId, type);
    return {
      statusCode: HttpStatus.OK,
      message: 'Storage retrieved',
      data: result,
    };
  }

  @Post('sessions/:sessionId/storage')
  @ApiOperation({ summary: 'Set local or session storage items' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  async setStorage(
    @Param('sessionId') sessionId: string,
    @Body() dto: SetStorageDto,
  ) {
    const result = await this.browserService.setStorage(sessionId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Storage set',
      data: result,
    };
  }

  @Delete('sessions/:sessionId/storage/:type')
  @ApiOperation({ summary: 'Clear local or session storage' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiParam({ name: 'type', enum: ['local', 'session'], description: 'Storage type' })
  @HttpCode(HttpStatus.OK)
  async clearStorage(
    @Param('sessionId') sessionId: string,
    @Param('type') type: 'local' | 'session',
  ) {
    const result = await this.browserService.clearStorage(sessionId, type);
    return {
      statusCode: HttpStatus.OK,
      message: 'Storage cleared',
      data: result,
    };
  }

  // ============================================
  // PAGE INFO
  // ============================================

  @Get('sessions/:sessionId/page')
  @ApiOperation({ summary: 'Get current page info' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  async getPageInfo(@Param('sessionId') sessionId: string) {
    const result = await this.browserService.getPageInfo(sessionId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Page info retrieved',
      data: result,
    };
  }

  @Get('sessions/:sessionId/content')
  @ApiOperation({ summary: 'Get page HTML and text content' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  async getPageContent(@Param('sessionId') sessionId: string) {
    const result = await this.browserService.getPageContent(sessionId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Page content retrieved',
      data: result,
    };
  }

  // ============================================
  // QUICK ACTIONS (Session-less convenience endpoints)
  // ============================================

  @Post('quick/screenshot')
  @ApiOperation({ summary: 'Take a quick screenshot without managing session' })
  async quickScreenshot(
    @Req() req: AuthenticatedRequest,
    @Body() body: { url: string; fullPage?: boolean; width?: number; height?: number },
  ) {
    const userId = req.user.sub || req.user.userId;

    // Create temporary session
    const session = await this.browserService.launchBrowser(
      { viewportWidth: body.width, viewportHeight: body.height },
      userId,
    );

    try {
      // Navigate
      await this.browserService.navigateTo(session.sessionId, { url: body.url });

      // Take screenshot
      const screenshot = await this.browserService.screenshot(session.sessionId, {
        fullPage: body.fullPage,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Screenshot captured',
        data: screenshot,
      };
    } finally {
      // Always close the session
      await this.browserService.closeBrowser(session.sessionId);
    }
  }

  @Post('quick/extract')
  @ApiOperation({ summary: 'Quick AI extraction from URL' })
  async quickExtract(
    @Req() req: AuthenticatedRequest,
    @Body() body: { url: string; instruction: string; schema?: Record<string, any> },
  ) {
    const userId = req.user.sub || req.user.userId;

    // Create temporary session
    const session = await this.browserService.launchBrowser({}, userId);

    try {
      // Navigate
      await this.browserService.navigateTo(session.sessionId, { url: body.url });

      // Wait for content to load
      await this.browserService.wait(session.sessionId, { time: 2000 });

      // Extract
      const extraction = await this.browserService.aiExtract(session.sessionId, {
        instruction: body.instruction,
        schema: body.schema,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Extraction completed',
        data: extraction,
      };
    } finally {
      // Always close the session
      await this.browserService.closeBrowser(session.sessionId);
    }
  }

  @Post('quick/scrape')
  @ApiOperation({ summary: 'Quick page scrape with AI extraction' })
  async quickScrape(
    @Req() req: AuthenticatedRequest,
    @Body() body: {
      url: string;
      selectors?: Record<string, string>;
      aiInstruction?: string;
    },
  ) {
    const userId = req.user.sub || req.user.userId;

    // Create temporary session
    const session = await this.browserService.launchBrowser({}, userId);

    try {
      // Navigate
      await this.browserService.navigateTo(session.sessionId, { url: body.url });

      // Wait for content
      await this.browserService.wait(session.sessionId, { time: 2000 });

      const result: Record<string, any> = {};

      // Extract by selectors if provided
      if (body.selectors) {
        for (const [key, selector] of Object.entries(body.selectors)) {
          try {
            const evalResult = await this.browserService.evaluate(session.sessionId, {
              script: `
                const el = document.querySelector('${selector}');
                return el ? el.innerText || el.textContent : null;
              `,
            });
            result[key] = evalResult.result;
          } catch {
            result[key] = null;
          }
        }
      }

      // AI extraction if instruction provided
      if (body.aiInstruction) {
        const aiResult = await this.browserService.aiExtract(session.sessionId, {
          instruction: body.aiInstruction,
        });
        result.ai = aiResult.data;
      }

      // Get page info
      const pageInfo = await this.browserService.getPageInfo(session.sessionId);

      return {
        statusCode: HttpStatus.OK,
        message: 'Scrape completed',
        data: {
          url: pageInfo.url,
          title: pageInfo.title,
          extracted: result,
        },
      };
    } finally {
      await this.browserService.closeBrowser(session.sessionId);
    }
  }
}
