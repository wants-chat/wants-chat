import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

interface InstallationToken {
  token: string;
  expires_at: string;
}

@Injectable()
export class GitHubOAuthService {
  private readonly logger = new Logger(GitHubOAuthService.name);
  private readonly appId: string;
  private readonly appSlug: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly privateKey: string;
  private readonly redirectUri: string;
  private readonly frontendUrl: string;

  // Cache for installation tokens
  private tokenCache: Map<string, { token: string; expiresAt: Date }> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.appId = this.configService.get<string>('GITHUB_APP_ID', '');
    this.appSlug = this.configService.get<string>('GITHUB_APP_SLUG', 'wants-chat');
    this.clientId = this.configService.get<string>('GITHUB_APP_CLIENT_ID', '');
    this.clientSecret = this.configService.get<string>('GITHUB_APP_CLIENT_SECRET', '');
    this.privateKey = this.configService.get<string>('GITHUB_PRIVATE_KEY', '').replace(/\\n/g, '\n');
    this.redirectUri = this.configService.get<string>('GITHUB_APP_REDIRECT_URI', '')
      || `${this.configService.get('API_URL')}/api/v1/app-github/oauth/callback`;
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
  }

  /**
   * Check if GitHub integration is configured
   */
  isConfigured(): boolean {
    return !!(this.appId && this.clientId && this.clientSecret && this.privateKey);
  }

  /**
   * Generate a JWT for GitHub App authentication
   */
  private generateAppJWT(): string {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iat: now - 60, // Issued 60 seconds ago to account for clock drift
      exp: now + 600, // Expires in 10 minutes
      iss: this.appId,
    };

    return jwt.sign(payload, this.privateKey, { algorithm: 'RS256' });
  }

  /**
   * Get the GitHub App installation URL for users to install the app
   */
  getInstallationUrl(userId: string, returnUrl?: string): string {
    // Encode state with user info and return URL
    const state = Buffer.from(
      JSON.stringify({
        userId,
        returnUrl: returnUrl || `${this.frontendUrl}/chat`,
        timestamp: Date.now(),
      })
    ).toString('base64url');

    return `https://github.com/apps/${this.appSlug}/installations/new?state=${state}`;
  }

  /**
   * Parse and validate state from OAuth callback
   */
  parseState(state: string): { userId: string; returnUrl: string; timestamp: number } | null {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString());

      // Check if state is not too old (10 minute expiry)
      if (Date.now() - decoded.timestamp > 10 * 60 * 1000) {
        this.logger.warn('OAuth state expired');
        return null;
      }

      return decoded;
    } catch (error) {
      this.logger.error('Failed to parse OAuth state:', error);
      return null;
    }
  }

  /**
   * Get an access token for a GitHub App installation
   */
  async getInstallationAccessToken(installationId: string): Promise<InstallationToken> {
    // Check cache first
    const cached = this.tokenCache.get(installationId);
    if (cached && cached.expiresAt > new Date()) {
      return { token: cached.token, expires_at: cached.expiresAt.toISOString() };
    }

    const appJwt = this.generateAppJWT();

    const response = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${appJwt}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Failed to get installation token: ${error}`);
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache the token (expires 1 hour from GitHub, we cache for 55 minutes)
    const expiresAt = new Date(Date.now() + 55 * 60 * 1000);
    this.tokenCache.set(installationId, { token: data.token, expiresAt });

    return {
      token: data.token,
      expires_at: data.expires_at,
    };
  }

  /**
   * Get the authenticated user from an installation token
   */
  async getAuthenticatedUser(accessToken: string): Promise<GitHubUser> {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${accessToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get installation details
   */
  async getInstallation(installationId: string): Promise<any> {
    const appJwt = this.generateAppJWT();

    const response = await fetch(
      `https://api.github.com/app/installations/${installationId}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${appJwt}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get installation: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const webhookSecret = this.configService.get<string>('GITHUB_WEBHOOK_SECRET', '');
    if (!webhookSecret) {
      this.logger.warn('GITHUB_WEBHOOK_SECRET not configured');
      return false;
    }

    const crypto = require('crypto');
    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex')}`;

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Get frontend URL for redirects
   */
  getFrontendUrl(): string {
    return this.frontendUrl;
  }
}
