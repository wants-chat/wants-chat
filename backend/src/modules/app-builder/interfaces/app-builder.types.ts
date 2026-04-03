/**
 * App Builder Type Definitions
 *
 * Core types for the declarative app building system.
 * Based on the principle: Catalog → Parse → Generate
 */

// ============================================================================
// 1. APP TYPE & DOMAIN
// ============================================================================

/**
 * No AppType type needed - use APP_TYPE_CATALOG and AppTypeCatalog interface.
 * See: catalogs/app-types/index.ts
 */

export type Platform = 'web' | 'mobile' | 'desktop';

// ============================================================================
// 2. SECTION → PAGES → COMPONENTS HIERARCHY
// ============================================================================

export interface Section {
  id: string;
  name: string;
  icon?: string;
  order: number;
  routePrefix?: string; // Optional route prefix for backend routes (e.g., 'artist', 'admin')
  role?: string; // Optional role for this section (e.g., 'admin', 'doctor', 'patient')
  pages: Page[];
}

export interface Page {
  id: string;
  name: string;
  route: string;
  authRequired: boolean;
  roles?: string[]; // Optional role-based access control: ['admin'], ['customer'], ['admin', 'customer']
  layout: 'default' | 'minimal' | 'dashboard' | 'centered';
  components: Component[];
}

// ============================================================================
// 3. COMPONENTS (The Building Blocks)
// ============================================================================

// Import comprehensive ComponentType enum (313+ types)
import { ComponentType } from './component-types.enum';
export { ComponentType };

export interface Component {
  id: string;
  type: ComponentType;
  title?: string;
  position: {
    row: number;
    col: number;
    span: number;
  };

  // Data & Actions are the core
  data: ComponentData;
  actions: ComponentAction[];

  // UI props (component-specific)
  props?: Record<string, any>;
}

// ============================================================================
// 4. DATA STRUCTURE (Including Nested)
// ============================================================================

export interface ComponentData {
  // Primary entity this component displays/manages
  entity: string; // e.g., "appointments", "users", "products"

  // Fields to display/edit
  fields: DataField[];

  // Nested/related data
  relations?: ComponentRelation[];

  // How to fetch the data (optional - not needed for forms that only submit)
  fetchOperation?: FetchOperation;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface DataField {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'email' | 'phone' | 'url' | 'file' | 'image' | 'video' | 'audio' | 'select' | 'textarea';
  label?: string;
  required?: boolean;
  validation?: FieldValidation;
  defaultValue?: any;
  // Static options for select fields
  options?: SelectOption[];
  // Dynamic options from another entity
  optionsFrom?: string;    // Entity name to fetch options from (e.g., 'expense_categories')
  labelField?: string;     // Field to display as option label (e.g., 'name')
  valueField?: string;     // Field to use as option value (e.g., 'id')
  // Legacy dataSource (for backwards compatibility)
  dataSource?: {
    entity: string;       // Entity to fetch options from (e.g., 'albums')
    endpoint: string;     // API endpoint to fetch data (e.g., '/api/v1/artist/albums')
    labelField: string;   // Field to display as option label (e.g., 'title')
    valueField: string;   // Field to use as option value (e.g., 'id')
  };
  // Upload configuration for file/image/video/audio fields
  uploadConfig?: {
    endpoint: string;     // API endpoint for upload (e.g., '/storage/upload')
    bucket: string;       // Storage bucket name (e.g., 'recipe-images')
    folder?: string;      // Optional folder path (e.g., 'recipes')
    accept?: string;      // File type restrictions (e.g., 'image/*')
    maxSize?: number;     // Max file size in bytes (e.g., 5242880 for 5MB)
  };
}

export interface ComponentRelation {
  entity: string; // Related entity name
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  foreignKey: string;
  displayField?: string; // Which field to show (e.g., "name" instead of "id")
}

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  custom?: string; // Custom validation function name
}

