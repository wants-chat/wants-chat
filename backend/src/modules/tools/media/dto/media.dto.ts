import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';

export enum VideoFormat {
  MP4 = 'mp4',
  WEBM = 'webm',
  AVI = 'avi',
  MOV = 'mov',
  MKV = 'mkv',
}

export enum AudioFormat {
  MP3 = 'mp3',
  WAV = 'wav',
  AAC = 'aac',
  OGG = 'ogg',
  FLAC = 'flac',
  M4A = 'm4a',
}

export class VideoToGifDto {
  @ApiPropertyOptional({ description: 'Start time in seconds', example: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  startTime?: number;

  @ApiPropertyOptional({ description: 'Duration in seconds', example: 5, default: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  duration?: number;

  @ApiPropertyOptional({ description: 'Output width in pixels', example: 480 })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(1280)
  width?: number;

  @ApiPropertyOptional({ description: 'Frames per second', example: 10, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(30)
  fps?: number;
}

export class VideoCompressDto {
  @ApiPropertyOptional({ description: 'Target bitrate in kbps', example: 1000 })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(10000)
  bitrate?: number;

  @ApiPropertyOptional({ description: 'CRF value (18-51, lower is better quality)', example: 28, default: 28 })
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(51)
  crf?: number;

  @ApiPropertyOptional({ description: 'Output format', enum: VideoFormat, default: 'mp4' })
  @IsOptional()
  @IsEnum(VideoFormat)
  format?: VideoFormat;

  @ApiPropertyOptional({ description: 'Max width (maintains aspect ratio)' })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(3840)
  maxWidth?: number;
}

export class AudioConvertDto {
  @ApiProperty({ description: 'Target format', enum: AudioFormat })
  @IsEnum(AudioFormat)
  format: AudioFormat;

  @ApiPropertyOptional({ description: 'Bitrate in kbps', example: 192, default: 192 })
  @IsOptional()
  @IsInt()
  @Min(64)
  @Max(320)
  bitrate?: number;

  @ApiPropertyOptional({ description: 'Sample rate in Hz', example: 44100 })
  @IsOptional()
  @IsInt()
  sampleRate?: number;
}

export class VideoTrimDto {
  @ApiProperty({ description: 'Start time in seconds', example: 0 })
  @IsInt()
  @Min(0)
  startTime: number;

  @ApiProperty({ description: 'End time in seconds', example: 10 })
  @IsInt()
  @Min(1)
  endTime: number;
}

// Response DTOs
export class MediaProcessResponseDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  sizeBytes: number;

  @ApiPropertyOptional()
  duration?: number;

  @ApiPropertyOptional()
  width?: number;

  @ApiPropertyOptional()
  height?: number;

  @ApiProperty()
  processingTimeMs: number;
}

export class MediaInfoResponseDto {
  @ApiProperty()
  duration: number;

  @ApiPropertyOptional()
  width?: number;

  @ApiPropertyOptional()
  height?: number;

  @ApiProperty()
  format: string;

  @ApiPropertyOptional()
  videoCodec?: string;

  @ApiPropertyOptional()
  audioCodec?: string;

  @ApiPropertyOptional()
  bitrate?: number;

  @ApiPropertyOptional()
  fps?: number;

  @ApiProperty()
  sizeBytes: number;
}
