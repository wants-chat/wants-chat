import { Module, forwardRef } from '@nestjs/common';
import { KnowledgeController } from './knowledge.controller';
import { DocumentIngestionService } from './document-ingestion.service';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { QdrantModule } from '../qdrant/qdrant.module';
import { AiModule } from '../ai/ai.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [AuthModule, DatabaseModule, QdrantModule, forwardRef(() => AiModule), StorageModule],
  controllers: [KnowledgeController],
  providers: [DocumentIngestionService],
  exports: [DocumentIngestionService],
})
export class KnowledgeModule {}
