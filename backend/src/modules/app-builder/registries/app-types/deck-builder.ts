/**
 * Deck Builder App Type Definition
 *
 * Complete definition for deck construction operations.
 * Essential for deck builders, patio contractors, and outdoor living specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DECK_BUILDER_APP_TYPE: AppTypeDefinition = {
  id: 'deck-builder',
  name: 'Deck Builder',
  category: 'construction',
  description: 'Deck builder platform with project estimation, 3D design, permit tracking, and material management',
  icon: 'layers',

  keywords: [
    'deck builder',
    'patio contractor',
    'deck builder software',
    'outdoor living',
    'deck construction',
    'deck builder management',
    'project estimation',
    'deck builder practice',
    'deck builder scheduling',
    '3d design',
    'deck builder crm',
    'permit tracking',
    'deck builder business',
    'material management',
    'deck builder pos',
    'composite deck',
    'deck builder operations',
    'pergola',
    'deck builder platform',
    'railing',
  ],

  synonyms: [
    'deck builder platform',
    'deck builder software',
    'patio contractor software',
    'outdoor living software',
    'deck construction software',
    'project estimation software',
    'deck builder practice software',
    '3d design software',
    'permit tracking software',
    'composite deck software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Designs and quotes' },
    { id: 'admin', name: 'Builder Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and materials' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Project Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'carpenter', name: 'Lead Carpenter', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Homeowner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'project-bids',
    'daily-logs',
    'material-takeoffs',
  ],

  optionalFeatures: [
    'payments',
    'team-management',
    'gallery',
    'reporting',
    'analytics',
    'subcontractor-mgmt',
    'change-orders',
    'punch-lists',
    'site-safety',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'construction',

  defaultColorScheme: 'brown',
  defaultDesignVariant: 'outdoor',

  examplePrompts: [
    'Build a deck builder platform',
    'Create a patio contractor app',
    'I need a deck construction system',
    'Build an outdoor living project app',
    'Create a deck building business portal',
  ],
};
