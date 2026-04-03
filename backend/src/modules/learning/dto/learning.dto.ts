import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsBoolean,
  IsObject,
  IsUUID,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================
// Learning Sub-Types
// ============================================

export type LearningSubType = 'tutoring' | 'summarize' | 'organize' | 'writing';
export type KnowledgeLevel = 'beginner' | 'intermediate' | 'advanced';
export type PlanType = 'schedule' | 'goals' | 'project' | 'study';
export type WritingType = 'email' | 'essay' | 'report' | 'proofread' | 'adjust_tone';
export type ToneType = 'professional' | 'casual' | 'formal' | 'friendly' | 'direct';

// ============================================
// Tutoring DTOs
// ============================================

export class TutoringRequestDto {
  @ApiProperty({ description: 'Topic to explain or teach' })
  @IsString()
  topic: string;

  @ApiPropertyOptional({ description: 'Specific question or query' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    description: 'Explanation depth',
    enum: ['quick', 'standard', 'detailed'],
    default: 'standard',
  })
  @IsOptional()
  @IsEnum(['quick', 'standard', 'detailed'])
  depth?: 'quick' | 'standard' | 'detailed';

  @ApiPropertyOptional({ description: 'Include practice questions', default: true })
  @IsOptional()
  @IsBoolean()
  includeQuiz?: boolean;

