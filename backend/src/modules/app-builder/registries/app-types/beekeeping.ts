/**
 * Beekeeping App Type Definition
 *
 * Complete definition for beekeeping and apiary management applications.
 * Essential for beekeepers, apiaries, and honey production operations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BEEKEEPING_APP_TYPE: AppTypeDefinition = {
  id: 'beekeeping',
  name: 'Beekeeping',
  category: 'agriculture',
  description: 'Beekeeping platform with hive management, inspection records, honey production tracking, and queen management',
  icon: 'hexagon',

  keywords: [
    'beekeeping',
    'apiary',
    'hive management',
    'bee management',
    'honey production',
    'apiculture',
    'bee tracking',
    'hive inspection',
    'queen tracking',
    'bee health',
    'honey harvest',
    'beekeeper software',
    'apiary management',
    'bee colony',
    'swarm management',
    'beekeeping records',
    'pollination services',
    'bee yard',
    'beehive',
    'apiary software',
  ],

  synonyms: [
    'beekeeping platform',
    'beekeeping software',
    'apiary management software',
    'hive management software',
    'bee tracking software',
    'apiculture software',
    'honey production software',
    'beekeeper app',
    'hive inspection software',
    'bee colony management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'busy bee general'],

  sections: [
    { id: 'frontend', name: 'Apiary Portal', enabled: true, basePath: '/', layout: 'public', description: 'Hive overview' },
    { id: 'admin', name: 'Beekeeping Dashboard', enabled: true, basePath: '/admin', requiredRole: 'keeper', layout: 'admin', description: 'Hives and inspections' },
  ],

  roles: [
    { id: 'admin', name: 'Apiary Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Apiary Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/apiaries' },
    { id: 'keeper', name: 'Beekeeper', level: 55, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/hives' },
    { id: 'assistant', name: 'Assistant', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inspections' },
    { id: 'viewer', name: 'Viewer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'agriculture',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a beekeeping management app',
    'Create an apiary tracking system',
    'I need a hive management platform',
    'Build a honey production tracker',
    'Create a beekeeper record keeping app',
  ],
};
