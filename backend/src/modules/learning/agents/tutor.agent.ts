import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../../ai/ai.service';
import { MemoryService } from '../../memory/memory.service';
import { BaseLearningAgent, UserContext } from './base-learning.agent';
import {
  TutoringRequestDto,
  TutoringResponseDto,
  QuizQuestionDto,
  KnowledgeLevel,
} from '../dto/learning.dto';
import {
  TUTOR_BEGINNER_PROMPT,
  TUTOR_INTERMEDIATE_PROMPT,
  TUTOR_ADVANCED_PROMPT,
  QUIZ_GENERATION_PROMPT,
} from '../prompts/learning.prompts';

@Injectable()
export class TutorAgent extends BaseLearningAgent {
  constructor(
    aiService: AiService,
    memoryService: MemoryService,
    configService: ConfigService,
  ) {
    super(aiService, memoryService, configService);
  }

  async process(
    input: TutoringRequestDto,
    context: UserContext,
  ): Promise<TutoringResponseDto> {
    const {
      topic,
      query,
      depth = 'standard',
      includeQuiz = true,
      quizCount = 3,
    } = input;

    this.logger.log(`Tutoring request: ${topic} at ${depth} depth`);

    // 1. Assess user's knowledge level
    const level = await this.assessKnowledgeLevel(topic, context);
    this.logger.debug(`Assessed knowledge level: ${level}`);

    // 2. Get appropriate prompt for the level
    const systemPrompt = this.getPromptForLevel(level, depth);

    // 3. Generate explanation
    const userMessage = query
      ? `Topic: ${topic}\n\nSpecific question: ${query}`
      : `Please explain: ${topic}`;

    const explanation = await this.generateResponse(
      systemPrompt,
      userMessage,
      {
        model: depth === 'detailed' ? 'gpt-4o' : 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: depth === 'detailed' ? 6000 : 3000,
      },
    );

    // 4. Generate quiz questions if requested
    let questions: QuizQuestionDto[] = [];
    if (includeQuiz) {
      questions = await this.generateQuizQuestions(topic, level, quizCount);
    }

    // 5. Get related topics
    const suggestedTopics = await this.getRelatedTopics(topic, level);

    // 6. Store learning progress
    await this.storeProgress(context.userId, topic, {
      level,
      depth,
      hasQuiz: includeQuiz,
      quizCount: questions.length,
    });

    // 7. Build response with formatted content
    const content = this.formatTutoringResponse(explanation, questions, suggestedTopics);

    return {
      content,
      questions,
      level,
      suggestedTopics,
      suggestedTools: this.getToolSuggestions('quiz practice test'),
    };
  }

  /**
   * Assess user's knowledge level based on conversation history
   */
  private async assessKnowledgeLevel(
    topic: string,
    context: UserContext,
  ): Promise<KnowledgeLevel> {
    // Check if user has studied this or related topics before
    const relatedMemories = context.memories.filter((m) =>
      m.content.toLowerCase().includes(topic.toLowerCase()) ||
      this.areTopicsRelated(m.content, topic),
    );

    // Check preferences
    if (context.preferences?.difficultyPreference) {
      return context.preferences.difficultyPreference as KnowledgeLevel;
    }

    // Determine level based on prior learning
    if (relatedMemories.length === 0) {
      return 'beginner';
    }
    if (relatedMemories.length < 5) {
      return 'intermediate';
    }
    return 'advanced';
  }

  /**
   * Check if topics are related (simple keyword matching)
   */
  private areTopicsRelated(content: string, topic: string): boolean {
    const topicWords = topic.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();

    // Check if any significant words from the topic appear in content
    return topicWords.some(
      (word) => word.length > 3 && contentLower.includes(word),
    );
  }

  /**
   * Get the appropriate system prompt based on level
   */
  private getPromptForLevel(
    level: KnowledgeLevel,
    depth: string,
  ): string {
    let basePrompt: string;

    switch (level) {
      case 'beginner':
        basePrompt = TUTOR_BEGINNER_PROMPT;
        break;
      case 'intermediate':
        basePrompt = TUTOR_INTERMEDIATE_PROMPT;
        break;
      case 'advanced':
        basePrompt = TUTOR_ADVANCED_PROMPT;
        break;
      default:
        basePrompt = TUTOR_BEGINNER_PROMPT;
    }

    // Add depth modifier
    if (depth === 'quick') {
      return `${basePrompt}\n\nProvide a brief, concise explanation. Keep it under 300 words.`;
    } else if (depth === 'detailed') {
      return `${basePrompt}\n\nProvide an in-depth, comprehensive explanation with multiple examples and edge cases.`;
    }

    return basePrompt;
  }

  /**
   * Generate quiz questions for the topic
   */
  private async generateQuizQuestions(
    topic: string,
    level: KnowledgeLevel,
    count: number,
  ): Promise<QuizQuestionDto[]> {
    const difficultyMap: Record<KnowledgeLevel, string> = {
      beginner: 'easy',
      intermediate: 'medium',
      advanced: 'hard',
    };

    const prompt = `Generate ${count} multiple choice questions about "${topic}" at ${difficultyMap[level]} difficulty level.

Each question should:
1. Test understanding, not just memorization
2. Have exactly 4 options
3. Have one clearly correct answer
4. Include an explanation

Return as JSON:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The correct option text",
      "difficulty": "${difficultyMap[level]}",
      "explanation": "Why this is correct"
    }
  ]
}`;

    try {
      const response = await this.generateResponse(
        QUIZ_GENERATION_PROMPT,
        prompt,
        {
          model: 'gpt-4o-mini',
          temperature: 0.6,
          responseFormat: 'json_object',
        },
      );

      const parsed = this.parseJsonResponse<{ questions: QuizQuestionDto[] }>(
        response,
        { questions: [] },
      );

      return parsed.questions.slice(0, count);
    } catch (error) {
      this.logger.warn(`Failed to generate quiz questions: ${error.message}`);
      return [];
    }
  }

  /**
   * Get related topics for further learning
   */
  private async getRelatedTopics(
    topic: string,
    level: KnowledgeLevel,
  ): Promise<string[]> {
    const prompt = `Given the topic "${topic}" at ${level} level, suggest 3-5 related topics the user might want to learn next. Return as JSON array of strings.`;

    try {
      const response = await this.generateResponse(
        'You are a curriculum designer. Suggest related learning topics.',
        prompt,
        {
          model: 'gpt-4o-mini',
          temperature: 0.7,
          responseFormat: 'json_object',
        },
      );

      const parsed = this.parseJsonResponse<{ topics: string[] }>(response, {
        topics: [],
      });

      return parsed.topics || [];
    } catch {
      // Return generic suggestions if AI fails
      return [
        `Advanced ${topic}`,
        `${topic} applications`,
        `${topic} best practices`,
      ];
    }
  }

  /**
   * Format the tutoring response with markdown
   */
  private formatTutoringResponse(
    explanation: string,
    questions: QuizQuestionDto[],
    suggestedTopics: string[],
  ): string {
    let content = explanation;

    // Add suggested topics section
    if (suggestedTopics.length > 0) {
      content += '\n\n---\n\n## Related Topics to Explore\n';
      suggestedTopics.forEach((topic) => {
        content += `- ${topic}\n`;
      });
    }

    // Add quiz teaser if questions are available
    if (questions.length > 0) {
      content += '\n\n---\n\n**Ready to test your understanding?**\n';
      content += `**Practice Quiz** - ${questions.length} questions available\n`;
    }

    return content;
  }
}
