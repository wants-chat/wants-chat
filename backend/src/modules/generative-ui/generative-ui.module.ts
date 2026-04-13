import { Module, forwardRef, OnModuleInit } from '@nestjs/common';
import { GenerativeUiController } from './generative-ui.controller';
import { GenerativeUiService } from './generative-ui.service';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AuthModule, DatabaseModule, forwardRef(() => AiModule)],
  controllers: [GenerativeUiController],
  providers: [GenerativeUiService],
  exports: [GenerativeUiService],
})
export class GenerativeUiModule {}
