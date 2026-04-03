import { Injectable } from '@nestjs/common';
import { AiService } from '../../ai/ai.service';
import { BaseAnalysisAgent, AgentResponse } from './base-analysis.agent';
import { FINANCE_ANALYZER_PROMPTS } from '../prompts/analysis.prompts';

export interface FinancialRatios {
  liquidity: {
    currentRatio?: number;
    quickRatio?: number;
    cashRatio?: number;
  };
  profitability: {
    grossMargin?: number;
    operatingMargin?: number;
    netMargin?: number;
    roe?: number;
    roa?: number;
  };
  leverage: {
    debtToEquity?: number;
    debtRatio?: number;
    interestCoverage?: number;
  };
  efficiency: {
    assetTurnover?: number;
    inventoryTurnover?: number;
    receivablesDays?: number;
    payablesDays?: number;
  };
}

export interface PnLAnalysis {
  summary: string;
  revenue: {
    total: number;
    growth?: number;
    trend: 'up' | 'down' | 'stable';
    breakdown?: Record<string, number>;
  };
  costs: {
    total: number;
    cogs?: number;
    operating?: number;
    breakdown?: Record<string, number>;
  };
  margins: {
    gross?: number;
    operating?: number;
    net?: number;
    trends?: { period: string; margin: number }[];
  };
  insights: string[];
  warnings: string[];
  recommendations: string[];
}

export interface ForecastResult {
  method: string;
  assumptions: string[];
  predictions: {
    period: string;
    value: number;
    lower: number;
    upper: number;
  }[];
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  risks: string[];
  notes?: string;
}

export interface BudgetComparison {
  period: string;
  categories: {
    name: string;
    budgeted: number;
    actual: number;
    variance: number;
    variancePercent: number;
    status: 'under' | 'on_track' | 'over';
  }[];
  summary: {
    totalBudget: number;
    totalActual: number;
    totalVariance: number;
    onTrackCount: number;
    overBudgetCount: number;
  };
}

@Injectable()
export class FinanceAnalyzerAgent extends BaseAnalysisAgent {
  constructor(aiService: AiService) {
    super(aiService, 'FinanceAnalyzerAgent');
  }

