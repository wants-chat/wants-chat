import { Injectable } from '@nestjs/common';
import { AiService } from '../../ai/ai.service';
import { DataAnalysisService } from '../data-analysis.service';
import { BaseAnalysisAgent, AgentResponse } from './base-analysis.agent';
import { CHART_BUILDER_PROMPTS } from '../prompts/analysis.prompts';

export type ChartType =
  | 'line'
  | 'bar'
  | 'pie'
  | 'doughnut'
  | 'scatter'
  | 'area'
  | 'radar'
  | 'bubble'
  | 'heatmap'
  | 'treemap'
  | 'histogram';

export interface ChartSuggestion {
  chartType: ChartType;
  title: string;
  xAxis: string;
  yAxis: string;
  series?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'none';
  reason: string;
  confidence: number;
}

export interface ChartConfig {
  type: ChartType;
  title: string;
  data: any[];
  xAxis: string;
  yAxis: string;
  series?: string;
  groupBy?: string;
  aggregation?: string;
  options?: {
    colors?: string[];
    legend?: boolean;
    stacked?: boolean;
    showLabels?: boolean;
  };
}

export interface ChartJsData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }[];
}

// Color palettes for charts
const COLOR_PALETTES = {
  default: [
    'rgba(59, 130, 246, 0.8)',   // Blue
    'rgba(16, 185, 129, 0.8)',   // Green
    'rgba(249, 115, 22, 0.8)',   // Orange
    'rgba(139, 92, 246, 0.8)',   // Purple
    'rgba(236, 72, 153, 0.8)',   // Pink
    'rgba(234, 179, 8, 0.8)',    // Yellow
    'rgba(20, 184, 166, 0.8)',   // Teal
    'rgba(239, 68, 68, 0.8)',    // Red
  ],
  borders: [
    'rgba(59, 130, 246, 1)',
    'rgba(16, 185, 129, 1)',
    'rgba(249, 115, 22, 1)',
    'rgba(139, 92, 246, 1)',
    'rgba(236, 72, 153, 1)',
    'rgba(234, 179, 8, 1)',
    'rgba(20, 184, 166, 1)',
    'rgba(239, 68, 68, 1)',
  ],
};

@Injectable()
export class ChartBuilderAgent extends BaseAnalysisAgent {
  constructor(
    aiService: AiService,
    private readonly dataAnalysisService: DataAnalysisService,
  ) {
    super(aiService, 'ChartBuilderAgent');
  }

