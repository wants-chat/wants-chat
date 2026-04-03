import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max, IsArray, IsEnum } from 'class-validator';

export enum PdfImageFormat {
  PNG = 'png',
  JPEG = 'jpeg',
}

export class PdfMergeDto {
  // Files are uploaded via multipart form-data
}

export class PdfSplitDto {
  @ApiPropertyOptional({ description: 'Page ranges to extract (e.g., "1-3,5,7-9")', example: '1-3' })
  @IsOptional()
  @IsString()
  pageRanges?: string;

  @ApiPropertyOptional({ description: 'Split into individual pages', default: false })
  @IsOptional()
  splitAll?: boolean;
}

export class PdfCompressDto {
  @ApiPropertyOptional({ description: 'Compression quality (1-100)', example: 80, default: 80 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  quality?: number;
}

export class PdfToImagesDto {
  @ApiPropertyOptional({ description: 'Output format', enum: PdfImageFormat, default: 'png' })
  @IsOptional()
  @IsEnum(PdfImageFormat)
  format?: PdfImageFormat;

  @ApiPropertyOptional({ description: 'DPI for image quality', example: 150, default: 150 })
  @IsOptional()
  @IsInt()
  @Min(72)
  @Max(600)
  dpi?: number;

  @ApiPropertyOptional({ description: 'Specific pages to convert (e.g., "1,3,5")' })
  @IsOptional()
  @IsString()
  pages?: string;
}

export class ImagesToPdfDto {
  @ApiPropertyOptional({ description: 'Page size', enum: ['A4', 'LETTER', 'LEGAL'], default: 'A4' })
  @IsOptional()
  @IsString()
  pageSize?: 'A4' | 'LETTER' | 'LEGAL';

  @ApiPropertyOptional({ description: 'Orientation', enum: ['portrait', 'landscape'], default: 'portrait' })
  @IsOptional()
  @IsString()
  orientation?: 'portrait' | 'landscape';

  @ApiPropertyOptional({ description: 'Margin in points', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  margin?: number;
}

export class PdfProtectDto {
  @ApiProperty({ description: 'Password to protect the PDF' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ description: 'Allow printing', default: false })
  @IsOptional()
  allowPrinting?: boolean;

  @ApiPropertyOptional({ description: 'Allow copying text', default: false })
  @IsOptional()
  allowCopying?: boolean;
}

export class PdfUnlockDto {
  @ApiProperty({ description: 'Password to unlock the PDF' })
  @IsString()
  password: string;
}

// Response DTOs
export class PdfProcessResponseDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  pageCount: number;

  @ApiProperty()
  sizeBytes: number;

  @ApiProperty()
  processingTimeMs: number;
}

export class PdfToImagesResponseDto {
  @ApiProperty({ type: [String] })
  urls: string[];

  @ApiProperty()
  pageCount: number;

  @ApiProperty()
  format: string;

  @ApiProperty()
  processingTimeMs: number;
}

export class PdfInfoResponseDto {
  @ApiProperty()
  pageCount: number;

  @ApiProperty()
  sizeBytes: number;

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  author?: string;

  @ApiProperty()
  isEncrypted: boolean;

  @ApiPropertyOptional()
  creationDate?: string;
}

// PDF to Document Conversion DTOs
export enum PdfConversionFormat {
  DOCX = 'docx',
  XLSX = 'xlsx',
  PPTX = 'pptx',
  TXT = 'txt',
  HTML = 'html',
}

export class PdfToDocumentDto {
  @ApiProperty({
    enum: PdfConversionFormat,
    description: 'Output format for conversion',
    example: PdfConversionFormat.DOCX,
  })
  @IsEnum(PdfConversionFormat)
  format: PdfConversionFormat;

  @ApiPropertyOptional({
    description: 'Custom output filename (without extension)',
    example: 'my-document',
  })
  @IsOptional()
  @IsString()
  outputName?: string;
}

export class PdfToDocumentResponseDto {
  @ApiProperty({ description: 'URL to download the converted file' })
  url: string;

  @ApiProperty({ description: 'Converted filename' })
  fileName: string;

  @ApiProperty({ description: 'Original PDF filename' })
  originalFileName: string;

  @ApiProperty({ description: 'Output format', enum: PdfConversionFormat })
  format: string;

  @ApiProperty({ description: 'File size in bytes' })
  sizeBytes: number;

  @ApiProperty({ description: 'Processing time in milliseconds' })
  processingTimeMs: number;
}
