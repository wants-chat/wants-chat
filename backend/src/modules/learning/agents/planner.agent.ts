import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../../ai/ai.service';
import { MemoryService } from '../../memory/memory.service';
import { BaseLearningAgent, UserContext } from './base-learning.agent';
import {
  PlanRequestDto,
  PlanResponseDto,
  MilestoneDto,
  PlanType,
} from '../dto/learning.dto';
import {
  SCHEDULE_PROMPT,
  GOAL_PLANNING_PROMPT,
  PROJECT_PLANNING_PROMPT,
  STUDY_PLANNING_PROMPT,
} from '../prompts/learning.prompts';

@Injectable()
export class PlannerAgent extends BaseLearningAgent {
  constructor(
    aiService: AiService,
    memoryService: MemoryService,
    configService: ConfigService,
  ) {
    super(aiService, memoryService, configService);
  }

  async process(
    input: PlanRequestDto,
    context: UserContext,
  ): Promise<PlanResponseDto> {
    const { planType, description, duration, startDate, endDate, constraints, goals } = input;

    this.logger.log(`Planning request: ${planType} - ${description}`);

    // Get appropriate prompt and handler
    let result: PlanResponseDto;

    switch (planType) {
      case 'schedule':
        result = await this.createSchedule(description, duration, constraints, context);
        break;
      case 'goals':
        result = await this.createGoalPlan(description, duration, goals, context);
        break;
      case 'project':
        result = await this.createProjectPlan(description, startDate, endDate, goals, context);
        break;
      case 'study':
        result = await this.createStudyPlan(description, duration, goals, context);
        break;
      default:
        result = await this.createGenericPlan(description, duration, context);
    }

    // Store planning activity
    await this.storeProgress(context.userId, `Plan: ${planType}`, {
      description,
      planType,
      duration,
    });

    return result;
  }

  /**
   * Create a schedule (daily/weekly)
   */
  private async createSchedule(
    description: string,
    duration: string | undefined,
    constraints: string[] | undefined,
    context: UserContext,
  ): Promise<PlanResponseDto> {
    const userMessage = `Create a schedule based on:
Description: ${description}
Duration: ${duration || 'one week'}
Constraints: ${constraints?.join(', ') || 'none specified'}

Please provide:
1. A detailed daily schedule with time blocks
2. Weekly goals
3. Time allocation summary
4. Tips for maintaining the schedule`;

    const response = await this.generateResponse(
      SCHEDULE_PROMPT,
      userMessage,
      {
        model: 'gpt-4o',
        temperature: 0.6,
        maxTokens: 4000,
      },
    );

    // Parse schedule data
    const scheduleData = await this.parseScheduleData(response);

    const content = this.formatScheduleContent(response, description);

    return {
      type: 'schedule',
      content,
      title: `Schedule: ${description}`,
      data: scheduleData,
      suggestions: [
        'Set reminders for key activities',
        'Build in buffer time between tasks',
        'Review and adjust weekly',
      ],
      suggestedTools: this.getToolSuggestions('schedule calendar reminder'),
    };
  }

  /**
   * Create a goal plan with SMART framework
   */
  private async createGoalPlan(
    description: string,
    timeline: string | undefined,
    goals: string[] | undefined,
    context: UserContext,
  ): Promise<PlanResponseDto> {
    const userMessage = `Create a goal plan for:
Goal: ${description}
Timeline: ${timeline || 'flexible'}
Sub-goals: ${goals?.join(', ') || 'to be determined'}

Please provide:
1. SMART goal breakdown
2. Milestones with target dates
3. Daily/weekly actions
4. Potential obstacles and solutions
5. Progress tracking suggestions`;

    const response = await this.generateResponse(
      GOAL_PLANNING_PROMPT,
      userMessage,
      {
        model: 'gpt-4o',
        temperature: 0.6,
        maxTokens: 4000,
      },
    );

    // Extract milestones
    const milestones = await this.extractMilestones(response);

    // Extract daily actions
    const dailyActions = await this.extractDailyActions(response);

    const content = this.formatGoalContent(response, description);

    return {
      type: 'goals',
      content,
      title: `Goal Plan: ${description}`,
      milestones,
      dailyActions,
      suggestions: [
        'Track progress weekly',
        'Celebrate small wins',
        'Adjust timeline if needed',
      ],
      suggestedTools: this.getToolSuggestions('goals tracking reminder'),
    };
  }

