import { Injectable, Logger, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import {
  CreateMemoryDto,
  UpdateMemoryDto,
  MemoryQueryDto,
  MemoryResponse,
  MemoriesListResponse,
  MemoryCategory,
  MemorySource,
  UpdateCustomInstructionsDto,
  CustomInstructionsResponse,
} from './dto';
import { DatabaseService } from '../database/database.service';
import { AiMemoryExtractorService, ExtractedMemory } from './ai-memory-extractor.service';

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);

  constructor(
    private readonly db: DatabaseService,
    @Inject(forwardRef(() => AiMemoryExtractorService))
    private readonly aiExtractor: AiMemoryExtractorService,
  ) {}

  /**
   * Create a new memory
   */
  async createMemory(
    userId: string,
    dto: CreateMemoryDto,
  ): Promise<MemoryResponse> {
    const query = `
      INSERT INTO user_memories (
        user_id, content, category, source,
        source_conversation_id, source_message_id, confidence
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      userId,
      dto.content,
      dto.category || MemoryCategory.CONTEXT,
      dto.source || MemorySource.MANUAL,
      dto.sourceConversationId || null,
      dto.sourceMessageId || null,
      dto.confidence || 1.0,
    ]);

    return this.mapToResponse(result.rows[0]);
  }

  /**
   * Get all memories for a user
   */
  async getMemories(
    userId: string,
    query: MemoryQueryDto,
  ): Promise<MemoriesListResponse> {
    let sql = `
      SELECT * FROM user_memories
      WHERE user_id = $1
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (query.isActive !== undefined) {
      sql += ` AND is_active = $${paramIndex++}`;
      params.push(query.isActive);
    }

    if (query.category) {
      sql += ` AND category = $${paramIndex++}`;
      params.push(query.category);
    }

    if (query.search) {
      sql += ` AND content ILIKE $${paramIndex++}`;
      params.push(`%${query.search}%`);
    }

    // Get total count
    const countResult = await this.db.query(
      sql.replace('SELECT *', 'SELECT COUNT(*)'),
      params,
    );
    const total = parseInt(countResult.rows[0].count);

    // Add ordering and pagination
    sql += ` ORDER BY last_used_at DESC NULLS LAST, created_at DESC`;
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(query.limit || 50, query.offset || 0);

    const result = await this.db.query(sql, params);

    return {
      data: result.rows.map(this.mapToResponse),
      total,
      limit: query.limit || 50,
      offset: query.offset || 0,
    };
  }

  /**
   * Get a single memory by ID
   */
  async getMemory(userId: string, memoryId: string): Promise<MemoryResponse> {
    const result = await this.db.query(
      'SELECT * FROM user_memories WHERE id = $1 AND user_id = $2',
      [memoryId, userId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Memory not found');
    }

    return this.mapToResponse(result.rows[0]);
  }

  /**
   * Update a memory
   */
  async updateMemory(
    userId: string,
    memoryId: string,
    dto: UpdateMemoryDto,
  ): Promise<MemoryResponse> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (dto.content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      params.push(dto.content);
    }

    if (dto.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      params.push(dto.category);
    }

    if (dto.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      params.push(dto.isActive);
    }

    if (updates.length === 0) {
      return this.getMemory(userId, memoryId);
    }

    params.push(memoryId, userId);
    const query = `
      UPDATE user_memories
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
      RETURNING *
    `;

    const result = await this.db.query(query, params);

    if (result.rows.length === 0) {
      throw new NotFoundException('Memory not found');
    }

    return this.mapToResponse(result.rows[0]);
  }

  /**
   * Delete a memory
   */
  async deleteMemory(userId: string, memoryId: string): Promise<void> {
    const result = await this.db.query(
      'DELETE FROM user_memories WHERE id = $1 AND user_id = $2',
      [memoryId, userId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Memory not found');
    }
  }

  /**
   * Bulk delete memories
   */
  async deleteAllMemories(userId: string): Promise<number> {
    const result = await this.db.query(
      'DELETE FROM user_memories WHERE user_id = $1',
      [userId],
    );
    return result.rowCount || 0;
  }

  /**
   * Get relevant memories for a context (for use in chat)
   * ALWAYS includes all instruction-type memories + keyword-matched others
   */
  async getRelevantMemories(
    userId: string,
    contextMessage: string,
    limit: number = 10,
  ): Promise<MemoryResponse[]> {
    this.logger.log(`Getting relevant memories for: "${contextMessage.substring(0, 50)}..."`);

    // ALWAYS get ALL instruction memories - these are user's explicit rules
    const instructionsResult = await this.db.query(
      `SELECT * FROM user_memories
       WHERE user_id = $1 AND is_active = true AND category = 'instruction'
       ORDER BY created_at DESC`,
      [userId],
    );
    const instructions = instructionsResult.rows;
    this.logger.log(`Found ${instructions.length} instruction memories`);

    // Extract keywords from the message
    const keywords = contextMessage
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 10);

    let keywordMatched: any[] = [];

    if (keywords.length > 0) {
      // Search for non-instruction memories containing any of the keywords
      const searchPattern = keywords.join('|');
      this.logger.log(`Searching with pattern: ${searchPattern}`);

      const result = await this.db.query(
        `SELECT *,
          (CASE WHEN category = 'preference' THEN 2
                WHEN category = 'fact' THEN 1
                ELSE 0 END) as priority
         FROM user_memories
         WHERE user_id = $1
           AND is_active = true
           AND category != 'instruction'
           AND content ~* $2
         ORDER BY priority DESC, use_count DESC, last_used_at DESC NULLS LAST
         LIMIT $3`,
        [userId, searchPattern, limit],
      );
      keywordMatched = result.rows;
      this.logger.log(`Found ${keywordMatched.length} keyword-matched memories`);
    } else {
      // No keywords - get most recently used non-instruction memories
      const result = await this.db.query(
        `SELECT * FROM user_memories
         WHERE user_id = $1 AND is_active = true AND category != 'instruction'
         ORDER BY last_used_at DESC NULLS LAST, use_count DESC
         LIMIT $2`,
        [userId, limit],
      );
      keywordMatched = result.rows;
    }

    // Combine: ALL instructions first, then keyword-matched others
    const allMemories = [...instructions, ...keywordMatched];

    // Deduplicate by ID
    const uniqueMemories = Array.from(
      new Map(allMemories.map(m => [m.id, m])).values()
    ).slice(0, limit);

    this.logger.log(`Returning ${uniqueMemories.length} total memories (${instructions.length} instructions)`);

    // Update use_count and last_used_at for retrieved memories
    if (uniqueMemories.length > 0) {
      const memoryIds = uniqueMemories.map((r) => r.id);
      await this.db.query(
        `UPDATE user_memories
         SET use_count = use_count + 1, last_used_at = NOW()
         WHERE id = ANY($1)`,
        [memoryIds],
      );
    }

    return uniqueMemories.map(this.mapToResponse);
  }

  /**
   * Extract memories from user message using AI
   * Works with any language and extracts rich contextual information
   */
  async extractMemoriesFromMessage(
    userId: string,
    message: string,
    conversationId: string,
    messageId?: string,
  ): Promise<MemoryResponse[]> {
    this.logger.log(`🧠 [AI] Extracting memories from message: "${message.substring(0, 100)}..."`);

    try {
      // Use AI-powered extraction
      const aiMemories = await this.aiExtractor.extractMemories(message);

      if (aiMemories.length === 0) {
        this.logger.log('🧠 [AI] No memories extracted from message');
        return [];
      }

      this.logger.log(`🧠 [AI] Extracted ${aiMemories.length} memories`);

      // Create memories from AI extraction
      const createdMemories: MemoryResponse[] = [];

      for (const mem of aiMemories) {
        try {
          // Check for similar existing memories (fuzzy match)
          const existing = await this.findSimilarMemory(userId, mem.content);

          if (!existing) {
            const dto: CreateMemoryDto = {
              content: mem.content,
              category: mem.category,
              source: MemorySource.AUTO,
              sourceConversationId: conversationId,
              sourceMessageId: messageId,
              confidence: mem.confidence,
            };

            const created = await this.createMemory(userId, dto);
            createdMemories.push(created);
            this.logger.log(`🧠 [AI] Saved memory: [${mem.category}] ${mem.content}`);
          } else {
            this.logger.log(`🧠 [AI] Similar memory exists, skipping: ${mem.content}`);
            // Update use count of existing memory
            await this.db.query(
              `UPDATE user_memories SET use_count = use_count + 1, last_used_at = NOW() WHERE id = $1`,
              [existing.id],
            );
          }
        } catch (error) {
          this.logger.error(`🧠 [AI] Failed to save memory: ${error.message}`);
        }
      }

      this.logger.log(`🧠 [AI] Created ${createdMemories.length} new memories`);
      return createdMemories;

    } catch (error) {
      this.logger.error(`🧠 [AI] Memory extraction failed: ${error.message}`);
      // Fall back to regex extraction if AI fails
      return this.extractMemoriesWithRegex(userId, message, conversationId, messageId);
    }
  }

  /**
   * Find similar existing memory using fuzzy matching
   */
  private async findSimilarMemory(
    userId: string,
    content: string,
  ): Promise<{ id: string } | null> {
    // Extract key terms for matching (remove common words)
    const keyTerms = content
      .toLowerCase()
      .replace(/^user\s+/i, '')
      .split(/\s+/)
      .filter(w => w.length > 3)
      .slice(0, 5);

    if (keyTerms.length === 0) {
      return null;
    }

    // Check for memories with similar key terms
    const searchPattern = keyTerms.join('|');
    const result = await this.db.query(
      `SELECT id, content FROM user_memories
       WHERE user_id = $1
       AND is_active = true
       AND content ~* $2
       LIMIT 1`,
      [userId, searchPattern],
    );

    if (result.rows.length > 0) {
      // Check if it's actually similar (not just shares a word)
      const existingContent = result.rows[0].content.toLowerCase();
      const newContent = content.toLowerCase();

      // Count matching key terms
      const matchingTerms = keyTerms.filter(term => existingContent.includes(term));
      if (matchingTerms.length >= Math.min(2, keyTerms.length)) {
        return result.rows[0];
      }
    }

    return null;
  }

  /**
   * Fallback regex-based extraction (for when AI is unavailable)
   */
  private async extractMemoriesWithRegex(
    userId: string,
    message: string,
    conversationId: string,
    messageId?: string,
  ): Promise<MemoryResponse[]> {
    this.logger.log('🔄 Falling back to regex extraction');

    const extractedMemories: CreateMemoryDto[] = [];

    // Basic patterns for English
    const patterns = [
      { regex: /(?:I|i) (?:am |'m )?(?:living|live|based|from) (?:in|at) ([^.!?,]+)/gi, category: MemoryCategory.FACT },
      { regex: /(?:I|i) (?:am |'m )?(?:working|work) (?:as|at|for) ([^.!?,]+)/gi, category: MemoryCategory.FACT },
      { regex: /(?:I|i) (?:am |'m )(?:a|an) ([^.!?,]+)/gi, category: MemoryCategory.FACT },
      { regex: /(?:I|i) (?:prefer|like|love|enjoy) ([^.!?,]+)/gi, category: MemoryCategory.PREFERENCE },
      { regex: /(?:my|My) name (?:is) ([^.!?,]+)/gi, category: MemoryCategory.FACT },
    ];

    for (const { regex, category } of patterns) {
      let match;
      regex.lastIndex = 0;
      while ((match = regex.exec(message)) !== null) {
        extractedMemories.push({
          content: `User ${match[0].toLowerCase().trim()}`,
          category,
          source: MemorySource.AUTO,
          sourceConversationId: conversationId,
          sourceMessageId: messageId,
          confidence: 0.7,
        });
      }
    }

    // Save memories
    const createdMemories: MemoryResponse[] = [];
    for (const dto of extractedMemories) {
      try {
        const existing = await this.db.query(
          `SELECT id FROM user_memories WHERE user_id = $1 AND content ILIKE $2 AND is_active = true`,
          [userId, dto.content],
        );

        if (existing.rows.length === 0) {
          const created = await this.createMemory(userId, dto);
          createdMemories.push(created);
        }
      } catch (error) {
        this.logger.error(`Regex extraction save failed: ${error.message}`);
      }
    }

    return createdMemories;
  }

  // ============================================
  // Custom Instructions Methods
  // ============================================

  /**
   * Get user's custom instructions
   */
  async getCustomInstructions(
    userId: string,
  ): Promise<CustomInstructionsResponse> {
    const result = await this.db.query(
      'SELECT * FROM user_system_instructions WHERE user_id = $1',
      [userId],
    );

    if (result.rows.length === 0) {
      return {
        customInstructions: undefined,
        aboutUser: undefined,
        responsePreferences: undefined,
        enableMemories: true,
        enablePersonalization: true,
        enableAutoMemoryExtraction: true,
      };
    }

    const row = result.rows[0];
    return {
      customInstructions: row.custom_instructions,
      aboutUser: row.about_user,
      responsePreferences: row.response_preferences,
      enableMemories: row.enable_memories,
      enablePersonalization: row.enable_personalization,
      enableAutoMemoryExtraction: row.enable_auto_memory_extraction,
    };
  }

  /**
   * Update user's custom instructions
   */
  async updateCustomInstructions(
    userId: string,
    dto: UpdateCustomInstructionsDto,
  ): Promise<CustomInstructionsResponse> {
    // Use upsert
    const query = `
      INSERT INTO user_system_instructions (
        user_id, custom_instructions, about_user, response_preferences,
        enable_memories, enable_personalization, enable_auto_memory_extraction
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id) DO UPDATE SET
        custom_instructions = COALESCE($2, user_system_instructions.custom_instructions),
        about_user = COALESCE($3, user_system_instructions.about_user),
        response_preferences = COALESCE($4, user_system_instructions.response_preferences),
        enable_memories = COALESCE($5, user_system_instructions.enable_memories),
        enable_personalization = COALESCE($6, user_system_instructions.enable_personalization),
        enable_auto_memory_extraction = COALESCE($7, user_system_instructions.enable_auto_memory_extraction),
        updated_at = NOW()
      RETURNING *
    `;

    const result = await this.db.query(query, [
      userId,
      dto.customInstructions,
      dto.aboutUser,
      dto.responsePreferences,
      dto.enableMemories,
      dto.enablePersonalization,
      dto.enableAutoMemoryExtraction,
    ]);

    const row = result.rows[0];
    return {
      customInstructions: row.custom_instructions,
      aboutUser: row.about_user,
      responsePreferences: row.response_preferences,
      enableMemories: row.enable_memories,
      enablePersonalization: row.enable_personalization,
      enableAutoMemoryExtraction: row.enable_auto_memory_extraction,
    };
  }

  /**
   * Get memory statistics for a user
   */
  async getMemoryStats(userId: string): Promise<{
    total: number;
    active: number;
    byCategory: Record<string, number>;
    autoExtracted: number;
    manual: number;
  }> {
    const statsQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true) as active,
        COUNT(*) FILTER (WHERE source = 'auto') as auto_extracted,
        COUNT(*) FILTER (WHERE source = 'manual') as manual,
        category,
        COUNT(*) as category_count
      FROM user_memories
      WHERE user_id = $1
      GROUP BY GROUPING SETS ((category), ())
    `;

    const result = await this.db.query(statsQuery, [userId]);

    const byCategory: Record<string, number> = {};
    let total = 0;
    let active = 0;
    let autoExtracted = 0;
    let manual = 0;

    for (const row of result.rows) {
      if (row.category) {
        byCategory[row.category] = parseInt(row.category_count);
      } else {
        total = parseInt(row.total);
        active = parseInt(row.active);
        autoExtracted = parseInt(row.auto_extracted);
        manual = parseInt(row.manual);
      }
    }

    return { total, active, byCategory, autoExtracted, manual };
  }

  /**
   * Map database row to response object
   */
  private mapToResponse(row: any): MemoryResponse {
    return {
      id: row.id,
      content: row.content,
      category: row.category,
      source: row.source,
      sourceConversationId: row.source_conversation_id,
      sourceMessageId: row.source_message_id,
      confidence: parseFloat(row.confidence),
      useCount: row.use_count,
      lastUsedAt: row.last_used_at,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
