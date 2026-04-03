import { Injectable, Logger, Optional } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { AppTypeDetectorService } from '../services/app-type-detector.service';
import { QdrantAppTypeDetectorService } from '../services/qdrant-app-type-detector.service';
import { FeatureExtractorService } from '../services/feature-extractor.service';
import { SchemaDeriverService } from '../services/schema-deriver.service';
import { AICustomizationService } from '../services/ai-customization.service';
import { ReactRendererService } from '../services/react-renderer.service';
import { ReactNativeRendererService } from '../services/react-native-renderer.service';
import { HonoRendererService, GeneratedKeys } from '../services/hono-renderer.service';
import { PlatformService } from '../services/platform.service';
import { DataSeederService } from '../services/data-seeder.service';
import { COMPONENTS_BY_ID, ALL_COMPONENTS } from '../registries/components/index';
import { GenerateDto, AnalyzeDto, DetectDto } from './dto/generate.dto';
import { AppsService } from '../../apps/apps.service';

@Injectable()
export class GenerationService {
  private readonly logger = new Logger(GenerationService.name);
  private keywordDetector: AppTypeDetectorService;
  private featureExtractor: FeatureExtractorService;
  private schemaDeriver: SchemaDeriverService;
  private aiCustomization: AICustomizationService;
  private reactRenderer: ReactRendererService;
  private reactNativeRenderer: ReactNativeRendererService;
  private honoRenderer: HonoRendererService;
  private platformService: PlatformService;
  private dataSeeder: DataSeederService;

  constructor(
    @Optional() private qdrantDetector?: QdrantAppTypeDetectorService,
    @Optional() private appsService?: AppsService,
  ) {
    this.keywordDetector = new AppTypeDetectorService(); // Fallback for English
    this.featureExtractor = new FeatureExtractorService();

    // Create component registry for schema deriver
    const componentRegistry = {
      components: COMPONENTS_BY_ID,
      byCategory: new Map(),
      bySection: new Map(),
      byFeature: new Map(),
    };
    this.schemaDeriver = new SchemaDeriverService(componentRegistry);
    this.aiCustomization = new AICustomizationService();
    this.reactRenderer = new ReactRendererService();
    this.reactNativeRenderer = new ReactNativeRendererService();
    this.honoRenderer = new HonoRendererService();
    this.platformService = new PlatformService();
    this.dataSeeder = new DataSeederService(this.platformService);

    if (this.qdrantDetector) {
      this.logger.log('✅ Qdrant App Type Detector enabled - semantic matching for any language');
    } else {
      this.logger.warn('Qdrant Detector not available - falling back to keyword matching (English only)');
    }
  }

  /**
   * Internal method to detect app type
   *
   * Priority:
   * 1. Qdrant (semantic matching, any language, 1 embedding API call)
   * 2. Keyword (free, English only, local matching)
   */
  private async detectAppType(prompt: string) {
    // Use Qdrant detector if available (semantic + multi-language support)
    // Only costs 1 embedding API call per detection
    if (this.qdrantDetector && this.qdrantDetector.isInitialized()) {
      try {
        this.logger.debug('Using Qdrant for app type detection (1 embedding call)');
        return await this.qdrantDetector.detect(prompt);
      } catch (error) {
        this.logger.warn('Qdrant detection failed, falling back to keyword matching:', error.message);
      }
    }

    // Fallback to keyword-based detection (free, English only)
    this.logger.debug('Using keyword-based detection (free, English only)');
    return await this.keywordDetector.detect(prompt);
  }

  /**
   * Detect app type from prompt
   */
  async detect(dto: DetectDto) {
    const result = await this.detectAppType(dto.prompt);

    if (!result.appType) {
      return {
        success: false,
        error: 'Could not detect app type',
        suggestions: result.suggestions,
      };
    }

    return {
      success: true,
      data: {
        appType: result.appType!.id,
        name: result.appType!.name,
        confidence: result.confidence,
        matchMethod: result.method,
        alternates: result.alternates?.map((a) => ({
          id: a.appType!.id,
          name: a.appType!.name,
          confidence: a.confidence,
        })),
      },
    };
  }

