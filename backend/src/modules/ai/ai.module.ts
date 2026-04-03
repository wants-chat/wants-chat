import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { AiService } from './ai.service';
import { ImageAIService } from './image-ai.service';
import { VideoAIService } from './video-ai.service';
import { TextAIService } from './text-ai.service';
import { AIGenerationController } from './ai-generation.controller';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ContentModule } from '../content/content.module';
import { StorageModule } from '../storage/storage.module';

// LLM Orchestration & Billing
import { DynamicLLMConfigService } from './llm/dynamic-config';
import { LLMRouterService } from './llm/llm-router.service';
import { CreditsService } from './llm/credits.service';
import { MediaCreditsService } from './llm/media-credits.service';
import { BillingController } from './llm/billing.controller';
import { AutoModelSelectorService } from './llm/auto-model-selector.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 300000, // 5 minutes for AI operations
      maxRedirects: 5,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN', '7d') },
      }),
      inject: [ConfigService],
    }),
    ContentModule,
    StorageModule,
  ],
  controllers: [AIGenerationController, BillingController],
  providers: [
    AiService,
    ImageAIService,
    VideoAIService,
    TextAIService,
    DynamicLLMConfigService,
    LLMRouterService,
    CreditsService,
    MediaCreditsService,
    AutoModelSelectorService,
    AuthGuard,
  ],
  exports: [
    AiService,
    ImageAIService,
    VideoAIService,
    TextAIService,
    DynamicLLMConfigService,
    LLMRouterService,
    CreditsService,
    MediaCreditsService,
    AutoModelSelectorService,
  ],
})
export class AiModule {}
