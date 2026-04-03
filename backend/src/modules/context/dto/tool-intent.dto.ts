import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsObject,
  IsArray,
  IsUrl,
  IsUUID,
  Min,
  Max,
  ValidateNested,
  IsInt,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { z } from 'zod';

// ============================================
// FILE TYPE ENUMS & CONSTANTS
// ============================================

/**
 * Primary file categories for attachment analysis
 */
export enum FileCategory {
  IMAGE = 'image',
  DOCUMENT = 'document',
  SPREADSHEET = 'spreadsheet',
  AUDIO = 'audio',
  VIDEO = 'video',
  ARCHIVE = 'archive',
  CODE = 'code',
  DATA = 'data',
  PRESENTATION = 'presentation',
  EBOOK = 'ebook',
  FONT = 'font',
  VECTOR = 'vector',
  THREE_D = '3d',
  UNKNOWN = 'unknown',
}

/**
 * Specific file formats within each category
 */
export enum ImageFormat {
  JPEG = 'jpeg',
  JPG = 'jpg',
  PNG = 'png',
  GIF = 'gif',
  WEBP = 'webp',
  SVG = 'svg',
  BMP = 'bmp',
  TIFF = 'tiff',
  ICO = 'ico',
  HEIC = 'heic',
  HEIF = 'heif',
  AVIF = 'avif',
  RAW = 'raw',
  PSD = 'psd',
  AI = 'ai',
  EPS = 'eps',
}

export enum DocumentFormat {
  PDF = 'pdf',
  DOC = 'doc',
  DOCX = 'docx',
  ODT = 'odt',
  RTF = 'rtf',
  TXT = 'txt',
  MD = 'md',
  HTML = 'html',
  PAGES = 'pages',
}

export enum SpreadsheetFormat {
  CSV = 'csv',
  XLS = 'xls',
  XLSX = 'xlsx',
  ODS = 'ods',
  TSV = 'tsv',
  NUMBERS = 'numbers',
}

export enum AudioFormat {
  MP3 = 'mp3',
  WAV = 'wav',
  OGG = 'ogg',
  FLAC = 'flac',
  AAC = 'aac',
  WMA = 'wma',
  M4A = 'm4a',
  AIFF = 'aiff',
  OPUS = 'opus',
  WEBM_AUDIO = 'webm_audio',
}

export enum VideoFormat {
  MP4 = 'mp4',
  AVI = 'avi',
  MOV = 'mov',
  WMV = 'wmv',
  MKV = 'mkv',
  WEBM = 'webm',
  FLV = 'flv',
  M4V = 'm4v',
  MPEG = 'mpeg',
  OGV = 'ogv',
  THREE_GPP = '3gp',
}

export enum ArchiveFormat {
  ZIP = 'zip',
  RAR = 'rar',
  SEVEN_Z = '7z',
  TAR = 'tar',
  GZ = 'gz',
  TAR_GZ = 'tar.gz',
  BZ2 = 'bz2',
  XZ = 'xz',
}

export enum DataFormat {
  JSON = 'json',
  XML = 'xml',
  YAML = 'yaml',
  TOML = 'toml',
  SQL = 'sql',
  PARQUET = 'parquet',
  AVRO = 'avro',
}

export enum PresentationFormat {
  PPT = 'ppt',
  PPTX = 'pptx',
  ODP = 'odp',
  KEY = 'key',
}

export enum EbookFormat {
  EPUB = 'epub',
  MOBI = 'mobi',
  AZW = 'azw',
  AZW3 = 'azw3',
  FB2 = 'fb2',
}

// ============================================
// MIME TYPE MAPPINGS
// ============================================

export const MIME_TYPE_MAP: Record<string, { category: FileCategory; format: string }> = {
  // Images
  'image/jpeg': { category: FileCategory.IMAGE, format: 'jpeg' },
  'image/jpg': { category: FileCategory.IMAGE, format: 'jpg' },
  'image/png': { category: FileCategory.IMAGE, format: 'png' },
  'image/gif': { category: FileCategory.IMAGE, format: 'gif' },
  'image/webp': { category: FileCategory.IMAGE, format: 'webp' },
  'image/svg+xml': { category: FileCategory.VECTOR, format: 'svg' },
  'image/bmp': { category: FileCategory.IMAGE, format: 'bmp' },
  'image/tiff': { category: FileCategory.IMAGE, format: 'tiff' },
  'image/x-icon': { category: FileCategory.IMAGE, format: 'ico' },
  'image/heic': { category: FileCategory.IMAGE, format: 'heic' },
  'image/heif': { category: FileCategory.IMAGE, format: 'heif' },
  'image/avif': { category: FileCategory.IMAGE, format: 'avif' },
  'image/vnd.adobe.photoshop': { category: FileCategory.IMAGE, format: 'psd' },
  'application/postscript': { category: FileCategory.VECTOR, format: 'eps' },
  'application/illustrator': { category: FileCategory.VECTOR, format: 'ai' },

  // Documents
  'application/pdf': { category: FileCategory.DOCUMENT, format: 'pdf' },
  'application/msword': { category: FileCategory.DOCUMENT, format: 'doc' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    category: FileCategory.DOCUMENT,
    format: 'docx',
  },
  'application/vnd.oasis.opendocument.text': { category: FileCategory.DOCUMENT, format: 'odt' },
  'application/rtf': { category: FileCategory.DOCUMENT, format: 'rtf' },
  'text/plain': { category: FileCategory.DOCUMENT, format: 'txt' },
  'text/markdown': { category: FileCategory.DOCUMENT, format: 'md' },
  'text/html': { category: FileCategory.DOCUMENT, format: 'html' },

  // Spreadsheets
  'text/csv': { category: FileCategory.SPREADSHEET, format: 'csv' },
  'application/vnd.ms-excel': { category: FileCategory.SPREADSHEET, format: 'xls' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    category: FileCategory.SPREADSHEET,
    format: 'xlsx',
  },
  'application/vnd.oasis.opendocument.spreadsheet': {
    category: FileCategory.SPREADSHEET,
    format: 'ods',
  },
  'text/tab-separated-values': { category: FileCategory.SPREADSHEET, format: 'tsv' },

  // Audio
  'audio/mpeg': { category: FileCategory.AUDIO, format: 'mp3' },
  'audio/mp3': { category: FileCategory.AUDIO, format: 'mp3' },
  'audio/wav': { category: FileCategory.AUDIO, format: 'wav' },
  'audio/ogg': { category: FileCategory.AUDIO, format: 'ogg' },
  'audio/flac': { category: FileCategory.AUDIO, format: 'flac' },
  'audio/aac': { category: FileCategory.AUDIO, format: 'aac' },
  'audio/x-ms-wma': { category: FileCategory.AUDIO, format: 'wma' },
  'audio/mp4': { category: FileCategory.AUDIO, format: 'm4a' },
  'audio/x-m4a': { category: FileCategory.AUDIO, format: 'm4a' },
  'audio/aiff': { category: FileCategory.AUDIO, format: 'aiff' },
  'audio/opus': { category: FileCategory.AUDIO, format: 'opus' },
  'audio/webm': { category: FileCategory.AUDIO, format: 'webm_audio' },

  // Video
  'video/mp4': { category: FileCategory.VIDEO, format: 'mp4' },
  'video/x-msvideo': { category: FileCategory.VIDEO, format: 'avi' },
  'video/quicktime': { category: FileCategory.VIDEO, format: 'mov' },
  'video/x-ms-wmv': { category: FileCategory.VIDEO, format: 'wmv' },
  'video/x-matroska': { category: FileCategory.VIDEO, format: 'mkv' },
  'video/webm': { category: FileCategory.VIDEO, format: 'webm' },
  'video/x-flv': { category: FileCategory.VIDEO, format: 'flv' },
  'video/x-m4v': { category: FileCategory.VIDEO, format: 'm4v' },
  'video/mpeg': { category: FileCategory.VIDEO, format: 'mpeg' },
  'video/ogg': { category: FileCategory.VIDEO, format: 'ogv' },
  'video/3gpp': { category: FileCategory.VIDEO, format: '3gp' },

  // Archives
  'application/zip': { category: FileCategory.ARCHIVE, format: 'zip' },
  'application/x-zip-compressed': { category: FileCategory.ARCHIVE, format: 'zip' },
  'application/vnd.rar': { category: FileCategory.ARCHIVE, format: 'rar' },
  'application/x-rar-compressed': { category: FileCategory.ARCHIVE, format: 'rar' },
  'application/x-7z-compressed': { category: FileCategory.ARCHIVE, format: '7z' },
  'application/x-tar': { category: FileCategory.ARCHIVE, format: 'tar' },
  'application/gzip': { category: FileCategory.ARCHIVE, format: 'gz' },
  'application/x-bzip2': { category: FileCategory.ARCHIVE, format: 'bz2' },
  'application/x-xz': { category: FileCategory.ARCHIVE, format: 'xz' },

  // Data
  'application/json': { category: FileCategory.DATA, format: 'json' },
  'application/xml': { category: FileCategory.DATA, format: 'xml' },
  'text/xml': { category: FileCategory.DATA, format: 'xml' },
  'text/yaml': { category: FileCategory.DATA, format: 'yaml' },
  'application/x-yaml': { category: FileCategory.DATA, format: 'yaml' },
  'application/toml': { category: FileCategory.DATA, format: 'toml' },
  'application/sql': { category: FileCategory.DATA, format: 'sql' },
  'application/vnd.apache.parquet': { category: FileCategory.DATA, format: 'parquet' },
  'application/avro': { category: FileCategory.DATA, format: 'avro' },

  // Presentations
  'application/vnd.ms-powerpoint': { category: FileCategory.PRESENTATION, format: 'ppt' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    category: FileCategory.PRESENTATION,
    format: 'pptx',
  },
  'application/vnd.oasis.opendocument.presentation': {
    category: FileCategory.PRESENTATION,
    format: 'odp',
  },

  // Ebooks
  'application/epub+zip': { category: FileCategory.EBOOK, format: 'epub' },
  'application/x-mobipocket-ebook': { category: FileCategory.EBOOK, format: 'mobi' },

  // Fonts
  'font/ttf': { category: FileCategory.FONT, format: 'ttf' },
  'font/otf': { category: FileCategory.FONT, format: 'otf' },
  'font/woff': { category: FileCategory.FONT, format: 'woff' },
  'font/woff2': { category: FileCategory.FONT, format: 'woff2' },

  // 3D
  'model/gltf-binary': { category: FileCategory.THREE_D, format: 'glb' },
  'model/gltf+json': { category: FileCategory.THREE_D, format: 'gltf' },
  'model/obj': { category: FileCategory.THREE_D, format: 'obj' },
  'model/stl': { category: FileCategory.THREE_D, format: 'stl' },
};

