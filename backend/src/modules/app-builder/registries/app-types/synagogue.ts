/**
 * Synagogue App Type Definition
 *
 * Complete definition for synagogue and Jewish community applications.
 * Essential for synagogues, temples, and Jewish community organizations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SYNAGOGUE_APP_TYPE: AppTypeDefinition = {
  id: 'synagogue',
  name: 'Synagogue',
  category: 'religious',
  description: 'Synagogue platform with service schedules, membership management, yahrzeit tracking, and event coordination',
  icon: 'star',

  keywords: [
    'synagogue',
    'temple',
    'synagogue software',
    'jewish community',
    'shabbat services',
    'synagogue management',
    'high holidays',
    'synagogue donations',
    'synagogue events',
    'jewish congregation',
    'synagogue crm',
    'yahrzeit',
    'synagogue business',
    'hebrew school',
    'synagogue pos',
    'bar mitzvah',
    'synagogue operations',
    'jewish education',
    'synagogue services',
    'torah',
  ],

  synonyms: [
    'synagogue platform',
    'synagogue software',
    'temple software',
    'jewish community software',
    'synagogue management software',
    'congregation software',
    'synagogue donation software',
    'synagogue event software',
    'jewish organization software',
    'synagogue operations software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'synagogue architecture'],

  sections: [
    { id: 'frontend', name: 'Community Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and events' },
    { id: 'admin', name: 'Synagogue Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Members and donations' },
  ],

  roles: [
    { id: 'admin', name: 'Rabbi', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Executive Director', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/members' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'subscriptions',
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

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a synagogue management platform',
    'Create a Jewish temple community app',
    'I need a synagogue membership system',
    'Build a synagogue event and donation platform',
    'Create a Jewish congregation app',
  ],
};
