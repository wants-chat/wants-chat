/**
 * Page Template Interface Definitions
 *
 * Page templates define the structure and layout of pages.
 * They specify which component slots are available and
 * what data needs to be fetched.
 */

/**
 * Layout type for pages
 */
export type PageLayout =
  | 'default'    // Standard layout with header/footer
  | 'minimal'    // No header/footer
  | 'dashboard'  // Sidebar + main content
  | 'centered'   // Centered content
  | 'split'      // Two-column layout
  | 'full';      // Full-width, no padding

/**
 * Component slot position
 */
export type SlotPosition =
  | 'header'
  | 'top'
  | 'left'
  | 'center'
  | 'right'
  | 'bottom'
  | 'footer'
  | 'modal';

/**
 * Component slot definition
 */
export interface PageSlot {
  /** Slot identifier */
  id: string;

  /** Position in the layout */
  position: SlotPosition;

  /** Default component to render (if any) */
  defaultComponent?: string;

  /** Allowed component types for this slot */
  allowedComponents?: string[];

  /** Is this slot required? */
  required: boolean;

  /** Can have multiple components? */
  multiple: boolean;

  /** Grid configuration (12-column) */
  grid?: {
    span: number;
    offset?: number;
  };
}

/**
 * Data fetching configuration
 */
export interface PageDataFetch {
  /** Unique key for this data */
  key: string;

  /** API endpoint to call */
  endpoint: string;

  /** HTTP method */
  method: 'GET' | 'POST';

  /** Requires authentication? */
  auth: boolean;

  /** Parameters (from route, query, etc.) */
  params?: {
    name: string;
    source: 'route' | 'query' | 'state' | 'static';
    value?: string;
  }[];

  /** Transform the response */
  transform?: 'none' | 'first' | 'array';

  /** Cache configuration */
  cache?: {
    enabled: boolean;
    ttl: number; // seconds
  };
}

/**
 * Page action definition
 */
export interface PageAction {
  /** Action identifier */
  id: string;

  /** Display label */
  label: string;

  /** Action type */
  type: 'navigate' | 'api-call' | 'modal' | 'custom';

  /** Icon */
  icon?: string;

  /** For navigate type */
  route?: string;

  /** For api-call type */
  endpoint?: string;
  method?: 'POST' | 'PUT' | 'DELETE';

  /** Show confirmation dialog? */
  confirm?: {
    title: string;
    message: string;
  };

  /** Required permission */
  permission?: string;
}

/**
 * Page type classification
 */
export type PageType =
  | 'landing'     // Home/landing page
  | 'list'        // List of items
  | 'detail'      // Single item detail
  | 'form'        // Create/edit form
  | 'dashboard'   // Dashboard with stats
  | 'settings'    // Settings page
  | 'profile'     // User profile
  | 'auth'        // Login/register
  | 'error'       // Error pages
  | 'custom';     // Custom page

/**
 * Main Page Template Definition
 *
 * Page templates define the structure of pages
 * without specifying the actual data/content.
 */
export interface PageTemplateDefinition {
  /** Unique identifier */
  id: string;

  /** Human-readable name */
  name: string;

  /** Page type classification */
  type: PageType;

  /** Description */
  description?: string;

  // ─────────────────────────────────────────────────────────────
  // LAYOUT
  // ─────────────────────────────────────────────────────────────

  /** Layout type */
  layout: PageLayout;

  /** Available component slots */
  slots: PageSlot[];

  /** CSS classes for the page container */
  containerClasses?: string[];

  // ─────────────────────────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────────────────────────

  /** Data to fetch on page load */
  dataFetching?: PageDataFetch[];

  /** Route parameters */
  routeParams?: string[];

  // ─────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────

  /** Page-level actions */
  actions?: PageAction[];

  // ─────────────────────────────────────────────────────────────
  // SEO
  // ─────────────────────────────────────────────────────────────

  /** SEO configuration */
  seo?: {
    titleTemplate?: string;
    descriptionTemplate?: string;
    indexable: boolean;
  };

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────

  /** Requires authentication? */
  authRequired: boolean;

  /** Required roles */
  roles?: string[];

  /** Show breadcrumbs? */
  showBreadcrumbs: boolean;

  /** Show page title? */
  showTitle: boolean;
}

/**
 * Page template registry
 */
export interface PageTemplateRegistry {
  /** All templates by ID */
  templates: Map<string, PageTemplateDefinition>;

  /** Templates by type */
  byType: Map<PageType, PageTemplateDefinition[]>;
}

/**
 * Instantiated page (template + data)
 */
export interface PageInstance {
  /** Page identifier */
  id: string;

  /** Page title */
  title: string;

  /** Route path */
  route: string;

  /** Template used */
  templateId: string;

  /** Section this page belongs to */
  section: 'frontend' | 'admin' | 'vendor';

  /** Components placed in slots */
  components: {
    slotId: string;
    componentId: string;
    props?: Record<string, any>;
  }[];

  /** Resolved data fetching */
  dataFetching: PageDataFetch[];

  /** Auth requirements */
  auth: {
    required: boolean;
    roles?: string[];
  };
}
