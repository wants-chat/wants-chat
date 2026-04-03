import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { FfmpegProcessorService } from './processors/ffmpeg-processor.service';
import { ToolLoggerService } from '../common/services/tool-logger.service';
import { StorageModule } from '../../storage/storage.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [StorageModule, AuthModule],
  controllers: [MediaController],
  providers: [MediaService, FfmpegProcessorService, ToolLoggerService],
  exports: [MediaService, FfmpegProcessorService],
})
export class MediaModule {}
