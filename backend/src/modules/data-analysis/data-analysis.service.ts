import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { CSVParser } from './parsers/csv.parser';
import { ExcelParser } from './parsers/excel.parser';
import { StatisticsAnalyzer } from './analyzers/statistics.analyzer';
import {
  ParseOptionsDto,
  ParsedDataResponseDto,
  AnalyzeDataDto,
  AnalysisResponseDto,
  GenerateChartDataDto,
  ChartDataResponseDto,
  ChartType,
  AggregateDataDto,
  AggregationResponseDto,
  DetectPatternsDto,
  PatternDetectionResponseDto,
  SummarizeDataDto,
  DataSummaryResponseDto,
} from './dto/data-analysis.dto';

@Injectable()
export class DataAnalysisService {
  private readonly logger = new Logger(DataAnalysisService.name);

  // Chart color palettes
  private readonly colorPalettes = {
    default: [
      'rgba(59, 130, 246, 0.8)', // Blue
      'rgba(16, 185, 129, 0.8)', // Green
      'rgba(245, 158, 11, 0.8)', // Amber
      'rgba(239, 68, 68, 0.8)', // Red
      'rgba(139, 92, 246, 0.8)', // Purple
      'rgba(236, 72, 153, 0.8)', // Pink
      'rgba(20, 184, 166, 0.8)', // Teal
      'rgba(249, 115, 22, 0.8)', // Orange
    ],
    border: [
      'rgba(59, 130, 246, 1)',
      'rgba(16, 185, 129, 1)',
      'rgba(245, 158, 11, 1)',
      'rgba(239, 68, 68, 1)',
      'rgba(139, 92, 246, 1)',
      'rgba(236, 72, 153, 1)',
      'rgba(20, 184, 166, 1)',
      'rgba(249, 115, 22, 1)',
    ],
  };

  constructor(
    private readonly aiService: AiService,
    private readonly csvParser: CSVParser,
    private readonly excelParser: ExcelParser,
    private readonly statisticsAnalyzer: StatisticsAnalyzer,
  ) {}

  /**
   * Parse CSV data from string or buffer
   */
  parseCSV(input: string | Buffer, options: ParseOptionsDto = {}): ParsedDataResponseDto {
    this.logger.log('Parsing CSV data');
    return this.csvParser.parse(input, options);
  }

  /**
   * Parse Excel data from buffer
   */
  async parseExcel(buffer: Buffer, options: ParseOptionsDto = {}): Promise<ParsedDataResponseDto> {
    this.logger.log('Parsing Excel data');

    if (!this.excelParser.isAvailable()) {
      throw new BadRequestException(
        'Excel parsing is not available. Please install the xlsx package: npm install xlsx',
      );
    }

    return this.excelParser.parse(buffer, options);
  }

