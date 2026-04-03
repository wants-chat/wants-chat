/**
 * Truck Dealership App Type Definition
 *
 * Complete definition for commercial truck dealership operations.
 * Essential for truck dealers, heavy equipment sales, and commercial vehicle retailers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRUCK_DEALERSHIP_APP_TYPE: AppTypeDefinition = {
  id: 'truck-dealership',
  name: 'Truck Dealership',
  category: 'automotive',
  description: 'Truck dealership platform with commercial inventory, fleet sales, financing programs, and service department',
  icon: 'truck',

  keywords: [
    'truck dealership',
    'commercial trucks',
    'truck dealership software',
    'heavy equipment',
    'semi trucks',
    'truck dealership management',
    'commercial inventory',
    'truck dealership practice',
    'truck dealership scheduling',
    'fleet sales',
    'truck dealership crm',
    'financing programs',
    'truck dealership business',
    'service department',
    'truck dealership pos',
    'box trucks',
    'truck dealership operations',
    'trailers',
    'truck dealership platform',
    'vocational trucks',
  ],

  synonyms: [
    'truck dealership platform',
    'truck dealership software',
    'commercial trucks software',
    'heavy equipment software',
    'semi trucks software',
    'commercial inventory software',
    'truck dealership practice software',
    'fleet sales software',
    'financing programs software',
    'vocational trucks software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Inventory and services' },
    { id: 'admin', name: 'Dealer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Sales and service' },
  ],

  roles: [
    { id: 'admin', name: 'Dealer Principal', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'sales-mgr', name: 'Sales Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'sales', name: 'Sales Rep', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/leads' },
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

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a truck dealership platform',
    'Create a commercial truck portal',
    'I need a fleet sales system',
    'Build a heavy truck inventory platform',
    'Create a commercial vehicle app',
  ],
};
