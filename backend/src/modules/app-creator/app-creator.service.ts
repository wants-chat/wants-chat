import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../ai/ai.service';
import { DatabaseService } from '../database/database.service';
import {
  CreateAppDto,
  GeneratedApp,
  GeneratedFile,
  DatabaseSchema,
  GeneratedKeys,
  TableSchema,
  EnhancedAppAnalysis,
  EnhancedEntityDefinition,
  EntityRelationship,
  EnhancedFieldDefinition,
  EnumDefinition,
  AppBuildResult,
  GeneratedAppWithBuild,
} from './dto/create-app.dto';
import { ReactTemplateGenerator } from './templates/react-app.template';
import { HonoTemplateGenerator } from './templates/hono-api.template';
import { ReactNativeTemplateGenerator } from './templates/react-native.template';
import { PlatformService } from '../app-builder/services/platform.service';
import { DataSeederService } from '../app-builder/services/data-seeder.service';
import { BuildValidatorService } from './services/build-validator.service';
import { AutoRepairService } from './services/auto-repair.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { snakeCase, camelCase, pascalCase, kebabCase } from 'change-case';
import * as pluralize from 'pluralize';

// Import blueprints
import {
  Blueprint,
  PageDefinition,
  ApiEndpoint,
  getBlueprint,
  hasBlueprint,
  getAvailableAppTypes,
} from './blueprints';

// Enhanced field type to PostgreSQL type mapping
const FIELD_TYPE_TO_DB: Record<string, string> = {
  'string': 'VARCHAR(255)',
  'text': 'TEXT',
  'number': 'INTEGER',
  'integer': 'INTEGER',
  'decimal': 'DECIMAL(10,2)',
  'boolean': 'BOOLEAN',
  'date': 'DATE',
  'datetime': 'TIMESTAMPTZ',
  'email': 'VARCHAR(255)',
  'url': 'VARCHAR(2000)',
  'phone': 'VARCHAR(20)',
  'image': 'VARCHAR(500)',
  'file': 'VARCHAR(500)',
  'enum': 'VARCHAR(50)',
  'json': 'JSONB',
  'array': 'JSONB',
  'uuid': 'UUID',
  'object': 'JSONB',
};

/**
 * Custom exception for blueprint validation errors
 */
export class BlueprintValidationError extends BadRequestException {
  constructor(message: string, public readonly details?: Record<string, any>) {
    super(`Blueprint Validation Error: ${message}`);
  }
}

/**
 * Custom exception for missing blueprint
 */
export class MissingBlueprintError extends BadRequestException {
  constructor(appType: string) {
    super(
      `No blueprint found for app type "${appType}". ` +
      `Available blueprints: ${getAvailableAppTypes().join(', ')}. ` +
      `Please use one of these app types or create a blueprint for "${appType}".`
    );
  }
}

/**
 * Custom exception for missing entity configuration
 */
export class MissingEntityConfigError extends BadRequestException {
  constructor(entityName: string, blueprintType: string) {
    super(
      `Entity "${entityName}" is not defined in the "${blueprintType}" blueprint. ` +
      `Please add entityConfig for "${entityName}" in the blueprint.`
    );
  }
}

@Injectable()
export class AppCreatorService {
  private readonly logger = new Logger(AppCreatorService.name);
  private readonly outputBaseDir: string;
  private readonly platformService: PlatformService;
  private readonly dataSeederService: DataSeederService;

  constructor(
    private readonly configService: ConfigService,
    private readonly aiService: AiService,
    private readonly db: DatabaseService,
    private readonly buildValidator: BuildValidatorService,
    private readonly autoRepair: AutoRepairService,
  ) {
    this.outputBaseDir = this.configService.get<string>(
      'APP_CREATOR_OUTPUT_DIR',
      path.join(process.cwd(), 'generated', 'app-creator'),
    );

    this.platformService = new PlatformService();
    this.dataSeederService = new DataSeederService(this.platformService);
  }

