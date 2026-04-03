/**
 * App Type Interface Definitions
 *
 * App types are the top-level classification for generated applications.
 * Each app type defines:
 * - Default features included
 * - User roles
 * - Section structure
 * - Keywords for detection
 */

/**
 * App type category for organization
 */
export type AppTypeCategory =
  // Core Categories
  | 'commerce'           // E-commerce, marketplace, etc.
  | 'ecommerce'          // E-commerce platforms
  | 'content'            // Blog, CMS, news, etc.
  | 'business'           // CRM, ERP, project management, etc.
  | 'social'             // Social network, community, etc.
  | 'booking'            // Appointments, reservations, etc.
  | 'education'          // LMS, courses, etc.
  | 'healthcare'         // Patient portals, telemedicine, etc.
  | 'finance'            // Banking, accounting, etc.
  | 'media'              // Streaming, podcasts, etc.
  | 'utility'            // Tools, calculators, etc.
  | 'custom'             // User-defined

  // Industry Categories
  | 'agriculture'        // Farming, livestock, agribusiness
  | 'artisan'            // Handcrafted goods, crafts
  | 'automotive'         // Auto repair, dealerships, parts
  | 'aviation'           // Aircraft, airports, flight services
  | 'beauty'             // Salons, spas, cosmetics
  | 'children'           // Childcare, education, activities
  | 'cleaning'           // Cleaning services, janitorial
  | 'community'          // Community organizations, clubs
  | 'construction'       // Contractors, builders, trades
  | 'creative'           // Design, art, creative services
  | 'energy'             // Utilities, renewable energy
  | 'entertainment'      // Events, venues, gaming
  | 'environmental'      // Sustainability, conservation
  | 'events'             // Event planning, venues
  | 'fitness'            // Gyms, personal training
  | 'food-beverage'      // Restaurants, catering, food service
  | 'food-production'    // Food manufacturing, processing
  | 'government'         // Public services, civic apps
  | 'health-fitness'     // Health and wellness combined
  | 'hospitality'        // Hotels, lodging, hospitality
  | 'insurance'          // Insurance services
  | 'legal'              // Law firms, legal services
  | 'logistics'          // Shipping, warehousing, supply chain
  | 'manufacturing'      // Production, industrial
  | 'marine'             // Boating, maritime services
  | 'marketing'          // Advertising, digital marketing
  | 'marketplace'        // Multi-vendor marketplaces
  | 'nonprofit'          // Charities, NGOs, foundations
  | 'outdoor'            // Outdoor activities, recreation
  | 'personal-services'  // Personal care, lifestyle services
  | 'pets'               // Pet care, veterinary, grooming
  | 'professional'       // Professional services
  | 'professional-services' // Professional services (alias)
  | 'property'           // Property management
  | 'real-estate'        // Real estate, property sales
  | 'religious'          // Religious organizations
  | 'religious-spiritual' // Spiritual services
  | 'rental'             // Equipment, vehicle rentals
  | 'retail'             // Retail stores, shops
  | 'science-research'   // Research, laboratories
  | 'security'           // Security services, surveillance
  | 'seniors'            // Senior care, elderly services
  | 'services'           // General services
  | 'sports'             // Sports facilities, leagues
  | 'subscription'       // Subscription-based services
  | 'technology'         // Tech services, IT
  | 'tourism'            // Tourism, travel services
  | 'transportation'     // Transport, delivery services
  | 'travel'             // Travel planning, bookings
  | 'wellness';          // Wellness, holistic health

/**
 * User role definition
 */
export interface AppTypeRole {
  /** Role identifier */
  id: string;

  /** Display name */
  name: string;

  /** Role level (higher = more permissions) */
  level: number;

  /** Is this the default role for new users? */
  isDefault: boolean;

  /** Sections this role can access */
  accessibleSections: ('frontend' | 'admin' | 'vendor')[];

  /** Default route after login */
  defaultRoute: string;
}

/**
 * Section configuration for app type
 */
export interface AppTypeSection {
  /** Section identifier */
  id: 'frontend' | 'admin' | 'vendor';

  /** Display name */
  name: string;

  /** Is this section enabled? */
  enabled: boolean;

  /** Base route path */
  basePath: string;

  /** Required role to access */
  requiredRole?: string;

