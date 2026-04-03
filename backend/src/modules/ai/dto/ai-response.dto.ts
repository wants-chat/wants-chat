import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AIUsageStats {
  @ApiProperty({ description: 'Total requests made' })
  total_requests: number;

  @ApiProperty({ description: 'Tokens used' })
  tokens_used: number;

  @ApiProperty({ description: 'Images generated' })
  images_generated: number;

  @ApiProperty({ description: 'Characters translated' })
  characters_translated: number;

  @ApiPropertyOptional({ description: 'Last reset date' })
  last_reset?: string;

  @ApiPropertyOptional({ description: 'Current plan limits' })
  plan_limits?: {
    requests_per_month: number;
    tokens_per_month: number;
    images_per_month: number;
  };
}

export class AITextResponse {
  @ApiProperty({ description: 'Generated text content' })
  content: string;

  @ApiProperty({ description: 'Type of text generated' })
  text_type: string;

  @ApiPropertyOptional({ description: 'Word count' })
  word_count?: number;

  @ApiPropertyOptional({ description: 'Character count' })
  character_count?: number;

  @ApiPropertyOptional({ description: 'Language detected/used' })
  language?: string;

  @ApiPropertyOptional({ description: 'Confidence score (0-1)' })
  confidence?: number;

  @ApiProperty({ description: 'Generation timestamp' })
  timestamp: string;

  @ApiProperty({ description: 'Request ID for tracking' })
  request_id: string;

  @ApiPropertyOptional({ description: 'Usage statistics for this request' })
  usage?: {
    tokens_used: number;
    processing_time_ms: number;
  };
}

export class AIImageResponse {
  @ApiProperty({ description: 'Generated image URL(s)' })
  image_urls: string[];

  @ApiProperty({ description: 'Image specifications' })
  specifications: {
    width: number;
    height: number;
    format: string;
    quality: string;
  };

  @ApiPropertyOptional({ description: 'Generation parameters used' })
  generation_params?: {
    style?: string;
    steps?: number;
    guidance_scale?: number;
    seed?: number;
  };

  @ApiProperty({ description: 'Generation timestamp' })
  timestamp: string;

  @ApiProperty({ description: 'Request ID for tracking' })
  request_id: string;

  @ApiPropertyOptional({ description: 'Usage statistics for this request' })
  usage?: {
    images_generated: number;
    processing_time_ms: number;
  };
}

export class AICodeResponse {
  @ApiProperty({ description: 'Generated code' })
  code: string;

  @ApiProperty({ description: 'Programming language' })
  language: string;

  @ApiProperty({ description: 'Code type' })
  code_type: string;

  @ApiPropertyOptional({ description: 'Explanation of the code' })
  explanation?: string;

  @ApiPropertyOptional({ description: 'Usage examples' })
  examples?: string[];

  @ApiPropertyOptional({ description: 'Dependencies required' })
  dependencies?: string[];

  @ApiPropertyOptional({ description: 'Installation instructions' })
  installation_notes?: string;

  @ApiProperty({ description: 'Generation timestamp' })
  timestamp: string;

  @ApiProperty({ description: 'Request ID for tracking' })
  request_id: string;

  @ApiPropertyOptional({ description: 'Usage statistics for this request' })
  usage?: {
    tokens_used: number;
    processing_time_ms: number;
  };
}

export class AITranslationResponse {
  @ApiProperty({ description: 'Translated text' })
  translated_text: string;

  @ApiProperty({ description: 'Source language detected' })
  source_language: string;

  @ApiProperty({ description: 'Target language' })
  target_language: string;

  @ApiPropertyOptional({ description: 'Confidence score (0-1)' })
  confidence?: number;

  @ApiPropertyOptional({ description: 'Alternative translations' })
  alternatives?: string[];

  @ApiProperty({ description: 'Translation timestamp' })
  timestamp: string;

  @ApiProperty({ description: 'Request ID for tracking' })
  request_id: string;

  @ApiPropertyOptional({ description: 'Usage statistics for this request' })
  usage?: {
    characters_translated: number;
    processing_time_ms: number;
  };
}

export class AISummaryResponse {
  @ApiProperty({ description: 'Summary text' })
  summary: string;

  @ApiProperty({ description: 'Summary type' })
  summary_type: string;

  @ApiPropertyOptional({ description: 'Key points extracted' })
  key_points?: string[];

  @ApiPropertyOptional({ description: 'Original content length' })
  original_length?: number;

  @ApiPropertyOptional({ description: 'Summary length' })
  summary_length?: number;

  @ApiPropertyOptional({ description: 'Compression ratio' })
  compression_ratio?: number;

  @ApiProperty({ description: 'Summary timestamp' })
  timestamp: string;

  @ApiProperty({ description: 'Request ID for tracking' })
  request_id: string;

  @ApiPropertyOptional({ description: 'Usage statistics for this request' })
  usage?: {
    tokens_used: number;
    processing_time_ms: number;
  };
}

export class AIChatResponse {
  @ApiProperty({ description: 'AI response message' })
  message: string;

  @ApiProperty({ description: 'Chat session ID' })
  session_id: string;

