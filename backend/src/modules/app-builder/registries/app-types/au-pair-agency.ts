/**
 * Au Pair Agency App Type Definition
 *
 * Complete definition for au pair agency operations.
 * Essential for au pair placement agencies, cultural exchange programs, and live-in childcare services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AU_PAIR_AGENCY_APP_TYPE: AppTypeDefinition = {
  id: 'au-pair-agency',
  name: 'Au Pair Agency',
  category: 'services',
  description: 'Au pair agency platform with family matching, visa coordination, orientation scheduling, and support services',
  icon: 'globe',

  keywords: [
    'au pair agency',
    'cultural exchange',
    'au pair agency software',
    'live in childcare',
    'host family',
    'au pair agency management',
    'family matching',
    'au pair agency practice',
    'au pair agency scheduling',
    'visa coordination',
    'au pair agency crm',
    'orientation scheduling',
    'au pair agency business',
    'support services',
    'au pair agency pos',
    'exchange student',
    'au pair agency operations',
    'childcare abroad',
    'au pair agency platform',
    'state department',
  ],

  synonyms: [
    'au pair agency platform',
    'au pair agency software',
    'cultural exchange software',
    'live in childcare software',
    'host family software',
    'family matching software',
    'au pair agency practice software',
    'visa coordination software',
    'orientation scheduling software',
    'exchange student software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Participant Portal', enabled: true, basePath: '/', layout: 'public', description: 'Matching and applications' },
    { id: 'admin', name: 'Agency Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Placements and compliance' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coordinator', name: 'Placement Coordinator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/matches' },
    { id: 'counselor', name: 'Local Counselor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/placements' },
    { id: 'participant', name: 'Host Family/Au Pair', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'documents',
    'contracts',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'global',

  examplePrompts: [
    'Build an au pair agency platform',
    'Create a cultural exchange app',
    'I need a live-in childcare system',
    'Build a host family matching app',
    'Create an au pair agency portal',
  ],
};
