/**
 * Talent Agency App Type Definition
 *
 * Complete definition for talent agency and artist management applications.
 * Essential for talent agencies, modeling agencies, and artist representation.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TALENT_AGENCY_APP_TYPE: AppTypeDefinition = {
  id: 'talent-agency',
  name: 'Talent Agency',
  category: 'business',
  description: 'Talent agency platform with talent roster, booking management, audition tracking, and contract management',
  icon: 'sparkles',

  keywords: [
    'talent agency',
    'talent management',
    'modeling agency',
    'actor agency',
    'artist management',
    'talent roster',
    'booking agency',
    'casting agency',
    'talent representation',
    'agent',
    'talent booking',
    'auditions',
    'talent portfolio',
    'model management',
    'entertainment agency',
    'influencer management',
    'speaker bureau',
    'talent scout',
    'talent database',
    'booking management',
    'artist roster',
  ],

  synonyms: [
    'talent agency platform',
    'talent agency software',
    'talent management software',
    'modeling agency software',
    'booking agency software',
    'artist management platform',
    'talent roster software',
    'casting agency software',
    'talent booking platform',
    'agency management software',
  ],

  negativeKeywords: ['blog', 'portfolio website', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Talent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Browse talent and book' },
    { id: 'admin', name: 'Agency Dashboard', enabled: true, basePath: '/admin', requiredRole: 'agent', layout: 'admin', description: 'Roster and bookings' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'agent', name: 'Agent', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/talent' },
    { id: 'booker', name: 'Booker', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bookings' },
    { id: 'talent', name: 'Talent', level: 40, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/profile' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'contracts',
    'media',
    'analytics',
  ],

  incompatibleFeatures: ['inventory-warehouse', 'medical-records', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a talent agency platform',
    'Create a modeling agency management app',
    'I need a talent booking system',
    'Build an artist management platform',
    'Create a casting agency app',
  ],
};
