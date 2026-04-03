/**
 * RV Dealership App Type Definition
 *
 * Complete definition for RV and camper dealership operations.
 * Essential for RV dealers, motorhome retailers, and camper sales centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RV_DEALERSHIP_APP_TYPE: AppTypeDefinition = {
  id: 'rv-dealership',
  name: 'RV Dealership',
  category: 'automotive',
  description: 'RV dealership platform with unit inventory, financing calculators, trade-in appraisals, and service department',
  icon: 'caravan',

  keywords: [
    'rv dealership',
    'motorhome',
    'rv dealership software',
    'camper sales',
    'recreational vehicle',
    'rv dealership management',
    'unit inventory',
    'rv dealership practice',
    'rv dealership scheduling',
    'financing calculators',
    'rv dealership crm',
    'trade-in appraisals',
    'rv dealership business',
    'service department',
    'rv dealership pos',
    'travel trailer',
    'rv dealership operations',
    'fifth wheel',
    'rv dealership platform',
    'rv storage',
  ],

  synonyms: [
    'rv dealership platform',
    'rv dealership software',
    'motorhome software',
    'camper sales software',
    'recreational vehicle software',
    'unit inventory software',
    'rv dealership practice software',
    'financing calculators software',
    'trade-in appraisals software',
    'travel trailer software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Inventory and financing' },
    { id: 'admin', name: 'Dealer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Sales and service' },
  ],

  roles: [
    { id: 'admin', name: 'Dealer Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Sales Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'sales', name: 'RV Specialist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/leads' },
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
    'appointments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'automotive',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build an RV dealership platform',
    'Create a motorhome dealer portal',
    'I need an RV inventory system',
    'Build a camper sales platform',
    'Create an RV service app',
  ],
};
