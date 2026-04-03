/**
 * PR Agency App Type Definition
 *
 * Complete definition for public relations agency applications.
 * Essential for PR firms, communications agencies, and media relations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PR_AGENCY_APP_TYPE: AppTypeDefinition = {
  id: 'pr-agency',
  name: 'PR Agency',
  category: 'professional-services',
  description: 'PR agency platform with media database, press release management, coverage tracking, and client reporting',
  icon: 'newspaper',

  keywords: [
    'pr agency',
    'public relations',
    'communications agency',
    'media relations',
    'pr firm',
    'pr software',
    'press release',
    'media database',
    'media monitoring',
    'coverage tracking',
    'pr management',
    'crisis communications',
    'media outreach',
    'press coverage',
    'pr campaigns',
    'media pitching',
    'journalist database',
    'pr reporting',
    'pr metrics',
    'earned media',
  ],

  synonyms: [
    'pr agency platform',
    'pr agency software',
    'public relations software',
    'communications agency software',
    'media relations software',
    'pr management software',
    'press release software',
    'media monitoring software',
    'coverage tracking software',
    'pr campaign software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'personal pr'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Coverage and reports' },
    { id: 'admin', name: 'PR Dashboard', enabled: true, basePath: '/admin', requiredRole: 'publicist', layout: 'admin', description: 'Campaigns and media' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Principal', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'director', name: 'Account Director', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'manager', name: 'Account Manager', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/campaigns' },
    { id: 'publicist', name: 'Publicist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/pitches' },
    { id: 'coordinator', name: 'Coordinator', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'professional-services',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a PR agency platform',
    'Create a public relations management app',
    'I need a media relations system',
    'Build a coverage tracking platform',
    'Create a press release management system',
  ],
};
