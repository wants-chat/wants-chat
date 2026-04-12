import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CollaborationService, CreateSessionDto, JoinSessionDto } from './collaboration.service';

@Controller('api/v1/collab')
export class CollaborationController {
  constructor(private readonly collaborationService: CollaborationService) {}

  @Post('sessions')
  @UseGuards(JwtAuthGuard)
  async createSession(@Req() req: any, @Body() dto: CreateSessionDto) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.collaborationService.createSession(userId, dto);
  }

  @Post('sessions/join')
  @UseGuards(JwtAuthGuard)
  async joinSession(@Req() req: any, @Body() dto: JoinSessionDto) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.collaborationService.joinSession(userId, dto);
  }

  @Get('sessions/:id')
  @UseGuards(JwtAuthGuard)
  async getSession(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.collaborationService.getSession(id, userId);
  }

  @Delete('sessions/:id/leave')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async leaveSession(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    await this.collaborationService.leaveSession(userId, id);
  }
}
