import {
  Controller,
  Get,
  Param,
  Res,
  Req,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import * as path from 'path';
import * as fs from 'fs';

/**
 * App Preview Controller
 * Serves generated app frontends for iframe preview
 *
 * This allows the AppPreviewPanel to display generated apps
 * without requiring Cloudflare deployment.
 */
@Controller('preview')
export class AppPreviewController {
  private readonly logger = new Logger(AppPreviewController.name);
  private readonly outputBaseDir: string;

  constructor(private readonly configService: ConfigService) {
    this.outputBaseDir = this.configService.get<string>(
      'APP_CREATOR_OUTPUT_DIR',
      path.join(process.cwd(), 'generated', 'app-creator'),
    );
    this.logger.log(`Preview serving from: ${this.outputBaseDir}`);
  }

  /**
   * Serve preview files for a generated app
   * Handles: /preview/:appId/*
   */
  @Get(':appId')
  @Get(':appId/*')
  async servePreview(
    @Param('appId') appId: string,
    @Param() params: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Get the file path from the URL (everything after /preview/:appId/)
    const urlPath = req.path.replace(`/preview/${appId}`, '') || '/';
    let filePath = urlPath === '/' ? '/index.html' : urlPath;

    // Build the full path to the file in frontend/dist
    const distPath = path.join(this.outputBaseDir, appId, 'frontend', 'dist');
    let fullPath = path.join(distPath, filePath);

    // Security: Prevent directory traversal
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(distPath)) {
      this.logger.warn(`Directory traversal attempt blocked: ${filePath}`);
      throw new NotFoundException('File not found');
    }

    // Check if dist folder exists
    if (!fs.existsSync(distPath)) {
      this.logger.warn(`Preview dist folder not found for app ${appId}`);
      throw new NotFoundException(`App preview not available. App may not be built yet.`);
    }

    // If file doesn't exist, try index.html (SPA routing)
    if (!fs.existsSync(fullPath)) {
      // For SPA routing, serve index.html for non-asset paths
      if (!filePath.includes('.')) {
        fullPath = path.join(distPath, 'index.html');
      }

      if (!fs.existsSync(fullPath)) {
        this.logger.warn(`Preview file not found: ${filePath} for app ${appId}`);
        throw new NotFoundException('File not found');
      }
    }

    // Get file extension for content type
    const ext = path.extname(fullPath).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject',
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';

    // Set headers for iframe embedding
    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Allow iframe from same origin
    res.removeHeader('X-Frame-Options'); // Actually remove to allow any origin for preview
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // For HTML files, we need to inject the base URL so assets load correctly
    if (ext === '.html') {
      let content = fs.readFileSync(fullPath, 'utf-8');

      // Inject base tag for correct asset resolution
      const baseUrl = `/preview/${appId}/`;
      if (!content.includes('<base')) {
        content = content.replace(
          '<head>',
          `<head><base href="${baseUrl}">`
        );
      }

      res.send(content);
    } else {
      // Stream other files directly
      res.sendFile(fullPath);
    }
  }

  /**
   * Get preview URL for an app
   */
  static getPreviewUrl(appId: string, baseUrl: string): string {
    // Remove trailing slash from baseUrl if present
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    return `${cleanBaseUrl}/preview/${appId}`;
  }
}
