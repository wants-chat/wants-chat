import { Module } from '@nestjs/common';
import { EncodingController } from './encoding.controller';
import { EncodingService } from './encoding.service';
import { ToolLoggerService } from '../common/services/tool-logger.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [EncodingController],
  providers: [EncodingService, ToolLoggerService],
  exports: [EncodingService],
})
export class EncodingModule {}
