import { Module, forwardRef } from '@nestjs/common';
import { ContextController } from './context.controller';
import { BranchingController } from './branching.controller';
import { ContextService } from './context.service';
import { ChatExtractionService } from './chat-extraction.service';
import { ContextBuilderService } from './context-builder.service';
import { CompactionService } from './compaction.service';
import { BranchingService } from './branching.service';
import { ToolIntentExtractionService } from './tool-intent-extraction.service';
import { IntentClassificationService } from './intent-classification.service';
import { DatabaseModule } from '../database/database.module';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { MemoryModule } from '../memory/memory.module';
import { ToolSearchModule } from '../tool-search/tool-search.module';
import { PluginsModule } from '../plugins/plugins.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AiModule), AuthModule, MemoryModule, ToolSearchModule, PluginsModule],
  controllers: [ContextController, BranchingController],
  providers: [
    ContextService,
    ChatExtractionService,
    ContextBuilderService,
    CompactionService,
    BranchingService,
    ToolIntentExtractionService,
    IntentClassificationService,
  ],
  exports: [
    ContextService,
    ChatExtractionService,
    ContextBuilderService,
    CompactionService,
    BranchingService,
    ToolIntentExtractionService,
    IntentClassificationService,
  ],
})
export class ContextModule {}
