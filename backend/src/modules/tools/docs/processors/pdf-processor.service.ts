import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PDFDocument, rgb, degrees } from 'pdf-lib';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

@Injectable()
export class PdfProcessorService {
  private readonly logger = new Logger(PdfProcessorService.name);

  async getInfo(buffer: Buffer): Promise<{
    pageCount: number;
    title?: string;
    author?: string;
    isEncrypted: boolean;
    creationDate?: string;
  }> {
    try {
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();
      const title = pdfDoc.getTitle();
      const author = pdfDoc.getAuthor();
      const creationDate = pdfDoc.getCreationDate()?.toISOString();

      // Check if encrypted by trying to access pages
      let isEncrypted = false;
      try {
        await pdfParse(buffer);
      } catch (e) {
        if (e.message?.includes('encrypted')) {
          isEncrypted = true;
        }
      }

      return { pageCount, title, author, isEncrypted, creationDate };
    } catch (error) {
      this.logger.error(`Failed to get PDF info: ${error.message}`);
      throw new BadRequestException('Failed to read PDF file');
    }
  }

  async merge(buffers: Buffer[]): Promise<Buffer> {
    if (buffers.length < 2) {
      throw new BadRequestException('At least 2 PDF files are required for merging');
    }

    try {
      const mergedPdf = await PDFDocument.create();

      for (const buffer of buffers) {
        const pdfDoc = await PDFDocument.load(buffer);
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      return Buffer.from(await mergedPdf.save());
    } catch (error) {
      this.logger.error(`PDF merge failed: ${error.message}`);
      throw new BadRequestException('Failed to merge PDF files');
    }
  }

  async split(buffer: Buffer, pageRanges?: string, splitAll?: boolean): Promise<Buffer[]> {
    try {
      const pdfDoc = await PDFDocument.load(buffer);
      const totalPages = pdfDoc.getPageCount();
      const results: Buffer[] = [];

      if (splitAll) {
        // Split into individual pages
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(pdfDoc, [i]);
          newPdf.addPage(page);
          results.push(Buffer.from(await newPdf.save()));
        }
      } else if (pageRanges) {
        // Parse page ranges like "1-3,5,7-9"
        const ranges = this.parsePageRanges(pageRanges, totalPages);
        const newPdf = await PDFDocument.create();

        for (const pageIndex of ranges) {
          const [page] = await newPdf.copyPages(pdfDoc, [pageIndex]);
          newPdf.addPage(page);
        }

        results.push(Buffer.from(await newPdf.save()));
      } else {
        // Return the original if no split options
        results.push(buffer);
      }

      return results;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`PDF split failed: ${error.message}`);
      throw new BadRequestException('Failed to split PDF file');
    }
  }

  async compress(buffer: Buffer, quality: number = 80): Promise<Buffer> {
    try {
      // Basic compression by recreating the PDF
      const pdfDoc = await PDFDocument.load(buffer);
      const newPdf = await PDFDocument.create();

      const pages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach((page) => newPdf.addPage(page));

      // Save with compression options
      const compressedBytes = await newPdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      return Buffer.from(compressedBytes);
    } catch (error) {
      this.logger.error(`PDF compression failed: ${error.message}`);
      throw new BadRequestException('Failed to compress PDF file');
    }
  }

  async imagesToPdf(
    imageBuffers: Buffer[],
    options: { pageSize?: string; orientation?: string; margin?: number } = {},
  ): Promise<Buffer> {
    if (imageBuffers.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    try {
      const pdfDoc = await PDFDocument.create();
      const pageSize = this.getPageDimensions(
        options.pageSize || 'A4',
        options.orientation || 'portrait',
      );

      for (const imageBuffer of imageBuffers) {
        // Detect image type
        const isJpeg =
          imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8;
        const isPng =
          imageBuffer[0] === 0x89 &&
          imageBuffer[1] === 0x50 &&
          imageBuffer[2] === 0x4e &&
          imageBuffer[3] === 0x47;

        let image;
        if (isJpeg) {
          image = await pdfDoc.embedJpg(imageBuffer);
        } else if (isPng) {
          image = await pdfDoc.embedPng(imageBuffer);
        } else {
          throw new BadRequestException('Only JPEG and PNG images are supported');
        }

        const margin = options.margin || 0;
        const page = pdfDoc.addPage([pageSize.width, pageSize.height]);

        // Scale image to fit page
        const availableWidth = pageSize.width - margin * 2;
        const availableHeight = pageSize.height - margin * 2;

        const scale = Math.min(
          availableWidth / image.width,
          availableHeight / image.height,
        );

        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;

        // Center image on page
        const x = margin + (availableWidth - scaledWidth) / 2;
        const y = margin + (availableHeight - scaledHeight) / 2;

        page.drawImage(image, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        });
      }

      return Buffer.from(await pdfDoc.save());
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Images to PDF failed: ${error.message}`);
      throw new BadRequestException('Failed to create PDF from images');
    }
  }

  async addWatermark(buffer: Buffer, text: string, options: any = {}): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont('Helvetica');

      const fontSize = options.fontSize || 40;
      const opacity = options.opacity || 0.3;

      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);

        page.drawText(text, {
          x: (width - textWidth) / 2,
          y: height / 2,
          size: fontSize,
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity,
          rotate: degrees(-45),
        });
      }

      return Buffer.from(await pdfDoc.save());
    } catch (error) {
      this.logger.error(`Add watermark failed: ${error.message}`);
      throw new BadRequestException('Failed to add watermark');
    }
  }

  private parsePageRanges(rangeStr: string, totalPages: number): number[] {
    const pages: Set<number> = new Set();
    const ranges = rangeStr.split(',').map((r) => r.trim());

    for (const range of ranges) {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map((n) => parseInt(n, 10));
        if (isNaN(start) || isNaN(end)) {
          throw new BadRequestException(`Invalid page range: ${range}`);
        }
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= totalPages) {
            pages.add(i - 1); // Convert to 0-based index
          }
        }
      } else {
        const page = parseInt(range, 10);
        if (isNaN(page)) {
          throw new BadRequestException(`Invalid page number: ${range}`);
        }
        if (page >= 1 && page <= totalPages) {
          pages.add(page - 1); // Convert to 0-based index
        }
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  }

  private getPageDimensions(
    pageSize: string,
    orientation: string,
  ): { width: number; height: number } {
    const sizes: Record<string, { width: number; height: number }> = {
      A4: { width: 595.276, height: 841.89 },
      LETTER: { width: 612, height: 792 },
      LEGAL: { width: 612, height: 1008 },
    };

    const size = sizes[pageSize.toUpperCase()] || sizes.A4;

    if (orientation === 'landscape') {
      return { width: size.height, height: size.width };
    }

    return size;
  }
}
