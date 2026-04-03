import { Injectable, Logger } from '@nestjs/common';
import {
  AggregationType,
  AggregationConfigDto,
  ColumnSummaryDto,
  PatternDto,
} from '../dto/data-analysis.dto';

@Injectable()
export class StatisticsAnalyzer {
  private readonly logger = new Logger(StatisticsAnalyzer.name);

  /**
   * Calculate basic statistics for a numeric array
   */
  calculateNumericStats(values: number[]): {
    min: number;
    max: number;
    sum: number;
    mean: number;
    median: number;
    stdDev: number;
    variance: number;
    count: number;
  } {
    if (values.length === 0) {
      return {
        min: 0,
        max: 0,
        sum: 0,
        mean: 0,
        median: 0,
        stdDev: 0,
        variance: 0,
        count: 0,
      };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((acc, val) => acc + val, 0);
    const mean = sum / count;

    // Calculate variance and standard deviation
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / count;
    const stdDev = Math.sqrt(variance);

    // Calculate median
    const mid = Math.floor(count / 2);
    const median = count % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    return {
      min: sorted[0],
      max: sorted[count - 1],
      sum,
      mean,
      median,
      stdDev,
      variance,
      count,
    };
  }

  /**
   * Calculate percentiles for a numeric array
   */
  calculatePercentiles(values: number[]): {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p99: number;
  } {
    if (values.length === 0) {
      return { p25: 0, p50: 0, p75: 0, p90: 0, p99: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);

    const percentile = (p: number): number => {
      const index = (p / 100) * (sorted.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);

      if (lower === upper) {
        return sorted[lower];
      }

      const weight = index - lower;
      return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    };

    return {
      p25: percentile(25),
      p50: percentile(50),
      p75: percentile(75),
      p90: percentile(90),
      p99: percentile(99),
    };
  }

  /**
   * Perform aggregation on data
   */
  aggregate(
    data: Record<string, any>[],
    groupBy: string[] | undefined,
    aggregations: AggregationConfigDto[],
  ): Record<string, any>[] {
    if (data.length === 0) return [];

    // If no groupBy, aggregate the entire dataset
    if (!groupBy || groupBy.length === 0) {
      const result: Record<string, any> = {};

      aggregations.forEach((agg) => {
        const values = data
          .map((row) => row[agg.column])
          .filter((v) => v !== null && v !== undefined);

        const numericValues = values
          .map((v) => (typeof v === 'number' ? v : parseFloat(v)))
          .filter((v) => !isNaN(v));

        result[agg.alias || `${agg.type}_${agg.column}`] = this.applyAggregation(
          agg.type,
          values,
          numericValues,
        );
      });

      return [result];
    }

    // Group data
    const groups = this.groupData(data, groupBy);

    // Apply aggregations to each group
    return Array.from(groups.entries()).map(([key, rows]) => {
      const result: Record<string, any> = {};

      // Add group keys
      const keyParts = key.split('|||');
      groupBy.forEach((col, index) => {
        result[col] = keyParts[index];
      });

      // Apply aggregations
      aggregations.forEach((agg) => {
        const values = rows
          .map((row) => row[agg.column])
          .filter((v) => v !== null && v !== undefined);

        const numericValues = values
          .map((v) => (typeof v === 'number' ? v : parseFloat(v)))
          .filter((v) => !isNaN(v));

        result[agg.alias || `${agg.type}_${agg.column}`] = this.applyAggregation(
          agg.type,
          values,
          numericValues,
        );
      });

      return result;
    });
  }

  /**
   * Group data by columns
   */
  private groupData(
    data: Record<string, any>[],
    groupBy: string[],
  ): Map<string, Record<string, any>[]> {
    const groups = new Map<string, Record<string, any>[]>();

    data.forEach((row) => {
      const key = groupBy.map((col) => String(row[col] ?? '')).join('|||');

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(row);
    });

    return groups;
  }

  /**
   * Apply a specific aggregation function
   */
  private applyAggregation(
    type: AggregationType,
    values: any[],
    numericValues: number[],
  ): number | string | null {
    switch (type) {
      case AggregationType.COUNT:
        return values.length;

      case AggregationType.SUM:
        return numericValues.length > 0
          ? numericValues.reduce((acc, val) => acc + val, 0)
          : 0;

      case AggregationType.AVG:
        return numericValues.length > 0
          ? numericValues.reduce((acc, val) => acc + val, 0) / numericValues.length
          : 0;

      case AggregationType.MIN:
        return numericValues.length > 0 ? Math.min(...numericValues) : null;

      case AggregationType.MAX:
        return numericValues.length > 0 ? Math.max(...numericValues) : null;

      case AggregationType.MEDIAN:
        if (numericValues.length === 0) return null;
        const sorted = [...numericValues].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0
          ? sorted[mid]
          : (sorted[mid - 1] + sorted[mid]) / 2;

      case AggregationType.STD_DEV:
        if (numericValues.length === 0) return null;
        const mean = numericValues.reduce((acc, val) => acc + val, 0) / numericValues.length;
        const squaredDiffs = numericValues.map((val) => Math.pow(val - mean, 2));
        return Math.sqrt(squaredDiffs.reduce((acc, val) => acc + val, 0) / numericValues.length);

      case AggregationType.VARIANCE:
        if (numericValues.length === 0) return null;
        const avgForVar = numericValues.reduce((acc, val) => acc + val, 0) / numericValues.length;
        const squaredDiffsForVar = numericValues.map((val) => Math.pow(val - avgForVar, 2));
        return squaredDiffsForVar.reduce((acc, val) => acc + val, 0) / numericValues.length;

      case AggregationType.FIRST:
        return values.length > 0 ? values[0] : null;

      case AggregationType.LAST:
        return values.length > 0 ? values[values.length - 1] : null;

      default:
        return null;
    }
  }

  /**
   * Summarize a single column
   */
  summarizeColumn(data: Record<string, any>[], columnName: string): ColumnSummaryDto {
    const values = data.map((row) => row[columnName]);
    const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== '');
    const uniqueValues = new Set(nonNullValues);

    const type = this.detectType(nonNullValues);
    const summary: ColumnSummaryDto = {
      name: columnName,
      type,
      count: values.length,
      nullCount: values.length - nonNullValues.length,
      uniqueCount: uniqueValues.size,
    };

    if (type === 'number') {
      const numericValues = nonNullValues
        .map((v) => (typeof v === 'number' ? v : parseFloat(v)))
        .filter((v) => !isNaN(v));

      if (numericValues.length > 0) {
        const stats = this.calculateNumericStats(numericValues);
        const percentiles = this.calculatePercentiles(numericValues);

        summary.numericStats = {
          ...stats,
          percentiles,
        };
      }
    } else if (type === 'string') {
      const stringValues = nonNullValues.filter((v) => typeof v === 'string') as string[];

      if (stringValues.length > 0) {
        const lengths = stringValues.map((s) => s.length);

        // Calculate most common values
        const valueCounts = new Map<string, number>();
        stringValues.forEach((v) => {
          valueCounts.set(v, (valueCounts.get(v) || 0) + 1);
        });

        const mostCommon = Array.from(valueCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([value, count]) => ({ value, count }));

        summary.stringStats = {
          minLength: Math.min(...lengths),
          maxLength: Math.max(...lengths),
          avgLength: lengths.reduce((a, b) => a + b, 0) / lengths.length,
          mostCommon,
        };
      }
    } else if (type === 'date') {
      const dateValues = nonNullValues
        .map((v) => new Date(v))
        .filter((d) => !isNaN(d.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());

      if (dateValues.length > 0) {
        const min = dateValues[0];
        const max = dateValues[dateValues.length - 1];
        const rangeMs = max.getTime() - min.getTime();
        const rangeDays = Math.floor(rangeMs / (1000 * 60 * 60 * 24));

        summary.dateStats = {
          min: min.toISOString(),
          max: max.toISOString(),
          range: `${rangeDays} days`,
        };
      }
    }

    return summary;
  }

  /**
   * Detect type of values
   */
  private detectType(values: any[]): 'string' | 'number' | 'boolean' | 'date' | 'null' | 'mixed' {
    if (values.length === 0) return 'null';

    const types = new Set<string>();

    for (const value of values.slice(0, 100)) {
      if (value === null || value === undefined || value === '') continue;

      if (typeof value === 'number' && !isNaN(value)) {
        types.add('number');
      } else if (typeof value === 'boolean') {
        types.add('boolean');
      } else if (typeof value === 'string') {
        if (this.isDateString(value)) {
          types.add('date');
        } else if (!isNaN(parseFloat(value))) {
          types.add('number');
        } else {
          types.add('string');
        }
      } else if (value instanceof Date) {
        types.add('date');
      } else {
        types.add('string');
      }
    }

    if (types.size === 0) return 'null';
    if (types.size === 1) return types.values().next().value;
    return 'mixed';
  }

  /**
   * Check if string is a date
   */
  private isDateString(value: string): boolean {
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{2}\/\d{2}\/\d{4}$/,
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    ];
    return datePatterns.some((p) => p.test(value));
  }

  /**
   * Calculate correlation between two numeric columns
   */
  calculateCorrelation(xValues: number[], yValues: number[]): number {
    if (xValues.length !== yValues.length || xValues.length === 0) {
      return 0;
    }

    const n = xValues.length;
    const xMean = xValues.reduce((a, b) => a + b, 0) / n;
    const yMean = yValues.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let xDenominator = 0;
    let yDenominator = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = xValues[i] - xMean;
      const yDiff = yValues[i] - yMean;
      numerator += xDiff * yDiff;
      xDenominator += xDiff * xDiff;
      yDenominator += yDiff * yDiff;
    }

    const denominator = Math.sqrt(xDenominator * yDenominator);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Detect outliers using IQR method
   */
  detectOutliers(values: number[]): { values: number[]; indices: number[] } {
    if (values.length < 4) {
      return { values: [], indices: [] };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const outlierValues: number[] = [];
    const outlierIndices: number[] = [];

    values.forEach((value, index) => {
      if (value < lowerBound || value > upperBound) {
        outlierValues.push(value);
        outlierIndices.push(index);
      }
    });

    return { values: outlierValues, indices: outlierIndices };
  }

  /**
   * Detect patterns in data
   */
  detectPatterns(
    data: Record<string, any>[],
    columns?: string[],
    confidenceThreshold: number = 0.7,
  ): PatternDto[] {
    const patterns: PatternDto[] = [];
    const targetColumns = columns || (data.length > 0 ? Object.keys(data[0]) : []);

    // Get numeric columns
    const numericColumns = targetColumns.filter((col) => {
      const values = data.map((row) => row[col]).filter((v) => v !== null && v !== undefined);
      return values.length > 0 && values.every((v) => typeof v === 'number' || !isNaN(parseFloat(v)));
    });

    // Detect trends in numeric columns
    numericColumns.forEach((col) => {
      const values = data
        .map((row) => row[col])
        .filter((v) => v !== null && v !== undefined)
        .map((v) => (typeof v === 'number' ? v : parseFloat(v)));

      if (values.length >= 5) {
        const trend = this.detectTrend(values);
        if (trend.confidence >= confidenceThreshold) {
          patterns.push({
            type: 'trend',
            description: `${col} shows a ${trend.direction} trend`,
            columns: [col],
            confidence: trend.confidence,
            details: {
              direction: trend.direction,
              slope: trend.slope,
              rSquared: trend.rSquared,
            },
          });
        }
      }
    });

    // Detect correlations between numeric columns
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
          const correlation = this.calculateCorrelation(values1, values2);
          const absCorrelation = Math.abs(correlation);

          if (absCorrelation >= confidenceThreshold) {
            const correlationType = correlation > 0 ? 'positive' : 'negative';
            patterns.push({
              type: 'correlation',
              description: `${col1} and ${col2} have a ${correlationType} correlation`,
              columns: [col1, col2],
              confidence: absCorrelation,
              details: {
                coefficient: correlation,
                correlationType,
              },
            });
          }
        }
      }
    }

