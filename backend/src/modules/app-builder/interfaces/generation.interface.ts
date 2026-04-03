/**
 * Generation Interface Definitions
 *
 * Interfaces for the generation process and output.
 */

/**
 * Framework targets
 */
export type FrameworkTarget = 'react' | 'hono' | 'react-native';

/**
 * Design variant options
 */
export type DesignVariant =
  | 'minimal'
  | 'glassmorphism'
  | 'neumorphism'
  | 'brutalist'
  | 'corporate'
  | 'creative'
  | 'modern'
  | 'classic'
  | 'bold';

/**
 * Color scheme options
 */
export type ColorScheme =
  | 'blue'
  | 'purple'
  | 'green'
  | 'orange'
  | 'pink'
  | 'indigo'
  | 'teal'
  | 'red'
  | 'neutral'
  | 'warm';

/**
 * Generation request
 */
export interface GenerationRequest {
  /** User prompt */
  prompt: string;

  /** Target frameworks */
  frameworks: FrameworkTarget[];

  /** Organization ID (for database) */
  organizationId: string;

  /** Project ID */
  projectId: string;

  /** Optional customization */
  customization?: {
    colorScheme?: ColorScheme;
    designVariant?: DesignVariant;
    appName?: string;
  };

  /** Progress callback */
  onProgress?: (message: string, progress: number) => void;
}

/**
 * Generation step result
 */
export interface GenerationStep {
  /** Step name */
  name: string;

  /** Step status */
  status: 'pending' | 'running' | 'completed' | 'failed';

  /** Progress (0-100) */
  progress: number;

  /** Duration in ms */
  duration?: number;

  /** Error message if failed */
  error?: string;

  /** Output data */
  data?: any;
}

/**
 * Generated file
 */
export interface GeneratedFile {
  /** File path (relative to output root) */
  path: string;

  /** File content */
  content: string;

  /** File type */
  type: 'component' | 'route' | 'config' | 'schema' | 'style' | 'test';

  /** Source template */
  template?: string;

  /** Generation method */
  method: 'template' | 'ai';
}

/**
 * Generation result
 */
export interface GenerationResult {
  /** App ID */
  appId: string;

  /** App name */
  appName: string;

  /** Output path */
  outputPath: string;

  /** Generation steps */
  steps: GenerationStep[];

  /** Generated files */
  files: GeneratedFile[];

  /** Database schema */
  schema: import('./schema.interface').DatabaseSchema;

  /** Detected app type */
  appType: string;

  /** Selected features */
  features: string[];

  /** Total generation time (ms) */
  totalTime: number;

  /** API keys (for deployed app) */
  apiKeys?: {
    serviceRoleKey: string;
    anonKey: string;
  };
}

/**
 * Branding configuration
 */
export interface BrandingConfig {
  /** Primary brand color */
  primaryColor: string;

  /** Secondary color */
  secondaryColor: string;

  /** Accent color */
  accentColor: string;

  /** Background color */
  backgroundColor: string;

  /** Text color */
  textColor: string;

  /** Font family */
  fontFamily: string;

  /** Border radius */
  borderRadius: string;

  /** Logo URL */
  logoUrl: string | null;
}

/**
 * Feature-specific generation configuration
 */
export interface FeatureGenerationConfig {
  /** Feature ID */
  featureId: string;

  /** Feature settings */
  settings: Record<string, any>;
}

/**
 * AI customization request (minimal!)
 */
export interface AICustomizationRequest {
  /** App type */
  appType: string;

  /** Enabled features */
  enabledFeatures: string[];

  /** User prompt (for context) */
  prompt: string;

  /** What to customize */
  customize?: ('branding' | 'content' | 'labels')[];
}

/**
 * AI customization result
 */
export interface AICustomizationResult {
  /** Branding configuration */
  branding: BrandingConfig;

  /** Design variant */
  designVariant: DesignVariant;

  /** Color scheme */
  colorScheme: ColorScheme;

  /** Feature-specific configs */
  featureConfigs: FeatureGenerationConfig[];

  /** App metadata */
  metadata: Record<string, string>;

  /** Content suggestions */
  contentSuggestions: Record<string, string[]>;

  /** Confidence score (0-1) */
  confidence: number;
}

/**
 * AI customization response (validated JSON)
 */
export interface AICustomizationResponse {
  /** Branding */
  branding?: {
    name: string;
    tagline: string;
    description: string;
  };

  /** Content for static pages */
  content?: {
    heroTitle?: string;
    heroSubtitle?: string;
    ctaText?: string;
  };

  /** Field labels (human-readable) */
  labels?: Record<string, string>;
}

/**
 * Validation error
 */
export interface ValidationError {
  /** Error type */
  type: 'schema' | 'type' | 'missing' | 'conflict';

  /** Error message */
  message: string;

  /** File path (if applicable) */
  file?: string;

  /** Line number (if applicable) */
  line?: number;

  /** Suggested fix */
  suggestion?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Is valid? */
  valid: boolean;

  /** Errors */
  errors: ValidationError[];

  /** Warnings */
  warnings: string[];

  /** Files validated */
  filesValidated: number;
}
