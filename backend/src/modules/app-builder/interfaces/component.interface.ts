/**
 * Component Interface Definitions
 *
 * CRITICAL DESIGN PRINCIPLE:
 * The component defines what data it needs.
 * The database schema is DERIVED from component field definitions.
 * This prevents AI hallucination of database structures.
 */

/**
 * Field types supported by components
 * These map directly to database column types
 */
export type FieldType =
  | 'uuid'       // Primary keys, foreign keys
  | 'string'     // Short text (varchar 255)
  | 'text'       // Long text (unlimited)
  | 'integer'    // Whole numbers
  | 'decimal'    // Currency, ratings (precision 10, scale 2)
  | 'boolean'    // True/false
  | 'date'       // Date only
  | 'datetime'   // Date and time (timestamp)
  | 'json'       // JSON object
  | 'array'      // Array of items (stored as JSON)
  | 'enum'       // Predefined options
  | 'file'       // File URL
  | 'image'      // Image URL (with preview support)
  | 'email'      // Email with validation
  | 'phone'      // Phone number
  | 'url';       // URL with validation

/**
 * Field source - where the data comes from
 */
export type FieldSource =
  | 'database'   // Fetched from database
  | 'computed'   // Calculated from other fields
  | 'user'       // From current user context
  | 'static'     // Hardcoded value
  | 'route';     // From URL parameters

/**
 * Component field definition
 * This is the core building block - fields drive database schema
 */
export interface ComponentField {
  /** Field name in camelCase (maps to snake_case in DB) */
  name: string;

  /** Display label for UI */
  label?: string;

  /** Data type */
  type: FieldType | string;

  /** Where the data comes from (defaults to 'database') */
  source?: FieldSource;

  /** Is this field required for the component to render? (defaults to false) */
  required?: boolean;

  /** Default value if not provided */
  default?: any;

  /** Placeholder text for form inputs */
  placeholder?: string;

  /** Validation rules */
  validation?: FieldValidation;

  /** For enum types - allowed values */
  enumValues?: string[];
  options?: string[];

  /** For relations - target entity */
  relationTo?: string;

  /** For relations - how to display (e.g., 'name' field of related entity) */
  relationDisplay?: string;

  /** Max files for file upload */
  maxFiles?: number;
}

/**
 * Field validation rules
 */
export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  maxFiles?: number;
  pattern?: string;
  patternMessage?: string;
  email?: boolean;
  match?: string;
}

/**
 * Synonyms for intelligent field matching
 * Maps standard field name to alternative names AI might generate
 */
export interface FieldSynonyms {
  [standardName: string]: string[];
}

/**
 * API endpoint definition for component
 */
export interface ComponentApiEndpoint {
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  /** Route path (relative to entity) */
  path: string;

  /** Requires authentication? */
  auth?: boolean;

  /** Required role (if auth is true) */
  role?: string;

  /** Purpose of the endpoint */
  purpose?: 'create' | 'read' | 'update' | 'delete' | 'list' | 'authenticate' | 'custom';

  /** Fields sent in request */
  requestFields?: string[];

  /** Fields returned in response */
  responseFields?: string[];

  /** Description for documentation */
  description?: string;

  /** Conditional - only included if config enabled */
  conditional?: string;
}

/**
 * Component event definition
 */
export interface ComponentEvent {
  /** Event name */
  name: string;

  /** What triggers this event */
  trigger?: 'click' | 'submit' | 'change' | 'load' | 'hover';

  /** Payload fields emitted */
  payload?: string[];

  /** Default handler type */
  defaultHandler?: 'navigate' | 'api-call' | 'state-update' | 'modal';

  /** Description for documentation */
  description?: string;
}

/**
 * Component category for organization
 */
export type ComponentCategory =
  | 'ecommerce'
  | 'form'
  | 'forms'
  | 'navigation'
  | 'data-display'
  | 'dashboard'
  | 'auth'
  | 'media'
  | 'social'
  | 'utility'
  | 'layout';

/**
 * Section types where components can be used
 */
export type SectionType = 'frontend' | 'admin' | 'vendor';

/**
 * Where this component can be used
 */
export type ComponentAllowedIn = SectionType[];

/**
 * Main Component Definition
 *
 * This is the central interface for the component-first approach.
 * Components define their data requirements, and the database
 * schema is derived from these definitions.
 */
export interface ComponentDefinition {
  /** Unique identifier (kebab-case) */
  id: string;

  /** Human-readable name */
  name: string;

  /** Category for organization */
  category: ComponentCategory;

  /** Description */
  description?: string;

  /** Icon name (lucide-react icons) */
  icon?: string;

  /** Where this component can be used */
  allowedIn: ComponentAllowedIn;

  // ─────────────────────────────────────────────────────────────
  // FIELD DEFINITIONS (Core of component-first approach)
  // ─────────────────────────────────────────────────────────────

  /**
   * Fields this component MUST have to render
   * These become required columns in the database
   */
  requiredFields: ComponentField[];

  /**
   * Optional fields with fallback values
   * These become optional columns with defaults
   */
  optionalFields: ComponentField[];

  /**
   * Field synonyms for intelligent matching
   * Allows matching 'title' to 'name', 'cost' to 'price', etc.
   */
  fieldSynonyms?: FieldSynonyms;

  // ─────────────────────────────────────────────────────────────
  // API REQUIREMENTS
  // ─────────────────────────────────────────────────────────────

  /**
   * API endpoints this component requires
   * Used to generate backend routes
   */
  apiEndpoints: ComponentApiEndpoint[];

  /**
   * Events the component emits
   * Used for inter-component communication
   */
  events?: ComponentEvent[];

  // ─────────────────────────────────────────────────────────────
  // RENDERING CONFIGURATION
  // ─────────────────────────────────────────────────────────────

  /**
   * Default props for the React component
   */
  defaultProps?: Record<string, any>;

  /**
   * CSS classes to apply
   */
  cssClasses?: string[];

  /**
   * Tailwind variants
   */
  variants?: ComponentVariant[];

  /**
   * Template file path (relative to templates/react/)
   */
  templatePath: string;
}

/**
 * Component variant for different visual styles
 */
export interface ComponentVariant {
  id: string;
  name: string;
  cssClasses: string[];
  props?: Record<string, any>;
}

/**
 * Component registry - collection of all components
 */
export interface ComponentRegistry {
  /** All registered components by ID */
  components: Map<string, ComponentDefinition>;

  /** Components grouped by category */
  byCategory: Map<ComponentCategory, ComponentDefinition[]>;

  /** Quick lookup by feature */
  byFeature: Map<string, ComponentDefinition[]>;
}

/**
 * Result of component field matching
 */
export interface FieldMatchResult {
  /** The matched field */
  field: ComponentField;

  /** How it was matched */
  matchType: 'exact' | 'synonym' | 'fuzzy';

  /** Confidence score (0-1) */
  confidence: number;

  /** Original field name from AI/user input */
  originalName: string;
}
