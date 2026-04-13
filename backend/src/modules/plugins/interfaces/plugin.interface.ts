/**
 * Plugin manifest format - describes a plugin and its tools.
 */
export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  icon?: string;
  tools: PluginToolDefinition[];
}

export interface PluginToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, any>; // JSON Schema
  apiEndpoint: string; // URL the plugin tool is hosted at
}

/**
 * Plugin record from the database.
 */
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  manifest: PluginManifest;
  is_active: boolean;
  install_count: number;
  created_at: Date;
}

/**
 * User-plugin association.
 */
export interface UserPlugin {
  id: string;
  user_id: string;
  plugin_id: string;
  enabled_at: Date;
}
