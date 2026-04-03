import { Module, Global, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { QueueService } from './queue.service';
import { ResearchProcessor } from './processors/research.processor';
import { BrowserProcessor } from './processors/browser.processor';
import { DocumentProcessor } from './processors/document.processor';
import { DataAnalysisProcessor } from './processors/data-analysis.processor';
import { DataAnalysisModule } from '../data-analysis/data-analysis.module';

@Global()
@Module({
  imports: [
    ConfigModule,
    forwardRef(() => DataAnalysisModule),
    EventEmitterModule.forRoot({
      // Set this to `true` to use wildcards
      wildcard: false,
      // The delimiter used to segment namespaces
      delimiter: '.',
      // Set this to `true` if you want to emit the newListener event
      newListener: false,
      // Set this to `true` if you want to emit the removeListener event
      removeListener: false,
      // The maximum amount of listeners that can be assigned to an event
      maxListeners: 20,
      // Show event name in memory leak message when more than maximum amount of listeners is assigned
      verboseMemoryLeak: true,
      // Disable throwing uncaughtException if an error event is emitted and it has no listeners
      ignoreErrors: false,
    }),
  ],
  providers: [
    QueueService,
    ResearchProcessor,
    BrowserProcessor,
    DocumentProcessor,
    DataAnalysisProcessor,
  ],
  exports: [QueueService],
})
export class QueueModule {}
