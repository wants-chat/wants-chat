import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpClientService } from './mcp-client.service';
import { McpToolBridgeService } from './mcp-tool-bridge.service';
import { McpController } from './mcp.controller';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [McpController],
  providers: [McpClientService, McpToolBridgeService],
  exports: [McpClientService, McpToolBridgeService],
})
export class McpModule {}
