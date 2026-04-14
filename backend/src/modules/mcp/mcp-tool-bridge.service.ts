import { Injectable, Logger } from '@nestjs/common';
import { McpClientService } from './mcp-client.service';
import { McpToolInfo } from './mcp-config';

/**
 * Bridges MCP tools with the AI chat system.
 *
 * Responsibilities:
 * - Converts MCP tools into system prompt context so the LLM knows about them
 * - Parses LLM responses to detect MCP tool-call requests
 * - Executes MCP tool calls and formats results for the LLM
 */
@Injectable()
export class McpToolBridgeService {
  private readonly logger = new Logger(McpToolBridgeService.name);

  /** Cached tools list (refreshed periodically) */
  private cachedTools: McpToolInfo[] = [];
  private cacheTimestamp = 0;
  private readonly cacheTtlMs = 60_000; // 1 minute

  constructor(private readonly mcpClient: McpClientService) {}

  /**
   * Get cached MCP tools, refreshing if stale.
   */
  async getTools(): Promise<McpToolInfo[]> {
    if (!this.mcpClient.hasConnectedServers()) {
      return [];
    }

    const now = Date.now();
    if (now - this.cacheTimestamp > this.cacheTtlMs) {
      try {
        this.cachedTools = await this.mcpClient.listTools();
        this.cacheTimestamp = now;
      } catch (error) {
        this.logger.warn('Failed to refresh MCP tools cache:', error.message);
      }
    }

    return this.cachedTools;
  }

  /**
   * Build a system prompt section describing available MCP tools.
   * Appended to the system message so the LLM can request tool calls.
   */
  async buildToolContext(): Promise<string | null> {
    const tools = await this.getTools();
    if (tools.length === 0) return null;

    const lines = [
      '',
      '## Available MCP Tools',
      '',
      'You have access to external tools via the Model Context Protocol. ' +
        'When a user request would benefit from one of these tools, you can call it ' +
        'by including a JSON block in your response:',
      '',
      '```mcp-tool-call',
      '{"server": "<server_name>", "tool": "<tool_name>", "arguments": { ... }}',
      '```',
      '',
      'After the tool executes, the result will be provided and you should use it to formulate your answer.',
      '',
      'Available tools:',
      '',
    ];

    for (const tool of tools) {
      lines.push(`- **${tool.serverName}/${tool.name}**: ${tool.description || 'No description'}`);
      if (tool.inputSchema && tool.inputSchema.properties) {
        const props = Object.keys(tool.inputSchema.properties);
        if (props.length > 0) {
          lines.push(`  Parameters: ${props.join(', ')}`);
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Parse an LLM response to check if it contains an MCP tool-call request.
   * Returns the parsed call, or null if no tool call was found.
   */
  parseToolCall(response: string): {
    server: string;
    tool: string;
    arguments: Record<string, any>;
    beforeText: string;
    afterText: string;
  } | null {
    const pattern = /```mcp-tool-call\s*\n([\s\S]*?)\n```/;
    const match = response.match(pattern);
    if (!match) return null;

    try {
      const parsed = JSON.parse(match[1]);
      if (!parsed.server || !parsed.tool) return null;
      if (typeof parsed.server !== 'string' || typeof parsed.tool !== 'string') return null;
      if (parsed.arguments && typeof parsed.arguments !== 'object') return null;

      const beforeText = response.substring(0, match.index).trim();
      const afterText = response.substring(match.index! + match[0].length).trim();

      return {
        server: parsed.server,
        tool: parsed.tool,
        arguments: parsed.arguments || {},
        beforeText,
        afterText,
      };
    } catch {
      this.logger.warn('Failed to parse MCP tool call from LLM response');
      return null;
    }
  }

  /**
   * Execute an MCP tool call and format the result for inclusion
   * in follow-up LLM messages.
   */
  async executeToolCall(
    server: string,
    tool: string,
    args: Record<string, any>,
  ): Promise<string> {
    try {
      // Validate the tool exists and arguments match its schema
      const tools = await this.getTools();
      const toolInfo = tools.find(t => t.serverName === server && t.name === tool);
      if (!toolInfo) {
        return `Tool "${server}/${tool}" not found`;
      }

      if (toolInfo.inputSchema?.required && Array.isArray(toolInfo.inputSchema.required)) {
        const missing = toolInfo.inputSchema.required.filter((key: string) => !(key in args));
        if (missing.length > 0) {
          return `Missing required arguments: ${missing.join(', ')}`;
        }
      }

      const result = await this.mcpClient.callTool(server, tool, args);

      // Format MCP result content
      if (result.content && Array.isArray(result.content)) {
        const textParts = result.content
          .filter((c: any) => c.type === 'text')
          .map((c: any) => c.text);
        if (textParts.length > 0) {
          return textParts.join('\n');
        }
      }

      // Fallback: serialize the result
      return JSON.stringify(result, null, 2);
    } catch (error) {
      this.logger.error(`MCP tool call failed (${server}/${tool}): ${error.message}`);
      return `Tool call failed: ${error.message}`;
    }
  }
}
