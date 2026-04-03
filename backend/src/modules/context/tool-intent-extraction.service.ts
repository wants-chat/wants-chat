/**
 * Tool Intent Extraction Service - REFACTORED
 *
 * Uses LLM-based intent classification for ANY language, ANY prompt.
 * No more hacky regex patterns or hardcoded exclusion lists!
 *
 * Architecture:
 * 1. LLM classifies intent by FUNCTIONAL PURPOSE (not keywords)
 * 2. Tool Taxonomy routes to correct category
 * 3. Category-scoped vector search (only search within relevant category)
 * 4. Extract field values from message + attachments
 * 5. Return suggested tools with pre-filled values
 */

import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { ToolSearchService } from '../tool-search/tool-search.service';
import { ContextService } from './context.service';
import { UI_REGISTRY, UIRegistryEntry, UIFieldDefinition } from './ui-registry';
import {
  IntentClassificationService,
  FunctionalCategory,
  IntentClassification,
  ActionType,
  InputType,
} from './intent-classification.service';
import {
  TOOL_TO_CATEGORY,
  TOOL_TAXONOMY,
  getCategoryForTool,
  getToolsInCategory,
} from './tool-taxonomy';
import {
  AttachmentInputDto,
  AttachmentAnalysisDto,
  ConversationMessageDto,
  UserPreferencesDto,
  ToolIntentRequestDto,
  ToolIntentResultDto,
  DetectedIntentDto,
  SuggestedToolDto,
  AttachmentMappingDto,
  ExtractedFieldValueDto,
  ExtractedValueSource,
  ToolCategory,
  FileCategory,
  MIME_TYPE_MAP,
  getFileCategoryFromMime,
  getFileFormatFromMime,
  formatFileSize,
  getSupportedOperations,
} from './dto/tool-intent.dto';

/**
 * Maps FunctionalCategory to attachment field names
 */
const CATEGORY_TO_FIELD_NAMES: Partial<Record<FunctionalCategory, string[]>> = {
  [FunctionalCategory.IMAGE_EDITING]: ['sourceImage', 'inputImage', 'image', 'imageFile', 'photo', 'file'],
  [FunctionalCategory.IMAGE_CONVERSION]: ['sourceImage', 'inputImage', 'image', 'file'],
  [FunctionalCategory.IMAGE_ENHANCEMENT]: ['sourceImage', 'inputImage', 'image', 'file'],
  [FunctionalCategory.DOCUMENT_CONVERSION]: ['sourceFile', 'inputDocument', 'document', 'pdfFile', 'file'],
  [FunctionalCategory.DATA_VISUALIZATION]: ['dataFile', 'csvFile', 'spreadsheet', 'data', 'file'],
  [FunctionalCategory.AUDIO_PROCESSING]: ['audioFile', 'sourceAudio', 'audio', 'file'],
  [FunctionalCategory.VIDEO_PROCESSING]: ['videoFile', 'sourceVideo', 'video', 'file'],
};

/**
 * Maps FunctionalCategory to recommended tool IDs
 * IMPORTANT: These IDs MUST match exactly what exists in frontend/src/data/toolsData.ts
 */
