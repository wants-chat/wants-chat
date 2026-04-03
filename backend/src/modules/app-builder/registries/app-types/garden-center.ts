/**
 * Garden Center App Type Definition
 *
 * Complete definition for garden center operations.
 * Essential for garden shops, plant nurseries, and outdoor living stores.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GARDEN_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'garden-center',
  name: 'Garden Center',
  category: 'retail',
  description: 'Garden center platform with plant inventory, seasonal products, care guides, and delivery scheduling',
  icon: 'flower-2',

  keywords: [
    'garden center',
    'garden shop',
    'garden center software',
    'plant store',
    'outdoor living',
    'garden center management',
    'plant inventory',
    'garden center practice',
    'garden center scheduling',
    'seasonal products',
    'garden center crm',
    'care guides',
    'garden center business',
    'delivery scheduling',
    'garden center pos',
    'landscaping supplies',
    'garden center operations',
    'hardgoods',
    'garden center platform',
    'pottery',
  ],

  synonyms: [
    'garden center platform',
    'garden center software',
    'garden shop software',
    'plant store software',
    'outdoor living software',
    'plant inventory software',
    'garden center practice software',
    'seasonal products software',
    'care guides software',
    'landscaping supplies software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Plants and products' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Garden Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'staff', name: 'Garden Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sales' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'natural',

  examplePrompts: [
    'Build a garden center platform',
    'Create a garden shop portal',
    'I need a garden center management system',
    'Build a plant inventory platform',
    'Create a seasonal products and delivery app',
  ],
};