  @ApiProperty({ description: 'Message role' })
  role: string;

  @ApiPropertyOptional({ description: 'Response format used' })
  format?: string;

  @ApiPropertyOptional({ description: 'Conversation context' })
  context?: string;

  @ApiProperty({ description: 'Response timestamp' })
  timestamp: string;

  @ApiProperty({ description: 'Request ID for tracking' })
  request_id: string;

  @ApiPropertyOptional({ description: 'Usage statistics for this request' })
  usage?: {
    tokens_used: number;
    processing_time_ms: number;
  };
}

export class AIRecipeResponse {
  @ApiProperty({ description: 'Recipe title' })
  title: string;

  @ApiProperty({ description: 'Recipe description' })
  description: string;

  @ApiProperty({ description: 'List of ingredients with measurements' })
  ingredients: Array<{
    name: string;
    amount: string;
    unit?: string;
    notes?: string;
  }>;

  @ApiProperty({ description: 'Step-by-step instructions' })
  instructions: string[];

  @ApiProperty({ description: 'Recipe metadata' })
  metadata: {
    prep_time: number;
    cook_time: number;
    total_time: number;
    servings: number;
    difficulty: string;
    cuisine?: string;
    meal_type?: string;
  };

  @ApiPropertyOptional({ description: 'Nutritional information' })
  nutrition?: {
    calories_per_serving?: number;
    protein?: string;
    carbs?: string;
    fat?: string;
    fiber?: string;
  };

  @ApiPropertyOptional({ description: 'Cooking tips' })
  tips?: string[];

  @ApiPropertyOptional({ description: 'Recipe variations' })
  variations?: string[];

  @ApiProperty({ description: 'Generation timestamp' })
  timestamp: string;

  @ApiProperty({ description: 'Request ID for tracking' })
  request_id: string;
}

export class AIWorkoutResponse {
  @ApiProperty({ description: 'Workout plan title' })
  title: string;

  @ApiProperty({ description: 'Plan overview' })
  overview: string;

  @ApiProperty({ description: 'Weekly workout schedule' })
  schedule: Array<{
    day: number;
    day_name: string;
    workout_type: string;
    exercises: Array<{
      name: string;
      sets?: number;
      reps?: string;
      duration?: string;
      rest?: string;
      notes?: string;
    }>;
    estimated_duration: number;
  }>;

  @ApiProperty({ description: 'Plan metadata' })
  metadata: {
    duration_weeks: number;
    days_per_week: number;
    fitness_level: string;
    primary_goal: string;
    equipment_needed: string[];
  };

  @ApiPropertyOptional({ description: 'Warm-up routine' })
  warmup?: string[];

  @ApiPropertyOptional({ description: 'Cool-down routine' })
  cooldown?: string[];

  @ApiPropertyOptional({ description: 'Progression guidelines' })
  progression?: string[];

  @ApiPropertyOptional({ description: 'Safety tips' })
  safety_tips?: string[];

  @ApiProperty({ description: 'Generation timestamp' })
  timestamp: string;

  @ApiProperty({ description: 'Request ID for tracking' })
  request_id: string;
}

export class AIMealPlanResponse {
  @ApiProperty({ description: 'Meal plan title' })
  title: string;

  @ApiProperty({ description: 'Plan overview' })
  overview: string;

  @ApiProperty({ description: 'Daily meal plans' })
  meal_plan: Array<{
    day: number;
    day_name: string;
    meals: Array<{
      meal_type: string;
      recipe_name: string;
      ingredients: string[];
      instructions: string[];
      prep_time: number;
      calories?: number;
    }>;
    daily_nutrition?: {
      total_calories: number;
      protein: string;
      carbs: string;
      fat: string;
    };
  }>;

  @ApiPropertyOptional({ description: 'Consolidated grocery list' })
  grocery_list?: Array<{
    category: string;
    items: string[];
  }>;

  @ApiProperty({ description: 'Plan metadata' })
  metadata: {
    duration_days: number;
    daily_calories?: number;
    dietary_restrictions: string[];
    cuisines: string[];
  };

  @ApiPropertyOptional({ description: 'Meal prep tips' })
  prep_tips?: string[];

  @ApiProperty({ description: 'Generation timestamp' })
  timestamp: string;

  @ApiProperty({ description: 'Request ID for tracking' })
  request_id: string;
}

export class AIHistoryItem {
  @ApiProperty({ description: 'Generation ID' })
  id: string;

  @ApiProperty({ description: 'Type of AI generation' })
  type: string;

  @ApiProperty({ description: 'Original prompt or request' })
  prompt: string;

  @ApiPropertyOptional({ description: 'Generated content preview' })
  content_preview?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: string;

  @ApiPropertyOptional({ description: 'Usage statistics' })
  usage?: {
    tokens_used?: number;
    processing_time_ms?: number;
    images_generated?: number;
    characters_translated?: number;
  };

  @ApiPropertyOptional({ description: 'Generation metadata' })
  metadata?: Record<string, any>;
}

export class AIHistoryResponse {
  @ApiProperty({ description: 'Array of AI generation history items' })
  items: AIHistoryItem[];

  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total pages available' })
  total_pages: number;
}