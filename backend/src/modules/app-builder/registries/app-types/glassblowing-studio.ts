/**
 * Glassblowing Studio App Type Definition
 *
 * Complete definition for glassblowing and glass art operations.
 * Essential for glassblowing studios, glass art galleries, and glass craft education.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GLASSBLOWING_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'glassblowing-studio',
  name: 'Glassblowing Studio',
  category: 'artisan',
  description: 'Glassblowing studio platform with class booking, commission management, gallery showcase, and furnace scheduling',
  icon: 'flame',

  keywords: [
    'glassblowing studio',
    'glass art',
    'glassblowing studio software',
    'hot glass',
    'art glass',
    'glassblowing studio management',
    'class booking',
    'glassblowing studio practice',
    'glassblowing studio scheduling',
    'commission management',
    'glassblowing studio crm',
    'gallery showcase',
    'glassblowing studio business',
    'furnace scheduling',
    'glassblowing studio pos',
    'blown glass',
    'glassblowing studio operations',
    'fused glass',
    'glassblowing studio platform',
    'glass sculpture',
  ],

  synonyms: [
    'glassblowing studio platform',
    'glassblowing studio software',
    'glass art software',
    'hot glass software',
    'art glass software',
    'class booking software',
    'glassblowing studio practice software',
    'commission management software',
    'gallery showcase software',
    'blown glass software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and gallery' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Schedule and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'artist', name: 'Glass Artist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'assistant', name: 'Studio Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/furnace' },
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
    'inventory',
    'shipping',
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
  defaultDesignVariant: 'artistic',

  examplePrompts: [
    'Build a glassblowing studio platform',
    'Create a glass art gallery portal',
    'I need a hot glass studio system',
    'Build a glass class booking platform',
    'Create a glassblowing commission app',
  ],
};
