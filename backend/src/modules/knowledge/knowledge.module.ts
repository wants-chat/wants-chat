import { Module } from '@nestjs/common';
import { KnowledgeController } from './knowledge.controller';
import { DocumentIngestionService } from './document-ingestion.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [KnowledgeController],
  providers: [DocumentIngestionService],
  exports: [DocumentIngestionService],
})
export class KnowledgeModule {}
