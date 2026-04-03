/**
 * Soap Making App Type Definition
 *
 * Complete definition for soap making and bath product operations.
 * Essential for soap studios, bath product makers, and cosmetic artisans.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOAP_MAKING_APP_TYPE: AppTypeDefinition = {
  id: 'soap-making',
  name: 'Soap Making',
  category: 'artisan',
  description: 'Soap making platform with recipe management, class scheduling, batch tracking, and wholesale distribution',
  icon: 'droplet',

  keywords: [
    'soap making',
    'bath products',
    'soap making software',
    'cosmetic artisan',
    'handmade soap',
    'soap making management',
    'recipe management',
    'soap making practice',
    'soap making scheduling',
    'class scheduling',
    'soap making crm',
    'batch tracking',
    'soap making business',
    'wholesale distribution',
    'soap making pos',
    'cold process',
    'soap making operations',
    'bath bombs',
    'soap making platform',
    'natural skincare',
  ],

  synonyms: [
    'soap making platform',
    'soap making software',
    'bath products software',
    'cosmetic artisan software',
    'handmade soap software',
    'recipe management software',
    'soap making practice software',
    'class scheduling software',
    'batch tracking software',
    'cold process software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and classes' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Recipes and batches' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'maker', name: 'Soap Maker', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/batches' },
    { id: 'staff', name: 'Production Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'subscriptions',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'artisan',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'natural',

  examplePrompts: [
    'Build a soap making platform',
    'Create a bath products portal',
    'I need a handmade soap system',
    'Build a soap class platform',
    'Create a soap wholesale app',
  ],
};
