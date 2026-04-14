import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { CodeSandboxService } from './code-sandbox.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class ExecuteCodeDto {
  @IsString()
  @IsIn(['javascript', 'python', 'typescript'])
  language: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  stdin?: string;
}

@ApiTags('Code Sandbox')
@Controller('sandbox')
export class CodeSandboxController {
  constructor(private readonly codeSandboxService: CodeSandboxService) {}

  @Post('execute')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute code in a sandboxed environment' })
  @ApiResponse({ status: 200, description: 'Code executed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async executeCode(@Request() req, @Body() dto: ExecuteCodeDto) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.codeSandboxService.executeCode(
      userId,
      dto.language,
      dto.code,
      dto.stdin,
    );
  }

  @Get('languages')
  @ApiOperation({ summary: 'List supported programming languages' })
  @ApiResponse({ status: 200, description: 'Supported languages' })
  async getLanguages() {
    return this.codeSandboxService.getSupportedLanguages();
  }
}
