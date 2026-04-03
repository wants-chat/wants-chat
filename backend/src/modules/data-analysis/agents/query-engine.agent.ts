import { Injectable } from '@nestjs/common';
import { AiService } from '../../ai/ai.service';
import { BaseAnalysisAgent, AgentResponse } from './base-analysis.agent';
import { QUERY_ENGINE_PROMPTS } from '../prompts/analysis.prompts';

export interface ColumnSchema {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  nullable?: boolean;
  sampleValues?: any[];
}

export interface QueryTranslation {
  sql: string;
  explanation: string;
  confidence: number;
  suggestedVisualizations?: string[];
}

export interface QueryResult {
  columns: string[];
  rows: any[][];
  rowCount: number;
  executionTimeMs: number;
}

export interface QueryValidation {
  isValid: boolean;
  isReadOnly: boolean;
  errors?: string[];
  warnings?: string[];
}

@Injectable()
export class QueryEngineAgent extends BaseAnalysisAgent {
  private readonly BLOCKED_KEYWORDS = [
    'DROP', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE', 'DELETE',
    'GRANT', 'REVOKE', 'EXEC', 'EXECUTE', 'MERGE', 'CALL',
  ];

  constructor(aiService: AiService) {
    super(aiService, 'QueryEngineAgent');
  }

