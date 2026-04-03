import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum MemoryCategory {
  PREFERENCE = 'preference',
  FACT = 'fact',
  INSTRUCTION = 'instruction',
  CONTEXT = 'context',
}

export enum MemorySource {
  AUTO = 'auto',
  MANUAL = 'manual',
}

export class CreateMemoryDto {
  @IsString()
  content: string;

  @IsEnum(MemoryCategory)
  @IsOptional()
  category?: MemoryCategory = MemoryCategory.CONTEXT;

  @IsEnum(MemorySource)
  @IsOptional()
  source?: MemorySource = MemorySource.MANUAL;

  @IsUUID()
  @IsOptional()
  sourceConversationId?: string;

  @IsUUID()
  @IsOptional()
  sourceMessageId?: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  confidence?: number = 1.0;
}

export class UpdateMemoryDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(MemoryCategory)
  @IsOptional()
  category?: MemoryCategory;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class MemoryQueryDto {
  @IsEnum(MemoryCategory)
  @IsOptional()
  category?: MemoryCategory;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean = true;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 50;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  offset?: number = 0;
}

export class MemoryResponse {
  id: string;
  content: string;
  category: MemoryCategory;
  source: MemorySource;
  sourceConversationId?: string;
  sourceMessageId?: string;
  confidence: number;
  useCount: number;
  lastUsedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class MemoriesListResponse {
  data: MemoryResponse[];
  total: number;
  limit: number;
  offset: number;
}

// Custom Instructions DTOs
export class UpdateCustomInstructionsDto {
  @IsString()
  @IsOptional()
  customInstructions?: string;

  @IsString()
  @IsOptional()
  aboutUser?: string;

  @IsString()
  @IsOptional()
  responsePreferences?: string;

  @IsBoolean()
  @IsOptional()
  enableMemories?: boolean;

  @IsBoolean()
  @IsOptional()
  enablePersonalization?: boolean;

  @IsBoolean()
  @IsOptional()
  enableAutoMemoryExtraction?: boolean;
}

export class CustomInstructionsResponse {
  customInstructions?: string;
  aboutUser?: string;
  responsePreferences?: string;
  enableMemories: boolean;
  enablePersonalization: boolean;
  enableAutoMemoryExtraction: boolean;
}
