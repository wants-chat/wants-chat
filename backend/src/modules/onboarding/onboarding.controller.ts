import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Req,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnboardingService } from './onboarding.service';
import {
  CompleteOnboardingDto,
  UpdateOnboardingStepDto,
} from './dto';

interface AuthenticatedRequest extends Request {
  user: { sub: string; userId?: string };
}

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  // ============================================
  // GET STATUS
  // ============================================

  @Get('status')
  async getStatus(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub || req.user.userId;
    const status = await this.onboardingService.getOnboardingStatus(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Onboarding status retrieved',
      data: status,
    };
  }

  // ============================================
  // GET FULL ONBOARDING DATA
  // ============================================

  @Get()
  async getOnboarding(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub || req.user.userId;
    const onboarding = await this.onboardingService.getOnboarding(userId);

    return {
      statusCode: HttpStatus.OK,
      message: onboarding ? 'Onboarding data retrieved' : 'No onboarding data found',
      data: onboarding,
    };
  }

  // ============================================
  // SAVE COMPLETE ONBOARDING
  // ============================================

  @Post()
  async saveOnboarding(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CompleteOnboardingDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.onboardingService.saveOnboarding(userId, dto, false);

    return {
      statusCode: HttpStatus.OK,
      message: 'Onboarding data saved',
      data: result,
    };
  }

  @Post('complete')
  async completeOnboarding(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CompleteOnboardingDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.onboardingService.saveOnboarding(userId, dto, true);

    return {
      statusCode: HttpStatus.OK,
      message: 'Onboarding completed successfully',
      data: result,
    };
  }

  // ============================================
  // UPDATE STEP (Incremental)
  // ============================================

  @Patch('step')
  async updateStep(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateOnboardingStepDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.onboardingService.updateOnboardingStep(userId, dto);

    return {
      statusCode: HttpStatus.OK,
      message: `Onboarding step ${dto.step} saved`,
      data: result,
    };
  }

  // ============================================
  // SKIP ONBOARDING
  // ============================================

  @Post('skip')
  async skipOnboarding(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.onboardingService.skipOnboarding(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Onboarding skipped',
      data: result,
    };
  }

  // ============================================
  // RESET ONBOARDING
  // ============================================

  @Post('reset')
  async resetOnboarding(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub || req.user.userId;
    const success = await this.onboardingService.resetOnboarding(userId);

    return {
      statusCode: HttpStatus.OK,
      message: success ? 'Onboarding reset' : 'No onboarding data to reset',
      data: { success },
    };
  }

  // ============================================
  // UPDATE SPECIFIC FIELD
  // ============================================

  @Patch('field/:field')
  async updateField(
    @Req() req: AuthenticatedRequest,
    @Param('field') field: string,
    @Body() body: { value: any },
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.onboardingService.updateField(
      userId,
      field,
      body.value,
    );

    return {
      statusCode: HttpStatus.OK,
      message: `Field ${field} updated`,
      data: result,
    };
  }

  // ============================================
  // CONNECTED SERVICES
  // ============================================

  @Post('services/:service')
  async addConnectedService(
    @Req() req: AuthenticatedRequest,
    @Param('service') service: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.onboardingService.addConnectedService(
      userId,
      service,
    );

    return {
      statusCode: HttpStatus.OK,
      message: `Service ${service} connected`,
      data: result,
    };
  }

  @Patch('services/:service/remove')
  async removeConnectedService(
    @Req() req: AuthenticatedRequest,
    @Param('service') service: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.onboardingService.removeConnectedService(
      userId,
      service,
    );

    return {
      statusCode: HttpStatus.OK,
      message: `Service ${service} disconnected`,
      data: result,
    };
  }

  // ============================================
  // SYNC ORGANIZATION FROM COMPANY NAME
  // ============================================

  @Post('sync-organization')
  async syncOrganization(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.onboardingService.syncOrganizationFromOnboarding(userId);

    return {
      statusCode: HttpStatus.OK,
      message: result.created
        ? `Organization "${result.organizationName}" created`
        : result.message || 'No action needed',
      data: result,
    };
  }
}
