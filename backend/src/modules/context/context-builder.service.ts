import { Injectable, Logger } from '@nestjs/common';
import { MemoryService } from '../memory/memory.service';
import { ContextService } from './context.service';
import { DatabaseService } from '../database/database.service';
import { ToolSearchService } from '../tool-search/tool-search.service';
import { ToolIntentExtractionService } from './tool-intent-extraction.service';
import { ToolIntentResultDto, AttachmentInputDto, FileCategory, getFileCategoryFromMime } from './dto/tool-intent.dto';
import * as XLSX from 'xlsx';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  imageUrls?: string[]; // For vision-capable models
}

interface OnboardingData {
  tone_preference?: string;
  output_length?: string;
  preferred_language?: string;
  preferred_currency?: string;
  display_name?: string;
  role?: string;
  industry?: string;
  country?: string;
  timezone?: string;
  measurement_system?: string;
}

interface Attachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

interface ContextOptions {
  userId: string;
  conversationId?: string;
  currentMessage: string;
  model?: string;
  maxTokens?: number;
  attachments?: Attachment[];
}

interface SuggestedTool {
  toolId: string;
  title: string;
  description: string;
  category: string;
  type: string;
  icon: string;
}

interface ParsedFileData {
  fileName: string;
  fileType: string;
  columns?: string[];
  data?: any[];
  rawContent?: string;
}

interface BuiltContext {
  messages: ChatMessage[];
  totalTokens: number;
  memoriesUsed: number;
  summariesUsed: number;
  recentMessagesCount: number;
  suggestedTools: SuggestedTool[]; // Tools injected into context for LLM awareness
  parsedFiles?: ParsedFileData[]; // Parsed file data for storing in message metadata
}

interface BuiltContextWithToolIntent extends BuiltContext {
  toolIntent?: ToolIntentResultDto;
}

// Token budget allocation percentages (for 128K context)
const TOKEN_BUDGET = {
  SYSTEM_PROMPT: 0.10, // 10% - system instructions, tone, memories
  MEMORIES: 0.10, // 10% - relevant long-term memories
  SUMMARIES: 0.20, // 20% - compacted older context
  RECENT_MESSAGES: 0.56, // 56% - last N verbatim messages
  BUFFER: 0.04, // 4% - safety buffer
};

// Model context limits
const MODEL_CONTEXT_LIMITS: Record<string, number> = {
  'gpt-4o': 128000,
  'gpt-4o-mini': 128000,
  'gpt-4-turbo': 128000,
  'claude-3-5-sonnet': 200000,
  'claude-3-5-haiku': 200000,
  'claude-3-opus': 200000,
  'gemini-2.0-flash': 1048576,
  'gemini-1.5-pro': 2097152,
  'deepseek-chat': 64000,
  'deepseek-reasoner': 64000,
  default: 128000,
};

// Tone preference mapping
const TONE_MAPPINGS: Record<string, string> = {
  casual:
    'Use a casual, friendly tone. Be conversational and approachable. Use contractions and everyday language.',
  professional:
    'Use a professional, business-appropriate tone. Be clear and precise while remaining personable.',
  formal:
    'Use a formal, academic tone. Be precise and thorough. Avoid contractions and casual expressions.',
  friendly:
    'Use a warm, friendly tone. Be encouraging and supportive. Make the user feel comfortable.',
};

// Output length mapping
const OUTPUT_LENGTH_MAPPINGS: Record<string, string> = {
  concise:
    'Keep responses brief and to the point. Avoid unnecessary elaboration. Get straight to the answer.',
  balanced:
    'Provide comprehensive yet focused responses. Include necessary context but avoid excessive detail.',
  detailed:
    'Provide thorough, in-depth responses. Include examples, explanations, and related context when helpful.',
};

@Injectable()
export class ContextBuilderService {
  private readonly logger = new Logger(ContextBuilderService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly memoryService: MemoryService,
    private readonly contextService: ContextService,
    private readonly toolSearchService: ToolSearchService,
    private readonly toolIntentExtractionService: ToolIntentExtractionService,
  ) {}

