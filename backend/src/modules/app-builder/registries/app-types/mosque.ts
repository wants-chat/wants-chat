/**
 * Mosque App Type Definition
 *
 * Complete definition for mosque and Islamic center applications.
 * Essential for mosques, Islamic centers, and Muslim community organizations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOSQUE_APP_TYPE: AppTypeDefinition = {
  id: 'mosque',
  name: 'Mosque',
  category: 'religious',
  description: 'Mosque platform with prayer times, event management, donation processing, and community engagement',
  icon: 'moon',

  keywords: [
    'mosque',
    'masjid',
    'mosque software',
    'islamic center',
    'prayer times',
    'mosque management',
    'jummah',
    'mosque donations',
    'mosque events',
    'muslim community',
    'mosque crm',
    'ramadan',
    'mosque business',
    'quran classes',
    'mosque pos',
    'zakat',
    'mosque operations',
    'islamic school',
    'mosque services',
    'eid',
  ],

  synonyms: [
    'mosque platform',
    'mosque software',
    'masjid software',
    'islamic center software',
    'mosque management software',
    'muslim community software',
    'mosque donation software',
    'mosque event software',
    'islamic organization software',
    'mosque operations software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'mosque architecture'],

  sections: [
    { id: 'frontend', name: 'Community Portal', enabled: true, basePath: '/', layout: 'public', description: 'Prayer times and events' },
    { id: 'admin', name: 'Mosque Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Management and donations' },
  ],

  roles: [
    { id: 'admin', name: 'Imam', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Administrator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/events' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'team-management',
    'announcements',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'religious',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a mosque management platform',
    'Create an Islamic center community app',
    'I need a masjid prayer times and events system',
    'Build a mosque donation platform',
    'Create a Muslim community engagement app',
  ],
};