  /**
   * Create a project plan with timeline
   */
  private async createProjectPlan(
    description: string,
    startDate: string | undefined,
    endDate: string | undefined,
    goals: string[] | undefined,
    context: UserContext,
  ): Promise<PlanResponseDto> {
    const userMessage = `Create a project plan for:
Project: ${description}
Start Date: ${startDate || 'as soon as possible'}
End Date: ${endDate || 'to be determined based on scope'}
Objectives: ${goals?.join(', ') || 'to be defined'}

Please provide:
1. Project overview
2. Timeline with phases (describe as a Gantt-style breakdown)
3. Task breakdown by phase with dependencies
4. Resources needed
5. Risk assessment with mitigations
6. Success criteria`;

    const response = await this.generateResponse(
      PROJECT_PLANNING_PROMPT,
      userMessage,
      {
        model: 'gpt-4o',
        temperature: 0.6,
        maxTokens: 5000,
      },
    );

    // Extract milestones/phases
    const milestones = await this.extractMilestones(response);

    const content = this.formatProjectContent(response, description);

    return {
      type: 'project',
      content,
      title: `Project Plan: ${description}`,
      milestones,
      suggestions: [
        'Hold weekly status meetings',
        'Update stakeholders regularly',
        'Track blockers immediately',
      ],
      suggestedTools: this.getToolSuggestions('project timeline task'),
    };
  }

  /**
   * Create a study plan
   */
  private async createStudyPlan(
    description: string,
    duration: string | undefined,
    topics: string[] | undefined,
    context: UserContext,
  ): Promise<PlanResponseDto> {
    const userMessage = `Create a study plan for:
Subject: ${description}
Duration: ${duration || 'flexible'}
Topics to cover: ${topics?.join(', ') || 'comprehensive coverage'}

Please provide:
1. Topics breakdown with time allocation
2. Active learning techniques for each topic
3. Review sessions using spaced repetition
4. Practice/testing time
5. Break schedule
6. Pre-exam preparation tips (if applicable)`;

    const response = await this.generateResponse(
      STUDY_PLANNING_PROMPT,
      userMessage,
      {
        model: 'gpt-4o',
        temperature: 0.6,
        maxTokens: 4000,
      },
    );

    // Extract study milestones
    const milestones = await this.extractMilestones(response);

    // Extract daily study actions
    const dailyActions = await this.extractDailyActions(response);

    const content = this.formatStudyContent(response, description);

    return {
      type: 'study',
      content,
      title: `Study Plan: ${description}`,
      milestones,
      dailyActions,
      suggestions: [
        'Use active recall techniques',
        'Take regular breaks (Pomodoro)',
        'Review material before sleep',
      ],
      suggestedTools: this.getToolSuggestions('study quiz flashcards'),
    };
  }

  /**
   * Create a generic plan
   */
  private async createGenericPlan(
    description: string,
    duration: string | undefined,
    context: UserContext,
  ): Promise<PlanResponseDto> {
    const userMessage = `Create a plan for: ${description}
Duration: ${duration || 'flexible'}

Provide a structured plan with clear steps, timeline, and actionable items.`;

    const response = await this.generateResponse(
      GOAL_PLANNING_PROMPT,
      userMessage,
      {
        model: 'gpt-4o',
        temperature: 0.6,
        maxTokens: 3000,
      },
    );

    return {
      type: 'goals',
      content: response,
      title: `Plan: ${description}`,
      suggestions: ['Review progress regularly', 'Adjust as needed'],
      suggestedTools: this.getToolSuggestions('plan organize'),
    };
  }

