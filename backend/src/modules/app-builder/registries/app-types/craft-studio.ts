/**
 * Craft Studio App Type Definition
 *
 * Complete definition for craft studios and DIY workshops.
 * Essential for craft studios, maker spaces, and creative workshops.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CRAFT_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'craft-studio',
  name: 'Craft Studio',
  category: 'creative',
  description: 'Craft studio platform with class scheduling, project kits, materials inventory, and member management',
  icon: 'scissors',

  keywords: [
    'craft studio',
    'diy workshop',
    'craft studio software',
    'maker space',
    'creative workshop',
    'craft studio management',
    'class scheduling',
    'craft studio practice',
    'craft studio scheduling',
    'project kits',
    'craft studio crm',
    'handmade crafts',
    'craft studio business',
    'materials inventory',
    'craft studio pos',
    'craft classes',
    'craft studio operations',
    'creative arts',
    'craft studio services',
    'crafting community',
  ],

  synonyms: [
    'craft studio platform',
    'craft studio software',
    'diy workshop software',
    'maker space software',
    'creative workshop software',
    'class scheduling software',
    'craft studio practice software',
    'project kits software',
    'handmade crafts software',
    'creative arts software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'technology'],

  sections: [
    { id: 'frontend', name: 'Crafter Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and kits' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Members and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Lead Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'assistant', name: 'Studio Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/materials' },
    { id: 'crafter', name: 'Crafter', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'clients',
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

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'creative',

  examplePrompts: [
    'Build a craft studio platform',
    'Create a DIY workshop portal',
    'I need a maker space management system',
    'Build a creative workshop platform',
    'Create a craft class and kit booking app',
  ],
};
