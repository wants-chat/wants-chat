import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import OpenAI from 'openai';

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used?: number;
  model?: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export interface Conversation {
  id: string;
  user_id: string;
  title?: string;
  model: string;
  is_archived: boolean;
  is_pinned: boolean;
  metadata?: Record<string, any>;
  last_message_at?: Date;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private openai: OpenAI;
  private readonly defaultModel: string;

  constructor(
    private db: DatabaseService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not set - chat will not work');
    } else {
      this.openai = new OpenAI({ apiKey });
    }
    this.defaultModel = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini');
  }

  // ============================================
  // Conversations
  // ============================================

  async getConversations(
    userId: string,
    options: { archived?: boolean; limit?: number; offset?: number } = {},
  ): Promise<Conversation[]> {
    const { archived = false, limit = 50, offset = 0 } = options;

    const conversations = await this.db.findMany<Conversation>(
      'conversations',
      { user_id: userId, is_archived: archived },
      { orderBy: 'last_message_at', order: 'DESC', limit, offset },
    );

    // Ensure is_pinned and is_archived have boolean values (not NULL)
    const normalizedConversations = conversations.map(conv => ({
      ...conv,
      is_pinned: conv.is_pinned ?? false,
      is_archived: conv.is_archived ?? false,
    }));

    // Debug: Log first few conversations with their titles
    this.logger.log(`📋 Returning ${normalizedConversations.length} conversations. First 3:`,
      normalizedConversations.slice(0, 3).map(c => ({
        id: c.id?.slice(0, 8),
        title: c.title,
        is_pinned: c.is_pinned,
      }))
    );

    return normalizedConversations;
  }

  async getConversation(
    conversationId: string,
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.db.findOne<Conversation>('conversations', {
      id: conversationId,
      user_id: userId,
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async createConversation(
    userId: string,
    data: { title?: string; model?: string } = {},
  ): Promise<Conversation> {
    const conversation = await this.db.insert<Conversation>('conversations', {
      user_id: userId,
      title: data.title,
      model: data.model || this.defaultModel,
      is_archived: false,
      is_pinned: false,
      metadata: {},
      created_at: new Date(),
      updated_at: new Date(),
    });

    return conversation;
  }

  async updateConversation(
    conversationId: string,
    userId: string,
    data: Partial<Conversation>,
  ): Promise<Conversation> {
    // Verify ownership
    await this.getConversation(conversationId, userId);

    this.logger.log(`Updating conversation ${conversationId} with data:`, JSON.stringify(data));

    const updateData = { ...data, updated_at: new Date() };
    this.logger.log(`Update payload:`, JSON.stringify(updateData));

    const result = await this.db.update<Conversation>(
      'conversations',
      { id: conversationId, user_id: userId },
      updateData,
    );

    this.logger.log(`Update result (${result?.length || 0} rows):`, JSON.stringify(result));

    const updated = result?.[0];
    if (!updated) {
      this.logger.warn(`No rows updated for conversation ${conversationId}`);
    }

    return updated;
  }

  async deleteConversation(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    // Verify ownership
    await this.getConversation(conversationId, userId);

    // Delete messages first (cascade should handle this, but explicit for safety)
    await this.db.delete('messages', { conversation_id: conversationId });

    // Delete conversation
    await this.db.delete('conversations', { id: conversationId, user_id: userId });
  }

  // ============================================
  // Messages
  // ============================================

  async getMessages(
    conversationId: string,
    userId: string,
    options: { limit?: number; offset?: number } = {},
  ): Promise<Message[]> {
    // Verify ownership
    await this.getConversation(conversationId, userId);

    const { limit = 100, offset = 0 } = options;

    return this.db.findMany<Message>(
      'messages',
      { conversation_id: conversationId },
      { orderBy: 'created_at', order: 'ASC', limit, offset },
    );
  }

  async sendMessage(
    conversationId: string,
    userId: string,
    content: string,
    model?: string,
    fileContext?: string,
  ): Promise<{ userMessage: Message; assistantMessage: Message }> {
    if (!this.openai) {
      throw new BadRequestException('OpenAI is not configured');
    }

    // Verify conversation ownership
    const conversation = await this.getConversation(conversationId, userId);
    const chatModel = model || conversation.model || this.defaultModel;

    // Get conversation history
    const history = await this.getMessages(conversationId, userId, { limit: 50 });

    // Build the full user content including any file context
    const fullContent = fileContext ? `${fileContext}\n\nUser message: ${content}` : content;

    // Save user message
    const userMessage = await this.db.insert<Message>('messages', {
      conversation_id: conversationId,
      user_id: userId,
      role: 'user',
      content,
      model: chatModel,
      metadata: fileContext ? { hasFileContext: true } : {},
      created_at: new Date(),
    });

    try {
      // Prepare messages for OpenAI
      const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: 'You are a helpful, friendly AI assistant. Be concise but thorough in your responses.',
        },
        ...history.map((m) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        })),
        { role: 'user', content: fullContent },
      ];

      // Call OpenAI
      const completion = await this.openai.chat.completions.create({
        model: chatModel,
        messages: openaiMessages,
        max_tokens: this.configService.get<number>('OPENAI_MAX_TOKENS', 4096),
      });

      const assistantContent = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      const tokensUsed = completion.usage?.total_tokens;

      // Save assistant message
      const assistantMessage = await this.db.insert<Message>('messages', {
        conversation_id: conversationId,
        user_id: userId,
        role: 'assistant',
        content: assistantContent,
        tokens_used: tokensUsed,
        model: chatModel,
        metadata: {
          finish_reason: completion.choices[0]?.finish_reason,
          prompt_tokens: completion.usage?.prompt_tokens,
          completion_tokens: completion.usage?.completion_tokens,
        },
        created_at: new Date(),
      });

      // Update conversation
      const title = conversation.title || (await this.generateTitle(content));
      await this.updateConversation(conversationId, userId, {
        title,
        last_message_at: new Date(),
      });

      return { userMessage, assistantMessage };
    } catch (error) {
      this.logger.error('OpenAI API error:', error);
      throw new BadRequestException('Failed to get AI response: ' + error.message);
    }
  }

  async sendMessageStream(
    conversationId: string,
    userId: string,
    content: string,
    model?: string,
  ): Promise<AsyncIterable<string>> {
    if (!this.openai) {
      throw new BadRequestException('OpenAI is not configured');
    }

    // Verify conversation ownership
    const conversation = await this.getConversation(conversationId, userId);
    const chatModel = model || conversation.model || this.defaultModel;

    // Get conversation history
    const history = await this.getMessages(conversationId, userId, { limit: 50 });

    // Save user message
    await this.db.insert<Message>('messages', {
      conversation_id: conversationId,
      user_id: userId,
      role: 'user',
      content,
      model: chatModel,
      metadata: {},
      created_at: new Date(),
    });

    // Prepare messages for OpenAI
    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: 'You are a helpful, friendly AI assistant. Be concise but thorough in your responses.',
      },
      ...history.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
      { role: 'user', content },
    ];

    const stream = await this.openai.chat.completions.create({
      model: chatModel,
      messages: openaiMessages,
      max_tokens: this.configService.get<number>('OPENAI_MAX_TOKENS', 4096),
      stream: true,
    });

    return this.createStreamGenerator(stream, conversationId, userId, chatModel, conversation.title, content);
  }

  private async *createStreamGenerator(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
    conversationId: string,
    userId: string,
    model: string,
    existingTitle: string | undefined,
    userContent: string,
  ): AsyncGenerator<string> {
    let fullContent = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullContent += content;
      yield content;
    }

    // Save the complete assistant message after streaming
    await this.db.insert<Message>('messages', {
      conversation_id: conversationId,
      user_id: userId,
      role: 'assistant',
      content: fullContent,
      model,
      metadata: {},
      created_at: new Date(),
    });

    // Update conversation
    const title = existingTitle || (await this.generateTitle(userContent));
    await this.db.update(
      'conversations',
      { id: conversationId },
      { title, last_message_at: new Date(), updated_at: new Date() },
    );
  }

  private async generateTitle(content: string): Promise<string> {
    this.logger.log(`🏷️ [generateTitle] Input: "${content.substring(0, 50)}..."`);
    this.logger.log(`🏷️ [generateTitle] OpenAI configured: ${!!this.openai}`);

    // Try to generate a smart title using AI
    try {
      if (this.openai) {
        this.logger.log(`🏷️ [generateTitle] Calling OpenAI...`);
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Generate a concise, descriptive title (3-6 words) for this conversation based on the user\'s first message. Just respond with the title, nothing else. No quotes or punctuation at the end.',
            },
            {
              role: 'user',
              content: content.substring(0, 500), // Limit input length
            },
          ],
          max_tokens: 30,
          temperature: 0.7,
        });
        const title = completion.choices[0]?.message?.content?.trim();
        this.logger.log(`🏷️ [generateTitle] OpenAI returned: "${title}"`);
        if (title && title.length > 0 && title.length < 60) {
          return title;
        }
      } else {
        this.logger.warn(`🏷️ [generateTitle] OpenAI not configured!`);
      }
    } catch (error) {
      this.logger.warn('🏷️ [generateTitle] AI title generation failed:', error.message);
    }

    // Fallback: Generate a simple title from the first message
    const words = content.split(' ').slice(0, 5).join(' ');
    const fallbackTitle = words.length > 50 ? words.substring(0, 47) + '...' : words;
    this.logger.log(`🏷️ [generateTitle] Using fallback title: "${fallbackTitle}"`);
    return fallbackTitle;
  }

  /**
   * Generate and set title for a conversation
   */
  async generateAndSetTitle(
    conversationId: string,
    userId: string,
    firstMessage: string,
  ): Promise<void> {
    this.logger.log(`🏷️ [generateAndSetTitle] Starting for conversation ${conversationId}`);
    const title = await this.generateTitle(firstMessage);
    this.logger.log(`🏷️ [generateAndSetTitle] Generated title: "${title}"`);
    const result = await this.updateConversation(conversationId, userId, { title });
    this.logger.log(`🏷️ [generateAndSetTitle] Update result title: "${result?.title}"`);
  }

  // ============================================
  // Backfill Titles for Existing Conversations
  // ============================================

  /**
   * Generate titles for all conversations that don't have one
   * This is a one-time backfill operation
   */
  async backfillMissingTitles(userId?: string): Promise<{ processed: number; success: number; failed: number }> {
    this.logger.log('🏷️ [BACKFILL] Starting title backfill...');

    // Get conversations without titles
    let query = `
      SELECT c.id, c.user_id, c.title,
        (SELECT content FROM messages WHERE conversation_id = c.id AND role = 'user' ORDER BY created_at ASC LIMIT 1) as first_message
      FROM conversations c
      WHERE (c.title IS NULL OR c.title = '' OR c.title = 'New Chat')
    `;
    const params: any[] = [];

    if (userId) {
      query += ` AND c.user_id = $1`;
      params.push(userId);
    }

    query += ` LIMIT 50`; // Process in batches of 50

    const result = await this.db.query(query, params);
    const conversations = result.rows;

    this.logger.log(`🏷️ [BACKFILL] Found ${conversations.length} conversations without titles`);

    let success = 0;
    let failed = 0;

    for (const conv of conversations) {
      if (!conv.first_message) {
        this.logger.warn(`🏷️ [BACKFILL] Skipping ${conv.id} - no messages found`);
        failed++;
        continue;
      }

      try {
        const title = await this.generateTitle(conv.first_message);
        await this.db.update('conversations', { id: conv.id }, { title, updated_at: new Date() });
        this.logger.log(`🏷️ [BACKFILL] Generated title for ${conv.id}: "${title}"`);
        success++;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        this.logger.error(`🏷️ [BACKFILL] Failed to generate title for ${conv.id}: ${error.message}`);
        failed++;
      }
    }

    this.logger.log(`🏷️ [BACKFILL] Completed: ${success} success, ${failed} failed out of ${conversations.length}`);

    return { processed: conversations.length, success, failed };
  }

  // ============================================
  // Socket Message Persistence
  // ============================================

  async persistSocketMessage(
    conversationId: string,
    userId: string,
    role: 'user' | 'assistant',
    content: string,
    metadata?: Record<string, any>,
  ): Promise<Message> {
    const message = await this.db.insert<Message>('messages', {
      conversation_id: conversationId,
      user_id: userId,
      role,
      content,
      metadata: metadata || {},
      created_at: new Date(),
    });

    // Update conversation last message time
    await this.db.update(
      'conversations',
      { id: conversationId },
      { last_message_at: new Date(), updated_at: new Date() },
    );

    return message;
  }

  // ============================================
  // Quick Actions
  // ============================================

  async quickChat(
    userId: string,
    content: string,
    model?: string,
  ): Promise<{ conversation: Conversation; userMessage: Message; assistantMessage: Message }> {
    // Create a new conversation
    const conversation = await this.createConversation(userId, { model });

    // Send the message
    const { userMessage, assistantMessage } = await this.sendMessage(
      conversation.id,
      userId,
      content,
      model,
    );

    return { conversation, userMessage, assistantMessage };
  }
}
