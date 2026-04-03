import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

// Set ffmpeg and ffprobe paths
try {
  const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
  const ffprobePath = require('@ffprobe-installer/ffprobe').path;
  ffmpeg.setFfmpegPath(ffmpegPath);
  ffmpeg.setFfprobePath(ffprobePath);
} catch (e) {
  // Fall back to system ffmpeg
  console.log('Using system ffmpeg');
}

export interface VideoInfo {
  duration: number;
  width?: number;
  height?: number;
  format: string;
  videoCodec?: string;
  audioCodec?: string;
  bitrate?: number;
  fps?: number;
}

@Injectable()
export class FfmpegProcessorService {
  private readonly logger = new Logger(FfmpegProcessorService.name);
  private readonly tempDir = os.tmpdir();

  async getVideoInfo(buffer: Buffer): Promise<VideoInfo> {
    const inputPath = await this.writeTemp(buffer, 'input');

    try {
      return await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
          if (err) {
            reject(new BadRequestException('Failed to read video metadata'));
            return;
          }

          const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
          const audioStream = metadata.streams.find((s) => s.codec_type === 'audio');

          resolve({
            duration: metadata.format.duration || 0,
            width: videoStream?.width,
            height: videoStream?.height,
            format: metadata.format.format_name || 'unknown',
            videoCodec: videoStream?.codec_name,
            audioCodec: audioStream?.codec_name,
            bitrate: metadata.format.bit_rate
              ? Math.round(parseInt(String(metadata.format.bit_rate)) / 1000)
              : undefined,
            fps: videoStream?.r_frame_rate
              ? this.parseFrameRate(videoStream.r_frame_rate)
              : undefined,
          });
        });
      });
    } finally {
      this.cleanup(inputPath);
    }
  }

  async videoToGif(
    buffer: Buffer,
    options: {
      startTime?: number;
      duration?: number;
      width?: number;
      fps?: number;
    },
  ): Promise<Buffer> {
    const inputPath = await this.writeTemp(buffer, 'input');
    const outputPath = this.getTempPath('gif');

    try {
      await new Promise<void>((resolve, reject) => {
        let command = ffmpeg(inputPath);

        if (options.startTime !== undefined) {
          command = command.setStartTime(options.startTime);
        }
        if (options.duration !== undefined) {
          command = command.setDuration(options.duration);
        }

        const filters: string[] = [];
        if (options.fps) {
          filters.push(`fps=${options.fps}`);
        }
        if (options.width) {
          filters.push(`scale=${options.width}:-1:flags=lanczos`);
        }
        if (filters.length > 0) {
          command = command.videoFilters(filters);
        }

        command
          .output(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });

      return fs.readFileSync(outputPath);
    } finally {
      this.cleanup(inputPath, outputPath);
    }
  }

  async compressVideo(
    buffer: Buffer,
    options: {
      bitrate?: number;
      crf?: number;
      format?: string;
      maxWidth?: number;
    },
  ): Promise<Buffer> {
    const inputPath = await this.writeTemp(buffer, 'input');
    const format = options.format || 'mp4';
    const outputPath = this.getTempPath(format);

    try {
      await new Promise<void>((resolve, reject) => {
        let command = ffmpeg(inputPath);

        // Video codec
        command = command.videoCodec('libx264');

        // Apply CRF or bitrate
        if (options.crf !== undefined) {
          command = command.outputOptions([`-crf ${options.crf}`]);
        } else if (options.bitrate) {
          command = command.videoBitrate(`${options.bitrate}k`);
        } else {
          command = command.outputOptions(['-crf 28']);
        }

        // Scale if maxWidth specified
        if (options.maxWidth) {
          command = command.videoFilters([
            `scale='min(${options.maxWidth},iw)':'-2'`,
          ]);
        }

        // Audio codec
        command = command.audioCodec('aac').audioBitrate('128k');

        // Fast start for web playback
        command = command.outputOptions(['-movflags', '+faststart']);

        command
          .output(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });

      return fs.readFileSync(outputPath);
    } finally {
      this.cleanup(inputPath, outputPath);
    }
  }

  async convertAudio(
    buffer: Buffer,
    options: {
      format: string;
      bitrate?: number;
      sampleRate?: number;
    },
  ): Promise<Buffer> {
    const inputPath = await this.writeTemp(buffer, 'input');
    const outputPath = this.getTempPath(options.format);

    try {
      await new Promise<void>((resolve, reject) => {
        let command = ffmpeg(inputPath);

        // Set audio bitrate
        if (options.bitrate) {
          command = command.audioBitrate(`${options.bitrate}k`);
        }

        // Set sample rate
        if (options.sampleRate) {
          command = command.audioFrequency(options.sampleRate);
        }

        // Set codec based on format
        const codecMap: Record<string, string> = {
          mp3: 'libmp3lame',
          aac: 'aac',
          ogg: 'libvorbis',
          flac: 'flac',
          wav: 'pcm_s16le',
          m4a: 'aac',
        };

        if (codecMap[options.format]) {
          command = command.audioCodec(codecMap[options.format]);
        }

        command
          .output(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });

      return fs.readFileSync(outputPath);
    } finally {
      this.cleanup(inputPath, outputPath);
    }
  }

  async trimVideo(
    buffer: Buffer,
    startTime: number,
    endTime: number,
  ): Promise<Buffer> {
    const inputPath = await this.writeTemp(buffer, 'input');
    const outputPath = this.getTempPath('mp4');

    try {
      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .setStartTime(startTime)
          .setDuration(endTime - startTime)
          .videoCodec('copy')
          .audioCodec('copy')
          .output(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });

      return fs.readFileSync(outputPath);
    } finally {
      this.cleanup(inputPath, outputPath);
    }
  }

  async extractAudio(buffer: Buffer, format: string = 'mp3'): Promise<Buffer> {
    const inputPath = await this.writeTemp(buffer, 'input');
    const outputPath = this.getTempPath(format);

    try {
      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .noVideo()
          .audioCodec(format === 'mp3' ? 'libmp3lame' : 'aac')
          .audioBitrate('192k')
          .output(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });

      return fs.readFileSync(outputPath);
    } finally {
      this.cleanup(inputPath, outputPath);
    }
  }

  private async writeTemp(buffer: Buffer, prefix: string): Promise<string> {
    const filePath = path.join(this.tempDir, `${prefix}-${uuidv4()}`);
    await fs.promises.writeFile(filePath, buffer);
    return filePath;
  }

  private getTempPath(extension: string): string {
    return path.join(this.tempDir, `output-${uuidv4()}.${extension}`);
  }

  private cleanup(...paths: string[]): void {
    for (const filePath of paths) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {
        this.logger.warn(`Failed to cleanup temp file: ${filePath}`);
      }
    }
  }

  private parseFrameRate(frameRate: string): number {
    if (frameRate.includes('/')) {
      const [num, den] = frameRate.split('/').map(Number);
      return Math.round(num / den);
    }
    return parseFloat(frameRate);
  }
}
