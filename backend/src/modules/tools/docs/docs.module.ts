import { Module } from '@nestjs/common';
import { DocsController } from './docs.controller';
import { DocsService } from './docs.service';
import { PdfProcessorService } from './processors/pdf-processor.service';
import { LibreOfficeConverterService } from './processors/libreoffice-converter.service';
import { ToolLoggerService } from '../common/services/tool-logger.service';
import { StorageModule } from '../../storage/storage.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [StorageModule, AuthModule],
  controllers: [DocsController],
  providers: [
    DocsService,
    PdfProcessorService,
    LibreOfficeConverterService,
    ToolLoggerService,
  ],
  exports: [DocsService, PdfProcessorService, LibreOfficeConverterService],
})
export class DocsModule {}
