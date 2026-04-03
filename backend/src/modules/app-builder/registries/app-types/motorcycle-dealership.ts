/**
 * Motorcycle Dealership App Type Definition
 *
 * Complete definition for motorcycle dealership operations.
 * Essential for motorcycle dealers, powersports retailers, and bike showrooms.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOTORCYCLE_DEALERSHIP_APP_TYPE: AppTypeDefinition = {
  id: 'motorcycle-dealership',
  name: 'Motorcycle Dealership',
  category: 'automotive',
  description: 'Motorcycle dealership platform with inventory management, customer CRM, financing options, and service scheduling',
  icon: 'bike',

  keywords: [
    'motorcycle dealership',
    'powersports',
    'motorcycle dealership software',
    'bike showroom',
    'motorcycle sales',
    'motorcycle dealership management',
    'inventory management',
    'motorcycle dealership practice',
    'motorcycle dealership scheduling',
    'customer crm',
    'motorcycle dealership crm',
    'financing options',
    'motorcycle dealership business',
    'service scheduling',
    'motorcycle dealership pos',
    'trade-ins',
    'motorcycle dealership operations',
    'parts accessories',
    'motorcycle dealership platform',
    'rider gear',
  ],

  synonyms: [
    'motorcycle dealership platform',
    'motorcycle dealership software',
    'powersports software',
    'bike showroom software',
    'motorcycle sales software',
    'inventory management software',
    'motorcycle dealership practice software',
    'customer crm software',
    'financing options software',
    'parts accessories software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Inventory and services' },
    { id: 'admin', name: 'Dealer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Sales and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Dealer Principal', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'sales', name: 'Sales Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'staff', name: 'Sales Associate', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/customers' },
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

  defaultColorScheme: 'red',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a motorcycle dealership platform',
    'Create a powersports dealer portal',
    'I need a motorcycle inventory system',
    'Build a bike sales platform',
    'Create a motorcycle service app',
  ],
};