  /**
   * Main entry point - creates an app from a prompt
   * Uses blueprint system with strict validation - no fallbacks
   * @param dto - Create app data transfer object
   * @param onProgress - Optional callback for progress updates (keeps socket alive during long operations)
   */
  async createApp(
    dto: CreateAppDto,
    onProgress?: (step: string, status: string, message?: string) => void,
  ): Promise<GeneratedApp> {
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

    const slug = this.generateSlug(dto.appName || dto.prompt);

    this.logger.log(`Creating app: ${slug} from prompt: "${dto.prompt.substring(0, 50)}..."`);

    // Step 1: Analyze the prompt to understand what to build
    progress('analysis', 'started', 'Analyzing app requirements...');
    const analysis = await this.analyzePrompt(dto.prompt);
    this.logger.log(`Analysis complete: ${analysis.appType} with ${analysis.entities.length} entities`);
    progress('analysis', 'completed', `Detected ${analysis.appType} with ${analysis.entities.length} entities`);

    // Step 2: STRICT - Get blueprint for the app type (throws if not found)
    progress('blueprint', 'started', 'Validating against blueprint...');
    const blueprint = this.getBlueprintStrict(analysis.appType);
    this.logger.log(`Using blueprint: ${blueprint.appType} - ${blueprint.description}`);
    progress('blueprint', 'completed', `Using ${blueprint.appType} blueprint`);

    // Step 3: Validate and enhance entities using blueprint (throws if validation fails)
    const validatedAnalysis = this.validateAndEnhanceWithBlueprint(analysis, blueprint);
    this.logger.log(`Validated ${validatedAnalysis.entities.length} entities against blueprint`);

    // Update app name based on analysis
    const finalAppName = dto.appName || this.generateAppName(analysis.appType);

    // Step 4: Create app in Fluxez platform
    progress('platform', 'started', 'Creating app in platform...');
    const keys = await this.createPlatformApp(finalAppName, analysis.appType);
    this.logger.log(`Created app in platform: ${keys.appId} (database: ${keys.databaseName})`);
    progress('platform', 'completed', `Created app: ${keys.appId}`);

    // Step 5: Generate database schema from entities
    progress('database', 'started', 'Creating database schema...');
    const schema = this.generateSchema(validatedAnalysis);

    // Step 6: Create entity tables in the app database
    const appPrefix = finalAppName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .substring(0, 20);

    if (schema.tables.length > 0) {
      await this.createEntityTables(keys.databaseName, schema, appPrefix);
      this.logger.log(`Created ${schema.tables.length} entity tables in database`);
    }
    progress('database', 'completed', `Created ${schema.tables.length} tables`);

    // Step 7: Seed data
    progress('seeding', 'started', 'Seeding sample data...');
    await this.dataSeederService.seedAppData(
      schema.tables,
      keys.databaseName,
      analysis.appType,
      appPrefix,
    );
    this.logger.log(`Seeded auth users and entity data for ${schema.tables.length} tables`);
    progress('seeding', 'completed', 'Sample data seeded');

    // Step 8: Generate React frontend
    progress('frontend', 'started', 'Generating React frontend...');
    const reactGenerator = new ReactTemplateGenerator();
    const frontendFiles = reactGenerator.generate(validatedAnalysis, schema, finalAppName);
    progress('frontend', 'completed', `Generated ${frontendFiles.length} frontend files`);

    // Step 9: Generate Hono backend
    progress('backend', 'started', 'Generating Hono backend...');
    const honoGenerator = new HonoTemplateGenerator();
    const backendFiles = honoGenerator.generate(validatedAnalysis, schema, keys, finalAppName, appPrefix);
    progress('backend', 'completed', `Generated ${backendFiles.length} backend files`);

    // Step 10: Generate React Native mobile app
    progress('mobile', 'started', 'Generating React Native mobile app...');
    const rnGenerator = new ReactNativeTemplateGenerator();
    const mobileFiles = rnGenerator.generate(validatedAnalysis, schema, finalAppName, keys);
    progress('mobile', 'completed', `Generated ${mobileFiles.length} mobile files`);

    // Step 11: Write files to disk
    progress('files', 'started', 'Writing files to disk...');
    const outputPath = path.join(this.outputBaseDir, keys.appId);
    await this.writeFilesToDisk(outputPath, frontendFiles, backendFiles, mobileFiles);
    this.logger.log(`Files written to: ${outputPath}`);
    progress('files', 'completed', `Written ${frontendFiles.length + backendFiles.length + mobileFiles.length} files`);

    // Step 12: Build validation and auto-repair
    progress('validation', 'started', 'Validating generated code...');
    const buildResult = await this.validateAndRepair(outputPath, (msg) => {
      progress('validation', 'in_progress', msg);
    });
    progress('validation', 'completed', buildResult.status === 'success'
      ? 'Build validation passed!'
      : `Build completed with ${buildResult.totalErrors} errors`);

    // Step 13: Save to database if userId provided
    if (dto.userId) {
      await this.saveApp({
        id: keys.appId,
        userId: dto.userId,
        name: finalAppName,
        slug,
        prompt: dto.prompt,
        appType: analysis.appType,
        conversationId: dto.conversationId,
        outputPath,
        keys,
      });
    }

    progress('complete', 'completed', 'App generation complete!');

    const mobilePath = path.join(outputPath, 'mobile');

    return {
      id: keys.appId,
      name: finalAppName,
      slug,
      prompt: dto.prompt,
      appType: analysis.appType,
      outputPath,
      frontend: {
        framework: 'react',
        path: path.join(outputPath, 'frontend'),
        fileCount: frontendFiles.length,
      },
      backend: {
        framework: 'hono',
        path: path.join(outputPath, 'backend'),
        fileCount: backendFiles.length,
      },
      mobile: {
        framework: 'react-native',
        path: mobilePath,
        fileCount: mobileFiles.length,
      },
      schema,
      keys: {
        appId: keys.appId,
        anonKey: keys.anonKey,
      },
      features: analysis.features || [],
      createdAt: new Date().toISOString(),
      buildResult,
    } as GeneratedAppWithBuild;
  }

  /**
   * Validate build and auto-repair if needed
   */
  private async validateAndRepair(
    outputPath: string,
    onProgress?: (message: string) => void,
  ): Promise<AppBuildResult> {
    const startTime = Date.now();

    // Initial build validation
    onProgress?.('Checking frontend build...');
    let buildResult = await this.buildValidator.validateAll(outputPath);

    if (buildResult.success) {
      this.logger.log('Build validation passed on first try!');
      return this.mapBuildResult(buildResult, 0, true, Date.now() - startTime);
    }

    this.logger.log(`Build has ${buildResult.totalErrors} errors, attempting auto-repair...`);
    onProgress?.(`Found ${buildResult.totalErrors} errors, attempting auto-repair...`);

    // Attempt auto-repair
    const repairResult = await this.autoRepair.repairWithRetry(
      outputPath,
      3,
      onProgress,
    );

    return this.mapBuildResult(
      repairResult.finalBuildResult,
      repairResult.attempts,
      repairResult.success,
      Date.now() - startTime,
    );
  }

