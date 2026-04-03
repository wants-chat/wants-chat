/**
 * Nursery App Type Definition
 *
 * Complete definition for plant nursery operations.
 * Essential for wholesale nurseries, growers, and plant propagation businesses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NURSERY_APP_TYPE: AppTypeDefinition = {
  id: 'nursery',
  name: 'Nursery',
  category: 'agriculture',
  description: 'Plant nursery platform with inventory tracking, growing schedules, wholesale ordering, and crop management',
  icon: 'sprout',

  keywords: [
    'nursery',
    'plant nursery',
    'nursery software',
    'wholesale nursery',
    'plant grower',
    'nursery management',
    'inventory tracking',
    'nursery practice',
    'nursery scheduling',
    'growing schedules',
    'nursery crm',
    'wholesale ordering',
    'nursery business',
    'crop management',
    'nursery pos',
    'propagation',
    'nursery operations',
    'container plants',
    'nursery platform',
    'field grown',
  ],

  synonyms: [
    'nursery platform',
    'nursery software',
    'plant nursery software',
    'wholesale nursery software',
    'plant grower software',
    'inventory tracking software',
    'nursery practice software',
    'growing schedules software',
    'wholesale ordering software',
    'propagation software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant', 'daycare', 'childcare'],

  sections: [
    { id: 'frontend', name: 'Buyer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Catalog and orders' },
    { id: 'admin', name: 'Grower Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Production and sales' },
  ],

  roles: [
    { id: 'admin', name: 'Nursery Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Production Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/production' },
    { id: 'grower', name: 'Grower', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/crops' },
    { id: 'buyer', name: 'Wholesale Buyer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'inventory',
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
  industry: 'agriculture',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'natural',

  examplePrompts: [
    'Build a plant nursery platform',
    'Create a wholesale nursery portal',
    'I need a nursery management system',
    'Build an inventory and growing platform',
    'Create a wholesale ordering and crop app',
  ],
};
