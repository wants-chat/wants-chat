import { Controller, Post, Body, HttpException, HttpStatus, Logger, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { GenerationService } from './generation.service';
import { GenerateDto, AnalyzeDto, DetectDto, DeployDto, GenerateAndDeployDto } from './dto/generate.dto';
import { DeploymentService } from '../services/deployment.service';
import { AuthGuard } from '../../../common/guards/auth.guard';

@ApiTags('generation')
@Controller('generate')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class GenerationController {
  private readonly logger = new Logger(GenerationController.name);

  constructor(
    private readonly generationService: GenerationService,
    private readonly deploymentService: DeploymentService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Generate a complete app from a prompt',
    description: 'Generates React frontend + React Native mobile app + Hono backend following Fluxez patterns',
  })
  @ApiBody({ type: GenerateDto })
  @ApiResponse({
    status: 201,
    description: 'App generated successfully',
    schema: {
      example: {
        success: true,
        data: {
          appId: 'uuid',
          appName: 'Generated App',
          appType: 'ecommerce',
          features: ['user-auth', 'product-catalog'],
          outputPath: './generated/uuid',
          frameworks: ['react', 'hono', 'react-native'],
          stats: { files: 45, tables: 5, generationTime: 1500, mobileFiles: 34 },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async generate(@Body() dto: GenerateDto, @Request() req: any) {
    // Auto-populate userId from authenticated user if not provided
    if (!dto.userId && req.user) {
      dto.userId = req.user.userId || req.user.id || req.user.sub;
      this.logger.log(`Auto-set userId from auth: ${dto.userId}`);
    }

    this.logger.log(`Generating app from prompt: ${dto.prompt.substring(0, 50)}...`);

    try {
      return await this.generationService.generate(dto);
    } catch (error: any) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('analyze')
  @ApiOperation({
    summary: 'Analyze a prompt without generating files',
    description: 'Returns detected app type, features, and structure preview',
  })
  @ApiBody({ type: AnalyzeDto })
  @ApiResponse({
    status: 200,
    description: 'Analysis complete',
    schema: {
      example: {
        success: true,
        data: {
          appType: { id: 'ecommerce', name: 'E-commerce Store', confidence: 0.85 },
          features: [{ id: 'user-auth', name: 'User Authentication' }],
          structure: { pages: [], components: [], entities: [] },
          customization: { branding: {}, metadata: {} },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async analyze(@Body() dto: AnalyzeDto) {
    try {
      return await this.generationService.analyze(dto);
    } catch (error: any) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('detect')
  @ApiOperation({
    summary: 'Detect app type only (lightweight)',
    description: 'Quick detection of app type from prompt',
  })
  @ApiBody({ type: DetectDto })
  @ApiResponse({
    status: 200,
    description: 'Detection complete',
    schema: {
      example: {
        success: true,
        data: {
          appType: 'ecommerce',
          name: 'E-commerce Store',
          confidence: 0.85,
          matchMethod: 'keyword',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async detect(@Body() dto: DetectDto) {
    try {
      return await this.generationService.detect(dto);
    } catch (error: any) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('deploy')
  @ApiOperation({
    summary: 'Deploy a generated app to Cloudflare',
    description: 'Deploys backend to Workers and frontend to Pages',
  })
  @ApiBody({ type: DeployDto })
  @ApiResponse({
    status: 200,
    description: 'Deployment initiated',
    schema: {
      example: {
        success: true,
        appId: 'uuid',
        backendUrl: 'https://app-api.fluxez.workers.dev',
        frontendUrl: 'https://app.pages.dev',
        steps: [{ name: 'deploy-backend', status: 'completed' }],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async deploy(@Body() dto: DeployDto) {
    this.logger.log(`Deploying app: ${dto.appId}`);

    if (!this.deploymentService.isConfigured()) {
      throw new HttpException(
        { success: false, error: 'Cloudflare credentials not configured' },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.deploymentService.deploy(dto.appPath, dto.appId);
    } catch (error: any) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('generate-and-deploy')
  @ApiOperation({
    summary: 'Generate and deploy an app in one step',
    description: 'Generates the app and immediately deploys to Cloudflare',
  })
  @ApiBody({ type: GenerateAndDeployDto })
  @ApiResponse({
    status: 201,
    description: 'App generated and deployed',
    schema: {
      example: {
        success: true,
        generation: {
          appId: 'uuid',
          appName: 'My App',
          outputPath: './generated/uuid',
        },
        deployment: {
          backendUrl: 'https://app-api.fluxez.workers.dev',
          frontendUrl: 'https://app.pages.dev',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async generateAndDeploy(@Body() dto: GenerateAndDeployDto, @Request() req: any) {
    // Get userId from authenticated user
    const userId = req.user?.userId || req.user?.id || req.user?.sub;

    this.logger.log(`Generate and deploy: ${dto.prompt.substring(0, 50)}...`);

    try {
      // Step 1: Generate the app
      const genResult = await this.generationService.generate({
        prompt: dto.prompt,
        appName: dto.appName,
        userId, // Auto-populate from auth
      });

      if (!genResult.success) {
        throw new Error('Generation failed');
      }

      // Step 2: Deploy (if requested and configured)
      let deployResult = null;
      if (dto.deploy !== false && this.deploymentService.isConfigured()) {
        this.logger.log('Auto-deploying generated app...');
        deployResult = await this.deploymentService.deploy(
          genResult.data.outputPath,
          genResult.data.appId,
        );
      }

      return {
        success: true,
        generation: {
          appId: genResult.data.appId,
          appName: genResult.data.appName,
          appType: genResult.data.appType,
          outputPath: genResult.data.outputPath,
          features: genResult.data.features,
          stats: genResult.data.stats,
        },
        deployment: deployResult
          ? {
              success: deployResult.success,
              backendUrl: deployResult.backendUrl,
              frontendUrl: deployResult.frontendUrl,
              steps: deployResult.steps,
            }
          : null,
      };
    } catch (error: any) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('deployment-status')
  @ApiOperation({
    summary: 'Check deployment configuration status',
    description: 'Returns whether Cloudflare credentials are configured',
  })
  @ApiResponse({
    status: 200,
    description: 'Deployment status',
    schema: {
      example: {
        configured: true,
        message: 'Cloudflare deployment is configured',
      },
    },
  })
  async deploymentStatus() {
    const configured = this.deploymentService.isConfigured();
    return {
      configured,
      message: configured
        ? 'Cloudflare deployment is configured'
        : 'Cloudflare API token or account ID not set. Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID environment variables.',
    };
  }
}
