import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { MemoryCategory, MemorySource } from './dto';

export interface ExtractedMemory {
  content: string;
  category: MemoryCategory;
  confidence: number;
  language?: string;
}

interface ExtractionResult {
  memories: ExtractedMemory[];
  language: string;
}

@Injectable()
export class AiMemoryExtractorService {
  private readonly logger = new Logger(AiMemoryExtractorService.name);
  private model: ChatOpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (apiKey) {
      this.model = new ChatOpenAI({
        modelName: 'gpt-4o-mini', // Fast and cost-effective for extraction
        temperature: 0,
        openAIApiKey: apiKey,
      });
      this.logger.log('AI Memory Extractor initialized with GPT-4o-mini');
    } else {
      this.logger.warn('OPENAI_API_KEY not configured - AI memory extraction disabled');
    }
  }

  /**
   * Extract memories from a user message using AI
   * Works with any language and complex contexts
   */
  async extractMemories(message: string): Promise<ExtractedMemory[]> {
    if (!this.model) {
      this.logger.warn('AI model not available, skipping extraction');
      return [];
    }

    // Skip very short messages or questions
    if (message.length < 10 || this.isLikelyQuestion(message)) {
      return [];
    }

    try {
      const systemPrompt = `You are a memory extraction AI. Your task is to extract personal facts, preferences, and context from user messages.

IMPORTANT RULES:
1. Only extract FACTUAL information that the user states about THEMSELVES
2. Do NOT extract questions, requests, or hypotheticals
3. Do NOT extract information about other people unless it's in relation to the user (e.g., "my wife" is ok)
4. UNDERSTAND any language, but ALWAYS output memories in ENGLISH
5. Be conservative - only extract clear, definitive statements
6. Preserve proper nouns (names, company names, places) in their original form

CATEGORIES:
- fact: Personal facts (name, location, job, age, family, education, skills, etc.)
- preference: Likes, dislikes, preferences, habits, styles
- instruction: How the user wants to be treated or communicated with
- context: Current projects, goals, situations, temporary states

OUTPUT FORMAT (JSON):
{
  "language": "detected language code of INPUT (en, ja, es, zh, etc.)",
  "memories": [
    {
      "content": "extracted memory ALWAYS IN ENGLISH, starting with 'User...'",
      "category": "fact|preference|instruction|context",
      "confidence": 0.0-1.0
    }
  ]
}

If no memories can be extracted, return: {"language": "en", "memories": []}

EXAMPLES:

User: "I'm a software engineer living in Tokyo. I've been coding for 10 years."
Output: {
  "language": "en",
  "memories": [
    {"content": "User is a software engineer", "category": "fact", "confidence": 0.95},
    {"content": "User lives in Tokyo", "category": "fact", "confidence": 0.95},
    {"content": "User has been coding for 10 years", "category": "fact", "confidence": 0.9}
  ]
}

User: "私は日本に住んでいます。INFO INLET株式会社のCTOとして働いています。"
Output: {
  "language": "ja",
  "memories": [
    {"content": "User lives in Japan", "category": "fact", "confidence": 0.95},
    {"content": "User works as CTO at INFO INLET K.K.", "category": "fact", "confidence": 0.95}
  ]
}

User: "Je suis développeur à Paris et j'aime le café"
Output: {
  "language": "fr",
  "memories": [
    {"content": "User is a developer", "category": "fact", "confidence": 0.95},
    {"content": "User is located in Paris", "category": "fact", "confidence": 0.95},
    {"content": "User likes coffee", "category": "preference", "confidence": 0.85}
  ]
}

User: "Can you help me write some code?"
Output: {"language": "en", "memories": []}

User: "I prefer dark mode and concise responses. Don't use emojis."
Output: {
  "language": "en",
  "memories": [
    {"content": "User prefers dark mode", "category": "preference", "confidence": 0.9},
    {"content": "User prefers concise responses", "category": "preference", "confidence": 0.9},
    {"content": "User doesn't want emojis in responses", "category": "instruction", "confidence": 0.95}
  ]
}`;

      const response = await this.model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(`Extract memories from this message:\n\n"${message}"`),
      ]);

      const content = response.content as string;

      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.logger.warn('No JSON found in AI response');
        return [];
      }

      const result: ExtractionResult = JSON.parse(jsonMatch[0]);

      if (!result.memories || !Array.isArray(result.memories)) {
        return [];
      }

      // Validate and filter memories
      const validMemories = result.memories
        .filter(m =>
          m.content &&
          m.category &&
          ['fact', 'preference', 'instruction', 'context'].includes(m.category) &&
          m.confidence >= 0.6
        )
        .map(m => ({
          content: m.content,
          category: m.category as MemoryCategory,
          confidence: Math.min(m.confidence, 1.0),
          language: result.language,
        }));

      this.logger.log(`AI extracted ${validMemories.length} memories (language: ${result.language})`);
      validMemories.forEach(m => {
        this.logger.log(`  - [${m.category}] ${m.content} (${m.confidence})`);
      });

      return validMemories;

    } catch (error) {
      this.logger.error(`AI memory extraction failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Check if message is likely a question (skip extraction)
   */
  private isLikelyQuestion(message: string): boolean {
    const questionIndicators = [
      // English
      /^(what|where|when|who|why|how|can you|could you|would you|will you|do you|does|is it|are there|have you)\b/i,
      /\?$/,
      // Japanese
      /[？か]$/,
      /^(なに|どこ|いつ|だれ|なぜ|どう)/,
      // Spanish
      /^(qué|dónde|cuándo|quién|por qué|cómo)\b/i,
      /^¿/,
      // Chinese
      /[？吗呢]/,
      // Korean
      /[?？]$/,
    ];

    return questionIndicators.some(pattern => pattern.test(message.trim()));
  }

  /**
   * Extract memories with context from conversation history
   * More accurate as it understands the full context
   */
  async extractMemoriesWithContext(
    currentMessage: string,
    recentMessages: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): Promise<ExtractedMemory[]> {
    if (!this.model) {
      return [];
    }

    // Build conversation context
    const contextMessages = recentMessages
      .slice(-6) // Last 3 exchanges
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const fullContext = contextMessages
      ? `Recent conversation:\n${contextMessages}\n\nCurrent message: "${currentMessage}"`
      : `"${currentMessage}"`;

    try {
      const systemPrompt = `You are a memory extraction AI. Extract personal facts, preferences, and context from the user's messages in a conversation.

Focus on the CURRENT MESSAGE but use conversation context for clarity.
Only extract information the USER states about THEMSELVES.
UNDERSTAND any language input, but ALWAYS output memories in ENGLISH.
Preserve proper nouns (names, company names, places) in original form.

OUTPUT FORMAT (JSON):
{
  "language": "detected language code of input",
  "memories": [
    {
      "content": "memory ALWAYS IN ENGLISH, starting with 'User...'",
      "category": "fact|preference|instruction|context",
      "confidence": 0.0-1.0
    }
  ]
}

Categories:
- fact: Personal facts (identity, location, job, skills, family, etc.)
- preference: Likes, preferences, habits
- instruction: Communication preferences
- context: Current projects, goals, situations

Return empty memories array if nothing to extract.`;

      const response = await this.model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(`Extract memories from:\n\n${fullContext}`),
      ]);

      const content = response.content as string;
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        return [];
      }

      const result: ExtractionResult = JSON.parse(jsonMatch[0]);

      if (!result.memories || !Array.isArray(result.memories)) {
        return [];
      }

      return result.memories
        .filter(m =>
          m.content &&
          m.category &&
          ['fact', 'preference', 'instruction', 'context'].includes(m.category) &&
          m.confidence >= 0.6
        )
        .map(m => ({
          content: m.content,
          category: m.category as MemoryCategory,
          confidence: Math.min(m.confidence, 1.0),
          language: result.language,
        }));

    } catch (error) {
      this.logger.error(`AI memory extraction with context failed: ${error.message}`);
      return [];
    }
  }
}
