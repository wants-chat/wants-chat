/**
 * Sculpture Studio App Type Definition
 *
 * Complete definition for sculpture studios and 3D art workshops.
 * Essential for sculpture studios, metal fabrication shops, and stone carving workshops.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SCULPTURE_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'sculpture-studio',
  name: 'Sculpture Studio',
  category: 'creative',
  description: 'Sculpture studio platform with studio space rentals, equipment scheduling, class management, and commission tracking',
  icon: 'box',

  keywords: [
    'sculpture studio',
    '3d art workshop',
    'sculpture software',
    'stone carving',
    'metal sculpture',
    'sculpture management',
    'studio space rentals',
    'sculpture practice',
    'sculpture scheduling',
    'sculpture classes',
    'sculpture crm',
    'bronze casting',
    'sculpture business',
    'clay modeling',
    'sculpture pos',
    'installation art',
    'sculpture operations',
    'welding',
    'sculpture services',
    'figurative art',
  ],

  synonyms: [
    'sculpture studio platform',
    'sculpture software',
    '3d art workshop software',
    'stone carving software',
    'metal sculpture software',
    'studio space rentals software',
    'sculpture practice software',
    'sculpture classes software',
    'bronze casting software',
    'installation art software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'technology'],

  sections: [
    { id: 'frontend', name: 'Artist Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and studio' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Artists and equipment' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Master Sculptor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'technician', name: 'Fabrication Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/equipment' },
    { id: 'artist', name: 'Sculptor', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
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

  defaultColorScheme: 'stone',
  defaultDesignVariant: 'artisan',

  examplePrompts: [
    'Build a sculpture studio platform',
    'Create a 3D art workshop portal',
    'I need a sculpture studio management system',
    'Build a stone carving school platform',
    'Create a sculpture class and studio booking app',
  ],
};
