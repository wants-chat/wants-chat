import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { marked } from 'marked';
import { R2Service } from '../storage/r2.service';
import { PdfGenerator } from './generators/pdf.generator';
import { DocxGenerator } from './generators/docx.generator';
import { PptxGenerator } from './generators/pptx.generator';
import {
  DocumentFormat,
  PdfOptions,
  DocxOptions,
  PptxOptions,
  MarkdownOptions,
  SlideDto,
  DocumentGenerationResult,
  AvailableTemplatesResponse,
} from './dto/document.dto';
import {
  documentTemplates,
  getTemplateByName,
  applyTemplateVariables,
} from './templates';

export interface GenerationOptions {
  uploadToStorage?: boolean;
  storagePath?: string;
  isPublic?: boolean;
  userId?: string;
  returnBase64?: boolean;
}

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    private readonly r2Service: R2Service,
    private readonly pdfGenerator: PdfGenerator,
    private readonly docxGenerator: DocxGenerator,
    private readonly pptxGenerator: PptxGenerator,
  ) {}

  /**
   * Generate PDF document from markdown or HTML content
   */
  async generatePdf(
    content: string,
    options: PdfOptions = {},
    contentType: 'markdown' | 'html' = 'markdown',
    generationOptions: GenerationOptions = {},
  ): Promise<DocumentGenerationResult> {
    try {
      this.logger.log('Generating PDF document');

      let buffer: Buffer;

      if (contentType === 'html') {
        buffer = await this.pdfGenerator.generateFromHtml(content, options);
      } else {
        // Convert markdown to HTML first, then generate PDF
        const htmlContent = await marked.parse(content);
        buffer = await this.pdfGenerator.generateFromHtml(htmlContent, options);
      }

      return this.handleGeneratedDocument(
        buffer,
        'application/pdf',
        'pdf',
        generationOptions,
      );
    } catch (error) {
      this.logger.error('PDF generation failed:', error);
      return {
        success: false,
        error: error.message || 'PDF generation failed',
      };
    }
  }

  /**
   * Generate Word document (DOCX) from markdown content
   */
  async generateDocx(
    content: string,
    options: DocxOptions = {},
    generationOptions: GenerationOptions = {},
  ): Promise<DocumentGenerationResult> {
    try {
      this.logger.log('Generating DOCX document');

      const buffer = await this.docxGenerator.generateFromMarkdown(content, options);

      return this.handleGeneratedDocument(
        buffer,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'docx',
        generationOptions,
      );
    } catch (error) {
      this.logger.error('DOCX generation failed:', error);
      return {
        success: false,
        error: error.message || 'DOCX generation failed',
      };
    }
  }

  /**
   * Generate PowerPoint presentation (PPTX)
   */
  async generatePptx(
    slides: SlideDto[],
    options: PptxOptions = {},
    generationOptions: GenerationOptions = {},
  ): Promise<DocumentGenerationResult> {
    try {
      this.logger.log('Generating PPTX presentation');

      if (!slides || slides.length === 0) {
        throw new BadRequestException('At least one slide is required');
      }

      const buffer = await this.pptxGenerator.generatePresentation(slides, options);

      return this.handleGeneratedDocument(
        buffer,
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'pptx',
        generationOptions,
      );
    } catch (error) {
      this.logger.error('PPTX generation failed:', error);
      return {
        success: false,
        error: error.message || 'PPTX generation failed',
      };
    }
  }

  /**
   * Generate PPTX from markdown content
   * Uses horizontal rules (---) as slide separators
   */
  async generatePptxFromMarkdown(
    markdownContent: string,
    options: PptxOptions = {},
    generationOptions: GenerationOptions = {},
  ): Promise<DocumentGenerationResult> {
    try {
      this.logger.log('Generating PPTX from markdown');

      const buffer = await this.pptxGenerator.generateFromMarkdown(markdownContent, options);

      return this.handleGeneratedDocument(
        buffer,
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'pptx',
        generationOptions,
      );
    } catch (error) {
      this.logger.error('PPTX generation from markdown failed:', error);
      return {
        success: false,
        error: error.message || 'PPTX generation failed',
      };
    }
  }

  /**
   * Format content as Markdown
   */
  async generateMarkdown(
    content: string,
    contentType: 'html' | 'text' | 'json' = 'text',
    options: MarkdownOptions = {},
    generationOptions: GenerationOptions = {},
  ): Promise<DocumentGenerationResult> {
    try {
      this.logger.log('Generating Markdown document');

      let markdown: string;

      switch (contentType) {
        case 'html':
          markdown = this.htmlToMarkdown(content);
          break;
        case 'json':
          markdown = this.jsonToMarkdown(content, options);
          break;
        case 'text':
        default:
          markdown = this.textToMarkdown(content, options);
      }

      // Add table of contents if requested
      if (options.toc) {
        markdown = this.addTableOfContents(markdown);
      }

      const buffer = Buffer.from(markdown, 'utf-8');

      return this.handleGeneratedDocument(
        buffer,
        'text/markdown',
        'md',
        generationOptions,
      );
    } catch (error) {
      this.logger.error('Markdown generation failed:', error);
      return {
        success: false,
        error: error.message || 'Markdown generation failed',
      };
    }
  }

  /**
   * Convert between document formats
   */
  async convertFormat(
    source: string | Buffer,
    fromFormat: DocumentFormat,
    toFormat: DocumentFormat,
    options: Record<string, any> = {},
    generationOptions: GenerationOptions = {},
  ): Promise<DocumentGenerationResult> {
    try {
      this.logger.log(`Converting from ${fromFormat} to ${toFormat}`);

      // Get source content as string if needed
      let content: string;
      if (Buffer.isBuffer(source)) {
        content = source.toString('utf-8');
      } else if (source.startsWith('http://') || source.startsWith('https://')) {
        // Fetch from URL
        const axios = require('axios');
        const response = await axios.get(source, { responseType: 'text' });
        content = response.data;
      } else {
        content = source;
      }

      // Define supported conversions
      const conversionMap: Record<string, () => Promise<DocumentGenerationResult>> = {
        // Markdown conversions
        'markdown-pdf': () => this.generatePdf(content, options, 'markdown', generationOptions),
        'markdown-docx': () => this.generateDocx(content, options, generationOptions),
        'markdown-pptx': () => this.generatePptxFromMarkdown(content, options, generationOptions),
        'markdown-html': () => this.convertMarkdownToHtml(content, generationOptions),

        // HTML conversions
        'html-pdf': () => this.generatePdf(content, options, 'html', generationOptions),
        'html-markdown': () => this.generateMarkdown(content, 'html', options, generationOptions),
      };

      const conversionKey = `${fromFormat}-${toFormat}`;
      const conversionFn = conversionMap[conversionKey];

      if (!conversionFn) {
        throw new BadRequestException(
          `Conversion from ${fromFormat} to ${toFormat} is not supported`,
        );
      }

      return conversionFn();
    } catch (error) {
      this.logger.error('Format conversion failed:', error);
      return {
        success: false,
        error: error.message || 'Format conversion failed',
      };
    }
  }

  /**
   * Generate document from template
   */
  async generateFromTemplate(
    templateName: string,
    variables: Record<string, any>,
    outputFormat?: DocumentFormat,
    generationOptions: GenerationOptions = {},
  ): Promise<DocumentGenerationResult> {
    try {
      this.logger.log(`Generating document from template: ${templateName}`);

      const template = getTemplateByName(templateName);
      if (!template) {
        throw new BadRequestException(`Template '${templateName}' not found`);
      }

      // Apply variables to template
      const content = applyTemplateVariables(template, variables);
      const format = outputFormat || template.format;

      // Generate based on format
      switch (format) {
        case DocumentFormat.PDF:
          return this.generatePdf(content, template.options, 'markdown', generationOptions);

        case DocumentFormat.DOCX:
          return this.generateDocx(content, template.options, generationOptions);

        case DocumentFormat.PPTX:
          return this.generatePptxFromMarkdown(content, template.options, generationOptions);

        case DocumentFormat.MARKDOWN:
          const buffer = Buffer.from(content, 'utf-8');
          return this.handleGeneratedDocument(buffer, 'text/markdown', 'md', generationOptions);

        case DocumentFormat.HTML:
          const htmlContent = await marked.parse(content);
          const htmlBuffer = Buffer.from(this.wrapHtml(htmlContent), 'utf-8');
          return this.handleGeneratedDocument(htmlBuffer, 'text/html', 'html', generationOptions);

        default:
          throw new BadRequestException(`Unsupported output format: ${format}`);
      }
    } catch (error) {
      this.logger.error('Template generation failed:', error);
      return {
        success: false,
        error: error.message || 'Template generation failed',
      };
    }
  }

  /**
   * Get available templates
   */
  getAvailableTemplates(): AvailableTemplatesResponse {
    return {
      templates: documentTemplates.map(t => ({
        name: t.name,
        description: t.description,
        format: t.format,
        variables: t.variables,
      })),
    };
  }

  /**
   * Handle generated document (upload or return)
   */
  private async handleGeneratedDocument(
    buffer: Buffer,
    mimeType: string,
    extension: string,
    options: GenerationOptions,
  ): Promise<DocumentGenerationResult> {
    const filename = `document-${uuidv4()}.${extension}`;
    const result: DocumentGenerationResult = {
      success: true,
      filename,
      size: buffer.length,
      mimeType,
    };

    // Return base64 if requested
    if (options.returnBase64) {
      result.base64 = buffer.toString('base64');
    }

    // Upload to storage if requested
    if (options.uploadToStorage && options.userId) {
      try {
        const storagePath = options.storagePath || 'documents';
        const key = `users/${options.userId}/${storagePath}/${filename}`;

        const url = await this.r2Service.uploadBuffer(
          buffer,
          key,
          mimeType,
          { isPublic: options.isPublic },
        );

        result.url = url;
        result.key = key;
      } catch (error) {
        this.logger.error('Failed to upload document:', error);
        // Still return success but without URL
        result.error = 'Document generated but upload failed';
      }
    }

    return result;
  }

  /**
   * Convert HTML to Markdown
   */
  private htmlToMarkdown(html: string): string {
    // Simple HTML to Markdown conversion
    let markdown = html;

    // Convert headings
    markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
    markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
    markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
    markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');

    // Convert paragraphs
    markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

    // Convert lists
    markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n';
    });
    markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
      let index = 0;
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${++index}. $1\n`) + '\n';
    });

    // Convert formatting
    markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
    markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
    markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

    // Convert links
    markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

    // Convert images
    markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
    markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');

    // Convert blockquotes
    markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (match, content) => {
      return content.split('\n').map((line: string) => `> ${line.trim()}`).join('\n') + '\n\n';
    });

    // Convert code blocks
    markdown = markdown.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n\n');
    markdown = markdown.replace(/<pre[^>]*>(.*?)<\/pre>/gis, '```\n$1\n```\n\n');

    // Convert line breaks
    markdown = markdown.replace(/<br\s*\/?>/gi, '\n');

    // Convert horizontal rules
    markdown = markdown.replace(/<hr\s*\/?>/gi, '\n---\n\n');

    // Remove remaining HTML tags
    markdown = markdown.replace(/<[^>]*>/g, '');

    // Decode HTML entities
    markdown = markdown
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Clean up extra whitespace
    markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

    return markdown;
  }

  /**
   * Convert JSON to Markdown
   */
  private jsonToMarkdown(jsonString: string, options: MarkdownOptions): string {
    try {
      const data = JSON.parse(jsonString);
      return this.objectToMarkdown(data, 0);
    } catch {
      return `\`\`\`json\n${jsonString}\n\`\`\``;
    }
  }

  /**
   * Recursively convert object to Markdown
   */
  private objectToMarkdown(obj: any, depth: number): string {
    const lines: string[] = [];
    const indent = '  '.repeat(depth);

    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (typeof item === 'object' && item !== null) {
          lines.push(`${indent}- `);
          lines.push(this.objectToMarkdown(item, depth + 1));
        } else {
          lines.push(`${indent}- ${String(item)}`);
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          if (depth === 0) {
            lines.push(`## ${key}`);
          } else {
            lines.push(`${indent}**${key}:**`);
          }
          lines.push(this.objectToMarkdown(value, depth + 1));
        } else {
          lines.push(`${indent}**${key}:** ${String(value)}`);
        }
      }
    } else {
      lines.push(`${indent}${String(obj)}`);
    }

    return lines.join('\n');
  }

  /**
   * Convert plain text to Markdown
   */
  private textToMarkdown(text: string, options: MarkdownOptions): string {
    const lines = text.split('\n');
    const result: string[] = [];
    let inList = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Detect headings (lines that look like titles)
      if (trimmed.match(/^[A-Z][A-Z\s]+$/)) {
        result.push(`# ${trimmed}`);
        result.push('');
      }
      // Detect bullet points
      else if (trimmed.match(/^[-*+]\s/)) {
        result.push(trimmed);
        inList = true;
      }
      // Detect numbered lists
      else if (trimmed.match(/^\d+\.\s/)) {
        result.push(trimmed);
        inList = true;
      }
      // Regular paragraph
      else if (trimmed) {
        if (inList) {
          result.push('');
          inList = false;
        }
        result.push(trimmed);
      }
      // Empty line
      else {
        if (result.length > 0 && result[result.length - 1] !== '') {
          result.push('');
        }
        inList = false;
      }
    }

    return result.join('\n').trim();
  }

  /**
   * Add table of contents to markdown
   */
  private addTableOfContents(markdown: string): string {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings: { level: number; text: string; slug: string }[] = [];

    let match;
    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length;
      const text = match[2];
      const slug = text.toLowerCase().replace(/[^\w]+/g, '-');
      headings.push({ level, text, slug });
    }

    if (headings.length === 0) {
      return markdown;
    }

    const toc = ['## Table of Contents', ''];
    for (const heading of headings) {
      const indent = '  '.repeat(heading.level - 1);
      toc.push(`${indent}- [${heading.text}](#${heading.slug})`);
    }
    toc.push('', '---', '');

    return toc.join('\n') + markdown;
  }

  /**
   * Convert markdown to HTML
   */
  private async convertMarkdownToHtml(
    content: string,
    generationOptions: GenerationOptions,
  ): Promise<DocumentGenerationResult> {
    const htmlContent = await marked.parse(content);
    const fullHtml = this.wrapHtml(htmlContent);
    const buffer = Buffer.from(fullHtml, 'utf-8');

    return this.handleGeneratedDocument(buffer, 'text/html', 'html', generationOptions);
  }

  /**
   * Wrap HTML content in a complete document
   */
  private wrapHtml(content: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
    }
    h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    p { margin-bottom: 16px; }
    ul, ol { padding-left: 2em; margin-bottom: 16px; }
    li { margin-bottom: 4px; }
    code {
      background: #f6f8fa;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 85%;
    }
    pre {
      background: #f6f8fa;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #dfe2e5;
      margin: 0;
      padding-left: 1em;
      color: #6a737d;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 16px;
    }
    th, td {
      border: 1px solid #dfe2e5;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background: #f6f8fa;
      font-weight: 600;
    }
    hr {
      border: none;
      border-top: 1px solid #eee;
      margin: 24px 0;
    }
    a {
      color: #0366d6;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
  }
}
