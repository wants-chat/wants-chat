import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AutonomousAgentService } from './autonomous-agent.service';

class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  goal: string;
}

@Controller('api/v1/agents/tasks')
@UseGuards(JwtAuthGuard)
export class AutonomousAgentController {
  constructor(private readonly agentService: AutonomousAgentService) {}

  /**
   * POST /api/v1/agents/tasks
   * Create a new autonomous task from a natural-language goal
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTask(@Req() req: any, @Body() body: CreateTaskDto) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.agentService.createTask(userId, body.goal);
  }

  /**
   * POST /api/v1/agents/tasks/:id/execute
   * Start or resume task execution
   */
  @Post(':id/execute')
  @HttpCode(HttpStatus.OK)
  async executeTask(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.agentService.executeTask(id, userId);
  }

  /**
   * POST /api/v1/agents/tasks/:id/cancel
   * Cancel a running or pending task
   */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelTask(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.agentService.cancelTask(id, userId);
  }

  /**
   * GET /api/v1/agents/tasks
   * List tasks for the authenticated user
   */
  @Get()
  async listTasks(@Req() req: any) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.agentService.listTasks(userId);
  }

  /**
   * GET /api/v1/agents/tasks/:id
   * Get task details including step results
   */
  @Get(':id')
  async getTask(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.agentService.getTaskStatus(id, userId);
  }
}
