import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface ToolData {
  id: string;
  user_id: string;
  tool_id: string;
  data: Record<string, any>;
  version: number;
  created_at: Date;
  updated_at: Date;
}

export interface ToolDataSummary {
  tool_id: string;
  record_count: number;
  last_updated: Date;
}

@Injectable()
export class ToolDataService {
  private readonly logger = new Logger(ToolDataService.name);

  constructor(private db: DatabaseService) {}

  /**
   * Initialize the tool_data table if it doesn't exist
   */
  async initializeTable(): Promise<void> {
    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS tool_data (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          tool_id VARCHAR(100) NOT NULL,
          data JSONB NOT NULL DEFAULT '{}',
          version INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, tool_id)
        );

        CREATE INDEX IF NOT EXISTS idx_tool_data_user_id ON tool_data(user_id);
        CREATE INDEX IF NOT EXISTS idx_tool_data_tool_id ON tool_data(tool_id);
        CREATE INDEX IF NOT EXISTS idx_tool_data_user_tool ON tool_data(user_id, tool_id);
      `);
      this.logger.log('Tool data table initialized');
    } catch (error) {
      this.logger.error('Failed to initialize tool_data table:', error.message);
      throw error;
    }
  }

  /**
   * Get tool data for a specific tool
   */
  async getToolData(userId: string, toolId: string): Promise<ToolData | null> {
    const result = await this.db.findOne<ToolData>('tool_data', {
      user_id: userId,
      tool_id: toolId,
    });
    return result;
  }

  /**
   * Save or update tool data (upsert)
   */
  async saveToolData(
    userId: string,
    toolId: string,
    data: Record<string, any>,
  ): Promise<ToolData> {
    const existing = await this.getToolData(userId, toolId);

    if (existing) {
      // Update existing
      const [updated] = await this.db.update<ToolData>(
        'tool_data',
        { user_id: userId, tool_id: toolId },
        {
          data,
          version: existing.version + 1,
          updated_at: new Date(),
        },
      );
      this.logger.debug(`Updated tool data for ${toolId}, version ${updated.version}`);
      return updated;
    } else {
      // Insert new
      const inserted = await this.db.insert<ToolData>('tool_data', {
        user_id: userId,
        tool_id: toolId,
        data,
        version: 1,
        created_at: new Date(),
        updated_at: new Date(),
      });
      this.logger.debug(`Created tool data for ${toolId}`);
      return inserted;
    }
  }

  /**
   * Delete tool data
   */
  async deleteToolData(userId: string, toolId: string): Promise<boolean> {
    const count = await this.db.delete('tool_data', {
      user_id: userId,
      tool_id: toolId,
    });
    return count > 0;
  }

  /**
   * Get all tool data for a user
   */
  async getAllToolData(userId: string): Promise<ToolData[]> {
    return this.db.findMany<ToolData>(
      'tool_data',
      { user_id: userId },
      { orderBy: 'updated_at', order: 'DESC' },
    );
  }

  /**
   * Get summary of all tools with data for a user
   */
  async getToolDataSummary(userId: string): Promise<ToolDataSummary[]> {
    const result = await this.db.query<{
      tool_id: string;
      record_count: number;
      last_updated: Date;
    }>(`
      SELECT
        tool_id,
        COALESCE(jsonb_array_length(data->'items'), jsonb_array_length(data->'data'), 1) as record_count,
        updated_at as last_updated
      FROM tool_data
      WHERE user_id = $1
      ORDER BY updated_at DESC
    `, [userId]);

    return result.rows;
  }

  /**
   * Export tool data as JSON
   */
  async exportToolData(userId: string, toolId: string): Promise<{
    toolId: string;
    data: Record<string, any>;
    exportedAt: string;
    version: number;
  } | null> {
    const toolData = await this.getToolData(userId, toolId);
    if (!toolData) return null;

    return {
      toolId: toolData.tool_id,
      data: toolData.data,
      exportedAt: new Date().toISOString(),
      version: toolData.version,
    };
  }

  /**
   * Import tool data from JSON
   */
  async importToolData(
    userId: string,
    toolId: string,
    importData: Record<string, any>,
    merge: boolean = false,
  ): Promise<ToolData> {
    if (merge) {
      const existing = await this.getToolData(userId, toolId);
      if (existing && existing.data) {
        // Merge arrays if both have items/data arrays
        const existingItems = existing.data.items || existing.data.data || [];
        const importItems = importData.items || importData.data || [];

        if (Array.isArray(existingItems) && Array.isArray(importItems)) {
          importData = {
            ...existing.data,
            ...importData,
            items: [...existingItems, ...importItems],
          };
        }
      }
    }

    return this.saveToolData(userId, toolId, importData);
  }

  /**
   * Bulk export all tool data for a user
   */
  async exportAllToolData(userId: string): Promise<{
    userId: string;
    exportedAt: string;
    tools: Array<{
      toolId: string;
      data: Record<string, any>;
      version: number;
    }>;
  }> {
    const allData = await this.getAllToolData(userId);

    return {
      userId,
      exportedAt: new Date().toISOString(),
      tools: allData.map(td => ({
        toolId: td.tool_id,
        data: td.data,
        version: td.version,
      })),
    };
  }
}
