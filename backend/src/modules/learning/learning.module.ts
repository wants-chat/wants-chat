import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';
import { TutorAgent } from './agents/tutor.agent';
import { SummarizerAgent } from './agents/summarizer.agent';
import { PlannerAgent } from './agents/planner.agent';
import { WriterAgent } from './agents/writer.agent';
import { AiModule } from '../ai/ai.module';
import { MemoryModule } from '../memory/memory.module';

@Module({
  imports: [
    ConfigModule,
    AiModule,
    MemoryModule,
  ],
  controllers: [LearningController],
  providers: [
    LearningService,
    TutorAgent,
    SummarizerAgent,
    PlannerAgent,
    WriterAgent,
  ],
  exports: [LearningService],
})
export class LearningModule {}
