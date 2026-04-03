import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Query,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { R2Service, R2UploadOptions } from './r2.service';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Storage')
@Controller('storage')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StorageController {
  constructor(private readonly r2Service: R2Service) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  }))
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        path: { type: 'string', description: 'Optional subfolder path' },
        public: { type: 'boolean', description: 'Make file publicly accessible' },
      },
    },
  })
  async uploadFile(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { path?: string; public?: string },
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const userId = req.user.sub || req.user.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found');
    }

    const options: R2UploadOptions = {
      path: body.path || 'uploads',
      isPublic: body.public === 'true' || body.public === true as any,
    };

    const result = await this.r2Service.uploadFile(file, userId, options);

    return {
      success: true,
      file: {
        id: result.key,
        url: result.url,
        filename: result.filename,
        size: result.size,
        mimetype: result.mimetype,
      },
    };
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10, {
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit per file
  }))
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  async uploadMultiple(
    @Request() req: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { path?: string; public?: string },
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const userId = req.user.sub || req.user.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found');
    }

    const options: R2UploadOptions = {
      path: body.path || 'uploads',
      isPublic: body.public === 'true' || body.public === true as any,
    };

    const results = await this.r2Service.uploadMultiple(files, userId, options);

    return {
      success: true,
      files: results.map(result => ({
        id: result.key,
        url: result.url,
        filename: result.filename,
        size: result.size,
        mimetype: result.mimetype,
      })),
    };
  }

  @Get('files')
  @ApiOperation({ summary: 'List user files' })
  async listFiles(
    @Request() req: any,
    @Query('prefix') prefix?: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found');
    }

    return this.r2Service.listFiles(userId, prefix);
  }

  @Delete('files/:key')
  @ApiOperation({ summary: 'Delete a file' })
  async deleteFile(
    @Request() req: any,
    @Param('key') key: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found');
    }

    // Ensure user can only delete their own files
    if (!key.startsWith(`users/${userId}/`)) {
      throw new BadRequestException('Unauthorized to delete this file');
    }

    await this.r2Service.deleteFile(key);
    return { success: true, deleted: key };
  }

  @Get('signed-url/:key')
  @ApiOperation({ summary: 'Get a signed URL for a file' })
  async getSignedUrl(
    @Request() req: any,
    @Param('key') key: string,
    @Query('expires') expires?: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found');
    }

    // Ensure user can only access their own files
    if (!key.startsWith(`users/${userId}/`)) {
      throw new BadRequestException('Unauthorized to access this file');
    }

    const expiresIn = expires ? parseInt(expires) : 3600;
    const url = await this.r2Service.getSignedUrl(key, expiresIn);

    return { url, expiresIn };
  }

  @Get('status')
  @ApiOperation({ summary: 'Check storage status' })
  async getStatus() {
    return {
      configured: this.r2Service.isReady(),
      message: this.r2Service.isReady()
        ? 'R2 storage is ready'
        : 'R2 storage not configured',
    };
  }
}
