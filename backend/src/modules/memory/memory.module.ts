import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MemoryService } from './memory.service';
import { MemoryController, CustomInstructionsController } from './memory.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { AiMemoryExtractorService } from './ai-memory-extractor.service';

@Module({
  imports: [DatabaseModule, AuthModule, ConfigModule],
  controllers: [MemoryController, CustomInstructionsController],
  providers: [MemoryService, AiMemoryExtractorService],
  exports: [MemoryService, AiMemoryExtractorService],
})
export class MemoryModule {}
