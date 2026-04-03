# Priority 4: Data Analysis & Visualization Implementation Plan

## Overview

This document outlines the enhancement of data analysis and visualization features for Wants Chat. **This builds upon existing services** in the codebase rather than creating from scratch.

---

## EXISTING INFRASTRUCTURE (Already Available)

Before implementing, we must acknowledge what's already built:

### Already Implemented Services

| Service | Location | Capabilities |
|---------|----------|--------------|
| **Data Analysis Service** | `src/modules/data-analysis/data-analysis.service.ts` | CSV/Excel parsing, statistics, pattern detection, correlations, outliers, chart data formatting, AI insights |
| **R2 Storage Service** | `src/modules/storage/r2.service.ts` | File upload/download, signed URLs, user-scoped storage |
| **BullMQ Queue** | `src/modules/queue/queue.service.ts` | Job queues with DATA_ANALYSIS type already defined |
| **AI Service** | `src/modules/ai/ai.service.ts` | OpenAI integration, embeddings, chat, vision, usage tracking |
| **Qdrant Vector DB** | `src/modules/qdrant/qdrant.service.ts` | Vector storage, semantic search |
| **Database Service** | `src/modules/database/database.service.ts` | PostgreSQL with pooling, transactions, CRUD |
| **Document Generation** | `src/modules/document/document.service.ts` | PDF/document generation |

### Already Defined Queue Types
```typescript
// In queue.service.ts - DATA_ANALYSIS queue already exists
enum QueueType {
  RESEARCH = 'research-tasks',
  BROWSER_TASKS = 'browser-automation',
  DOCUMENT_GENERATION = 'document-creation',
  DATA_ANALYSIS = 'analysis-jobs',  // <-- Already available
}
```

### Existing Analysis Capabilities
```typescript
// Already in data-analysis.service.ts:
- parseCSV(content) / parseExcel(buffer)
- analyzeData(parsedData) - full statistical analysis
- detectPatterns(columns) - pattern recognition
- calculateCorrelation(col1, col2) - Pearson correlation
- detectOutliers(values) - IQR method
- formatChartData(data, options) - Chart.js compatible
- analyzeWithAI(data, options) - LLM-powered insights
```

---

## What Needs To Be Enhanced (Not Created)

### 1. Extend Data Analysis Controller
Add new endpoints to existing controller for:
- File upload handling
- Dashboard management
- Financial analysis

### 2. Add Analysis Agents (New)
Create specialized agents that use existing services:
- `DataAnalyzerAgent` - Uses existing `DataAnalysisService`
- `QueryEngineAgent` - NEW: NL to SQL translation
- `ChartBuilderAgent` - Extends existing chart formatting
- `FinanceAnalyzerAgent` - NEW: Financial specialization

### 3. Add Database Tables (New)
Create tables for:
- `user_datasets` - Track uploaded files
- `analysis_results` - Cache results
- `saved_charts` - Store chart configs
- `dashboards` - Dashboard layouts

### 4. Extend Chat Gateway Integration
Add `data_analysis` intent handling similar to existing patterns.

---

## Architecture Overview

