import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  SaveUIHistoryDto,
  UIHistoryResponseDto,
  SaveChatContextDto,
  ChatContextResponseDto,
  EntityType,
  ExtractionMethod,
  ContextSource,
  ContextFieldDto,
  ChatSuggestionDto,
  MergedContextResponseDto,
  GetChatContextQueryDto,
  BulkSaveChatContextDto,
  ValidateChatContextDto,
} from './dto';

// Interface for onboarding data
interface OnboardingData {
  id: string;
  user_id: string;
  account_type: string;
  display_name?: string;
  role?: string;
  primary_use_case?: string;
  industry?: string;
  company_name?: string;
  company_size?: string;
  preferred_language: string;
  preferred_currency: string;
  timezone?: string;
  country?: string;
  measurement_system: string;
  tone_preference: string;
  output_length: string;
  date_of_birth?: Date;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  fitness_goal?: string;
  dietary_preference?: string;
  income_range?: string;
  financial_goal?: string;
  connected_services: any[];
  onboarding_completed: boolean;
  onboarding_step: number;
}

// UI Type to Onboarding Field Mapping
const UI_ONBOARDING_MAPPING: Record<string, Record<string, string>> = {
  // Fitness & Health UIs
  macro_calculator: {
    weight: 'weight_kg',
    height: 'height_cm',
    goal: 'fitness_goal',
    measurement_system: 'measurement_system',
  },
  calories_tracker: {
    weight: 'weight_kg',
    dietary_preference: 'dietary_preference',
    goal: 'fitness_goal',
  },
  hydration_calculator: {
    weight: 'weight_kg',
    measurement_system: 'measurement_system',
  },
  protein_calculator: {
    weight: 'weight_kg',
    goal: 'fitness_goal',
  },
  // Finance UIs
  budget_planner: {
    currency: 'preferred_currency',
    income_range: 'income_range',
    financial_goal: 'financial_goal',
  },
  expense_tracker: {
    currency: 'preferred_currency',
  },
  tax_calculator: {
    currency: 'preferred_currency',
    country: 'country',
  },
  // Business UIs
  invoice_generator: {
    company_name: 'company_name',
    currency: 'preferred_currency',
    language: 'preferred_language',
  },
  proposal_generator: {
    company_name: 'company_name',
    industry: 'industry',
    tone: 'tone_preference',
  },
  // Personal UIs
  birthstone_finder: {
    date_of_birth: 'date_of_birth',
  },
  chinese_zodiac: {
    date_of_birth: 'date_of_birth',
  },
  life_path_number: {
    date_of_birth: 'date_of_birth',
  },
  // Default mapping for common fields
  _default: {
    language: 'preferred_language',
    currency: 'preferred_currency',
    timezone: 'timezone',
    country: 'country',
    measurement_system: 'measurement_system',
    tone: 'tone_preference',
    output_length: 'output_length',
  },
};

// Entity Type to UI Field Mapping
const ENTITY_UI_MAPPING: Record<EntityType, string[]> = {
  [EntityType.BUDGET]: ['budget', 'total_budget', 'max_budget', 'price_range'],
  [EntityType.DEADLINE]: ['deadline', 'due_date', 'target_date', 'end_date'],
  [EntityType.COMPANY_NAME]: ['company_name', 'business_name', 'organization'],
  [EntityType.PRODUCT_NAME]: ['product_name', 'product', 'item_name'],
  [EntityType.PROJECT_NAME]: ['project_name', 'project', 'campaign_name'],
  [EntityType.PERSON_NAME]: ['name', 'client_name', 'contact_name', 'recipient'],
  [EntityType.EMAIL]: ['email', 'contact_email', 'client_email'],
  [EntityType.PHONE]: ['phone', 'phone_number', 'contact_phone'],
  [EntityType.LOCATION]: ['location', 'address', 'city', 'region'],
  [EntityType.TECH_STACK]: ['technology', 'tech_stack', 'framework', 'platform'],
  [EntityType.DESIGN_STYLE]: ['style', 'design_style', 'theme', 'aesthetic'],
  [EntityType.TARGET_AUDIENCE]: ['target_audience', 'audience', 'demographic'],
  [EntityType.INDUSTRY]: ['industry', 'sector', 'business_type'],
  [EntityType.CURRENCY]: ['currency', 'currency_code'],
  [EntityType.LANGUAGE]: ['language', 'preferred_language', 'locale'],
  // Topic-based entity types for generator/writer tools
  [EntityType.TOPIC]: ['topic', 'main_topic', 'content', 'text'],
  [EntityType.INTENT]: ['intent', 'action', 'goal', 'purpose'],
  [EntityType.SUBJECT]: ['subject', 'subject_matter', 'area', 'field'],
  [EntityType.TITLE]: ['title', 'heading', 'name', 'label'],
};

