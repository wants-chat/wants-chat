import { Injectable, Logger, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { snakeCase } from 'change-case';
import { DatabaseService } from '../database/database.service';
import { OrganizationService } from '../organization/organization.service';
import {
  CompleteOnboardingDto,
  OnboardingResponseDto,
  OnboardingStatusDto,
  UpdateOnboardingStepDto,
  AccountType,
  MeasurementSystem,
  TonePreference,
  OutputLength,
} from './dto';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly db: DatabaseService,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
  ) {}

  // List of valid database columns for user_onboarding table
  private readonly validColumns = new Set([
    'account_type',
    'display_name',
    'role',
    'primary_use_case',
    'industry',
    'company_name',
    'company_size',
    'preferred_language',
    'preferred_currency',
    'timezone',
    'country',
    'measurement_system',
    'tone_preference',
    'output_length',
    'date_of_birth',
    'gender',
    'height_cm',
    'weight_kg',
    'fitness_goal',
    'dietary_preference',
    'income_range',
    'financial_goal',
    'connected_services',
    'onboarding_completed',
    'onboarding_step',
    'onboarding_completed_at',
    'created_at',
    'updated_at',
  ]);

  // Filter and convert DTO to valid database columns using change-case
  private sanitizeData(data: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const snakeKey = snakeCase(key);
      if (this.validColumns.has(snakeKey) && value !== undefined) {
        result[snakeKey] = value;
      }
    }
    return result;
  }

  // ============================================
  // CREATE ORGANIZATION FROM COMPANY NAME
  // ============================================

  /**
   * Creates an organization from the company_name if:
   * - company_name is provided
   * - user doesn't already have an organization with that name
   */
  private async ensureOrganizationFromCompanyName(
    userId: string,
    companyName: string | undefined,
  ): Promise<void> {
    if (!companyName || companyName.trim() === '') {
      return;
    }

    try {
      // Check if user already has organizations
      const existingOrgs = await this.organizationService.getUserOrganizations(userId);

      // Check if an organization with this name already exists for this user
      const nameExists = existingOrgs.some(
        (org) => org.name.toLowerCase() === companyName.toLowerCase(),
      );

      if (!nameExists) {
        this.logger.log(`Creating organization "${companyName}" for user ${userId} from onboarding`);
        await this.organizationService.createOrganization(userId, {
          name: companyName,
          description: `Organization created from onboarding`,
        });
      } else {
        this.logger.log(`Organization "${companyName}" already exists for user ${userId}`);
      }
    } catch (error) {
      // Log error but don't fail onboarding
      this.logger.error(`Failed to create organization from company_name: ${error.message}`);
    }
  }

  // ============================================
  // GET ONBOARDING STATUS
  // ============================================

  async getOnboardingStatus(userId: string): Promise<OnboardingStatusDto> {
    const onboarding = await this.db.findOne<OnboardingResponseDto>(
      'user_onboarding',
      { user_id: userId },
    );

    if (!onboarding) {
      return {
        onboarding_completed: false,
        onboarding_step: 0,
      };
    }

    return {
      onboarding_completed: onboarding.onboarding_completed,
      onboarding_step: onboarding.onboarding_step,
      onboarding_completed_at: onboarding.onboarding_completed_at,
    };
  }

  // ============================================
  // GET FULL ONBOARDING DATA
  // ============================================

  async getOnboarding(userId: string): Promise<OnboardingResponseDto | null> {
    return await this.db.findOne<OnboardingResponseDto>('user_onboarding', {
      user_id: userId,
    });
  }

  // ============================================
  // CREATE OR UPDATE ONBOARDING
  // ============================================

  async saveOnboarding(
    userId: string,
    dto: CompleteOnboardingDto,
    markComplete = false,
  ): Promise<OnboardingResponseDto> {
    const existing = await this.getOnboarding(userId);

    // Sanitize DTO to snake_case with valid columns only
    const sanitizedDto = this.sanitizeData(dto as any);

    const data = {
      ...sanitizedDto,
      updated_at: new Date(),
      ...(markComplete && {
        onboarding_completed: true,
        onboarding_completed_at: new Date(),
        onboarding_step: 5,
      }),
    };

    if (existing) {
      // Update existing record
      const [updated] = await this.db.update<OnboardingResponseDto>(
        'user_onboarding',
        { user_id: userId },
        data,
      );

      // Create organization from company_name if provided
      if (dto.company_name) {
        await this.ensureOrganizationFromCompanyName(userId, dto.company_name);
      }

      return updated;
    }

    // Create new record with defaults
    const newOnboarding = await this.db.insert<OnboardingResponseDto>(
      'user_onboarding',
      {
        user_id: userId,
        account_type: dto.account_type || AccountType.INDIVIDUAL,
        display_name: dto.display_name,
        role: dto.role,
        primary_use_case: dto.primary_use_case,
        industry: dto.industry,
        company_name: dto.company_name,
        company_size: dto.company_size,
        preferred_language: dto.preferred_language || 'en',
        preferred_currency: dto.preferred_currency || 'USD',
        timezone: dto.timezone,
        country: dto.country,
        measurement_system: dto.measurement_system || MeasurementSystem.METRIC,
        tone_preference: dto.tone_preference || TonePreference.PROFESSIONAL,
        output_length: dto.output_length || OutputLength.BALANCED,
        date_of_birth: dto.date_of_birth,
        gender: dto.gender,
        height_cm: dto.height_cm,
        weight_kg: dto.weight_kg,
        fitness_goal: dto.fitness_goal,
        dietary_preference: dto.dietary_preference,
        income_range: dto.income_range,
        financial_goal: dto.financial_goal,
        connected_services: dto.connected_services || [],
        onboarding_completed: markComplete,
        onboarding_step: markComplete ? 5 : 0,
        onboarding_completed_at: markComplete ? new Date() : null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    );

    // Create organization from company_name if provided
    if (dto.company_name) {
      await this.ensureOrganizationFromCompanyName(userId, dto.company_name);
    }

    return newOnboarding;
  }

  // ============================================
  // UPDATE STEP (Incremental Onboarding)
  // ============================================

  async updateOnboardingStep(
    userId: string,
    dto: UpdateOnboardingStepDto,
  ): Promise<OnboardingResponseDto> {
    const existing = await this.getOnboarding(userId);

    // Sanitize and convert DTO data to snake_case with valid columns only
    const sanitizedData = dto.data ? this.sanitizeData(dto.data) : {};

    const updateData = {
      ...sanitizedData,
      onboarding_step: dto.step,
      updated_at: new Date(),
    };

    // Mark complete if step is 5
    if (dto.step >= 5) {
      updateData['onboarding_completed'] = true;
      updateData['onboarding_completed_at'] = new Date();
    }

    // Get company_name from dto.data for organization creation
    const companyName = dto.data?.company_name || dto.data?.companyName;

    if (existing) {
      const [updated] = await this.db.update<OnboardingResponseDto>(
        'user_onboarding',
        { user_id: userId },
        updateData,
      );

      // Create organization from company_name if provided
      if (companyName) {
        await this.ensureOrganizationFromCompanyName(userId, companyName);
      }

      return updated;
    }

    // Sanitize data for insert as well
    const insertSanitized = dto.data ? this.sanitizeData(dto.data) : {};

    // Create new record if doesn't exist
    const newOnboarding = await this.db.insert<OnboardingResponseDto>(
      'user_onboarding',
      {
        user_id: userId,
        account_type: AccountType.INDIVIDUAL,
        preferred_language: 'en',
        preferred_currency: 'USD',
        measurement_system: MeasurementSystem.METRIC,
        tone_preference: TonePreference.PROFESSIONAL,
        output_length: OutputLength.BALANCED,
        connected_services: [],
        ...insertSanitized,
        onboarding_step: dto.step,
        onboarding_completed: dto.step >= 5,
        onboarding_completed_at: dto.step >= 5 ? new Date() : null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    );

    // Create organization from company_name if provided
    if (companyName) {
      await this.ensureOrganizationFromCompanyName(userId, companyName);
    }

    return newOnboarding;
  }

  // ============================================
  // SKIP ONBOARDING
  // ============================================

  async skipOnboarding(userId: string): Promise<OnboardingResponseDto> {
    const existing = await this.getOnboarding(userId);

    if (existing) {
      const [updated] = await this.db.update<OnboardingResponseDto>(
        'user_onboarding',
        { user_id: userId },
        {
          onboarding_completed: true,
          onboarding_completed_at: new Date(),
          updated_at: new Date(),
        },
      );
      return updated;
    }

    // Create minimal record
    return await this.db.insert<OnboardingResponseDto>('user_onboarding', {
      user_id: userId,
      account_type: AccountType.INDIVIDUAL,
      preferred_language: 'en',
      preferred_currency: 'USD',
      measurement_system: MeasurementSystem.METRIC,
      tone_preference: TonePreference.PROFESSIONAL,
      output_length: OutputLength.BALANCED,
      connected_services: [],
      onboarding_completed: true,
      onboarding_step: 0,
      onboarding_completed_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  // ============================================
  // RESET ONBOARDING
  // ============================================

  async resetOnboarding(userId: string): Promise<boolean> {
    const existing = await this.getOnboarding(userId);

    if (!existing) {
      return false;
    }

    await this.db.update(
      'user_onboarding',
      { user_id: userId },
      {
        onboarding_completed: false,
        onboarding_step: 0,
        onboarding_completed_at: null,
        updated_at: new Date(),
      },
    );

    return true;
  }

  // ============================================
  // UPDATE SPECIFIC FIELDS
  // ============================================

  async updateField(
    userId: string,
    field: string,
    value: any,
  ): Promise<OnboardingResponseDto | null> {
    const existing = await this.getOnboarding(userId);

    if (!existing) {
      throw new NotFoundException('Onboarding record not found');
    }

    const [updated] = await this.db.update<OnboardingResponseDto>(
      'user_onboarding',
      { user_id: userId },
      {
        [field]: value,
        updated_at: new Date(),
      },
    );

    return updated;
  }

  // ============================================
  // ADD/REMOVE CONNECTED SERVICES
  // ============================================

  async addConnectedService(
    userId: string,
    service: string,
  ): Promise<OnboardingResponseDto> {
    const existing = await this.getOnboarding(userId);

    if (!existing) {
      throw new NotFoundException('Onboarding record not found');
    }

    const services = existing.connected_services || [];
    const alreadyConnected = services.some((s) => s.service === service);

    if (!alreadyConnected) {
      services.push({
        service,
        connected_at: new Date().toISOString(),
      });
    }

    const [updated] = await this.db.update<OnboardingResponseDto>(
      'user_onboarding',
      { user_id: userId },
      {
        connected_services: services,
        updated_at: new Date(),
      },
    );

    return updated;
  }

  async removeConnectedService(
    userId: string,
    service: string,
  ): Promise<OnboardingResponseDto> {
    const existing = await this.getOnboarding(userId);

    if (!existing) {
      throw new NotFoundException('Onboarding record not found');
    }

    const services = (existing.connected_services || []).filter(
      (s) => s.service !== service,
    );

    const [updated] = await this.db.update<OnboardingResponseDto>(
      'user_onboarding',
      { user_id: userId },
      {
        connected_services: services,
        updated_at: new Date(),
      },
    );

    return updated;
  }

  // ============================================
  // SYNC ORGANIZATION FROM ONBOARDING
  // ============================================

  /**
   * Sync organization from user's onboarding company_name
   * Creates organization if company_name exists but no org with that name exists
   */
  async syncOrganizationFromOnboarding(userId: string): Promise<{
    created: boolean;
    organizationName?: string;
    organizationId?: string;
    message?: string;
  }> {
    const onboarding = await this.getOnboarding(userId);

    if (!onboarding) {
      return {
        created: false,
        message: 'No onboarding data found',
      };
    }

    const companyName = onboarding.company_name;

    if (!companyName || companyName.trim() === '') {
      return {
        created: false,
        message: 'No company name set in onboarding',
      };
    }

    try {
      // Check if user already has organizations
      const existingOrgs = await this.organizationService.getUserOrganizations(userId);

      // Check if an organization with this name already exists for this user
      const existingOrg = existingOrgs.find(
        (org) => org.name.toLowerCase() === companyName.toLowerCase(),
      );

      if (existingOrg) {
        return {
          created: false,
          organizationName: existingOrg.name,
          organizationId: existingOrg.id,
          message: 'Organization already exists',
        };
      }

      // Create new organization
      this.logger.log(`Syncing: Creating organization "${companyName}" for user ${userId}`);
      const newOrg = await this.organizationService.createOrganization(userId, {
        name: companyName,
        description: `Organization synced from onboarding`,
      });

      return {
        created: true,
        organizationName: newOrg.name,
        organizationId: newOrg.id,
      };
    } catch (error) {
      this.logger.error(`Failed to sync organization: ${error.message}`);
      return {
        created: false,
        message: `Failed to sync: ${error.message}`,
      };
    }
  }
}
