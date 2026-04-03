/**
 * Elder Law App Type Definition
 *
 * Complete definition for elder law firms and senior legal services.
 * Essential for elder law attorneys, estate planning, and Medicaid planning.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ELDER_LAW_APP_TYPE: AppTypeDefinition = {
  id: 'elder-law',
  name: 'Elder Law',
  category: 'seniors',
  description: 'Elder law platform with case management, document storage, client portal, and estate planning tools',
  icon: 'scale',

  keywords: [
    'elder law',
    'elder attorney',
    'elder law software',
    'estate planning',
    'medicaid planning',
    'elder law management',
    'senior legal',
    'elder law firm',
    'elder law scheduling',
    'guardianship',
    'elder law crm',
    'trust administration',
    'elder law business',
    'power of attorney',
    'elder law pos',
    'senior advocacy',
    'elder law operations',
    'estate documents',
    'elder law services',
    'long term care planning',
  ],

  synonyms: [
    'elder law platform',
    'elder law software',
    'elder attorney software',
    'estate planning software',
    'medicaid planning software',
    'senior legal software',
    'elder law firm software',
    'guardianship software',
    'trust administration software',
    'senior advocacy software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'criminal law'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Cases and documents' },
    { id: 'admin', name: 'Law Firm Dashboard', enabled: true, basePath: '/admin', requiredRole: 'paralegal', layout: 'admin', description: 'Cases and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Managing Partner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'attorney', name: 'Elder Law Attorney', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/cases' },
    { id: 'paralegal', name: 'Paralegal', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/documents' },
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
    'calendar',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'student-enrollment', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'seniors',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an elder law firm platform',
    'Create an estate planning client portal',
    'I need a Medicaid planning case management system',
    'Build an elder law document management platform',
    'Create a senior legal services app',
  ],
};
