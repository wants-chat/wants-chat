/**
 * Bankruptcy Law App Type Definition
 *
 * Complete definition for bankruptcy attorneys and debt relief.
 * Essential for bankruptcy lawyers, Chapter 7/13 cases, and debt restructuring.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BANKRUPTCY_LAW_APP_TYPE: AppTypeDefinition = {
  id: 'bankruptcy-law',
  name: 'Bankruptcy Law',
  category: 'legal',
  description: 'Bankruptcy law platform with means testing, creditor management, petition preparation, and trustee communication',
  icon: 'file-text',

  keywords: [
    'bankruptcy law',
    'bankruptcy attorney',
    'bankruptcy software',
    'debt relief',
    'bankruptcy cases',
    'bankruptcy management',
    'chapter 7',
    'bankruptcy firm',
    'bankruptcy scheduling',
    'chapter 13',
    'bankruptcy crm',
    'creditor',
    'bankruptcy business',
    'means test',
    'bankruptcy pos',
    'debt restructuring',
    'bankruptcy operations',
    'trustee',
    'bankruptcy services',
    'discharge',
  ],

  synonyms: [
    'bankruptcy law platform',
    'bankruptcy law software',
    'bankruptcy attorney software',
    'debt relief software',
    'bankruptcy cases software',
    'chapter 7 software',
    'bankruptcy firm software',
    'chapter 13 software',
    'means test software',
    'debt restructuring software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'corporate finance'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Cases and documents' },
    { id: 'admin', name: 'Firm Dashboard', enabled: true, basePath: '/admin', requiredRole: 'paralegal', layout: 'admin', description: 'Petitions and creditors' },
  ],

  roles: [
    { id: 'admin', name: 'Managing Partner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'attorney', name: 'Bankruptcy Attorney', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/cases' },
    { id: 'paralegal', name: 'Bankruptcy Paralegal', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/petitions' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'case-management',
    'client-intake',
    'document-assembly',
    'billing-timekeeping',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'court-calendar',
    'conflict-check',
    'matter-notes',
    'client-portal',
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

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a bankruptcy law firm platform',
    'Create a Chapter 7 case management app',
    'I need a bankruptcy client portal',
    'Build a creditor management platform',
    'Create a debt relief attorney app',
  ],
};
