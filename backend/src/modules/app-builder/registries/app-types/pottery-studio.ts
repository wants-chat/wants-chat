/**
 * Pottery Studio App Type Definition
 *
 * Complete definition for pottery studios and ceramics classes.
 * Essential for pottery studios, ceramic workshops, and clay art centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const POTTERY_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'pottery-studio',
  name: 'Pottery Studio',
  category: 'creative',
  description: 'Pottery studio platform with wheel reservations, kiln scheduling, class management, and member studio time',
  icon: 'coffee',

  keywords: [
    'pottery studio',
    'ceramics class',
    'pottery studio software',
    'clay art',
    'wheel throwing',
    'pottery studio management',
    'wheel reservations',
    'pottery studio practice',
    'pottery studio scheduling',
    'kiln scheduling',
    'pottery studio crm',
    'hand building',
    'pottery studio business',
    'glazing',
    'pottery studio pos',
    'pottery classes',
    'pottery studio operations',
    'ceramic art',
    'pottery studio services',
    'clay studio',
  ],

  synonyms: [
    'pottery studio platform',
    'pottery studio software',
    'ceramics class software',
    'clay art software',
    'wheel throwing software',
    'wheel reservations software',
    'pottery studio practice software',
    'kiln scheduling software',
    'hand building software',
    'ceramic art software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'technology'],

  sections: [
    { id: 'frontend', name: 'Potter Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and wheels' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Members and kilns' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Master Potter', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'technician', name: 'Kiln Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/kilns' },
    { id: 'member', name: 'Potter', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
  complexity: 'moderate',
  industry: 'creative',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'artisan',

  examplePrompts: [
    'Build a pottery studio platform',
    'Create a ceramics class portal',
    'I need a clay studio management system',
    'Build a wheel throwing class platform',
    'Create a pottery class and kiln booking app',
  ],
};
