import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsEnum,
} from 'class-validator';

export enum ImageFormat {
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp',
  AVIF = 'avif',
  GIF = 'gif',
  TIFF = 'tiff',
}

export enum VideoFormat {
  MP4 = 'mp4',
  WEBM = 'webm',
  AVI = 'avi',
  MOV = 'mov',
  MKV = 'mkv',
  GIF = 'gif',
}

export enum AudioFormat {
  MP3 = 'mp3',
  WAV = 'wav',
  AAC = 'aac',
  OGG = 'ogg',
  FLAC = 'flac',
  M4A = 'm4a',
}

export class ImageCompressDto {
  @ApiPropertyOptional({
    description: 'Quality level (1-100)',
    example: 80,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  quality?: number;

  @ApiPropertyOptional({
    description: 'Max width in pixels',
    example: 1920,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  maxWidth?: number;

  @ApiPropertyOptional({
    description: 'Max height in pixels',
    example: 1080,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  maxHeight?: number;
}

export class ImageResizeDto {
  @ApiPropertyOptional({
    description: 'Target width in pixels',
    example: 800,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  width?: number;

  @ApiPropertyOptional({
    description: 'Target height in pixels',
    example: 600,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  height?: number;

  @ApiPropertyOptional({
    description: 'Fit mode',
    example: 'cover',
    enum: ['cover', 'contain', 'fill', 'inside', 'outside'],
  })
  @IsOptional()
  @IsString()
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export class ImageCropDto {
  @ApiProperty({
    description: 'X coordinate of crop start',
    example: 0,
  })
  @IsInt()
  @Min(0)
  x: number;

  @ApiProperty({
    description: 'Y coordinate of crop start',
    example: 0,
  })
  @IsInt()
  @Min(0)
  y: number;

  @ApiProperty({
    description: 'Crop width in pixels',
    example: 500,
  })
  @IsInt()
  @Min(1)
  width: number;

  @ApiProperty({
    description: 'Crop height in pixels',
    example: 500,
  })
  @IsInt()
  @Min(1)
  height: number;
}

export class ImageConvertDto {
  @ApiProperty({
    description: 'Target format',
    example: 'webp',
    enum: ImageFormat,
  })
  @IsEnum(ImageFormat)
  format: ImageFormat;

  @ApiPropertyOptional({
    description: 'Quality level (1-100)',
    example: 85,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  quality?: number;
}

export class VideoCompressDto {
  @ApiPropertyOptional({
    description: 'Target bitrate in kbps',
    example: 1000,
  })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(50000)
  bitrate?: number;

  @ApiPropertyOptional({
    description: 'CRF value (18-51, lower is better quality)',
    example: 28,
  })
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(51)
  crf?: number;
}

export class VideoToGifDto {
  @ApiPropertyOptional({
    description: 'Start time in seconds',
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  startTime?: number;

  @ApiPropertyOptional({
    description: 'Duration in seconds',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  duration?: number;

  @ApiPropertyOptional({
    description: 'Output width in pixels',
    example: 480,
  })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(1920)
  width?: number;

  @ApiPropertyOptional({
    description: 'Frames per second',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(30)
  fps?: number;
}

export class AudioConvertDto {
  @ApiProperty({
    description: 'Target format',
    example: 'mp3',
    enum: AudioFormat,
  })
  @IsEnum(AudioFormat)
  format: AudioFormat;

  @ApiPropertyOptional({
    description: 'Bitrate in kbps',
    example: 192,
  })
  @IsOptional()
  @IsInt()
  @Min(64)
  @Max(320)
  bitrate?: number;
}
