import { Module, forwardRef } from '@nestjs/common';
import { AutonomousAgentService } from './autonomous-agent.service';
import { AutonomousAgentController } from './autonomous-agent.controller';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { AiModule } from '../ai/ai.module';
import { WebSocketModule } from '../../common/gateways/websocket.module';

@Module({
  imports: [AuthModule, DatabaseModule, forwardRef(() => AiModule), WebSocketModule],
  controllers: [AutonomousAgentController],
  providers: [AutonomousAgentService],
  exports: [AutonomousAgentService],
})
export class AutonomousModule {}
