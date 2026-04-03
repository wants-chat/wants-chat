import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsBoolean,
  IsObject,
  Min,
  Max,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ResearchDepth,
  ResearchStatus,
  OutputFormat,
  ResearchOptions,
} from '../interfaces/research.interface';

// ============================================
// Date Range DTO
// ============================================

export class DateRangeDto {
  @ApiPropertyOptional({ description: 'Start date (ISO 8601)' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: 'End date (ISO 8601)' })
  @IsOptional()
  @IsString()
  to?: string;
}

// ============================================
// Start Research DTO
// ============================================

export class StartResearchDto {
  @ApiProperty({
    description: 'The research query or question',
    example: 'What are the latest advancements in AI-powered healthcare diagnostics in 2024?',
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Research depth level',
    enum: ['quick', 'standard', 'deep', 'exhaustive'],
    default: 'standard',
  })
  @IsOptional()
  @IsEnum(['quick', 'standard', 'deep', 'exhaustive'])
  depth?: ResearchDepth;

  @ApiPropertyOptional({
    description: 'Domain/topic category for specialized handling',
    example: 'medical',
  })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of sources to analyze',
    minimum: 5,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(100)
  maxSources?: number;

  @ApiPropertyOptional({
    description: 'Desired output formats',
    enum: ['markdown', 'pdf', 'docx', 'pptx', 'json'],
    isArray: true,
    default: ['markdown'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['markdown', 'pdf', 'docx', 'pptx', 'json'], { each: true })
  outputFormats?: OutputFormat[];

  @ApiPropertyOptional({
    description: 'Domains to include in search',
    example: ['pubmed.ncbi.nlm.nih.gov', 'nature.com'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includeDomains?: string[];

  @ApiPropertyOptional({
    description: 'Domains to exclude from search',
    example: ['reddit.com', 'quora.com'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeDomains?: string[];

  @ApiPropertyOptional({
    description: 'Date range for sources',
    type: DateRangeDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @ApiPropertyOptional({
    description: 'Preferred language for sources',
    default: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'Require peer-reviewed sources only',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requirePeerReviewed?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum iterations for refinement',
    minimum: 1,
    maximum: 5,
    default: 3,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  maxIterations?: number;

  @ApiPropertyOptional({
    description: 'Include images in research output',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  includeImages?: boolean;

  @ApiPropertyOptional({
    description: 'Target URL to research specifically',
    example: 'https://example.com/article',
  })
  @IsOptional()
  @IsString()
  targetUrl?: string;
}

// ============================================
// Research Status Response DTO
// ============================================

export class ResearchProgressDto {
  @ApiProperty({ description: 'Research session ID' })
  sessionId: string;

  @ApiProperty({
    description: 'Current status',
    enum: ['pending', 'planning', 'searching', 'extracting', 'analyzing', 'synthesizing', 'fact_checking', 'generating', 'completed', 'failed', 'cancelled'],
  })
  status: ResearchStatus;

  @ApiProperty({
    description: 'Progress percentage (0-100)',
    minimum: 0,
    maximum: 100,
  })
  progress: number;

  @ApiProperty({ description: 'Current step description' })
  currentStep: string;

  @ApiPropertyOptional({ description: 'Progress message' })
  message?: string;

  @ApiPropertyOptional({
    description: 'Additional progress details',
  })
  details?: {
    sourcesFound?: number;
    sourcesProcessed?: number;
    findingsExtracted?: number;
    currentSubQuery?: string;
  };
}

// ============================================
// Research Session Response DTO
// ============================================

export class SourceMetadataDto {
  @ApiPropertyOptional()
  author?: string;

  @ApiPropertyOptional()
  publishedDate?: string;

  @ApiPropertyOptional()
  siteName?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  image?: string;

  @ApiPropertyOptional()
  language?: string;
}

export class SourceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  relevanceScore: number;

  @ApiProperty()
  credibilityScore: number;

  @ApiProperty({ type: SourceMetadataDto })
  metadata: SourceMetadataDto;
}

export class FindingDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sourceId: string;

  @ApiProperty()
  sourceUrl: string;

  @ApiProperty({ enum: ['fact', 'statistic', 'quote', 'claim', 'methodology', 'conclusion'] })
  type: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  confidence: number;

  @ApiProperty({ type: [String] })
  tags: string[];
}

export class ResearchOutputDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ['markdown', 'pdf', 'docx', 'pptx', 'json'] })
  format: OutputFormat;

  @ApiPropertyOptional()
  url?: string;

  @ApiPropertyOptional()
  content?: string;

  @ApiProperty()
  generatedAt: string;
}

export class ResearchSessionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  query: string;

  @ApiProperty({
    enum: ['pending', 'planning', 'searching', 'extracting', 'analyzing', 'synthesizing', 'fact_checking', 'generating', 'completed', 'failed', 'cancelled'],
  })
  status: ResearchStatus;

  @ApiProperty()
  progress: number;

  @ApiProperty()
  currentStep: string;

  @ApiProperty({ type: [SourceDto] })
  sources: SourceDto[];

  @ApiProperty({ type: [FindingDto] })
  findings: FindingDto[];

  @ApiPropertyOptional()
  synthesis?: string;

  @ApiProperty({ type: [ResearchOutputDto] })
  outputs: ResearchOutputDto[];

  @ApiPropertyOptional()
  error?: string;

  @ApiProperty()
  startedAt: string;

  @ApiPropertyOptional()
  completedAt?: string;
}

// ============================================
// Research Report Response DTO
// ============================================

export class KeyFindingDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  summary: string;

  @ApiProperty({ type: [String] })
  evidence: string[];

  @ApiProperty({ enum: ['high', 'medium', 'low'] })
  confidence: 'high' | 'medium' | 'low';

  @ApiProperty({ type: [String] })
  sources: string[];
}

export class ReferenceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional({ type: [String] })
  authors?: string[];

  @ApiProperty()
  url: string;

  @ApiPropertyOptional()
  publishedDate?: string;

  @ApiProperty()
  accessedDate: string;

  @ApiProperty()
  formattedCitation: string;
}

export class ResearchReportDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  query: string;

  @ApiProperty()
  executiveSummary: string;

  @ApiProperty({ type: [KeyFindingDto] })
  keyFindings: KeyFindingDto[];

  @ApiProperty({ type: [String] })
  conclusions: string[];

  @ApiPropertyOptional({ type: [String] })
  recommendations?: string[];

  @ApiProperty({ type: [ReferenceDto] })
  references: ReferenceDto[];

  @ApiPropertyOptional()
  disclaimer?: string;

  @ApiProperty()
  generatedAt: string;

  @ApiProperty({
    type: 'object',
    properties: {
      sourcesAnalyzed: { type: 'number' },
      researchDepth: { type: 'string' },
      processingTime: { type: 'number' },
      domain: { type: 'string' },
    },
  })
  metadata: {
    sourcesAnalyzed: number;
    researchDepth: string;
    processingTime: number;
    domain: string;
  };
}

// ============================================
// List Research Sessions DTO
// ============================================

export class ListResearchSessionsDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['pending', 'planning', 'searching', 'extracting', 'analyzing', 'synthesizing', 'fact_checking', 'generating', 'completed', 'failed', 'cancelled'],
  })
  @IsOptional()
  @IsEnum(['pending', 'planning', 'searching', 'extracting', 'analyzing', 'synthesizing', 'fact_checking', 'generating', 'completed', 'failed', 'cancelled'])
  status?: ResearchStatus;

  @ApiPropertyOptional({
    description: 'Page number',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 50,
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number;
}

// ============================================
// Cancel Research DTO
// ============================================

export class CancelResearchDto {
  @ApiProperty({ description: 'Research session ID to cancel' })
  @IsUUID()
  sessionId: string;

  @ApiPropertyOptional({ description: 'Reason for cancellation' })
  @IsOptional()
  @IsString()
  reason?: string;
}

// ============================================
// API Response Wrappers
// ============================================

export class StartResearchResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  estimatedTime: number;
}

export class CancelResearchResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;
}

export class PaginatedResearchSessionsDto {
  @ApiProperty({ type: [ResearchSessionResponseDto] })
  data: ResearchSessionResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