  /** Layout type */
  layout: 'public' | 'admin' | 'vendor' | 'minimal';

  /** Description */
  description?: string;
}

/**
 * Main App Type Definition
 *
 * App types are the entry point for generation.
 * They define the overall structure and default features.
 */
export interface AppTypeDefinition {
  /** Unique identifier (kebab-case) */
  id: string;

  /** Human-readable name */
  name: string;

  /** Category for organization */
  category: AppTypeCategory;

  /** Description */
  description: string;

  /** Icon for UI */
  icon?: string;

  // ─────────────────────────────────────────────────────────────
  // DETECTION
  // ─────────────────────────────────────────────────────────────

  /**
   * Keywords for detecting this app type from prompt
   * Ordered by relevance (most specific first)
   */
  keywords: string[];

  /**
   * Synonyms - alternative names for this app type
   */
  synonyms: string[];

  /**
   * Negative keywords - if present, this is NOT the right type
   */
  negativeKeywords?: string[];

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE
  // ─────────────────────────────────────────────────────────────

  /**
   * Sections available in this app type
   */
  sections: AppTypeSection[];

  /**
   * User roles for this app type
   */
  roles: AppTypeRole[];

  // ─────────────────────────────────────────────────────────────
  // FEATURES
  // ─────────────────────────────────────────────────────────────

  /**
   * Features included by default
   */
  defaultFeatures: string[];

  /**
   * Optional features that can be added
   */
  optionalFeatures: string[];

  /**
   * Features that are NOT compatible with this app type
   */
  incompatibleFeatures?: string[];

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────

  /**
   * Requires authentication?
   */
  requiresAuth: boolean;

  /**
   * Requires payment integration?
   */
  requiresPayment: boolean;

  /**
   * Is this a multi-tenant app?
   */
  multiTenant: boolean;

  /**
   * Complexity level (affects generation)
   */
  complexity: 'simple' | 'medium' | 'moderate' | 'complex';

  /**
   * Industry/domain
   */
  industry?: string;

  /**
   * Default route for authenticated users (e.g., '/feed', '/dashboard', '/')
   * This is where logged-in users land by default
   */
  defaultRoute?: string;

  /**
   * Route for unauthenticated/guest users (e.g., '/login', '/', '/explore')
   * This is where guests are redirected when visiting protected routes or root
   */
  guestRoute?: string;

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────

  /**
   * Default color scheme
   */
  defaultColorScheme: string;

  /**
   * Default design variant
   */
  defaultDesignVariant: string;

  /**
   * Example prompts that match this app type
   */
  examplePrompts: string[];

  // ─────────────────────────────────────────────────────────────
  // LANDING PAGE COMPONENTS
  // ─────────────────────────────────────────────────────────────

  /**
   * Components to use for this app type's landing page
   * Each app-type defines its own combination of components
   * UI component generators create type-appropriate content
   *
   * Example: ['hero-section', 'product-showcase', 'testimonials', 'cta-block']
   */
  landingPageComponents?: string[];
}

/**
 * App type registry - collection of all app types
 */
export interface AppTypeRegistry {
  /** All registered app types by ID */
  appTypes: Map<string, AppTypeDefinition>;

  /** App types grouped by category */
  byCategory: Map<AppTypeCategory, AppTypeDefinition[]>;

  /** App types indexed by keyword */
  byKeyword: Map<string, AppTypeDefinition[]>;
}

/**
 * Result of app type detection
 */
export interface AppTypeDetectionResult {
  /** Detected app type ID */
  appTypeId: string;

  /** The full app type definition (null if not detected) */
  appType: AppTypeDefinition | null;

  /** Detection method used */
  method: 'exact' | 'keyword' | 'fuzzy' | 'ai' | 'embedding';

  /** Match method for external use (alias for method) */
  matchMethod?: 'exact' | 'keyword' | 'fuzzy' | 'ai' | 'embedding';

  /** Confidence score (0-1) */
  confidence: number;

  /** Keywords that matched */
  matchedKeywords: string[];

  /** Reasoning (if AI was used) */
  reasoning?: string;

  /** Suggestions when detection fails */
  suggestions?: string[];

  /** Alternative matches with lower confidence */
  alternates?: AppTypeDetectionResult[];
}
