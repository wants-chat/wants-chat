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
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CustomFieldsService,
  CreateCustomFieldDto,
  UpdateCustomFieldDto,
  CustomFieldDefinition,
} from './custom-fields.service';

@ApiTags('Custom Fields')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('custom-fields')
export class CustomFieldsController {
  private readonly logger = new Logger(CustomFieldsController.name);

  constructor(private readonly customFieldsService: CustomFieldsService) {}

  // ============================================
  // Get Custom Fields
  // ============================================

  @Get(':toolId')
  @ApiOperation({ summary: 'Get all custom fields for a tool' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier (e.g., "insurance-quote")' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of custom fields' })
  async getCustomFields(
    @Request() req,
    @Param('toolId') toolId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const userId = req.user.sub || req.user.id;
    const fields = await this.customFieldsService.getCustomFields(
      userId,
      toolId,
      includeInactive === 'true',
    );

    return {
      success: true,
      data: fields,
      meta: {
        toolId,
        total: fields.length,
      },
    };
  }

  @Get(':toolId/:fieldId')
  @ApiOperation({ summary: 'Get a specific custom field' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiParam({ name: 'fieldId', description: 'The field ID' })
  @ApiResponse({ status: 200, description: 'Custom field details' })
  @ApiResponse({ status: 404, description: 'Field not found' })
  async getCustomField(
    @Request() req,
    @Param('toolId') toolId: string,
    @Param('fieldId') fieldId: string,
  ) {
    const userId = req.user.sub || req.user.id;
    const field = await this.customFieldsService.getCustomField(userId, toolId, fieldId);

    if (!field) {
      return {
        success: false,
        error: 'Custom field not found',
      };
    }

    return {
      success: true,
      data: field,
    };
  }

  // ============================================
  // Create Custom Field
  // ============================================

  @Post(':toolId')
  @ApiOperation({ summary: 'Create a new custom field' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiResponse({ status: 201, description: 'Field created' })
  @ApiResponse({ status: 400, description: 'Invalid field data' })
  async createCustomField(
    @Request() req,
    @Param('toolId') toolId: string,
    @Body() dto: CreateCustomFieldDto,
  ) {
    const userId = req.user.sub || req.user.id;

    try {
      const field = await this.customFieldsService.createCustomField(userId, toolId, dto);

      this.logger.log(`Created custom field "${dto.field_key}" for tool "${toolId}"`);

      return {
        success: true,
        data: field,
      };
    } catch (error) {
      this.logger.error(`Error creating custom field: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================
  // Update Custom Field
  // ============================================

  @Put(':toolId/:fieldId')
  @ApiOperation({ summary: 'Update a custom field' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiParam({ name: 'fieldId', description: 'The field ID' })
  @ApiResponse({ status: 200, description: 'Field updated' })
  @ApiResponse({ status: 404, description: 'Field not found' })
  async updateCustomField(
    @Request() req,
    @Param('toolId') toolId: string,
    @Param('fieldId') fieldId: string,
    @Body() dto: UpdateCustomFieldDto,
  ) {
    const userId = req.user.sub || req.user.id;

    try {
      const field = await this.customFieldsService.updateCustomField(
        userId,
        toolId,
        fieldId,
        dto,
      );

      if (!field) {
        return {
          success: false,
          error: 'Custom field not found',
        };
      }

      return {
        success: true,
        data: field,
      };
    } catch (error) {
      this.logger.error(`Error updating custom field: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================
  // Delete Custom Field
  // ============================================

  @Delete(':toolId/:fieldId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a custom field' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiParam({ name: 'fieldId', description: 'The field ID' })
  @ApiResponse({ status: 200, description: 'Field deleted' })
  @ApiResponse({ status: 404, description: 'Field not found' })
  async deleteCustomField(
    @Request() req,
    @Param('toolId') toolId: string,
    @Param('fieldId') fieldId: string,
  ) {
    const userId = req.user.sub || req.user.id;

    const deleted = await this.customFieldsService.deleteCustomField(
      userId,
      toolId,
      fieldId,
    );

    return {
      success: deleted,
      message: deleted ? 'Custom field deleted' : 'Custom field not found',
    };
  }

  // ============================================
  // Reorder Custom Fields
  // ============================================

  @Put(':toolId/reorder')
  @ApiOperation({ summary: 'Reorder custom fields' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiResponse({ status: 200, description: 'Fields reordered' })
  async reorderCustomFields(
    @Request() req,
    @Param('toolId') toolId: string,
    @Body() body: { orders: Array<{ id: string; order: number }> },
  ) {
    const userId = req.user.sub || req.user.id;

    try {
      await this.customFieldsService.reorderCustomFields(userId, toolId, body.orders);

      return {
        success: true,
        message: 'Fields reordered successfully',
      };
    } catch (error) {
      this.logger.error(`Error reordering fields: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================
  // Export/Import Custom Fields
  // ============================================

  @Get(':toolId/export')
  @ApiOperation({ summary: 'Export custom field definitions' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiResponse({ status: 200, description: 'Export data' })
  async exportCustomFields(
    @Request() req,
    @Param('toolId') toolId: string,
  ) {
    const userId = req.user.sub || req.user.id;
    const exportData = await this.customFieldsService.exportCustomFields(userId, toolId);

    return {
      success: true,
      data: exportData,
    };
  }

  @Post(':toolId/import')
  @ApiOperation({ summary: 'Import custom field definitions' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiQuery({ name: 'replace', required: false, type: Boolean, description: 'Replace existing fields' })
  @ApiResponse({ status: 200, description: 'Import completed' })
  async importCustomFields(
    @Request() req,
    @Param('toolId') toolId: string,
    @Body() body: { fields: CreateCustomFieldDto[] },
    @Query('replace') replace?: string,
  ) {
    const userId = req.user.sub || req.user.id;

    try {
      const result = await this.customFieldsService.importCustomFields(
        userId,
        toolId,
        body.fields,
        replace === 'true',
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Error importing fields: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================
  // Copy Custom Fields
  // ============================================

  @Post(':toolId/copy-from/:sourceToolId')
  @ApiOperation({ summary: 'Copy custom fields from another tool' })
  @ApiParam({ name: 'toolId', description: 'The target tool identifier' })
  @ApiParam({ name: 'sourceToolId', description: 'The source tool identifier' })
  @ApiResponse({ status: 200, description: 'Fields copied' })
  async copyCustomFields(
    @Request() req,
    @Param('toolId') toolId: string,
    @Param('sourceToolId') sourceToolId: string,
  ) {
    const userId = req.user.sub || req.user.id;

    try {
      const fields = await this.customFieldsService.copyCustomFields(
        userId,
        sourceToolId,
        toolId,
      );

      return {
        success: true,
        data: fields,
        message: `Copied ${fields.length} fields from ${sourceToolId} to ${toolId}`,
      };
    } catch (error) {
      this.logger.error(`Error copying fields: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================
  // Validate Field Value
  // ============================================

  @Post(':toolId/:fieldId/validate')
  @ApiOperation({ summary: 'Validate a value against a custom field definition' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiParam({ name: 'fieldId', description: 'The field ID' })
  @ApiResponse({ status: 200, description: 'Validation result' })
  async validateFieldValue(
    @Request() req,
    @Param('toolId') toolId: string,
    @Param('fieldId') fieldId: string,
    @Body() body: { value: any },
  ) {
    const userId = req.user.sub || req.user.id;

    const field = await this.customFieldsService.getCustomField(userId, toolId, fieldId);

    if (!field) {
      return {
        success: false,
        error: 'Custom field not found',
      };
    }

    const validation = this.customFieldsService.validateFieldValue(field, body.value);

    return {
      success: true,
      data: validation,
    };
  }

  // ============================================
  // Bulk Validate
  // ============================================

  @Post(':toolId/validate-all')
  @ApiOperation({ summary: 'Validate multiple values against all custom fields' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiResponse({ status: 200, description: 'Validation results' })
  async validateAllFields(
    @Request() req,
    @Param('toolId') toolId: string,
    @Body() body: { values: Record<string, any> },
  ) {
    const userId = req.user.sub || req.user.id;

    const fields = await this.customFieldsService.getCustomFields(userId, toolId);
    const results: Record<string, { valid: boolean; error?: string }> = {};

    for (const field of fields) {
      const value = body.values[field.field_key];
      results[field.field_key] = this.customFieldsService.validateFieldValue(field, value);
    }

    const allValid = Object.values(results).every(r => r.valid);

    return {
      success: true,
      data: {
        valid: allValid,
        fields: results,
      },
    };
  }
}
