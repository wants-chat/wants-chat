/**
 * Car Dealership App Type Definition
 *
 * Complete definition for car dealership and auto sales applications.
 * Essential for car dealers, used car lots, and automotive sales.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CAR_DEALERSHIP_APP_TYPE: AppTypeDefinition = {
  id: 'car-dealership',
  name: 'Car Dealership',
  category: 'automotive',
  description: 'Car dealership platform with inventory management, lead tracking, financing, and customer CRM',
  icon: 'car',

  keywords: [
    'car dealership',
    'auto dealership',
    'car sales',
    'dealership software',
    'car dealer',
    'used car dealer',
    'new car dealer',
    'auto sales',
    'dealership crm',
    'car inventory',
    'vehicle sales',
    'dealership management',
    'car dealer software',
    'automotive sales',
    'car lot',
    'dealership leads',
    'car financing',
    'trade-in',
    'car dealership business',
    'dealership dms',
  ],

  synonyms: [
    'car dealership platform',
    'car dealership software',
    'auto dealership software',
    'dealership crm software',
    'car dealer software',
    'vehicle sales software',
    'dealership management software',
    'auto sales software',
    'car inventory software',
    'dealership dms software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'car rental'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Inventory and financing' },
    { id: 'admin', name: 'Dealership Dashboard', enabled: true, basePath: '/admin', requiredRole: 'salesperson', layout: 'admin', description: 'Sales and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Dealer Principal', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Sales Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/sales' },
    { id: 'finance', name: 'Finance Manager', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/financing' },
    { id: 'salesperson', name: 'Salesperson', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/leads' },
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
    'reviews',
    'email',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'automotive',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a car dealership platform',
    'Create an auto sales CRM',
    'I need a dealership inventory system',
    'Build a used car dealer app',
    'Create a car dealership management platform',
  ],
};
