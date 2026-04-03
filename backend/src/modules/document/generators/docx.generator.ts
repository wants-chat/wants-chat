import { Injectable, Logger } from '@nestjs/common';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  TableOfContents,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  PageOrientation,
  SectionType,
  convertInchesToTwip,
} from 'docx';
import { marked } from 'marked';
import { DocxOptions, PageSize } from '../dto/document.dto';

interface ParsedElement {
  type: 'heading' | 'paragraph' | 'list' | 'code' | 'table' | 'hr' | 'blockquote';
  content?: string;
  level?: number;
  items?: Array<{ text: string; nested?: Array<{ text: string }> }>;
  rows?: string[][];
  ordered?: boolean;
}

@Injectable()
export class DocxGenerator {
  private readonly logger = new Logger(DocxGenerator.name);

  /**
   * Generate DOCX from markdown content
   */
  async generateFromMarkdown(
    markdownContent: string,
    options: DocxOptions = {},
  ): Promise<Buffer> {
    const elements = this.parseMarkdown(markdownContent);
    return this.generateDocument(elements, options);
  }

  /**
   * Generate DOCX document from parsed elements
   */
  private async generateDocument(
    elements: ParsedElement[],
    options: DocxOptions = {},
  ): Promise<Buffer> {
    // Build document sections
    const children: any[] = [];

    // Add Table of Contents if requested
    if (options.tableOfContents) {
      children.push(
        new TableOfContents('Table of Contents', {
          hyperlink: true,
          headingStyleRange: '1-3',
        }),
      );
      children.push(new Paragraph({ text: '' })); // Spacer
    }

    // Process each element
    for (const element of elements) {
      const paragraphs = this.elementToParagraphs(element);
      children.push(...paragraphs);
    }

    // Build page size and margins
    const pageSize = this.getPageSize(options.pageSize);
    const isLandscape = options.orientation === 'landscape';

    // Create document
    const doc = new Document({
      creator: options.author || 'Wants Document Generator',
      title: options.title,
      description: options.description,
      sections: [
        {
          properties: {
            page: {
              size: {
                width: isLandscape ? pageSize.height : pageSize.width,
                height: isLandscape ? pageSize.width : pageSize.height,
                orientation: isLandscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
              },
              margin: {
                top: convertInchesToTwip(options.margins?.top ? options.margins.top / 72 : 1),
                bottom: convertInchesToTwip(options.margins?.bottom ? options.margins.bottom / 72 : 1),
                left: convertInchesToTwip(options.margins?.left ? options.margins.left / 72 : 1),
                right: convertInchesToTwip(options.margins?.right ? options.margins.right / 72 : 1),
              },
            },
            type: SectionType.CONTINUOUS,
          },
          headers: options.headerText
            ? {
                default: new Header({
                  children: [
                    new Paragraph({
                      children: [new TextRun(options.headerText)],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                }),
              }
            : undefined,
          footers: this.buildFooter(options),
          children,
        },
      ],
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }

  /**
   * Parse markdown into structured elements
   */
  private parseMarkdown(markdown: string): ParsedElement[] {
    const elements: ParsedElement[] = [];
    const tokens = marked.lexer(markdown);

    for (const token of tokens) {
      switch (token.type) {
        case 'heading':
          elements.push({
            type: 'heading',
            content: this.stripHtml(token.text),
            level: token.depth,
          });
          break;

        case 'paragraph':
          elements.push({
            type: 'paragraph',
            content: this.stripHtml(token.text),
          });
          break;

        case 'list':
          elements.push({
            type: 'list',
            ordered: token.ordered,
            items: token.items.map((item: any) => ({
              text: this.stripHtml(item.text),
              nested: item.tokens
                ?.filter((t: any) => t.type === 'list')
                .flatMap((t: any) =>
                  t.items.map((i: any) => ({ text: this.stripHtml(i.text) })),
                ),
            })),
          });
          break;

        case 'code':
          elements.push({
            type: 'code',
            content: token.text,
          });
          break;

        case 'table':
          const rows: string[][] = [];
          if (token.header) {
            rows.push(token.header.map((cell: any) => this.stripHtml(cell.text)));
          }
          if (token.rows) {
            for (const row of token.rows) {
              rows.push(row.map((cell: any) => this.stripHtml(cell.text)));
            }
          }
          elements.push({
            type: 'table',
            rows,
          });
          break;

        case 'hr':
          elements.push({ type: 'hr' });
          break;

        case 'blockquote':
          elements.push({
            type: 'blockquote',
            content: this.stripHtml(token.text),
          });
          break;

        case 'space':
          // Skip
          break;

        default:
          if ('text' in token && token.text) {
            elements.push({
              type: 'paragraph',
              content: this.stripHtml(token.text),
            });
          }
      }
    }

    return elements;
  }

  /**
   * Convert parsed element to DOCX paragraphs
   */
  private elementToParagraphs(element: ParsedElement): any[] {
    const paragraphs: any[] = [];

    switch (element.type) {
      case 'heading': {
        const headingLevel = this.mapHeadingLevel(element.level || 1);
        paragraphs.push(
          new Paragraph({
            text: element.content || '',
            heading: headingLevel,
            spacing: { before: 240, after: 120 },
          }),
        );
        break;
      }

      case 'paragraph': {
        const textRuns = this.parseInlineFormatting(element.content || '');
        paragraphs.push(
          new Paragraph({
            children: textRuns,
            spacing: { after: 200 },
          }),
        );
        break;
      }

      case 'list': {
        const items = element.items || [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          paragraphs.push(
            new Paragraph({
              children: [new TextRun(item.text)],
              bullet: element.ordered
                ? { level: 0 }
                : { level: 0 },
              numbering: element.ordered
                ? { reference: 'default-numbering', level: 0 }
                : undefined,
            }),
          );

          // Handle nested items
          if (item.nested) {
            for (const nestedItem of item.nested) {
              paragraphs.push(
                new Paragraph({
                  children: [new TextRun(nestedItem.text)],
                  bullet: { level: 1 },
                }),
              );
            }
          }
        }
        paragraphs.push(new Paragraph({ text: '' })); // Spacer
        break;
      }

      case 'code': {
        const codeLines = (element.content || '').split('\n');
        for (const line of codeLines) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line || ' ',
                  font: 'Courier New',
                  size: 20, // 10pt
                }),
              ],
              shading: {
                fill: 'F5F5F5',
              },
              spacing: { line: 276 },
            }),
          );
        }
        paragraphs.push(new Paragraph({ text: '' })); // Spacer
        break;
      }

