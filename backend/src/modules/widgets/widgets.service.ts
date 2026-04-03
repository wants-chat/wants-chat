import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as crypto from 'crypto';

export interface WidgetConfig {
  id: string;
  user_id: string;
  tool_id: string;
  widget_name: string;
  theme: 'light' | 'dark' | 'auto';
  primary_color: string;
  border_radius: number;
  show_header: boolean;
  show_footer: boolean;
  allowed_domains: string[];
  custom_css: string | null;
  custom_js: string | null;
  embed_token: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateWidgetConfigDto {
  widget_name?: string;
  theme?: 'light' | 'dark' | 'auto';
  primary_color?: string;
  border_radius?: number;
  show_header?: boolean;
  show_footer?: boolean;
  allowed_domains?: string[];
  custom_css?: string;
  custom_js?: string;
}

export interface UpdateWidgetConfigDto {
  widget_name?: string;
  theme?: 'light' | 'dark' | 'auto';
  primary_color?: string;
  border_radius?: number;
  show_header?: boolean;
  show_footer?: boolean;
  allowed_domains?: string[];
  custom_css?: string;
  custom_js?: string;
  is_active?: boolean;
}

export interface WidgetEmbedEvent {
  id: string;
  widget_config_id: string;
  event_type: string;
  event_data: Record<string, any>;
  referrer_url: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: Date;
}

@Injectable()
export class WidgetsService {
  private readonly logger = new Logger(WidgetsService.name);

  constructor(private db: DatabaseService) {}

  // ============================================
  // Widget Config CRUD
  // ============================================

