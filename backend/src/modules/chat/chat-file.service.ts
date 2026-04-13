import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { R2Service } from '../storage/r2.service';
import OpenAI from 'openai';

export interface ChatFileUpload {
  id: string;
  user_id: string;
  conversation_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  extracted_text: string;
  storage_path: string;
  created_at: Date;
}

const SUPPORTED_TYPES = {
  pdf: ['application/pdf'],
  csv: ['text/csv', 'application/vnd.ms-excel'],
  image: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
  text: [
    'text/plain',
    'text/markdown',
    'application/json',
    'text/html',
    'text/css',
    'text/javascript',
    'application/javascript',
  ],
};

@Injectable()
export class ChatFileService {
  private readonly logger = new Logger(ChatFileService.name);
  private openai: OpenAI | null = null;

  constructor(
    private readonly db: DatabaseService,
    private readonly r2Service: R2Service,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Upload a file, extract its text content, store in R2, and save metadata.
   */
  async uploadAndExtract(
    userId: string,
    conversationId: string,
    file: Express.Multer.File,
  ): Promise<ChatFileUpload> {
    this.validateFile(file);

    // Extract text content based on file type
    const extractedText = await this.extractText(file);

    // Upload to R2 storage
    const uploadResult = await this.r2Service.uploadFile(file, userId, {
      path: `chat-files/${conversationId}`,
      isPublic: false,
    });

    // Store metadata in database
    const chatFile = await this.db.insert<ChatFileUpload>('chat_file_uploads', {
      user_id: userId,
      conversation_id: conversationId,
      filename: file.originalname,
      file_type: file.mimetype,
      file_size: file.size,
      extracted_text: extractedText,
      storage_path: uploadResult.key,
      created_at: new Date(),
    });

    this.logger.log(
      `File uploaded: ${file.originalname} (${file.size} bytes) for conversation ${conversationId}`,
    );

    return chatFile;
  }

  /**
   * List all files uploaded to a specific conversation.
   */
  async listFiles(
    conversationId: string,
    userId: string,
  ): Promise<ChatFileUpload[]> {
    return this.db.findMany<ChatFileUpload>(
      'chat_file_uploads',
      { conversation_id: conversationId, user_id: userId },
      { orderBy: 'created_at', order: 'DESC' },
    );
  }

  /**
   * Build a context string from an uploaded file for the AI.
   */
  buildFileContext(file: ChatFileUpload): string {
    const truncated =
      file.extracted_text.length > 50000
        ? file.extracted_text.substring(0, 50000) + '\n... (content truncated)'
        : file.extracted_text;
    return `The user uploaded "${file.filename}" (${this.formatSize(file.file_size)}). Contents:\n${truncated}`;
  }

  // ============================================
  // Private helpers
  // ============================================

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 20MB limit');
    }

    const allSupported = Object.values(SUPPORTED_TYPES).flat();
    if (!allSupported.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Supported: PDF, CSV, images (PNG/JPEG/GIF/WebP), and text files.`,
      );
    }
  }

  private async extractText(file: Express.Multer.File): Promise<string> {
    const { mimetype, buffer } = file;

    if (SUPPORTED_TYPES.pdf.includes(mimetype)) {
      return this.extractPdfText(buffer);
    }

    if (SUPPORTED_TYPES.csv.includes(mimetype)) {
      return this.extractCsvText(buffer);
    }

    if (SUPPORTED_TYPES.image.includes(mimetype)) {
      return this.extractImageDescription(file);
    }

    if (SUPPORTED_TYPES.text.includes(mimetype)) {
      return buffer.toString('utf-8');
    }

    return `[Binary file: ${file.originalname}]`;
  }

  private async extractPdfText(buffer: Buffer): Promise<string> {
    try {
      const pdfParse = await import('pdf-parse');
      const data = await pdfParse.default(buffer);
      return data.text || '[Empty PDF]';
    } catch (error) {
      this.logger.warn('PDF extraction failed:', error.message);
      return '[Could not extract PDF text]';
    }
  }

  private extractCsvText(buffer: Buffer): string {
    try {
      const text = buffer.toString('utf-8');
      const lines = text.split('\n').filter((l) => l.trim());

      if (lines.length === 0) return '[Empty CSV]';

      const header = lines[0];
      const columns = this.parseCsvRow(header);
      const previewRows = lines.slice(1, 11); // first 10 data rows

      let summary = `CSV file with ${columns.length} columns and ${lines.length - 1} rows.\n`;
      summary += `Columns: ${columns.join(', ')}\n\n`;
      summary += `First ${Math.min(previewRows.length, 10)} rows:\n`;
      summary += header + '\n';
      summary += previewRows.join('\n');

      if (lines.length > 11) {
        summary += `\n... (${lines.length - 11} more rows)`;
      }

      return summary;
    } catch (error) {
      this.logger.warn('CSV extraction failed:', error.message);
      return '[Could not parse CSV]';
    }
  }

  private async extractImageDescription(
    file: Express.Multer.File,
  ): Promise<string> {
    if (!this.openai) {
      return `[Image: ${file.originalname} - AI vision not configured]`;
    }

    try {
      const base64 = file.buffer.toString('base64');
      const dataUrl = `data:${file.mimetype};base64,${base64}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Describe this image in detail. Include any text, data, charts, or key visual elements.',
              },
              {
                type: 'image_url',
                image_url: { url: dataUrl },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      return (
        response.choices[0]?.message?.content ||
        `[Image: ${file.originalname}]`
      );
    } catch (error) {
      this.logger.warn('Image description failed:', error.message);
      return `[Image: ${file.originalname} - could not generate description]`;
    }
  }

  private parseCsvRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (inQuotes) {
        if (ch === '"' && row[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
