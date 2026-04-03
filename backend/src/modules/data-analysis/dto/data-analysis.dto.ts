import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsEnum,
  IsNumber,
  IsBoolean,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================
// CSV/Excel Parsing DTOs
// ============================================

export class ParseOptionsDto {
  @ApiPropertyOptional({ description: 'Delimiter for CSV files', default: ',' })
  @IsOptional()
  @IsString()
  delimiter?: string;

  @ApiPropertyOptional({ description: 'Whether the file has a header row', default: true })
  @IsOptional()
  @IsBoolean()
  hasHeader?: boolean;

  @ApiPropertyOptional({ description: 'Skip empty lines', default: true })
  @IsOptional()
  @IsBoolean()
  skipEmptyLines?: boolean;

  @ApiPropertyOptional({ description: 'Specific columns to extract' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  columns?: string[];

  @ApiPropertyOptional({ description: 'Sheet name or index for Excel files', default: 0 })
  @IsOptional()
  sheet?: string | number;

  @ApiPropertyOptional({ description: 'Maximum number of rows to parse' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxRows?: number;

  @ApiPropertyOptional({ description: 'Encoding for the file', default: 'utf-8' })
  @IsOptional()
  @IsString()
  encoding?: string;

  @ApiPropertyOptional({ description: 'Convert numeric strings to numbers', default: true })
  @IsOptional()
  @IsBoolean()
  dynamicTyping?: boolean;
}

// ============================================
// Analysis DTOs
// ============================================

export class AnalyzeDataDto {
  @ApiProperty({ description: 'Data to analyze (array of objects)' })
  @IsArray()
  data: Record<string, any>[];

  @ApiProperty({ description: 'Natural language query for analysis' })
  @IsString()
  query: string;

  @ApiPropertyOptional({ description: 'Specific columns to focus on' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  columns?: string[];

  @ApiPropertyOptional({ description: 'Context about the data' })
  @IsOptional()
  @IsString()
  context?: string;
}

export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  SCATTER = 'scatter',
  AREA = 'area',
  HISTOGRAM = 'histogram',
  HEATMAP = 'heatmap',
  BUBBLE = 'bubble',
  RADAR = 'radar',
  TREEMAP = 'treemap',
}

export class GenerateChartDataDto {
  @ApiProperty({ description: 'Data to visualize' })
  @IsArray()
  data: Record<string, any>[];

  @ApiProperty({ enum: ChartType, description: 'Type of chart to generate' })
  @IsEnum(ChartType)
  chartType: ChartType;

  @ApiPropertyOptional({ description: 'Column to use for X-axis or labels' })
  @IsOptional()
  @IsString()
  xColumn?: string;

  @ApiPropertyOptional({ description: 'Column(s) to use for Y-axis or values' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  yColumns?: string[];

  @ApiPropertyOptional({ description: 'Column to group data by' })
  @IsOptional()
  @IsString()
  groupBy?: string;

  @ApiPropertyOptional({ description: 'Chart title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Limit number of data points' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export enum AggregationType {
  SUM = 'sum',
  AVG = 'avg',
  MIN = 'min',
  MAX = 'max',
  COUNT = 'count',
  MEDIAN = 'median',
  STD_DEV = 'stdDev',
  VARIANCE = 'variance',
  FIRST = 'first',
  LAST = 'last',
}

export class AggregationConfigDto {
  @ApiProperty({ description: 'Column to aggregate' })
  @IsString()
  column: string;

  @ApiProperty({ enum: AggregationType, description: 'Type of aggregation' })
  @IsEnum(AggregationType)
  type: AggregationType;

  @ApiPropertyOptional({ description: 'Alias for the result column' })
  @IsOptional()
  @IsString()
  alias?: string;
}

export class AggregateDataDto {
  @ApiProperty({ description: 'Data to aggregate' })
  @IsArray()
  data: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Column(s) to group by' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupBy?: string[];

  @ApiProperty({ description: 'Aggregations to perform', type: [AggregationConfigDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AggregationConfigDto)
  aggregations: AggregationConfigDto[];

  @ApiPropertyOptional({ description: 'Having clause for filtering grouped results' })
  @IsOptional()
  @IsObject()
  having?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Sort results by' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class DetectPatternsDto {
  @ApiProperty({ description: 'Data to analyze for patterns' })
  @IsArray()
  data: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Specific columns to analyze' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  columns?: string[];

  @ApiPropertyOptional({ description: 'Minimum confidence threshold (0-1)', default: 0.7 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidenceThreshold?: number;

  @ApiPropertyOptional({ description: 'Include time-series patterns', default: true })
  @IsOptional()
  @IsBoolean()
  detectTimeSeries?: boolean;
}

export class SummarizeDataDto {
  @ApiProperty({ description: 'Data to summarize' })
  @IsArray()
  data: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Specific columns to summarize' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  columns?: string[];

  @ApiPropertyOptional({ description: 'Include percentile information', default: true })
  @IsOptional()
  @IsBoolean()
  includePercentiles?: boolean;

  @ApiPropertyOptional({ description: 'Include frequency distributions', default: true })
  @IsOptional()
  @IsBoolean()
  includeDistributions?: boolean;

  @ApiPropertyOptional({ description: 'Number of top values to include', default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  topN?: number;
}

// ============================================
// Response DTOs
// ============================================

export class ParsedDataResponseDto {
  @ApiProperty({ description: 'Parsed data rows' })
  data: Record<string, any>[];

  @ApiProperty({ description: 'Column names' })
  columns: string[];

  @ApiProperty({ description: 'Total number of rows' })
  rowCount: number;

  @ApiProperty({ description: 'Column metadata' })
  metadata: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'null' | 'mixed';
    nullCount: number;
    uniqueCount: number;
    sample: any[];
  }[];

  @ApiPropertyOptional({ description: 'Parsing errors or warnings' })
  warnings?: string[];
}

export class AnalysisResponseDto {
  @ApiProperty({ description: 'AI-generated analysis' })
  analysis: string;

  @ApiPropertyOptional({ description: 'Key insights extracted' })
  insights?: string[];

  @ApiPropertyOptional({ description: 'Suggested visualizations' })
  suggestedCharts?: ChartType[];

  @ApiPropertyOptional({ description: 'Follow-up questions' })
  followUpQuestions?: string[];

  @ApiPropertyOptional({ description: 'Computed statistics relevant to the query' })
  statistics?: Record<string, any>;
}

export class ChartDataResponseDto {
  @ApiProperty({ description: 'Chart type' })
  chartType: ChartType;

  @ApiProperty({ description: 'Labels for the chart' })
  labels: string[];

  @ApiProperty({ description: 'Datasets for the chart' })
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];

  @ApiPropertyOptional({ description: 'Chart configuration options' })
  options?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Raw data used for the chart' })
  rawData?: Record<string, any>[];
}

export class AggregationResponseDto {
  @ApiProperty({ description: 'Aggregated results' })
  results: Record<string, any>[];

  @ApiProperty({ description: 'Aggregation summary' })
  summary: {
    groupCount: number;
    totalRows: number;
    aggregationsApplied: string[];
  };
}

export class PatternDto {
  @ApiProperty({ description: 'Pattern type' })
  type: string;

  @ApiProperty({ description: 'Pattern description' })
  description: string;

  @ApiProperty({ description: 'Columns involved' })
  columns: string[];

  @ApiProperty({ description: 'Confidence score (0-1)' })
  confidence: number;

  @ApiPropertyOptional({ description: 'Pattern details' })
  details?: Record<string, any>;
}

export class PatternDetectionResponseDto {
  @ApiProperty({ description: 'Detected patterns', type: [PatternDto] })
  patterns: PatternDto[];

  @ApiProperty({ description: 'Analysis summary' })
  summary: string;

  @ApiPropertyOptional({ description: 'Correlations between columns' })
  correlations?: { column1: string; column2: string; coefficient: number }[];

  @ApiPropertyOptional({ description: 'Detected outliers' })
  outliers?: { column: string; values: any[]; indices: number[] }[];
}

export class ColumnSummaryDto {
  @ApiProperty({ description: 'Column name' })
  name: string;

  @ApiProperty({ description: 'Data type' })
  type: 'string' | 'number' | 'boolean' | 'date' | 'null' | 'mixed';

  @ApiProperty({ description: 'Total count' })
  count: number;

  @ApiProperty({ description: 'Null count' })
  nullCount: number;

  @ApiProperty({ description: 'Unique values count' })
  uniqueCount: number;

  @ApiPropertyOptional({ description: 'Numeric statistics (for numeric columns)' })
  numericStats?: {
    min: number;
    max: number;
    sum: number;
    mean: number;
    median: number;
    stdDev: number;
    variance: number;
    percentiles?: { p25: number; p50: number; p75: number; p90: number; p99: number };
  };

  @ApiPropertyOptional({ description: 'String statistics (for string columns)' })
  stringStats?: {
    minLength: number;
    maxLength: number;
    avgLength: number;
    mostCommon: { value: string; count: number }[];
  };

  @ApiPropertyOptional({ description: 'Date statistics (for date columns)' })
  dateStats?: {
    min: string;
    max: string;
    range: string;
  };
}

export class DataSummaryResponseDto {
  @ApiProperty({ description: 'Total row count' })
  rowCount: number;

  @ApiProperty({ description: 'Total column count' })
  columnCount: number;

  @ApiProperty({ description: 'Column summaries', type: [ColumnSummaryDto] })
  columns: ColumnSummaryDto[];

  @ApiPropertyOptional({ description: 'Data quality score (0-100)' })
  dataQualityScore?: number;

  @ApiPropertyOptional({ description: 'Sample rows' })
  sampleRows?: Record<string, any>[];

  @ApiPropertyOptional({ description: 'AI-generated summary' })
  aiSummary?: string;
}