  /**
   * Map internal build result to DTO format
   */
  private mapBuildResult(
    result: any,
    repairAttempts: number,
    repairSuccess: boolean,
    duration: number,
  ): AppBuildResult {
    const mapPlatform = (platform: any) => {
      if (!platform) return null;
      return {
        platform: platform.platform,
        success: platform.success,
        errorCount: platform.errors?.length || 0,
        warningCount: platform.warnings?.length || 0,
        errors: (platform.errors || []).map((e: any) => ({
          file: e.file,
          line: e.line,
          column: e.column,
          message: e.message,
          code: e.code,
          severity: e.severity,
        })),
      };
    };

    let status: AppBuildResult['status'];
    if (result.success) {
      status = repairAttempts > 0 ? 'repaired' : 'success';
    } else if (result.totalErrors > 0) {
      status = repairAttempts > 0 ? 'partial' : 'failed';
    } else {
      status = 'success';
    }

    return {
      status,
      frontend: mapPlatform(result.frontend),
      backend: mapPlatform(result.backend),
      mobile: mapPlatform(result.mobile),
      totalErrors: result.totalErrors || 0,
      totalWarnings: result.totalWarnings || 0,
      repairAttempts,
      repairSuccess,
      duration,
    };
  }

  /**
   * STRICT: Get blueprint for app type - throws if not found
   */
  private getBlueprintStrict(appType: string): Blueprint {
    const blueprint = getBlueprint(appType);

    if (!blueprint) {
      throw new MissingBlueprintError(appType);
    }

    return blueprint;
  }

  /**
   * Validate and enhance analysis using blueprint
   * - Enhances entities with blueprint defaults
   * - Adds missing core entities from blueprint
   * - Non-core entities pass through as-is
   */
  private validateAndEnhanceWithBlueprint(
    analysis: EnhancedAppAnalysis,
    blueprint: Blueprint
  ): EnhancedAppAnalysis {
    const validatedEntities: EnhancedEntityDefinition[] = [];
    const processedEntityNames = new Set<string>();

    // Process AI-detected entities
    for (const entity of analysis.entities) {
      // Normalize to snake_case for consistent comparison (OrderItem -> order_item)
      const entityNameNormalized = entity.name
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .toLowerCase();
      processedEntityNames.add(entityNameNormalized);

      const blueprintConfig = blueprint.entityConfig?.[entityNameNormalized];

      if (blueprintConfig) {
        // Entity is in blueprint - enhance with blueprint config
        const validatedEntity = this.validateEntityWithConfig(entity, blueprintConfig, blueprint);
        validatedEntities.push(validatedEntity);
      } else {
        // Entity not in blueprint - pass through with common settings
        this.logger.log(`Entity "${entity.name}" not in blueprint, using AI-detected config`);
        validatedEntities.push({
          ...entity,
          timestamps: blueprint.commonFields.timestamps,
          softDelete: blueprint.commonFields.softDelete,
          userOwnership: entity.userOwnership ?? blueprint.commonFields.userOwnership,
        });
      }
    }

    // Add missing core entities from blueprint
    for (const coreEntity of blueprint.coreEntities) {
      const coreEntityLower = coreEntity.toLowerCase();

      if (!processedEntityNames.has(coreEntityLower)) {
        const blueprintConfig = blueprint.entityConfig?.[coreEntityLower];

        if (blueprintConfig) {
          this.logger.log(`Adding missing core entity "${coreEntity}" from blueprint`);

          // Create entity from blueprint config
          const fields: EnhancedFieldDefinition[] = (blueprintConfig.defaultFields || []).map(f => ({
            name: f.name,
            type: (f.type as EnhancedFieldDefinition['type']) || 'string',
            required: f.required ?? false,
          }));

          const relationships: EntityRelationship[] = (blueprintConfig.relationships || []).map(r => ({
            type: r.type as EntityRelationship['type'],
            targetEntity: r.target,
            cascadeDelete: true,
          }));

          validatedEntities.push({
            name: pascalCase(coreEntity),
            displayName: pascalCase(coreEntity),
            fields,
            relationships: relationships.length > 0 ? relationships : undefined,
            timestamps: blueprint.commonFields.timestamps,
            softDelete: blueprint.commonFields.softDelete,
            userOwnership: blueprint.commonFields.userOwnership,
          });
        }
      }
    }

    return {
      ...analysis,
      entities: validatedEntities,
      requiresAuth: analysis.requiresAuth,
    };
  }

  /**
   * Enhance entity with blueprint config
   * - Merges AI-detected fields with blueprint defaults
   * - Adds missing blueprint fields automatically
   * - Validates relationships
   */
  private validateEntityWithConfig(
    entity: EnhancedEntityDefinition,
    config: NonNullable<Blueprint['entityConfig']>[string],
    blueprint: Blueprint
  ): EnhancedEntityDefinition {
    const fieldMap = new Map<string, EnhancedFieldDefinition>();

    // Normalize field name for comparison - convert to camelCase
    // stock_quantity and stockQuantity both become "stockQuantity"
    const normalizeFieldName = (name: string): string => camelCase(name);

    // First, add all blueprint default fields (stored as camelCase)
    if (config.defaultFields) {
      for (const blueprintField of config.defaultFields) {
        const normalizedKey = normalizeFieldName(blueprintField.name);
        fieldMap.set(normalizedKey, {
          name: camelCase(blueprintField.name), // camelCase for JS/TS
          type: (blueprintField.type as EnhancedFieldDefinition['type']) || 'string',
          required: blueprintField.required ?? false,
        });
      }
    }

    // Then, merge/override with AI-detected fields
    for (const field of entity.fields) {
      const normalizedKey = normalizeFieldName(field.name);
      const blueprintField = config.defaultFields?.find(
        f => normalizeFieldName(f.name) === normalizedKey
      );

      if (blueprintField) {
        // Merge: use blueprint type but keep other AI-detected metadata
        fieldMap.set(normalizedKey, {
          ...field,
          name: camelCase(blueprintField.name), // camelCase for JS/TS
          type: (blueprintField.type as EnhancedFieldDefinition['type']) || field.type,
          required: blueprintField.required ?? field.required,
        });
      } else {
        // AI detected a field not in blueprint - keep it as camelCase
        fieldMap.set(normalizedKey, {
          ...field,
          name: camelCase(field.name),
        });
      }
    }

    const validatedFields = Array.from(fieldMap.values());

    // Merge relationships: use AI-detected + add missing from blueprint
    const relationshipMap = new Map<string, EntityRelationship>();

    // Add blueprint relationships first
    if (config.relationships) {
      for (const rel of config.relationships) {
        relationshipMap.set(rel.target.toLowerCase(), {
          type: rel.type as EntityRelationship['type'],
          targetEntity: rel.target,
          cascadeDelete: true,
        });
      }
    }

    // Override with AI-detected relationships
    if (entity.relationships) {
      for (const rel of entity.relationships) {
        relationshipMap.set(rel.targetEntity.toLowerCase(), rel);
      }
    }

    const validatedRelationships = Array.from(relationshipMap.values());

    return {
      ...entity,
      fields: validatedFields,
      relationships: validatedRelationships.length > 0 ? validatedRelationships : undefined,
      timestamps: blueprint.commonFields.timestamps,
      softDelete: blueprint.commonFields.softDelete,
      userOwnership: entity.userOwnership ?? blueprint.commonFields.userOwnership,
    };
  }

