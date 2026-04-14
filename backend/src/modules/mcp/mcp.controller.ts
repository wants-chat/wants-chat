import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { McpClientService } from './mcp-client.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { McpAdminGuard } from './guards/mcp-admin.guard';

@Controller('api/v1/mcp')
@UseGuards(JwtAuthGuard, McpAdminGuard)
export class McpController {
  private readonly logger = new Logger(McpController.name);

  constructor(private readonly mcpClient: McpClientService) {}

  /**
   * GET /api/v1/mcp/servers
   * List all configured MCP servers with connection status
   */
  @Get('servers')
  async listServers() {
    return this.mcpClient.getConnectedServers();
  }

  /**
   * GET /api/v1/mcp/tools
   * List all available tools across all connected MCP servers
   */
  @Get('tools')
  async listTools() {
    return this.mcpClient.listTools();
  }

  /**
   * POST /api/v1/mcp/test/:serverName
   * Test connection to a specific MCP server (reconnects)
   */
  @Post('test/:serverName')
  async testServer(@Param('serverName') serverName: string) {
    try {
      return await this.mcpClient.testConnection(serverName);
    } catch (error) {
      this.logger.warn(`Test connection failed for "${serverName}": ${error.message}`);
      throw new NotFoundException(error.message);
    }
  }
}
