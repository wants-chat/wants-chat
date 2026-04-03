import { Module } from '@nestjs/common';
import { BusinessToolsController } from './business-tools.controller';
import { BusinessToolsService } from './business-tools.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [BusinessToolsController],
  providers: [BusinessToolsService],
  exports: [BusinessToolsService],
})
export class BusinessToolsModule {}
