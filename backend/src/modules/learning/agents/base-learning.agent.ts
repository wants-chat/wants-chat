import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../../ai/ai.service';
import { MemoryService } from '../../memory/memory.service';

export interface UserContext {
  userId: string;
  memories: Array<{
    id: string;
    content: string;
    category: string;
    createdAt: Date;
  }>;
  preferences?: Record<string, any>;
}

export interface LearningToolSuggestion {
  toolId: string;
  title: string;
  description: string;
  category: string;
  type: string;
  icon: string;
}

@Injectable()
export abstract class BaseLearningAgent {
  protected readonly logger: Logger;

  constructor(
    protected readonly aiService: AiService,
    protected readonly memoryService: MemoryService,
    protected readonly configService: ConfigService,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Main processing method - to be implemented by each agent
   */
  abstract process(input: any, context: UserContext): Promise<any>;

  /**
   * Get user context including memories and preferences
   */
  protected async getUserContext(userId: string): Promise<UserContext> {
    try {
      // Get learning-related memories
      const memoriesResult = await this.memoryService.getMemories(userId, {
        category: 'context' as any, // Use 'context' category for learning
        limit: 20,
      });

      // Get user preferences if available
      const preferences = await this.getUserPreferences(userId);

      return {
        userId,
        memories: memoriesResult?.data?.map(m => ({
          id: m.id,
          content: m.content,
          category: m.category,
          createdAt: m.createdAt,
        })) || [],
        preferences,
      };
    } catch (error) {
      this.logger.warn(`Failed to get user context: ${error.message}`);
      return {
        userId,
        memories: [],
        preferences: {},
      };
    }
  }

  /**
   * Get user preferences from memory
   */
  protected async getUserPreferences(userId: string): Promise<Record<string, any>> {
    try {
      const prefResult = await this.memoryService.getMemories(userId, {
        category: 'preference' as any,
        limit: 10,
      });

      // Extract preferences from memories
      const preferences: Record<string, any> = {};
      for (const memory of prefResult?.data || []) {
        // Parse preference content
        if (memory.content.includes('learning_style:')) {
          preferences.learningStyle = memory.content.split('learning_style:')[1]?.trim();
        }
        if (memory.content.includes('difficulty_preference:')) {
          preferences.difficultyPreference = memory.content.split('difficulty_preference:')[1]?.trim();
        }
      }

      return preferences;
    } catch {
      return {};
    }
  }

  /**
   * Store learning progress in memory
   */
  protected async storeProgress(
    userId: string,
    topic: string,
    details: Record<string, any>,
  ): Promise<void> {
    try {
      await this.memoryService.createMemory(userId, {
        category: 'context' as any, // Use 'context' for learning progress
        content: `Studied: ${topic}. ${JSON.stringify(details)}`,
        source: 'auto' as any,
        confidence: 0.9,
      });
    } catch (error) {
      this.logger.warn(`Failed to store learning progress: ${error.message}`);
    }
  }

  /**
   * Generate AI response with error handling
   */
  protected async generateResponse(
    systemPrompt: string,
    userMessage: string,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      responseFormat?: 'text' | 'json_object';
    } = {},
  ): Promise<string> {
    const {
      model = 'gpt-4o-mini',
      temperature = 0.7,
      maxTokens = 4000,
      responseFormat = 'text',
    } = options;

    try {
      const response = await this.aiService.chat(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        {
          model,
          temperature,
          maxTokens,
          responseFormat,
        },
      );

      return response;
    } catch (error) {
      this.logger.error(`AI generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Parse JSON response safely
   */
  protected parseJsonResponse<T>(response: string, defaultValue: T): T {
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : response;
      return JSON.parse(jsonStr.trim());
    } catch {
      this.logger.warn('Failed to parse JSON response, using default');
      return defaultValue;
    }
  }

  /**
   * Get default tool suggestions based on context
   */
  protected getToolSuggestions(context: string): LearningToolSuggestion[] {
    const suggestions: LearningToolSuggestion[] = [];

    // Add relevant tools based on context keywords
    if (context.includes('quiz') || context.includes('test') || context.includes('practice')) {
      suggestions.push({
        toolId: 'quiz-generator',
        title: 'Practice Quiz',
        description: 'Generate more practice questions',
        category: 'learning',
        type: 'generator',
        icon: 'HelpCircle',
      });
    }

    if (context.includes('schedule') || context.includes('plan') || context.includes('time')) {
      suggestions.push({
        toolId: 'schedule-builder',
        title: 'Schedule Builder',
        description: 'Create a detailed schedule',
        category: 'productivity',
        type: 'tool',
        icon: 'Calendar',
      });
    }

    if (context.includes('document') || context.includes('pdf') || context.includes('export')) {
      suggestions.push({
        toolId: 'document-export',
        title: 'Export to PDF',
        description: 'Save as PDF document',
        category: 'document',
        type: 'export',
        icon: 'FileDown',
      });
    }

    if (context.includes('email') || context.includes('write') || context.includes('draft')) {
      suggestions.push({
        toolId: 'email-composer',
        title: 'Email Composer',
        description: 'Compose professional emails',
        category: 'writing',
        type: 'tool',
        icon: 'Mail',
      });
    }

    return suggestions;
  }

  /**
   * Estimate token count for content
   */
  protected estimateTokens(content: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(content.length / 4);
  }

  /**
   * Chunk content by paragraphs for processing large documents
   */
  protected chunkByParagraphs(content: string, maxTokensPerChunk: number): string[] {
    const paragraphs = content.split(/\n\n+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      const combinedLength = this.estimateTokens(currentChunk + '\n\n' + paragraph);

      if (combinedLength > maxTokensPerChunk && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = paragraph;
      } else {
        currentChunk = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}
