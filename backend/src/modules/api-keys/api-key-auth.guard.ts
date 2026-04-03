import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Inject,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeysService } from './api-keys.service';

// Decorator to specify required scopes
export const API_KEY_SCOPES_KEY = 'api_key_scopes';
export const RequireScopes = (...scopes: string[]) =>
  SetMetadata(API_KEY_SCOPES_KEY, scopes);

// Decorator to allow both JWT and API key auth
export const ALLOW_BOTH_AUTH_KEY = 'allow_both_auth';
export const AllowBothAuth = () => SetMetadata(ALLOW_BOTH_AUTH_KEY, true);

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(
    private readonly apiKeysService: ApiKeysService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Get API key from header
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('Missing API key. Use x-api-key header.');
    }

    // Validate the API key
    const validation = await this.apiKeysService.validateApiKey(apiKey);

    if (!validation.valid) {
      throw new UnauthorizedException(validation.error || 'Invalid API key');
    }

    // Check rate limit
    const rateLimit = await this.apiKeysService.checkRateLimit(validation.keyId!);

    // Add rate limit headers
    response.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.setHeader('X-RateLimit-Reset', rateLimit.reset_at.toISOString());

    if (!rateLimit.allowed) {
      throw new ForbiddenException('Rate limit exceeded. Try again later.');
    }

    // Check required scopes
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(
      API_KEY_SCOPES_KEY,
      [context.getHandler(), context.getClass()],
    ) || [];

    if (requiredScopes.length > 0) {
      const hasAllScopes = requiredScopes.every(scope =>
        this.apiKeysService.hasScope(validation.scopes!, scope),
      );

      if (!hasAllScopes) {
        throw new ForbiddenException(
          `Insufficient permissions. Required scopes: ${requiredScopes.join(', ')}`,
        );
      }
    }

    // Attach user info to request (similar to JWT auth)
    request.user = {
      sub: validation.userId,
      apiKeyId: validation.keyId,
      scopes: validation.scopes,
      authType: 'api_key',
    };

    // Store for logging
    request.apiKeyId = validation.keyId;

    return true;
  }

  private extractApiKey(request: any): string | null {
    // Check x-api-key header (preferred)
    const headerKey = request.headers['x-api-key'];
    if (headerKey) return headerKey;

    // Check Authorization header with ApiKey scheme
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('ApiKey ')) {
      return authHeader.substring(7);
    }

    // Check query parameter (for webhooks, not recommended for security)
    const queryKey = request.query?.api_key;
    if (queryKey) return queryKey;

    return null;
  }
}

/**
 * Hybrid guard that accepts either JWT or API key
 */
@Injectable()
export class HybridAuthGuard implements CanActivate {
  constructor(
    private readonly apiKeysService: ApiKeysService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Check if already authenticated via JWT
    if (request.user && request.user.sub) {
      return true;
    }

    // Try API key auth
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException(
        'Authentication required. Use Bearer token or x-api-key header.',
      );
    }

    // Validate the API key
    const validation = await this.apiKeysService.validateApiKey(apiKey);

    if (!validation.valid) {
      throw new UnauthorizedException(validation.error || 'Invalid API key');
    }

    // Check rate limit
    const rateLimit = await this.apiKeysService.checkRateLimit(validation.keyId!);

    response.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.setHeader('X-RateLimit-Reset', rateLimit.reset_at.toISOString());

    if (!rateLimit.allowed) {
      throw new ForbiddenException('Rate limit exceeded. Try again later.');
    }

    // Attach user info
    request.user = {
      sub: validation.userId,
      apiKeyId: validation.keyId,
      scopes: validation.scopes,
      authType: 'api_key',
    };

    request.apiKeyId = validation.keyId;

    return true;
  }

  private extractApiKey(request: any): string | null {
    const headerKey = request.headers['x-api-key'];
    if (headerKey) return headerKey;

    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('ApiKey ')) {
      return authHeader.substring(7);
    }

    return null;
  }
}