  /**
   * Analyze prompt without generating files
   */
  async analyze(dto: AnalyzeDto) {
    // Detect app type
    const appTypeResult = await this.detectAppType(dto.prompt);

    if (!appTypeResult.appType) {
      return {
        success: false,
        error: 'Could not determine app type from prompt',
        suggestions: appTypeResult.suggestions,
      };
    }

    // Extract features
    const featureResult = this.featureExtractor.extract(
      dto.prompt,
      appTypeResult.appType,
    );

    // Get pages and components
    const featureIds = featureResult.features.map((f) => f.id);
    const pages = this.featureExtractor.getPages(featureIds);
    const components = this.featureExtractor.getComponents(featureIds);
    const entities = this.featureExtractor.getEntities(featureIds);
    const apiRoutes = this.featureExtractor.getApiRoutes(featureIds);

    // Get customization
    const customization = this.aiCustomization.extractCustomization({
      prompt: dto.prompt,
      appType: appTypeResult.appType!.id,
      enabledFeatures: featureIds,
    });

    return {
      success: true,
      data: {
        appType: {
          id: appTypeResult.appType!.id,
          name: appTypeResult.appType!.name,
          description: appTypeResult.appType!.description,
          confidence: appTypeResult.confidence,
          matchMethod: appTypeResult.method,
        },
        features: featureResult.features.map((f) => ({
          id: f.id,
          name: f.name,
          category: f.category,
        })),
        structure: {
          pages: pages.map((p) => ({
            id: p.id,
            route: p.route,
            title: p.title,
            section: p.section,
            authRequired: p.authRequired,
          })),
          components,
          entities: entities.map((e) => ({
            name: e.name,
            displayName: e.displayName,
          })),
          apiRoutes: apiRoutes.map((r) => ({
            method: r.method,
            path: r.path,
            auth: r.auth,
          })),
        },
        customization: {
          branding: customization.branding,
          metadata: customization.metadata,
          confidence: customization.confidence,
        },
      },
    };
  }

