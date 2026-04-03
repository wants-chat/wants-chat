import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppDto {
  @ApiProperty({
    description: 'The prompt describing what app to create',
    example: 'Create an ecommerce store with products, categories, and shopping cart',
    minLength: 10,
  })
  @IsString()
  @MinLength(10, { message: 'Prompt must be at least 10 characters' })
  prompt: string;

  // Internal fields - not exposed in Swagger
  @IsOptional()
  @IsString()
  appName?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  conversationId?: string;
}

export class AnalyzePromptDto {
  @ApiProperty({
    description: 'The prompt to analyze',
    example: 'A blog with posts and comments',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  prompt: string;
}

export interface GeneratedKeys {
  appId: string;
  databaseName: string;
  serviceRoleKey: string;
  anonKey: string;
  jwtSecret: string;
}

export interface GeneratedApp {
  id: string;
  name: string;
  slug: string;
  prompt: string;
  appType: string; // The detected app type (e.g., 'ecommerce', 'blog', 'crm')
  outputPath: string;
  frontend: {
    framework: string;
    path: string;
    fileCount: number;
  };
  backend: {
    framework: string;
    path: string;
    fileCount: number;
  };
  mobile?: {
    framework: string;
    path: string;
    fileCount: number;
  };
  schema: DatabaseSchema;
  keys?: {
    appId: string;
    anonKey: string;
  };
  features: string[]; // List of detected features
  createdAt: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface DatabaseSchema {
  tables: TableSchema[];
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable?: boolean;
  primaryKey?: boolean;
  references?: string;
}

export interface AppAnalysis {
  appType: string;
  features: string[];
  entities: EntityDefinition[];
  uiComponents: string[];
  apiEndpoints: string[];
  requiresAuth: boolean;
}

export interface EntityDefinition {
  name: string;
  fields: FieldDefinition[];
}

export interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  required?: boolean;
}

// ============================================
// Enhanced Types for Comprehensive App Generation
// ============================================

// Enhanced field types for more precise schema generation
export type EnhancedFieldType =
  | 'string' | 'text' | 'number' | 'integer' | 'decimal'
  | 'boolean' | 'date' | 'datetime'
  | 'email' | 'url' | 'phone' | 'image' | 'file'
  | 'enum' | 'json' | 'array' | 'uuid';

// Relationship types for entity connections
export type RelationType = 'belongsTo' | 'hasMany' | 'hasOne' | 'manyToMany';

// Relationship definition between entities
export interface EntityRelationship {
  type: RelationType;
  targetEntity: string;
  foreignKey?: string;
  junctionTable?: string;
  cascadeDelete?: boolean;
  inverseField?: string;
}

// Enhanced field definition with more metadata
export interface EnhancedFieldDefinition {
  name: string;
  type: EnhancedFieldType;
  required?: boolean;
  unique?: boolean;
  default?: any;
  enumValues?: string[];
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
}

// Enhanced entity definition with relationships
export interface EnhancedEntityDefinition {
  name: string;
  displayName?: string;
  fields: EnhancedFieldDefinition[];
  relationships?: EntityRelationship[];
  timestamps?: boolean;
  softDelete?: boolean;
  userOwnership?: boolean;
}

// Enum definition extracted from AI analysis
export interface EnumDefinition {
  name: string;
  values: string[];
}

// Enhanced app analysis with relationships and enums
export interface EnhancedAppAnalysis {
  appType: string;
  features: string[];
  entities: EnhancedEntityDefinition[];
  enums: EnumDefinition[];
  uiComponents: string[];
  apiEndpoints: string[];
  requiresAuth: boolean;
}

// ============================================
// Build Validation Types
// ============================================

export type BuildStatus = 'pending' | 'building' | 'success' | 'failed' | 'repaired' | 'partial';

export interface BuildErrorInfo {
  file: string;
  line: number;
  column: number;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface PlatformBuildResult {
  platform: 'frontend' | 'backend' | 'mobile';
  success: boolean;
  errorCount: number;
  warningCount: number;
  errors: BuildErrorInfo[];
}

export interface AppBuildResult {
  status: BuildStatus;
  frontend: PlatformBuildResult | null;
  backend: PlatformBuildResult | null;
  mobile: PlatformBuildResult | null;
  totalErrors: number;
  totalWarnings: number;
  repairAttempts: number;
  repairSuccess: boolean;
  duration: number;
}

export interface GeneratedAppWithBuild extends GeneratedApp {
  buildResult?: AppBuildResult;
}
