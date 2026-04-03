/**
 * Components Registry - Master Index
 *
 * Consolidates all component definitions from all categories.
 */

// E-commerce components
export * from './ecommerce/product-grid';
export * from './ecommerce/shopping-cart';

// Form components
export * from './forms/index';

// Navigation components
export * from './navigation/index';

// Data display components
export * from './data-display/index';

import { ComponentDefinition } from '../../interfaces/component.interface';

// Import category arrays
import { FORM_COMPONENTS } from './forms/index';
import { NAVIGATION_COMPONENTS } from './navigation/index';
import { DATA_DISPLAY_COMPONENTS } from './data-display/index';
import { PRODUCT_GRID_COMPONENT } from './ecommerce/product-grid';
import { SHOPPING_CART_COMPONENT } from './ecommerce/shopping-cart';

/**
 * All components registry - flat array
 */
export const ALL_COMPONENTS: ComponentDefinition[] = [
  // E-commerce
  PRODUCT_GRID_COMPONENT,
  SHOPPING_CART_COMPONENT,
  // Forms
  ...FORM_COMPONENTS,
  // Navigation
  ...NAVIGATION_COMPONENTS,
  // Data display
  ...DATA_DISPLAY_COMPONENTS,
];

/**
 * Components map by ID for quick lookup
 */
export const COMPONENTS_BY_ID: Map<string, ComponentDefinition> = new Map(
  ALL_COMPONENTS.map(c => [c.id, c])
);

/**
 * Components grouped by category
 */
export const COMPONENTS_BY_CATEGORY: Record<string, ComponentDefinition[]> = {
  ecommerce: [PRODUCT_GRID_COMPONENT, SHOPPING_CART_COMPONENT],
  form: FORM_COMPONENTS,
  navigation: NAVIGATION_COMPONENTS,
  'data-display': DATA_DISPLAY_COMPONENTS,
};

/**
 * Get component by ID
 */
export function getComponentById(id: string): ComponentDefinition | undefined {
  return COMPONENTS_BY_ID.get(id);
}

/**
 * Get components by category
 */
export function getComponentsByCategory(category: string): ComponentDefinition[] {
  return COMPONENTS_BY_CATEGORY[category] || [];
}

/**
 * Get components allowed in a specific section
 */
export function getComponentsForSection(section: 'frontend' | 'admin' | 'vendor'): ComponentDefinition[] {
  return ALL_COMPONENTS.filter(c => c.allowedIn.includes(section));
}

/**
 * Search components by keyword
 */
export function searchComponents(keyword: string): ComponentDefinition[] {
  const kw = keyword.toLowerCase();
  return ALL_COMPONENTS.filter(c =>
    c.id.toLowerCase().includes(kw) ||
    c.name.toLowerCase().includes(kw) ||
    c.description.toLowerCase().includes(kw)
  );
}