// ============================================================================
// 5. ACTIONS (Fetch & Mutations)
// ============================================================================

export type ActionType = 'fetch' | 'create' | 'update' | 'delete' | 'custom';

export interface ComponentAction {
  id: string;
  type: ActionType;
  trigger: 'onLoad' | 'onSubmit' | 'onClick' | 'onChange' | 'onDelete' | 'onEdit';

  // Server-side function reference (optional for navigation-only actions)
  serverFunction?: ServerFunction;

  // Navigation (for edit/view actions that just navigate)
  navigation?: {
    type: 'navigate';
    route: string;
  };

  // What happens after action completes
  onSuccess?: {
    message?: string;
    redirect?: string;
    refresh?: boolean;
  };
  onError?: {
    message?: string;
  };
}

// ============================================================================
// 6. FETCH OPERATIONS (Combined per Page)
// ============================================================================

export type FetchOperation =
  | PredefinedOperation
  | DynamicOperation;

export interface PredefinedOperation {
  type: 'predefined';
  operationId: string; // e.g., "get-user-appointments", "get-dashboard-stats"
}

export interface DynamicOperation {
  type: 'dynamic';
  method: 'findMany' | 'findOne' | 'findFirst' | 'count' | 'aggregate';
  entity: string;
  where?: WhereCondition;
  include?: string[]; // Related entities to include
  orderBy?: OrderBy;
  limit?: number;
  offset?: number;
}

export interface WhereCondition {
  [field: string]: any | WhereOperator;
}

export interface WhereOperator {
  equals?: any;
  not?: any;
  in?: any[];
  notIn?: any[];
  lt?: any;
  lte?: any;
  gt?: any;
  gte?: any;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
}

export interface OrderBy {
  field: string;
  direction: 'asc' | 'desc';
}

// ============================================================================
// 7. SERVER FUNCTIONS
// ============================================================================

export interface ServerFunction {
  id: string;
  name: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  route: string;

  // Parameters
  params: FunctionParams;

  // Response
  response: FunctionResponse;

  // What this function does
  operation: ServerOperation;
}

export interface FunctionParams {
  // From request body/query
  request?: ParamDefinition[];

  // From JWT (auto-extracted)
  jwt?: JWTParam[];

  // From route params
  route?: ParamDefinition[];
}

export interface ParamDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  validation?: FieldValidation;
}

export interface JWTParam {
  name: string; // e.g., "userId", "role", "tenantId"
  jwtField: string; // Field in JWT payload
  required: boolean;
}

export interface FunctionResponse {
  type: 'single' | 'list' | 'paginated' | 'success' | 'custom';
  entity?: string; // Entity returned
  fields?: string[]; // Specific fields to return
}

// ============================================================================
// 8. SERVER OPERATIONS (Predefined + Dynamic)
// ============================================================================

export type ServerOperation =
  | PredefinedServerOperation
  | DynamicServerOperation;

export interface PredefinedServerOperation {
  type: 'predefined';
  operationId: string; // e.g., "create-appointment-with-notification"
  // Predefined operations are pre-coded complex workflows
}

export interface DynamicServerOperation {
  type: 'dynamic';
  steps: OperationStep[];
}

export interface OperationStep {
  id: string;
  action: 'query' | 'mutate' | 'validate' | 'transform' | 'notify';
  config: Record<string, any>;
}

// ============================================================================
// 9. ENTITY STRUCTURE (Database Schema)
// ============================================================================

export interface Entity {
  name: string;
  tableName: string;
  fields: EntityField[];
  relations: EntityRelation[];
  indexes?: EntityIndex[];

  // Route customization options
  routeOptions?: EntityRouteOptions;
}

/**
 * Route customization options for entity API generation
 */
export interface EntityRouteOptions {
  // Enable /me routes for user-specific data (e.g., profiles)
  // GET /me - returns current user's record
  // PUT /me - updates current user's record
  enableMeRoutes?: boolean;

