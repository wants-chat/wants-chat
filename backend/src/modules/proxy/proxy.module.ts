import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProxyService } from './proxy.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule {}
