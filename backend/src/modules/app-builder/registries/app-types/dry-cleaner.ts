/**
 * Dry Cleaner App Type Definition
 *
 * Complete definition for dry cleaning business operations.
 * Essential for dry cleaners, garment care, and alterations shops.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DRY_CLEANER_APP_TYPE: AppTypeDefinition = {
  id: 'dry-cleaner',
  name: 'Dry Cleaner',
  category: 'services',
  description: 'Dry cleaner platform with garment tracking, order management, route scheduling, and customer notifications',
  icon: 'shirt',

  keywords: [
    'dry cleaner',
    'dry cleaning',
    'dry cleaner software',
    'garment care',
    'alterations',
    'dry cleaner management',
    'garment tracking',
    'dry cleaner practice',
    'dry cleaner scheduling',
    'order management',
    'dry cleaner crm',
    'route scheduling',
    'dry cleaner business',
    'customer notifications',
    'dry cleaner pos',
    'pressing',
    'dry cleaner operations',
    'stain removal',
    'dry cleaner platform',
    'pickup delivery',
  ],

  synonyms: [
    'dry cleaner platform',
    'dry cleaner software',
    'dry cleaning software',
    'garment care software',
    'alterations software',
    'garment tracking software',
    'dry cleaner practice software',
    'order management software',
    'route scheduling software',
    'pickup delivery software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Orders and tracking' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Orders and routes' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
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
    'clients',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a dry cleaner platform',
    'Create a garment care portal',
    'I need a dry cleaning management system',
    'Build an order tracking platform',
    'Create a pickup delivery app',
  ],
};
