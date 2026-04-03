import { IsString, IsOptional, IsEnum, IsArray, IsBoolean, IsUUID, IsNumber, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export enum ChatPersonality {
  FRIENDLY = 'friendly',
  PROFESSIONAL = 'professional',
  CREATIVE = 'creative',
  ANALYTICAL = 'analytical',
  CASUAL = 'casual',
  FORMAL = 'formal',
  ENTHUSIASTIC = 'enthusiastic',
  HELPFUL = 'helpful',
  WITTY = 'witty',
  EMPATHETIC = 'empathetic',
  EXPERT = 'expert',
  MENTOR = 'mentor'
}

export enum ChatContext {
  GENERAL = 'general',
  TECHNICAL_SUPPORT = 'technical_support',
  CUSTOMER_SERVICE = 'customer_service',
  EDUCATION = 'education',
  CREATIVE_WRITING = 'creative_writing',
  BUSINESS_ADVICE = 'business_advice',
  HEALTH_WELLNESS = 'health_wellness',
  TRAVEL_PLANNING = 'travel_planning',
  COOKING_RECIPES = 'cooking_recipes',
  FITNESS_TRAINING = 'fitness_training',
  FINANCIAL_ADVICE = 'financial_advice',
  CAREER_COUNSELING = 'career_counseling',
  RELATIONSHIP_ADVICE = 'relationship_advice',
  ENTERTAINMENT = 'entertainment',
  NEWS_CURRENT_EVENTS = 'news_current_events'
}

export enum ResponseFormat {
  TEXT = 'text',
  MARKDOWN = 'markdown',
  JSON = 'json',
  BULLET_POINTS = 'bullet_points',
  NUMBERED_LIST = 'numbered_list',
  PARAGRAPH = 'paragraph',
  STEP_BY_STEP = 'step_by_step'
}

export class ChatMessage {
  @ApiProperty({ 
    description: 'Role of the message sender',
    enum: MessageRole,
    example: MessageRole.USER
  })
  @IsEnum(MessageRole)
  role: MessageRole;

  @ApiProperty({ description: 'Message content', example: 'Hello, can you help me with my project?' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Timestamp of the message' })
  @IsOptional()
  @IsString()
  timestamp?: string;

  @ApiPropertyOptional({ description: 'Message metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreateChatDto {
  @ApiProperty({ description: 'User message to send', example: 'Hello, I need help with planning a trip to Japan' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Chat session ID for continuing conversation' })
  @IsOptional()
  @IsUUID()
  session_id?: string;

  @ApiPropertyOptional({ 
    description: 'AI personality for responses',
    enum: ChatPersonality,
    example: ChatPersonality.FRIENDLY,
    default: ChatPersonality.HELPFUL
  })
  @IsOptional()
  @IsEnum(ChatPersonality)
  personality?: ChatPersonality;

  @ApiPropertyOptional({ 
    description: 'Context or domain for the conversation',
    enum: ChatContext,
    example: ChatContext.TRAVEL_PLANNING,
    default: ChatContext.GENERAL
  })
  @IsOptional()
  @IsEnum(ChatContext)
  context?: ChatContext;

  @ApiPropertyOptional({ 
    description: 'Desired response format',
    enum: ResponseFormat,
    example: ResponseFormat.TEXT,
    default: ResponseFormat.TEXT
  })
  @IsOptional()
  @IsEnum(ResponseFormat)
  response_format?: ResponseFormat;

  @ApiPropertyOptional({ description: 'Maximum length of response in tokens', example: 500 })
  @IsOptional()
  @IsNumber()
  max_tokens?: number;

  @ApiPropertyOptional({ description: 'Temperature for response creativity (0-1)', example: 0.7 })
  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  temperature?: number;

  @ApiPropertyOptional({ description: 'System instructions or custom behavior', example: 'You are a travel expert specializing in Asian destinations' })
  @IsOptional()
  @IsString()
  system_prompt?: string;

  @ApiPropertyOptional({ description: 'Include conversation history in context', default: true })
  @IsOptional()
  @IsBoolean()
  include_history?: boolean;

  @ApiPropertyOptional({ description: 'Enable memory across sessions', default: false })
  @IsOptional()
  @IsBoolean()
  enable_memory?: boolean;

  @ApiPropertyOptional({ description: 'Additional context or information to consider' })
  @IsOptional()
  @IsString()
  additional_context?: string;

  @ApiPropertyOptional({ description: 'Tags for organizing conversations', example: ['travel', 'planning', 'japan'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class ChatHistoryDto {
  @ApiProperty({ description: 'Conversation messages' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessage)
  messages: ChatMessage[];

  @ApiProperty({ description: 'User message to send', example: 'What about the weather in Tokyo during spring?' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ 
    description: 'AI personality for responses',
    enum: ChatPersonality,
    example: ChatPersonality.FRIENDLY,
    default: ChatPersonality.HELPFUL
  })
  @IsOptional()
  @IsEnum(ChatPersonality)
  personality?: ChatPersonality;

  @ApiPropertyOptional({ 
    description: 'Context or domain for the conversation',
    enum: ChatContext,
    example: ChatContext.TRAVEL_PLANNING,
    default: ChatContext.GENERAL
  })
  @IsOptional()
  @IsEnum(ChatContext)
  context?: ChatContext;

  @ApiPropertyOptional({ 
    description: 'Desired response format',
    enum: ResponseFormat,
    example: ResponseFormat.TEXT,
    default: ResponseFormat.TEXT
  })
  @IsOptional()
  @IsEnum(ResponseFormat)
  response_format?: ResponseFormat;

  @ApiPropertyOptional({ description: 'Maximum length of response in tokens', example: 500 })
  @IsOptional()
  @IsNumber()
  max_tokens?: number;

  @ApiPropertyOptional({ description: 'Temperature for response creativity (0-1)', example: 0.7 })
  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  temperature?: number;
}

export class UpdateChatSessionDto {
  @ApiPropertyOptional({ description: 'Session title or name' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Session tags', example: ['travel', 'planning'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Session metadata' })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Archive the session', default: false })
  @IsOptional()
  @IsBoolean()
  archived?: boolean;
}