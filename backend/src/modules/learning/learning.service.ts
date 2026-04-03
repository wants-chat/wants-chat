import { Injectable, Logger } from '@nestjs/common';
import { TutorAgent } from './agents/tutor.agent';
import { SummarizerAgent } from './agents/summarizer.agent';
import { PlannerAgent } from './agents/planner.agent';
import { WriterAgent } from './agents/writer.agent';
import { UserContext } from './agents/base-learning.agent';
import {
  TutoringRequestDto,
  TutoringResponseDto,
  SummarizeRequestDto,
  SummaryResponseDto,
  PlanRequestDto,
  PlanResponseDto,
  WritingRequestDto,
  WritingResponseDto,
  LearningResponseDto,
  LearningSubType,
} from './dto/learning.dto';

export interface LearningInput {
  type: LearningSubType;
  query: string;
  userId: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class LearningService {
  private readonly logger = new Logger(LearningService.name);

  constructor(
    private readonly tutorAgent: TutorAgent,
    private readonly summarizerAgent: SummarizerAgent,
    private readonly plannerAgent: PlannerAgent,
    private readonly writerAgent: WriterAgent,
  ) {}

  /**
   * Main entry point for learning requests from chat
   */
  async processLearningRequest(input: LearningInput): Promise<LearningResponseDto> {
    const { type, query, userId, metadata } = input;

    this.logger.log(`Processing ${type} request from user ${userId}`);

    const context: UserContext = {
      userId,
      memories: [],
      preferences: metadata?.preferences,
    };

    try {
      switch (type) {
        case 'tutoring':
          const tutoringResult = await this.tutor({
            topic: this.extractTopic(query),
            query,
            userId,
            ...metadata,
          });
          return {
            success: true,
            type: 'tutoring',
            content: tutoringResult.content,
            data: {
              questions: tutoringResult.questions,
              level: tutoringResult.level,
              suggestedTopics: tutoringResult.suggestedTopics,
            },
            suggestedTools: tutoringResult.suggestedTools,
          };

        case 'summarize':
          const summaryResult = await this.summarize({
            text: metadata?.text || query,
            url: metadata?.url,
            fileId: metadata?.fileId,
            summaryType: metadata?.summaryType || 'detailed',
            userId,
          });
          return {
            success: true,
            type: 'summarize',
            content: summaryResult.summary,
            data: {
              keyPoints: summaryResult.keyPoints,
              themes: summaryResult.themes,
              actionItems: summaryResult.actionItems,
              wordCount: summaryResult.wordCount,
              readingTime: summaryResult.readingTime,
            },
            suggestedTools: summaryResult.suggestedTools,
          };

        case 'organize':
          const planResult = await this.plan({
            planType: this.detectPlanType(query),
            description: query,
            duration: metadata?.duration,
            startDate: metadata?.startDate,
            endDate: metadata?.endDate,
            goals: metadata?.goals,
            userId,
          });
          return {
            success: true,
            type: 'organize',
            content: planResult.content,
            data: {
              milestones: planResult.milestones,
              dailyActions: planResult.dailyActions,
              suggestions: planResult.suggestions,
            },
            suggestedTools: planResult.suggestedTools,
          };

        case 'writing':
          const writingResult = await this.write({
            writingType: this.detectWritingType(query),
            tone: metadata?.tone || 'professional',
            text: metadata?.text,
            emailDetails: metadata?.emailDetails,
            essayDetails: metadata?.essayDetails,
            reportDetails: metadata?.reportDetails,
            targetTone: metadata?.targetTone,
            userId,
          });
          return {
            success: true,
            type: 'writing',
            content: writingResult.content,
            data: {
              analysis: writingResult.analysis,
              outline: writingResult.outline,
              metadata: writingResult.metadata,
            },
            suggestedTools: writingResult.suggestedTools,
          };

        default:
          throw new Error(`Unknown learning type: ${type}`);
      }
    } catch (error) {
      this.logger.error(`Learning request failed: ${error.message}`, error.stack);
      return {
        success: false,
        type,
        content: `I encountered an error while processing your ${type} request. Please try again or rephrase your question.`,
        metadata: { error: error.message },
      };
    }
  }

  /**
   * Tutoring: Explain concepts and generate practice questions
   */
  async tutor(input: TutoringRequestDto): Promise<TutoringResponseDto> {
    const context: UserContext = {
      userId: input.userId || 'anonymous',
      memories: [],
    };

    return this.tutorAgent.process(input, context);
  }

  /**
   * Summarize: Process documents and extract key information
   */
  async summarize(input: SummarizeRequestDto): Promise<SummaryResponseDto> {
    const context: UserContext = {
      userId: input.userId || 'anonymous',
      memories: [],
    };

    return this.summarizerAgent.process(input, context);
  }

  /**
   * Plan: Create schedules, goals, projects, and study plans
   */
  async plan(input: PlanRequestDto): Promise<PlanResponseDto> {
    const context: UserContext = {
      userId: input.userId || 'anonymous',
      memories: [],
    };

    return this.plannerAgent.process(input, context);
  }

  /**
   * Write: Compose emails, essays, reports, and adjust tone
   */
  async write(input: WritingRequestDto): Promise<WritingResponseDto> {
    const context: UserContext = {
      userId: input.userId || 'anonymous',
      memories: [],
    };

    return this.writerAgent.process(input, context);
  }

  /**
   * Extract the main topic from a query
   */
  private extractTopic(query: string): string {
    // Remove common prefixes
    const prefixes = [
      'explain',
      'teach me about',
      'teach me',
      'help me understand',
      'what is',
      'what are',
      'how does',
      'how do',
      'why does',
      'why do',
      'tell me about',
    ];

    let topic = query.toLowerCase();

    for (const prefix of prefixes) {
      if (topic.startsWith(prefix)) {
        topic = topic.substring(prefix.length).trim();
        break;
      }
    }

    // Remove trailing question marks and clean up
    topic = topic.replace(/\?+$/, '').trim();

    // Capitalize first letter
    return topic.charAt(0).toUpperCase() + topic.slice(1);
  }

  /**
   * Detect the type of plan from the query
   */
  private detectPlanType(query: string): 'schedule' | 'goals' | 'project' | 'study' {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('schedule') || lowerQuery.includes('week') || lowerQuery.includes('daily') || lowerQuery.includes('routine')) {
      return 'schedule';
    }
    if (lowerQuery.includes('study') || lowerQuery.includes('exam') || lowerQuery.includes('learn')) {
      return 'study';
    }
    if (lowerQuery.includes('project') || lowerQuery.includes('timeline') || lowerQuery.includes('milestone')) {
      return 'project';
    }
    return 'goals'; // Default to goals
  }

  /**
   * Detect the type of writing from the query
   */
  private detectWritingType(query: string): 'email' | 'essay' | 'report' | 'proofread' | 'adjust_tone' {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('email') || lowerQuery.includes('message')) {
      return 'email';
    }
    if (lowerQuery.includes('essay') || lowerQuery.includes('write about')) {
      return 'essay';
    }
    if (lowerQuery.includes('report')) {
      return 'report';
    }
    if (lowerQuery.includes('proofread') || lowerQuery.includes('check') || lowerQuery.includes('correct')) {
      return 'proofread';
    }
    if (lowerQuery.includes('tone') || lowerQuery.includes('formal') || lowerQuery.includes('casual') || lowerQuery.includes('professional')) {
      return 'adjust_tone';
    }
    return 'email'; // Default to email
  }
}
