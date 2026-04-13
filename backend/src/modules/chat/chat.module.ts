import { Module, forwardRef } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';
import { IntentModule } from '../intent/intent.module';
import { AiModule } from '../ai/ai.module';
import { ContextModule } from '../context/context.module';
import { MemoryModule } from '../memory/memory.module';
// AppMakerModule was excluded from the open-source release. The chat module
// no longer depends on it; the app-builder branch in chat.gateway.ts is stubbed.
// import { AppMakerModule } from '../app-maker/app-maker.module';
import { AppBuilderModule } from '../app-builder/app-builder.module';
import { AppFilesModule } from '../app-files/app-files.module';
import { LearningModule } from '../learning/learning.module';
import { DataAnalysisModule } from '../data-analysis/data-analysis.module';
import { GenerativeUiModule } from '../generative-ui/generative-ui.module';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => IntentModule),
    forwardRef(() => AiModule),
    forwardRef(() => ContextModule),
    MemoryModule,
    // AppMakerModule excluded from open-source release
    AppBuilderModule, // For DeploymentService
    AppFilesModule,
    forwardRef(() => LearningModule),
    forwardRef(() => DataAnalysisModule),
    GenerativeUiModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