  /**
   * Build optimized context for a chat message
   * This is the main method called before sending to LLM
   */
  async buildContext(options: ContextOptions): Promise<BuiltContext> {
    const {
      userId,
      conversationId,
      currentMessage,
      model = 'gpt-4o',
      maxTokens,
    } = options;

    const contextLimit = maxTokens || MODEL_CONTEXT_LIMITS[model] || MODEL_CONTEXT_LIMITS.default;
    const outputReserve = Math.min(4096, contextLimit * 0.03); // Reserve 3% or 4K for output
    const availableTokens = contextLimit - outputReserve;

    const messages: ChatMessage[] = [];
    let totalTokens = 0;

    // Get user instructions to check toggles (enableMemories, enablePersonalization)
    const userInstructions = await this.memoryService.getCustomInstructions(userId);
    const enableMemories = userInstructions.enableMemories !== false; // Default to true
    const enablePersonalization = userInstructions.enablePersonalization !== false; // Default to true

    // 1. Build system prompt with preferences (pass enablePersonalization flag)
    const systemPrompt = await this.buildSystemPrompt(
      userId,
      availableTokens * TOKEN_BUDGET.SYSTEM_PROMPT,
      enablePersonalization,
      options.attachments,
    );
    messages.push({ role: 'system', content: systemPrompt.content });
    totalTokens += systemPrompt.estimatedTokens;

    // 2. Fetch and add relevant memories (only if enabled)
    let memoriesResult = { content: '', estimatedTokens: 0, count: 0 };
    if (enableMemories) {
      memoriesResult = await this.addMemoriesToContext(
        userId,
        currentMessage,
        availableTokens * TOKEN_BUDGET.MEMORIES,
      );
      if (memoriesResult.content) {
        messages[0].content += memoriesResult.content; // Append to system prompt
        totalTokens += memoriesResult.estimatedTokens;
      }
    } else {
      this.logger.debug('Memories disabled for user, skipping memory context');
    }

    // 2.5. Search for relevant tools and add to context
    const toolsResult = await this.addToolsToContext(currentMessage, options.attachments);
    if (toolsResult.content) {
      messages[0].content += toolsResult.content; // Append to system prompt
      totalTokens += toolsResult.estimatedTokens;
    }

    // 3. Fetch conversation summaries (for older context)
    let summariesUsed = 0;
    if (conversationId) {
      const summariesResult = await this.addSummariesToContext(
        conversationId,
        availableTokens * TOKEN_BUDGET.SUMMARIES,
      );
      summariesUsed = summariesResult.count;
      for (const summary of summariesResult.summaries) {
        messages.push({ role: 'system', content: `[Previous conversation summary]: ${summary}` });
      }
      totalTokens += summariesResult.estimatedTokens;
    }

    // 4. Fetch recent messages (verbatim) and check for stored file data
    let recentMessagesCount = 0;
    let storedFileData: ParsedFileData[] = [];
    if (conversationId) {
      const recentResult = await this.getRecentMessagesWithFileData(
        conversationId,
        userId,
        availableTokens * TOKEN_BUDGET.RECENT_MESSAGES,
      );
      recentMessagesCount = recentResult.messages.length;
      messages.push(...recentResult.messages);
      totalTokens += recentResult.estimatedTokens;
      storedFileData = recentResult.storedFiles || [];
    }

    // 5. Add current message with any file attachments
    const userMessage: ChatMessage = { role: 'user', content: currentMessage };
    const parsedFiles: ParsedFileData[] = [];

    // Process attachments - fetch content for text-based files, extract URLs for images
    if (options.attachments && options.attachments.length > 0) {
      const imageUrls = options.attachments
        .filter((a) => a.type.startsWith('image/'))
        .map((a) => a.url);

      if (imageUrls.length > 0) {
        userMessage.imageUrls = imageUrls;
      }

      // Process text-based files and fetch their content
      const textBasedFiles = options.attachments.filter((a) =>
        this.isTextBasedFile(a.type, a.name),
      );

      if (textBasedFiles.length > 0) {
        const fileResult = await this.fetchFileContentsWithData(textBasedFiles, availableTokens * 0.30);
        if (fileResult.content) {
          userMessage.content += fileResult.content;
          totalTokens += this.estimateTokens(fileResult.content);
        }
        // Store parsed file data for message metadata
        parsedFiles.push(...fileResult.parsedFiles);
      }

      // Add note for other non-processable files
      const otherFiles = options.attachments.filter(
        (a) => !a.type.startsWith('image/') && !this.isTextBasedFile(a.type, a.name),
      );
      if (otherFiles.length > 0) {
        const fileList = otherFiles
          .map((f) => `- ${f.name} (${f.type})`)
          .join('\n');
        userMessage.content +=
          `\n\n[Other attached files]:\n${fileList}`;
      }
    }

    // If we have stored file data from previous messages, add context about it
    if (storedFileData.length > 0 && !options.attachments?.length) {
      let fileContextNote = '\n\n[Previously uploaded files in this conversation]:';
      for (const file of storedFileData) {
        fileContextNote += `\n- ${file.fileName} (${file.fileType})`;
        if (file.columns) {
          fileContextNote += ` - Columns: ${file.columns.join(', ')}`;
        }
        if (file.data && file.data.length > 0) {
          fileContextNote += ` - ${file.data.length} rows`;
        }
      }
      userMessage.content += fileContextNote;
    }

    messages.push(userMessage);
    totalTokens += this.estimateTokens(currentMessage);

    return {
      messages,
      totalTokens,
      memoriesUsed: memoriesResult.count,
      summariesUsed,
      recentMessagesCount,
      suggestedTools: toolsResult.tools,
      parsedFiles: parsedFiles.length > 0 ? parsedFiles : undefined,
    };
  }

