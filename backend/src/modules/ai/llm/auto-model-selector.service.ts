import { Injectable, Logger } from '@nestjs/common';
import { DynamicLLMConfigService, DynamicModelConfig } from './dynamic-config';
import { ModelTier, ModelSelectionStrategy } from './types';
// NOTE: Tier-based model access removed for OSS. All active models are available to all users.

interface TaskAnalysis {
  taskType: TaskType;
  complexity: 'simple' | 'medium' | 'complex';
  needsVision: boolean;
  needsReasoning: boolean;
  needsCode: boolean;
  estimatedOutputTokens: number;
  keywords: string[];
}

type TaskType =
  | 'simple_chat'      // General conversation, greetings
  | 'code'             // Code generation, debugging
  | 'reasoning'        // Math, logic, complex analysis
  | 'creative'         // Writing, brainstorming
  | 'vision'           // Image analysis
  | 'summarization'    // Summarize content
  | 'translation'      // Language translation
  | 'data_analysis'    // Data processing, JSON
  | 'technical'        // Technical explanations
  | 'unknown';         // Fallback

// Task type patterns
const TASK_PATTERNS: Record<TaskType, RegExp[]> = {
  code: [
    /\b(code|coding|program|function|class|debug|fix|bug|error|compile|syntax|refactor)\b/i,
    /\b(python|javascript|typescript|java|c\+\+|rust|go|ruby|php|swift|kotlin)\b/i,
    /\b(api|rest|graphql|database|sql|query|backend|frontend|fullstack)\b/i,
    /```[\s\S]*```/,
    /\b(npm|pip|yarn|cargo|maven|gradle)\b/i,
  ],
  reasoning: [
    /\b(calculate|solve|prove|derive|analyze|compare|evaluate|reason)\b/i,
    /\b(math|equation|formula|algorithm|logic|theorem|hypothesis)\b/i,
    /\b(why|how does|explain the logic|step by step)\b/i,
    /\d+\s*[\+\-\*\/\^]\s*\d+/,
    /\b(probability|statistics|regression|correlation)\b/i,
  ],
  creative: [
    /\b(write|create|compose|generate|draft|story|poem|script|essay)\b/i,
    /\b(creative|artistic|imaginative|original|unique)\b/i,
    /\b(blog|article|content|copy|marketing|slogan|tagline)\b/i,
    /\b(character|plot|narrative|dialogue|scene)\b/i,
  ],
  vision: [
    /\b(image|picture|photo|screenshot|diagram|chart|graph)\b/i,
    /\b(see|look|analyze|describe|identify|recognize)\b/i,
    /\b(visual|ocr|scan|read from)\b/i,
  ],
  summarization: [
    /\b(summarize|summary|tldr|brief|condense|shorten)\b/i,
    /\b(key points|main ideas|highlights|overview)\b/i,
  ],
  translation: [
    /\b(translate|translation|convert to|in \w+ language)\b/i,
    /\b(spanish|french|german|chinese|japanese|korean|arabic|hindi|portuguese)\b/i,
  ],
  data_analysis: [
    /\b(json|csv|data|dataset|table|spreadsheet)\b/i,
    /\b(parse|extract|transform|process|filter|aggregate)\b/i,
    /\b(format|structure|schema|fields|columns)\b/i,
  ],
  technical: [
    /\b(explain|how does|what is|documentation|architecture)\b/i,
    /\b(system|infrastructure|cloud|devops|docker|kubernetes)\b/i,
    /\b(security|authentication|encryption|protocol)\b/i,
  ],
  simple_chat: [
    /^(hi|hello|hey|thanks|thank you|ok|okay|yes|no|bye|goodbye)[\s!?.]*$/i,
    /\b(how are you|what's up|nice to meet you)\b/i,
  ],
  unknown: [],
};

// Model recommendations by task type
const TASK_MODEL_RECOMMENDATIONS: Record<TaskType, string[]> = {
  code: [
    'deepseek/deepseek-chat',     // Great for code, very cheap ($0.14/M in, $0.28/M out)
    'openai/gpt-4o-mini',         // Affordable fallback ($0.15/M in, $0.60/M out)
    'google/gemini-2.0-flash',    // Fast & free tier available
  ],
  reasoning: [
    'openai/o1',                   // Best reasoning
    'openai/o1-mini',              // Reasoning, more affordable
    'deepseek/deepseek-reasoner',  // Reasoning, cost-effective
    'anthropic/claude-3.5-sonnet', // Strong reasoning
  ],
  creative: [
    'anthropic/claude-3.5-sonnet', // Excellent writing
    'openai/gpt-4o',              // Creative, versatile
    'google/gemini-2.0-flash',    // Good creative output
  ],
  vision: [
    'openai/gpt-4o',              // Best vision
    'anthropic/claude-3.5-sonnet', // Good vision
    'google/gemini-2.0-flash',    // Vision capable
  ],
  summarization: [
    'openai/gpt-4o-mini',         // Fast, cheap
    'anthropic/claude-3.5-haiku', // Fast, good quality
    'google/gemini-2.0-flash',    // Long context
  ],
  translation: [
    'openai/gpt-4o',              // Excellent multilingual
    'google/gemini-2.0-flash',    // Good multilingual
    'anthropic/claude-3.5-sonnet', // Strong multilingual
  ],
  data_analysis: [
    'openai/gpt-4o',              // Great with structured data
    'anthropic/claude-3.5-sonnet', // Good data processing
    'openai/gpt-4o-mini',         // Cost-effective
  ],
  technical: [
    'openai/gpt-4o',              // Comprehensive knowledge
    'anthropic/claude-3.5-sonnet', // Deep technical understanding
    'google/gemini-1.5-pro',      // Long context for docs
  ],
  simple_chat: [
    'openai/gpt-4o-mini',         // Fast, cheap
    'anthropic/claude-3.5-haiku', // Fast, good quality
    'google/gemini-2.0-flash',    // Fast, affordable
  ],
  unknown: [
    'openai/gpt-4o-mini',         // Good default
    'openai/gpt-4o',              // Quality fallback
  ],
};

@Injectable()
export class AutoModelSelectorService {
  private readonly logger = new Logger(AutoModelSelectorService.name);

  constructor(private readonly dynamicConfig: DynamicLLMConfigService) {}

  /**
   * Select the best model based on strategy and task
   */
  selectModel(
    message: string,
    strategy: ModelSelectionStrategy,
    userTier: ModelTier = 'standard',
    hasImages: boolean = false,
  ): { model: DynamicModelConfig; reason: string } {
    // Analyze the task
    const analysis = this.analyzeTask(message, hasImages);

    this.logger.debug(
      `Task analysis: type=${analysis.taskType}, complexity=${analysis.complexity}, ` +
      `needsVision=${analysis.needsVision}, needsReasoning=${analysis.needsReasoning}`,
    );

    // Select based on strategy
    switch (strategy) {
      case 'user_selected':
        // Return default if user didn't select anything
        return {
          model: this.dynamicConfig.getDefaultModel(),
          reason: 'Using default model (no specific selection)',
        };

      case 'cost_optimized':
        return this.selectCheapestCapable(analysis, userTier);

      case 'quality_first':
        return this.selectBestQuality(analysis, userTier);

      case 'speed_first':
        return this.selectFastest(analysis, userTier);

      case 'auto':
      default:
        return this.selectAuto(analysis, userTier);
    }
  }

  /**
   * Analyze the task to determine type and requirements
   */
  private analyzeTask(message: string, hasImages: boolean): TaskAnalysis {
    const taskType = this.detectTaskType(message);
    const complexity = this.estimateComplexity(message);

    return {
      taskType,
      complexity,
      needsVision: hasImages || this.matchesPatterns(message, TASK_PATTERNS.vision),
      needsReasoning: this.matchesPatterns(message, TASK_PATTERNS.reasoning),
      needsCode: this.matchesPatterns(message, TASK_PATTERNS.code),
      estimatedOutputTokens: this.estimateOutputTokens(message, taskType),
      keywords: this.extractKeywords(message),
    };
  }

  /**
   * Detect the primary task type
   */
  private detectTaskType(message: string): TaskType {
    // Check each task type pattern
    for (const [type, patterns] of Object.entries(TASK_PATTERNS)) {
      if (type === 'unknown') continue;
      if (this.matchesPatterns(message, patterns)) {
        return type as TaskType;
      }
    }
    return 'unknown';
  }

  /**
   * Check if message matches any patterns
   */
  private matchesPatterns(message: string, patterns: RegExp[]): boolean {
    return patterns.some((pattern) => pattern.test(message));
  }

  /**
   * Estimate complexity based on message length and structure
   */
  private estimateComplexity(message: string): 'simple' | 'medium' | 'complex' {
    const wordCount = message.split(/\s+/).length;
    const hasCodeBlocks = /```[\s\S]*```/.test(message);
    const hasMultipleQuestions = (message.match(/\?/g) || []).length > 2;

    if (wordCount > 500 || hasCodeBlocks || hasMultipleQuestions) {
      return 'complex';
    }
    if (wordCount > 50) {
      return 'medium';
    }
    return 'simple';
  }

  /**
   * Estimate expected output tokens
   */
  private estimateOutputTokens(message: string, taskType: TaskType): number {
    const baseEstimates: Record<TaskType, number> = {
      simple_chat: 100,
      code: 1000,
      reasoning: 1500,
      creative: 1000,
      vision: 500,
      summarization: 300,
      translation: 200,
      data_analysis: 800,
      technical: 800,
      unknown: 500,
    };
    return baseEstimates[taskType] || 500;
  }

  /**
   * Extract keywords from message
   */
  private extractKeywords(message: string): string[] {
    const words = message.toLowerCase().split(/\s+/);
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'must', 'shall',
      'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in',
      'for', 'on', 'with', 'at', 'by', 'from', 'as', 'i', 'me',
      'my', 'myself', 'we', 'our', 'you', 'your', 'he', 'she',
      'it', 'they', 'them', 'what', 'which', 'who', 'when', 'where',
      'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
      'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
      'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and',
      'but', 'if', 'or', 'because', 'as', 'until', 'while', 'about',
    ]);

    return words
      .filter((w) => w.length > 3 && !stopWords.has(w))
      .slice(0, 10);
  }

  /**
   * Select cheapest model that can handle the task
   */
  private selectCheapestCapable(
    analysis: TaskAnalysis,
    userTier: ModelTier,
  ): { model: DynamicModelConfig; reason: string } {
    const allModels = this.dynamicConfig.getAllModels();

    // Get recommended models for this task
    const recommendations = TASK_MODEL_RECOMMENDATIONS[analysis.taskType];

    // Filter to allowed tiers and active models
    let candidates = allModels
      .filter((m: any) => m.isActive)
      .filter((m: any) => !analysis.needsVision || m.supportsVision);

    // Prefer recommended models if available
    const recommendedCandidates = candidates.filter((m) =>
      recommendations.includes(m.id),
    );
    if (recommendedCandidates.length > 0) {
      candidates = recommendedCandidates;
    }

    // Sort by cost (lowest first)
    candidates.sort((a, b) => {
      const costA = a.inputPrice + a.outputPrice;
      const costB = b.inputPrice + b.outputPrice;
      return costA - costB;
    });

    const selected = candidates[0] || this.dynamicConfig.getDefaultModel();
    return {
      model: selected,
      reason: `Cheapest model for ${analysis.taskType} task`,
    };
  }

  /**
   * Select best quality model for the task
   */
  private selectBestQuality(
    analysis: TaskAnalysis,
    userTier: ModelTier,
  ): { model: DynamicModelConfig; reason: string } {
    const allModels = this.dynamicConfig.getAllModels();

    // Get recommended models for this task (first is best)
    const recommendations = TASK_MODEL_RECOMMENDATIONS[analysis.taskType];

    // Find best accessible recommendation
    for (const modelId of recommendations) {
      const model = allModels.find(
        (m) =>
          m.id === modelId &&
          m.isActive &&
          (!analysis.needsVision || m.supportsVision),
      );
      if (model) {
        return {
          model,
          reason: `Best quality model for ${analysis.taskType}`,
        };
      }
    }

    // Fallback to default
    return {
      model: this.dynamicConfig.getDefaultModel(),
      reason: 'Best available model for your tier',
    };
  }

  /**
   * Select fastest model for the task
   */
  private selectFastest(
    analysis: TaskAnalysis,
    userTier: ModelTier,
  ): { model: DynamicModelConfig; reason: string } {
    const allModels = this.dynamicConfig.getAllModels();

    // Fast models (prioritize mini/flash models)
    const fastModels = [
      'openai/gpt-4o-mini',
      'anthropic/claude-3.5-haiku',
      'google/gemini-2.0-flash',
      'google/gemini-2.0-flash-lite',
    ];

    // Filter to allowed tiers
    for (const modelId of fastModels) {
      const model = allModels.find(
        (m) =>
          m.id === modelId &&
          m.isActive &&
          (!analysis.needsVision || m.supportsVision),
      );
      if (model) {
        return {
          model,
          reason: 'Fastest available model',
        };
      }
    }

    return {
      model: this.dynamicConfig.getDefaultModel(),
      reason: 'Fastest available model for your tier',
    };
  }

  /**
   * Auto-select best model considering all factors
   */
  private selectAuto(
    analysis: TaskAnalysis,
    userTier: ModelTier,
  ): { model: DynamicModelConfig; reason: string } {
    // For simple tasks, prioritize speed/cost
    if (analysis.complexity === 'simple') {
      return this.selectCheapestCapable(analysis, userTier);
    }

    // For reasoning tasks, prioritize quality
    if (analysis.needsReasoning || analysis.taskType === 'reasoning') {
      return this.selectBestQuality(analysis, userTier);
    }

    // For code tasks, use recommended code models
    if (analysis.needsCode || analysis.taskType === 'code') {
      const result = this.selectBestQuality(analysis, userTier);
      return {
        ...result,
        reason: `Best code model: ${result.model.name}`,
      };
    }

    // For complex tasks, use quality-first
    if (analysis.complexity === 'complex') {
      return this.selectBestQuality(analysis, userTier);
    }

    // Default: balanced selection (good quality at reasonable cost)
    const allModels = this.dynamicConfig.getAllModels();

    // Balanced models - good quality, reasonable cost
    const balancedModels = [
      'openai/gpt-4o-mini',         // Great balance
      'anthropic/claude-3.5-sonnet', // High quality
      'openai/gpt-4o',              // Premium
    ];

    for (const modelId of balancedModels) {
      const model = allModels.find(
        (m) =>
          m.id === modelId &&
          m.isActive &&
          (!analysis.needsVision || m.supportsVision),
      );
      if (model) {
        return {
          model,
          reason: `Auto-selected for ${analysis.taskType} (${analysis.complexity} complexity)`,
        };
      }
    }

    return {
      model: this.dynamicConfig.getDefaultModel(),
      reason: 'Auto-selected default model',
    };
  }

  /**
   * Get task type for a message (exposed for debugging/UI)
   */
  getTaskType(message: string): TaskType {
    return this.detectTaskType(message);
  }

  /**
   * Get all available strategies
   */
  getAvailableStrategies(): { id: ModelSelectionStrategy; name: string; description: string }[] {
    return [
      {
        id: 'auto',
        name: 'Auto',
        description: 'Smart model selection based on your message',
      },
      {
        id: 'cost_optimized',
        name: 'Cost Optimized',
        description: 'Cheapest model that can handle your task',
      },
      {
        id: 'quality_first',
        name: 'Quality First',
        description: 'Best quality model for your tier',
      },
      {
        id: 'speed_first',
        name: 'Speed First',
        description: 'Fastest model available',
      },
    ];
  }
}
