/**
 * Woodworking Studio App Type Definition
 *
 * Complete definition for woodworking studios and carpentry workshops.
 * Essential for woodshops, furniture making schools, and woodcraft studios.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WOODWORKING_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'woodworking-studio',
  name: 'Woodworking Studio',
  category: 'creative',
  description: 'Woodworking studio platform with shop time booking, machine scheduling, class management, and project storage',
  icon: 'hammer',

  keywords: [
    'woodworking studio',
    'carpentry workshop',
    'woodworking software',
    'woodshop',
    'furniture making',
    'woodworking management',
    'shop time booking',
    'woodworking practice',
    'woodworking scheduling',
    'machine scheduling',
    'woodworking crm',
    'wood turning',
    'woodworking business',
    'joinery',
    'woodworking pos',
    'woodcraft classes',
    'woodworking operations',
    'hand tools',
    'woodworking services',
    'cabinet making',
  ],

  synonyms: [
    'woodworking studio platform',
    'woodworking software',
    'carpentry workshop software',
    'woodshop software',
    'furniture making software',
    'shop time booking software',
    'woodworking practice software',
    'machine scheduling software',
    'wood turning software',
    'cabinet making software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'technology'],

  sections: [
    { id: 'frontend', name: 'Maker Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and shop time' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Members and machines' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Master Woodworker', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'technician', name: 'Shop Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/machines' },
    { id: 'member', name: 'Woodworker', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  defaultColorScheme: 'brown',
  defaultDesignVariant: 'artisan',

  examplePrompts: [
    'Build a woodworking studio platform',
    'Create a carpentry workshop portal',
    'I need a woodshop management system',
    'Build a furniture making school platform',
    'Create a woodworking class and machine booking app',
  ],
};
