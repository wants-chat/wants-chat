/**
 * React Native Real Estate Component Generators Index
 *
 * Provides generators for React Native real estate components:
 * - Property Grid with FlatList and filter chips
 * - Property Card for individual property display
 * - Property Detail with image carousel and features
 * - Property Gallery with fullscreen support
 * - Agent Grid and Profile components
 */

// Property Grid components
export {
  generatePropertyGrid,
  generatePropertyCard,
  generatePropertyFilters,
  type PropertyGridOptions,
} from './property-grid.generator';

// Property Detail components
export {
  generatePropertyDetail,
  generatePropertyGallery,
  generatePropertyFeatures,
  type PropertyDetailOptions,
} from './property-detail.generator';

// Agent components
export {
  generateAgentGrid,
  generateAgentProfile,
  type AgentGridOptions,
} from './agent-grid.generator';