  /**
   * Create a new widget configuration
   */
  async createWidgetConfig(
    userId: string,
    toolId: string,
    dto: CreateWidgetConfigDto = {},
  ): Promise<WidgetConfig> {
    // Check if widget config already exists for this tool
    const existing = await this.getWidgetConfig(userId, toolId);
    if (existing) {
      throw new BadRequestException(
        `Widget configuration already exists for tool "${toolId}". Use update instead.`,
      );
    }

    // Generate embed token
    const embedToken = this.generateEmbedToken();

    const config = await this.db.insert<WidgetConfig>('widget_configs', {
      user_id: userId,
      tool_id: toolId,
      widget_name: dto.widget_name || `${toolId} Widget`,
      theme: dto.theme || 'auto',
      primary_color: dto.primary_color || '#0D9488',
      border_radius: dto.border_radius ?? 8,
      show_header: dto.show_header ?? true,
      show_footer: dto.show_footer ?? true,
      allowed_domains: JSON.stringify(dto.allowed_domains || []),
      custom_css: dto.custom_css || null,
      custom_js: dto.custom_js || null,
      embed_token: embedToken,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    this.logger.log(`Created widget config for tool "${toolId}"`);
    this.logger.log(`Widget config embed_token: ${config?.embed_token}`);
    this.logger.log(`Full config: ${JSON.stringify(config)}`);

    return this.parseConfig(config);
  }

  /**
   * Get widget configuration for a tool
   */
  async getWidgetConfig(
    userId: string,
    toolId: string,
  ): Promise<WidgetConfig | null> {
    const config = await this.db.findOne<WidgetConfig>('widget_configs', {
      user_id: userId,
      tool_id: toolId,
    });

    this.logger.log(`GetWidgetConfig for ${toolId}: ${JSON.stringify(config)}`);

    return config ? this.parseConfig(config) : null;
  }

  /**
   * Get widget configuration by embed token (public)
   */
  async getWidgetConfigByToken(embedToken: string): Promise<WidgetConfig | null> {
    const config = await this.db.findOne<WidgetConfig>('widget_configs', {
      embed_token: embedToken,
      is_active: true,
    });

    return config ? this.parseConfig(config) : null;
  }

  /**
   * Get all widget configurations for a user
   */
  async getUserWidgetConfigs(userId: string): Promise<WidgetConfig[]> {
    const configs = await this.db.findMany<WidgetConfig>(
      'widget_configs',
      { user_id: userId },
      { orderBy: 'created_at', order: 'DESC' },
    );

    return configs.map(c => this.parseConfig(c));
  }

  /**
   * Update widget configuration
   */
  async updateWidgetConfig(
    userId: string,
    toolId: string,
    dto: UpdateWidgetConfigDto,
  ): Promise<WidgetConfig | null> {
    const existing = await this.getWidgetConfig(userId, toolId);
    if (!existing) return null;

    const updateData: Record<string, any> = {
      updated_at: new Date(),
    };

    if (dto.widget_name !== undefined) updateData.widget_name = dto.widget_name;
    if (dto.theme !== undefined) updateData.theme = dto.theme;
    if (dto.primary_color !== undefined) updateData.primary_color = dto.primary_color;
    if (dto.border_radius !== undefined) updateData.border_radius = dto.border_radius;
    if (dto.show_header !== undefined) updateData.show_header = dto.show_header;
    if (dto.show_footer !== undefined) updateData.show_footer = dto.show_footer;
    if (dto.allowed_domains !== undefined) updateData.allowed_domains = JSON.stringify(dto.allowed_domains);
    if (dto.custom_css !== undefined) updateData.custom_css = dto.custom_css;
    if (dto.custom_js !== undefined) updateData.custom_js = dto.custom_js;
    if (dto.is_active !== undefined) updateData.is_active = dto.is_active;

    const [updated] = await this.db.update<WidgetConfig>(
      'widget_configs',
      { id: existing.id, user_id: userId },
      updateData,
    );

    return updated ? this.parseConfig(updated) : null;
  }

  /**
   * Regenerate embed token
   */
  async regenerateEmbedToken(
    userId: string,
    toolId: string,
  ): Promise<string | null> {
    const existing = await this.getWidgetConfig(userId, toolId);
    if (!existing) return null;

    const newToken = this.generateEmbedToken();

    await this.db.update<WidgetConfig>(
      'widget_configs',
      { id: existing.id, user_id: userId },
      { embed_token: newToken, updated_at: new Date() },
    );

    return newToken;
  }

  /**
   * Delete widget configuration
   */
  async deleteWidgetConfig(userId: string, toolId: string): Promise<boolean> {
    const count = await this.db.delete('widget_configs', {
      user_id: userId,
      tool_id: toolId,
    });
    return count > 0;
  }

  // ============================================
  // Domain Validation
  // ============================================

  /**
   * Check if a domain is allowed for a widget
   */
  validateDomain(config: WidgetConfig, domain: string): boolean {
    // Always allow localhost for development
    if (domain === 'localhost' || domain === '127.0.0.1' || domain.startsWith('localhost:')) {
      return true;
    }

    // Empty allowed_domains means all domains are allowed
    if (!config.allowed_domains || config.allowed_domains.length === 0) {
      return true;
    }

    // Check for exact match or wildcard match
    return config.allowed_domains.some(allowed => {
      if (allowed === '*') return true;
      if (allowed.startsWith('*.')) {
        const suffix = allowed.slice(1);
        return domain.endsWith(suffix) || domain === allowed.slice(2);
      }
      return domain === allowed;
    });
  }

  // ============================================
  // Embed Event Logging
  // ============================================

  /**
   * Log a widget embed event
   */
  async logEmbedEvent(
    widgetConfigId: string,
    eventType: string,
    eventData: Record<string, any> = {},
    metadata: {
      referrer_url?: string;
      user_agent?: string;
      ip_address?: string;
    } = {},
  ): Promise<void> {
    try {
      await this.db.insert<WidgetEmbedEvent>('widget_embed_events', {
        widget_config_id: widgetConfigId,
        event_type: eventType,
        event_data: eventData,
        referrer_url: metadata.referrer_url || null,
        user_agent: metadata.user_agent || null,
        ip_address: metadata.ip_address || null,
        created_at: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error logging embed event: ${error.message}`);
    }
  }

  /**
   * Get embed event statistics
   */
  async getEmbedStats(
    userId: string,
    toolId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    total_loads: number;
    unique_domains: number;
    events_by_type: Record<string, number>;
    daily_loads: Array<{ date: string; count: number }>;
  }> {
    const config = await this.getWidgetConfig(userId, toolId);
    if (!config) {
      throw new NotFoundException('Widget configuration not found');
    }

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    // Get total loads
    const totalResult = await this.db.query<{ count: number }>(`
      SELECT COUNT(*) as count
      FROM widget_embed_events
      WHERE widget_config_id = $1
        AND event_type = 'load'
        AND created_at >= $2
        AND created_at <= $3
    `, [config.id, start, end]);

    // Get unique domains
    const domainsResult = await this.db.query<{ count: number }>(`
      SELECT COUNT(DISTINCT referrer_url) as count
      FROM widget_embed_events
      WHERE widget_config_id = $1
        AND created_at >= $2
        AND created_at <= $3
    `, [config.id, start, end]);

    // Get events by type
    const eventsByType = await this.db.query<{ event_type: string; count: number }>(`
      SELECT event_type, COUNT(*) as count
      FROM widget_embed_events
      WHERE widget_config_id = $1
        AND created_at >= $2
        AND created_at <= $3
      GROUP BY event_type
    `, [config.id, start, end]);

    // Get daily loads
    const dailyLoads = await this.db.query<{ date: string; count: number }>(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM widget_embed_events
      WHERE widget_config_id = $1
        AND event_type = 'load'
        AND created_at >= $2
        AND created_at <= $3
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `, [config.id, start, end]);

    return {
      total_loads: totalResult.rows[0]?.count || 0,
      unique_domains: domainsResult.rows[0]?.count || 0,
      events_by_type: eventsByType.rows.reduce((acc, row) => {
        acc[row.event_type] = row.count;
        return acc;
      }, {} as Record<string, number>),
      daily_loads: dailyLoads.rows,
    };
  }

  // ============================================
  // Generate Embed Code
  // ============================================

  /**
   * Generate the embed code snippet for a widget
   */
  generateEmbedCode(config: WidgetConfig, baseUrl: string): {
    script: string;
    iframe: string;
  } {
    const scriptCode = `<script src="${baseUrl}/js/tool-widget.js" data-token="${config.embed_token}"></script>`;

    const iframeCode = `<iframe
  src="${baseUrl}/embed/${config.embed_token}"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none; border-radius: ${config.border_radius}px;"
></iframe>`;

    return {
      script: scriptCode,
      iframe: iframeCode,
    };
  }

  // ============================================
  // Private Helpers
  // ============================================

  private generateEmbedToken(): string {
    return `wgt_${crypto.randomBytes(24).toString('base64url')}`;
  }

  private parseConfig(config: WidgetConfig): WidgetConfig {
    return {
      ...config,
      allowed_domains: typeof config.allowed_domains === 'string'
        ? JSON.parse(config.allowed_domains)
        : config.allowed_domains || [],
    };
  }
}