  /**
   * Generate complete app
   * @param dto - Generation parameters
   * @param onProgress - Optional callback for progress updates
   */
  async generate(
    dto: GenerateDto,
    onProgress?: (step: string, status: string, message?: string) => void,
  ) {
    // Helper to safely call progress callback
    const progress = (step: string, status: string, message?: string) => {
      if (onProgress) {
        try {
          onProgress(step, status, message);
        } catch (e) {
          // Ignore callback errors
        }
      }
      this.logger.log(`[Progress] ${step}: ${status} - ${message || ''}`);
    };

    const startTime = Date.now();
    const steps: any[] = [];
    const allFiles: any[] = [];

    // Step 1: Detect App Type
    progress('generation', 'running', '🔍 Detecting app type from prompt...');
    const appTypeResult = await this.detectAppType(dto.prompt);

    if (!appTypeResult.appType) {
      throw new Error('Could not determine app type from prompt');
    }

    progress('generation', 'running', `✅ Detected: ${appTypeResult.appType.name} (${(appTypeResult.confidence * 100).toFixed(0)}% confidence)`);

    steps.push({
      name: 'detect-app-type',
      status: 'completed',
      data: {
        appType: appTypeResult.appType!.id,
        confidence: appTypeResult.confidence,
      },
    });

    // Step 2: Extract Features
    progress('generation', 'running', '📦 Extracting features from prompt...');
    const featureResult = this.featureExtractor.extract(
      dto.prompt,
      appTypeResult.appType,
    );

    const featureIds = featureResult.features.map((f) => f.id);
    progress('generation', 'running', `✅ Found ${featureIds.length} features`);

    steps.push({
      name: 'extract-features',
      status: 'completed',
      data: { features: featureIds },
    });

    // Step 3: Resolve Structure
    progress('generation', 'running', '🏗️ Resolving app structure...');
    // Pass app-type so landing page can use its landingPageComponents
    const pages = this.featureExtractor.getPages(featureIds, appTypeResult.appType!);
    const componentIds = this.featureExtractor.getComponents(featureIds, appTypeResult.appType!);
    const entities = this.featureExtractor.getEntities(featureIds);
    const apiRoutes = this.featureExtractor.getApiRoutes(featureIds);

    const componentMap = new Map(
      componentIds
        .map((id) => [id, COMPONENTS_BY_ID.get(id)])
        .filter(([_, c]) => c !== undefined) as [string, any][],
    );

    progress('generation', 'running', `✅ ${pages.length} pages, ${componentIds.length} components, ${entities.length} entities`);

    steps.push({
      name: 'resolve-structure',
      status: 'completed',
      data: {
        pages: pages.length,
        components: componentIds.length,
        entities: entities.length,
      },
    });

    // Step 4: Derive Schema
    progress('generation', 'running', '📊 Deriving database schema...');
    const schemaResult = this.schemaDeriver.derive(
      componentIds,
      entities,
      appTypeResult.appType!.id,
    );

    progress('generation', 'running', `✅ Created ${schemaResult.schema.tables.length} database tables`);

    steps.push({
      name: 'derive-schema',
      status: 'completed',
      data: { tables: schemaResult.schema.tables.length },
    });

    // Step 5: Customization
    progress('generation', 'running', '🎨 Applying customizations...');
    const customization = this.aiCustomization.extractCustomization({
      prompt: dto.prompt,
      appType: appTypeResult.appType!.id,
      enabledFeatures: featureIds,
    });

    // Use provided appName, or extract from customization, or auto-generate
    const appName =
      dto.appName ||
      customization.metadata.appName ||
      this.generateAppName(appTypeResult.appType!.name);

    progress('generation', 'running', `✅ App name: ${appName}`);

    steps.push({
      name: 'customize',
      status: 'completed',
      data: { appName },
    });

    // Step 6: Generate Fluxez API Keys
    progress('generation', 'running', '🔑 Generating API keys...');
    const generatedKeys = this.honoRenderer.generateKeys(appName);
    this.logger.log(`Generated API keys for app: ${appName}`);
    this.logger.log(`  App ID: ${generatedKeys.appId}`);
    this.logger.log(`  Database: ${generatedKeys.databaseName}`);

    progress('generation', 'running', `✅ App ID: ${generatedKeys.appId.substring(0, 8)}...`);

    steps.push({
      name: 'generate-keys',
      status: 'completed',
      data: {
        appId: generatedKeys.appId,
        databaseName: generatedKeys.databaseName,
      },
    });

    // Step 7: Register app in platform
    let platformRegistration = null;
    try {
      progress('generation', 'running', '🚀 Registering app in Fluxez platform...');
      this.logger.log('Registering app in Fluxez platform...');
      platformRegistration = await this.platformService.createApp({
        name: appName,
        description: dto.prompt.substring(0, 200),
        type: appTypeResult.appType!.id,
        framework: 'hono',
        frameworks: ['hono', 'react', 'react-native'],
      });

      // Use platform-generated keys instead
      generatedKeys.appId = platformRegistration.appId;
      generatedKeys.databaseName = platformRegistration.databaseName;
      generatedKeys.serviceRoleKey = platformRegistration.serviceRoleKey;
      generatedKeys.anonKey = platformRegistration.anonKey;

      progress('generation', 'running', `✅ Registered with database: ${generatedKeys.databaseName}`);

      steps.push({
        name: 'register-platform',
        status: 'completed',
        data: {
          appId: platformRegistration.appId,
          databaseName: platformRegistration.databaseName,
        },
      });
    } catch (error: any) {
      this.logger.warn(`Platform registration failed: ${error.message}`);
      this.logger.warn('Continuing with local keys only...');
      progress('generation', 'running', `⚠️ Platform registration skipped: ${error.message}`);
      steps.push({
        name: 'register-platform',
        status: 'skipped',
        data: { reason: error.message },
      });
    }

    // Step 8: Generate React Frontend
    progress('generation', 'running', '⚛️ Generating React frontend...');

    // CRITICAL: Set features on renderer so it has access to entity definitions
    // This allows proper entity-to-API mapping without hardcoding
    this.reactRenderer.setFeatures(featureResult.features);

    const pageInstances = pages.map((page) => ({
      id: page.id,
      route: page.route,
      title: page.title,
      templateId: page.templateId || 'default',
      section: page.section,
      components: page.components.map((compId, idx) => ({
        slotId: `slot-${idx}`,
        componentId: compId,
        props: {},
      })),
      dataFetching: [],
      auth: {
        required: page.authRequired,
        roles: page.roles,
      },
    }));

    const frontendFiles = this.reactRenderer.generateAll(
      pageInstances,
      componentMap,
      appName,
      generatedKeys,
      customization.branding,
      customization.designVariant,
      customization.colorScheme,
      appTypeResult.appType!.id, // Pass app type for definition-driven generation
    );
    allFiles.push(...frontendFiles);

    // Add CSS variables
    const cssVars = this.aiCustomization.generateCSSVariables(
      customization.branding,
    );
    allFiles.push({
      path: 'frontend/src/styles/variables.css',
      content: cssVars,
      type: 'style',
      method: 'template',
    });

    progress('generation', 'running', `✅ Generated ${frontendFiles.length} frontend files`);

    steps.push({
      name: 'generate-frontend',
      status: 'completed',
      data: { files: frontendFiles.length },
    });

    // Step 8b: Generate React Native Mobile App
    progress('generation', 'running', '📱 Generating React Native mobile app...');
    // Set features on React Native renderer for entity-aware data binding
    this.reactNativeRenderer.setFeatures(featureResult.features);
    const mobileFiles = this.reactNativeRenderer.generateAll(
      pageInstances,
      componentMap,
      appName,
      generatedKeys,
      customization.branding,
      customization.designVariant,
      customization.colorScheme,
    );
    allFiles.push(...mobileFiles);

    progress('generation', 'running', `✅ Generated ${mobileFiles.length} mobile files`);

    steps.push({
      name: 'generate-mobile',
      status: 'completed',
      data: { files: mobileFiles.length },
    });

    this.logger.log(`Generated ${mobileFiles.length} mobile app files`);

    // Step 9: Generate Hono Backend (following CLAUDE.md patterns)
    progress('generation', 'running', '🔧 Generating Hono backend API...');
    const backendFiles = this.honoRenderer.generateAll(
      apiRoutes,
      schemaResult.schema,
      appName,
      generatedKeys,
    );
    allFiles.push(...backendFiles);

    progress('generation', 'running', `✅ Generated ${backendFiles.length} backend files`);

    steps.push({
      name: 'generate-backend',
      status: 'completed',
      data: { files: backendFiles.length },
    });

    // Step 10: Generate README.md
    progress('generation', 'running', '📝 Generating README documentation...');
    const readmeContent = this.generateReadme(
      appName,
      appTypeResult.appType!.id,
      appTypeResult.appType!.description,
      dto.prompt,
      featureIds,
      pages,
      entities,
      apiRoutes,
      schemaResult,
      generatedKeys,
    );
    allFiles.push({
      path: 'README.md',
      content: readmeContent,
      type: 'documentation',
      method: 'generated',
    });

    steps.push({
      name: 'generate-readme',
      status: 'completed',
      data: { generated: true },
    });

    // Step 11: Write files to disk (always use UUID-based folder)
    progress('generation', 'running', '💾 Writing files to disk...');
    // Output to app-builder/generated folder (sibling to backend)
    // Use process.cwd() (backend/) and go up one level to wants/, then to app-builder/generated
    const outputDir = path.resolve(process.cwd(), '../app-builder/generated', generatedKeys.appId);
    const absoluteOutputDir = outputDir;

    // Create output directory
    fs.mkdirSync(absoluteOutputDir, { recursive: true });

    // Write all files
    let filesWritten = 0;
    for (const file of allFiles) {
      const filePath = path.join(absoluteOutputDir, file.path);
      const fileDir = path.dirname(filePath);

      // Create directory if not exists
      fs.mkdirSync(fileDir, { recursive: true });

      // Write file
      fs.writeFileSync(filePath, file.content, 'utf-8');
      filesWritten++;
    }

    progress('generation', 'running', `✅ Written ${filesWritten} files to ${generatedKeys.appId.substring(0, 8)}...`);

    steps.push({
      name: 'write-files',
      status: 'completed',
      data: { filesWritten },
    });

    // Step 12: Execute schema on database (if platform registered)
    if (platformRegistration) {
      try {
        // Get schema.sql content from generated files
        const schemaFile = allFiles.find((f) => f.path === 'backend/src/schema.sql');
        if (schemaFile) {
          progress('generation', 'running', '🗄️ Creating database tables...');
          this.logger.log('Executing schema on app database...');
          this.logger.log(`Schema SQL length: ${schemaFile.content.length} chars`);

          // Split SQL into individual statements and execute
          const statements = schemaFile.content
            .split(';')
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && !s.startsWith('--'));

          this.logger.log(`Executing ${statements.length} SQL statements...`);
          progress('generation', 'running', `📦 Executing ${statements.length} SQL statements...`);

          for (const statement of statements) {
            try {
              await this.platformService.executeOnAppDatabase(
                platformRegistration.databaseName,
                statement + ';',
              );
            } catch (stmtError: any) {
              this.logger.warn(`Statement failed: ${stmtError.message}`);
              this.logger.warn(`Statement: ${statement.substring(0, 100)}...`);
            }
          }

          progress('generation', 'running', `✅ Database tables created`);

          steps.push({
            name: 'execute-schema',
            status: 'completed',
            data: { statements: statements.length },
          });

          // Step 13: Seed data after schema creation
          try {
            progress('generation', 'running', '🌱 Seeding initial data...');
            this.logger.log('Seeding app data...');
            // Get the same prefix used by hono-renderer for table names
            const appPrefix = this.getAppPrefix(appName);
            this.logger.log(`Using app prefix: ${appPrefix}`);

            const tables = schemaResult.schema.tables.map((t) => ({
              name: t.name,
              columns: t.columns.map((c) => ({
                name: c.name,
                type: c.type,
              })),
            }));

            // Pass progress callback to seeder for periodic updates
            // Also pass app roles for proper user role distribution
            await this.dataSeeder.seedAppData(
              tables,
              platformRegistration.databaseName,
              appTypeResult.appType!.id,
              appPrefix,
              (seedProgress: string) => {
                progress('generation', 'running', seedProgress);
              },
              appTypeResult.appType!.roles,
            );
            progress('generation', 'running', '✅ Sample data seeded');
            steps.push({
              name: 'seed-data',
              status: 'completed',
            });
          } catch (seedError: any) {
            this.logger.warn(`Data seeding failed: ${seedError.message}`);
            progress('generation', 'running', `⚠️ Data seeding skipped: ${seedError.message}`);
            steps.push({
              name: 'seed-data',
              status: 'skipped',
              data: { reason: seedError.message },
            });
          }
        }
      } catch (error: any) {
        this.logger.warn(`Schema execution failed: ${error.message}`);
        progress('generation', 'running', `⚠️ Schema execution skipped: ${error.message}`);
        steps.push({
          name: 'execute-schema',
          status: 'skipped',
          data: { reason: error.message },
        });
      }
    }

