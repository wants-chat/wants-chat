import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Worker, Job, ConnectionOptions } from 'bullmq';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  QUEUE_NAMES,
  DATA_ANALYSIS_JOB_TYPES,
  QUEUE_EVENTS,
  DEFAULT_WORKER_OPTIONS,
  REDIS_CONNECTION_OPTIONS,
  DataAnalysisJobData,
  DataAnalysisJobResult,
} from '../queue.constants';
import { QueryEngineAgent } from '../../data-analysis/agents/query-engine.agent';
import { ChartBuilderAgent } from '../../data-analysis/agents/chart-builder.agent';
import { FinanceAnalyzerAgent } from '../../data-analysis/agents/finance-analyzer.agent';
import { DataAnalysisService } from '../../data-analysis/data-analysis.service';

interface DataRow {
  [key: string]: any;
}

interface StatisticalResult {
  count: number;
  sum: number;
  mean: number;
  min: number;
  max: number;
  stdDev: number;
  median: number;
}

@Injectable()
export class DataAnalysisProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DataAnalysisProcessor.name);
  private worker: Worker;
  private connectionConfig: ConnectionOptions;
  private readonly outputDir: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => QueryEngineAgent))
    private readonly queryEngineAgent: QueryEngineAgent,
    @Inject(forwardRef(() => ChartBuilderAgent))
    private readonly chartBuilderAgent: ChartBuilderAgent,
    @Inject(forwardRef(() => FinanceAnalyzerAgent))
    private readonly financeAnalyzerAgent: FinanceAnalyzerAgent,
    @Inject(forwardRef(() => DataAnalysisService))
    private readonly dataAnalysisService: DataAnalysisService,
  ) {
    this.outputDir = this.configService.get<string>(
      'DATA_OUTPUT_DIR',
      '/tmp/data-analysis',
    );
  }

  async onModuleInit(): Promise<void> {
    const redisHost = this.configService.get<string>('REDIS_HOST');
    if (!redisHost) {
      this.logger.warn('REDIS_HOST not configured - data analysis processor disabled');
      return;
    }
    // Initialize in background to not block app startup
    this.ensureOutputDir().then(() => {
      this.initializeWorker().then(() => {
        this.logger.log('Data Analysis processor initialized');
      }).catch(err => {
        this.logger.error('Failed to initialize data analysis processor:', err.message);
      });
    }).catch(err => {
      this.logger.error('Failed to create output directory:', err.message);
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.logger.log('Data Analysis worker closed');
    }
  }

  private async ensureOutputDir(): Promise<void> {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      this.logger.debug(`Output directory ensured: ${this.outputDir}`);
    } catch (error) {
      this.logger.error(`Failed to create output directory: ${error.message}`);
    }
  }

  private async initializeWorker(): Promise<void> {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');
    const db = this.configService.get<number>('REDIS_DB', 0);

    this.connectionConfig = {
      host,
      port,
      password: password || undefined,
      db,
      ...REDIS_CONNECTION_OPTIONS,
    };

    this.worker = new Worker<DataAnalysisJobData, DataAnalysisJobResult>(
      QUEUE_NAMES.DATA_ANALYSIS,
      async (job) => this.processJob(job),
      {
        connection: this.connectionConfig,
        concurrency: DEFAULT_WORKER_OPTIONS.concurrency,
        limiter: DEFAULT_WORKER_OPTIONS.limiter,
      },
    );

    this.setupWorkerEvents();
  }

  private setupWorkerEvents(): void {
    this.worker.on('completed', (job, result) => {
      this.logger.log(`Data Analysis job ${job.id} completed`);
      this.eventEmitter.emit(QUEUE_EVENTS.JOB_COMPLETED, {
        queue: QUEUE_NAMES.DATA_ANALYSIS,
        jobId: job.id,
        result,
      });
    });

    this.worker.on('failed', (job, error) => {
      this.logger.error(`Data Analysis job ${job?.id} failed: ${error.message}`);
      this.eventEmitter.emit(QUEUE_EVENTS.JOB_FAILED, {
        queue: QUEUE_NAMES.DATA_ANALYSIS,
        jobId: job?.id,
        error: error.message,
      });
    });

    this.worker.on('progress', (job, progress) => {
      this.logger.debug(`Data Analysis job ${job.id} progress: ${JSON.stringify(progress)}`);
    });

    this.worker.on('error', (error) => {
      this.logger.error(`Data Analysis worker error: ${error.message}`);
    });

    this.worker.on('stalled', (jobId) => {
      this.logger.warn(`Data Analysis job ${jobId} stalled`);
    });
  }

  private async processJob(
    job: Job<DataAnalysisJobData>,
  ): Promise<DataAnalysisJobResult> {
    const startTime = Date.now();
    this.logger.log(`Processing data analysis job ${job.id}: ${job.data.type}`);

    try {
      // Check for cancellation
      const progress = job.progress as any;
      if (progress?.cancelled) {
        return {
          success: false,
          error: 'Job was cancelled',
          duration: Date.now() - startTime,
        };
      }

      await job.updateProgress({ status: 'starting', percentage: 0 });

      let result: DataAnalysisJobResult;

      switch (job.data.type) {
        case DATA_ANALYSIS_JOB_TYPES.CSV_ANALYSIS:
          result = await this.handleCsvAnalysis(job);
          break;
        case DATA_ANALYSIS_JOB_TYPES.JSON_TRANSFORM:
          result = await this.handleJsonTransform(job);
          break;
        case DATA_ANALYSIS_JOB_TYPES.STATISTICAL_ANALYSIS:
          result = await this.handleStatisticalAnalysis(job);
          break;
        case DATA_ANALYSIS_JOB_TYPES.DATA_VISUALIZATION:
          result = await this.handleDataVisualization(job);
          break;
        case DATA_ANALYSIS_JOB_TYPES.DATA_CLEANING:
          result = await this.handleDataCleaning(job);
          break;
        case DATA_ANALYSIS_JOB_TYPES.AGGREGATION:
          result = await this.handleAggregation(job);
          break;
        // Agent-based job types
        case DATA_ANALYSIS_JOB_TYPES.NL_TO_SQL:
          result = await this.handleNLToSQL(job);
          break;
        case DATA_ANALYSIS_JOB_TYPES.CHART_BUILDER:
          result = await this.handleChartBuilder(job);
          break;
        case DATA_ANALYSIS_JOB_TYPES.FINANCIAL_ANALYSIS:
          result = await this.handleFinancialAnalysis(job);
          break;
        case DATA_ANALYSIS_JOB_TYPES.DATA_SUMMARY:
          result = await this.handleDataSummary(job);
          break;
        default:
          throw new Error(`Unknown data analysis job type: ${job.data.type}`);
      }

      await job.updateProgress({ status: 'completed', percentage: 100 });

      return {
        ...result,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error(
        `Data Analysis job ${job.id} error: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  // =============================================
  // JOB HANDLERS
  // =============================================

  private async handleCsvAnalysis(
    job: Job<DataAnalysisJobData>,
  ): Promise<DataAnalysisJobResult> {
    await job.updateProgress({ status: 'loading_data', percentage: 10 });

    const { inputPath, inputData } = job.data;
    let data: DataRow[] = [];

    if (inputPath) {
      const content = await fs.readFile(inputPath, 'utf-8');
      data = this.parseCsv(content);
    } else if (inputData && Array.isArray(inputData)) {
      data = inputData;
    } else {
      throw new Error('No input data provided');
    }

    await job.updateProgress({ status: 'analyzing', percentage: 40 });

    // Analyze CSV structure
    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    const rowCount = data.length;

    // Analyze each column
    const columnStats: Record<string, any> = {};
    for (const column of columns) {
      const values = data.map((row) => row[column]);
      columnStats[column] = this.analyzeColumn(values);
    }

    await job.updateProgress({ status: 'generating_report', percentage: 80 });

    return {
      success: true,
      output: {
        columns,
        rowCount,
        columnStats,
        preview: data.slice(0, 5),
      },
      statistics: {
        totalRows: rowCount,
        totalColumns: columns.length,
      },
    };
  }

  private async handleJsonTransform(
    job: Job<DataAnalysisJobData>,
  ): Promise<DataAnalysisJobResult> {
    await job.updateProgress({ status: 'loading_data', percentage: 10 });

    const { inputData, operations, outputFormat } = job.data;

    if (!inputData) {
      throw new Error('No input data provided');
    }

    await job.updateProgress({ status: 'transforming', percentage: 30 });

    let result = inputData;

    if (operations && Array.isArray(operations)) {
      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];
        result = this.applyTransformation(result, operation);

        const progress = 30 + ((i + 1) / operations.length) * 50;
        await job.updateProgress({
          status: 'transforming',
          percentage: progress,
          operationsCompleted: i + 1,
          totalOperations: operations.length,
        });
      }
    }

    await job.updateProgress({ status: 'finalizing', percentage: 90 });

    // Convert to output format if specified
    let output = result;
    if (outputFormat === 'csv' && Array.isArray(result)) {
      output = this.convertToCsv(result);
    }

    return {
      success: true,
      output,
      metadata: {
        operationsApplied: operations?.length || 0,
        outputFormat: outputFormat || 'json',
      },
    };
  }

  private async handleStatisticalAnalysis(
    job: Job<DataAnalysisJobData>,
  ): Promise<DataAnalysisJobResult> {
    await job.updateProgress({ status: 'loading_data', percentage: 10 });

    const { inputData } = job.data;

    if (!inputData || !Array.isArray(inputData)) {
      throw new Error('Input data must be an array');
    }

    await job.updateProgress({ status: 'computing_statistics', percentage: 30 });

    const data = inputData as DataRow[];
    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    const numericColumns = columns.filter((col) =>
      data.some((row) => typeof row[col] === 'number'),
    );

    const statistics: Record<string, StatisticalResult> = {};

    for (let i = 0; i < numericColumns.length; i++) {
      const column = numericColumns[i];
      const values = data
        .map((row) => row[column])
        .filter((v) => typeof v === 'number') as number[];

      statistics[column] = this.computeStatistics(values);

      const progress = 30 + ((i + 1) / numericColumns.length) * 50;
      await job.updateProgress({
        status: 'computing_statistics',
        percentage: progress,
        columnsProcessed: i + 1,
      });
    }

    await job.updateProgress({ status: 'generating_report', percentage: 90 });

    // Compute correlations for numeric columns
    const correlations = this.computeCorrelations(data, numericColumns);

    return {
      success: true,
      output: {
        statistics,
        correlations,
        summary: {
          totalRows: data.length,
          numericColumns: numericColumns.length,
          categoricalColumns: columns.length - numericColumns.length,
        },
      },
      statistics: {
        columnsAnalyzed: numericColumns.length,
        rowsProcessed: data.length,
      },
    };
  }

  private async handleDataVisualization(
    job: Job<DataAnalysisJobData>,
  ): Promise<DataAnalysisJobResult> {
    await job.updateProgress({ status: 'preparing_data', percentage: 10 });

    const { inputData, operations } = job.data;

    if (!inputData) {
      throw new Error('No input data provided');
    }

    await job.updateProgress({ status: 'generating_visualizations', percentage: 40 });

    // TODO: Implement actual visualization using a charting library
    // For now, generate visualization specifications

    const visualizations: string[] = [];
    const data = Array.isArray(inputData) ? inputData : [inputData];

    // Generate chart specifications based on data
    if (data.length > 0 && typeof data[0] === 'object') {
      const columns = Object.keys(data[0]);
      const numericColumns = columns.filter((col) =>
        data.some((row: any) => typeof row[col] === 'number'),
      );

      // Bar chart for first numeric column
      if (numericColumns.length > 0) {
        visualizations.push(
          JSON.stringify({
            type: 'bar',
            data: {
              labels: data.map((_: any, i: number) => `Item ${i + 1}`),
              datasets: numericColumns.slice(0, 3).map((col) => ({
                label: col,
                data: data.map((row: any) => row[col]),
              })),
            },
          }),
        );
      }

      // Pie chart for categorical data
      const categoricalColumns = columns.filter((col) =>
        data.every((row: any) => typeof row[col] === 'string'),
      );
      if (categoricalColumns.length > 0) {
        const col = categoricalColumns[0];
        const counts: Record<string, number> = {};
        data.forEach((row: any) => {
          counts[row[col]] = (counts[row[col]] || 0) + 1;
        });
        visualizations.push(
          JSON.stringify({
            type: 'pie',
            data: {
              labels: Object.keys(counts),
              datasets: [{ data: Object.values(counts) }],
            },
          }),
        );
      }
    }

    await job.updateProgress({ status: 'finalizing', percentage: 90 });

    return {
      success: true,
      output: {
        visualizations,
        chartCount: visualizations.length,
      },
      visualizations,
      metadata: {
        generatedAt: new Date().toISOString(),
        note: 'Visualization specifications - render with Chart.js or similar',
      },
    };
  }

  private async handleDataCleaning(
    job: Job<DataAnalysisJobData>,
  ): Promise<DataAnalysisJobResult> {
    await job.updateProgress({ status: 'loading_data', percentage: 10 });

    const { inputData, operations } = job.data;

    if (!inputData || !Array.isArray(inputData)) {
      throw new Error('Input data must be an array');
    }

    await job.updateProgress({ status: 'cleaning_data', percentage: 30 });

    let cleanedData = [...inputData] as DataRow[];
    const cleaningReport = {
      originalRows: inputData.length,
      removedDuplicates: 0,
      nullsRemoved: 0,
      typesConverted: 0,
      outliersTreated: 0,
    };

    // Remove duplicates
    const uniqueKeys = new Set<string>();
    cleanedData = cleanedData.filter((row) => {
      const key = JSON.stringify(row);
      if (uniqueKeys.has(key)) {
        cleaningReport.removedDuplicates++;
        return false;
      }
      uniqueKeys.add(key);
      return true;
    });

    await job.updateProgress({ status: 'handling_nulls', percentage: 50 });

    // Handle null/undefined values
    cleanedData = cleanedData.map((row) => {
      const cleanedRow: DataRow = {};
      for (const [key, value] of Object.entries(row)) {
        if (value === null || value === undefined || value === '') {
          cleaningReport.nullsRemoved++;
          // Replace with default based on type inference
          cleanedRow[key] = typeof value === 'number' ? 0 : '';
        } else {
          cleanedRow[key] = value;
        }
      }
      return cleanedRow;
    });

    await job.updateProgress({ status: 'normalizing_types', percentage: 70 });

    // Normalize data types
    if (cleanedData.length > 0) {
      const columns = Object.keys(cleanedData[0]);
      for (const column of columns) {
        const sampleValues = cleanedData
          .slice(0, 100)
          .map((row) => row[column])
          .filter((v) => v !== null && v !== undefined);

        // Check if column should be numeric
        const numericValues = sampleValues.filter(
          (v) => !isNaN(parseFloat(String(v))),
        );
        if (numericValues.length > sampleValues.length * 0.8) {
          cleanedData = cleanedData.map((row) => {
            const parsed = parseFloat(String(row[column]));
            if (!isNaN(parsed) && row[column] !== parsed) {
              cleaningReport.typesConverted++;
              return { ...row, [column]: parsed };
            }
            return row;
          });
        }
      }
    }

    await job.updateProgress({ status: 'finalizing', percentage: 90 });

    return {
      success: true,
      output: cleanedData,
      statistics: {
        originalRows: cleaningReport.originalRows,
        cleanedRows: cleanedData.length,
        duplicatesRemoved: cleaningReport.removedDuplicates,
        nullsHandled: cleaningReport.nullsRemoved,
      },
      metadata: {
        cleaningReport,
      },
    };
  }

  private async handleAggregation(
    job: Job<DataAnalysisJobData>,
  ): Promise<DataAnalysisJobResult> {
    await job.updateProgress({ status: 'loading_data', percentage: 10 });

    const { inputData, operations } = job.data;

    if (!inputData || !Array.isArray(inputData)) {
      throw new Error('Input data must be an array');
    }

    await job.updateProgress({ status: 'aggregating', percentage: 30 });

    const data = inputData as DataRow[];
    const aggregateConfig = operations?.[0]?.params || {};
    const groupBy = aggregateConfig.groupBy as string | undefined;
    const aggregations = aggregateConfig.aggregations as
      | Array<{ field: string; operation: string }>
      | undefined;

    let result: any;

    if (groupBy) {
      // Group-by aggregation
      const groups: Record<string, DataRow[]> = {};
      data.forEach((row) => {
        const key = String(row[groupBy] || 'null');
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(row);
      });

      await job.updateProgress({ status: 'computing_aggregates', percentage: 60 });

      result = Object.entries(groups).map(([key, rows]) => {
        const aggregatedRow: DataRow = { [groupBy]: key };

        if (aggregations) {
          for (const agg of aggregations) {
            const values = rows
              .map((r) => r[agg.field])
              .filter((v) => typeof v === 'number') as number[];

            switch (agg.operation) {
              case 'sum':
                aggregatedRow[`${agg.field}_sum`] = values.reduce(
                  (a, b) => a + b,
                  0,
                );
                break;
              case 'avg':
              case 'mean':
                aggregatedRow[`${agg.field}_avg`] =
                  values.length > 0
                    ? values.reduce((a, b) => a + b, 0) / values.length
                    : 0;
                break;
              case 'min':
                aggregatedRow[`${agg.field}_min`] =
                  values.length > 0 ? Math.min(...values) : 0;
                break;
              case 'max':
                aggregatedRow[`${agg.field}_max`] =
                  values.length > 0 ? Math.max(...values) : 0;
                break;
              case 'count':
                aggregatedRow[`${agg.field}_count`] = rows.length;
                break;
            }
          }
        }

        aggregatedRow._count = rows.length;
        return aggregatedRow;
      });
    } else {
      // Global aggregation
      result = {};
      if (aggregations) {
        for (const agg of aggregations) {
          const values = data
            .map((r) => r[agg.field])
            .filter((v) => typeof v === 'number') as number[];

          switch (agg.operation) {
            case 'sum':
              result[`${agg.field}_sum`] = values.reduce((a, b) => a + b, 0);
              break;
            case 'avg':
            case 'mean':
              result[`${agg.field}_avg`] =
                values.length > 0
                  ? values.reduce((a, b) => a + b, 0) / values.length
                  : 0;
              break;
            case 'min':
              result[`${agg.field}_min`] =
                values.length > 0 ? Math.min(...values) : 0;
              break;
            case 'max':
              result[`${agg.field}_max`] =
                values.length > 0 ? Math.max(...values) : 0;
              break;
            case 'count':
              result[`${agg.field}_count`] = data.length;
              break;
          }
        }
      }
      result._totalCount = data.length;
    }

    await job.updateProgress({ status: 'finalizing', percentage: 90 });

    return {
      success: true,
      output: result,
      statistics: {
        inputRows: data.length,
        outputRows: Array.isArray(result) ? result.length : 1,
        groupsCreated: groupBy ? Object.keys(result).length : 0,
      },
    };
  }

  // =============================================
  // AGENT-BASED JOB HANDLERS
  // =============================================

  private async handleNLToSQL(
    job: Job<DataAnalysisJobData>,
  ): Promise<DataAnalysisJobResult> {
    await job.updateProgress({ status: 'processing_query', percentage: 10 });

    const { query, schema, tableName, inputData } = job.data;

    if (!query) {
      throw new Error('No query provided for NL-to-SQL conversion');
    }

    await job.updateProgress({ status: 'generating_sql', percentage: 30 });

    // Use schema from job data or infer from inputData
    type ColumnType = 'string' | 'number' | 'date' | 'boolean';
    let dataSchema: Array<{ name: string; type: ColumnType }> | undefined = schema as Array<{ name: string; type: ColumnType }>;

    if (!dataSchema && inputData && Array.isArray(inputData) && inputData.length > 0) {
      dataSchema = Object.keys(inputData[0]).map((name) => ({
        name,
        type: (typeof inputData[0][name] === 'number' ? 'number' : 'string') as ColumnType,
      }));
    }

    if (!dataSchema) {
      throw new Error('No schema provided and could not infer from input data');
    }

    const result = await this.queryEngineAgent.translateToSQL(
      query,
      dataSchema,
      { tableName: tableName || 'data', maxRows: 1000 },
    );

    await job.updateProgress({ status: 'finalizing', percentage: 90 });

    return {
      success: result.success,
      output: {
        sql: result.data?.sql,
        explanation: result.data?.explanation,
        suggestedVisualizations: result.data?.suggestedVisualizations,
      },
      error: result.error,
      metadata: result.metadata,
    };
  }

  private async handleChartBuilder(
    job: Job<DataAnalysisJobData>,
  ): Promise<DataAnalysisJobResult> {
    await job.updateProgress({ status: 'analyzing_data', percentage: 10 });

    const { inputData, chartConfig, query } = job.data;

    if (!inputData || !Array.isArray(inputData)) {
      throw new Error('Input data must be an array for chart building');
    }

    await job.updateProgress({ status: 'suggesting_charts', percentage: 30 });

    // Infer columns from data
    const columns = inputData.length > 0
      ? Object.keys(inputData[0]).map((name) => ({
          name,
          type: typeof inputData[0][name] === 'number' ? 'number' : 'string',
        }))
      : [];

    // Get chart suggestions
    const suggestions = await this.chartBuilderAgent.suggestCharts(
      inputData,
      columns,
      query || 'Visualize this data',
    );

    await job.updateProgress({ status: 'building_chart', percentage: 60 });

    // Build chart data for the first suggestion or provided config
    let chartData = null;
    if (suggestions.success && suggestions.data && suggestions.data.length > 0) {
      const suggestion = chartConfig?.chartType
        ? suggestions.data.find((s) => s.chartType === chartConfig.chartType) || suggestions.data[0]
        : suggestions.data[0];

      const buildResult = this.chartBuilderAgent.buildChartData({
        type: suggestion.chartType,
        title: suggestion.title,
        data: inputData,
        xAxis: chartConfig?.xAxis || suggestion.xAxis,
        yAxis: chartConfig?.yAxis || suggestion.yAxis,
        series: chartConfig?.series || suggestion.series,
        groupBy: chartConfig?.groupBy,
        aggregation: suggestion.aggregation,
      });

      if (buildResult.success) {
        chartData = buildResult.data;
      }
    }

    await job.updateProgress({ status: 'finalizing', percentage: 90 });

    return {
      success: true,
      output: {
        suggestions: suggestions.data,
        chartData,
        options: chartData
          ? this.chartBuilderAgent.generateChartOptions(
              suggestions.data?.[0]?.chartType || 'bar',
              suggestions.data?.[0]?.title || 'Chart',
            )
          : null,
      },
      visualizations: chartData ? [JSON.stringify(chartData)] : [],
      metadata: suggestions.metadata,
    };
  }

  private async handleFinancialAnalysis(
    job: Job<DataAnalysisJobData>,
  ): Promise<DataAnalysisJobResult> {
    await job.updateProgress({ status: 'loading_financial_data', percentage: 10 });

    const { inputData, financialOptions } = job.data;

    if (!inputData || !Array.isArray(inputData)) {
      throw new Error('Input data must be an array for financial analysis');
    }

    await job.updateProgress({ status: 'analyzing_pnl', percentage: 30 });

    // Perform P&L analysis
    const pnlResult = await this.financeAnalyzerAgent.analyzePnL(inputData, {
      period: financialOptions?.period,
    });

    let ratios = null;
    if (financialOptions?.includeRatios && pnlResult.success && pnlResult.data) {
      await job.updateProgress({ status: 'calculating_ratios', percentage: 50 });
      // Calculate net income from revenue - costs
      const netIncome = pnlResult.data.revenue.total - pnlResult.data.costs.total;
      const ratiosResult = this.financeAnalyzerAgent.calculateRatios({
        revenue: pnlResult.data.revenue.total,
        cogs: pnlResult.data.costs.cogs || 0,
        operatingExpenses: pnlResult.data.costs.operating || 0,
        netIncome: netIncome,
        totalAssets: (inputData[0] as any)?.totalAssets || 0,
        totalLiabilities: (inputData[0] as any)?.totalLiabilities || 0,
        totalEquity: (inputData[0] as any)?.equity || (inputData[0] as any)?.totalEquity || 0,
      });
      if (ratiosResult.success) {
        ratios = ratiosResult.data;
      }
    }

    let forecast = null;
    if (financialOptions?.includeForecasting && pnlResult.success) {
      await job.updateProgress({ status: 'generating_forecast', percentage: 70 });
      // Extract revenue time series for forecasting
      const revenueData = inputData
        .filter((row: any) => row.revenue !== undefined && row.period !== undefined)
        .map((row: any) => ({
          period: row.period as string,
          value: row.revenue as number,
        }));

      if (revenueData.length > 3) {
        const forecastResult = await this.financeAnalyzerAgent.generateForecast(
          revenueData,
          3,
          { method: 'linear' },
        );
        if (forecastResult.success) {
          forecast = forecastResult.data;
        }
      }
    }

    await job.updateProgress({ status: 'finalizing', percentage: 90 });

    return {
      success: pnlResult.success,
      output: {
        pnl: pnlResult.data,
        ratios,
        forecast,
      },
      error: pnlResult.error,
      metadata: pnlResult.metadata,
    };
  }

  private async handleDataSummary(
    job: Job<DataAnalysisJobData>,
  ): Promise<DataAnalysisJobResult> {
    await job.updateProgress({ status: 'loading_data', percentage: 10 });

    const { inputData } = job.data;

    if (!inputData || !Array.isArray(inputData)) {
      throw new Error('Input data must be an array for data summary');
    }

    await job.updateProgress({ status: 'analyzing', percentage: 40 });

    // Use the data analysis service for summarization
    const columns = inputData.length > 0 ? Object.keys(inputData[0]) : [];
    const summaryResult = await this.dataAnalysisService.summarizeData({
      data: inputData,
      columns,
    });

    await job.updateProgress({ status: 'finalizing', percentage: 90 });

    return {
      success: true,
      output: summaryResult,
      statistics: {
        rowCount: summaryResult.rowCount,
        columnCount: summaryResult.columnCount,
        dataQualityScore: summaryResult.dataQualityScore || 0,
      },
    };
  }

  // =============================================
  // UTILITIES
  // =============================================

  private parseCsv(content: string): DataRow[] {
    const lines = content.trim().split('\n');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
    const rows: DataRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''));
      const row: DataRow = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        // Try to parse as number
        const num = parseFloat(value);
        row[header] = isNaN(num) ? value : num;
      });

      rows.push(row);
    }

    return rows;
  }

  private convertToCsv(data: DataRow[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const lines = [headers.join(',')];

    for (const row of data) {
      const values = headers.map((h) => {
        const value = row[h];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return String(value ?? '');
      });
      lines.push(values.join(','));
    }

    return lines.join('\n');
  }

  private analyzeColumn(values: any[]): any {
    const nonNull = values.filter((v) => v !== null && v !== undefined);
    const types = new Set(nonNull.map((v) => typeof v));

    const analysis: any = {
      count: values.length,
      nonNullCount: nonNull.length,
      nullCount: values.length - nonNull.length,
      types: Array.from(types),
    };

    if (types.has('number')) {
      const numbers = nonNull.filter((v) => typeof v === 'number') as number[];
      if (numbers.length > 0) {
        analysis.numeric = this.computeStatistics(numbers);
      }
    }

    if (types.has('string')) {
      const strings = nonNull.filter((v) => typeof v === 'string') as string[];
      const unique = new Set(strings);
      analysis.categorical = {
        uniqueCount: unique.size,
        topValues: this.getTopValues(strings, 5),
      };
    }

    return analysis;
  }

  private computeStatistics(values: number[]): StatisticalResult {
    if (values.length === 0) {
      return {
        count: 0,
        sum: 0,
        mean: 0,
        min: 0,
        max: 0,
        stdDev: 0,
        median: 0,
      };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;

    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];

    return {
      count: values.length,
      sum,
      mean,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      stdDev,
      median,
    };
  }

  private computeCorrelations(
    data: DataRow[],
    numericColumns: string[],
  ): Record<string, Record<string, number>> {
    const correlations: Record<string, Record<string, number>> = {};

    for (const col1 of numericColumns) {
      correlations[col1] = {};
      for (const col2 of numericColumns) {
        if (col1 === col2) {
          correlations[col1][col2] = 1;
        } else {
          const values1 = data.map((r) => r[col1]).filter((v) => typeof v === 'number') as number[];
          const values2 = data.map((r) => r[col2]).filter((v) => typeof v === 'number') as number[];
          correlations[col1][col2] = this.pearsonCorrelation(values1, values2);
        }
      }
    }

    return correlations;
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
    const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
    const sumXY = x.slice(0, n).reduce((acc, val, i) => acc + val * y[i], 0);
    const sumX2 = x.slice(0, n).reduce((acc, val) => acc + val * val, 0);
    const sumY2 = y.slice(0, n).reduce((acc, val) => acc + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
    );

    if (denominator === 0) return 0;
    return numerator / denominator;
  }

  private getTopValues(
    values: string[],
    limit: number,
  ): Array<{ value: string; count: number }> {
    const counts: Record<string, number> = {};
    values.forEach((v) => {
      counts[v] = (counts[v] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([value, count]) => ({ value, count }));
  }

  private applyTransformation(data: any, operation: { type: string; params?: Record<string, any> }): any {
    const { type, params = {} } = operation;

    switch (type) {
      case 'filter':
        if (Array.isArray(data) && params.field && params.operator && params.value !== undefined) {
          return data.filter((row: any) => {
            const fieldValue = row[params.field];
            switch (params.operator) {
              case '=':
              case '==':
                return fieldValue == params.value;
              case '===':
                return fieldValue === params.value;
              case '>':
                return fieldValue > params.value;
              case '>=':
                return fieldValue >= params.value;
              case '<':
                return fieldValue < params.value;
              case '<=':
                return fieldValue <= params.value;
              case '!=':
                return fieldValue != params.value;
              case 'contains':
                return String(fieldValue).includes(String(params.value));
              default:
                return true;
            }
          });
        }
        break;

      case 'map':
        if (Array.isArray(data) && params.fields) {
          return data.map((row: any) => {
            const mapped: any = {};
            for (const field of params.fields) {
              mapped[field] = row[field];
            }
            return mapped;
          });
        }
        break;

      case 'sort':
        if (Array.isArray(data) && params.field) {
          const direction = params.direction === 'desc' ? -1 : 1;
          return [...data].sort((a: any, b: any) => {
            if (a[params.field] < b[params.field]) return -1 * direction;
            if (a[params.field] > b[params.field]) return 1 * direction;
            return 0;
          });
        }
        break;

      case 'limit':
        if (Array.isArray(data) && params.count) {
          return data.slice(0, params.count);
        }
        break;

      case 'rename':
        if (Array.isArray(data) && params.mappings) {
          return data.map((row: any) => {
            const renamed: any = { ...row };
            for (const [oldName, newName] of Object.entries(params.mappings)) {
              if (oldName in renamed) {
                renamed[newName as string] = renamed[oldName];
                delete renamed[oldName];
              }
            }
            return renamed;
          });
        }
        break;
    }

    return data;
  }
}
