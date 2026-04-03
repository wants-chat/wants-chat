import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Worker, Job, ConnectionOptions } from 'bullmq';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  QUEUE_NAMES,
  DOCUMENT_JOB_TYPES,
  QUEUE_EVENTS,
  DEFAULT_WORKER_OPTIONS,
  REDIS_CONNECTION_OPTIONS,
  DocumentJobData,
  DocumentJobResult,
} from '../queue.constants';

@Injectable()
export class DocumentProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DocumentProcessor.name);
  private worker: Worker;
  private connectionConfig: ConnectionOptions;
  private readonly outputDir: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.outputDir = this.configService.get<string>(
      'DOCUMENT_OUTPUT_DIR',
      '/tmp/documents',
    );
  }

  async onModuleInit(): Promise<void> {
    const redisHost = this.configService.get<string>('REDIS_HOST');
    if (!redisHost) {
      this.logger.warn('REDIS_HOST not configured - document processor disabled');
      return;
    }
    // Initialize in background to not block app startup
    this.ensureOutputDir().then(() => {
      this.initializeWorker().then(() => {
        this.logger.log('Document processor initialized');
      }).catch(err => {
        this.logger.error('Failed to initialize document processor:', err.message);
      });
    }).catch(err => {
      this.logger.error('Failed to create output directory:', err.message);
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.logger.log('Document worker closed');
    }
  }

  private async ensureOutputDir(): Promise<void> {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      this.logger.debug(`Output directory ensured: ${this.outputDir}`);
    } catch (error) {
      this.logger.error(`Failed to create output directory: ${error.message}`);
    }
  }

  private async initializeWorker(): Promise<void> {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');
    const db = this.configService.get<number>('REDIS_DB', 0);

    this.connectionConfig = {
      host,
      port,
      password: password || undefined,
      db,
      ...REDIS_CONNECTION_OPTIONS,
    };

    this.worker = new Worker<DocumentJobData, DocumentJobResult>(
      QUEUE_NAMES.DOCUMENT_GENERATION,
      async (job) => this.processJob(job),
      {
        connection: this.connectionConfig,
        concurrency: DEFAULT_WORKER_OPTIONS.concurrency,
        limiter: DEFAULT_WORKER_OPTIONS.limiter,
      },
    );

    this.setupWorkerEvents();
  }

  private setupWorkerEvents(): void {
    this.worker.on('completed', (job, result) => {
      this.logger.log(`Document job ${job.id} completed`);
      this.eventEmitter.emit(QUEUE_EVENTS.JOB_COMPLETED, {
        queue: QUEUE_NAMES.DOCUMENT_GENERATION,
        jobId: job.id,
        result,
      });
    });

    this.worker.on('failed', (job, error) => {
      this.logger.error(`Document job ${job?.id} failed: ${error.message}`);
      this.eventEmitter.emit(QUEUE_EVENTS.JOB_FAILED, {
        queue: QUEUE_NAMES.DOCUMENT_GENERATION,
        jobId: job?.id,
        error: error.message,
      });
    });

    this.worker.on('progress', (job, progress) => {
      this.logger.debug(`Document job ${job.id} progress: ${JSON.stringify(progress)}`);
    });

    this.worker.on('error', (error) => {
      this.logger.error(`Document worker error: ${error.message}`);
    });

    this.worker.on('stalled', (jobId) => {
      this.logger.warn(`Document job ${jobId} stalled`);
    });
  }

  private async processJob(
    job: Job<DocumentJobData>,
  ): Promise<DocumentJobResult> {
    const startTime = Date.now();
    this.logger.log(`Processing document job ${job.id}: ${job.data.type}`);

    try {
      // Check for cancellation
      const progress = job.progress as any;
      if (progress?.cancelled) {
        return {
          success: false,
          error: 'Job was cancelled',
          duration: Date.now() - startTime,
        };
      }

      await job.updateProgress({ status: 'starting', percentage: 0 });

      let result: DocumentJobResult;

      switch (job.data.type) {
        case DOCUMENT_JOB_TYPES.GENERATE_PDF:
          result = await this.handleGeneratePdf(job);
          break;
        case DOCUMENT_JOB_TYPES.GENERATE_DOCX:
          result = await this.handleGenerateDocx(job);
          break;
        case DOCUMENT_JOB_TYPES.GENERATE_XLSX:
          result = await this.handleGenerateXlsx(job);
          break;
        case DOCUMENT_JOB_TYPES.GENERATE_PPTX:
          result = await this.handleGeneratePptx(job);
          break;
        case DOCUMENT_JOB_TYPES.MERGE_DOCUMENTS:
          result = await this.handleMergeDocuments(job);
          break;
        case DOCUMENT_JOB_TYPES.CONVERT_FORMAT:
          result = await this.handleConvertFormat(job);
          break;
        case DOCUMENT_JOB_TYPES.TEMPLATE_RENDER:
          result = await this.handleTemplateRender(job);
          break;
        default:
          throw new Error(`Unknown document job type: ${job.data.type}`);
      }

      await job.updateProgress({ status: 'completed', percentage: 100 });

      return {
        ...result,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error(
        `Document job ${job.id} error: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  // =============================================
  // JOB HANDLERS
  // =============================================

  private async handleGeneratePdf(
    job: Job<DocumentJobData>,
  ): Promise<DocumentJobResult> {
    await job.updateProgress({ status: 'creating_document', percentage: 10 });

    const { data, options, outputPath } = job.data;
    const content = data?.content || '';
    const title = data?.title || 'Generated Document';

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    await job.updateProgress({ status: 'adding_content', percentage: 30 });

    // Page settings
    const pageWidth = options?.pageSize === 'letter' ? 612 : 595;
    const pageHeight = options?.pageSize === 'letter' ? 792 : 842;
    const margins = options?.margins || { top: 50, right: 50, bottom: 50, left: 50 };
    const fontSize = 12;
    const titleFontSize = 18;
    const lineHeight = fontSize * 1.5;

    // Add first page with title
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - margins.top;

    // Add title
    page.drawText(title, {
      x: margins.left,
      y: yPosition,
      size: titleFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= titleFontSize * 2;

    await job.updateProgress({ status: 'formatting_text', percentage: 50 });

    // Add content with word wrapping
    const maxWidth = pageWidth - margins.left - margins.right;
    const words = content.split(' ');
    let line = '';

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (textWidth > maxWidth) {
        // Write current line and start new one
        page.drawText(line, {
          x: margins.left,
          y: yPosition,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        yPosition -= lineHeight;
        line = word;

        // Check if we need a new page
        if (yPosition < margins.bottom) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          yPosition = pageHeight - margins.top;
        }
      } else {
        line = testLine;
      }
    }

    // Write remaining line
    if (line) {
      page.drawText(line, {
        x: margins.left,
        y: yPosition,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    }

    await job.updateProgress({ status: 'saving_document', percentage: 80 });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const fileName = outputPath || `document_${job.id}.pdf`;
    const filePath = path.join(this.outputDir, fileName);

    await fs.writeFile(filePath, pdfBytes);

    const stats = await fs.stat(filePath);

    return {
      success: true,
      filePath,
      fileSize: stats.size,
      mimeType: 'application/pdf',
      metadata: {
        title,
        pageCount: pdfDoc.getPageCount(),
        generatedAt: new Date().toISOString(),
      },
    };
  }

  private async handleGenerateDocx(
    job: Job<DocumentJobData>,
  ): Promise<DocumentJobResult> {
    await job.updateProgress({ status: 'creating_document', percentage: 10 });

    const { data, outputPath } = job.data;
    const content = data?.content || '';
    const title = data?.title || 'Generated Document';

    // TODO: Implement proper DOCX generation using docx library
    // For now, create a simple text-based placeholder

    await job.updateProgress({ status: 'generating_content', percentage: 50 });

    const fileName = outputPath || `document_${job.id}.docx`;
    const filePath = path.join(this.outputDir, fileName);

    // Placeholder: Write as text file (in production, use proper DOCX library)
    const docContent = `${title}\n\n${content}`;
    await fs.writeFile(filePath, docContent);

    await job.updateProgress({ status: 'finalizing', percentage: 90 });

    const stats = await fs.stat(filePath);

    return {
      success: true,
      filePath,
      fileSize: stats.size,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      metadata: {
        title,
        generatedAt: new Date().toISOString(),
        note: 'Placeholder implementation - use docx library for production',
      },
    };
  }

  private async handleGenerateXlsx(
    job: Job<DocumentJobData>,
  ): Promise<DocumentJobResult> {
    await job.updateProgress({ status: 'preparing_data', percentage: 10 });

    const { data, outputPath } = job.data;
    const rows = data?.rows || [];
    const headers = data?.headers || [];
    const sheetName = data?.sheetName || 'Sheet1';

    // TODO: Implement proper XLSX generation using exceljs library

    await job.updateProgress({ status: 'generating_spreadsheet', percentage: 50 });

    const fileName = outputPath || `spreadsheet_${job.id}.xlsx`;
    const filePath = path.join(this.outputDir, fileName);

    // Placeholder: Write as CSV (in production, use proper XLSX library)
    let csvContent = headers.join(',') + '\n';
    for (const row of rows) {
      csvContent += Object.values(row).join(',') + '\n';
    }
    await fs.writeFile(filePath, csvContent);

    await job.updateProgress({ status: 'finalizing', percentage: 90 });

    const stats = await fs.stat(filePath);

    return {
      success: true,
      filePath,
      fileSize: stats.size,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      metadata: {
        sheetName,
        rowCount: rows.length,
        generatedAt: new Date().toISOString(),
        note: 'Placeholder implementation - use exceljs for production',
      },
    };
  }

  private async handleGeneratePptx(
    job: Job<DocumentJobData>,
  ): Promise<DocumentJobResult> {
    await job.updateProgress({ status: 'preparing_slides', percentage: 10 });

    const { data, outputPath } = job.data;
    const slides = data?.slides || [];
    const title = data?.title || 'Presentation';

    // TODO: Implement proper PPTX generation using pptxgenjs library

    await job.updateProgress({ status: 'generating_presentation', percentage: 50 });

    const fileName = outputPath || `presentation_${job.id}.pptx`;
    const filePath = path.join(this.outputDir, fileName);

    // Placeholder: Write slide content as text
    let content = `Presentation: ${title}\n\n`;
    slides.forEach((slide: any, index: number) => {
      content += `--- Slide ${index + 1} ---\n`;
      content += `Title: ${slide.title || ''}\n`;
      content += `Content: ${slide.content || ''}\n\n`;
    });
    await fs.writeFile(filePath, content);

    await job.updateProgress({ status: 'finalizing', percentage: 90 });

    const stats = await fs.stat(filePath);

    return {
      success: true,
      filePath,
      fileSize: stats.size,
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      metadata: {
        title,
        slideCount: slides.length,
        generatedAt: new Date().toISOString(),
        note: 'Placeholder implementation - use pptxgenjs for production',
      },
    };
  }

  private async handleMergeDocuments(
    job: Job<DocumentJobData>,
  ): Promise<DocumentJobResult> {
    await job.updateProgress({ status: 'loading_documents', percentage: 10 });

    const { data, outputPath } = job.data;
    const inputFiles = data?.inputFiles || [];

    if (inputFiles.length === 0) {
      throw new Error('No input files provided for merging');
    }

    await job.updateProgress({ status: 'merging', percentage: 30 });

    // Create merged PDF
    const mergedPdf = await PDFDocument.create();

    let processedFiles = 0;
    for (const inputFile of inputFiles) {
      try {
        const pdfBytes = await fs.readFile(inputFile);
        const pdf = await PDFDocument.load(pdfBytes);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

        for (const page of pages) {
          mergedPdf.addPage(page);
        }

        processedFiles++;
        const progress = 30 + (processedFiles / inputFiles.length) * 50;
        await job.updateProgress({
          status: 'merging',
          percentage: progress,
          processedFiles,
          totalFiles: inputFiles.length,
        });
      } catch (error) {
        this.logger.warn(`Failed to merge file ${inputFile}: ${error.message}`);
      }
    }

    await job.updateProgress({ status: 'saving', percentage: 85 });

    const mergedBytes = await mergedPdf.save();
    const fileName = outputPath || `merged_${job.id}.pdf`;
    const filePath = path.join(this.outputDir, fileName);

    await fs.writeFile(filePath, mergedBytes);

    const stats = await fs.stat(filePath);

    return {
      success: true,
      filePath,
      fileSize: stats.size,
      mimeType: 'application/pdf',
      metadata: {
        inputFileCount: inputFiles.length,
        processedFileCount: processedFiles,
        pageCount: mergedPdf.getPageCount(),
        generatedAt: new Date().toISOString(),
      },
    };
  }

  private async handleConvertFormat(
    job: Job<DocumentJobData>,
  ): Promise<DocumentJobResult> {
    await job.updateProgress({ status: 'reading_source', percentage: 10 });

    const { data, format, outputPath } = job.data;
    const inputFile = data?.inputFile;
    const targetFormat = format || 'pdf';

    if (!inputFile) {
      throw new Error('Input file is required for format conversion');
    }

    await job.updateProgress({ status: 'converting', percentage: 40 });

    // TODO: Implement actual format conversion
    // This would typically use LibreOffice, Pandoc, or other conversion tools

    const fileName = outputPath || `converted_${job.id}.${targetFormat}`;
    const filePath = path.join(this.outputDir, fileName);

    // Placeholder: Copy file (in production, perform actual conversion)
    await fs.copyFile(inputFile, filePath);

    await job.updateProgress({ status: 'finalizing', percentage: 90 });

    const stats = await fs.stat(filePath);

    return {
      success: true,
      filePath,
      fileSize: stats.size,
      mimeType: this.getMimeType(targetFormat),
      metadata: {
        sourceFile: inputFile,
        targetFormat,
        convertedAt: new Date().toISOString(),
        note: 'Placeholder implementation - use proper conversion tools for production',
      },
    };
  }

  private async handleTemplateRender(
    job: Job<DocumentJobData>,
  ): Promise<DocumentJobResult> {
    await job.updateProgress({ status: 'loading_template', percentage: 10 });

    const { template, data, format, outputPath } = job.data;

    if (!template) {
      throw new Error('Template is required for rendering');
    }

    await job.updateProgress({ status: 'processing_data', percentage: 30 });

    // Simple template variable replacement
    let renderedContent = template;
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        renderedContent = renderedContent.replace(regex, String(value));
      }
    }

    await job.updateProgress({ status: 'generating_output', percentage: 60 });

    const targetFormat = format || 'pdf';
    const fileName = outputPath || `rendered_${job.id}.${targetFormat}`;
    const filePath = path.join(this.outputDir, fileName);

    if (targetFormat === 'pdf') {
      // Generate PDF from rendered content
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const page = pdfDoc.addPage();
      const { height } = page.getSize();

      // Simple text rendering (in production, use proper HTML-to-PDF)
      const lines = renderedContent.split('\n');
      let y = height - 50;
      for (const line of lines) {
        if (y < 50) break;
        page.drawText(line.substring(0, 100), {
          x: 50,
          y,
          size: 12,
          font,
        });
        y -= 18;
      }

      const pdfBytes = await pdfDoc.save();
      await fs.writeFile(filePath, pdfBytes);
    } else {
      // Save as text for other formats
      await fs.writeFile(filePath, renderedContent);
    }

    await job.updateProgress({ status: 'finalizing', percentage: 90 });

    const stats = await fs.stat(filePath);

    return {
      success: true,
      filePath,
      fileSize: stats.size,
      mimeType: this.getMimeType(targetFormat),
      metadata: {
        templateVariables: data ? Object.keys(data) : [],
        renderedAt: new Date().toISOString(),
      },
    };
  }

  // =============================================
  // UTILITIES
  // =============================================

  private getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      html: 'text/html',
      txt: 'text/plain',
      md: 'text/markdown',
      json: 'application/json',
      csv: 'text/csv',
    };

    return mimeTypes[format.toLowerCase()] || 'application/octet-stream';
  }
}