    const totalTime = Date.now() - startTime;
    progress('generation', 'completed', `🎉 Generation complete in ${(totalTime / 1000).toFixed(1)}s`);

    // Step 13: Save app to user_apps table
    let savedApp: any = null;
    if (dto.userId && this.appsService) {
      try {
        progress('generation', 'running', '💾 Saving app to user database...');
        savedApp = await this.appsService.createApp(dto.userId, {
          name: appName,
          description: `${appTypeResult.appType!.name} - ${appTypeResult.appType!.description}`,
          conversationId: dto.conversationId,
          appType: appTypeResult.appType!.id,
          outputPath: absoluteOutputDir,
          frontendFramework: 'react',
          backendFramework: 'hono',
          mobileFramework: 'react-native',
          hasFrontend: true,
          hasBackend: true,
          hasMobile: true,
          status: 'generated',
          generationPrompt: dto.prompt,
          tags: featureIds,
          metadata: {
            appId: generatedKeys.appId,
            databaseName: generatedKeys.databaseName,
            features: featureIds,
            tables: schemaResult.schema.tables.map((t: any) => t.name),
          },
        });
        this.logger.log(`✅ App saved to user_apps: ${savedApp.id}`);
        steps.push({
          name: 'save-app',
          status: 'completed',
          data: { userAppId: savedApp.id },
        });
      } catch (error: any) {
        this.logger.warn(`Failed to save app to user_apps: ${error.message}`);
        steps.push({
          name: 'save-app',
          status: 'skipped',
          data: { reason: error.message },
        });
      }
    }

