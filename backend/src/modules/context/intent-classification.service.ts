/**
 * Intent Classification Service
 *
 * Uses LLM with structured output to classify user intent by FUNCTIONAL PURPOSE.
 * Works for ANY language - the LLM understands intent regardless of language.
 *
 * Key Design:
 * - Uses AiService for LLM calls
 * - Uses Zod for structured output validation
 * - Classifies by FUNCTIONAL PURPOSE, not keywords
 * - Caches common queries for speed
 * - Provides fallback when LLM fails
 */

import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { AiService } from '../ai/ai.service';

// ============================================
// Functional Categories - What the tool DOES
// ============================================

export enum FunctionalCategory {
  // Data & Visualization
  DATA_VISUALIZATION = 'DATA_VISUALIZATION',
  DATA_ANALYSIS = 'DATA_ANALYSIS',

  // Image Processing
  IMAGE_EDITING = 'IMAGE_EDITING',
  IMAGE_CONVERSION = 'IMAGE_CONVERSION',
  IMAGE_ENHANCEMENT = 'IMAGE_ENHANCEMENT',
  IMAGE_GENERATION = 'IMAGE_GENERATION',

  // Document Processing
  DOCUMENT_CONVERSION = 'DOCUMENT_CONVERSION',
  DOCUMENT_GENERATION = 'DOCUMENT_GENERATION',

  // Calculators & Converters
  MATH_CALCULATOR = 'MATH_CALCULATOR',
  UNIT_CONVERTER = 'UNIT_CONVERTER',
  FINANCIAL_CALCULATOR = 'FINANCIAL_CALCULATOR',
  DATE_TIME_CALCULATOR = 'DATE_TIME_CALCULATOR',

  // Health & Fitness
  HEALTH_TRACKING = 'HEALTH_TRACKING',
  FITNESS_CALCULATOR = 'FITNESS_CALCULATOR',
  NUTRITION_CALCULATOR = 'NUTRITION_CALCULATOR',

  // Business & Professional
  BUSINESS_CALCULATOR = 'BUSINESS_CALCULATOR',
  BUSINESS_DOCUMENT = 'BUSINESS_DOCUMENT',
  MARKETING_TOOLS = 'MARKETING_TOOLS',

  // Code & Development
  CODE_TOOLS = 'CODE_TOOLS',
  DEV_UTILITIES = 'DEV_UTILITIES',

  // Text & Writing
  TEXT_TOOLS = 'TEXT_TOOLS',
  WRITING_TOOLS = 'WRITING_TOOLS',
  AI_WRITING = 'AI_WRITING',

  // Generators
  QR_BARCODE_GENERATOR = 'QR_BARCODE_GENERATOR',
  PASSWORD_GENERATOR = 'PASSWORD_GENERATOR',
  RANDOM_GENERATOR = 'RANDOM_GENERATOR',

  // Events & Planning
  EVENT_PLANNING = 'EVENT_PLANNING',
  WEDDING_PLANNING = 'WEDDING_PLANNING',

  // Media Processing
  AUDIO_PROCESSING = 'AUDIO_PROCESSING',
  VIDEO_PROCESSING = 'VIDEO_PROCESSING',
  MUSIC_TOOLS = 'MUSIC_TOOLS',

  // Lifestyle
  COOKING_RECIPE = 'COOKING_RECIPE',
  TRAVEL_PLANNING = 'TRAVEL_PLANNING',
  HOME_IMPROVEMENT = 'HOME_IMPROVEMENT',
  GARDENING = 'GARDENING',

  // Education & Language
  EDUCATION_TOOLS = 'EDUCATION_TOOLS',
  LANGUAGE_TOOLS = 'LANGUAGE_TOOLS',

  // Vehicles & Transportation
  AUTOMOTIVE = 'AUTOMOTIVE',

  // Property
  REAL_ESTATE = 'REAL_ESTATE',

  // Animals
  PET_CARE = 'PET_CARE',

  // Sports & Outdoors
  SPORTS_CALCULATOR = 'SPORTS_CALCULATOR',
  OUTDOOR_RECREATION = 'OUTDOOR_RECREATION',

  // Spirituality
  ASTROLOGY = 'ASTROLOGY',

  // Environment
  WEATHER_ENVIRONMENT = 'WEATHER_ENVIRONMENT',

  // Crypto
  CRYPTO_TOOLS = 'CRYPTO_TOOLS',

  // Entertainment
  GAMES_ENTERTAINMENT = 'GAMES_ENTERTAINMENT',

  // Family
  PARENTING_FAMILY = 'PARENTING_FAMILY',