// ============================================
// ATTACHMENT ANALYSIS DTOs
// ============================================

/**
 * Metadata specific to image files
 */
export class ImageMetadataDto {
  @IsInt()
  @IsPositive()
  width: number;

  @IsInt()
  @IsPositive()
  height: number;

  @IsString()
  format: string;

  @IsOptional()
  @IsString()
  colorSpace?: string;

  @IsOptional()
  @IsInt()
  bitDepth?: number;

  @IsOptional()
  @IsBoolean()
  hasAlpha?: boolean;

  @IsOptional()
  @IsBoolean()
  isAnimated?: boolean;

  @IsOptional()
  @IsInt()
  frameCount?: number;

  @IsOptional()
  @IsNumber()
  aspectRatio?: number;

  @IsOptional()
  @IsObject()
  exif?: Record<string, any>;
}

/**
 * Metadata specific to document files (PDF, Word, etc.)
 */
export class DocumentMetadataDto {
  @IsInt()
  @Min(0)
  pageCount: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  creator?: string;

  @IsOptional()
  @IsString()
  createdAt?: string;

  @IsOptional()
  @IsString()
  modifiedAt?: string;

  @IsOptional()
  @IsInt()
  wordCount?: number;

  @IsOptional()
  @IsInt()
  characterCount?: number;

  @IsOptional()
  @IsBoolean()
  isEncrypted?: boolean;

  @IsOptional()
  @IsBoolean()
  hasImages?: boolean;

  @IsOptional()
  @IsBoolean()
  hasTables?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];
}

/**
 * Metadata specific to spreadsheet files (CSV, Excel, etc.)
 */
export class SpreadsheetMetadataDto {
  @IsInt()
  @Min(0)
  rowCount: number;

  @IsInt()
  @Min(0)
  columnCount: number;

  @IsOptional()
  @IsInt()
  sheetCount?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sheetNames?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  headers?: string[];

  @IsOptional()
  @IsObject()
  columnTypes?: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  hasFormulas?: boolean;

  @IsOptional()
  @IsBoolean()
  hasPivotTables?: boolean;

  @IsOptional()
  @IsBoolean()
  hasCharts?: boolean;

  @IsOptional()
  @IsString()
  delimiter?: string; // For CSV/TSV

  @IsOptional()
  @IsString()
  encoding?: string;
}

/**
 * Metadata specific to audio files
 */
export class AudioMetadataDto {
  @IsNumber()
  @Min(0)
  duration: number; // Duration in seconds

  @IsOptional()
  @IsInt()
  sampleRate?: number;

  @IsOptional()
  @IsInt()
  bitrate?: number;

  @IsOptional()
  @IsInt()
  channels?: number;

  @IsOptional()
  @IsString()
  codec?: string;

  @IsOptional()
  @IsString()
  format?: string;

  // ID3 / metadata tags
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  artist?: string;

  @IsOptional()
  @IsString()
  album?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsInt()
  trackNumber?: number;

  @IsOptional()
  @IsBoolean()
  hasLyrics?: boolean;

  @IsOptional()
  @IsBoolean()
  hasCoverArt?: boolean;
}

/**
 * Metadata specific to video files
 */
export class VideoMetadataDto {
  @IsNumber()
  @Min(0)
  duration: number; // Duration in seconds

  @IsInt()
  @IsPositive()
  width: number;

  @IsInt()
  @IsPositive()
  height: number;

  @IsOptional()
  @IsNumber()
  frameRate?: number;

  @IsOptional()
  @IsInt()
  bitrate?: number;

  @IsOptional()
  @IsString()
  videoCodec?: string;

  @IsOptional()
  @IsString()
  audioCodec?: string;

  @IsOptional()
  @IsNumber()
  aspectRatio?: number;

  @IsOptional()
  @IsString()
  resolution?: string; // e.g., "1080p", "4K"

  @IsOptional()
  @IsBoolean()
  hasAudio?: boolean;

  @IsOptional()
  @IsBoolean()
  hasSubtitles?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subtitleLanguages?: string[];
}

/**
 * Metadata specific to archive files
 */
export class ArchiveMetadataDto {
  @IsInt()
  @Min(0)
  fileCount: number;

  @IsOptional()
  @IsInt()
  uncompressedSize?: number;

  @IsOptional()
  @IsNumber()
  compressionRatio?: number;

  @IsOptional()
  @IsBoolean()
  isEncrypted?: boolean;

  @IsOptional()
  @IsBoolean()
  isMultiPart?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topLevelEntries?: string[];

  @IsOptional()
  @IsObject()
  fileTypeBreakdown?: Record<string, number>;
}

/**
 * Comprehensive attachment analysis result
 */
export class AttachmentAnalysisDto {
  @IsString()
  id: string;

  @IsUrl()
  url: string;

  @IsString()
  name: string;

  @IsString()
  originalName: string;

  @IsString()
  mimeType: string;

  @IsEnum(FileCategory)
  category: FileCategory;

  @IsString()
  format: string;

  @IsString()
  extension: string;

  @IsInt()
  @Min(0)
  size: number; // Size in bytes

  @IsString()
  sizeFormatted: string; // Human-readable size

  @IsOptional()
  @ValidateNested()
  @Type(() => ImageMetadataDto)
  imageMetadata?: ImageMetadataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentMetadataDto)
  documentMetadata?: DocumentMetadataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SpreadsheetMetadataDto)
  spreadsheetMetadata?: SpreadsheetMetadataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AudioMetadataDto)
  audioMetadata?: AudioMetadataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VideoMetadataDto)
  videoMetadata?: VideoMetadataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ArchiveMetadataDto)
  archiveMetadata?: ArchiveMetadataDto;

  @IsOptional()
  @IsObject()
  rawMetadata?: Record<string, any>;

  @IsBoolean()
  isProcessable: boolean;

  @IsArray()
  @IsString({ each: true })
  supportedOperations: string[];

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  previewUrl?: string;

  @IsString()
  analyzedAt: string;
}

// ============================================
// TOOL INTENT REQUEST DTOs
// ============================================

/**
 * Basic attachment info for intent extraction
 */
export class AttachmentInputDto {
  @IsUrl()
  url: string;

  @IsString()
  name: string;

  @IsString()
  type: string; // MIME type

