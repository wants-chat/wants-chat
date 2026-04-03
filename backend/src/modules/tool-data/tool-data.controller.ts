import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ToolDataService } from './tool-data.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tool Data')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tool-data')
export class ToolDataController {
  constructor(private readonly toolDataService: ToolDataService) {}

  // ============================================
  // Get Operations
  // ============================================

  @Get()
  @ApiOperation({ summary: 'Get all tool data for current user' })
  @ApiResponse({ status: 200, description: 'Tool data list retrieved' })
  async getAllToolData(@Request() req) {
    const data = await this.toolDataService.getAllToolData(req.user.sub);
    return {
      success: true,
      data,
    };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get summary of all tools with saved data' })
  @ApiResponse({ status: 200, description: 'Summary retrieved' })
  async getToolDataSummary(@Request() req) {
    const summary = await this.toolDataService.getToolDataSummary(req.user.sub);
    return {
      success: true,
      data: summary,
    };
  }

  @Get(':toolId')
  @ApiOperation({ summary: 'Get data for a specific tool' })
  @ApiResponse({ status: 200, description: 'Tool data retrieved' })
  @ApiResponse({ status: 404, description: 'No data found for this tool' })
  async getToolData(@Request() req, @Param('toolId') toolId: string) {
    const data = await this.toolDataService.getToolData(req.user.sub, toolId);

    if (!data) {
      return {
        success: true,
        data: null,
        message: 'No data found for this tool',
      };
    }

    return {
      success: true,
      data: data.data,
      version: data.version,
      updatedAt: data.updated_at,
    };
  }

  // ============================================
  // Save Operations
  // ============================================

  @Post(':toolId')
  @ApiOperation({ summary: 'Save data for a specific tool' })
  @ApiResponse({ status: 201, description: 'Tool data saved' })
  async saveToolData(
    @Request() req,
    @Param('toolId') toolId: string,
    @Body() body: { data: Record<string, any> },
  ) {
    const result = await this.toolDataService.saveToolData(
      req.user.sub,
      toolId,
      body.data,
    );

    return {
      success: true,
      message: 'Data saved successfully',
      version: result.version,
      updatedAt: result.updated_at,
    };
  }

  @Put(':toolId')
  @ApiOperation({ summary: 'Update data for a specific tool' })
  @ApiResponse({ status: 200, description: 'Tool data updated' })
  async updateToolData(
    @Request() req,
    @Param('toolId') toolId: string,
    @Body() body: { data: Record<string, any> },
  ) {
    const result = await this.toolDataService.saveToolData(
      req.user.sub,
      toolId,
      body.data,
    );

    return {
      success: true,
      message: 'Data updated successfully',
      version: result.version,
      updatedAt: result.updated_at,
    };
  }

  // ============================================
  // Delete Operations
  // ============================================

  @Delete(':toolId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete data for a specific tool' })
  @ApiResponse({ status: 200, description: 'Tool data deleted' })
  async deleteToolData(@Request() req, @Param('toolId') toolId: string) {
    const deleted = await this.toolDataService.deleteToolData(
      req.user.sub,
      toolId,
    );

    return {
      success: deleted,
      message: deleted ? 'Data deleted successfully' : 'No data found to delete',
    };
  }

  // ============================================
  // Export Operations
  // ============================================

  @Get(':toolId/export')
  @ApiOperation({ summary: 'Export tool data as JSON' })
  @ApiResponse({ status: 200, description: 'Tool data exported' })
  async exportToolData(@Request() req, @Param('toolId') toolId: string) {
    const exportData = await this.toolDataService.exportToolData(
      req.user.sub,
      toolId,
    );

    if (!exportData) {
      return {
        success: false,
        message: 'No data found to export',
      };
    }

    return {
      success: true,
      data: exportData,
    };
  }

  @Get(':toolId/export/download')
  @ApiOperation({ summary: 'Download tool data as JSON file' })
  @ApiResponse({ status: 200, description: 'JSON file download' })
  async downloadToolData(
    @Request() req,
    @Param('toolId') toolId: string,
    @Res() res: Response,
  ) {
    const exportData = await this.toolDataService.exportToolData(
      req.user.sub,
      toolId,
    );

    if (!exportData) {
      return res.status(404).json({
        success: false,
        message: 'No data found to export',
      });
    }

    const filename = `${toolId}_${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(exportData, null, 2));
  }

  @Get('export/all')
  @ApiOperation({ summary: 'Export all tool data for user' })
  @ApiResponse({ status: 200, description: 'All tool data exported' })
  async exportAllToolData(@Request() req) {
    const exportData = await this.toolDataService.exportAllToolData(req.user.sub);

    return {
      success: true,
      data: exportData,
    };
  }

  @Get('export/all/download')
  @ApiOperation({ summary: 'Download all tool data as JSON file' })
  @ApiResponse({ status: 200, description: 'JSON file download' })
  async downloadAllToolData(@Request() req, @Res() res: Response) {
    const exportData = await this.toolDataService.exportAllToolData(req.user.sub);

    const filename = `all_tools_backup_${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(exportData, null, 2));
  }

  // ============================================
  // Import Operations
  // ============================================

  @Post(':toolId/import')
  @ApiOperation({ summary: 'Import tool data from JSON' })
  @ApiQuery({ name: 'merge', required: false, type: Boolean })
  @ApiResponse({ status: 201, description: 'Tool data imported' })
  async importToolData(
    @Request() req,
    @Param('toolId') toolId: string,
    @Body() body: { data: Record<string, any> },
    @Query('merge') merge?: string,
  ) {
    const result = await this.toolDataService.importToolData(
      req.user.sub,
      toolId,
      body.data,
      merge === 'true',
    );

    return {
      success: true,
      message: 'Data imported successfully',
      version: result.version,
      updatedAt: result.updated_at,
    };
  }
}