  // Personal Care
  BEAUTY_FASHION = 'BEAUTY_FASHION',

  // Legal
  LEGAL_TOOLS = 'LEGAL_TOOLS',

  // Web & SEO
  SEO_WEB_TOOLS = 'SEO_WEB_TOOLS',

  // Productivity
  PRODUCTIVITY = 'PRODUCTIVITY',

  // Fallback
  OTHER = 'OTHER',
}

// ============================================
// Action Types - What user wants to DO
// ============================================

export enum ActionType {
  CREATE = 'CREATE',
  CONVERT = 'CONVERT',
  CALCULATE = 'CALCULATE',
  GENERATE = 'GENERATE',
  TRACK = 'TRACK',
  ANALYZE = 'ANALYZE',
  COMPRESS = 'COMPRESS',
  RESIZE = 'RESIZE',
  MERGE = 'MERGE',
  SPLIT = 'SPLIT',
  EXTRACT = 'EXTRACT',
  TRANSLATE = 'TRANSLATE',
  FORMAT = 'FORMAT',
  EDIT = 'EDIT',
  ENHANCE = 'ENHANCE',
  OTHER = 'OTHER',
}

// ============================================
// Input Types - What type of data is involved
// ============================================

export enum InputType {
  SPREADSHEET = 'SPREADSHEET',
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  TEXT = 'TEXT',
  URL = 'URL',
  NUMBERS = 'NUMBERS',
  CODE = 'CODE',
  NONE = 'NONE',
}

// ============================================
// Zod Schema for LLM Structured Output
// ============================================

export const intentClassificationSchema = z.object({
  functionalCategory: z.nativeEnum(FunctionalCategory),
  actionType: z.nativeEnum(ActionType),
  inputType: z.nativeEnum(InputType),
  confidence: z.number().min(0).max(1),
  extractedValues: z.record(z.any()).optional(),
  reasoning: z.string().optional(),
});

export type IntentClassification = z.infer<typeof intentClassificationSchema>;

// ============================================
// Category Descriptions for LLM
// ============================================

