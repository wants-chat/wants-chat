/**
 * Models Controller
 * Lists available LLM models. No tier gating, no auth requirement —
 * the OSS build exposes all active models to all users.
 */
import { Controller, Get } from '@nestjs/common';
import { LLMRouterService } from './llm-router.service';

@Controller('models')
export class ModelsController {
  constructor(private readonly llmRouterService: LLMRouterService) {}

  @Get()
  async getModels() {
    const models = this.llmRouterService.getAvailableModels();
    return {
      data: models.map((model: any) => ({
        modelId: model.id,
        displayName: model.name,
        description: model.description,
        provider: model.provider,
        contextWindow: model.contextWindow,
        maxOutputTokens: model.maxOutput,
        costPer1MInput: model.inputPrice,
        costPer1MOutput: model.outputPrice,
        supportsVision: model.supportsVision,
        supportsFunctionCalling: true,
        supportsStreaming: model.supportsStreaming,
        supportsJsonMode: model.supportsJson,
        category: model.category,
        tier: model.tier,
        isDefault: model.isDefault,
        isAccessible: true,
      })),
    };
  }

  @Get('providers')
  async getProviders() {
    const availableProviders = this.llmRouterService.getAvailableProviders();
    const allModels = this.llmRouterService.getAvailableModels();
    const providerNames: Record<string, string> = {
      openrouter: 'OpenRouter',
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      google: 'Google',
      deepseek: 'DeepSeek',
    };
    return {
      data: availableProviders.map((slug: string) => ({
        name: providerNames[slug] || slug,
        slug,
        isActive: true,
        modelCount: allModels.filter((m: any) => m.provider === slug).length,
      })),
    };
  }
}
