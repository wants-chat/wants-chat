import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataAnalysisController } from './data-analysis.controller';
import { DataAnalysisService } from './data-analysis.service';
import { CSVParser } from './parsers/csv.parser';
import { ExcelParser } from './parsers/excel.parser';
import { StatisticsAnalyzer } from './analyzers/statistics.analyzer';
import { AuthModule } from '../auth/auth.module';
import { AiModule } from '../ai/ai.module';
import { StorageModule } from '../storage/storage.module';
import { DatabaseModule } from '../database/database.module';

// Agents
import { QueryEngineAgent } from './agents/query-engine.agent';
import { ChartBuilderAgent } from './agents/chart-builder.agent';
import { FinanceAnalyzerAgent } from './agents/finance-analyzer.agent';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => AuthModule),
    AiModule,
    StorageModule,
    DatabaseModule,
  ],
  controllers: [DataAnalysisController],
  providers: [
    DataAnalysisService,
    CSVParser,
    ExcelParser,
    StatisticsAnalyzer,
    // Agents
    QueryEngineAgent,
    ChartBuilderAgent,
    FinanceAnalyzerAgent,
  ],
  exports: [
    DataAnalysisService,
    CSVParser,
    ExcelParser,
    StatisticsAnalyzer,
    // Agents
    QueryEngineAgent,
    ChartBuilderAgent,
    FinanceAnalyzerAgent,
  ],
})
export class DataAnalysisModule {}
