/**
 * Immigration Law App Type Definition
 *
 * Complete definition for immigration law firms and visa services.
 * Essential for immigration attorneys, visa processing, and citizenship services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const IMMIGRATION_LAW_APP_TYPE: AppTypeDefinition = {
  id: 'immigration-law',
  name: 'Immigration Law',
  category: 'legal',
  description: 'Immigration law platform with case tracking, document collection, deadline management, and USCIS status monitoring',
  icon: 'globe',

  keywords: [
    'immigration law',
    'immigration attorney',
    'immigration software',
    'visa services',
    'immigration cases',
    'immigration management',
    'green card',
    'immigration firm',
    'immigration scheduling',
    'citizenship',
    'immigration crm',
    'work visa',
    'immigration business',
    'deportation defense',
    'immigration pos',
    'asylum',
    'immigration operations',
    'naturalization',
    'immigration services',
    'USCIS',
  ],

  synonyms: [
    'immigration law platform',
    'immigration law software',
    'immigration attorney software',
    'visa services software',
    'immigration cases software',
    'green card software',
    'immigration firm software',
    'citizenship software',
    'USCIS case software',
    'naturalization software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'travel agency'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Cases and documents' },
    { id: 'admin', name: 'Firm Dashboard', enabled: true, basePath: '/admin', requiredRole: 'paralegal', layout: 'admin', description: 'Cases and deadlines' },
  ],

  roles: [
    { id: 'admin', name: 'Managing Partner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'attorney', name: 'Immigration Attorney', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/cases' },
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
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'legal',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an immigration law firm platform',
    'Create a visa case management app',
    'I need an immigration client portal',
    'Build a USCIS case tracking platform',
    'Create an immigration document collection app',
  ],
};
