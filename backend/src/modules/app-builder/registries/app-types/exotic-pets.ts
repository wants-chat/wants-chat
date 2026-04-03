/**
 * Exotic Pets App Type Definition
 *
 * Complete definition for exotic pet store operations.
 * Essential for reptile shops, exotic animal dealers, and specialty pet stores.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EXOTIC_PETS_APP_TYPE: AppTypeDefinition = {
  id: 'exotic-pets',
  name: 'Exotic Pets',
  category: 'retail',
  description: 'Exotic pets platform with species inventory, care guides, habitat supplies, and breeder management',
  icon: 'bird',

  keywords: [
    'exotic pets',
    'reptile shop',
    'exotic pets software',
    'exotic animal',
    'specialty pets',
    'exotic pets management',
    'species inventory',
    'exotic pets practice',
    'exotic pets scheduling',
    'care guides',
    'exotic pets crm',
    'habitat supplies',
    'exotic pets business',
    'breeder management',
    'exotic pets pos',
    'herptile',
    'exotic pets operations',
    'avian specialist',
    'exotic pets platform',
    'small mammals',
  ],

  synonyms: [
    'exotic pets platform',
    'exotic pets software',
    'reptile shop software',
    'exotic animal software',
    'specialty pets software',
    'species inventory software',
    'exotic pets practice software',
    'care guides software',
    'habitat supplies software',
    'avian specialist software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Animals and supplies' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and breeders' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'specialist', name: 'Animal Specialist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/animals' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'retail',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'natural',

  examplePrompts: [
    'Build an exotic pets platform',
    'Create a reptile shop portal',
    'I need an exotic pet store management system',
    'Build a species inventory platform',
    'Create a care guides and habitat app',
  ],
};
