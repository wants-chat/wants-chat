import { Module, forwardRef } from '@nestjs/common';
import { WebController } from './web.controller';
import { WebService } from './web.service';
import { ContentExtractorService } from './content-extractor.service';
import { ScreenshotService } from './screenshot.service';
import { AiModule } from '../ai/ai.module';
import { StorageModule } from '../storage/storage.module';
import { AuthModule } from '../auth/auth.module';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [
    forwardRef(() => AiModule),
    StorageModule,
    AuthModule,
    ContentModule,
  ],
  controllers: [WebController],
  providers: [
    WebService,
    ContentExtractorService,
    ScreenshotService,
  ],
  exports: [
    WebService,
    ContentExtractorService,
    ScreenshotService,
  ],
})
export class WebModule {}
