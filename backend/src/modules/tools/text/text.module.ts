import { Module } from '@nestjs/common';
import { TextController } from './text.controller';
import { TextService } from './text.service';
import { ToolLoggerService } from '../common/services/tool-logger.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TextController],
  providers: [TextService, ToolLoggerService],
  exports: [TextService],
})
export class TextModule {}
