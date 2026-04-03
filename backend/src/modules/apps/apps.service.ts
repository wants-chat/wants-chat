import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface UserApp {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  slug: string;
  status: 'draft' | 'generated' | 'building' | 'deployed' | 'failed' | 'archived';
  conversation_id?: string; // Link to the chat conversation where app was created
  app_type?: string; // App type ID from registry (e.g., 'blog', 'ecommerce')
  output_path?: string; // Local path where app code is generated

  // Frameworks
  frontend_framework?: string;
  backend_framework?: string;
  mobile_framework?: string;

  // Code availability
  has_frontend: boolean;
  has_backend: boolean;
  has_mobile: boolean;

  // Deployment URLs
  frontend_url?: string;
  backend_url?: string;
  ios_app_store_url?: string;
  android_play_store_url?: string;

  // Configuration
  deploy_config?: Record<string, any>;
  secrets?: Record<string, any>;

  // GitHub sync info
  github_repo_owner?: string;
  github_repo_name?: string;
  github_repo_full_name?: string;
  github_branch?: string;
  github_last_pushed_at?: Date;
  github_last_pulled_at?: Date;
  github_last_commit_sha?: string;
  github_auto_sync?: boolean;

  // Preview
  thumbnail_url?: string;
  preview_images?: string[];

  // Generation info
  generation_prompt?: string;
  generation_model?: string;
  generation_tokens_used?: number;

  // Metadata
  metadata?: Record<string, any>;
  tags?: string[];
  is_favorite: boolean;
  is_public: boolean;

  created_at: Date;
  updated_at: Date;
}

