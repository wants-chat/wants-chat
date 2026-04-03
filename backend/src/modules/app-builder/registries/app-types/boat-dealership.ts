/**
 * Boat Dealership App Type Definition
 *
 * Complete definition for boat and marine dealership operations.
 * Essential for boat dealers, yacht brokers, and marine retailers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BOAT_DEALERSHIP_APP_TYPE: AppTypeDefinition = {
  id: 'boat-dealership',
  name: 'Boat Dealership',
  category: 'automotive',
  description: 'Boat dealership platform with vessel inventory, marine financing, sea trial scheduling, and service dock management',
  icon: 'anchor',

  keywords: [
    'boat dealership',
    'yacht broker',
    'boat dealership software',
    'marine dealer',
    'boat sales',
    'boat dealership management',
    'vessel inventory',
    'boat dealership practice',
    'boat dealership scheduling',
    'marine financing',
    'boat dealership crm',
    'sea trial scheduling',
    'boat dealership business',
    'service dock',
    'boat dealership pos',
    'pontoon',
    'boat dealership operations',
    'fishing boat',
    'boat dealership platform',
    'boat storage',
  ],

  synonyms: [
    'boat dealership platform',
    'boat dealership software',
    'yacht broker software',
    'marine dealer software',
    'boat sales software',
    'vessel inventory software',
    'boat dealership practice software',
    'marine financing software',
    'sea trial scheduling software',
    'fishing boat software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Inventory and financing' },
    { id: 'admin', name: 'Dealer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Sales and marina' },
  ],

  roles: [
    { id: 'admin', name: 'Dealer Principal', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'broker', name: 'Yacht Broker', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'sales', name: 'Sales Associate', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/leads' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'vehicle-inventory',
    'test-drives',
    'vehicle-financing',
    'trade-in-valuation',
    'vehicle-history',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'service-scheduling',
    'parts-catalog',
    'recalls-tracking',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'automotive',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a boat dealership platform',
    'Create a yacht brokerage portal',
    'I need a marine inventory system',
    'Build a boat sales platform',
    'Create a marina service app',
  ],
};