  /**
   * Translate natural language to SQL query
   */
  async translateToSQL(
    naturalLanguage: string,
    schema: ColumnSchema[],
    options: {
      tableName?: string;
      previousQueries?: string[];
      maxRows?: number;
    } = {},
  ): Promise<AgentResponse<QueryTranslation>> {
    const startTime = Date.now();

    try {
      const schemaDescription = this.formatSchemaForPrompt(schema);
      const tableName = options.tableName || 'data';

      const prompt = QUERY_ENGINE_PROMPTS.translateToSQL
        .replace('{{schemaDescription}}', schemaDescription)
        .replace('{{tableName}}', tableName)
        .replace('{{naturalLanguageQuery}}', naturalLanguage)
        .replace('{{previousQueries}}', options.previousQueries?.join('\n') || 'None')
        .replace('{{maxRows}}', String(options.maxRows || 1000));

      const response = await this.generateWithAI(prompt, {
        systemPrompt: QUERY_ENGINE_PROMPTS.systemPrompt,
        temperature: 0.2,
      });

      const parsed = this.parseJSONResponse<{
        sql: string;
        explanation: string;
        confidence: number;
        visualizations?: string[];
      }>(response);

      if (!parsed || !parsed.sql) {
        throw new Error('Failed to generate valid SQL');
      }

      // Validate the generated SQL
      const validation = this.validateSQL(parsed.sql);
      if (!validation.isValid) {
        throw new Error(`Invalid SQL: ${validation.errors?.join(', ')}`);
      }

      return {
        success: true,
        data: {
          sql: parsed.sql,
          explanation: parsed.explanation,
          confidence: parsed.confidence || 0.8,
          suggestedVisualizations: parsed.visualizations,
        },
        metadata: {
          executionTimeMs: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      this.logger.error(`Translation failed: ${error.message}`);
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
   * Validate SQL query for safety
   */
  validateSQL(sql: string): QueryValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const upperSQL = sql.toUpperCase();

    // Check for blocked keywords
    for (const keyword of this.BLOCKED_KEYWORDS) {
      if (upperSQL.includes(keyword)) {
        errors.push(`Blocked keyword detected: ${keyword}`);
      }
    }

    // Check if it's a SELECT query
    const isReadOnly = upperSQL.trim().startsWith('SELECT') ||
                       upperSQL.trim().startsWith('WITH');

    if (!isReadOnly) {
      errors.push('Only SELECT queries are allowed');
    }

    // Check for potential SQL injection patterns
    if (sql.includes('--') || sql.includes('/*')) {
      warnings.push('SQL comments detected - review query');
    }

    // Check for semicolons (multiple statements)
    const cleanSQL = sql.replace(/'[^']*'/g, ''); // Remove string literals
    if (cleanSQL.includes(';') && !cleanSQL.trim().endsWith(';')) {
      errors.push('Multiple SQL statements not allowed');
    }

    return {
      isValid: errors.length === 0,
      isReadOnly,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Execute SQL query on in-memory data
   */
  executeOnData(
    sql: string,
    data: any[],
    columns: ColumnSchema[],
  ): AgentResponse<QueryResult> {
    const startTime = Date.now();

    try {
      // Simple in-memory SQL execution for basic queries
      // This handles SELECT, WHERE, ORDER BY, LIMIT for flat data

      const result = this.executeSimpleQuery(sql, data, columns);

      return {
        success: true,
        data: {
          ...result,
          executionTimeMs: Date.now() - startTime,
        },
        metadata: {
          executionTimeMs: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      this.logger.error(`Query execution failed: ${error.message}`);
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
   * Simple in-memory query execution
   */
  private executeSimpleQuery(
    sql: string,
    data: any[],
    columns: ColumnSchema[],
  ): Omit<QueryResult, 'executionTimeMs'> {
    const upperSQL = sql.toUpperCase();

    // Parse SELECT columns
    const selectMatch = sql.match(/SELECT\s+(.*?)\s+FROM/i);
    const selectColumns = selectMatch
      ? this.parseSelectColumns(selectMatch[1], columns)
      : columns.map(c => c.name);

    // Parse WHERE clause
    const whereMatch = sql.match(/WHERE\s+(.*?)(?:ORDER|LIMIT|GROUP|$)/i);
    let filteredData = data;
    if (whereMatch) {
      filteredData = this.applyWhereClause(data, whereMatch[1]);
    }

    // Parse ORDER BY
    const orderMatch = sql.match(/ORDER\s+BY\s+(.*?)(?:LIMIT|$)/i);
    if (orderMatch) {
      filteredData = this.applyOrderBy(filteredData, orderMatch[1]);
    }

    // Parse LIMIT
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      filteredData = filteredData.slice(0, parseInt(limitMatch[1], 10));
    }

    // Build result
    const resultRows = filteredData.map(row =>
      selectColumns.map(col => row[col] ?? null),
    );

    return {
      columns: selectColumns,
      rows: resultRows,
      rowCount: resultRows.length,
    };
  }

  private parseSelectColumns(selectPart: string, columns: ColumnSchema[]): string[] {
    if (selectPart.trim() === '*') {
      return columns.map(c => c.name);
    }

    return selectPart.split(',').map(col => {
      // Handle aliases: column AS alias
      const aliasMatch = col.match(/(\w+)\s+AS\s+(\w+)/i);
      if (aliasMatch) {
        return aliasMatch[1].trim();
      }
      return col.trim();
    });
  }

  private applyWhereClause(data: any[], whereClause: string): any[] {
    // Simple WHERE clause parser for basic conditions
    // Supports: =, !=, <, >, <=, >=, LIKE, IN, AND, OR

    return data.filter(row => {
      try {
        return this.evaluateCondition(row, whereClause);
      } catch {
        return true; // Include row if condition parsing fails
      }
    });
  }

  private evaluateCondition(row: any, condition: string): boolean {
    // Handle OR conditions
    if (condition.toUpperCase().includes(' OR ')) {
      const parts = condition.split(/\s+OR\s+/i);
      return parts.some(part => this.evaluateCondition(row, part.trim()));
    }

    // Handle AND conditions
    if (condition.toUpperCase().includes(' AND ')) {
      const parts = condition.split(/\s+AND\s+/i);
      return parts.every(part => this.evaluateCondition(row, part.trim()));
    }

    // Parse single condition
    const operators = ['>=', '<=', '!=', '<>', '=', '>', '<', 'LIKE', 'IN'];

    for (const op of operators) {
      const regex = new RegExp(`(\\w+)\\s*${op}\\s*(.+)`, 'i');
      const match = condition.match(regex);

      if (match) {
        const [, column, valueStr] = match;
        const value = this.parseValue(valueStr.trim());
        const rowValue = row[column];

        switch (op.toUpperCase()) {
          case '=':
            return rowValue == value;
          case '!=':
          case '<>':
            return rowValue != value;
          case '>':
            return rowValue > value;
          case '<':
            return rowValue < value;
          case '>=':
            return rowValue >= value;
          case '<=':
            return rowValue <= value;
          case 'LIKE':
            const pattern = String(value).replace(/%/g, '.*').replace(/_/g, '.');
            return new RegExp(`^${pattern}$`, 'i').test(String(rowValue));
          case 'IN':
            const inValues = this.parseInValues(valueStr);
            return inValues.includes(rowValue);
        }
      }
    }

    return true;
  }

  private parseValue(valueStr: string): any {
    // Remove quotes
    if ((valueStr.startsWith("'") && valueStr.endsWith("'")) ||
        (valueStr.startsWith('"') && valueStr.endsWith('"'))) {
      return valueStr.slice(1, -1);
    }

    // Parse numbers
    const num = parseFloat(valueStr);
    if (!isNaN(num)) {
      return num;
    }

    // Parse booleans
    if (valueStr.toUpperCase() === 'TRUE') return true;
    if (valueStr.toUpperCase() === 'FALSE') return false;
    if (valueStr.toUpperCase() === 'NULL') return null;

    return valueStr;
  }

  private parseInValues(valueStr: string): any[] {
    const match = valueStr.match(/\((.*)\)/);
    if (!match) return [];

    return match[1].split(',').map(v => this.parseValue(v.trim()));
  }

  private applyOrderBy(data: any[], orderByClause: string): any[] {
    const parts = orderByClause.split(',').map(p => p.trim());
    const sortRules = parts.map(part => {
      const [column, direction = 'ASC'] = part.split(/\s+/);
      return {
        column,
        desc: direction.toUpperCase() === 'DESC',
      };
    });

    return [...data].sort((a, b) => {
      for (const rule of sortRules) {
        const aVal = a[rule.column];
        const bVal = b[rule.column];

        if (aVal === bVal) continue;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const comparison = aVal < bVal ? -1 : 1;
        return rule.desc ? -comparison : comparison;
      }
      return 0;
    });
  }

  private formatSchemaForPrompt(schema: ColumnSchema[]): string {
    return schema.map(col => {
      let desc = `- ${col.name} (${col.type})`;
      if (col.nullable) desc += ' [nullable]';
      if (col.sampleValues?.length) {
        desc += ` Examples: ${col.sampleValues.slice(0, 3).join(', ')}`;
      }
      return desc;
    }).join('\n');
  }

  /**
   * Explain what a SQL query does in plain English
   */
  async explainQuery(sql: string): Promise<AgentResponse<string>> {
    const startTime = Date.now();

    try {
      const prompt = QUERY_ENGINE_PROMPTS.explainQuery.replace('{{sql}}', sql);

      const explanation = await this.generateWithAI(prompt, {
        temperature: 0.3,
        maxTokens: 500,
      });

      return {
        success: true,
        data: explanation,
        metadata: {
          executionTimeMs: Date.now() - startTime,
        },
      };
    } catch (error: any) {
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
   * Suggest follow-up queries based on current results
   */
  async suggestFollowUpQueries(
    originalQuery: string,
    schema: ColumnSchema[],
    resultSummary: string,
  ): Promise<AgentResponse<string[]>> {
    const startTime = Date.now();

    try {
      const prompt = QUERY_ENGINE_PROMPTS.suggestFollowUp
        .replace('{{originalQuery}}', originalQuery)
        .replace('{{schema}}', this.formatSchemaForPrompt(schema))
        .replace('{{resultSummary}}', resultSummary);

      const response = await this.generateWithAI(prompt, {
        temperature: 0.5,
        maxTokens: 1000,
      });

      const suggestions = this.parseJSONResponse<string[]>(response);

      return {
        success: true,
        data: suggestions || [],
        metadata: {
          executionTimeMs: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        metadata: {
          executionTimeMs: Date.now() - startTime,
        },
      };
    }
  }
}