export interface CreateAppDto {
  name: string;
  description?: string;
  slug?: string;
  conversationId?: string; // Link to the chat conversation where app was created
  appType?: string; // App type ID from registry (e.g., 'blog', 'ecommerce')
  outputPath?: string; // Local path where app code is generated
  frontendFramework?: string;
  backendFramework?: string;
  mobileFramework?: string;
  hasFrontend?: boolean;
  hasBackend?: boolean;
  hasMobile?: boolean;
  frontendUrl?: string;
  backendUrl?: string;
  status?: UserApp['status'];
  generationPrompt?: string;
  generationModel?: string;
  thumbnailUrl?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateAppDto {
  name?: string;
  description?: string;
  status?: UserApp['status'];
  frontendUrl?: string;
  backendUrl?: string;
  iosAppStoreUrl?: string;
  androidPlayStoreUrl?: string;
  deployConfig?: Record<string, any>;
  secrets?: Record<string, any>;
  thumbnailUrl?: string;
  previewImages?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
  isFavorite?: boolean;
  isPublic?: boolean;
}

export interface UpdateGitHubSyncDto {
  repoOwner: string;
  repoName: string;
  repoFullName: string;
  branch?: string;
  lastPushedAt?: Date;
  lastPulledAt?: Date;
  lastCommitSha?: string;
  autoSync?: boolean;
}

export interface AppQueryOptions {
  status?: string;
  isFavorite?: boolean;
  hasGitHub?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

@Injectable()
export class AppsService {
  private readonly logger = new Logger(AppsService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Create a new app
   */
  async createApp(userId: string, dto: CreateAppDto): Promise<UserApp> {
    try {
      // Generate slug if not provided
      const slug = dto.slug || this.generateSlug(dto.name);

      const app = await this.db.insert<UserApp>('user_apps', {
        user_id: userId,
        name: dto.name,
        description: dto.description,
        slug,
        conversation_id: dto.conversationId, // Link to chat conversation
        app_type: dto.appType, // App type from registry
        output_path: dto.outputPath, // Local path where code is generated
        status: dto.status || 'draft',
        frontend_framework: dto.frontendFramework,
        backend_framework: dto.backendFramework,
        mobile_framework: dto.mobileFramework,
        has_frontend: dto.hasFrontend || false,
        has_backend: dto.hasBackend || false,
        has_mobile: dto.hasMobile || false,
        frontend_url: dto.frontendUrl,
        backend_url: dto.backendUrl,
        generation_prompt: dto.generationPrompt,
        generation_model: dto.generationModel,
        thumbnail_url: dto.thumbnailUrl,
        tags: JSON.stringify(dto.tags || []),
        metadata: JSON.stringify(dto.metadata || {}),
        is_favorite: false,
        is_public: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      this.logger.log(`App created for user ${userId}: ${app.id} (${dto.name})`);
      return app;
    } catch (error) {
      this.logger.error(`Failed to create app: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a single app by ID
   */
  async getApp(userId: string, appId: string): Promise<UserApp> {
    const app = await this.db.findOne<UserApp>('user_apps', {
      id: appId,
      user_id: userId,
    });

    if (!app) {
      throw new NotFoundException('App not found');
    }

    return app;
  }

  /**
   * Get app by slug
   */
  async getAppBySlug(userId: string, slug: string): Promise<UserApp | null> {
    return await this.db.findOne<UserApp>('user_apps', {
      slug,
      user_id: userId,
    });
  }

  /**
   * Get app by conversation ID
   */
  async getAppByConversationId(userId: string, conversationId: string): Promise<UserApp | null> {
    return await this.db.findOne<UserApp>('user_apps', {
      conversation_id: conversationId,
      user_id: userId,
    });
  }

  /**
   * List apps with optional filters
   */
  async listApps(userId: string, options: AppQueryOptions = {}): Promise<{
    items: UserApp[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    const orderBy = options.orderBy || 'created_at';
    const order = options.order || 'DESC';

    // Build where clause
    let whereClause = 'user_id = $1';
    const params: any[] = [userId];
    let paramIndex = 2;

    if (options.status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(options.status);
      paramIndex++;
    }

    if (options.isFavorite !== undefined) {
      whereClause += ` AND is_favorite = $${paramIndex}`;
      params.push(options.isFavorite);
      paramIndex++;
    }

    if (options.hasGitHub !== undefined) {
      if (options.hasGitHub) {
        whereClause += ` AND github_repo_full_name IS NOT NULL`;
      } else {
        whereClause += ` AND github_repo_full_name IS NULL`;
      }
    }

    if (options.search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${options.search}%`);
      paramIndex++;
    }

    // Get total count
    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM user_apps WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count || '0', 10);

    // Get items
    const result = await this.db.query<UserApp>(
      `SELECT * FROM user_apps WHERE ${whereClause} ORDER BY "${orderBy}" ${order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset],
    );

    return {
      items: result.rows,
      total,
      limit,
      offset,
    };
  }

  /**
   * Update an app
   */
  async updateApp(userId: string, appId: string, dto: UpdateAppDto): Promise<UserApp> {
    await this.getApp(userId, appId); // Verify ownership

    const updateData: any = { updated_at: new Date() };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.frontendUrl !== undefined) updateData.frontend_url = dto.frontendUrl;
    if (dto.backendUrl !== undefined) updateData.backend_url = dto.backendUrl;
    if (dto.iosAppStoreUrl !== undefined) updateData.ios_app_store_url = dto.iosAppStoreUrl;
    if (dto.androidPlayStoreUrl !== undefined) updateData.android_play_store_url = dto.androidPlayStoreUrl;
    if (dto.deployConfig !== undefined) updateData.deploy_config = dto.deployConfig;
    if (dto.secrets !== undefined) updateData.secrets = dto.secrets;
    if (dto.thumbnailUrl !== undefined) updateData.thumbnail_url = dto.thumbnailUrl;
    if (dto.previewImages !== undefined) updateData.preview_images = dto.previewImages;
    if (dto.tags !== undefined) updateData.tags = dto.tags;
    if (dto.metadata !== undefined) updateData.metadata = dto.metadata;
    if (dto.isFavorite !== undefined) updateData.is_favorite = dto.isFavorite;
    if (dto.isPublic !== undefined) updateData.is_public = dto.isPublic;

    const [updated] = await this.db.update<UserApp>(
      'user_apps',
      { id: appId, user_id: userId },
      updateData,
    );

    return updated;
  }

  /**
   * Update GitHub sync info for an app
   */
  async updateGitHubSync(userId: string, appId: string, dto: UpdateGitHubSyncDto): Promise<UserApp> {
    await this.getApp(userId, appId); // Verify ownership

    const updateData: any = {
      updated_at: new Date(),
      github_repo_owner: dto.repoOwner,
      github_repo_name: dto.repoName,
      github_repo_full_name: dto.repoFullName,
    };

    if (dto.branch !== undefined) updateData.github_branch = dto.branch;
    if (dto.lastPushedAt !== undefined) updateData.github_last_pushed_at = dto.lastPushedAt;
    if (dto.lastPulledAt !== undefined) updateData.github_last_pulled_at = dto.lastPulledAt;
    if (dto.lastCommitSha !== undefined) updateData.github_last_commit_sha = dto.lastCommitSha;
    if (dto.autoSync !== undefined) updateData.github_auto_sync = dto.autoSync;

    const [updated] = await this.db.update<UserApp>(
      'user_apps',
      { id: appId, user_id: userId },
      updateData,
    );

    this.logger.log(`GitHub sync updated for app ${appId}: ${dto.repoFullName}`);
    return updated;
  }

  /**
   * Clear GitHub sync info for an app
   */
  async clearGitHubSync(userId: string, appId: string): Promise<UserApp> {
    await this.getApp(userId, appId); // Verify ownership

    const [updated] = await this.db.update<UserApp>(
      'user_apps',
      { id: appId, user_id: userId },
      {
        updated_at: new Date(),
        github_repo_owner: null,
        github_repo_name: null,
        github_repo_full_name: null,
        github_branch: null,
        github_last_pushed_at: null,
        github_last_pulled_at: null,
        github_last_commit_sha: null,
        github_auto_sync: false,
      },
    );

    return updated;
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(userId: string, appId: string): Promise<UserApp> {
    const app = await this.getApp(userId, appId);
    return this.updateApp(userId, appId, { isFavorite: !app.is_favorite });
  }

  /**
   * Delete an app
   */
  async deleteApp(userId: string, appId: string): Promise<void> {
    await this.getApp(userId, appId); // Verify ownership
    await this.db.delete('user_apps', { id: appId, user_id: userId });
    this.logger.log(`App deleted: ${appId}`);
  }

  /**
   * Get app statistics for a user
   */
  async getAppStats(userId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    favorites: number;
    withGitHub: number;
    deployed: number;
  }> {
    // Total count
    const totalResult = await this.db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM user_apps WHERE user_id = $1',
      [userId],
    );

    // By status
    const statusResult = await this.db.query<{ status: string; count: string }>(
      'SELECT status, COUNT(*) as count FROM user_apps WHERE user_id = $1 GROUP BY status',
      [userId],
    );

    // Favorites
    const favResult = await this.db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM user_apps WHERE user_id = $1 AND is_favorite = true',
      [userId],
    );

    // With GitHub
    const githubResult = await this.db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM user_apps WHERE user_id = $1 AND github_repo_full_name IS NOT NULL',
      [userId],
    );

    // Deployed
    const deployedResult = await this.db.query<{ count: string }>(
      "SELECT COUNT(*) as count FROM user_apps WHERE user_id = $1 AND status = 'deployed'",
      [userId],
    );

    const byStatus: Record<string, number> = {};
    for (const row of statusResult.rows) {
      byStatus[row.status] = parseInt(row.count, 10);
    }

    return {
      total: parseInt(totalResult.rows[0]?.count || '0', 10),
      byStatus,
      favorites: parseInt(favResult.rows[0]?.count || '0', 10),
      withGitHub: parseInt(githubResult.rows[0]?.count || '0', 10),
      deployed: parseInt(deployedResult.rows[0]?.count || '0', 10),
    };
  }

  /**
   * Generate a URL-friendly slug from a name
   */
  private generateSlug(name: string): string {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Add timestamp to ensure uniqueness
    return `${baseSlug}-${Date.now().toString(36)}`;
  }

  /**
   * Transform database record to API response
   */
  transformApp(app: UserApp): any {
    if (!app) return null;

    // Parse JSON fields
    let deployConfig: any = {};
    let secrets: any = {};
    let previewImages: string[] = [];
    let tags: string[] = [];
    let metadata: any = {};

    try {
      deployConfig = typeof app.deploy_config === 'string' ? JSON.parse(app.deploy_config) : (app.deploy_config || {});
    } catch { deployConfig = {}; }

    try {
      secrets = typeof app.secrets === 'string' ? JSON.parse(app.secrets) : (app.secrets || {});
    } catch { secrets = {}; }

    try {
      previewImages = typeof app.preview_images === 'string' ? JSON.parse(app.preview_images) : (app.preview_images || []);
    } catch { previewImages = []; }

    try {
      tags = typeof app.tags === 'string' ? JSON.parse(app.tags) : (app.tags || []);
    } catch { tags = []; }

    try {
      metadata = typeof app.metadata === 'string' ? JSON.parse(app.metadata) : (app.metadata || {});
    } catch { metadata = {}; }

    return {
      id: app.id,
      userId: app.user_id,
      name: app.name,
      description: app.description,
      slug: app.slug,
      conversationId: app.conversation_id,
      appType: app.app_type,
      outputPath: app.output_path,
      status: app.status,

      frontendFramework: app.frontend_framework,
      backendFramework: app.backend_framework,
      mobileFramework: app.mobile_framework,

      hasFrontend: app.has_frontend,
      hasBackend: app.has_backend,
      hasMobile: app.has_mobile,

      frontendUrl: app.frontend_url,
      backendUrl: app.backend_url,
      iosAppStoreUrl: app.ios_app_store_url,
      androidPlayStoreUrl: app.android_play_store_url,

      deployConfig,
      secrets,

      github: app.github_repo_full_name ? {
        repoOwner: app.github_repo_owner,
        repoName: app.github_repo_name,
        repoFullName: app.github_repo_full_name,
        branch: app.github_branch,
        lastPushedAt: app.github_last_pushed_at,
        lastPulledAt: app.github_last_pulled_at,
        lastCommitSha: app.github_last_commit_sha,
        autoSync: app.github_auto_sync,
      } : null,

      thumbnailUrl: app.thumbnail_url,
      previewImages,

      generationPrompt: app.generation_prompt,
      generationModel: app.generation_model,
      generationTokensUsed: app.generation_tokens_used,

      metadata,
      tags,
      isFavorite: app.is_favorite,
      isPublic: app.is_public,

      createdAt: app.created_at,
      updatedAt: app.updated_at,
    };
  }
}
