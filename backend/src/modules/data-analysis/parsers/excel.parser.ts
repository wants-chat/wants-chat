import { Injectable, Logger } from '@nestjs/common';
import { ParseOptionsDto, ParsedDataResponseDto } from '../dto/data-analysis.dto';

// Use require for xlsx to avoid TypeScript issues with dynamic imports
// eslint-disable-next-line @typescript-eslint/no-var-requires
let xlsx: any = null;

try {
  xlsx = require('xlsx');
} catch {
  // xlsx not installed - will be handled gracefully
}

@Injectable()
export class ExcelParser {
  private readonly logger = new Logger(ExcelParser.name);

  constructor() {
    if (xlsx) {
      this.logger.log('xlsx library loaded successfully');
    } else {
      this.logger.warn('xlsx library not available - Excel parsing disabled');
    }
  }

  /**
   * Check if Excel parsing is available
   */
  isAvailable(): boolean {
    return xlsx !== null;
  }

  /**
   * Parse Excel file from Buffer
   */
  async parseBuffer(buffer: Buffer, options: ParseOptionsDto = {}): Promise<ParsedDataResponseDto> {
    if (!xlsx) {
      throw new Error('Excel parsing is not available. Please install the xlsx package: npm install xlsx');
    }

    const {
      sheet = 0,
      hasHeader = true,
      columns,
      maxRows,
    } = options;

    this.logger.log(`Parsing Excel buffer (${buffer.length} bytes)`);

    try {
      const workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true });

      // Get the target sheet
      let sheetName: string;
      if (typeof sheet === 'number') {
        if (sheet >= workbook.SheetNames.length) {
          throw new Error(`Sheet index ${sheet} not found. Available sheets: ${workbook.SheetNames.join(', ')}`);
        }
        sheetName = workbook.SheetNames[sheet];
      } else {
        if (!workbook.SheetNames.includes(sheet)) {
          throw new Error(`Sheet "${sheet}" not found. Available sheets: ${workbook.SheetNames.join(', ')}`);
        }
        sheetName = sheet;
      }

      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON
      let data = xlsx.utils.sheet_to_json(worksheet, {
        header: hasHeader ? undefined : 1,
        raw: false,
        defval: null,
      }) as Record<string, any>[];

      // Handle headerless mode
      if (!hasHeader && data.length > 0) {
        const firstRow = data[0];
        const columnCount = Object.keys(firstRow).length;
        const columnNames = this.generateColumnNames(columnCount);

        data = data.map((row) => {
          const newRow: Record<string, any> = {};
          Object.values(row).forEach((value, index) => {
            newRow[columnNames[index]] = value;
          });
          return newRow;
        });
      }

      // Filter columns if specified
      if (columns && columns.length > 0) {
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

      // Convert types
      data = data.map((row) => this.convertRowTypes(row));

      // Get column names
      const detectedColumns = data.length > 0 ? Object.keys(data[0]) : [];

      // Analyze columns
      const metadata = this.analyzeColumns(data, columns || detectedColumns);

      return {
        data,
        columns: columns || detectedColumns,
        rowCount: data.length,
        metadata,
        warnings: undefined,
      };
    } catch (error: any) {
      this.logger.error(`Excel parsing error: ${error.message}`);
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  }

  /**
   * Parse Excel file and return formatted response
   */
  async parse(input: Buffer, options: ParseOptionsDto = {}): Promise<ParsedDataResponseDto> {
    return this.parseBuffer(input, options);
  }

  /**
   * Get sheet names from an Excel file
   */
  async getSheetNames(buffer: Buffer): Promise<string[]> {
    if (!xlsx) {
      throw new Error('Excel parsing is not available');
    }

    const workbook = xlsx.read(buffer, { type: 'buffer' });
    return workbook.SheetNames;
  }

  /**
   * Convert row values to appropriate types
   */
  private convertRowTypes(row: Record<string, any>): Record<string, any> {
    const converted: Record<string, any> = {};

    for (const [key, value] of Object.entries(row)) {
      if (value === null || value === undefined) {
        converted[key] = null;
        continue;
      }

      if (typeof value === 'string') {
        const trimmed = value.trim();

        // Try to convert to number
        if (this.isNumericString(trimmed)) {
          converted[key] = parseFloat(trimmed);
          continue;
        }

        // Check for boolean
        if (trimmed.toLowerCase() === 'true') {
          converted[key] = true;
          continue;
        }
        if (trimmed.toLowerCase() === 'false') {
          converted[key] = false;
          continue;
        }

        // Check for date (Excel sometimes returns date strings)
        if (this.isDateString(trimmed)) {
          converted[key] = trimmed;
          continue;
        }

        converted[key] = trimmed;
      } else if (value instanceof Date) {
        converted[key] = value.toISOString();
      } else {
        converted[key] = value;
      }
    }

    return converted;
  }

  /**
   * Check if a string represents a number
   */
  private isNumericString(value: string): boolean {
    if (value === '') return false;
    // Handle numbers with commas (e.g., "1,234.56")
    const normalized = value.replace(/,/g, '');
    return !isNaN(Number(normalized)) && !isNaN(parseFloat(normalized));
  }

  /**
   * Check if a string is a date
   */
  private isDateString(value: string): boolean {
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{2}\/\d{2}\/\d{4}$/,
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    ];
    return datePatterns.some((pattern) => pattern.test(value));
  }

  /**
   * Generate column names for headerless files
   */
  private generateColumnNames(count: number): string[] {
    return Array.from({ length: count }, (_, i) => `Column_${i + 1}`);
  }

  /**
   * Analyze columns
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
   * Detect the type of values
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
        if (this.isDateString(value)) {
          types.add('date');
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
   * Convert data to Excel buffer
   */
  async toExcel(data: Record<string, any>[], options: { sheetName?: string } = {}): Promise<Buffer> {
    if (!xlsx) {
      throw new Error('Excel generation is not available');
    }

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Sheet1');

    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Validate Excel file structure
   */
  async validate(buffer: Buffer, options: ParseOptionsDto = {}): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    sheetNames: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let sheetNames: string[] = [];

    try {
      if (!xlsx) {
        errors.push('Excel parsing library not available');
        return { valid: false, errors, warnings, sheetNames };
      }

      sheetNames = await this.getSheetNames(buffer);

      if (sheetNames.length === 0) {
        errors.push('No sheets found in the Excel file');
      }

      const result = await this.parse(buffer, options);

      if (result.rowCount === 0) {
        warnings.push('No data rows found in the selected sheet');
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
    } catch (error: any) {
      errors.push(`Parse error: ${error.message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      sheetNames,
    };
  }
}
