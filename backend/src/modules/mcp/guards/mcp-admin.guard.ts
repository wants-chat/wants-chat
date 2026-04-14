import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class McpAdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const email: string | undefined = req.user?.email;
    const role: string | undefined = req.user?.role;

    if (role === 'admin') return true;

    const raw = this.configService.get<string>('MCP_ADMIN_EMAILS') || '';
    const allowlist = raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (email && allowlist.includes(email.toLowerCase())) return true;

    throw new ForbiddenException('MCP admin access required');
  }
}
