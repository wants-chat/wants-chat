import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
  Headers,
  Logger,
  HttpException,
  HttpStatus,
  UseGuards,
  RawBodyRequest,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GitHubService } from './github.service';
import { GitHubOAuthService } from './github-oauth.service';
import {
  PushToGitHubDto,
  PullFromGitHubDto,
  CreateRepoDto,
  GitHubRepoDto,
  GitHubConnectionDto,
  AppGitHubLinkDto,
  GitHubSyncStatusDto,
} from './dto/github.dto';

@ApiTags('GitHub Integration')
@Controller('app-github')
export class GitHubController {
  private readonly logger = new Logger(GitHubController.name);

  constructor(
    private readonly githubService: GitHubService,
    private readonly oauthService: GitHubOAuthService,
  ) {}

  // ============ OAuth & Connection ============

  @Get('oauth/install-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get GitHub App installation URL' })
  @ApiQuery({ name: 'returnUrl', required: false, description: 'URL to redirect after installation' })
  @ApiResponse({ status: 200, description: 'Installation URL returned' })
  getInstallUrl(
    @Req() req: Request,
    @Query('returnUrl') returnUrl?: string,
  ) {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    if (!userId) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    if (!this.oauthService.isConfigured()) {
      throw new HttpException('GitHub integration not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }

    const url = this.oauthService.getInstallationUrl(userId, returnUrl);
    return { url };
  }

  @Get('oauth/callback')
  @ApiOperation({ summary: 'GitHub OAuth callback handler' })
  @ApiQuery({ name: 'installation_id', required: true })
  @ApiQuery({ name: 'state', required: true })
  async oauthCallback(
    @Query('installation_id') installationId: string,
    @Query('state') state: string,
    @Query('setup_action') setupAction: string,
    @Res() res: Response,
  ) {
    try {
      const stateData = this.oauthService.parseState(state);
      if (!stateData) {
        throw new HttpException('Invalid or expired state', HttpStatus.BAD_REQUEST);
      }

      // Handle installation
      await this.githubService.handleInstallationCallback(installationId, stateData.userId);

      // Redirect to frontend with success
      const redirectUrl = new URL(stateData.returnUrl);
      redirectUrl.searchParams.set('github', 'connected');
      redirectUrl.searchParams.set('installation_id', installationId);

      this.logger.log(`GitHub connected for user ${stateData.userId}, redirecting to ${redirectUrl}`);
      return res.redirect(redirectUrl.toString());
    } catch (error) {
      this.logger.error(`OAuth callback error: ${error.message}`);

      // Redirect with error
      const frontendUrl = this.oauthService.getFrontendUrl();
      return res.redirect(`${frontendUrl}/chat?github=error&message=${encodeURIComponent(error.message)}`);
    }
  }

  @Get('connection')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current GitHub connection status' })
  @ApiResponse({ status: 200, type: GitHubConnectionDto })
  async getConnection(@Req() req: Request): Promise<GitHubConnectionDto | null> {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    return this.githubService.getConnection(userId);
  }

  @Delete('disconnect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect GitHub' })
  @ApiResponse({ status: 200, description: 'GitHub disconnected' })
  async disconnect(@Req() req: Request) {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    await this.githubService.disconnect(userId);
    return { success: true, message: 'GitHub disconnected' };
  }

  // ============ Repository Operations ============

  @Get('repositories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List accessible repositories' })
  @ApiResponse({ status: 200, type: [GitHubRepoDto] })
  async listRepositories(@Req() req: Request): Promise<GitHubRepoDto[]> {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    return this.githubService.listRepositories(userId);
  }

  @Post('repositories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new repository' })
  @ApiBody({ type: CreateRepoDto })
  @ApiResponse({ status: 201, type: GitHubRepoDto })
  async createRepository(
    @Req() req: Request,
    @Body() dto: CreateRepoDto,
  ): Promise<GitHubRepoDto> {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    return this.githubService.createRepository(userId, dto.name, dto.description, dto.isPrivate);
  }

  // ============ Push/Pull Operations ============

  @Post('push')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Push app code to GitHub' })
  @ApiBody({ type: PushToGitHubDto })
  @ApiResponse({ status: 200, type: AppGitHubLinkDto })
  async pushToGitHub(
    @Req() req: Request,
    @Body() dto: PushToGitHubDto,
  ): Promise<AppGitHubLinkDto> {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    this.logger.log(`Push request: user=${userId}, app=${dto.appId}, repo=${dto.repoName}`);
    return this.githubService.pushToGitHub(userId, dto);
  }

  @Post('pull')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pull code from GitHub to app' })
  @ApiBody({ type: PullFromGitHubDto })
  @ApiResponse({ status: 200, type: AppGitHubLinkDto })
  async pullFromGitHub(
    @Req() req: Request,
    @Body() dto: PullFromGitHubDto,
  ): Promise<AppGitHubLinkDto> {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    this.logger.log(`Pull request: user=${userId}, app=${dto.appId}, repo=${dto.repoOwner}/${dto.repoName}`);
    return this.githubService.pullFromGitHub(userId, dto);
  }

  // ============ Sync Status ============

  @Get('apps/:appId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sync status for an app' })
  @ApiParam({ name: 'appId', description: 'App ID' })
  @ApiResponse({ status: 200, type: GitHubSyncStatusDto })
  async getSyncStatus(
    @Req() req: Request,
    @Param('appId') appId: string,
  ): Promise<GitHubSyncStatusDto | null> {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    return this.githubService.getSyncStatus(userId, appId);
  }

  @Get('apps/:appId/link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get GitHub link for an app' })
  @ApiParam({ name: 'appId', description: 'App ID' })
  @ApiResponse({ status: 200, type: AppGitHubLinkDto })
  async getAppLink(
    @Req() req: Request,
    @Param('appId') appId: string,
  ): Promise<AppGitHubLinkDto | null> {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    return this.githubService.getAppLink(userId, appId);
  }

  // ============ Webhook Handler ============

  @Post('webhook')
  @ApiOperation({ summary: 'GitHub webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(
    @Headers('x-github-event') event: string,
    @Headers('x-hub-signature-256') signature: string,
    @Headers('x-github-delivery') deliveryId: string,
    @Body() payload: any,
    @Req() req: RawBodyRequest<Request>,
  ) {
    this.logger.log(`Received GitHub webhook: event=${event}, delivery=${deliveryId}`);

    // Verify signature if configured
    const rawBody = req.rawBody?.toString() || JSON.stringify(payload);
    if (signature && !this.oauthService.verifyWebhookSignature(rawBody, signature)) {
      this.logger.warn('Invalid webhook signature');
      throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
    }

    // Handle different events
    switch (event) {
      case 'push':
        await this.handlePushEvent(payload);
        break;

      case 'installation':
        await this.handleInstallationEvent(payload);
        break;

      case 'ping':
        this.logger.log('Webhook ping received');
        break;

      default:
        this.logger.log(`Unhandled webhook event: ${event}`);
    }

    return { success: true, event, deliveryId };
  }

  private async handlePushEvent(payload: any) {
    const repoFullName = payload.repository?.full_name;
    const branch = payload.ref?.replace('refs/heads/', '');
    const commitSha = payload.after;
    const installationId = payload.installation?.id?.toString();

    if (!repoFullName || !branch) {
      this.logger.warn('Push event missing repo or branch');
      return;
    }

    this.logger.log(`Push event: ${repoFullName}#${branch} -> ${commitSha}`);

    // Trigger auto-sync for linked apps
    await this.githubService.handleWebhookPush(repoFullName, branch, commitSha, installationId);
  }

  private async handleInstallationEvent(payload: any) {
    const action = payload.action;
    const installationId = payload.installation?.id;

    this.logger.log(`Installation event: action=${action}, id=${installationId}`);

    // Handle uninstall
    if (action === 'deleted' || action === 'suspend') {
      // Would need to mark connections as inactive
      this.logger.log(`Installation ${installationId} was ${action}`);
    }
  }
}