  /**
   * Analyze prompt using AI to extract comprehensive app structure
   */
  async analyzePrompt(prompt: string): Promise<EnhancedAppAnalysis> {
    const availableTypes = getAvailableAppTypes().join(', ');

    const systemMessage = `You are an expert software architect. Analyze the user's app request and extract a comprehensive data model.

IMPORTANT: You must use one of these app types: ${availableTypes}
Do NOT use any other app type. If the request doesn't match any of these, choose the closest match.

Return a JSON object with this exact structure:
{
  "appType": "${availableTypes}",
  "features": ["authentication", "search", "filtering", "pagination", "sorting", ...],
  "entities": [
    {
      "name": "EntityName",
      "displayName": "Human Readable Name",
      "fields": [
        {
          "name": "fieldName",
          "type": "string|text|number|integer|decimal|boolean|date|datetime|email|url|phone|image|file|enum|json|array",
          "required": true,
          "unique": false,
          "enumValues": ["value1", "value2"],
          "searchable": true,
          "filterable": true,
          "sortable": true
        }
      ],
      "relationships": [
        {
          "type": "belongsTo|hasMany|hasOne|manyToMany",
          "targetEntity": "OtherEntity",
          "foreignKey": "other_entity_id",
          "junctionTable": "entity_others",
          "cascadeDelete": true
        }
      ],
      "timestamps": true,
      "softDelete": false,
      "userOwnership": true
    }
  ],
  "enums": [
    { "name": "StatusEnum", "values": ["draft", "published", "archived"] }
  ],
  "uiComponents": ["Navbar", "Sidebar", "Card", "Table", "Form", "Modal", ...],
  "apiEndpoints": ["GET /api/items", "POST /api/items", ...]
}

RELATIONSHIP RULES:
- belongsTo: This entity has a foreign key to another (e.g., Post belongsTo Category means posts table has category_id)
- hasMany: Another entity has FK to this (e.g., Category hasMany Posts - inverse of belongsTo)
- hasOne: One-to-one relationship
- manyToMany: Requires junction table (e.g., Post manyToMany Tags creates post_tags table)

FIELD TYPE GUIDELINES:
- string: Short text (names, titles) - max 255 chars
- text: Long text (descriptions, content)
- number/integer: Whole numbers
- decimal: Money, prices, precise numbers
- boolean: True/false flags
- date: Date only
- datetime: Date with time
- email: Email addresses
- url: URLs/links
- phone: Phone numbers
- image/file: File paths/URLs
- enum: Fixed set of values (specify enumValues)
- json: Complex nested data
- array: Lists of items

USER OWNERSHIP (userOwnership field):
Set "userOwnership": true ONLY for entities that belong directly to a user:
- Orders, Cart, Wishlist, UserProfile, Bookings, Tasks, Notes → userOwnership: true

Set "userOwnership": false for:
- Global/shared entities: Categories, Products, Tags, Services → userOwnership: false
- Child/detail entities: OrderItems, CartItems, BookingSlots → userOwnership: false

Be comprehensive but not over-engineered. Include relationships where they make sense.`;

    const response = await this.aiService.generateText(prompt, {
      systemMessage,
      temperature: 0.3,
      maxTokens: 4000,
      responseFormat: 'json_object',
    });

    const parsed = JSON.parse(response);
    return this.validateAnalysisStrict(parsed);
  }

