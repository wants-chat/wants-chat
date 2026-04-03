/**
 * Printmaking Studio App Type Definition
 *
 * Complete definition for printmaking studios and print workshops.
 * Essential for printmaking studios, etching workshops, and screen printing shops.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRINTMAKING_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'printmaking-studio',
  name: 'Printmaking Studio',
  category: 'creative',
  description: 'Printmaking studio platform with press reservations, class scheduling, edition tracking, and print sales',
  icon: 'printer',

  keywords: [
    'printmaking studio',
    'print workshop',
    'printmaking software',
    'etching studio',
    'screen printing',
    'printmaking management',
    'press reservations',
    'printmaking practice',
    'printmaking scheduling',
    'print classes',
    'printmaking crm',
    'lithography',
    'printmaking business',
    'relief printing',
    'printmaking pos',
    'intaglio',
    'printmaking operations',
    'monoprinting',
    'printmaking services',
    'woodcut',
  ],

  synonyms: [
    'printmaking studio platform',
    'printmaking software',
    'print workshop software',
    'etching studio software',
    'screen printing software',
    'press reservations software',
    'printmaking practice software',
    'print classes software',
    'lithography software',
    'relief printing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'technology'],

  sections: [
    { id: 'frontend', name: 'Artist Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and press' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Members and editions' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Master Printer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'technician', name: 'Press Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/equipment' },
    { id: 'member', name: 'Printmaker', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
  complexity: 'complex',
  industry: 'creative',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'artisan',

  examplePrompts: [
    'Build a printmaking studio platform',
    'Create a print workshop portal',
    'I need an etching studio management system',
    'Build a screen printing shop platform',
    'Create a printmaking class and press booking app',
  ],
};
