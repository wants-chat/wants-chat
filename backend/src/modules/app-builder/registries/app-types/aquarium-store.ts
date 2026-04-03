/**
 * Aquarium Store App Type Definition
 *
 * Complete definition for aquarium stores and fish shops.
 * Essential for aquarium stores, fish retailers, and aquatic specialty shops.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AQUARIUM_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'aquarium-store',
  name: 'Aquarium Store',
  category: 'pets',
  description: 'Aquarium store platform with livestock inventory, tank maintenance scheduling, water testing, and aquascaping services',
  icon: 'waves',

  keywords: [
    'aquarium store',
    'fish store',
    'aquarium software',
    'fish shop',
    'aquatic store',
    'aquarium retail',
    'fish inventory',
    'coral store',
    'aquarium pos',
    'fish tank',
    'aquarium crm',
    'reef store',
    'aquarium management',
    'fish livestock',
    'aquarium business',
    'aquarium maintenance',
    'aquascaping',
    'aquarium supplies',
    'saltwater fish',
    'freshwater fish',
  ],

  synonyms: [
    'aquarium store platform',
    'aquarium store software',
    'fish store software',
    'aquatic store software',
    'aquarium retail software',
    'fish shop software',
    'aquarium pos software',
    'coral store software',
    'aquarium management software',
    'fish inventory software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'public aquarium'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Shop and services' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and tanks' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/livestock' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'product-catalog',
    'scheduling',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reviews',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'pets',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build an aquarium store platform',
    'Create a fish shop inventory app',
    'I need an aquatic retail management system',
    'Build a coral store ecommerce app',
    'Create an aquarium maintenance scheduling platform',
  ],
};