const CATEGORY_TO_RECOMMENDED_TOOLS: Partial<Record<FunctionalCategory, string[]>> = {
  // Data visualization - only data-visualizer exists for charts
  [FunctionalCategory.DATA_VISUALIZATION]: ['data-visualizer'],

  // Image editing - actual tool IDs from registry
  [FunctionalCategory.IMAGE_EDITING]: ['image-resizer', 'background-remover', 'photo-enhancer', 'colorization'],

  // Image conversion - only image-compressor exists
  [FunctionalCategory.IMAGE_CONVERSION]: ['image-compressor'],

  // Image enhancement
  [FunctionalCategory.IMAGE_ENHANCEMENT]: ['image-upscaler', 'photo-enhancer', 'image-restoration'],

  // Document conversion - using actual converters that exist
  [FunctionalCategory.DOCUMENT_CONVERSION]: ['csv-json-converter', 'document-review'],

  // Document generation
  [FunctionalCategory.DOCUMENT_GENERATION]: ['invoice-generator', 'resume-builder', 'quote-builder', 'contract-generator'],

  // Fitness calculators
  [FunctionalCategory.FITNESS_CALCULATOR]: ['bmi-calculator', 'calorie-calculator', 'macro-calculator', 'body-fat-calculator'],

  // Financial calculators
  [FunctionalCategory.FINANCIAL_CALCULATOR]: ['loan-calculator', 'mortgage-calculator', 'tip-calculator', 'compound-interest'],

  // Unit converters
  [FunctionalCategory.UNIT_CONVERTER]: ['currency-converter', 'temperature-converter', 'length-converter', 'clothing-size-converter'],

  // Date/time calculators
  [FunctionalCategory.DATE_TIME_CALCULATOR]: ['age-calculator', 'timezone-meeting-planner', 'anniversary-calculator', 'due-date-calculator'],

  // QR/Barcode generators
  [FunctionalCategory.QR_BARCODE_GENERATOR]: ['qr-generator', 'barcode-generator'],

  // Password/security tools
  [FunctionalCategory.PASSWORD_GENERATOR]: ['password-generator', 'uuid-generator', 'password-strength'],

  // Code tools
  [FunctionalCategory.CODE_TOOLS]: ['json-formatter', 'code-beautifier', 'regex-tester', 'code-minifier'],

  // Text tools
  [FunctionalCategory.TEXT_TOOLS]: ['article-summarizer', 'grammar-checker', 'word-counter', 'text-compare'],

  // Writing tools
  [FunctionalCategory.WRITING_TOOLS]: ['email-composer', 'blog-post-generator', 'social-media-post', 'cover-letter'],

  // Audio processing
  [FunctionalCategory.AUDIO_PROCESSING]: ['audio-extractor', 'text-to-speech'],

  // Video processing
  [FunctionalCategory.VIDEO_PROCESSING]: ['video-trimmer', 'gif-creator', 'ai-video-generator'],

  // Health tracking
  [FunctionalCategory.HEALTH_TRACKING]: ['medication-reminder', 'blood-pressure-log', 'allergy-tracker'],

  // Event planning
  [FunctionalCategory.EVENT_PLANNING]: ['seating-chart', 'event-planner', 'guest-list', 'event-timeline'],

  // Image generation (AI Creative tools)
  [FunctionalCategory.IMAGE_GENERATION]: ['ai-image-generator', 'ai-logo-generator', 'avatar-generator', 'banner-generator'],

  // AI Writing tools
  [FunctionalCategory.AI_WRITING]: ['ai-essay-writer', 'ai-story-generator', 'ai-poem-generator', 'ai-bio-generator'],
};

/**
 * Service for extracting tool intent from user messages and attachments.
 * Uses LLM-based classification for accurate, language-agnostic intent detection.
 */
@Injectable()
export class ToolIntentExtractionService {
  private readonly logger = new Logger(ToolIntentExtractionService.name);

  constructor(
    private readonly toolSearchService: ToolSearchService,
    private readonly aiService: AiService,
    private readonly contextService: ContextService,
    private readonly intentClassificationService: IntentClassificationService,
  ) {}

