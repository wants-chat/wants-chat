import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import Fuse from 'fuse.js';
import { GenerationService } from './generation/generation.service';
import { DeploymentService } from './services/deployment.service';
import { AppsService } from '../apps/apps.service';

interface AppCatalogEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  industry?: string;
  keywords: string[];
  synonyms: string[];
  icon: string;
  complexity: 'simple' | 'moderate' | 'complex';
  hasAuth: boolean;
  hasPayment: boolean;
  multiTenant?: boolean;
  status: string;
}

interface AppBuilderCatalog {
  version: string;
  generatedAt: string;
  totalApps: number;
  categories: string[];
  industries: string[];
  apps: AppCatalogEntry[];
}

interface AppMatchResult {
  matched: boolean;
  appType?: AppCatalogEntry;
  confidence: number;
  alternates?: Array<{ appType: AppCatalogEntry; confidence: number }>;
}

interface GenerationResult {
  success: boolean;
  appId?: string;
  appName?: string;
  appType?: string;
  outputPath?: string;
  backendUrl?: string;
  frontendUrl?: string;
  mobileUrl?: string;
  // Flags indicating which code types were generated (regardless of deployment)
  hasBackendCode?: boolean;
  hasFrontendCode?: boolean;
  hasMobileCode?: boolean;
  readme?: string;
  error?: string;
  features?: string[];
  stats?: any;
}