  /**
   * Build context with tool intent extraction
   * Enhanced version that also extracts tool intent from attachments
   */
  async buildContextWithToolIntent(options: ContextOptions): Promise<BuiltContextWithToolIntent> {
    // 1. Call existing buildContext()
    const context = await this.buildContext(options);

    // 2. If attachments present, extract tool intent
    let toolIntent: ToolIntentResultDto | undefined;

    if (options.attachments && options.attachments.length > 0) {
      try {
        // Convert attachments to AttachmentInputDto format
        const attachmentInputs: AttachmentInputDto[] = options.attachments.map((a) => ({
          url: a.url,
          name: a.name,
          type: a.type,
          size: a.size,
        }));

        // Extract tool intent
        toolIntent = await this.toolIntentExtractionService.extractToolIntent({
          message: options.currentMessage,
          attachments: attachmentInputs,
          userId: options.userId,
          conversationId: options.conversationId,
        });

        // 3. Merge suggested tools from both sources
        if (toolIntent.suggestedTools.length > 0) {
          // Add tools from intent extraction that aren't already in context
          const existingToolIds = new Set(context.suggestedTools.map((t) => t.toolId));

          for (const suggestedTool of toolIntent.suggestedTools) {
            if (!existingToolIds.has(suggestedTool.toolId)) {
              context.suggestedTools.push({
                toolId: suggestedTool.toolId,
                title: suggestedTool.toolName,
                description: suggestedTool.description || '',
                category: suggestedTool.category || '',
                type: 'tool',
                icon: suggestedTool.icon || '',
              });
            }
          }

          // Re-sort by relevance (intent-based tools should be prioritized)
          // Tools from intent extraction have higher confidence for file operations
          context.suggestedTools.sort((a, b) => {
            const aFromIntent = toolIntent!.suggestedTools.find((t) => t.toolId === a.toolId);
            const bFromIntent = toolIntent!.suggestedTools.find((t) => t.toolId === b.toolId);

            const aScore = aFromIntent ? aFromIntent.relevanceScore : 0.5;
            const bScore = bFromIntent ? bFromIntent.relevanceScore : 0.5;

            return bScore - aScore;
          });
        }

        this.logger.debug(
          `Tool intent extraction: ${toolIntent.detectedIntents.length} intents, ` +
            `${toolIntent.suggestedTools.length} tool suggestions`,
        );
      } catch (error) {
        this.logger.error('Failed to extract tool intent:', error.message);
      }
    }

    return {
      ...context,
      toolIntent,
    };
  }

  /**
   * Build system prompt with user preferences
   */
  private async buildSystemPrompt(
    userId: string,
    tokenBudget: number,
    enablePersonalization: boolean = true,
    attachments?: Attachment[],
  ): Promise<{ content: string; estimatedTokens: number }> {
    // Get onboarding data for tone/preferences (only if personalization is enabled)
    const onboarding = enablePersonalization
      ? await this.contextService.getOnboardingData(userId)
      : null;

    // Get custom instructions (always get these, they're explicit user preferences)
    const instructions = await this.memoryService.getCustomInstructions(userId);

    // Base system prompt
    let systemPrompt = `You are Wants, a highly intelligent and helpful AI assistant. You help users with a wide variety of tasks including coding, writing, analysis, creative projects, and more.

## CRITICAL: Response Language Rule
**ALWAYS respond in the SAME language as the user's CURRENT message.**
- If the user writes in English, respond in English
- If the user writes in Japanese, respond in Japanese
- If the user writes in Spanish, respond in Spanish
- This rule applies REGARDLESS of:
  - What language memories are stored in
  - What language was used in previous messages
  - What language preference is set in settings
- The ONLY exception: If the user explicitly asks you to respond in a specific language (e.g., "reply in French")
- Memories and context may be in different languages - understand them but ALWAYS respond in the user's current message language

## Data Visualization - IMPORTANT
When a user asks you to create a chart, graph, or visualization from data they've provided, you MUST:
1. IMMEDIATELY generate the chart - do NOT ask clarifying questions
2. Use the data provided in the conversation context
3. Make reasonable assumptions about what to visualize based on the data columns

Generate inline charts using this exact format (the :::chart block will render as an actual chart):

:::chart
{
  "type": "line",
  "title": "Revenue Growth Over Time",
  "data": [
    {"name": "Jan", "revenue": 125000, "expenses": 95000},
    {"name": "Feb", "revenue": 132000, "expenses": 99300}
  ],
  "xKey": "name",
  "series": ["revenue", "expenses"]
}
:::

Chart types: "bar", "line", "area", "pie"
- For single metric: use "yKey": "columnName"
- For multiple metrics: use "series": ["col1", "col2"]
- For pie charts: use "nameKey" and "valueKey"

CRITICAL: When user has uploaded data (CSV/Excel) and asks for a chart:
- Extract the actual data from the file content in context
- Generate the chart immediately with real data
- Do NOT ask "which metrics?" or "what data?" - just pick the most relevant columns
- Include a brief description after the chart explaining what it shows`;

    // Add attachment awareness to system prompt
    if (attachments && attachments.length > 0) {
      const attachmentSummary = this.buildAttachmentAwareness(attachments);
      if (attachmentSummary) {
        systemPrompt += `\n\n## Current Attachments\n${attachmentSummary}`;
      }
    }

    // Add tone preference
    if (onboarding?.tone_preference) {
      const toneInstruction =
        TONE_MAPPINGS[onboarding.tone_preference] || TONE_MAPPINGS.professional;
      systemPrompt += `\n\n## Communication Style\n${toneInstruction}`;
    }

    // Add output length preference
    if (onboarding?.output_length) {
      const lengthInstruction =
        OUTPUT_LENGTH_MAPPINGS[onboarding.output_length] ||
        OUTPUT_LENGTH_MAPPINGS.balanced;
      systemPrompt += `\n${lengthInstruction}`;
    }

    // Add custom "about user" if set
    if (instructions.aboutUser) {
      systemPrompt += `\n\n## About the User\n${instructions.aboutUser}`;
    }

    // Add custom response preferences
    if (instructions.responsePreferences) {
      systemPrompt += `\n\n## Response Preferences\n${instructions.responsePreferences}`;
    }

    // Add general custom instructions
    if (instructions.customInstructions) {
      systemPrompt += `\n\n## Custom Instructions\n${instructions.customInstructions}`;
    }

    // Add user context from onboarding (only if personalization is enabled)
    if (onboarding) {
      const contextParts: string[] = [];
      if (onboarding.display_name)
        contextParts.push(`Name: ${onboarding.display_name}`);
      if (onboarding.role) contextParts.push(`Role: ${onboarding.role}`);
      if (onboarding.industry)
        contextParts.push(`Industry: ${onboarding.industry}`);
      if (onboarding.country)
        contextParts.push(`Country: ${onboarding.country}`);
      if (onboarding.timezone)
        contextParts.push(`Timezone: ${onboarding.timezone}`);
      if (onboarding.preferred_currency)
        contextParts.push(`Preferred currency: ${onboarding.preferred_currency}`);
      // Note: preferred_language is intentionally NOT included here
      // Response language is determined by the user's current message language, not this setting
      if (onboarding.measurement_system)
        contextParts.push(`Measurement system: ${onboarding.measurement_system}`);

      if (contextParts.length > 0) {
        systemPrompt += `\n\n## User Context\n${contextParts.join('\n')}`;
      }
    } else if (!enablePersonalization) {
      this.logger.debug('Personalization disabled for user, skipping onboarding data');
    }

    // Add final reminder about response language (placed at end for maximum impact)
    systemPrompt += `\n\n## REMINDER: Response Language
**CRITICAL: Respond in the SAME language as the user's CURRENT message.**
- User writes in English → You respond in English
- User writes in Japanese → You respond in Japanese
- Ignore any other language preferences or context languages. Match the user's input language ONLY.`;

    // Truncate if needed
    const estimatedTokens = this.estimateTokens(systemPrompt);
    if (estimatedTokens > tokenBudget) {
      systemPrompt = this.truncateToTokenLimit(systemPrompt, tokenBudget);
    }

    return {
      content: systemPrompt,
      estimatedTokens: this.estimateTokens(systemPrompt),
    };
  }