  @IsInt()
  @Min(0)
  size: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * Conversation message for context
 */
export class ConversationMessageDto {
  @IsEnum(['user', 'assistant', 'system'])
  role: 'user' | 'assistant' | 'system';

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  timestamp?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentInputDto)
  attachments?: AttachmentInputDto[];
}

/**
 * User preferences from onboarding
 */
export class UserPreferencesDto {
  @IsOptional()
  @IsString()
  preferredCurrency?: string;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @IsOptional()
  @IsString()
  measurementSystem?: 'metric' | 'imperial';

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  tonePreference?: 'professional' | 'casual' | 'formal' | 'friendly';

  @IsOptional()
  @IsString()
  outputLength?: 'short' | 'medium' | 'long' | 'detailed';

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  fitnessGoal?: string;

  @IsOptional()
  @IsString()
  financialGoal?: string;

  @IsOptional()
  @IsObject()
  additionalPreferences?: Record<string, any>;
}

/**
 * Complete request for tool intent extraction
 */
export class ToolIntentRequestDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentInputDto)
  attachments?: AttachmentInputDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationMessageDto)
  conversationContext?: ConversationMessageDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => UserPreferencesDto)
  userPreferences?: UserPreferencesDto;

  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsString()
  locale?: string;
}

// ============================================
// EXTRACTED FIELD VALUE DTOs
// ============================================

/**
 * Source of an extracted value
 */
export enum ExtractedValueSource {
  MESSAGE = 'message', // Extracted from user message text
  ATTACHMENT = 'attachment', // Extracted from attachment analysis
  CONTEXT = 'context', // Inferred from conversation context
  PREFERENCE = 'preference', // From user preferences/onboarding
  DEFAULT = 'default', // Default value for the field
  HISTORY = 'history', // From UI usage history
}

/**
 * Single extracted field value
 */
export class ExtractedFieldValueDto {
  @IsString()
  fieldName: string;

  value: any;

  @IsEnum(ExtractedValueSource)
  source: ExtractedValueSource;

  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;

  @IsOptional()
  @IsString()
  sourceDescription?: string;

  @IsOptional()
  @IsString()
  attachmentId?: string; // If source is attachment

  @IsOptional()
  @IsString()
  extractedFrom?: string; // What text/context it was extracted from

  @IsOptional()
  @IsBoolean()
  requiresConfirmation?: boolean;

  @IsOptional()
  @IsArray()
  alternatives?: any[]; // Alternative values if uncertain
}

// ============================================
// TOOL INTENT RESULT DTOs
// ============================================

/**
 * Tool categories for intent patterns
 */
export enum ToolCategory {
  // Image Tools
  IMAGE_RESIZE = 'image_resize',
  IMAGE_CROP = 'image_crop',
  IMAGE_CONVERT = 'image_convert',
  IMAGE_COMPRESS = 'image_compress',
  IMAGE_BACKGROUND = 'image_background',
  IMAGE_FILTER = 'image_filter',
  IMAGE_ROTATE = 'image_rotate',
  IMAGE_WATERMARK = 'image_watermark',
  IMAGE_METADATA = 'image_metadata',
  IMAGE_OCR = 'image_ocr',
  IMAGE_UPSCALE = 'image_upscale',
  IMAGE_COLLAGE = 'image_collage',

  // Document Tools
  DOCUMENT_MERGE = 'document_merge',
  DOCUMENT_SPLIT = 'document_split',
  DOCUMENT_CONVERT = 'document_convert',
  DOCUMENT_COMPRESS = 'document_compress',
  DOCUMENT_EXTRACT = 'document_extract',
  DOCUMENT_SIGN = 'document_sign',
  DOCUMENT_PROTECT = 'document_protect',
  DOCUMENT_OCR = 'document_ocr',
  DOCUMENT_TRANSLATE = 'document_translate',

  // Data Tools
  DATA_ANALYZE = 'data_analyze',
  DATA_CHART = 'data_chart',
  DATA_QUERY = 'data_query',
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  DATA_CLEAN = 'data_clean',
  DATA_MERGE = 'data_merge',
  DATA_PIVOT = 'data_pivot',
  DATA_TRANSFORM = 'data_transform',

  // Generator Tools
  GENERATOR_QR = 'generator_qr',
  GENERATOR_BARCODE = 'generator_barcode',
  GENERATOR_INVOICE = 'generator_invoice',
  GENERATOR_CERTIFICATE = 'generator_certificate',
  GENERATOR_RECEIPT = 'generator_receipt',
  GENERATOR_CONTRACT = 'generator_contract',
  GENERATOR_RESUME = 'generator_resume',
  GENERATOR_LETTER = 'generator_letter',
  GENERATOR_PASSWORD = 'generator_password',
  GENERATOR_UUID = 'generator_uuid',
  GENERATOR_LOREM = 'generator_lorem',
  GENERATOR_PLACEHOLDER = 'generator_placeholder',
  GENERATOR_ICON = 'generator_icon',
  GENERATOR_FAVICON = 'generator_favicon',
  GENERATOR_SOCIAL = 'generator_social',

  // Calculator Tools
  CALCULATOR_BMI = 'calculator_bmi',
  CALCULATOR_LOAN = 'calculator_loan',
  CALCULATOR_MORTGAGE = 'calculator_mortgage',
  CALCULATOR_TAX = 'calculator_tax',
  CALCULATOR_TIP = 'calculator_tip',
  CALCULATOR_AGE = 'calculator_age',
  CALCULATOR_DATE = 'calculator_date',
  CALCULATOR_PERCENTAGE = 'calculator_percentage',
  CALCULATOR_DISCOUNT = 'calculator_discount',
  CALCULATOR_COMPOUND = 'calculator_compound',
  CALCULATOR_CALORIES = 'calculator_calories',
  CALCULATOR_MACRO = 'calculator_macro',
  CALCULATOR_PREGNANCY = 'calculator_pregnancy',
  CALCULATOR_GPA = 'calculator_gpa',
  CALCULATOR_GRADE = 'calculator_grade',
  CALCULATOR_FUEL = 'calculator_fuel',
  CALCULATOR_ELECTRICITY = 'calculator_electricity',

  // Converter Tools
  CONVERTER_UNIT = 'converter_unit',
  CONVERTER_CURRENCY = 'converter_currency',
  CONVERTER_TIMEZONE = 'converter_timezone',
  CONVERTER_COLOR = 'converter_color',
  CONVERTER_TEMPERATURE = 'converter_temperature',
  CONVERTER_LENGTH = 'converter_length',
  CONVERTER_WEIGHT = 'converter_weight',
  CONVERTER_VOLUME = 'converter_volume',
  CONVERTER_AREA = 'converter_area',
  CONVERTER_SPEED = 'converter_speed',
  CONVERTER_TIME = 'converter_time',
  CONVERTER_DATA = 'converter_data',
  CONVERTER_ENERGY = 'converter_energy',
  CONVERTER_PRESSURE = 'converter_pressure',
  CONVERTER_ANGLE = 'converter_angle',
  CONVERTER_BASE = 'converter_base',
  CONVERTER_ENCODING = 'converter_encoding',
  CONVERTER_CASE = 'converter_case',
  CONVERTER_EPOCH = 'converter_epoch',
  CONVERTER_ROMAN = 'converter_roman',

  // Media Tools
  MEDIA_AUDIO_CONVERT = 'media_audio_convert',
  MEDIA_AUDIO_TRIM = 'media_audio_trim',
  MEDIA_AUDIO_MERGE = 'media_audio_merge',
  MEDIA_AUDIO_EXTRACT = 'media_audio_extract',
  MEDIA_VIDEO_CONVERT = 'media_video_convert',
  MEDIA_VIDEO_TRIM = 'media_video_trim',
  MEDIA_VIDEO_COMPRESS = 'media_video_compress',
  MEDIA_VIDEO_GIF = 'media_video_gif',
  MEDIA_VIDEO_THUMBNAIL = 'media_video_thumbnail',
  MEDIA_TRANSCRIBE = 'media_transcribe',

  // Text Tools
  TEXT_SUMMARIZE = 'text_summarize',
  TEXT_TRANSLATE = 'text_translate',
  TEXT_GRAMMAR = 'text_grammar',
  TEXT_PARAPHRASE = 'text_paraphrase',
  TEXT_FORMAT = 'text_format',
  TEXT_COUNT = 'text_count',
  TEXT_DIFF = 'text_diff',
  TEXT_HASH = 'text_hash',
  TEXT_MINIFY = 'text_minify',
  TEXT_BEAUTIFY = 'text_beautify',

