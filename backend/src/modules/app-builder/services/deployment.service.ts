import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Run a command asynchronously with periodic progress updates.
 * This keeps the socket alive during long-running operations by emitting progress every few seconds.
 */
async function runCommandWithProgress(
  command: string,
  args: string[],
  options: { cwd: string; timeout?: number },
  onProgress?: (message: string) => void,
  progressInterval = 5000, // Emit progress every 5 seconds
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd: options.cwd,
      shell: true,
      env: { ...process.env },
    });

    let stdout = '';
    let stderr = '';
    let lastProgressTime = Date.now();
    let dots = 0;

    // Emit periodic progress to keep socket alive
    const progressTimer = setInterval(() => {
      if (onProgress) {
        dots = (dots + 1) % 4;
        const dotStr = '.'.repeat(dots + 1);
        onProgress(`Still working${dotStr}`);
      }
    }, progressInterval);

    // Timeout handler
    const timeoutMs = options.timeout || 180000;
    const timeoutTimer = setTimeout(() => {
      proc.kill('SIGTERM');
      clearInterval(progressTimer);
      reject(new Error(`Command timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);

    proc.stdout?.on('data', (data) => {
      stdout += data.toString();
      // Emit progress on significant output
      if (onProgress && Date.now() - lastProgressTime > 2000) {
        const lines = data.toString().trim().split('\n');
        const lastLine = lines[lines.length - 1].substring(0, 80);
        if (lastLine) {
          onProgress(lastLine);
          lastProgressTime = Date.now();
        }
      }
    });

    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      clearInterval(progressTimer);
      clearTimeout(timeoutTimer);
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(stderr || `Command exited with code ${code}`));
      }
    });

    proc.on('error', (err) => {
      clearInterval(progressTimer);
      clearTimeout(timeoutTimer);
      reject(err);
    });
  });
}

export interface DeploymentResult {
  success: boolean;
  appId: string;
  backendUrl?: string;
  frontendUrl?: string;
  mobileUrl?: string;
  buildOutput?: string;
  error?: string;
  steps: DeploymentStep[];
}

export interface DeploymentStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  message?: string;
  duration?: number;
}

export type ProgressCallback = (step: string, status: string, message?: string) => void;

@Injectable()
export class DeploymentService {
  private readonly logger = new Logger(DeploymentService.name);

  // Cloudflare credentials from environment
  private readonly cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN || '';
  private readonly cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';

  // Pre-built templates path (at backend root level)
  private readonly templatesPath = path.resolve(process.cwd(), 'templates');

  /**
   * Check if pre-built template exists
   */
  private hasPrebuiltTemplate(type: 'backend' | 'frontend' | 'mobile'): boolean {
    const templateNodeModules = path.join(this.templatesPath, type, 'node_modules');
    return fs.existsSync(templateNodeModules);
  }

  /**
   * Create symlink to template node_modules (instant, no copy needed)
   */
  private async symlinkFromTemplate(
    type: 'backend' | 'frontend' | 'mobile',
    targetPath: string,
    onProgress?: (message: string) => void,
  ): Promise<boolean> {
    const templateNodeModules = path.join(this.templatesPath, type, 'node_modules');
    const targetNodeModules = path.join(targetPath, 'node_modules');

    if (!fs.existsSync(templateNodeModules)) {
      return false;
    }

    try {
      // Remove existing node_modules if any
      if (fs.existsSync(targetNodeModules)) {
        fs.rmSync(targetNodeModules, { recursive: true, force: true });
      }

      // Create symlink to template (instant!)
      fs.symlinkSync(templateNodeModules, targetNodeModules, 'dir');

      if (onProgress) {
        onProgress(`${type} dependencies linked (instant)`);
      }
      this.logger.log(`Symlinked ${type} node_modules from template`);
      return true;
    } catch (error: any) {
      this.logger.warn(`Symlink failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Install dependencies - symlink from template (instant) or npm install (slow)
   */
  private async installDependencies(
    type: 'backend' | 'frontend' | 'mobile',
    targetPath: string,
    onProgress?: (message: string) => void,
  ): Promise<void> {
    // Try symlink first (INSTANT)
    if (this.hasPrebuiltTemplate(type)) {
      const linked = await this.symlinkFromTemplate(type, targetPath, onProgress);
      if (linked) {
        return;
      }
    }

    // Fall back to npm install (SLOW)
    if (onProgress) {
      onProgress(`Installing ${type} dependencies...`);
    }
    await runCommandWithProgress(
      'npm',
      ['install', '--legacy-peer-deps'],
      { cwd: targetPath, timeout: 180000 },
      onProgress,
    );
  }

  /**
   * Deploy a generated app to Cloudflare Workers
   * @param appPath - Path to the generated app
   * @param appId - Unique app ID
   * @param appName - App name for subdomain (e.g., "PersonalHub" -> "personalhub")
   * @param onProgress - Optional callback for progress updates (keeps socket alive)
   */
  async deploy(
    appPath: string,
    appId: string,
    appName?: string,
    onProgress?: ProgressCallback,
  ): Promise<DeploymentResult> {
    const steps: DeploymentStep[] = [];
    const startTime = Date.now();

    // Helper to report progress
    const progress = (step: string, status: string, message?: string) => {
      this.logger.log(`[${step}] ${status}${message ? ': ' + message : ''}`);
      if (onProgress) {
        try {
          onProgress(step, status, message);
        } catch (e) {
          // Ignore callback errors
        }
      }
    };

    const absolutePath = path.resolve(appPath);
    const backendPath = path.join(absolutePath, 'backend');
    const frontendPath = path.join(absolutePath, 'frontend');
    const mobilePath = path.join(absolutePath, 'mobile');

    // Generate unique subdomain: appname-shortid (e.g., timetracker-a3f7b2)
    const cleanAppName = (appName || 'app')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15) || 'app';
    // Use first 6 chars of UUID for uniqueness
    const shortId = appId.replace(/-/g, '').substring(0, 6);
    const subdomainBase = `${cleanAppName}-${shortId}`;

    this.logger.log(`Starting deployment for app: ${appId}`);
    this.logger.log(`App path: ${absolutePath}`);
    this.logger.log(`Subdomain: ${subdomainBase} (unique per request)`);

    progress('init', 'started', `Deploying ${appName || appId}`);

    // Validate paths exist
    if (!fs.existsSync(absolutePath)) {
      return {
        success: false,
        appId,
        error: `App path does not exist: ${absolutePath}`,
        steps,
      };
    }

    let backendUrl: string | undefined;
    let frontendUrl: string | undefined;

    // Step 1: Install backend dependencies (uses pre-built template if available)
    if (fs.existsSync(backendPath)) {
      steps.push({ name: 'install-backend-deps', status: 'running' });
      progress('backend-deps', 'running', 'Setting up backend dependencies...');
      try {
        await this.installDependencies(
          'backend',
          backendPath,
          (msg) => progress('backend-deps', 'running', msg),
        );
        steps[steps.length - 1].status = 'completed';
        steps[steps.length - 1].duration = Date.now() - startTime;
        progress('backend-deps', 'completed', 'Backend dependencies ready');
      } catch (error: any) {
        steps[steps.length - 1].status = 'failed';
        steps[steps.length - 1].message = error.message;
        progress('backend-deps', 'failed', error.message);
      }
    } else {
      steps.push({ name: 'install-backend-deps', status: 'skipped', message: 'No backend folder' });
    }

    // Step 2: Deploy backend to Cloudflare Workers
    if (fs.existsSync(path.join(backendPath, 'wrangler.toml')) && steps[steps.length - 1]?.status !== 'failed') {
      steps.push({ name: 'deploy-backend', status: 'running' });
      progress('backend-deploy', 'running', 'Deploying backend to Cloudflare Workers...');
      try {
        // Update wrangler.toml with correct subdomain
        const wranglerPath = path.join(backendPath, 'wrangler.toml');
        let wranglerContent = fs.readFileSync(wranglerPath, 'utf-8');
        // Update name to use subdomainBase-api
        wranglerContent = wranglerContent.replace(/name\s*=\s*"[^"]*"/, `name = "${subdomainBase}-api"`);
        fs.writeFileSync(wranglerPath, wranglerContent);

        // Set CF env vars for the child process
        const cfEnv = {
          ...process.env,
          CLOUDFLARE_API_TOKEN: this.cloudflareApiToken,
          CLOUDFLARE_ACCOUNT_ID: this.cloudflareAccountId,
        };
        const originalEnv = process.env;
        Object.assign(process.env, cfEnv);

        const { stdout: output } = await runCommandWithProgress(
          'npm',
          ['run', 'deploy'],
          { cwd: backendPath, timeout: 180000 },
          (msg) => progress('backend-deploy', 'running', msg),
        );

        // Restore env
        process.env = originalEnv;

        // Extract URL from output
        const urlMatch = output.match(/https:\/\/[\w-]+\.fluxez\.workers\.dev/);
        if (urlMatch) {
          backendUrl = urlMatch[0];
        } else {
          // Construct expected URL
          backendUrl = `https://${subdomainBase}-api.fluxez.workers.dev`;
        }
        progress('backend-deploy', 'completed', `Backend deployed: ${backendUrl}`);

        steps[steps.length - 1].status = 'completed';
        steps[steps.length - 1].message = backendUrl || 'Deployed';
      } catch (error: any) {
        steps[steps.length - 1].status = 'failed';
        steps[steps.length - 1].message = error.message?.slice(0, 200) || error.message;
        progress('backend-deploy', 'failed', error.message);
      }
    } else {
      steps.push({ name: 'deploy-backend', status: 'skipped', message: 'No wrangler.toml or previous step failed' });
    }

    // Step 3: Install frontend dependencies (uses pre-built template if available)
    if (fs.existsSync(frontendPath)) {
      steps.push({ name: 'install-frontend-deps', status: 'running' });
      progress('frontend-deps', 'running', 'Setting up frontend dependencies...');
      try {
        await this.installDependencies(
          'frontend',
          frontendPath,
          (msg) => progress('frontend-deps', 'running', msg),
        );

        steps[steps.length - 1].status = 'completed';
        progress('frontend-deps', 'completed', 'Frontend dependencies ready');
      } catch (error: any) {
        steps[steps.length - 1].status = 'failed';
        steps[steps.length - 1].message = error.message;
        progress('frontend-deps', 'failed', error.message);
      }
    } else {
      steps.push({ name: 'install-frontend-deps', status: 'skipped', message: 'No frontend folder' });
    }

    // Step 4: Build frontend
    if (fs.existsSync(frontendPath) && steps[steps.length - 1]?.status !== 'failed') {
      steps.push({ name: 'build-frontend', status: 'running' });
      progress('frontend-build', 'running', 'Building frontend...');
      try {
        // Update .env.production with correct API URL before building
        // The API URL uses the same subdomain pattern: {appname}-{shortid}-api
        // Backend routes are mounted at /api, so include that suffix
        const envProdPath = path.join(frontendPath, '.env.production');
        if (fs.existsSync(envProdPath)) {
          let envContent = fs.readFileSync(envProdPath, 'utf-8');
          const correctApiUrl = `https://${subdomainBase}-api.fluxez.workers.dev/api`;
          // Replace the VITE_API_URL line with correct URL
          envContent = envContent.replace(
            /VITE_API_URL=.*/,
            `VITE_API_URL=${correctApiUrl}`,
          );
          fs.writeFileSync(envProdPath, envContent);
          progress('frontend-build', 'running', `Updated API URL to ${correctApiUrl}`);
        }

        await runCommandWithProgress(
          'npm',
          ['run', 'build'],
          { cwd: frontendPath, timeout: 180000 },
          (msg) => progress('frontend-build', 'running', msg),
        );
        steps[steps.length - 1].status = 'completed';
        progress('frontend-build', 'completed', 'Frontend built successfully');
      } catch (error: any) {
        // Try with vite directly
        try {
          progress('frontend-build', 'running', 'Retrying with vite directly...');
          await runCommandWithProgress(
            'npx',
            ['vite', 'build'],
            { cwd: frontendPath, timeout: 180000 },
            (msg) => progress('frontend-build', 'running', msg),
          );
          steps[steps.length - 1].status = 'completed';
          progress('frontend-build', 'completed', 'Frontend built with vite');
        } catch (viteError: any) {
          steps[steps.length - 1].status = 'failed';
          steps[steps.length - 1].message = viteError.message;
          progress('frontend-build', 'failed', viteError.message);
        }
      }
    } else {
      steps.push({ name: 'build-frontend', status: 'skipped', message: 'No frontend or previous step failed' });
    }

    // Step 5: Deploy frontend to Cloudflare Workers (as static site)
    if (
      fs.existsSync(path.join(frontendPath, 'dist')) &&
      steps[steps.length - 1]?.status !== 'failed' &&
      this.cloudflareApiToken
    ) {
      steps.push({ name: 'deploy-frontend', status: 'running' });
      progress('frontend-deploy', 'running', 'Deploying frontend to Cloudflare Workers...');
      try {
        const workerName = subdomainBase;

        // Create wrangler.toml for Workers Sites deployment
        const frontendWranglerPath = path.join(frontendPath, 'wrangler.toml');
        const frontendWranglerContent = `name = "${workerName}"
main = "./worker.js"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[site]
bucket = "./dist"
`;
        fs.writeFileSync(frontendWranglerPath, frontendWranglerContent);

        // Create worker.js using __STATIC_CONTENT_MANIFEST for Workers Sites
        // The manifest maps file paths to their hashed keys in KV
        const workerScript = `// Worker Sites handler using manifest for correct KV keys
import manifestJSON from '__STATIC_CONTENT_MANIFEST';
const manifest = JSON.parse(manifestJSON);

const contentTypes = {
  'html': 'text/html; charset=utf-8',
  'css': 'text/css; charset=utf-8',
  'js': 'application/javascript; charset=utf-8',
  'json': 'application/json; charset=utf-8',
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'svg': 'image/svg+xml',
  'ico': 'image/x-icon',
  'woff': 'font/woff',
  'woff2': 'font/woff2',
  'ttf': 'font/ttf',
  'webp': 'image/webp',
};

function getContentType(path) {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return contentTypes[ext] || 'application/octet-stream';
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // Handle root
    if (pathname === '/') {
      pathname = '/index.html';
    }

    // Remove leading slash for manifest lookup
    let key = pathname.slice(1);

    // Try to get the hashed key from manifest
    let hashedKey = manifest[key];

    // If not found and it's not a file path (no extension), try index.html (SPA routing)
    if (!hashedKey && !key.includes('.')) {
      key = 'index.html';
      hashedKey = manifest[key];
    }

    if (!hashedKey) {
      // Final fallback to index.html for SPA
      hashedKey = manifest['index.html'];
      key = 'index.html';
    }

    if (!hashedKey) {
      return new Response('Not Found', { status: 404 });
    }

    try {
      const asset = await env.__STATIC_CONTENT.get(hashedKey, { type: 'arrayBuffer' });

      if (!asset) {
        return new Response('Not Found', { status: 404 });
      }

      return new Response(asset, {
        headers: {
          'Content-Type': getContentType(key),
          'Cache-Control': key.endsWith('.html') ? 'no-cache' : 'public, max-age=31536000, immutable',
          'X-Frame-Options': 'ALLOWALL',
          'Content-Security-Policy': 'frame-ancestors *',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (e) {
      return new Response('Error: ' + e.message, { status: 500 });
    }
  },
};
`;
        fs.writeFileSync(path.join(frontendPath, 'worker.js'), workerScript);

        // Deploy to Workers
        // Set CF env vars for the child process
        const cfEnvFrontend = {
          ...process.env,
          CLOUDFLARE_API_TOKEN: this.cloudflareApiToken,
          CLOUDFLARE_ACCOUNT_ID: this.cloudflareAccountId,
        };
        const originalEnvFrontend = process.env;
        Object.assign(process.env, cfEnvFrontend);

        const { stdout: output } = await runCommandWithProgress(
          'npx',
          ['wrangler', 'deploy'],
          { cwd: frontendPath, timeout: 180000 },
          (msg) => progress('frontend-deploy', 'running', msg),
        );

        // Restore env
        process.env = originalEnvFrontend;

        // Extract URL from output
        const urlMatch = output.match(/https:\/\/[\w-]+\.fluxez\.workers\.dev/);
        if (urlMatch) {
          frontendUrl = urlMatch[0];
        } else {
          frontendUrl = `https://${workerName}.fluxez.workers.dev`;
        }
        progress('frontend-deploy', 'completed', `Frontend deployed: ${frontendUrl}`);

        steps[steps.length - 1].status = 'completed';
        steps[steps.length - 1].message = frontendUrl || 'Deployed';
      } catch (error: any) {
        steps[steps.length - 1].status = 'failed';
        const errorMsg = error.message?.slice(0, 200) || error.message;
        steps[steps.length - 1].message = errorMsg;
        progress('frontend-deploy', 'failed', errorMsg);
      }
    } else {
      steps.push({
        name: 'deploy-frontend',
        status: 'skipped',
        message: !this.cloudflareApiToken
          ? 'No Cloudflare API token'
          : !fs.existsSync(path.join(frontendPath, 'dist'))
            ? 'No dist folder'
            : 'Previous step failed',
      });
    }

    // Step 6: Deploy mobile (if exists) - build Expo web version for now
    let mobileUrl: string | undefined;
    if (fs.existsSync(mobilePath) && this.cloudflareApiToken) {
      steps.push({ name: 'deploy-mobile', status: 'running' });
      progress('mobile-deploy', 'running', 'Setting up mobile dependencies...');
      try {
        // Install dependencies (uses pre-built template if available)
        await this.installDependencies(
          'mobile',
          mobilePath,
          (msg) => progress('mobile-deploy', 'running', msg),
        );
        progress('mobile-deploy', 'running', 'Mobile dependencies ready, building...');

        // Build for web using Expo
        await runCommandWithProgress(
          'npx',
          ['expo', 'export', '--platform', 'web'],
          { cwd: mobilePath, timeout: 180000 },
          (msg) => progress('mobile-deploy', 'running', msg),
        );

        // The export creates a 'dist' folder
        const mobileDistPath = path.join(mobilePath, 'dist');
        if (fs.existsSync(mobileDistPath)) {
          const mobileWorkerName = `${subdomainBase}-app`;

          // Create wrangler.toml for mobile site
          const mobileWranglerContent = `name = "${mobileWorkerName}"
main = "./worker.js"
compatibility_date = "2024-01-01"

[site]
bucket = "./dist"
`;
          fs.writeFileSync(path.join(mobilePath, 'wrangler.toml'), mobileWranglerContent);

          // Copy the same worker.js
          const workerScript = `import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

export default {
  async fetch(request, env, ctx) {
    try {
      return await getAssetFromKV(
        { request, waitUntil: ctx.waitUntil.bind(ctx) },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
        }
      );
    } catch (e) {
      const url = new URL(request.url);
      if (!url.pathname.includes('.')) {
        try {
          const indexRequest = new Request(new URL('/index.html', request.url), request);
          return await getAssetFromKV(
            { request: indexRequest, waitUntil: ctx.waitUntil.bind(ctx) },
            {
              ASSET_NAMESPACE: env.__STATIC_CONTENT,
              ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
            }
          );
        } catch (e2) {
          return new Response('Not Found', { status: 404 });
        }
      }
      return new Response('Not Found', { status: 404 });
    }
  },
};
`;
          fs.writeFileSync(path.join(mobilePath, 'worker.js'), workerScript);

          // Install kv-asset-handler
          try {
            progress('mobile-deploy', 'running', 'Installing mobile deploy dependencies...');
            await runCommandWithProgress(
              'npm',
              ['install', '--save-dev', '@cloudflare/kv-asset-handler', 'wrangler'],
              { cwd: mobilePath, timeout: 60000 },
            );
          } catch {
            // May already exist
          }

          // Deploy
          // Set CF env vars for the child process
          const cfEnvMobile = {
            ...process.env,
            CLOUDFLARE_API_TOKEN: this.cloudflareApiToken,
            CLOUDFLARE_ACCOUNT_ID: this.cloudflareAccountId,
          };
          const originalEnvMobile = process.env;
          Object.assign(process.env, cfEnvMobile);

          progress('mobile-deploy', 'running', 'Deploying mobile to Cloudflare...');
          const { stdout: mobileOutput } = await runCommandWithProgress(
            'npx',
            ['wrangler', 'deploy'],
            { cwd: mobilePath, timeout: 180000 },
            (msg) => progress('mobile-deploy', 'running', msg),
          );

          // Restore env
          process.env = originalEnvMobile;

          const urlMatch = mobileOutput.match(/https:\/\/[\w-]+\.fluxez\.workers\.dev/);
          mobileUrl = urlMatch ? urlMatch[0] : `https://${mobileWorkerName}.fluxez.workers.dev`;
          progress('mobile-deploy', 'completed', `Mobile deployed: ${mobileUrl}`);
          steps[steps.length - 1].status = 'completed';
          steps[steps.length - 1].message = mobileUrl;
        } else {
          steps[steps.length - 1].status = 'skipped';
          steps[steps.length - 1].message = 'No dist folder after build';
        }
      } catch (error: any) {
        steps[steps.length - 1].status = 'failed';
        const errorMsg = error.message?.slice(0, 200) || error.message;
        steps[steps.length - 1].message = errorMsg;
        progress('mobile-deploy', 'failed', errorMsg);
      }
    }

    const totalTime = Date.now() - startTime;
    const allCompleted = steps.every((s) => s.status === 'completed' || s.status === 'skipped');

    this.logger.log('');
    this.logger.log('═══════════════════════════════════════════════════════════════');
    this.logger.log(allCompleted ? '✅ DEPLOYMENT COMPLETED!' : '⚠️ DEPLOYMENT COMPLETED WITH ISSUES');
    this.logger.log('═══════════════════════════════════════════════════════════════');
    this.logger.log(`📦 App ID:        ${appId}`);
    this.logger.log(`📛 App Name:      ${appName || appId}`);
    if (backendUrl) this.logger.log(`🔧 Backend URL:   ${backendUrl}`);
    if (frontendUrl) this.logger.log(`🌐 Frontend URL:  ${frontendUrl}`);
    if (mobileUrl) this.logger.log(`📱 Mobile URL:    ${mobileUrl}`);
    this.logger.log(`⏱️  Total time:    ${(totalTime / 1000).toFixed(2)}s`);
    this.logger.log('═══════════════════════════════════════════════════════════════');

    progress('complete', 'completed', `Deployment finished in ${(totalTime / 1000).toFixed(2)}s`);

    return {
      success: allCompleted,
      appId,
      backendUrl,
      frontendUrl,
      mobileUrl,
      steps,
    };
  }

  /**
   * Build app without deploying (for testing)
   */
  async build(appPath: string): Promise<{ success: boolean; errors: string[] }> {
    const absolutePath = path.resolve(appPath);
    const backendPath = path.join(absolutePath, 'backend');
    const frontendPath = path.join(absolutePath, 'frontend');
    const errors: string[] = [];

    // Build backend
    if (fs.existsSync(backendPath)) {
      try {
        this.logger.log('Building backend (using template if available)...');
        await this.installDependencies('backend', backendPath);
        await runCommandWithProgress('npm', ['run', 'build'], { cwd: backendPath, timeout: 180000 });
        this.logger.log('Backend build successful');
      } catch (error: any) {
        errors.push(`Backend build failed: ${error.message}`);
        this.logger.error(`Backend build failed: ${error.message}`);
      }
    }

    // Build frontend
    if (fs.existsSync(frontendPath)) {
      try {
        this.logger.log('Building frontend (using template if available)...');
        await this.installDependencies('frontend', frontendPath);
        await runCommandWithProgress('npm', ['run', 'build'], { cwd: frontendPath, timeout: 180000 });
        this.logger.log('Frontend build successful');
      } catch (error: any) {
        errors.push(`Frontend build failed: ${error.message}`);
        this.logger.error(`Frontend build failed: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if Cloudflare credentials are configured
   */
  isConfigured(): boolean {
    return !!(this.cloudflareApiToken && this.cloudflareAccountId);
  }

  /**
   * Get deployment status for an app
   */
  async getStatus(appId: string): Promise<{
    backendStatus: 'unknown' | 'healthy' | 'unhealthy';
    frontendStatus: 'unknown' | 'healthy' | 'unhealthy';
    backendUrl?: string;
    frontendUrl?: string;
  }> {
    // This would check the Cloudflare API for deployment status
    // For now, return unknown
    return {
      backendStatus: 'unknown',
      frontendStatus: 'unknown',
    };
  }
}