  /**
   * STRICT: Validate AI analysis response - no defaults, throw on missing data
   */
  private validateAnalysisStrict(parsed: any): EnhancedAppAnalysis {
    // STRICT: appType is required
    if (!parsed.appType || typeof parsed.appType !== 'string') {
      throw new BlueprintValidationError(
        'AI analysis did not return a valid appType. Please try again with a clearer prompt.'
      );
    }

    // STRICT: Check if appType has a blueprint
    if (!hasBlueprint(parsed.appType)) {
      throw new MissingBlueprintError(parsed.appType);
    }

    // STRICT: entities array is required
    if (!Array.isArray(parsed.entities) || parsed.entities.length === 0) {
      throw new BlueprintValidationError(
        'AI analysis did not detect any entities. Please describe what data your app needs to manage.'
      );
    }

    // Validate each entity strictly
    const entities: EnhancedEntityDefinition[] = parsed.entities.map((entity: any, index: number) => {
      // STRICT: entity name is required
      if (!entity.name || typeof entity.name !== 'string') {
        throw new BlueprintValidationError(
          `Entity at index ${index} has no name. Each entity must have a name.`
        );
      }

      // STRICT: fields array is required
      if (!Array.isArray(entity.fields) || entity.fields.length === 0) {
        throw new BlueprintValidationError(
          `Entity "${entity.name}" has no fields. Each entity must have at least one field.`
        );
      }

      // Validate each field strictly
      const fields: EnhancedFieldDefinition[] = entity.fields.map((field: any, fieldIndex: number) => {
        // STRICT: field name is required
        if (!field.name || typeof field.name !== 'string') {
          throw new BlueprintValidationError(
            `Field at index ${fieldIndex} in entity "${entity.name}" has no name.`
          );
        }

        // STRICT: field type is required
        if (!field.type || typeof field.type !== 'string') {
          throw new BlueprintValidationError(
            `Field "${field.name}" in entity "${entity.name}" has no type.`
          );
        }

        // Validate field type is known
        if (!FIELD_TYPE_TO_DB[field.type]) {
          throw new BlueprintValidationError(
            `Field "${field.name}" in entity "${entity.name}" has unknown type "${field.type}". ` +
            `Valid types: ${Object.keys(FIELD_TYPE_TO_DB).join(', ')}`
          );
        }

        return {
          name: field.name,
          type: field.type,
          required: field.required ?? false,
          unique: field.unique ?? false,
          enumValues: field.enumValues,
          searchable: field.searchable ?? false,
          filterable: field.filterable ?? false,
          sortable: field.sortable ?? false,
        };
      });

      // Validate relationships if present
      const relationships: EntityRelationship[] = [];
      if (Array.isArray(entity.relationships)) {
        for (const rel of entity.relationships) {
          // Normalize relationship type - accept belongsToMany as alias for manyToMany
          let relType = rel.type;
          if (relType === 'belongsToMany') {
            relType = 'manyToMany';
          }

          // STRICT: relationship type is required
          if (!relType || !['belongsTo', 'hasMany', 'hasOne', 'manyToMany'].includes(relType)) {
            throw new BlueprintValidationError(
              `Invalid relationship type "${rel.type}" in entity "${entity.name}". ` +
              `Valid types: belongsTo, hasMany, hasOne, manyToMany, belongsToMany`
            );
          }

          // STRICT: targetEntity is required
          if (!rel.targetEntity || typeof rel.targetEntity !== 'string') {
            throw new BlueprintValidationError(
              `Relationship in entity "${entity.name}" has no targetEntity.`
            );
          }

          relationships.push({
            type: relType as 'belongsTo' | 'hasMany' | 'hasOne' | 'manyToMany',
            targetEntity: rel.targetEntity,
            foreignKey: rel.foreignKey,
            junctionTable: rel.junctionTable,
            cascadeDelete: rel.cascadeDelete ?? true,
          });
        }
      }

      return {
        name: entity.name,
        displayName: entity.displayName || entity.name,
        fields,
        relationships: relationships.length > 0 ? relationships : undefined,
        timestamps: entity.timestamps ?? true,
        softDelete: entity.softDelete ?? false,
        userOwnership: entity.userOwnership,
      };
    });

    // Extract enums strictly
    const enums: EnumDefinition[] = [];
    if (Array.isArray(parsed.enums)) {
      for (const e of parsed.enums) {
        if (!e.name || typeof e.name !== 'string') {
          throw new BlueprintValidationError('Enum definition has no name.');
        }
        if (!Array.isArray(e.values) || e.values.length === 0) {
          throw new BlueprintValidationError(`Enum "${e.name}" has no values.`);
        }
        enums.push({ name: e.name, values: e.values });
      }
    }

    // Determine if auth is required
    const features = Array.isArray(parsed.features) ? parsed.features : [];
    // Most app types need authentication for user-specific data
    const appTypesRequiringAuth = [
      'todo', 'dashboard', 'ecommerce', 'social', 'crm', 'inventory', 'booking', 'blog',
      'project', 'task-manager', 'notes', 'calendar', 'finance', 'portfolio', 'learning',
      'health', 'fitness', 'recipes', 'travel', 'music', 'videos', 'chat', 'forum',
    ];
    // Check for various ways auth might be indicated in features
    const hasAuthFeature = features.some(f =>
      ['auth', 'authentication', 'login', 'user-management', 'accounts'].includes(f.toLowerCase())
    );
    // Also check the AI response for explicit requiresAuth flag
    const requiresAuth = hasAuthFeature || appTypesRequiringAuth.includes(parsed.appType) || parsed.requiresAuth === true;

    return {
      appType: parsed.appType,
      features,
      entities,
      enums,
      uiComponents: Array.isArray(parsed.uiComponents) ? parsed.uiComponents : [],
      apiEndpoints: Array.isArray(parsed.apiEndpoints) ? parsed.apiEndpoints : [],
      requiresAuth,
    };
  }