  /**
   * Analyze data using AI
   */
  async analyzeData(dto: AnalyzeDataDto): Promise<AnalysisResponseDto> {
    const { data, query, columns, context } = dto;
    this.logger.log(`Analyzing data with query: "${query}"`);

    if (!data || data.length === 0) {
      throw new BadRequestException('No data provided for analysis');
    }

    // Prepare data summary for AI
    const targetColumns = columns || Object.keys(data[0]);
    const dataSummary = this.prepareDataSummaryForAI(data, targetColumns);

    // Create prompt for AI
    const systemMessage = `You are a data analyst expert. Analyze the provided data and answer the user's query.
Be specific, provide insights, and suggest actionable recommendations when relevant.
When providing analysis:
1. Start with a direct answer to the query
2. Support with relevant statistics from the data
3. Identify any notable patterns or anomalies
4. Suggest follow-up analyses if relevant

Respond in JSON format with the following structure:
{
  "analysis": "Your detailed analysis text",
  "insights": ["Key insight 1", "Key insight 2", ...],
  "suggestedCharts": ["bar", "line", ...] (optional, valid types: bar, line, pie, scatter, area, histogram),
  "followUpQuestions": ["Question 1", "Question 2", ...] (optional),
  "statistics": { ... } (optional, any computed statistics)
}`;

    const userPrompt = `${context ? `Context: ${context}\n\n` : ''}Data Summary:
${dataSummary}

Sample Data (first ${Math.min(10, data.length)} rows):
${JSON.stringify(data.slice(0, 10), null, 2)}

Query: ${query}`;

    try {
      const aiResponse = await this.aiService.generateText(userPrompt, {
        systemMessage,
        responseFormat: 'json_object',
        temperature: 0.3,
      });

      const parsed = JSON.parse(aiResponse);

      return {
        analysis: parsed.analysis || 'Analysis completed.',
        insights: parsed.insights || [],
        suggestedCharts: parsed.suggestedCharts?.filter((c: string) =>
          Object.values(ChartType).includes(c as ChartType),
        ) as ChartType[],
        followUpQuestions: parsed.followUpQuestions,
        statistics: parsed.statistics,
      };
    } catch (error: any) {
      this.logger.error(`AI analysis failed: ${error.message}`);
      throw new BadRequestException(`Analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate chart data from dataset
   */
  generateChartData(dto: GenerateChartDataDto): ChartDataResponseDto {
    const { data, chartType, xColumn, yColumns, groupBy, title, limit, sortOrder } = dto;
    this.logger.log(`Generating ${chartType} chart data`);

    if (!data || data.length === 0) {
      throw new BadRequestException('No data provided for chart generation');
    }

    let processedData = [...data];

    // Limit data if specified
    if (limit && limit > 0) {
      processedData = processedData.slice(0, limit);
    }

    switch (chartType) {
      case ChartType.BAR:
      case ChartType.LINE:
      case ChartType.AREA:
        return this.generateCategoryChart(processedData, chartType, xColumn, yColumns, sortOrder);

      case ChartType.PIE:
        return this.generatePieChart(processedData, xColumn, yColumns?.[0]);

      case ChartType.SCATTER:
        return this.generateScatterChart(processedData, xColumn, yColumns);

      case ChartType.HISTOGRAM:
        return this.generateHistogram(processedData, yColumns?.[0] || xColumn);

      case ChartType.HEATMAP:
        return this.generateHeatmapData(processedData, xColumn, yColumns?.[0], groupBy);

      case ChartType.BUBBLE:
        return this.generateBubbleChart(processedData, xColumn, yColumns);

      case ChartType.RADAR:
        return this.generateRadarChart(processedData, xColumn, yColumns);

      case ChartType.TREEMAP:
        return this.generateTreemapData(processedData, groupBy, yColumns?.[0]);

      default:
        return this.generateCategoryChart(processedData, ChartType.BAR, xColumn, yColumns, sortOrder);
    }
  }

  /**
   * Aggregate data with grouping and aggregations
   */
  aggregateData(dto: AggregateDataDto): AggregationResponseDto {
    const { data, groupBy, aggregations, having, sortBy, sortOrder } = dto;
    this.logger.log(`Aggregating data with ${aggregations.length} aggregations`);

    if (!data || data.length === 0) {
      throw new BadRequestException('No data provided for aggregation');
    }

    let results = this.statisticsAnalyzer.aggregate(data, groupBy, aggregations);

    // Apply having clause
    if (having) {
      results = results.filter((row) => {
        return Object.entries(having).every(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            const { operator, threshold } = value as { operator: string; threshold: number };
            const rowValue = row[key];
            switch (operator) {
              case '>':
                return rowValue > threshold;
              case '>=':
                return rowValue >= threshold;
              case '<':
                return rowValue < threshold;
              case '<=':
                return rowValue <= threshold;
              case '=':
                return rowValue === threshold;
              case '!=':
                return rowValue !== threshold;
              default:
                return true;
            }
          }
          return row[key] === value;
        });
      });
    }

    // Sort results
    if (sortBy && results.length > 0) {
      results.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
        }

        const aStr = String(aVal);
        const bStr = String(bVal);
        return sortOrder === 'desc' ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
      });
    }

    return {
      results,
      summary: {
        groupCount: results.length,
        totalRows: data.length,
        aggregationsApplied: aggregations.map(
          (a) => `${a.type}(${a.column})${a.alias ? ` as ${a.alias}` : ''}`,
        ),
      },
    };
  }

  /**
   * Detect patterns in data
   */
  async detectPatterns(dto: DetectPatternsDto): Promise<PatternDetectionResponseDto> {
    const { data, columns, confidenceThreshold = 0.7, detectTimeSeries = true } = dto;
    this.logger.log('Detecting patterns in data');

    if (!data || data.length === 0) {
      throw new BadRequestException('No data provided for pattern detection');
    }

    const targetColumns = columns || Object.keys(data[0]);

    // Get statistical patterns
    const patterns = this.statisticsAnalyzer.detectPatterns(
      data,
      targetColumns,
      confidenceThreshold,
    );

    // Get numeric columns for correlation and outlier detection
    const numericColumns = targetColumns.filter((col) => {
      const values = data.map((row) => row[col]).filter((v) => v !== null && v !== undefined);
      return values.length > 0 && values.every((v) => typeof v === 'number' || !isNaN(parseFloat(v)));
    });

    // Calculate correlations
    const correlations: { column1: string; column2: string; coefficient: number }[] = [];
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const col1 = numericColumns[i];
        const col2 = numericColumns[j];

        const values1 = data
          .map((row) => row[col1])
          .map((v) => (typeof v === 'number' ? v : parseFloat(v)))
          .filter((v) => !isNaN(v));

        const values2 = data
          .map((row) => row[col2])
          .map((v) => (typeof v === 'number' ? v : parseFloat(v)))
          .filter((v) => !isNaN(v));

        if (values1.length === values2.length && values1.length > 5) {
          const coefficient = this.statisticsAnalyzer.calculateCorrelation(values1, values2);
          correlations.push({ column1: col1, column2: col2, coefficient });
        }
      }
    }

    // Detect outliers
    const outliers: { column: string; values: any[]; indices: number[] }[] = [];
    numericColumns.forEach((col) => {
      const values = data
        .map((row) => row[col])
        .map((v) => (typeof v === 'number' ? v : parseFloat(v)))
        .filter((v) => !isNaN(v));

      if (values.length >= 4) {
        const detected = this.statisticsAnalyzer.detectOutliers(values);
        if (detected.values.length > 0) {
          outliers.push({
            column: col,
            values: detected.values,
            indices: detected.indices,
          });
        }
      }
    });

    // Generate AI summary
    let summary = `Detected ${patterns.length} patterns in the data.`;
    if (patterns.length > 0) {
      summary += ` Key findings: ${patterns
        .slice(0, 3)
        .map((p) => p.description)
        .join('; ')}.`;
    }
    if (correlations.filter((c) => Math.abs(c.coefficient) > 0.7).length > 0) {
      summary += ` Strong correlations found between some columns.`;
    }
    if (outliers.length > 0) {
      summary += ` Outliers detected in ${outliers.length} column(s).`;
    }

    return {
      patterns,
      summary,
      correlations: correlations.filter((c) => Math.abs(c.coefficient) > 0.3),
      outliers: outliers.length > 0 ? outliers : undefined,
    };
  }

  /**
   * Summarize data with statistics
   */
  async summarizeData(dto: SummarizeDataDto): Promise<DataSummaryResponseDto> {
    const { data, columns, includePercentiles = true, includeDistributions = true, topN = 5 } = dto;
    this.logger.log('Summarizing data');

    if (!data || data.length === 0) {
      throw new BadRequestException('No data provided for summarization');
    }

    const targetColumns = columns || Object.keys(data[0]);

    // Generate column summaries
    const columnSummaries = targetColumns.map((col) =>
      this.statisticsAnalyzer.summarizeColumn(data, col),
    );

    // Calculate data quality score
    const dataQualityScore = this.statisticsAnalyzer.calculateDataQualityScore(data, targetColumns);

    // Get sample rows
    const sampleRows = data.slice(0, 5);

    // Generate AI summary if AI is configured
    let aiSummary: string | undefined;
    if (this.aiService.isConfigured()) {
      try {
        const dataSummary = this.prepareDataSummaryForAI(data, targetColumns);

        const aiResponse = await this.aiService.generateText(
          `Provide a brief, insightful summary of this dataset in 2-3 sentences. Focus on the most interesting aspects, data quality, and potential use cases.

Data Summary:
${dataSummary}

Respond with just the summary text, no JSON or formatting.`,
          {
            systemMessage: 'You are a data analyst. Provide concise, insightful data summaries.',
            temperature: 0.3,
          },
        );

        aiSummary = aiResponse.trim();
      } catch (error: any) {
        this.logger.warn(`AI summary generation failed: ${error.message}`);
      }
    }

    return {
      rowCount: data.length,
      columnCount: targetColumns.length,
      columns: columnSummaries,
      dataQualityScore,
      sampleRows,
      aiSummary,
    };
  }

  /**
   * Helper: Prepare data summary for AI analysis
   */
  private prepareDataSummaryForAI(data: Record<string, any>[], columns: string[]): string {
    const summaries = columns.map((col) => {
      const values = data.map((row) => row[col]).filter((v) => v !== null && v !== undefined);
      const uniqueCount = new Set(values).size;

      const isNumeric = values.length > 0 && values.every((v) => typeof v === 'number' || !isNaN(parseFloat(v)));

      if (isNumeric) {
        const numericValues = values.map((v) => (typeof v === 'number' ? v : parseFloat(v)));
        const stats = this.statisticsAnalyzer.calculateNumericStats(numericValues);
        return `${col}: numeric, ${values.length} values, min=${stats.min.toFixed(2)}, max=${stats.max.toFixed(2)}, mean=${stats.mean.toFixed(2)}, median=${stats.median.toFixed(2)}`;
      } else {
        const topValues = this.getTopValues(values, 3);
        return `${col}: ${typeof values[0]}, ${values.length} values, ${uniqueCount} unique, top: ${topValues.join(', ')}`;
      }
    });

    return `Total rows: ${data.length}\nColumns:\n${summaries.join('\n')}`;
  }

  /**
   * Helper: Get top N most common values
   */
  private getTopValues(values: any[], n: number): string[] {
    const counts = new Map<string, number>();
    values.forEach((v) => {
      const key = String(v);
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([value]) => value);
  }

  /**
   * Generate category-based chart (bar, line, area)
   */
  private generateCategoryChart(
    data: Record<string, any>[],
    chartType: ChartType,
    xColumn?: string,
    yColumns?: string[],
    sortOrder?: 'asc' | 'desc',
  ): ChartDataResponseDto {
    const columns = Object.keys(data[0] || {});
    const xCol = xColumn || columns[0];
    const yCols = yColumns || columns.filter((c) => c !== xCol).slice(0, 3);

    // Sort data if needed
    let sortedData = [...data];
    if (sortOrder) {
      sortedData.sort((a, b) => {
        const aVal = a[xCol];
        const bVal = b[xCol];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
        }
        return sortOrder === 'desc'
          ? String(bVal).localeCompare(String(aVal))
          : String(aVal).localeCompare(String(bVal));
      });
    }

    const labels = sortedData.map((row) => String(row[xCol] ?? ''));
    const datasets = yCols.map((col, index) => ({
      label: col,
      data: sortedData.map((row) => {
        const value = row[col];
        return typeof value === 'number' ? value : parseFloat(value) || 0;
      }),
      backgroundColor: this.colorPalettes.default[index % this.colorPalettes.default.length],
      borderColor: this.colorPalettes.border[index % this.colorPalettes.border.length],
    }));

    return {
      chartType,
      labels,
      datasets,
      options: {
        responsive: true,
        plugins: {
          legend: { display: yCols.length > 1 },
        },
      },
    };
  }

  /**
   * Generate pie chart data
   */
  private generatePieChart(
    data: Record<string, any>[],
    labelColumn?: string,
    valueColumn?: string,
  ): ChartDataResponseDto {
    const columns = Object.keys(data[0] || {});
    const labelCol = labelColumn || columns[0];
    const valueCol = valueColumn || columns.find((c) => c !== labelCol) || columns[1];

    // Aggregate values by label
    const aggregated = new Map<string, number>();
    data.forEach((row) => {
      const label = String(row[labelCol] ?? 'Other');
      const value = typeof row[valueCol] === 'number' ? row[valueCol] : parseFloat(row[valueCol]) || 0;
      aggregated.set(label, (aggregated.get(label) || 0) + value);
    });

    const sortedEntries = Array.from(aggregated.entries()).sort((a, b) => b[1] - a[1]);

    return {
      chartType: ChartType.PIE,
      labels: sortedEntries.map(([label]) => label),
      datasets: [
        {
          label: valueCol,
          data: sortedEntries.map(([, value]) => value),
          backgroundColor: sortedEntries.map(
            (_, i) => this.colorPalettes.default[i % this.colorPalettes.default.length],
          ),
          borderColor: sortedEntries.map(
            (_, i) => this.colorPalettes.border[i % this.colorPalettes.border.length],
          ),
        },
      ],
    };
  }

  /**
   * Generate scatter chart data
   */
  private generateScatterChart(
    data: Record<string, any>[],
    xColumn?: string,
    yColumns?: string[],
  ): ChartDataResponseDto {
    const columns = Object.keys(data[0] || {});
    const xCol = xColumn || columns[0];
    const yCols = yColumns || [columns[1]];

    const datasets = yCols.map((yCol, index) => ({
      label: yCol,
      data: data.map((row) => {
        const x = typeof row[xCol] === 'number' ? row[xCol] : parseFloat(row[xCol]) || 0;
        const y = typeof row[yCol] === 'number' ? row[yCol] : parseFloat(row[yCol]) || 0;
        return { x, y };
      }),
      backgroundColor: this.colorPalettes.default[index % this.colorPalettes.default.length],
      borderColor: this.colorPalettes.border[index % this.colorPalettes.border.length],
    }));

    return {
      chartType: ChartType.SCATTER,
      labels: [],
      datasets: datasets as any,
      options: {
        scales: {
          x: { title: { display: true, text: xCol } },
          y: { title: { display: true, text: yCols.join(', ') } },
        },
      },
    };
  }

  /**
   * Generate histogram data
   */
  private generateHistogram(data: Record<string, any>[], column?: string): ChartDataResponseDto {
    const columns = Object.keys(data[0] || {});
    const col = column || columns[0];

    const values = data
      .map((row) => row[col])
      .map((v) => (typeof v === 'number' ? v : parseFloat(v)))
      .filter((v) => !isNaN(v));

    if (values.length === 0) {
      return {
        chartType: ChartType.HISTOGRAM,
        labels: [],
        datasets: [{ label: col, data: [], backgroundColor: this.colorPalettes.default[0] }],
      };
    }

    // Calculate bins using Sturges' rule
    const binCount = Math.ceil(1 + 3.322 * Math.log10(values.length));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / binCount;

    const bins = Array(binCount).fill(0);
    const labels: string[] = [];

    for (let i = 0; i < binCount; i++) {
      const binStart = min + i * binWidth;
      const binEnd = min + (i + 1) * binWidth;
      labels.push(`${binStart.toFixed(1)}-${binEnd.toFixed(1)}`);
    }

    values.forEach((v) => {
      const binIndex = Math.min(Math.floor((v - min) / binWidth), binCount - 1);
      bins[binIndex]++;
    });

    return {
      chartType: ChartType.HISTOGRAM,
      labels,
      datasets: [
        {
          label: col,
          data: bins,
          backgroundColor: this.colorPalettes.default[0],
          borderColor: this.colorPalettes.border[0],
        },
      ],
    };
  }

  /**
   * Generate heatmap data
   */
  private generateHeatmapData(
    data: Record<string, any>[],
    xColumn?: string,
    yColumn?: string,
    valueColumn?: string,
  ): ChartDataResponseDto {
    const columns = Object.keys(data[0] || {});
    const xCol = xColumn || columns[0];
    const yCol = yColumn || columns[1];
    const valCol = valueColumn || columns[2];

    // Aggregate values
    const matrix = new Map<string, Map<string, number>>();
    const xLabels = new Set<string>();
    const yLabels = new Set<string>();

    data.forEach((row) => {
      const x = String(row[xCol] ?? '');
      const y = String(row[yCol] ?? '');
      const value = typeof row[valCol] === 'number' ? row[valCol] : parseFloat(row[valCol]) || 0;

      xLabels.add(x);
      yLabels.add(y);

      if (!matrix.has(y)) matrix.set(y, new Map());
      matrix.get(y)!.set(x, value);
    });

    const xLabelArray = Array.from(xLabels);
    const yLabelArray = Array.from(yLabels);

    const datasets = yLabelArray.map((yLabel, yIndex) => ({
      label: yLabel,
      data: xLabelArray.map((xLabel) => matrix.get(yLabel)?.get(xLabel) || 0),
      backgroundColor: this.colorPalettes.default[yIndex % this.colorPalettes.default.length],
    }));

    return {
      chartType: ChartType.HEATMAP,
      labels: xLabelArray,
      datasets,
      rawData: data,
    };
  }

  /**
   * Generate bubble chart data
   */
  private generateBubbleChart(
    data: Record<string, any>[],
    xColumn?: string,
    yColumns?: string[],
  ): ChartDataResponseDto {
    const columns = Object.keys(data[0] || {});
    const xCol = xColumn || columns[0];
    const yCol = yColumns?.[0] || columns[1];
    const rCol = yColumns?.[1] || columns[2];

    const bubbleData = data.map((row) => ({
      x: typeof row[xCol] === 'number' ? row[xCol] : parseFloat(row[xCol]) || 0,
      y: typeof row[yCol] === 'number' ? row[yCol] : parseFloat(row[yCol]) || 0,
      r: Math.abs(typeof row[rCol] === 'number' ? row[rCol] : parseFloat(row[rCol]) || 5) / 2,
    }));

    return {
      chartType: ChartType.BUBBLE,
      labels: [],
      datasets: [
        {
          label: `${xCol} vs ${yCol}`,
          data: bubbleData as any,
          backgroundColor: this.colorPalettes.default[0],
          borderColor: this.colorPalettes.border[0],
        },
      ],
    };
  }

  /**
   * Generate radar chart data
   */
  private generateRadarChart(
    data: Record<string, any>[],
    labelColumn?: string,
    valueColumns?: string[],
  ): ChartDataResponseDto {
    const columns = Object.keys(data[0] || {});
    const labelCol = labelColumn || columns[0];
    const valueCols = valueColumns || columns.filter((c) => c !== labelCol);

    // Use value columns as labels (axes)
    const labels = valueCols;

    // Create datasets for each row
    const datasets = data.slice(0, 5).map((row, index) => ({
      label: String(row[labelCol] ?? `Item ${index + 1}`),
      data: valueCols.map((col) => {
        const value = row[col];
        return typeof value === 'number' ? value : parseFloat(value) || 0;
      }),
      backgroundColor: this.colorPalettes.default[index % this.colorPalettes.default.length].replace('0.8', '0.2'),
      borderColor: this.colorPalettes.border[index % this.colorPalettes.border.length],
    }));

    return {
      chartType: ChartType.RADAR,
      labels,
      datasets,
    };
  }

  /**
   * Generate treemap data
   */
  private generateTreemapData(
    data: Record<string, any>[],
    groupColumn?: string,
    valueColumn?: string,
  ): ChartDataResponseDto {
    const columns = Object.keys(data[0] || {});
    const groupCol = groupColumn || columns[0];
    const valueCol = valueColumn || columns.find((c) => c !== groupCol) || columns[1];

    // Aggregate by group
    const groups = new Map<string, number>();
    data.forEach((row) => {
      const group = String(row[groupCol] ?? 'Other');
      const value = typeof row[valueCol] === 'number' ? row[valueCol] : parseFloat(row[valueCol]) || 0;
      groups.set(group, (groups.get(group) || 0) + value);
    });

    const sortedGroups = Array.from(groups.entries()).sort((a, b) => b[1] - a[1]);

    return {
      chartType: ChartType.TREEMAP,
      labels: sortedGroups.map(([label]) => label),
      datasets: [
        {
          label: valueCol,
          data: sortedGroups.map(([, value]) => value),
          backgroundColor: sortedGroups.map(
            (_, i) => this.colorPalettes.default[i % this.colorPalettes.default.length],
          ),
        },
      ],
      rawData: sortedGroups.map(([label, value]) => ({ [groupCol]: label, [valueCol]: value })),
    };
  }
}
