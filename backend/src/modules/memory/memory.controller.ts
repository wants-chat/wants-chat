import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MemoryService } from './memory.service';
import {
  CreateMemoryDto,
  UpdateMemoryDto,
  MemoryQueryDto,
  UpdateCustomInstructionsDto,
} from './dto';

@Controller('memories')
@UseGuards(JwtAuthGuard)
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  /**
   * Create a new memory
   */
  @Post()
  async createMemory(@Request() req: any, @Body() dto: CreateMemoryDto) {
    const userId = req.user.sub || req.user.userId;
    const memory = await this.memoryService.createMemory(userId, dto);
    return { data: memory, message: 'Memory created successfully' };
  }

  /**
   * Get all memories for the current user
   */
  @Get()
  async getMemories(@Request() req: any, @Query() query: MemoryQueryDto) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.memoryService.getMemories(userId, query);
    return { data: result.data, meta: { total: result.total, limit: result.limit, offset: result.offset } };
  }

  /**
   * Search memories
   */
  @Get('search')
  async searchMemories(
    @Request() req: any,
    @Query('q') searchQuery: string,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user.sub || req.user.userId;
    const memories = await this.memoryService.getRelevantMemories(
      userId,
      searchQuery || '',
      limit || 10,
    );
    return { data: memories };
  }

  /**
   * Get memory statistics
   */
  @Get('stats')
  async getMemoryStats(@Request() req: any) {
    const userId = req.user.sub || req.user.userId;
    const stats = await this.memoryService.getMemoryStats(userId);
    return { data: stats };
  }

  /**
   * Get a single memory by ID
   */
  @Get(':id')
  async getMemory(@Request() req: any, @Param('id') memoryId: string) {
    const userId = req.user.sub || req.user.userId;
    const memory = await this.memoryService.getMemory(userId, memoryId);
    return { data: memory };
  }

  /**
   * Update a memory
   */
  @Put(':id')
  async updateMemory(
    @Request() req: any,
    @Param('id') memoryId: string,
    @Body() dto: UpdateMemoryDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    const memory = await this.memoryService.updateMemory(userId, memoryId, dto);
    return { data: memory, message: 'Memory updated successfully' };
  }

  /**
   * Delete a memory
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMemory(@Request() req: any, @Param('id') memoryId: string) {
    const userId = req.user.sub || req.user.userId;
    await this.memoryService.deleteMemory(userId, memoryId);
  }

  /**
   * Delete all memories
   */
  @Delete()
  async deleteAllMemories(@Request() req: any) {
    const userId = req.user.sub || req.user.userId;
    const count = await this.memoryService.deleteAllMemories(userId);
    return { data: { deleted: count }, message: `Deleted ${count} memories` };
  }
}

@Controller('user/instructions')
@UseGuards(JwtAuthGuard)
export class CustomInstructionsController {
  constructor(private readonly memoryService: MemoryService) {}

  /**
   * Get custom instructions
   */
  @Get()
  async getCustomInstructions(@Request() req: any) {
    const userId = req.user.sub || req.user.userId;
    const instructions = await this.memoryService.getCustomInstructions(userId);
    return { data: instructions };
  }

  /**
   * Update custom instructions
   */
  @Put()
  async updateCustomInstructions(
    @Request() req: any,
    @Body() dto: UpdateCustomInstructionsDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    const instructions = await this.memoryService.updateCustomInstructions(
      userId,
      dto,
    );
    return { data: instructions, message: 'Instructions updated successfully' };
  }
}
