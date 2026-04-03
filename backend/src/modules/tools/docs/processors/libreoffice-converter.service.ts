import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

export type ConversionFormat = 'docx' | 'xlsx' | 'pptx' | 'txt' | 'html';

export interface ConversionResult {
  buffer: Buffer;
  originalName: string;
  convertedName: string;
  format: ConversionFormat;
}

@Injectable()
export class LibreOfficeConverterService {
  private readonly logger = new Logger(LibreOfficeConverterService.name);

  // LibreOffice binary path - can be configured via environment variable
  private readonly libreofficePath =
    process.env.LIBREOFFICE_PATH || this.detectLibreOfficePath();

  /**
   * Detect LibreOffice path based on operating system
   */
  private detectLibreOfficePath(): string {
    const platform = os.platform();

    if (platform === 'darwin') {
      // macOS
      return '/Applications/LibreOffice.app/Contents/MacOS/soffice';
    } else if (platform === 'win32') {
      // Windows
      return 'C:\\Program Files\\LibreOffice\\program\\soffice.exe';
    } else {
      // Linux and others
      return 'libreoffice';
    }
  }

  /**
   * Convert PDF to Document (DOCX, XLSX, etc.)
   */
  async convertPdf(
    pdfBuffer: Buffer,
    outputFormat: ConversionFormat,
    originalFileName: string,
  ): Promise<ConversionResult> {
    // Create unique temp directory for this conversion
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-convert-'));
    const inputPath = path.join(tempDir, `input-${uuidv4()}.pdf`);

    try {
      // 1. Check if LibreOffice is available
      const isAvailable = await this.checkAvailability();
      if (!isAvailable) {
        throw new InternalServerErrorException(
          'LibreOffice is not installed or not accessible. Please install LibreOffice to use this feature.',
        );
      }

      // 2. Write PDF buffer to temp file
      await fs.writeFile(inputPath, pdfBuffer);
      this.logger.debug(`Written PDF to: ${inputPath}`);

      // 3. Determine LibreOffice filter based on format
      const filterMap: Record<ConversionFormat, string> = {
        docx: 'MS Word 2007 XML',
        xlsx: 'Calc MS Excel 2007 XML',
        pptx: 'Impress MS PowerPoint 2007 XML',
        txt: 'Text',
        html: 'HTML',
      };

      const filter = filterMap[outputFormat];
      if (!filter) {
        throw new BadRequestException(`Unsupported format: ${outputFormat}`);
      }

      // 4. Build LibreOffice command
      // --headless: Run without GUI
      // --convert-to: Output format with filter
      // --outdir: Output directory
      const command = `"${this.libreofficePath}" --headless --convert-to "${outputFormat}:${filter}" --outdir "${tempDir}" "${inputPath}"`;

      this.logger.debug(`Executing: ${command}`);

      // 5. Execute conversion with timeout
      const { stdout, stderr } = await execAsync(command, {
        timeout: 120000, // 2 minute timeout for large files
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer
      });

      if (stderr && !stderr.includes('warn') && !stderr.includes('Warning')) {
        this.logger.warn(`LibreOffice stderr: ${stderr}`);
      }

      this.logger.debug(`LibreOffice stdout: ${stdout}`);

      // 6. Find the converted file
      const baseName = path.basename(inputPath, '.pdf');
      let outputPath = path.join(tempDir, `${baseName}.${outputFormat}`);

      // Check if output file exists
      let outputExists = false;
      try {
        await fs.access(outputPath);
        outputExists = true;
      } catch {
        // Sometimes LibreOffice uses different naming - search for the file
        const files = await fs.readdir(tempDir);
        const convertedFile = files.find((f) =>
          f.endsWith(`.${outputFormat}`),
        );
        if (convertedFile) {
          outputPath = path.join(tempDir, convertedFile);
          outputExists = true;
        }
      }

      if (!outputExists) {
        this.logger.error(
          `Conversion failed: Output file not found. stdout: ${stdout}, stderr: ${stderr}`,
        );
        throw new InternalServerErrorException(
          'PDF conversion failed. The PDF may be corrupted or password-protected.',
        );
      }

      // 7. Read converted file
      const outputBuffer = await fs.readFile(outputPath);

      // 8. Generate output filename
      const originalBaseName = path.basename(
        originalFileName,
        path.extname(originalFileName),
      );
      const convertedName = `${originalBaseName}.${outputFormat}`;

      this.logger.log(
        `Successfully converted ${originalFileName} to ${outputFormat} (${outputBuffer.length} bytes)`,
      );

      return {
        buffer: outputBuffer,
        originalName: originalFileName,
        convertedName,
        format: outputFormat,
      };
    } catch (error) {
      this.logger.error(`Conversion failed: ${error.message}`, error.stack);

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      if (error.message?.includes('timeout') || error.killed) {
        throw new InternalServerErrorException(
          'Conversion timed out. The PDF may be too large or complex.',
        );
      }

      throw new InternalServerErrorException(
        `PDF conversion failed: ${error.message}`,
      );
    } finally {
      // 9. Cleanup temp directory
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
        this.logger.debug(`Cleaned up temp dir: ${tempDir}`);
      } catch (cleanupError) {
        this.logger.warn(
          `Failed to cleanup temp dir: ${cleanupError.message}`,
        );
      }
    }
  }

  /**
   * Check if LibreOffice is available on the system
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`"${this.libreofficePath}" --version`, {
        timeout: 10000,
      });
      this.logger.log(`LibreOffice available: ${stdout.trim()}`);
      return true;
    } catch (error) {
      this.logger.warn(
        `LibreOffice not available at ${this.libreofficePath}: ${error.message}`,
      );
      return false;
    }
  }

  /**
   * Get supported conversion formats
   */
  getSupportedFormats(): ConversionFormat[] {
    return ['docx', 'xlsx', 'pptx', 'txt', 'html'];
  }
}
