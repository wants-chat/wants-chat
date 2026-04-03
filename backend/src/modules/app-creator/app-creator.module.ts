import { Module } from '@nestjs/common';
import { AppCreatorController } from './app-creator.controller';
import { AppCreatorService } from './app-creator.service';
import { AiModule } from '../ai/ai.module';
import { DatabaseModule } from '../database/database.module';
import { BuildValidatorService } from './services/build-validator.service';
import { AutoRepairService } from './services/auto-repair.service';

@Module({
  imports: [AiModule, DatabaseModule],
  controllers: [AppCreatorController],
  providers: [
    AppCreatorService,
    BuildValidatorService,
    AutoRepairService,
  ],
  exports: [AppCreatorService, BuildValidatorService, AutoRepairService],
})
export class AppCreatorModule {}
