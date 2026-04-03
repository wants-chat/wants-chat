/**
 * Tool Data Utilities
 *
 * Centralized utilities for data export, import, and management.
 * All tools should use these utilities for consistent behavior.
 *
 * Supports: CSV, Excel (XLSX), JSON, PDF exports
 * Future: API sync, cloud backup, sharing
 */

// ============================================
// TYPES
// ============================================

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: 'iso' | 'locale' | 'short';
  currencySymbol?: string;
}

export interface ColumnConfig {
  key: string;
  header: string;
  type?: 'string' | 'number' | 'date' | 'currency' | 'boolean';
  format?: (value: any) => string;
}

export interface ExportResult {
  success: boolean;
  filename?: string;
  error?: string;
}

// ============================================
// CSV EXPORT
// ============================================

/**
 * Escape CSV values properly (handles commas, quotes, newlines)
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Format value based on column type
 */
function formatValue(value: any, column: ColumnConfig, options: ExportOptions): string {
  if (value === null || value === undefined) return '';

  if (column.format) {
    return column.format(value);
  }

  switch (column.type) {
    case 'date':
      const date = new Date(value);
      if (isNaN(date.getTime())) return String(value);
      switch (options.dateFormat) {
        case 'iso': return date.toISOString();
        case 'short': return date.toLocaleDateString();
        default: return date.toLocaleString();
      }
    case 'currency':
      const num = parseFloat(value);
      if (isNaN(num)) return String(value);
      return `${options.currencySymbol || '$'}${num.toFixed(2)}`;
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'number':
      return String(value);
    default:
      return String(value);
  }
}

/**
 * Export data to CSV format
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: ColumnConfig[],
  options: ExportOptions = {}
): ExportResult {
  try {
    const { includeHeaders = true, filename = 'export' } = options;

    const rows: string[] = [];

    // Add header row
    if (includeHeaders) {
      rows.push(columns.map(col => escapeCSVValue(col.header)).join(','));
    }

    // Add data rows
    for (const item of data) {
      const row = columns.map(col => {
        const value = item[col.key];
        return escapeCSVValue(formatValue(value, col, options));
      });
      rows.push(row.join(','));
    }

    const csvContent = rows.join('\n');
    const finalFilename = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;

    downloadFile(csvContent, finalFilename, 'text/csv;charset=utf-8;');

    return { success: true, filename: finalFilename };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// ============================================
// JSON EXPORT
// ============================================

export interface JSONExportOptions extends ExportOptions {
  includeMetadata?: boolean;
  pretty?: boolean;
}

/**
 * Export data to JSON format with optional metadata
 */