@Injectable()
export class AppBuilderService {
  private readonly logger = new Logger(AppBuilderService.name);
  private catalog: AppBuilderCatalog | null = null;
  private fuse: Fuse<AppCatalogEntry> | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly generationService: GenerationService,
    private readonly deploymentService: DeploymentService,
    private readonly appsService: AppsService,
  ) {
    this.loadCatalog();
  }

  /**
   * Load the app catalog for fuzzy searching
   */
  private loadCatalog(): void {
    try {
      // Try to load from app-builder catalog (in project root)
      const catalogPath = path.resolve(__dirname, '../../../../app-builder/app-builder.catalog.json');

      if (fs.existsSync(catalogPath)) {
        const data = fs.readFileSync(catalogPath, 'utf-8');
        this.catalog = JSON.parse(data);

        // Initialize Fuse.js for fuzzy searching
        this.fuse = new Fuse(this.catalog.apps, {
          keys: [
            { name: 'name', weight: 0.3 },
            { name: 'description', weight: 0.2 },
            { name: 'keywords', weight: 0.25 },
            { name: 'synonyms', weight: 0.15 },
            { name: 'category', weight: 0.05 },
            { name: 'industry', weight: 0.05 },
          ],
          threshold: 0.4,
          includeScore: true,
          minMatchCharLength: 2,
        });

        this.logger.log(`Loaded app catalog with ${this.catalog.totalApps} app types`);
      } else {
        this.logger.warn(`App catalog not found at ${catalogPath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to load app catalog: ${error.message}`);
    }
  }

  /**
   * Match user's app description to an app type using fuzzy search
   */
  matchAppType(description: string): AppMatchResult {
    if (!this.fuse || !this.catalog) {
      return { matched: false, confidence: 0 };
    }

    const results = this.fuse.search(description);

    if (results.length === 0) {
      return { matched: false, confidence: 0 };
    }

    const topMatch = results[0];
    const confidence = 1 - (topMatch.score || 0);

    // Get alternates (next best matches)
    const alternates = results.slice(1, 4).map((r) => ({
      appType: r.item,
      confidence: 1 - (r.score || 0),
    }));

    this.logger.log(`Matched app type: ${topMatch.item.name} (confidence: ${(confidence * 100).toFixed(1)}%)`);

    return {
      matched: confidence >= 0.3,
      appType: topMatch.item,
      confidence,
      alternates,
    };
  }

  /**
   * Generate an app using the integrated GenerationService (no HTTP calls)
   * @param prompt - User's description of the app
   * @param appName - Optional app name
   * @param deploy - Whether to auto-deploy (default: true)
   * @param onProgress - Optional callback for deployment progress updates (keeps socket alive)
   * @param userId - Optional user ID to save app to user_apps table
   * @param conversationId - Optional conversation ID to link app to chat
   */
  async generateApp(
    prompt: string,
    appName?: string,
    deploy: boolean = true,
    onProgress?: (step: string, status: string, message?: string) => void,
    userId?: string,
    conversationId?: string,
  ): Promise<GenerationResult> {
    // Helper to safely call progress callback
    const progress = (step: string, status: string, message?: string) => {
      if (onProgress) {
        try {
          onProgress(step, status, message);
        } catch (e) {
          // Ignore callback errors
        }
      }
    };

    try {
      this.logger.log(`Generating app from prompt: ${prompt.substring(0, 50)}...`);
      progress('generation', 'running', 'Analyzing app requirements...');

      // First, try to match to an app type
      const match = this.matchAppType(prompt);

      if (match.matched && match.appType) {
        this.logger.log(`Matched to app type: ${match.appType.name} (${match.appType.id})`);
        progress('generation', 'running', `Detected app type: ${match.appType.name}`);
      }

      // Call the local GenerationService directly (no HTTP) with progress callback
      const genResult = await this.generationService.generate(
        {
          prompt,
          appName,
        },
        onProgress, // Pass the progress callback
      );

      if (!genResult.success) {
        throw new Error((genResult as any).error || 'Generation failed');
      }

      const generatedData = (genResult as any).data;
      progress('generation', 'completed', `Generated ${generatedData.appName} with ${generatedData.stats?.files || 0} files`);

      // Deploy if requested and configured
      let deployResult = null;
      if (deploy && this.deploymentService.isConfigured()) {
        this.logger.log('Auto-deploying generated app...');
        progress('deployment', 'started', 'Starting deployment to Cloudflare...');
        try {
          deployResult = await this.deploymentService.deploy(
            generatedData.outputPath,
            generatedData.appId,
            generatedData.appName, // Pass app name for unique subdomain
            onProgress, // Pass progress callback for detailed updates
          );
        } catch (deployError) {
          this.logger.warn(`Deployment failed: ${deployError.message}`);
          progress('deployment', 'failed', deployError.message);
          // Continue without deployment
        }
      }

      // Check which code types were generated (for enabling code viewer tabs)
      const hasBackendCode = fs.existsSync(path.join(generatedData.outputPath, 'backend', 'src'));
      const hasFrontendCode = fs.existsSync(path.join(generatedData.outputPath, 'frontend', 'src'));
      const hasMobileCode = fs.existsSync(path.join(generatedData.outputPath, 'mobile', 'src'));

      // Save app to user_apps table if userId is provided
      if (userId) {
        try {
          progress('saving', 'running', 'Saving app to your library...');
          await this.appsService.createApp(userId, {
            name: generatedData.appName,
            description: prompt.substring(0, 500),
            conversationId, // Link to the chat conversation
            appType: generatedData.appType, // Store app type directly (e.g., 'blog', 'ecommerce')
            outputPath: generatedData.outputPath, // Store output path for later operations
            frontendFramework: 'react',
            backendFramework: 'hono',
            mobileFramework: 'react-native',
            hasFrontend: hasFrontendCode,
            hasBackend: hasBackendCode,
            hasMobile: hasMobileCode,
            frontendUrl: deployResult?.frontendUrl, // Store directly in column
            backendUrl: deployResult?.backendUrl,   // Store directly in column
            status: deployResult?.frontendUrl ? 'deployed' : 'generated', // Set appropriate status
            generationPrompt: prompt,
            generationModel: 'app-builder',
            tags: generatedData.features || [],
            metadata: {
              appId: generatedData.appId,
              appType: generatedData.appType,
              outputPath: generatedData.outputPath,
              stats: generatedData.stats,
              frontendUrl: deployResult?.frontendUrl,
              backendUrl: deployResult?.backendUrl,
              mobileUrl: deployResult?.mobileUrl,
            },
          });
          this.logger.log(`Saved app to user_apps for user ${userId}`);
          progress('saving', 'completed', 'App saved to your library!');
        } catch (saveError) {
          this.logger.warn(`Failed to save app to user_apps: ${saveError.message}`);
          // Don't fail the generation, just log warning
        }
      }

      return {
        success: true,
        appId: generatedData.appId,
        appName: generatedData.appName,
        appType: generatedData.appType,
        outputPath: generatedData.outputPath,
        features: generatedData.features,
        stats: generatedData.stats,
        backendUrl: deployResult?.backendUrl,
        frontendUrl: deployResult?.frontendUrl,
        mobileUrl: deployResult?.mobileUrl,
        hasBackendCode,
        hasFrontendCode,
        hasMobileCode,
      };
    } catch (error) {
      this.logger.error(`App generation failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Analyze a prompt without generating (preview what would be created)
   */
  async analyzePrompt(prompt: string): Promise<any> {
    try {
      return await this.generationService.analyze({ prompt });
    } catch (error) {
      this.logger.error(`Analysis failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Detect app type from prompt (lightweight)
   */
  async detectAppType(prompt: string): Promise<any> {
    try {
      return await this.generationService.detect({ prompt });
    } catch (error) {
      this.logger.error(`Detection failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get README content for a generated app
   */
  async getAppReadme(appPath: string): Promise<string | null> {
    try {
      const readmePath = path.join(appPath, 'README.md');
      if (fs.existsSync(readmePath)) {
        return fs.readFileSync(readmePath, 'utf-8');
      }
      return null;
    } catch (error) {
      this.logger.error(`Failed to read README: ${error.message}`);
      return null;
    }
  }

  /**
   * Get catalog statistics
   */
  getCatalogStats(): { totalApps: number; categories: string[]; industries: string[] } | null {
    if (!this.catalog) {
      return null;
    }

    return {
      totalApps: this.catalog.totalApps,
      categories: this.catalog.categories,
      industries: this.catalog.industries,
    };
  }

  /**
   * Search the catalog for app types
   */
  searchCatalog(query: string, limit: number = 10): AppCatalogEntry[] {
    if (!this.fuse) {
      return [];
    }

    return this.fuse.search(query, { limit }).map((r) => r.item);
  }

  /**
   * Get app type by ID
   */
  getAppTypeById(id: string): AppCatalogEntry | undefined {
    return this.catalog?.apps.find((app) => app.id === id);
  }

  /**
   * Check if app-builder is available (always true for integrated version)
   */
  async isAvailable(): Promise<boolean> {
    // Always available since it's integrated
    return true;
  }

  /**
   * Check if deployment is configured
   */
  isDeploymentConfigured(): boolean {
    return this.deploymentService.isConfigured();
  }
}
