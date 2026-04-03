/**
 * LLM Prompts for Data Analysis Agents
 */

export const QUERY_ENGINE_PROMPTS = {
  systemPrompt: `You are an expert SQL query generator. Your job is to convert natural language questions into accurate, safe SQL queries.

Rules:
1. Only generate SELECT queries - never INSERT, UPDATE, DELETE, DROP, etc.
2. Always use proper quoting for string values
3. Be conservative with results - include LIMIT if not specified
4. Handle NULL values appropriately
5. Use clear column aliases when helpful
6. Prefer explicit column names over SELECT *`,

  translateToSQL: `Convert the following natural language query to SQL.

Table Name: {{tableName}}

Schema:
{{schemaDescription}}

User Query: "{{naturalLanguageQuery}}"

Previous queries for context:
{{previousQueries}}

Important:
- Generate a valid SELECT query only
- Limit results to {{maxRows}} rows unless user specifies otherwise
- Use column names exactly as shown in the schema
- For date comparisons, use appropriate date functions
- Include ORDER BY when it makes sense

Return a JSON object with:
{
  "sql": "the SQL query",
  "explanation": "brief explanation of what the query does",
  "confidence": 0.0-1.0,
  "visualizations": ["suggested chart types for results"]
}`,

  explainQuery: `Explain what this SQL query does in plain English:

\`\`\`sql
{{sql}}
\`\`\`

Provide a clear, non-technical explanation that anyone can understand.`,

  suggestFollowUp: `Based on this query and its results, suggest 3-5 follow-up queries the user might find useful.

Original Query: "{{originalQuery}}"

Schema:
{{schema}}

Result Summary: {{resultSummary}}

Return a JSON array of natural language query suggestions:
["suggestion 1", "suggestion 2", ...]`,
};

export const CHART_BUILDER_PROMPTS = {
  systemPrompt: `You are a data visualization expert. Your job is to analyze data and recommend the best chart types and configurations for clear, insightful visualizations.`,

  suggestCharts: `Analyze this data and suggest the best chart types for visualization.

Data Summary:
- Row count: {{rowCount}}
- Columns: {{columns}}
- Column types: {{columnTypes}}
- Sample data: {{sampleData}}

User's goal (if any): {{userGoal}}

For each suggestion, provide:
1. Chart type (bar, line, pie, scatter, heatmap, etc.)
2. Which columns to use for x-axis, y-axis, series
3. Why this visualization is appropriate
4. Any recommended grouping or aggregation

Return a JSON array:
[
  {
    "chartType": "bar",
    "title": "suggested title",
    "xAxis": "column_name",
    "yAxis": "column_name",
    "series": "optional_column",
    "aggregation": "sum|avg|count|none",
    "reason": "why this chart is useful"
  }
]`,

  generateChartConfig: `Generate a complete chart configuration for this visualization request.

Data columns: {{columns}}
Chart type: {{chartType}}
X-axis field: {{xAxis}}
Y-axis field: {{yAxis}}
Series field: {{series}}

User customization requests: {{customizations}}

Return a complete Chart.js compatible configuration object as JSON.`,
};

export const FINANCE_ANALYZER_PROMPTS = {
  systemPrompt: `You are a financial analyst expert. Analyze financial data and provide insights on performance, ratios, trends, and recommendations.`,

  analyzePnL: `Analyze this Profit & Loss data and provide insights.

Data:
{{data}}

Time period: {{period}}

Provide:
1. Revenue analysis (growth, trends)
2. Cost structure analysis
3. Margin analysis (gross, operating, net)
4. Key performance indicators
5. Year-over-year or period comparisons if data available
6. Warnings or concerns
7. Recommendations

Return as structured JSON:
{
  "summary": "executive summary",
  "revenue": { ... },
  "costs": { ... },
  "margins": { ... },
  "kpis": [ ... ],
  "comparisons": [ ... ],
  "warnings": [ ... ],
  "recommendations": [ ... ]
}`,

  calculateRatios: `Calculate financial ratios from this data.

Data:
{{data}}

Calculate and explain:
1. Liquidity ratios (current, quick, cash)
2. Profitability ratios (gross margin, net margin, ROE, ROA)
3. Leverage ratios (debt-to-equity, interest coverage)
4. Efficiency ratios (asset turnover, inventory turnover, receivables days)

For each ratio provide:
- Calculated value
- Industry benchmark comparison if possible
- Assessment (good, average, concerning)
- Recommendation

Return as JSON with structure for each ratio category.`,

  generateForecast: `Generate a financial forecast based on historical data.

Historical Data:
{{historicalData}}

Forecast Period: {{periods}} periods ahead

Consider:
1. Historical trends and growth rates
2. Seasonality patterns
3. Recent performance changes
4. Reasonable assumptions for projection

Return:
{
  "method": "methodology used",
  "assumptions": ["list of assumptions"],
  "forecast": [
    { "period": "label", "value": number, "lower": number, "upper": number }
  ],
  "confidence": 0.0-1.0,
  "risks": ["potential risks to forecast"],
  "notes": "additional commentary"
}`,
};

export const DATA_INSIGHTS_PROMPTS = {
  systemPrompt: `You are a data analyst expert. Analyze data to discover patterns, anomalies, and actionable insights.`,

  generateInsights: `Analyze this dataset and generate key insights.

Dataset Overview:
- Rows: {{rowCount}}
- Columns: {{columnCount}}
- Types: {{columnTypes}}

Statistics:
{{statistics}}

Correlations found:
{{correlations}}

Outliers detected:
{{outliers}}

Patterns:
{{patterns}}

Generate 3-5 actionable insights that would be valuable for decision-making.

For each insight provide:
{
  "insight": "clear statement of the finding",
  "evidence": "data points supporting this",
  "impact": "high|medium|low",
  "recommendation": "suggested action",
  "visualization": "best way to visualize this"
}

Return as JSON array of insights.`,

  summarizeData: `Provide a comprehensive summary of this dataset.

Data:
{{sampleData}}

Column Statistics:
{{statistics}}

Write a natural language summary covering:
1. What the data represents
2. Key metrics and their values
3. Notable patterns or trends
4. Data quality observations
5. Suggested analyses

Keep the summary concise but informative (2-3 paragraphs).`,

  detectAnomalies: `Analyze this data for anomalies and outliers.

Data:
{{data}}

Column: {{column}}
Statistics: {{statistics}}

Identify:
1. Statistical outliers (using IQR and Z-score methods)
2. Unusual patterns or unexpected values
3. Data quality issues
4. Potential data entry errors

For each anomaly found:
{
  "type": "outlier|pattern|quality",
  "value": the anomalous value,
  "index": row index if applicable,
  "severity": "high|medium|low",
  "explanation": "why this is anomalous",
  "recommendation": "suggested action"
}

Return as JSON array.`,
};
