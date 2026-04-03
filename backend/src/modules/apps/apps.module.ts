import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppsController } from './apps.controller';
import { AppPreviewController } from './app-preview.controller';
import { AppsService } from './apps.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule, ConfigModule],
  controllers: [AppsController, AppPreviewController],
  providers: [AppsService],
  exports: [AppsService],
})
export class AppsModule {}
