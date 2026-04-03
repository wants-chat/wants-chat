import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { R2Service } from '../../storage/r2.service';
import { FfmpegProcessorService } from './processors/ffmpeg-processor.service';
import {
  validateVideoFile,
  validateAudioFile,
  generateToolOutputPath,
  getMimeFromExtension,
} from '../common/utils/file-helper.util';
import {
  VideoToGifDto,
  VideoCompressDto,
  AudioConvertDto,
  VideoTrimDto,
  MediaProcessResponseDto,
  MediaInfoResponseDto,
} from './dto/media.dto';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly r2Service: R2Service,
    private readonly ffmpegProcessor: FfmpegProcessorService,
  ) {}

  async getVideoInfo(file: Express.Multer.File): Promise<MediaInfoResponseDto> {
    validateVideoFile(file);
    const info = await this.ffmpegProcessor.getVideoInfo(file.buffer);
    return {
      ...info,
      sizeBytes: file.size,
    };
  }

  async getAudioInfo(file: Express.Multer.File): Promise<MediaInfoResponseDto> {
    validateAudioFile(file);
    const info = await this.ffmpegProcessor.getVideoInfo(file.buffer);
    return {
      duration: info.duration,
      format: info.format,
      audioCodec: info.audioCodec,
      bitrate: info.bitrate,
      sizeBytes: file.size,
    };
  }

  async videoToGif(
    file: Express.Multer.File,
    dto: VideoToGifDto,
    userId: string,
  ): Promise<MediaProcessResponseDto> {
    const startTime = Date.now();
    validateVideoFile(file);

    const gifBuffer = await this.ffmpegProcessor.videoToGif(file.buffer, {
      startTime: dto.startTime || 0,
      duration: dto.duration || 5,
      width: dto.width,
      fps: dto.fps || 10,
    });

    const path = generateToolOutputPath(userId, 'media', 'video-to-gif', 'gif');
    const url = await this.uploadToStorage(gifBuffer, path, 'image/gif');

    return {
      url,
      fileName: path.split('/').pop() || 'output.gif',
      mimeType: 'image/gif',
      sizeBytes: gifBuffer.length,
      processingTimeMs: Date.now() - startTime,
    };
  }

  async compressVideo(
    file: Express.Multer.File,
    dto: VideoCompressDto,
    userId: string,
  ): Promise<MediaProcessResponseDto> {
    const startTime = Date.now();
    validateVideoFile(file);

    const format = dto.format || 'mp4';
    const compressedBuffer = await this.ffmpegProcessor.compressVideo(file.buffer, {
      bitrate: dto.bitrate,
      crf: dto.crf || 28,
      format,
      maxWidth: dto.maxWidth,
    });

    const info = await this.ffmpegProcessor.getVideoInfo(compressedBuffer);
    const path = generateToolOutputPath(userId, 'media', 'compressed', format);
    const mimeType = getMimeFromExtension(format);
    const url = await this.uploadToStorage(compressedBuffer, path, mimeType);

    return {
      url,
      fileName: path.split('/').pop() || `compressed.${format}`,
      mimeType,
      sizeBytes: compressedBuffer.length,
      duration: info.duration,
      width: info.width,
      height: info.height,
      processingTimeMs: Date.now() - startTime,
    };
  }

  async convertAudio(
    file: Express.Multer.File,
    dto: AudioConvertDto,
    userId: string,
  ): Promise<MediaProcessResponseDto> {
    const startTime = Date.now();
    validateAudioFile(file);

    const convertedBuffer = await this.ffmpegProcessor.convertAudio(file.buffer, {
      format: dto.format,
      bitrate: dto.bitrate || 192,
      sampleRate: dto.sampleRate,
    });

    const info = await this.ffmpegProcessor.getVideoInfo(convertedBuffer);
    const path = generateToolOutputPath(userId, 'media', 'converted', dto.format);
    const mimeType = getMimeFromExtension(dto.format);
    const url = await this.uploadToStorage(convertedBuffer, path, mimeType);

    return {
      url,
      fileName: path.split('/').pop() || `converted.${dto.format}`,
      mimeType,
      sizeBytes: convertedBuffer.length,
      duration: info.duration,
      processingTimeMs: Date.now() - startTime,
    };
  }

  async trimVideo(
    file: Express.Multer.File,
    dto: VideoTrimDto,
    userId: string,
  ): Promise<MediaProcessResponseDto> {
    const startTime = Date.now();
    validateVideoFile(file);

    if (dto.endTime <= dto.startTime) {
      throw new BadRequestException('End time must be greater than start time');
    }

    const trimmedBuffer = await this.ffmpegProcessor.trimVideo(
      file.buffer,
      dto.startTime,
      dto.endTime,
    );

    const info = await this.ffmpegProcessor.getVideoInfo(trimmedBuffer);
    const path = generateToolOutputPath(userId, 'media', 'trimmed', 'mp4');
    const url = await this.uploadToStorage(trimmedBuffer, path, 'video/mp4');

    return {
      url,
      fileName: path.split('/').pop() || 'trimmed.mp4',
      mimeType: 'video/mp4',
      sizeBytes: trimmedBuffer.length,
      duration: info.duration,
      width: info.width,
      height: info.height,
      processingTimeMs: Date.now() - startTime,
    };
  }

  async extractAudio(
    file: Express.Multer.File,
    format: string,
    userId: string,
  ): Promise<MediaProcessResponseDto> {
    const startTime = Date.now();
    validateVideoFile(file);

    const audioBuffer = await this.ffmpegProcessor.extractAudio(file.buffer, format);
    const info = await this.ffmpegProcessor.getVideoInfo(audioBuffer);
    const path = generateToolOutputPath(userId, 'media', 'extracted', format);
    const mimeType = getMimeFromExtension(format);
    const url = await this.uploadToStorage(audioBuffer, path, mimeType);

    return {
      url,
      fileName: path.split('/').pop() || `extracted.${format}`,
      mimeType,
      sizeBytes: audioBuffer.length,
      duration: info.duration,
      processingTimeMs: Date.now() - startTime,
    };
  }

  private async uploadToStorage(
    buffer: Buffer,
    path: string,
    contentType: string,
  ): Promise<string> {
    try {
      const url = await this.r2Service.uploadBuffer(buffer, path, contentType, {
        isPublic: true,
        metadata: { tool: 'media' },
      });
      return url;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new BadRequestException('Failed to upload processed file');
    }
  }
}
