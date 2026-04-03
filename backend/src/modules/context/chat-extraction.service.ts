import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { AiService } from '../ai/ai.service';
import {
  EntityType,
  ExtractionMethod,
  SaveChatContextDto,
  ExtractToolPrefillDto,
  ToolPrefillResponseDto,
  ToolPrefillValueDto,
} from './dto';
import { ContextService } from './context.service';

interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

interface ExtractionResult {
  entities: Array<{
    entity_type: EntityType;
    entity_value: string;
    confidence: number;
    metadata?: Record<string, any>;
  }>;
}

const EXTRACTION_PROMPT = `You are an entity extraction assistant. Analyze the user's message and extract any relevant entities.

Only extract entities with HIGH confidence (>0.85). Do not guess or infer - only extract explicitly stated information.

Entity types to look for:
- BUDGET: Monetary amounts for projects/budgets (e.g., "$5000", "10k budget")
- DEADLINE: Dates or timeframes (e.g., "by next Friday", "in 2 weeks")
- COMPANY_NAME: Business/company names mentioned
- PRODUCT_NAME: Product or service names
- PROJECT_NAME: Project or campaign names
- PERSON_NAME: Names of people (clients, contacts)
- EMAIL: Email addresses
- PHONE: Phone numbers
- LOCATION: Cities, addresses, regions
- TECH_STACK: Technologies, frameworks, languages mentioned
- DESIGN_STYLE: Design preferences (modern, minimal, etc.)
- TARGET_AUDIENCE: Target demographics mentioned
- INDUSTRY: Industry/sector mentioned
- CURRENCY: Currency preferences (USD, EUR, etc.)
- LANGUAGE: Language preferences
- TOPIC: Main subject/topic the user wants to work on (e.g., "e-book creation", "fitness guide")
- INTENT: What the user wants to do/create (verb phrase like "create", "write", "generate")
- SUBJECT: Specific subject matter (e.g., "machine learning", "healthy recipes")
- TITLE: Explicit title mentioned by user

Return a JSON object with an "entities" array. Each entity should have:
- entity_type: One of the types above
- entity_value: The extracted value
- confidence: Number between 0.85 and 1.0
- metadata: Optional additional context

If no high-confidence entities are found, return: {"entities": []}

Example response:
{
  "entities": [
    {"entity_type": "BUDGET", "entity_value": "5000", "confidence": 0.95, "metadata": {"currency": "USD"}},
    {"entity_type": "COMPANY_NAME", "entity_value": "Acme Corp", "confidence": 0.92},
    {"entity_type": "TOPIC", "entity_value": "e-book creation", "confidence": 0.90}
  ]
}`;

@Injectable()
export class ChatExtractionService implements OnModuleInit {
  private readonly logger = new Logger(ChatExtractionService.name);
  private isRunning = false;
  private extractionInterval: NodeJS.Timeout | null = null;
  private readonly intervalMs: number;
  private readonly batchSize: number;
  private readonly enabled: boolean;

  constructor(
    private readonly db: DatabaseService,
    private readonly aiService: AiService,
    private readonly contextService: ContextService,
    private readonly configService: ConfigService,
  ) {
    // Configuration
    this.intervalMs = this.configService.get<number>(
      'CHAT_EXTRACTION_INTERVAL_MS',
      5 * 60 * 1000, // Default: 5 minutes
    );
    this.batchSize = this.configService.get<number>(
      'CHAT_EXTRACTION_BATCH_SIZE',
      50,
    );
    this.enabled = this.configService.get<boolean>(
      'CHAT_EXTRACTION_ENABLED',
      true,
    );
  }

  async onModuleInit(): Promise<void> {
    if (this.enabled && this.aiService.isConfigured()) {
      this.startPeriodicExtraction();
      this.logger.log(
        `✅ Chat extraction service started (interval: ${this.intervalMs / 1000}s)`,
      );
    } else {
      this.logger.warn(
        'Chat extraction disabled (CHAT_EXTRACTION_ENABLED=false or AI not configured)',
      );
    }
  }

  // ============================================
  // PERIODIC EXTRACTION
  // ============================================

  startPeriodicExtraction(): void {
    if (this.extractionInterval) {
      clearInterval(this.extractionInterval);
    }

    // Run immediately on start (after 30 second delay)
    setTimeout(() => this.runExtractionCycle(), 30000);

    // Then run periodically
    this.extractionInterval = setInterval(
      () => this.runExtractionCycle(),
      this.intervalMs,
    );
  }

  stopPeriodicExtraction(): void {
    if (this.extractionInterval) {
      clearInterval(this.extractionInterval);
      this.extractionInterval = null;
    }
  }

