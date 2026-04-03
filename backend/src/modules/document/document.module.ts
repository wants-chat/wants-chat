import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { PdfGenerator } from './generators/pdf.generator';
import { DocxGenerator } from './generators/docx.generator';
import { PptxGenerator } from './generators/pptx.generator';
import { StorageModule } from '../storage/storage.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    StorageModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [DocumentController],
  providers: [
    DocumentService,
    PdfGenerator,
    DocxGenerator,
    PptxGenerator,
  ],
  exports: [
    DocumentService,
    PdfGenerator,
    DocxGenerator,
    PptxGenerator,
  ],
})
export class DocumentModule {}
