import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { PluginRegistryService } from './plugin-registry.service';
import { PluginsController } from './plugins.controller';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [PluginsController],
  providers: [PluginRegistryService],
  exports: [PluginRegistryService],
})
export class PluginsModule {}
