import { Module } from '@nestjs/common';
import { WidgetsService } from './widgets.service';
import { WidgetsController } from './widgets.controller';
import { DatabaseModule } from '../database/database.module';
import { ToolDataModule } from '../tool-data';
import { CustomFieldsModule } from '../custom-fields';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, ToolDataModule, CustomFieldsModule, AuthModule],
  controllers: [WidgetsController],
  providers: [WidgetsService],
  exports: [WidgetsService],
})
export class WidgetsModule {}