  /**
   * Analyze Profit & Loss data
   */
  async analyzePnL(
    data: any[],
    options: {
      revenueColumn?: string;
      costColumns?: string[];
      dateColumn?: string;
      period?: string;
    } = {},
  ): Promise<AgentResponse<PnLAnalysis>> {
    const startTime = Date.now();

    try {
      // First, try to calculate basic P&L metrics programmatically
      const programmaticAnalysis = this.calculateBasicPnL(data, options);

      // Then enhance with AI insights
      const prompt = FINANCE_ANALYZER_PROMPTS.analyzePnL
        .replace('{{data}}', JSON.stringify(data.slice(0, 50), null, 2))
        .replace('{{period}}', options.period || 'Not specified');

      const aiResponse = await this.generateWithAI(prompt, {
        systemPrompt: FINANCE_ANALYZER_PROMPTS.systemPrompt,
        temperature: 0.3,
      });

      const aiAnalysis = this.parseJSONResponse<any>(aiResponse);

      // Merge programmatic and AI analysis
      const analysis: PnLAnalysis = {
        ...programmaticAnalysis,
        insights: aiAnalysis?.insights || programmaticAnalysis.insights,
        warnings: aiAnalysis?.warnings || programmaticAnalysis.warnings,
        recommendations: aiAnalysis?.recommendations || programmaticAnalysis.recommendations,
      };

      return {
        success: true,
        data: analysis,
        metadata: {
          executionTimeMs: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      this.logger.error(`P&L analysis failed: ${error.message}`);
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
   * Calculate financial ratios
   */
  calculateRatios(financialData: {
    currentAssets?: number;
    currentLiabilities?: number;
    inventory?: number;
    cash?: number;
    totalAssets?: number;
    totalLiabilities?: number;
    totalEquity?: number;
    revenue?: number;
    cogs?: number;
    operatingExpenses?: number;
    netIncome?: number;
    interestExpense?: number;
    receivables?: number;
    payables?: number;
  }): AgentResponse<FinancialRatios> {
    const startTime = Date.now();

    try {
      const ratios: FinancialRatios = {
        liquidity: {},
        profitability: {},
        leverage: {},
        efficiency: {},
      };

      // Liquidity ratios
      if (financialData.currentAssets && financialData.currentLiabilities) {
        ratios.liquidity.currentRatio =
          financialData.currentAssets / financialData.currentLiabilities;

        if (financialData.inventory !== undefined) {
          ratios.liquidity.quickRatio =
            (financialData.currentAssets - financialData.inventory) /
            financialData.currentLiabilities;
        }

        if (financialData.cash !== undefined) {
          ratios.liquidity.cashRatio =
            financialData.cash / financialData.currentLiabilities;
        }
      }

      // Profitability ratios
      if (financialData.revenue) {
        if (financialData.cogs !== undefined) {
          ratios.profitability.grossMargin =
            (financialData.revenue - financialData.cogs) / financialData.revenue;
        }

        if (financialData.operatingExpenses !== undefined && financialData.cogs !== undefined) {
          ratios.profitability.operatingMargin =
            (financialData.revenue - financialData.cogs - financialData.operatingExpenses) /
            financialData.revenue;
        }

        if (financialData.netIncome !== undefined) {
          ratios.profitability.netMargin = financialData.netIncome / financialData.revenue;

          if (financialData.totalEquity) {
            ratios.profitability.roe = financialData.netIncome / financialData.totalEquity;
          }

          if (financialData.totalAssets) {
            ratios.profitability.roa = financialData.netIncome / financialData.totalAssets;
          }
        }
      }

      // Leverage ratios
      if (financialData.totalLiabilities && financialData.totalEquity) {
        ratios.leverage.debtToEquity =
          financialData.totalLiabilities / financialData.totalEquity;
      }

      if (financialData.totalLiabilities && financialData.totalAssets) {
        ratios.leverage.debtRatio =
          financialData.totalLiabilities / financialData.totalAssets;
      }

      if (financialData.operatingExpenses && financialData.cogs &&
          financialData.revenue && financialData.interestExpense) {
        const ebit = financialData.revenue - financialData.cogs - financialData.operatingExpenses;
        ratios.leverage.interestCoverage = ebit / financialData.interestExpense;
      }

      // Efficiency ratios
      if (financialData.revenue && financialData.totalAssets) {
        ratios.efficiency.assetTurnover =
          financialData.revenue / financialData.totalAssets;
      }

      if (financialData.cogs && financialData.inventory) {
        ratios.efficiency.inventoryTurnover =
          financialData.cogs / financialData.inventory;
      }

      if (financialData.receivables && financialData.revenue) {
        ratios.efficiency.receivablesDays =
          (financialData.receivables / financialData.revenue) * 365;
      }

      if (financialData.payables && financialData.cogs) {
        ratios.efficiency.payablesDays =
          (financialData.payables / financialData.cogs) * 365;
      }

      return {
        success: true,
        data: ratios,
        metadata: {
          executionTimeMs: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      this.logger.error(`Ratio calculation failed: ${error.message}`);
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
   * Generate financial forecast
   */
  async generateForecast(
    historicalData: { period: string; value: number }[],
    periods: number,
    options: {
      method?: 'linear' | 'exponential' | 'moving_average';
      seasonality?: boolean;
    } = {},
  ): Promise<AgentResponse<ForecastResult>> {
    const startTime = Date.now();

    try {
      const values = historicalData.map(d => d.value);
      const method = options.method || 'linear';

      // Calculate programmatic forecast
      let predictions: ForecastResult['predictions'];

      switch (method) {
        case 'exponential':
          predictions = this.exponentialSmoothing(historicalData, periods);
          break;
        case 'moving_average':
          predictions = this.movingAverageForecast(historicalData, periods);
          break;
        case 'linear':
        default:
          predictions = this.linearForecast(historicalData, periods);
      }

      // Calculate trend
      const trend = this.determineTrend(values);

      // Use AI for additional insights
      const prompt = FINANCE_ANALYZER_PROMPTS.generateForecast
        .replace('{{historicalData}}', JSON.stringify(historicalData, null, 2))
        .replace('{{periods}}', String(periods));

      const aiResponse = await this.generateWithAI(prompt, {
        systemPrompt: FINANCE_ANALYZER_PROMPTS.systemPrompt,
        temperature: 0.3,
      });

      const aiInsights = this.parseJSONResponse<any>(aiResponse);

      return {
        success: true,
        data: {
          method: method,
          assumptions: aiInsights?.assumptions || [`Using ${method} regression model`],
          predictions,
          confidence: this.calculateForecastConfidence(values),
          trend,
          risks: aiInsights?.risks || [],
          notes: aiInsights?.notes,
        },
        metadata: {
          executionTimeMs: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      this.logger.error(`Forecast generation failed: ${error.message}`);
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
   * Compare budget vs actual
   */
  compareBudget(
    budgetData: { category: string; amount: number }[],
    actualData: { category: string; amount: number }[],
    period: string,
  ): AgentResponse<BudgetComparison> {
    const startTime = Date.now();

    try {
      const budgetMap = new Map(budgetData.map(b => [b.category, b.amount]));
      const actualMap = new Map(actualData.map(a => [a.category, a.amount]));

      const allCategories = new Set([
        ...budgetData.map(b => b.category),
        ...actualData.map(a => a.category),
      ]);

      const categories = Array.from(allCategories).map(name => {
        const budgeted = budgetMap.get(name) || 0;
        const actual = actualMap.get(name) || 0;
        const variance = actual - budgeted;
        const variancePercent = budgeted !== 0 ? (variance / budgeted) * 100 : 0;

        let status: 'under' | 'on_track' | 'over';
        if (variancePercent > 5) status = 'over';
        else if (variancePercent < -5) status = 'under';
        else status = 'on_track';

        return {
          name,
          budgeted,
          actual,
          variance,
          variancePercent,
          status,
        };
      });

      const totalBudget = budgetData.reduce((sum, b) => sum + b.amount, 0);
      const totalActual = actualData.reduce((sum, a) => sum + a.amount, 0);

      return {
        success: true,
        data: {
          period,
          categories,
          summary: {
            totalBudget,
            totalActual,
            totalVariance: totalActual - totalBudget,
            onTrackCount: categories.filter(c => c.status === 'on_track').length,
            overBudgetCount: categories.filter(c => c.status === 'over').length,
          },
        },
        metadata: {
          executionTimeMs: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      this.logger.error(`Budget comparison failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        metadata: {
          executionTimeMs: Date.now() - startTime,
        },
      };
    }
  }

  // ============================================
  // Private helper methods
  // ============================================

  private calculateBasicPnL(data: any[], options: any): PnLAnalysis {
    // Try to identify revenue and cost columns automatically
    const columns = Object.keys(data[0] || {});
    const revenueCol = options.revenueColumn || this.findColumn(columns, ['revenue', 'sales', 'income']);
    const costCols = options.costColumns || [
      this.findColumn(columns, ['cost', 'cogs', 'expense']),
    ].filter(Boolean);

    let totalRevenue = 0;
    let totalCosts = 0;

    for (const row of data) {
      if (revenueCol && row[revenueCol]) {
        totalRevenue += parseFloat(row[revenueCol]) || 0;
      }
      for (const costCol of costCols) {
        if (costCol && row[costCol]) {
          totalCosts += parseFloat(row[costCol]) || 0;
        }
      }
    }

    const grossMargin = totalRevenue > 0 ? (totalRevenue - totalCosts) / totalRevenue : 0;

    return {
      summary: `Revenue: ${this.formatNumber(totalRevenue)}, Costs: ${this.formatNumber(totalCosts)}`,
      revenue: {
        total: totalRevenue,
        trend: 'stable',
      },
      costs: {
        total: totalCosts,
      },
      margins: {
        gross: grossMargin,
      },
      insights: [],
      warnings: [],
      recommendations: [],
    };
  }

  private findColumn(columns: string[], keywords: string[]): string | undefined {
    const lowerColumns = columns.map(c => c.toLowerCase());
    for (const keyword of keywords) {
      const index = lowerColumns.findIndex(c => c.includes(keyword));
      if (index >= 0) return columns[index];
    }
    return undefined;
  }

  private linearForecast(
    data: { period: string; value: number }[],
    periods: number,
  ): ForecastResult['predictions'] {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data.map(d => d.value);

    // Calculate linear regression
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate standard error for confidence interval
    const residuals = y.map((yi, i) => yi - (intercept + slope * i));
    const stdError = Math.sqrt(residuals.reduce((sum, r) => sum + r * r, 0) / (n - 2));

    const predictions: ForecastResult['predictions'] = [];
    for (let i = 0; i < periods; i++) {
      const futureX = n + i;
      const value = intercept + slope * futureX;
      const margin = 1.96 * stdError * Math.sqrt(1 + 1 / n + Math.pow(futureX - sumX / n, 2) / sumXX);

      predictions.push({
        period: `Period ${n + i + 1}`,
        value: Math.round(value * 100) / 100,
        lower: Math.round((value - margin) * 100) / 100,
        upper: Math.round((value + margin) * 100) / 100,
      });
    }

    return predictions;
  }

  private exponentialSmoothing(
    data: { period: string; value: number }[],
    periods: number,
    alpha = 0.3,
  ): ForecastResult['predictions'] {
    const values = data.map(d => d.value);
    let smoothed = values[0];

    for (let i = 1; i < values.length; i++) {
      smoothed = alpha * values[i] + (1 - alpha) * smoothed;
    }

    // Calculate forecast variance
    const residuals = values.map((v, i) => {
      if (i === 0) return 0;
      let s = values[0];
      for (let j = 1; j <= i; j++) {
        s = alpha * values[j] + (1 - alpha) * s;
      }
      return v - s;
    });
    const variance = residuals.reduce((sum, r) => sum + r * r, 0) / (values.length - 1);
    const stdDev = Math.sqrt(variance);

    const predictions: ForecastResult['predictions'] = [];
    for (let i = 0; i < periods; i++) {
      predictions.push({
        period: `Period ${values.length + i + 1}`,
        value: Math.round(smoothed * 100) / 100,
        lower: Math.round((smoothed - 1.96 * stdDev) * 100) / 100,
        upper: Math.round((smoothed + 1.96 * stdDev) * 100) / 100,
      });
    }

    return predictions;
  }

  private movingAverageForecast(
    data: { period: string; value: number }[],
    periods: number,
    window = 3,
  ): ForecastResult['predictions'] {
    const values = data.map(d => d.value);
    const recentValues = values.slice(-window);
    const average = recentValues.reduce((a, b) => a + b, 0) / window;

    const variance = recentValues.reduce((sum, v) => sum + Math.pow(v - average, 2), 0) / (window - 1);
    const stdDev = Math.sqrt(variance);

    const predictions: ForecastResult['predictions'] = [];
    for (let i = 0; i < periods; i++) {
      predictions.push({
        period: `Period ${values.length + i + 1}`,
        value: Math.round(average * 100) / 100,
        lower: Math.round((average - 1.96 * stdDev) * 100) / 100,
        upper: Math.round((average + 1.96 * stdDev) * 100) / 100,
      });
    }

    return predictions;
  }

  private determineTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';

    const first = values.slice(0, Math.ceil(values.length / 2));
    const second = values.slice(Math.ceil(values.length / 2));

    const firstAvg = first.reduce((a, b) => a + b, 0) / first.length;
    const secondAvg = second.reduce((a, b) => a + b, 0) / second.length;

    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (changePercent > 5) return 'increasing';
    if (changePercent < -5) return 'decreasing';
    return 'stable';
  }

  private calculateForecastConfidence(values: number[]): number {
    if (values.length < 3) return 0.5;

    // Calculate coefficient of variation
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const cv = Math.sqrt(variance) / mean;

    // Lower CV = higher confidence
    const confidence = Math.max(0.3, Math.min(0.95, 1 - cv));
    return Math.round(confidence * 100) / 100;
  }
}