  /**
   * Parse schedule data from response
   */
  private async parseScheduleData(response: string): Promise<Record<string, any>> {
    // Simple parsing - in production, use structured output
    return {
      hasSchedule: true,
      parsedAt: new Date().toISOString(),
    };
  }

  /**
   * Extract milestones from plan response
   */
  private async extractMilestones(response: string): Promise<MilestoneDto[]> {
    const prompt = `Extract milestones from this plan. Return as JSON:
{
  "milestones": [
    {
      "title": "Milestone title",
      "description": "What needs to be done",
      "targetDate": "When (relative or absolute)",
      "tasks": ["Task 1", "Task 2"]
    }
  ]
}

Plan:
${response.substring(0, 3000)}`;

    try {
      const milestoneResponse = await this.generateResponse(
        'Extract milestones from the plan.',
        prompt,
        {
          model: 'gpt-4o-mini',
          temperature: 0.3,
          responseFormat: 'json_object',
        },
      );

      const parsed = this.parseJsonResponse<{ milestones: MilestoneDto[] }>(
        milestoneResponse,
        { milestones: [] },
      );

      return parsed.milestones;
    } catch {
      return [];
    }
  }

  /**
   * Extract daily actions from plan response
   */
  private async extractDailyActions(response: string): Promise<string[]> {
    const prompt = `Extract daily actions or habits from this plan. Return as JSON:
{
  "dailyActions": ["Action 1", "Action 2", ...]
}

Plan:
${response.substring(0, 2000)}`;

    try {
      const actionsResponse = await this.generateResponse(
        'Extract daily actions from the plan.',
        prompt,
        {
          model: 'gpt-4o-mini',
          temperature: 0.3,
          responseFormat: 'json_object',
        },
      );

      const parsed = this.parseJsonResponse<{ dailyActions: string[] }>(
        actionsResponse,
        { dailyActions: [] },
      );

      return parsed.dailyActions;
    } catch {
      return [];
    }
  }

  /**
   * Format schedule content
   */
  private formatScheduleContent(response: string, description: string): string {
    let content = `# Your Schedule: ${description}\n\n`;
    content += response;
    content += '\n\n---\n\n';
    content += '**Quick Actions**\n';
    content += '**Add Event** - Schedule something new\n';
    content += '**Set Reminder** - Get notified\n';
    content += '**Adjust Schedule** - Modify this plan\n';
    return content;
  }

  /**
   * Format goal content
   */
  private formatGoalContent(response: string, description: string): string {
    let content = `# Goal Framework: ${description}\n\n`;
    content += response;
    content += '\n\n---\n\n';
    content += '**Track This Goal**\n';
    content += '**Set Milestones** - Add checkpoints\n';
    content += '**Daily Check-in** - Log progress\n';
    return content;
  }

  /**
   * Format project content
   */
  private formatProjectContent(response: string, description: string): string {
    let content = `# Project Plan: ${description}\n\n`;
    content += response;
    content += '\n\n---\n\n';
    content += '**Manage Project**\n';
    content += '**Update Progress** - Mark tasks complete\n';
    content += '**Adjust Timeline** - Modify dates\n';
    content += '**Add Tasks** - New items\n';
    return content;
  }

  /**
   * Format study content
   */
  private formatStudyContent(response: string, description: string): string {
    let content = `# Study Plan: ${description}\n\n`;
    content += response;
    content += '\n\n---\n\n';
    content += '**Study Tools**\n';
    content += '**Flashcard Generator** - Create study cards\n';
    content += '**Practice Quiz** - Test your knowledge\n';
    content += '**Progress Tracker** - Monitor learning\n';
    return content;
  }
}