```
                    WANTS CHAT INTERFACE
                            |
                            v
┌───────────────────────────────────────────────────────────────┐
│                   INTENT CLASSIFICATION                        │
│           (Add 'data_analysis' to existing classifier)        │
└───────────────────────────────────────────────────────────────┘
                            |
                            v
┌───────────────────────────────────────────────────────────────┐
│                ENHANCED DATA ANALYSIS MODULE                   │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  EXISTING SERVICES (Use as-is):                               │
│  ┌──────────────────┐  ┌─────────────────┐                   │
│  │ DataAnalysis     │  │ R2 Storage      │                   │
│  │ Service          │  │ Service         │                   │
│  │ (parsing, stats) │  │ (file storage)  │                   │
│  └──────────────────┘  └─────────────────┘                   │
│                                                                │
│  ┌──────────────────┐  ┌─────────────────┐                   │
│  │ AI Service       │  │ Queue Service   │                   │
│  │ (LLM, insights)  │  │ (async jobs)    │                   │
│  └──────────────────┘  └─────────────────┘                   │
│                                                                │
│  NEW AGENTS (To Build):                                       │
│  ┌──────────────────┐  ┌─────────────────┐                   │
│  │ QueryEngine      │  │ ChartBuilder    │                   │
│  │ Agent (NL→SQL)   │  │ Agent           │                   │
│  └──────────────────┘  └─────────────────┘                   │
│                                                                │
│  ┌──────────────────┐  ┌─────────────────┐                   │
│  │ FinanceAnalyzer  │  │ ReportGenerator │                   │
│  │ Agent            │  │ (extend doc svc)│                   │
│  └──────────────────┘  └─────────────────┘                   │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

---

## Module Structure

Extend existing `data-analysis` module:

```
data-analysis/                          # EXISTING MODULE
├── data-analysis.module.ts             # UPDATE: Add new providers
├── data-analysis.service.ts            # KEEP: Already has parsing/stats
├── data-analysis.controller.ts         # UPDATE: Add new endpoints
├── agents/                             # NEW FOLDER
│   ├── base-analysis.agent.ts          # New: Base class
│   ├── query-engine.agent.ts           # New: NL to SQL
│   ├── chart-builder.agent.ts          # New: Uses existing formatChartData
│   └── finance-analyzer.agent.ts       # New: Financial specialization
├── dto/                                # EXTEND
│   ├── analysis.dto.ts                 # Update: Add new DTOs
│   ├── query.dto.ts                    # New
│   ├── chart.dto.ts                    # New
│   └── dashboard.dto.ts                # New
├── processors/                         # NEW FOLDER
│   └── analysis.processor.ts           # BullMQ processor for DATA_ANALYSIS queue
└── prompts/                            # NEW FOLDER
    └── analysis.prompts.ts             # LLM prompts
```

---

## Implementation Tasks

### Phase 1: Database & File Handling (1-2 days)

**Task 1.1: Create Database Tables**
```sql
-- User datasets (track uploaded files in R2)
CREATE TABLE user_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  original_filename VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL,  -- 'csv', 'xlsx', 'json'
  file_size BIGINT NOT NULL,
  r2_key VARCHAR(1000) NOT NULL,   -- R2 storage key
  row_count INTEGER,
  column_count INTEGER,
  columns JSONB,                    -- Column definitions
  data_profile JSONB,              -- Stats from existing service
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis results cache
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dataset_id UUID REFERENCES user_datasets(id) ON DELETE CASCADE,
  analysis_type VARCHAR(100) NOT NULL,
  parameters JSONB,
  results JSONB NOT NULL,
  insights JSONB,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved charts
