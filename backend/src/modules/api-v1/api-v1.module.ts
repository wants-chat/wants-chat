import { Module } from '@nestjs/common';
import { V1ToolDataController } from './v1-tool-data.controller';
import { ToolDataModule } from '../tool-data';
import { ApiKeysModule } from '../api-keys';

@Module({
  imports: [ToolDataModule, ApiKeysModule],
  controllers: [V1ToolDataController],
})
export class ApiV1Module {}
