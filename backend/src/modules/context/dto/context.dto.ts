import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsObject,
  IsUUID,
  IsArray,
  Min,
  Max,
} from 'class-validator';

// ============================================
// UI HISTORY DTOs
// ============================================

export class SaveUIHistoryDto {
  @IsString()
  ui_type: string;

  @IsString()
  @IsOptional()
  ui_category?: string;

  @IsObject()
  ui_inputs: Record<string, any>;

  @IsUUID()
  @IsOptional()
  organization_id?: string;
}

export class GetUIHistoryDto {
  @IsString()
  ui_type: string;

  @IsUUID()
  @IsOptional()
  organization_id?: string;
}

export class UIHistoryResponseDto {
  id: string;
  user_id: string;
  organization_id?: string;
  ui_type: string;
  ui_category?: string;
  ui_inputs: Record<string, any>;
  usage_count: number;
  last_used_at: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// CHAT EXTRACTED CONTEXT DTOs
// ============================================

export enum EntityType {
  BUDGET = 'budget',
  DEADLINE = 'deadline',
  COMPANY_NAME = 'company_name',
  PRODUCT_NAME = 'product_name',
  PROJECT_NAME = 'project_name',
  PERSON_NAME = 'person_name',
  EMAIL = 'email',
  PHONE = 'phone',
  LOCATION = 'location',
  TECH_STACK = 'tech_stack',
  DESIGN_STYLE = 'design_style',
  TARGET_AUDIENCE = 'target_audience',
  INDUSTRY = 'industry',
  CURRENCY = 'currency',
  LANGUAGE = 'language',
  // Topic-based extraction for generator/writer tools
  TOPIC = 'topic',
  INTENT = 'intent',
  SUBJECT = 'subject',
  TITLE = 'title',
}

export enum ExtractionMethod {
  AI = 'ai',
  EXPLICIT = 'explicit',
  INFERRED = 'inferred',
}

export class ExtractedEntityDto {
  @IsEnum(EntityType)
  entity_type: EntityType;

  @IsString()
  entity_value: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;

  @IsObject()
  @IsOptional()
  entity_metadata?: Record<string, any>;
}

export class SaveChatContextDto {
  @IsUUID()
  conversation_id: string;

  @IsUUID()
  @IsOptional()
  source_message_id?: string;

  @IsEnum(EntityType)
  entity_type: EntityType;

  @IsString()
  entity_value: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;

  @IsObject()
  @IsOptional()
  entity_metadata?: Record<string, any>;

  @IsEnum(ExtractionMethod)
  @IsOptional()
  extraction_method?: ExtractionMethod;

  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsUUID()
  @IsOptional()
  project_id?: string;
}

export class ValidateChatContextDto {
  @IsUUID()
  entity_id: string;

  @IsBoolean()
  is_valid: boolean;
}

export class ChatContextResponseDto {
  id: string;
  user_id: string;
  organization_id?: string;
  project_id?: string;
  conversation_id?: string;
  source_message_id?: string;
  entity_type: EntityType;
  entity_value: string;
  entity_metadata: Record<string, any>;
  confidence: number;
  extraction_method: ExtractionMethod;
  validated_by_user: boolean;
  extracted_at: string;
  expires_at?: string;
  is_active: boolean;
}

// ============================================
// MERGED CONTEXT DTOs
// ============================================

export enum ContextSource {
  DEFAULT = 'default',
  ONBOARDING = 'onboarding',
  HISTORY = 'history',
  CHAT = 'chat',
}

export class ContextFieldDto {
  field: string;
  value: any;
  source: ContextSource;
  confidence: number;
  showBadge: boolean;
  allowOverride: boolean;
}

export class ChatSuggestionDto {
  field: string;
  suggestedValue: any;
  confidence: number;
  sourceDescription: string;
  extractedFrom?: string;
  entityId: string;
}

export class GetMergedContextDto {
  @IsString()
  ui_type: string;

  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsUUID()
  @IsOptional()
  project_id?: string;
}

export class MergedContextResponseDto {
  context: Record<string, ContextFieldDto>;
  suggestions: ChatSuggestionDto[];
  uiType: string;
  lastUsedAt?: string;
  usageCount: number;
}

// ============================================
// CONTEXT QUERY DTOs
// ============================================

export class GetChatContextQueryDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  entity_types?: EntityType[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  min_confidence?: number;

  @IsBoolean()
  @IsOptional()
  validated_only?: boolean;

  @IsBoolean()
  @IsOptional()
  active_only?: boolean;

  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsUUID()
  @IsOptional()
  project_id?: string;

  @IsNumber()
  @IsOptional()
  limit?: number;
}

export class BulkSaveChatContextDto {
  @IsUUID()
  conversation_id: string;

  @IsArray()
  entities: ExtractedEntityDto[];

  @IsUUID()
  @IsOptional()
  organization_id?: string;
}

// ============================================
// TOOL PREFILL EXTRACTION DTOs
// ============================================

export class ToolPrefillFieldDto {
  @IsString()
  name: string;

  @IsString()
  type: 'text' | 'number' | 'email' | 'select' | 'textarea' | 'date';

  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class ExtractToolPrefillDto {
  @IsString()
  tool_id: string;

  @IsString()
  user_query: string;

  @IsString()
  @IsOptional()
  llm_response?: string;

  @IsArray()
  @IsOptional()
  form_fields?: ToolPrefillFieldDto[];
}

export class ToolPrefillValueDto {
  field: string;
  value: any;
  confidence: number;
  source: 'user_query' | 'llm_response' | 'context';
}

export class ToolPrefillResponseDto {
  tool_id: string;
  prefill_values: ToolPrefillValueDto[];
  extracted_topic?: string;
  extracted_intent?: string;
}

// ============================================
// UI TYPE REGISTRY DTOs
// ============================================

export class UIFieldMappingDto {
  name: string;
  type: string;
  prefillable: boolean;
  onboardingField?: string;
  entityTypes?: EntityType[];
  defaultValue?: any;
}

export class UITypeRegistryDto {
  uiType: string;
  name: string;
  category: string;
  fields: UIFieldMappingDto[];
  onboardingMapping: Record<string, string>;
  entityMapping: Record<string, EntityType[]>;
  defaults: Record<string, any>;
}
