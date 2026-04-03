import { Injectable, Logger } from '@nestjs/common';
import * as Papa from 'papaparse';
import { ParseOptionsDto, ParsedDataResponseDto } from '../dto/data-analysis.dto';

export interface CSVParseResult {
  data: Record<string, any>[];
  columns: string[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

@Injectable()
export class CSVParser {
  private readonly logger = new Logger(CSVParser.name);

  /**
   * Parse CSV content from a string
   */
  parseString(content: string, options: ParseOptionsDto = {}): CSVParseResult {
    const {
      delimiter = ',',
      hasHeader = true,
      skipEmptyLines = true,
      columns,
      maxRows,
      dynamicTyping = true,
    } = options;

    this.logger.log(`Parsing CSV string (${content.length} chars)`);

    const result = Papa.parse(content, {
      delimiter: delimiter === 'auto' ? undefined : delimiter,
      header: hasHeader,
      skipEmptyLines: skipEmptyLines ? 'greedy' : false,
      dynamicTyping,
      transformHeader: (header: string) => header.trim(),
      transform: (value: string) => {
        if (typeof value === 'string') {
          return value.trim();
        }
        return value;
      },
    });

    let data = result.data as Record<string, any>[];

    // Filter columns if specified
    if (columns && columns.length > 0 && hasHeader) {
      data = data.map((row) => {
        const filtered: Record<string, any> = {};
        columns.forEach((col) => {
          if (col in row) {
            filtered[col] = row[col];
          }
        });
        return filtered;
      });
    }

    // Limit rows if specified
    if (maxRows && maxRows > 0) {
      data = data.slice(0, maxRows);
    }

    const detectedColumns = hasHeader
      ? result.meta.fields || []
      : this.generateColumnNames(data[0] ? Object.keys(data[0]).length : 0);

    return {
      data,
      columns: columns || detectedColumns,
      errors: result.errors,
      meta: result.meta,
    };
  }

  /**
   * Parse CSV content from a Buffer
   */
  parseBuffer(buffer: Buffer, options: ParseOptionsDto = {}): CSVParseResult {
    const encoding = (options.encoding || 'utf-8') as BufferEncoding;
    const content = buffer.toString(encoding);
    return this.parseString(content, options);
  }

  /**
   * Parse CSV and return formatted response
   */
  parse(input: string | Buffer, options: ParseOptionsDto = {}): ParsedDataResponseDto {
    const result = typeof input === 'string'
      ? this.parseString(input, options)
      : this.parseBuffer(input, options);

    const metadata = this.analyzeColumns(result.data, result.columns);
    const warnings: string[] = [];

    // Add warnings for parsing errors
    result.errors.forEach((error) => {
      warnings.push(`Row ${error.row}: ${error.message}`);
    });

    // Add warnings for data quality issues
    metadata.forEach((col) => {
      if (col.nullCount > result.data.length * 0.5) {
        warnings.push(`Column "${col.name}" has more than 50% null values`);
      }
    });

    return {
      data: result.data,
      columns: result.columns,
      rowCount: result.data.length,
      metadata,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Analyze columns to determine types and statistics
   */
  private analyzeColumns(data: Record<string, any>[], columns: string[]) {
    return columns.map((name) => {
      const values = data.map((row) => row[name]);
      const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== '');
      const uniqueValues = new Set(nonNullValues);

      return {
        name,
        type: this.detectType(nonNullValues),
        nullCount: values.length - nonNullValues.length,
        uniqueCount: uniqueValues.size,
        sample: nonNullValues.slice(0, 5),
      };
    });
  }

  /**
   * Detect the type of values in a column
   */
  private detectType(values: any[]): 'string' | 'number' | 'boolean' | 'date' | 'null' | 'mixed' {
    if (values.length === 0) return 'null';

    const types = new Set<string>();

    for (const value of values.slice(0, 100)) {
      if (value === null || value === undefined || value === '') {
        continue;
      }

      if (typeof value === 'number' && !isNaN(value)) {
        types.add('number');
      } else if (typeof value === 'boolean') {
        types.add('boolean');
      } else if (typeof value === 'string') {
        // Check if it's a date
        if (this.isDateString(value)) {
          types.add('date');
        } else if (this.isNumericString(value)) {
          types.add('number');
        } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
          types.add('boolean');
        } else {
          types.add('string');
        }
      } else {
        types.add('string');
      }
    }

    if (types.size === 0) return 'null';
    if (types.size === 1) return types.values().next().value;
    return 'mixed';
  }

  /**
   * Check if a string is a valid date
   */
  private isDateString(value: string): boolean {
    // Common date patterns
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
      /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO format
    ];

    return datePatterns.some((pattern) => pattern.test(value));
  }

  /**
   * Check if a string represents a number
   */
  private isNumericString(value: string): boolean {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (trimmed === '') return false;
    return !isNaN(Number(trimmed)) && !isNaN(parseFloat(trimmed));
  }

  /**
   * Generate column names for headerless CSVs
   */
  private generateColumnNames(count: number): string[] {
    return Array.from({ length: count }, (_, i) => `Column_${i + 1}`);
  }

  /**
   * Convert parsed data back to CSV string
   */
  toCSV(data: Record<string, any>[], options: { columns?: string[] } = {}): string {
    const columns = options.columns || (data.length > 0 ? Object.keys(data[0]) : []);

    return Papa.unparse(data, {
      columns,
      header: true,
    });
  }

  /**
   * Validate CSV structure
   */
  validate(content: string | Buffer, options: ParseOptionsDto = {}): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const result = this.parse(content, options);

      if (result.rowCount === 0) {
        errors.push('No data rows found');
      }

      if (result.columns.length === 0) {
        errors.push('No columns detected');
      }

      // Check for duplicate column names
      const columnSet = new Set<string>();
      result.columns.forEach((col) => {
        if (columnSet.has(col)) {
          errors.push(`Duplicate column name: "${col}"`);
        }
        columnSet.add(col);
      });

      // Check for empty column names
      result.columns.forEach((col, index) => {
        if (!col || col.trim() === '') {
          warnings.push(`Column ${index + 1} has an empty name`);
        }
      });

      if (result.warnings) {
        warnings.push(...result.warnings);
      }
    } catch (error: any) {
      errors.push(`Parse error: ${error.message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
