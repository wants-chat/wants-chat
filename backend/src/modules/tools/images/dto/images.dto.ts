import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsEnum, IsString } from 'class-validator';

export enum ImageFormat {
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp',
  AVIF = 'avif',
  GIF = 'gif',
  TIFF = 'tiff',
}

export enum ImageFit {
  COVER = 'cover',
  CONTAIN = 'contain',
  FILL = 'fill',
  INSIDE = 'inside',
  OUTSIDE = 'outside',
}

export class ImageCompressDto {
  @ApiPropertyOptional({ description: 'Quality (1-100)', example: 80, default: 80 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  quality?: number;

  @ApiPropertyOptional({ description: 'Max width (maintains aspect ratio)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  maxWidth?: number;

  @ApiPropertyOptional({ description: 'Max height (maintains aspect ratio)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  maxHeight?: number;
}

export class ImageResizeDto {
  @ApiPropertyOptional({ description: 'Target width in pixels' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  width?: number;

  @ApiPropertyOptional({ description: 'Target height in pixels' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  height?: number;

  @ApiPropertyOptional({ description: 'Fit mode', enum: ImageFit, default: ImageFit.COVER })
  @IsOptional()
  @IsEnum(ImageFit)
  fit?: ImageFit;

  @ApiPropertyOptional({ description: 'Background color for padding (hex)', example: '#FFFFFF' })
  @IsOptional()
  @IsString()
  background?: string;
}

export class ImageCropDto {
  @ApiProperty({ description: 'Left offset in pixels' })
  @IsInt()
  @Min(0)
  left: number;

  @ApiProperty({ description: 'Top offset in pixels' })
  @IsInt()
  @Min(0)
  top: number;

  @ApiProperty({ description: 'Crop width in pixels' })
  @IsInt()
  @Min(1)
  width: number;

  @ApiProperty({ description: 'Crop height in pixels' })
  @IsInt()
  @Min(1)
  height: number;
}

export class ImageConvertDto {
  @ApiProperty({ description: 'Target format', enum: ImageFormat })
  @IsEnum(ImageFormat)
  format: ImageFormat;

  @ApiPropertyOptional({ description: 'Quality (1-100) for lossy formats', default: 85 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  quality?: number;
}

export class ImageToBase64Dto {
  @ApiPropertyOptional({ description: 'Include data URI prefix', default: true })
  @IsOptional()
  includePrefix?: boolean;
}

export class RemoveBackgroundDto {
  @ApiPropertyOptional({ description: 'Output format', enum: ['png', 'webp'], default: 'png' })
  @IsOptional()
  @IsString()
  outputFormat?: 'png' | 'webp';
}

// URL-based processing DTOs (for prefilled images from chat)
export class ImageResizeFromUrlDto {
  @ApiProperty({ description: 'Image URL to download and process' })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({ description: 'Target width in pixels' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  width?: number;

  @ApiPropertyOptional({ description: 'Target height in pixels' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  height?: number;

  @ApiPropertyOptional({ description: 'Fit mode', enum: ImageFit, default: ImageFit.COVER })
  @IsOptional()
  @IsEnum(ImageFit)
  fit?: ImageFit;

  @ApiPropertyOptional({ description: 'Background color for padding (hex)', example: '#FFFFFF' })
  @IsOptional()
  @IsString()
  background?: string;
}

export class RemoveBackgroundFromUrlDto {
  @ApiProperty({ description: 'Image URL to download and process' })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({ description: 'Output format', enum: ['png', 'webp'], default: 'png' })
  @IsOptional()
  @IsString()
  outputFormat?: 'png' | 'webp';
}

export class ImageConvertFromUrlDto {
  @ApiProperty({ description: 'Image URL to download and process' })
  @IsString()
  imageUrl: string;

  @ApiProperty({ description: 'Target format', enum: ImageFormat })
  @IsEnum(ImageFormat)
  format: ImageFormat;

  @ApiPropertyOptional({ description: 'Quality (1-100) for lossy formats', default: 85 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  quality?: number;
}

// Response DTOs
export class ImageProcessResponseDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  width: number;

  @ApiProperty()
  height: number;

  @ApiProperty()
  sizeBytes: number;

  @ApiProperty()
  processingTimeMs: number;
}

export class ImageInfoResponseDto {
  @ApiProperty()
  width: number;

  @ApiProperty()
  height: number;

  @ApiProperty()
  format: string;

  @ApiProperty()
  channels: number;

  @ApiProperty()
  hasAlpha: boolean;

  @ApiProperty()
  sizeBytes: number;
}

export class ImageToBase64ResponseDto {
  @ApiProperty()
  base64: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  sizeBytes: number;
}
