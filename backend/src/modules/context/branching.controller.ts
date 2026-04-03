import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { BranchingService } from './branching.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class EditMessageDto {
  @IsString()
  @IsNotEmpty()
  newContent: string;
}

class CreateBranchDto {
  @IsOptional()
  @IsString()
  label?: string;
}

class RenameBranchDto {
  @IsString()
  @IsNotEmpty()
  newLabel: string;
}

@Controller('branching')
@UseGuards(JwtAuthGuard)
export class BranchingController {
  constructor(private readonly branchingService: BranchingService) {}

  /**
   * Edit a message (creates a new version)
   */
  @Post('messages/:messageId/edit')
  async editMessage(
    @Request() req,
    @Param('messageId') messageId: string,
    @Body() dto: EditMessageDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.branchingService.editMessage(
      userId,
      messageId,
      dto.newContent,
    );
    return { data: result, message: 'Message edited successfully' };
  }

  /**
   * Create a branch from a message
   */
  @Post('messages/:messageId/branch')
  async createBranch(
    @Request() req,
    @Param('messageId') messageId: string,
    @Body() dto: CreateBranchDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.branchingService.createBranch(
      userId,
      messageId,
      dto.label,
    );
    return { data: result, message: 'Branch created successfully' };
  }

  /**
   * Switch to a different branch
   */
  @Put('branches/:branchId/activate')
  async switchBranch(
    @Request() req,
    @Param('branchId') branchId: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.branchingService.switchBranch(userId, branchId);
    return { data: result, message: 'Switched to branch successfully' };
  }

  /**
   * Get all versions of a message
   */
  @Get('messages/:messageId/versions')
  async getMessageVersions(
    @Request() req,
    @Param('messageId') messageId: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    const versions = await this.branchingService.getMessageVersions(
      userId,
      messageId,
    );
    return { data: versions };
  }

  /**
   * Get all branches for a conversation
   */
  @Get('conversations/:conversationId/branches')
  async getConversationBranches(
    @Request() req,
    @Param('conversationId') conversationId: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    const branches = await this.branchingService.getConversationBranches(
      userId,
      conversationId,
    );
    return { data: branches };
  }

  /**
   * Get branches from a specific message
   */
  @Get('messages/:messageId/branches')
  async getBranchesFromMessage(
    @Request() req,
    @Param('messageId') messageId: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    const branches = await this.branchingService.getBranchesFromMessage(
      userId,
      messageId,
    );
    return { data: branches };
  }

  /**
   * Rename a branch
   */
  @Put('branches/:branchId')
  async renameBranch(
    @Request() req,
    @Param('branchId') branchId: string,
    @Body() dto: RenameBranchDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.branchingService.renameBranch(
      userId,
      branchId,
      dto.newLabel,
    );
    return { data: result, message: 'Branch renamed successfully' };
  }

  /**
   * Delete a branch
   */
  @Delete('branches/:branchId')
  async deleteBranch(
    @Request() req,
    @Param('branchId') branchId: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.branchingService.deleteBranch(userId, branchId);
    return { data: result, message: 'Branch deleted successfully' };
  }
}
