/**
 * Bodyguard App Type Definition
 *
 * Complete definition for executive protection and bodyguard service applications.
 * Essential for protection agencies, bodyguard services, and VIP security.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BODYGUARD_APP_TYPE: AppTypeDefinition = {
  id: 'bodyguard',
  name: 'Bodyguard',
  category: 'security',
  description: 'Executive protection platform with agent scheduling, threat assessment, route planning, and client management',
  icon: 'user-shield',

  keywords: [
    'bodyguard',
    'executive protection',
    'close protection',
    'vip security',
    'bodyguard software',
    'protection services',
    'personal security',
    'protection agent',
    'security detail',
    'protection scheduling',
    'threat assessment',
    'protection agency',
    'celebrity security',
    'corporate protection',
    'dignitary protection',
    'protection business',
    'security escort',
    'protection team',
    'secure transport',
    'protection operations',
  ],

  synonyms: [
    'bodyguard platform',
    'bodyguard software',
    'executive protection software',
    'close protection software',
    'vip security software',
    'protection service software',
    'personal security software',
    'protection agency software',
    'security detail software',
    'protection scheduling software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'bodyguard movie'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Schedule and requests' },
    { id: 'admin', name: 'Protection Dashboard', enabled: true, basePath: '/admin', requiredRole: 'agent', layout: 'admin', description: 'Assignments and intel' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/assignments' },
    { id: 'lead', name: 'Team Lead', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/operations' },
    { id: 'agent', name: 'Protection Agent', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'clients',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'manufacturing'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'security',

  defaultColorScheme: 'neutral',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an executive protection platform',
    'Create a bodyguard scheduling app',
    'I need a protection agency system',
    'Build a VIP security app',
    'Create a close protection platform',
  ],
};
