/**
 * Tools API Module
 * Provides API endpoints for tools data
 */
import { Module } from '@nestjs/common';
import { ToolsApiController } from './tools-api.controller';

@Module({
  controllers: [ToolsApiController],
  exports: [],
})
export class ToolsApiModule {}