      case 'table': {
        const rows = element.rows || [];
        if (rows.length > 0) {
          const tableRows = rows.map((row, rowIndex) =>
            new TableRow({
              children: row.map(
                (cell) =>
                  new TableCell({
                    children: [new Paragraph({ text: cell })],
                    shading: rowIndex === 0 ? { fill: 'E0E0E0' } : undefined,
                  }),
              ),
            }),
          );

          paragraphs.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows,
            }),
          );
          paragraphs.push(new Paragraph({ text: '' })); // Spacer
        }
        break;
      }

      case 'blockquote': {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: element.content || '',
                italics: true,
                color: '666666',
              }),
            ],
            indent: { left: 720 }, // 0.5 inch
            border: {
              left: {
                color: 'CCCCCC',
                size: 24,
                style: BorderStyle.SINGLE,
                space: 10,
              },
            },
            spacing: { before: 200, after: 200 },
          }),
        );
        break;
      }

      case 'hr': {
        paragraphs.push(
          new Paragraph({
            thematicBreak: true,
            spacing: { before: 200, after: 200 },
          }),
        );
        break;
      }
    }

    return paragraphs;
  }

  /**
   * Parse inline formatting (bold, italic, code)
   */
  private parseInlineFormatting(text: string): TextRun[] {
    const runs: TextRun[] = [];

    // Simple regex-based parsing for common markdown inline elements
    const patterns = [
      { regex: /\*\*\*(.+?)\*\*\*/g, bold: true, italics: true },
      { regex: /\*\*(.+?)\*\*/g, bold: true, italics: false },
      { regex: /\*(.+?)\*/g, bold: false, italics: true },
      { regex: /`(.+?)`/g, code: true },
    ];

    let processedText = text;
    const segments: Array<{
      text: string;
      bold?: boolean;
      italics?: boolean;
      code?: boolean;
      start: number;
      end: number;
    }> = [];

    // Find all formatted segments
    for (const pattern of patterns) {
      let match;
      const tempRegex = new RegExp(pattern.regex.source, 'g');
      while ((match = tempRegex.exec(text)) !== null) {
        segments.push({
          text: match[1],
          bold: pattern.bold,
          italics: pattern.italics,
          code: 'code' in pattern && pattern.code,
          start: match.index,
          end: match.index + match[0].length,
        });
      }
    }

    // Sort segments by start position
    segments.sort((a, b) => a.start - b.start);

    // Remove overlapping segments (keep first occurrence)
    const nonOverlapping: typeof segments = [];
    for (const segment of segments) {
      const overlaps = nonOverlapping.some(
        (s) => (segment.start >= s.start && segment.start < s.end) ||
               (segment.end > s.start && segment.end <= s.end),
      );
      if (!overlaps) {
        nonOverlapping.push(segment);
      }
    }

    // Build text runs
    let currentPos = 0;
    for (const segment of nonOverlapping) {
      // Add plain text before this segment
      if (segment.start > currentPos) {
        runs.push(new TextRun(text.slice(currentPos, segment.start)));
      }

      // Add formatted segment
      if (segment.code) {
        runs.push(
          new TextRun({
            text: segment.text,
            font: 'Courier New',
            shading: { fill: 'F0F0F0' },
          }),
        );
      } else {
        runs.push(
          new TextRun({
            text: segment.text,
            bold: segment.bold,
            italics: segment.italics,
          }),
        );
      }

      currentPos = segment.end;
    }

    // Add remaining plain text
    if (currentPos < text.length) {
      runs.push(new TextRun(text.slice(currentPos)));
    }

    // If no formatting found, return single text run
    if (runs.length === 0) {
      runs.push(new TextRun(text));
    }

    return runs;
  }

  /**
   * Map markdown heading level to DOCX heading level
   */
  private mapHeadingLevel(level: number): (typeof HeadingLevel)[keyof typeof HeadingLevel] {
    const mapping: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
      1: HeadingLevel.HEADING_1,
      2: HeadingLevel.HEADING_2,
      3: HeadingLevel.HEADING_3,
      4: HeadingLevel.HEADING_4,
      5: HeadingLevel.HEADING_5,
      6: HeadingLevel.HEADING_6,
    };
    return mapping[level] || HeadingLevel.HEADING_1;
  }

  /**
   * Get page size dimensions in twips
   */
  private getPageSize(size?: PageSize): { width: number; height: number } {
    // Page sizes in twips (1 inch = 1440 twips)
    const sizes: Record<string, { width: number; height: number }> = {
      A4: { width: 11906, height: 16838 }, // 210mm x 297mm
      letter: { width: 12240, height: 15840 }, // 8.5in x 11in
      legal: { width: 12240, height: 20160 }, // 8.5in x 14in
      A3: { width: 16838, height: 23811 }, // 297mm x 420mm
      A5: { width: 8419, height: 11906 }, // 148mm x 210mm
    };

    return sizes[size || PageSize.A4] || sizes.A4;
  }

  /**
   * Build footer with optional page numbers
   */
  private buildFooter(options: DocxOptions): { default: Footer } | undefined {
    if (!options.footerText && !options.includePageNumbers) {
      return undefined;
    }

    const children: any[] = [];

    if (options.footerText) {
      children.push(
        new Paragraph({
          children: [new TextRun(options.footerText)],
          alignment: AlignmentType.CENTER,
        }),
      );
    }

    if (options.includePageNumbers) {
      children.push(
        new Paragraph({
          children: [
            new TextRun('Page '),
            new TextRun({
              children: [PageNumber.CURRENT],
            }),
            new TextRun(' of '),
            new TextRun({
              children: [PageNumber.TOTAL_PAGES],
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
      );
    }

    return {
      default: new Footer({ children }),
    };
  }

  /**
   * Strip HTML tags from text
   */
  private stripHtml(text: string): string {
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
}