@Injectable()
export class ContextService {
  private readonly logger = new Logger(ContextService.name);

  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // ONBOARDING DATA
  // ============================================

  async getOnboardingData(userId: string): Promise<OnboardingData | null> {
    try {
      return await this.db.findOne<OnboardingData>('user_onboarding', {
        user_id: userId,
      });
    } catch (error) {
      this.logger.error(`Failed to get onboarding data: ${error.message}`);
      return null;
    }
  }

  // ============================================
  // UI HISTORY
  // ============================================

  async saveUIHistory(
    userId: string,
    dto: SaveUIHistoryDto,
  ): Promise<UIHistoryResponseDto> {
    const existing = await this.db.findOne<UIHistoryResponseDto>(
      'contextual_ui_history',
      {
        user_id: userId,
        ui_type: dto.ui_type,
        ...(dto.organization_id && { organization_id: dto.organization_id }),
      },
    );

    if (existing) {
      // Update existing record
      const [updated] = await this.db.update<UIHistoryResponseDto>(
        'contextual_ui_history',
        { id: existing.id },
        {
          ui_inputs: dto.ui_inputs,
          ui_category: dto.ui_category,
          usage_count: (existing.usage_count || 0) + 1,
          last_used_at: new Date(),
          updated_at: new Date(),
        },
      );
      return updated;
    }

    // Create new record
    return await this.db.insert<UIHistoryResponseDto>('contextual_ui_history', {
      user_id: userId,
      organization_id: dto.organization_id,
      ui_type: dto.ui_type,
      ui_category: dto.ui_category,
      ui_inputs: dto.ui_inputs,
      usage_count: 1,
      last_used_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  async getUIHistory(
    userId: string,
    uiType: string,
    organizationId?: string,
  ): Promise<UIHistoryResponseDto | null> {
    try {
      const conditions: Record<string, any> = {
        user_id: userId,
        ui_type: uiType,
      };

      if (organizationId) {
        conditions.organization_id = organizationId;
      }

      return await this.db.findOne<UIHistoryResponseDto>(
        'contextual_ui_history',
        conditions,
      );
    } catch (error) {
      this.logger.error(`Failed to get UI history: ${error.message}`);
      return null;
    }
  }

  async getUserUIHistories(
    userId: string,
    organizationId?: string,
    limit = 50,
  ): Promise<UIHistoryResponseDto[]> {
    try {
      const conditions: Record<string, any> = { user_id: userId };
      if (organizationId) {
        conditions.organization_id = organizationId;
      }

      return await this.db.findMany<UIHistoryResponseDto>(
        'contextual_ui_history',
        conditions,
        { orderBy: 'last_used_at', order: 'DESC', limit },
      );
    } catch (error) {
      this.logger.error(`Failed to get UI histories: ${error.message}`);
      return [];
    }
  }

  // ============================================
  // CHAT CONTEXT EXTRACTION
  // ============================================

  async saveChatContext(
    userId: string,
    dto: SaveChatContextDto,
  ): Promise<ChatContextResponseDto> {
    // Check for existing entity of same type with similar value
    const existing = await this.db.findOne<ChatContextResponseDto>(
      'chat_extracted_context',
      {
        user_id: userId,
        entity_type: dto.entity_type,
        is_active: true,
      },
    );

    if (existing && existing.entity_value === dto.entity_value) {
      // Update confidence if same value
      const [updated] = await this.db.update<ChatContextResponseDto>(
        'chat_extracted_context',
        { id: existing.id },
        {
          confidence: Math.max(existing.confidence, dto.confidence),
          updated_at: new Date(),
        },
      );
      return updated;
    }

    // Create new entity (mark old one as inactive if exists)
    if (existing) {
      await this.db.update(
        'chat_extracted_context',
        { id: existing.id },
        { is_active: false },
      );
    }

    // Set expiration (30 days for chat context)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    return await this.db.insert<ChatContextResponseDto>(
      'chat_extracted_context',
      {
        user_id: userId,
        organization_id: dto.organization_id,
        project_id: dto.project_id,
        conversation_id: dto.conversation_id,
        source_message_id: dto.source_message_id,
        entity_type: dto.entity_type,
        entity_value: dto.entity_value,
        entity_metadata: dto.entity_metadata || {},
        confidence: dto.confidence,
        extraction_method: dto.extraction_method || ExtractionMethod.AI,
        validated_by_user: false,
        extracted_at: new Date(),
        expires_at: expiresAt,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    );
  }

  async bulkSaveChatContext(
    userId: string,
    dto: BulkSaveChatContextDto,
  ): Promise<ChatContextResponseDto[]> {
    const results: ChatContextResponseDto[] = [];

    for (const entity of dto.entities) {
      const result = await this.saveChatContext(userId, {
        conversation_id: dto.conversation_id,
        organization_id: dto.organization_id,
        entity_type: entity.entity_type,
        entity_value: entity.entity_value,
        confidence: entity.confidence,
        entity_metadata: entity.entity_metadata,
      });
      results.push(result);
    }

    return results;
  }

  async validateChatContext(
    userId: string,
    dto: ValidateChatContextDto,
  ): Promise<ChatContextResponseDto | null> {
    const [updated] = await this.db.update<ChatContextResponseDto>(
      'chat_extracted_context',
      { id: dto.entity_id, user_id: userId },
      {
        validated_by_user: dto.is_valid,
        is_active: dto.is_valid,
        updated_at: new Date(),
      },
    );
    return updated || null;
  }

  async getChatContext(
    userId: string,
    query: GetChatContextQueryDto,
  ): Promise<ChatContextResponseDto[]> {
    try {
      // Build custom query for more complex filtering
      const params: any[] = [userId];
      let paramIndex = 2;
      let whereClause = '"user_id" = $1';

      if (query.organization_id) {
        whereClause += ` AND "organization_id" = $${paramIndex}`;
        params.push(query.organization_id);
        paramIndex++;
      }

      if (query.project_id) {
        whereClause += ` AND "project_id" = $${paramIndex}`;
        params.push(query.project_id);
        paramIndex++;
      }

      if (query.entity_types && query.entity_types.length > 0) {
        whereClause += ` AND "entity_type" = ANY($${paramIndex})`;
        params.push(query.entity_types);
        paramIndex++;
      }

      if (query.min_confidence !== undefined) {
        whereClause += ` AND "confidence" >= $${paramIndex}`;
        params.push(query.min_confidence);
        paramIndex++;
      }

      if (query.validated_only) {
        whereClause += ' AND "validated_by_user" = true';
      }

      if (query.active_only !== false) {
        whereClause += ' AND "is_active" = true';
        whereClause += ' AND ("expires_at" IS NULL OR "expires_at" > NOW())';
      }

      const limit = query.limit || 100;
      const sql = `
        SELECT * FROM "chat_extracted_context"
        WHERE ${whereClause}
        ORDER BY "confidence" DESC, "extracted_at" DESC
        LIMIT ${limit}
      `;

      const result = await this.db.query<ChatContextResponseDto>(sql, params);
      return result.rows;
    } catch (error) {
      this.logger.error(`Failed to get chat context: ${error.message}`);
      return [];
    }
  }

  // ============================================
  // MERGED CONTEXT (The Main Method)
  // ============================================

  async getMergedContext(
    userId: string,
    uiType: string,
    organizationId?: string,
    projectId?: string,
  ): Promise<MergedContextResponseDto> {
    const context: Record<string, ContextFieldDto> = {};
    const suggestions: ChatSuggestionDto[] = [];

    // Priority Order: UI History > Onboarding > Chat (highest to lowest)

    // 1. Get UI History (HIGHEST PRIORITY)
    const uiHistory = await this.getUIHistory(userId, uiType, organizationId);

    if (uiHistory?.ui_inputs) {
      for (const [field, value] of Object.entries(uiHistory.ui_inputs)) {
        if (value !== null && value !== undefined && value !== '') {
          context[field] = {
            field,
            value,
            source: ContextSource.HISTORY,
            confidence: 1.0, // History is always 100% confidence
            showBadge: true,
            allowOverride: true,
          };
        }
      }
    }

    // 2. Get Onboarding Data (MEDIUM PRIORITY)
    const onboarding = await this.getOnboardingData(userId);

    if (onboarding) {
      const mapping = {
        ...UI_ONBOARDING_MAPPING._default,
        ...(UI_ONBOARDING_MAPPING[uiType] || {}),
      };

      for (const [uiField, onboardingField] of Object.entries(mapping)) {
        // Only apply if not already set by history
        if (!context[uiField]) {
          const value = onboarding[onboardingField as keyof OnboardingData];
          if (value !== null && value !== undefined && value !== '') {
            context[uiField] = {
              field: uiField,
              value,
              source: ContextSource.ONBOARDING,
              confidence: 0.95, // Onboarding is high but not 100%
              showBadge: true,
              allowOverride: true,
            };
          }
        }
      }
    }

    // 3. Get Chat Context (LOWEST PRIORITY - only as suggestions)
    const chatEntities = await this.getChatContext(userId, {
      organization_id: organizationId,
      project_id: projectId,
      min_confidence: 0.85, // Only high confidence entities
      active_only: true,
    });

    for (const entity of chatEntities) {
      const relevantFields = ENTITY_UI_MAPPING[entity.entity_type] || [];

      for (const field of relevantFields) {
        // Chat context is NEVER auto-applied, only suggested
        if (!context[field]) {
          suggestions.push({
            field,
            suggestedValue: entity.entity_value,
            confidence: entity.confidence,
            sourceDescription: `Extracted from chat${entity.validated_by_user ? ' (verified)' : ''}`,
            extractedFrom: entity.source_message_id,
            entityId: entity.id,
          });
        }
      }
    }

    return {
      context,
      suggestions,
      uiType,
      lastUsedAt: uiHistory?.last_used_at,
      usageCount: uiHistory?.usage_count || 0,
    };
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  async clearUIHistory(
    userId: string,
    uiType?: string,
    organizationId?: string,
  ): Promise<number> {
    const conditions: Record<string, any> = { user_id: userId };

    if (uiType) {
      conditions.ui_type = uiType;
    }

    if (organizationId) {
      conditions.organization_id = organizationId;
    }

    return await this.db.delete('contextual_ui_history', conditions);
  }

  async clearChatContext(
    userId: string,
    entityTypes?: EntityType[],
    projectId?: string,
  ): Promise<number> {
    // Soft delete - mark as inactive
    const conditions: Record<string, any> = {
      user_id: userId,
      is_active: true,
    };

    if (projectId) {
      conditions.project_id = projectId;
    }

    // For entity types, we need custom query
    if (entityTypes && entityTypes.length > 0) {
      const sql = `
        UPDATE "chat_extracted_context"
        SET "is_active" = false, "updated_at" = NOW()
        WHERE "user_id" = $1 AND "entity_type" = ANY($2) AND "is_active" = true
      `;
      const result = await this.db.query(sql, [userId, entityTypes]);
      return result.rowCount;
    }

    const result = await this.db.update(
      'chat_extracted_context',
      conditions,
      { is_active: false, updated_at: new Date() },
    );
    return result.length;
  }

  async getContextStats(userId: string): Promise<{
    historyCount: number;
    chatEntitiesCount: number;
    onboardingComplete: boolean;
    mostUsedUIs: { ui_type: string; usage_count: number }[];
  }> {
    try {
      // Get history count
      const historyResult = await this.db.query(
        'SELECT COUNT(*) as count FROM "contextual_ui_history" WHERE "user_id" = $1',
        [userId],
      );

      // Get chat entities count
      const chatResult = await this.db.query(
        'SELECT COUNT(*) as count FROM "chat_extracted_context" WHERE "user_id" = $1 AND "is_active" = true',
        [userId],
      );

      // Get onboarding status
      const onboarding = await this.getOnboardingData(userId);

      // Get most used UIs
      const mostUsedResult = await this.db.query<{
        ui_type: string;
        usage_count: number;
      }>(
        `SELECT "ui_type", "usage_count"
         FROM "contextual_ui_history"
         WHERE "user_id" = $1
         ORDER BY "usage_count" DESC
         LIMIT 10`,
        [userId],
      );

      return {
        historyCount: parseInt(historyResult.rows[0]?.count || '0', 10),
        chatEntitiesCount: parseInt(chatResult.rows[0]?.count || '0', 10),
        onboardingComplete: onboarding?.onboarding_completed || false,
        mostUsedUIs: mostUsedResult.rows,
      };
    } catch (error) {
      this.logger.error(`Failed to get context stats: ${error.message}`);
      return {
        historyCount: 0,
        chatEntitiesCount: 0,
        onboardingComplete: false,
        mostUsedUIs: [],
      };
    }
  }
}
