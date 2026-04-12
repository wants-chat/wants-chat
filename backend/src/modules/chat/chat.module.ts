import { Module, forwardRef } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatFileService } from './chat-file.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';
import { IntentModule } from '../intent/intent.module';
import { AiModule } from '../ai/ai.module';
import { ContextModule } from '../context/context.module';
import { MemoryModule } from '../memory/memory.module';
import { StorageModule } from '../storage/storage.module';
// AppMakerModule was excluded from the open-source release. The chat module
// no longer depends on it; the app-builder branch in chat.gateway.ts is stubbed.
// import { AppMakerModule } from '../app-maker/app-maker.module';
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
    StorageModule,
    MulterModule.register({
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }),
    // AppMakerModule excluded from open-source release
    AppBuilderModule, // For DeploymentService
    AppFilesModule,
    forwardRef(() => LearningModule),
    forwardRef(() => DataAnalysisModule),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatFileService, ChatGateway],
  exports: [ChatService, ChatFileService, ChatGateway],
})
export class ChatModule {}
