import { Module } from '@nestjs/common';
import { IntentController } from './intent.controller';
import { IntentService } from './intent.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [IntentController],
  providers: [IntentService],
  exports: [IntentService],
})
export class IntentModule {}
