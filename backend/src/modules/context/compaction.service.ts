import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AiService } from '../ai/ai.service';
import { DatabaseService } from '../database/database.service';

interface CompactionResult {
  conversationId: string;
  messageCount: number;
  tokensOriginal: number;
  tokensSummary: number;
  savings: number;
}

interface ConversationMessage {
  id: string;
  role: string;
  content: string;
  created_at: Date;
}

@Injectable()
export class CompactionService {
  private readonly logger = new Logger(CompactionService.name);
  private isRunning = false;

  // Configuration
  private readonly COMPACTION_THRESHOLD = 20; // Messages since last summary
  private readonly KEEP_VERBATIM = 10; // Last N messages to keep verbatim
  private readonly MIN_MESSAGES_TO_SUMMARIZE = 10; // Minimum messages to warrant summarization

  constructor(
    private readonly db: DatabaseService,
    @Inject(forwardRef(() => AiService)) private readonly aiService: AiService,
  ) {}

  /**
   * Check if a conversation needs compaction
   */
  async shouldCompact(conversationId: string): Promise<boolean> {
    const result = await this.db.query(
      `SELECT
         c.message_count,
         c.last_summary_at,
         (SELECT COUNT(*) FROM messages m
          WHERE m.conversation_id = c.id
            AND m.is_summarized = FALSE
            AND m.is_current_version = TRUE
            AND (c.last_summary_at IS NULL OR m.created_at > c.last_summary_at)
         ) as unsummarized_count
       FROM conversations c
       WHERE c.id = $1`,
      [conversationId],
    );

    if (result.rows.length === 0) return false;

    const { unsummarized_count } = result.rows[0];
    return parseInt(unsummarized_count) >= this.COMPACTION_THRESHOLD;
  }