const CATEGORY_DESCRIPTIONS: Record<FunctionalCategory, string> = {
  // Data & Visualization
  [FunctionalCategory.DATA_VISUALIZATION]:
    'Visualizing data from spreadsheets/CSV as charts (bar, line, pie, scatter)',
  [FunctionalCategory.DATA_ANALYSIS]:
    'Analyzing data: statistics, correlation, regression, data processing',

  // Image Processing
  [FunctionalCategory.IMAGE_EDITING]:
    'Editing images: crop, rotate, add text, filters, adjust colors',
  [FunctionalCategory.IMAGE_CONVERSION]:
    'Converting image formats (PNG to JPG, etc) or resizing/compressing',
  [FunctionalCategory.IMAGE_ENHANCEMENT]:
    'Enhancing images: upscale, denoise, sharpen, restore old photos',
  [FunctionalCategory.IMAGE_GENERATION]: 'AI-generating new images from text prompts',

  // Document Processing
  [FunctionalCategory.DOCUMENT_CONVERSION]:
    'Converting document formats (PDF to Word, etc), merging, splitting PDFs',
  [FunctionalCategory.DOCUMENT_GENERATION]:
    'Generating documents from scratch: invoices, resumes, certificates',

  // Calculators & Converters
  [FunctionalCategory.MATH_CALCULATOR]:
    'Mathematical calculations, equations, statistics, geometry, scientific computing',
  [FunctionalCategory.UNIT_CONVERTER]:
    'Converting units: length, weight, temperature, volume, area, etc.',
  [FunctionalCategory.FINANCIAL_CALCULATOR]:
    'Financial calculations: loans, mortgages, investments, taxes, savings',
  [FunctionalCategory.DATE_TIME_CALCULATOR]:
    'Date/time calculations: age, days between, timezone conversion, countdown',

  // Health & Fitness
  [FunctionalCategory.HEALTH_TRACKING]:
    'Tracking health records: medical charts, growth charts, blood pressure, medications',
  [FunctionalCategory.FITNESS_CALCULATOR]:
    'Fitness calculations: BMI, calories, macros, body fat, workout metrics',
  [FunctionalCategory.NUTRITION_CALCULATOR]:
    'Nutrition calculations: vitamins, fiber, sodium, dietary needs',

  // Business & Professional
  [FunctionalCategory.BUSINESS_CALCULATOR]:
    'Business calculations: ROI, profit margins, inventory, shipping, startup metrics',
  [FunctionalCategory.BUSINESS_DOCUMENT]:
    'Creating business documents: proposals, quotes, estimates, contracts',
  [FunctionalCategory.MARKETING_TOOLS]:
    'Marketing and social media: engagement rates, follower analytics, ad metrics',

  // Code & Development
  [FunctionalCategory.CODE_TOOLS]:
    'Code-related tools: format, minify, validate JSON, regex testing',
  [FunctionalCategory.DEV_UTILITIES]:
    'Developer utilities: encoding, hashing, IP lookup, network tools',

  // Text & Writing
  [FunctionalCategory.TEXT_TOOLS]:
    'Text manipulation: word count, case conversion, text analysis',
  [FunctionalCategory.WRITING_TOOLS]:
    'Writing assistance: grammar, spelling, summarization, paraphrasing',
  [FunctionalCategory.AI_WRITING]:
    'AI-powered writing: generate emails, blog posts, social captions, ad copy',

  // Generators
  [FunctionalCategory.QR_BARCODE_GENERATOR]: 'Generating QR codes or barcodes',
  [FunctionalCategory.PASSWORD_GENERATOR]: 'Generating secure passwords, UUIDs, encryption',
  [FunctionalCategory.RANDOM_GENERATOR]:
    'Random generators: dice, coin flip, lottery picker, team generator',

  // Events & Planning
  [FunctionalCategory.EVENT_PLANNING]:
    'Event planning: seating charts, party calculators, countdowns',
  [FunctionalCategory.WEDDING_PLANNING]:
    'Wedding-specific planning: budget, guest list, seating, vendors',

  // Media Processing
  [FunctionalCategory.AUDIO_PROCESSING]:
    'Audio processing: convert formats, trim, merge, transcribe speech',
  [FunctionalCategory.VIDEO_PROCESSING]:
    'Video processing: convert formats, trim, compress, create GIFs, add subtitles',
  [FunctionalCategory.MUSIC_TOOLS]:
    'Music tools: BPM calculator, metronome, chord progressions, tuning',

  // Lifestyle
  [FunctionalCategory.COOKING_RECIPE]:
    'Cooking and recipes: recipe scaling, cooking timers, kitchen conversions',
  [FunctionalCategory.TRAVEL_PLANNING]:
    'Travel planning: itineraries, packing lists, budgets, jet lag',
  [FunctionalCategory.HOME_IMPROVEMENT]:
    'Home improvement: paint, flooring, roofing, electrical, energy calculators',
  [FunctionalCategory.GARDENING]:
    'Gardening: planting calendars, seed spacing, lawn care, compost',

  // Education & Language
  [FunctionalCategory.EDUCATION_TOOLS]:
    'Education tools: GPA, grades, study aids, flashcards, citations',
  [FunctionalCategory.LANGUAGE_TOOLS]:
    'Language tools: translation, roman numerals, linguistic utilities',

  // Vehicles & Transportation
  [FunctionalCategory.AUTOMOTIVE]:
    'Automotive: MPG, car insurance, tire size, EV charging, maintenance',

  // Property
  [FunctionalCategory.REAL_ESTATE]:
    'Real estate: rent vs buy, property tax, rental yield, mortgage refinance',

  // Animals
  [FunctionalCategory.PET_CARE]:
    'Pet care: pet age, food calculator, aquarium, livestock',

  // Sports & Outdoors
  [FunctionalCategory.SPORTS_CALCULATOR]:
    'Sports calculators: golf handicap, bowling score, baseball stats',
  [FunctionalCategory.OUTDOOR_RECREATION]:
    'Outdoor recreation: camping, hiking, skiing, surfing, climbing',

  // Spirituality
  [FunctionalCategory.ASTROLOGY]:
    'Astrology and spirituality: zodiac, horoscope, birth charts, numerology, prayer times',

  // Environment
  [FunctionalCategory.WEATHER_ENVIRONMENT]:
    'Weather and environment: heat index, wind chill, sunrise/sunset, carbon footprint',

  // Crypto
  [FunctionalCategory.CRYPTO_TOOLS]:
    'Cryptocurrency: profit calculator, mining, staking, gas fees, DeFi',

  // Entertainment
  [FunctionalCategory.GAMES_ENTERTAINMENT]:
    'Games and entertainment: trivia, movie picker, gaming calculators, photography',

  // Family
  [FunctionalCategory.PARENTING_FAMILY]:
    'Parenting and family: diaper calculator, baby feeding, child BMI',

  // Personal Care
  [FunctionalCategory.BEAUTY_FASHION]:
    'Beauty and fashion: clothing size, shoe size, ring size, skin analysis',

  // Legal
  [FunctionalCategory.LEGAL_TOOLS]:
    'Legal tools: estate tax, inheritance, insurance estimates',

  // Web & SEO
  [FunctionalCategory.SEO_WEB_TOOLS]:
    'SEO and web tools: keyword density, meta tags, validators, page speed',

  // Productivity
  [FunctionalCategory.PRODUCTIVITY]:
    'Productivity tools: meeting scheduler, time management',

  // Fallback
  [FunctionalCategory.OTHER]: 'Other tools that do not fit above categories',
};

