import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BrowserController } from './browser.controller';
import { BrowserService } from './browser.service';
import { SessionManagerService } from './session-manager.service';
import { StagehandService } from './stagehand.service';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => AiModule),
    AuthModule,
  ],
  controllers: [BrowserController],
  providers: [
    BrowserService,
    SessionManagerService,
    StagehandService,
  ],
  exports: [
    BrowserService,
    SessionManagerService,
    StagehandService,
  ],
})
export class BrowserModule {}