  /**
   * Generate database schema from analyzed entities with relationships
   */
  private generateSchema(analysis: EnhancedAppAnalysis): DatabaseSchema {
    const tables: TableSchema[] = [];
    const junctionTables: TableSchema[] = [];

    const reservedColumns = new Set([
      'id',
      'user_id',
      'created_at',
      'updated_at',
      'deleted_at',
    ]);

    for (const entity of analysis.entities) {
      const tableName = pluralize.plural(snakeCase(entity.name));
      const existingColumnNames = new Set<string>(['id']);

      const columns: any[] = [
        { name: 'id', type: 'uuid', primaryKey: true },
      ];

      const addColumnIfNotExists = (column: any) => {
        if (!existingColumnNames.has(column.name)) {
          existingColumnNames.add(column.name);
          columns.push(column);
          return true;
        }
        return false;
      };

      // Add field columns
      for (const field of entity.fields) {
        const columnName = snakeCase(field.name);
        if (reservedColumns.has(columnName)) {
          continue;
        }
        addColumnIfNotExists({
          name: columnName,
          type: this.mapEnhancedFieldTypeToDb(field.type),
          nullable: !field.required,
          unique: field.unique || false,
        });
      }

      // Add FK columns for belongsTo relationships
      if (entity.relationships) {
        for (const rel of entity.relationships) {
          if (rel.type === 'belongsTo') {
            const fkColumn = rel.foreignKey || `${snakeCase(rel.targetEntity)}_id`;
            const isUserRelation = rel.targetEntity.toLowerCase() === 'user';
            const targetTable = isUserRelation
              ? 'auth.users'
              : pluralize.plural(snakeCase(rel.targetEntity));

            addColumnIfNotExists({
              name: fkColumn,
              type: 'uuid',
              nullable: true,
              references: `${targetTable}.id`,
            });
          }
        }
      }

      // Add user ownership FK if entity requires it
      if (entity.userOwnership !== false) {
        addColumnIfNotExists({
          name: 'user_id',
          type: 'uuid',
          references: 'auth.users.id'
        });
      }

      // Add soft delete column if enabled
      if (entity.softDelete) {
        addColumnIfNotExists({
          name: 'deleted_at',
          type: 'timestamptz',
          nullable: true
        });
      }

      // Add timestamps
      if (entity.timestamps !== false) {
        addColumnIfNotExists({ name: 'created_at', type: 'timestamptz' });
        addColumnIfNotExists({ name: 'updated_at', type: 'timestamptz' });
      }

      tables.push({ name: tableName, columns });

      // Create junction tables for manyToMany relationships
      if (entity.relationships) {
        for (const rel of entity.relationships) {
          if (rel.type === 'manyToMany') {
            const junctionTable = this.createJunctionTable(entity.name, rel);
            if (!junctionTables.some(t => t.name === junctionTable.name)) {
              junctionTables.push(junctionTable);
            }
          }
        }
      }
    }

    return { tables: [...tables, ...junctionTables] };
  }