  @ApiPropertyOptional({ description: 'Number of quiz questions', default: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  quizCount?: number;

  @ApiPropertyOptional({ description: 'User ID for personalization' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class QuizQuestionDto {
  @ApiProperty()
  question: string;

  @ApiProperty({ type: [String] })
  options: string[];

  @ApiProperty()
  correctAnswer: string;

  @ApiProperty({ enum: ['easy', 'medium', 'hard'] })
  difficulty: 'easy' | 'medium' | 'hard';

  @ApiPropertyOptional()
  explanation?: string;
}

export class TutoringResponseDto {
  @ApiProperty()
  content: string;

  @ApiProperty({ type: [QuizQuestionDto] })
  questions: QuizQuestionDto[];

  @ApiProperty({ enum: ['beginner', 'intermediate', 'advanced'] })
  level: KnowledgeLevel;

  @ApiProperty({ type: [String] })
  suggestedTopics: string[];

  @ApiPropertyOptional({ type: [Object] })
  suggestedTools?: Array<{
    toolId: string;
    title: string;
    description: string;
    category: string;
    type: string;
    icon: string;
  }>;
}

// ============================================
// Summarization DTOs
// ============================================

export class SummarizeRequestDto {
  @ApiPropertyOptional({ description: 'Text content to summarize' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ description: 'URL to fetch and summarize' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ description: 'File ID to summarize' })
  @IsOptional()
  @IsString()
  fileId?: string;

  @ApiPropertyOptional({
    description: 'Summary type',
    enum: ['brief', 'detailed', 'executive', 'bullet_points'],
    default: 'detailed',
  })
  @IsOptional()
  @IsEnum(['brief', 'detailed', 'executive', 'bullet_points'])
  summaryType?: 'brief' | 'detailed' | 'executive' | 'bullet_points';

  @ApiPropertyOptional({ description: 'Extract action items', default: false })
  @IsOptional()
  @IsBoolean()
  extractActions?: boolean;

  @ApiPropertyOptional({ description: 'User ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class KeyPointDto {
  @ApiProperty()
  point: string;

  @ApiPropertyOptional()
  importance?: 'high' | 'medium' | 'low';

  @ApiPropertyOptional()
  category?: string;
}

export class ThemeDto {
  @ApiProperty()
  theme: string;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional()
  relevance?: 'high' | 'medium' | 'low';
}

export class SummaryResponseDto {
  @ApiProperty()
  summary: string;

  @ApiProperty({ type: [KeyPointDto] })
  keyPoints: KeyPointDto[];

  @ApiProperty({ type: [ThemeDto] })
  themes: ThemeDto[];

  @ApiPropertyOptional({ type: [String] })
  actionItems?: string[];

  @ApiProperty()
  wordCount: number;

  @ApiProperty()
  readingTime: number;

  @ApiPropertyOptional()
  sourceTitle?: string;

  @ApiPropertyOptional({ type: [Object] })
  suggestedTools?: Array<{
    toolId: string;
    title: string;
    description: string;
    category: string;
    type: string;
    icon: string;
  }>;
}

// ============================================
// Planning DTOs
// ============================================

export class ScheduleItemDto {
  @ApiProperty()
  time: string;

  @ApiProperty()
  activity: string;

  @ApiPropertyOptional()
  duration?: string;

  @ApiPropertyOptional({ enum: ['high', 'medium', 'low'] })
  priority?: 'high' | 'medium' | 'low';

  @ApiPropertyOptional()
  notes?: string;
}

export class MilestoneDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  targetDate: string;

  @ApiPropertyOptional()
  completed?: boolean;

  @ApiPropertyOptional({ type: [String] })
  tasks?: string[];
}

export class PlanRequestDto {
  @ApiProperty({
    description: 'Type of plan to create',
    enum: ['schedule', 'goals', 'project', 'study'],
  })
  @IsEnum(['schedule', 'goals', 'project', 'study'])
  planType: PlanType;

  @ApiProperty({ description: 'Description of what to plan' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Duration or timeline' })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ description: 'Start date (ISO 8601)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (ISO 8601)' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Existing commitments or constraints' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  constraints?: string[];

  @ApiPropertyOptional({ description: 'Specific goals or objectives' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goals?: string[];

  @ApiPropertyOptional({ description: 'User ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class PlanResponseDto {
  @ApiProperty({ enum: ['schedule', 'goals', 'project', 'study'] })
  type: PlanType;

  @ApiProperty()
  content: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  data?: Record<string, any>;

  @ApiPropertyOptional({ type: [MilestoneDto] })
  milestones?: MilestoneDto[];

  @ApiPropertyOptional({ type: [String] })
  dailyActions?: string[];

  @ApiPropertyOptional({ type: [String] })
  suggestions?: string[];

  @ApiPropertyOptional({ type: [Object] })
  suggestedTools?: Array<{
    toolId: string;
    title: string;
    description: string;
    category: string;
    type: string;
    icon: string;
  }>;
}

// ============================================
// Writing DTOs
// ============================================

export class EmailDetailsDto {
  @ApiProperty({ description: 'Recipient name or role' })
  @IsString()
  recipient: string;

  @ApiProperty({ description: 'Purpose of the email' })
  @IsString()
  purpose: string;

  @ApiPropertyOptional({ description: 'Key points to include' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keyPoints?: string[];

  @ApiPropertyOptional({ description: 'Urgency level', enum: ['low', 'normal', 'high'] })
  @IsOptional()
  @IsEnum(['low', 'normal', 'high'])
  urgency?: 'low' | 'normal' | 'high';

  @ApiPropertyOptional({ description: 'Sender name' })
  @IsOptional()
  @IsString()
  senderName?: string;
}

export class EssayDetailsDto {
  @ApiProperty({ description: 'Essay topic' })
  @IsString()
  topic: string;

  @ApiPropertyOptional({
    description: 'Essay type',
    enum: ['argumentative', 'expository', 'narrative', 'descriptive', 'persuasive'],
  })
  @IsOptional()
  @IsEnum(['argumentative', 'expository', 'narrative', 'descriptive', 'persuasive'])
  essayType?: string;

  @ApiPropertyOptional({ description: 'Target word count' })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(10000)
  wordCount?: number;

  @ApiPropertyOptional({ description: 'Main thesis or argument' })
  @IsOptional()
  @IsString()
  thesis?: string;

  @ApiPropertyOptional({ description: 'Key points to cover' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keyPoints?: string[];
}

export class ReportDetailsDto {
  @ApiProperty({ description: 'Report topic or subject' })
  @IsString()
  topic: string;

  @ApiPropertyOptional({
    description: 'Report type',
    enum: ['business', 'technical', 'research', 'analysis', 'summary'],
  })
  @IsOptional()
  @IsEnum(['business', 'technical', 'research', 'analysis', 'summary'])
  reportType?: string;

  @ApiPropertyOptional({ description: 'Key data or findings to include' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  findings?: string[];

  @ApiPropertyOptional({ description: 'Include recommendations', default: true })
  @IsOptional()
  @IsBoolean()
  includeRecommendations?: boolean;
}

export class WritingRequestDto {
  @ApiProperty({
    description: 'Type of writing',
    enum: ['email', 'essay', 'report', 'proofread', 'adjust_tone'],
  })
  @IsEnum(['email', 'essay', 'report', 'proofread', 'adjust_tone'])
  writingType: WritingType;

  @ApiPropertyOptional({
    description: 'Tone for the writing',
    enum: ['professional', 'casual', 'formal', 'friendly', 'direct'],
    default: 'professional',
  })
  @IsOptional()
  @IsEnum(['professional', 'casual', 'formal', 'friendly', 'direct'])
  tone?: ToneType;

  @ApiPropertyOptional({ description: 'Email details', type: EmailDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmailDetailsDto)
  emailDetails?: EmailDetailsDto;

  @ApiPropertyOptional({ description: 'Essay details', type: EssayDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EssayDetailsDto)
  essayDetails?: EssayDetailsDto;

  @ApiPropertyOptional({ description: 'Report details', type: ReportDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReportDetailsDto)
  reportDetails?: ReportDetailsDto;

  @ApiPropertyOptional({ description: 'Text to proofread or adjust' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ description: 'Target tone for adjustment' })
  @IsOptional()
  @IsEnum(['professional', 'casual', 'formal', 'friendly', 'direct'])
  targetTone?: ToneType;

  @ApiPropertyOptional({ description: 'User ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class WritingAnalysisDto {
  @ApiProperty()
  tone: string;

  @ApiProperty()
  formalityLevel: number;

  @ApiProperty({ type: [String] })
  suggestions: string[];

  @ApiPropertyOptional()
  grammarIssues?: number;

  @ApiPropertyOptional()
  readability?: string;
}

export class WritingResponseDto {
  @ApiProperty({ enum: ['email', 'essay', 'report', 'proofread', 'adjust_tone'] })
  type: WritingType;

  @ApiProperty()
  content: string;

  @ApiPropertyOptional()
  subject?: string;

  @ApiPropertyOptional({ type: WritingAnalysisDto })
  analysis?: WritingAnalysisDto;

  @ApiProperty()
  metadata: {
    wordCount: number;
    readingTime: number;
    paragraphs?: number;
  };

  @ApiPropertyOptional()
  outline?: Record<string, any>;

  @ApiPropertyOptional({ type: [Object] })
  suggestedTools?: Array<{
    toolId: string;
    title: string;
    description: string;
    category: string;
    type: string;
    icon: string;
  }>;
}

// ============================================
// Generic Learning Response
// ============================================

export class LearningResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ enum: ['tutoring', 'summarize', 'organize', 'writing'] })
  type: LearningSubType;

  @ApiProperty()
  content: string;

  @ApiPropertyOptional()
  data?: Record<string, any>;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ type: [Object] })
  suggestedTools?: Array<{
    toolId: string;
    title: string;
    description: string;
    category: string;
    type: string;
    icon: string;
  }>;
}