  // Field to use for user ownership (default: 'user_id')
  userOwnershipField?: string;

  // Auto-create record if not found on GET /me
  autoCreateOnMeGet?: boolean;

  // Default values when auto-creating on /me
  autoCreateDefaults?: Record<string, any>;

  // Enrich list results with related entity data
  enrichList?: EntityEnrichConfig[];

  // Check uniqueness before create (e.g., check if user already applied to job)
  // Generates GET /check/:paramId route
  uniquenessCheck?: EntityUniquenessCheck;

  // Company lookup configuration for entities that belong to a company
  companyLookup?: EntityCompanyLookup;
}

/**
 * Configuration for uniqueness check route (e.g., check if already applied/saved)
 */
export interface EntityUniquenessCheck {
  // Route parameter name (e.g., 'jobId' for /check/:jobId)
  routeParam: string;

  // Field in entity that matches the route param (e.g., 'job_id')
  entityField: string;

  // Field that holds the user reference (e.g., 'user_id', 'candidate_id')
  userField: string;

  // Response field names
  responseFields: {
    booleanField: string;  // e.g., 'hasApplied', 'hasSaved'
    dataField: string;     // e.g., 'application', 'savedJob'
  };
}

/**
 * Configuration for company lookup on entity creation
 */
export interface EntityCompanyLookup {
  // Field name that stores company reference (e.g., 'company_id')
  companyField: string;

  // Table to lookup company from owner (e.g., 'companies')
  companyTable: string;

  // Field in company table that references owner (e.g., 'owner_id')
  ownerField: string;

  // Optional: membership table for users who aren't owners
  membershipTable?: string;

  // Optional: field in membership table for user (e.g., 'user_id')
  membershipUserField?: string;

  // Optional: field in membership table for company (e.g., 'company_id')
  membershipCompanyField?: string;
}

/**
 * Configuration for enriching list results with related data
 */
export interface EntityEnrichConfig {
  // Relation field in this entity (e.g., 'job_id')
  relationField: string;

  // Target entity to fetch from (e.g., 'jobs')
  targetEntity: string;

  // Fields to extract from target entity
  extractFields: Array<{
    sourceField: string;  // Field in target entity (e.g., 'title')
    targetField: string;  // Field name in enriched result (e.g., 'job_title')
  }>;

  // Optional: if target has user relation, use this to get user info
  userRelation?: {
    field: string;        // e.g., 'candidate_id'
    profileEntity: string; // e.g., 'candidate_profiles'
    profileFields: Array<{
      sourceField: string;
      targetField: string;
    }>;
    // Combined name field (e.g., 'candidate_name', 'user_name')
    fullNameField?: string;
    // Source fields for full name construction (default: ['first_name', 'last_name'])
    nameSourceFields?: { firstName: string; lastName: string };
  };
}

/**
 * Auto-generate configuration for fields that need auto-generated values
 * Used for order numbers, invoice numbers, ticket numbers, etc.
 */
export interface AutoGenerateConfig {
  // Prefix for the generated value (e.g., 'ORD', 'INV', 'TKT')
  prefix: string;
  // Format pattern: 'timestamp' | 'random' | 'sequential' | 'timestamp-random'
  // Default: 'timestamp-random' which generates: PREFIX-TIMESTAMP-RANDOM
  format?: 'timestamp' | 'random' | 'sequential' | 'timestamp-random';
  // Length of random suffix (default: 6)
  randomLength?: number;
  // Separator between parts (default: '-')
  separator?: string;
}

export interface EntityField {
  name: string;
  type: 'uuid' | 'string' | 'integer' | 'decimal' | 'boolean' | 'timestamp' | 'date' | 'json' | 'text' | 'image';
  required: boolean;
  unique?: boolean;
  primaryKey?: boolean;
  default?: any;
  validation?: FieldValidation;
  // Auto-generate configuration for fields like order_number, invoice_number, etc.
  autoGenerate?: AutoGenerateConfig;
  uploadConfig?: {
    endpoint: string;
    bucket: string;
    folder: string;
    accept: string;
    maxSize: number;
  };
}

