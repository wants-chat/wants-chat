import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { R2Service } from './r2.service';
import { StorageController } from './storage.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, forwardRef(() => AuthModule)],
  controllers: [StorageController],
  providers: [R2Service],
  exports: [R2Service],
})
export class StorageModule {}
