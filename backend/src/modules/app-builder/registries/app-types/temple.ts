/**
 * Temple App Type Definition
 *
 * Complete definition for Hindu temples and spiritual center applications.
 * Essential for Hindu temples, spiritual centers, and religious communities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TEMPLE_APP_TYPE: AppTypeDefinition = {
  id: 'temple',
  name: 'Temple',
  category: 'religious',
  description: 'Temple platform with puja scheduling, darshan timings, donation management, and festival coordination',
  icon: 'sun',

  keywords: [
    'temple',
    'hindu temple',
    'temple software',
    'mandir',
    'puja booking',
    'temple management',
    'darshan',
    'temple donations',
    'temple events',
    'hindu community',
    'temple crm',
    'festivals',
    'temple business',
    'archana',
    'temple pos',
    'prasad',
    'temple operations',
    'religious services',
    'temple services',
    'spiritual center',
  ],

  synonyms: [
    'temple platform',
    'temple software',
    'hindu temple software',
    'mandir software',
    'temple management software',
    'puja booking software',
    'temple donation software',
    'temple event software',
    'spiritual center software',
    'temple operations software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'temple run'],

  sections: [
    { id: 'frontend', name: 'Devotee Portal', enabled: true, basePath: '/', layout: 'public', description: 'Pujas and darshan' },
    { id: 'admin', name: 'Temple Dashboard', enabled: true, basePath: '/admin', requiredRole: 'priest', layout: 'admin', description: 'Services and donations' },
  ],

  roles: [
    { id: 'admin', name: 'Head Priest', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Temple Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/pujas' },
    { id: 'priest', name: 'Priest', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'devotee', name: 'Devotee', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'team-management',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'religious',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a Hindu temple management platform',
    'Create a mandir puja booking app',
    'I need a temple donation and event system',
    'Build a temple darshan scheduling platform',
    'Create a spiritual center community app',
  ],
};
