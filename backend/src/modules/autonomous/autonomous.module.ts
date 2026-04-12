import { Module } from '@nestjs/common';
import { AutonomousAgentService } from './autonomous-agent.service';
import { AutonomousAgentController } from './autonomous-agent.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AutonomousAgentController],
  providers: [AutonomousAgentService],
  exports: [AutonomousAgentService],
})
export class AutonomousModule {}
