import { IsOptional, IsNumber, IsString, IsEnum, IsDateString, IsArray, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum AIServiceType {
  TEXT_GENERATION = 'text_generation',
  IMAGE_GENERATION = 'image_generation',
  AI_IMAGE_GENERATOR = 'ai_image_generator',
  CODE_GENERATION = 'code_generation',
  TRANSLATION = 'translation',
  SUMMARIZATION = 'summarization',
  CHAT = 'chat',
  RECIPE = 'recipe',
  TRAVEL_PLAN = 'travel_plan',
  WORKOUT_PLAN = 'workout_plan',
  MEAL_PLAN = 'meal_plan'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export enum UsagePeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  ALL_TIME = 'all_time'
}

export class AIQueryDto {
  @ApiPropertyOptional({ description: 'Page number for pagination', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ 
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
    default: SortOrder.DESC
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sort_order?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ description: 'Field to sort by', example: 'created_at', default: 'created_at' })
  @IsOptional()
  @IsString()
  sort_by?: string = 'created_at';

  @ApiPropertyOptional({ description: 'Search term to filter results' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by AI service type',
    enum: AIServiceType,
    example: AIServiceType.TEXT_GENERATION
  })
  @IsOptional()
  @IsEnum(AIServiceType)
  service_type?: AIServiceType;

  @ApiPropertyOptional({ description: 'Filter by creation date (start)', example: '2024-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @ApiPropertyOptional({ description: 'Filter by creation date (end)', example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  date_to?: string;

  @ApiPropertyOptional({ description: 'Filter by tags', example: ['blog', 'marketing'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Include content preview in response', default: true })
  @IsOptional()
  include_preview?: boolean = true;

  @ApiPropertyOptional({ description: 'Include usage statistics in response', default: false })
  @IsOptional()
  include_usage?: boolean = false;

  @ApiPropertyOptional({ description: 'Include metadata in response', default: false })
  @IsOptional()
  include_metadata?: boolean = false;
}

export class AIUsageQueryDto {
  @ApiPropertyOptional({ 
    description: 'Usage period to query',
    enum: UsagePeriod,
    example: UsagePeriod.MONTHLY,
    default: UsagePeriod.MONTHLY
  })
  @IsOptional()
  @IsEnum(UsagePeriod)
  period?: UsagePeriod = UsagePeriod.MONTHLY;

  @ApiPropertyOptional({ description: 'Start date for custom period', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ description: 'End date for custom period', example: '2024-01-31' })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by specific AI service types',
    enum: AIServiceType,
    isArray: true,
    example: [AIServiceType.TEXT_GENERATION, AIServiceType.IMAGE_GENERATION]
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AIServiceType, { each: true })
  service_types?: AIServiceType[];

  @ApiPropertyOptional({ description: 'Group results by service type', default: false })
  @IsOptional()
  group_by_service?: boolean = false;

  @ApiPropertyOptional({ description: 'Include detailed breakdown', default: false })
  @IsOptional()
  detailed?: boolean = false;

  @ApiPropertyOptional({ description: 'Include cost information', default: false })
  @IsOptional()
  include_costs?: boolean = false;
}

export class ChatSessionQueryDto {
  @ApiPropertyOptional({ description: 'Page number for pagination', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of sessions per page', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ 
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
    default: SortOrder.DESC
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sort_order?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ description: 'Field to sort by', example: 'updated_at', default: 'updated_at' })
  @IsOptional()
  @IsString()
  sort_by?: string = 'updated_at';

  @ApiPropertyOptional({ description: 'Search in session titles or content' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by tags', example: ['travel', 'planning'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Include archived sessions', default: false })
  @IsOptional()
  include_archived?: boolean = false;

  @ApiPropertyOptional({ description: 'Filter by creation date (start)', example: '2024-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @ApiPropertyOptional({ description: 'Filter by creation date (end)', example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  date_to?: string;
}