import { Injectable, Logger, HttpException, HttpStatus, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs-extra';
import * as path from 'path';
import { GitHubOAuthService } from './github-oauth.service';
import { DatabaseService } from '../database/database.service';
import {
  GitHubRepoDto,
  GitHubConnectionDto,
  PushToGitHubDto,
  PullFromGitHubDto,
  AppGitHubLinkDto,
  GitHubSyncStatusDto,
} from './dto/github.dto';

interface GitHubConnection {
  id: string;
  user_id: string;
  github_id: string;
  github_login: string;
  github_name: string | null;
  github_email: string | null;
  github_avatar: string | null;
  installation_id: string;
  access_token: string;
  is_active: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AppGitHubLink {
  id: string;
  app_id: string;
  user_id: string;
  repo_owner: string;
  repo_name: string;
  repo_full_name: string;
  branch: string;
  last_pushed_at: string | null;
  last_pulled_at: string | null;
  last_commit_sha: string | null;
  auto_sync: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class GitHubService implements OnModuleInit {
  private readonly logger = new Logger(GitHubService.name);
  private readonly appsBasePath: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly oauthService: GitHubOAuthService,
    private readonly db: DatabaseService,
  ) {
    this.appsBasePath = path.join(process.cwd(), '..', 'app-builder', 'generated');
  }

  async onModuleInit(): Promise<void> {
    // Initialize tables in background to not block app startup
    this.ensureTablesExist().catch(err => {
      this.logger.warn(`Failed to ensure GitHub tables exist: ${err.message}`);
    });
  }

  /**
   * Create tables if they don't exist
   */
  private async ensureTablesExist(): Promise<void> {
    try {
      // Create github_connections table
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS github_connections (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL UNIQUE,
          github_id TEXT NOT NULL,
          github_login TEXT NOT NULL,
          github_name TEXT,
          github_email TEXT,
          github_avatar TEXT,
          installation_id TEXT NOT NULL,
          access_token TEXT NOT NULL,
          is_active BOOLEAN DEFAULT true,
          last_synced_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Create app_github_links table
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS app_github_links (
          id TEXT PRIMARY KEY,
          app_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          repo_owner TEXT NOT NULL,
          repo_name TEXT NOT NULL,
          repo_full_name TEXT NOT NULL,
          branch TEXT DEFAULT 'main',
          last_pushed_at TIMESTAMP,
          last_pulled_at TIMESTAMP,
          last_commit_sha TEXT,
          auto_sync BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(app_id, user_id)
        )
      `);

      this.logger.log('GitHub tables initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize GitHub tables: ${error.message}`);
    }
  }

  /**
   * Handle GitHub App installation callback
   */
  async handleInstallationCallback(
    installationId: string,
    userId: string,
  ): Promise<GitHubConnectionDto> {
    try {
      // Get installation access token
      const tokenData = await this.oauthService.getInstallationAccessToken(installationId);

      // Get installation details
      const installation = await this.oauthService.getInstallation(installationId);

      // Get user info from installation account
      const account = installation.account;

      const now = new Date().toISOString();
      const connectionId = `gh-conn-${Date.now()}`;

      // Check if connection already exists for this user
      const existing = await this.db.findOne<GitHubConnection>('github_connections', { user_id: userId });

      let connection: GitHubConnection;

      if (existing) {
        // Update existing connection
        const [updated] = await this.db.update<GitHubConnection>(
          'github_connections',
          { user_id: userId },
          {
            github_id: String(account.id),
            github_login: account.login,
            github_name: account.name || null,
            github_email: account.email || null,
            github_avatar: account.avatar_url || null,
            installation_id: installationId,
            access_token: tokenData.token,
            is_active: true,
            updated_at: now,
          }
        );
        connection = updated;
        this.logger.log(`GitHub connection updated for user ${userId}`);
      } else {
        // Create new connection
        connection = await this.db.insert<GitHubConnection>('github_connections', {
          id: connectionId,
          user_id: userId,
          github_id: String(account.id),
          github_login: account.login,
          github_name: account.name || null,
          github_email: account.email || null,
          github_avatar: account.avatar_url || null,
          installation_id: installationId,
          access_token: tokenData.token,
          is_active: true,
          last_synced_at: null,
          created_at: now,
          updated_at: now,
        });
        this.logger.log(`GitHub connection created for user ${userId}`);
      }

      return this.transformConnection(connection);
    } catch (error) {
      this.logger.error(`Failed to handle installation callback: ${error.message}`);
      throw new HttpException('Failed to connect GitHub', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Get user's GitHub connection
   */
  async getConnection(userId: string): Promise<GitHubConnectionDto | null> {
    try {
      const connection = await this.db.findOne<GitHubConnection>('github_connections', {
        user_id: userId,
        is_active: true,
      });

      if (!connection) {
        return null;
      }
      return this.transformConnection(connection);
    } catch (error) {
      this.logger.error(`Failed to get connection: ${error.message}`);
      return null;
    }
  }

  /**
   * Disconnect GitHub
   */
  async disconnect(userId: string): Promise<void> {
    try {
      await this.db.update(
        'github_connections',
        { user_id: userId },
        {
          is_active: false,
          updated_at: new Date().toISOString(),
        }
      );
    } catch (error) {
      this.logger.error(`Failed to disconnect: ${error.message}`);
    }
  }

  /**
   * Get valid access token (refreshes if needed)
   */
  private async getValidToken(userId: string): Promise<string> {
    const connection = await this.db.findOne<GitHubConnection>('github_connections', {
      user_id: userId,
      is_active: true,
    });

    if (!connection) {
      throw new HttpException('GitHub not connected', HttpStatus.UNAUTHORIZED);
    }

    // Get fresh token from installation
    const tokenData = await this.oauthService.getInstallationAccessToken(connection.installation_id);

    // Update token in database
    await this.db.update(
      'github_connections',
      { user_id: userId },
      {
        access_token: tokenData.token,
        updated_at: new Date().toISOString(),
      }
    );

    return tokenData.token;
  }

  /**
   * List user's repositories
   */
  async listRepositories(userId: string): Promise<GitHubRepoDto[]> {
    const token = await this.getValidToken(userId);

    const response = await fetch('https://api.github.com/installation/repositories', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      throw new HttpException('Failed to list repositories', HttpStatus.BAD_REQUEST);
    }

    const data = await response.json();

    return data.repositories.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      description: repo.description,
      isPrivate: repo.private,
      defaultBranch: repo.default_branch,
      htmlUrl: repo.html_url,
      cloneUrl: repo.clone_url,
    }));
  }

  /**
   * Create a new repository
   */
  async createRepository(
    userId: string,
    name: string,
    description?: string,
    isPrivate: boolean = true,
  ): Promise<GitHubRepoDto> {
    const token = await this.getValidToken(userId);

    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description: description || `Generated by Wants`,
        private: isPrivate,
        auto_init: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Failed to create repo: ${error}`);
      throw new HttpException('Failed to create repository', HttpStatus.BAD_REQUEST);
    }

    const repo = await response.json();

    return {
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      description: repo.description,
      isPrivate: repo.private,
      defaultBranch: repo.default_branch,
      htmlUrl: repo.html_url,
      cloneUrl: repo.clone_url,
    };
  }

  /**
   * Push app code to GitHub repository
   */
  async pushToGitHub(userId: string, dto: PushToGitHubDto): Promise<AppGitHubLinkDto> {
    const token = await this.getValidToken(userId);
    const connection = await this.db.findOne<GitHubConnection>('github_connections', {
      user_id: userId,
      is_active: true,
    });

    if (!connection) {
      throw new HttpException('GitHub not connected', HttpStatus.UNAUTHORIZED);
    }

    const appPath = path.join(this.appsBasePath, dto.appId);
    if (!(await fs.pathExists(appPath))) {
      throw new HttpException('App not found', HttpStatus.NOT_FOUND);
    }

    const repoOwner = dto.repoOwner || connection.github_login;
    const repoName = dto.repoName || dto.appId;
    const branch = dto.branch || 'main';

    // Check if repo exists, create if needed
    let repoExists = true;
    try {
      const checkResponse = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
          },
        }
      );
      repoExists = checkResponse.ok;
    } catch {
      repoExists = false;
    }

    if (!repoExists && dto.createIfNotExists !== false) {
      await this.createRepository(userId, repoName, `Generated by Wants - ${dto.appId}`);
      // Wait a bit for repo to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Get all files from the app
    const files = await this.getAllFiles(appPath);

    // Create a tree with all files
    const tree = await this.createGitTree(token, repoOwner, repoName, branch, files);

    // Create commit
    const commitMessage = dto.commitMessage || `Update from Wants - ${new Date().toISOString()}`;
    const commit = await this.createCommit(token, repoOwner, repoName, branch, tree, commitMessage);

    // Update or create app link
    const linkId = `${dto.appId}-${repoOwner}-${repoName}`;
    const now = new Date().toISOString();

    // Check if link exists
    const existingLink = await this.db.findOne<AppGitHubLink>('app_github_links', {
      app_id: dto.appId,
      user_id: userId,
    });

    let link: AppGitHubLink;

    if (existingLink) {
      const [updated] = await this.db.update<AppGitHubLink>(
        'app_github_links',
        { app_id: dto.appId, user_id: userId },
        {
          repo_owner: repoOwner,
          repo_name: repoName,
          repo_full_name: `${repoOwner}/${repoName}`,
          branch,
          last_pushed_at: now,
          last_commit_sha: commit.sha,
          updated_at: now,
        }
      );
      link = updated;
    } else {
      link = await this.db.insert<AppGitHubLink>('app_github_links', {
        id: linkId,
        app_id: dto.appId,
        user_id: userId,
        repo_owner: repoOwner,
        repo_name: repoName,
        repo_full_name: `${repoOwner}/${repoName}`,
        branch,
        last_pushed_at: now,
        last_pulled_at: null,
        last_commit_sha: commit.sha,
        auto_sync: true,
        created_at: now,
        updated_at: now,
      });
    }

    this.logger.log(`Pushed app ${dto.appId} to ${repoOwner}/${repoName}`);

    return this.transformLink(link);
  }

  /**
   * Pull code from GitHub repository to app
   */
  async pullFromGitHub(userId: string, dto: PullFromGitHubDto): Promise<AppGitHubLinkDto> {
    const token = await this.getValidToken(userId);
    const branch = dto.branch || 'main';

    const appPath = path.join(this.appsBasePath, dto.appId);

    // Get the tree from GitHub
    const treeResponse = await fetch(
      `https://api.github.com/repos/${dto.repoOwner}/${dto.repoName}/git/trees/${branch}?recursive=1`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (!treeResponse.ok) {
      throw new HttpException('Failed to get repository tree', HttpStatus.BAD_REQUEST);
    }

    const treeData = await treeResponse.json();

    // Download and write each file
    for (const item of treeData.tree) {
      if (item.type === 'blob') {
        // Skip node_modules and other unwanted files
        if (item.path.includes('node_modules/') || item.path.includes('.git/')) {
          continue;
        }

        const blobResponse = await fetch(
          `https://api.github.com/repos/${dto.repoOwner}/${dto.repoName}/git/blobs/${item.sha}`,
          {
            headers: {
              Accept: 'application/vnd.github+json',
              Authorization: `Bearer ${token}`,
              'X-GitHub-Api-Version': '2022-11-28',
            },
          }
        );

        if (blobResponse.ok) {
          const blob = await blobResponse.json();
          const content = Buffer.from(blob.content, 'base64').toString('utf-8');
          const filePath = path.join(appPath, item.path);

          await fs.ensureDir(path.dirname(filePath));
          await fs.writeFile(filePath, content);
        }
      }
    }

    // Get latest commit SHA
    const commitResponse = await fetch(
      `https://api.github.com/repos/${dto.repoOwner}/${dto.repoName}/commits/${branch}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    const commitData = await commitResponse.json();

    // Update app link
    const linkId = `${dto.appId}-${dto.repoOwner}-${dto.repoName}`;
    const now = new Date().toISOString();

    // Check if link exists
    const existingLink = await this.db.findOne<AppGitHubLink>('app_github_links', {
      app_id: dto.appId,
      user_id: userId,
    });

    let link: AppGitHubLink;

    if (existingLink) {
      const [updated] = await this.db.update<AppGitHubLink>(
        'app_github_links',
        { app_id: dto.appId, user_id: userId },
        {
          repo_owner: dto.repoOwner,
          repo_name: dto.repoName,
          repo_full_name: `${dto.repoOwner}/${dto.repoName}`,
          branch,
          last_pulled_at: now,
          last_commit_sha: commitData.sha,
          updated_at: now,
        }
      );
      link = updated;
    } else {
      link = await this.db.insert<AppGitHubLink>('app_github_links', {
        id: linkId,
        app_id: dto.appId,
        user_id: userId,
        repo_owner: dto.repoOwner,
        repo_name: dto.repoName,
        repo_full_name: `${dto.repoOwner}/${dto.repoName}`,
        branch,
        last_pushed_at: null,
        last_pulled_at: now,
        last_commit_sha: commitData.sha,
        auto_sync: true,
        created_at: now,
        updated_at: now,
      });
    }

    this.logger.log(`Pulled ${dto.repoOwner}/${dto.repoName} to app ${dto.appId}`);

    return this.transformLink(link);
  }

  /**
   * Get sync status for an app
   */
  async getSyncStatus(userId: string, appId: string): Promise<GitHubSyncStatusDto | null> {
    try {
      // Find link for this app
      const link = await this.db.findOne<AppGitHubLink>('app_github_links', {
        app_id: appId,
        user_id: userId,
      });

      const connection = await this.db.findOne<GitHubConnection>('github_connections', {
        user_id: userId,
        is_active: true,
      });

      return {
        appId,
        repoOwner: link?.repo_owner,
        repoName: link?.repo_name,
        branch: link?.branch,
        isConnected: !!connection,
        lastPushedAt: link?.last_pushed_at || undefined,
        lastPulledAt: link?.last_pulled_at || undefined,
        lastCommitSha: link?.last_commit_sha || undefined,
        hasLocalChanges: false, // Would need to track file changes
        hasRemoteChanges: false, // Would need to compare with GitHub
      };
    } catch (error) {
      this.logger.error(`Failed to get sync status: ${error.message}`);
      return null;
    }
  }

  /**
   * Get app's GitHub link
   */
  async getAppLink(userId: string, appId: string): Promise<AppGitHubLinkDto | null> {
    try {
      const link = await this.db.findOne<AppGitHubLink>('app_github_links', {
        app_id: appId,
        user_id: userId,
      });

      if (!link) {
        return null;
      }

      return this.transformLink(link);
    } catch (error) {
      this.logger.error(`Failed to get app link: ${error.message}`);
      return null;
    }
  }

  /**
   * Handle webhook push event
   */
  async handleWebhookPush(
    repoFullName: string,
    branch: string,
    commitSha: string,
    installationId: string,
  ): Promise<void> {
    try {
      // Find apps linked to this repo
      const result = await this.db.query<AppGitHubLink>(
        `SELECT * FROM app_github_links WHERE repo_full_name = $1 AND branch = $2 AND auto_sync = true`,
        [repoFullName, branch]
      );

      for (const link of result.rows) {
        this.logger.log(`Webhook: Detected push to ${repoFullName} for app ${link.app_id}`);

        try {
          await this.pullFromGitHub(link.user_id, {
            appId: link.app_id,
            repoOwner: link.repo_owner,
            repoName: link.repo_name,
            branch: link.branch,
          });
          this.logger.log(`Auto-synced app ${link.app_id} from GitHub`);
        } catch (error) {
          this.logger.error(`Failed to auto-sync app ${link.app_id}: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to handle webhook push: ${error.message}`);
    }
  }

  // ============ Private Helper Methods ============

  private async getAllFiles(dirPath: string, basePath: string = dirPath): Promise<{ path: string; content: string }[]> {
    const files: { path: string; content: string }[] = [];
    const skipDirs = ['node_modules', '.git', 'dist', 'build', '.wrangler', '.cache'];

    const items = await fs.readdir(dirPath);

    for (const item of items) {
      if (skipDirs.includes(item) || item.startsWith('.')) continue;

      const fullPath = path.join(dirPath, item);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        const subFiles = await this.getAllFiles(fullPath, basePath);
        files.push(...subFiles);
      } else {
        const relativePath = path.relative(basePath, fullPath);
        const content = await fs.readFile(fullPath, 'utf-8');
        files.push({ path: relativePath, content });
      }
    }

    return files;
  }

  private async createGitTree(
    token: string,
    owner: string,
    repo: string,
    branch: string,
    files: { path: string; content: string }[],
  ): Promise<string> {
    // Get current commit SHA
    const refResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    let baseTreeSha: string | undefined;
    if (refResponse.ok) {
      const ref = await refResponse.json();
      const commitResponse = await fetch(ref.object.url, {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      const commit = await commitResponse.json();
      baseTreeSha = commit.tree.sha;
    }

    // Create blobs for each file
    const treeItems = [];
    for (const file of files) {
      const blobResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/blobs`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: Buffer.from(file.content).toString('base64'),
            encoding: 'base64',
          }),
        }
      );

      if (blobResponse.ok) {
        const blob = await blobResponse.json();
        treeItems.push({
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: blob.sha,
        });
      }
    }

    // Create tree
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree: treeItems,
        }),
      }
    );

    const tree = await treeResponse.json();
    return tree.sha;
  }

  private async createCommit(
    token: string,
    owner: string,
    repo: string,
    branch: string,
    treeSha: string,
    message: string,
  ): Promise<{ sha: string }> {
    // Get parent commit
    const refResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    let parentSha: string | undefined;
    if (refResponse.ok) {
      const ref = await refResponse.json();
      parentSha = ref.object.sha;
    }

    // Create commit
    const commitResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/commits`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          tree: treeSha,
          parents: parentSha ? [parentSha] : [],
        }),
      }
    );

    const commit = await commitResponse.json();

    // Update reference
    const updateMethod = parentSha ? 'PATCH' : 'POST';
    const updateUrl = parentSha
      ? `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`
      : `https://api.github.com/repos/${owner}/${repo}/git/refs`;

    await fetch(updateUrl, {
      method: updateMethod,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        parentSha
          ? { sha: commit.sha, force: true }
          : { ref: `refs/heads/${branch}`, sha: commit.sha }
      ),
    });

    return { sha: commit.sha };
  }

  private transformConnection(conn: GitHubConnection): GitHubConnectionDto {
    return {
      id: conn.id,
      userId: conn.user_id,
      githubId: conn.github_id,
      githubLogin: conn.github_login,
      githubName: conn.github_name || undefined,
      githubEmail: conn.github_email || undefined,
      githubAvatar: conn.github_avatar || undefined,
      installationId: conn.installation_id,
      isActive: conn.is_active,
      lastSyncedAt: conn.last_synced_at || undefined,
      createdAt: conn.created_at,
    };
  }

  private transformLink(link: AppGitHubLink): AppGitHubLinkDto {
    return {
      id: link.id,
      appId: link.app_id,
      userId: link.user_id,
      repoOwner: link.repo_owner,
      repoName: link.repo_name,
      repoFullName: link.repo_full_name,
      branch: link.branch,
      lastPushedAt: link.last_pushed_at || undefined,
      lastPulledAt: link.last_pulled_at || undefined,
      lastCommitSha: link.last_commit_sha || undefined,
      autoSync: link.auto_sync,
      createdAt: link.created_at,
      updatedAt: link.updated_at,
    };
  }
}
