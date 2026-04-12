import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AgentCrewService } from './agent-crew.service';
import { CreateCrewDto, ExecuteCrewDto } from './dto/create-crew.dto';

@Controller('api/v1/crews')
@UseGuards(JwtAuthGuard)
export class AgentCrewController {
  constructor(private readonly crewService: AgentCrewService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCrew(@Req() req: any, @Body() dto: CreateCrewDto) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.crewService.createCrew(userId, dto);
  }

  @Get()
  async listCrews(@Req() req: any) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.crewService.listCrews(userId);
  }

  @Get('templates')
  async getTemplates() {
    return this.crewService.getTemplates();
  }

  @Post(':id/execute')
  @HttpCode(HttpStatus.ACCEPTED)
  async executeCrew(
    @Req() req: any,
    @Param('id') crewId: string,
    @Body() dto: ExecuteCrewDto,
  ) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.crewService.executeCrew(userId, crewId, dto.input);
  }

  @Get('executions/:id')
  async getExecutionResult(@Req() req: any, @Param('id') executionId: string) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.crewService.getCrewResult(userId, executionId);
  }
}