    // Detect seasonality in time-series data
    const dateColumns = targetColumns.filter((col) => {
      const values = data.map((row) => row[col]).filter((v) => v !== null && v !== undefined);
      return values.length > 0 && values.some((v) => this.isDateString(String(v)));
    });

    if (dateColumns.length > 0 && numericColumns.length > 0) {
      // Check for weekly/monthly patterns
      numericColumns.forEach((numCol) => {
        const seasonality = this.detectSeasonality(data, dateColumns[0], numCol);
        if (seasonality && seasonality.confidence >= confidenceThreshold) {
          patterns.push({
            type: 'seasonality',
            description: `${numCol} shows ${seasonality.period} seasonality`,
            columns: [dateColumns[0], numCol],
            confidence: seasonality.confidence,
            details: {
              period: seasonality.period,
              peaks: seasonality.peaks,
            },
          });
        }
      });
    }

    return patterns;
  }

  /**
   * Detect trend in numeric values
   */
  private detectTrend(values: number[]): {
    direction: 'increasing' | 'decreasing' | 'stable';
    slope: number;
    confidence: number;
    rSquared: number;
  } {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (x[i] - xMean) * (values[i] - yMean);
      denominator += (x[i] - xMean) * (x[i] - xMean);
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;

    // Calculate R-squared
    let ssRes = 0;
    let ssTot = 0;

    for (let i = 0; i < n; i++) {
      const predicted = slope * x[i] + intercept;
      ssRes += Math.pow(values[i] - predicted, 2);
      ssTot += Math.pow(values[i] - yMean, 2);
    }

    const rSquared = ssTot !== 0 ? 1 - ssRes / ssTot : 0;

    // Determine direction
    let direction: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(slope) < 0.001 * Math.abs(yMean)) {
      direction = 'stable';
    } else if (slope > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }

    return {
      direction,
      slope,
      confidence: Math.abs(rSquared),
      rSquared,
    };
  }

  /**
   * Detect seasonality in time-series data
   */
  private detectSeasonality(
    data: Record<string, any>[],
    dateColumn: string,
    valueColumn: string,
  ): { period: string; confidence: number; peaks: string[] } | null {
    try {
      // Group by day of week
      const dayOfWeekGroups = new Map<number, number[]>();

      data.forEach((row) => {
        const date = new Date(row[dateColumn]);
        const value = parseFloat(row[valueColumn]);

        if (!isNaN(date.getTime()) && !isNaN(value)) {
          const dayOfWeek = date.getDay();
          if (!dayOfWeekGroups.has(dayOfWeek)) {
            dayOfWeekGroups.set(dayOfWeek, []);
          }
          dayOfWeekGroups.get(dayOfWeek)!.push(value);
        }
      });

      if (dayOfWeekGroups.size >= 5) {
        const dayAverages = Array.from(dayOfWeekGroups.entries())
          .map(([day, values]) => ({
            day,
            avg: values.reduce((a, b) => a + b, 0) / values.length,
          }))
          .sort((a, b) => a.day - b.day);

        const overallAvg = dayAverages.reduce((a, b) => a + b.avg, 0) / dayAverages.length;
        const variance =
          dayAverages.reduce((a, b) => a + Math.pow(b.avg - overallAvg, 2), 0) / dayAverages.length;
        const coefficientOfVariation = Math.sqrt(variance) / overallAvg;

        if (coefficientOfVariation > 0.1) {
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const peaks = dayAverages
            .filter((d) => d.avg > overallAvg * 1.1)
            .map((d) => days[d.day]);

          return {
            period: 'weekly',
            confidence: Math.min(coefficientOfVariation, 1),
            peaks,
          };
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Calculate data quality score
   */
  calculateDataQualityScore(data: Record<string, any>[], columns: string[]): number {
    if (data.length === 0 || columns.length === 0) return 0;

    let totalScore = 0;
    let totalWeight = 0;

    columns.forEach((col) => {
      const values = data.map((row) => row[col]);
      const nullCount = values.filter((v) => v === null || v === undefined || v === '').length;
      const completeness = 1 - nullCount / values.length;

      // Consistency check (same type throughout)
      const types = new Set(
        values
          .filter((v) => v !== null && v !== undefined && v !== '')
          .map((v) => typeof v),
      );
      const consistency = types.size <= 1 ? 1 : 0.5;

      // Uniqueness check
      const uniqueCount = new Set(values.filter((v) => v !== null && v !== undefined)).size;
      const uniqueness = uniqueCount / Math.max(values.filter((v) => v !== null && v !== undefined).length, 1);

      const columnScore = completeness * 0.5 + consistency * 0.3 + uniqueness * 0.2;
      totalScore += columnScore;
      totalWeight += 1;
    });

    return Math.round((totalScore / totalWeight) * 100);
  }
}