export interface EntityRelation {
  name: string;
  type: 'belongsTo' | 'hasMany' | 'hasOne' | 'manyToMany';
  targetEntity: string;
  foreignKey?: string;
  targetForeignKey?: string; // For many-to-many
  onDelete?: 'cascade' | 'set null' | 'restrict';
}

export interface EntityIndex {
  fields: string[];
  unique?: boolean;
  name?: string;
}

// ============================================================================
// 10. APP TYPE CATALOG
// ============================================================================

export interface RoleConfig {
  defaultRoute: string;
  roleName: string;
  aliases?: string[]; // Database role names that map to this role (e.g., ['user'] for 'patient')
  canAccess?: string[]; // Which route roles this role can access (e.g., ['admin', 'doctor', 'patient'])
}

export interface AppTypeCatalog {
  id: string;
  name: string;
  description: string;
  industry: string;
  requiresAuth: boolean;
  keywords: string[]; // Keywords for AI detection (e.g., ['inventory', 'stock', 'warehouse'])
  roleConfig?: Record<string, RoleConfig>; // Role-based redirect and access configuration
  sections: Section[];
  coreEntities: Entity[];
  features?: string[]; // Optional list of features (e.g., "authentication", "file-upload", etc.)
  routeMounts?: Array<{ path: string; entity: string }>; // Additional route mounts for entities (e.g., [{path: '/artist/tracks', entity: 'tracks'}])
}

// ============================================================================
// 11. APP BLUEPRINT (The Complete Structure)
// ============================================================================

export interface AppBlueprint {
  metadata: {
    id: string;
    name: string;
    description?: string; // Full prompt text for style detection during regeneration
    appType: string; // App type ID - use getAppTypeCatalog(id) to get the full catalog
    platform: Platform;
    generatedAt: string;
  };

  sections: Section[];
  entities: Entity[];

  // Global settings
  settings: {
    auth: {
      required: boolean;
      provider: 'fluxez' | 'custom';
      roles?: string[];
    };
    database: {
      type: 'postgres' | 'mysql' | 'sqlite';
    };
    features: string[]; // e.g., ["payments", "notifications", "file-upload"]
  };

  // UI style configuration (dynamically detected from prompt)
  uiStyle?: UIStyleVariant;
}

// ============================================================================
// 12. UI STYLE CONFIGURATION
// ============================================================================

/**
 * UI Style Variant - Defines the visual design system for the app
 * Detected from user prompt or randomly assigned for consistency
 */
export interface UIStyleVariant {
  // Core design style
  variant: 'glassmorphism' | 'neumorphism' | 'brutalist' | 'minimal' | 'corporate' | 'creative';

  // Color scheme
  colorScheme: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo' | 'teal' | 'red' | 'neutral' | 'warm';
}

/**
 * Style keywords for prompt detection
 */
export interface StyleKeywords {
  variant: Record<UIStyleVariant['variant'], string[]>;
  colorScheme: Record<UIStyleVariant['colorScheme'], string[]>;
}

// ============================================================================
// 13. GENERATION CONFIG
// ============================================================================

export interface GenerationConfig {
  outputPath: string;
  frameworks: Array<'react' | 'tauri' | 'react-native' | 'hono'>; // Array of selected frameworks
  features: {
    typescript: boolean;
    eslint: boolean;
    prettier: boolean;
    testing: boolean;
  };
}

// Framework types for generation
// Array format: ["react", "hono", "react-native", "tauri"]
// - "react" is required (always included, needed for Tier 3 simple apps)
// - "hono" is auto-added for catalog-based apps (Tier 1)
// - "tauri" combined with "react" creates React+Vite+Tauri desktop app
// - "react-native" generates mobile app
export type AppFramework = 'react' | 'tauri' | 'react-native' | 'hono';
