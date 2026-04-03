/**
 * Shoe Repair App Type Definition
 *
 * Complete definition for shoe repair and cobbler operations.
 * Essential for shoe repair shops, cobblers, and leather repair services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHOE_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'shoe-repair',
  name: 'Shoe Repair',
  category: 'services',
  description: 'Shoe repair platform with order tracking, service pricing, pickup notifications, and customer history',
  icon: 'footprints',

  keywords: [
    'shoe repair',
    'cobbler',
    'shoe repair software',
    'leather repair',
    'boot repair',
    'shoe repair management',
    'order tracking',
    'shoe repair practice',
    'shoe repair scheduling',
    'service pricing',
    'shoe repair crm',
    'pickup notifications',
    'shoe repair business',
    'customer history',
    'shoe repair pos',
    'heel replacement',
    'shoe repair operations',
    'sole repair',
    'shoe repair platform',
    'shoe shine',
  ],

  synonyms: [
    'shoe repair platform',
    'shoe repair software',
    'cobbler software',
    'leather repair software',
    'boot repair software',
    'order tracking software',
    'shoe repair practice software',
    'service pricing software',
    'pickup notifications software',
    'heel replacement software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Orders and services' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Orders and queue' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'cobbler', name: 'Master Cobbler', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'clerk', name: 'Counter Clerk', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/intake' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'orders',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'simple',
  industry: 'services',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'classic',

  examplePrompts: [
    'Build a shoe repair platform',
    'Create a cobbler shop portal',
    'I need a shoe repair management system',
    'Build an order tracking platform',
    'Create a repair pickup app',
  ],
};
