import { Module } from '@nestjs/common';
import { TextModule } from './text/text.module';
import { EncodingModule } from './encoding/encoding.module';
import { UnitsModule } from './units/units.module';
import { ImagesModule } from './images/images.module';
import { QrBarcodeModule } from './qr-barcode/qr-barcode.module';
import { DocsModule } from './docs/docs.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    TextModule,
    EncodingModule,
    UnitsModule,
    ImagesModule,
    QrBarcodeModule,
    DocsModule,
    MediaModule,
  ],
  exports: [
    TextModule,
    EncodingModule,
    UnitsModule,
    ImagesModule,
    QrBarcodeModule,
    DocsModule,
    MediaModule,
  ],
})
export class ToolsModule {}
