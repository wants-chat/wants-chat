/**
 * Gurdwara App Type Definition
 *
 * Complete definition for Gurdwara and Sikh community applications.
 * Essential for Gurdwaras, Sikh temples, and Sikh community organizations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GURDWARA_APP_TYPE: AppTypeDefinition = {
  id: 'gurdwara',
  name: 'Gurdwara',
  category: 'religious',
  description: 'Gurdwara platform with langar management, kirtan schedules, donation processing, and community services',
  icon: 'home',

  keywords: [
    'gurdwara',
    'sikh temple',
    'gurdwara software',
    'sikh community',
    'langar',
    'gurdwara management',
    'kirtan',
    'gurdwara donations',
    'gurdwara events',
    'sikh congregation',
    'gurdwara crm',
    'gurpurab',
    'gurdwara business',
    'sangat',
    'gurdwara pos',
    'akhand path',
    'gurdwara operations',
    'sewa',
    'gurdwara services',
    'sikh education',
  ],

  synonyms: [
    'gurdwara platform',
    'gurdwara software',
    'sikh temple software',
    'sikh community software',
    'gurdwara management software',
    'langar management software',
    'gurdwara donation software',
    'gurdwara event software',
    'sikh organization software',
    'gurdwara operations software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'gurdwara architecture'],

  sections: [
    { id: 'frontend', name: 'Sangat Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and langar' },
    { id: 'admin', name: 'Gurdwara Dashboard', enabled: true, basePath: '/admin', requiredRole: 'sewadar', layout: 'admin', description: 'Management and donations' },
  ],

  roles: [
    { id: 'admin', name: 'Granthi', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'President', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/services' },
    { id: 'sewadar', name: 'Sewadar', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/langar' },
    { id: 'member', name: 'Sangat Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'Build a Gurdwara management platform',
    'Create a Sikh temple community app',
    'I need a langar and kirtan scheduling system',
    'Build a Gurdwara donation platform',
    'Create a Sikh sangat community app',
  ],
};
