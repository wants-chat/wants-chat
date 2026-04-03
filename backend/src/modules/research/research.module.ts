import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

// Controllers
import { ResearchController } from './research.controller';

// Services
import { ResearchService } from './research.service';

// Gateway
import { ResearchGateway } from './research.gateway';

// Workflow
import { ResearchGraph } from './workflow/research-graph';

// Tools
import {
  TavilySearchTool,
  ExaSearchTool,
  BraveSearchTool,
  SearchAggregatorService,
} from './tools/search.tool';
import {
  JinaReaderTool,
  ContentExtractorTool,
} from './tools/extractor.tool';

// Dependencies
import { DatabaseModule } from '../database/database.module';
import { AiModule } from '../ai/ai.module';
import { QdrantModule } from '../qdrant/qdrant.module';
import { WebModule } from '../web/web.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    DatabaseModule,
    forwardRef(() => AiModule),
    QdrantModule,
    forwardRef(() => WebModule),
    AuthModule,
  ],
  controllers: [ResearchController],
  providers: [
    // Main service
    ResearchService,

    // WebSocket gateway
    ResearchGateway,

    // Workflow engine
    ResearchGraph,

    // Search tools
    TavilySearchTool,
    ExaSearchTool,
    BraveSearchTool,
    SearchAggregatorService,

    // Extraction tools
    JinaReaderTool,
    ContentExtractorTool,
  ],
  exports: [
    ResearchService,
    ResearchGateway,
    SearchAggregatorService,
    ContentExtractorTool,
  ],
})
export class ResearchModule {}