  /**
   * Main method: Extract tool intent from user message and attachments
   */
  async extractToolIntent(request: ToolIntentRequestDto): Promise<ToolIntentResultDto> {
    const startTime = Date.now();
    const { message, attachments = [], conversationContext = [], userPreferences, userId } = request;

    this.logger.log(
      `Extracting tool intent for user ${userId || 'anonymous'}: "${message.substring(0, 100)}..."`,
    );

    try {
      // Step 1: Analyze attachments
      const analyzedAttachments = this.analyzeAttachments(attachments);
      const attachmentMimeTypes = attachments.map(a => a.type);

      // Step 2: Classify intent using LLM (works for ANY language)
      const intentClassification = await this.intentClassificationService.classifyIntent(
        message,
        attachmentMimeTypes,
        conversationContext.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n'),
      );

      this.logger.debug(
        `Intent classified: ${intentClassification.functionalCategory} / ${intentClassification.actionType} ` +
        `(confidence: ${intentClassification.confidence})`,
      );

      // Step 3: Extract field values from message and attachments
      const extractedValues = this.extractFieldValues(
        message,
        attachments,
        userPreferences,
        intentClassification,
      );

      // Step 4: Map attachments to tool fields based on category
      const attachmentMappings = this.mapAttachmentsToFields(
        attachments,
        intentClassification.functionalCategory,
      );

      // Step 5: Get suggested tools using category-scoped search
      const suggestedTools = await this.getSuggestedTools(
        message,
        intentClassification,
        extractedValues,
        attachmentMappings,
        userPreferences,
        userId,
      );

      // Build detected intents from classification
      const detectedIntents: DetectedIntentDto[] = this.buildDetectedIntents(intentClassification);

      // Determine if this is a file action
      const hasFileAction = this.intentClassificationService.isFileBasedCategory(
        intentClassification.functionalCategory,
      ) && attachments.length > 0;

      // Check if more info is needed
      const requiresMoreInfo =
        suggestedTools.length > 0 &&
        suggestedTools[0].missingRequiredFields &&
        suggestedTools[0].missingRequiredFields.length > 0;

      const result: ToolIntentResultDto = {
        detectedIntents,
        extractedValues,
        attachmentMappings,
        suggestedTools,
        analyzedAttachments,
        primaryIntent: suggestedTools.length > 0 ? suggestedTools[0].toolId : undefined,
        userGoal: intentClassification.reasoning,
        followUpQuestions: requiresMoreInfo
          ? this.generateFollowUpQuestions(suggestedTools[0])
          : undefined,
        hasFileAction,
        requiresMoreInfo,
        processedAt: new Date().toISOString(),
      };

      this.logger.log(
        `Tool intent extraction completed in ${Date.now() - startTime}ms: ` +
        `category=${intentClassification.functionalCategory}, ${suggestedTools.length} tools suggested`,
      );

      return result;
    } catch (error: any) {
      this.logger.error(`Tool intent extraction failed: ${error.message}`, error.stack);

      // Return empty result on error
      return {
        detectedIntents: [],
        extractedValues: {},
        attachmentMappings: [],
        suggestedTools: [],
        hasFileAction: false,
        requiresMoreInfo: false,
        processedAt: new Date().toISOString(),
      };
    }
  }

  // ============================================
  // Step 1: Attachment Analysis
  // ============================================

