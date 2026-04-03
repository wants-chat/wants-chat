/**
 * Woodturning Studio App Type Definition
 *
 * Complete definition for woodturning and lathe craft operations.
 * Essential for woodturning studios, lathe workshops, and wood art centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WOODTURNING_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'woodturning-studio',
  name: 'Woodturning Studio',
  category: 'artisan',
  description: 'Woodturning studio platform with lathe booking, class scheduling, commission management, and gallery showcase',
  icon: 'disc',

  keywords: [
    'woodturning studio',
    'lathe workshop',
    'woodturning studio software',
    'wood art',
    'turned wood',
    'woodturning studio management',
    'lathe booking',
    'woodturning studio practice',
    'woodturning studio scheduling',
    'class scheduling',
    'woodturning studio crm',
    'commission management',
    'woodturning studio business',
    'gallery showcase',
    'woodturning studio pos',
    'bowls pens',
    'woodturning studio operations',
    'spindle work',
    'woodturning studio platform',
    'segmented turning',
  ],

  synonyms: [
    'woodturning studio platform',
    'woodturning studio software',
    'lathe workshop software',
    'wood art software',
    'turned wood software',
    'lathe booking software',
    'woodturning studio practice software',
    'class scheduling software',
    'commission management software',
    'bowls pens software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and gallery' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Lathes and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Turning Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'staff', name: 'Shop Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/lathes' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'artisan',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'rustic',

  examplePrompts: [
    'Build a woodturning studio platform',
    'Create a lathe workshop portal',
    'I need a wood art studio system',
    'Build a turning class platform',
    'Create a woodturning gallery app',
  ],
};
