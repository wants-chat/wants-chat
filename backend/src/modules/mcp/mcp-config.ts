/**
 * MCP (Model Context Protocol) Configuration
 *
 * Defines the shape of MCP server configurations.
 * Servers can be configured via the MCP_SERVERS env var (JSON array)
 * or via a mcp-servers.json file in the backend root.
 */

export interface McpServerConfig {
  /** Unique name to identify this MCP server */
  name: string;

  /** Transport type: stdio for local processes, sse for remote HTTP servers */
  transport: 'stdio' | 'sse';

  // --- stdio transport options ---
  /** Command to spawn (e.g. "npx", "node", "python") */
  command?: string;
  /** Arguments to the command */
  args?: string[];
  /** Extra environment variables for the child process */
  env?: Record<string, string>;

  // --- SSE transport options ---
  /** URL of the remote MCP server (SSE endpoint) */
  url?: string;
  /** Extra HTTP headers (e.g. for authentication) */
  headers?: Record<string, string>;
}

export interface McpToolInfo {
  /** Which MCP server this tool belongs to */
  serverName: string;
  /** Tool name as reported by the MCP server */
  name: string;
  /** Human-readable description */
  description?: string;
  /** JSON Schema for the tool's input parameters */
  inputSchema?: Record<string, any>;
}

export interface McpResourceInfo {
  /** Which MCP server this resource belongs to */
  serverName: string;
  /** Resource URI */
  uri: string;
  /** Human-readable name */
  name?: string;
  /** Description */
  description?: string;
  /** MIME type */
  mimeType?: string;
}

export interface McpServerStatus {
  name: string;
  transport: 'stdio' | 'sse';
  connected: boolean;
  toolCount: number;
  error?: string;
}