CREATE TABLE saved_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dataset_id UUID REFERENCES user_datasets(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  chart_type VARCHAR(50) NOT NULL,
  config JSONB NOT NULL,
  data_snapshot JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboards
CREATE TABLE dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  layout JSONB NOT NULL,
  chart_ids UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Task 1.2: Extend Controller for File Upload**
```typescript
// In data-analysis.controller.ts - ADD these endpoints

@Post('datasets/upload')
@UseInterceptors(FileInterceptor('file'))
async uploadDataset(
  @UploadedFile() file: Express.Multer.File,
  @Body() dto: UploadDatasetDto,
  @CurrentUser() user: User,
) {
  // 1. Upload to R2 using existing R2Service
  const r2Key = await this.r2Service.upload(file, user.id, 'datasets');

  // 2. Parse using existing DataAnalysisService
  const parsed = file.mimetype.includes('csv')
    ? await this.dataAnalysisService.parseCSV(file.buffer.toString())
    : await this.dataAnalysisService.parseExcel(file.buffer);

  // 3. Analyze using existing service
  const profile = await this.dataAnalysisService.analyzeData(parsed);

  // 4. Queue detailed analysis using existing queue
  await this.queueService.addJob(QueueType.DATA_ANALYSIS, {
    type: 'full-profile',
    datasetId: savedDataset.id,
    userId: user.id,
  });

  return savedDataset;
}
```

### Phase 2: Query Engine Agent (2-3 days)

**Task 2.1: Create NL to SQL Agent**
```typescript
// agents/query-engine.agent.ts
@Injectable()
export class QueryEngineAgent {
  constructor(
    private readonly aiService: AIService,  // EXISTING
    private readonly dbService: DatabaseService,  // EXISTING
  ) {}

  async translateToSQL(
    naturalLanguage: string,
    schema: ColumnSchema[],
  ): Promise<{ sql: string; explanation: string }> {
    const prompt = this.buildSQLPrompt(naturalLanguage, schema);
    const response = await this.aiService.generateText({ prompt });
    return this.parseSQLResponse(response);
  }

  async executeQuery(sql: string): Promise<QueryResult> {
    // Validate SQL is read-only
    this.validateReadOnly(sql);
    return await this.dbService.query(sql);
  }
}
```

### Phase 3: Chart Builder Enhancement (1-2 days)

**Task 3.1: Extend Chart Building**
```typescript
// agents/chart-builder.agent.ts
@Injectable()
export class ChartBuilderAgent {
  constructor(
    private readonly dataAnalysisService: DataAnalysisService,  // EXISTING
    private readonly aiService: AIService,  // EXISTING
    private readonly r2Service: R2Service,  // EXISTING
  ) {}

  async suggestCharts(data: any[]): Promise<ChartSuggestion[]> {
    // Use AI to suggest best chart types
    const analysis = await this.dataAnalysisService.analyzeData(data);
    return this.generateSuggestions(analysis);
  }

  async buildChart(config: ChartConfig): Promise<ChartOutput> {
    // Use existing formatChartData method
    const chartData = this.dataAnalysisService.formatChartData(
      config.data,
      { type: config.type, groupBy: config.groupBy }
    );
    return { type: config.type, data: chartData };
  }

  async exportChart(chartId: string, format: 'png' | 'svg'): Promise<string> {
    // Render and upload to R2
    const imageBuffer = await this.renderChart(chartId, format);
    return await this.r2Service.uploadBuffer(imageBuffer, 'chart-exports');
  }
}
```

### Phase 4: Finance Analyzer (2 days)

**Task 4.1: Create Financial Analysis Agent**
```typescript
// agents/finance-analyzer.agent.ts
@Injectable()
export class FinanceAnalyzerAgent {
  constructor(
    private readonly dataAnalysisService: DataAnalysisService,  // EXISTING
    private readonly aiService: AIService,  // EXISTING
  ) {}

  async analyzePnL(data: any[]): Promise<PnLAnalysis> {
    // Use existing statistics methods
    const stats = await this.dataAnalysisService.analyzeData(data);
    return this.buildPnLReport(stats);
  }

  async calculateRatios(financialData: FinancialData): Promise<FinancialRatios> {
    return {
      liquidity: this.calculateLiquidityRatios(financialData),
      profitability: this.calculateProfitabilityRatios(financialData),
      leverage: this.calculateLeverageRatios(financialData),
    };
  }

  async generateForecast(
    historicalData: any[],
    periods: number,
  ): Promise<ForecastResult> {
    // Use AI for forecast generation
    const insights = await this.aiService.generateText({
      prompt: this.buildForecastPrompt(historicalData, periods),
    });
    return this.parseForecastResponse(insights);
  }
}
```

### Phase 5: Chat Gateway Integration (1 day)

**Task 5.1: Add Intent Handling**
```typescript
// In chat.gateway.ts - ADD to processMessageWithIntent

} else if (
  pattern?.category === 'data_analysis' ||
  intentResult.uiConfig?.metadata?.category === 'data_analysis'
) {
  const analysisType = pattern?.metadata?.analysisType || 'general';

  const result = await this.dataAnalysisService.handleChatRequest({
    type: analysisType,
    query: message,
    userId: session.userId,
    attachments: message.attachments,
  });

  return this.formatAnalysisResponse(result, analysisType);
}
```

**Task 5.2: Update Intent Patterns**
```typescript
// In intent patterns - ADD these patterns
{
  category: 'data_analysis',
  patterns: [
    'analyze this (data|file|spreadsheet|csv|excel)',
    'show me (stats|statistics|analysis) for',
    'create a (chart|graph|dashboard) from',
    'what are the (trends|patterns|insights) in',
    'calculate (financial|ratios|forecast)',
    'compare (budget|actual|period)',
  ],
  metadata: {
    analysisType: 'auto-detect',
  },
}
```

### Phase 6: BullMQ Processor (1 day)

**Task 6.1: Create Analysis Processor**
```typescript
// processors/analysis.processor.ts
@Processor(QueueType.DATA_ANALYSIS)
export class AnalysisProcessor {
  constructor(
    private readonly dataAnalysisService: DataAnalysisService,
    private readonly r2Service: R2Service,
    private readonly dbService: DatabaseService,
  ) {}

  @Process('full-profile')
  async handleFullProfile(job: Job) {
    const { datasetId, userId } = job.data;

    // 1. Get file from R2
    const dataset = await this.dbService.findOne('user_datasets', { id: datasetId });
    const fileBuffer = await this.r2Service.download(dataset.r2_key);

    // 2. Parse and analyze using existing service
    const parsed = await this.dataAnalysisService.parseExcel(fileBuffer);
    const analysis = await this.dataAnalysisService.analyzeData(parsed);
    const insights = await this.dataAnalysisService.analyzeWithAI(parsed, {});

    // 3. Store results
    await this.dbService.insert('analysis_results', {
      user_id: userId,
      dataset_id: datasetId,
      analysis_type: 'full-profile',
      results: analysis,
      insights: insights,
    });

    // 4. Update dataset status
    await this.dbService.update('user_datasets',
      { id: datasetId },
      { status: 'ready', data_profile: analysis }
    );
  }
}
```

---

## API Endpoints (Add to Existing Controller)

### Dataset Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/data-analysis/datasets/upload` | Upload file to R2 |
| `GET` | `/api/data-analysis/datasets` | List user's datasets |
| `GET` | `/api/data-analysis/datasets/:id` | Get dataset with profile |
| `DELETE` | `/api/data-analysis/datasets/:id` | Delete from R2 and DB |

### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/data-analysis/query` | Execute NL query |
| `POST` | `/api/data-analysis/insights` | Generate AI insights |
| `GET` | `/api/data-analysis/results/:id` | Get cached results |

### Charts & Dashboards
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/data-analysis/charts` | Create chart |
| `GET` | `/api/data-analysis/charts` | List charts |
| `POST` | `/api/data-analysis/dashboards` | Create dashboard |
| `GET` | `/api/data-analysis/dashboards` | List dashboards |

### Financial
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/data-analysis/finance/analyze` | Financial analysis |
| `POST` | `/api/data-analysis/finance/forecast` | Generate forecast |

---

## Technology Stack (Using Existing)

### Reuse Existing
| Component | Service | Already At |
|-----------|---------|------------|
| File Storage | R2Service | `src/modules/storage/r2.service.ts` |
| Job Queue | QueueService | `src/modules/queue/queue.service.ts` |
| LLM Integration | AIService | `src/modules/ai/ai.service.ts` |
| Database | DatabaseService | `src/modules/database/database.service.ts` |
| Data Parsing | DataAnalysisService | `src/modules/data-analysis/data-analysis.service.ts` |
| Vector Search | QdrantService | `src/modules/qdrant/qdrant.service.ts` |

### Add New (NPM Packages)
| Package | Purpose | Notes |
|---------|---------|-------|
| `echarts` | Chart rendering | Server-side with node-canvas |
| `node-canvas` | Canvas for charts | Already may be installed |
| `simple-statistics` | Advanced stats | If needed beyond existing |

---

## Implementation Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1 | 1-2 days | Database tables, file upload to R2 |
| Phase 2 | 2-3 days | Query Engine Agent (NL to SQL) |
| Phase 3 | 1-2 days | Chart Builder Agent |
| Phase 4 | 2 days | Finance Analyzer Agent |
| Phase 5 | 1 day | Chat Gateway integration |
| Phase 6 | 1 day | BullMQ processor |
| **Total** | **8-11 days** | Full implementation |

---

## Key Principles

1. **Reuse First**: Always check if existing service has the capability
2. **Extend Don't Duplicate**: Add methods to existing services when possible
3. **Follow Patterns**: Use same DI patterns as other modules
4. **Queue Heavy Work**: Use existing BullMQ for processing
5. **Store in R2**: All files go through R2Service
6. **Cache Results**: Store analysis in PostgreSQL for reuse

---

*Document Version: 2.0*
*Last Updated: January 2025*
*Key Change: Refactored to leverage existing infrastructure*
