import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SummaryType {
  EXTRACTIVE = 'extractive',
  ABSTRACTIVE = 'abstractive',
  BULLET_POINTS = 'bullet_points',
  KEY_INSIGHTS = 'key_insights',
  EXECUTIVE_SUMMARY = 'executive_summary',
  HIGHLIGHTS = 'highlights'
}

export enum ContentType {
  ARTICLE = 'article',
  RESEARCH_PAPER = 'research_paper',
  NEWS = 'news',
  BLOG_POST = 'blog_post',
  DOCUMENT = 'document',
  EMAIL = 'email',
  MEETING_TRANSCRIPT = 'meeting_transcript',
  BOOK_CHAPTER = 'book_chapter',
  WEB_PAGE = 'web_page',
  SOCIAL_MEDIA = 'social_media',
  LEGAL_DOCUMENT = 'legal_document',
  TECHNICAL_MANUAL = 'technical_manual',
  GENERAL = 'general'
}

export enum SummaryLength {
  VERY_SHORT = 'very_short',  // 1-2 sentences
  SHORT = 'short',            // 3-5 sentences
  MEDIUM = 'medium',          // 1-2 paragraphs
  LONG = 'long',             // 3-4 paragraphs
  DETAILED = 'detailed',      // 5+ paragraphs
  CUSTOM = 'custom'          // Custom word/sentence count
}

export enum Language {
  ENGLISH = 'en',
  SPANISH = 'es',
  FRENCH = 'fr',
  GERMAN = 'de',
  ITALIAN = 'it',
  PORTUGUESE = 'pt',
  RUSSIAN = 'ru',
  CHINESE = 'zh',
  JAPANESE = 'ja',
  KOREAN = 'ko',
  ARABIC = 'ar',
  HINDI = 'hi'
}

export class SummarizeContentDto {
  @ApiProperty({ description: 'Content to summarize' })
  @IsString()
  content: string;

  @ApiProperty({ 
    description: 'Type of summary to generate',
    enum: SummaryType,
    example: SummaryType.ABSTRACTIVE
  })
  @IsEnum(SummaryType)
  summary_type: SummaryType;

  @ApiPropertyOptional({ 
    description: 'Type of content being summarized',
    enum: ContentType,
    example: ContentType.ARTICLE,
    default: ContentType.GENERAL
  })
  @IsOptional()
  @IsEnum(ContentType)
  content_type?: ContentType;

  @ApiPropertyOptional({ 
    description: 'Desired length of summary',
    enum: SummaryLength,
    example: SummaryLength.MEDIUM,
    default: SummaryLength.MEDIUM
  })
  @IsOptional()
  @IsEnum(SummaryLength)
  length?: SummaryLength;

  @ApiPropertyOptional({ description: 'Custom word count (only used when length is CUSTOM)', example: 150 })
  @IsOptional()
  @IsNumber()
  word_count?: number;

  @ApiPropertyOptional({ description: 'Custom sentence count (only used when length is CUSTOM)', example: 5 })
  @IsOptional()
  @IsNumber()
  sentence_count?: number;

  @ApiPropertyOptional({ 
    description: 'Language of the content and summary',
    enum: Language,
    example: Language.ENGLISH,
    default: Language.ENGLISH
  })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiPropertyOptional({ description: 'Focus areas or topics to emphasize in summary', example: ['financial results', 'market trends', 'future outlook'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  focus_areas?: string[];

  @ApiPropertyOptional({ description: 'Include key statistics or numbers', default: true })
  @IsOptional()
  @IsBoolean()
  include_statistics?: boolean;

  @ApiPropertyOptional({ description: 'Include key quotes or citations', default: false })
  @IsOptional()
  @IsBoolean()
  include_quotes?: boolean;

  @ApiPropertyOptional({ description: 'Include action items (for meeting transcripts, etc.)', default: false })
  @IsOptional()
  @IsBoolean()
  include_action_items?: boolean;

  @ApiPropertyOptional({ description: 'Target audience for the summary', example: 'executives' })
  @IsOptional()
  @IsString()
  target_audience?: string;

  @ApiPropertyOptional({ description: 'Preserve original tone and style', default: false })
  @IsOptional()
  @IsBoolean()
  preserve_tone?: boolean;

  @ApiPropertyOptional({ description: 'Additional instructions or context' })
  @IsOptional()
  @IsString()
  additional_instructions?: string;
}

export class SummarizeUrlDto {
  @ApiProperty({ description: 'URL of the content to summarize', example: 'https://example.com/article' })
  @IsUrl()
  url: string;

  @ApiProperty({ 
    description: 'Type of summary to generate',
    enum: SummaryType,
    example: SummaryType.ABSTRACTIVE
  })
  @IsEnum(SummaryType)
  summary_type: SummaryType;

  @ApiPropertyOptional({ 
    description: 'Desired length of summary',
    enum: SummaryLength,
    example: SummaryLength.MEDIUM,
    default: SummaryLength.MEDIUM
  })
  @IsOptional()
  @IsEnum(SummaryLength)
  length?: SummaryLength;

  @ApiPropertyOptional({ description: 'Custom word count (only used when length is CUSTOM)', example: 150 })
  @IsOptional()
  @IsNumber()
  word_count?: number;

  @ApiPropertyOptional({ description: 'Focus areas or topics to emphasize in summary', example: ['main points', 'conclusions'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  focus_areas?: string[];

  @ApiPropertyOptional({ description: 'Include key statistics or numbers', default: true })
  @IsOptional()
  @IsBoolean()
  include_statistics?: boolean;

  @ApiPropertyOptional({ description: 'Target audience for the summary', example: 'general readers' })
  @IsOptional()
  @IsString()
  target_audience?: string;
}

export class BatchSummarizeDto {
  @ApiProperty({ description: 'Array of content to summarize' })
  @IsArray()
  @IsString({ each: true })
  contents: string[];

  @ApiProperty({ 
    description: 'Type of summary to generate',
    enum: SummaryType,
    example: SummaryType.ABSTRACTIVE
  })
  @IsEnum(SummaryType)
  summary_type: SummaryType;

  @ApiPropertyOptional({ 
    description: 'Desired length of summary for each content',
    enum: SummaryLength,
    example: SummaryLength.SHORT,
    default: SummaryLength.SHORT
  })
  @IsOptional()
  @IsEnum(SummaryLength)
  length?: SummaryLength;

  @ApiPropertyOptional({ description: 'Custom word count for each summary (only used when length is CUSTOM)', example: 100 })
  @IsOptional()
  @IsNumber()
  word_count?: number;

  @ApiPropertyOptional({ description: 'Focus areas or topics to emphasize in summaries', example: ['key points', 'conclusions'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  focus_areas?: string[];
}