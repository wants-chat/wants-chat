/**
 * Feature Interface Definitions
 *
 * Features are the bridge between app types and components.
 * Each feature represents a functional capability (e.g., "shopping cart")
 * and defines which pages, components, and entities it requires.
 */

/**
 * Feature category for organization
 */
export type FeatureCategory =
  | 'core'           // Essential for the app type
  | 'commerce'       // E-commerce related
  | 'content'        // Content management
  | 'communication'  // Chat, notifications, etc.
  | 'analytics'      // Reporting, dashboards
  | 'integration'    // Third-party services
  | 'security'       // Auth, permissions
  | 'utility'        // Helper features
  | 'booking'        // Appointments, reservations, scheduling
  | 'business'       // CRM, projects, team management
  | 'social'         // Social networking, communities
  // Industry-specific categories
  | 'hospitality'    // Hotels, restaurants, food service
  | 'fitness'        // Gyms, wellness, health clubs
  | 'healthcare'     // Medical, clinics, patient care
  | 'education'      // Schools, LMS, courses
  | 'real-estate'    // Property, listings, rentals
  | 'legal'          // Law firms, case management
  | 'automotive'     // Dealerships, repair shops
  | 'construction'   // Contractors, project management
  | 'entertainment'  // Events, venues, ticketing
  | 'logistics';     // Shipping, warehousing, delivery

/**
 * Page definition within a feature
 */
export interface FeaturePage {
  /** Page identifier */
  id: string;

  /** Route path */
  route: string;

  /** Which section this page belongs to */
  section: 'frontend' | 'admin' | 'vendor';

  /** Page title */
  title: string;

  /** Requires authentication? */
  authRequired: boolean;

  /** Required role(s) */
  roles?: string[];

  /** Page template to use */
  templateId: string;

  /** Components used on this page */
  components: string[];

  /** Layout type */
  layout: 'default' | 'minimal' | 'dashboard' | 'centered' | 'split' | 'admin' | 'chat' | 'fullscreen';
}

/**
 * API route definition for a feature
 */
export interface FeatureApiRoute {
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  /** Route path */
  path: string;

  /** Requires authentication? */
  auth: boolean;

  /** Required role */
  role?: string;

  /** Handler type */
  handler: 'crud' | 'custom' | 'aggregate';

  /** Entity this route operates on */
  entity: string;

  /** Operation for CRUD handlers */
  operation?: 'list' | 'get' | 'create' | 'update' | 'delete';

  /** Description */
  description?: string;
}

/**
 * Entity field definition for schema generation
 */
export interface EntityField {
  /** Field/column name (snake_case) */
  name: string;
  /** Database type */
  type: 'uuid' | 'string' | 'text' | 'integer' | 'bigint' | 'numeric' | 'boolean' | 'date' | 'time' | 'timestamptz' | 'jsonb';
  /** Is this field required? */
  required?: boolean;
  /** Is this a primary key? */
  primaryKey?: boolean;
  /** Is this field unique? */
  unique?: boolean;
  /** Default value */
  default?: string;
  /** Foreign key reference */
  references?: { table: string };
}

/**
 * Entity definition required by a feature
 */
export interface FeatureEntity {
  /** Entity/table name */
  name: string;

  /** Human-readable name */
  displayName: string;

  /** Description */
  description?: string;

  /** Is this a core entity (always created)? */
  isCore: boolean;

  /**
   * Field definitions for this entity
   * These define the database columns
   */
  fields?: EntityField[];
}

/**
 * Main Feature Definition
 *
 * Features connect app types to concrete implementations.
 * Each feature knows:
 * - Which pages it adds
 * - Which components it uses
 * - Which entities it requires
 * - Which API routes it needs
 */
export interface FeatureDefinition {
  /** Unique identifier (kebab-case) */
  id: string;

  /** Human-readable name */
  name: string;

  /** Category for organization */
  category: FeatureCategory;

  /** Description */
  description?: string;

  /** Icon for UI (optional) */
  icon?: string;

  // ─────────────────────────────────────────────────────────────
  // ACTIVATION
  // ─────────────────────────────────────────────────────────────

  /**
   * App types that include this feature by default
   */
  includedInAppTypes: string[];

  /**
   * Keywords that activate this feature from user prompt
   */
  activationKeywords: string[];

  /**
   * Is this feature enabled by default for its app types?
   */
  enabledByDefault: boolean;

  /**
   * Can user opt-out of this feature?
   */
  optional: boolean;

  // ─────────────────────────────────────────────────────────────
  // DEPENDENCIES
  // ─────────────────────────────────────────────────────────────

  /**
   * Other features this feature depends on
   * Will be auto-activated if this feature is selected
   */
  dependencies: string[];

  /**
   * Features that conflict with this one
   * Cannot be used together
   */
  conflicts?: string[];

  // ─────────────────────────────────────────────────────────────
  // PAGES & COMPONENTS
  // ─────────────────────────────────────────────────────────────

  /**
   * Pages this feature adds to the application
   */
  pages: FeaturePage[];

  /**
   * Components used by this feature
   * Referenced by ID from component registry
   */
  components: string[];

  // ─────────────────────────────────────────────────────────────
  // BACKEND REQUIREMENTS
  // ─────────────────────────────────────────────────────────────

  /**
   * Entities (database tables) this feature requires
   */
  entities: FeatureEntity[];

  /**
   * API routes this feature needs
   */
  apiRoutes: FeatureApiRoute[];

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────

  /**
   * Configuration options for this feature
   */
  config?: FeatureConfig[];
}

/**
 * Feature configuration option
 */
export interface FeatureConfig {
  /** Config key */
  key: string;

  /** Display label */
  label: string;

  /** Config type */
  type: 'boolean' | 'string' | 'number' | 'select';

  /** Default value */
  default: any;

  /** For select type - available options */
  options?: { value: string; label: string }[];

  /** Description */
  description?: string;
}

/**
 * Feature registry - collection of all features
 */
export interface FeatureRegistry {
  /** All registered features by ID */
  features: Map<string, FeatureDefinition>;

  /** Features grouped by category */
  byCategory: Map<FeatureCategory, FeatureDefinition[]>;

  /** Features grouped by app type */
  byAppType: Map<string, FeatureDefinition[]>;
}

/**
 * Result of feature extraction from prompt
 */
export interface FeatureExtractionResult {
  /** Detected features as full definitions */
  features: FeatureDefinition[];

  /** How each feature was detected */
  detectionMethods: {
    featureId: string;
    method: 'app-type-default' | 'keyword' | 'dependency';
    confidence: number;
  }[];

  /** Detection details indexed by feature ID */
  detectionDetails: Map<string, {
    method: 'app-type-default' | 'keyword' | 'dependency';
    matchedKeywords?: string[];
  }>;

  /** Missing dependencies that were auto-added */
  autoAddedDependencies: string[];
}
