import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Res,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AppFilesService, FileTreeItem } from './app-files.service';

@ApiTags('App Files')
@Controller('app-files')
export class AppFilesController {
  private readonly logger = new Logger(AppFilesController.name);

  constructor(private readonly appFilesService: AppFilesService) {}

  @Get(':appId/info')
  @ApiOperation({ summary: 'Get app info', description: 'Check what code types are available for an app' })
  @ApiParam({ name: 'appId', description: 'App ID' })
  @ApiResponse({ status: 200, description: 'App info retrieved successfully' })
  async getAppInfo(@Param('appId') appId: string) {
    try {
      this.logger.log(`Get app info: ${appId}`);
      const exists = await this.appFilesService.appExists(appId);
      if (!exists) {
        throw new HttpException('App not found', HttpStatus.NOT_FOUND);
      }
      return await this.appFilesService.getAppInfo(appId);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to get app info: ${error.message}`);
      throw new HttpException('Failed to get app info', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':appId/files/:type')
  @ApiOperation({ summary: 'Get file tree', description: 'Get the file tree for an app frontend, backend, or mobile' })
  @ApiParam({ name: 'appId', description: 'App ID' })
  @ApiParam({ name: 'type', enum: ['frontend', 'backend', 'mobile'], description: 'Code type' })
  @ApiResponse({ status: 200, description: 'File tree retrieved successfully' })
  async getFileTree(
    @Param('appId') appId: string,
    @Param('type') type: 'frontend' | 'backend' | 'mobile',
  ): Promise<FileTreeItem[]> {
    try {
      this.logger.log(`Get file tree: appId=${appId}, type=${type}`);
      return await this.appFilesService.getFileTree(appId, type);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to get file tree: ${error.message}`);
      throw new HttpException('Failed to get file tree', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':appId/content/:type')
  @ApiOperation({ summary: 'Get file content', description: 'Get the content of a specific file' })
  @ApiParam({ name: 'appId', description: 'App ID' })
  @ApiParam({ name: 'type', enum: ['frontend', 'backend', 'mobile'], description: 'Code type' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { filePath: { type: 'string', description: 'Relative path to the file' } },
      required: ['filePath'],
    },
  })
  @ApiResponse({ status: 200, description: 'File content retrieved successfully' })
  async getFileContent(
    @Param('appId') appId: string,
    @Param('type') type: 'frontend' | 'backend' | 'mobile',
    @Body() body: { filePath: string },
  ) {
    try {
      this.logger.log(`Get file content: appId=${appId}, type=${type}, path=${body.filePath}`);
      return await this.appFilesService.getFileContent(appId, type, body.filePath);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to get file content: ${error.message}`);
      throw new HttpException('Failed to get file content', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':appId/readme')
  @ApiOperation({ summary: 'Get README', description: 'Get the README.md content for an app' })
  @ApiParam({ name: 'appId', description: 'App ID' })
  @ApiResponse({ status: 200, description: 'README retrieved successfully' })
  async getReadme(@Param('appId') appId: string) {
    try {
      this.logger.log(`Get README: appId=${appId}`);
      return await this.appFilesService.getReadme(appId);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to get README: ${error.message}`);
      throw new HttpException('Failed to get README', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':appId/download')
  @ApiOperation({ summary: 'Download app code', description: 'Download the app code as a ZIP archive' })
  @ApiParam({ name: 'appId', description: 'App ID' })
  @ApiResponse({ status: 200, description: 'ZIP archive downloaded successfully' })
  async downloadApp(@Param('appId') appId: string, @Res() res: Response) {
    try {
      this.logger.log(`Download app: appId=${appId}`);
      const exists = await this.appFilesService.appExists(appId);
      if (!exists) {
        throw new HttpException('App not found', HttpStatus.NOT_FOUND);
      }

      const zipBuffer = await this.appFilesService.createZipArchive(appId);

      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${appId}.zip"`,
        'Content-Length': zipBuffer.length.toString(),
      });

      res.send(zipBuffer);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to download app: ${error.message}`);
      throw new HttpException('Failed to download app', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':appId/content/:type')
  @ApiOperation({ summary: 'Update file content', description: 'Update the content of a specific file' })
  @ApiParam({ name: 'appId', description: 'App ID' })
  @ApiParam({ name: 'type', enum: ['frontend', 'backend', 'mobile'], description: 'Code type' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Relative path to the file' },
        content: { type: 'string', description: 'New file content' },
      },
      required: ['filePath', 'content'],
    },
  })
  @ApiResponse({ status: 200, description: 'File updated successfully' })
  async updateFileContent(
    @Param('appId') appId: string,
    @Param('type') type: 'frontend' | 'backend' | 'mobile',
    @Body() body: { filePath: string; content: string },
  ) {
    try {
      this.logger.log(`Update file: appId=${appId}, type=${type}, path=${body.filePath}`);
      return await this.appFilesService.updateFileContent(appId, type, body.filePath, body.content);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to update file: ${error.message}`);
      throw new HttpException('Failed to update file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