  // Code Tools
  CODE_FORMAT = 'code_format',
  CODE_MINIFY = 'code_minify',
  CODE_CONVERT = 'code_convert',
  CODE_EXPLAIN = 'code_explain',
  CODE_REVIEW = 'code_review',
  CODE_GENERATE = 'code_generate',
  CODE_REGEX = 'code_regex',
  CODE_JSON = 'code_json',
  CODE_SQL = 'code_sql',
  CODE_CSS = 'code_css',
  CODE_HTML = 'code_html',

  // Web Tools
  WEB_SCREENSHOT = 'web_screenshot',
  WEB_SCRAPE = 'web_scrape',
  WEB_SUMMARIZE = 'web_summarize',
  WEB_RESEARCH = 'web_research',
  WEB_META = 'web_meta',
  WEB_VALIDATE = 'web_validate',
  WEB_SPEED = 'web_speed',
  WEB_SEO = 'web_seo',

  // Business Tools
  BUSINESS_PROPOSAL = 'business_proposal',
  BUSINESS_QUOTE = 'business_quote',
  BUSINESS_ESTIMATE = 'business_estimate',
  BUSINESS_TIMESHEET = 'business_timesheet',
  BUSINESS_EXPENSE = 'business_expense',
  BUSINESS_REPORT = 'business_report',

  // Writing Tools
  WRITING_EMAIL = 'writing_email',
  WRITING_BLOG = 'writing_blog',
  WRITING_SOCIAL = 'writing_social',
  WRITING_AD = 'writing_ad',
  WRITING_PRODUCT = 'writing_product',
  WRITING_STORY = 'writing_story',
  WRITING_POEM = 'writing_poem',

  // General/Other
  GENERAL = 'general',
  UNKNOWN = 'unknown',
}

/**
 * Detected intent with confidence
 */
export class DetectedIntentDto {
  @IsString()
  toolId: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;

  @IsEnum(ToolCategory)
  category: ToolCategory;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsString()
  matchedPattern?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * Mapping of attachment to tool field
 */
export class AttachmentMappingDto {
  @IsString()
  attachmentId: string;

  @IsString()
  fieldName: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;

  @IsString()
  reason: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alternativeFields?: string[];
}

/**
 * Suggested tool with prefill values
 */
export class SuggestedToolDto {
  @IsString()
  toolId: string;

  @IsString()
  toolName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  relevanceScore: number;

  @IsObject()
  prefillValues: Record<string, any>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExtractedFieldValueDto)
  extractedFields: ExtractedFieldValueDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentMappingDto)
  attachmentMappings?: AttachmentMappingDto[];

  @IsOptional()
  @IsBoolean()
  isReady?: boolean; // True if all required fields are filled

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  missingRequiredFields?: string[];
}

/**
 * Complete tool intent extraction result
 */
export class ToolIntentResultDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetectedIntentDto)
  detectedIntents: DetectedIntentDto[];

  @IsObject()
  extractedValues: Record<string, ExtractedFieldValueDto>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentMappingDto)
  attachmentMappings: AttachmentMappingDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SuggestedToolDto)
  suggestedTools: SuggestedToolDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentAnalysisDto)
  analyzedAttachments?: AttachmentAnalysisDto[];

  @IsOptional()
  @IsString()
  primaryIntent?: string;

  @IsOptional()
  @IsString()
  userGoal?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  followUpQuestions?: string[];

  @IsBoolean()
  hasFileAction: boolean;

  @IsBoolean()
  requiresMoreInfo: boolean;

  @IsString()
  processedAt: string;
}

// ============================================
// TOOL CATEGORY PATTERNS
// ============================================

/**
 * Intent pattern for a specific tool category
 */
export class ToolCategoryPatternDto {
  @IsEnum(ToolCategory)
  category: ToolCategory;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  keywords: string[];

  @IsArray()
  @IsString({ each: true })
  phrases: string[];

  @IsArray()
  @IsString({ each: true })
  inputFileTypes: string[];

  @IsArray()
  @IsString({ each: true })
  outputFileTypes: string[];

  @IsArray()
  @IsString({ each: true })
  relatedTools: string[];

  @IsOptional()
  @IsObject()
  commonPrefillFields?: Record<string, string>;

  @IsOptional()
  @IsNumber()
  priority?: number;
}

// ============================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================

// File Category Schema
export const fileCategorySchema = z.enum([
  'image',
  'document',
  'spreadsheet',
  'audio',
  'video',
  'archive',
  'code',
  'data',
  'presentation',
  'ebook',
  'font',
  'vector',
  '3d',
  'unknown',
]);

// Image Metadata Schema
export const imageMetadataSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  format: z.string(),
  colorSpace: z.string().optional(),
  bitDepth: z.number().int().optional(),
  hasAlpha: z.boolean().optional(),
  isAnimated: z.boolean().optional(),
  frameCount: z.number().int().optional(),
  aspectRatio: z.number().optional(),
  exif: z.record(z.any()).optional(),
});

// Document Metadata Schema
export const documentMetadataSchema = z.object({
  pageCount: z.number().int().min(0),
  title: z.string().optional(),
  author: z.string().optional(),
  subject: z.string().optional(),
  creator: z.string().optional(),
  createdAt: z.string().optional(),
  modifiedAt: z.string().optional(),
  wordCount: z.number().int().optional(),
  characterCount: z.number().int().optional(),
  isEncrypted: z.boolean().optional(),
  hasImages: z.boolean().optional(),
  hasTables: z.boolean().optional(),
  languages: z.array(z.string()).optional(),
});

// Spreadsheet Metadata Schema
export const spreadsheetMetadataSchema = z.object({
  rowCount: z.number().int().min(0),
  columnCount: z.number().int().min(0),
  sheetCount: z.number().int().optional(),
  sheetNames: z.array(z.string()).optional(),
  headers: z.array(z.string()).optional(),
  columnTypes: z.record(z.string()).optional(),
  hasFormulas: z.boolean().optional(),
  hasPivotTables: z.boolean().optional(),
  hasCharts: z.boolean().optional(),
  delimiter: z.string().optional(),
  encoding: z.string().optional(),
});

// Audio Metadata Schema
export const audioMetadataSchema = z.object({
  duration: z.number().min(0),
  sampleRate: z.number().int().optional(),
  bitrate: z.number().int().optional(),
  channels: z.number().int().optional(),
  codec: z.string().optional(),
  format: z.string().optional(),
  title: z.string().optional(),
  artist: z.string().optional(),
  album: z.string().optional(),
  genre: z.string().optional(),
  year: z.number().int().optional(),
  trackNumber: z.number().int().optional(),
  hasLyrics: z.boolean().optional(),
  hasCoverArt: z.boolean().optional(),
});

// Video Metadata Schema
export const videoMetadataSchema = z.object({
  duration: z.number().min(0),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  frameRate: z.number().optional(),
  bitrate: z.number().int().optional(),
  videoCodec: z.string().optional(),
  audioCodec: z.string().optional(),
  aspectRatio: z.number().optional(),
  resolution: z.string().optional(),
  hasAudio: z.boolean().optional(),
  hasSubtitles: z.boolean().optional(),
  subtitleLanguages: z.array(z.string()).optional(),
});

// Archive Metadata Schema
export const archiveMetadataSchema = z.object({
  fileCount: z.number().int().min(0),
  uncompressedSize: z.number().int().optional(),
  compressionRatio: z.number().optional(),
  isEncrypted: z.boolean().optional(),
  isMultiPart: z.boolean().optional(),
  topLevelEntries: z.array(z.string()).optional(),
  fileTypeBreakdown: z.record(z.number()).optional(),
});

// Attachment Analysis Schema
export const attachmentAnalysisSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  name: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  category: fileCategorySchema,
  format: z.string(),
  extension: z.string(),
  size: z.number().int().min(0),
  sizeFormatted: z.string(),
  imageMetadata: imageMetadataSchema.optional(),
  documentMetadata: documentMetadataSchema.optional(),
  spreadsheetMetadata: spreadsheetMetadataSchema.optional(),
  audioMetadata: audioMetadataSchema.optional(),
  videoMetadata: videoMetadataSchema.optional(),
  archiveMetadata: archiveMetadataSchema.optional(),
  rawMetadata: z.record(z.any()).optional(),
  isProcessable: z.boolean(),
  supportedOperations: z.array(z.string()),
  thumbnailUrl: z.string().url().optional(),
  previewUrl: z.string().url().optional(),
  analyzedAt: z.string(),
});

// Attachment Input Schema
export const attachmentInputSchema = z.object({
  url: z.string().url(),
  name: z.string(),
  type: z.string(),
  size: z.number().int().min(0),
  metadata: z.record(z.any()).optional(),
});