// ============================================
// Attachment Type to Input Type Mapping
// ============================================

const MIME_TO_INPUT_TYPE: Record<string, InputType> = {
  // Images
  'image/png': InputType.IMAGE,
  'image/jpeg': InputType.IMAGE,
  'image/jpg': InputType.IMAGE,
  'image/gif': InputType.IMAGE,
  'image/webp': InputType.IMAGE,
  'image/bmp': InputType.IMAGE,
  'image/tiff': InputType.IMAGE,
  'image/svg+xml': InputType.IMAGE,
  // Spreadsheets
  'text/csv': InputType.SPREADSHEET,
  'application/vnd.ms-excel': InputType.SPREADSHEET,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': InputType.SPREADSHEET,
  // Documents
  'application/pdf': InputType.DOCUMENT,
  'application/msword': InputType.DOCUMENT,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': InputType.DOCUMENT,
  'text/plain': InputType.TEXT,
  // Audio
  'audio/mpeg': InputType.AUDIO,
  'audio/mp3': InputType.AUDIO,
  'audio/wav': InputType.AUDIO,
  'audio/ogg': InputType.AUDIO,
  'audio/flac': InputType.AUDIO,
  'audio/m4a': InputType.AUDIO,
  // Video
  'video/mp4': InputType.VIDEO,
  'video/mpeg': InputType.VIDEO,
  'video/webm': InputType.VIDEO,
  'video/quicktime': InputType.VIDEO,
  'video/x-msvideo': InputType.VIDEO,
  // Code
  'application/json': InputType.CODE,
  'text/javascript': InputType.CODE,
  'text/typescript': InputType.CODE,
  'text/html': InputType.CODE,
  'text/css': InputType.CODE,
  'application/xml': InputType.CODE,
};

@Injectable()
export class IntentClassificationService {
  private readonly logger = new Logger(IntentClassificationService.name);
  private readonly cache = new Map<string, IntentClassification>();
  private readonly MAX_CACHE_SIZE = 1000;

  constructor(private readonly aiService: AiService) {}