  /**
   * Suggest best chart types for given data
   */
  async suggestCharts(
    data: any[],
    columns: { name: string; type: string }[],
    userGoal?: string,
  ): Promise<AgentResponse<ChartSuggestion[]>> {
    const startTime = Date.now();

    try {
      // Get sample data and column info
      const sampleData = data.slice(0, 5);
      const columnTypes = columns.map(c => `${c.name}: ${c.type}`).join(', ');

      const prompt = CHART_BUILDER_PROMPTS.suggestCharts
        .replace('{{rowCount}}', String(data.length))
        .replace('{{columns}}', columns.map(c => c.name).join(', '))
        .replace('{{columnTypes}}', columnTypes)
        .replace('{{sampleData}}', JSON.stringify(sampleData, null, 2))
        .replace('{{userGoal}}', userGoal || 'General data exploration');

      const response = await this.generateWithAI(prompt, {
        systemPrompt: CHART_BUILDER_PROMPTS.systemPrompt,
        temperature: 0.4,
      });

      const suggestions = this.parseJSONResponse<ChartSuggestion[]>(response);

      return {
        success: true,
        data: suggestions || [],
        metadata: {
          executionTimeMs: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      this.logger.error(`Chart suggestion failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        data: this.getDefaultSuggestions(columns),
        metadata: {
          executionTimeMs: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Build chart data from configuration
   */
  buildChartData(config: ChartConfig): AgentResponse<ChartJsData> {
    const startTime = Date.now();

    try {
      const { data, type, xAxis, yAxis, series, groupBy, aggregation } = config;

      let chartData: ChartJsData;

      if (groupBy || series) {
        chartData = this.buildGroupedChartData(data, xAxis, yAxis, groupBy || series, aggregation);
      } else if (type === 'pie' || type === 'doughnut') {
        chartData = this.buildPieChartData(data, xAxis, yAxis, aggregation);
      } else {
        chartData = this.buildSimpleChartData(data, xAxis, yAxis);
      }

      // Apply colors
      chartData.datasets = chartData.datasets.map((dataset, i) => ({
        ...dataset,
        backgroundColor: type === 'pie' || type === 'doughnut'
          ? COLOR_PALETTES.default.slice(0, chartData.labels.length)
          : COLOR_PALETTES.default[i % COLOR_PALETTES.default.length],
        borderColor: type === 'line' || type === 'scatter'
          ? COLOR_PALETTES.borders[i % COLOR_PALETTES.borders.length]
          : undefined,
        borderWidth: type === 'line' ? 2 : 1,
        fill: type === 'area',
      }));

      return {
        success: true,
        data: chartData,
        metadata: {
          executionTimeMs: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      this.logger.error(`Chart build failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        metadata: {
          executionTimeMs: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Build simple (non-grouped) chart data
   */
  private buildSimpleChartData(data: any[], xAxis: string, yAxis: string): ChartJsData {
    const labels = data.map(row => String(row[xAxis] ?? ''));
    const values = data.map(row => {
      const val = row[yAxis];
      return typeof val === 'number' ? val : parseFloat(val) || 0;
    });

    return {
      labels,
      datasets: [{
        label: yAxis,
        data: values,
      }],
    };
  }

  /**
   * Build grouped chart data (for series or groupBy)
   */
  private buildGroupedChartData(
    data: any[],
    xAxis: string,
    yAxis: string,
    groupBy: string,
    aggregation?: string,
  ): ChartJsData {
    // Get unique groups and x-values
    const groups = [...new Set(data.map(row => String(row[groupBy] ?? 'Unknown')))];
    const xValues = [...new Set(data.map(row => String(row[xAxis] ?? '')))];

    // Aggregate data
    const aggregatedData: Record<string, Record<string, number[]>> = {};

    for (const row of data) {
      const group = String(row[groupBy] ?? 'Unknown');
      const x = String(row[xAxis] ?? '');
      const y = typeof row[yAxis] === 'number' ? row[yAxis] : parseFloat(row[yAxis]) || 0;

      if (!aggregatedData[group]) aggregatedData[group] = {};
      if (!aggregatedData[group][x]) aggregatedData[group][x] = [];
      aggregatedData[group][x].push(y);
    }

    // Apply aggregation function
    const datasets = groups.map(group => {
      const groupData = xValues.map(x => {
        const values = aggregatedData[group]?.[x] || [];
        return this.aggregate(values, aggregation);
      });

      return {
        label: group,
        data: groupData,
      };
    });

    return {
      labels: xValues,
      datasets,
    };
  }

  /**
   * Build pie/doughnut chart data
   */
  private buildPieChartData(
    data: any[],
    labelField: string,
    valueField: string,
    aggregation?: string,
  ): ChartJsData {
    // Group by label and aggregate values
    const aggregated: Record<string, number[]> = {};

    for (const row of data) {
      const label = String(row[labelField] ?? 'Unknown');
      const value = typeof row[valueField] === 'number'
        ? row[valueField]
        : parseFloat(row[valueField]) || 0;

      if (!aggregated[label]) aggregated[label] = [];
      aggregated[label].push(value);
    }

    const labels = Object.keys(aggregated);
    const values = labels.map(label =>
      this.aggregate(aggregated[label], aggregation || 'sum'),
    );

    return {
      labels,
      datasets: [{
        label: valueField,
        data: values,
      }],
    };
  }

  /**
   * Apply aggregation function to array of values
   */
  private aggregate(values: number[], aggregation?: string): number {
    if (!values.length) return 0;

    switch (aggregation) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'avg':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'count':
        return values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'none':
      default:
        return values[0];
    }
  }

  /**
   * Get default chart suggestions based on column types
   */
  private getDefaultSuggestions(columns: { name: string; type: string }[]): ChartSuggestion[] {
    const suggestions: ChartSuggestion[] = [];
    const numericColumns = columns.filter(c => c.type === 'number');
    const categoryColumns = columns.filter(c => c.type === 'string');
    const dateColumns = columns.filter(c => c.type === 'date');

    // Time series line chart
    if (dateColumns.length > 0 && numericColumns.length > 0) {
      suggestions.push({
        chartType: 'line',
        title: `${numericColumns[0].name} Over Time`,
        xAxis: dateColumns[0].name,
        yAxis: numericColumns[0].name,
        reason: 'Time series data is best visualized with line charts',
        confidence: 0.9,
      });
    }

    // Category bar chart
    if (categoryColumns.length > 0 && numericColumns.length > 0) {
      suggestions.push({
        chartType: 'bar',
        title: `${numericColumns[0].name} by ${categoryColumns[0].name}`,
        xAxis: categoryColumns[0].name,
        yAxis: numericColumns[0].name,
        aggregation: 'sum',
        reason: 'Categorical comparisons work well with bar charts',
        confidence: 0.85,
      });
    }

    // Pie chart for distribution
    if (categoryColumns.length > 0 && numericColumns.length > 0) {
      suggestions.push({
        chartType: 'pie',
        title: `${categoryColumns[0].name} Distribution`,
        xAxis: categoryColumns[0].name,
        yAxis: numericColumns[0].name,
        aggregation: 'sum',
        reason: 'Pie charts show part-to-whole relationships',
        confidence: 0.7,
      });
    }

    // Scatter plot for correlation
    if (numericColumns.length >= 2) {
      suggestions.push({
        chartType: 'scatter',
        title: `${numericColumns[0].name} vs ${numericColumns[1].name}`,
        xAxis: numericColumns[0].name,
        yAxis: numericColumns[1].name,
        reason: 'Scatter plots reveal correlations between numeric variables',
        confidence: 0.75,
      });
    }

    return suggestions;
  }

  /**
   * Generate Chart.js compatible options
   */
  generateChartOptions(
    type: ChartType,
    title: string,
    customOptions?: Record<string, any>,
  ): Record<string, any> {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const,
        },
        title: {
          display: !!title,
          text: title,
          font: { size: 16 },
        },
        tooltip: {
          enabled: true,
        },
      },
    };

    // Type-specific options
    const typeOptions: Record<string, any> = {};

    if (type === 'bar' || type === 'line' || type === 'area') {
      typeOptions.scales = {
        y: {
          beginAtZero: true,
        },
      };
    }

    if (type === 'pie' || type === 'doughnut') {
      typeOptions.plugins = {
        ...baseOptions.plugins,
        legend: {
          display: true,
          position: 'right' as const,
        },
      };
    }

    return {
      ...baseOptions,
      ...typeOptions,
      ...customOptions,
    };
  }
}