// Conversation Message Schema
export const conversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.string().optional(),
  attachments: z.array(attachmentInputSchema).optional(),
});

// User Preferences Schema
export const userPreferencesSchema = z.object({
  preferredCurrency: z.string().optional(),
  preferredLanguage: z.string().optional(),
  measurementSystem: z.enum(['metric', 'imperial']).optional(),
  timezone: z.string().optional(),
  country: z.string().optional(),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  tonePreference: z.enum(['professional', 'casual', 'formal', 'friendly']).optional(),
  outputLength: z.enum(['short', 'medium', 'long', 'detailed']).optional(),
  weightKg: z.number().optional(),
  heightCm: z.number().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  fitnessGoal: z.string().optional(),
  financialGoal: z.string().optional(),
  additionalPreferences: z.record(z.any()).optional(),
});

// Tool Intent Request Schema
export const toolIntentRequestSchema = z.object({
  message: z.string().min(1),
  attachments: z.array(attachmentInputSchema).optional(),
  conversationContext: z.array(conversationMessageSchema).optional(),
  userPreferences: userPreferencesSchema.optional(),
  conversationId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
  locale: z.string().optional(),
});

// Extracted Value Source Schema
export const extractedValueSourceSchema = z.enum([
  'message',
  'attachment',
  'context',
  'preference',
  'default',
  'history',
]);

// Extracted Field Value Schema
export const extractedFieldValueSchema = z.object({
  fieldName: z.string(),
  value: z.any(),
  source: extractedValueSourceSchema,
  confidence: z.number().min(0).max(1),
  sourceDescription: z.string().optional(),
  attachmentId: z.string().optional(),
  extractedFrom: z.string().optional(),
  requiresConfirmation: z.boolean().optional(),
  alternatives: z.array(z.any()).optional(),
});

// Tool Category Schema
export const toolCategorySchema = z.enum([
  // Image Tools
  'image_resize',
  'image_crop',
  'image_convert',
  'image_compress',
  'image_background',
  'image_filter',
  'image_rotate',
  'image_watermark',
  'image_metadata',
  'image_ocr',
  'image_upscale',
  'image_collage',
  // Document Tools
  'document_merge',
  'document_split',
  'document_convert',
  'document_compress',
  'document_extract',
  'document_sign',
  'document_protect',
  'document_ocr',
  'document_translate',
  // Data Tools
  'data_analyze',
  'data_chart',
  'data_query',
  'data_export',
  'data_import',
  'data_clean',
  'data_merge',
  'data_pivot',
  'data_transform',
  // Generator Tools
  'generator_qr',
  'generator_barcode',
  'generator_invoice',
  'generator_certificate',
  'generator_receipt',
  'generator_contract',
  'generator_resume',
  'generator_letter',
  'generator_password',
  'generator_uuid',
  'generator_lorem',
  'generator_placeholder',
  'generator_icon',
  'generator_favicon',
  'generator_social',
  // Calculator Tools
  'calculator_bmi',
  'calculator_loan',
  'calculator_mortgage',
  'calculator_tax',
  'calculator_tip',
  'calculator_age',
  'calculator_date',
  'calculator_percentage',
  'calculator_discount',
  'calculator_compound',
  'calculator_calories',
  'calculator_macro',
  'calculator_pregnancy',
  'calculator_gpa',
  'calculator_grade',
  'calculator_fuel',
  'calculator_electricity',
  // Converter Tools
  'converter_unit',
  'converter_currency',
  'converter_timezone',
  'converter_color',
  'converter_temperature',
  'converter_length',
  'converter_weight',
  'converter_volume',
  'converter_area',
  'converter_speed',
  'converter_time',
  'converter_data',
  'converter_energy',
  'converter_pressure',
  'converter_angle',
  'converter_base',
  'converter_encoding',
  'converter_case',
  'converter_epoch',
  'converter_roman',
  // Media Tools
  'media_audio_convert',
  'media_audio_trim',
  'media_audio_merge',
  'media_audio_extract',
  'media_video_convert',
  'media_video_trim',
  'media_video_compress',
  'media_video_gif',
  'media_video_thumbnail',
  'media_transcribe',
  // Text Tools
  'text_summarize',
  'text_translate',
  'text_grammar',
  'text_paraphrase',
  'text_format',
  'text_count',
  'text_diff',
  'text_hash',
  'text_minify',
  'text_beautify',
  // Code Tools
  'code_format',
  'code_minify',
  'code_convert',
  'code_explain',
  'code_review',
  'code_generate',
  'code_regex',
  'code_json',
  'code_sql',
  'code_css',
  'code_html',
  // Web Tools
  'web_screenshot',
  'web_scrape',
  'web_summarize',
  'web_research',
  'web_meta',
  'web_validate',
  'web_speed',
  'web_seo',
  // Business Tools
  'business_proposal',
  'business_quote',
  'business_estimate',
  'business_timesheet',
  'business_expense',
  'business_report',
  // Writing Tools
  'writing_email',
  'writing_blog',
  'writing_social',
  'writing_ad',
  'writing_product',
  'writing_story',
  'writing_poem',
  // General
  'general',
  'unknown',
]);

// Detected Intent Schema
export const detectedIntentSchema = z.object({
  toolId: z.string(),
  confidence: z.number().min(0).max(1),
  category: toolCategorySchema,
  subcategory: z.string().optional(),
  matchedPattern: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  reason: z.string().optional(),
});

// Attachment Mapping Schema
export const attachmentMappingSchema = z.object({
  attachmentId: z.string(),
  fieldName: z.string(),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
  isPrimary: z.boolean().optional(),
  alternativeFields: z.array(z.string()).optional(),
});

// Suggested Tool Schema
export const suggestedToolSchema = z.object({
  toolId: z.string(),
  toolName: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  category: z.string().optional(),
  relevanceScore: z.number().min(0).max(1),
  prefillValues: z.record(z.any()),
  extractedFields: z.array(extractedFieldValueSchema),
  attachmentMappings: z.array(attachmentMappingSchema).optional(),
  isReady: z.boolean().optional(),
  missingRequiredFields: z.array(z.string()).optional(),
});

// Tool Intent Result Schema
export const toolIntentResultSchema = z.object({
  detectedIntents: z.array(detectedIntentSchema),
  extractedValues: z.record(extractedFieldValueSchema),
  attachmentMappings: z.array(attachmentMappingSchema),
  suggestedTools: z.array(suggestedToolSchema),
  analyzedAttachments: z.array(attachmentAnalysisSchema).optional(),
  primaryIntent: z.string().optional(),
  userGoal: z.string().optional(),
  followUpQuestions: z.array(z.string()).optional(),
  hasFileAction: z.boolean(),
  requiresMoreInfo: z.boolean(),
  processedAt: z.string(),
});

// Tool Category Pattern Schema
export const toolCategoryPatternSchema = z.object({
  category: toolCategorySchema,
  name: z.string(),
  description: z.string(),
  keywords: z.array(z.string()),
  phrases: z.array(z.string()),
  inputFileTypes: z.array(z.string()),
  outputFileTypes: z.array(z.string()),
  relatedTools: z.array(z.string()),
  commonPrefillFields: z.record(z.string()).optional(),
  priority: z.number().optional(),
});

// ============================================
// PREDEFINED TOOL CATEGORY PATTERNS
// ============================================

