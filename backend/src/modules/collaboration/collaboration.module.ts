import { Module } from '@nestjs/common';
import { CollaborationService } from './collaboration.service';
import { CollaborationController } from './collaboration.controller';
import { CollaborationGateway } from './collaboration.gateway';
import { WebSocketModule } from '../../common/gateways/websocket.module';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [WebSocketModule, AuthModule, DatabaseModule],
  controllers: [CollaborationController],
  providers: [CollaborationService, CollaborationGateway],
  exports: [CollaborationService],
})
export class CollaborationModule {}
