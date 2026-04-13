import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GenerativeUiService } from './generative-ui.service';

class GenerateUiDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsOptional()
  @IsString()
  conversationId?: string;
}

@Controller('api/v1/generative-ui')
export class GenerativeUiController {
  constructor(private readonly generativeUiService: GenerativeUiService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generate(@Body() dto: GenerateUiDto, @Req() req: any) {
    const userId = req.user.userId || req.user.id || req.user.sub;

    if (!dto.prompt || dto.prompt.trim().length === 0) {
      throw new BadRequestException('prompt is required');
    }

    const result = await this.generativeUiService.generateUi(userId, dto.prompt, {
      conversationId: dto.conversationId,
    });

    return result;
  }

  @Get('history/:conversationId')
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @Param('conversationId') conversationId: string,
    @Req() req: any,
  ) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.generativeUiService.getHistory(conversationId, userId);
  }
}
