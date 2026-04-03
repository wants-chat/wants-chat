import { Module } from '@nestjs/common';
import { QrBarcodeController } from './qr-barcode.controller';
import { QrBarcodeService } from './qr-barcode.service';
import { ToolLoggerService } from '../common/services/tool-logger.service';
import { StorageModule } from '../../storage/storage.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [StorageModule, AuthModule],
  controllers: [QrBarcodeController],
  providers: [QrBarcodeService, ToolLoggerService],
  exports: [QrBarcodeService],
})
export class QrBarcodeModule {}
