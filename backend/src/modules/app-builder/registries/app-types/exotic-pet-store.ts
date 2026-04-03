/**
 * Exotic Pet Store App Type Definition
 *
 * Complete definition for exotic pet store operations.
 * Essential for reptile shops, exotic animal retailers, and specialty pet stores.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EXOTIC_PET_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'exotic-pet-store',
  name: 'Exotic Pet Store',
  category: 'retail',
  description: 'Exotic pet store platform with animal inventory, care guides, habitat supplies, and adoption services',
  icon: 'bug',

  keywords: [
    'exotic pet store',
    'reptile shop',
    'exotic pet store software',
    'exotic animals',
    'specialty pets',
    'exotic pet store management',
    'animal inventory',
    'exotic pet store practice',
    'exotic pet store scheduling',
    'care guides',
    'exotic pet store crm',
    'habitat supplies',
    'exotic pet store business',
    'adoption services',
    'exotic pet store pos',
    'snakes lizards',
    'exotic pet store operations',
    'tarantulas',
    'exotic pet store platform',
    'tropical birds',
  ],

  synonyms: [
    'exotic pet store platform',
    'exotic pet store software',
    'reptile shop software',
    'exotic animals software',
    'specialty pets software',
    'animal inventory software',
    'exotic pet store practice software',
    'care guides software',
    'habitat supplies software',
    'snakes lizards software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Store Portal', enabled: true, basePath: '/', layout: 'public', description: 'Animals and supplies' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and sales' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'staff', name: 'Animal Care Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/animals' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'nature',

  examplePrompts: [
    'Build an exotic pet store platform',
    'Create a reptile shop app',
    'I need an exotic animal retail system',
    'Build a specialty pet store app',
    'Create an exotic pet store portal',
  ],
};