  /**
   * Build attachment awareness section for system prompt
   */
  private buildAttachmentAwareness(attachments: Attachment[]): string {
    if (!attachments || attachments.length === 0) {
      return '';
    }

    const lines: string[] = [];
    const imageFiles: string[] = [];
    const documentFiles: string[] = [];
    const dataFiles: string[] = [];
    const audioFiles: string[] = [];
    const videoFiles: string[] = [];
    const otherFiles: string[] = [];

    for (const attachment of attachments) {
      const category = getFileCategoryFromMime(attachment.type);
      const name = attachment.name;

      switch (category) {
        case FileCategory.IMAGE:
          imageFiles.push(name);
          break;
        case FileCategory.DOCUMENT:
          documentFiles.push(name);
          break;
        case FileCategory.SPREADSHEET:
        case FileCategory.DATA:
          dataFiles.push(name);
          break;
        case FileCategory.AUDIO:
          audioFiles.push(name);
          break;
        case FileCategory.VIDEO:
          videoFiles.push(name);
          break;
        default:
          otherFiles.push(name);
      }
    }

    if (imageFiles.length > 0) {
      lines.push(`- User has attached ${imageFiles.length} image(s): ${imageFiles.join(', ')}`);
      lines.push(`  Consider: Image editing tools (resize, crop, compress, background removal, format conversion)`);
    }
    if (documentFiles.length > 0) {
      lines.push(`- User has attached ${documentFiles.length} document(s): ${documentFiles.join(', ')}`);
      lines.push(`  Consider: Document tools (merge, split, convert, compress, OCR)`);
    }
    if (dataFiles.length > 0) {
      lines.push(`- User has attached data file(s): ${dataFiles.join(', ')}`);
      lines.push(`  Consider: Data tools (analyze, chart, visualize, export, transform)`);
      lines.push(`  The data content is included below for analysis.`);
    }
    if (audioFiles.length > 0) {
      lines.push(`- User has attached ${audioFiles.length} audio file(s): ${audioFiles.join(', ')}`);
      lines.push(`  Consider: Audio tools (convert, trim, transcribe)`);
    }
    if (videoFiles.length > 0) {
      lines.push(`- User has attached ${videoFiles.length} video file(s): ${videoFiles.join(', ')}`);
      lines.push(`  Consider: Video tools (convert, trim, compress, extract audio, create GIF)`);
    }
    if (otherFiles.length > 0) {
      lines.push(`- User has attached other file(s): ${otherFiles.join(', ')}`);
    }

    return lines.join('\n');
  }

