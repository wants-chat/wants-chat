import { Module } from '@nestjs/common';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
import { ToolLoggerService } from '../common/services/tool-logger.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UnitsController],
  providers: [UnitsService, ToolLoggerService],
  exports: [UnitsService],
})
export class UnitsModule {}
