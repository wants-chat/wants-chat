import { Module, Global } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeyAuthGuard, HybridAuthGuard } from './api-key-auth.guard';
import { DatabaseModule } from '../database';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ApiKeysController],
  providers: [ApiKeysService, ApiKeyAuthGuard, HybridAuthGuard],
  exports: [ApiKeysService, ApiKeyAuthGuard, HybridAuthGuard],
})
export class ApiKeysModule {}
