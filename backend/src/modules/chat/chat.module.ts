import { Module, forwardRef } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';
import { IntentModule } from '../intent/intent.module';
import { AiModule } from '../ai/ai.module';
import { ContextModule } from '../context/context.module';
import { MemoryModule } from '../memory/memory.module';
// import { AppCreatorModule } from '../app-creator/app-creator.module'; // Commented out — replaced by AppMakerModule
import { AppMakerModule } from '../app-maker/app-maker.module';
import { AppBuilderModule } from '../app-builder/app-builder.module';
import { AppFilesModule } from '../app-files/app-files.module';
import { LearningModule } from '../learning/learning.module';
import { DataAnalysisModule } from '../data-analysis/data-analysis.module';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => IntentModule),
    forwardRef(() => AiModule),
    forwardRef(() => ContextModule),
    MemoryModule,
    // AppCreatorModule, // Commented out — replaced by AppMakerModule
    AppMakerModule,
    AppBuilderModule, // For DeploymentService
    AppFilesModule,
    forwardRef(() => LearningModule),
    forwardRef(() => DataAnalysisModule),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
