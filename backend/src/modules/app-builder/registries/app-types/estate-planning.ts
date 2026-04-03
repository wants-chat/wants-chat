/**
 * Estate Planning App Type Definition
 *
 * Complete definition for estate planning attorneys.
 * Essential for wills, trusts, probate, and wealth transfer planning.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ESTATE_PLANNING_APP_TYPE: AppTypeDefinition = {
  id: 'estate-planning',
  name: 'Estate Planning',
  category: 'legal',
  description: 'Estate planning platform with document drafting, asset inventory, beneficiary tracking, and trust administration',
  icon: 'scroll',

  keywords: [
    'estate planning',
    'estate attorney',
    'estate planning software',
    'wills and trusts',
    'probate',
    'estate planning management',
    'living trust',
    'estate planning firm',
    'estate scheduling',
    'power of attorney',
    'estate planning crm',
    'wealth transfer',
    'estate planning business',
    'inheritance',
    'estate planning pos',
    'trust administration',
    'estate operations',
    'estate tax',
    'estate services',
    'legacy planning',
  ],

  synonyms: [
    'estate planning platform',
    'estate planning software',
    'estate attorney software',
    'wills and trusts software',
    'probate software',
    'living trust software',
    'estate planning firm software',
    'wealth transfer software',
    'trust administration software',
    'legacy planning software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'real estate sales'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Documents and updates' },
    { id: 'admin', name: 'Firm Dashboard', enabled: true, basePath: '/admin', requiredRole: 'paralegal', layout: 'admin', description: 'Estates and trusts' },
  ],

  roles: [
    { id: 'admin', name: 'Managing Partner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'attorney', name: 'Estate Attorney', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'paralegal', name: 'Estate Paralegal', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/documents' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'case-management',
    'client-intake',
    'document-assembly',
    'billing-timekeeping',
    'client-portal',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'court-calendar',
    'conflict-check',
    'matter-notes',
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'legal',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an estate planning firm platform',
    'Create a wills and trusts app',
    'I need a trust administration system',
    'Build a probate case management platform',
    'Create a wealth transfer planning app',
  ],
};