  /**
   * Analyze attachments and return detailed metadata
   */
  private analyzeAttachments(attachments: AttachmentInputDto[]): AttachmentAnalysisDto[] {
    if (!attachments || attachments.length === 0) {
      return [];
    }

    return attachments.map((attachment, index) => {
      const mimeInfo = MIME_TYPE_MAP[attachment.type.toLowerCase()];
      const category = mimeInfo?.category || getFileCategoryFromMime(attachment.type);
      const format = mimeInfo?.format || getFileFormatFromMime(attachment.type);
      const extension = attachment.name.split('.').pop()?.toLowerCase() || '';

      const analysis: AttachmentAnalysisDto = {
        id: `attachment-${index}-${Date.now()}`,
        url: attachment.url,
        name: attachment.name,
        originalName: attachment.name,
        mimeType: attachment.type,
        category,
        format,
        extension,
        size: attachment.size,
        sizeFormatted: formatFileSize(attachment.size),
        isProcessable: category !== FileCategory.UNKNOWN,
        supportedOperations: getSupportedOperations(category),
        analyzedAt: new Date().toISOString(),
      };

      // Add category-specific metadata if provided
      if (attachment.metadata) {
        if (category === FileCategory.IMAGE && attachment.metadata.width) {
          analysis.imageMetadata = {
            width: attachment.metadata.width,
            height: attachment.metadata.height,
            format: format,
            aspectRatio:
              attachment.metadata.width && attachment.metadata.height
                ? attachment.metadata.width / attachment.metadata.height
                : undefined,
          };
        } else if (category === FileCategory.DOCUMENT && attachment.metadata.pageCount) {
          analysis.documentMetadata = {
            pageCount: attachment.metadata.pageCount,
            title: attachment.metadata.title,
            author: attachment.metadata.author,
          };
        } else if (category === FileCategory.SPREADSHEET) {
          analysis.spreadsheetMetadata = {
            rowCount: attachment.metadata.rowCount || 0,
            columnCount: attachment.metadata.columnCount || 0,
            headers: attachment.metadata.headers,
          };
        } else if (category === FileCategory.AUDIO && attachment.metadata.duration) {
          analysis.audioMetadata = {
            duration: attachment.metadata.duration,
            format: format,
          };
        } else if (category === FileCategory.VIDEO && attachment.metadata.duration) {
          analysis.videoMetadata = {
            duration: attachment.metadata.duration,
            width: attachment.metadata.width || 0,
            height: attachment.metadata.height || 0,
          };
        }
        analysis.rawMetadata = attachment.metadata;
      }

      return analysis;
    });
  }

  // ============================================
  // Step 3: Field Value Extraction
  // ============================================

  /**
   * Extract field values from message, attachments, and user preferences
   */
  private extractFieldValues(
    message: string,
    attachments: AttachmentInputDto[],
    userPreferences: UserPreferencesDto | undefined,
    classification: IntentClassification,
  ): Record<string, ExtractedFieldValueDto> {
    const values: Record<string, ExtractedFieldValueDto> = {};

    // Use extracted values from LLM classification if available
    if (classification.extractedValues) {
      for (const [key, value] of Object.entries(classification.extractedValues)) {
        if (value !== undefined && value !== null) {
          values[key] = {
            fieldName: key,
            value,
            source: ExtractedValueSource.MESSAGE,
            confidence: classification.confidence,
            extractedFrom: 'LLM extraction',
          };
        }
      }
    }

    // Extract dimensions (e.g., "800x600", "1920 x 1080")
    if (!values.width && !values.height) {
      const dimensionMatch = message.match(/(\d+)\s*[xX×]\s*(\d+)/);
      if (dimensionMatch) {
        values.width = {
          fieldName: 'width',
          value: parseInt(dimensionMatch[1]),
          source: ExtractedValueSource.MESSAGE,
          confidence: 0.95,
          extractedFrom: dimensionMatch[0],
        };
        values.height = {
          fieldName: 'height',
          value: parseInt(dimensionMatch[2]),
          source: ExtractedValueSource.MESSAGE,
          confidence: 0.95,
          extractedFrom: dimensionMatch[0],
        };
      }
    }

    // Extract percentages
    const percentMatch = message.match(/(\d+)\s*%/);
    if (percentMatch) {
      const percent = parseInt(percentMatch[1]);
      const messageLower = message.toLowerCase();
      if (messageLower.includes('quality')) {
        values.quality = {
          fieldName: 'quality',
          value: percent,
          source: ExtractedValueSource.MESSAGE,
          confidence: 0.9,
          extractedFrom: percentMatch[0],
        };
      } else if (messageLower.includes('tip')) {
        values.tipPercentage = {
          fieldName: 'tipPercentage',
          value: percent,
          source: ExtractedValueSource.MESSAGE,
          confidence: 0.9,
          extractedFrom: percentMatch[0],
        };
      } else if (messageLower.includes('scale') || messageLower.includes('resize')) {
        values.scale = {
          fieldName: 'scale',
          value: percent / 100,
          source: ExtractedValueSource.MESSAGE,
          confidence: 0.85,
          extractedFrom: percentMatch[0],
        };
      }
    }

    // Extract format conversions
    if (!values.outputFormat) {
      const formatMatch = message.toLowerCase().match(
        /(?:to|into|as)\s+(png|jpg|jpeg|webp|gif|pdf|mp3|mp4|wav|csv|xlsx|json)/,
      );
      if (formatMatch) {
        values.outputFormat = {
          fieldName: 'outputFormat',
          value: formatMatch[1] === 'jpg' ? 'jpeg' : formatMatch[1],
          source: ExtractedValueSource.MESSAGE,
          confidence: 0.95,
          extractedFrom: formatMatch[0],
        };
      }
    }

    // Extract URLs
    const urlMatch = message.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      values.url = {
        fieldName: 'url',
        value: urlMatch[0],
        source: ExtractedValueSource.MESSAGE,
        confidence: 1.0,
        extractedFrom: urlMatch[0],
      };
      // Also set as content for QR codes
      if (classification.functionalCategory === FunctionalCategory.QR_BARCODE_GENERATOR) {
        values.content = {
          fieldName: 'content',
          value: urlMatch[0],
          source: ExtractedValueSource.MESSAGE,
          confidence: 0.9,
          extractedFrom: urlMatch[0],
        };
      }
    }