  /**
   * Add relevant memories to context
   */
  private async addMemoriesToContext(
    userId: string,
    currentMessage: string,
    tokenBudget: number,
  ): Promise<{ content: string; estimatedTokens: number; count: number }> {
    const memories = await this.memoryService.getRelevantMemories(
      userId,
      currentMessage,
      20, // Get up to 20 relevant memories
    );

    if (memories.length === 0) {
      return { content: '', estimatedTokens: 0, count: 0 };
    }

    // Separate memories by category
    const instructions = memories.filter(m => m.category === 'instruction');
    const preferences = memories.filter(m => m.category === 'preference');
    const facts = memories.filter(m => m.category === 'fact');
    const contexts = memories.filter(m => m.category === 'context');

    let memoriesContent = '';
    let usedMemories = 0;
    let currentTokens = 0;

    // Add note about memory language
    memoriesContent = '\n\n[Note: Memories below may be in various languages. ALWAYS respond in the language of the user\'s CURRENT message, NOT the language of these memories.]';
    currentTokens += this.estimateTokens(memoriesContent);

    // INSTRUCTIONS - These are RULES that MUST be followed
    if (instructions.length > 0) {
      memoriesContent += '\n\n## USER INSTRUCTIONS - MUST FOLLOW';
      memoriesContent += '\nThe following are explicit instructions from the user. You MUST follow these rules:';
      for (const mem of instructions) {
        const line = `\n- **${mem.content}**`;
        const lineTokens = this.estimateTokens(line);
        if (currentTokens + lineTokens > tokenBudget) break;
        memoriesContent += line;
        currentTokens += lineTokens;
        usedMemories++;
      }
    }

    // PREFERENCES - User preferences to consider
    if (preferences.length > 0 && currentTokens < tokenBudget) {
      memoriesContent += '\n\n## User Preferences';
      for (const mem of preferences) {
        const line = `\n- ${mem.content}`;
        const lineTokens = this.estimateTokens(line);
        if (currentTokens + lineTokens > tokenBudget) break;
        memoriesContent += line;
        currentTokens += lineTokens;
        usedMemories++;
      }
    }

    // FACTS - Known facts about the user
    if (facts.length > 0 && currentTokens < tokenBudget) {
      memoriesContent += '\n\n## Known Facts About User';
      for (const mem of facts) {
        const line = `\n- ${mem.content}`;
        const lineTokens = this.estimateTokens(line);
        if (currentTokens + lineTokens > tokenBudget) break;
        memoriesContent += line;
        currentTokens += lineTokens;
        usedMemories++;
      }
    }

    // CONTEXT - Current context
    if (contexts.length > 0 && currentTokens < tokenBudget) {
      memoriesContent += '\n\n## Current Context';
      for (const mem of contexts) {
        const line = `\n- ${mem.content}`;
        const lineTokens = this.estimateTokens(line);
        if (currentTokens + lineTokens > tokenBudget) break;
        memoriesContent += line;
        currentTokens += lineTokens;
        usedMemories++;
      }
    }

    this.logger.log(`Built memory context: ${instructions.length} instructions, ${preferences.length} preferences, ${facts.length} facts, ${contexts.length} contexts`);

    return {
      content: usedMemories > 0 ? memoriesContent : '',
      estimatedTokens: usedMemories > 0 ? currentTokens : 0,
      count: usedMemories,
    };
  }

  /**
   * Search for relevant tools based on user message and add to context
   * This makes the LLM aware of available tools it can suggest
   */
  private async addToolsToContext(
    currentMessage: string,
    attachments?: Attachment[],
  ): Promise<{ content: string; estimatedTokens: number; tools: SuggestedTool[] }> {
    try {
      // Search for top 5 relevant tools using semantic search
      const searchResult = await this.toolSearchService.searchTools(currentMessage, 5);

      // Get attachment-based tool boosts
      const boostedToolCategories = this.getAttachmentBasedToolBoosts(attachments);

      // Filter and boost tools
      let relevantTools = searchResult.tools.filter((t) => t.score > 0.35);

      // Apply attachment-based boosts to tool scores
      relevantTools = relevantTools.map((tool) => {
        let boostedScore = tool.score;

        // Check if tool category matches any boosted category
        for (const boostCategory of boostedToolCategories) {
          if (tool.category.includes(boostCategory) || tool.toolId.includes(boostCategory)) {
            boostedScore = Math.min(boostedScore + 0.15, 1.0);
            break;
          }
        }

        return { ...tool, score: boostedScore };
      });

      // Re-sort by boosted score
      relevantTools.sort((a, b) => b.score - a.score);

      // Take top 3 after boosting
      relevantTools = relevantTools.slice(0, 3);

      if (relevantTools.length === 0) {
        return { content: '', estimatedTokens: 0, tools: [] };
      }

      // Build tool context for LLM
      const toolsList = relevantTools
        .map((t) => `- **${t.title}**: ${t.description}`)
        .join('\n');

      const toolsContent = `\n\n## Available Tools
When the user's request can be better served by one of our specialized tools, you may naturally mention it in your response. Use the exact tool name in bold (e.g., **Tool Name**) so it can be made clickable.

Relevant tools for this query:
${toolsList}

Note: Only suggest tools when they directly help with the user's request. Don't force tool suggestions.`;

      // Map to SuggestedTool format for frontend
      const suggestedTools: SuggestedTool[] = relevantTools.map((t) => ({
        toolId: t.toolId,
        title: t.title,
        description: t.description,
        category: t.category,
        type: t.type,
        icon: t.icon,
      }));

      this.logger.debug(
        `Added ${relevantTools.length} tools to context: ${relevantTools.map((t) => t.title).join(', ')}`,
      );

      return {
        content: toolsContent,
        estimatedTokens: this.estimateTokens(toolsContent),
        tools: suggestedTools,
      };
    } catch (error) {
      this.logger.error('Failed to add tools to context:', error.message);
      return { content: '', estimatedTokens: 0, tools: [] };
    }
  }