  /**
   * Create junction table for many-to-many relationship
   */
  private createJunctionTable(entityName: string, rel: EntityRelationship): TableSchema {
    const table1 = snakeCase(entityName);
    const table2 = snakeCase(rel.targetEntity);
    const [first, second] = [table1, table2].sort();
    const junctionTableName = rel.junctionTable || `${first}_${pluralize.plural(second)}`;

    return {
      name: junctionTableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        {
          name: `${table1}_id`,
          type: 'uuid',
          references: `${pluralize.plural(table1)}.id`,
        },
        {
          name: `${table2}_id`,
          type: 'uuid',
          references: `${pluralize.plural(table2)}.id`,
        },
        { name: 'created_at', type: 'timestamptz' },
      ],
    };
  }

  /**
   * Create entity tables in the app database
   */
  async createEntityTables(databaseName: string, schema: DatabaseSchema, appPrefix: string): Promise<void> {
    this.logger.log(`Creating entity tables in database: ${databaseName} (prefix: ${appPrefix})`);

    const sortedTables = this.sortTablesByDependencies(schema.tables);

    for (const table of sortedTables) {
      const prefixedTableName = `${appPrefix}_${table.name}`;

      const columns = table.columns.map((col) => {
        let colDef = `"${col.name}" ${this.mapToPostgresType(col.type)}`;

        if (col.primaryKey) {
          colDef += ' PRIMARY KEY DEFAULT uuid_generate_v4()';
        } else if (col.references) {
          const refTable = col.references.replace('.id', '');
          const isAuthRef = refTable.startsWith('auth.');
          const actualRefTable = isAuthRef ? refTable : `${appPrefix}_${refTable.replace('public.', '')}`;
          colDef += col.nullable ? '' : ' NOT NULL';
          colDef += ` REFERENCES ${actualRefTable}(id) ON DELETE CASCADE`;
        } else if (col.name === 'created_at' || col.name === 'updated_at') {
          colDef += ' DEFAULT NOW()';
        } else if (!col.nullable && !col.primaryKey) {
          colDef += ' NOT NULL';
        }

        return colDef;
      });

      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public."${prefixedTableName}" (
          ${columns.join(',\n          ')}
        )
      `;

      await this.platformService.executeOnAppDatabase(databaseName, createTableSQL);
      this.logger.log(`   ✅ Created table: ${prefixedTableName}`);

      // Create indexes
      if (table.columns.some((c) => c.name === 'user_id')) {
        await this.platformService.executeOnAppDatabase(
          databaseName,
          `CREATE INDEX IF NOT EXISTS idx_${prefixedTableName}_user_id ON public."${prefixedTableName}"(user_id)`
        );
      }
      if (table.columns.some((c) => c.name === 'created_at')) {
        await this.platformService.executeOnAppDatabase(
          databaseName,
          `CREATE INDEX IF NOT EXISTS idx_${prefixedTableName}_created_at ON public."${prefixedTableName}"(created_at)`
        );
      }
    }
  }

  /**
   * Map schema type to PostgreSQL type
   */
  private mapToPostgresType(type: string): string {
    const mapping: Record<string, string> = {
      uuid: 'UUID',
      text: 'TEXT',
      string: 'VARCHAR(255)',
      integer: 'INTEGER',
      bigint: 'BIGINT',
      boolean: 'BOOLEAN',
      timestamptz: 'TIMESTAMP WITH TIME ZONE',
      jsonb: 'JSONB',
    };
    return mapping[type] || 'TEXT';
  }

  /**
   * Sort tables by foreign key dependencies using topological sort
   */
  private sortTablesByDependencies(tables: TableSchema[]): TableSchema[] {
    const dependencies = new Map<string, Set<string>>();
    const tableMap = new Map<string, TableSchema>();
    const tableNames = new Set(tables.map(t => t.name));

    for (const table of tables) {
      tableMap.set(table.name, table);
      dependencies.set(table.name, new Set());

      for (const col of table.columns) {
        if (col.references) {
          const refTable = col.references.replace('.id', '');
          // Skip auth references (handled separately)
          if (refTable.startsWith('auth.')) {
            continue;
          }
          // Skip self-references - table can reference itself
          if (refTable === table.name) {
            continue;
          }
          if (tableNames.has(refTable)) {
            dependencies.get(table.name)!.add(refTable);
          }
        }
      }
    }

    const sorted: TableSchema[] = [];
    const inDegree = new Map<string, number>();
    const processed = new Set<string>();

    for (const [tableName, deps] of dependencies) {
      inDegree.set(tableName, deps.size);
    }

    const queue: string[] = [];
    for (const [tableName, degree] of inDegree) {
      if (degree === 0) {
        queue.push(tableName);
      }
    }

    let iterations = 0;
    const maxIterations = tables.length * tables.length;

    while (queue.length > 0 && iterations < maxIterations) {
      iterations++;
      const current = queue.shift()!;

      if (processed.has(current)) continue;
      processed.add(current);

      sorted.push(tableMap.get(current)!);

      for (const [tableName, deps] of dependencies) {
        if (deps.has(current)) {
          deps.delete(current);
          const newDegree = deps.size;
          inDegree.set(tableName, newDegree);
          if (newDegree === 0 && !processed.has(tableName)) {
            queue.push(tableName);
          }
        }
      }
    }

    for (const table of tables) {
      if (!processed.has(table.name)) {
        this.logger.warn(`Possible circular dependency detected for table: ${table.name}`);
        sorted.push(table);
      }
    }

    this.logger.log(`📋 Sorted table order: ${sorted.map(t => t.name).join(' -> ')}`);

    return sorted;
  }

  /**
   * Create app in Fluxez platform
   */
  async createPlatformApp(appName: string, appType: string): Promise<GeneratedKeys> {
    this.logger.log(`Creating app in Fluxez platform: ${appName}`);

    const registration = await this.platformService.createApp({
      name: appName,
      description: `Generated ${appType} app`,
      type: 'web',
      framework: 'hono',
      frameworks: ['hono', 'react'],
    });

    const jwtSecret = `jwt_${crypto.randomBytes(32).toString('hex')}`;

    return {
      appId: registration.appId,
      databaseName: registration.databaseName,
      serviceRoleKey: registration.serviceRoleKey,
      anonKey: registration.anonKey,
      jwtSecret,
    };
  }

  /**
   * Write generated files to disk
   */
  private async writeFilesToDisk(
    outputPath: string,
    frontendFiles: GeneratedFile[],
    backendFiles: GeneratedFile[],
    mobileFiles: GeneratedFile[] = [],
  ): Promise<void> {
    const frontendDir = path.join(outputPath, 'frontend');
    const backendDir = path.join(outputPath, 'backend');
    const mobileDir = path.join(outputPath, 'mobile');

    await fs.mkdir(frontendDir, { recursive: true });
    await fs.mkdir(backendDir, { recursive: true });
    await fs.mkdir(mobileDir, { recursive: true });

    for (const file of frontendFiles) {
      const filePath = path.join(frontendDir, file.path);
      const fileDir = path.dirname(filePath);
      await fs.mkdir(fileDir, { recursive: true });
      await fs.writeFile(filePath, file.content, 'utf-8');
    }

    for (const file of backendFiles) {
      const filePath = path.join(backendDir, file.path);
      const fileDir = path.dirname(filePath);
      await fs.mkdir(fileDir, { recursive: true });
      await fs.writeFile(filePath, file.content, 'utf-8');
    }

    for (const file of mobileFiles) {
      const filePath = path.join(mobileDir, file.path);
      const fileDir = path.dirname(filePath);
      await fs.mkdir(fileDir, { recursive: true });
      await fs.writeFile(filePath, file.content, 'utf-8');
    }

    this.logger.log(`Written ${frontendFiles.length} frontend files, ${backendFiles.length} backend files, and ${mobileFiles.length} mobile files`);
  }

  /**
   * Map enhanced field type to PostgreSQL type
   */
  private mapEnhancedFieldTypeToDb(type: string): string {
    return FIELD_TYPE_TO_DB[type] || 'TEXT';
  }

  /**
   * Save app to database
   */
  private async saveApp(data: {
    id: string;
    userId: string;
    name: string;
    slug: string;
    prompt: string;
    appType: string;
    conversationId?: string;
    outputPath: string;
    keys: GeneratedKeys;
  }): Promise<void> {
    try {
      await this.db.insert('user_apps', {
        id: data.id,
        user_id: data.userId,
        name: data.name,
        slug: data.slug,
        generation_prompt: data.prompt,
        app_type: data.appType,
        conversation_id: data.conversationId || null,
        output_path: data.outputPath,
        status: 'generated',
        frontend_framework: 'react',
        backend_framework: 'hono',
        has_frontend: true,
        has_backend: true,
        secrets: JSON.stringify({
          serviceRoleKey: data.keys.serviceRoleKey,
          anonKey: data.keys.anonKey,
          jwtSecret: data.keys.jwtSecret,
          databaseName: data.keys.databaseName,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      });
      this.logger.log(`App saved to database: ${data.id}`);
    } catch (error) {
      this.logger.error('Failed to save app:', error.message);
    }
  }

  // Utility Methods
  private generateSlug(input: string): string {
    return kebabCase(input).substring(0, 50);
  }

  private generateAppName(appType: string): string {
    // Common app name mappings for better naming
    const names: Record<string, string> = {
      // Ecommerce family
      ecommerce: 'My Store',
      store: 'My Store',
      shop: 'My Store',
      marketplace: 'My Marketplace',
      // Blog/CMS family
      blog: 'My Blog',
      cms: 'My CMS',
      content: 'My Content Site',
      // Business apps
      saas: 'My Dashboard',
      dashboard: 'My Dashboard',
      admin: 'My Admin',
      crm: 'My CRM',
      sales: 'My Sales CRM',
      // Project management
      project: 'My Projects',
      projectmanagement: 'My Projects',
      tasks: 'My Tasks',
      kanban: 'My Kanban',
      // Social
      social: 'My Social',
      socialnetwork: 'My Social Network',
      forum: 'My Forum',
      // Booking/Scheduling
      booking: 'My Bookings',
      appointment: 'My Appointments',
      scheduling: 'My Scheduler',
      salon: 'My Salon',
      spa: 'My Spa',
      // Learning
      lms: 'My Learning',
      learning: 'My Learning',
      course: 'My Courses',
      education: 'My Education',
      training: 'My Training',
      tutoring: 'My Tutoring',
      // Real Estate
      realestate: 'My Properties',
      property: 'My Properties',
      rental: 'My Rentals',
      housing: 'My Housing',
      // Food & Restaurant
      restaurant: 'My Restaurant',
      food: 'My Food',
      fooddelivery: 'My Delivery',
      cafe: 'My Cafe',
      menu: 'My Menu',
      foodtruck: 'My Food Truck',
      catering: 'My Catering',
      bakery: 'My Bakery',
      recipe: 'My Recipes',
      // Jobs & HR
      jobboard: 'My Job Board',
      jobs: 'My Jobs',
      careers: 'My Careers',
      recruitment: 'My Recruitment',
      hiring: 'My Hiring',
      freelance: 'My Freelance',
      // Inventory & Logistics
      inventory: 'My Inventory',
      warehouse: 'My Warehouse',
      stock: 'My Stock',
      erp: 'My ERP',
      logistics: 'My Logistics',
      // Healthcare
      healthcare: 'My Healthcare',
      medical: 'My Medical',
      clinic: 'My Clinic',
      hospital: 'My Hospital',
      patient: 'My Patients',
      dental: 'My Dental',
      pharmacy: 'My Pharmacy',
      vetclinic: 'My Vet Clinic',
      // Fitness
      fitness: 'My Fitness',
      gym: 'My Gym',
      workout: 'My Workouts',
      health: 'My Health',
      yoga: 'My Yoga Studio',
      crossfit: 'My CrossFit',
      // Travel & Hospitality
      travel: 'My Travel',
      tourism: 'My Tourism',
      hotel: 'My Hotel',
      flight: 'My Flights',
      vacation: 'My Vacation',
      travelagency: 'My Travel Agency',
      carrental: 'My Car Rental',
      // Events
      event: 'My Events',
      events: 'My Events',
      conference: 'My Conference',
      eventvenue: 'My Venue',
      wedding: 'My Wedding',
      // Support & Services
      helpdesk: 'My Help Desk',
      support: 'My Support',
      // Media
      portfolio: 'My Portfolio',
      photography: 'My Photography',
      artgallery: 'My Gallery',
      music: 'My Music',
      video: 'My Videos',
      podcast: 'My Podcast',
      news: 'My News',
      cinema: 'My Cinema',
      // Finance
      banking: 'My Banking',
      insurance: 'My Insurance',
      accounting: 'My Accounting',
      // Legal
      legal: 'My Legal',
      lawfirm: 'My Law Firm',
      // Personal & Lifestyle
      dating: 'My Dating',
      pet: 'My Pets',
      petboarding: 'My Pet Boarding',
      // Commerce variants
      auction: 'My Auction',
      crowdfunding: 'My Crowdfunding',
      subscription: 'My Subscriptions',
      membership: 'My Membership',
      // Organizations
      church: 'My Church',
      school: 'My School',
      nonprofit: 'My Nonprofit',
      coworking: 'My Coworking',
      library: 'My Library',
      nursery: 'My Nursery',
      // Services
      laundry: 'My Laundry',
      cleaning: 'My Cleaning',
      moving: 'My Moving',
      storage: 'My Storage',
      printing: 'My Print Shop',
      printshop: 'My Print Shop',
      autorepair: 'My Auto Repair',
      florist: 'My Florist',
      tailor: 'My Tailor',
      optician: 'My Optician',
      jeweler: 'My Jewelry',
      // Misc
      survey: 'My Surveys',
      referral: 'My Referrals',
      consulting: 'My Consulting',
      interiordesign: 'My Interior Design',
      marketing: 'My Marketing',
      security: 'My Security',
      parking: 'My Parking',
      funeral: 'My Funeral Home',
      marina: 'My Marina',
      campground: 'My Campground',
      golf: 'My Golf Course',
      skiresort: 'My Ski Resort',
      brewery: 'My Brewery',
      escaperoom: 'My Escape Room',
      musicschool: 'My Music School',
      dancestudio: 'My Dance Studio',
    };

    // Return mapping if exists, otherwise generate a smart name from the app type
    if (names[appType]) {
      return names[appType];
    }

    // Fallback: Convert app type to a readable name
    // e.g., "fireprotection" -> "My Fire Protection"
    const formatted = appType
      .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase to spaces
      .split(/[-_\s]+/) // split on separators
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return `My ${formatted}`;
  }
}
