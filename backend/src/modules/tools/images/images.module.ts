import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { SharpProcessorService } from './processors/sharp-processor.service';
import { BackgroundRemoverService } from './processors/background-remover.service';
import { ToolLoggerService } from '../common/services/tool-logger.service';
import { StorageModule } from '../../storage/storage.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [StorageModule, AuthModule],
  controllers: [ImagesController],
  providers: [
    ImagesService,
    SharpProcessorService,
    BackgroundRemoverService,
    ToolLoggerService,
  ],
  exports: [ImagesService, SharpProcessorService],
})
export class ImagesModule {}