  /**
   * Classify user intent using LLM with structured output
   *
   * @param message - The user's message
   * @param attachmentTypes - MIME types of attached files
   * @param conversationContext - Optional previous conversation context
   * @returns IntentClassification with category, action, input type, and confidence
   */
  async classifyIntent(
    message: string,
    attachmentTypes: string[] = [],
    conversationContext?: string,
  ): Promise<IntentClassification> {
    // Check cache first for speed
    const cacheKey = this.getCacheKey(message, attachmentTypes);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for intent classification: ${cacheKey.substring(0, 50)}`);
      return cached;
    }

    // Check if AI service is configured
    if (!this.aiService.isConfigured()) {
      this.logger.warn('AI service not configured, using fallback classification');
      return this.getFallbackClassification(message, attachmentTypes);
    }

    // Build the classification prompt
    const prompt = this.buildClassificationPrompt(message, attachmentTypes, conversationContext);

    try {
      // Call LLM with JSON response format
      const response = await this.aiService.generateText(prompt, {
        temperature: 0.1, // Low temperature for consistent classification
        responseFormat: 'json_object',
        maxTokens: 300, // Keep it short for speed
        systemMessage: 'You are an intent classifier. Respond only with valid JSON matching the requested schema.',
      });

      // Parse and validate with Zod
      const parsed = JSON.parse(response);
      const result = intentClassificationSchema.parse(parsed);

      // Cache the result
      this.cacheResult(cacheKey, result);

      this.logger.debug(
        `Classified intent: ${result.functionalCategory} / ${result.actionType} (confidence: ${result.confidence})`,
      );

      return result;
    } catch (error: any) {
      this.logger.error(`Intent classification failed: ${error.message}`);
      return this.getFallbackClassification(message, attachmentTypes);
    }
  }

  /**
   * Build the classification prompt for the LLM
   */
  private buildClassificationPrompt(
    message: string,
    attachmentTypes: string[],
    context?: string,
  ): string {
    // Build attachment description
    const attachmentDesc =
      attachmentTypes.length > 0
        ? `Attached files: ${attachmentTypes.join(', ')}`
        : 'No attachments';

    // Build category list with descriptions (keep it compact)
    const categoryList = Object.entries(CATEGORY_DESCRIPTIONS)
      .map(([key, desc]) => `- ${key}: ${desc}`)
      .join('\n');

    return `Classify the user's request by FUNCTIONAL PURPOSE.

CRITICAL DISTINCTIONS:
- "chart" with spreadsheet/CSV attachment = DATA_VISUALIZATION (bar/line/pie charts from data)
- "chart" for medical/growth records = HEALTH_TRACKING (dental chart, baby growth chart)
- "chart" for event arrangements = EVENT_PLANNING (seating chart, wedding seating)
- "resize/crop/convert image" = IMAGE_EDITING or IMAGE_CONVERSION
- "generate invoice/quote/receipt" = DOCUMENT_GENERATION
- "calculate BMI/calories/TDEE" = FITNESS_CALCULATOR
- "calculate loan/tax/mortgage" = FINANCIAL_CALCULATOR
- "create QR code" = QR_BARCODE_GENERATOR
- "translate/summarize/grammar" = TEXT_TOOLS

CATEGORIES:
${categoryList}

ACTION TYPES: CREATE, CONVERT, CALCULATE, GENERATE, TRACK, ANALYZE, COMPRESS, RESIZE, MERGE, SPLIT, EXTRACT, TRANSLATE, FORMAT, EDIT, ENHANCE, OTHER

INPUT TYPES: SPREADSHEET, IMAGE, DOCUMENT, AUDIO, VIDEO, TEXT, URL, NUMBERS, CODE, NONE

User message: "${message}"
${attachmentDesc}
${context ? `Context: ${context}` : ''}

Respond with JSON:
{
  "functionalCategory": "<CATEGORY>",
  "actionType": "<ACTION>",
  "inputType": "<INPUT_TYPE>",
  "confidence": 0.0-1.0,
  "extractedValues": { optional extracted values like dimensions, formats },
  "reasoning": "brief explanation"
}`;
  }

  /**
   * Generate cache key from message and attachment types
   */
  private getCacheKey(message: string, attachmentTypes: string[]): string {
    // Normalize message: lowercase, trim, take first 100 chars
    const normalizedMessage = message.toLowerCase().trim().substring(0, 100);
    // Sort attachment types for consistent key
    const attachmentKey = attachmentTypes.sort().join(',');
    return `${normalizedMessage}|${attachmentKey}`;
  }

  /**
   * Cache classification result with size limit
   */
  private cacheResult(key: string, result: IntentClassification): void {
    // Enforce cache size limit with FIFO eviction
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, result);
  }

  /**
   * Fallback classification when LLM fails or is not configured
   * Uses simple heuristics based on attachment types and message keywords
   */
  private getFallbackClassification(
    message: string,
    attachmentTypes: string[],
  ): IntentClassification {
    const messageLower = message.toLowerCase();

    // Determine input type from attachments
    let inputType = InputType.NONE;
    let primaryAttachmentCategory: FunctionalCategory | null = null;

    for (const type of attachmentTypes) {
      const mappedType = MIME_TO_INPUT_TYPE[type.toLowerCase()];
      if (mappedType) {
        inputType = mappedType;
        break;
      }
    }

    // Check for spreadsheet data
    const hasSpreadsheet = attachmentTypes.some(
      (t) =>
        t.includes('csv') ||
        t.includes('excel') ||
        t.includes('spreadsheet'),
    );

    // Check for images
    const hasImage = attachmentTypes.some((t) => t.startsWith('image/'));

    // Check for documents
    const hasDocument = attachmentTypes.some(
      (t) => t.includes('pdf') || t.includes('document') || t.includes('word'),
    );

    // Check for audio/video
    const hasAudio = attachmentTypes.some((t) => t.startsWith('audio/'));
    const hasVideo = attachmentTypes.some((t) => t.startsWith('video/'));

    // Keyword-based fallback classification
    let category = FunctionalCategory.OTHER;
    let action = ActionType.OTHER;
    let confidence = 0.3;

    // Data visualization patterns
    if (
      hasSpreadsheet &&
      (messageLower.includes('chart') ||
        messageLower.includes('graph') ||
        messageLower.includes('visualize') ||
        messageLower.includes('plot'))
    ) {
      category = FunctionalCategory.DATA_VISUALIZATION;
      action = ActionType.CREATE;
      inputType = InputType.SPREADSHEET;
      confidence = 0.7;
    }
    // Image processing patterns
    else if (hasImage) {
      if (messageLower.includes('resize') || messageLower.includes('scale')) {
        category = FunctionalCategory.IMAGE_CONVERSION;
        action = ActionType.RESIZE;
        confidence = 0.7;
      } else if (messageLower.includes('convert') || messageLower.includes('to png') || messageLower.includes('to jpg')) {
        category = FunctionalCategory.IMAGE_CONVERSION;
        action = ActionType.CONVERT;
        confidence = 0.7;
      } else if (messageLower.includes('compress')) {
        category = FunctionalCategory.IMAGE_CONVERSION;
        action = ActionType.COMPRESS;
        confidence = 0.7;
      } else if (
        messageLower.includes('crop') ||
        messageLower.includes('rotate') ||
        messageLower.includes('edit')
      ) {
        category = FunctionalCategory.IMAGE_EDITING;
        action = ActionType.EDIT;
        confidence = 0.7;
      } else if (
        messageLower.includes('enhance') ||
        messageLower.includes('upscale') ||
        messageLower.includes('improve')
      ) {
        category = FunctionalCategory.IMAGE_ENHANCEMENT;
        action = ActionType.ENHANCE;
        confidence = 0.7;
      } else if (messageLower.includes('background') || messageLower.includes('remove bg')) {
        category = FunctionalCategory.IMAGE_EDITING;
        action = ActionType.EDIT;
        confidence = 0.7;
      } else {
        category = FunctionalCategory.IMAGE_EDITING;
        action = ActionType.EDIT;
        confidence = 0.6;
      }
    }
    // Document processing patterns
    else if (hasDocument) {
      if (messageLower.includes('merge') || messageLower.includes('combine')) {
        category = FunctionalCategory.DOCUMENT_CONVERSION;
        action = ActionType.MERGE;
        confidence = 0.7;
      } else if (messageLower.includes('split') || messageLower.includes('extract')) {
        category = FunctionalCategory.DOCUMENT_CONVERSION;
        action = ActionType.SPLIT;
        confidence = 0.7;
      } else if (messageLower.includes('compress')) {
        category = FunctionalCategory.DOCUMENT_CONVERSION;
        action = ActionType.COMPRESS;
        confidence = 0.7;
      } else if (messageLower.includes('convert')) {
        category = FunctionalCategory.DOCUMENT_CONVERSION;
        action = ActionType.CONVERT;
        confidence = 0.7;
      } else {
        category = FunctionalCategory.DOCUMENT_CONVERSION;
        action = ActionType.CONVERT;
        confidence = 0.6;
      }
    }
    // Audio processing patterns
    else if (hasAudio) {
      if (messageLower.includes('transcribe') || messageLower.includes('speech to text')) {
        category = FunctionalCategory.AUDIO_PROCESSING;
        action = ActionType.EXTRACT;
        confidence = 0.7;
      } else {
        category = FunctionalCategory.AUDIO_PROCESSING;
        action = ActionType.CONVERT;
        confidence = 0.6;
      }
    }
    // Video processing patterns
    else if (hasVideo) {
      if (messageLower.includes('gif')) {
        category = FunctionalCategory.VIDEO_PROCESSING;
        action = ActionType.CONVERT;
        confidence = 0.7;
      } else if (messageLower.includes('transcribe') || messageLower.includes('subtitle')) {
        category = FunctionalCategory.VIDEO_PROCESSING;
        action = ActionType.EXTRACT;
        confidence = 0.7;
      } else {
        category = FunctionalCategory.VIDEO_PROCESSING;
        action = ActionType.CONVERT;
        confidence = 0.6;
      }
    }
    // QR code patterns
    else if (messageLower.includes('qr') || messageLower.includes('barcode')) {
      category = FunctionalCategory.QR_BARCODE_GENERATOR;
      action = ActionType.GENERATE;
      inputType = InputType.TEXT;
      confidence = 0.8;
    }
    // Calculator patterns
    else if (messageLower.includes('bmi') || messageLower.includes('calorie') || messageLower.includes('macro')) {
      category = FunctionalCategory.FITNESS_CALCULATOR;
      action = ActionType.CALCULATE;
      inputType = InputType.NUMBERS;
      confidence = 0.8;
    }
    // Financial calculator patterns
    else if (
      messageLower.includes('loan') ||
      messageLower.includes('mortgage') ||
      messageLower.includes('investment') ||
      messageLower.includes('tax')
    ) {
      category = FunctionalCategory.FINANCIAL_CALCULATOR;
      action = ActionType.CALCULATE;
      inputType = InputType.NUMBERS;
      confidence = 0.8;
    }
    // Unit converter patterns
    else if (
      messageLower.includes('convert') &&
      (messageLower.includes('to km') ||
        messageLower.includes('to miles') ||
        messageLower.includes('to kg') ||
        messageLower.includes('to lbs') ||
        messageLower.includes('celsius') ||
        messageLower.includes('fahrenheit') ||
        messageLower.includes('usd') ||
        messageLower.includes('eur'))
    ) {
      category = FunctionalCategory.UNIT_CONVERTER;
      action = ActionType.CONVERT;
      inputType = InputType.NUMBERS;
      confidence = 0.8;
    }
    // Invoice/business document patterns
    else if (
      messageLower.includes('invoice') ||
      messageLower.includes('receipt') ||
      messageLower.includes('quote')
    ) {
      category = FunctionalCategory.DOCUMENT_GENERATION;
      action = ActionType.GENERATE;
      inputType = InputType.TEXT;
      confidence = 0.8;
    }
    // Password generator patterns
    else if (messageLower.includes('password') || messageLower.includes('uuid')) {
      category = FunctionalCategory.PASSWORD_GENERATOR;
      action = ActionType.GENERATE;
      inputType = InputType.NONE;
      confidence = 0.8;
    }
    // Text tool patterns
    else if (
      messageLower.includes('translate') ||
      messageLower.includes('summarize') ||
      messageLower.includes('grammar')
    ) {
      category = FunctionalCategory.TEXT_TOOLS;
      action = messageLower.includes('translate') ? ActionType.TRANSLATE : ActionType.ANALYZE;
      inputType = InputType.TEXT;
      confidence = 0.7;
    }
    // Code tool patterns
    else if (
      messageLower.includes('format code') ||
      messageLower.includes('minify') ||
      messageLower.includes('json') ||
      messageLower.includes('regex')
    ) {
      category = FunctionalCategory.CODE_TOOLS;
      action = ActionType.FORMAT;
      inputType = InputType.CODE;
      confidence = 0.7;
    }

    return {
      functionalCategory: category,
      actionType: action,
      inputType,
      confidence,
      reasoning: 'Fallback classification based on keywords and attachment types',
    };
  }

  /**
   * Clear the classification cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.log('Intent classification cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
    };
  }

  /**
   * Get the primary input type from attachment MIME types
   */
  getInputTypeFromAttachments(attachmentTypes: string[]): InputType {
    for (const type of attachmentTypes) {
      const mappedType = MIME_TO_INPUT_TYPE[type.toLowerCase()];
      if (mappedType) {
        return mappedType;
      }
    }
    return InputType.NONE;
  }

  /**
   * Check if a category is file-based (requires file input)
   */
  isFileBasedCategory(category: FunctionalCategory): boolean {
    const fileCategories = new Set([
      FunctionalCategory.DATA_VISUALIZATION,
      FunctionalCategory.IMAGE_EDITING,
      FunctionalCategory.IMAGE_CONVERSION,
      FunctionalCategory.IMAGE_ENHANCEMENT,
      FunctionalCategory.DOCUMENT_CONVERSION,
      FunctionalCategory.AUDIO_PROCESSING,
      FunctionalCategory.VIDEO_PROCESSING,
    ]);
    return fileCategories.has(category);
  }

  /**
   * Get recommended tools for a functional category
   */
  getRecommendedTools(category: FunctionalCategory): string[] {
    const toolMap: Partial<Record<FunctionalCategory, string[]>> = {
      [FunctionalCategory.DATA_VISUALIZATION]: ['data-visualizer', 'chart-builder'],
      [FunctionalCategory.DATA_ANALYSIS]: ['data-analyzer', 'spreadsheet-tool'],
      [FunctionalCategory.IMAGE_EDITING]: ['image-editor', 'image-cropper', 'background-remover'],
      [FunctionalCategory.IMAGE_CONVERSION]: ['image-converter', 'image-resizer', 'image-compressor'],
      [FunctionalCategory.IMAGE_ENHANCEMENT]: ['image-upscaler', 'image-enhancer'],
      [FunctionalCategory.IMAGE_GENERATION]: ['image-generator', 'ai-art-generator'],
      [FunctionalCategory.DOCUMENT_CONVERSION]: ['pdf-converter', 'pdf-merger', 'pdf-splitter'],
      [FunctionalCategory.DOCUMENT_GENERATION]: ['invoice-generator', 'resume-builder', 'certificate-maker'],
      [FunctionalCategory.MATH_CALCULATOR]: ['scientific-calculator', 'equation-solver'],
      [FunctionalCategory.UNIT_CONVERTER]: ['unit-converter', 'currency-converter', 'temperature-converter'],
      [FunctionalCategory.FINANCIAL_CALCULATOR]: ['loan-calculator', 'mortgage-calculator', 'investment-calculator'],
      [FunctionalCategory.DATE_TIME_CALCULATOR]: ['age-calculator', 'date-calculator', 'timezone-converter'],
      [FunctionalCategory.HEALTH_TRACKING]: ['health-tracker', 'medication-reminder'],
      [FunctionalCategory.FITNESS_CALCULATOR]: ['bmi-calculator', 'calorie-calculator', 'macro-calculator'],
      [FunctionalCategory.NUTRITION_CALCULATOR]: ['nutrition-calculator', 'recipe-nutrition'],
      [FunctionalCategory.BUSINESS_CALCULATOR]: ['roi-calculator', 'profit-calculator'],
      [FunctionalCategory.BUSINESS_DOCUMENT]: ['proposal-generator', 'quote-generator', 'estimate-generator'],
      [FunctionalCategory.MARKETING_TOOLS]: ['marketing-planner', 'ad-generator'],
      [FunctionalCategory.CODE_TOOLS]: ['json-formatter', 'code-formatter', 'regex-tester'],
      [FunctionalCategory.DEV_UTILITIES]: ['hash-generator', 'base64-encoder'],
      [FunctionalCategory.TEXT_TOOLS]: ['text-summarizer', 'translator', 'grammar-checker'],
      [FunctionalCategory.WRITING_TOOLS]: ['email-writer', 'blog-writer', 'social-media-writer'],
      [FunctionalCategory.AI_WRITING]: ['ai-writer', 'content-generator'],
      [FunctionalCategory.QR_BARCODE_GENERATOR]: ['qr-generator', 'barcode-generator'],
      [FunctionalCategory.PASSWORD_GENERATOR]: ['password-generator', 'uuid-generator'],
      [FunctionalCategory.RANDOM_GENERATOR]: ['random-number', 'random-picker'],
      [FunctionalCategory.EVENT_PLANNING]: ['seating-chart', 'event-planner'],
      [FunctionalCategory.WEDDING_PLANNING]: ['wedding-planner', 'wedding-budget'],
      [FunctionalCategory.AUDIO_PROCESSING]: ['audio-converter', 'speech-to-text', 'audio-trimmer'],
      [FunctionalCategory.VIDEO_PROCESSING]: ['video-converter', 'video-to-gif', 'video-compressor'],
      [FunctionalCategory.MUSIC_TOOLS]: ['metronome', 'tuner', 'chord-finder'],
      [FunctionalCategory.COOKING_RECIPE]: ['recipe-scaler', 'meal-planner'],
      [FunctionalCategory.TRAVEL_PLANNING]: ['travel-planner', 'packing-list'],
      [FunctionalCategory.HOME_IMPROVEMENT]: ['paint-calculator', 'room-planner'],
      [FunctionalCategory.GARDENING]: ['planting-calendar', 'garden-planner'],
      [FunctionalCategory.EDUCATION_TOOLS]: ['flashcard-maker', 'grade-calculator'],
      [FunctionalCategory.LANGUAGE_TOOLS]: ['vocabulary-builder', 'language-translator'],
      [FunctionalCategory.AUTOMOTIVE]: ['fuel-calculator', 'car-loan-calculator'],
      [FunctionalCategory.REAL_ESTATE]: ['mortgage-calculator', 'property-calculator'],
      [FunctionalCategory.PET_CARE]: ['pet-age-calculator', 'pet-food-calculator'],
      [FunctionalCategory.SPORTS_CALCULATOR]: ['pace-calculator', 'score-tracker'],
      [FunctionalCategory.OUTDOOR_RECREATION]: ['hiking-planner', 'weather-checker'],
      [FunctionalCategory.ASTROLOGY]: ['zodiac-calculator', 'horoscope', 'birth-chart'],
      [FunctionalCategory.WEATHER_ENVIRONMENT]: ['weather-converter', 'sunrise-calculator'],
      [FunctionalCategory.CRYPTO_TOOLS]: ['crypto-converter', 'crypto-calculator'],
      [FunctionalCategory.GAMES_ENTERTAINMENT]: ['dice-roller', 'random-picker'],
      [FunctionalCategory.PARENTING_FAMILY]: ['due-date-calculator', 'growth-chart'],
      [FunctionalCategory.BEAUTY_FASHION]: ['size-converter', 'color-matcher'],
      [FunctionalCategory.LEGAL_TOOLS]: ['contract-generator', 'legal-calculator'],
      [FunctionalCategory.SEO_WEB_TOOLS]: ['seo-analyzer', 'meta-tag-generator'],
      [FunctionalCategory.PRODUCTIVITY]: ['todo-list', 'time-tracker'],
      [FunctionalCategory.OTHER]: [],
    };

    return toolMap[category] || [];
  }
}