  /**
   * Get tool category boosts based on attachment types
   */
  private getAttachmentBasedToolBoosts(attachments?: Attachment[]): string[] {
    if (!attachments || attachments.length === 0) {
      return [];
    }

    const boosts: string[] = [];

    for (const attachment of attachments) {
      const category = getFileCategoryFromMime(attachment.type);

      switch (category) {
        case FileCategory.IMAGE:
          boosts.push('image', 'resize', 'crop', 'compress', 'convert', 'background', 'ocr');
          break;
        case FileCategory.DOCUMENT:
          boosts.push('document', 'pdf', 'merge', 'split', 'convert', 'compress', 'ocr');
          break;
        case FileCategory.SPREADSHEET:
        case FileCategory.DATA:
          boosts.push('data', 'chart', 'analyze', 'visualize', 'export', 'transform', 'csv', 'excel');
          break;
        case FileCategory.AUDIO:
          boosts.push('audio', 'convert', 'trim', 'transcribe', 'mp3', 'wav');
          break;
        case FileCategory.VIDEO:
          boosts.push('video', 'convert', 'trim', 'compress', 'gif', 'mp4', 'transcribe');
          break;
        case FileCategory.CODE:
          boosts.push('code', 'format', 'minify', 'beautify', 'convert');
          break;
      }
    }

    return [...new Set(boosts)]; // Remove duplicates
  }

  /**
   * Add conversation summaries to context
   */
  private async addSummariesToContext(
    conversationId: string,
    tokenBudget: number,
  ): Promise<{ summaries: string[]; estimatedTokens: number; count: number }> {
    const result = await this.db.query(
      `SELECT summary, key_topics, key_decisions
       FROM conversation_summaries
       WHERE conversation_id = $1
       ORDER BY created_at DESC
       LIMIT 5`,
      [conversationId],
    );

    if (result.rows.length === 0) {
      return { summaries: [], estimatedTokens: 0, count: 0 };
    }

    const summaries: string[] = [];
    let totalTokens = 0;

    for (const row of result.rows) {
      let summaryText = row.summary;

      // Add key topics if available
      if (row.key_topics && row.key_topics.length > 0) {
        summaryText += ` Key topics: ${row.key_topics.join(', ')}.`;
      }

      const tokens = this.estimateTokens(summaryText);
      if (totalTokens + tokens > tokenBudget) break;

      summaries.push(summaryText);
      totalTokens += tokens;
    }

    return {
      summaries,
      estimatedTokens: totalTokens,
      count: summaries.length,
    };
  }

