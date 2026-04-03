/**
 * Election System App Type Definition
 *
 * Complete definition for election management and voter services applications.
 * Essential for election offices, voter registration, and election information.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ELECTION_SYSTEM_APP_TYPE: AppTypeDefinition = {
  id: 'election-system',
  name: 'Election System',
  category: 'government',
  description: 'Election platform with voter registration, polling locations, candidate information, and election results',
  icon: 'vote',

  keywords: [
    'election system',
    'voter registration',
    'election management',
    'voting system',
    'election portal',
    'election results',
    'ballot information',
    'polling locations',
    'absentee voting',
    'voter lookup',
    'candidate information',
    'election software',
    'election office',
    'voter services',
    'sample ballot',
    'election dates',
    'voter id',
    'election calendar',
    'poll worker',
    'voter education',
  ],

  synonyms: [
    'election system platform',
    'election management software',
    'voter registration software',
    'voting system software',
    'election portal software',
    'election office software',
    'voter services software',
    'election results software',
    'ballot information software',
    'election administration software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'election algorithm'],

  sections: [
    { id: 'frontend', name: 'Voter Portal', enabled: true, basePath: '/', layout: 'public', description: 'Registration and information' },
    { id: 'admin', name: 'Election Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Election management' },
  ],

  roles: [
    { id: 'admin', name: 'Election Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Election Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/elections' },
    { id: 'staff', name: 'Election Staff', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/voters' },
    { id: 'pollworker', name: 'Poll Worker', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/polling' },
    { id: 'voter', name: 'Voter', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'ecommerce'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'government',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an election management system',
    'Create a voter registration portal',
    'I need an election information app',
    'Build a voter services platform',
    'Create an election results system',
  ],
};