export const TOOL_CATEGORY_PATTERNS: ToolCategoryPatternDto[] = [
  // IMAGE TOOLS
  {
    category: ToolCategory.IMAGE_RESIZE,
    name: 'Image Resize',
    description: 'Resize images to specific dimensions',
    keywords: ['resize', 'scale', 'dimension', 'size', 'shrink', 'enlarge', 'reduce'],
    phrases: [
      'resize image',
      'change image size',
      'make image smaller',
      'make image larger',
      'scale image',
      'resize to',
      'change dimensions',
    ],
    inputFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
    outputFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
    relatedTools: ['image_compress', 'image_crop', 'image_convert'],
    commonPrefillFields: { width: 'width', height: 'height', maintainAspectRatio: 'true' },
    priority: 1,
  },
  {
    category: ToolCategory.IMAGE_CROP,
    name: 'Image Crop',
    description: 'Crop images to specific areas',
    keywords: ['crop', 'trim', 'cut', 'clip', 'section', 'portion'],
    phrases: [
      'crop image',
      'crop photo',
      'trim image',
      'cut image',
      'crop to square',
      'crop to circle',
    ],
    inputFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    outputFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
    relatedTools: ['image_resize', 'image_rotate'],
    commonPrefillFields: { aspectRatio: '1:1' },
    priority: 2,
  },
  {
    category: ToolCategory.IMAGE_CONVERT,
    name: 'Image Convert',
    description: 'Convert images between formats',
    keywords: ['convert', 'change format', 'transform', 'export as', 'save as'],
    phrases: [
      'convert to png',
      'convert to jpg',
      'convert to webp',
      'change image format',
      'png to jpg',
      'jpg to png',
      'heic to jpg',
      'webp to png',
    ],
    inputFileTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/heic',
      'image/tiff',
    ],
    outputFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    relatedTools: ['image_compress', 'image_resize'],
    commonPrefillFields: {},
    priority: 1,
  },
  {
    category: ToolCategory.IMAGE_COMPRESS,
    name: 'Image Compress',
    description: 'Compress images to reduce file size',
    keywords: ['compress', 'reduce', 'optimize', 'minimize', 'smaller file', 'quality'],
    phrases: [
      'compress image',
      'reduce image size',
      'optimize image',
      'make image smaller',
      'reduce file size',
      'compress photo',
    ],
    inputFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
    outputFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
    relatedTools: ['image_resize', 'image_convert'],
    commonPrefillFields: { quality: '80' },
    priority: 1,
  },
  {
    category: ToolCategory.IMAGE_BACKGROUND,
    name: 'Background Removal',
    description: 'Remove or change image backgrounds',
    keywords: [
      'background',
      'remove background',
      'transparent',
      'cutout',
      'extract',
      'isolate',
      'replace background',
    ],
    phrases: [
      'remove background',
      'make background transparent',
      'extract subject',
      'change background',
      'white background',
      'cut out person',
    ],
    inputFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
    outputFileTypes: ['image/png'],
    relatedTools: ['image_crop'],
    commonPrefillFields: { outputFormat: 'png' },
    priority: 1,
  },
  {
    category: ToolCategory.IMAGE_OCR,
    name: 'Image OCR',
    description: 'Extract text from images',
    keywords: ['ocr', 'extract text', 'read text', 'recognize', 'text from image', 'scan'],
    phrases: [
      'extract text from image',
      'read text in image',
      'ocr this image',
      'get text from photo',
      'scan document',
      'recognize text',
    ],
    inputFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'application/pdf'],
    outputFileTypes: ['text/plain', 'application/json'],
    relatedTools: ['document_ocr'],
    commonPrefillFields: { language: 'auto' },
    priority: 2,
  },

  // DOCUMENT TOOLS
  {
    category: ToolCategory.DOCUMENT_MERGE,
    name: 'Document Merge',
    description: 'Merge multiple documents into one',
    keywords: ['merge', 'combine', 'join', 'concatenate', 'unite'],
    phrases: [
      'merge pdfs',
      'combine documents',
      'join pdf files',
      'merge word documents',
      'combine files',
    ],
    inputFileTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    outputFileTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    relatedTools: ['document_split'],
    commonPrefillFields: {},
    priority: 1,
  },
  {
    category: ToolCategory.DOCUMENT_SPLIT,
    name: 'Document Split',
    description: 'Split documents into separate files',
    keywords: ['split', 'separate', 'divide', 'extract pages', 'break apart'],
    phrases: [
      'split pdf',
      'extract pages',
      'separate document',
      'split by pages',
      'extract specific pages',
    ],
    inputFileTypes: ['application/pdf'],
    outputFileTypes: ['application/pdf'],
    relatedTools: ['document_merge'],
    commonPrefillFields: {},
    priority: 2,
  },
  {
    category: ToolCategory.DOCUMENT_CONVERT,
    name: 'Document Convert',
    description: 'Convert documents between formats',
    keywords: ['convert', 'transform', 'change format', 'export', 'save as'],
    phrases: [
      'convert to pdf',
      'pdf to word',
      'word to pdf',
      'convert document',
      'docx to pdf',
      'excel to pdf',
    ],
    inputFileTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/html',
    ],
    outputFileTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    relatedTools: ['document_compress'],
    commonPrefillFields: {},
    priority: 1,
  },
  {
    category: ToolCategory.DOCUMENT_COMPRESS,
    name: 'Document Compress',
    description: 'Compress documents to reduce file size',
    keywords: ['compress', 'reduce', 'optimize', 'shrink', 'smaller'],
    phrases: [
      'compress pdf',
      'reduce pdf size',
      'optimize document',
      'make pdf smaller',
      'shrink document',
    ],
    inputFileTypes: ['application/pdf'],
    outputFileTypes: ['application/pdf'],
    relatedTools: ['document_convert'],
    commonPrefillFields: { quality: 'medium' },
    priority: 2,
  },

  // DATA TOOLS
  {
    category: ToolCategory.DATA_ANALYZE,
    name: 'Data Analysis',
    description: 'Analyze data and generate insights',
    keywords: ['analyze', 'analysis', 'insights', 'statistics', 'examine', 'explore'],
    phrases: [
      'analyze data',
      'data analysis',
      'generate insights',
      'analyze spreadsheet',
      'statistical analysis',
      'explore data',
    ],
    inputFileTypes: [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json',
    ],
    outputFileTypes: ['application/json', 'text/html'],
    relatedTools: ['data_chart', 'data_query'],
    commonPrefillFields: {},
    priority: 1,
  },
  {
    category: ToolCategory.DATA_CHART,
    name: 'Data Visualization',
    description: 'Create charts and graphs from data',
    keywords: ['chart', 'graph', 'visualize', 'plot', 'diagram', 'bar chart', 'pie chart', 'line chart'],
    phrases: [
      'create chart',
      'make graph',
      'visualize data',
      'plot data',
      'create bar chart',
      'pie chart from data',
      'line graph',
    ],
    inputFileTypes: [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json',
    ],
    outputFileTypes: ['image/png', 'image/svg+xml', 'application/json'],
    relatedTools: ['data_analyze'],
    commonPrefillFields: { chartType: 'bar' },
    priority: 1,
  },
  {
    category: ToolCategory.DATA_EXPORT,
    name: 'Data Export',
    description: 'Export data to different formats',
    keywords: ['export', 'download', 'save', 'output', 'extract'],
    phrases: [
      'export to csv',
      'export to excel',
      'download as csv',
      'export data',
      'save as json',
      'convert to csv',
    ],
    inputFileTypes: [
      'application/json',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    outputFileTypes: [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json',
    ],
    relatedTools: ['data_import'],
    commonPrefillFields: {},
    priority: 2,
  },

  // GENERATOR TOOLS
  {
    category: ToolCategory.GENERATOR_QR,
    name: 'QR Code Generator',
    description: 'Generate QR codes',
    keywords: ['qr', 'qr code', 'quick response', 'scan code', 'barcode'],
    phrases: [
      'generate qr code',
      'create qr code',
      'make qr code',
      'qr code for url',
      'qr code for text',
    ],
    inputFileTypes: [],
    outputFileTypes: ['image/png', 'image/svg+xml'],
    relatedTools: ['generator_barcode'],
    commonPrefillFields: { size: '256', errorCorrection: 'M' },
    priority: 1,
  },
  {
    category: ToolCategory.GENERATOR_BARCODE,
    name: 'Barcode Generator',
    description: 'Generate various barcode types',
    keywords: ['barcode', 'ean', 'upc', 'code128', 'code39', 'scan'],
    phrases: [
      'generate barcode',
      'create barcode',
      'make barcode',
      'ean barcode',
      'upc code',
      'product barcode',
    ],
    inputFileTypes: [],
    outputFileTypes: ['image/png', 'image/svg+xml'],
    relatedTools: ['generator_qr'],
    commonPrefillFields: { type: 'CODE128' },
    priority: 2,
  },
  {
    category: ToolCategory.GENERATOR_INVOICE,
    name: 'Invoice Generator',
    description: 'Generate professional invoices',
    keywords: ['invoice', 'bill', 'receipt', 'billing', 'payment'],
    phrases: [
      'create invoice',
      'generate invoice',
      'make invoice',
      'invoice template',
      'billing document',
    ],
    inputFileTypes: [],
    outputFileTypes: ['application/pdf'],
    relatedTools: ['generator_receipt', 'generator_quote'],
    commonPrefillFields: {},
    priority: 1,
  },
  {
    category: ToolCategory.GENERATOR_RESUME,
    name: 'Resume Generator',
    description: 'Generate professional resumes/CVs',
    keywords: ['resume', 'cv', 'curriculum vitae', 'job application', 'career'],
    phrases: [
      'create resume',
      'generate cv',
      'make resume',
      'resume template',
      'curriculum vitae',
    ],
    inputFileTypes: [],
    outputFileTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    relatedTools: ['generator_letter'],
    commonPrefillFields: {},
    priority: 2,
  },

  // CALCULATOR TOOLS
  {
    category: ToolCategory.CALCULATOR_BMI,
    name: 'BMI Calculator',
    description: 'Calculate Body Mass Index',
    keywords: ['bmi', 'body mass', 'weight', 'health', 'obesity', 'overweight'],
    phrases: [
      'calculate bmi',
      'body mass index',
      'check bmi',
      'bmi calculator',
      'am i overweight',
    ],
    inputFileTypes: [],
    outputFileTypes: ['application/json'],
    relatedTools: ['calculator_calories', 'calculator_macro'],
    commonPrefillFields: { measurementSystem: 'metric' },
    priority: 1,
  },
  {
    category: ToolCategory.CALCULATOR_LOAN,
    name: 'Loan Calculator',
    description: 'Calculate loan payments and interest',
    keywords: ['loan', 'payment', 'interest', 'mortgage', 'emi', 'amortization'],
    phrases: [
      'calculate loan',
      'loan payment',
      'loan calculator',
      'monthly payment',
      'interest calculation',
      'emi calculator',
    ],
    inputFileTypes: [],
    outputFileTypes: ['application/json'],
    relatedTools: ['calculator_mortgage', 'calculator_compound'],
    commonPrefillFields: {},
    priority: 1,
  },
  {
    category: ToolCategory.CALCULATOR_TIP,
    name: 'Tip Calculator',
    description: 'Calculate tips and split bills',
    keywords: ['tip', 'gratuity', 'split', 'bill', 'restaurant', 'service'],
    phrases: [
      'calculate tip',
      'tip calculator',
      'split bill',
      'how much tip',
      'tip for',
      'gratuity calculator',
    ],
    inputFileTypes: [],
    outputFileTypes: ['application/json'],
    relatedTools: ['calculator_percentage', 'calculator_discount'],
    commonPrefillFields: { tipPercentage: '15' },
    priority: 1,
  },

  // CONVERTER TOOLS
  {
    category: ToolCategory.CONVERTER_CURRENCY,
    name: 'Currency Converter',
    description: 'Convert between currencies',
    keywords: ['currency', 'exchange', 'money', 'forex', 'rate', 'usd', 'eur', 'gbp'],
    phrases: [
      'convert currency',
      'exchange rate',
      'usd to eur',
      'convert dollars',
      'currency converter',
      'how much in euros',
    ],
    inputFileTypes: [],
    outputFileTypes: ['application/json'],
    relatedTools: ['converter_unit'],
    commonPrefillFields: {},
    priority: 1,
  },
  {
    category: ToolCategory.CONVERTER_TIMEZONE,
    name: 'Timezone Converter',
    description: 'Convert between time zones',
    keywords: ['timezone', 'time zone', 'time', 'convert time', 'world clock', 'utc', 'gmt'],
    phrases: [
      'convert timezone',
      'time zone converter',
      'what time in',
      'convert to utc',
      'pst to est',
      'world time',
    ],
    inputFileTypes: [],
    outputFileTypes: ['application/json'],
    relatedTools: ['converter_epoch'],
    commonPrefillFields: {},
    priority: 1,
  },
  {
    category: ToolCategory.CONVERTER_COLOR,
    name: 'Color Converter',
    description: 'Convert between color formats',
    keywords: ['color', 'colour', 'hex', 'rgb', 'hsl', 'cmyk', 'palette'],
    phrases: [
      'convert color',
      'hex to rgb',
      'rgb to hex',
      'color converter',
      'color code',
      'cmyk to rgb',
    ],
    inputFileTypes: [],
    outputFileTypes: ['application/json'],
    relatedTools: [],
    commonPrefillFields: {},
    priority: 2,
  },
  {
    category: ToolCategory.CONVERTER_UNIT,
    name: 'Unit Converter',
    description: 'Convert between units of measurement',
    keywords: ['unit', 'convert', 'measurement', 'meters', 'feet', 'kg', 'pounds', 'miles', 'km'],
    phrases: [
      'convert units',
      'unit converter',
      'meters to feet',
      'kg to pounds',
      'miles to km',
      'convert length',
      'convert weight',
    ],
    inputFileTypes: [],
    outputFileTypes: ['application/json'],
    relatedTools: [
      'converter_length',
      'converter_weight',
      'converter_volume',
      'converter_temperature',
    ],
    commonPrefillFields: {},
    priority: 1,
  },

  // MEDIA TOOLS
  {
    category: ToolCategory.MEDIA_AUDIO_CONVERT,
    name: 'Audio Converter',
    description: 'Convert audio between formats',
    keywords: ['audio', 'convert', 'mp3', 'wav', 'flac', 'ogg', 'aac', 'sound'],
    phrases: [
      'convert audio',
      'mp3 to wav',
      'convert to mp3',
      'audio converter',
      'change audio format',
    ],
    inputFileTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac'],
    outputFileTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac'],
    relatedTools: ['media_audio_trim', 'media_audio_merge'],
    commonPrefillFields: { outputFormat: 'mp3' },
    priority: 1,
  },
  {
    category: ToolCategory.MEDIA_VIDEO_CONVERT,
    name: 'Video Converter',
    description: 'Convert video between formats',
    keywords: ['video', 'convert', 'mp4', 'avi', 'mov', 'mkv', 'webm'],
    phrases: [
      'convert video',
      'mp4 to avi',
      'convert to mp4',
      'video converter',
      'change video format',
    ],
    inputFileTypes: ['video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska', 'video/webm'],
    outputFileTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    relatedTools: ['media_video_compress', 'media_video_trim'],
    commonPrefillFields: { outputFormat: 'mp4' },
    priority: 1,
  },
  {
    category: ToolCategory.MEDIA_VIDEO_GIF,
    name: 'Video to GIF',
    description: 'Convert video to animated GIF',
    keywords: ['gif', 'animated', 'video to gif', 'animation', 'meme'],
    phrases: [
      'convert to gif',
      'video to gif',
      'make gif',
      'create gif from video',
      'animated gif',
    ],
    inputFileTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
    outputFileTypes: ['image/gif'],
    relatedTools: ['media_video_trim'],
    commonPrefillFields: { fps: '10', width: '480' },
    priority: 2,
  },
  {
    category: ToolCategory.MEDIA_TRANSCRIBE,
    name: 'Audio/Video Transcription',
    description: 'Transcribe audio or video to text',
    keywords: ['transcribe', 'transcription', 'speech to text', 'subtitles', 'captions'],
    phrases: [
      'transcribe audio',
      'transcribe video',
      'speech to text',
      'create subtitles',
      'generate captions',
    ],
    inputFileTypes: ['audio/mpeg', 'audio/wav', 'video/mp4', 'video/webm'],
    outputFileTypes: ['text/plain', 'application/json', 'text/vtt', 'application/x-subrip'],
    relatedTools: [],
    commonPrefillFields: { language: 'auto' },
    priority: 2,
  },

  // TEXT TOOLS
  {
    category: ToolCategory.TEXT_SUMMARIZE,
    name: 'Text Summarizer',
    description: 'Summarize long text into key points',
    keywords: ['summarize', 'summary', 'tldr', 'key points', 'brief', 'condense'],
    phrases: [
      'summarize text',
      'summarize this',
      'give me a summary',
      'tldr',
      'key points',
      'brief summary',
    ],
    inputFileTypes: ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    outputFileTypes: ['text/plain'],
    relatedTools: ['text_paraphrase'],
    commonPrefillFields: { length: 'medium' },
    priority: 1,
  },
  {
    category: ToolCategory.TEXT_TRANSLATE,
    name: 'Text Translator',
    description: 'Translate text between languages',
    keywords: ['translate', 'translation', 'language', 'spanish', 'french', 'german', 'chinese'],
    phrases: [
      'translate to',
      'translate this',
      'translation',
      'translate text',
      'in spanish',
      'to english',
    ],
    inputFileTypes: ['text/plain'],
    outputFileTypes: ['text/plain'],
    relatedTools: ['document_translate'],
    commonPrefillFields: {},
    priority: 1,
  },
  {
    category: ToolCategory.TEXT_GRAMMAR,
    name: 'Grammar Checker',
    description: 'Check and correct grammar',
    keywords: ['grammar', 'spelling', 'proofread', 'correct', 'fix', 'check'],
    phrases: [
      'check grammar',
      'fix grammar',
      'proofread',
      'correct spelling',
      'grammar checker',
    ],
    inputFileTypes: ['text/plain'],
    outputFileTypes: ['text/plain', 'application/json'],
    relatedTools: ['text_paraphrase'],
    commonPrefillFields: {},
    priority: 2,
  },

  // CODE TOOLS
  {
    category: ToolCategory.CODE_FORMAT,
    name: 'Code Formatter',
    description: 'Format and beautify code',
    keywords: ['format', 'beautify', 'prettier', 'indent', 'style'],
    phrases: [
      'format code',
      'beautify code',
      'prettify',
      'indent code',
      'format javascript',
      'format json',
    ],
    inputFileTypes: ['text/javascript', 'application/json', 'text/html', 'text/css'],
    outputFileTypes: ['text/plain'],
    relatedTools: ['code_minify'],
    commonPrefillFields: { tabSize: '2' },
    priority: 2,
  },
  {
    category: ToolCategory.CODE_MINIFY,
    name: 'Code Minifier',
    description: 'Minify code to reduce size',
    keywords: ['minify', 'compress', 'uglify', 'minimize', 'reduce'],
    phrases: [
      'minify code',
      'minify javascript',
      'compress css',
      'uglify',
      'minimize code',
    ],
    inputFileTypes: ['text/javascript', 'text/css', 'text/html'],
    outputFileTypes: ['text/plain'],
    relatedTools: ['code_format'],
    commonPrefillFields: {},
    priority: 2,
  },
  {
    category: ToolCategory.CODE_JSON,
    name: 'JSON Tools',
    description: 'Parse, validate, and format JSON',
    keywords: ['json', 'parse', 'validate', 'format', 'pretty print'],
    phrases: [
      'format json',
      'validate json',
      'parse json',
      'json formatter',
      'pretty print json',
    ],
    inputFileTypes: ['application/json'],
    outputFileTypes: ['application/json', 'text/plain'],
    relatedTools: ['code_format'],
    commonPrefillFields: {},
    priority: 2,
  },

  // WEB TOOLS
  {
    category: ToolCategory.WEB_SCREENSHOT,
    name: 'Web Screenshot',
    description: 'Capture screenshots of websites',
    keywords: ['screenshot', 'capture', 'snapshot', 'webpage', 'website'],
    phrases: [
      'take screenshot',
      'screenshot of',
      'capture website',
      'webpage screenshot',
      'snapshot of',
    ],
    inputFileTypes: [],
    outputFileTypes: ['image/png', 'image/jpeg'],
    relatedTools: ['web_scrape'],
    commonPrefillFields: { width: '1920', height: '1080', fullPage: 'false' },
    priority: 1,
  },
  {
    category: ToolCategory.WEB_SUMMARIZE,
    name: 'Web Summarizer',
    description: 'Summarize web page content',
    keywords: ['summarize', 'webpage', 'article', 'website', 'content'],
    phrases: [
      'summarize this page',
      'summarize website',
      'summarize article',
      'what does this page say',
    ],
    inputFileTypes: [],
    outputFileTypes: ['text/plain', 'application/json'],
    relatedTools: ['text_summarize', 'web_scrape'],
    commonPrefillFields: {},
    priority: 1,
  },

  // WRITING TOOLS
  {
    category: ToolCategory.WRITING_EMAIL,
    name: 'Email Writer',
    description: 'Generate professional emails',
    keywords: ['email', 'mail', 'write', 'compose', 'draft'],
    phrases: [
      'write email',
      'compose email',
      'draft email',
      'email template',
      'professional email',
    ],
    inputFileTypes: [],
    outputFileTypes: ['text/plain'],
    relatedTools: ['writing_blog', 'text_grammar'],
    commonPrefillFields: { tone: 'professional' },
    priority: 1,
  },
  {
    category: ToolCategory.WRITING_BLOG,
    name: 'Blog Writer',
    description: 'Generate blog posts and articles',
    keywords: ['blog', 'article', 'post', 'write', 'content'],
    phrases: [
      'write blog',
      'blog post',
      'write article',
      'content writing',
      'generate blog',
    ],
    inputFileTypes: [],
    outputFileTypes: ['text/plain', 'text/markdown'],
    relatedTools: ['writing_social', 'text_grammar'],
    commonPrefillFields: { wordCount: '500' },
    priority: 2,
  },
  {
    category: ToolCategory.WRITING_SOCIAL,
    name: 'Social Media Writer',
    description: 'Generate social media content',
    keywords: ['social', 'twitter', 'instagram', 'facebook', 'linkedin', 'post', 'caption'],
    phrases: [
      'write tweet',
      'instagram caption',
      'social media post',
      'linkedin post',
      'facebook post',
    ],
    inputFileTypes: [],
    outputFileTypes: ['text/plain'],
    relatedTools: ['writing_blog', 'writing_ad'],
    commonPrefillFields: { platform: 'twitter' },
    priority: 2,
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get file category from MIME type
 */
export function getFileCategoryFromMime(mimeType: string): FileCategory {
  const mapping = MIME_TYPE_MAP[mimeType.toLowerCase()];
  return mapping?.category || FileCategory.UNKNOWN;
}

/**
 * Get file format from MIME type
 */
export function getFileFormatFromMime(mimeType: string): string {
  const mapping = MIME_TYPE_MAP[mimeType.toLowerCase()];
  return mapping?.format || 'unknown';
}

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get supported operations for a file category
 */
export function getSupportedOperations(category: FileCategory): string[] {
  const operationMap: Record<FileCategory, string[]> = {
    [FileCategory.IMAGE]: [
      'resize',
      'crop',
      'rotate',
      'compress',
      'convert',
      'filter',
      'watermark',
      'remove_background',
      'upscale',
      'ocr',
    ],
    [FileCategory.DOCUMENT]: [
      'merge',
      'split',
      'compress',
      'convert',
      'extract_text',
      'ocr',
      'sign',
      'protect',
    ],
    [FileCategory.SPREADSHEET]: [
      'analyze',
      'chart',
      'query',
      'export',
      'merge',
      'clean',
      'transform',
    ],
    [FileCategory.AUDIO]: [
      'convert',
      'trim',
      'merge',
      'compress',
      'extract',
      'transcribe',
      'normalize',
    ],
    [FileCategory.VIDEO]: [
      'convert',
      'trim',
      'compress',
      'extract_audio',
      'gif',
      'thumbnail',
      'transcribe',
      'resize',
    ],
    [FileCategory.ARCHIVE]: ['extract', 'list', 'compress', 'convert'],
    [FileCategory.CODE]: ['format', 'minify', 'beautify', 'convert', 'analyze'],
    [FileCategory.DATA]: ['parse', 'validate', 'format', 'convert', 'query'],
    [FileCategory.PRESENTATION]: ['convert', 'compress', 'extract', 'merge'],
    [FileCategory.EBOOK]: ['convert', 'extract', 'metadata'],
    [FileCategory.FONT]: ['convert', 'subset', 'analyze'],
    [FileCategory.VECTOR]: ['convert', 'resize', 'optimize', 'rasterize'],
    [FileCategory.THREE_D]: ['convert', 'view', 'analyze'],
    [FileCategory.UNKNOWN]: [],
  };

  return operationMap[category] || [];
}

/**
 * Find matching tool category patterns for a query
 */
export function findMatchingPatterns(
  query: string,
  attachmentCategory?: FileCategory,
): ToolCategoryPatternDto[] {
  const normalizedQuery = query.toLowerCase();
  const matches: Array<{ pattern: ToolCategoryPatternDto; score: number }> = [];

  for (const pattern of TOOL_CATEGORY_PATTERNS) {
    let score = 0;

    // Check keywords
    for (const keyword of pattern.keywords) {
      if (normalizedQuery.includes(keyword.toLowerCase())) {
        score += 2;
      }
    }

    // Check phrases
    for (const phrase of pattern.phrases) {
      if (normalizedQuery.includes(phrase.toLowerCase())) {
        score += 5;
      }
    }

    // Check file type compatibility
    if (attachmentCategory) {
      const categoryMimeTypes = Object.entries(MIME_TYPE_MAP)
        .filter(([, info]) => info.category === attachmentCategory)
        .map(([mime]) => mime);

      for (const inputType of pattern.inputFileTypes) {
        if (categoryMimeTypes.includes(inputType)) {
          score += 3;
        }
      }
    }

    if (score > 0) {
      matches.push({ pattern, score });
    }
  }

  // Sort by score and return patterns
  return matches
    .sort((a, b) => b.score - a.score)
    .map((m) => m.pattern);
}