  /**
   * Get recent messages (verbatim, not summarized)
   */
  private async getRecentMessages(
    conversationId: string,
    userId: string,
    tokenBudget: number,
  ): Promise<{ messages: ChatMessage[]; estimatedTokens: number }> {
    // Get last 50 messages, but we'll trim to fit budget
    const result = await this.db.query(
      `SELECT role, content FROM messages
       WHERE conversation_id = $1 AND user_id = $2
         AND is_summarized = FALSE AND is_current_version = TRUE
       ORDER BY created_at DESC
       LIMIT 50`,
      [conversationId, userId],
    );

    const allMessages = result.rows.reverse(); // Oldest first
    const messages: ChatMessage[] = [];
    let totalTokens = 0;

    // Start from oldest, add until budget exceeded
    for (const msg of allMessages) {
      const tokens = this.estimateTokens(msg.content);
      if (totalTokens + tokens > tokenBudget) {
        // If we have room for at least some messages, keep them
        // Otherwise, we need to include at least the last few
        if (messages.length >= 10) break;
      }

      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      });
      totalTokens += tokens;
    }

    // Ensure we have at least the last 3 messages if possible
    if (messages.length < 3 && allMessages.length >= 3) {
      const lastThree = allMessages.slice(-3);
      return {
        messages: lastThree.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        estimatedTokens: lastThree.reduce(
          (sum, m) => sum + this.estimateTokens(m.content),
          0,
        ),
      };
    }

    return { messages, estimatedTokens: totalTokens };
  }

  /**
   * Get recent messages and re-fetch any file attachments for context
   */
  private async getRecentMessagesWithFileData(
    conversationId: string,
    userId: string,
    tokenBudget: number,
  ): Promise<{ messages: ChatMessage[]; estimatedTokens: number; storedFiles: ParsedFileData[] }> {
    // Get last 50 messages with metadata
    const result = await this.db.query(
      `SELECT role, content, metadata FROM messages
       WHERE conversation_id = $1 AND user_id = $2
         AND is_summarized = FALSE AND is_current_version = TRUE
       ORDER BY created_at DESC
       LIMIT 50`,
      [conversationId, userId],
    );

    const allMessages = result.rows.reverse(); // Oldest first
    const messages: ChatMessage[] = [];
    const storedFiles: ParsedFileData[] = [];
    let totalTokens = 0;
    const fileBudget = tokenBudget * 0.3; // Reserve 30% for file content

    // First pass: find all file attachments in conversation
    const allAttachments: Attachment[] = [];
    for (const msg of allMessages) {
      try {
        const metadata = typeof msg.metadata === 'string'
          ? JSON.parse(msg.metadata || '{}')
          : (msg.metadata || {});

        if (metadata.attachments && Array.isArray(metadata.attachments)) {
          for (const att of metadata.attachments) {
            if (att.url && !allAttachments.some(a => a.url === att.url)) {
              allAttachments.push(att);
            }
          }
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    // Fetch file contents if there are attachments
    let fileContextContent = '';
    if (allAttachments.length > 0) {
      this.logger.log(`Found ${allAttachments.length} file attachments in conversation history`);

      // Filter to text-based files and fetch their content
      const textFiles = allAttachments.filter(a => this.isTextBasedFile(a.type || '', a.name || ''));
      if (textFiles.length > 0) {
        const fileResult = await this.fetchFileContentsWithData(textFiles, fileBudget);
        fileContextContent = fileResult.content;
        storedFiles.push(...fileResult.parsedFiles);
        totalTokens += this.estimateTokens(fileContextContent);
      }

      // Note image attachments
      const imageFiles = allAttachments.filter(a => a.type?.startsWith('image/'));
      if (imageFiles.length > 0) {
        fileContextContent += `\n\n[${imageFiles.length} image(s) were previously shared in this conversation]`;
      }
    }

    // Build messages for context (remaining budget)
    const messageBudget = tokenBudget - totalTokens;
    for (const msg of allMessages) {
      const tokens = this.estimateTokens(msg.content);
      if (totalTokens + tokens > messageBudget) {
        if (messages.length >= 10) break;
      }

      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      });
      totalTokens += tokens;
    }

    // If we have file content, prepend it to the first user message or add as system context
    if (fileContextContent && messages.length > 0) {
      // Add file context as a system message at the start
      messages.unshift({
        role: 'system',
        content: `[Files shared in this conversation - use this data to answer user questions]:${fileContextContent}`,
      });
    }

    // Ensure we have at least the last 3 messages if possible
    if (messages.length < 3 && allMessages.length >= 3) {
      const lastThree = allMessages.slice(-3);
      const basicMessages: ChatMessage[] = lastThree.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      if (fileContextContent) {
        basicMessages.unshift({
          role: 'system',
          content: `[Files shared in this conversation]:${fileContextContent}`,
        });
      }

      return {
        messages: basicMessages,
        estimatedTokens: lastThree.reduce(
          (sum, m) => sum + this.estimateTokens(m.content),
          0,
        ) + this.estimateTokens(fileContextContent),
        storedFiles,
      };
    }

    return { messages, estimatedTokens: totalTokens, storedFiles };
  }

  /**
   * Estimate token count for text (rough approximation)
   * ~4 characters per token for English
   */
  private estimateTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  /**
   * Truncate text to fit within token limit
   */
  private truncateToTokenLimit(text: string, tokenLimit: number): string {
    const charLimit = tokenLimit * 4;
    if (text.length <= charLimit) return text;
    return text.substring(0, charLimit - 100) + '\n\n[Content truncated due to length]';
  }

  /**
   * Get the context limit for a model
   */
  getModelContextLimit(model: string): number {
    return MODEL_CONTEXT_LIMITS[model] || MODEL_CONTEXT_LIMITS.default;
  }

  /**
   * Check if a file is text-based and can be read
   */
  private isTextBasedFile(mimeType: string, fileName: string): boolean {
    const textMimeTypes = [
      'text/csv',
      'text/plain',
      'text/markdown',
      'text/html',
      'text/xml',
      'application/json',
      'application/xml',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    const textExtensions = ['.csv', '.txt', '.json', '.md', '.xml', '.html', '.xlsx', '.xls', '.tsv'];
    const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));

    return textMimeTypes.includes(mimeType) || textExtensions.includes(ext);
  }

  /**
   * Fetch content of text-based files from their URLs
   */
  private async fetchFileContents(
    files: Attachment[],
    tokenBudget: number,
  ): Promise<string> {
    const fileContentsParts: string[] = [];
    let usedTokens = 0;
    const maxTokensPerFile = Math.floor(tokenBudget / files.length);

    for (const file of files) {
      try {
        this.logger.log(`Fetching file content: ${file.name} from ${file.url}`);

        const response = await fetch(file.url);
        if (!response.ok) {
          this.logger.warn(`Failed to fetch file ${file.name}: ${response.statusText}`);
          continue;
        }

        let content: string;
        const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

        // Handle Excel files
        if (ext === '.xlsx' || ext === '.xls' || file.type.includes('spreadsheet')) {
          const buffer = await response.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          content = XLSX.utils.sheet_to_csv(firstSheet);
        } else {
          // For text files (CSV, JSON, TXT, etc.)
          content = await response.text();
        }

        // Truncate if content is too large
        const contentTokens = this.estimateTokens(content);
        if (contentTokens > maxTokensPerFile) {
          const charLimit = maxTokensPerFile * 4;
          content = content.substring(0, charLimit) + '\n\n[... content truncated due to size ...]';
        }

        // Format the file content
        let fileBlock = `\n\n## Attached File: ${file.name}\n`;

        // Detect file type and format accordingly
        if (ext === '.json') {
          try {
            const parsed = JSON.parse(content);
            fileBlock += '```json\n' + JSON.stringify(parsed, null, 2).substring(0, maxTokensPerFile * 4) + '\n```';
          } catch {
            fileBlock += '```\n' + content + '\n```';
          }
        } else if (ext === '.csv' || ext === '.tsv' || file.type.includes('csv')) {
          // For CSV, show the data in a readable format
          const lines = content.split('\n').slice(0, 100); // Limit to first 100 rows
          const header = lines[0];
          const sampleRows = lines.slice(1, 21); // First 20 data rows

          fileBlock += `**Data Preview (${lines.length - 1} total rows):**\n`;
          fileBlock += '```csv\n' + [header, ...sampleRows].join('\n');
          if (lines.length > 21) {
            fileBlock += '\n... (' + (lines.length - 21) + ' more rows)';
          }
          fileBlock += '\n```';

          // Also add full data for analysis (but formatted for LLM)
          fileBlock += '\n\n**Full Data for Analysis:**\n';
          fileBlock += '```\n' + content + '\n```';
        } else {
          fileBlock += '```\n' + content + '\n```';
        }

        const blockTokens = this.estimateTokens(fileBlock);
        if (usedTokens + blockTokens > tokenBudget) {
          this.logger.warn(`Token budget exceeded, skipping remaining files`);
          break;
        }

        fileContentsParts.push(fileBlock);
        usedTokens += blockTokens;
        this.logger.log(`Added ${file.name} to context (${blockTokens} estimated tokens)`);
      } catch (error) {
        this.logger.error(`Error processing file ${file.name}:`, error.message);
      }
    }

    return fileContentsParts.join('');
  }

  /**
   * Fetch content of text-based files and return both content and parsed data
   */
  private async fetchFileContentsWithData(
    files: Attachment[],
    tokenBudget: number,
  ): Promise<{ content: string; parsedFiles: ParsedFileData[] }> {
    const fileContentsParts: string[] = [];
    const parsedFiles: ParsedFileData[] = [];
    let usedTokens = 0;
    const maxTokensPerFile = Math.floor(tokenBudget / files.length);

    for (const file of files) {
      try {
        this.logger.log(`Fetching file content: ${file.name} from ${file.url}`);

        const response = await fetch(file.url);
        if (!response.ok) {
          this.logger.warn(`Failed to fetch file ${file.name}: ${response.statusText}`);
          continue;
        }

        let content: string;
        const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

        // Handle Excel files
        if (ext === '.xlsx' || ext === '.xls' || file.type.includes('spreadsheet')) {
          const buffer = await response.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          content = XLSX.utils.sheet_to_csv(firstSheet);
        } else {
          // For text files (CSV, JSON, TXT, etc.)
          content = await response.text();
        }

        // Parse CSV/TSV data for storage
        const parsedFile: ParsedFileData = {
          fileName: file.name,
          fileType: file.type,
        };

        if (ext === '.csv' || ext === '.tsv' || file.type.includes('csv')) {
          const lines = content.split('\n').filter(l => l.trim());
          if (lines.length > 1) {
            parsedFile.columns = lines[0].split(',').map(c => c.trim());
            parsedFile.data = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.trim());
              const row: any = {};
              parsedFile.columns!.forEach((col, idx) => {
                const val = values[idx];
                row[col] = isNaN(Number(val)) ? val : Number(val);
              });
              return row;
            });
          }
        } else if (ext === '.json') {
          try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed) && parsed.length > 0) {
              parsedFile.columns = Object.keys(parsed[0]);
              parsedFile.data = parsed;
            }
          } catch {
            parsedFile.rawContent = content.substring(0, 10000); // Store first 10K chars
          }
        } else {
          parsedFile.rawContent = content.substring(0, 10000); // Store first 10K chars
        }

        parsedFiles.push(parsedFile);

        // Truncate if content is too large
        const contentTokens = this.estimateTokens(content);
        if (contentTokens > maxTokensPerFile) {
          const charLimit = maxTokensPerFile * 4;
          content = content.substring(0, charLimit) + '\n\n[... content truncated due to size ...]';
        }

        // Format the file content
        let fileBlock = `\n\n## Attached File: ${file.name}\n`;

        // Detect file type and format accordingly
        if (ext === '.json') {
          try {
            const parsed = JSON.parse(content);
            fileBlock += '```json\n' + JSON.stringify(parsed, null, 2).substring(0, maxTokensPerFile * 4) + '\n```';
          } catch {
            fileBlock += '```\n' + content + '\n```';
          }
        } else if (ext === '.csv' || ext === '.tsv' || file.type.includes('csv')) {
          const lines = content.split('\n').slice(0, 100);
          const header = lines[0];
          const sampleRows = lines.slice(1, 21);

          fileBlock += `**Data Preview (${lines.length - 1} total rows):**\n`;
          fileBlock += '```csv\n' + [header, ...sampleRows].join('\n');
          if (lines.length > 21) {
            fileBlock += '\n... (' + (lines.length - 21) + ' more rows)';
          }
          fileBlock += '\n```';

          fileBlock += '\n\n**Full Data for Analysis:**\n';
          fileBlock += '```\n' + content + '\n```';
        } else {
          fileBlock += '```\n' + content + '\n```';
        }

        const blockTokens = this.estimateTokens(fileBlock);
        if (usedTokens + blockTokens > tokenBudget) {
          this.logger.warn(`Token budget exceeded, skipping remaining files`);
          break;
        }

        fileContentsParts.push(fileBlock);
        usedTokens += blockTokens;
        this.logger.log(`Added ${file.name} to context (${blockTokens} estimated tokens)`);
      } catch (error) {
        this.logger.error(`Error processing file ${file.name}:`, error.message);
      }
    }

    return {
      content: fileContentsParts.join(''),
      parsedFiles,
    };
  }
}
