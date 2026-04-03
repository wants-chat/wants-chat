import { Logger } from '@nestjs/common';
import { AiService } from '../../ai/ai.service';

export interface AgentContext {
  userId: string;
  sessionId?: string;
  previousContext?: any;
}

export interface AgentResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    executionTimeMs: number;
    tokensUsed?: number;
    model?: string;
  };
}

export abstract class BaseAnalysisAgent {
  protected readonly logger: Logger;

  constructor(
    protected readonly aiService: AiService,
    agentName: string,
  ) {
    this.logger = new Logger(agentName);
  }

  protected async generateWithAI(
    prompt: string,
    options: {
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
      jsonMode?: boolean;
    } = {},
  ): Promise<string> {
    const startTime = Date.now();

    try {
      const result = await this.aiService.generateText(prompt, {
        systemMessage: options.systemPrompt,
        temperature: options.temperature ?? 0.3,
        maxTokens: options.maxTokens ?? 4000,
        responseFormat: options.jsonMode ? 'json_object' : undefined,
      });

      this.logger.debug(`AI generation took ${Date.now() - startTime}ms`);
      return result;
    } catch (error: any) {
      this.logger.error(`AI generation failed: ${error.message}`);
      throw error;
    }
  }

  protected parseJSONResponse<T>(response: string): T | null {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1].trim());
      }

      // Try direct parse
      return JSON.parse(response);
    } catch (error) {
      this.logger.warn('Failed to parse JSON response, attempting extraction');

      // Try to find JSON object or array in response
      const objectMatch = response.match(/\{[\s\S]*\}/);
      const arrayMatch = response.match(/\[[\s\S]*\]/);

      try {
        if (objectMatch) {
          return JSON.parse(objectMatch[0]);
        }
        if (arrayMatch) {
          return JSON.parse(arrayMatch[0]);
        }
      } catch {
        this.logger.error('Could not extract valid JSON from response');
      }

      return null;
    }
  }

  protected formatNumber(value: number, decimals = 2): string {
    if (Math.abs(value) >= 1e9) {
      return (value / 1e9).toFixed(decimals) + 'B';
    }
    if (Math.abs(value) >= 1e6) {
      return (value / 1e6).toFixed(decimals) + 'M';
    }
    if (Math.abs(value) >= 1e3) {
      return (value / 1e3).toFixed(decimals) + 'K';
    }
    return value.toFixed(decimals);
  }

  protected formatPercentage(value: number, decimals = 1): string {
    return (value * 100).toFixed(decimals) + '%';
  }

  protected calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
  }
}
