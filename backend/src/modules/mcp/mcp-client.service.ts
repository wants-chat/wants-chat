import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import {
  McpServerConfig,
  McpToolInfo,
  McpResourceInfo,
  McpServerStatus,
} from './mcp-config';
import * as fs from 'fs';
import * as path from 'path';

interface ManagedConnection {
  config: McpServerConfig;
  client: Client;
  transport: StdioClientTransport | SSEClientTransport;
  connected: boolean;
  error?: string;
}

@Injectable()
export class McpClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(McpClientService.name);
  private connections = new Map<string, ManagedConnection>();

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const configs = this.loadConfigs();
    if (configs.length === 0) {
      this.logger.log('No MCP servers configured');
      return;
    }

    this.logger.log(`Connecting to ${configs.length} MCP server(s)...`);

    for (const config of configs) {
      await this.connectServer(config);
    }
  }

  async onModuleDestroy() {
    for (const [name, conn] of this.connections) {
      try {
        await conn.transport.close();
        this.logger.log(`Disconnected MCP server: ${name}`);
      } catch (error) {
        this.logger.warn(`Error disconnecting MCP server ${name}: ${error.message}`);
      }
    }
    this.connections.clear();
  }

  // ============================================
  // Configuration Loading
  // ============================================

  private loadConfigs(): McpServerConfig[] {
    // 1. Try MCP_SERVERS env var
    const envValue = this.configService.get<string>('MCP_SERVERS');
    if (envValue) {
      try {
        const parsed = JSON.parse(envValue);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.logger.log(`Loaded ${parsed.length} MCP server config(s) from MCP_SERVERS env`);
          return parsed;
        }
      } catch (error) {
        this.logger.warn(`Failed to parse MCP_SERVERS env var: ${error.message}`);
      }
    }

    // 2. Try mcp-servers.json config file
    const configPath = path.resolve(process.cwd(), 'mcp-servers.json');
    if (fs.existsSync(configPath)) {
      try {
        const fileContent = fs.readFileSync(configPath, 'utf-8');
        const parsed = JSON.parse(fileContent);
        const configs: McpServerConfig[] = Array.isArray(parsed)
          ? parsed
          : parsed.servers || [];
        if (configs.length > 0) {
          this.logger.log(`Loaded ${configs.length} MCP server config(s) from ${configPath}`);
          return configs;
        }
      } catch (error) {
        this.logger.warn(`Failed to read mcp-servers.json: ${error.message}`);
      }
    }

    return [];
  }

  // ============================================
  // Connection Management
  // ============================================

  private async connectServer(config: McpServerConfig): Promise<void> {
    try {
      this.logger.log(`Connecting to MCP server "${config.name}" (${config.transport})...`);

      let transport: StdioClientTransport | SSEClientTransport;

      if (config.transport === 'stdio') {
        if (!config.command) {
          throw new Error(`stdio transport requires "command" for server "${config.name}"`);
        }
        transport = new StdioClientTransport({
          command: config.command,
          args: config.args || [],
          env: { ...process.env, ...(config.env || {}) } as Record<string, string>,
        });
      } else if (config.transport === 'sse') {
        if (!config.url) {
          throw new Error(`sse transport requires "url" for server "${config.name}"`);
        }
        transport = new SSEClientTransport(new URL(config.url));
      } else {
        throw new Error(`Unknown transport "${config.transport}" for server "${config.name}"`);
      }

      const client = new Client(
        { name: 'wants-chat', version: '1.0.0' },
        { capabilities: {} },
      );

      await client.connect(transport);

      this.connections.set(config.name, {
        config,
        client,
        transport,
        connected: true,
      });

      this.logger.log(`Connected to MCP server "${config.name}"`);
    } catch (error) {
      this.logger.warn(`Failed to connect to MCP server "${config.name}": ${error.message}`);
      // Store the failed connection so we can report its status
      this.connections.set(config.name, {
        config,
        client: null as any,
        transport: null as any,
        connected: false,
        error: error.message,
      });
    }
  }

  // ============================================
  // Tool Operations
  // ============================================

  /**
   * List all tools from all connected MCP servers
   */
  async listTools(): Promise<McpToolInfo[]> {
    const allTools: McpToolInfo[] = [];

    for (const [name, conn] of this.connections) {
      if (!conn.connected) continue;

      try {
        const result = await conn.client.listTools();
        for (const tool of result.tools) {
          allTools.push({
            serverName: name,
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema as Record<string, any>,
          });
        }
      } catch (error) {
        this.logger.warn(`Failed to list tools from "${name}": ${error.message}`);
      }
    }

    return allTools;
  }

  /**
   * Call a tool on a specific MCP server
   */
  async callTool(
    serverName: string,
    toolName: string,
    args: Record<string, any> = {},
  ): Promise<any> {
    const conn = this.connections.get(serverName);
    if (!conn) {
      throw new Error(`MCP server "${serverName}" not found`);
    }
    if (!conn.connected) {
      throw new Error(`MCP server "${serverName}" is not connected`);
    }

    try {
      const result = await conn.client.callTool({ name: toolName, arguments: args });
      return result;
    } catch (error) {
      this.logger.error(`MCP tool call failed (${serverName}/${toolName}): ${error.message}`);
      throw error;
    }
  }

  // ============================================
  // Resource Operations
  // ============================================

  /**
   * List resources from a specific MCP server
   */
  async listResources(serverName: string): Promise<McpResourceInfo[]> {
    const conn = this.connections.get(serverName);
    if (!conn) {
      throw new Error(`MCP server "${serverName}" not found`);
    }
    if (!conn.connected) {
      throw new Error(`MCP server "${serverName}" is not connected`);
    }

    try {
      const result = await conn.client.listResources();
      return (result.resources || []).map((r) => ({
        serverName,
        uri: r.uri,
        name: r.name,
        description: r.description,
        mimeType: r.mimeType,
      }));
    } catch (error) {
      this.logger.warn(`Failed to list resources from "${serverName}": ${error.message}`);
      return [];
    }
  }

  /**
   * Read a resource from a specific MCP server
   */
  async readResource(
    serverName: string,
    uri: string,
  ): Promise<{ contents: Array<{ uri: string; text?: string; mimeType?: string }> }> {
    const conn = this.connections.get(serverName);
    if (!conn) {
      throw new Error(`MCP server "${serverName}" not found`);
    }
    if (!conn.connected) {
      throw new Error(`MCP server "${serverName}" is not connected`);
    }

    try {
      const result = await conn.client.readResource({ uri });
      return {
        contents: (result.contents || []).map((c: any) => ({
          uri: c.uri,
          text: c.text,
          mimeType: c.mimeType,
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to read resource "${uri}" from "${serverName}": ${error.message}`);
      throw error;
    }
  }

  // ============================================
  // Server Status
  // ============================================

  /**
   * Get connection status for all configured MCP servers
   */
  async getConnectedServers(): Promise<McpServerStatus[]> {
    const statuses: McpServerStatus[] = [];

    for (const [name, conn] of this.connections) {
      let toolCount = 0;
      if (conn.connected) {
        try {
          const tools = await conn.client.listTools();
          toolCount = tools.tools.length;
        } catch {
          // ignore
        }
      }

      statuses.push({
        name,
        transport: conn.config.transport,
        connected: conn.connected,
        toolCount,
        error: conn.error,
      });
    }

    return statuses;
  }

  /**
   * Test connection to a specific server by reconnecting
   */
  async testConnection(serverName: string): Promise<McpServerStatus> {
    const conn = this.connections.get(serverName);
    if (!conn) {
      throw new Error(`MCP server "${serverName}" not found in configuration`);
    }

    // Try to disconnect and reconnect
    if (conn.connected && conn.transport) {
      try {
        await conn.transport.close();
      } catch {
        // ignore close errors
      }
    }

    this.connections.delete(serverName);
    await this.connectServer(conn.config);

    const updated = this.connections.get(serverName);
    let toolCount = 0;
    if (updated?.connected) {
      try {
        const tools = await updated.client.listTools();
        toolCount = tools.tools.length;
      } catch {
        // ignore
      }
    }

    return {
      name: serverName,
      transport: conn.config.transport,
      connected: updated?.connected || false,
      toolCount,
      error: updated?.error,
    };
  }

  /**
   * Convert MCP tools to OpenAI-compatible function definitions
   * for inclusion in LLM tool-calling requests.
   */
  mcpToolsToFunctionDefs(): Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: Record<string, any>;
    };
  }> {
    const defs: Array<{
      type: 'function';
      function: { name: string; description: string; parameters: Record<string, any> };
    }> = [];

    // We need to synchronously return cached tools; listTools is async
    // so callers should call listTools() first and use the result
    return defs;
  }

  /**
   * Get the list of connected server names
   */
  getConnectedServerNames(): string[] {
    const names: string[] = [];
    for (const [name, conn] of this.connections) {
      if (conn.connected) names.push(name);
    }
    return names;
  }

  /**
   * Check if any MCP servers are connected
   */
  hasConnectedServers(): boolean {
    for (const conn of this.connections.values()) {
      if (conn.connected) return true;
    }
    return false;
  }
}