    // Extract currency amounts
    const currencyMatch = message.match(
      /\$\s*([\d,]+(?:\.\d{2})?)|(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(USD|EUR|GBP|JPY)/i,
    );
    if (currencyMatch) {
      const amount = currencyMatch[1] || currencyMatch[2];
      values.amount = {
        fieldName: 'amount',
        value: parseFloat(amount.replace(/,/g, '')),
        source: ExtractedValueSource.MESSAGE,
        confidence: 0.9,
        extractedFrom: currencyMatch[0],
      };
    }

    // Extract text in quotes
    const quotedMatch = message.match(/"([^"]+)"/);
    if (quotedMatch) {
      values.text = {
        fieldName: 'text',
        value: quotedMatch[1],
        source: ExtractedValueSource.MESSAGE,
        confidence: 0.95,
        extractedFrom: quotedMatch[0],
      };
    }

    // Add user preferences
    if (userPreferences) {
      if (userPreferences.preferredCurrency && !values.currency) {
        values.currency = {
          fieldName: 'currency',
          value: userPreferences.preferredCurrency,
          source: ExtractedValueSource.PREFERENCE,
          confidence: 0.7,
          sourceDescription: 'User preference',
        };
      }
      if (userPreferences.measurementSystem) {
        values.measurementSystem = {
          fieldName: 'measurementSystem',
          value: userPreferences.measurementSystem,
          source: ExtractedValueSource.PREFERENCE,
          confidence: 0.8,
          sourceDescription: 'User preference',
        };
      }
      if (userPreferences.weightKg && !values.weight) {
        values.weight = {
          fieldName: 'weight',
          value: userPreferences.weightKg,
          source: ExtractedValueSource.PREFERENCE,
          confidence: 0.6,
          sourceDescription: 'User profile',
        };
      }
      if (userPreferences.heightCm && !values.height) {
        values.height = {
          fieldName: 'height',
          value: userPreferences.heightCm,
          source: ExtractedValueSource.PREFERENCE,
          confidence: 0.6,
          sourceDescription: 'User profile',
        };
      }
      if (userPreferences.companyName) {
        values.companyName = {
          fieldName: 'companyName',
          value: userPreferences.companyName,
          source: ExtractedValueSource.PREFERENCE,
          confidence: 0.8,
          sourceDescription: 'User profile',
        };
      }
      if (userPreferences.timezone) {
        values.timezone = {
          fieldName: 'timezone',
          value: userPreferences.timezone,
          source: ExtractedValueSource.PREFERENCE,
          confidence: 0.8,
          sourceDescription: 'User preference',
        };
      }
    }

