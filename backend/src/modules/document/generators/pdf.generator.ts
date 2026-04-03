import { Injectable, Logger } from '@nestjs/common';
import { PDFDocument, PDFPage, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import { marked } from 'marked';
import type * as puppeteer from 'puppeteer';

// Lazy-loaded puppeteer to avoid slow startup
let puppeteerModule: typeof import('puppeteer') | null = null;
async function getPuppeteer(): Promise<typeof import('puppeteer')> {
  if (!puppeteerModule) {
    puppeteerModule = await import('puppeteer');
  }
  return puppeteerModule;
}
import {
  PdfOptions,
  PageSize,
  PageOrientation,
  TextAlignment,
} from '../dto/document.dto';

export interface PdfContent {
  type: 'text' | 'heading' | 'paragraph' | 'list' | 'code' | 'image' | 'table' | 'pageBreak';
  content?: string;
  level?: number;
  items?: string[];
  rows?: string[][];
  imageData?: Buffer;
  imageWidth?: number;
  imageHeight?: number;
}

interface ParsedContent {
  elements: PdfContent[];
}

@Injectable()
export class PdfGenerator {
  private readonly logger = new Logger(PdfGenerator.name);

  /**
   * Generate PDF from markdown content using pdf-lib for simple documents
   */
  async generateFromMarkdown(
    markdownContent: string,
    options: PdfOptions = {},
  ): Promise<Buffer> {
    const parsed = this.parseMarkdown(markdownContent);
    return this.generateFromParsedContent(parsed, options);
  }

  /**
   * Generate PDF from HTML using puppeteer for complex documents
   */
  async generateFromHtml(
    htmlContent: string,
    options: PdfOptions = {},
  ): Promise<Buffer> {
    let browser: puppeteer.Browser | null = null;

    try {
      const pptr = await getPuppeteer();
      browser = await pptr.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();

      // Build complete HTML document with styling
      const fullHtml = this.buildHtmlDocument(htmlContent, options);
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

      // Configure PDF options
      const pdfOptions: puppeteer.PDFOptions = {
        format: this.mapPageSize(options.pageSize),
        landscape: options.orientation === PageOrientation.LANDSCAPE,
        margin: {
          top: `${options.margins?.top || 72}px`,
          bottom: `${options.margins?.bottom || 72}px`,
          left: `${options.margins?.left || 72}px`,
          right: `${options.margins?.right || 72}px`,
        },
        printBackground: true,
        displayHeaderFooter: !!(options.header || options.footer),
      };

      // Add header/footer if specified
      if (options.header) {
        pdfOptions.headerTemplate = this.buildHeaderFooterTemplate(options.header, 'header');
      }
      if (options.footer) {
        pdfOptions.footerTemplate = this.buildHeaderFooterTemplate(options.footer, 'footer');
      }

      const pdfBuffer = await page.pdf(pdfOptions);

      // Add metadata using pdf-lib
      const pdfDoc = await PDFDocument.load(pdfBuffer);

      if (options.title) pdfDoc.setTitle(options.title);
      if (options.author) pdfDoc.setAuthor(options.author);
      if (options.subject) pdfDoc.setSubject(options.subject);
      if (options.keywords) pdfDoc.setKeywords(options.keywords);
      pdfDoc.setCreator('Wants Document Generator');
      pdfDoc.setProducer('Wants Platform');
      pdfDoc.setCreationDate(new Date());

      // Add watermark if specified
      if (options.watermark) {
        await this.addWatermark(pdfDoc, options.watermark);
      }

      const finalPdfBytes = await pdfDoc.save();
      return Buffer.from(finalPdfBytes);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generate PDF from parsed content using pdf-lib (for simple text-based documents)
   */
  private async generateFromParsedContent(
    content: ParsedContent,
    options: PdfOptions = {},
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();

    // Set metadata
    if (options.title) pdfDoc.setTitle(options.title);
    if (options.author) pdfDoc.setAuthor(options.author);
    if (options.subject) pdfDoc.setSubject(options.subject);
    if (options.keywords) pdfDoc.setKeywords(options.keywords);
    pdfDoc.setCreator('Wants Document Generator');
    pdfDoc.setProducer('Wants Platform');
    pdfDoc.setCreationDate(new Date());

    // Get page dimensions
    const pageSize = this.getPageDimensions(options.pageSize, options.orientation);
    const margins = {
      top: options.margins?.top || 72,
      bottom: options.margins?.bottom || 72,
      left: options.margins?.left || 72,
      right: options.margins?.right || 72,
    };

    // Load fonts
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);

    const defaultFontSize = options.defaultFont?.size || 12;
    const lineHeight = defaultFontSize * 1.5;

    let currentPage = pdfDoc.addPage(pageSize);
    let yPosition = pageSize[1] - margins.top;
    const contentWidth = pageSize[0] - margins.left - margins.right;

    // Process each content element
    for (const element of content.elements) {
      // Check if we need a new page
      if (yPosition < margins.bottom + lineHeight * 2) {
        currentPage = pdfDoc.addPage(pageSize);
        yPosition = pageSize[1] - margins.top;
      }

      switch (element.type) {
        case 'heading': {
          const headingLevel = element.level || 1;
          const fontSize = this.getHeadingFontSize(headingLevel, defaultFontSize);

          yPosition -= fontSize * 0.5; // Add space before heading

          const lines = this.wrapText(element.content || '', boldFont, fontSize, contentWidth);
          for (const line of lines) {
            if (yPosition < margins.bottom) {
              currentPage = pdfDoc.addPage(pageSize);
              yPosition = pageSize[1] - margins.top;
            }
            currentPage.drawText(line, {
              x: margins.left,
              y: yPosition,
              size: fontSize,
              font: boldFont,
              color: rgb(0, 0, 0),
            });
            yPosition -= fontSize * 1.3;
          }
          yPosition -= fontSize * 0.3; // Add space after heading
          break;
        }

        case 'paragraph':
        case 'text': {
          const lines = this.wrapText(element.content || '', regularFont, defaultFontSize, contentWidth);
          for (const line of lines) {
            if (yPosition < margins.bottom) {
              currentPage = pdfDoc.addPage(pageSize);
              yPosition = pageSize[1] - margins.top;
            }
            currentPage.drawText(line, {
              x: margins.left,
              y: yPosition,
              size: defaultFontSize,
              font: regularFont,
              color: rgb(0, 0, 0),
            });
            yPosition -= lineHeight;
          }
          yPosition -= lineHeight * 0.5; // Paragraph spacing
          break;
        }

        case 'list': {
          const items = element.items || [];
          for (let i = 0; i < items.length; i++) {
            const bullet = '\u2022 '; // Unicode bullet
            const itemText = items[i];
            const fullText = bullet + itemText;

            const lines = this.wrapText(fullText, regularFont, defaultFontSize, contentWidth - 20);
            for (let j = 0; j < lines.length; j++) {
              if (yPosition < margins.bottom) {
                currentPage = pdfDoc.addPage(pageSize);
                yPosition = pageSize[1] - margins.top;
              }
              const xOffset = j === 0 ? margins.left : margins.left + 15;
              currentPage.drawText(j === 0 ? lines[j] : lines[j], {
                x: xOffset,
                y: yPosition,
                size: defaultFontSize,
                font: regularFont,
                color: rgb(0, 0, 0),
              });
              yPosition -= lineHeight;
            }
          }
          yPosition -= lineHeight * 0.3;
          break;
        }

        case 'code': {
          const codeLines = (element.content || '').split('\n');
          const codeFontSize = defaultFontSize - 1;

          // Draw code block background
          const codeBlockHeight = codeLines.length * codeFontSize * 1.4 + 20;
          if (yPosition - codeBlockHeight < margins.bottom) {
            currentPage = pdfDoc.addPage(pageSize);
            yPosition = pageSize[1] - margins.top;
          }

          currentPage.drawRectangle({
            x: margins.left - 5,
            y: yPosition - codeBlockHeight + 10,
            width: contentWidth + 10,
            height: codeBlockHeight,
            color: rgb(0.95, 0.95, 0.95),
          });

          yPosition -= 10;
          for (const codeLine of codeLines) {
            currentPage.drawText(codeLine, {
              x: margins.left + 5,
              y: yPosition,
              size: codeFontSize,
              font: monoFont,
              color: rgb(0.2, 0.2, 0.2),
            });
            yPosition -= codeFontSize * 1.4;
          }
          yPosition -= lineHeight;
          break;
        }

        case 'pageBreak': {
          currentPage = pdfDoc.addPage(pageSize);
          yPosition = pageSize[1] - margins.top;
          break;
        }

        case 'table': {
          const rows = element.rows || [];
          if (rows.length === 0) continue;

          const numCols = rows[0].length;
          const colWidth = contentWidth / numCols;
          const cellPadding = 5;
          const rowHeight = lineHeight + cellPadding * 2;

          for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
            if (yPosition - rowHeight < margins.bottom) {
              currentPage = pdfDoc.addPage(pageSize);
              yPosition = pageSize[1] - margins.top;
            }

            const row = rows[rowIdx];
            const isHeader = rowIdx === 0;
            const font = isHeader ? boldFont : regularFont;
            const bgColor = isHeader ? rgb(0.9, 0.9, 0.9) : rgb(1, 1, 1);

            // Draw row background
            currentPage.drawRectangle({
              x: margins.left,
              y: yPosition - rowHeight,
              width: contentWidth,
              height: rowHeight,
              color: bgColor,
              borderColor: rgb(0.7, 0.7, 0.7),
              borderWidth: 0.5,
            });

            // Draw cell content
            for (let colIdx = 0; colIdx < row.length; colIdx++) {
              const cellX = margins.left + colIdx * colWidth + cellPadding;
              const cellText = row[colIdx] || '';
              const truncatedText = this.truncateText(cellText, font, defaultFontSize - 1, colWidth - cellPadding * 2);

              currentPage.drawText(truncatedText, {
                x: cellX,
                y: yPosition - rowHeight + cellPadding + 3,
                size: defaultFontSize - 1,
                font,
                color: rgb(0, 0, 0),
              });

              // Draw vertical cell border
              if (colIdx > 0) {
                currentPage.drawLine({
                  start: { x: margins.left + colIdx * colWidth, y: yPosition },
                  end: { x: margins.left + colIdx * colWidth, y: yPosition - rowHeight },
                  color: rgb(0.7, 0.7, 0.7),
                  thickness: 0.5,
                });
              }
            }

            yPosition -= rowHeight;
          }
          yPosition -= lineHeight;
          break;
        }
      }
    }

    // Add watermark if specified
    if (options.watermark) {
      await this.addWatermark(pdfDoc, options.watermark);
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Parse markdown into structured content
   */
  private parseMarkdown(markdown: string): ParsedContent {
    const elements: PdfContent[] = [];
    const tokens = marked.lexer(markdown);

    for (const token of tokens) {
      switch (token.type) {
        case 'heading':
          elements.push({
            type: 'heading',
            content: token.text,
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
            items: token.items.map((item: any) => this.stripHtml(item.text)),
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
          elements.push({ type: 'pageBreak' });
          break;

        case 'space':
          // Skip empty space
          break;

        default:
          // Handle other token types as paragraphs
          if ('text' in token && token.text) {
            elements.push({
              type: 'paragraph',
              content: this.stripHtml(token.text),
            });
          }
      }
    }

    return { elements };
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

  /**
   * Get page dimensions based on size and orientation
   */
  private getPageDimensions(
    size?: PageSize,
    orientation?: PageOrientation,
  ): [number, number] {
    let dimensions: [number, number];

    switch (size) {
      case PageSize.LETTER:
        dimensions = PageSizes.Letter;
        break;
      case PageSize.LEGAL:
        dimensions = PageSizes.Legal;
        break;
      case PageSize.A3:
        dimensions = PageSizes.A3;
        break;
      case PageSize.A5:
        dimensions = PageSizes.A5;
        break;
      case PageSize.A4:
      default:
        dimensions = PageSizes.A4;
    }

    if (orientation === PageOrientation.LANDSCAPE) {
      return [dimensions[1], dimensions[0]];
    }

    return dimensions;
  }

  /**
   * Get heading font size based on level
   */
  private getHeadingFontSize(level: number, baseFontSize: number): number {
    const sizes: Record<number, number> = {
      1: baseFontSize * 2,
      2: baseFontSize * 1.75,
      3: baseFontSize * 1.5,
      4: baseFontSize * 1.25,
      5: baseFontSize * 1.1,
      6: baseFontSize,
    };
    return sizes[level] || baseFontSize;
  }

  /**
   * Wrap text to fit within a given width
   */
  private wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [''];
  }

  /**
   * Truncate text to fit within a given width
   */
  private truncateText(text: string, font: any, fontSize: number, maxWidth: number): string {
    let truncated = text;
    while (font.widthOfTextAtSize(truncated, fontSize) > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    if (truncated.length < text.length) {
      truncated = truncated.slice(0, -3) + '...';
    }
    return truncated;
  }

  /**
   * Add watermark to all pages
   */
  private async addWatermark(pdfDoc: PDFDocument, watermarkText: string): Promise<void> {
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 48;

    for (const page of pages) {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);

      page.drawText(watermarkText, {
        x: (width - textWidth) / 2,
        y: height / 2,
        size: fontSize,
        font,
        color: rgb(0.9, 0.9, 0.9),
        rotate: { type: 'degrees' as any, angle: -45 },
        opacity: 0.3,
      });
    }
  }

  /**
   * Map page size to puppeteer format
   */
  private mapPageSize(size?: PageSize): puppeteer.PaperFormat {
    switch (size) {
      case PageSize.LETTER:
        return 'letter';
      case PageSize.LEGAL:
        return 'legal';
      case PageSize.A3:
        return 'a3';
      case PageSize.A5:
        return 'a5';
      case PageSize.A4:
      default:
        return 'a4';
    }
  }

  /**
   * Build a complete HTML document with styling
   */
  private buildHtmlDocument(content: string, options: PdfOptions): string {
    const fontFamily = options.defaultFont?.family || 'Arial, sans-serif';
    const fontSize = options.defaultFont?.size || 12;
    const fontColor = options.defaultFont?.color || '#000000';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * {
              box-sizing: border-box;
            }
            body {
              font-family: ${fontFamily};
              font-size: ${fontSize}pt;
              color: ${fontColor};
              line-height: 1.6;
              margin: 0;
              padding: 0;
            }
            h1 { font-size: ${fontSize * 2}pt; margin: 24pt 0 16pt 0; }
            h2 { font-size: ${fontSize * 1.75}pt; margin: 20pt 0 14pt 0; }
            h3 { font-size: ${fontSize * 1.5}pt; margin: 18pt 0 12pt 0; }
            h4 { font-size: ${fontSize * 1.25}pt; margin: 16pt 0 10pt 0; }
            h5 { font-size: ${fontSize * 1.1}pt; margin: 14pt 0 8pt 0; }
            h6 { font-size: ${fontSize}pt; margin: 12pt 0 6pt 0; }
            p { margin: 0 0 12pt 0; }
            ul, ol { margin: 0 0 12pt 0; padding-left: 24pt; }
            li { margin: 4pt 0; }
            pre, code {
              font-family: 'Courier New', monospace;
              font-size: ${fontSize - 1}pt;
              background-color: #f5f5f5;
              padding: 2pt 4pt;
              border-radius: 3pt;
            }
            pre {
              padding: 12pt;
              overflow-x: auto;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 12pt 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8pt;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            blockquote {
              border-left: 4pt solid #ddd;
              margin: 12pt 0;
              padding-left: 16pt;
              color: #666;
            }
            hr {
              page-break-after: always;
              border: none;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            a {
              color: #0066cc;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;
  }

  /**
   * Build header/footer template for puppeteer
   */
  private buildHeaderFooterTemplate(
    options: { text?: string; alignment?: TextAlignment; includePageNumbers?: boolean; pageNumberFormat?: string },
    type: 'header' | 'footer',
  ): string {
    const alignment = options.alignment || TextAlignment.CENTER;
    const alignmentStyle = {
      [TextAlignment.LEFT]: 'left',
      [TextAlignment.CENTER]: 'center',
      [TextAlignment.RIGHT]: 'right',
      [TextAlignment.JUSTIFY]: 'justify',
    }[alignment];

    let content = options.text || '';

    if (options.includePageNumbers) {
      const format = options.pageNumberFormat || 'Page <span class="pageNumber"></span> of <span class="totalPages"></span>';
      content = content ? `${content} - ${format}` : format;
    }

    return `
      <div style="width: 100%; font-size: 10px; text-align: ${alignmentStyle}; padding: 0 20px;">
        ${content}
      </div>
    `;
  }
}