  async runExtractionCycle(): Promise<void> {
    if (this.isRunning) {
      this.logger.debug('Extraction cycle already running, skipping');
      return;
    }

    this.isRunning = true;

    try {
      const unprocessedMessages = await this.getUnprocessedMessages();

      if (unprocessedMessages.length === 0) {
        this.logger.debug('No unprocessed messages found');
        return;
      }

      this.logger.log(
        `Processing ${unprocessedMessages.length} messages for entity extraction`,
      );

      let extractedCount = 0;

      for (const message of unprocessedMessages) {
        try {
          const entities = await this.extractEntitiesFromMessage(message);

          if (entities.length > 0) {
            await this.saveExtractedEntities(message, entities);
            extractedCount += entities.length;
          }

          await this.markMessageProcessed(message.id);
        } catch (error) {
          this.logger.error(
            `Failed to process message ${message.id}: ${error.message}`,
          );
          // Mark as processed anyway to avoid infinite retry loop
          await this.markMessageProcessed(message.id, true);
        }
      }

      this.logger.log(
        `Extraction cycle complete: ${extractedCount} entities extracted`,
      );
    } catch (error) {
      this.logger.error(`Extraction cycle failed: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  // ============================================
  // MESSAGE PROCESSING
  // ============================================

  async getUnprocessedMessages(): Promise<Message[]> {
    // Get user messages that haven't been processed for entity extraction
    // We track this via a metadata flag
    const sql = `
      SELECT m.*
      FROM "messages" m
      WHERE m.role = 'user'
        AND (m.metadata IS NULL OR m.metadata->>'entity_extraction_processed' IS NULL)
        AND m.created_at > NOW() - INTERVAL '7 days'
      ORDER BY m.created_at ASC
      LIMIT $1
    `;

    const result = await this.db.query<Message>(sql, [this.batchSize]);
    return result.rows;
  }

  async markMessageProcessed(
    messageId: string,
    failed = false,
  ): Promise<void> {
    await this.db.query(
      `
      UPDATE "messages"
      SET metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb
      WHERE id = $1
    `,
      [
        messageId,
        JSON.stringify({
          entity_extraction_processed: true,
          entity_extraction_failed: failed,
          entity_extraction_at: new Date().toISOString(),
        }),
      ],
    );
  }

  // ============================================
  // ENTITY EXTRACTION
  // ============================================

  async extractEntitiesFromMessage(
    message: Message,
  ): Promise<ExtractionResult['entities']> {
    if (!this.aiService.isConfigured()) {
      return [];
    }

    // Skip very short messages
    if (message.content.length < 10) {
      return [];
    }

    try {
      const response = await this.aiService.generateText(
        `User message: "${message.content}"`,
        {
          systemMessage: EXTRACTION_PROMPT,
          responseFormat: 'json_object',
          temperature: 0.1, // Low temperature for consistent extraction
          maxTokens: 1000,
        },
      );

      const result = JSON.parse(response) as ExtractionResult;

      // Filter only high-confidence entities
      return (result.entities || []).filter(
        (e) => e.confidence >= 0.85 && this.isValidEntityType(e.entity_type),
      );
    } catch (error) {
      this.logger.error(`Entity extraction failed: ${error.message}`);
      return [];
    }
  }

  isValidEntityType(type: string): boolean {
    return Object.values(EntityType).includes(type as EntityType);
  }

  // ============================================
  // SAVING ENTITIES
  // ============================================

  async saveExtractedEntities(
    message: Message,
    entities: ExtractionResult['entities'],
  ): Promise<void> {
    for (const entity of entities) {
      const dto: SaveChatContextDto = {
        conversation_id: message.conversation_id,
        source_message_id: message.id,
        entity_type: entity.entity_type,
        entity_value: entity.entity_value,
        confidence: entity.confidence,
        entity_metadata: entity.metadata,
        extraction_method: ExtractionMethod.AI,
      };

      await this.contextService.saveChatContext(message.user_id, dto);
    }
  }

  // ============================================
  // MANUAL EXTRACTION (for testing/admin)
  // ============================================

  async extractFromConversation(
    conversationId: string,
    userId: string,
  ): Promise<number> {
    const sql = `
      SELECT m.*
      FROM "messages" m
      WHERE m.conversation_id = $1 AND m.user_id = $2 AND m.role = 'user'
      ORDER BY m.created_at ASC
    `;

    const result = await this.db.query<Message>(sql, [conversationId, userId]);
    let extractedCount = 0;

    for (const message of result.rows) {
      const entities = await this.extractEntitiesFromMessage(message);

      if (entities.length > 0) {
        await this.saveExtractedEntities(message, entities);
        extractedCount += entities.length;
      }

      await this.markMessageProcessed(message.id);
    }

    return extractedCount;
  }

  // ============================================
  // EXPLICIT ENTITY SAVE (user confirms in UI)
  // ============================================

  async saveExplicitEntity(
    userId: string,
    conversationId: string,
    entityType: EntityType,
    entityValue: string,
    messageId?: string,
  ): Promise<void> {
    const dto: SaveChatContextDto = {
      conversation_id: conversationId,
      source_message_id: messageId,
      entity_type: entityType,
      entity_value: entityValue,
      confidence: 1.0, // Explicit is always 100%
      extraction_method: ExtractionMethod.EXPLICIT,
    };

    await this.contextService.saveChatContext(userId, dto);
  }

  // ============================================
  // ON-DEMAND TOOL PREFILL EXTRACTION
  // ============================================

  /**
   * Extract form prefill values for a tool using LLM
   * This is the proper way to extract user intent - using AI, not regex
   */
  async extractToolPrefill(
    dto: ExtractToolPrefillDto,
  ): Promise<ToolPrefillResponseDto> {
    if (!this.aiService.isConfigured()) {
      return {
        tool_id: dto.tool_id,
        prefill_values: [],
      };
    }

    // Build the extraction prompt based on tool and form fields
    const fieldsDescription = dto.form_fields?.length
      ? dto.form_fields
          .map((f) => `- ${f.name} (${f.type}): ${f.label || f.description || f.name}`)
          .join('\n')
      : 'No specific fields defined';

    const extractionPrompt = `You are a form prefill assistant. Analyze the user's query and extract values to prefill a form.

TOOL: ${dto.tool_id}
FORM FIELDS:
${fieldsDescription}

USER QUERY: "${dto.user_query}"
${dto.llm_response ? `\nLLM RESPONSE (for reference only - prefer user query): "${dto.llm_response.substring(0, 500)}..."` : ''}

INSTRUCTIONS:
1. Extract the user's INTENT or TOPIC from their query (what they want to create/do)
2. For each form field, determine if the user's query contains a value for it
3. ONLY extract values with HIGH confidence (>0.8) - do not guess
4. Prefer extracting from USER QUERY over LLM response
5. For topic/title/subject fields, extract the core intent (e.g., "create e-book" -> topic: "e-book creation")
6. Handle any language - the user might write in English, Spanish, Arabic, Chinese, etc.

Return a JSON object with:
{
  "extracted_topic": "The main topic/intent from user query (if applicable)",
  "extracted_intent": "What the user wants to do (verb phrase)",
  "prefill_values": [
    {
      "field": "field_name",
      "value": "extracted value",
      "confidence": 0.85,
      "source": "user_query" | "llm_response" | "context"
    }
  ]
}

If no values can be confidently extracted, return:
{"extracted_topic": null, "extracted_intent": null, "prefill_values": []}`;

    try {
      const response = await this.aiService.generateText(
        extractionPrompt,
        {
          responseFormat: 'json_object',
          temperature: 0.1, // Low temperature for consistent extraction
          maxTokens: 500,
        },
      );

      const result = JSON.parse(response);

      // Filter only high-confidence values
      const prefillValues: ToolPrefillValueDto[] = (result.prefill_values || [])
        .filter((v: ToolPrefillValueDto) => v.confidence >= 0.8)
        .map((v: ToolPrefillValueDto) => ({
          field: v.field,
          value: v.value,
          confidence: v.confidence,
          source: v.source || 'user_query',
        }));

      return {
        tool_id: dto.tool_id,
        prefill_values: prefillValues,
        extracted_topic: result.extracted_topic || undefined,
        extracted_intent: result.extracted_intent || undefined,
      };
    } catch (error) {
      this.logger.error(`Tool prefill extraction failed: ${error.message}`);
      return {
        tool_id: dto.tool_id,
        prefill_values: [],
      };
    }
  }

  /**
   * Get common tool field mappings for different tool types
   */
  getToolFieldMappings(toolId: string): { name: string; type: string; label: string }[] {
    // Common mappings for generator/writer tools
    const topicBasedFields = [
      { name: 'topic', type: 'text', label: 'Topic/Subject' },
      { name: 'title', type: 'text', label: 'Title' },
      { name: 'subject', type: 'text', label: 'Subject' },
    ];

    const toneFields = [
      { name: 'tone', type: 'select', label: 'Tone/Style' },
      { name: 'style', type: 'select', label: 'Writing Style' },
    ];

    const audienceFields = [
      { name: 'targetAudience', type: 'text', label: 'Target Audience' },
      { name: 'skillLevel', type: 'select', label: 'Skill Level' },
    ];

    // Tool-specific mappings
    const mappings: Record<string, typeof topicBasedFields> = {
      'how-to-guide': [...topicBasedFields, ...audienceFields],
      'blog-post-generator': [...topicBasedFields, ...toneFields],
      'essay-writer': [...topicBasedFields, ...toneFields],
      'story-generator': [...topicBasedFields, ...toneFields],
      'email-composer': [
        { name: 'subject', type: 'text', label: 'Email Subject' },
        { name: 'recipientType', type: 'select', label: 'Recipient Type' },
        ...toneFields,
      ],
      'cover-letter': [
        { name: 'jobTitle', type: 'text', label: 'Job Title' },
        { name: 'company', type: 'text', label: 'Company Name' },
      ],
    };

    return mappings[toolId] || topicBasedFields;
  }
}