    // Log success summary
    this.logger.log('');
    this.logger.log('═══════════════════════════════════════════════════════════════');
    this.logger.log('✅ APP GENERATION COMPLETED SUCCESSFULLY!');
    this.logger.log('═══════════════════════════════════════════════════════════════');
    this.logger.log(`📦 App Name:      ${appName}`);
    this.logger.log(`🆔 App ID:        ${generatedKeys.appId}`);
    this.logger.log(`📁 Output Path:   ${absoluteOutputDir}`);
    this.logger.log(`🗄️  Database:      ${generatedKeys.databaseName}`);
    this.logger.log(`📄 Files:         ${filesWritten}`);
    this.logger.log(`📊 Tables:        ${schemaResult.schema.tables.length}`);
    this.logger.log(`⏱️  Time:          ${(totalTime / 1000).toFixed(2)}s`);
    if (savedApp) {
      this.logger.log(`💾 User App ID:   ${savedApp.id}`);
    }
    this.logger.log('═══════════════════════════════════════════════════════════════');
    this.logger.log('');

    return {
      success: true,
      data: {
        appId: generatedKeys.appId,
        appName,
        appType: appTypeResult.appType!.id,
        features: featureIds,
        outputPath: absoluteOutputDir,
        userAppId: savedApp?.id, // ID in user_apps table
        keys: {
          serviceRoleKey: generatedKeys.serviceRoleKey,
          anonKey: generatedKeys.anonKey,
          databaseName: generatedKeys.databaseName,
        },
        platformRegistered: !!platformRegistration,
        stats: {
          files: filesWritten,
          tables: schemaResult.schema.tables.length,
          generationTime: totalTime,
        },
        steps: steps.map((s) => ({
          name: s.name,
          status: s.status,
        })),
      },
    };
  }

  private generateAppName(appTypeName: string): string {
    const prefix = appTypeName.split(' ')[0];
    const suffix = ['Hub', 'Pro', 'App', 'Platform'][
      Math.floor(Math.random() * 4)
    ];
    return `${prefix}${suffix}`;
  }

  /**
   * Generate README.md for the app
   */
  private generateReadme(
    appName: string,
    appType: string,
    appTypeDescription: string,
    prompt: string,
    featureIds: string[],
    pages: any[],
    entities: any[],
    apiRoutes: any[],
    schemaResult: any,
    generatedKeys: GeneratedKeys,
  ): string {
    // Map feature IDs to feature names
    const featureNames = featureIds.map((id) => {
      const words = id.split('-');
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    });

    // Generate database schema documentation
    const schemaDoc = schemaResult.schema.tables
      .map((table) => {
        const columns = table.columns
          .map((col) => `- \`${col.name}\` - ${col.type}${col.nullable === false ? ' (required)' : ''}`)
          .join('\n');
        return `### ${table.name}\n${columns}`;
      })
      .join('\n\n');

    // Group API routes by category
    const authRoutes = apiRoutes.filter((r) => r.path.includes('/auth/'));
    const otherRoutes = apiRoutes.filter((r) => !r.path.includes('/auth/'));

    const authRoutesDoc = authRoutes
      .map((r) => `- \`${r.method} ${r.path}\` - ${this.describeRoute(r)}`)
      .join('\n');

    const apiRoutesDoc = otherRoutes
      .map((r) => `- \`${r.method} ${r.path}\`${r.auth ? ' (authenticated)' : ''} - ${this.describeRoute(r)}`)
      .join('\n');

    // Generate pages documentation
    const pagesDoc = pages
      .map((p) => `- **${p.title}** (\`${p.route}\`)${p.authRequired ? ' - requires authentication' : ''}`)
      .join('\n');

    const readme = `# ${appName}

${appTypeDescription || prompt.substring(0, 200)}

## Features

${featureNames.map((f) => `- **${f}**`).join('\n')}

## Tech Stack

- **Backend**: Hono + @fluxez/node-sdk (Cloudflare Workers)
- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Database**: PostgreSQL via Fluxez SDK
- **Auth**: JWT-based authentication

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Backend

\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`

The backend runs on \`http://localhost:4000\` by default.

### Frontend

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

The frontend runs on \`http://localhost:3000\` by default.

## Pages

${pagesDoc}

## Database Schema

${schemaDoc}

## API Endpoints

### Authentication
${authRoutesDoc || '- Standard auth endpoints (register, login, me, logout)'}

### API Routes
${apiRoutesDoc || 'No additional API routes'}

## Environment Variables

### Backend (wrangler.toml)
- \`FLUXEZ_API_KEY\` - Service role API key
- \`FLUXEZ_ANON_KEY\` - Anonymous/public API key
- \`FRONTEND_URL\` - Frontend URL for CORS

### Frontend (.env)
- \`VITE_API_URL\` - Backend API URL

## Deployment

### Backend

\`\`\`bash
cd backend
npm run deploy
\`\`\`

### Frontend

\`\`\`bash
cd frontend
npm run build
npx wrangler deploy
\`\`\`

## App Information

- **App ID**: ${generatedKeys.appId}
- **Database**: ${generatedKeys.databaseName}
- **App Type**: ${appType}

## License

MIT
`;

    return readme;
  }

  /**
   * Generate human-readable description for API route
   */
  private describeRoute(route: any): string {
    const path = route.path;
    const method = route.method.toUpperCase();

    if (path.includes('/auth/register')) return 'Register new user';
    if (path.includes('/auth/login')) return 'Login';
    if (path.includes('/auth/me')) return 'Get current user';
    if (path.includes('/auth/logout')) return 'Logout';

    // Extract resource name from path
    const parts = path.split('/').filter((p) => p && !p.startsWith(':'));
    const resource = parts[parts.length - 1] || 'resource';
    const hasId = path.includes(':');

    switch (method) {
      case 'GET':
        return hasId ? `Get ${resource} by ID` : `List ${resource}`;
      case 'POST':
        return `Create ${resource}`;
      case 'PUT':
      case 'PATCH':
        return `Update ${resource}`;
      case 'DELETE':
        return `Delete ${resource}`;
      default:
        return `${method} ${resource}`;
    }
  }

  /**
   * Extract a short, smart prefix from app name (matches hono-renderer logic)
   */
  private getAppPrefix(appName: string): string {
    // Common words to filter out
    const stopWords = new Set([
      'a', 'an', 'the', 'with', 'and', 'or', 'for', 'to', 'in', 'on', 'of',
      'create', 'build', 'make', 'online', 'app', 'application', 'system',
      'platform', 'tool', 'website', 'site', 'web', 'that', 'has', 'have',
      'can', 'should', 'will', 'user', 'users', 'management', 'manager'
    ]);

    // Keywords that are good table prefixes
    const keywords = [
      'bookstore', 'book', 'store', 'shop', 'ecommerce', 'commerce',
      'blog', 'post', 'article', 'news', 'content',
      'task', 'todo', 'project', 'issue', 'ticket',
      'inventory', 'stock', 'warehouse', 'product',
      'crm', 'customer', 'client', 'contact', 'lead',
      'finance', 'budget', 'expense', 'invoice', 'payment',
      'recipe', 'food', 'restaurant', 'menu', 'order',
      'fitness', 'health', 'workout', 'gym', 'exercise',
      'travel', 'trip', 'booking', 'hotel', 'flight',
      'event', 'calendar', 'schedule', 'meeting', 'appointment',
      'chat', 'message', 'social', 'forum', 'community',
      'course', 'learning', 'education', 'school', 'class',
      'job', 'career', 'resume', 'hiring', 'recruit',
      'real', 'estate', 'property', 'listing', 'rental',
      'music', 'video', 'media', 'streaming', 'podcast',
      'game', 'quiz', 'trivia', 'poll', 'survey'
    ];

    const nameLower = appName.toLowerCase();

    // Check if any keyword is in the name
    for (const keyword of keywords) {
      if (nameLower.includes(keyword)) {
        return keyword.replace(/[^a-z0-9]/g, '_');
      }
    }

    // Extract words and find meaningful word
    const words = nameLower
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    if (words.length > 0) {
      // Return first meaningful word, max 12 chars
      return words[0].substring(0, 12);
    }

    // Fallback
    return nameLower.replace(/[^a-z0-9]/g, '').substring(0, 8) || 'app';
  }
}
