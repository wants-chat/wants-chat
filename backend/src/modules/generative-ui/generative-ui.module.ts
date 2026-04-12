import { Module } from '@nestjs/common';
import { GenerativeUiController } from './generative-ui.controller';
import { GenerativeUiService } from './generative-ui.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [GenerativeUiController],
  providers: [GenerativeUiService],
  exports: [GenerativeUiService],
})
export class GenerativeUiModule {}