export function exportToJSON<T>(
  data: T[],
  options: JSONExportOptions = {}
): ExportResult {
  try {
    const { filename = 'export', includeMetadata = true, pretty = true } = options;

    const exportData = includeMetadata ? {
      exportDate: new Date().toISOString(),
      recordCount: data.length,
      version: '1.0',
      data: data
    } : data;

    const jsonContent = pretty
      ? JSON.stringify(exportData, null, 2)
      : JSON.stringify(exportData);

    const finalFilename = `${filename}_${new Date().toISOString().split('T')[0]}.json`;

    downloadFile(jsonContent, finalFilename, 'application/json');

    return { success: true, filename: finalFilename };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// ============================================
// EXCEL EXPORT (Simple XLSX without external dependency)
// ============================================

/**
 * Export to Excel-compatible XML format (works without xlsx library)
 * This creates a SpreadsheetML file that Excel can open
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: ColumnConfig[],
  options: ExportOptions = {}
): ExportResult {
  try {
    const { filename = 'export' } = options;

    // Create Excel XML (SpreadsheetML format)
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<?mso-application progid="Excel.Sheet"?>\n';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
    xml += '  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
    xml += '  <Styles>\n';
    xml += '    <Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#E0E0E0" ss:Pattern="Solid"/></Style>\n';
    xml += '    <Style ss:ID="Currency"><NumberFormat ss:Format="$#,##0.00"/></Style>\n';
    xml += '    <Style ss:ID="Date"><NumberFormat ss:Format="yyyy-mm-dd"/></Style>\n';
    xml += '  </Styles>\n';
    xml += '  <Worksheet ss:Name="Data">\n';
    xml += '    <Table>\n';

    // Column widths
    columns.forEach(() => {
      xml += '      <Column ss:AutoFitWidth="1" ss:Width="120"/>\n';
    });

    // Header row
    xml += '      <Row>\n';
    columns.forEach(col => {
      xml += `        <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXML(col.header)}</Data></Cell>\n`;
    });
    xml += '      </Row>\n';

    // Data rows
    data.forEach(item => {
      xml += '      <Row>\n';
      columns.forEach(col => {
        const value = item[col.key];
        const formattedValue = formatValue(value, col, options);
        const type = col.type === 'number' || col.type === 'currency' ? 'Number' : 'String';
        const style = col.type === 'currency' ? ' ss:StyleID="Currency"' :
                      col.type === 'date' ? ' ss:StyleID="Date"' : '';
        xml += `        <Cell${style}><Data ss:Type="${type}">${escapeXML(formattedValue)}</Data></Cell>\n`;
      });
      xml += '      </Row>\n';
    });

    xml += '    </Table>\n';
    xml += '  </Worksheet>\n';
    xml += '</Workbook>';

    const finalFilename = `${filename}_${new Date().toISOString().split('T')[0]}.xls`;

    downloadFile(xml, finalFilename, 'application/vnd.ms-excel');

    return { success: true, filename: finalFilename };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

function escapeXML(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ============================================
// PDF EXPORT (Using jsPDF)
// ============================================

export interface PDFExportOptions extends ExportOptions {
  title?: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'letter';
}

/**
 * Export data to PDF format
 * Requires jsPDF to be installed: npm install jspdf
 */
export async function exportToPDF<T extends Record<string, any>>(
  data: T[],
  columns: ColumnConfig[],
  options: PDFExportOptions = {}
): Promise<ExportResult> {
  try {
    // Dynamic import to avoid bundling if not used
    const { jsPDF } = await import('jspdf');

    const {
      filename = 'export',
      title,
      subtitle,
      orientation = 'portrait',
      pageSize = 'a4'
    } = options;

    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = margin;

    // Title
    if (title) {
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(title, pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
    }

    // Subtitle
    if (subtitle) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;
    }

    // Export date
    doc.setFontSize(9);
    doc.setTextColor(128);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
    doc.setTextColor(0);
    yPos += 12;

    // Calculate column widths
    const availableWidth = pageWidth - (margin * 2);
    const colWidth = availableWidth / columns.length;

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos - 4, availableWidth, 8, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    columns.forEach((col, i) => {
      const x = margin + (i * colWidth) + 2;
      doc.text(col.header.substring(0, 15), x, yPos);
    });
    yPos += 8;

    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    for (const item of data) {
      // Check for page break
      if (yPos > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPos = margin;
      }

      columns.forEach((col, i) => {
        const x = margin + (i * colWidth) + 2;
        const value = formatValue(item[col.key], col, options);
        doc.text(String(value).substring(0, 20), x, yPos);
      });
      yPos += 6;
    }

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    const finalFilename = `${filename}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(finalFilename);

    return { success: true, filename: finalFilename };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// ============================================
// IMPORT UTILITIES
// ============================================

export interface ImportResult<T> {
  success: boolean;
  data?: T[];
  errors?: string[];
  rowCount?: number;
}

/**
 * Parse CSV file content into array of objects
 */
export function parseCSV<T extends Record<string, any>>(
  content: string,
  columns: ColumnConfig[],
  options: { hasHeader?: boolean } = {}
): ImportResult<T> {
  try {
    const { hasHeader = true } = options;
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    const errors: string[] = [];
    const data: T[] = [];

    const startIndex = hasHeader ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row: Record<string, any> = {};

      columns.forEach((col, j) => {
        const value = values[j] || '';
        row[col.key] = parseValue(value, col.type);
      });

      data.push(row as T);
    }

    return { success: true, data, rowCount: data.length, errors: errors.length ? errors : undefined };
  } catch (error) {
    return { success: false, errors: [String(error)] };
  }
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Parse string value to appropriate type
 */
function parseValue(value: string, type?: string): any {
  if (!value) return null;

  switch (type) {
    case 'number':
    case 'currency':
      const num = parseFloat(value.replace(/[$,]/g, ''));
      return isNaN(num) ? null : num;
    case 'date':
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date.toISOString();
    case 'boolean':
      return ['true', 'yes', '1'].includes(value.toLowerCase());
    default:
      return value;
  }
}

// ============================================
// FILE HANDLING UTILITIES
// ============================================

/**
 * Download content as file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Read file content as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

// ============================================
// PRINT UTILITIES
// ============================================

export interface PrintOptions {
  title?: string;
  styles?: string;
}

/**
 * Generate printable HTML and open print dialog
 */
export function printData<T extends Record<string, any>>(
  data: T[],
  columns: ColumnConfig[],
  options: PrintOptions = {}
): void {
  const { title = 'Report', styles = '' } = options;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; margin-bottom: 5px; }
        .meta { text-align: center; color: #666; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        tr:nth-child(even) { background-color: #fafafa; }
        @media print {
          button { display: none; }
        }
        ${styles}
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p class="meta">Generated: ${new Date().toLocaleString()} | Records: ${data.length}</p>
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col.header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            <tr>
              ${columns.map(col => `<td>${formatValue(item[col.key], col, {})}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}

// ============================================
// CLIPBOARD UTILITIES
// ============================================

/**
 * Copy data to clipboard as formatted text
 */
export async function copyToClipboard<T extends Record<string, any>>(
  data: T[],
  columns: ColumnConfig[],
  format: 'csv' | 'tab' | 'json' = 'tab'
): Promise<boolean> {
  try {
    let content: string;

    switch (format) {
      case 'csv':
        const headers = columns.map(c => c.header).join(',');
        const rows = data.map(item =>
          columns.map(col => escapeCSVValue(item[col.key])).join(',')
        );
        content = [headers, ...rows].join('\n');
        break;
      case 'json':
        content = JSON.stringify(data, null, 2);
        break;
      default: // tab-separated (pastes well into Excel)
        const tabHeaders = columns.map(c => c.header).join('\t');
        const tabRows = data.map(item =>
          columns.map(col => String(item[col.key] ?? '')).join('\t')
        );
        content = [tabHeaders, ...tabRows].join('\n');
    }

    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(content);
      return true;
    }

    // Fallback for browsers without clipboard API support
    const textArea = document.createElement('textarea');
    textArea.value = content;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (execErr) {
      document.body.removeChild(textArea);
      console.error('Fallback copy failed:', execErr);
      return false;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

// ============================================
// STORAGE UTILITIES (localStorage wrapper)
// ============================================

const STORAGE_PREFIX = 'fluxez_tool_';

export interface StorageOptions {
  version?: number;
  compress?: boolean;
}

/**
 * Save tool data to localStorage
 */
export function saveToolData<T>(
  toolId: string,
  data: T,
  options: StorageOptions = {}
): boolean {
  try {
    const { version = 1 } = options;
    const storageData = {
      version,
      updatedAt: new Date().toISOString(),
      data
    };
    localStorage.setItem(`${STORAGE_PREFIX}${toolId}`, JSON.stringify(storageData));
    return true;
  } catch (error) {
    console.error('Failed to save tool data:', error);
    return false;
  }
}

/**
 * Load tool data from localStorage
 */
export function loadToolData<T>(
  toolId: string,
  defaultValue: T
): { data: T; version: number; updatedAt: string | null } {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${toolId}`);
    if (!stored) {
      return { data: defaultValue, version: 1, updatedAt: null };
    }
    const parsed = JSON.parse(stored);
    return {
      data: parsed.data ?? defaultValue,
      version: parsed.version ?? 1,
      updatedAt: parsed.updatedAt ?? null
    };
  } catch (error) {
    console.error('Failed to load tool data:', error);
    return { data: defaultValue, version: 1, updatedAt: null };
  }
}

/**
 * Clear tool data from localStorage
 */
export function clearToolData(toolId: string): boolean {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${toolId}`);
    return true;
  } catch (error) {
    console.error('Failed to clear tool data:', error);
    return false;
  }
}

/**
 * Get all tool data keys
 */
export function getAllToolDataKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      keys.push(key.replace(STORAGE_PREFIX, ''));
    }
  }
  return keys;
}
