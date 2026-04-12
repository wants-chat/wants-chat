import { Module, OnModuleInit } from '@nestjs/common';
import { AgentCrewService } from './agent-crew.service';
import { AgentCrewController } from './agent-crew.controller';
import { DatabaseModule } from '../database/database.module';
import { AiModule } from '../ai/ai.module';
import { WebSocketModule } from '../../common/gateways/websocket.module';

@Module({
  imports: [DatabaseModule, AiModule, WebSocketModule],
  controllers: [AgentCrewController],
  providers: [AgentCrewService],
  exports: [AgentCrewService],
})
export class AgentsModule implements OnModuleInit {
  constructor(private readonly crewService: AgentCrewService) {}

  async onModuleInit() {
    await this.crewService.ensureTables();
  }
}
