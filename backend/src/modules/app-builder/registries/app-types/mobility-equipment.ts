/**
 * Mobility Equipment App Type Definition
 *
 * Complete definition for mobility equipment sales and rental operations.
 * Essential for wheelchair dealers, mobility scooter shops, and DME providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOBILITY_EQUIPMENT_APP_TYPE: AppTypeDefinition = {
  id: 'mobility-equipment',
  name: 'Mobility Equipment',
  category: 'retail',
  description: 'Mobility equipment platform with product catalog, rental management, insurance claims, and delivery scheduling',
  icon: 'wheelchair',

  keywords: [
    'mobility equipment',
    'wheelchair dealer',
    'mobility equipment software',
    'mobility scooter',
    'dme provider',
    'mobility equipment management',
    'product catalog',
    'mobility equipment practice',
    'mobility equipment scheduling',
    'rental management',
    'mobility equipment crm',
    'insurance claims',
    'mobility equipment business',
    'delivery scheduling',
    'mobility equipment pos',
    'power wheelchair',
    'mobility equipment operations',
    'lift chair',
    'mobility equipment platform',
    'walker rollator',
  ],

  synonyms: [
    'mobility equipment platform',
    'mobility equipment software',
    'wheelchair dealer software',
    'mobility scooter software',
    'dme provider software',
    'product catalog software',
    'mobility equipment practice software',
    'rental management software',
    'insurance claims software',
    'power wheelchair software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'veterinary'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and rentals' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'technician', name: 'Service Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/service' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'product-catalog',
    'appointments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'veterinary-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'accessible',

  examplePrompts: [
    'Build a mobility equipment platform',
    'Create a wheelchair sales app',
    'I need a mobility scooter rental system',
    'Build a DME provider portal',
    'Create a mobility equipment store app',
  ],
};
