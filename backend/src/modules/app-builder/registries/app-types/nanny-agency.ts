/**
 * Nanny Agency App Type Definition
 *
 * Complete definition for nanny agencies and household staffing.
 * Essential for nanny agencies, au pair services, and household staffing.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NANNY_AGENCY_APP_TYPE: AppTypeDefinition = {
  id: 'nanny-agency',
  name: 'Nanny Agency',
  category: 'children',
  description: 'Nanny agency platform with candidate matching, family profiles, placement tracking, and payroll management',
  icon: 'users',

  keywords: [
    'nanny agency',
    'nanny service',
    'nanny software',
    'household staffing',
    'nanny placement',
    'nanny management',
    'au pair',
    'nanny matching',
    'nanny scheduling',
    'live-in nanny',
    'nanny crm',
    'nanny share',
    'nanny business',
    'childcare placement',
    'nanny pos',
    'part-time nanny',
    'nanny operations',
    'nanny payroll',
    'nanny services',
    'family staffing',
  ],

  synonyms: [
    'nanny agency platform',
    'nanny agency software',
    'nanny placement software',
    'household staffing software',
    'nanny matching software',
    'au pair software',
    'nanny management software',
    'nanny scheduling software',
    'childcare placement software',
    'family staffing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'babysitting casual'],

  sections: [
    { id: 'frontend', name: 'Family Portal', enabled: true, basePath: '/', layout: 'public', description: 'Find nannies' },
    { id: 'admin', name: 'Agency Dashboard', enabled: true, basePath: '/admin', requiredRole: 'coordinator', layout: 'admin', description: 'Placements and candidates' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coordinator', name: 'Placement Coordinator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/placements' },
    { id: 'nanny', name: 'Nanny', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/profile' },
    { id: 'family', name: 'Family', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'contracts',
    'reviews',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'children',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a nanny agency platform',
    'Create a nanny placement app',
    'I need a household staffing system',
    'Build a nanny matching platform',
    'Create an au pair agency app',
  ],
};
