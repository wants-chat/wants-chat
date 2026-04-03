/**
 * Window Tinting App Type Definition
 *
 * Complete definition for window tinting service operations.
 * Essential for auto tint shops, residential tinting, and commercial film installers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WINDOW_TINTING_APP_TYPE: AppTypeDefinition = {
  id: 'window-tinting',
  name: 'Window Tinting',
  category: 'services',
  description: 'Window tinting platform with appointment scheduling, film inventory, warranty tracking, and quote generation',
  icon: 'sun',

  keywords: [
    'window tinting',
    'auto tint',
    'window tinting software',
    'residential tinting',
    'commercial film',
    'window tinting management',
    'appointment scheduling',
    'window tinting practice',
    'window tinting scheduling',
    'film inventory',
    'window tinting crm',
    'warranty tracking',
    'window tinting business',
    'quote generation',
    'window tinting pos',
    'ceramic tint',
    'window tinting operations',
    'security film',
    'window tinting platform',
    'uv protection',
  ],

  synonyms: [
    'window tinting platform',
    'window tinting software',
    'auto tint software',
    'residential tinting software',
    'commercial film software',
    'appointment scheduling software',
    'window tinting practice software',
    'film inventory software',
    'warranty tracking software',
    'ceramic tint software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quotes and booking' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Jobs and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'installer', name: 'Tint Installer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
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
    'gallery',
    'clients',
    'discounts',
    'reviews',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a window tinting platform',
    'Create an auto tint shop app',
    'I need a tinting business system',
    'Build a window film installer app',
    'Create a tinting service portal',
  ],
};
