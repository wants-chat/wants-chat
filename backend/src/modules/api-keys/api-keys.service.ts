import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as crypto from 'crypto';

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  key_hint: string;
  scopes: string[];
  rate_limit: number;
  last_used_at: Date | null;
  usage_count: number;
  is_active: boolean;
  expires_at: Date | null;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface ApiKeyUsageLog {
  id: string;
  api_key_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  ip_address: string;
  user_agent: string;
  request_body_size: number;
  response_body_size: number;
  error_message: string | null;
  created_at: Date;
}

export interface CreateApiKeyDto {
  name?: string;
  scopes?: string[];
  rate_limit?: number;
  expires_at?: Date;
  metadata?: Record<string, any>;
}

export interface ApiKeyValidationResult {
  valid: boolean;
  userId?: string;
  keyId?: string;
  scopes?: string[];
  error?: string;
}

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);

  constructor(private db: DatabaseService) {}

  /**
   * Generate a new API key
   * Returns the full key only once - it cannot be retrieved again
   */
  async createApiKey(
    userId: string,
    dto: CreateApiKeyDto = {},
  ): Promise<{ apiKey: ApiKey; fullKey: string }> {
    // Generate a secure random key
    const keyBytes = crypto.randomBytes(32);
    const fullKey = `sk_live_${keyBytes.toString('base64url')}`;
    const keyPrefix = fullKey.substring(0, 12);
    const keyHint = fullKey.substring(fullKey.length - 4);

    // Hash the key for storage
    const keyHash = this.hashKey(fullKey);

    const apiKey = await this.db.insert<ApiKey>('api_keys', {
      user_id: userId,
      name: dto.name || 'Default API Key',
      key_prefix: keyPrefix,
      key_hash: keyHash,
      key_hint: keyHint,
      scopes: JSON.stringify(dto.scopes || ['read', 'write']),
      rate_limit: dto.rate_limit || 1000,
      expires_at: dto.expires_at || null,
      metadata: dto.metadata || {},
      created_at: new Date(),
      updated_at: new Date(),
    });

    this.logger.log(`API key created for user ${userId}: ${keyPrefix}...${keyHint}`);

    return {
      apiKey: {
        ...apiKey,
        scopes: typeof apiKey.scopes === 'string' ? JSON.parse(apiKey.scopes) : apiKey.scopes,
      },
      fullKey,
    };
  }

  /**
   * List all API keys for a user (without the actual keys)
   */
  async listApiKeys(userId: string): Promise<ApiKey[]> {
    const keys = await this.db.findMany<ApiKey>(
      'api_keys',
      { user_id: userId },
      { orderBy: 'created_at', order: 'DESC' },
    );

    return keys.map(key => ({
      ...key,
      scopes: typeof key.scopes === 'string' ? JSON.parse(key.scopes) : key.scopes,
    }));
  }

  /**
   * Get a single API key by ID
   */
  async getApiKey(userId: string, keyId: string): Promise<ApiKey | null> {
    const key = await this.db.findOne<ApiKey>('api_keys', {
      id: keyId,
      user_id: userId,
    });

    if (!key) return null;

    return {
      ...key,
      scopes: typeof key.scopes === 'string' ? JSON.parse(key.scopes) : key.scopes,
    };
  }

  /**
   * Update an API key
   */
  async updateApiKey(
    userId: string,
    keyId: string,
    updates: Partial<CreateApiKeyDto> & { is_active?: boolean },
  ): Promise<ApiKey | null> {
    const existing = await this.getApiKey(userId, keyId);
    if (!existing) return null;

    const updateData: Record<string, any> = {
      updated_at: new Date(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.scopes !== undefined) updateData.scopes = JSON.stringify(updates.scopes);
    if (updates.rate_limit !== undefined) updateData.rate_limit = updates.rate_limit;
    if (updates.expires_at !== undefined) updateData.expires_at = updates.expires_at;
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

    const [updated] = await this.db.update<ApiKey>(
      'api_keys',
      { id: keyId, user_id: userId },
      updateData,
    );

    return updated ? {
      ...updated,
      scopes: typeof updated.scopes === 'string' ? JSON.parse(updated.scopes) : updated.scopes,
    } : null;
  }

  /**
   * Delete an API key
   */
  async deleteApiKey(userId: string, keyId: string): Promise<boolean> {
    const count = await this.db.delete('api_keys', {
      id: keyId,
      user_id: userId,
    });
    return count > 0;
  }

  /**
   * Regenerate an API key (creates new key, keeps same ID and settings)
   */
  async regenerateApiKey(
    userId: string,
    keyId: string,
  ): Promise<{ apiKey: ApiKey; fullKey: string } | null> {
    const existing = await this.getApiKey(userId, keyId);
    if (!existing) return null;

    // Generate new key
    const keyBytes = crypto.randomBytes(32);
    const fullKey = `sk_live_${keyBytes.toString('base64url')}`;
    const keyPrefix = fullKey.substring(0, 12);
    const keyHint = fullKey.substring(fullKey.length - 4);
    const keyHash = this.hashKey(fullKey);

    const [updated] = await this.db.update<ApiKey>(
      'api_keys',
      { id: keyId, user_id: userId },
      {
        key_prefix: keyPrefix,
        key_hash: keyHash,
        key_hint: keyHint,
        updated_at: new Date(),
      },
    );

    this.logger.log(`API key regenerated for user ${userId}: ${keyPrefix}...${keyHint}`);

    return {
      apiKey: {
        ...updated,
        scopes: typeof updated.scopes === 'string' ? JSON.parse(updated.scopes) : updated.scopes,
      },
      fullKey,
    };
  }

  /**
   * Validate an API key and return the associated user
   */
  async validateApiKey(apiKey: string): Promise<ApiKeyValidationResult> {
    if (!apiKey || !apiKey.startsWith('sk_live_')) {
      return { valid: false, error: 'Invalid API key format' };
    }

    const keyHash = this.hashKey(apiKey);

    const key = await this.db.findOne<ApiKey>('api_keys', {
      key_hash: keyHash,
    });

    if (!key) {
      return { valid: false, error: 'API key not found' };
    }

    if (!key.is_active) {
      return { valid: false, error: 'API key is disabled' };
    }

    if (key.expires_at && new Date() > new Date(key.expires_at)) {
      return { valid: false, error: 'API key has expired' };
    }

    // Update usage stats asynchronously
    this.updateUsageStats(key.id).catch(err => {
      this.logger.error('Failed to update usage stats:', err);
    });

    return {
      valid: true,
      userId: key.user_id,
      keyId: key.id,
      scopes: typeof key.scopes === 'string' ? JSON.parse(key.scopes) : key.scopes,
    };
  }

  /**
   * Check if API key has required scope
   */
  hasScope(scopes: string[], requiredScope: string): boolean {
    if (scopes.includes('admin')) return true;
    return scopes.includes(requiredScope);
  }

  /**
   * Log API key usage
   */
  async logUsage(log: Omit<ApiKeyUsageLog, 'id' | 'created_at'>): Promise<void> {
    try {
      await this.db.insert('api_key_usage_logs', {
        ...log,
        created_at: new Date(),
      });
    } catch (error) {
      this.logger.error('Failed to log API usage:', error);
    }
  }

  /**
   * Get usage statistics for an API key
   */
  async getUsageStats(
    userId: string,
    keyId: string,
    days: number = 30,
  ): Promise<{
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    avg_response_time: number;
    requests_by_day: Array<{ date: string; count: number }>;
    requests_by_endpoint: Array<{ endpoint: string; count: number }>;
  }> {
    // Verify ownership
    const key = await this.getApiKey(userId, keyId);
    if (!key) {
      throw new NotFoundException('API key not found');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get overall stats
    const statsResult = await this.db.query<{
      total_requests: string;
      successful_requests: string;
      failed_requests: string;
      avg_response_time: string;
    }>(`
      SELECT
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE status_code >= 200 AND status_code < 400) as successful_requests,
        COUNT(*) FILTER (WHERE status_code >= 400) as failed_requests,
        COALESCE(AVG(response_time_ms), 0) as avg_response_time
      FROM api_key_usage_logs
      WHERE api_key_id = $1 AND created_at >= $2
    `, [keyId, startDate]);

    // Get requests by day
    const byDayResult = await this.db.query<{ date: string; count: string }>(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM api_key_usage_logs
      WHERE api_key_id = $1 AND created_at >= $2
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [keyId, startDate]);

    // Get requests by endpoint
    const byEndpointResult = await this.db.query<{ endpoint: string; count: string }>(`
      SELECT endpoint, COUNT(*) as count
      FROM api_key_usage_logs
      WHERE api_key_id = $1 AND created_at >= $2
      GROUP BY endpoint
      ORDER BY count DESC
      LIMIT 10
    `, [keyId, startDate]);

    const stats = statsResult.rows[0];

    return {
      total_requests: parseInt(stats.total_requests) || 0,
      successful_requests: parseInt(stats.successful_requests) || 0,
      failed_requests: parseInt(stats.failed_requests) || 0,
      avg_response_time: parseFloat(stats.avg_response_time) || 0,
      requests_by_day: byDayResult.rows.map(r => ({
        date: r.date,
        count: parseInt(r.count),
      })),
      requests_by_endpoint: byEndpointResult.rows.map(r => ({
        endpoint: r.endpoint,
        count: parseInt(r.count),
      })),
    };
  }

  /**
   * Check rate limit for an API key
   */
  async checkRateLimit(keyId: string): Promise<{
    allowed: boolean;
    remaining: number;
    reset_at: Date;
  }> {
    const key = await this.db.findOne<ApiKey>('api_keys', { id: keyId });
    if (!key) {
      return { allowed: false, remaining: 0, reset_at: new Date() };
    }

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const result = await this.db.query<{ count: string }>(`
      SELECT COUNT(*) as count
      FROM api_key_usage_logs
      WHERE api_key_id = $1 AND created_at >= $2
    `, [keyId, hourAgo]);

    const currentUsage = parseInt(result.rows[0]?.count) || 0;
    const remaining = Math.max(0, key.rate_limit - currentUsage);

    return {
      allowed: currentUsage < key.rate_limit,
      remaining,
      reset_at: new Date(hourAgo.getTime() + 60 * 60 * 1000),
    };
  }

  // ============================================
  // Private helpers
  // ============================================

  private hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  private async updateUsageStats(keyId: string): Promise<void> {
    await this.db.query(`
      UPDATE api_keys
      SET last_used_at = NOW(), usage_count = usage_count + 1
      WHERE id = $1
    `, [keyId]);
  }
}
