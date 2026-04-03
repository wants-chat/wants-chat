/**
 * Calligraphy Studio App Type Definition
 *
 * Complete definition for calligraphy studios and lettering workshops.
 * Essential for calligraphy schools, lettering studios, and penmanship centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CALLIGRAPHY_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'calligraphy-studio',
  name: 'Calligraphy Studio',
  category: 'creative',
  description: 'Calligraphy studio platform with class scheduling, commission orders, workshop management, and supply shop',
  icon: 'pen-tool',

  keywords: [
    'calligraphy studio',
    'lettering workshop',
    'calligraphy software',
    'hand lettering',
    'penmanship',
    'calligraphy management',
    'class scheduling',
    'calligraphy practice',
    'calligraphy scheduling',
    'calligraphy classes',
    'calligraphy crm',
    'brush lettering',
    'calligraphy business',
    'wedding calligraphy',
    'calligraphy pos',
    'modern calligraphy',
    'calligraphy operations',
    'copperplate',
    'calligraphy services',
    'script writing',
  ],

  synonyms: [
    'calligraphy studio platform',
    'calligraphy software',
    'lettering workshop software',
    'hand lettering software',
    'penmanship software',
    'class scheduling software',
    'calligraphy practice software',
    'calligraphy classes software',
    'brush lettering software',
    'modern calligraphy software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'technology'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and orders' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Students and commissions' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Master Calligrapher', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'assistant', name: 'Studio Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'creative',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a calligraphy studio platform',
    'Create a lettering workshop portal',
    'I need a calligraphy school management system',
    'Build a hand lettering class platform',
    'Create a calligraphy class and commission app',
  ],
};
