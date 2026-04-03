import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsIn, IsObject, Min, Max } from 'class-validator';

// All supported content types
export const CONTENT_TYPES = [
  'email', 'essay', 'blog-post', 'social-caption', 'product-description',
  'resume', 'cover-letter', 'linkedin-post', 'tweet', 'youtube-description',
  'ad-copy', 'headline', 'slogan', 'tagline', 'bio', 'thank-you-note',
  'apology-letter', 'invitation', 'announcement', 'press-release',
  'newsletter', 'speech', 'presentation-script', 'video-script', 'podcast-script',
  'story', 'poetry', 'song-lyrics', 'book-summary', 'article-summary',
  'meeting-notes', 'report', 'proposal', 'contract', 'terms-of-service',
  'privacy-policy', 'faq', 'how-to-guide', 'tutorial', 'recipe', 'review',
  'testimonial', 'case-study', 'white-paper', 'ebook-outline', 'course-content',
  'quiz-questions', 'survey-questions', 'interview-questions', 'conversation-starters',
  'paraphrase', 'translate', 'grammar-check', 'joke', 'business-plan'
] as const;

export type ContentTypeEnum = typeof CONTENT_TYPES[number];

export class UnifiedTextGenerationDto {
  @ApiProperty({
    description: 'Type of content to generate',
    enum: CONTENT_TYPES,
    example: 'email'
  })
  @IsString()
  @IsIn(CONTENT_TYPES)
  type: ContentTypeEnum;

  @ApiProperty({
    description: 'Main prompt or content description',
    example: 'Write an email to my boss requesting time off'
  })
  @IsString()
  prompt: string;

  @ApiPropertyOptional({
    description: 'Additional parameters specific to content type',
    example: { tone: 'professional', recipientType: 'manager' }
  })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Override temperature (0-2)',
    example: 0.7
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @ApiPropertyOptional({
    description: 'Override max tokens',
    example: 2000
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(8000)
  maxTokens?: number;
}

export class TextGenerationResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiPropertyOptional()
  data?: {
    content: string;
    type: string;
    contentId?: string;
    metadata?: Record<string, any>;
  };

  @ApiPropertyOptional()
  error?: string;
}

// Specific DTOs for common use cases (optional, for convenience)

export class EmailGenerationDto {
  @ApiProperty({ example: 'Meeting Follow-up' })
  @IsString()
  subject: string;

  @ApiProperty({ example: 'Request meeting notes and next steps' })
  @IsString()
  purpose: string;

  @ApiPropertyOptional({ enum: ['professional', 'formal', 'casual', 'friendly'] })
  @IsOptional()
  @IsString()
  tone?: string;

  @ApiPropertyOptional({ enum: ['colleague', 'manager', 'client', 'customer'] })
  @IsOptional()
  @IsString()
  recipientType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyPoints?: string;
}

export class BlogPostGenerationDto {
  @ApiProperty({ example: '10 Tips for Better Remote Work Productivity' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ enum: ['general', 'business', 'tech', 'lifestyle'] })
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @ApiPropertyOptional({ enum: ['informative', 'conversational', 'professional'] })
  @IsOptional()
  @IsString()
  writingStyle?: string;

  @ApiPropertyOptional({ example: 'remote work, productivity, home office' })
  @IsOptional()
  @IsString()
  keywords?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoFocus?: string;
}

export class SocialCaptionGenerationDto {
  @ApiProperty({ example: 'New product launch announcement' })
  @IsString()
  content: string;

  @ApiProperty({ enum: ['instagram', 'twitter', 'linkedin', 'facebook', 'tiktok'] })
  @IsString()
  platform: string;

  @ApiPropertyOptional({ enum: ['professional', 'casual', 'fun', 'inspiring'] })
  @IsOptional()
  @IsString()
  tone?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  includeHashtags?: boolean;

  @ApiPropertyOptional({ example: 'Shop Now' })
  @IsOptional()
  @IsString()
  cta?: string;
}

export class HeadlineGenerationDto {
  @ApiProperty({ example: 'New AI productivity tool for remote teams' })
  @IsString()
  topic: string;

  @ApiPropertyOptional({ enum: ['news', 'blog', 'email', 'landing', 'social'] })
  @IsOptional()
  @IsString()
  headlineType?: string;

  @ApiPropertyOptional({ enum: ['intriguing', 'informative', 'urgent', 'conversational'] })
  @IsOptional()
  @IsString()
  tone?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  count?: number;
}

export class TranslationDto {
  @ApiProperty({ example: 'Hello, how are you?' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  fromLanguage?: string;

  @ApiProperty({ example: 'es' })
  @IsString()
  toLanguage: string;
}

export class SummarizationDto {
  @ApiProperty({ description: 'Text to summarize' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ enum: ['brief', 'detailed', 'bullet-points'] })
  @IsOptional()
  @IsString()
  style?: string;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  maxLength?: number;
}