    // Add attachment as file input
    if (attachments.length > 0) {
      values.inputFile = {
        fieldName: 'inputFile',
        value: attachments[0].url,
        source: ExtractedValueSource.ATTACHMENT,
        confidence: 1.0,
        attachmentId: attachments[0].url,
        sourceDescription: attachments[0].name,
      };
    }

    return values;
  }

  // ============================================
  // Step 4: Attachment to Field Mapping
  // ============================================

  /**
   * Map attachments to specific tool fields based on category
   */
  private mapAttachmentsToFields(
    attachments: AttachmentInputDto[],
    category: FunctionalCategory,
  ): AttachmentMappingDto[] {
    const mappings: AttachmentMappingDto[] = [];

    // Get field names for this category
    const possibleFields = CATEGORY_TO_FIELD_NAMES[category] || ['file'];

    for (const attachment of attachments) {
      const fileCategory = getFileCategoryFromMime(attachment.type);

      // Determine the best field name
      let fieldName = possibleFields[0];
      let confidence = 0.9;
      let reason = `${fileCategory} file for ${category}`;

      mappings.push({
        attachmentId: attachment.url,
        fieldName,
        confidence,
        reason,
        isPrimary: mappings.length === 0,
        alternativeFields: possibleFields.slice(1),
      });
    }

    return mappings;
  }

  // ============================================
  // Step 5: Get Suggested Tools (Category-Scoped)
  // ============================================

  /**
   * Get suggested tools using category-scoped search
   * This is the key improvement - we only search within the relevant category!
   */
  private async getSuggestedTools(
    message: string,
    classification: IntentClassification,
    extractedValues: Record<string, ExtractedFieldValueDto>,
    attachmentMappings: AttachmentMappingDto[],
    userPreferences: UserPreferencesDto | undefined,
    userId: string | undefined,
  ): Promise<SuggestedToolDto[]> {
    const suggestedTools: SuggestedToolDto[] = [];
    const addedToolIds = new Set<string>();
    const category = classification.functionalCategory;

    // 1. PRIORITY: Add recommended tools for this category
    const recommendedTools = CATEGORY_TO_RECOMMENDED_TOOLS[category] || [];

    for (const toolId of recommendedTools) {
      if (addedToolIds.has(toolId)) continue;

      // Try to find in registry
      const registryKey = toolId.replace(/-/g, '_');
      const registryEntry = UI_REGISTRY[registryKey] || UI_REGISTRY[toolId];

      const prefillValues: Record<string, any> = {};
      const extractedFields: ExtractedFieldValueDto[] = [];

      for (const [key, value] of Object.entries(extractedValues)) {
        prefillValues[key] = value.value;
        extractedFields.push(value);
      }
      for (const mapping of attachmentMappings) {
        prefillValues[mapping.fieldName] = mapping.attachmentId;
      }

      suggestedTools.push({
        toolId,
        toolName: registryEntry?.name || this.formatToolName(toolId),
        description: registryEntry?.description || '',
        icon: '',
        category: registryEntry?.category || category,
        relevanceScore: classification.confidence + 0.1, // Boost recommended tools
        prefillValues,
        extractedFields,
        attachmentMappings: attachmentMappings.length > 0 ? attachmentMappings : undefined,
        isReady: Object.keys(prefillValues).length > 0,
        missingRequiredFields: [],
      });
      addedToolIds.add(toolId);
    }

    // 2. Search for additional tools using vector search
    // But ONLY include tools that belong to the same category!
    try {
      const searchResult = await this.toolSearchService.searchTools(message, 15);

      for (const tool of searchResult.tools) {
        if (addedToolIds.has(tool.toolId)) continue;

        // CRITICAL: Only include tools from the SAME functional category
        const toolCategory = getCategoryForTool(tool.toolId);
        if (toolCategory !== category && toolCategory !== FunctionalCategory.OTHER) {
          this.logger.debug(
            `Excluding ${tool.toolId}: category ${toolCategory} !== ${category}`,
          );
          continue;
        }

        // Build prefill values
        const prefillValues: Record<string, any> = {};
        const extractedFields: ExtractedFieldValueDto[] = [];
        for (const [key, value] of Object.entries(extractedValues)) {
          prefillValues[key] = value.value;
          extractedFields.push(value);
        }
        for (const mapping of attachmentMappings) {
          prefillValues[mapping.fieldName] = mapping.attachmentId;
        }

        suggestedTools.push({
          toolId: tool.toolId,
          toolName: tool.title,
          description: tool.description,
          icon: tool.icon,
          category: tool.category,
          relevanceScore: tool.score * classification.confidence,
          prefillValues,
          extractedFields,
          attachmentMappings: attachmentMappings.length > 0 ? attachmentMappings : undefined,
          isReady: Object.keys(prefillValues).length > 0,
          missingRequiredFields: [],
        });
        addedToolIds.add(tool.toolId);
      }
    } catch (error: any) {
      this.logger.warn(`Tool search failed: ${error.message}`);
    }

    // 3. If no tools found, fall back to registry lookup
    if (suggestedTools.length === 0) {
      const categoryTools = getToolsInCategory(category);
      for (const toolId of categoryTools.slice(0, 3)) {
        const registryKey = toolId.replace(/-/g, '_');
        const registryEntry = UI_REGISTRY[registryKey];
        if (registryEntry) {
          const prefillValues: Record<string, any> = {};
          for (const [key, value] of Object.entries(extractedValues)) {
            prefillValues[key] = value.value;
          }
          for (const mapping of attachmentMappings) {
            prefillValues[mapping.fieldName] = mapping.attachmentId;
          }

          suggestedTools.push({
            toolId: toolId.replace(/_/g, '-'),
            toolName: registryEntry.name,
            description: registryEntry.description || '',
            icon: '',
            category: registryEntry.category,
            relevanceScore: classification.confidence * 0.8,
            prefillValues,
            extractedFields: [],
            attachmentMappings: attachmentMappings.length > 0 ? attachmentMappings : undefined,
            isReady: Object.keys(prefillValues).length > 0,
            missingRequiredFields: [],
          });
        }
      }
    }

    // Sort by relevance
    suggestedTools.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return suggestedTools.slice(0, 6);
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Build detected intents from classification
   */
  private buildDetectedIntents(classification: IntentClassification): DetectedIntentDto[] {
    const categoryToToolCategory = this.mapFunctionalCategoryToToolCategory(
      classification.functionalCategory,
    );

    return [
      {
        toolId: classification.functionalCategory,
        confidence: classification.confidence,
        category: categoryToToolCategory,
        reason: classification.reasoning || `Classified as ${classification.functionalCategory}`,
      },
    ];
  }

  /**
   * Map FunctionalCategory to legacy ToolCategory
   */
  private mapFunctionalCategoryToToolCategory(category: FunctionalCategory): ToolCategory {
    const mapping: Partial<Record<FunctionalCategory, ToolCategory>> = {
      [FunctionalCategory.DATA_VISUALIZATION]: ToolCategory.DATA_CHART,
      [FunctionalCategory.IMAGE_EDITING]: ToolCategory.IMAGE_RESIZE,
      [FunctionalCategory.IMAGE_CONVERSION]: ToolCategory.IMAGE_CONVERT,
      [FunctionalCategory.DOCUMENT_CONVERSION]: ToolCategory.DOCUMENT_CONVERT,
      [FunctionalCategory.DOCUMENT_GENERATION]: ToolCategory.GENERATOR_INVOICE,
      [FunctionalCategory.FITNESS_CALCULATOR]: ToolCategory.CALCULATOR_BMI,
      [FunctionalCategory.FINANCIAL_CALCULATOR]: ToolCategory.CALCULATOR_LOAN,
      [FunctionalCategory.UNIT_CONVERTER]: ToolCategory.CONVERTER_CURRENCY,
      [FunctionalCategory.QR_BARCODE_GENERATOR]: ToolCategory.GENERATOR_QR,
      [FunctionalCategory.TEXT_TOOLS]: ToolCategory.TEXT_SUMMARIZE,
      [FunctionalCategory.AUDIO_PROCESSING]: ToolCategory.MEDIA_AUDIO_CONVERT,
      [FunctionalCategory.VIDEO_PROCESSING]: ToolCategory.MEDIA_VIDEO_CONVERT,
    };

    return mapping[category] || ToolCategory.IMAGE_RESIZE;
  }

  /**
   * Format tool ID to human-readable name
   */
  private formatToolName(toolId: string): string {
    return toolId
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  /**
   * Generate follow-up questions for missing required fields
   */
  private generateFollowUpQuestions(tool: SuggestedToolDto): string[] {
    const questions: string[] = [];

    if (tool.missingRequiredFields) {
      for (const field of tool.missingRequiredFields) {
        switch (field) {
          case 'width':
          case 'height':
            questions.push('What dimensions would you like for the output?');
            break;
          case 'outputFormat':
            questions.push('What format would you like the output in?');
            break;
          case 'quality':
            questions.push('What quality level would you prefer?');
            break;
          case 'url':
            questions.push('What URL would you like to process?');
            break;
          case 'text':
          case 'content':
            questions.push('What text or content would you like to use?');
            break;
          case 'amount':
            questions.push('What amount should I use?');
            break;
          case 'targetLanguage':
            questions.push('What language should I translate to?');
            break;
          default:
            questions.push(`What value would you like for ${field.replace(/_/g, ' ')}?`);
        }
      }
    }

    return [...new Set(questions)].slice(0, 3);
  }

  /**
   * Get attachment summary for system prompt
   */
  getAttachmentSummary(attachments: AttachmentInputDto[]): string {
    if (!attachments || attachments.length === 0) {
      return '';
    }

    const summary: string[] = [];
    const byCategory: Record<string, string[]> = {};

    for (const attachment of attachments) {
      const category = getFileCategoryFromMime(attachment.type);
      if (!byCategory[category]) {
        byCategory[category] = [];
      }
      byCategory[category].push(attachment.name);
    }

    for (const [category, files] of Object.entries(byCategory)) {
      summary.push(`User has attached ${files.length} ${category} file(s): ${files.join(', ')}`);
    }

    return summary.join('\n');
  }

  /**
   * Get tool suggestions based on attachment types
   * IMPORTANT: Tool IDs MUST match exactly what exists in frontend/src/data/toolsData.ts
   */
  getAttachmentBasedToolBoosts(attachments: AttachmentInputDto[]): string[] {
    const boosts: string[] = [];

    for (const attachment of attachments) {
      const category = getFileCategoryFromMime(attachment.type);

      switch (category) {
        case FileCategory.IMAGE:
          // Actual image tools from registry
          boosts.push(
            'image-resizer', 'image-compressor', 'background-remover',
            'image-upscaler', 'photo-enhancer', 'image-restoration',
            'image-to-text', 'colorization',
          );
          break;
        case FileCategory.DOCUMENT:
          // Document tools that exist
          boosts.push(
            'document-review', 'contract-generator', 'csv-json-converter',
          );
          break;
        case FileCategory.SPREADSHEET:
        case FileCategory.DATA:
          // Data visualization
          boosts.push('data-visualizer', 'csv-json-converter');
          break;
        case FileCategory.AUDIO:
          // Audio tools that exist
          boosts.push('audio-extractor', 'text-to-speech');
          break;
        case FileCategory.VIDEO:
          // Video tools that exist
          boosts.push('video-trimmer', 'gif-creator', 'ai-video-generator');
          break;
      }
    }

    return [...new Set(boosts)];
  }
}
