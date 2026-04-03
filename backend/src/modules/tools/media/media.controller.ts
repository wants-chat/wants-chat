import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import * as multer from 'multer';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MediaService } from './media.service';
import { ToolLoggerService } from '../common/services/tool-logger.service';
import {
  FILE_SIZE_LIMITS,
  ALLOWED_VIDEO_MIMES,
  ALLOWED_AUDIO_MIMES,
} from '../common/utils/file-helper.util';
import {
  VideoToGifDto,
  VideoCompressDto,
  AudioConvertDto,
  VideoTrimDto,
  MediaProcessResponseDto,
  MediaInfoResponseDto,
} from './dto/media.dto';

const videoUploadOptions = {
  storage: multer.memoryStorage(),
  limits: { fileSize: FILE_SIZE_LIMITS.VIDEO },
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ALLOWED_VIDEO_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed.'));
    }
  },
};

const audioUploadOptions = {
  storage: multer.memoryStorage(),
  limits: { fileSize: FILE_SIZE_LIMITS.AUDIO },
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ALLOWED_AUDIO_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed.'));
    }
  },
};

@ApiTags('Tools - Media')
@Controller('tools/media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly toolLogger: ToolLoggerService,
  ) {}

  @Post('video/info')
  @ApiOperation({ summary: 'Get video information' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, type: MediaInfoResponseDto })
  @UseInterceptors(FileInterceptor('file', videoUploadOptions))
  async getVideoInfo(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ): Promise<{ data: MediaInfoResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.mediaService.getVideoInfo(file);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'media',
      toolName: 'video-info',
      inputSizeBytes: file.size,
      status: 'completed',
      metadata: result,
    });

    return { data: result };
  }

  @Post('video/to-gif')
  @ApiOperation({ summary: 'Convert video to GIF' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        startTime: { type: 'number' },
        duration: { type: 'number' },
        width: { type: 'number' },
        fps: { type: 'number' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, type: MediaProcessResponseDto })
  @UseInterceptors(FileInterceptor('file', videoUploadOptions))
  async videoToGif(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: VideoToGifDto,
    @Request() req: any,
  ): Promise<{ data: MediaProcessResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.mediaService.videoToGif(file, dto, userId);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'media',
      toolName: 'video-to-gif',
      inputSizeBytes: file.size,
      outputSizeBytes: result.sizeBytes,
      outputFileUrl: result.url,
      processingTimeMs: result.processingTimeMs,
      status: 'completed',
      metadata: dto,
    });

    return { data: result };
  }

  @Post('video/compress')
  @ApiOperation({ summary: 'Compress video' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        bitrate: { type: 'number' },
        crf: { type: 'number' },
        format: { type: 'string', enum: ['mp4', 'webm', 'avi', 'mov', 'mkv'] },
        maxWidth: { type: 'number' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, type: MediaProcessResponseDto })
  @UseInterceptors(FileInterceptor('file', videoUploadOptions))
  async compressVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: VideoCompressDto,
    @Request() req: any,
  ): Promise<{ data: MediaProcessResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.mediaService.compressVideo(file, dto, userId);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'media',
      toolName: 'video-compress',
      inputSizeBytes: file.size,
      outputSizeBytes: result.sizeBytes,
      outputFileUrl: result.url,
      processingTimeMs: result.processingTimeMs,
      status: 'completed',
      metadata: {
        compressionRatio: ((1 - result.sizeBytes / file.size) * 100).toFixed(1) + '%',
      },
    });

    return { data: result };
  }

  @Post('video/trim')
  @ApiOperation({ summary: 'Trim video' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        startTime: { type: 'number' },
        endTime: { type: 'number' },
      },
      required: ['file', 'startTime', 'endTime'],
    },
  })
  @ApiResponse({ status: 200, type: MediaProcessResponseDto })
  @UseInterceptors(FileInterceptor('file', videoUploadOptions))
  async trimVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: VideoTrimDto,
    @Request() req: any,
  ): Promise<{ data: MediaProcessResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.mediaService.trimVideo(file, dto, userId);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'media',
      toolName: 'video-trim',
      inputSizeBytes: file.size,
      outputSizeBytes: result.sizeBytes,
      outputFileUrl: result.url,
      processingTimeMs: result.processingTimeMs,
      status: 'completed',
      metadata: dto,
    });

    return { data: result };
  }

  @Post('video/extract-audio')
  @ApiOperation({ summary: 'Extract audio from video' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        format: { type: 'string', enum: ['mp3', 'aac', 'm4a'], default: 'mp3' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, type: MediaProcessResponseDto })
  @UseInterceptors(FileInterceptor('file', videoUploadOptions))
  async extractAudio(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { format?: string },
    @Request() req: any,
  ): Promise<{ data: MediaProcessResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.mediaService.extractAudio(
      file,
      body.format || 'mp3',
      userId,
    );

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'media',
      toolName: 'extract-audio',
      inputSizeBytes: file.size,
      outputSizeBytes: result.sizeBytes,
      outputFileUrl: result.url,
      processingTimeMs: result.processingTimeMs,
      status: 'completed',
      metadata: { format: body.format || 'mp3' },
    });

    return { data: result };
  }

  @Post('audio/convert')
  @ApiOperation({ summary: 'Convert audio format' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        format: { type: 'string', enum: ['mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a'] },
        bitrate: { type: 'number' },
        sampleRate: { type: 'number' },
      },
      required: ['file', 'format'],
    },
  })
  @ApiResponse({ status: 200, type: MediaProcessResponseDto })
  @UseInterceptors(FileInterceptor('file', audioUploadOptions))
  async convertAudio(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: AudioConvertDto,
    @Request() req: any,
  ): Promise<{ data: MediaProcessResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.mediaService.convertAudio(file, dto, userId);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'media',
      toolName: 'audio-convert',
      inputSizeBytes: file.size,
      outputSizeBytes: result.sizeBytes,
      outputFileUrl: result.url,
      processingTimeMs: result.processingTimeMs,
      status: 'completed',
      metadata: { format: dto.format, bitrate: dto.bitrate },
    });

    return { data: result };
  }

  @Post('audio/info')
  @ApiOperation({ summary: 'Get audio information' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, type: MediaInfoResponseDto })
  @UseInterceptors(FileInterceptor('file', audioUploadOptions))
  async getAudioInfo(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ): Promise<{ data: MediaInfoResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.mediaService.getAudioInfo(file);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'media',
      toolName: 'audio-info',
      inputSizeBytes: file.size,
      status: 'completed',
      metadata: result,
    });

    return { data: result };
  }
}
