import {
  Injectable,
  Logger,
  OnModuleInit,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import axios from 'axios';
import { DatabaseService } from '../database/database.service';
import { Plugin, UserPlugin, PluginManifest } from './interfaces';
import { PluginFilterDto } from './dto';

@Injectable()
export class PluginRegistryService implements OnModuleInit {
  private readonly logger = new Logger(PluginRegistryService.name);

  constructor(private readonly db: DatabaseService) {}

  async onModuleInit(): Promise<void> {
    await this.ensureTables();
  }

  /**
   * Create the plugins and user_plugins tables if they do not exist.
   */
  private async ensureTables(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS plugins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        version VARCHAR(50) NOT NULL,
        description TEXT,
        author VARCHAR(255),
        manifest JSONB NOT NULL,
        is_active BOOLEAN DEFAULT true,
        install_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS user_plugins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        plugin_id UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
        enabled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, plugin_id)
      );
    `);

    this.logger.log('Plugin tables ensured');
  }

  /**
   * Register a new plugin with its manifest.
   */
  async registerPlugin(manifest: PluginManifest): Promise<Plugin> {
    if (!manifest.name || !manifest.version || !manifest.tools || manifest.tools.length === 0) {
      throw new BadRequestException(
        'Plugin manifest must include name, version, and at least one tool',
      );
    }

    // Check for duplicate
    const existing = await this.db.findOne<Plugin>('plugins', { name: manifest.name });
    if (existing) {
      throw new ConflictException(`Plugin "${manifest.name}" already exists. Update not supported yet.`);
    }

    const plugin = await this.db.insert<Plugin>('plugins', {
      name: manifest.name,
      version: manifest.version,
      description: manifest.description || '',
      author: manifest.author || '',
      manifest: JSON.stringify(manifest),
      is_active: true,
      install_count: 0,
      created_at: new Date(),
    });

    return this.transformPlugin(plugin);
  }

  /**
   * List registered plugins with optional filtering.
   */
  async listPlugins(filters?: PluginFilterDto): Promise<Plugin[]> {
    const conditions: Record<string, any> = {};
    if (filters?.is_active !== undefined) {
      conditions.is_active = filters.is_active;
    }

    let plugins: Plugin[];

    if (filters?.search) {
      // Use raw query for ILIKE search
      const result = await this.db.query<Plugin>(
        `SELECT * FROM plugins
         WHERE (name ILIKE $1 OR description ILIKE $1)
         ${filters.is_active !== undefined ? 'AND is_active = $2' : ''}
         ORDER BY install_count DESC, created_at DESC
         LIMIT $${filters.is_active !== undefined ? '3' : '2'}
         OFFSET $${filters.is_active !== undefined ? '4' : '3'}`,
        filters.is_active !== undefined
          ? [`%${filters.search}%`, filters.is_active, filters.limit || 50, filters.offset || 0]
          : [`%${filters.search}%`, filters.limit || 50, filters.offset || 0],
      );
      plugins = result.rows;
    } else {
      plugins = await this.db.findMany<Plugin>('plugins', conditions, {
        orderBy: 'created_at',
        order: 'DESC',
        limit: filters?.limit || 50,
        offset: filters?.offset || 0,
      });
    }

    return plugins.map((p) => this.transformPlugin(p));
  }

  /**
   * Get a single plugin by ID.
   */
  async getPlugin(pluginId: string): Promise<Plugin> {
    const plugin = await this.db.findOne<Plugin>('plugins', { id: pluginId });
    if (!plugin) {
      throw new NotFoundException('Plugin not found');
    }
    return this.transformPlugin(plugin);
  }

  /**
   * Enable a plugin for a user.
   */
  async enablePlugin(pluginId: string, userId: string): Promise<UserPlugin> {
    // Verify plugin exists
    await this.getPlugin(pluginId);

    // Check if already enabled
    const existing = await this.db.findOne<UserPlugin>('user_plugins', {
      user_id: userId,
      plugin_id: pluginId,
    });
    if (existing) {
      return existing;
    }

    const userPlugin = await this.db.insert<UserPlugin>('user_plugins', {
      user_id: userId,
      plugin_id: pluginId,
      enabled_at: new Date(),
    });

    // Increment install count
    await this.db.query(
      'UPDATE plugins SET install_count = install_count + 1 WHERE id = $1',
      [pluginId],
    );

    return userPlugin;
  }

  /**
   * Disable a plugin for a user.
   */
  async disablePlugin(pluginId: string, userId: string): Promise<void> {
    const existing = await this.db.findOne<UserPlugin>('user_plugins', {
      user_id: userId,
      plugin_id: pluginId,
    });
    if (!existing) {
      throw new NotFoundException('Plugin is not enabled for this user');
    }

    await this.db.query(
      'DELETE FROM user_plugins WHERE user_id = $1 AND plugin_id = $2',
      [userId, pluginId],
    );

    // Decrement install count (floor at 0)
    await this.db.query(
      'UPDATE plugins SET install_count = GREATEST(install_count - 1, 0) WHERE id = $1',
      [pluginId],
    );
  }

  /**
   * Execute a plugin tool by calling its HTTP endpoint.
   */
  async executePluginTool(
    pluginId: string,
    toolName: string,
    input: Record<string, any>,
  ): Promise<any> {
    const plugin = await this.getPlugin(pluginId);
    const manifest = plugin.manifest;

    const tool = manifest.tools.find((t) => t.name === toolName);
    if (!tool) {
      throw new NotFoundException(
        `Tool "${toolName}" not found in plugin "${manifest.name}"`,
      );
    }

    try {
      const response = await axios.post(tool.apiEndpoint, input, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      });
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Plugin tool execution failed: ${manifest.name}/${toolName}: ${error.message}`,
      );
      throw new BadRequestException(
        `Plugin tool execution failed: ${error.message}`,
      );
    }
  }

  /**
   * Get all plugin tools enabled for a specific user.
   * Used by the chat pipeline to include plugin tools in AI context.
   */
  async getUserPluginTools(
    userId: string,
  ): Promise<Array<{ pluginId: string; pluginName: string; toolName: string; description: string }>> {
    const result = await this.db.query<any>(
      `SELECT p.id as plugin_id, p.name as plugin_name, p.manifest
       FROM user_plugins up
       JOIN plugins p ON p.id = up.plugin_id
       WHERE up.user_id = $1 AND p.is_active = true`,
      [userId],
    );

    const tools: Array<{ pluginId: string; pluginName: string; toolName: string; description: string }> = [];

    for (const row of result.rows) {
      const manifest: PluginManifest =
        typeof row.manifest === 'string' ? JSON.parse(row.manifest) : row.manifest;

      for (const tool of manifest.tools) {
        tools.push({
          pluginId: row.plugin_id,
          pluginName: row.plugin_name,
          toolName: tool.name,
          description: tool.description,
        });
      }
    }

    return tools;
  }

  /**
   * Transform a plugin row, parsing JSONB manifest if needed.
   */
  private transformPlugin(plugin: Plugin): Plugin {
    return {
      ...plugin,
      manifest:
        typeof plugin.manifest === 'string'
          ? JSON.parse(plugin.manifest)
          : plugin.manifest,
    };
  }
}
