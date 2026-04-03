import { Module } from '@nestjs/common';
import { ToolSearchService } from './tool-search.service';
import { ToolSearchController } from './tool-search.controller';
import { QdrantModule } from '../qdrant/qdrant.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [QdrantModule, AiModule],
  controllers: [ToolSearchController],
  providers: [ToolSearchService],
  exports: [ToolSearchService],
})
export class ToolSearchModule {}
