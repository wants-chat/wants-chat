/**
 * Babysitting App Type Definition
 *
 * Complete definition for babysitting services and childcare applications.
 * Essential for babysitters, childcare providers, and parent networks.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BABYSITTING_APP_TYPE: AppTypeDefinition = {
  id: 'babysitting',
  name: 'Babysitting',
  category: 'children',
  description: 'Babysitting platform with sitter matching, booking management, background checks, and parent reviews',
  icon: 'heart',

  keywords: [
    'babysitting',
    'babysitter',
    'babysitting software',
    'childcare',
    'babysitter booking',
    'babysitting service',
    'sitter matching',
    'babysitter management',
    'babysitting scheduling',
    'date night sitter',
    'babysitting crm',
    'occasional care',
    'babysitting business',
    'backup care',
    'babysitting pos',
    'sitter network',
    'babysitting operations',
    'overnight care',
    'babysitting services',
    'trusted sitters',
  ],

  synonyms: [
    'babysitting platform',
    'babysitting software',
    'babysitter software',
    'childcare software',
    'sitter booking software',
    'babysitting service software',
    'sitter matching software',
    'babysitter management software',
    'occasional care software',
    'sitter network software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'pet sitting'],

  sections: [
    { id: 'frontend', name: 'Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Find and book sitters' },
    { id: 'admin', name: 'Admin Dashboard', enabled: true, basePath: '/admin', requiredRole: 'sitter', layout: 'admin', description: 'Jobs and availability' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Coordinator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'sitter', name: 'Babysitter', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'parent', name: 'Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'messaging',
    'time-tracking',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'children',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a babysitting service platform',
    'Create a babysitter booking app',
    'I need a sitter matching system',
    'Build a childcare marketplace',
    'Create a babysitter network app',
  ],
};
