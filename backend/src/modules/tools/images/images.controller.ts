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
import { ImagesService } from './images.service';
import { ToolLoggerService } from '../common/services/tool-logger.service';
import { FILE_SIZE_LIMITS, ALLOWED_IMAGE_MIMES } from '../common/utils/file-helper.util';
import {
  ImageCompressDto,
  ImageResizeDto,
  ImageCropDto,
  ImageConvertDto,
  ImageToBase64Dto,
  RemoveBackgroundDto,
  ImageProcessResponseDto,
  ImageInfoResponseDto,
  ImageToBase64ResponseDto,
  ImageResizeFromUrlDto,
  RemoveBackgroundFromUrlDto,
  ImageConvertFromUrlDto,
} from './dto/images.dto';

const imageUploadOptions = {
  storage: multer.memoryStorage(),
  limits: { fileSize: FILE_SIZE_LIMITS.IMAGE },
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  },
};

@ApiTags('Tools - Images')
@Controller('tools/images')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService,
    private readonly toolLogger: ToolLoggerService,
  ) {}

  @Post('info')
  @ApiOperation({ summary: 'Get image metadata (dimensions, format, etc.)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 200, type: ImageInfoResponseDto })
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async getImageInfo(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ): Promise<{ data: ImageInfoResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.imagesService.getImageInfo(file);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'images',
      toolName: 'info',
      inputSizeBytes: file.size,
      status: 'completed',
      metadata: result,
    });

    return { data: result };
  }

  @Post('compress')
  @ApiOperation({ summary: 'Compress image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        quality: { type: 'number', example: 80 },
        maxWidth: { type: 'number' },
        maxHeight: { type: 'number' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, type: ImageProcessResponseDto })
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async compress(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImageCompressDto,
    @Request() req: any,
  ): Promise<{ data: ImageProcessResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.imagesService.compress(file, dto, userId);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'images',
      toolName: 'compress',
      inputSizeBytes: file.size,
      outputSizeBytes: result.sizeBytes,
      outputFileUrl: result.url,
      processingTimeMs: result.processingTimeMs,
      status: 'completed',
      metadata: { quality: dto.quality },
    });

    return { data: result };
  }

  @Post('resize')
  @ApiOperation({ summary: 'Resize image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        width: { type: 'number' },
        height: { type: 'number' },
        fit: { type: 'string', enum: ['cover', 'contain', 'fill', 'inside', 'outside'] },
        background: { type: 'string', example: '#FFFFFF' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, type: ImageProcessResponseDto })
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async resize(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImageResizeDto,
    @Request() req: any,
  ): Promise<{ data: ImageProcessResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.imagesService.resize(file, dto, userId);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'images',
      toolName: 'resize',
      inputSizeBytes: file.size,
      outputSizeBytes: result.sizeBytes,
      outputFileUrl: result.url,
      processingTimeMs: result.processingTimeMs,
      status: 'completed',
      metadata: { width: dto.width, height: dto.height },
    });

    return { data: result };
  }

  @Post('crop')
  @ApiOperation({ summary: 'Crop image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        left: { type: 'number' },
        top: { type: 'number' },
        width: { type: 'number' },
        height: { type: 'number' },
      },
      required: ['file', 'left', 'top', 'width', 'height'],
    },
  })
  @ApiResponse({ status: 200, type: ImageProcessResponseDto })
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async crop(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImageCropDto,
    @Request() req: any,
  ): Promise<{ data: ImageProcessResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.imagesService.crop(file, dto, userId);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'images',
      toolName: 'crop',
      inputSizeBytes: file.size,
      outputSizeBytes: result.sizeBytes,
      outputFileUrl: result.url,
      processingTimeMs: result.processingTimeMs,
      status: 'completed',
      metadata: dto,
    });

    return { data: result };
  }

  @Post('convert')
  @ApiOperation({ summary: 'Convert image format' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        format: { type: 'string', enum: ['jpeg', 'png', 'webp', 'avif', 'gif', 'tiff'] },
        quality: { type: 'number' },
      },
      required: ['file', 'format'],
    },
  })
  @ApiResponse({ status: 200, type: ImageProcessResponseDto })
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async convert(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImageConvertDto,
    @Request() req: any,
  ): Promise<{ data: ImageProcessResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.imagesService.convert(file, dto, userId);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'images',
      toolName: 'convert',
      inputSizeBytes: file.size,
      outputSizeBytes: result.sizeBytes,
      outputFileUrl: result.url,
      processingTimeMs: result.processingTimeMs,
      status: 'completed',
      metadata: { format: dto.format },
    });

    return { data: result };
  }

  @Post('to-base64')
  @ApiOperation({ summary: 'Convert image to Base64 string' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        includePrefix: { type: 'boolean', default: true },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, type: ImageToBase64ResponseDto })
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async toBase64(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImageToBase64Dto,
    @Request() req: any,
  ): Promise<{ data: ImageToBase64ResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.imagesService.toBase64(file, dto);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'images',
      toolName: 'to-base64',
      inputSizeBytes: file.size,
      outputSizeBytes: Buffer.byteLength(result.base64, 'utf8'),
      status: 'completed',
    });

    return { data: result };
  }

  @Post('remove-background')
  @ApiOperation({ summary: 'Remove image background using AI' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        outputFormat: { type: 'string', enum: ['png', 'webp'], default: 'png' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, type: ImageProcessResponseDto })
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async removeBackground(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: RemoveBackgroundDto,
    @Request() req: any,
  ): Promise<{ data: ImageProcessResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.imagesService.removeBackground(file, dto, userId);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'images',
      toolName: 'remove-background',
      inputSizeBytes: file.size,
      outputSizeBytes: result.sizeBytes,
      outputFileUrl: result.url,
      processingTimeMs: result.processingTimeMs,
      status: 'completed',
      metadata: { outputFormat: dto.outputFormat },
    });

    return { data: result };
  }

  // URL-based endpoints (for prefilled images from chat)
  @Post('resize-from-url')
  @ApiOperation({ summary: 'Resize image from URL (for prefilled images)' })
  @ApiBody({ type: ImageResizeFromUrlDto })
  @ApiResponse({ status: 200, type: ImageProcessResponseDto })
  async resizeFromUrl(
    @Body() dto: ImageResizeFromUrlDto,
    @Request() req: any,
  ): Promise<{ success: boolean; data: ImageProcessResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.imagesService.resizeFromUrl(dto, userId);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'images',
      toolName: 'resize-from-url',
      outputSizeBytes: result.sizeBytes,
      outputFileUrl: result.url,
      processingTimeMs: result.processingTimeMs,
      status: 'completed',
      metadata: { width: dto.width, height: dto.height, sourceUrl: dto.imageUrl },
    });

    return { success: true, data: result };
  }

  @Post('remove-background-from-url')
  @ApiOperation({ summary: 'Remove background from image URL (for prefilled images)' })
  @ApiBody({ type: RemoveBackgroundFromUrlDto })
  @ApiResponse({ status: 200, type: ImageProcessResponseDto })
  async removeBackgroundFromUrl(
    @Body() dto: RemoveBackgroundFromUrlDto,
    @Request() req: any,
  ): Promise<{ success: boolean; data: ImageProcessResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.imagesService.removeBackgroundFromUrl(dto, userId);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'images',
      toolName: 'remove-background-from-url',
      outputSizeBytes: result.sizeBytes,
      outputFileUrl: result.url,
      processingTimeMs: result.processingTimeMs,
      status: 'completed',
      metadata: { outputFormat: dto.outputFormat, sourceUrl: dto.imageUrl },
    });

    return { success: true, data: result };
  }

  @Post('convert-from-url')
  @ApiOperation({ summary: 'Convert image format from URL (for prefilled images)' })
  @ApiBody({ type: ImageConvertFromUrlDto })
  @ApiResponse({ status: 200, type: ImageProcessResponseDto })
  async convertFromUrl(
    @Body() dto: ImageConvertFromUrlDto,
    @Request() req: any,
  ): Promise<{ success: boolean; data: ImageProcessResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.imagesService.convertFromUrl(dto, userId);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'images',
      toolName: 'convert-from-url',
      outputSizeBytes: result.sizeBytes,
      outputFileUrl: result.url,
      processingTimeMs: result.processingTimeMs,
      status: 'completed',
      metadata: { format: dto.format, sourceUrl: dto.imageUrl },
    });

    return { success: true, data: result };
  }
}
