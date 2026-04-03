import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsEnum,
  IsBoolean,
  ValidateNested,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============ Enums ============

export enum DocumentFormat {
  PDF = 'pdf',
  DOCX = 'docx',
  PPTX = 'pptx',
  MARKDOWN = 'markdown',
  HTML = 'html',
}

export enum PageSize {
  A4 = 'A4',
  LETTER = 'letter',
  LEGAL = 'legal',
  A3 = 'A3',
  A5 = 'A5',
}

export enum PageOrientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape',
}

export enum TextAlignment {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify',
}

export enum HeadingLevel {
  H1 = 1,
  H2 = 2,
  H3 = 3,
  H4 = 4,
  H5 = 5,
  H6 = 6,
}

// ============ Common Options ============

export class FontOptions {
  @ApiPropertyOptional({ description: 'Font family' })
  @IsOptional()
  @IsString()
  family?: string;

  @ApiPropertyOptional({ description: 'Font size in points' })
  @IsOptional()
  @IsNumber()
  @Min(6)
  @Max(72)
  size?: number;

  @ApiPropertyOptional({ description: 'Font color in hex' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Bold text' })
  @IsOptional()
  @IsBoolean()
  bold?: boolean;

  @ApiPropertyOptional({ description: 'Italic text' })
  @IsOptional()
  @IsBoolean()
  italic?: boolean;

  @ApiPropertyOptional({ description: 'Underline text' })
  @IsOptional()
  @IsBoolean()
  underline?: boolean;
}

export class MarginOptions {
  @ApiPropertyOptional({ description: 'Top margin in points', default: 72 })
  @IsOptional()
  @IsNumber()
  top?: number;

  @ApiPropertyOptional({ description: 'Bottom margin in points', default: 72 })
  @IsOptional()
  @IsNumber()
  bottom?: number;

  @ApiPropertyOptional({ description: 'Left margin in points', default: 72 })
  @IsOptional()
  @IsNumber()
  left?: number;

  @ApiPropertyOptional({ description: 'Right margin in points', default: 72 })
  @IsOptional()
  @IsNumber()
  right?: number;
}

// ============ PDF DTOs ============

export class PdfHeaderFooterOptions {
  @ApiPropertyOptional({ description: 'Header text' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ enum: TextAlignment })
  @IsOptional()
  @IsEnum(TextAlignment)
  alignment?: TextAlignment;

  @ApiPropertyOptional({ description: 'Include page numbers' })
  @IsOptional()
  @IsBoolean()
  includePageNumbers?: boolean;

  @ApiPropertyOptional({ description: 'Page number format (e.g., "Page {page} of {pages}")' })
  @IsOptional()
  @IsString()
  pageNumberFormat?: string;
}

export class PdfOptions {
  @ApiPropertyOptional({ enum: PageSize, default: PageSize.A4 })
  @IsOptional()
  @IsEnum(PageSize)
  pageSize?: PageSize;

  @ApiPropertyOptional({ enum: PageOrientation, default: PageOrientation.PORTRAIT })
  @IsOptional()
  @IsEnum(PageOrientation)
  orientation?: PageOrientation;

  @ApiPropertyOptional({ type: MarginOptions })
  @IsOptional()
  @ValidateNested()
  @Type(() => MarginOptions)
  margins?: MarginOptions;

  @ApiPropertyOptional({ type: FontOptions })
  @IsOptional()
  @ValidateNested()
  @Type(() => FontOptions)
  defaultFont?: FontOptions;

  @ApiPropertyOptional({ type: PdfHeaderFooterOptions })
  @IsOptional()
  @ValidateNested()
  @Type(() => PdfHeaderFooterOptions)
  header?: PdfHeaderFooterOptions;

  @ApiPropertyOptional({ type: PdfHeaderFooterOptions })
  @IsOptional()
  @ValidateNested()
  @Type(() => PdfHeaderFooterOptions)
  footer?: PdfHeaderFooterOptions;

  @ApiPropertyOptional({ description: 'Document title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Document author' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ description: 'Document subject' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: 'Document keywords' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({ description: 'Enable table of contents' })
  @IsOptional()
  @IsBoolean()
  tableOfContents?: boolean;

  @ApiPropertyOptional({ description: 'Watermark text' })
  @IsOptional()
  @IsString()
  watermark?: string;
}

export class GeneratePdfDto {
  @ApiProperty({ description: 'Content in markdown or HTML format' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Content type: markdown or html', default: 'markdown' })
  @IsOptional()
  @IsString()
  contentType?: 'markdown' | 'html';

  @ApiPropertyOptional({ type: PdfOptions })
  @IsOptional()
  @ValidateNested()
  @Type(() => PdfOptions)
  options?: PdfOptions;

  @ApiPropertyOptional({ description: 'Output filename (without extension)' })
  @IsOptional()
  @IsString()
  filename?: string;
}

// ============ DOCX DTOs ============

export class DocxSection {
  @ApiPropertyOptional({ description: 'Section title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Section content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ enum: HeadingLevel })
  @IsOptional()
  @IsNumber()
  headingLevel?: HeadingLevel;
}

export class DocxOptions {
  @ApiPropertyOptional({ enum: PageSize, default: PageSize.A4 })
  @IsOptional()
  @IsEnum(PageSize)
  pageSize?: PageSize;

  @ApiPropertyOptional({ enum: PageOrientation, default: PageOrientation.PORTRAIT })
  @IsOptional()
  @IsEnum(PageOrientation)
  orientation?: PageOrientation;

  @ApiPropertyOptional({ type: MarginOptions })
  @IsOptional()
  @ValidateNested()
  @Type(() => MarginOptions)
  margins?: MarginOptions;

  @ApiPropertyOptional({ description: 'Document title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Document author' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ description: 'Document description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Company name' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: 'Include table of contents' })
  @IsOptional()
  @IsBoolean()
  tableOfContents?: boolean;

  @ApiPropertyOptional({ description: 'Header text' })
  @IsOptional()
  @IsString()
  headerText?: string;

  @ApiPropertyOptional({ description: 'Footer text' })
  @IsOptional()
  @IsString()
  footerText?: string;

  @ApiPropertyOptional({ description: 'Include page numbers' })
  @IsOptional()
  @IsBoolean()
  includePageNumbers?: boolean;
}

export class GenerateDocxDto {
  @ApiProperty({ description: 'Content in markdown format' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ type: DocxOptions })
  @IsOptional()
  @ValidateNested()
  @Type(() => DocxOptions)
  options?: DocxOptions;

  @ApiPropertyOptional({ description: 'Output filename (without extension)' })
  @IsOptional()
  @IsString()
  filename?: string;
}

// ============ PPTX DTOs ============

export class SlideContent {
  @ApiPropertyOptional({ description: 'Text content' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ description: 'Bullet points' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bullets?: string[];

  @ApiPropertyOptional({ description: 'Image URL or base64' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Image position' })
  @IsOptional()
  @IsObject()
  imagePosition?: { x: number; y: number; width: number; height: number };

  @ApiPropertyOptional({ description: 'Notes for this slide' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SlideDto {
  @ApiProperty({ description: 'Slide title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Subtitle' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional({ type: SlideContent })
  @IsOptional()
  @ValidateNested()
  @Type(() => SlideContent)
  content?: SlideContent;

  @ApiPropertyOptional({ description: 'Slide layout type' })
  @IsOptional()
  @IsString()
  layout?: 'title' | 'titleAndContent' | 'sectionHeader' | 'twoColumn' | 'blank' | 'imageOnly';

  @ApiPropertyOptional({ description: 'Background color in hex' })
  @IsOptional()
  @IsString()
  backgroundColor?: string;
}

export class PptxTheme {
  @ApiPropertyOptional({ description: 'Primary color' })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional({ description: 'Secondary color' })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiPropertyOptional({ description: 'Background color' })
  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @ApiPropertyOptional({ description: 'Title font' })
  @IsOptional()
  @IsString()
  titleFont?: string;

  @ApiPropertyOptional({ description: 'Body font' })
  @IsOptional()
  @IsString()
  bodyFont?: string;
}

export class PptxOptions {
  @ApiPropertyOptional({ description: 'Presentation title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Author name' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ description: 'Company name' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: 'Subject' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ type: PptxTheme })
  @IsOptional()
  @ValidateNested()
  @Type(() => PptxTheme)
  theme?: PptxTheme;

  @ApiPropertyOptional({ description: 'Slide width in inches', default: 10 })
  @IsOptional()
  @IsNumber()
  slideWidth?: number;

  @ApiPropertyOptional({ description: 'Slide height in inches', default: 7.5 })
  @IsOptional()
  @IsNumber()
  slideHeight?: number;
}

export class GeneratePptxDto {
  @ApiProperty({ type: [SlideDto], description: 'Array of slides' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlideDto)
  slides: SlideDto[];

  @ApiPropertyOptional({ type: PptxOptions })
  @IsOptional()
  @ValidateNested()
  @Type(() => PptxOptions)
  options?: PptxOptions;

  @ApiPropertyOptional({ description: 'Output filename (without extension)' })
  @IsOptional()
  @IsString()
  filename?: string;
}

// ============ Markdown DTOs ============

export class MarkdownOptions {
  @ApiPropertyOptional({ description: 'Enable GitHub Flavored Markdown' })
  @IsOptional()
  @IsBoolean()
  gfm?: boolean;

  @ApiPropertyOptional({ description: 'Enable syntax highlighting' })
  @IsOptional()
  @IsBoolean()
  highlight?: boolean;

  @ApiPropertyOptional({ description: 'Include table of contents' })
  @IsOptional()
  @IsBoolean()
  toc?: boolean;

  @ApiPropertyOptional({ description: 'Line width for wrapping' })
  @IsOptional()
  @IsNumber()
  lineWidth?: number;
}

export class GenerateMarkdownDto {
  @ApiProperty({ description: 'Content to format as markdown' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Content type: html, text, or json', default: 'text' })
  @IsOptional()
  @IsString()
  contentType?: 'html' | 'text' | 'json';

  @ApiPropertyOptional({ type: MarkdownOptions })
  @IsOptional()
  @ValidateNested()
  @Type(() => MarkdownOptions)
  options?: MarkdownOptions;

  @ApiPropertyOptional({ description: 'Output filename (without extension)' })
  @IsOptional()
  @IsString()
  filename?: string;
}

// ============ Format Conversion DTOs ============

export class ConvertFormatDto {
  @ApiProperty({ description: 'Source file URL or base64 encoded content' })
  @IsString()
  source: string;

  @ApiProperty({ enum: DocumentFormat, description: 'Source format' })
  @IsEnum(DocumentFormat)
  fromFormat: DocumentFormat;

  @ApiProperty({ enum: DocumentFormat, description: 'Target format' })
  @IsEnum(DocumentFormat)
  toFormat: DocumentFormat;

  @ApiPropertyOptional({ description: 'Output filename (without extension)' })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiPropertyOptional({ description: 'Additional conversion options' })
  @IsOptional()
  @IsObject()
  options?: Record<string, any>;
}

// ============ Template DTOs ============

export class TemplateVariable {
  @ApiProperty({ description: 'Variable name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Variable value' })
  value: any;
}

export class GenerateFromTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  templateName: string;

  @ApiProperty({ type: [TemplateVariable], description: 'Template variables' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateVariable)
  variables: TemplateVariable[];

  @ApiProperty({ enum: DocumentFormat, description: 'Output format' })
  @IsEnum(DocumentFormat)
  outputFormat: DocumentFormat;

  @ApiPropertyOptional({ description: 'Output filename (without extension)' })
  @IsOptional()
  @IsString()
  filename?: string;
}

// ============ Response DTOs ============

export class DocumentGenerationResult {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiPropertyOptional({ description: 'Generated file URL' })
  url?: string;

  @ApiPropertyOptional({ description: 'File key in storage' })
  key?: string;

  @ApiPropertyOptional({ description: 'Filename' })
  filename?: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  size?: number;

  @ApiPropertyOptional({ description: 'MIME type' })
  mimeType?: string;

  @ApiPropertyOptional({ description: 'Error message if failed' })
  error?: string;

  @ApiPropertyOptional({ description: 'Base64 encoded content (if requested)' })
  base64?: string;
}

export class AvailableTemplatesResponse {
  @ApiProperty({ description: 'List of available templates' })
  templates: Array<{
    name: string;
    description: string;
    format: DocumentFormat;
    variables: string[];
  }>;
}

// ============ Batch Processing DTOs ============

export class BatchDocumentRequest {
  @ApiProperty({ enum: DocumentFormat, description: 'Document format' })
  @IsEnum(DocumentFormat)
  format: DocumentFormat;

  @ApiProperty({ description: 'Content for the document' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Options for generation' })
  @IsOptional()
  @IsObject()
  options?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Filename' })
  @IsOptional()
  @IsString()
  filename?: string;
}

export class BatchGenerateDto {
  @ApiProperty({ type: [BatchDocumentRequest], description: 'Documents to generate' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchDocumentRequest)
  documents: BatchDocumentRequest[];
}

export class BatchGenerationResult {
  @ApiProperty({ description: 'Total documents requested' })
  total: number;

  @ApiProperty({ description: 'Successfully generated' })
  successful: number;

  @ApiProperty({ description: 'Failed generations' })
  failed: number;

  @ApiProperty({ type: [DocumentGenerationResult], description: 'Results for each document' })
  results: DocumentGenerationResult[];
}