  /**
   * Compact a single conversation
   */
  async compactConversation(conversationId: string): Promise<CompactionResult | null> {
    const client = await this.db.getClient();

    try {
      await client.query('BEGIN');

      // Get conversation info
      const convResult = await client.query(
        'SELECT user_id, last_summary_at FROM conversations WHERE id = $1',
        [conversationId],
      );

      if (convResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      const { user_id, last_summary_at } = convResult.rows[0];

      // Get messages to summarize (older than last KEEP_VERBATIM)
      const messagesResult = await client.query<ConversationMessage>(
        `SELECT id, role, content, created_at
         FROM messages
         WHERE conversation_id = $1
           AND is_summarized = FALSE
           AND is_current_version = TRUE
           ${last_summary_at ? 'AND created_at > $2' : ''}
         ORDER BY created_at ASC`,
        last_summary_at ? [conversationId, last_summary_at] : [conversationId],
      );

      const allMessages = messagesResult.rows;

      // Need at least KEEP_VERBATIM + MIN_MESSAGES_TO_SUMMARIZE
      if (allMessages.length < this.KEEP_VERBATIM + this.MIN_MESSAGES_TO_SUMMARIZE) {
        await client.query('ROLLBACK');
        return null;
      }

      // Messages to summarize (all except last KEEP_VERBATIM)
      const messagesToSummarize = allMessages.slice(0, -this.KEEP_VERBATIM);
      const messageStartId = messagesToSummarize[0].id;
      const messageEndId = messagesToSummarize[messagesToSummarize.length - 1].id;

      // Calculate original token count (rough estimate)
      const originalText = messagesToSummarize
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n');
      const tokensOriginal = Math.ceil(originalText.length / 4);

      // Generate summary using AI
      const summary = await this.generateSummary(messagesToSummarize);

      if (!summary) {
        await client.query('ROLLBACK');
        this.logger.error(`Failed to generate summary for conversation ${conversationId}`);
        return null;
      }

      const tokensSummary = Math.ceil(summary.text.length / 4);

      // Save summary
      await client.query(
        `INSERT INTO conversation_summaries (
          conversation_id, user_id, summary, key_topics, key_decisions,
          user_facts, open_threads, message_start_id, message_end_id,
          message_count, token_count_original, token_count_summary
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          conversationId,
          user_id,
          summary.text,
          JSON.stringify(summary.keyTopics),
          JSON.stringify(summary.keyDecisions),
          JSON.stringify(summary.userFacts),
          JSON.stringify(summary.openThreads),
          messageStartId,
          messageEndId,
          messagesToSummarize.length,
          tokensOriginal,
          tokensSummary,
        ],
      );

      // Mark messages as summarized
      const messageIds = messagesToSummarize.map((m) => m.id);
      await client.query(
        `UPDATE messages SET is_summarized = TRUE WHERE id = ANY($1)`,
        [messageIds],
      );

      // Update conversation
      await client.query(
        `UPDATE conversations
         SET last_summary_at = NOW(), total_tokens_used = total_tokens_used + $1
         WHERE id = $2`,
        [tokensOriginal - tokensSummary, conversationId], // Net tokens saved
      );

      await client.query('COMMIT');

      const savings = Math.round(((tokensOriginal - tokensSummary) / tokensOriginal) * 100);

      this.logger.log(
        `Compacted conversation ${conversationId}: ${messagesToSummarize.length} messages, ${savings}% token reduction`,
      );

      return {
        conversationId,
        messageCount: messagesToSummarize.length,
        tokensOriginal,
        tokensSummary,
        savings,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error(`Compaction failed for ${conversationId}: ${error.message}`);
      return null;
    } finally {
      client.release();
    }
  }

  /**
   * Generate summary using AI
   */
  private async generateSummary(messages: ConversationMessage[]): Promise<{
    text: string;
    keyTopics: string[];
    keyDecisions: string[];
    userFacts: string[];
    openThreads: string[];
  } | null> {
    const conversationText = messages
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    const prompt = `Summarize the following conversation segment. Provide:
1. A concise summary (2-3 sentences)
2. Key topics discussed (as a list)
3. Any decisions or conclusions reached (as a list)
4. Any facts about the user that were mentioned (as a list)
5. Any unresolved questions or open threads (as a list)

Respond in JSON format:
{
  "summary": "...",
  "keyTopics": ["..."],
  "keyDecisions": ["..."],
  "userFacts": ["..."],
  "openThreads": ["..."]
}

Conversation:
${conversationText}`;

    try {
      const response = await this.aiService.generateText(prompt, {
        model: 'openai/gpt-4o-mini', // Use fast, cheap model for summaries
      });

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.logger.error('Failed to parse summary response as JSON');
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        text: parsed.summary || '',
        keyTopics: Array.isArray(parsed.keyTopics) ? parsed.keyTopics : [],
        keyDecisions: Array.isArray(parsed.keyDecisions) ? parsed.keyDecisions : [],
        userFacts: Array.isArray(parsed.userFacts) ? parsed.userFacts : [],
        openThreads: Array.isArray(parsed.openThreads) ? parsed.openThreads : [],
      };
    } catch (error) {
      this.logger.error(`Summary generation failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Background job: Compact conversations that need it
   * Runs every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async runCompactionJob(): Promise<void> {
    if (this.isRunning) {
      this.logger.debug('Compaction job already running, skipping');
      return;
    }

    this.isRunning = true;

    try {
      // Find conversations that need compaction
      const result = await this.db.query(`
        SELECT c.id
        FROM conversations c
        WHERE c.message_count >= $1
          AND (
            c.last_summary_at IS NULL
            OR (SELECT COUNT(*) FROM messages m
                WHERE m.conversation_id = c.id
                  AND m.is_summarized = FALSE
                  AND m.is_current_version = TRUE
                  AND m.created_at > c.last_summary_at
               ) >= $1
          )
        ORDER BY c.last_message_at DESC
        LIMIT 10
      `, [this.COMPACTION_THRESHOLD]);

      if (result.rows.length === 0) {
        this.logger.debug('No conversations need compaction');
        return;
      }

      this.logger.log(`Found ${result.rows.length} conversations to compact`);

      for (const row of result.rows) {
        await this.compactConversation(row.id);
        // Small delay between compactions to avoid overloading
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      this.logger.error(`Compaction job failed: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get compaction stats for a user
   */
  async getCompactionStats(userId: string): Promise<{
    totalConversations: number;
    compactedConversations: number;
    totalSummaries: number;
    tokensOriginal: number;
    tokensSummary: number;
    totalSavings: number;
  }> {
    const result = await this.db.query(
      `SELECT
         (SELECT COUNT(*) FROM conversations WHERE user_id = $1) as total_conversations,
         (SELECT COUNT(DISTINCT conversation_id) FROM conversation_summaries WHERE user_id = $1) as compacted_conversations,
         COUNT(*) as total_summaries,
         COALESCE(SUM(token_count_original), 0) as tokens_original,
         COALESCE(SUM(token_count_summary), 0) as tokens_summary
       FROM conversation_summaries
       WHERE user_id = $1`,
      [userId],
    );

    const row = result.rows[0];
    const tokensOriginal = parseInt(row.tokens_original) || 0;
    const tokensSummary = parseInt(row.tokens_summary) || 0;

    return {
      totalConversations: parseInt(row.total_conversations) || 0,
      compactedConversations: parseInt(row.compacted_conversations) || 0,
      totalSummaries: parseInt(row.total_summaries) || 0,
      tokensOriginal,
      tokensSummary,
      totalSavings: tokensOriginal - tokensSummary,
    };
  }

  /**
   * Manually trigger compaction for a conversation
   */
  async triggerCompaction(conversationId: string): Promise<CompactionResult | null> {
    return this.compactConversation(conversationId);
  }

  /**
   * Get summaries for a conversation
   */
  async getConversationSummaries(conversationId: string): Promise<any[]> {
    const result = await this.db.query(
      `SELECT * FROM conversation_summaries
       WHERE conversation_id = $1
       ORDER BY created_at DESC`,
      [conversationId],
    );
    return result.rows;
  }
}
